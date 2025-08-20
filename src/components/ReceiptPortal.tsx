import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Upload, 
  FileText, 
  Download, 
  Share2, 
  Eye, 
  Trash2, 
  Plus,
  Building,
  Truck,
  Calendar,
  User
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ReceiptUpload {
  id: string;
  supplier_id: string;
  delivery_id?: string;
  scanned_supply_id?: string;
  file_path: string;
  file_name: string;
  file_size: number;
  content_type: string;
  uploaded_at: string;
  shared_with_builder: boolean;
  receipt_type: string;
  notes?: string;
  supplier?: {
    company_name: string;
  };
  delivery?: {
    tracking_number: string;
    material_type: string;
  };
}

interface ReceiptPortalProps {
  userRole?: string;
  supplierId?: string;
  deliveryId?: string;
  scannedSupplyId?: string;
}

const ReceiptPortal: React.FC<ReceiptPortalProps> = ({ 
  userRole, 
  supplierId, 
  deliveryId, 
  scannedSupplyId 
}) => {
  const [receipts, setReceipts] = useState<ReceiptUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [receiptType, setReceiptType] = useState<string>('purchase');
  const [notes, setNotes] = useState<string>('');
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(supplierId || '');
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>(deliveryId || '');

  useEffect(() => {
    loadData();
  }, [userRole]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadReceipts(),
        loadSuppliers(),
        loadDeliveries()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load receipt data');
    } finally {
      setLoading(false);
    }
  };

  const loadReceipts = async () => {
    try {
      let query = supabase
        .from('receipt_uploads')
        .select(`
          *,
          supplier:suppliers(company_name),
          delivery:deliveries(tracking_number, material_type)
        `)
        .order('uploaded_at', { ascending: false });

      // Filter based on user role and context
      if (userRole === 'supplier' && supplierId) {
        query = query.eq('supplier_id', supplierId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReceipts(data || []);
    } catch (error) {
      console.error('Error loading receipts:', error);
    }
  };

  const loadSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, company_name')
        .order('company_name');

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  };

  const loadDeliveries = async () => {
    try {
      const { data, error } = await supabase
        .from('deliveries')
        .select('id, tracking_number, material_type')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeliveries(data || []);
    } catch (error) {
      console.error('Error loading deliveries:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid image (JPEG, PNG, WebP) or PDF file');
        return;
      }

      if (file.size > maxSize) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
    }
  };

  const uploadReceipt = async () => {
    if (!selectedFile || !selectedSupplierId) {
      toast.error('Please select a file and supplier');
      return;
    }

    try {
      setUploading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate unique file path
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Save receipt metadata to database
      const { error: dbError } = await supabase
        .from('receipt_uploads')
        .insert({
          supplier_id: selectedSupplierId,
          delivery_id: selectedDeliveryId || null,
          scanned_supply_id: scannedSupplyId || null,
          file_path: uploadData.path,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          content_type: selectedFile.type,
          uploaded_by: user.id,
          receipt_type: receiptType,
          notes: notes || null,
          shared_with_builder: selectedDeliveryId ? true : false
        });

      if (dbError) throw dbError;

      toast.success('Receipt uploaded successfully');
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setNotes('');
      await loadReceipts();
    } catch (error) {
      console.error('Error uploading receipt:', error);
      toast.error('Failed to upload receipt');
    } finally {
      setUploading(false);
    }
  };

  const toggleShareWithBuilder = async (receiptId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('receipt_uploads')
        .update({ shared_with_builder: !currentStatus })
        .eq('id', receiptId);

      if (error) throw error;

      toast.success(
        !currentStatus 
          ? 'Receipt shared with builder' 
          : 'Receipt sharing disabled'
      );
      await loadReceipts();
    } catch (error) {
      console.error('Error updating sharing status:', error);
      toast.error('Failed to update sharing status');
    }
  };

  const downloadReceipt = async (receipt: ReceiptUpload) => {
    try {
      const { data, error } = await supabase.storage
        .from('receipts')
        .download(receipt.file_path);

      if (error) throw error;

      // Create download link
      const blob = new Blob([data], { type: receipt.content_type });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = receipt.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Receipt downloaded');
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt');
    }
  };

  const deleteReceipt = async (receiptId: string, filePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('receipts')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('receipt_uploads')
        .delete()
        .eq('id', receiptId);

      if (dbError) throw dbError;

      toast.success('Receipt deleted');
      await loadReceipts();
    } catch (error) {
      console.error('Error deleting receipt:', error);
      toast.error('Failed to delete receipt');
    }
  };

  const getReceiptTypeIcon = (type: string) => {
    switch (type) {
      case 'purchase': return <FileText className="h-4 w-4" />;
      case 'delivery': return <Truck className="h-4 w-4" />;
      case 'quality_cert': return <Eye className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Receipt Portal
              {userRole === 'supplier' && (
                <Badge variant="outline">Supplier</Badge>
              )}
              {userRole === 'builder' && (
                <Badge variant="outline">Builder</Badge>
              )}
            </CardTitle>
            
            {userRole === 'supplier' && (
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Receipt
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Upload Receipt</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Supplier</Label>
                      <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.company_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Delivery (Optional)</Label>
                      <Select value={selectedDeliveryId} onValueChange={setSelectedDeliveryId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select delivery" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No delivery</SelectItem>
                          {deliveries.map((delivery) => (
                            <SelectItem key={delivery.id} value={delivery.id}>
                              {delivery.tracking_number} - {delivery.material_type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Receipt Type</Label>
                      <Select value={receiptType} onValueChange={setReceiptType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="purchase">Purchase Receipt</SelectItem>
                          <SelectItem value="delivery">Delivery Receipt</SelectItem>
                          <SelectItem value="quality_cert">Quality Certificate</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>File</Label>
                      <Input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileSelect}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Supported: JPEG, PNG, WebP, PDF (max 10MB)
                      </p>
                    </div>

                    <div>
                      <Label>Notes (Optional)</Label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any notes about this receipt..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={uploadReceipt}
                        disabled={!selectedFile || !selectedSupplierId || uploading}
                        className="flex-1"
                      >
                        {uploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setUploadDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Receipts List */}
      <div className="grid gap-4">
        {receipts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-48 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No receipts found</h3>
              <p className="text-muted-foreground mb-4">
                {userRole === 'supplier' 
                  ? 'Start by uploading your first receipt'
                  : 'No receipts have been shared with you yet'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          receipts.map((receipt) => (
            <Card key={receipt.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0 p-3 bg-muted rounded-lg">
                      {getReceiptTypeIcon(receipt.receipt_type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold truncate">{receipt.file_name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {receipt.receipt_type.replace('_', ' ')}
                        </Badge>
                        {receipt.shared_with_builder && (
                          <Badge variant="default" className="text-xs">
                            <Share2 className="h-3 w-3 mr-1" />
                            Shared
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Building className="h-3 w-3" />
                          <span>{receipt.supplier?.company_name}</span>
                        </div>
                        
                        {receipt.delivery && (
                          <div className="flex items-center gap-2">
                            <Truck className="h-3 w-3" />
                            <span>{receipt.delivery.tracking_number} - {receipt.delivery.material_type}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(receipt.uploaded_at).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <FileText className="h-3 w-3" />
                          <span>{formatFileSize(receipt.file_size)}</span>
                        </div>
                        
                        {receipt.notes && (
                          <p className="text-xs bg-muted/50 p-2 rounded mt-2">
                            {receipt.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadReceipt(receipt)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    {userRole === 'supplier' && (
                      <>
                        <Button
                          size="sm"
                          variant={receipt.shared_with_builder ? "default" : "outline"}
                          onClick={() => toggleShareWithBuilder(receipt.id, receipt.shared_with_builder)}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteReceipt(receipt.id, receipt.file_path)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">How it works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {userRole === 'supplier' ? (
            <>
              <p>• Upload receipts for your supplies and deliveries</p>
              <p>• Link receipts to specific deliveries for better tracking</p>
              <p>• Share receipts with builders by toggling the share option</p>
              <p>• Supported formats: JPEG, PNG, WebP, PDF (max 10MB)</p>
            </>
          ) : (
            <>
              <p>• View receipts shared by suppliers</p>
              <p>• Download receipts for your records</p>
              <p>• Track material documentation and quality certificates</p>
              <p>• Receipts are automatically linked to your deliveries</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceiptPortal;