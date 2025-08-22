import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import DeliveryManagement from '@/components/DeliveryManagement';
import DroneController from '@/components/DroneController';

const Tracking = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8 space-y-8">
          <DroneController 
            siteCoordinates={{ latitude: -1.2921, longitude: 36.8219 }}
          />
          <DeliveryManagement />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Tracking;