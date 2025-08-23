import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { Builder, Project } from '@/hooks/useDeliveryData';

interface DeliveryFormProps {
  onSubmit: (data: any) => Promise<boolean>;
  builders: Builder[];
  projects: Project[];
}

export const DeliveryForm: React.FC<DeliveryFormProps> = ({
  onSubmit,
  builders,
  projects
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    material_type: '',
    quantity: '',
    weight_kg: '',
    pickup_address: '',
    delivery_address: '',
    builder_id: '',
    project_id: '',
    estimated_delivery: '',
    driver_name: '',
    driver_phone: '',
    vehicle_number: '',
    special_instructions: ''
  });

  const handleSubmit = async () => {
    const success = await onSubmit(formData);
    if (success) {
      setIsOpen(false);
      setFormData({
        material_type: '',
        quantity: '',
        weight_kg: '',
        pickup_address: '',
        delivery_address: '',
        builder_id: '',
        project_id: '',
        estimated_delivery: '',
        driver_name: '',
        driver_phone: '',
        vehicle_number: '',
        special_instructions: ''
      });
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Create Delivery
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Delivery</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="material_type">Material Type</Label>
            <Input
              id="material_type"
              value={formData.material_type}
              onChange={(e) => updateField('material_type', e.target.value)}
              placeholder="e.g., Concrete, Steel, Lumber"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => updateField('quantity', e.target.value)}
              placeholder="Number of units"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="weight_kg">Weight (kg)</Label>
            <Input
              id="weight_kg"
              type="number"
              step="0.1"
              value={formData.weight_kg}
              onChange={(e) => updateField('weight_kg', e.target.value)}
              placeholder="Total weight"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="project_id">Assign to Project (Optional)</Label>
            <Select value={formData.project_id} onValueChange={(value) => updateField('project_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No project assigned</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="builder_id">Assign to Builder (Optional)</Label>
            <Select value={formData.builder_id} onValueChange={(value) => updateField('builder_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a builder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No builder assigned</SelectItem>
                {builders.map((builder) => (
                  <SelectItem key={builder.id} value={builder.id}>
                    {builder.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="estimated_delivery">Estimated Delivery</Label>
            <Input
              id="estimated_delivery"
              type="datetime-local"
              value={formData.estimated_delivery}
              onChange={(e) => updateField('estimated_delivery', e.target.value)}
            />
          </div>
          
          <div className="col-span-2 space-y-2">
            <Label htmlFor="pickup_address">Pickup Address</Label>
            <Textarea
              id="pickup_address"
              value={formData.pickup_address}
              onChange={(e) => updateField('pickup_address', e.target.value)}
              placeholder="Full pickup address"
            />
          </div>
          
          <div className="col-span-2 space-y-2">
            <Label htmlFor="delivery_address">Delivery Address</Label>
            <Textarea
              id="delivery_address"
              value={formData.delivery_address}
              onChange={(e) => updateField('delivery_address', e.target.value)}
              placeholder="Full delivery address"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="driver_name">Driver Name</Label>
            <Input
              id="driver_name"
              value={formData.driver_name}
              onChange={(e) => updateField('driver_name', e.target.value)}
              placeholder="Driver's name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="driver_phone">Driver Phone</Label>
            <Input
              id="driver_phone"
              value={formData.driver_phone}
              onChange={(e) => updateField('driver_phone', e.target.value)}
              placeholder="Driver's phone number"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vehicle_number">Vehicle Number</Label>
            <Input
              id="vehicle_number"
              value={formData.vehicle_number}
              onChange={(e) => updateField('vehicle_number', e.target.value)}
              placeholder="Vehicle registration number"
            />
          </div>
          
          <div className="col-span-2 space-y-2">
            <Label htmlFor="special_instructions">Special Instructions</Label>
            <Textarea
              id="special_instructions"
              value={formData.special_instructions}
              onChange={(e) => updateField('special_instructions', e.target.value)}
              placeholder="Any special delivery instructions"
            />
          </div>
        </div>
        
        <Button onClick={handleSubmit} className="w-full">
          Create Delivery
        </Button>
      </DialogContent>
    </Dialog>
  );
};