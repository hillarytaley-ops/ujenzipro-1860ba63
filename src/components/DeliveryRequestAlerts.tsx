import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bell, CheckCircle, XCircle, MapPin, Package, Calendar, Clock, User, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DeliveryRequest {
  id: string;
  pickup_address: string;
  delivery_address: string;
  material_type: string;
  quantity: number;
  weight_kg?: number;
  pickup_date: string;
  preferred_time?: string;
  special_instructions?: string;
  budget_range?: string;
  status: string;
  provider_response?: string;
  response_date?: string;
  response_notes?: string;
  created_at: string;
  builder?: {
    full_name: string;
    company_name?: string;
  } | null;
}

interface DeliveryRequestAlertsProps {
  providerId?: string;
}

const DeliveryRequestAlerts: React.FC<DeliveryRequestAlertsProps> = ({ providerId }) => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [responseNotes, setResponseNotes] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_requests')
        .select(`
          *,
          builder:profiles!delivery_requests_builder_id_fkey(full_name, company_name)
        `)
        .eq('status', 'pending')
        .is('provider_response', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch delivery requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (requestId: string, response: 'accepted' | 'rejected') => {
    if (!providerId) {
      toast({
        title: "Authentication required",
        description: "Please register as a delivery provider first",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('delivery_requests')
        .update({
          provider_response: response,
          provider_id: response === 'accepted' ? providerId : null,
          response_date: new Date().toISOString(),
          response_notes: responseNotes || null,
          status: response === 'accepted' ? 'accepted' : 'rejected'
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Response submitted",
        description: `Request ${response} successfully`,
      });

      // Remove the request from the list
      setRequests(prev => prev.filter(req => req.id !== requestId));
      setResponseNotes('');
      setSelectedRequestId(null);
    } catch (error) {
      console.error('Error responding to request:', error);
      toast({
        title: "Error",
        description: "Failed to submit response",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Loading Delivery Requests...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Delivery Request Alerts
          </CardTitle>
          <CardDescription>
            No pending delivery requests at the moment
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">New Delivery Requests</h2>
        <Badge variant="default" className="ml-2">
          {requests.length} pending
        </Badge>
      </div>

      <Alert className="border-orange-200 bg-orange-50">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          You have {requests.length} new delivery request{requests.length > 1 ? 's' : ''} waiting for your response.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {requests.map((request) => (
          <Card key={request.id} className="border-l-4 border-l-primary">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {request.material_type} Delivery Request
                  </CardTitle>
                  <CardDescription>
                    From: {request.builder?.company_name || request.builder?.full_name || 'Builder'}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                  Pending Response
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Pickup</p>
                      <p className="text-sm text-muted-foreground">{request.pickup_address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Delivery</p>
                      <p className="text-sm text-muted-foreground">{request.delivery_address}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {request.quantity} units
                      {request.weight_kg && ` (${request.weight_kg} kg)`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(request.pickup_date).toLocaleDateString()}
                    </span>
                  </div>

                  {request.preferred_time && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{request.preferred_time}</span>
                    </div>
                  )}

                  {request.budget_range && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Budget: </span>
                      <Badge variant="secondary">{request.budget_range}</Badge>
                    </div>
                  )}
                </div>
              </div>

              {request.special_instructions && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Special Instructions:</p>
                  <p className="text-sm text-muted-foreground">{request.special_instructions}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="flex-1"
                      onClick={() => setSelectedRequestId(request.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept Request
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Accept Delivery Request</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to accept this delivery request? You can add optional notes.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="response-notes">Response Notes (Optional)</Label>
                        <Textarea
                          id="response-notes"
                          placeholder="Add any notes about your acceptance..."
                          value={responseNotes}
                          onChange={(e) => setResponseNotes(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button 
                          onClick={() => selectedRequestId && handleResponse(selectedRequestId, 'accepted')}
                          className="flex-1"
                        >
                          Confirm Accept
                        </Button>
                        <Button variant="outline" onClick={() => setSelectedRequestId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setSelectedRequestId(request.id)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Request
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reject Delivery Request</DialogTitle>
                      <DialogDescription>
                        Please provide a reason for rejecting this request.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="reject-notes">Reason for Rejection</Label>
                        <Textarea
                          id="reject-notes"
                          placeholder="Please explain why you're rejecting this request..."
                          value={responseNotes}
                          onChange={(e) => setResponseNotes(e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button 
                          variant="destructive"
                          onClick={() => selectedRequestId && handleResponse(selectedRequestId, 'rejected')}
                          className="flex-1"
                          disabled={!responseNotes.trim()}
                        >
                          Confirm Reject
                        </Button>
                        <Button variant="outline" onClick={() => setSelectedRequestId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DeliveryRequestAlerts;