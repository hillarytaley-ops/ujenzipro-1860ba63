import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Star, Package, Store, FileText } from "lucide-react";
import SupplierRegistrationForm from "@/components/SupplierRegistrationForm";
import ReceiptPortal from "@/components/ReceiptPortal";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const suppliers = [
  {
    name: "Bamburi Cement",
    location: "Mombasa", 
    rating: 4.8,
    products: 150,
    categories: ["Cement", "Concrete", "Building Solutions"],
    logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop&crop=center"
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
  }
];

export const SuppliersContent = () => {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [filteredSuppliers, setFilteredSuppliers] = useState(suppliers);

  useEffect(() => {
    checkUserRole();
  }, []);

  useEffect(() => {
    const filtered = suppliers.filter(supplier => {
      const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === "All Categories" || 
                             supplier.categories.includes(selectedCategory);
      
      return matchesSearch && matchesCategory;
    });
    setFilteredSuppliers(filtered);
  }, [searchTerm, selectedCategory]);

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


  const categories = [
    { name: "All Categories", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=150&h=150&fit=crop" },
    { name: "Cement", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=150&h=150&fit=crop" },
    { name: "Steel", image: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=150&h=150&fit=crop" },
    { name: "Tiles", image: "https://images.unsplash.com/photo-1616047006789-b7af710a8688?w=150&h=150&fit=crop" },
    { name: "Paint", image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=150&h=150&fit=crop" },
    { name: "Timber", image: "https://images.unsplash.com/photo-1473445730015-841f29a9490b?w=150&h=150&fit=crop" },
    { name: "Hardware", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=150&h=150&fit=crop" },
    { name: "Plumbing", image: "https://images.unsplash.com/photo-1621905252472-e8be3d5a2c8d?w=150&h=150&fit=crop" },
    { name: "Electrical", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop" }
  ];

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-64 bg-muted rounded-lg"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (showRegistrationForm) {
    return (
      <div className="space-y-6">
        <Button 
          variant="outline" 
          onClick={() => setShowRegistrationForm(false)}
          className="mb-6"
        >
          ← Back to Suppliers
        </Button>
        <SupplierRegistrationForm />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section 
        className="text-white py-16 relative rounded-lg overflow-hidden"
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
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search suppliers or materials..." 
                className="pl-10 py-6 text-lg bg-card text-card-foreground"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button size="lg" className="bg-primary hover:bg-primary/90 px-8">
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-muted rounded-lg">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <Card 
                key={index} 
                className={`text-center cursor-pointer hover:shadow-md transition-all ${
                  selectedCategory === category.name ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
                onClick={() => setSelectedCategory(category.name)}
              >
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
      <section className="py-12 bg-secondary rounded-lg">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-foreground">500+</div>
              <div className="text-muted-foreground">Verified Suppliers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">15,000+</div>
              <div className="text-muted-foreground">Products Listed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-construction-orange">47</div>
              <div className="text-muted-foreground">Counties Served</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground">24/7</div>
              <div className="text-muted-foreground">Customer Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Suppliers Directory */}
      <section className="py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Material Suppliers Across Kenya</h2>
            <p className="text-muted-foreground mt-2">
              Showing {filteredSuppliers.length} of {suppliers.length} suppliers
              {selectedCategory !== "All Categories" && ` in ${selectedCategory}`}
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>
          <Button variant="outline">View All Suppliers</Button>
        </div>
        
        {filteredSuppliers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No suppliers found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or filter criteria</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All Categories");
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuppliers.map((supplier, index) => (
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
        )}
      </section>

      {/* Call to Action Section */}
      <section className="py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Join Our Supplier Network</h2>
          <p className="text-lg opacity-90 mb-8">Expand your reach and connect with thousands of builders and contractors across Kenya</p>
          <div className="flex justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90"
              onClick={() => setShowRegistrationForm(true)}
            >
              Register as Supplier
            </Button>
            {userRole === 'supplier' && supplierId && (
              <ReceiptPortal supplierId={supplierId} />
            )}
          </div>
        </div>
      </section>
    </div>
  );
};