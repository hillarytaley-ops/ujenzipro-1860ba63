import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SuppliersContent } from "@/components/SuppliersContent";
import { MaterialsContent } from "@/components/MaterialsContent";

const Suppliers = () => {
  return (
    <div className="min-h-screen bg-gradient-construction">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="suppliers" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
          </TabsList>
          
          <TabsContent value="suppliers">
            <SuppliersContent />
          </TabsContent>
          
          <TabsContent value="materials">
            <MaterialsContent />
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

export default Suppliers;