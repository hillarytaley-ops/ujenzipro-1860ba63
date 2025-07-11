import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Star, Package, Truck, Store, User } from "lucide-react";
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
    },
    {
      name: "Eldoret Construction Hub",
      location: "Eldoret",
      rating: 4.5,
      products: 285,
      categories: ["Cement", "Roofing", "Steel"],
      image: "/placeholder.svg"
    },
    {
      name: "Kericho Building Depot",
      location: "Kericho",
      rating: 4.7,
      products: 195,
      categories: ["Timber", "Paint", "Hardware"],
      image: "/placeholder.svg"
    },
    {
      name: "Naivasha Stone Quarries",
      location: "Naivasha",
      rating: 4.8,
      products: 150,
      categories: ["Aggregates", "Stone", "Sand"],
      image: "/placeholder.svg"
    },
    {
      name: "Nyahururu Timber Mills",
      location: "Nyahururu",
      rating: 4.6,
      products: 120,
      categories: ["Timber", "Plywood", "Doors"],
      image: "/placeholder.svg"
    }
  ];

  const buyers = [
    {
      name: "Kipchoge Construction Ltd",
      location: "Eldoret",
      rating: 4.8,
      projectsCompleted: 45,
      lookingFor: ["Cement", "Steel", "Roofing"],
      budget: "2M - 5M KES"
    },
    {
      name: "Rift Valley Builders",
      location: "Nakuru",
      rating: 4.7,
      projectsCompleted: 32,
      lookingFor: ["Timber", "Hardware", "Paint"],
      budget: "1M - 3M KES"
    },
    {
      name: "Highland Contractors",
      location: "Kericho",
      rating: 4.9,
      projectsCompleted: 28,
      lookingFor: ["Aggregates", "Tiles", "Plumbing"],
      budget: "500K - 2M KES"
    },
    {
      name: "Lake View Properties",
      location: "Naivasha",
      rating: 4.6,
      projectsCompleted: 38,
      lookingFor: ["Stone", "Cement", "Electrical"],
      budget: "3M - 8M KES"
    }
  ];

  const categories = [
    { name: "Cement", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=150&h=150&fit=crop" },
    { name: "Steel", image: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=150&h=150&fit=crop" },
    { name: "Tiles", image: "https://images.unsplash.com/photo-1616047006789-b7af710a8688?w=150&h=150&fit=crop" },
    { name: "Paint", image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=150&h=150&fit=crop" },
    { name: "Timber", image: "https://images.unsplash.com/photo-1473445730015-841f29a9490b?w=150&h=150&fit=crop" },
    { name: "Hardware", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=150&h=150&fit=crop" },
    { name: "Plumbing", image: "https://images.unsplash.com/photo-1621905252472-e8be3d5a2c8d?w=150&h=150&fit=crop" },
    { name: "Electrical", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-black to-red-600 text-white py-16">
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
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((category, index) => (
              <Card key={index} className="text-center cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="py-6">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-lg overflow-hidden bg-gray-100">
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
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-black">800+</div>
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
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    View Catalog
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Active Buyers Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Active Buyers Looking for Materials</h2>
            <Button variant="outline">View All Buyers</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {buyers.map((buyer, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">{buyer.name}</CardTitle>
                  <CardDescription className="flex items-center justify-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {buyer.location}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-semibold">{buyer.rating}</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    {buyer.projectsCompleted} projects completed
                  </div>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Looking for:</p>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {buyer.lookingFor.map((item, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs border-green-500 text-green-700">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    Budget: {buyer.budget}
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Contact Buyer
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 to-black py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Become a Supplier</h2>
          <p className="text-xl mb-8 opacity-90">List your products and reach thousands of builders across Kenya</p>
          <Button size="lg" className="bg-white text-black hover:bg-gray-100 text-lg px-8 py-4">
            Register as Supplier
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Suppliers;
