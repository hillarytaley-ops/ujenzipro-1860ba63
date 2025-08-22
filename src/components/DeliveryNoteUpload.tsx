import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Package, Calendar, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PurchaseOrder {
  id: string;
  po_number: string;
  buyer_name: string;
  total_amount: number;
  delivery_date: string;
  status: string;
  created_at: string;
  delivery_address: string;
}

interface DeliveryNote {
  id: string;
  delivery_note_number: string;
  file_name: string;
  dispatch_date: string;
  expected_delivery_date?: string;
  notes?: string;
  created_at: string;
}

interface DeliveryNoteUploadProps {
  userProfile: {
    id: string;
    role: string;
  } | null;
}

const DeliveryNoteUpload: React.FC<DeliveryNoteUploadProps> = ({ userProfile }) => {
  const { toast } = useToast();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [supplierData, setSupplierData] = useState<any>(null);

  const [uploadForm, setUploadForm] = useState({
    deliveryNoteNumber: '',
    dispatchDate: '',
    expectedDeliveryDate: '',
    notes: '',
    file: null as File | null
  });

  useEffect(() => {
    if (userProfile) {
      fetchSupplierData();
    }
  }, [userProfile]);

  useEffect(() => {
    if (supplierData) {
      fetchPurchaseOrders();
      fetchDeliveryNotes();
    }
  }, [supplierData]);

  const fetchSupplierData = async () => {
    try {
      const { data: supplier, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('user_id', userProfile?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setSupplierData(supplier);
    } catch (error) {
      console.error('Error fetching supplier data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchaseOrders = async () => {
    if (!supplierData) return;

    try {
      const { data: poData, error } = await supabase
        .from('purchase_orders')
        .select('*')
        .eq('supplier_id', supplierData.id)
        .in('status', ['confirmed', 'in_progress'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get buyer names
      const formattedPOs: PurchaseOrder[] = [];
      for (const po of poData || []) {
        const { data: buyer } = await supabase
          .from('profiles')
          .select('full_name, company_name')
          .eq('id', po.buyer_id)
          .single();

        formattedPOs.push({
          ...po,
          buyer_name: buyer?.company_name || buyer?.full_name || 'Unknown Buyer'
        });
      }

      setPurchaseOrders(formattedPOs);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
    }
  };

  const fetchDeliveryNotes = async () => {
    if (!supplierData) return;

    try {
      const { data, error } = await supabase
        .from('delivery_notes')
        .select('*')
        .eq('supplier_id', supplierData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeliveryNotes(data || []);
    } catch (error) {
      console.error('Error fetching delivery notes:', error);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadForm.file || !selectedPO || !supplierData) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and select a file",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Upload file to storage
      const fileExt = uploadForm.file.name.split('.').pop();
      const fileName = `${Date.now()}-${uploadForm.deliveryNoteNumber}.${fileExt}`;
      const filePath = `${supplierData.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('delivery-notes')
        .upload(filePath, uploadForm.file);

      if (uploadError) throw uploadError;

      // Save delivery note record
      const { error: insertError } = await supabase
        .from('delivery_notes')
        .insert({
          purchase_order_id: selectedPO.id,
          supplier_id: supplierData.id,
          delivery_note_number: uploadForm.deliveryNoteNumber,
          file_path: filePath,
          file_name: uploadForm.file.name,
          file_size: uploadForm.file.size,
          content_type: uploadForm.file.type,
          dispatch_date: uploadForm.dispatchDate,
          expected_delivery_date: uploadForm.expectedDeliveryDate || null,
          notes: uploadForm.notes || null
        });

      if (insertError) throw insertError;

      // Update purchase order status to dispatched
      await supabase
        .from('purchase_orders')
        .update({ status: 'dispatched' })
        .eq('id', selectedPO.id);

      toast({
        title: "Success",
        description: "Delivery note uploaded and buyer notified"
      });

      // Reset form
      setUploadForm({
        deliveryNoteNumber: '',
        dispatchDate: '',
        expectedDeliveryDate: '',
        notes: '',
        file: null
      });
      setSelectedPO(null);
      setShowUploadDialog(false);

      // Refresh data
      fetchPurchaseOrders();
      fetchDeliveryNotes();
    } catch (error) {
      console.error('Error uploading delivery note:', error);
      toast({
        title: "Error",
        description: "Failed to upload delivery note",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default";
      case "in_progress":
        return "secondary";
      case "dispatched":
        return "default";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (!userProfile || !supplierData) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold mb-2">Supplier Access Only</h3>
        <p className="text-muted-foreground">
          This section is only available to registered suppliers.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Delivery Note Management</h2>
          <p className="text-muted-foreground">
            Upload delivery notes for dispatched orders to professional builders
          </p>
        </div>
      </div>

      {/* Purchase Orders Ready for Dispatch */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Orders Ready for Dispatch</h3>
        {purchaseOrders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">No confirmed orders ready for dispatch</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {purchaseOrders.map((po) => (
              <Card key={po.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">PO #{po.po_number}</CardTitle>
                      <CardDescription>
                        To: {po.buyer_name}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={getStatusVariant(po.status)}>
                        {po.status.toUpperCase()}
                      </Badge>
                      {po.status !== 'dispatched' && (
                        <Dialog open={showUploadDialog && selectedPO?.id === po.id} onOpenChange={(open) => {
                          setShowUploadDialog(open);
                          if (open) setSelectedPO(po);
                          else setSelectedPO(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button size="sm" className="gap-2">
                              <Truck className="h-4 w-4" />
                              Dispatch Order
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Upload Delivery Note</DialogTitle>
                              <DialogDescription>
                                Upload delivery note for PO #{po.po_number}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="deliveryNoteNumber">Delivery Note Number *</Label>
                                <Input
                                  id="deliveryNoteNumber"
                                  value={uploadForm.deliveryNoteNumber}
                                  onChange={(e) => setUploadForm({...uploadForm, deliveryNoteNumber: e.target.value})}
                                  placeholder="DN-2024-001"
                                />
                              </div>
                              <div>
                                <Label htmlFor="dispatchDate">Dispatch Date *</Label>
                                <Input
                                  id="dispatchDate"
                                  type="date"
                                  value={uploadForm.dispatchDate}
                                  onChange={(e) => setUploadForm({...uploadForm, dispatchDate: e.target.value})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="expectedDeliveryDate">Expected Delivery Date</Label>
                                <Input
                                  id="expectedDeliveryDate"
                                  type="date"
                                  value={uploadForm.expectedDeliveryDate}
                                  onChange={(e) => setUploadForm({...uploadForm, expectedDeliveryDate: e.target.value})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="file">Delivery Note File *</Label>
                                <Input
                                  id="file"
                                  type="file"
                                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                  onChange={(e) => setUploadForm({...uploadForm, file: e.target.files?.[0] || null})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="notes">Additional Notes</Label>
                                <Textarea
                                  id="notes"
                                  value={uploadForm.notes}
                                  onChange={(e) => setUploadForm({...uploadForm, notes: e.target.value})}
                                  placeholder="Any special delivery instructions..."
                                />
                              </div>
                              <Button 
                                onClick={handleFileUpload} 
                                disabled={uploading}
                                className="w-full gap-2"
                              >
                                <Upload className="h-4 w-4" />
                                {uploading ? 'Uploading...' : 'Upload & Dispatch'}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-semibold text-green-600">
                        KSh {po.total_amount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Delivery Date</p>
                      <p className="font-medium">
                        {new Date(po.delivery_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-muted-foreground text-xs">Delivery Address</p>
                    <p className="text-sm">{po.delivery_address}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Uploaded Delivery Notes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Uploaded Delivery Notes</h3>
        {deliveryNotes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">No delivery notes uploaded yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {deliveryNotes.map((note) => (
              <Card key={note.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">DN #{note.delivery_note_number}</CardTitle>
                      <CardDescription>
                        File: {note.file_name}
                      </CardDescription>
                    </div>
                    <Badge variant="default">Dispatched</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Dispatch Date</p>
                      <p className="font-medium">
                        {new Date(note.dispatch_date).toLocaleDateString()}
                      </p>
                    </div>
                    {note.expected_delivery_date && (
                      <div>
                        <p className="text-muted-foreground">Expected Delivery</p>
                        <p className="font-medium">
                          {new Date(note.expected_delivery_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                  {note.notes && (
                    <div className="mt-2">
                      <p className="text-muted-foreground text-xs">Notes</p>
                      <p className="text-sm">{note.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryNoteUpload;