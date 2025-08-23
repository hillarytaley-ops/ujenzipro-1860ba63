import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter, Grid, List, Star, MapPin, ShoppingCart } from "lucide-react";
import { QuotationRequestDialog } from "@/components/QuotationRequestDialog";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const materials = [
  {
    name: "Bamburi Cement 50kg",
    supplier: "Bamburi Cement",
    location: "Nairobi", 
    price: "KSh 650",
    rating: 4.8,
    image: "https://bamburigroup.com/wp-content/uploads/2025/03/buy-bamburi-Nguvu-cement-2.jpg",
    category: "Cement"
  },
  {
    name: "Steel Rebar 12mm",
    supplier: "Devki Steel Mills",
    location: "Ruiru",
    price: "KSh 85/meter",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=400&h=300&fit=crop",
    category: "Steel"
  },
  {
    name: "Ceramic Floor Tiles",
    supplier: "RAK Ceramics",
    location: "Mombasa",
    price: "KSh 1,200/sqm",
    rating: 4.9,
    image: "https://tse2.mm.bing.net/th/id/OIP.40qwclKORLc6XF2y9jo47wHaGv?rs=1&pid=ImgDetMain&o=7&rm=3",
    category: "Tiles"
  },
  {
    name: "Quarry Stones",
    supplier: "Nairobi Quarries",
    location: "Kasarani",
    price: "KSh 3,500/tonne",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1431576901776-e539bd916ba2?w=400&h=300&fit=crop",
    category: "Aggregates"
  },
  {
    name: "Roofing Iron Sheets",
    supplier: "Mabati Rolling Mills",
    location: "Nakuru",
    price: "KSh 850/sheet",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?w=400&h=300&fit=crop",
    category: "Roofing"
  },
  {
    name: "Paint - Emulsion 20L",
    supplier: "Crown Paints",
    location: "Thika",
    price: "KSh 4,200",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1459767129954-1b1c1f9b9ace?w=400&h=300&fit=crop",
    category: "Paint"
  }
];

export const MaterialsContent = () => {
  const [userProfile, setUserProfile] = useState<{
    id: string;
    role: string;
    company_name?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [filteredMaterials, setFilteredMaterials] = useState(materials);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, role, company_name')
            .eq('user_id', user.id)
            .single();
          
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  useEffect(() => {
    const filtered = materials.filter(material => {
      const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           material.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           material.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           material.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "All Categories" || 
                             material.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
    setFilteredMaterials(filtered);
  }, [searchTerm, selectedCategory]);


  const categories = [
    "All Categories", "Cement", "Steel", "Tiles", "Aggregates", 
    "Roofing", "Paint", "Timber", "Hardware", "Plumbing", "Electrical"
  ];

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-64 bg-muted rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-gradient-hero text-white py-16 rounded-lg">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Construction Materials Marketplace</h1>
          <p className="text-xl mb-8 opacity-90">Find the best prices for quality construction materials - whether you're a professional builder or building your dream home</p>
          
          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Search for materials, suppliers, or categories..." 
                  className="pl-10 py-6 text-lg bg-card text-card-foreground"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button size="lg" className="bg-primary hover:bg-primary/90 px-8">
                Search
              </Button>
            </div>
            
            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.slice(0, 6).map((category, index) => (
                <Badge 
                  key={index} 
                  variant={selectedCategory === category ? "default" : "secondary"} 
                  className="cursor-pointer hover:bg-primary/10 hover:text-primary px-4 py-2"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Filters and View Options */}
      <section className="py-6 bg-muted border-b rounded-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <span className="text-sm text-muted-foreground">
                Showing {filteredMaterials.length} of {materials.length} materials
                {selectedCategory !== "All Categories" && ` in ${selectedCategory}`}
                {searchTerm && ` matching "${searchTerm}"`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Grid className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Materials Grid */}
      <section className="py-8">
        {filteredMaterials.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No materials found</h3>
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
            {filteredMaterials.map((material, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
                  <img 
                    src={material.image} 
                    alt={material.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{material.name}</CardTitle>
                    <CardDescription className="mt-1">
                      by {material.supplier}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{material.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{material.location}</span>
                  <div className="flex items-center gap-1 ml-auto">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{material.rating}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-xl font-bold text-primary">{material.price}</div>
                  <div className="flex gap-2">
                    {userProfile?.role === 'builder' || userProfile?.company_name ? (
                      <>
                        <QuotationRequestDialog 
                          materialName={material.name}
                          supplierName={material.supplier}
                          userProfile={userProfile}
                        />
                        <Button size="sm" className="bg-primary hover:bg-primary/90 gap-2">
                          <ShoppingCart className="h-4 w-4" />
                          Buy Now
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" className="bg-primary hover:bg-primary/90 gap-2">
                          <ShoppingCart className="h-4 w-4" />
                          Buy Now
                        </Button>
                        <Button variant="outline" size="sm">
                          Contact
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}
        
        {/* Load More Button */}
        {filteredMaterials.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/5">
              Load More Materials
            </Button>
          </div>
        )}
      </section>

      {/* How to Buy Section */}
      <section className="bg-accent py-16 rounded-lg">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">How to Buy Materials</h2>
          <p className="text-lg opacity-90 mb-12">Different purchase options based on your needs</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6 bg-card rounded-lg shadow-md">
              <div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏗️</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Professional Builders & Companies</h3>
              <p className="opacity-90 mb-4">Get custom quotations for bulk orders and specialized requirements</p>
              <div className="space-y-2">
                <Badge variant="outline" className="mr-2">Request Quotations</Badge>
                <Badge variant="outline" className="mr-2">Bulk Pricing</Badge>
                <Badge variant="outline">Direct Purchase</Badge>
              </div>
            </div>
            <div className="text-center p-6 bg-card rounded-lg shadow-md">
              <div className="bg-construction-orange rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏠</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Individual Buyers & Homeowners</h3>
              <p className="opacity-90 mb-4">Purchase materials directly at listed prices for personal projects</p>
              <div className="space-y-2">
                <Badge variant="outline" className="mr-2">Direct Purchase</Badge>
                <Badge variant="outline" className="mr-2">Listed Prices</Badge>
                <Badge variant="outline">Contact Suppliers</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Price Alert CTA */}
      <section 
        className="text-white py-16 relative rounded-lg overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/lovable-uploads/6ea15a8f-a981-4c02-a56e-64ed62ab7a57.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl font-bold mb-4">Get Price Alerts</h2>
          <p className="text-lg opacity-90 mb-8">Never miss a great deal! Set up alerts for your favorite materials</p>
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            Set Up Alerts
          </Button>
        </div>
      </section>
    </div>
  );
};