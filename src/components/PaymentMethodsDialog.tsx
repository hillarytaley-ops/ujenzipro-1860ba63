import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Building, Smartphone, Banknote, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PaymentMethodsDialogProps {
  purchaseOrderId: string;
  totalAmount: number;
  supplierName: string;
  userProfile: {
    id: string;
    role: string;
    company_name?: string;
    full_name?: string;
  };
}

interface PaymentFormData {
  paymentMethod: string;
  paymentTerms: string;
  mpesaNumber?: string;
  bankAccount?: string;
  bankName?: string;
  swiftCode?: string;
  escrowDays?: number;
  checkNumber?: string;
  paymentNotes?: string;
}

const kenyanPaymentMethods = [
  {
    id: "mpesa",
    name: "M-Pesa",
    description: "Mobile money transfer - Most popular in Kenya",
    icon: Smartphone,
    processingTime: "Instant",
    features: ["Instant transfer", "Mobile receipts", "Transaction tracking"]
  },
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    description: "Direct bank to bank transfer",
    icon: Building,
    processingTime: "1-3 business days",
    features: ["Secure transfer", "Bank records", "Bulk payments"]
  },
  {
    id: "escrow",
    name: "Escrow Service",
    description: "Third-party held funds until delivery confirmation",
    icon: Clock,
    processingTime: "Release after inspection",
    features: ["Buyer protection", "Quality assurance", "Dispute resolution"]
  },
  {
    id: "check",
    name: "Company Check",
    description: "Traditional business check payment",
    icon: CreditCard,
    processingTime: "5-7 business days",
    features: ["Paper trail", "Formal record", "Professional image"]
  },
  {
    id: "cash_on_delivery",
    name: "Cash on Delivery",
    description: "Payment upon receipt and inspection",
    icon: Banknote,
    processingTime: "Immediate on delivery",
    features: ["Inspect before paying", "No advance payment", "Risk reduction"]
  }
];

export const PaymentMethodsDialog = ({
  purchaseOrderId,
  totalAmount,
  supplierName,
  userProfile
}: PaymentMethodsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("");

  const form = useForm<PaymentFormData>({
    defaultValues: {
      paymentMethod: "",
      paymentTerms: "net_30",
      mpesaNumber: "",
      bankAccount: "",
      bankName: "",
      swiftCode: "",
      escrowDays: 7,
      checkNumber: "",
      paymentNotes: ""
    },
  });

  const onSubmit = async (data: PaymentFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("purchase_orders")
        .update({
          payment_terms: `${data.paymentTerms} - ${data.paymentMethod}`,
          special_instructions: `Payment Method: ${data.paymentMethod}\n${data.paymentNotes || ''}`
        })
        .eq("id", purchaseOrderId);

      if (error) throw error;

      toast.success("Payment method set successfully!");
      setOpen(false);
    } catch (error) {
      console.error("Error setting payment method:", error);
      toast.error("Failed to set payment method");
    } finally {
      setLoading(false);
    }
  };

  const getMethodDetails = (methodId: string) => {
    return kenyanPaymentMethods.find(method => method.id === methodId);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <CreditCard className="h-4 w-4" />
          Set Payment Method
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payment Methods for Construction Industry</DialogTitle>
          <DialogDescription>
            Choose your preferred payment method for <strong>{supplierName}</strong> - 
            Amount: <span className="text-green-600 font-semibold">KSh {totalAmount.toLocaleString()}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Payment Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {kenyanPaymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethod === method.id;
            
            return (
              <Card 
                key={method.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => {
                  setSelectedMethod(method.id);
                  form.setValue("paymentMethod", method.id);
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Icon className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle className="text-base">{method.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {method.processingTime}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="mb-3">
                    {method.description}
                  </CardDescription>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {method.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-primary rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {selectedMethod && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {getMethodDetails(selectedMethod)?.name} Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="paymentTerms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Terms</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment terms" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="net_7">Net 7 days</SelectItem>
                            <SelectItem value="net_15">Net 15 days</SelectItem>
                            <SelectItem value="net_30">Net 30 days</SelectItem>
                            <SelectItem value="net_45">Net 45 days</SelectItem>
                            <SelectItem value="net_60">Net 60 days</SelectItem>
                            <SelectItem value="cod">Cash on Delivery</SelectItem>
                            <SelectItem value="advance_50">50% Advance Payment</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedMethod === "mpesa" && (
                    <FormField
                      control={form.control}
                      name="mpesaNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>M-Pesa Number</FormLabel>
                          <FormControl>
                            <Input placeholder="254XXXXXXXXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {selectedMethod === "bank_transfer" && (
                    <>
                      <FormField
                        control={form.control}
                        name="bankName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank Name</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select bank" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="kcb">KCB Bank</SelectItem>
                                <SelectItem value="equity">Equity Bank</SelectItem>
                                <SelectItem value="cooperative">Cooperative Bank</SelectItem>
                                <SelectItem value="absa">Absa Bank</SelectItem>
                                <SelectItem value="stanbic">Stanbic Bank</SelectItem>
                                <SelectItem value="standard_chartered">Standard Chartered</SelectItem>
                                <SelectItem value="dtb">Diamond Trust Bank</SelectItem>
                                <SelectItem value="family">Family Bank</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="bankAccount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank Account Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Account number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {selectedMethod === "escrow" && (
                    <FormField
                      control={form.control}
                      name="escrowDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inspection Period (Days)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="30" 
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {selectedMethod === "check" && (
                    <FormField
                      control={form.control}
                      name="checkNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Check Number (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Check number if known" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="paymentNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any special payment instructions or notes..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Setting..." : "Set Payment Method"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};