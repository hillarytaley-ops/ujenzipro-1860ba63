import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import DeliveryProvidersList from "@/components/DeliveryProvidersList";
import DeliveryRequestForm from "@/components/DeliveryRequestForm";
import DeliveryProviderRegistration from "@/components/DeliveryProviderRegistration";
import LiveDeliveryTracker from "@/components/LiveDeliveryTracker";
import LiveTrackingViewer from "@/components/LiveTrackingViewer";
import { AlertCircle, Package, Truck, MapPin, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const DeliveryContent = () => {
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("providers");

  useEffect(() => {
    checkAuthAndProfile();
  }, []);

  const checkAuthAndProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (profileError) {
          console.error('Error fetching user profile:', profileError);
        } else {
          setUserProfile(profileData);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderRegistrationSuccess = () => {
    toast({
      title: "Registration successful",
      description: "Your provider application has been submitted for review"
    });
    // Optionally refresh data or switch tabs
  };

  const handleRequestSuccess = () => {
    toast({
      title: "Request submitted",
      description: "Providers will be notified of your delivery request"
    });
    // Optionally refresh data or switch tabs
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex space-x-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4">
          <TabsTrigger value="providers" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Providers</span>
          </TabsTrigger>
          <TabsTrigger value="request" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <span className="hidden sm:inline">Request</span>
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Tracking</span>
          </TabsTrigger>
          <TabsTrigger value="register" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Apply</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="mt-6">
          <DeliveryProvidersList 
            onProviderSelect={(provider) => {
              toast({
                title: "Provider selected",
                description: `Contact ${provider.provider_name} at ${provider.phone}`
              });
            }}
          />
        </TabsContent>

        <TabsContent value="request" className="mt-6">
          <DeliveryRequestForm 
            userProfile={userProfile}
            onRequestSuccess={handleRequestSuccess}
          />
        </TabsContent>

        <TabsContent value="tracking" className="mt-6">
          <div className="space-y-6">
            {userProfile ? (
              <>
                <LiveTrackingViewer builderId={userProfile.id} />
                {userProfile.role === 'delivery_provider' && (
                  <LiveDeliveryTracker providerId={userProfile.id} />
                )}
              </>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please log in to access live tracking features.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </TabsContent>

        <TabsContent value="register" className="mt-6">
          <DeliveryProviderRegistration 
            userProfile={userProfile}
            onRegistrationSuccess={handleProviderRegistrationSuccess}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};