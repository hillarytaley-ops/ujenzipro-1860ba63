import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Quote } from "lucide-react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface QuotationRequestDialogProps {
  materialName: string;
  supplierName: string;
  userProfile?: {
    id: string;
    role: string;
    company_name?: string;
  };
}

interface QuotationFormData {
  quantity: number;
  unit: string;
  projectDescription: string;
  deliveryAddress: string;
  preferredDeliveryDate?: Date;
  specialRequirements?: string;
}

export const QuotationRequestDialog = ({ 
  materialName, 
  supplierName, 
  userProfile 
}: QuotationRequestDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<QuotationFormData>({
    defaultValues: {
      quantity: 1,
      unit: "pieces",
      projectDescription: "",
      deliveryAddress: "",
      specialRequirements: "",
    },
  });

  const onSubmit = async (data: QuotationFormData) => {
    if (!userProfile) {
      toast.error("Please log in to request quotations");
      return;
    }

    setLoading(true);
    try {
      // First get the supplier ID based on company name
      const { data: supplier } = await supabase
        .from("suppliers")
        .select("id")
        .eq("company_name", supplierName)
        .single();

      if (!supplier) {
        toast.error("Supplier not found");
        return;
      }

      const { error } = await supabase
        .from("quotation_requests")
        .insert({
          requester_id: userProfile.id,
          supplier_id: supplier.id,
          material_name: materialName,
          quantity: data.quantity,
          unit: data.unit,
          project_description: data.projectDescription,
          delivery_address: data.deliveryAddress,
          preferred_delivery_date: data.preferredDeliveryDate?.toISOString().split('T')[0],
          special_requirements: data.specialRequirements,
        });

      if (error) throw error;

      toast.success("Quotation request sent successfully!");
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error sending quotation request:", error);
      toast.error("Failed to send quotation request");
    } finally {
      setLoading(false);
    }
  };

  const isProfessional = userProfile?.role === 'builder' || userProfile?.company_name;

  if (!isProfessional) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Quote className="h-4 w-4" />
          Request Quote
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Request Quotation</DialogTitle>
          <DialogDescription>
            Send a quotation request for <strong>{materialName}</strong> from <strong>{supplierName}</strong>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
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
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <FormControl>
                      <Input placeholder="pieces, kg, sqm, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="projectDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of your construction project..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Help the supplier understand your project context
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deliveryAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Complete delivery address..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferredDeliveryDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Preferred Delivery Date (Optional)</FormLabel>
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
                        disabled={(date) =>
                          date < new Date()
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specialRequirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Requirements (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any special delivery instructions or quality requirements..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Request"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};