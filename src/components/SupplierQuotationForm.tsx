import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2, Send } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const materialItemSchema = z.object({
  material_name: z.string().min(1, 'Material name is required'),
  specification: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit: z.string().min(1, 'Unit is required'),
  unit_price: z.number().min(0, 'Unit price must be positive'),
  total_price: z.number().min(0, 'Total price must be positive'),
});

const quotationFormSchema = z.object({
  // Client Information
  client_company: z.string().min(1, 'Client company is required'),
  client_contact_person: z.string().min(1, 'Contact person is required'),
  client_email: z.string().email('Valid email is required'),
  client_phone: z.string().min(1, 'Phone number is required'),
  project_name: z.string().min(1, 'Project name is required'),
  project_location: z.string().min(1, 'Project location is required'),
  
  // Material Items
  materials: z.array(materialItemSchema).min(1, 'At least one material item is required'),
  
  // Pricing & Terms
  subtotal: z.number().min(0),
  tax_percentage: z.number().min(0).max(100),
  tax_amount: z.number().min(0),
  total_amount: z.number().min(0),
  delivery_charges: z.number().min(0).optional(),
  
  // Delivery Information
  delivery_location: z.string().min(1, 'Delivery location is required'),
  estimated_delivery_days: z.number().min(1, 'Delivery days must be at least 1'),
  delivery_terms: z.string().optional(),
  
  // Payment Terms
  payment_terms: z.string().min(1, 'Payment terms are required'),
  advance_payment_percentage: z.number().min(0).max(100).optional(),
  
  // Validity & Conditions
  quote_valid_until: z.date({
    required_error: 'Quote validity date is required',
  }),
  special_conditions: z.string().optional(),
  warranty_period: z.string().optional(),
  quality_certifications: z.string().optional(),
  
  // Additional Information
  notes: z.string().optional(),
  terms_and_conditions: z.string().optional(),
});

type QuotationFormData = z.infer<typeof quotationFormSchema>;

interface SupplierQuotationFormProps {
  userProfile?: {
    id: string;
    role: string;
    company_name?: string;
  };
}

