
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter, Grid, List, Star, MapPin } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Materials = () => {
  const materials = [
    {
      name: "Portland Cement 50kg",
      supplier: "Bamburi Cement",
      location: "Nairobi",
      price: "KSh 650",
      rating: 4.8,
      image: "/placeholder.svg",
      category: "Cement"
    },
    {
      name: "Steel Rebar 12mm",
      supplier: "Devki Steel Mills",
      location: "Ruiru",
      price: "KSh 85/meter",
      rating: 4.7,
      image: "/placeholder.svg",
      category: "Steel"
    },
    {
      name: "Ceramic Floor Tiles",
      supplier: "RAK Ceramics",
      location: "Mombasa",
      price: "KSh 1,200/sqm",
      rating: 4.9,
      image: "/placeholder.svg",
      category: "Tiles"
    },
    {
      name: "Quarry Stones",
      supplier: "Nairobi Quarries",
      location: "Kasarani",
      price: "KSh 3,500/tonne",
      rating: 4.5,
      image: "/placeholder.svg",
      category: "Aggregates"
    },
    {
      name: "Roofing Iron Sheets",
      supplier: "Mabati Rolling Mills",
      location: "Nakuru",
      price: "KSh 850/sheet",
      rating: 4.6,
      image: "/placeholder.svg",
      category: "Roofing"
    },
    {
      name: "Paint - Emulsion 20L",
      supplier: "Crown Paints",
      location: "Thika",
      price: "KSh 4,200",
      rating: 4.7,
      image: "/placeholder.svg",
      category: "Paint"
    }
  ];

  const categories = [
    "All Categories", "Cement", "Steel", "Tiles", "Aggregates", 
    "Roofing", "Paint", "Timber", "Hardware", "Plumbing", "Electrical"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Construction Materials Marketplace</h1>
          <p className="text-xl mb-8 opacity-90">Find the best prices for quality construction materials</p>
          
          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input 
                  placeholder="Search for materials, suppliers, or categories..." 
                  className="pl-10 py-6 text-lg bg-white"
                />
              </div>
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 px-8">
                Search
              </Button>
            </div>
            
            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.slice(0, 6).map((category, index) => (
                <Badge 
                  key={index} 
                  variant={index === 0 ? "default" : "secondary"} 
                  className="cursor-pointer hover:bg-blue-100 px-4 py-2"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Filters and View Options */}
      <section className="py-6 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <span className="text-sm text-gray-600">Showing 1,245 materials</span>
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
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((material, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-gray-500">Material Image</span>
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
                    <div className="text-xl font-bold text-green-600">{material.price}</div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Quote</Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Contact
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Load More Button */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Materials
            </Button>
          </div>
        </div>
      </section>

      {/* Price Alert CTA */}
      <section className="bg-blue-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Get Price Alerts</h2>
          <p className="text-lg text-gray-600 mb-8">Never miss a great deal! Set up alerts for your favorite materials</p>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            Set Up Alerts
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Materials;
