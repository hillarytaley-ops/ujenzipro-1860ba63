import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MapPin, Clock, Truck, CheckCircle, Package, Phone, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ProjectManager from './ProjectManager';

type DeliveryStatus = 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled';

interface Delivery {
  id: string;
  tracking_number: string;
  material_type: string;
  quantity: number;
  weight_kg: number;
  pickup_address: string;
  delivery_address: string;
  estimated_delivery_time: string;
  actual_delivery_time?: string;
  status: DeliveryStatus;
  driver_name?: string;
  driver_phone?: string;
  vehicle_details?: string;
  notes?: string;
  project_id?: string;
  builder_id?: string;
  supplier_id?: string;
  created_at: string;
  updated_at: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  status: string;
  builder_id: string;
  created_at: string;
  updated_at: string;
}

interface DeliveryUpdate {
  id: string;
  status: string;
  location?: string;
  notes?: string;
  created_at: string;
}

const statusConfig = {
  pending: { label: 'Pending Pickup', color: 'bg-gray-500', icon: Package },
  picked_up: { label: 'Picked Up', color: 'bg-blue-500', icon: Truck },
  in_transit: { label: 'In Transit', color: 'bg-yellow-500', icon: Truck },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-orange-500', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-500', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: Package }
};

const DeliveryTracker: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [updates, setUpdates] = useState<DeliveryUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectDeliveries, setProjectDeliveries] = useState<Delivery[]>([]);
  const [showProjectManager, setShowProjectManager] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (delivery) {
      // Set up real-time subscription for delivery updates
      const channel = supabase
        .channel('delivery-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'delivery_updates',
            filter: `delivery_id=eq.${delivery.id}`
          },
          (payload) => {
            console.log('Real-time update:', payload);
            fetchUpdates(delivery.id);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'deliveries',
            filter: `id=eq.${delivery.id}`
          },
          (payload) => {
            console.log('Delivery status update:', payload);
            if (payload.new && payload.new.status && Object.keys(statusConfig).includes(payload.new.status)) {
              setDelivery(payload.new as Delivery);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [delivery]);

  const fetchUpdates = async (deliveryId: string) => {
    const { data, error } = await supabase
      .from('delivery_updates')
      .select('*')
      .eq('delivery_id', deliveryId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching updates:', error);
    } else {
      setUpdates(data || []);
    }
  };

  const trackDelivery = async () => {
    if (!trackingNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a tracking number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('deliveries')
        .select(`
          *,
          projects (
            id,
            name,
            location
          )
        `)
        .eq('tracking_number', trackingNumber.trim())
        .single();

      if (error) {
        toast({
          title: "Tracking Number Not Found",
          description: "Please check your tracking number and try again",
          variant: "destructive",
        });
        setDelivery(null);
        setUpdates([]);
      } else {
        setDelivery(data as Delivery);
        await fetchUpdates(data.id);
        toast({
          title: "Delivery Found",
          description: `Tracking ${data.material_type} delivery`,
        });
      }
    } catch (error) {
      console.error('Error tracking delivery:', error);
      toast({
        title: "Error",
        description: "Failed to track delivery. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectDeliveries = async (projectId: string) => {
    try {
      // RLS policies will ensure users only see deliveries they have access to
      const { data, error } = await supabase
        .from('deliveries')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching project deliveries:', error);
        toast({
          title: "Error",
          description: "Failed to fetch project deliveries",
          variant: "destructive",
        });
      } else {
        setProjectDeliveries(data as Delivery[]);
        if (data.length === 0) {
          toast({
            title: "No Deliveries",
            description: "No deliveries found for this project that you have access to.",
            variant: "default",
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleProjectSelect = (project: Project | null) => {
    setSelectedProject(project);
    if (project) {
      fetchProjectDeliveries(project.id);
    } else {
      setProjectDeliveries([]);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const StatusIcon = delivery ? statusConfig[delivery.status].icon : Package;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6" />
              Delivery Tracker
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowProjectManager(!showProjectManager)}
            >
              <Building className="h-4 w-4 mr-2" />
              {showProjectManager ? 'Hide' : 'Show'} Projects
            </Button>
          </CardTitle>
          <CardDescription>
            Track building materials deliveries across multiple construction projects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter tracking number (e.g., TRK20250817-1234)"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && trackDelivery()}
              className="flex-1"
            />
            <Button onClick={trackDelivery} disabled={loading}>
              {loading ? 'Tracking...' : 'Track'}
            </Button>
          </div>

          {selectedProject && (
            <div className="p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{selectedProject.name}</h3>
                  {selectedProject.location && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {selectedProject.location}
                    </p>
                  )}
                </div>
                <Badge variant="outline">
                  {projectDeliveries.length} deliveries
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {showProjectManager && (
        <ProjectManager 
          onProjectSelect={handleProjectSelect}
          selectedProject={selectedProject}
        />
      )}

      {selectedProject && projectDeliveries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Project Deliveries</CardTitle>
            <CardDescription>
              All deliveries for {selectedProject.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectDeliveries.map((projectDelivery) => (
                <Card key={projectDelivery.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{projectDelivery.material_type}</h4>
                        <Badge className={`${statusConfig[projectDelivery.status].color} text-white`}>
                          {statusConfig[projectDelivery.status].label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        #{projectDelivery.tracking_number}
                      </p>
                      <p className="text-sm">
                        {projectDelivery.quantity} units • {projectDelivery.weight_kg} kg
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          setTrackingNumber(projectDelivery.tracking_number);
                          trackDelivery();
                        }}
                      >
                        Track This Delivery
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {delivery && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Delivery Details</span>
                <Badge className={`${statusConfig[delivery.status].color} text-white`}>
                  <StatusIcon className="h-4 w-4 mr-1" />
                  {statusConfig[delivery.status].label}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {delivery.project_id && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    PROJECT
                  </h4>
                  <p className="text-lg">{(delivery as any).projects?.name || 'Unknown Project'}</p>
                  {(delivery as any).projects?.location && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {(delivery as any).projects.location}
                    </p>
                  )}
                </div>
              )}
              
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">MATERIAL</h4>
                <p className="text-lg">{delivery.material_type}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">QUANTITY</h4>
                  <p>{delivery.quantity} units</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">WEIGHT</h4>
                  <p>{delivery.weight_kg} kg</p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  PICKUP ADDRESS
                </h4>
                <p className="text-sm">{delivery.pickup_address}</p>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  DELIVERY ADDRESS
                </h4>
                <p className="text-sm">{delivery.delivery_address}</p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  ESTIMATED DELIVERY
                </h4>
                <p className="text-sm">
                  {delivery.estimated_delivery_time ? formatDate(delivery.estimated_delivery_time) : 'TBD'}
                </p>
              </div>

              {delivery.actual_delivery_time && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    DELIVERED
                  </h4>
                  <p className="text-sm">{formatDate(delivery.actual_delivery_time)}</p>
                </div>
              )}

              {delivery.driver_name && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-1">
                    <Truck className="h-4 w-4" />
                    DRIVER INFO
                  </h4>
                  <p className="text-sm">{delivery.driver_name}</p>
                  {delivery.driver_phone && (
                    <p className="text-sm flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {delivery.driver_phone}
                    </p>
                  )}
                  {delivery.vehicle_details && (
                    <p className="text-sm">Vehicle: {delivery.vehicle_details}</p>
                  )}
                </div>
              )}

              {delivery.notes && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">NOTES</h4>
                  <p className="text-sm">{delivery.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tracking History</CardTitle>
              <CardDescription>Real-time delivery updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {updates.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tracking updates available yet.</p>
                ) : (
                  updates.map((update, index) => (
                    <div key={update.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-primary' : 'bg-muted'}`} />
                        {index < updates.length - 1 && <div className="w-px h-8 bg-muted mt-2" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {statusConfig[update.status as DeliveryStatus]?.label || update.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(update.created_at)}
                          </span>
                        </div>
                        {update.location && (
                          <p className="text-sm mt-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {update.location}
                          </p>
                        )}
                        {update.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{update.notes}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DeliveryTracker;