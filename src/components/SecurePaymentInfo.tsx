import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, CreditCard, Shield, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface SecurePaymentInfoProps {
  acknowledgementId: string;
  paymentStatus?: string;
  paymentMethod?: string;
  paymentReference?: string;
  userRole: string;
  canAccessPayment: boolean;
}

export const SecurePaymentInfo: React.FC<SecurePaymentInfoProps> = ({
  acknowledgementId,
  paymentStatus,
  paymentMethod,
  paymentReference,
  userRole,
  canAccessPayment
}) => {
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [secureData, setSecureData] = useState<any>(null);
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const fetchSecurePaymentData = async () => {
    if (!canAccessPayment) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to view payment details",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_secure_acknowledgement', {
        acknowledgement_uuid: acknowledgementId
      });

      if (error) {
        console.error('Error fetching secure payment data:', error);
        toast({
          title: "Error",
          description: "Failed to access payment information",
          variant: "destructive",
        });
      } else if (data && data.length > 0) {
        setSecureData(data[0]);
        setShowPaymentDetails(true);
        
        toast({
          title: "Payment Information Accessed",
          description: "This action has been logged for audit purposes",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to access payment information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hidePaymentDetails = () => {
    setShowPaymentDetails(false);
    setSecureData(null);
  };

  const maskPaymentReference = (reference: string) => {
    if (!reference || reference.length < 4) return reference;
    return `****${reference.slice(-4)}`;
  };

  // If user cannot access payment info, show limited view
  if (!canAccessPayment && userRole !== 'admin') {
    return (
      <Card className="border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-muted-foreground" />
            Payment Information
          </CardTitle>
          <CardDescription className="text-xs">
            Restricted access
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <Badge variant="secondary" className="text-xs">
              Payment Processed
            </Badge>
            <p className="text-sm text-muted-foreground">
              Payment details are only visible to authorized parties
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <CreditCard className="h-4 w-4 text-primary" />
          Payment Information
        </CardTitle>
        <CardDescription className="text-xs">
          {showPaymentDetails ? 'Detailed payment information visible' : 'Click to view payment details'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Always show payment status */}
          <div className="flex items-center gap-2">
            <DollarSign className="h-3 w-3 text-muted-foreground" />
            <Badge className={getStatusColor(showPaymentDetails ? secureData?.payment_status : paymentStatus)}>
              {showPaymentDetails ? secureData?.payment_status || 'Unknown' : paymentStatus || 'Processed'}
            </Badge>
          </div>

          {!showPaymentDetails ? (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-3 w-3" />
                <span>Payment method: {paymentMethod ? '****' : 'Not specified'}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-3 w-3" />
                <span>Reference: {paymentReference ? maskPaymentReference(paymentReference) : 'Not provided'}</span>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={fetchSecurePaymentData}
                disabled={isLoading}
                className="flex items-center gap-1 mt-3"
              >
                <Eye className="h-3 w-3" />
                {isLoading ? 'Loading...' : 'Show Full Details'}
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium">
                  Method: {secureData?.payment_method || 'Not specified'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-3 w-3 text-muted-foreground" />
                <span className="font-mono">
                  Reference: {secureData?.payment_reference || 'Not provided'}
                </span>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={hidePaymentDetails}
                className="flex items-center gap-1 mt-3"
              >
                <EyeOff className="h-3 w-3" />
                Hide Details
              </Button>

              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mt-3">
                <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-200">
                  <Shield className="h-3 w-3" />
                  <span>Payment access logged for security audit</span>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};