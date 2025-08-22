import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Star, Package, Store, FileText } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SupplierRegistrationForm from "@/components/SupplierRegistrationForm";
import ReceiptPortal from "@/components/ReceiptPortal";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Suppliers = () => {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [supplierId, setSupplierId] = useState<string | null>(null);
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
        .select('id, role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching user role:', profileError);
      } else {
        setUserRole(profileData?.role || null);

        // If user is a supplier, get their supplier ID
        if (profileData?.role === 'supplier') {
          const { data: supplierData, error: supplierError } = await supabase
            .from('suppliers')
            .select('id')
            .eq('user_id', profileData.id)
            .maybeSingle();

          if (supplierError) {
            console.error('Error fetching supplier ID:', supplierError);
          } else {
            setSupplierId(supplierData?.id || null);
          }
        }
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    } finally {
      setLoading(false);
    }
  };

  const suppliers = [
    {
      name: "Bamburi Cement",
      location: "Mombasa", 
      rating: 4.8,
      products: 150,
      categories: ["Cement", "Concrete", "Building Solutions"],
      logo: "https://sl.bing.net/cQRoNrqCKWq"
    },
    {
      name: "Simba Cement",
      location: "Nairobi",
      rating: 4.7,
      products: 120,
      categories: ["Cement", "Lime", "Concrete Products"],
      logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop&crop=center"
    },
    {
      name: "ARM Cement",
      location: "Kaloleni",
      rating: 4.6,
      products: 110,
      categories: ["Cement", "Steel", "Construction Materials"],
      logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=80&h=80&fit=crop&crop=center"
    },
    {
      name: "Devki Steel Mills",
      location: "Ruiru",
      rating: 4.9,
      products: 200,
      categories: ["Steel", "Iron Sheets", "Wire Products"],
      logo: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=80&h=80&fit=crop&crop=center"
    },
    {
      name: "Kenbro Industries",
      location: "Nairobi",
      rating: 4.5,
      products: 180,
      categories: ["Tiles", "Ceramics", "Sanitary Ware"],
      logo: "https://images.unsplash.com/photo-1616047006789-b7af710a8688?w=80&h=80&fit=crop&crop=center"
    },
    {
      name: "Crown Paints Kenya",
      location: "Nairobi",
      rating: 4.7,
      products: 300,
      categories: ["Paint", "Coatings", "Construction Chemicals"],
      logo: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=80&h=80&fit=crop&crop=center"
    },
    {
      name: "Sadolin Paints",
      location: "Nairobi",
      rating: 4.6,
      products: 250,
      categories: ["Paint", "Wood Finishes", "Industrial Coatings"],
      logo: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=80&h=80&fit=crop&crop=center"
    },
    {
      name: "Athi River Steel Plant",
      location: "Athi River",
      rating: 4.4,
      products: 160,
      categories: ["Steel", "Iron Bars", "Construction Steel"],
      logo: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=80&h=80&fit=crop&crop=center"
    },
    {
      name: "Tile & Carpet Centre",
      location: "Nairobi",
      rating: 4.6,
      products: 240,
      categories: ["Tiles", "Carpets", "Flooring Solutions"],
      logo: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=80&h=80&fit=crop&crop=center"
    },
    {
      name: "Mabati Rolling Mills",
      location: "Nairobi",
      rating: 4.8,
      products: 180,
      categories: ["Iron Sheets", "Roofing", "Steel Products"],
      logo: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=80&h=80&fit=crop&crop=center"
    },
    {
      name: "Chandaria Industries",
      location: "Nairobi",
      rating: 4.6,
      products: 170,
      categories: ["Pipes", "Plumbing", "Water Systems"],
      logo: "https://images.unsplash.com/photo-1621905252472-e8be3d5a2c8d?w=80&h=80&fit=crop&crop=center"
    },
    {
      name: "Homa Lime Company",
      location: "Homa Bay",
      rating: 4.4,
      products: 90,
      categories: ["Lime", "Aggregates", "Mining Products"],
      logo: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=80&h=80&fit=crop&crop=center"
    },
    {
      name: "East African Portland Cement",
      location: "Athi River",
      rating: 4.5,
      products: 130,
      categories: ["Cement", "Lime", "Aggregates"],
      logo: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=80&h=80&fit=crop&crop=center"
    },
    {
      name: "Kenblest Steel Fabricators",
      location: "Nairobi",
      rating: 4.7,
      products: 220,
      categories: ["Steel Fabrication", "Structural Steel", "Metalwork"],
      logo: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=80&h=80&fit=crop&crop=center"
    },
    {
      name: "Kaluworks Company",
      location: "Nairobi",
      rating: 4.5,
      products: 200,
      categories: ["Aluminum", "Roofing", "Windows & Doors"],
      logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=80&h=80&fit=crop&crop=center"
    },
    {
      name: "General Plastics Limited",
      location: "Nairobi",
      rating: 4.4,
      products: 150,
      categories: ["Plastic Products", "Pipes", "Water Tanks"],
      logo: "https://images.unsplash.com/photo-1621905252472-e8be3d5a2c8d?w=80&h=80&fit=crop&crop=center"
    },
    {
      name: "Nakuru Steel Fabricators",
      location: "Nakuru",
      rating: 4.3,
      products: 140,
      categories: ["Steel", "Iron Bars", "Fabrication"],
      logo: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=80&h=80&fit=crop&crop=center"
    },
    {
      name: "Kisumu Hardware Depot",
      location: "Kisumu",
      rating: 4.5,
      products: 320,
      categories: ["Hardware", "Tools", "Building Materials"],
      logo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&h=80&fit=crop&crop=center"
    },
    {
      name: "Eldoret Building Supplies",
      location: "Eldoret",
      rating: 4.4,
      products: 280,
      categories: ["Timber", "Hardware", "Roofing Materials"],
      logo: "https://images.unsplash.com/photo-1473445730015-841f29a9490b?w=80&h=80&fit=crop&crop=center"
    },
    {
      name: "Mombasa Timber Merchants",
      location: "Mombasa",
      rating: 4.6,
      products: 210,
      categories: ["Timber", "Plywood", "Wood Products"],
      logo: "https://images.unsplash.com/photo-1473445730015-841f29a9490b?w=80&h=80&fit=crop&crop=center"
    },
    {
      name: "Thika Steel Works",
      location: "Thika",
      rating: 4.3,
      products: 160,
      categories: ["Steel", "Wire", "Construction Steel"],
      logo: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=80&h=80&fit=crop&crop=center"
    },
    {
      name: "Machakos Quarries",
      location: "Machakos",
      rating: 4.2,
      products: 80,
      categories: ["Aggregates", "Stone", "Sand"],
      logo: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=80&h=80&fit=crop&crop=center"
    },
    {
      name: "Nyeri Building Materials",
      location: "Nyeri",
      rating: 4.4,
      products: 190,
      categories: ["Cement", "Hardware", "Roofing"],
      logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=80&h=80&fit=crop&crop=center"
    },
    {
      name: "Meru Construction Supplies",
      location: "Meru",
      rating: 4.3,
      products: 170,
      categories: ["Tiles", "Paint", "Hardware"],
      logo: "https://images.unsplash.com/photo-1616047006789-b7af710a8688?w=80&h=80&fit=crop&crop=center"
    }
  ];

  const categories = [
    { name: "Cement & Concrete", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=150&h=150&fit=crop" },
    { name: "Steel & Iron", image: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=150&h=150&fit=crop" },
    { name: "Tiles & Ceramics", image: "https://images.unsplash.com/photo-1616047006789-b7af710a8688?w=150&h=150&fit=crop" },
    { name: "Paint & Coatings", image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=150&h=150&fit=crop" },
    { name: "Timber & Wood", image: "https://images.unsplash.com/photo-1473445730015-841f29a9490b?w=150&h=150&fit=crop" },
    { name: "Hardware & Tools", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=150&h=150&fit=crop" },
    { name: "Plumbing & Pipes", image: "https://images.unsplash.com/photo-1621905252472-e8be3d5a2c8d?w=150&h=150&fit=crop" },
    { name: "Electrical & Wiring", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop" },
    { name: "Roofing Materials", image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=150&h=150&fit=crop" },
    { name: "Windows & Doors", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&h=150&fit=crop" },
    { name: "Insulation", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=150&h=150&fit=crop" },
    { name: "Flooring", image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=150&h=150&fit=crop" },
    { name: "Aggregates & Sand", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=150&h=150&fit=crop" },
    { name: "Waterproofing", image: "https://images.unsplash.com/photo-1558618047-67bc5c4c2a50?w=150&h=150&fit=crop" },
    { name: "Glass & Glazing", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop" },
    { name: "Safety Equipment", image: "https://images.unsplash.com/photo-1558618020-20d64c1ae3c6?w=150&h=150&fit=crop" },
    { name: "Masonry & Blocks", image: "https://images.unsplash.com/photo-1459767129954-1b1c1f9b9ace?w=150&h=150&fit=crop" },
    { name: "Adhesives & Sealants", image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=150&h=150&fit=crop" },
    { name: "HVAC Systems", image: "https://images.unsplash.com/photo-1616047006789-b7af710a8688?w=150&h=150&fit=crop" },
    { name: "Landscape Materials", image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=150&h=150&fit=crop" },
  ];

  if (showRegistrationForm) {
    return (
      <div className="min-h-screen bg-gradient-construction">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Button 
            variant="outline" 
            onClick={() => setShowRegistrationForm(false)}
            className="mb-6"
          >
            ← Back to Suppliers
          </Button>
          <SupplierRegistrationForm />
        </div>
        <Footer />
      </div>
    );
  }

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
          <h1 className="text-4xl font-bold mb-4">Reliable Material Suppliers</h1>
          <p className="text-xl mb-8 opacity-90">Source quality construction materials from verified suppliers nationwide</p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input 
                placeholder="Search suppliers or materials..." 
                className="pl-10 py-6 text-lg bg-white"
              />
            </div>
            <Button size="lg" className="bg-green-600 hover:bg-green-700 px-8">
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10 gap-4">
            {categories.map((category, index) => (
              <Card key={index} className="text-center cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="py-6">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-lg overflow-hidden bg-muted">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-sm font-medium">{category.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-black">500+</div>
              <div className="text-gray-600">Verified Suppliers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">15,000+</div>
              <div className="text-gray-600">Products Listed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600">47</div>
              <div className="text-gray-600">Counties Served</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-black">24/7</div>
              <div className="text-gray-600">Customer Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Suppliers Directory */}
      <section className="py-16 bg-accent">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Material Suppliers Across Kenya</h2>
            <Button variant="outline">View All Suppliers</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {suppliers.map((supplier, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                    {supplier.logo ? (
                      <img 
                        src={supplier.logo} 
                        alt={`${supplier.name} logo`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Store className="h-8 w-8 text-gray-600" />
                    )}
                  </div>
                  <CardTitle className="text-lg">{supplier.name}</CardTitle>
                  <CardDescription className="flex items-center justify-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {supplier.location}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-semibold">{supplier.rating}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Package className="h-4 w-4" />
                      {supplier.products} products
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4 justify-center">
                    {supplier.categories.map((category, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    View Catalog
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
          <h2 className="text-3xl font-bold mb-4">Become a Supplier</h2>
          <p className="text-xl mb-8 opacity-90">List your products and reach thousands of builders across Kenya</p>
          <Button 
            size="lg" 
            className="bg-white text-black hover:bg-gray-100 text-lg px-8 py-4"
            onClick={() => setShowRegistrationForm(true)}
          >
            Register as Supplier
          </Button>
        </div>
      </section>

      {/* Receipt Portal for Suppliers */}
      {userRole === 'supplier' && (
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold">Receipt Management</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Upload and manage your material receipts and documentation
            </p>
            <ReceiptPortal userRole={userRole} supplierId={supplierId || undefined} />
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Suppliers;
