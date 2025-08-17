import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Package, Truck, Clock, MapPin, Phone, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DeliveryTracker from './DeliveryTracker';

type DeliveryStatus = 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled';

interface Delivery {
  id: string;
  tracking_number: string;
  material_type: string;
  quantity: number;
  weight_kg: number;
  pickup_address: string;
  delivery_address: string;
  estimated_delivery: string;
  actual_delivery?: string;
  status: DeliveryStatus;
  driver_name?: string;
  driver_phone?: string;
  vehicle_number?: string;
  special_instructions?: string;
  created_at: string;
  updated_at: string;
}

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-gray-500' },
  picked_up: { label: 'Picked Up', color: 'bg-blue-500' },
  in_transit: { label: 'In Transit', color: 'bg-yellow-500' },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-orange-500' },
  delivered: { label: 'Delivered', color: 'bg-green-500' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500' }
};

const DeliveryManagement: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('deliveries');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newDelivery, setNewDelivery] = useState({
    material_type: '',
    quantity: '',
    weight_kg: '',
    pickup_address: '',
    delivery_address: '',
    estimated_delivery: '',
    driver_name: '',
    driver_phone: '',
    vehicle_number: '',
    special_instructions: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchDeliveries();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('deliveries-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deliveries'
        },
        (payload) => {
          console.log('Real-time delivery change:', payload);
          fetchDeliveries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDeliveries = async () => {
    try {
      const { data, error } = await supabase
        .from('deliveries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching deliveries:', error);
        toast({
          title: "Error",
          description: "Failed to fetch deliveries",
          variant: "destructive",
        });
      } else {
        setDeliveries(data as Delivery[]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDelivery = async () => {
    try {
      // Generate tracking number
      const { data: trackingData, error: trackingError } = await supabase
        .rpc('generate_tracking_number');

      if (trackingError) {
        throw trackingError;
      }

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          title: "Error",
          description: "You must be logged in to create deliveries",
          variant: "destructive",
        });
        return;
      }

      const deliveryData = {
        tracking_number: trackingData,
        supplier_id: user.user.id,
        material_type: newDelivery.material_type,
        quantity: parseInt(newDelivery.quantity),
        weight_kg: parseFloat(newDelivery.weight_kg),
        pickup_address: newDelivery.pickup_address,
        delivery_address: newDelivery.delivery_address,
        estimated_delivery: newDelivery.estimated_delivery || null,
        driver_name: newDelivery.driver_name || null,
        driver_phone: newDelivery.driver_phone || null,
        vehicle_number: newDelivery.vehicle_number || null,
        special_instructions: newDelivery.special_instructions || null,
        status: 'pending' as DeliveryStatus
      };

      const { error } = await supabase
        .from('deliveries')
        .insert([deliveryData]);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: `Delivery created with tracking number: ${trackingData}`,
      });

      setShowCreateDialog(false);
      setNewDelivery({
        material_type: '',
        quantity: '',
        weight_kg: '',
        pickup_address: '',
        delivery_address: '',
        estimated_delivery: '',
        driver_name: '',
        driver_phone: '',
        vehicle_number: '',
        special_instructions: ''
      });
      fetchDeliveries();
    } catch (error) {
      console.error('Error creating delivery:', error);
      toast({
        title: "Error",
        description: "Failed to create delivery",
        variant: "destructive",
      });
    }
  };

  const updateDeliveryStatus = async (deliveryId: string, newStatus: DeliveryStatus) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'delivered') {
        updateData.actual_delivery = new Date().toISOString();
      }

      const { error } = await supabase
        .from('deliveries')
        .update(updateData)
        .eq('id', deliveryId);

      if (error) {
        throw error;
      }

      // Add tracking update
      await supabase
        .from('delivery_updates')
        .insert([{
          delivery_id: deliveryId,
          status: newStatus,
          notes: `Status updated to ${statusConfig[newStatus].label}`
        }]);

      toast({
        title: "Success",
        description: `Delivery status updated to ${statusConfig[newStatus].label}`,
      });

      fetchDeliveries();
    } catch (error) {
      console.error('Error updating delivery status:', error);
      toast({
        title: "Error",
        description: "Failed to update delivery status",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="p-6">Loading deliveries...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Delivery Management</h1>
        <p className="text-muted-foreground">Manage building materials deliveries and tracking</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="deliveries" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Deliveries
          </TabsTrigger>
          <TabsTrigger value="tracker" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Track Delivery
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deliveries" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold">Active Deliveries</h2>
              <p className="text-muted-foreground">Manage and track all your material deliveries</p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Delivery
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Delivery</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="material_type">Material Type</Label>
                    <Input
                      id="material_type"
                      value={newDelivery.material_type}
                      onChange={(e) => setNewDelivery({...newDelivery, material_type: e.target.value})}
                      placeholder="e.g., Concrete, Steel, Lumber"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={newDelivery.quantity}
                      onChange={(e) => setNewDelivery({...newDelivery, quantity: e.target.value})}
                      placeholder="Number of units"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight_kg">Weight (kg)</Label>
                    <Input
                      id="weight_kg"
                      type="number"
                      step="0.1"
                      value={newDelivery.weight_kg}
                      onChange={(e) => setNewDelivery({...newDelivery, weight_kg: e.target.value})}
                      placeholder="Total weight"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimated_delivery">Estimated Delivery</Label>
                    <Input
                      id="estimated_delivery"
                      type="datetime-local"
                      value={newDelivery.estimated_delivery}
                      onChange={(e) => setNewDelivery({...newDelivery, estimated_delivery: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="pickup_address">Pickup Address</Label>
                    <Textarea
                      id="pickup_address"
                      value={newDelivery.pickup_address}
                      onChange={(e) => setNewDelivery({...newDelivery, pickup_address: e.target.value})}
                      placeholder="Full pickup address"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="delivery_address">Delivery Address</Label>
                    <Textarea
                      id="delivery_address"
                      value={newDelivery.delivery_address}
                      onChange={(e) => setNewDelivery({...newDelivery, delivery_address: e.target.value})}
                      placeholder="Full delivery address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="driver_name">Driver Name</Label>
                    <Input
                      id="driver_name"
                      value={newDelivery.driver_name}
                      onChange={(e) => setNewDelivery({...newDelivery, driver_name: e.target.value})}
                      placeholder="Driver's name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="driver_phone">Driver Phone</Label>
                    <Input
                      id="driver_phone"
                      value={newDelivery.driver_phone}
                      onChange={(e) => setNewDelivery({...newDelivery, driver_phone: e.target.value})}
                      placeholder="Driver's phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicle_number">Vehicle Number</Label>
                    <Input
                      id="vehicle_number"
                      value={newDelivery.vehicle_number}
                      onChange={(e) => setNewDelivery({...newDelivery, vehicle_number: e.target.value})}
                      placeholder="Vehicle registration number"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="special_instructions">Special Instructions</Label>
                    <Textarea
                      id="special_instructions"
                      value={newDelivery.special_instructions}
                      onChange={(e) => setNewDelivery({...newDelivery, special_instructions: e.target.value})}
                      placeholder="Any special delivery instructions"
                    />
                  </div>
                </div>
                <Button onClick={createDelivery} className="w-full">
                  Create Delivery
                </Button>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking #</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pickup</TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell className="font-mono text-sm">
                        {delivery.tracking_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{delivery.material_type}</p>
                          <p className="text-sm text-muted-foreground">{delivery.weight_kg}kg</p>
                        </div>
                      </TableCell>
                      <TableCell>{delivery.quantity} units</TableCell>
                      <TableCell>
                        <Badge className={`${statusConfig[delivery.status].color} text-white`}>
                          {statusConfig[delivery.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="text-sm truncate">{delivery.pickup_address}</p>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="text-sm truncate">{delivery.delivery_address}</p>
                      </TableCell>
                      <TableCell>
                        {delivery.driver_name ? (
                          <div>
                            <p className="text-sm">{delivery.driver_name}</p>
                            {delivery.driver_phone && (
                              <p className="text-xs text-muted-foreground">{delivery.driver_phone}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={delivery.status}
                          onValueChange={(value: DeliveryStatus) => updateDeliveryStatus(delivery.id, value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="picked_up">Picked Up</SelectItem>
                            <SelectItem value="in_transit">In Transit</SelectItem>
                            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {deliveries.length === 0 && (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No deliveries found</p>
                  <p className="text-sm text-muted-foreground">Create your first delivery to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracker">
          <DeliveryTracker />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeliveryManagement;