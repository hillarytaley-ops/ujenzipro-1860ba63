import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SupplyAcknowledgement from '@/components/SupplyAcknowledgement';

const SupplyAcknowledgementPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          <SupplyAcknowledgement />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SupplyAcknowledgementPage;