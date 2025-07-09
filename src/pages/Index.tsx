import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, ShoppingCart, Search, Star, MessageCircle } from "lucide-react";
import { useState } from "react";

const Index = () => {
  const [userType, setUserType] = useState<'builder' | 'seller' | null>(null);

  const features = [
    {
      icon: Search,
      title: "Find Materials Easily",
      description: "Search thousands of construction materials from verified suppliers across Kenya"
    },
    {
      icon: Users,
      title: "Connect with Professionals",
      description: "Network with trusted builders and reliable material suppliers"
    },
    {
      icon: ShoppingCart,
      title: "Request Quotes",
      description: "Get competitive prices and compare offers from multiple sellers"
    },
    {
      icon: Star,
      title: "Verified Reviews",
      description: "Read genuine reviews and ratings from the construction community"
    }
  ];

  const testimonials = [
    {
      name: "John Kamau",
      role: "General Contractor, Nairobi",
      content: "BuildConnect254 has revolutionized how I source materials. I save time and money on every project.",
      rating: 5
    },
    {
      name: "Mary Wanjiku",
      role: "Hardware Store Owner, Nakuru",
      content: "This platform has expanded my customer base beyond my wildest dreams. Highly recommended!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold">
              <span className="text-black">Build</span>
              <span className="text-red-600">Connect</span>
              <span className="text-green-600">254</span>
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline">Sign In</Button>
            <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-4 bg-orange-100 text-orange-800 border-orange-200">
            🇰🇪 Connecting Kenya's Construction Industry
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Connect, Build and <span className="text-blue-600">Succeed</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The premier platform connecting builders with trusted construction material suppliers across Kenya. 
            Find quality materials, get competitive quotes, and build lasting business relationships.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4"
              onClick={() => setUserType('builder')}
            >
              I'm a Builder
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-orange-500 text-orange-600 hover:bg-orange-50 text-lg px-8 py-4"
              onClick={() => setUserType('seller')}
            >
              I'm a Seller
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">1,000+</div>
              <div className="text-gray-600">Active Builders</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">500+</div>
              <div className="text-gray-600">Material Suppliers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">10,000+</div>
              <div className="text-gray-600">Successful Connections</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose 
              <span className="text-black"> Build</span>
              <span className="text-red-600">Connect</span>
              <span className="text-green-600">254</span>?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We make it easy for builders and suppliers to find each other, 
              negotiate fair prices, and build successful partnerships.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Simple steps to get started</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                1
              </div>
              <h3 className="font-semibold text-lg mb-2">Create Your Profile</h3>
              <p className="text-gray-600">Sign up and create a detailed profile showcasing your business</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                2
              </div>
              <h3 className="font-semibold text-lg mb-2">Search & Connect</h3>
              <p className="text-gray-600">Find materials or customers using our advanced search filters</p>
            </div>
            <div className="text-center">
              <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                3
              </div>
              <h3 className="font-semibold text-lg mb-2">Build & Grow</h3>
              <p className="text-gray-600">Complete transactions and build lasting business relationships</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-orange-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Construction Business?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of builders and suppliers already using BuildConnect254</p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4">
            Start Building Connections Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Building2 className="h-6 w-6" />
                <h3 className="text-lg font-semibold">
                  <span className="text-white">Build</span>
                  <span className="text-red-500">Connect</span>
                  <span className="text-green-500">254</span>
                </h3>
              </div>
              <p className="text-gray-400">
                Connecting Kenya's construction industry, one project at a time.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Builders</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Find Materials</li>
                <li>Request Quotes</li>
                <li>Compare Prices</li>
                <li>Read Reviews</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Suppliers</h4>
              <ul className="space-y-2 text-gray-400">
                <li>List Products</li>
                <li>Reach Customers</li>
                <li>Manage Orders</li>
                <li>Grow Business</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Terms of Service</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 BuildConnect254. All rights reserved. Made with ❤️ in Kenya.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
