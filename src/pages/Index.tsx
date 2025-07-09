import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Users, ShoppingCart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Index = () => {
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
      <Navigation />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-4 bg-orange-100 text-orange-800 border-orange-200">
            🇰🇪 Connecting Kenya's Construction Industry
          </Badge>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            <span className="text-black">Connect, </span>
            <span className="text-red-600">Build </span>
            <span className="text-black">and </span>
            <span className="text-green-600">Succeed Together.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The premier platform connecting builders with trusted construction material suppliers across Kenya. 
            Find quality materials, get competitive quotes, and build lasting business relationships.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/builders">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
                I'm a Builder
              </Button>
            </Link>
            <Link to="/suppliers">
              <Button size="lg" variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50 text-lg px-8 py-4">
                I'm a Supplier
              </Button>
            </Link>
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
              Why Choose BuildConnect254?
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

      <Footer />
    </div>
  );
};

export default Index;
