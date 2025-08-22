import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, FileText, Plus, Trash2, Building2, User, Package, Truck, CreditCard, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { z } from "zod";

const comprehensivePOSchema = z.object({
  // Company Information
  buyerCompanyName: z.string().min(1, "Company name is required"),
  buyerAddress: z.string().min(1, "Company address is required"),
  buyerPhone: z.string().min(1, "Phone number is required"),
  buyerEmail: z.string().email("Valid email is required"),
  buyerContactPerson: z.string().min(1, "Contact person is required"),
  buyerVATNumber: z.string().optional(),
  
  // Supplier Information
  supplierCompanyName: z.string().min(1, "Supplier company name is required"),
  supplierAddress: z.string().optional(),
  supplierPhone: z.string().optional(),
  supplierEmail: z.string().optional(),
  
  // Project Information
  projectName: z.string().optional(),
  projectLocation: z.string().optional(),
  projectReference: z.string().optional(),
  
  // Order Details
  priority: z.enum(["standard", "urgent", "rush"]),
  orderType: z.enum(["materials", "services", "equipment", "mixed"]),
  currency: z.string().default("KSh"),
  
  // Items
  items: z.array(z.object({
    itemCode: z.string().optional(),
    description: z.string().min(1, "Description is required"),
    specification: z.string().optional(),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    unit: z.string().min(1, "Unit is required"),
    unitPrice: z.number().min(0, "Price must be non-negative"),
    discount: z.number().min(0).max(100).default(0),
    taxRate: z.number().min(0).max(100).default(16), // VAT rate
  })).min(1, "At least one item is required"),
  
  // Delivery Information
  deliveryAddress: z.string().min(1, "Delivery address is required"),
  deliveryDate: z.date(),
  deliveryInstructions: z.string().optional(),
  deliveryContact: z.string().optional(),
  deliveryPhone: z.string().optional(),
  
  // Payment Terms
  paymentTerms: z.string().min(1, "Payment terms are required"),
  paymentMethod: z.enum(["bank_transfer", "cheque", "cash", "mobile_money", "credit"]),
  creditDays: z.number().optional(),
  
  // Terms & Conditions
  warranty: z.string().optional(),
  qualityStandards: z.string().optional(),
  penaltyClause: z.string().optional(),
  forcemajeure: z.boolean().default(true),
  disputeResolution: z.string().optional(),
  
  // Special Instructions
  specialInstructions: z.string().optional(),
  internalNotes: z.string().optional(),
  
  // Authorization
  authorizedBy: z.string().min(1, "Authorization is required"),
  authorizedTitle: z.string().min(1, "Title is required"),
});

type ComprehensivePOFormData = z.infer<typeof comprehensivePOSchema>;

interface ComprehensivePurchaseOrderFormProps {
  userProfile: {
    id: string;
    role: string;
    company_name?: string;
    full_name?: string;
    phone?: string;
  };
  onClose?: () => void;
}

