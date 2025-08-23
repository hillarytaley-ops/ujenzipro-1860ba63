import { useState, useEffect } from "react";
import { QuotationsList } from "@/components/QuotationsList";
import { PurchaseOrderDialog } from "@/components/PurchaseOrderDialog";
import { ComprehensivePurchaseOrderForm } from "@/components/ComprehensivePurchaseOrderForm";
import { PaymentMethodsDialog } from "@/components/PaymentMethodsDialog";
import DeliveryNoteUpload from "@/components/DeliveryNoteUpload";
import OrderQRManager from "@/components/PurchaseOrderQRManager";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Package, Truck, QrCode, Plus, Building2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_name: string;
  total_amount: number;
  delivery_date: string;
  status: string;
  created_at: string;
}

const Procurement = () => {
  const [userProfile, setUserProfile] = useState<{
    id: string;
    role: string;
    company_name?: string;
    full_name?: string;
    phone?: string;
  } | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComprehensiveForm, setShowComprehensiveForm] = useState(false);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, role, company_name, full_name, phone')
            .eq('user_id', user.id)
            .single();
          
          setUserProfile(profile);
          
          if (profile) {
            await fetchPurchaseOrders(profile.id);
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  const fetchPurchaseOrders = async (buyerId: string) => {
    try {
      // Get purchase orders
      const { data: poData, error: poError } = await supabase
        .from("purchase_orders")
        .select("*")
        .eq("buyer_id", buyerId)
        .order("created_at", { ascending: false });

      if (poError) throw poError;

      // Get supplier details for each PO
      const formattedPOs: PurchaseOrder[] = [];
      
      for (const po of poData || []) {
        const { data: supplier } = await supabase
          .from("suppliers")
          .select("company_name")
          .eq("id", po.supplier_id)
          .maybeSingle();

        formattedPOs.push({
          id: po.id,
          po_number: po.po_number,
          supplier_name: supplier?.company_name || "Unknown Supplier",
          total_amount: po.total_amount,
          delivery_date: po.delivery_date,
          status: po.status,
          created_at: po.created_at
        });
      }

      setPurchaseOrders(formattedPOs);
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      toast.error("Failed to load purchase orders");
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "confirmed":
        return "default";
      case "in_progress":
        return "default";
      case "delivered":
        return "default";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-construction">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!userProfile || (userProfile.role !== 'builder' && !userProfile.company_name)) {
    return (
      <div className="min-h-screen bg-gradient-construction">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Restricted</h1>
            <p>This section is only available to professional builders and companies.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-construction">
      <Navigation />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Procurement Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your quotation requests and purchase orders
            </p>
          </div>

          <Tabs defaultValue="quotations" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="quotations" className="gap-2">
                <FileText className="h-4 w-4" />
                Quotation Requests
              </TabsTrigger>
              <TabsTrigger value="orders" className="gap-2">
                <Package className="h-4 w-4" />
                Purchase Orders
              </TabsTrigger>
              <TabsTrigger value="qr-codes" className="gap-2">
                <QrCode className="h-4 w-4" />
                QR Codes
              </TabsTrigger>
              <TabsTrigger value="delivery-notes" className="gap-2">
                <Truck className="h-4 w-4" />
                Delivery Notes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="quotations" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Your Quotation Requests</h2>
                <Button asChild>
                  <a href="/materials">Request New Quote</a>
                </Button>
              </div>
              <QuotationsList userProfile={userProfile} />
            </TabsContent>

            <TabsContent value="orders" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Your Purchase Orders</h2>
                <div className="flex gap-2">
                  <PurchaseOrderDialog
                    supplierName=""
                    userProfile={userProfile}
                  />
                  <Dialog open={showComprehensiveForm} onOpenChange={setShowComprehensiveForm}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Building2 className="h-4 w-4" />
                        Professional PO Form
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-none w-[95vw] h-[95vh] overflow-hidden p-0">
                      <DialogHeader className="p-6 pb-2">
                        <DialogTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          Comprehensive Purchase Order Form
                        </DialogTitle>
                        <DialogDescription>
                          Professional purchase order form for builders and construction companies
                        </DialogDescription>
                      </DialogHeader>
                      <div className="overflow-y-auto px-6 pb-6">
                        <ComprehensivePurchaseOrderForm
                          userProfile={userProfile}
                          onClose={() => {
                            setShowComprehensiveForm(false);
                            if (userProfile) {
                              fetchPurchaseOrders(userProfile.id);
                            }
                          }}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              {purchaseOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No purchase orders found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {purchaseOrders.map((po) => (
                    <Card key={po.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">PO #{po.po_number}</CardTitle>
                            <CardDescription>
                              To {po.supplier_name}
                            </CardDescription>
                          </div>
                          <Badge variant={getStatusVariant(po.status)}>
                            {po.status.toUpperCase()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Amount</p>
                            <p className="font-semibold text-green-600">
                              KSh {po.total_amount.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Delivery Date</p>
                            <p className="font-medium">
                              {new Date(po.delivery_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Created</p>
                            <p className="font-medium">
                              {new Date(po.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <PaymentMethodsDialog
                            purchaseOrderId={po.id}
                            totalAmount={po.total_amount}
                            supplierName={po.supplier_name}
                            userProfile={userProfile}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="qr-codes">
              <OrderQRManager />
            </TabsContent>

            <TabsContent value="delivery-notes">
              <DeliveryNoteUpload userProfile={userProfile} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Procurement;