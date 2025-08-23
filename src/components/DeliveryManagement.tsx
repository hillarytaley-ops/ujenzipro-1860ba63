import React, { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';

import DeliveryTracker from './DeliveryTracker';
import OrderManagement from './OrderManagement';
import MaterialTrackingDashboard from './MaterialTrackingDashboard';
import CameraControls from './CameraControls';
import QRScanner from './QRScanner';
import LiveStreamMonitor from './LiveStreamMonitor';
import DroneController from './DroneController';
import GoodsReceivedNote from './GoodsReceivedNote';

import { TrackingDashboard } from './tracking/TrackingDashboard';
import { TabNavigation } from './tracking/TabNavigation';
import { AccessControl } from './tracking/AccessControl';
import { useDeliveryData } from '@/hooks/useDeliveryData';

const DeliveryManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tracker');
  const [hasSecurityAccess, setHasSecurityAccess] = useState(false);
  const [showAccessDialog, setShowAccessDialog] = useState(false);
  
  const {
    userProjects,
    userRole,
    user,
    userProfile,
    loading
  } = useDeliveryData();
  
  const { toast } = useToast();

  const handleSecureTabAccess = (tabValue: string) => {
    if (userRole === 'admin') {
      setActiveTab(tabValue);
    } else if (userRole === 'builder') {
      if (hasSecurityAccess) {
        setActiveTab(tabValue);
      } else {
        setShowAccessDialog(true);
      }
    }
  };

  const handleCameraConnected = (camera: any) => {
    toast({ 
      title: "Camera Connected", 
      description: `${camera.name} is now available for streaming` 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading tracking system...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          <span className="text-primary">Live</span>{' '}
          <span className="text-accent">Tracking</span>
        </h1>
        <p className="text-muted-foreground">
          Comprehensive delivery tracking and material monitoring system
        </p>
        {user && userRole && (
          <div className="mt-2">
            <Badge variant="outline" className="capitalize">
              <User className="h-3 w-3 mr-1" />
              {userRole}
            </Badge>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSecureTabAccess={handleSecureTabAccess}
          user={user}
          userRole={userRole}
          userProfile={userProfile}
        />

        <TabsContent value="tracker">
          <DeliveryTracker />
        </TabsContent>

        <TabsContent value="orders">
          <OrderManagement />
        </TabsContent>

        <TabsContent value="material-tracking">
          <MaterialTrackingDashboard />
        </TabsContent>

        <TabsContent value="camera">
          <CameraControls 
            onQRCodeScanned={(data) => {
              toast({ description: `QR Code Detected: ${data}` });
            }}
            onMaterialDetected={(material) => {
              toast({ description: `Material Detected: ${material.type}` });
            }}
          />
        </TabsContent>

        <TabsContent value="qr-scanner">
          <QRScanner 
            onMaterialScanned={(material) => {
              toast({ description: `Material Scanned: ${material.materialType}` });
            }}
          />
        </TabsContent>

        <TabsContent value="live-monitor">
          <LiveStreamMonitor />
        </TabsContent>

        <TabsContent value="drone-control">
          <DroneController 
            siteCoordinates={{ latitude: -1.2921, longitude: 36.8219 }}
          />
        </TabsContent>

        <TabsContent value="grn">
          <GoodsReceivedNote />
        </TabsContent>

        <TabsContent value="delivery-management">
          <TrackingDashboard />
        </TabsContent>
      </Tabs>

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

export default DeliveryManagement;