export default function SupplierQuotationForm({ userProfile }: SupplierQuotationFormProps) {
  const [loading, setLoading] = useState(false);
  const [supplierInfo, setSupplierInfo] = useState<any>(null);
  const { toast } = useToast();

  const form = useForm<QuotationFormData>({
    resolver: zodResolver(quotationFormSchema),
    defaultValues: {
      materials: [
        {
          material_name: '',
          specification: '',
          quantity: 1,
          unit: 'pieces',
          unit_price: 0,
          total_price: 0,
        }
      ],
      tax_percentage: 16, // Default VAT
      delivery_charges: 0,
      advance_payment_percentage: 30,
      estimated_delivery_days: 7,
      payment_terms: '30% advance, 70% on delivery',
    },
  });

  const materials = form.watch('materials');
  const taxPercentage = form.watch('tax_percentage');

  // Fetch supplier information
  useEffect(() => {
    const fetchSupplierInfo = async () => {
      if (!userProfile?.id) return;

      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('user_id', userProfile.id)
        .single();

      if (data) {
        setSupplierInfo(data);
      }
    };

    fetchSupplierInfo();
  }, [userProfile?.id]);

  // Calculate totals when materials or tax change
  useEffect(() => {
    const subtotal = materials.reduce((sum, item) => sum + (item.total_price || 0), 0);
    const taxAmount = (subtotal * taxPercentage) / 100;
    const deliveryCharges = form.getValues('delivery_charges') || 0;
    const total = subtotal + taxAmount + deliveryCharges;

    form.setValue('subtotal', subtotal);
    form.setValue('tax_amount', taxAmount);
    form.setValue('total_amount', total);
  }, [materials, taxPercentage, form]);

  // Update total price when quantity or unit price changes
  const updateMaterialTotal = (index: number) => {
    const material = materials[index];
    const total = (material.quantity || 0) * (material.unit_price || 0);
    form.setValue(`materials.${index}.total_price`, total);
  };

  const addMaterial = () => {
    const currentMaterials = form.getValues('materials');
    form.setValue('materials', [
      ...currentMaterials,
      {
        material_name: '',
        specification: '',
        quantity: 1,
        unit: 'pieces',
        unit_price: 0,
        total_price: 0,
      }
    ]);
  };

  const removeMaterial = (index: number) => {
    const currentMaterials = form.getValues('materials');
    if (currentMaterials.length > 1) {
      form.setValue('materials', currentMaterials.filter((_, i) => i !== index));
    }
  };

  const onSubmit = async (data: QuotationFormData) => {
    if (!supplierInfo) {
      toast({
        title: "Error",
        description: "Supplier information not found. Please complete your supplier profile first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Generate quotation number
      const quotationNumber = `QUO-${Date.now()}`;

      // Prepare quotation data
      const quotationData = {
        quotation_number: quotationNumber,
        supplier_id: supplierInfo.id,
        client_company: data.client_company,
        client_contact_person: data.client_contact_person,
        client_email: data.client_email,
        client_phone: data.client_phone,
        project_name: data.project_name,
        project_location: data.project_location,
        materials: data.materials,
        subtotal: data.subtotal,
        tax_percentage: data.tax_percentage,
        tax_amount: data.tax_amount,
        delivery_charges: data.delivery_charges || 0,
        total_amount: data.total_amount,
        delivery_location: data.delivery_location,
        estimated_delivery_days: data.estimated_delivery_days,
        delivery_terms: data.delivery_terms,
        payment_terms: data.payment_terms,
        advance_payment_percentage: data.advance_payment_percentage,
        quote_valid_until: data.quote_valid_until.toISOString().split('T')[0],
        special_conditions: data.special_conditions,
        warranty_period: data.warranty_period,
        quality_certifications: data.quality_certifications,
        notes: data.notes,
        terms_and_conditions: data.terms_and_conditions,
        status: 'sent',
        created_at: new Date().toISOString(),
      };

      // You would typically save this to a quotations table
      // For now, we'll create it as a quotation_requests with status 'quoted'
      const { error } = await supabase
        .from('quotation_requests')
        .insert({
          requester_id: userProfile!.id, // This would be the client's ID in a real scenario
          supplier_id: supplierInfo.id,
          material_name: data.materials[0].material_name,
          quantity: data.materials[0].quantity,
          unit: data.materials[0].unit,
          delivery_address: data.delivery_location,
          project_description: data.project_name,
          status: 'quoted',
          quote_amount: data.total_amount,
          quote_valid_until: data.quote_valid_until.toISOString().split('T')[0],
          supplier_notes: JSON.stringify(quotationData),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Quotation ${quotationNumber} has been created and sent successfully.`,
      });

      // Reset form
      form.reset();
      
    } catch (error) {
      console.error('Error creating quotation:', error);
      toast({
        title: "Error",
        description: "Failed to create quotation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Only show form to suppliers with company profiles
  if (!userProfile || userProfile.role !== 'supplier' || !supplierInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Restricted</CardTitle>
          <CardDescription>
            This form is only available to registered suppliers. Please complete your supplier registration first.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Professional Quotation Form
          </CardTitle>
          <CardDescription>
            Create comprehensive quotations for professional builders and companies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Client Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Client Information</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="client_company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter client company name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="client_contact_person"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter contact person name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="client_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input placeholder="client@company.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="client_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="+254 123 456 789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="project_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter project name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="project_location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Location *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter project location" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Material Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    Material Items
                    <Button type="button" onClick={addMaterial} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {materials.map((_, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="grid md:grid-cols-6 gap-4">
                          <div className="md:col-span-2">
                            <FormField
                              control={form.control}
                              name={`materials.${index}.material_name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Material Name *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., Portland Cement" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <FormField
                              control={form.control}
                              name={`materials.${index}.specification`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Specification</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., Grade 32.5, 50kg bags" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div>
                            <FormField
                              control={form.control}
                              name={`materials.${index}.quantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Quantity *</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      {...field}
                                      onChange={(e) => {
                                        field.onChange(Number(e.target.value));
                                        updateMaterialTotal(index);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div>
                            <FormField
                              control={form.control}
                              name={`materials.${index}.unit`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Unit *</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="pieces">Pieces</SelectItem>
                                      <SelectItem value="bags">Bags</SelectItem>
                                      <SelectItem value="tons">Tons</SelectItem>
                                      <SelectItem value="cubic_meters">Cubic Meters</SelectItem>
                                      <SelectItem value="square_meters">Square Meters</SelectItem>
                                      <SelectItem value="meters">Meters</SelectItem>
                                      <SelectItem value="rolls">Rolls</SelectItem>
                                      <SelectItem value="sheets">Sheets</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div>
                            <FormField
                              control={form.control}
                              name={`materials.${index}.unit_price`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Unit Price (KES) *</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      {...field}
                                      onChange={(e) => {
                                        field.onChange(Number(e.target.value));
                                        updateMaterialTotal(index);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div>
                            <FormField
                              control={form.control}
                              name={`materials.${index}.total_price`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Total (KES)</FormLabel>
                                  <FormControl>
                                    <Input {...field} readOnly className="bg-muted" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        {materials.length > 1 && (
                          <div className="flex justify-end mt-4">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeMaterial(index)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              {/* Pricing Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pricing Summary</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="delivery_charges"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Charges (KES)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tax_percentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax Percentage (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>KES {form.watch('subtotal')?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>KES {form.watch('tax_amount')?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery:</span>
                      <span>KES {form.watch('delivery_charges')?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>Total:</span>
                      <span>KES {form.watch('total_amount')?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery & Terms */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Delivery Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="delivery_location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Location *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter delivery address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="estimated_delivery_days"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Delivery (Days) *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="delivery_terms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Terms</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g., Materials will be delivered to site during working hours"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Payment & Validity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="payment_terms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Terms *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 30% advance, 70% on delivery" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="advance_payment_percentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Advance Payment (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="quote_valid_until"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Quote Valid Until *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Additional Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="warranty_period"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Warranty Period</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 12 months manufacturer warranty" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="quality_certifications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quality Certifications</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., KEBS, ISO 9001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="special_conditions"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Special Conditions</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any special conditions or requirements"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any additional information or notes"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="terms_and_conditions"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Terms and Conditions</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Standard terms and conditions"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => form.reset()}>
                  Reset Form
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create & Send Quotation'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}