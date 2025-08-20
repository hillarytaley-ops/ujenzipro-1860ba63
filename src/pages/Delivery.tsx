import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import DeliveryPortal from "@/components/DeliveryPortal";

const Delivery = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <Navigation />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Delivery Services
              </h1>
              <p className="text-lg text-muted-foreground">
                Connect delivery providers with builders for efficient material transportation
              </p>
            </div>
            <DeliveryPortal />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Delivery;