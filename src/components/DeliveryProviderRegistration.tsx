import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DrivingLicenseUpload from "@/components/DrivingLicenseUpload";
import { User, Building2, Upload, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProviderFormData {
  provider_name: string;
  provider_type: 'individual' | 'organization';
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  vehicle_types: string[];
  service_areas: string[];
  capacity_kg: string;
  hourly_rate: string;
  per_km_rate: string;
  driving_license_number: string;
  driving_license_expiry: string;
  driving_license_class: string;
  driving_license_document_path: string;
}

interface DeliveryProviderRegistrationProps {
  userProfile: any;
  onRegistrationSuccess: () => void;
}

const vehicleTypes = ['Pickup Truck', 'Van', 'Large Truck', 'Motorcycle', 'Lorry', 'Trailer'];
const kenyanCities = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Meru', 'Machakos'];
const licenseClasses = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

export const DeliveryProviderRegistration: React.FC<DeliveryProviderRegistrationProps> = ({
  userProfile,
  onRegistrationSuccess
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState<ProviderFormData>({
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
    per_km_rate: '',
    driving_license_number: '',
    driving_license_expiry: '',
    driving_license_class: '',
    driving_license_document_path: ''
  });

  const handleVehicleTypeChange = (vehicleType: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      vehicle_types: checked
        ? [...prev.vehicle_types, vehicleType]
        : prev.vehicle_types.filter(type => type !== vehicleType)
    }));
  };

  const handleServiceAreaChange = (area: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      service_areas: checked
        ? [...prev.service_areas, area]
        : prev.service_areas.filter(a => a !== area)
    }));
  };

  const handleLicenseUpload = (path: string) => {
    setFormData(prev => ({
      ...prev,
      driving_license_document_path: path
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.provider_name || !formData.phone || !formData.driving_license_number ||
        !formData.driving_license_expiry || !formData.driving_license_class ||
        !formData.driving_license_document_path || formData.vehicle_types.length === 0) {
      toast({
        title: "Missing required fields",
        description: "Please complete all required fields including driving license information",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!userProfile?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to register as a delivery provider",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('delivery_providers')
        .insert({
          user_id: userProfile.id,
          provider_name: formData.provider_name,
          provider_type: formData.provider_type,
          contact_person: formData.contact_person || null,
          phone: formData.phone,
          email: formData.email || null,
          address: formData.address || null,
          vehicle_types: formData.vehicle_types,
          service_areas: formData.service_areas,
          capacity_kg: formData.capacity_kg ? parseFloat(formData.capacity_kg) : null,
          hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
          per_km_rate: formData.per_km_rate ? parseFloat(formData.per_km_rate) : null,
          driving_license_number: formData.driving_license_number,
          driving_license_expiry: formData.driving_license_expiry,
          driving_license_class: formData.driving_license_class,
          driving_license_document_path: formData.driving_license_document_path
        });

      if (error) throw error;

      toast({
        title: "Registration successful",
        description: "Your delivery provider application has been submitted for review"
      });
      
      setShowForm(false);
      setFormData({
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
        per_km_rate: '',
        driving_license_number: '',
        driving_license_expiry: '',
        driving_license_class: '',
        driving_license_document_path: ''
      });
      onRegistrationSuccess();
    } catch (error) {
      console.error('Error registering provider:', error);
      toast({
        title: "Registration failed",
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
          Please log in to register as a delivery provider.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Become a Delivery Provider
          </CardTitle>
          <CardDescription>
            Join our network of trusted delivery providers in Kenya
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="w-full">Apply Now</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Delivery Provider Registration</DialogTitle>
                <DialogDescription>
                  Complete this form to apply as a delivery provider
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="provider_name">Provider Name *</Label>
                    <Input
                      id="provider_name"
                      value={formData.provider_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, provider_name: e.target.value }))}
                      placeholder="Your name or company name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="provider_type">Provider Type</Label>
                    <Select value={formData.provider_type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, provider_type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Individual
                          </div>
                        </SelectItem>
                        <SelectItem value="organization">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Organization
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+254 xxx xxx xxx"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                {formData.provider_type === 'organization' && (
                  <div>
                    <Label htmlFor="contact_person">Contact Person</Label>
                    <Input
                      id="contact_person"
                      value={formData.contact_person}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                      placeholder="Primary contact person"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Your business address"
                    rows={2}
                  />
                </div>

                {/* Vehicle Types */}
                <div>
                  <Label>Vehicle Types *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {vehicleTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`vehicle-${type}`}
                          checked={formData.vehicle_types.includes(type)}
                          onCheckedChange={(checked) => handleVehicleTypeChange(type, checked as boolean)}
                        />
                        <Label htmlFor={`vehicle-${type}`} className="text-sm">{type}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Service Areas */}
                <div>
                  <Label>Service Areas</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {kenyanCities.map((city) => (
                      <div key={city} className="flex items-center space-x-2">
                        <Checkbox
                          id={`area-${city}`}
                          checked={formData.service_areas.includes(city)}
                          onCheckedChange={(checked) => handleServiceAreaChange(city, checked as boolean)}
                        />
                        <Label htmlFor={`area-${city}`} className="text-sm">{city}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rates */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="capacity_kg">Capacity (kg)</Label>
                    <Input
                      id="capacity_kg"
                      type="number"
                      value={formData.capacity_kg}
                      onChange={(e) => setFormData(prev => ({ ...prev, capacity_kg: e.target.value }))}
                      placeholder="Maximum load capacity"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hourly_rate">Hourly Rate (KES)</Label>
                    <Input
                      id="hourly_rate"
                      type="number"
                      value={formData.hourly_rate}
                      onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                      placeholder="Rate per hour"
                    />
                  </div>
                  <div>
                    <Label htmlFor="per_km_rate">Per KM Rate (KES)</Label>
                    <Input
                      id="per_km_rate"
                      type="number"
                      value={formData.per_km_rate}
                      onChange={(e) => setFormData(prev => ({ ...prev, per_km_rate: e.target.value }))}
                      placeholder="Rate per kilometer"
                    />
                  </div>
                </div>

                {/* Driving License Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Driving License Information *</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="license_number">License Number *</Label>
                      <Input
                        id="license_number"
                        value={formData.driving_license_number}
                        onChange={(e) => setFormData(prev => ({ ...prev, driving_license_number: e.target.value }))}
                        placeholder="License number"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="license_expiry">Expiry Date *</Label>
                      <Input
                        id="license_expiry"
                        type="date"
                        value={formData.driving_license_expiry}
                        onChange={(e) => setFormData(prev => ({ ...prev, driving_license_expiry: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="license_class">License Class *</Label>
                      <Select value={formData.driving_license_class} onValueChange={(value) => setFormData(prev => ({ ...prev, driving_license_class: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {licenseClasses.map((cls) => (
                            <SelectItem key={cls} value={cls}>Class {cls}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Upload Driving License *</Label>
                    <DrivingLicenseUpload 
                      onFileUploaded={handleLicenseUpload}
                      currentFilePath={formData.driving_license_document_path}
                    />
                    {formData.driving_license_document_path && (
                      <div className="mt-2">
                        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                          <Upload className="h-3 w-3" />
                          License uploaded
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryProviderRegistration;