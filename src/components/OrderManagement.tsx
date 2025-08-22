import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Package, QrCode, CheckCircle, Clock, AlertCircle, Truck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import QRScanner from './QRScanner';

interface DeliveryOrder {
  id: string;
  order_number: string;
  builder_id: string;
  supplier_id: string;
  project_id?: string;
  status: string;
  total_items: number;
  qr_coded_items: number;
  delivery_address: string;
  pickup_address: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface OrderMaterial {
  id: string;
  order_id: string;
  material_type: string;
  quantity: number;
  unit: string;
  qr_code?: string;
  is_qr_coded: boolean;
  is_scanned: boolean;
  batch_number?: string;
}

interface Builder {
  id: string;
  full_name: string;
}

interface Project {
  id: string;
  name: string;
  location?: string;
}

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [orderMaterials, setOrderMaterials] = useState<OrderMaterial[]>([]);
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [newOrder, setNewOrder] = useState({
    builder_id: '',
    project_id: '',
    delivery_address: '',
    pickup_address: '',
    notes: '',
    materials: [{ material_type: '', quantity: 1, unit: 'pieces' }]
  });

  const statusConfig = {
    pending_qr_coding: { label: 'Pending QR Coding', color: 'bg-yellow-500', icon: Clock },
    ready_for_dispatch: { label: 'Ready for Dispatch', color: 'bg-green-500', icon: CheckCircle },
    dispatched: { label: 'Dispatched', color: 'bg-blue-500', icon: Truck }
  };

  useEffect(() => {
    checkUserRole();
  }, []);

  useEffect(() => {
    if (userRole) {
      fetchOrders();
      fetchBuilders();
      fetchProjects();
    }
  }, [userRole]);

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role, company_name')
          .eq('user_id', user.id)
          .single();
        
