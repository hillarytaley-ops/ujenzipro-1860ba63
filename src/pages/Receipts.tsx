import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ReceiptPortal from '@/components/ReceiptPortal';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Building, Truck } from 'lucide-react';

const Receipts: React.FC = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Get user role from profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching user role:', profileError);
        setLoading(false);
        return;
      }

      setUserRole(profileData?.role || null);

      // If user is a supplier, get their supplier ID
      if (profileData?.role === 'supplier') {
        const { data: supplierData, error: supplierError } = await supabase
          .from('suppliers')
          .select('id')
          .eq('user_id', profileData.id)
          .maybeSingle();

        if (supplierError) {
          console.error('Error fetching supplier ID:', supplierError);
        } else {
          setSupplierId(supplierData?.id || null);
        }
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Receipt Management</h1>
            <p className="text-muted-foreground mt-2">
              Upload, manage, and share material receipts and documentation
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {userRole === 'supplier' ? 'Supplier Portal' : 
             userRole === 'builder' ? 'Builder Access' : 
             userRole === 'admin' ? 'Admin Access' : 'Guest View'}
          </Badge>
        </div>

        {/* Feature Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Receipt Upload
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Upload purchase receipts, delivery documents, and quality certificates
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Building className="h-5 w-5 text-green-500" />
                Builder Sharing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Share receipts with builders and contractors for transparency
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="h-5 w-5 text-orange-500" />
                Delivery Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Link receipts to specific deliveries for complete documentation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Receipt Portal */}
        <ReceiptPortal 
          userRole={userRole || undefined}
          supplierId={supplierId || undefined}
        />

        {/* Additional Info */}
        {!userRole && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Authentication Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Please sign in to access the receipt portal. Different features are available based on your role:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground ml-4">
                <li>• <strong>Suppliers:</strong> Upload and manage receipts</li>
                <li>• <strong>Builders:</strong> View shared receipts and documentation</li>
                <li>• <strong>Admins:</strong> Full access to all receipts</li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Receipts;