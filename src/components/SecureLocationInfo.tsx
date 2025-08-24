import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, MapPin, Shield, Lock, Phone, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface SecureLocationInfoProps {
  deliveryId: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  driverName?: string;
  driverPhone?: string;
  userRole: string;
  isAuthorized: boolean; // Whether user can access this delivery
  deliveryStatus: string;
}

export const SecureLocationInfo: React.FC<SecureLocationInfoProps> = ({
  deliveryId,
  pickupAddress,
  deliveryAddress,
  driverName,
  driverPhone,
  userRole,
  isAuthorized,
  deliveryStatus
}) => {
  const [showLocationDetails, setShowLocationDetails] = useState(false);
  const [showDriverContact, setShowDriverContact] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [secureData, setSecureData] = useState<any>(null);
  const { toast } = useToast();

  const canAccessLocations = userRole === 'admin' || isAuthorized;
  const canAccessDriverContact = userRole === 'admin' || 
    (isAuthorized && ['in_progress', 'delivered'].includes(deliveryStatus));

  const fetchSecureData = async (accessType: 'location' | 'driver') => {
    const canAccess = accessType === 'location' ? canAccessLocations : canAccessDriverContact;
    
    if (!canAccess) {
      toast({
        title: "Access Denied",
        description: `You don't have permission to view ${accessType} information`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_secure_delivery', {
        delivery_uuid: deliveryId
      });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setSecureData(data[0]);
        
        if (accessType === 'location') {
          setShowLocationDetails(true);
        } else {
          setShowDriverContact(true);
        }
        
        toast({
          title: `${accessType === 'location' ? 'Location' : 'Driver Contact'} Information Accessed`,
          description: "This action has been logged for security purposes",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error accessing secure data:', error);
      toast({
        title: "Error",
        description: `Failed to access ${accessType} information`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hideDetails = (type: 'location' | 'driver') => {
    if (type === 'location') {
      setShowLocationDetails(false);
    } else {
      setShowDriverContact(false);
    }
  };

  const maskAddress = (address: string) => {
    if (!address || address.length < 10) return 'Address available to authorized parties';
    const parts = address.split(' ');
    if (parts.length < 3) return 'Address available to authorized parties';
    return `${parts[0]} *** ${parts[parts.length - 1]}`;
  };

  const getAreaCode = (address: string) => {
    if (!address) return 'Location area';
    const parts = address.split(',');
    return parts.length > 1 ? parts[parts.length - 1].trim() : 'General area';
  };

  return (
    <div className="space-y-4">
      {/* Location Information Card */}
      <Card className={canAccessLocations ? "border-primary/20" : "border-muted bg-muted/30"}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <MapPin className={`h-4 w-4 ${canAccessLocations ? 'text-primary' : 'text-muted-foreground'}`} />
            Delivery Locations
          </CardTitle>
          <CardDescription className="text-xs">
            {showLocationDetails ? 'Full addresses visible' : 'Click to view complete addresses'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Pickup Location</div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span>
                  {showLocationDetails && secureData ? 
                    secureData.pickup_address : 
                    (canAccessLocations ? maskAddress(pickupAddress || '') : getAreaCode(pickupAddress || ''))
                  }
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Delivery Location</div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span>
                  {showLocationDetails && secureData ? 
                    secureData.delivery_address : 
                    (canAccessLocations ? maskAddress(deliveryAddress || '') : getAreaCode(deliveryAddress || ''))
                  }
                </span>
              </div>
            </div>

            {canAccessLocations ? (
              <div className="flex gap-2 pt-2">
                {!showLocationDetails ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fetchSecureData('location')}
                    disabled={isLoading}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    {isLoading ? 'Loading...' : 'Show Full Addresses'}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => hideDetails('location')}
                    className="flex items-center gap-1"
                  >
                    <EyeOff className="h-3 w-3" />
                    Hide Addresses
                  </Button>
                )}
              </div>
            ) : (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-200">
                  <Shield className="h-3 w-3" />
                  <span>Full addresses are restricted to authorized parties only</span>
                </div>
              </div>
            )}

            {showLocationDetails && (
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-3">
                <div className="flex items-center gap-2 text-xs text-blue-800 dark:text-blue-200">
                  <Shield className="h-3 w-3" />
                  <span>Location access logged for security audit</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Driver Contact Information Card */}
      <Card className={canAccessDriverContact ? "border-primary/20" : "border-muted bg-muted/30"}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            {canAccessDriverContact ? 
              <User className="h-4 w-4 text-primary" /> : 
              <Lock className="h-4 w-4 text-muted-foreground" />
            }
            Driver Contact
          </CardTitle>
          <CardDescription className="text-xs">
            {canAccessDriverContact ? 
              (showDriverContact ? 'Contact information visible' : 'Available for active deliveries') :
              'Contact available during delivery'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium">
                {showDriverContact && secureData ? 
                  secureData.driver_name : 
                  (driverName ? 'Driver Assigned' : 'Not assigned')
                }
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <span className="font-mono text-xs">
                {showDriverContact && secureData ? 
                  secureData.driver_phone || 'Not provided' : 
                  (canAccessDriverContact ? 'Contact available' : 'Available during delivery')
                }
              </span>
            </div>

            {canAccessDriverContact ? (
              <div className="flex gap-2 pt-2">
                {!showDriverContact ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fetchSecureData('driver')}
                    disabled={isLoading}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    {isLoading ? 'Loading...' : 'Show Contact'}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => hideDetails('driver')}
                    className="flex items-center gap-1"
                  >
                    <EyeOff className="h-3 w-3" />
                    Hide Contact
                  </Button>
                )}
              </div>
            ) : (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-200">
                  <Shield className="h-3 w-3" />
                  <span>Driver contact is only available during active delivery</span>
                </div>
              </div>
            )}

            {showDriverContact && (
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-3">
                <div className="flex items-center gap-2 text-xs text-blue-800 dark:text-blue-200">
                  <Shield className="h-3 w-3" />
                  <span>Contact access logged for security audit</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};