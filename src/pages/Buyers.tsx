
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Building, Search, Clock, Shield, DollarSign, Truck } from "lucide-react";
import { Link } from "react-router-dom";

const Buyers = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Building className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold">
              <span className="text-black">Build</span>
              <span className="text-red-600">Connect</span>
              <span className="text-green-600">254</span>
            </h1>
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link to="/suppliers" className="text-gray-600 hover:text-blue-600 transition-colors">
              For Suppliers
            </Link>
            <Link to="/buyers" className="text-blue-600 font-medium">
              For Builders
            </Link>
            <Link to="/materials" className="text-gray-600 hover:text-blue-600 transition-colors">
              Browse Materials
            </Link>
          </nav>
          <Button>Join as Builder</Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-blue-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Build Better with <span className="text-orange-600">Quality Materials</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Find the best construction materials from verified suppliers. 
            Compare prices, check availability, and get your projects done right.
          </p>
          <div className="max-w-md mx-auto mb-8">
            <div className="flex">
              <Input 
                placeholder="Search for materials..." 
                className="rounded-r-none"
              />
              <Button className="rounded-l-none bg-orange-600 hover:bg-orange-700">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button size="lg" className="text-lg px-8 py-3 bg-orange-600 hover:bg-orange-700">
            <Building className="mr-2 h-5 w-5" />
            Start Building Today
          </Button>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Why Builders Choose 
              <span className="text-black"> Build</span>
              <span className="text-red-600">Connect</span>
              <span className="text-green-600">254</span>
            </h3>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <DollarSign className="h-10 w-10 text-orange-600 mb-2" />
                <CardTitle>Best Prices</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Compare prices from multiple suppliers instantly. Get competitive quotes and save money on every project.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-10 w-10 text-orange-600 mb-2" />
                <CardTitle>Quality Guaranteed</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  All suppliers are verified and materials meet industry standards. Build with confidence every time.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Clock className="h-10 w-10 text-orange-600 mb-2" />
                <CardTitle>Fast Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get materials delivered when you need them. Track orders and manage timelines efficiently.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Search className="h-10 w-10 text-orange-600 mb-2" />
                <CardTitle>Easy Search</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Find exactly what you need with advanced filters. Search by location, price, and material specifications.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Truck className="h-10 w-10 text-orange-600 mb-2" />
                <CardTitle>Logistics Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Coordinate deliveries across multiple suppliers. Streamline your project logistics in one place.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Building className="h-10 w-10 text-orange-600 mb-2" />
                <CardTitle>Project Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Organize materials by project, track expenses, and manage multiple builds from one dashboard.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Popular Material Categories
            </h3>
            <p className="text-lg text-gray-600">
              Browse our most requested construction materials
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center">
                  <Building className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-lg">Concrete & Masonry</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-sm text-gray-600">
                  Ready-mix concrete, blocks, bricks, aggregates, and masonry supplies
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center">
                  <Building className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-lg">Steel & Metal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-sm text-gray-600">
                  Structural steel, rebar, metal roofing, and architectural metals
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center">
                  <Building className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-lg">Lumber & Wood</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-sm text-gray-600">
                  Framing lumber, plywood, engineered wood, and specialty millwork
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center">
                  <Building className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-lg">Roofing & Siding</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-sm text-gray-600">
                  Shingles, metal roofing, siding materials, and weatherproofing
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-orange-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Start Your Next Project?</h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of builders who trust BuildConnect254 for their material needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Create Builder Account
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3 text-white border-white hover:bg-white hover:text-orange-600">
              Browse Materials
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Buyers;
