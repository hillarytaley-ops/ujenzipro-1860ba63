import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import DeliveryManagement from '@/components/DeliveryManagement';

const Tracking = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-background">
        <DeliveryManagement />
      </main>
      <Footer />
    </div>
  );
};

export default Tracking;