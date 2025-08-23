import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import MapLocationPicker from "@/components/MapLocationPicker";
import { Package, MapPin, AlertCircle, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RequestFormData {
  pickup_address: string;
  delivery_address: string;
  pickup_latitude: number | null;
  pickup_longitude: number | null;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  material_type: string;
  quantity: string;
  weight_kg: string;
  pickup_date: string;
  preferred_time: string;
  special_instructions: string;
  budget_range: string;
  required_vehicle_type: string;
}

interface DeliveryRequestFormProps {
  userProfile: any;
  onRequestSuccess: () => void;
}

const vehicleTypes = ['Pickup Truck', 'Van', 'Large Truck', 'Motorcycle', 'Lorry', 'Trailer'];
const materialCategories = [
  'Cement & Concrete',
  'Bricks & Blocks',
  'Steel & Iron',
  'Roofing Materials',
  'Tiles & Ceramics',
  'Electrical Supplies',
  'Plumbing Materials',
  'Timber & Wood',
  'Paint & Finishing',
  'Hardware & Tools',
  'Insulation Materials',
  'Glass & Windows',
  'Doors & Frames',
  'Aggregates (Sand, Gravel)',
  'Other Building Materials'
];

const budgetRanges = [
  'Under KES 1,000',
  'KES 1,000 - 5,000',
  'KES 5,000 - 10,000',
  'KES 10,000 - 20,000',
  'Over KES 20,000'
];

export const DeliveryRequestForm: React.FC<DeliveryRequestFormProps> = ({
  userProfile,
  onRequestSuccess
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeLocationPicker, setActiveLocationPicker] = useState<'pickup' | 'delivery' | null>(null);
  
  const [formData, setFormData] = useState<RequestFormData>({
    pickup_address: '',
    delivery_address: '',
    pickup_latitude: null,
    pickup_longitude: null,
    delivery_latitude: null,
    delivery_longitude: null,
    material_type: '',
    quantity: '',
    weight_kg: '',
    pickup_date: '',
    preferred_time: '',
    special_instructions: '',
    budget_range: '',
    required_vehicle_type: ''
  });

  const validateForm = (): boolean => {
    if (!formData.pickup_address || !formData.delivery_address || !formData.material_type ||
        !formData.quantity || !formData.pickup_date) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleLocationSelected = (location: { latitude: number; longitude: number; address?: string }) => {
    const address = location.address || `${location.latitude}, ${location.longitude}`;
    if (activeLocationPicker === 'pickup') {
      setFormData(prev => ({
        ...prev,
        pickup_address: address,
        pickup_latitude: location.latitude,
        pickup_longitude: location.longitude
      }));
    } else if (activeLocationPicker === 'delivery') {
      setFormData(prev => ({
        ...prev,
        delivery_address: address,
        delivery_latitude: location.latitude,
        delivery_longitude: location.longitude
      }));
    }
    setActiveLocationPicker(null);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!userProfile?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit a delivery request",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('delivery_requests')
        .insert({
          builder_id: userProfile.id,
          pickup_address: formData.pickup_address,
          delivery_address: formData.delivery_address,
          pickup_latitude: formData.pickup_latitude,
          pickup_longitude: formData.pickup_longitude,
          delivery_latitude: formData.delivery_latitude,
          delivery_longitude: formData.delivery_longitude,
          material_type: formData.material_type,
          quantity: parseInt(formData.quantity),
          weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
          pickup_date: formData.pickup_date,
          preferred_time: formData.preferred_time || null,
          special_instructions: formData.special_instructions || null,
          budget_range: formData.budget_range || null,
          required_vehicle_type: formData.required_vehicle_type || null
        });

      if (error) throw error;

      toast({
        title: "Request submitted successfully",
        description: "Delivery providers will be notified of your request"
      });
      
      setShowForm(false);
      setFormData({
        pickup_address: '',
        delivery_address: '',
        pickup_latitude: null,
        pickup_longitude: null,
        delivery_latitude: null,
        delivery_longitude: null,
        material_type: '',
        quantity: '',
        weight_kg: '',
        pickup_date: '',
        preferred_time: '',
        special_instructions: '',
        budget_range: '',
        required_vehicle_type: ''
      });
      onRequestSuccess();
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "Submission failed",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userProfile) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please log in to submit delivery requests.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Request Delivery
          </CardTitle>
          <CardDescription>
            Submit a delivery request for your construction materials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="w-full">Create New Request</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>New Delivery Request</DialogTitle>
                <DialogDescription>
                  Provide details for your material delivery request
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Location Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Pickup & Delivery Locations
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pickup_address">Pickup Address *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="pickup_address"
                          value={formData.pickup_address}
                          onChange={(e) => setFormData(prev => ({ ...prev, pickup_address: e.target.value }))}
                          placeholder="Enter pickup location"
                          required
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setActiveLocationPicker('pickup')}
                        >
                          <MapPin className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="delivery_address">Delivery Address *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="delivery_address"
                          value={formData.delivery_address}
                          onChange={(e) => setFormData(prev => ({ ...prev, delivery_address: e.target.value }))}
                          placeholder="Enter delivery location"
                          required
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setActiveLocationPicker('delivery')}
                        >
                          <MapPin className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Material Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Material Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="material_type">Material Type *</Label>
                      <Select value={formData.material_type} onValueChange={(value) => setFormData(prev => ({ ...prev, material_type: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select material type" />
                        </SelectTrigger>
                        <SelectContent>
                          {materialCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="quantity">Quantity *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                        placeholder="Number of items/units"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="weight_kg">Estimated Weight (kg)</Label>
                    <Input
                      id="weight_kg"
                      type="number"
                      value={formData.weight_kg}
                      onChange={(e) => setFormData(prev => ({ ...prev, weight_kg: e.target.value }))}
                      placeholder="Approximate total weight"
                    />
                  </div>
                </div>

                {/* Timing Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Timing
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pickup_date">Preferred Pickup Date *</Label>
                      <Input
                        id="pickup_date"
                        type="date"
                        value={formData.pickup_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, pickup_date: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="preferred_time">Preferred Time</Label>
                      <Input
                        id="preferred_time"
                        type="time"
                        value={formData.preferred_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, preferred_time: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Requirements & Budget */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Requirements & Budget</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="required_vehicle_type">Required Vehicle Type</Label>
                      <Select value={formData.required_vehicle_type} onValueChange={(value) => setFormData(prev => ({ ...prev, required_vehicle_type: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle type" />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicleTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="budget_range">Budget Range</Label>
                      <Select value={formData.budget_range} onValueChange={(value) => setFormData(prev => ({ ...prev, budget_range: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                        <SelectContent>
                          {budgetRanges.map((range) => (
                            <SelectItem key={range} value={range}>{range}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="special_instructions">Special Instructions</Label>
                    <Textarea
                      id="special_instructions"
                      value={formData.special_instructions}
                      onChange={(e) => setFormData(prev => ({ ...prev, special_instructions: e.target.value }))}
                      placeholder="Any special handling requirements, access restrictions, etc."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Location Picker Modal */}
          {activeLocationPicker && (
            <Dialog open={!!activeLocationPicker} onOpenChange={() => setActiveLocationPicker(null)}>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>
                    Select {activeLocationPicker === 'pickup' ? 'Pickup' : 'Delivery'} Location
                  </DialogTitle>
                </DialogHeader>
                <MapLocationPicker
                  onLocationSelect={handleLocationSelected}
                />
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryRequestForm;