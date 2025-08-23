import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MessageSquare, 
  Truck, 
  Building2, 
  User, 
  Phone, 
  Video,
  Clock,
  MapPin,
  Package
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import DeliveryCommunicationHub from './DeliveryCommunicationHub';

interface DeliveryRequest {
  id: string;
  pickup_address: string;
  delivery_address: string;
  material_type: string;
  status: string;
  created_at: string;
  builder_id: string;
  provider_id?: string;
}

interface CommunicationInterfaceProps {
  userType: 'supplier' | 'delivery_provider' | 'builder';
  userId: string;
  userName: string;
}

const CommunicationInterface: React.FC<CommunicationInterfaceProps> = ({
  userType,
  userId,
  userName
}) => {
  const [deliveryRequests, setDeliveryRequests] = useState<DeliveryRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchDeliveryRequests();
  }, [userType, userId]);

  const fetchDeliveryRequests = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('delivery_requests')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter based on user type
      if (userType === 'builder') {
        query = query.eq('builder_id', userId);
      } else if (userType === 'delivery_provider') {
        query = query.eq('provider_id', userId);
      }
      // For suppliers, show all requests (they might get assigned)

      const { data, error } = await query;

      if (error) throw error;
      setDeliveryRequests(data || []);
    } catch (error) {
      console.error('Error fetching delivery requests:', error);
      toast.error('Failed to load delivery requests');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRequests = deliveryRequests.filter(request => {
    const matchesSearch = request.material_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.pickup_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.delivery_address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'accepted':
        return 'bg-blue-500';
      case 'picked_up':
        return 'bg-purple-500';
      case 'in_transit':
        return 'bg-orange-500';
      case 'delivered':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (selectedRequest) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => setSelectedRequest('')}
          >
            ← Back to Requests
          </Button>
          <h2 className="text-lg font-semibold">Communication Hub</h2>
        </div>
        <DeliveryCommunicationHub
          deliveryRequestId={selectedRequest}
          currentUserType={userType}
          currentUserId={userId}
          currentUserName={userName}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Communication Center</h2>
          <p className="text-muted-foreground">
            Manage communications for all delivery requests
          </p>
        </div>
        <Badge variant="outline" className="capitalize">
          {userType.replace('_', ' ')} View
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by material, pickup, or delivery address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="status">Status Filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="picked_up">Picked Up</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Requests List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredRequests.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No delivery requests found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your filters'
                : 'No delivery requests available at the moment'
              }
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{request.material_type}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(request.created_at)}
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-white ${getStatusColor(request.status)}`}
                    >
                      {request.status}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Pickup</p>
                        <p className="text-sm">{request.pickup_address}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Delivery</p>
                        <p className="text-sm">{request.delivery_address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => setSelectedRequest(request.id)}
                      className="flex-1"
                      size="sm"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Open Chat
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Communication Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {filteredRequests.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {filteredRequests.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredRequests.filter(r => r.status === 'in_transit').length}
              </div>
              <div className="text-sm text-muted-foreground">In Transit</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredRequests.filter(r => r.status === 'delivered').length}
              </div>
              <div className="text-sm text-muted-foreground">Delivered</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunicationInterface;