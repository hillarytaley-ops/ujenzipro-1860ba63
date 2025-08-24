import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Package, Phone, MapPin, MoreHorizontal, User } from 'lucide-react';
import { Delivery, DeliveryStatus, UserRole } from '@/hooks/useDeliveryData';
import { SecureDriverInfo } from '@/components/SecureDriverInfo';

interface DeliveryTableProps {
  deliveries: Delivery[];
  userRole: UserRole | null;
  onStatusUpdate: (deliveryId: string, status: DeliveryStatus) => void;
}

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-gray-500' },
  picked_up: { label: 'Picked Up', color: 'bg-blue-500' },
  in_transit: { label: 'In Transit', color: 'bg-yellow-500' },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-orange-500' },
  delivered: { label: 'Delivered', color: 'bg-green-500' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500' }
};

export const DeliveryTable: React.FC<DeliveryTableProps> = ({
  deliveries,
  userRole,
  onStatusUpdate
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: DeliveryStatus) => {
    const config = statusConfig[status];
    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    );
  };

  if (deliveries.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium">No deliveries found</h3>
        <p className="text-muted-foreground">
          {userRole === 'supplier' 
            ? 'Create your first delivery to get started'
            : 'No deliveries have been assigned to you yet'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tracking #</TableHead>
            <TableHead>Material</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Pickup</TableHead>
            <TableHead>Delivery</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Driver Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deliveries.map((delivery) => (
            <TableRow key={delivery.id}>
              <TableCell className="font-mono text-sm">
                {delivery.tracking_number}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{delivery.material_type}</div>
                    <div className="text-sm text-muted-foreground">
                      {delivery.weight_kg}kg
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{delivery.quantity}</TableCell>
              <TableCell>{getStatusBadge(delivery.status)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate max-w-32" title="Area only - full address protected">
                    {delivery.pickup_address ? 
                      delivery.pickup_address.split(',').pop()?.trim() || 'Pickup area' : 
                      'Not specified'
                    }
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate max-w-32" title="Area only - full address protected">
                    {delivery.delivery_address ? 
                      delivery.delivery_address.split(',').pop()?.trim() || 'Delivery area' : 
                      'Not specified'
                    }
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {delivery.projects?.name && (
                  <Badge variant="outline" className="text-xs">
                    {delivery.projects.name}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <SecureDriverInfo
                  deliveryId={delivery.id}
                  driverName={delivery.driver_name}
                  driverPhone={delivery.driver_phone}
                  userRole={userRole || 'builder'}
                  canAccess={delivery.can_view_driver_contact || false}
                />
              </TableCell>
              <TableCell>
                {userRole === 'supplier' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {delivery.status === 'pending' && (
                        <DropdownMenuItem onClick={() => onStatusUpdate(delivery.id, 'picked_up')}>
                          Mark as Picked Up
                        </DropdownMenuItem>
                      )}
                      {delivery.status === 'picked_up' && (
                        <DropdownMenuItem onClick={() => onStatusUpdate(delivery.id, 'in_transit')}>
                          Mark as In Transit
                        </DropdownMenuItem>
                      )}
                      {delivery.status === 'in_transit' && (
                        <DropdownMenuItem onClick={() => onStatusUpdate(delivery.id, 'out_for_delivery')}>
                          Mark as Out for Delivery
                        </DropdownMenuItem>
                      )}
                      {delivery.status === 'out_for_delivery' && (
                        <DropdownMenuItem onClick={() => onStatusUpdate(delivery.id, 'delivered')}>
                          Mark as Delivered
                        </DropdownMenuItem>
                      )}
                      {delivery.status !== 'delivered' && delivery.status !== 'cancelled' && (
                        <DropdownMenuItem 
                          onClick={() => onStatusUpdate(delivery.id, 'cancelled')}
                          className="text-destructive"
                        >
                          Cancel Delivery
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};