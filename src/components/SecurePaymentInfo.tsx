import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, CreditCard, Shield, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface SecurePaymentInfoProps {
  acknowledgementId: string;
  paymentStatus?: string;
  paymentMethod?: string;
  paymentReference?: string;
  userRole: string;
  isOwner: boolean; // Whether the current user is the acknowledger
}

export const SecurePaymentInfo: React.FC<SecurePaymentInfoProps> = ({
  acknowledgementId,
  paymentStatus,
  paymentMethod,
  paymentReference,
  userRole,
  isOwner
}) => {
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [secureData, setSecureData] = useState<any>(null);
  const { toast } = useToast();

  const canAccessPaymentInfo = userRole === 'admin' || isOwner;

  const fetchSecureData = async () => {
    if (!canAccessPaymentInfo) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to view payment information",
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
        throw error;
      }

      if (data && data.length > 0) {
        setSecureData(data[0]);
        setShowPaymentDetails(true);
        
        toast({
          title: "Payment Information Accessed",
          description: "This action has been logged for security purposes",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error accessing payment info:', error);
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
    return `***${reference.slice(-4)}`;
  };

  if (!canAccessPaymentInfo) {
    return (
      <Card className="border-muted bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Lock className="h-4 w-4 text-muted-foreground" />
            Payment Information
          </CardTitle>
          <CardDescription className="text-xs">
            Restricted Access
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="h-3 w-3" />
              <span>Payment processed securely</span>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-200">
                <Shield className="h-3 w-3" />
                <span>Payment details are restricted to authorized parties only</span>
              </div>
            </div>
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
          {showPaymentDetails ? 'Sensitive information visible' : 'Click to view payment details'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="font-medium">
              Status: {showPaymentDetails && secureData ? secureData.payment_status : 'Processed'}
            </span>
          </div>
          
          {!showPaymentDetails ? (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-3 w-3" />
                <span>Method: {paymentMethod ? '***' : 'Not specified'}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-xs">Reference: {paymentReference ? maskPaymentReference(paymentReference) : 'Not provided'}</span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchSecureData}
                  disabled={isLoading}
                  className="flex items-center gap-1"
                >
                  <Eye className="h-3 w-3" />
                  {isLoading ? 'Loading...' : 'Show Details'}
                </Button>
              </div>
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
                <span className="text-xs font-mono">
                  Reference: {secureData?.payment_reference || 'Not provided'}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={hidePaymentDetails}
                  className="flex items-center gap-1"
                >
                  <EyeOff className="h-3 w-3" />
                  Hide Details
                </Button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-3">
                <div className="flex items-center gap-2 text-xs text-blue-800 dark:text-blue-200">
                  <Shield className="h-3 w-3" />
                  <span>Access logged for security audit</span>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};