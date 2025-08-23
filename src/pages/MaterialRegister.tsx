import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { SiteMaterialRegister } from '@/components/SiteMaterialRegister';

const MaterialRegister: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <SiteMaterialRegister />
      </main>
      <Footer />
    </div>
  );
};

export default MaterialRegister;