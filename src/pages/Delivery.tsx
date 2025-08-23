import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { DeliveryContent } from "@/components/DeliveryContent";
import { CommunicationContent } from "@/components/CommunicationContent";

const Delivery = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <Navigation />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">
                <span className="text-black">Delivery</span>{' '}
                <span className="text-red-600">Services</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Connect delivery providers with builders for efficient material transportation
              </p>
            </div>
            
            <Tabs defaultValue="delivery" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
                <TabsTrigger value="delivery">Delivery Portal</TabsTrigger>
                <TabsTrigger value="communication">Communication</TabsTrigger>
              </TabsList>
              
              <TabsContent value="delivery">
                <DeliveryContent />
              </TabsContent>
              
              <TabsContent value="communication">
                <CommunicationContent />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Delivery;