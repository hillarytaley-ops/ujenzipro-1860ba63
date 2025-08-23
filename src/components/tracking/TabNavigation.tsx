import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, ChevronDown, Package, FileText, Truck, Eye, Clock, MapPin, Building2 } from 'lucide-react';
import { UserRole } from '@/hooks/useDeliveryData';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSecureTabAccess: (tab: string) => void;
  user: any;
  userRole: UserRole | null;
  userProfile: any;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  onSecureTabAccess,
  user,
  userRole,
  userProfile
}) => {
  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'tracker': return 'Live Tracking';
      case 'orders': return 'Order Management';
      case 'material-tracking': return 'Material Tracking';
      case 'camera': return 'Security Cameras';
      case 'qr-scanner': return 'QR Scanner';
      case 'live-monitor': return 'Live Monitor';
      case 'drone-control': return 'Aerial Control';
      case 'grn': return 'Goods Received';
      case 'delivery-management': return 'Delivery Management';
      default: return tab;
    }
  };

  return (
    <>
      {/* Mobile Navigation */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <span className="flex items-center gap-2">
                <Menu className="h-4 w-4" />
                {getTabLabel(activeTab)}
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-screen max-w-xs bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border shadow-lg">
            <DropdownMenuItem 
              onClick={() => onTabChange('tracker')}
              className="cursor-pointer py-3 px-4"
            >
              <Package className="h-4 w-4 mr-2" />
              Live Tracking
            </DropdownMenuItem>
            
            {user && (userRole === 'admin' || userRole === 'supplier') && (
              <DropdownMenuItem 
                onClick={() => onSecureTabAccess('orders')}
                className="cursor-pointer py-3 px-4"
              >
                <FileText className="h-4 w-4 mr-2" />
                Order Management
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem 
              onClick={() => onSecureTabAccess('material-tracking')}
              className="cursor-pointer py-3 px-4"
            >
              <Truck className="h-4 w-4 mr-2" />
              Material Tracking
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => onSecureTabAccess('camera')}
              className="cursor-pointer py-3 px-4"
            >
              <Eye className="h-4 w-4 mr-2" />
              Security Cameras
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => onSecureTabAccess('qr-scanner')}
              className="cursor-pointer py-3 px-4"
            >
              <Package className="h-4 w-4 mr-2" />
              QR Scanner
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => onSecureTabAccess('live-monitor')}
              className="cursor-pointer py-3 px-4"
            >
              <Clock className="h-4 w-4 mr-2" />
              Live Monitor
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => onSecureTabAccess('drone-control')}
              className="cursor-pointer py-3 px-4"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Aerial Control
            </DropdownMenuItem>
            
            {user && userProfile && (userProfile.role === 'admin' || 
             (userProfile.role === 'builder' && 
              (userProfile.user_type === 'company' || userProfile.is_professional === true))) && (
              <DropdownMenuItem 
                onClick={() => onSecureTabAccess('grn')}
                className="cursor-pointer py-3 px-4"
              >
                <FileText className="h-4 w-4 mr-2" />
                Goods Received
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem 
              onClick={() => onSecureTabAccess('delivery-management')}
              className="cursor-pointer py-3 px-4 border-t border-border/50 mt-2 pt-3"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Delivery Management
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <TabsList className="inline-flex w-full justify-start overflow-x-auto bg-muted rounded-lg p-1 gap-2">
          <TabsTrigger value="tracker" className="px-4 py-2 text-sm whitespace-nowrap">
            Live Tracking
          </TabsTrigger>
          
          {user && (userRole === 'admin' || userRole === 'supplier') && (
            <TabsTrigger 
              value="orders"
              onClick={() => onSecureTabAccess('orders')}
              className="px-4 py-2 text-sm whitespace-nowrap"
            >
              Order Management
            </TabsTrigger>
          )}
          
          <TabsTrigger 
            value="material-tracking"
            onClick={() => onSecureTabAccess('material-tracking')}
            className="px-4 py-2 text-sm whitespace-nowrap"
          >
            Material Tracking
          </TabsTrigger>
          
          <TabsTrigger 
            value="camera"
            onClick={() => onSecureTabAccess('camera')}
            className="px-4 py-2 text-sm whitespace-nowrap"
          >
            Security Cameras
          </TabsTrigger>
          
          <TabsTrigger 
            value="qr-scanner"
            onClick={() => onSecureTabAccess('qr-scanner')}
            className="px-4 py-2 text-sm whitespace-nowrap"
          >
            QR Scanner
          </TabsTrigger>
          
          <TabsTrigger 
            value="live-monitor"
            onClick={() => onSecureTabAccess('live-monitor')}
            className="px-4 py-2 text-sm whitespace-nowrap"
          >
            Live Monitor
          </TabsTrigger>
          
          <TabsTrigger 
            value="drone-control"
            onClick={() => onSecureTabAccess('drone-control')}
            className="px-4 py-2 text-sm whitespace-nowrap"
          >
            Aerial Control
          </TabsTrigger>
          
          {user && userProfile && (userProfile.role === 'admin' || 
           (userProfile.role === 'builder' && 
            (userProfile.user_type === 'company' || userProfile.is_professional === true))) && (
            <TabsTrigger 
              value="grn"
              onClick={() => onSecureTabAccess('grn')}
              className="px-4 py-2 text-sm whitespace-nowrap"
            >
              Goods Received
            </TabsTrigger>
          )}
          
          <TabsTrigger 
            value="delivery-management"
            onClick={() => onSecureTabAccess('delivery-management')}
            className="px-4 py-2 text-sm whitespace-nowrap ml-8"
          >
            Delivery Management
          </TabsTrigger>
        </TabsList>
      </div>
    </>
  );
};