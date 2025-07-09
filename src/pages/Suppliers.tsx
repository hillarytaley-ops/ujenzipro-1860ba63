
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Star, Package, Truck, Store } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Suppliers = () => {
  const suppliers = [
    {
      name: "Nairobi Hardware Supplies",
      location: "Nairobi",
      rating: 4.7,
      products: 250,
      categories: ["Cement", "Steel", "Tiles"],
      image: "/placeholder.svg"
    },
    {
      name: "Coastal Building Materials",
      location: "Mombasa",
      rating: 4.8,
      products: 180,
      categories: ["Aggregates", "Roofing", "Paint"],
      image: "/placeholder.svg"
    },
    {
      name: "Rift Valley Suppliers",
      location: "Nakuru",
      rating: 4.6,
      products: 320,
      categories: ["Timber", "Hardware", "Plumbing"],
      image: "/placeholder.svg"
    },
    {
      name: "Western Kenya Materials",
      location: "Kisumu",
      rating: 4.9,
      products: 200,
      categories: ["Electrical", "Insulation", "Tools"],
      image: "/placeholder.svg"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-16">
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
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8">
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {["Cement", "Steel", "Tiles", "Paint", "Timber", "Hardware", "Plumbing", "Electrical"].map((category, index) => (
              <Card key={index} className="text-center cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="py-6">
                  <Package className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <p className="text-sm font-medium">{category}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-orange-600">500+</div>
              <div className="text-gray-600">Verified Suppliers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">10,000+</div>
              <div className="text-gray-600">Products Listed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">47</div>
              <div className="text-gray-600">Counties Served</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">24/7</div>
              <div className="text-gray-600">Customer Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Suppliers Directory */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Suppliers</h2>
            <Button variant="outline">View All Suppliers</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {suppliers.map((supplier, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                    <Store className="h-8 w-8 text-gray-600" />
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
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    View Catalog
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-green-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Become a Supplier</h2>
          <p className="text-xl mb-8 opacity-90">List your products and reach thousands of builders across Kenya</p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4">
            Register as Supplier
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Suppliers;
