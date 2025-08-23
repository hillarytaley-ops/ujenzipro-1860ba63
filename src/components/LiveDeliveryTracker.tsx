import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Navigation, Play, Square, Clock, AlertTriangle, Truck, CheckCircle, User } from "lucide-react";
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
  builder?: {
    full_name: string;
    company_name?: string;
  } | null;
}

interface TrackingData {
  id: string;
  latitude: number;
  longitude: number;
  status: string;
  notes?: string;
  created_at: string;
}

interface LiveDeliveryTrackerProps {
  providerId?: string;
}

const LiveDeliveryTracker: React.FC<LiveDeliveryTrackerProps> = ({ providerId = 'demo-provider' }) => {
  const { toast } = useToast();
  const [acceptedDeliveries, setAcceptedDeliveries] = useState<DeliveryRequest[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  const [trackingStatus, setTrackingStatus] = useState<string>('en_route');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const trackingStatuses = [
    { value: 'picked_up', label: 'Picked Up', icon: CheckCircle, color: 'bg-blue-500' },
    { value: 'en_route', label: 'En Route', icon: Truck, color: 'bg-yellow-500' },
    { value: 'nearby', label: 'Nearby', icon: MapPin, color: 'bg-orange-500' },
    { value: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'bg-green-500' },
  ];

  useEffect(() => {
    fetchAcceptedDeliveries();
  }, [providerId]);

  useEffect(() => {
    if (isTracking && selectedDelivery) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }

    return () => stopLocationTracking();
  }, [isTracking, selectedDelivery]);

  const fetchAcceptedDeliveries = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_requests')
        .select(`
          *,
          builder:profiles!delivery_requests_builder_id_fkey(full_name, company_name)
        `)
        .eq('provider_id', providerId)
        .eq('provider_response', 'accepted')
        .neq('status', 'delivered')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAcceptedDeliveries(data || []);
    } catch (error) {
      console.error('Error fetching accepted deliveries:', error);
      toast({
        title: "Error",
        description: "Failed to fetch accepted deliveries",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by this browser",
        variant: "destructive"
      });
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000,
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation(position);
        
        // Throttle updates to avoid spam (minimum 5 seconds between updates)
        const now = Date.now();
        if (now - lastUpdateRef.current >= 5000) {
          updateLocationInDatabase(position);
          lastUpdateRef.current = now;
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast({
          title: "Location Error",
          description: "Unable to get current location. Please check permissions.",
          variant: "destructive"
        });
      },
      options
    );

    toast({
      title: "Tracking Started",
      description: "Your location is now being shared with the customer",
    });
  };

  const stopLocationTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const updateLocationInDatabase = async (position: GeolocationPosition) => {
    if (!selectedDelivery) return;

    try {
      const { error } = await supabase
        .from('delivery_tracking')
        .insert({
          delivery_request_id: selectedDelivery,
          provider_id: providerId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          heading: position.coords.heading,
          speed: position.coords.speed,
          accuracy: position.coords.accuracy,
          status: trackingStatus,
          notes: notes || null,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const handleStartTracking = async () => {
    if (!selectedDelivery) {
      toast({
        title: "No Delivery Selected",
        description: "Please select a delivery to track",
        variant: "destructive"
      });
      return;
    }

    setIsTracking(true);
  };

  const handleStopTracking = async () => {
    setIsTracking(false);
    
    // Send final location update
    if (currentLocation && selectedDelivery) {
      await updateLocationInDatabase(currentLocation);
    }

    toast({
      title: "Tracking Stopped",
      description: "Location sharing has been disabled",
    });
  };

  const handleStatusChange = async (newStatus: string) => {
    setTrackingStatus(newStatus);
    
    // If delivery is completed, stop tracking and update request status
    if (newStatus === 'delivered') {
      setIsTracking(false);
      
      try {
        const { error } = await supabase
          .from('delivery_requests')
          .update({ status: 'delivered' })
          .eq('id', selectedDelivery);

        if (error) throw error;

        toast({
          title: "Delivery Completed",
          description: "Delivery has been marked as completed",
        });

        // Refresh the deliveries list
        fetchAcceptedDeliveries();
        setSelectedDelivery(null);
      } catch (error) {
        console.error('Error updating delivery status:', error);
        toast({
          title: "Error",
          description: "Failed to update delivery status",
          variant: "destructive"
        });
      }
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Loading Deliveries...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (acceptedDeliveries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Live Delivery Tracking
          </CardTitle>
          <CardDescription>
            No active deliveries to track
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const selectedDeliveryData = acceptedDeliveries.find(d => d.id === selectedDelivery);
  const currentStatusInfo = trackingStatuses.find(s => s.value === trackingStatus);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Navigation className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Live Delivery Tracking</h2>
        {isTracking && (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Live Tracking
          </Badge>
        )}
      </div>

      {/* Delivery Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Active Delivery</CardTitle>
          <CardDescription>
            Choose which delivery you want to track
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="delivery-select">Active Deliveries</Label>
            <Select value={selectedDelivery || ""} onValueChange={setSelectedDelivery}>
              <SelectTrigger>
                <SelectValue placeholder="Select a delivery to track" />
              </SelectTrigger>
              <SelectContent>
                {acceptedDeliveries.map((delivery) => (
                  <SelectItem key={delivery.id} value={delivery.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>
                        {delivery.material_type} - {delivery.builder?.company_name || delivery.builder?.full_name}
                      </span>
                      <Badge variant="outline" className="ml-2">
                        {delivery.status}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedDeliveryData && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Delivery Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Pickup:</span> {selectedDeliveryData.pickup_address}
                </div>
                <div>
                  <span className="font-medium">Delivery:</span> {selectedDeliveryData.delivery_address}
                </div>
                <div>
                  <span className="font-medium">Material:</span> {selectedDeliveryData.material_type}
                </div>
                <div>
                  <span className="font-medium">Quantity:</span> {selectedDeliveryData.quantity} units
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tracking Controls */}
      {selectedDelivery && (
        <Card>
          <CardHeader>
            <CardTitle>Tracking Controls</CardTitle>
            <CardDescription>
              Manage real-time location sharing and delivery status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status Selection */}
            <div>
              <Label htmlFor="status-select">Delivery Status</Label>
              <Select value={trackingStatus} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {trackingStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                        <status.icon className="h-4 w-4" />
                        <span>{status.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="tracking-notes">Update Notes (Optional)</Label>
              <Textarea
                id="tracking-notes"
                placeholder="Add any updates or notes about the delivery..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Current Location Display */}
            {currentLocation && (
              <Alert>
                <MapPin className="h-4 w-4" />
                <AlertDescription>
                  <strong>Current Location:</strong> {currentLocation.coords.latitude.toFixed(6)}, {currentLocation.coords.longitude.toFixed(6)}
                  <br />
                  <strong>Accuracy:</strong> ±{Math.round(currentLocation.coords.accuracy || 0)}m
                  {currentLocation.coords.speed && (
                    <>
                      <br />
                      <strong>Speed:</strong> {Math.round((currentLocation.coords.speed || 0) * 3.6)} km/h
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Tracking Buttons */}
            <div className="flex gap-3">
              {!isTracking ? (
                <Button onClick={handleStartTracking} className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  Start Live Tracking
                </Button>
              ) : (
                <Button onClick={handleStopTracking} variant="outline" className="flex-1">
                  <Square className="h-4 w-4 mr-2" />
                  Stop Tracking
                </Button>
              )}
            </div>

            {/* Status Display */}
            {currentStatusInfo && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <div className={`w-3 h-3 rounded-full ${currentStatusInfo.color}`}></div>
                <currentStatusInfo.icon className="h-4 w-4" />
                <span className="font-medium">Status: {currentStatusInfo.label}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Safety Notice */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Safety First:</strong> Always prioritize road safety. Only update your delivery status when it's safe to do so, preferably when stopped.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default LiveDeliveryTracker;