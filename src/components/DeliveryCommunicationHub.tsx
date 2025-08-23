import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Phone, 
  Send, 
  Truck, 
  MapPin, 
  Clock, 
  Building2, 
  User, 
  Mic,
  MicOff,
  FileImage,
  Navigation,
  Package
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DeliveryRequest {
  id: string;
  pickup_address: string;
  delivery_address: string;
  material_type: string;
  status: string;
  created_at: string;
}

interface Communication {
  id: string;
  delivery_request_id: string;
  sender_type: string;
  sender_id: string;
  sender_name: string;
  message_type: string;
  content: string;
  metadata: any;
  read_by: any;
  created_at: string;
}

interface StatusUpdate {
  id: string;
  delivery_request_id: string;
  status: string;
  location_latitude?: number;
  location_longitude?: number;
  notes?: string;
  updated_by_type: string;
  updated_by_id: string;
  updated_by_name: string;
  created_at: string;
}

interface DeliveryCommunicationHubProps {
  deliveryRequestId: string;
  userType: 'supplier' | 'delivery_provider' | 'builder';
  userId: string;
  userName: string;
}

const DeliveryCommunicationHub: React.FC<DeliveryCommunicationHubProps> = ({
  deliveryRequestId,
  userType,
  userId,
  userName
}) => {
  const [deliveryRequest, setDeliveryRequest] = useState<DeliveryRequest | null>(null);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [currentLocation, setCurrentLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const statusOptions = [
    'picked_up',
    'in_transit',
    'arrived_at_destination',
    'delivered',
    'delayed',
    'issue_reported'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchDeliveryRequest();
    fetchCommunications();
    fetchStatusUpdates();
    setupRealtimeSubscriptions();
    getCurrentLocation();
  }, [deliveryRequestId]);

  useEffect(() => {
    scrollToBottom();
  }, [communications]);

  const fetchDeliveryRequest = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_requests')
        .select('*')
        .eq('id', deliveryRequestId)
        .single();

      if (error) throw error;
      setDeliveryRequest(data);
    } catch (error) {
      console.error('Error fetching delivery request:', error);
      toast.error('Failed to load delivery request');
    }
  };

  const fetchCommunications = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_communications')
        .select('*')
        .eq('delivery_request_id', deliveryRequestId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setCommunications(data || []);
    } catch (error) {
      console.error('Error fetching communications:', error);
      toast.error('Failed to load messages');
    }
  };

  const fetchStatusUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_status_updates')
        .select('*')
        .eq('delivery_request_id', deliveryRequestId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStatusUpdates(data || []);
    } catch (error) {
      console.error('Error fetching status updates:', error);
      toast.error('Failed to load status updates');
    }
  };

  const setupRealtimeSubscriptions = () => {
    const communicationsChannel = supabase
      .channel('delivery-communications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'delivery_communications',
          filter: `delivery_request_id=eq.${deliveryRequestId}`
        },
        (payload) => {
          setCommunications(prev => [...prev, payload.new as Communication]);
        }
      )
      .subscribe();

    const statusChannel = supabase
      .channel('delivery-status-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'delivery_status_updates',
          filter: `delivery_request_id=eq.${deliveryRequestId}`
        },
        (payload) => {
          setStatusUpdates(prev => [payload.new as StatusUpdate, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(communicationsChannel);
      supabase.removeChannel(statusChannel);
    };
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Could not get current location:', error);
        }
      );
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('delivery_communications')
        .insert({
          delivery_request_id: deliveryRequestId,
          sender_type: userType,
          sender_id: userId,
          sender_name: userName,
          message_type: 'text',
          content: newMessage,
          metadata: {}
        });

      if (error) throw error;
      setNewMessage('');
      toast.success('Message sent');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const sendStatusUpdate = async () => {
    if (!newStatus) return;

    try {
      const statusData = {
        delivery_request_id: deliveryRequestId,
        status: newStatus,
        notes: statusNotes || null,
        updated_by_type: userType,
        updated_by_id: userId,
        updated_by_name: userName,
        location_latitude: currentLocation?.latitude || null,
        location_longitude: currentLocation?.longitude || null
      };

      const { error } = await supabase
        .from('delivery_status_updates')
        .insert(statusData);

      if (error) throw error;

      // Also send as communication
      await supabase
        .from('delivery_communications')
        .insert({
          delivery_request_id: deliveryRequestId,
          sender_type: userType,
          sender_id: userId,
          sender_name: userName,
          message_type: 'status_update',
          content: `Status updated to: ${newStatus}`,
          metadata: statusData
        });

      setNewStatus('');
      setStatusNotes('');
      toast.success('Status updated');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const sendLocationUpdate = async () => {
    if (!currentLocation) {
      toast.error('Location not available');
      return;
    }

    try {
      await supabase
        .from('delivery_communications')
        .insert({
          delivery_request_id: deliveryRequestId,
          sender_type: userType,
          sender_id: userId,
          sender_name: userName,
          message_type: 'location_update',
          content: `Location update: ${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`,
          metadata: {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            timestamp: new Date().toISOString()
          }
        });

      toast.success('Location shared');
    } catch (error) {
      console.error('Error sharing location:', error);
      toast.error('Failed to share location');
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSenderIcon = (senderType: string) => {
    switch (senderType) {
      case 'supplier':
        return <Building2 className="h-4 w-4" />;
      case 'delivery_provider':
        return <Truck className="h-4 w-4" />;
      case 'builder':
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'picked_up':
        return 'bg-blue-500';
      case 'in_transit':
        return 'bg-yellow-500';
      case 'arrived_at_destination':
        return 'bg-purple-500';
      case 'delivered':
        return 'bg-green-500';
      case 'delayed':
        return 'bg-orange-500';
      case 'issue_reported':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[800px]">
      {/* Delivery Info */}
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Delivery Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {deliveryRequest && (
              <>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Material</h4>
                  <p className="font-medium">{deliveryRequest.material_type}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Pickup</h4>
                  <p className="text-sm">{deliveryRequest.pickup_address}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Delivery</h4>
                  <p className="text-sm">{deliveryRequest.delivery_address}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Status</h4>
                  <Badge variant="outline">{deliveryRequest.status}</Badge>
                </div>
              </>
            )}

            <Separator />

            {/* Status Updates */}
            <div>
              <h4 className="font-medium mb-3">Recent Updates</h4>
              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {statusUpdates.map((update) => (
                    <div key={update.id} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                      <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(update.status)}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium capitalize">{update.status.replace('_', ' ')}</p>
                        <p className="text-xs text-muted-foreground">{update.updated_by_name}</p>
                        <p className="text-xs text-muted-foreground">{formatTime(update.created_at)}</p>
                        {update.notes && (
                          <p className="text-xs mt-1">{update.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <h4 className="font-medium">Quick Actions</h4>
              <Button
                onClick={sendLocationUpdate}
                variant="outline"
                size="sm"
                className="w-full"
                disabled={!currentLocation}
              >
                <Navigation className="h-4 w-4 mr-2" />
                Share Location
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat */}
      <div className="lg:col-span-2">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Communication
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {/* Messages */}
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {communications.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === userId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender_id === userId
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {message.sender_id !== userId && (
                        <div className="flex items-center gap-2 mb-1">
                          {getSenderIcon(message.sender_type)}
                          <span className="text-xs font-medium">{message.sender_name}</span>
                          <Badge variant="outline" className="text-xs">
                            {message.sender_type.replace('_', ' ')}
                          </Badge>
                        </div>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs opacity-70">
                          {formatTime(message.created_at)}
                        </span>
                        {message.message_type === 'location_update' && (
                          <MapPin className="h-3 w-3 opacity-70" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Status Update Section */}
            <div className="mt-4 p-4 border rounded-lg bg-muted/30">
              <h4 className="font-medium mb-3">Update Status</h4>
              <div className="space-y-3">
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        <span className="capitalize">{status.replace('_', ' ')}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Add notes (optional)"
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  rows={2}
                />
                <Button onClick={sendStatusUpdate} size="sm" disabled={!newStatus}>
                  Update Status
                </Button>
              </div>
            </div>

            {/* Message Input */}
            <div className="flex gap-2 mt-4">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1"
              />
              <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeliveryCommunicationHub;