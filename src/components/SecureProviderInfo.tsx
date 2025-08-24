import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Phone, Mail, MapPin, Shield, User, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface SecureProviderInfoProps {
  providerId: string;
  providerName?: string;
  providerType?: string;
  userRole: string;
  hasActiveRequest?: boolean;
}

export const SecureProviderInfo: React.FC<SecureProviderInfoProps> = ({
  providerId,
  providerName,
  providerType,
  userRole,
  hasActiveRequest = false
}) => {
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [providerDetails, setProviderDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const canAccessContactInfo = userRole === 'admin' || hasActiveRequest;

  const handleShowContactInfo = async () => {
    if (!canAccessContactInfo) {
      toast({
        title: "Access Denied",
        description: "Contact information is only available to parties with active delivery requests",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Use secure function to get only necessary business information
      const { data, error } = await supabase
        .rpc('get_provider_business_info', { provider_uuid: providerId });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setProviderDetails(data[0]);
        setShowContactInfo(true);
        
        toast({
          title: "Provider Information Accessed",
          description: "Access logged for security purposes",
          variant: "default",
        });
      } else {
        toast({
          title: "Access Denied",
          description: "No active business relationship found",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error accessing provider info:', error);
      toast({
        title: "Error",
        description: "Failed to access provider information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hideContactInfo = () => {
    setShowContactInfo(false);
    setProviderDetails(null);
  };

  if (!canAccessContactInfo && userRole !== 'admin') {
    return (
      <Card className="border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-muted-foreground" />
            Provider Information
          </CardTitle>
          <CardDescription className="text-xs">
            Protected for privacy
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              {providerType === 'organization' ? (
                <Building2 className="h-3 w-3 text-muted-foreground" />
              ) : (
                <User className="h-3 w-3 text-muted-foreground" />
              )}
              <span className="font-medium">{providerName || 'Provider'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>Contact via platform only</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Create a delivery request to access contact information
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
          {providerType === 'organization' ? (
            <Building2 className="h-4 w-4 text-primary" />
          ) : (
            <User className="h-4 w-4 text-primary" />
          )}
          Provider Information
        </CardTitle>
        <CardDescription className="text-xs">
          {showContactInfo ? 'Business information visible' : 'Click to view business details'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            {providerType === 'organization' ? (
              <Building2 className="h-3 w-3 text-muted-foreground" />
            ) : (
              <User className="h-3 w-3 text-muted-foreground" />
            )}
            <span className="font-medium">{providerName || 'Provider'}</span>
          </div>

          {showContactInfo && providerDetails && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span>
                  Service Areas: {providerDetails.service_areas?.join(', ') || 'Not specified'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-3 w-3 text-muted-foreground" />
                <span>
                  Verified: {providerDetails.is_verified ? 'Yes' : 'No'}
                </span>
              </div>

              <div className="text-sm">
                <span className="text-muted-foreground">Rating: </span>
                <span className="font-medium">{providerDetails.rating}/5</span>
                <span className="text-muted-foreground ml-2">
                  ({providerDetails.total_deliveries} deliveries)
                </span>
              </div>

              <div className="text-sm">
                <span className="text-muted-foreground">Capacity: </span>
                <span className="font-medium">{providerDetails.capacity_kg}kg</span>
              </div>

              <div className="text-sm">
                <span className="text-muted-foreground">Vehicles: </span>
                <span>{providerDetails.vehicle_types?.join(', ') || 'Not specified'}</span>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {!showContactInfo ? (
              <Button
                size="sm"
                variant="outline"
                onClick={handleShowContactInfo}
                disabled={isLoading}
                className="flex items-center gap-1"
              >
                <Eye className="h-3 w-3" />
                {isLoading ? 'Loading...' : 'View Business Info'}
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={hideContactInfo}
                className="flex items-center gap-1"
              >
                <EyeOff className="h-3 w-3" />
                Hide Details
              </Button>
            )}
          </div>

          {showContactInfo && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-3">
              <div className="flex items-center gap-2 text-xs text-blue-800 dark:text-blue-200">
                <Shield className="h-3 w-3" />
                <span>Business information only - personal details protected</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};