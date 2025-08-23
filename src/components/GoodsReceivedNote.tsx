import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Package, FileText, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GRNItem {
  material_type: string;
  ordered_quantity: number;
  received_quantity: number;
  unit: string;
  condition: 'good' | 'damaged' | 'partial';
  remarks: string;
}

interface GoodsReceivedNote {
  id?: string;
  grn_number: string;
  delivery_id?: string;
  supplier_name: string;
  builder_id: string;
  project_id?: string;
  delivery_note_reference?: string;
  received_date: Date;
  received_by: string;
  items: GRNItem[];
  overall_condition: 'good' | 'acceptable' | 'poor';
  discrepancies: string;
  additional_notes: string;
  status: 'draft' | 'completed';
  created_at?: string;
}

interface GoodsReceivedNoteProps {
  deliveryId?: string;
  onClose?: () => void;
}

const GoodsReceivedNote: React.FC<GoodsReceivedNoteProps> = ({ deliveryId, onClose }) => {
  const [grns, setGrns] = useState<GoodsReceivedNote[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedGrn, setSelectedGrn] = useState<GoodsReceivedNote | null>(null);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  const [formData, setFormData] = useState<GoodsReceivedNote>({
    grn_number: '',
    delivery_id: deliveryId || '',
    supplier_name: '',
    builder_id: '',
    project_id: '',
    delivery_note_reference: '',
    received_date: new Date(),
    received_by: '',
    items: [{ material_type: '', ordered_quantity: 0, received_quantity: 0, unit: 'pieces', condition: 'good', remarks: '' }],
    overall_condition: 'good',
    discrepancies: '',
    additional_notes: '',
    status: 'draft'
  });

  const { toast } = useToast();

  useEffect(() => {
    checkUserRole();
    fetchGRNs();
    fetchDeliveries();
    fetchProjects();
  }, []);

  useEffect(() => {
    if (deliveryId) {
      prefillFromDelivery(deliveryId);
    }
  }, [deliveryId, deliveries]);

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        setUserProfile(profile);
        setUserRole(profile?.role);
        
        if (profile) {
          setFormData(prev => ({
            ...prev,
            builder_id: profile.id,
            received_by: profile.full_name || 'Unknown'
          }));
        }
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  const fetchGRNs = async () => {
    try {
      // Temporarily fetch without joins until types are updated
      const { data, error } = await supabase
        .from('goods_received_notes' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Transform and set data safely
      const grnData = data && Array.isArray(data) ? data.map((item: any) => ({
        ...item,
        received_date: new Date(item.received_date)
      })) : [];
      setGrns(grnData);
    } catch (error) {
      console.error('Error fetching GRNs:', error);
      setGrns([]);
    }
  };

  const fetchDeliveries = async () => {
    try {
      const { data, error } = await supabase
        .from('deliveries')
        .select('*')
        .eq('status', 'delivered')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeliveries(data || []);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('name');

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const prefillFromDelivery = async (deliveryId: string) => {
    const delivery = deliveries.find(d => d.id === deliveryId);
    if (delivery) {
      setFormData(prev => ({
        ...prev,
        delivery_id: deliveryId,
        project_id: delivery.project_id || '',
        supplier_name: delivery.supplier_name || 'Unknown Supplier',
        items: [{
          material_type: delivery.material_type,
          ordered_quantity: delivery.quantity,
          received_quantity: delivery.quantity,
          unit: 'pieces',
          condition: 'good',
          remarks: ''
        }]
      }));
    }
  };

  const generateGRNNumber = () => {
    const timestamp = Date.now();
    return `GRN${timestamp.toString().slice(-8)}`;
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { material_type: '', ordered_quantity: 0, received_quantity: 0, unit: 'pieces', condition: 'good', remarks: '' }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: keyof GRNItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSubmit = async (status: 'draft' | 'completed') => {
    if (!formData.supplier_name || formData.items.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const grnData = {
        ...formData,
        grn_number: formData.grn_number || generateGRNNumber(),
        status,
        received_date: formData.received_date.toISOString().split('T')[0]
      };

      const { error } = await supabase
        .from('goods_received_notes' as any)
        .insert([grnData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: `GRN ${status === 'draft' ? 'saved as draft' : 'completed'} successfully`,
      });

      setShowCreateDialog(false);
      fetchGRNs();
      resetForm();
    } catch (error) {
      console.error('Error saving GRN:', error);
      toast({
        title: "Error",
        description: "Failed to save GRN",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      grn_number: '',
      delivery_id: deliveryId || '',
      supplier_name: '',
      builder_id: userProfile?.id || '',
      project_id: '',
      delivery_note_reference: '',
      received_date: new Date(),
      received_by: userProfile?.full_name || '',
      items: [{ material_type: '', ordered_quantity: 0, received_quantity: 0, unit: 'pieces', condition: 'good', remarks: '' }],
      overall_condition: 'good',
      discrepancies: '',
      additional_notes: '',
      status: 'draft'
    });
  };

  const getConditionBadgeVariant = (condition: string) => {
    switch (condition) {
      case 'good': return 'default';
      case 'acceptable': return 'secondary';
      case 'poor': return 'destructive';
      case 'damaged': return 'destructive';
      case 'partial': return 'secondary';
      default: return 'default';
    }
  };

  // Check if user can access GRN (companies and professional builders only)
  const canAccessGRN = userProfile?.role === 'admin' || 
    (userProfile?.role === 'builder' && 
     (userProfile?.user_type === 'company' || userProfile?.is_professional === true));

  if (!canAccessGRN) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <Package className="w-12 h-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Goods Received Notes - Professional Feature</h3>
              <p className="text-muted-foreground mb-4">
                This feature is available only for registered companies and professional builders.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Companies with valid business registration</p>
                <p>• Professional builders with verified credentials</p>
                <p>• Enhanced material tracking and documentation</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Goods Received Notes</h2>
          <p className="text-muted-foreground">Document and track received materials</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create GRN
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Goods Received Note</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>GRN Number</Label>
                      <Input
                        value={formData.grn_number}
                        onChange={(e) => setFormData(prev => ({ ...prev, grn_number: e.target.value }))}
                        placeholder="Auto-generated if empty"
                      />
                    </div>
                    <div>
                      <Label>Supplier Name</Label>
                      <Input
                        value={formData.supplier_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, supplier_name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label>Project</Label>
                      <Select value={formData.project_id} onValueChange={(value) => setFormData(prev => ({ ...prev, project_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Delivery Reference</Label>
                      <Select value={formData.delivery_id} onValueChange={(value) => setFormData(prev => ({ ...prev, delivery_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select delivery (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {deliveries.map((delivery) => (
                            <SelectItem key={delivery.id} value={delivery.id}>
                              {delivery.tracking_number} - {delivery.material_type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Received Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.received_date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.received_date ? format(formData.received_date, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.received_date}
                            onSelect={(date) => date && setFormData(prev => ({ ...prev, received_date: date }))}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label>Received By</Label>
                      <Input
                        value={formData.received_by}
                        onChange={(e) => setFormData(prev => ({ ...prev, received_by: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Items */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Received Items</CardTitle>
                    <Button type="button" onClick={addItem} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {formData.items.map((item, index) => (
                      <Card key={index} className="p-4">
                        <div className="grid grid-cols-6 gap-4">
                          <div>
                            <Label>Material Type</Label>
                            <Input
                              value={item.material_type}
                              onChange={(e) => updateItem(index, 'material_type', e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <Label>Ordered Qty</Label>
                            <Input
                              type="number"
                              value={item.ordered_quantity}
                              onChange={(e) => updateItem(index, 'ordered_quantity', parseInt(e.target.value) || 0)}
                            />
                          </div>
                          <div>
                            <Label>Received Qty</Label>
                            <Input
                              type="number"
                              value={item.received_quantity}
                              onChange={(e) => updateItem(index, 'received_quantity', parseInt(e.target.value) || 0)}
                            />
                          </div>
                          <div>
                            <Label>Unit</Label>
                            <Select value={item.unit} onValueChange={(value) => updateItem(index, 'unit', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pieces">Pieces</SelectItem>
                                <SelectItem value="kg">Kg</SelectItem>
                                <SelectItem value="bags">Bags</SelectItem>
                                <SelectItem value="meters">Meters</SelectItem>
                                <SelectItem value="sheets">Sheets</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Condition</Label>
                            <Select value={item.condition} onValueChange={(value: any) => updateItem(index, 'condition', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="good">Good</SelectItem>
                                <SelectItem value="damaged">Damaged</SelectItem>
                                <SelectItem value="partial">Partial</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-end">
                            {formData.items.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeItem(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="mt-2">
                          <Label>Remarks</Label>
                          <Textarea
                            value={item.remarks}
                            onChange={(e) => updateItem(index, 'remarks', e.target.value)}
                            placeholder="Any specific remarks for this item..."
                          />
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Overall Condition</Label>
                    <Select value={formData.overall_condition} onValueChange={(value: any) => setFormData(prev => ({ ...prev, overall_condition: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="acceptable">Acceptable</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Discrepancies</Label>
                    <Textarea
                      value={formData.discrepancies}
                      onChange={(e) => setFormData(prev => ({ ...prev, discrepancies: e.target.value }))}
                      placeholder="Note any discrepancies in quantities, quality, or specifications..."
                    />
                  </div>
                  <div>
                    <Label>Additional Notes</Label>
                    <Textarea
                      value={formData.additional_notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, additional_notes: e.target.value }))}
                      placeholder="Any additional comments or observations..."
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleSubmit('draft')}
                  disabled={loading}
                >
                  Save as Draft
                </Button>
                <Button 
                  onClick={() => handleSubmit('completed')}
                  disabled={loading}
                >
                  Complete GRN
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* GRN List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Goods Received Notes</CardTitle>
        </CardHeader>
        <CardContent>
          {grns.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No goods received notes found</p>
              <p className="text-sm text-muted-foreground mt-2">Create your first GRN to start tracking received materials</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>GRN Number</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Received Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Overall Condition</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grns.map((grn) => (
                  <TableRow key={grn.id}>
                    <TableCell className="font-medium">{grn.grn_number}</TableCell>
                    <TableCell>{grn.supplier_name}</TableCell>
                    <TableCell>
                      {projects.find(p => p.id === grn.project_id)?.name || 'N/A'}
                    </TableCell>
                    <TableCell>{format(new Date(grn.received_date), 'PPP')}</TableCell>
                    <TableCell>
                      <Badge variant={grn.status === 'completed' ? 'default' : 'secondary'}>
                        {grn.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getConditionBadgeVariant(grn.overall_condition)}>
                        {grn.overall_condition}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedGrn(grn);
                          setShowViewDialog(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View GRN Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Goods Received Note - {selectedGrn?.grn_number}</DialogTitle>
          </DialogHeader>
          
          {selectedGrn && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Supplier</Label>
                  <p>{selectedGrn.supplier_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Received By</Label>
                  <p>{selectedGrn.received_by}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Received Date</Label>
                  <p>{format(new Date(selectedGrn.received_date), 'PPP')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Overall Condition</Label>
                  <Badge variant={getConditionBadgeVariant(selectedGrn.overall_condition)}>
                    {selectedGrn.overall_condition}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Items Received</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>Ordered</TableHead>
                      <TableHead>Received</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedGrn.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.material_type}</TableCell>
                        <TableCell>{item.ordered_quantity}</TableCell>
                        <TableCell>{item.received_quantity}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>
                          <Badge variant={getConditionBadgeVariant(item.condition)}>
                            {item.condition}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.remarks || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {selectedGrn.discrepancies && (
                <div>
                  <Label className="text-sm font-medium">Discrepancies</Label>
                  <p className="mt-1 text-sm">{selectedGrn.discrepancies}</p>
                </div>
              )}

              {selectedGrn.additional_notes && (
                <div>
                  <Label className="text-sm font-medium">Additional Notes</Label>
                  <p className="mt-1 text-sm">{selectedGrn.additional_notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GoodsReceivedNote;