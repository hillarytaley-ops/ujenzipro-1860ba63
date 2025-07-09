
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Star, Users, Hammer, Building } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Builders = () => {
  const builders = [
    {
      name: "Kamau Construction Ltd",
      location: "Nairobi",
      rating: 4.8,
      projects: 45,
      specialties: ["Residential", "Commercial"],
      image: "/placeholder.svg"
    },
    {
      name: "Mwangi Builders",
      location: "Kisumu",
      rating: 4.6,
      projects: 32,
      specialties: ["Infrastructure", "Industrial"],
      image: "/placeholder.svg"
    },
    {
      name: "Njeri Construction",
      location: "Mombasa",
      rating: 4.9,
      projects: 28,
      specialties: ["Residential", "Renovation"],
      image: "/placeholder.svg"
    },
    {
      name: "Otieno Contractors",
      location: "Nakuru",
      rating: 4.7,
      projects: 38,
      specialties: ["Commercial", "Infrastructure"],
      image: "/placeholder.svg"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Find Trusted Builders in Kenya</h1>
          <p className="text-xl mb-8 opacity-90">Connect with verified construction professionals across the country</p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input 
                placeholder="Search builders by name or specialty..." 
                className="pl-10 py-6 text-lg bg-white"
              />
            </div>
            <Button size="lg" className="bg-orange-600 hover:bg-orange-700 px-8">
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">1,000+</div>
              <div className="text-gray-600">Registered Builders</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">5,000+</div>
              <div className="text-gray-600">Completed Projects</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">47</div>
              <div className="text-gray-600">Counties Covered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">95%</div>
              <div className="text-gray-600">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Builders Directory */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Builders</h2>
            <Button variant="outline">View All Builders</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {builders.map((builder, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                    <Building className="h-8 w-8 text-gray-600" />
                  </div>
                  <CardTitle className="text-lg">{builder.name}</CardTitle>
                  <CardDescription className="flex items-center justify-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {builder.location}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-semibold">{builder.rating}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Hammer className="h-4 w-4" />
                      {builder.projects} projects
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4 justify-center">
                    {builder.specialties.map((specialty, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Are You a Builder?</h2>
          <p className="text-xl mb-8 opacity-90">Join BuildConnect254 and expand your business reach</p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4">
            Register as Builder
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Builders;
