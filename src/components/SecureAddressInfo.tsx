import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, MapPin, Shield, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface SecureAddressInfoProps {
  recordId: string;
  recordType: 'delivery' | 'delivery_request' | 'purchase_order';
  pickupAddress?: string;
  deliveryAddress?: string;
  userRole: string;
  canAccess: boolean;
}

export const SecureAddressInfo: React.FC<SecureAddressInfoProps> = ({
  recordId,
  recordType,
  pickupAddress,
  deliveryAddress,
  userRole,
  canAccess
}) => {
  const [showAddresses, setShowAddresses] = useState(false);
  const [addressData, setAddressData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getSecureFunction = (type: string) => {
    switch (type) {
      case 'delivery':
        return 'get_secure_delivery';
      case 'delivery_request':
        return 'get_secure_delivery_request';
      case 'purchase_order':
        return 'get_secure_purchase_order';
      default:
        return null;
    }
  };

  const handleShowAddresses = async () => {
    if (!canAccess) {
      toast({
        title: "Access Denied",
        description: "Address information is protected for privacy and security",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const functionName = getSecureFunction(recordType);
      if (!functionName) {
        throw new Error('Invalid record type');
      }

      let result;
      if (recordType === 'delivery') {
        result = await supabase.rpc(functionName, { delivery_uuid: recordId });
      } else if (recordType === 'delivery_request') {
        result = await supabase.rpc(functionName, { request_uuid: recordId });
      } else if (recordType === 'purchase_order') {
        result = await supabase.rpc(functionName, { order_uuid: recordId });
      } else {
        throw new Error('Invalid record type');
      }

      const { data, error } = result;

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setAddressData(data[0]);
        setShowAddresses(true);
        
        toast({
          title: "Address Information Accessed",
          description: "Access has been logged for security audit purposes",
          variant: "default",
        });
      } else {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view these addresses",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error accessing address info:', error);
      toast({
        title: "Error",
        description: "Failed to access address information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hideAddresses = () => {
    setShowAddresses(false);
    setAddressData(null);
  };

  const maskAddress = (address: string) => {
    if (!address || address.length < 10) return address;
    const parts = address.split(',');
    if (parts.length > 1) {
      return `${parts[0]?.substring(0, 3)}***, ${parts[parts.length - 1]?.trim()}`;
    }
    return `${address.substring(0, 6)}***`;
  };

  if (!canAccess && userRole !== 'admin') {
    return (
      <Card className="border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-muted-foreground" />
            Address Information
          </CardTitle>
          <CardDescription className="text-xs">
            Protected for privacy and security
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span>Addresses are protected</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Only authorized parties can view delivery locations
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
          <MapPin className="h-4 w-4 text-primary" />
          Address Information
        </CardTitle>
        <CardDescription className="text-xs">
          {showAddresses ? 'Full addresses visible' : 'Click to view protected addresses'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {recordType !== 'purchase_order' && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-3 w-3 text-muted-foreground mt-1" />
              <div>
                <div className="font-medium text-xs text-muted-foreground">Pickup:</div>
                <div className="break-words">
                  {showAddresses && addressData ? 
                    addressData.pickup_address || 'Not specified' : 
                    maskAddress(pickupAddress || 'Protected location')
                  }
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-3 w-3 text-muted-foreground mt-1" />
            <div>
              <div className="font-medium text-xs text-muted-foreground">Delivery:</div>
              <div className="break-words">
                {showAddresses && addressData ? 
                  addressData.delivery_address || 'Not specified' : 
                  maskAddress(deliveryAddress || 'Protected location')
                }
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            {!showAddresses ? (
              <Button
                size="sm"
                variant="outline"
                onClick={handleShowAddresses}
                disabled={isLoading}
                className="flex items-center gap-1"
              >
                <Eye className="h-3 w-3" />
                {isLoading ? 'Loading...' : 'Show Addresses'}
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={hideAddresses}
                className="flex items-center gap-1"
              >
                <EyeOff className="h-3 w-3" />
                Hide Addresses
              </Button>
            )}
          </div>

          {showAddresses && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3 mt-3">
              <div className="flex items-center gap-2 text-xs text-red-800 dark:text-red-200">
                <Shield className="h-3 w-3" />
                <span>Address access logged - Handle with care</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};