import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  Search, 
  Eye,
  Building,
  AlertTriangle,
  MapPin
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MaterialTracking {
  id: string;
  qr_code: string;
  material_type: string;
  batch_number?: string;
  quantity: number;
  supplier_info?: string;
  dispatch_status: string;
  received_status?: string;
  dispatched_at?: string;
  received_at?: string;
  project_name?: string;
  supplier_name?: string;
  matched: boolean;
}

const MaterialTrackingDashboard: React.FC = () => {
  const [trackingData, setTrackingData] = useState<MaterialTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQR, setSearchQR] = useState('');
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    checkUserRole();
    fetchTrackingData();
    
    // Set up real-time subscriptions
    const suppliesChannel = supabase
      .channel('supplies-tracking')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scanned_supplies'
        },
        () => fetchTrackingData()
      )
      .subscribe();

    const receivablesChannel = supabase
      .channel('receivables-tracking')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scanned_receivables'
        },
        () => fetchTrackingData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(suppliesChannel);
      supabase.removeChannel(receivablesChannel);
    };
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        setUserRole(profile?.role || '');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  const fetchTrackingData = async () => {
    try {
      setLoading(true);
      
      // Fetch supplies data
      const { data: suppliesData, error: suppliesError } = await supabase
        .from('scanned_supplies')
        .select(`
          id,
          qr_code,
          material_type,
          batch_number,
          quantity,
          supplier_info,
          dispatch_status,
          dispatched_at,
          scanned_for_dispatch,
          suppliers (company_name)
        `)
        .order('scanned_at', { ascending: false });

      if (suppliesError) throw suppliesError;

      // Fetch receivables data
      const { data: receivablesData, error: receivablesError } = await supabase
        .from('scanned_receivables')
        .select(`
          id,
          qr_code,
          material_type,
          batch_number,
          quantity,
          supplier_info,
          received_status,
          received_at,
          matched_supply_id,
          projects (name)
        `)
        .order('received_at', { ascending: false });

      if (receivablesError) throw receivablesError;

      // Combine and match data
      const combinedData: MaterialTracking[] = [];
      
      // Process supplies
      suppliesData?.forEach(supply => {
        const matchedReceivable = receivablesData?.find(r => r.qr_code === supply.qr_code);
        
        combinedData.push({
          id: supply.id,
          qr_code: supply.qr_code,
          material_type: supply.material_type,
          batch_number: supply.batch_number,
          quantity: supply.quantity,
          supplier_info: supply.supplier_info,
          dispatch_status: supply.dispatch_status,
          received_status: matchedReceivable?.received_status,
          dispatched_at: supply.dispatched_at,
          received_at: matchedReceivable?.received_at,
          supplier_name: supply.suppliers?.company_name,
          project_name: matchedReceivable?.projects?.name,
          matched: !!matchedReceivable
        });
      });

      setTrackingData(combinedData);
    } catch (error) {
      console.error('Error fetching tracking data:', error);
      toast.error('Failed to load tracking data');
    } finally {
      setLoading(false);
    }
  };

  const markAsDispatched = async (supplyId: string) => {
    try {
      const { error } = await supabase
        .from('scanned_supplies')
        .update({
          dispatch_status: 'dispatched',
          dispatched_at: new Date().toISOString()
        })
        .eq('id', supplyId);

      if (error) throw error;
      
      toast.success('Material marked as dispatched');
      fetchTrackingData();
    } catch (error) {
      console.error('Error updating dispatch status:', error);
      toast.error('Failed to update dispatch status');
    }
  };

  const getStatusBadge = (item: MaterialTracking) => {
    if (item.received_status === 'received') {
      return <Badge className="bg-green-500">Delivered & Received</Badge>;
    } else if (item.dispatch_status === 'dispatched') {
      return <Badge className="bg-blue-500">In Transit</Badge>;
    } else if (item.dispatch_status === 'ready_to_dispatch') {
      return <Badge className="bg-yellow-500">Ready to Dispatch</Badge>;
    } else {
      return <Badge className="bg-gray-500">Pending</Badge>;
    }
  };

  const filteredData = trackingData.filter(item =>
    searchQR === '' || item.qr_code.toLowerCase().includes(searchQR.toLowerCase())
  );

  if (loading) {
    return <div className="p-6">Loading tracking data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Material Tracking Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="searchQR">Search by QR Code</Label>
              <Input
                id="searchQR"
                placeholder="Enter QR code to track..."
                value={searchQR}
                onChange={(e) => setSearchQR(e.target.value)}
              />
            </div>
            <Button onClick={fetchTrackingData}>
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{trackingData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Truck className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">In Transit</p>
                <p className="text-2xl font-bold">
                  {trackingData.filter(item => item.dispatch_status === 'dispatched' && !item.matched).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold">
                  {trackingData.filter(item => item.matched).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  {trackingData.filter(item => item.dispatch_status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tracking Table */}
      <Card>
        <CardHeader>
          <CardTitle>Material Tracking Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>QR Code</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-sm">
                    {item.qr_code}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      {item.material_type}
                    </div>
                  </TableCell>
                  <TableCell>{item.batch_number || 'N/A'}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{getStatusBadge(item)}</TableCell>
                  <TableCell>
                    {item.supplier_name && (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        {item.supplier_name}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.project_name && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {item.project_name}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {userRole === 'supplier' && 
                       item.dispatch_status === 'ready_to_dispatch' && (
                        <Button
                          size="sm"
                          onClick={() => markAsDispatched(item.id)}
                        >
                          Mark Dispatched
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No tracking data found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MaterialTrackingDashboard;