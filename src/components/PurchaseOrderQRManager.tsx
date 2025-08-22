import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { QrCode, Download, Eye, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Order {
  id: string;
  order_number: string;
  total_amount?: number;
  qr_code_url?: string;
  qr_code_generated: boolean;
  status: string;
  created_at: string;
  items?: any;
  type: 'PURCHASE_ORDER' | 'DELIVERY_ORDER';
  suppliers?: { company_name: string } | null;
  profiles?: { full_name: string } | null;
}

const OrderQRManager: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingQR, setGeneratingQR] = useState<string | null>(null);
  const [selectedQR, setSelectedQR] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Fetch both purchase orders and delivery orders
      const [purchaseOrdersResult, deliveryOrdersResult] = await Promise.all([
        supabase
          .from('purchase_orders')
          .select(`
            *,
            suppliers!purchase_orders_supplier_id_fkey(company_name),
            profiles!purchase_orders_buyer_id_fkey(full_name)
          `)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('delivery_orders')
          .select(`
            *,
            suppliers!delivery_orders_supplier_id_fkey(company_name),
            profiles!delivery_orders_builder_id_fkey(full_name)
          `)
          .order('created_at', { ascending: false })
      ]);

      const purchaseOrders = (purchaseOrdersResult.data || []).map(item => ({
        ...item,
        type: 'PURCHASE_ORDER' as const,
        order_number: item.po_number,
        suppliers: item.suppliers && typeof item.suppliers === 'object' && !Array.isArray(item.suppliers) && 'company_name' in item.suppliers ? item.suppliers : null,
        profiles: item.profiles && typeof item.profiles === 'object' && !Array.isArray(item.profiles) && 'full_name' in item.profiles ? item.profiles : null
      }));

      const deliveryOrders = (deliveryOrdersResult.data || []).map(item => ({
        ...item,
        type: 'DELIVERY_ORDER' as const,
        suppliers: item.suppliers && typeof item.suppliers === 'object' && !Array.isArray(item.suppliers) && 'company_name' in item.suppliers ? item.suppliers : null,
        profiles: item.profiles && typeof item.profiles === 'object' && !Array.isArray(item.profiles) && 'full_name' in item.profiles ? item.profiles : null
      }));

      // Combine and sort by creation date
      const allOrders = [...purchaseOrders, ...deliveryOrders].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setOrders(allOrders as Order[]);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (order: Order) => {
    if (generatingQR) return;
    
    setGeneratingQR(order.id);
    
    try {
      const requestBody = order.type === 'PURCHASE_ORDER' 
        ? {
            purchaseOrderId: order.id,
            poNumber: order.order_number,
            supplierName: order.suppliers?.company_name || 'Unknown Supplier',
            totalAmount: order.total_amount || 0,
            items: Array.isArray(order.items) ? order.items : [],
            orderType: 'PURCHASE_ORDER'
          }
        : {
            deliveryOrderId: order.id,
            orderNumber: order.order_number,
            builderName: order.profiles?.full_name || 'Unknown Builder',
            supplierName: order.suppliers?.company_name || 'Unknown Supplier',
            totalAmount: 0,
            items: [],
            orderType: 'DELIVERY_ORDER'
          };

      const { data, error } = await supabase.functions.invoke('generate-qr-code', {
        body: requestBody
      });

      if (error) throw error;

      toast.success(`QR code generated for ${order.type === 'PURCHASE_ORDER' ? 'PO' : 'Order'} ${order.order_number}`);
      fetchOrders(); // Refresh the list
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setGeneratingQR(null);
    }
  };

  const downloadQRCode = (qrCodeUrl: string, orderNumber: string, orderType: string) => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `QR-${orderType}-${orderNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR code downloaded');
  };

  const getStatusBadge = (qrGenerated: boolean, status: string) => {
    if (qrGenerated) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          QR Ready
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline">
          <Clock className="h-3 w-3 mr-1" />
          Pending QR
        </Badge>
      );
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading purchase orders...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Order QR Codes
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Automatically generated QR codes for all orders (Purchase Orders & Delivery Orders). Download QR codes for material tracking.
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Number</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Client/Supplier</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>QR Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono">{order.order_number}</TableCell>
                <TableCell>
                  <Badge variant={order.type === 'PURCHASE_ORDER' ? 'default' : 'secondary'}>
                    {order.type === 'PURCHASE_ORDER' ? 'Purchase Order' : 'Delivery Order'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {order.type === 'PURCHASE_ORDER' 
                    ? order.suppliers?.company_name || 'Unknown' 
                    : order.profiles?.full_name || 'Unknown'
                  }
                </TableCell>
                <TableCell>
                  {order.total_amount ? `KES ${order.total_amount.toLocaleString()}` : 'N/A'}
                </TableCell>
                <TableCell>{getStatusBadge(order.qr_code_generated, order.status)}</TableCell>
                <TableCell>
                  {new Date(order.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {order.qr_code_generated && order.qr_code_url ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedQR(order.qr_code_url!)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => downloadQRCode(order.qr_code_url!, order.order_number, order.type)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => generateQRCode(order)}
                        disabled={generatingQR === order.id}
                      >
                        {generatingQR === order.id ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                            Generating...
                          </>
                        ) : (
                          <>
                            <QrCode className="h-3 w-3 mr-1" />
                            Generate QR
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {orders.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <QrCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No orders found</p>
          </div>
        )}

        {/* QR Code Preview Dialog */}
        <Dialog open={!!selectedQR} onOpenChange={() => setSelectedQR(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>QR Code Preview</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center space-y-4">
              {selectedQR && (
                <img
                  src={selectedQR}
                  alt="QR Code"
                  className="w-64 h-64 border rounded-lg"
                />
              )}
              <p className="text-sm text-muted-foreground text-center">
                This QR code contains order information that can be scanned for material tracking.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default OrderQRManager;