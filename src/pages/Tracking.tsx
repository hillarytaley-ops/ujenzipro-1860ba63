import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import DeliveryManagement from '@/components/DeliveryManagement';
import { SiteMaterialRegister } from '@/components/SiteMaterialRegister';

const Tracking = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="tracking" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-4">
              <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
              <TabsTrigger value="manage">Material Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tracking">
              <DeliveryManagement />
            </TabsContent>
            
            <TabsContent value="manage">
              <SiteMaterialRegister />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Tracking;