
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MapPin, ShoppingCart, Building2, Package, FileText } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ReceiptPortal from "@/components/ReceiptPortal";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Import builder images
import kamauConstructionImg from "@/assets/kamau-construction.jpg";
import johnMwangiImg from "@/assets/john-mwangi.jpg";
import njeriConstructionImg from "@/assets/njeri-construction.jpg";
import peterOtienoImg from "@/assets/peter-otieno.jpg";
import graceWanjikuImg from "@/assets/grace-wanjiku.jpg";
import otienoContractorsImg from "@/assets/otieno-contractors.jpg";

const Builders = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching user role:', profileError);
      } else {
        setUserRole(profileData?.role || null);
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    } finally {
      setLoading(false);
    }
  };

  const builders = [
    {
      name: "Kamau Construction Ltd",
      location: "Nairobi",
      type: "Company",
      projectsActive: 12,
      materialsNeeded: ["Cement", "Steel Bars", "Roofing Sheets"],
      budget: "Ksh 2M - 5M",
      image: kamauConstructionImg
    },
    {
      name: "John Mwangi Construction",
      location: "Kisumu", 
      type: "Individual",
      projectsActive: 3,
      materialsNeeded: ["Bricks", "Sand", "Cement"],
      budget: "Ksh 500K - 1M",
      image: johnMwangiImg
    },
    {
      name: "Njeri Development Co.",
      location: "Mombasa",
      type: "Company",
      projectsActive: 8,
      materialsNeeded: ["Concrete Blocks", "Paint", "Tiles"],
      budget: "Ksh 1M - 3M",
      image: njeriConstructionImg
    },
    {
      name: "Peter Otieno Builder",
      location: "Nakuru",
      type: "Individual",
      projectsActive: 5,
      materialsNeeded: ["Iron Sheets", "Timber", "Nails"],
      budget: "Ksh 300K - 800K",
      image: peterOtienoImg
    },
    {
      name: "Grace Wanjiku Constructions",
      location: "Eldoret",
      type: "Individual",
      projectsActive: 4,
      materialsNeeded: ["Doors", "Windows", "Hardware"],
      budget: "Ksh 600K - 1.2M",
      image: graceWanjikuImg
    },
    {
      name: "Otieno Builders Ltd",
      location: "Meru",
      type: "Company",
      projectsActive: 15,
      materialsNeeded: ["Aggregates", "Steel", "Waterproofing"],
      budget: "Ksh 3M - 8M",
      image: otienoContractorsImg
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-construction">
      <Navigation />

      {/* Hero Section */}
      <section 
        className="text-white py-16 relative"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/lovable-uploads/6ea15a8f-a981-4c02-a56e-64ed62ab7a57.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-black">Material</span>{' '}
            <span className="text-red-600">Buyers</span>{' '}
            <span className="text-green-600">Marketplace</span>
          </h1>
          <p className="text-xl mb-8 opacity-90">Connect suppliers with builders who need construction materials - from small projects to large developments</p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
               <Input 
                placeholder="Search buyers by location or materials needed..." 
                className="pl-10 py-6 text-lg bg-white"
              />
            </div>
            <Button size="lg" className="bg-green-600 hover:bg-green-700 px-8">
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-black">800+</div>
              <div className="text-gray-600">Active Buyers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">2,500+</div>
              <div className="text-gray-600">Material Orders</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600">47</div>
              <div className="text-gray-600">Counties Covered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-black">Ksh 50M+</div>
              <div className="text-gray-600">Monthly Volume</div>
            </div>
          </div>
        </div>
      </section>

      {/* Builders Directory */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Active Material Buyers</h2>
            <Button variant="outline">View All Buyers</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {builders.map((builder, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden">
                    <img 
                      src={builder.image} 
                      alt={builder.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardTitle className="text-lg">{builder.name}</CardTitle>
                  <CardDescription className="flex items-center justify-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {builder.location}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{builder.type}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Package className="h-4 w-4" />
                      {builder.projectsActive} active projects
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Materials Needed:</p>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {builder.materialsNeeded.map((material, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {material}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <Badge variant="outline" className="text-sm">
                      Budget: {builder.budget}
                    </Badge>
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Contact Buyer
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-16 text-white relative"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/lovable-uploads/6ea15a8f-a981-4c02-a56e-64ed62ab7a57.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl font-bold mb-4">Need Construction Materials?</h2>
          <p className="text-xl mb-8 opacity-90">Register as a buyer to connect with verified suppliers and get competitive prices for your construction projects</p>
          <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/80 text-lg px-8 py-4">
            Register as Buyer
          </Button>
        </div>
      </section>

      {/* Receipt Portal for Builders */}
      {userRole === 'builder' && (
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold">Material Receipts</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              View receipts and documentation shared by your suppliers
            </p>
            <ReceiptPortal userRole={userRole} />
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Builders;
