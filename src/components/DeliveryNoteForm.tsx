import { useState, useEffect } from "react";
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
import { CalendarIcon, FileText, Package, Truck, User, Building2, AlertCircle, CheckCircle, Upload } from "lucide-react";
import { format } from "date-fns";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { z } from "zod";

const deliveryNoteSchema = z.object({
  // Basic Information
  deliveryNoteNumber: z.string().min(1, "Delivery note number is required"),
  purchaseOrderId: z.string().optional(),
  
  // Delivery Details
  items: z.array(z.object({
    description: z.string().min(1, "Item description is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    unit: z.string().min(1, "Unit is required"),
    deliveredQuantity: z.number().min(0, "Delivered quantity cannot be negative"),
    condition: z.enum(["good", "damaged", "incomplete"]),
    notes: z.string().optional(),
  })).min(1, "At least one item is required"),
  
  // Dispatch Information
  dispatchDate: z.date(),
  expectedDeliveryDate: z.date().optional(),
  actualDeliveryDate: z.date().optional(),
  
  // Driver & Vehicle
  driverName: z.string().min(1, "Driver name is required"),
  driverPhone: z.string().min(1, "Driver phone is required"),
  vehicleNumber: z.string().min(1, "Vehicle number is required"),
  
  // Delivery Confirmation
  deliveredTo: z.string().optional(),
  receivedBy: z.string().optional(),
  receivedAt: z.date().optional(),
  
  // Additional Information
  specialInstructions: z.string().optional(),
  remarks: z.string().optional(),
  
  // Status
  deliveryStatus: z.enum(["dispatched", "in_transit", "delivered", "partially_delivered"]),
  
  // File Upload
  attachments: z.array(z.string()).default([]),
});

type DeliveryNoteFormData = z.infer<typeof deliveryNoteSchema>;

interface DeliveryNoteFormProps {
  userProfile: {
    id: string;
    role: string;
    company_name?: string;
    full_name?: string;
    phone?: string;
  };
  onClose?: () => void;
  initialData?: Partial<DeliveryNoteFormData>;
}

export const DeliveryNoteForm = ({ 
  userProfile,
  onClose,
  initialData 
}: DeliveryNoteFormProps) => {
  const [loading, setLoading] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [selectedPO, setSelectedPO] = useState<any>(null);

  const form = useForm<DeliveryNoteFormData>({
    resolver: zodResolver(deliveryNoteSchema),
    defaultValues: {
      deliveryNoteNumber: `DN${Date.now().toString().slice(-6)}`,
      purchaseOrderId: "",
      
      items: [{
        description: "",
        quantity: 1,
        unit: "pieces",
        deliveredQuantity: 1,
        condition: "good",
        notes: "",
      }],
      
      dispatchDate: new Date(),
      expectedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      actualDeliveryDate: undefined,
      
      driverName: "",
      driverPhone: "",
      vehicleNumber: "",
      
      deliveredTo: "",
      receivedBy: "",
      receivedAt: undefined,
      
      specialInstructions: "",
      remarks: "",
      
      deliveryStatus: "dispatched",
      attachments: [],
      
      ...initialData,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  // Load purchase orders
  useEffect(() => {
    const loadPurchaseOrders = async () => {
      try {
        // Get supplier ID
        const { data: supplierData } = await supabase
          .from("suppliers")
          .select("id")
          .eq("user_id", userProfile.id)
          .maybeSingle();

        if (supplierData) {
          const { data: poData } = await supabase
            .from("purchase_orders")
            .select(`
              id, 
              po_number, 
              total_amount, 
              delivery_address, 
              items,
              profiles!buyer_id (
                full_name,
                company_name
              )
            `)
            .eq("supplier_id", supplierData.id)
            .in("status", ["confirmed", "pending"])
            .order("created_at", { ascending: false });
          
          if (poData) setPurchaseOrders(poData);
        }
      } catch (error) {
        console.error("Error loading purchase orders:", error);
      }
    };

    loadPurchaseOrders();
  }, [userProfile.id]);

  // Handle PO selection to auto-populate items
  const handlePOSelection = (poId: string) => {
    const po = purchaseOrders.find(p => p.id === poId);
    setSelectedPO(po);
    
    if (po && po.items) {
      const poItems = Array.isArray(po.items) ? po.items : [];
      form.setValue("items", poItems.map((item: any) => ({
        description: item.description || item.material_name || "",
        quantity: item.quantity || 1,
        unit: item.unit || "pieces",
        deliveredQuantity: item.quantity || 1,
        condition: "good" as const,
        notes: "",
      })));
    }
  };

  const generateDeliveryNoteNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `DN${timestamp.toString().slice(-6)}${random.toString().padStart(3, '0')}`;
  };

  const onSubmit = async (data: DeliveryNoteFormData) => {
    setLoading(true);
    try {
      // Get supplier ID
      const { data: supplierData } = await supabase
        .from("suppliers")
        .select("id")
        .eq("user_id", userProfile.id)
        .maybeSingle();

      if (!supplierData) {
        toast.error("Supplier not found. Please ensure you are registered as a supplier.");
        return;
      }

      // Prepare delivery note data
      const deliveryNoteData = {
        delivery_note_number: data.deliveryNoteNumber || generateDeliveryNoteNumber(),
        supplier_id: supplierData.id,
        purchase_order_id: data.purchaseOrderId || null,
        dispatch_date: data.dispatchDate.toISOString().split('T')[0],
        expected_delivery_date: data.expectedDeliveryDate?.toISOString().split('T')[0] || null,
        file_path: "", // Will be updated if files are uploaded
        file_name: `delivery_note_${data.deliveryNoteNumber}.json`,
        content_type: "application/json",
        file_size: 0,
        notes: data.remarks,
        
        // Store comprehensive data as JSON in a text field (if metadata field exists)
        metadata: {
          items: data.items,
          driverInfo: {
            name: data.driverName,
            phone: data.driverPhone,
            vehicleNumber: data.vehicleNumber,
          },
          deliveryInfo: {
            deliveredTo: data.deliveredTo,
            receivedBy: data.receivedBy,
            receivedAt: data.receivedAt?.toISOString(),
            actualDeliveryDate: data.actualDeliveryDate?.toISOString(),
          },
          specialInstructions: data.specialInstructions,
          deliveryStatus: data.deliveryStatus,
          attachments: data.attachments,
          createdBy: userProfile.full_name || userProfile.id,
          createdAt: new Date().toISOString(),
        }
      };

      const { error } = await supabase
        .from("delivery_notes")
        .insert(deliveryNoteData);

      if (error) throw error;

      toast.success(`Delivery Note ${data.deliveryNoteNumber} created successfully!`);
      form.reset();
      onClose?.();
    } catch (error) {
      console.error("Error creating delivery note:", error);
      toast.error("Failed to create delivery note");
    } finally {
      setLoading(false);
    }
  };

  const watchedItems = form.watch("items");
  const totalQuantity = watchedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalDelivered = watchedItems.reduce((sum, item) => sum + item.deliveredQuantity, 0);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <FileText className="h-8 w-8" />
          Delivery Note Form
        </h1>
        <p className="text-muted-foreground">
          Create and send delivery notes to builders
        </p>
        <Badge variant="secondary" className="mt-2">
          <AlertCircle className="h-3 w-3 mr-1" />
          Optional Supplier Form
        </Badge>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Delivery Note Information
              </CardTitle>
              <CardDescription>Basic delivery note details</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="deliveryNoteNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Note Number *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="purchaseOrderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Order</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handlePOSelection(value);
                      }} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select PO (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {purchaseOrders.map((po) => (
                          <SelectItem key={po.id} value={po.id}>
                            {po.po_number} - {po.profiles?.company_name || po.profiles?.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select a purchase order to auto-populate items
                    </FormDescription>
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
                Delivery Items
              </CardTitle>
              <CardDescription>Items being delivered with this note</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({
                      description: "",
                      quantity: 1,
                      unit: "pieces",
                      deliveredQuantity: 1,
                      condition: "good",
                      notes: "",
                    })}
                    className="gap-2"
                  >
                    <Package className="h-4 w-4" />
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
                          Remove
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.description`}
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Item Description *</FormLabel>
                            <FormControl>
                              <Input placeholder="Item description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ordered Qty *</FormLabel>
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
                        name={`items.${index}.deliveredQuantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivered Qty *</FormLabel>
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
                              <Input placeholder="pieces, kg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`items.${index}.condition`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Condition</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="good">Good</SelectItem>
                                <SelectItem value="damaged">Damaged</SelectItem>
                                <SelectItem value="incomplete">Incomplete</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name={`items.${index}.notes`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Item Notes</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Any specific notes for this item..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}

                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Delivery Summary</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Items:</span>
                      <div className="font-semibold">{fields.length}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Quantity:</span>
                      <div className="font-semibold">{totalQuantity}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Delivered:</span>
                      <div className="font-semibold text-green-600">{totalDelivered}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dispatch & Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Dispatch & Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dispatchDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Dispatch Date *</FormLabel>
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
                          disabled={(date) => date > new Date()}
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
                name="expectedDeliveryDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expected Delivery Date</FormLabel>
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
                name="deliveryStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="dispatched">Dispatched</SelectItem>
                        <SelectItem value="in_transit">In Transit</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="partially_delivered">Partially Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Driver & Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Driver & Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="driverName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Driver Name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="driverPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Driver Phone *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="vehicleNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="KXX 000X" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Delivery Confirmation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Delivery Confirmation
              </CardTitle>
              <CardDescription>Information about delivery receipt</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="deliveredTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivered To</FormLabel>
                    <FormControl>
                      <Input placeholder="Company or site name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="receivedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Received By</FormLabel>
                    <FormControl>
                      <Input placeholder="Person who received delivery" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="actualDeliveryDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Actual Delivery Date</FormLabel>
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
                          disabled={(date) => date > new Date()}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Additional Information */}
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
                      <Textarea placeholder="Any special delivery instructions..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional remarks or notes..." {...field} />
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
              {loading ? "Creating Delivery Note..." : "Create Delivery Note"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};