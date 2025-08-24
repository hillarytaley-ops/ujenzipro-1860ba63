import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export type DeliveryStatus = 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type UserRole = 'supplier' | 'builder' | 'admin';

export interface Delivery {
  id: string;
  tracking_number: string;
  material_type: string;
  quantity: number;
  weight_kg: number;
  pickup_address: string;
  delivery_address: string;
  estimated_delivery_time: string;
  actual_delivery_time?: string;
  status: DeliveryStatus;
  driver_name?: string;
  driver_phone?: string;
  vehicle_details?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  builder_id?: string;
  supplier_id?: string;
  project_id?: string;
  projects?: { id: string; name: string; location: string; };
  can_view_locations?: boolean;
  can_view_driver_contact?: boolean;
}

export interface Builder {
  id: string;
  email: string;
}

export interface Project {
  id: string;
  name: string;
  location?: string;
  builder_id: string;
  access_code?: string;
}

export const useDeliveryData = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user && userRole) {
      fetchDeliveries();
      if (userRole === 'supplier') {
        fetchBuilders();
        fetchProjects();
      } else if (userRole === 'builder') {
        fetchUserProjects();
      }
      
      setupRealtimeSubscription();
    }
  }, [user, userRole]);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (profileError) {
          console.error('Error fetching user role:', profileError);
          toast({
            title: "Error",
            description: "Could not determine user role. Please contact support.",
            variant: "destructive",
          });
        } else {
          setUserRole((profileData?.role as UserRole) || null);
          setUserProfile(profileData);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('deliveries-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deliveries'
        },
        (payload) => {
          console.log('Real-time delivery change:', payload);
          fetchDeliveries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchBuilders = async () => {
    try {
      const { data: roleData, error: roleError } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('role', 'builder');

      if (roleError) {
        console.error('Error fetching builder roles:', roleError);
        return;
      }

      if (roleData && roleData.length > 0) {
        const buildersData = roleData.map(item => ({
          id: item.id,
          email: item.full_name || `User ${item.id.slice(-8)}`
        }));
        setBuilders(buildersData);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
      } else {
        setProjects(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchUserProjects = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return;
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('builder_id', profileData.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user projects:', error);
      } else {
        setUserProjects(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchDeliveries = async () => {
    try {
      // First get the basic delivery list without sensitive data
      const { data: basicDeliveries, error: basicError } = await supabase
        .from('deliveries')
        .select(`
          id,
          tracking_number,
          material_type,
          quantity,
          weight_kg,
          estimated_delivery_time,
          actual_delivery_time,
          status,
          vehicle_details,
          notes,
          created_at,
          updated_at,
          builder_id,
          supplier_id,
          project_id,
          projects (
            id,
            name,
            location
          )
        `)
        .order('created_at', { ascending: false });

      if (basicError) {
        console.error('Error fetching deliveries:', basicError);
        toast({
          title: "Error",
          description: "Failed to fetch deliveries",
          variant: "destructive",
        });
        return;
      }

      // Now fetch secure delivery data for each delivery using the secure function
      const secureDeliveries = await Promise.all(
        (basicDeliveries || []).map(async (delivery) => {
          try {
            const { data: secureData, error: secureError } = await supabase
              .rpc('get_secure_delivery', { delivery_uuid: delivery.id });

            if (secureError) {
              console.error('Error fetching secure delivery data:', secureError);
              // Return basic delivery data without sensitive information
              return {
                ...delivery,
                pickup_address: 'Location protected',
                delivery_address: 'Location protected',
                driver_name: undefined,
                driver_phone: undefined
              };
            }

            // Use the secure data which conditionally includes sensitive information
            return {
              ...delivery,
              pickup_address: secureData[0]?.pickup_address || 'Location protected',
              delivery_address: secureData[0]?.delivery_address || 'Location protected',
              driver_name: secureData[0]?.driver_name,
              driver_phone: secureData[0]?.driver_phone,
              can_view_locations: secureData[0]?.can_view_locations || false,
              can_view_driver_contact: secureData[0]?.can_view_driver_contact || false
            };
          } catch (error) {
            console.error('Error processing secure delivery:', error);
            return {
              ...delivery,
              pickup_address: 'Location protected',
              delivery_address: 'Location protected',
              driver_name: undefined,
              driver_phone: undefined
            };
          }
        })
      );

      setDeliveries(secureDeliveries as Delivery[]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch deliveries",
        variant: "destructive",
      });
    }
  };

  const createDelivery = async (deliveryData: any) => {
    if (!user || userRole !== 'supplier') {
      toast({
        title: "Access Denied",
        description: "Only suppliers can create deliveries",
        variant: "destructive",
      });
      return false;
    }

    try {
      const timestamp = Date.now();
      const trackingNumber = `JG${timestamp.toString().slice(-8)}`;

      const formattedData = {
        tracking_number: trackingNumber,
        supplier_id: user.id,
        builder_id: deliveryData.builder_id || null,
        project_id: deliveryData.project_id || null,
        material_type: deliveryData.material_type,
        quantity: parseInt(deliveryData.quantity),
        weight_kg: parseFloat(deliveryData.weight_kg),
        pickup_address: deliveryData.pickup_address,
        delivery_address: deliveryData.delivery_address,
        estimated_delivery_time: deliveryData.estimated_delivery || null,
        driver_phone: deliveryData.driver_phone || null,
        vehicle_details: deliveryData.vehicle_number || null,
        notes: deliveryData.special_instructions || null,
        status: 'pending' as DeliveryStatus
      };

      const { error } = await supabase
        .from('deliveries')
        .insert([formattedData]);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: `Delivery created with tracking number: ${trackingNumber}`,
      });

      fetchDeliveries();
      return true;
    } catch (error) {
      console.error('Error creating delivery:', error);
      toast({
        title: "Error",
        description: "Failed to create delivery",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateDeliveryStatus = async (deliveryId: string, newStatus: DeliveryStatus) => {
    if (!user || userRole !== 'supplier') {
      toast({
        title: "Access Denied",
        description: "Only suppliers can update delivery status",
        variant: "destructive",
      });
      return;
    }

    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'delivered') {
        updateData.actual_delivery_time = new Date().toISOString();
      }

      const { error } = await supabase
        .from('deliveries')
        .update(updateData)
        .eq('id', deliveryId);

      if (error) {
        throw error;
      }

      await supabase
        .from('delivery_updates')
        .insert([{
          delivery_id: deliveryId,
          status: newStatus,
          notes: `Status updated to ${newStatus}`
        }]);

      toast({
        title: "Success",
        description: `Delivery status updated to ${newStatus}`,
      });

      fetchDeliveries();
    } catch (error) {
      console.error('Error updating delivery status:', error);
      toast({
        title: "Error",
        description: "Failed to update delivery status",
        variant: "destructive",
      });
    }
  };

  return {
    deliveries,
    builders,
    projects,
    userProjects,
    loading,
    userRole,
    user,
    userProfile,
    createDelivery,
    updateDeliveryStatus,
    fetchDeliveries
  };
};