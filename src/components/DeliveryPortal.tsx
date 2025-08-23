import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Truck, User, Building2, Star, MapPin, Phone, Mail, Calendar, Package, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DeliveryLocationPicker from "@/components/DeliveryLocationPicker";
import DeliveryMenuBar from "@/components/DeliveryMenuBar";

interface DeliveryProvider {
  id: string;
  provider_name: string;
  provider_type: 'individual' | 'organization';
  contact_person?: string;
  phone: string;
  email?: string;
  address?: string;
  vehicle_types: string[];
  service_areas: string[];
  capacity_kg?: number;
  hourly_rate?: number;
  per_km_rate?: number;
  is_verified: boolean;
  is_active: boolean;
  rating: number;
  total_deliveries: number;
}

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
  provider_id?: string;
  created_at: string;
}

interface BuilderRequest {
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
  builder_id: string;
  created_at: string;
  builder?: {
    full_name: string;
    company_name?: string;
  } | null;
}

const DeliveryPortal = () => {
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [providers, setProviders] = useState<DeliveryProvider[]>([]);
  const [requests, setRequests] = useState<DeliveryRequest[]>([]);
  const [builderRequests, setBuilderRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("providers");
  const [showProviderForm, setShowProviderForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showBuilderRequestForm, setShowBuilderRequestForm] = useState(false);

  const [providerForm, setProviderForm] = useState({
    provider_name: '',
    provider_type: 'individual' as 'individual' | 'organization',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    vehicle_types: [] as string[],
    service_areas: [] as string[],
    capacity_kg: '',
    hourly_rate: '',
    per_km_rate: ''
  });

  const [requestForm, setRequestForm] = useState({
    pickup_address: '',
    delivery_address: '',
    material_type: '',
    quantity: '',
    weight_kg: '',
    pickup_date: '',
    preferred_time: '',
    special_instructions: '',
    budget_range: ''
  });

  const [builderRequestForm, setBuilderRequestForm] = useState({
    pickup_address: '',
    delivery_address: '',
    material_type: '',
    quantity: '',
    weight_kg: '',
    pickup_date: '',
    preferred_time: '',
    special_instructions: '',
    budget_range: '',
    pickup_location: null as any,
    delivery_location: null as any
  });

  const vehicleTypes = ['Pickup Truck', 'Van', 'Large Truck', 'Motorcycle', 'Lorry', 'Trailer'];
  const kenyanCities = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Meru', 'Machakos'];

  useEffect(() => {
    checkAuth();
    fetchProviders();
    fetchRequests();
    fetchBuilderRequests();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_providers')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });
      
      if (error) throw error;
      setProviders((data || []) as DeliveryProvider[]);
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const fetchBuilderRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_requests')
        .select(`
          *,
          builder:profiles!delivery_requests_builder_id_fkey(full_name, company_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setBuilderRequests(data || []);
    } catch (error) {
      console.error('Error fetching builder requests:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const createProvider = async () => {
    if (!userProfile) {
      toast({
        title: "Authentication required",
        description: "Please sign in to register as a delivery provider",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('delivery_providers')
        .insert({
          user_id: userProfile.id,
          provider_name: providerForm.provider_name,
          provider_type: providerForm.provider_type,
          contact_person: providerForm.contact_person || null,
          phone: providerForm.phone,
          email: providerForm.email || null,
          address: providerForm.address || null,
          vehicle_types: providerForm.vehicle_types,
          service_areas: providerForm.service_areas,
          capacity_kg: providerForm.capacity_kg ? parseFloat(providerForm.capacity_kg) : null,
          hourly_rate: providerForm.hourly_rate ? parseFloat(providerForm.hourly_rate) : null,
          per_km_rate: providerForm.per_km_rate ? parseFloat(providerForm.per_km_rate) : null
        });

      if (error) throw error;

      toast({
        title: "Provider registered successfully",
        description: "Your application is under review"
      });
      
      setShowProviderForm(false);
      setProviderForm({
        provider_name: '',
        provider_type: 'individual',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        vehicle_types: [],
        service_areas: [],
        capacity_kg: '',
        hourly_rate: '',
        per_km_rate: ''
      });
      fetchProviders();
    } catch (error) {
      console.error('Error creating provider:', error);
      toast({
        title: "Error",
        description: "Failed to register as provider",
        variant: "destructive"
      });
    }
  };

  const createBuilderRequest = async () => {
    if (!userProfile) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit delivery requests",
        variant: "destructive"
      });
      return;
    }

    // Only builders can create builder requests
    if (userProfile.role !== 'builder') {
      toast({
        title: "Access denied",
        description: "Only builders can submit delivery requests",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('delivery_requests')
        .insert({
          builder_id: userProfile.id,
          pickup_address: builderRequestForm.pickup_address,
          delivery_address: builderRequestForm.delivery_address,
          material_type: builderRequestForm.material_type,
          quantity: parseInt(builderRequestForm.quantity),
          weight_kg: builderRequestForm.weight_kg ? parseFloat(builderRequestForm.weight_kg) : null,
          pickup_date: builderRequestForm.pickup_date,
          preferred_time: builderRequestForm.preferred_time || null,
          special_instructions: builderRequestForm.special_instructions || null,
          budget_range: builderRequestForm.budget_range || null
        });

      if (error) throw error;

      toast({
        title: "Request submitted successfully",
        description: "Your request has been sent to admin for processing"
      });
      
      setShowBuilderRequestForm(false);
      setBuilderRequestForm({
        pickup_address: '',
        delivery_address: '',
        material_type: '',
        quantity: '',
        weight_kg: '',
        pickup_date: '',
        preferred_time: '',
        special_instructions: '',
        budget_range: '',
        pickup_location: null,
        delivery_location: null
      });
      fetchBuilderRequests();
    } catch (error) {
      console.error('Error creating builder request:', error);
      toast({
        title: "Error",
        description: "Failed to submit delivery request",
        variant: "destructive"
      });
    }
  };

  const createRequest = async () => {
    if (!userProfile) {
      toast({
        title: "Authentication required",
        description: "Please sign in to request delivery services",
        variant: "destructive"
      });
      return;
    }

    // Only admin can request services from providers
    if (userProfile.role !== 'admin') {
      toast({
        title: "Access denied",
        description: "Only admin can request services from providers",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('delivery_requests')
        .insert({
          builder_id: userProfile.id,
          pickup_address: requestForm.pickup_address,
          delivery_address: requestForm.delivery_address,
          material_type: requestForm.material_type,
          quantity: parseInt(requestForm.quantity),
          weight_kg: requestForm.weight_kg ? parseFloat(requestForm.weight_kg) : null,
          pickup_date: requestForm.pickup_date,
          preferred_time: requestForm.preferred_time || null,
          special_instructions: requestForm.special_instructions || null,
          budget_range: requestForm.budget_range || null
        });

      if (error) throw error;

      toast({
        title: "Request submitted successfully",
        description: "Delivery providers will be able to view and respond to your request"
      });
      
      setShowRequestForm(false);
      setRequestForm({
        pickup_address: '',
        delivery_address: '',
        material_type: '',
        quantity: '',
        weight_kg: '',
        pickup_date: '',
        preferred_time: '',
        special_instructions: '',
        budget_range: ''
      });
      fetchRequests();
    } catch (error) {
      console.error('Error creating request:', error);
      toast({
        title: "Error",
        description: "Failed to submit delivery request",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Truck className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Delivery Portal</h2>
      </div>

      {!userProfile && (
        <Alert className="hidden md:block">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please sign in to access delivery services and provider registration.
          </AlertDescription>
        </Alert>
      )}

      <DeliveryMenuBar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        userProfile={userProfile} 
      />

      <div className="w-full">
        {activeTab === 'providers' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Available Delivery Providers</h3>
              {userProfile && userProfile.role === 'admin' && (
              <Dialog open={showRequestForm} onOpenChange={setShowRequestForm}>
                <DialogTrigger asChild>
                  <Button>Request Provider Service</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Request Service from Provider</DialogTitle>
                    <DialogDescription>
                      Submit a delivery request to service providers
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="pickup_address">Pickup Address</Label>
                        <Input
                          id="pickup_address"
                          value={requestForm.pickup_address}
                          onChange={(e) => setRequestForm({...requestForm, pickup_address: e.target.value})}
                          placeholder="Enter pickup location"
                        />
                      </div>
                      <div>
                        <Label htmlFor="delivery_address">Delivery Address</Label>
                        <Input
                          id="delivery_address"
                          value={requestForm.delivery_address}
                          onChange={(e) => setRequestForm({...requestForm, delivery_address: e.target.value})}
                          placeholder="Enter delivery destination"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="material_type">Material Type</Label>
                        <Input
                          id="material_type"
                          value={requestForm.material_type}
                          onChange={(e) => setRequestForm({...requestForm, material_type: e.target.value})}
                          placeholder="e.g., Cement, Bricks, Steel"
                        />
                      </div>
                      <div>
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          value={requestForm.quantity}
                          onChange={(e) => setRequestForm({...requestForm, quantity: e.target.value})}
                          placeholder="Number of items"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="weight_kg">Weight (kg)</Label>
                        <Input
                          id="weight_kg"
                          type="number"
                          value={requestForm.weight_kg}
                          onChange={(e) => setRequestForm({...requestForm, weight_kg: e.target.value})}
                          placeholder="Estimated weight"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pickup_date">Pickup Date</Label>
                        <Input
                          id="pickup_date"
                          type="date"
                          value={requestForm.pickup_date}
                          onChange={(e) => setRequestForm({...requestForm, pickup_date: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="preferred_time">Preferred Time</Label>
                        <Input
                          id="preferred_time"
                          type="time"
                          value={requestForm.preferred_time}
                          onChange={(e) => setRequestForm({...requestForm, preferred_time: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="budget_range">Budget Range</Label>
                        <Select value={requestForm.budget_range} onValueChange={(value) => setRequestForm({...requestForm, budget_range: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select budget range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="under-5000">Under KSh 5,000</SelectItem>
                            <SelectItem value="5000-10000">KSh 5,000 - 10,000</SelectItem>
                            <SelectItem value="10000-20000">KSh 10,000 - 20,000</SelectItem>
                            <SelectItem value="over-20000">Over KSh 20,000</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="special_instructions">Special Instructions</Label>
                      <Textarea
                        id="special_instructions"
                        value={requestForm.special_instructions}
                        onChange={(e) => setRequestForm({...requestForm, special_instructions: e.target.value})}
                        placeholder="Any special handling requirements or instructions"
                      />
                    </div>
                    <Button onClick={createRequest} className="w-full">
                      Submit Request
                    </Button>
                   </div>
                 </DialogContent>
               </Dialog>
              )}
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.map((provider) => (
              <Card key={provider.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{provider.provider_name}</CardTitle>
                    <Badge variant={provider.provider_type === 'individual' ? 'default' : 'secondary'}>
                      {provider.provider_type === 'individual' ? (
                        <><User className="h-3 w-3 mr-1" />Individual</>
                      ) : (
                        <><Building2 className="h-3 w-3 mr-1" />Organization</>
                      )}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm">{provider.rating.toFixed(1)}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {provider.total_deliveries} deliveries
                    </Badge>
                    {provider.is_verified && (
                      <Badge variant="default" className="text-xs">Verified</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {provider.phone}
                  </div>
                  {provider.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {provider.email}
                    </div>
                  )}
                  {provider.address && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {provider.address}
                    </div>
                  )}
                  
                  {provider.vehicle_types.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">Vehicle Types:</p>
                      <div className="flex flex-wrap gap-1">
                        {provider.vehicle_types.map((type, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {provider.service_areas.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">Service Areas:</p>
                      <div className="flex flex-wrap gap-1">
                        {provider.service_areas.map((area, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-sm space-y-1">
                    {provider.capacity_kg && (
                      <p>Capacity: {provider.capacity_kg} kg</p>
                    )}
                    {provider.hourly_rate && (
                      <p>Hourly Rate: KSh {provider.hourly_rate}</p>
                    )}
                    {provider.per_km_rate && (
                      <p>Per KM Rate: KSh {provider.per_km_rate}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
           </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Delivery Requests</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{request.material_type}</CardTitle>
                    <Badge variant={
                      request.status === 'pending' ? 'outline' :
                      request.status === 'assigned' ? 'default' :
                      request.status === 'completed' ? 'secondary' : 'destructive'
                    }>
                      {request.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    Quantity: {request.quantity} {request.weight_kg && `| Weight: ${request.weight_kg} kg`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <p><span className="font-medium">From:</span> {request.pickup_address}</p>
                    <p><span className="font-medium">To:</span> {request.delivery_address}</p>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(request.pickup_date).toLocaleDateString()}
                    {request.preferred_time && ` at ${request.preferred_time}`}
                  </div>
                  {request.budget_range && (
                    <Badge variant="outline" className="text-xs">
                      Budget: {request.budget_range}
                    </Badge>
                  )}
                  {request.special_instructions && (
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="font-medium">Instructions:</span> {request.special_instructions}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
            </div>
          </div>
        )}

        {activeTab === 'builder-requests' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Builder Delivery Requests</h3>
              {userProfile && userProfile.role === 'builder' && (
              <Dialog open={showBuilderRequestForm} onOpenChange={setShowBuilderRequestForm}>
                <DialogTrigger asChild>
                  <Button>Submit Request to Admin</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Submit Delivery Request</DialogTitle>
                    <DialogDescription>
                      Submit your delivery request to admin for processing
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="builder_pickup_address">Pickup Address</Label>
                        <Input
                          id="builder_pickup_address"
                          value={builderRequestForm.pickup_address}
                          onChange={(e) => setBuilderRequestForm({...builderRequestForm, pickup_address: e.target.value})}
                          placeholder="Enter pickup location"
                        />
                      </div>
                      <div>
                        <Label htmlFor="builder_delivery_address">Delivery Address</Label>
                        <Input
                          id="builder_delivery_address"
                          value={builderRequestForm.delivery_address}
                          onChange={(e) => setBuilderRequestForm({...builderRequestForm, delivery_address: e.target.value})}
                          placeholder="Enter delivery destination"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="builder_material_type">Material Type</Label>
                        <Input
                          id="builder_material_type"
                          value={builderRequestForm.material_type}
                          onChange={(e) => setBuilderRequestForm({...builderRequestForm, material_type: e.target.value})}
                          placeholder="e.g., Cement, Bricks, Steel"
                        />
                      </div>
                      <div>
                        <Label htmlFor="builder_quantity">Quantity</Label>
                        <Input
                          id="builder_quantity"
                          type="number"
                          value={builderRequestForm.quantity}
                          onChange={(e) => setBuilderRequestForm({...builderRequestForm, quantity: e.target.value})}
                          placeholder="Number of items"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="builder_weight_kg">Weight (kg)</Label>
                        <Input
                          id="builder_weight_kg"
                          type="number"
                          value={builderRequestForm.weight_kg}
                          onChange={(e) => setBuilderRequestForm({...builderRequestForm, weight_kg: e.target.value})}
                          placeholder="Estimated weight"
                        />
                      </div>
                      <div>
                        <Label htmlFor="builder_pickup_date">Pickup Date</Label>
                        <Input
                          id="builder_pickup_date"
                          type="date"
                          value={builderRequestForm.pickup_date}
                          onChange={(e) => setBuilderRequestForm({...builderRequestForm, pickup_date: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="builder_preferred_time">Preferred Time</Label>
                        <Input
                          id="builder_preferred_time"
                          type="time"
                          value={builderRequestForm.preferred_time}
                          onChange={(e) => setBuilderRequestForm({...builderRequestForm, preferred_time: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="builder_budget_range">Budget Range</Label>
                        <Select value={builderRequestForm.budget_range} onValueChange={(value) => setBuilderRequestForm({...builderRequestForm, budget_range: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select budget range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="under-5000">Under KSh 5,000</SelectItem>
                            <SelectItem value="5000-10000">KSh 5,000 - 10,000</SelectItem>
                            <SelectItem value="10000-20000">KSh 10,000 - 20,000</SelectItem>
                            <SelectItem value="over-20000">Over KSh 20,000</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                     <div>
                       <Label htmlFor="builder_special_instructions">Special Instructions</Label>
                       <Textarea
                         id="builder_special_instructions"
                         value={builderRequestForm.special_instructions}
                         onChange={(e) => setBuilderRequestForm({...builderRequestForm, special_instructions: e.target.value})}
                         placeholder="Any special handling requirements or instructions"
                       />
                     </div>
                     
                     <div className="space-y-4">
                       <h4 className="font-medium">Pickup Location Pin</h4>
                       <DeliveryLocationPicker
                         onLocationSelect={(location) => setBuilderRequestForm({...builderRequestForm, pickup_location: location})}
                         initialLocation={builderRequestForm.pickup_location}
                       />
                     </div>
                     
                     <div className="space-y-4">
                       <h4 className="font-medium">Delivery Location Pin</h4>
                       <DeliveryLocationPicker
                         onLocationSelect={(location) => setBuilderRequestForm({...builderRequestForm, delivery_location: location})}
                         initialLocation={builderRequestForm.delivery_location}
                       />
                     </div>
                     
                     <Button onClick={createBuilderRequest} className="w-full">
                       Submit Request
                     </Button>
                  </div>
                 </DialogContent>
               </Dialog>
              )}
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {builderRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{request.material_type}</CardTitle>
                    <Badge variant={
                      request.status === 'pending' ? 'outline' :
                      request.status === 'assigned' ? 'default' :
                      request.status === 'completed' ? 'secondary' : 'destructive'
                    }>
                      {request.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {request.builder?.company_name || request.builder?.full_name} | 
                    Quantity: {request.quantity} {request.weight_kg && `| Weight: ${request.weight_kg} kg`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <p><span className="font-medium">From:</span> {request.pickup_address}</p>
                    <p><span className="font-medium">To:</span> {request.delivery_address}</p>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(request.pickup_date).toLocaleDateString()}
                    {request.preferred_time && ` at ${request.preferred_time}`}
                  </div>
                  {request.budget_range && (
                    <Badge variant="outline" className="text-xs">
                      Budget: {request.budget_range}
                    </Badge>
                  )}
                  {request.special_instructions && (
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="font-medium">Instructions:</span> {request.special_instructions}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
            </div>
          </div>
        )}

        {activeTab === 'apply' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
              <CardTitle>Apply as Delivery Service Provider</CardTitle>
              <CardDescription>
                Join our network of delivery providers and start earning by helping builders get their materials delivered
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!userProfile ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please sign in to apply as a delivery service provider.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="provider_name">Provider Name</Label>
                      <Input
                        id="provider_name"
                        value={providerForm.provider_name}
                        onChange={(e) => setProviderForm({...providerForm, provider_name: e.target.value})}
                        placeholder="Your name or company name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="provider_type">Provider Type</Label>
                      <Select value={providerForm.provider_type} onValueChange={(value: 'individual' | 'organization') => setProviderForm({...providerForm, provider_type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual</SelectItem>
                          <SelectItem value="organization">Organization</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {providerForm.provider_type === 'organization' && (
                    <div>
                      <Label htmlFor="contact_person">Contact Person</Label>
                      <Input
                        id="contact_person"
                        value={providerForm.contact_person}
                        onChange={(e) => setProviderForm({...providerForm, contact_person: e.target.value})}
                        placeholder="Primary contact person"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={providerForm.phone}
                        onChange={(e) => setProviderForm({...providerForm, phone: e.target.value})}
                        placeholder="+254..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email (Optional)</Label>
                      <Input
                        id="email"
                        type="email"
                        value={providerForm.email}
                        onChange={(e) => setProviderForm({...providerForm, email: e.target.value})}
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={providerForm.address}
                      onChange={(e) => setProviderForm({...providerForm, address: e.target.value})}
                      placeholder="Your business address"
                    />
                  </div>

                  <div>
                    <Label>Vehicle Types (Select multiple)</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {vehicleTypes.map((type) => (
                        <Button
                          key={type}
                          variant={providerForm.vehicle_types.includes(type) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            const newTypes = providerForm.vehicle_types.includes(type)
                              ? providerForm.vehicle_types.filter(t => t !== type)
                              : [...providerForm.vehicle_types, type];
                            setProviderForm({...providerForm, vehicle_types: newTypes});
                          }}
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Service Areas (Select multiple)</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {kenyanCities.map((city) => (
                        <Button
                          key={city}
                          variant={providerForm.service_areas.includes(city) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            const newAreas = providerForm.service_areas.includes(city)
                              ? providerForm.service_areas.filter(a => a !== city)
                              : [...providerForm.service_areas, city];
                            setProviderForm({...providerForm, service_areas: newAreas});
                          }}
                        >
                          {city}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="capacity_kg">Vehicle Capacity (kg)</Label>
                      <Input
                        id="capacity_kg"
                        type="number"
                        value={providerForm.capacity_kg}
                        onChange={(e) => setProviderForm({...providerForm, capacity_kg: e.target.value})}
                        placeholder="Max weight capacity"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hourly_rate">Hourly Rate (KSh)</Label>
                      <Input
                        id="hourly_rate"
                        type="number"
                        value={providerForm.hourly_rate}
                        onChange={(e) => setProviderForm({...providerForm, hourly_rate: e.target.value})}
                        placeholder="Rate per hour"
                      />
                    </div>
                    <div>
                      <Label htmlFor="per_km_rate">Per KM Rate (KSh)</Label>
                      <Input
                        id="per_km_rate"
                        type="number"
                        value={providerForm.per_km_rate}
                        onChange={(e) => setProviderForm({...providerForm, per_km_rate: e.target.value})}
                        placeholder="Rate per kilometer"
                      />
                    </div>
                  </div>

                  <Button onClick={createProvider} className="w-full">
                    Apply as Delivery Provider
                  </Button>
                </div>
              )}
             </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryPortal;