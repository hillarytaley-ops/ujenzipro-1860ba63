import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MessageCircle, 
  Send, 
  MapPin, 
  Truck, 
  Package, 
  Users, 
  Clock, 
  Phone,
  AlertCircle,
  CheckCircle,
  Mic,
  MicOff,
  Volume2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  id: string;
  delivery_request_id: string;
  sender_type: 'supplier' | 'delivery_provider' | 'builder';
  sender_id: string;
  sender_name: string;
  message_type: 'text' | 'status_update' | 'location_update' | 'voice_note';
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
  updated_by_type: 'supplier' | 'delivery_provider' | 'builder';
  updated_by_id: string;
  updated_by_name: string;
  created_at: string;
}

interface CommunicationHubProps {
  deliveryRequestId: string;
  currentUserType: 'supplier' | 'delivery_provider' | 'builder';
  currentUserId: string;
  currentUserName: string;
}

const DeliveryCommunicationHub: React.FC<CommunicationHubProps> = ({
  deliveryRequestId,
  currentUserType,
  currentUserId,
  currentUserName
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newStatusUpdate, setNewStatusUpdate] = useState({
    status: '',
    notes: '',
    location_latitude: null as number | null,
    location_longitude: null as number | null
  });
  const [isRecording, setIsRecording] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'status' | 'location'>('chat');
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  // Load messages and status updates
  useEffect(() => {
    loadMessages();
    loadStatusUpdates();
    getCurrentLocation();
  }, [deliveryRequestId]);

  // Set up real-time subscriptions
  useEffect(() => {
    const messagesChannel = supabase
      .channel('delivery-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'delivery_communications',
          filter: `delivery_request_id=eq.${deliveryRequestId}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
          scrollToBottom();
        }
      )
      .subscribe();

    const statusChannel = supabase
      .channel('delivery-status')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'delivery_status_updates',
          filter: `delivery_request_id=eq.${deliveryRequestId}`
        },
        (payload) => {
          const newStatus = payload.new as StatusUpdate;
          setStatusUpdates(prev => [...prev, newStatus]);
          toast.success(`Status updated: ${newStatus.status}`);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(statusChannel);
    };
  }, [deliveryRequestId]);

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('delivery_communications')
      .select('*')
      .eq('delivery_request_id', deliveryRequestId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
      return;
    }

    setMessages((data || []) as Message[]);
    setTimeout(scrollToBottom, 100);
  };

  const loadStatusUpdates = async () => {
    const { data, error } = await supabase
      .from('delivery_status_updates')
      .select('*')
      .eq('delivery_request_id', deliveryRequestId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading status updates:', error);
      return;
    }

    setStatusUpdates((data || []) as StatusUpdate[]);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const { error } = await supabase
      .from('delivery_communications')
      .insert({
        delivery_request_id: deliveryRequestId,
        sender_type: currentUserType,
        sender_id: currentUserId,
        sender_name: currentUserName,
        message_type: 'text',
        content: newMessage,
        metadata: {},
        read_by: {}
      });

    if (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      return;
    }

    setNewMessage('');
  };

  const sendStatusUpdate = async () => {
    if (!newStatusUpdate.status) {
      toast.error('Please select a status');
      return;
    }

    const statusData = {
      delivery_request_id: deliveryRequestId,
      status: newStatusUpdate.status,
      location_latitude: newStatusUpdate.location_latitude || (currentLocation ? currentLocation.lat : null),
      location_longitude: newStatusUpdate.location_longitude || (currentLocation ? currentLocation.lng : null),
      notes: newStatusUpdate.notes || null,
      updated_by_type: currentUserType,
      updated_by_id: currentUserId,
      updated_by_name: currentUserName
    };

    const { error } = await supabase
      .from('delivery_status_updates')
      .insert(statusData);

    if (error) {
      console.error('Error sending status update:', error);
      toast.error('Failed to send status update');
      return;
    }

    // Also send as a message
    await supabase
      .from('delivery_communications')
      .insert({
        delivery_request_id: deliveryRequestId,
        sender_type: currentUserType,
        sender_id: currentUserId,
        sender_name: currentUserName,
        message_type: 'status_update',
        content: `Status updated to: ${newStatusUpdate.status}`,
        metadata: statusData,
        read_by: {}
      });

    setNewStatusUpdate({
      status: '',
      notes: '',
      location_latitude: null,
      location_longitude: null
    });
    setShowStatusDialog(false);
    toast.success('Status update sent');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        // For now, just show that recording was captured
        toast.success('Voice note recorded (feature in development)');
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'picked_up':
      case 'dispatched':
        return <Truck className="h-4 w-4" />;
      case 'in_transit':
        return <MapPin className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'delayed':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getSenderIcon = (senderType: string) => {
    switch (senderType) {
      case 'supplier':
        return '🏭';
      case 'delivery_provider':
        return '🚚';
      case 'builder':
        return '🏗️';
      default:
        return '👤';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Delivery Communication Hub
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'chat' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('chat')}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat
          </Button>
          <Button
            variant={activeTab === 'status' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('status')}
          >
            <Truck className="h-4 w-4 mr-2" />
            Status Updates
          </Button>
          <Button
            variant={activeTab === 'location' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('location')}
          >
            <MapPin className="h-4 w-4 mr-2" />
            Live Tracking
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {activeTab === 'chat' && (
          <div className="space-y-4">
            <ScrollArea className="h-96 w-full pr-4">
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.sender_id === currentUserId 
                        ? 'justify-end' 
                        : 'justify-start'
                    }`}
                  >
                    {message.sender_id !== currentUserId && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {getSenderIcon(message.sender_type)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                        message.sender_id === currentUserId
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {message.sender_id !== currentUserId && (
                        <div className="text-xs font-medium mb-1">
                          {message.sender_name} ({message.sender_type})
                        </div>
                      )}
                      <div className="text-sm">{message.content}</div>
                      <div className={`text-xs mt-1 ${
                        message.sender_id === currentUserId
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      }`}>
                        {formatTime(message.created_at)}
                      </div>
                    </div>

                    {message.sender_id === currentUserId && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {getSenderIcon(message.sender_type)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <Separator />

            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1"
              />
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                variant="outline"
                size="icon"
              >
                {isRecording ? (
                  <MicOff className="h-4 w-4 text-red-500" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
              <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'status' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Status Updates</h3>
              <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Update Status
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Delivery Status</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <Select 
                        value={newStatusUpdate.status} 
                        onValueChange={(value) => setNewStatusUpdate({...newStatusUpdate, status: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="picked_up">Picked Up</SelectItem>
                          <SelectItem value="in_transit">In Transit</SelectItem>
                          <SelectItem value="arrived">Arrived at Destination</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="delayed">Delayed</SelectItem>
                          <SelectItem value="issue">Issue Encountered</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Notes</label>
                      <Textarea
                        value={newStatusUpdate.notes}
                        onChange={(e) => setNewStatusUpdate({...newStatusUpdate, notes: e.target.value})}
                        placeholder="Additional notes (optional)"
                      />
                    </div>
                    <Button onClick={sendStatusUpdate} className="w-full">
                      Send Update
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <ScrollArea className="h-96 w-full">
              <div className="space-y-3">
                {statusUpdates.map((update) => (
                  <Card key={update.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getStatusIcon(update.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{update.status}</Badge>
                            <span className="text-xs text-muted-foreground">
                              by {update.updated_by_name} ({update.updated_by_type})
                            </span>
                          </div>
                          {update.notes && (
                            <p className="text-sm mt-2">{update.notes}</p>
                          )}
                          {update.location_latitude && update.location_longitude && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {update.location_latitude.toFixed(6)}, {update.location_longitude.toFixed(6)}
                            </div>
                          )}
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(update.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {activeTab === 'location' && (
          <div className="space-y-4">
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Live Tracking</h3>
              <p className="text-muted-foreground">
                Live tracking view will be displayed here with real-time location updates
              </p>
              {currentLocation && (
                <div className="mt-4 text-sm text-muted-foreground">
                  Your current location: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeliveryCommunicationHub;