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
import { CalendarIcon, Truck, Package, MapPin, Clock, User, Phone, FileText, AlertCircle, Camera } from "lucide-react";
import { format } from "date-fns";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { z } from "zod";

const deliveryFormSchema = z.object({
  // Delivery Information
  trackingNumber: z.string().optional(),
  purchaseOrderNumber: z.string().optional(),
  
  // Material Details
  items: z.array(z.object({
    materialType: z.string().min(1, "Material type is required"),
    description: z.string().optional(),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    unit: z.string().min(1, "Unit is required"),
    batchNumber: z.string().optional(),
    manufacturer: z.string().optional(),
    grade: z.string().optional(),
    weight: z.number().optional(),
  })).min(1, "At least one item is required"),
  
  // Pickup Information
  pickupAddress: z.string().min(1, "Pickup address is required"),
  pickupDate: z.date(),
  pickupTime: z.string().optional(),
  pickupContact: z.string().optional(),
  pickupPhone: z.string().optional(),
  
  // Delivery Information
  deliveryAddress: z.string().min(1, "Delivery address is required"),
  estimatedDeliveryDate: z.date(),
  estimatedDeliveryTime: z.string().optional(),
  deliveryContact: z.string().optional(),
  deliveryPhone: z.string().optional(),
  specialInstructions: z.string().optional(),
  
  // Driver & Vehicle Information
  driverName: z.string().min(1, "Driver name is required"),
  driverPhone: z.string().min(1, "Driver phone is required"),
  driverLicense: z.string().optional(),
  vehicleType: z.string().min(1, "Vehicle type is required"),
  vehicleNumber: z.string().min(1, "Vehicle number is required"),
  vehicleCapacity: z.string().optional(),
  
  // Customer Information
  customerCompany: z.string().optional(),
  customerContact: z.string().optional(),
  customerPhone: z.string().optional(),
  projectName: z.string().optional(),
  projectId: z.string().optional(),
  
  // Delivery Conditions
  weatherConditions: z.string().optional(),
  roadConditions: z.string().optional(),
  accessConditions: z.string().optional(),
  unloadingEquipment: z.string().optional(),
  
  // Quality & Safety
  materialCondition: z.enum(["excellent", "good", "fair", "poor"]),
  packagingCondition: z.enum(["intact", "minor_damage", "damaged"]),
  safetyMeasures: z.array(z.string()).default([]),
  hazardousMaterials: z.boolean().default(false),
  msdsProvided: z.boolean().default(false),
  
  // Documentation
  deliveryNoteNumber: z.string().optional(),
  invoiceNumber: z.string().optional(),
  certificationDocuments: z.array(z.string()).default([]),
  photos: z.array(z.string()).default([]),
  
  // Signatures & Confirmation
  supplierRepresentative: z.string().min(1, "Supplier representative is required"),
  supplierSignature: z.string().optional(),
  receiverName: z.string().optional(),
  receiverSignature: z.string().optional(),
  deliveryConfirmed: z.boolean().default(false),
  
  // Additional Notes
  internalNotes: z.string().optional(),
  customerNotes: z.string().optional(),
  issuesEncountered: z.string().optional(),
  returnItems: z.string().optional(),
});

type SupplierDeliveryFormData = z.infer<typeof deliveryFormSchema>;

interface SupplierDeliveryFormProps {
  userProfile: {
    id: string;
    role: string;
    company_name?: string;
    full_name?: string;
    phone?: string;
  };
  onClose?: () => void;
  initialData?: Partial<SupplierDeliveryFormData>;
}

export const SupplierDeliveryForm = ({ 
  userProfile,
  onClose,
  initialData 
}: SupplierDeliveryFormProps) => {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);

  const form = useForm<SupplierDeliveryFormData>({
    resolver: zodResolver(deliveryFormSchema),
    defaultValues: {
      trackingNumber: "",
      purchaseOrderNumber: "",
      
      items: [{
        materialType: "",
        description: "",
        quantity: 1,
        unit: "pieces",
        batchNumber: "",
        manufacturer: "",
        grade: "",
        weight: 0,
      }],
      
      pickupAddress: "",
      pickupDate: new Date(),
      pickupTime: "",
      pickupContact: userProfile.full_name || "",
      pickupPhone: userProfile.phone || "",
      
      deliveryAddress: "",
      estimatedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      estimatedDeliveryTime: "",
      deliveryContact: "",
      deliveryPhone: "",
      specialInstructions: "",
      
      driverName: "",
      driverPhone: "",
      driverLicense: "",
      vehicleType: "truck",
      vehicleNumber: "",
      vehicleCapacity: "",
      
      customerCompany: "",
      customerContact: "",
      customerPhone: "",
      projectName: "",
      projectId: "",
      
      weatherConditions: "clear",
      roadConditions: "good",
      accessConditions: "normal",
      unloadingEquipment: "",
      
      materialCondition: "excellent",
      packagingCondition: "intact",
      safetyMeasures: [],
      hazardousMaterials: false,
      msdsProvided: false,
      
      deliveryNoteNumber: "",
      invoiceNumber: "",
      certificationDocuments: [],
      photos: [],
      
      supplierRepresentative: userProfile.full_name || "",
      supplierSignature: "",
      receiverName: "",
      receiverSignature: "",
      deliveryConfirmed: false,
      
      internalNotes: "",
      customerNotes: "",
      issuesEncountered: "",
      returnItems: "",
      
      ...initialData,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  const watchedItems = form.watch("items");
  const totalWeight = watchedItems.reduce((sum, item) => sum + (item.weight || 0), 0);

  // Load projects and purchase orders
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load projects
        const { data: projectsData } = await supabase
          .from("projects")
          .select("id, name, location, builder_id")
          .order("name");
        
        if (projectsData) setProjects(projectsData);

        // Load purchase orders for this supplier
        const { data: supplierData } = await supabase
          .from("suppliers")
          .select("id")
          .eq("user_id", userProfile.id)
          .maybeSingle();

        if (supplierData) {
          const { data: poData } = await supabase
            .from("purchase_orders")
            .select("id, po_number, total_amount, delivery_address, items")
            .eq("supplier_id", supplierData.id)
            .eq("status", "confirmed")
            .order("created_at", { ascending: false });
          
          if (poData) setPurchaseOrders(poData);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, [userProfile.id]);

  const generateTrackingNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `DL${timestamp.toString().slice(-6)}${random.toString().padStart(3, '0')}`;
  };

  const onSubmit = async (data: SupplierDeliveryFormData) => {
    setLoading(true);
    try {
      // Generate tracking number if not provided
      const trackingNumber = data.trackingNumber || generateTrackingNumber();

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

      // Prepare delivery data
      const deliveryData = {
        tracking_number: trackingNumber,
        supplier_id: supplierData.id,
        project_id: data.projectId || null,
        material_type: data.items[0]?.materialType || "Mixed Materials",
        quantity: data.items.reduce((sum, item) => sum + item.quantity, 0),
        weight_kg: totalWeight,
        pickup_address: data.pickupAddress,
        delivery_address: data.deliveryAddress,
        pickup_date: data.pickupDate.toISOString().split('T')[0],
        delivery_date: data.estimatedDeliveryDate.toISOString().split('T')[0],
        estimated_delivery_time: data.estimatedDeliveryDate.toISOString(),
        driver_name: data.driverName,
        driver_phone: data.driverPhone,
        vehicle_details: `${data.vehicleType} - ${data.vehicleNumber}`,
        notes: data.specialInstructions,
        status: "pending",
        
        // Store comprehensive data in metadata field (if available)
        metadata: {
          items: data.items,
          pickupInfo: {
            time: data.pickupTime,
            contact: data.pickupContact,
            phone: data.pickupPhone,
          },
          deliveryInfo: {
            time: data.estimatedDeliveryTime,
            contact: data.deliveryContact,
            phone: data.deliveryPhone,
          },
          vehicleInfo: {
            license: data.driverLicense,
            capacity: data.vehicleCapacity,
          },
          customerInfo: {
            company: data.customerCompany,
            contact: data.customerContact,
            phone: data.customerPhone,
          },
          conditions: {
            weather: data.weatherConditions,
            road: data.roadConditions,
            access: data.accessConditions,
            unloadingEquipment: data.unloadingEquipment,
          },
          quality: {
            materialCondition: data.materialCondition,
            packagingCondition: data.packagingCondition,
            safetyMeasures: data.safetyMeasures,
            hazardousMaterials: data.hazardousMaterials,
            msdsProvided: data.msdsProvided,
          },
          documentation: {
            deliveryNoteNumber: data.deliveryNoteNumber,
            invoiceNumber: data.invoiceNumber,
            certificationDocuments: data.certificationDocuments,
            photos: data.photos,
          },
          signatures: {
            supplierRep: data.supplierRepresentative,
            receiver: data.receiverName,
            confirmed: data.deliveryConfirmed,
          },
          notes: {
            internal: data.internalNotes,
            customer: data.customerNotes,
            issues: data.issuesEncountered,
            returns: data.returnItems,
          },
          purchaseOrderNumber: data.purchaseOrderNumber,
        }
      };

      const { error } = await supabase
        .from("deliveries")
        .insert(deliveryData);

      if (error) throw error;

      toast.success(`Delivery form submitted successfully! Tracking: ${trackingNumber}`);
      form.reset();
      onClose?.();
    } catch (error) {
      console.error("Error submitting delivery form:", error);
      toast.error("Failed to submit delivery form");
    } finally {
      setLoading(false);
    }
  };

  const safetyMeasuresOptions = [
    "PPE Required",
    "Safety Barriers",
    "Traffic Management",
    "Crane Operation",
    "Confined Space",
    "Height Work",
    "Heavy Lifting",
    "Chemical Handling"
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Truck className="h-8 w-8" />
          Supplier Delivery Form
        </h1>
        <p className="text-muted-foreground">
          Comprehensive delivery documentation for suppliers
        </p>
        <Badge variant="secondary" className="mt-2">
          <AlertCircle className="h-3 w-3 mr-1" />
          Optional Professional Form
        </Badge>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Basic Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Delivery Information
              </CardTitle>
              <CardDescription>Basic delivery and order details</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="trackingNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tracking Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Auto-generated if empty" {...field} />
                    </FormControl>
                    <FormDescription>Leave empty for auto-generation</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="purchaseOrderNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Order Number</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select PO (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {purchaseOrders.map((po) => (
                          <SelectItem key={po.id} value={po.po_number}>
                            {po.po_number} - KSh {po.total_amount.toLocaleString()}
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
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name} - {project.location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Material Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Material Items
              </CardTitle>
              <CardDescription>Detailed list of materials being delivered</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({
                      materialType: "",
                      description: "",
                      quantity: 1,
                      unit: "pieces",
                      batchNumber: "",
                      manufacturer: "",
                      grade: "",
                      weight: 0,
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.materialType`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Material Type *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Cement, Steel bars" {...field} />
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
                              <Input placeholder="pieces, kg, m3" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.description`}
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Detailed description..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`items.${index}.weight`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight (kg)</FormLabel>
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
                        name={`items.${index}.batchNumber`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Batch Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.manufacturer`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Manufacturer</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`items.${index}.grade`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Grade/Quality</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Grade 30, Class A" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}

                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Summary</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span>Total Items:</span>
                    <span className="text-right">{watchedItems.length}</span>
                    
                    <span>Total Quantity:</span>
                    <span className="text-right">{watchedItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                    
                    <span>Total Weight:</span>
                    <span className="text-right">{totalWeight.toLocaleString()} kg</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pickup Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Pickup Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pickupAddress"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Pickup Address *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Complete pickup address..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="pickupDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Pickup Date *</FormLabel>
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
                          disabled={(date) => date < new Date("1900-01-01")}
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
                name="pickupTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pickup Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="pickupContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pickup Contact Person</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="pickupPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pickup Contact Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                name="estimatedDeliveryDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Estimated Delivery Date *</FormLabel>
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
                name="estimatedDeliveryTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Delivery Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
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
                name="specialInstructions"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Special Delivery Instructions</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Access details, timing preferences, unloading requirements..." {...field} />
                    </FormControl>
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
                name="driverLicense"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Driver License Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="vehicleType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="truck">Truck</SelectItem>
                        <SelectItem value="lorry">Lorry</SelectItem>
                        <SelectItem value="trailer">Trailer</SelectItem>
                        <SelectItem value="pickup">Pickup</SelectItem>
                        <SelectItem value="van">Van</SelectItem>
                        <SelectItem value="flatbed">Flatbed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="vehicleNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Registration *</FormLabel>
                    <FormControl>
                      <Input placeholder="KXX 000X" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="vehicleCapacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Capacity</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 10 tons" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Quality & Safety */}
          <Card>
            <CardHeader>
              <CardTitle>Quality & Safety Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="materialCondition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material Condition</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="packagingCondition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Packaging Condition</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="intact">Intact</SelectItem>
                          <SelectItem value="minor_damage">Minor Damage</SelectItem>
                          <SelectItem value="damaged">Damaged</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="hazardousMaterials"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Hazardous Materials</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="msdsProvided"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>MSDS Provided</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div>
                <FormLabel className="text-base font-medium">Safety Measures Required</FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {safetyMeasuresOptions.map((measure) => (
                    <FormField
                      key={measure}
                      control={form.control}
                      name="safetyMeasures"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(measure) || false}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...(field.value || []), measure]);
                                } else {
                                  field.onChange(field.value?.filter(m => m !== measure) || []);
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            {measure}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documentation & Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Documentation & Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="deliveryNoteNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Note Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="supplierRepresentative"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Representative *</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Textarea placeholder="Internal notes (not shared with customer)..." {...field} />
                    </FormControl>
                    <FormDescription>
                      These notes are for internal use only
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="customerNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Notes for the customer..." {...field} />
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
              {loading ? "Submitting Delivery Form..." : "Submit Delivery Form"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};