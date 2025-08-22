import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PurchaseOrderDialog } from "@/components/PurchaseOrderDialog";
import { FileText, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QuotationListProps {
  userProfile: {
    id: string;
    role: string;
    company_name?: string;
  };
}

interface Quotation {
  id: string;
  material_name: string;
  quantity: number;
  unit: string;
  supplier_name: string;
  status: string;
  quote_amount: number | null;
  quote_valid_until: string | null;
  supplier_notes: string | null;
  created_at: string;
}

export const QuotationsList = ({ userProfile }: QuotationListProps) => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotations();
  }, [userProfile.id]);

  const fetchQuotations = async () => {
    try {
      // First get quotations
      const { data: quotationsData, error: quotationsError } = await supabase
        .from("quotation_requests")
        .select("*")
        .eq("requester_id", userProfile.id)
        .order("created_at", { ascending: false });

      if (quotationsError) throw quotationsError;

      // Get supplier details separately
      const formattedQuotations: Quotation[] = [];
      
      for (const q of quotationsData || []) {
        const { data: supplier } = await supabase
          .from("suppliers")
          .select("company_name")
          .eq("id", q.supplier_id)
          .maybeSingle();

        formattedQuotations.push({
          id: q.id,
          material_name: q.material_name,
          quantity: q.quantity,
          unit: q.unit,
          supplier_name: supplier?.company_name || "Unknown Supplier",
          status: q.status,
          quote_amount: q.quote_amount,
          quote_valid_until: q.quote_valid_until,
          supplier_notes: q.supplier_notes,
          created_at: q.created_at
        });
      }

      setQuotations(formattedQuotations);
    } catch (error) {
      console.error("Error fetching quotations:", error);
      toast.error("Failed to load quotations");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "quoted":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "accepted":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "expired":
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "quoted":
        return "default";
      case "accepted":
        return "default";
      case "rejected":
        return "destructive";
      case "expired":
        return "outline";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading quotations...</div>;
  }

  if (quotations.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No quotation requests found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {quotations.map((quotation) => (
        <Card key={quotation.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{quotation.material_name}</CardTitle>
                <CardDescription>
                  {quotation.quantity} {quotation.unit} from {quotation.supplier_name}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(quotation.status)}
                <Badge variant={getStatusVariant(quotation.status)}>
                  {quotation.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {quotation.status === "quoted" && quotation.quote_amount && (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-green-800">
                        Quote: KSh {quotation.quote_amount.toLocaleString()}
                      </p>
                      {quotation.quote_valid_until && (
                        <p className="text-sm text-green-600">
                          Valid until: {new Date(quotation.quote_valid_until).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <PurchaseOrderDialog
                      quotationId={quotation.id}
                      supplierName={quotation.supplier_name}
                      userProfile={userProfile}
                      quotedItems={[{
                        material_name: quotation.material_name,
                        quantity: quotation.quantity,
                        unit: quotation.unit,
                        unit_price: quotation.quote_amount / quotation.quantity
                      }]}
                    />
                  </div>
                  {quotation.supplier_notes && (
                    <p className="text-sm text-green-700 mt-2">
                      <strong>Supplier Notes:</strong> {quotation.supplier_notes}
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {quotation.status === "pending" && (
              <p className="text-sm text-gray-600">
                Waiting for supplier response...
              </p>
            )}

            <p className="text-xs text-gray-500 mt-2">
              Requested on {new Date(quotation.created_at).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};