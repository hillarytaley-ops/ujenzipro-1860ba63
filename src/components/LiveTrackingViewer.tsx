import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Clock, Truck, CheckCircle, User, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DeliveryRequest {
  id: string;
  pickup_address: string;
  delivery_address: string;
  material_type: string;
  quantity: number;
  status: string;
  provider_response: string;
  delivery_providers?: {
    provider_name: string;
    phone: string;
  } | null;
}

interface TrackingLocation {
  id: string;
  latitude: number;
  longitude: number;
  status: string;
  speed?: number;
  heading?: number;
  accuracy?: number;
  notes?: string;
  created_at: string;
}

interface LiveTrackingViewerProps {
  builderId?: string;
}

const LiveTrackingViewer: React.FC<LiveTrackingViewerProps> = ({ builderId = 'demo-builder' }) => {
  const { toast } = useToast();
  const [activeDeliveries, setActiveDeliveries] = useState<DeliveryRequest[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<TrackingLocation[]>([]);
  const [latestLocation, setLatestLocation] = useState<TrackingLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const trackingStatuses = {
    'picked_up': { label: 'Picked Up', icon: CheckCircle, color: 'bg-blue-500' },
    'en_route': { label: 'En Route', icon: Truck, color: 'bg-yellow-500' },
    'nearby': { label: 'Nearby', icon: MapPin, color: 'bg-orange-500' },
    'delivered': { label: 'Delivered', icon: CheckCircle, color: 'bg-green-500' },
  };

  useEffect(() => {
    fetchActiveDeliveries();
  }, [builderId]);

  useEffect(() => {
    if (selectedDelivery) {
      fetchTrackingData(selectedDelivery);
      
      // Set up real-time subscription
      const channel = supabase
        .channel('tracking-updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'delivery_tracking',
            filter: `delivery_request_id=eq.${selectedDelivery}`
          },
          (payload) => {
            console.log('New tracking update:', payload);
            const newLocation = payload.new as TrackingLocation;
            setTrackingData(prev => [newLocation, ...prev]);
            setLatestLocation(newLocation);
            
            // Show toast notification
            const statusInfo = trackingStatuses[newLocation.status as keyof typeof trackingStatuses];
            if (statusInfo) {
              toast({
                title: "🚚 Delivery Update",
                description: `Status: ${statusInfo.label}`,
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedDelivery]);

  const fetchActiveDeliveries = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_requests')
        .select(`
          *,
          delivery_providers:delivery_providers!delivery_requests_provider_id_fkey(provider_name, phone)
        `)
        .eq('builder_id', builderId)
        .eq('provider_response', 'accepted')
        .neq('status', 'delivered')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setActiveDeliveries((data || []) as unknown as DeliveryRequest[]);
      
      // Auto-select first delivery if available
      if (data && data.length > 0 && !selectedDelivery) {
        setSelectedDelivery(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching active deliveries:', error);
      toast({
        title: "Error",
        description: "Failed to fetch active deliveries",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTrackingData = async (deliveryId: string) => {
    try {
      const { data, error } = await supabase
        .from('delivery_tracking')
        .select('*')
        .eq('delivery_request_id', deliveryId)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      setTrackingData(data || []);
      setLatestLocation(data && data.length > 0 ? data[0] : null);
    } catch (error) {
      console.error('Error fetching tracking data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tracking data",
        variant: "destructive"
      });
    }
  };

  const handleRefresh = async () => {
    if (!selectedDelivery) return;
    
    setRefreshing(true);
    await fetchTrackingData(selectedDelivery);
    await fetchActiveDeliveries();
    setRefreshing(false);
    
    toast({
      title: "Refreshed",
      description: "Tracking data updated",
    });
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getMapUrl = (lat: number, lng: number) => {
    return `https://www.google.com/maps?q=${lat},${lng}&z=15`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Loading Tracking...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (activeDeliveries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Live Delivery Tracking
          </CardTitle>
          <CardDescription>
            No active deliveries to track at the moment
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const selectedDeliveryData = activeDeliveries.find(d => d.id === selectedDelivery);
  const currentStatus = latestLocation ? trackingStatuses[latestLocation.status as keyof typeof trackingStatuses] : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Navigation className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Live Delivery Tracking</h2>
          {latestLocation && (
            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Live
            </Badge>
          )}
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Delivery Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Your Active Deliveries</CardTitle>
          <CardDescription>
            Select a delivery to view live tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {activeDeliveries.map((delivery) => (
              <div
                key={delivery.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedDelivery === delivery.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:bg-muted/50'
                }`}
                onClick={() => setSelectedDelivery(delivery.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{delivery.material_type}</h4>
                    <p className="text-sm text-muted-foreground">
                      {delivery.quantity} units
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Provider: {delivery.delivery_providers?.provider_name || 'Unknown'}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {delivery.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Tracking */}
      {selectedDeliveryData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Delivery Details */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">MATERIAL</h4>
                <p>{selectedDeliveryData.material_type}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">QUANTITY</h4>
                <p>{selectedDeliveryData.quantity} units</p>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  PICKUP ADDRESS
                </h4>
                <p className="text-sm">{selectedDeliveryData.pickup_address}</p>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  DELIVERY ADDRESS
                </h4>
                <p className="text-sm">{selectedDeliveryData.delivery_address}</p>
              </div>

              {selectedDeliveryData.delivery_providers && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-1">
                    <User className="h-4 w-4" />
                    PROVIDER
                  </h4>
                  <p className="text-sm">{selectedDeliveryData.delivery_providers.provider_name}</p>
                  <p className="text-sm">{selectedDeliveryData.delivery_providers.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle>Current Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {latestLocation && currentStatus ? (
                <>
                  <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                    <div className={`w-4 h-4 rounded-full ${currentStatus.color}`}></div>
                    <currentStatus.icon className="h-5 w-5" />
                    <span className="font-medium text-lg">{currentStatus.label}</span>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      CURRENT LOCATION
                    </h4>
                    <p className="text-sm mb-2">
                      {latestLocation.latitude.toFixed(6)}, {latestLocation.longitude.toFixed(6)}
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(getMapUrl(latestLocation.latitude, latestLocation.longitude), '_blank')}
                    >
                      View on Map
                    </Button>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      LAST UPDATE
                    </h4>
                    <p className="text-sm">
                      {new Date(latestLocation.created_at).toLocaleString()}
                    </p>
                  </div>

                  {latestLocation.speed && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">SPEED</h4>
                      <p className="text-sm">
                        {Math.round(latestLocation.speed * 3.6)} km/h
                      </p>
                    </div>
                  )}

                  {latestLocation.notes && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">NOTES</h4>
                      <p className="text-sm">{latestLocation.notes}</p>
                    </div>
                  )}
                </>
              ) : (
                <Alert>
                  <Navigation className="h-4 w-4" />
                  <AlertDescription>
                    No tracking data available yet. The delivery provider hasn't started sharing their location.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tracking History */}
      {trackingData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tracking History</CardTitle>
            <CardDescription>
              Recent location updates for this delivery
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {trackingData.slice(0, 10).map((location, index) => {
                const statusInfo = trackingStatuses[location.status as keyof typeof trackingStatuses];
                return (
                  <div key={location.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className={`w-3 h-3 rounded-full mt-1 ${statusInfo?.color || 'bg-gray-500'}`}></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">
                            {statusInfo?.label || location.status}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(location.created_at).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(getMapUrl(location.latitude, location.longitude), '_blank')}
                        >
                          <MapPin className="h-3 w-3" />
                        </Button>
                      </div>
                      {location.notes && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {location.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LiveTrackingViewer;