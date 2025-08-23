import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Package, Truck, Clock, CheckCircle } from 'lucide-react';
import { useDeliveryData } from '@/hooks/useDeliveryData';
import { DeliveryForm } from './DeliveryForm';
import { DeliveryTable } from './DeliveryTable';
import { AccessControl } from './AccessControl';

export const TrackingDashboard: React.FC = () => {
  const {
    deliveries,
    builders,
    projects,
    userProjects,
    loading,
    userRole,
    user,
    userProfile,
    createDelivery,
    updateDeliveryStatus
  } = useDeliveryData();

  const [hasSecurityAccess, setHasSecurityAccess] = useState(false);
  const [showAccessDialog, setShowAccessDialog] = useState(false);

  const handleSecureAccess = () => {
    if (userRole === 'admin') {
      setHasSecurityAccess(true);
    } else if (userRole === 'builder') {
      if (hasSecurityAccess) {
        return;
      } else {
        setShowAccessDialog(true);
      }
    }
  };

  const getDeliveryStats = () => {
    const total = deliveries.length;
    const pending = deliveries.filter(d => d.status === 'pending').length;
    const inTransit = deliveries.filter(d => ['picked_up', 'in_transit', 'out_for_delivery'].includes(d.status)).length;
    const delivered = deliveries.filter(d => d.status === 'delivered').length;

    return { total, pending, inTransit, delivered };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading delivery data...</span>
      </div>
    );
  }

  const stats = getDeliveryStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">
            {userRole === 'supplier' ? 'Your Deliveries' : 'Delivery Management'}
          </h2>
          <p className="text-muted-foreground">
            {userRole === 'supplier' 
              ? 'Create and manage material deliveries'
              : 'Track and monitor delivery operations'
            }
          </p>
        </div>

        {user && userRole && (
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="capitalize">
              <User className="h-3 w-3 mr-1" />
              {userRole}
            </Badge>
            {userProfile?.company_name && (
              <Badge variant="secondary">
                {userProfile.company_name}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting pickup</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inTransit}</div>
            <p className="text-xs text-muted-foreground">On the way</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.delivered}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      {userRole === 'supplier' && (
        <div className="flex justify-end">
          <DeliveryForm 
            onSubmit={createDelivery}
            builders={builders}
            projects={projects}
          />
        </div>
      )}

      {/* Deliveries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery List</CardTitle>
          <CardDescription>
            {userRole === 'supplier' 
              ? 'Manage your delivery requests and track their progress'
              : 'Monitor all delivery operations and their current status'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeliveryTable 
            deliveries={deliveries}
            userRole={userRole}
            onStatusUpdate={updateDeliveryStatus}
          />
        </CardContent>
      </Card>

      {/* Access Control Dialog */}
      <AccessControl
        isOpen={showAccessDialog}
        onClose={() => setShowAccessDialog(false)}
        onAccessGranted={() => setHasSecurityAccess(true)}
        userProjects={userProjects}
        userRole={userRole}
      />
    </div>
  );
};