export const ComprehensivePurchaseOrderForm = ({ 
  userProfile,
  onClose 
}: ComprehensivePurchaseOrderFormProps) => {
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  const form = useForm<ComprehensivePOFormData>({
    resolver: zodResolver(comprehensivePOSchema),
    defaultValues: {
      buyerCompanyName: userProfile.company_name || "",
      buyerAddress: "",
      buyerPhone: userProfile.phone || "",
      buyerEmail: "",
      buyerContactPerson: userProfile.full_name || "",
      buyerVATNumber: "",
      
      supplierCompanyName: "",
      supplierAddress: "",
      supplierPhone: "",
      supplierEmail: "",
      
      projectName: "",
      projectLocation: "",
      projectReference: "",
      
      priority: "standard",
      orderType: "materials",
      currency: "KSh",
      
      items: [{
        itemCode: "",
        description: "",
        specification: "",
        quantity: 1,
        unit: "pieces",
        unitPrice: 0,
        discount: 0,
        taxRate: 16,
      }],
      
      deliveryAddress: "",
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      deliveryInstructions: "",
      deliveryContact: userProfile.full_name || "",
      deliveryPhone: userProfile.phone || "",
      
      paymentTerms: "Net 30 days",
      paymentMethod: "bank_transfer",
      creditDays: 30,
      
      warranty: "As per manufacturer specifications",
      qualityStandards: "Materials must meet industry standards",
      penaltyClause: "1% per day for late delivery",
      forcemajeure: true,
      disputeResolution: "Arbitration as per local laws",
      
      specialInstructions: "",
      internalNotes: "",
      
      authorizedBy: userProfile.full_name || "",
      authorizedTitle: "Project Manager",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  const watchedItems = form.watch("items");
  
  const calculateItemTotal = (item: any) => {
    const subtotal = item.quantity * item.unitPrice;
    const afterDiscount = subtotal * (1 - item.discount / 100);
    const tax = afterDiscount * (item.taxRate / 100);
    return afterDiscount + tax;
  };

  const subtotal = watchedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const totalDiscount = watchedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.discount / 100), 0);
  const totalTax = watchedItems.reduce((sum, item) => {
    const afterDiscount = (item.quantity * item.unitPrice) * (1 - item.discount / 100);
    return sum + (afterDiscount * item.taxRate / 100);
  }, 0);
  const grandTotal = subtotal - totalDiscount + totalTax;

  const onSubmit = async (data: ComprehensivePOFormData) => {
    setLoading(true);
    try {
      // Get supplier ID
      const { data: supplier } = await supabase
        .from("suppliers")
        .select("id")
        .eq("company_name", data.supplierCompanyName)
        .maybeSingle();

      if (!supplier) {
        toast.error("Supplier not found. Please ensure the supplier is registered in the system.");
        return;
      }

      // Prepare comprehensive order data
      const comprehensiveOrderData = {
        buyer_id: userProfile.id,
        supplier_id: supplier.id,
        total_amount: grandTotal,
        delivery_address: data.deliveryAddress,
        delivery_date: data.deliveryDate.toISOString().split('T')[0],
        payment_terms: data.paymentTerms,
        special_instructions: data.specialInstructions,
        items: data.items.map(item => ({
          ...item,
          total: calculateItemTotal(item)
        })),
        po_number: "", // Will be auto-generated
        
        // Additional comprehensive data stored in a metadata field (if available)
        metadata: {
          buyerInfo: {
            companyName: data.buyerCompanyName,
            address: data.buyerAddress,
            phone: data.buyerPhone,
            email: data.buyerEmail,
            contactPerson: data.buyerContactPerson,
            vatNumber: data.buyerVATNumber,
          },
          supplierInfo: {
            address: data.supplierAddress,
            phone: data.supplierPhone,
            email: data.supplierEmail,
          },
          projectInfo: {
            name: data.projectName,
            location: data.projectLocation,
            reference: data.projectReference,
          },
          orderDetails: {
            priority: data.priority,
            orderType: data.orderType,
            currency: data.currency,
          },
          deliveryInfo: {
            instructions: data.deliveryInstructions,
            contact: data.deliveryContact,
            phone: data.deliveryPhone,
          },
          paymentInfo: {
            method: data.paymentMethod,
            creditDays: data.creditDays,
          },
          terms: {
            warranty: data.warranty,
            qualityStandards: data.qualityStandards,
            penaltyClause: data.penaltyClause,
            forcemajeure: data.forcemajeure,
            disputeResolution: data.disputeResolution,
          },
          authorization: {
            authorizedBy: data.authorizedBy,
            authorizedTitle: data.authorizedTitle,
          },
          totals: {
            subtotal,
            totalDiscount,
            totalTax,
            grandTotal,
          }
        }
      };

      const { error } = await supabase
        .from("purchase_orders")
        .insert(comprehensiveOrderData);

      if (error) throw error;

      toast.success("Comprehensive Purchase Order created successfully!");
      form.reset();
      onClose?.();
    } catch (error) {
      console.error("Error creating purchase order:", error);
      toast.error("Failed to create purchase order");
    } finally {
      setLoading(false);
    }
  };

  // Load suppliers for dropdown
  const loadSuppliers = async () => {
    const { data } = await supabase
      .from("suppliers")
      .select("id, company_name, contact_person, phone, email, address")
      .order("company_name");
    
    if (data) setSuppliers(data);
  };

  useState(() => {
    loadSuppliers();
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <FileText className="h-8 w-8" />
          Comprehensive Purchase Order Form
        </h1>
        <p className="text-muted-foreground">
          Professional purchase order for builders and construction companies
        </p>
        <Badge variant="secondary" className="mt-2">
          <AlertCircle className="h-3 w-3 mr-1" />
          Optional Enhanced Form
        </Badge>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Buyer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Buyer Information
              </CardTitle>
              <CardDescription>Your company details</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="buyerCompanyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="buyerContactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="buyerAddress"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Company Address *</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="buyerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="buyerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="buyerVATNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VAT/PIN Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Supplier Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Supplier Information
              </CardTitle>
              <CardDescription>Details of the supplier</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="supplierCompanyName"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Supplier Company Name *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.company_name}>
                            {supplier.company_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="supplierAddress"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Supplier Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="supplierPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="supplierEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Project Information */}
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
              <CardDescription>Details about the project (if applicable)</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="projectName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="projectLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Location</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="projectReference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Reference</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="rush">Rush</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="orderType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="materials">Materials</SelectItem>
                        <SelectItem value="services">Services</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Items Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
              <CardDescription>Detailed list of items to be ordered</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({
                      itemCode: "",
                      description: "",
                      specification: "",
                      quantity: 1,
                      unit: "pieces",
                      unitPrice: 0,
                      discount: 0,
                      taxRate: 16,
                    })}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Item {index + 1}</h4>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.itemCode`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Item Code</FormLabel>
                            <FormControl>
                              <Input placeholder="SKU/Code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`items.${index}.description`}
                        render={({ field }) => (
                          <FormItem className="md:col-span-3">
                            <FormLabel>Description *</FormLabel>
                            <FormControl>
                              <Input placeholder="Item description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name={`items.${index}.specification`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specifications</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Technical specifications, grade, quality requirements..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity *</FormLabel>
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
                        name={`items.${index}.unit`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit *</FormLabel>
                            <FormControl>
                              <Input placeholder="pieces, kg, m2" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`items.${index}.unitPrice`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit Price *</FormLabel>
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
                        name={`items.${index}.discount`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount %</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="100"
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
                        name={`items.${index}.taxRate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tax %</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex items-end">
                        <div className="text-sm">
                          <span className="font-medium">Total: </span>
                          <span className="text-primary">
                            {form.watch("currency")} {calculateItemTotal(watchedItems[index]).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <Separator />
                
                {/* Order Summary */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium">Order Summary</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span>Subtotal:</span>
                    <span className="text-right">{form.watch("currency")} {subtotal.toLocaleString()}</span>
                    
                    <span>Total Discount:</span>
                    <span className="text-right text-red-600">-{form.watch("currency")} {totalDiscount.toLocaleString()}</span>
                    
                    <span>Total Tax:</span>
                    <span className="text-right">{form.watch("currency")} {totalTax.toLocaleString()}</span>
                    
                    <Separator className="col-span-2" />
                    
                    <span className="font-semibold">Grand Total:</span>
                    <span className="text-right font-semibold text-primary">
                      {form.watch("currency")} {grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="deliveryAddress"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Delivery Address *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Complete delivery address..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="deliveryDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Required Delivery Date *</FormLabel>
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
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="deliveryContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Contact Person</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="deliveryPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Contact Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="deliveryInstructions"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Delivery Instructions</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Special delivery instructions, access details, timing preferences..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Payment Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="paymentTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Terms *</FormLabel>
                    <FormControl>
                      <Input placeholder="Net 30, COD, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="mobile_money">Mobile Money</SelectItem>
                        <SelectItem value="credit">Credit</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="creditDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credit Days</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="30"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Terms & Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Terms & Conditions</CardTitle>
              <CardDescription>Contract terms and conditions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="warranty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warranty Terms</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Warranty conditions and duration..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="qualityStandards"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quality Standards</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Quality requirements and standards..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="penaltyClause"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Penalty Clause</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Penalties for late delivery or non-compliance..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="disputeResolution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dispute Resolution</FormLabel>
                    <FormControl>
                      <Textarea placeholder="How disputes will be resolved..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="forcemajeure"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Include Force Majeure Clause
                      </FormLabel>
                      <FormDescription>
                        Protects both parties from liability due to extraordinary circumstances
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Special Instructions & Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="specialInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Instructions</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any special instructions for the supplier..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="internalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Internal Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Internal notes (not shared with supplier)..." {...field} />
                    </FormControl>
                    <FormDescription>
                      These notes are for internal use only and will not be shared with the supplier
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Authorization */}
          <Card>
            <CardHeader>
              <CardTitle>Authorization</CardTitle>
              <CardDescription>Authorized signatory information</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="authorizedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Authorized By *</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name of authorized person" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="authorizedTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title/Position *</FormLabel>
                    <FormControl>
                      <Input placeholder="Job title or position" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[200px]">
              {loading ? "Creating Purchase Order..." : "Create Purchase Order"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};