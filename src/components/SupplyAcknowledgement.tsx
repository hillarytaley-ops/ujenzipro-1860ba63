import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, FileText, CreditCard, Send, Download, Eye } from 'lucide-react';
import { PaymentMethodsDialog } from './PaymentMethodsDialog';

interface DeliveryNote {
  id: string;
  delivery_note_number: string;
  supplier_id: string;
  purchase_order_id: string;
  dispatch_date: string;
  expected_delivery_date: string;
  notes: string;
  file_path: string;
  file_name: string;
  created_at: string;
  suppliers: {
    company_name: string;
    contact_person: string;
    email: string;
  } | null;
  purchase_orders: {
    po_number: string;
    total_amount: number;
    items: any[];
    delivery_address: string;
    buyer_id: string;
  } | null;
}

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  company_name: string;
  role: string;
  user_type: string;
  is_professional: boolean;
}

interface AcknowledgementData {
  delivery_note_id: string;
  acknowledged_by: string;
  acknowledger_id: string;
  acknowledgement_date: string;
  digital_signature: string;
  payment_status: string;
  payment_method: string;
  payment_reference: string;
  comments: string;
  signed_document_path?: string;
}

const SupplyAcknowledgement: React.FC = () => {
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<DeliveryNote | null>(null);
  const [acknowledgementDialog, setAcknowledgementDialog] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [signature, setSignature] = useState('');
  const [comments, setComments] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    checkUserAccess();
  }, []);

  const checkUserAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Check if user is professional builder or company
      if (profile.role === 'builder' && (profile.user_type === 'company' || profile.is_professional)) {
        setUserProfile(profile);
        await fetchDeliveryNotes(profile.id);
      }
    } catch (error) {
      console.error('Error checking user access:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryNotes = async (builderId: string) => {
    try {
      const { data, error } = await supabase
        .from('delivery_notes')
        .select(`
          *,
          suppliers!inner (company_name, contact_person, email),
          purchase_orders!inner (po_number, total_amount, items, delivery_address, buyer_id)
        `)
        .eq('purchase_orders.buyer_id', builderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeliveryNotes((data as any) || []);
    } catch (error) {
      console.error('Error fetching delivery notes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch delivery notes",
        variant: "destructive"
      });
    }
  };

  const acknowledgeDelivery = async () => {
    if (!selectedNote || !userProfile || !signature.trim()) {
      toast({
        title: "Error",
        description: "Please provide a digital signature",
        variant: "destructive"
      });
      return;
    }

    try {
      const acknowledgementData: AcknowledgementData = {
        delivery_note_id: selectedNote.id,
        acknowledged_by: userProfile.full_name || userProfile.company_name,
        acknowledger_id: userProfile.id,
        acknowledgement_date: new Date().toISOString(),
        digital_signature: signature,
        payment_status: 'pending',
        payment_method: '',
        payment_reference: paymentReference,
        comments: comments
      };

      // Store acknowledgement in a new table
      const { error } = await supabase
        .from('delivery_acknowledgements')
        .insert(acknowledgementData);

      if (error) throw error;

      // Send notification to supplier
      await sendAcknowledgementToSupplier(selectedNote, acknowledgementData);

      toast({
        title: "Success",
        description: "Delivery acknowledged successfully"
      });

      setAcknowledgementDialog(false);
      setSignature('');
      setComments('');
      setPaymentReference('');
      
    } catch (error) {
      console.error('Error acknowledging delivery:', error);
      toast({
        title: "Error",
        description: "Failed to acknowledge delivery",
        variant: "destructive"
      });
    }
  };

  const sendAcknowledgementToSupplier = async (note: DeliveryNote, acknowledgement: AcknowledgementData) => {
    try {
      if (!note.suppliers?.email) {
        console.error('Supplier email not available');
        return;
      }

      // Send email notification to supplier about acknowledgement
      await supabase.functions.invoke('send-acknowledgement-notification', {
        body: {
          supplier_email: note.suppliers.email,
          delivery_note_number: note.delivery_note_number,
          acknowledged_by: acknowledgement.acknowledged_by,
          acknowledgement_date: acknowledgement.acknowledgement_date,
          comments: acknowledgement.comments
        }
      });
    } catch (error) {
      console.error('Error sending acknowledgement notification:', error);
    }
  };

  const downloadDeliveryNote = async (note: DeliveryNote) => {
    try {
      const { data } = await supabase.storage
        .from('delivery-notes')
        .download(note.file_path);

      if (data) {
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = note.file_name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading delivery note:', error);
      toast({
        title: "Error",
        description: "Failed to download delivery note",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!userProfile || !(userProfile.user_type === 'company' || userProfile.is_professional)) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
            <p className="text-muted-foreground">
              This feature is only available to professional builders and companies.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Supply Acknowledgement</h2>
          <p className="text-muted-foreground">
            Review, acknowledge and process payments for delivered supplies
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {deliveryNotes.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Delivery Notes</h3>
                <p className="text-muted-foreground">
                  No delivery notes available for acknowledgement.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          deliveryNotes.map((note) => (
            <Card key={note.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Delivery Note #{note.delivery_note_number}
                    </CardTitle>
                    <CardDescription>
                      From {note.suppliers?.company_name || 'Unknown Supplier'} • PO #{note.purchase_orders?.po_number || 'N/A'}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    KES {note.purchase_orders?.total_amount?.toLocaleString() || '0'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="font-medium">Dispatch Date</Label>
                      <p className="text-muted-foreground">
                        {new Date(note.dispatch_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label className="font-medium">Expected Delivery</Label>
                      <p className="text-muted-foreground">
                        {note.expected_delivery_date ? 
                          new Date(note.expected_delivery_date).toLocaleDateString() : 
                          'Not specified'
                        }
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="font-medium">Items</Label>
                    <div className="mt-2 space-y-2">
                      {note.purchase_orders?.items?.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.description}</span>
                          <span>{item.quantity} {item.unit} @ KES {item.unit_price}</span>
                        </div>
                      )) || <p className="text-sm text-muted-foreground">No items listed</p>}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadDeliveryNote(note)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download DN
                    </Button>

                    <Dialog open={acknowledgementDialog} onOpenChange={setAcknowledgementDialog}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          onClick={() => setSelectedNote(note)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Acknowledge Receipt
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Acknowledge Delivery</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="signature">Digital Signature *</Label>
                            <Input
                              id="signature"
                              value={signature}
                              onChange={(e) => setSignature(e.target.value)}
                              placeholder="Type your full name as digital signature"
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="paymentRef">Payment Reference (Optional)</Label>
                            <Input
                              id="paymentRef"
                              value={paymentReference}
                              onChange={(e) => setPaymentReference(e.target.value)}
                              placeholder="Payment reference number if payment made"
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="comments">Comments</Label>
                            <Textarea
                              id="comments"
                              value={comments}
                              onChange={(e) => setComments(e.target.value)}
                              placeholder="Any additional comments about the delivery"
                              className="mt-1"
                            />
                          </div>

                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => setAcknowledgementDialog(false)}
                            >
                              Cancel
                            </Button>
                            <Button onClick={acknowledgeDelivery}>
                              <Send className="h-4 w-4 mr-2" />
                              Send Acknowledgement
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {userProfile && note.purchase_orders && note.suppliers && (
                      <PaymentMethodsDialog
                        purchaseOrderId={note.purchase_order_id}
                        totalAmount={note.purchase_orders.total_amount}
                        supplierName={note.suppliers.company_name}
                        userProfile={userProfile}
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default SupplyAcknowledgement;