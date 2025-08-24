import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Phone, User, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface SecureDriverInfoProps {
  deliveryId: string;
  driverName?: string;
  driverPhone?: string;
  userRole: string;
  canAccess: boolean;
}

export const SecureDriverInfo: React.FC<SecureDriverInfoProps> = ({
  deliveryId,
  driverName,
  driverPhone,
  userRole,
  canAccess
}) => {
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const logAccess = async (accessType: string) => {
    try {
      await supabase.rpc('log_driver_info_access', {
        delivery_uuid: deliveryId,
        access_type_param: accessType
      });
    } catch (error) {
      console.error('Failed to log access:', error);
    }
  };

  const handleShowSensitiveInfo = async () => {
    if (!canAccess) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to view driver contact information",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await logAccess('sensitive_view');
      setShowSensitiveInfo(true);
      
      toast({
        title: "Driver Information Accessed",
        description: "This action has been logged for security purposes",
        variant: "default",
      });
    } catch (error) {
      console.error('Error accessing driver info:', error);
      toast({
        title: "Error",
        description: "Failed to access driver information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hideSensitiveInfo = () => {
    setShowSensitiveInfo(false);
  };

  const maskPhoneNumber = (phone: string) => {
    if (!phone || phone.length < 4) return phone;
    return `***-***-${phone.slice(-4)}`;
  };

  const maskDriverName = (name: string) => {
    if (!name || name.length < 3) return name;
    return `${name.charAt(0)}***${name.slice(-1)}`;
  };

  if (!canAccess && userRole !== 'admin') {
    return (
      <Card className="border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-muted-foreground" />
            Driver Information
          </CardTitle>
          <CardDescription className="text-xs">
            Protected for privacy
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-3 w-3" />
              <span>Driver Assigned</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>Contact via platform</span>
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
          <User className="h-4 w-4 text-primary" />
          Driver Information
        </CardTitle>
        <CardDescription className="text-xs">
          {showSensitiveInfo ? 'Sensitive information visible' : 'Click to view contact details'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-3 w-3 text-muted-foreground" />
            <span className="font-medium">
              {showSensitiveInfo ? driverName || 'Not assigned' : maskDriverName(driverName || 'Driver')}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-3 w-3 text-muted-foreground" />
            <span className="font-mono">
              {showSensitiveInfo ? driverPhone || 'Not provided' : maskPhoneNumber(driverPhone || '***-***-****')}
            </span>
          </div>

          <div className="flex gap-2 pt-2">
            {!showSensitiveInfo ? (
              <Button
                size="sm"
                variant="outline"
                onClick={handleShowSensitiveInfo}
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
                onClick={hideSensitiveInfo}
                className="flex items-center gap-1"
              >
                <EyeOff className="h-3 w-3" />
                Hide Contact
              </Button>
            )}
          </div>

          {showSensitiveInfo && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mt-3">
              <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-200">
                <Shield className="h-3 w-3" />
                <span>Access logged for security audit</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};