        setUserRole(profileData?.role || null);
        setUserProfile(profileData);
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_orders')
        .select(`
          *,
          profiles!delivery_orders_builder_id_fkey(full_name),
          suppliers!delivery_orders_supplier_id_fkey(company_name),
          projects(name, location)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    }
  };

  const fetchBuilders = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'builder');

      if (error) throw error;
      setBuilders(data || []);
    } catch (error) {
      console.error('Error fetching builders:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, location')
        .order('name');

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchOrderMaterials = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('order_materials')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at');

      if (error) throw error;
      setOrderMaterials(data || []);
    } catch (error) {
      console.error('Error fetching order materials:', error);
    }
  };

  const createOrder = async () => {
    if (!newOrder.builder_id || !newOrder.delivery_address || !newOrder.pickup_address) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Get current user's supplier ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: supplierData } = await supabase
        .from('suppliers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!supplierData) {
        toast.error('Supplier profile not found');
        return;
      }

      // Create order (order_number will be auto-generated by trigger)
      const { data: orderData, error: orderError } = await supabase
        .from('delivery_orders')
        .insert({
          builder_id: newOrder.builder_id,
          supplier_id: supplierData.id,
          project_id: newOrder.project_id || null,
          delivery_address: newOrder.delivery_address,
          pickup_address: newOrder.pickup_address,
          notes: newOrder.notes || null,
          total_items: newOrder.materials.length,
          order_number: '' // Will be auto-generated by trigger
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order materials
      const materialsToInsert = newOrder.materials.map(material => ({
        order_id: orderData.id,
        material_type: material.material_type,
        quantity: material.quantity,
        unit: material.unit
      }));

      const { error: materialsError } = await supabase
        .from('order_materials')
        .insert(materialsToInsert);

      if (materialsError) throw materialsError;

      toast.success(`Order ${orderData.order_number} created successfully!`);
      setShowCreateDialog(false);
      resetForm();
      fetchOrders();
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
    }
  };

  const resetForm = () => {
    setNewOrder({
      builder_id: '',
      project_id: '',
      delivery_address: '',
      pickup_address: '',
      notes: '',
      materials: [{ material_type: '', quantity: 1, unit: 'pieces' }]
    });
  };

  const addMaterial = () => {
    setNewOrder(prev => ({
      ...prev,
      materials: [...prev.materials, { material_type: '', quantity: 1, unit: 'pieces' }]
    }));
  };

  const updateMaterial = (index: number, field: string, value: any) => {
    setNewOrder(prev => ({
      ...prev,
      materials: prev.materials.map((material, i) => 
        i === index ? { ...material, [field]: value } : material
      )
    }));
  };

  const removeMaterial = (index: number) => {
    setNewOrder(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }));
  };

  const generateQRCode = async (materialId: string) => {
    try {
      // Generate QR code data
      const qrCode = `UJP-${Date.now()}-${materialId.slice(-8)}`;
      
      const { error } = await supabase
        .from('order_materials')
        .update({ 
          qr_code: qrCode, 
          is_qr_coded: true,
          batch_number: `BATCH-${Date.now().toString().slice(-6)}`
        })
        .eq('id', materialId);

      if (error) throw error;

      toast.success('QR code generated successfully!');
      fetchOrderMaterials(selectedOrderId);
      fetchOrders(); // Refresh to update order status
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    }
  };

  const canDispatchOrder = (order: DeliveryOrder) => {
    return order.status === 'ready_for_dispatch' && order.qr_coded_items === order.total_items;
  };

  const handleMaterialScanned = async (material: any) => {
    // Handle scanned material from QR scanner
    toast.success(`Material scanned: ${material.materialType}`);
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (userRole !== 'supplier' && userRole !== 'admin') {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Access denied. Only suppliers can manage orders.
        </AlertDescription>
      </Alert>
    );
  }

  // Check if this is for individual builders only
  const isForIndividualBuilders = userRole === 'supplier' && userProfile;
  const isProfessionalBuilder = userProfile?.role === 'builder' || userProfile?.company_name;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Order Management</h2>
          <p className="text-muted-foreground">
            Manage delivery orders and QR coding workflow for individual builders
          </p>
          <Alert className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              QR coding system is designed for individual builders only. Professional builders and companies use the Purchase Order system instead.
            </AlertDescription>
          </Alert>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Delivery Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Builder</Label>
                  <Select value={newOrder.builder_id} onValueChange={(value) => setNewOrder(prev => ({ ...prev, builder_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select builder" />
                    </SelectTrigger>
                    <SelectContent>
                      {builders.map(builder => (
                        <SelectItem key={builder.id} value={builder.id}>
                          {builder.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Project (Optional)</Label>
                  <Select value={newOrder.project_id} onValueChange={(value) => setNewOrder(prev => ({ ...prev, project_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Pickup Address</Label>
                  <Textarea
                    value={newOrder.pickup_address}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, pickup_address: e.target.value }))}
                    placeholder="Enter pickup address"
                  />
                </div>
                <div>
                  <Label>Delivery Address</Label>
                  <Textarea
                    value={newOrder.delivery_address}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, delivery_address: e.target.value }))}
                    placeholder="Enter delivery address"
                  />
                </div>
              </div>

              <div>
                <Label>Materials</Label>
                {newOrder.materials.map((material, index) => (
                  <div key={index} className="flex gap-2 items-end mb-2">
                    <div className="flex-1">
                      <Input
                        placeholder="Material type"
                        value={material.material_type}
                        onChange={(e) => updateMaterial(index, 'material_type', e.target.value)}
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={material.quantity}
                        onChange={(e) => updateMaterial(index, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="w-24">
                      <Select value={material.unit} onValueChange={(value) => updateMaterial(index, 'unit', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pieces">Pieces</SelectItem>
                          <SelectItem value="kg">Kg</SelectItem>
                          <SelectItem value="tons">Tons</SelectItem>
                          <SelectItem value="m3">m³</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {newOrder.materials.length > 1 && (
                      <Button variant="outline" size="sm" onClick={() => removeMaterial(index)}>
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" onClick={addMaterial} className="mt-2">
                  Add Material
                </Button>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createOrder}>
                  Create Order
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Delivery Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Builder</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const StatusIcon = statusConfig[order.status as keyof typeof statusConfig]?.icon || Clock;
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono">{order.order_number}</TableCell>
                    <TableCell>{(order as any).profiles?.full_name || 'Unknown'}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`${statusConfig[order.status as keyof typeof statusConfig]?.color || 'bg-gray-500'} text-white`}
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig[order.status as keyof typeof statusConfig]?.label || order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="text-sm">
                          {order.qr_coded_items} / {order.total_items} QR coded
                        </div>
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${(order.qr_coded_items / order.total_items) * 100}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOrderId(order.id);
                          fetchOrderMaterials(order.id);
                          setShowQRDialog(true);
                        }}
                      >
                        <QrCode className="h-4 w-4 mr-1" />
                        Manage QR
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* QR Management Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>QR Code Management</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Materials List */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Order Materials</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>QR Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderMaterials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell>{material.material_type}</TableCell>
                      <TableCell>{material.quantity} {material.unit}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {material.qr_code || 'Not generated'}
                      </TableCell>
                      <TableCell>
                        {material.is_qr_coded ? (
                          <Badge className="bg-green-500 text-white">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            QR Generated
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {!material.is_qr_coded && (
                          <Button
                            size="sm"
                            onClick={() => generateQRCode(material.id)}
                          >
                            Generate QR
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* QR Scanner Integration */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Scan Materials Before Dispatch</h3>
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  All materials must be QR coded and scanned before dispatch is allowed.
                  Use the scanner below to verify materials are properly tagged.
                </AlertDescription>
              </Alert>
              <QRScanner onMaterialScanned={handleMaterialScanned} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderManagement;