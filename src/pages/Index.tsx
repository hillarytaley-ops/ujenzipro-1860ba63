
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Users, ShoppingCart, Star, QrCode, Truck, BarChart3, CheckCircle, ArrowRight, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import UjenziProPresentationViewer from "@/components/UjenziProPresentationViewer";

const Index = () => {
  const [showPresentation, setShowPresentation] = useState(false);
  const features = [
    {
      icon: Search,
      title: "Smart Material Search",
      description: "Find verified construction materials from trusted suppliers across all 47 counties of Kenya"
    },
    {
      icon: QrCode,
      title: "QR Material Tracking", 
      description: "Track materials from dispatch to delivery with unique QR codes for complete transparency"
    },
    {
      icon: Truck,
      title: "Real-time Delivery",
      description: "Live GPS tracking and professional delivery management with digital confirmations"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Comprehensive insights and reporting for data-driven construction decisions"
    }
  ];

  const keyCapabilities = [
    {
      icon: Users,
      title: "Verified Network",
      description: "Connect with background-checked builders and certified material suppliers"
    },
    {
      icon: ShoppingCart,
      title: "Professional Procurement",
      description: "Generate purchase orders, manage quotations, and handle bulk transactions"
    },
    {
      icon: Star,
      title: "Quality Assurance",
      description: "Community ratings, material certifications, and performance tracking"
    },
    {
      icon: CheckCircle,
      title: "Secure Transactions",
      description: "Escrow services, payment protection, and dispute resolution systems"
    }
  ];

  const testimonials = [
    {
      name: "John Mwangi",
      role: "General Contractor, Nairobi",
      company: "Mwangi Construction Ltd",
      content: "UjenziPro has transformed how we source materials. The QR tracking system alone has saved us 30% on project costs through reduced waste and better quality control.",
      rating: 5,
      verified: true
    },
    {
      name: "Grace Wanjiku",
      role: "Hardware Store Owner, Nakuru", 
      company: "Wanjiku Hardware Supplies",
      content: "This platform expanded my customer base from local to national. The professional tools for delivery notes and inventory management are game-changers.",
      rating: 5,
      verified: true
    },
    {
      name: "Peter Otieno",
      role: "Project Manager, Kisumu",
      company: "Otieno Contractors",
      content: "Real-time delivery tracking and professional purchase orders have streamlined our operations. We've reduced procurement time by 40%.",
      rating: 5,
      verified: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-construction">
      <Navigation />

      {/* Hero Section */}
      <header className="home-hero-background py-20 relative">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 animate-fade-in">
              🇰🇪 Transforming Kenya's Construction Industry
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight animate-fade-in">
              <span className="text-white">Connect, </span>
              <span className="text-primary">Build </span>
              <span className="text-white">and </span>
              <span className="text-construction-orange">Succeed Together</span>
            </h1>
            <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto animate-fade-in">
              Kenya's premier digital construction platform featuring QR material tracking, 
              real-time delivery management, and comprehensive supply chain transparency. 
              Build lasting business relationships with verified professionals.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in">
              <Link to="/builders">
                <Button size="lg" className="text-lg px-8 py-4 hover-scale transition-all duration-300">
                  <Users className="mr-2 h-5 w-5" />
                  I'm a Builder
                </Button>
              </Link>
              <Link to="/suppliers">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white/30 text-white hover:bg-white hover:text-foreground text-lg px-8 py-4 hover-scale transition-all duration-300"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  I'm a Supplier
                </Button>
              </Link>
            </div>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center hover-scale transition-all duration-300">
                <div className="text-3xl font-bold text-white mb-2">1,000+</div>
                <div className="text-white/80 text-sm">Active Builders</div>
              </div>
              <div className="text-center hover-scale transition-all duration-300">
                <div className="text-3xl font-bold text-primary mb-2">500+</div>
                <div className="text-white/80 text-sm">Verified Suppliers</div>
              </div>
              <div className="text-center hover-scale transition-all duration-300">
                <div className="text-3xl font-bold text-construction-orange mb-2">15,000+</div>
                <div className="text-white/80 text-sm">Materials Tracked</div>
              </div>
              <div className="text-center hover-scale transition-all duration-300">
                <div className="text-3xl font-bold text-white mb-2">KSh 2B+</div>
                <div className="text-white/80 text-sm">Transactions</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Core Features Section */}
      <section className="py-20 bg-muted" aria-labelledby="features-heading">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 id="features-heading" className="text-4xl font-bold mb-6">
              Advanced Construction Technology
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Powered by cutting-edge technology, UjenziPro offers comprehensive digital solutions 
              that transform traditional construction supply chain management.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 hover-scale border-0 bg-card">
                  <CardHeader>
                    <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                      <IconComponent className="h-8 w-8 text-primary" aria-hidden="true" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platform Capabilities */}
      <section className="py-20 bg-secondary" aria-labelledby="capabilities-heading">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 id="capabilities-heading" className="text-4xl font-bold mb-6">
              Complete Business Solutions
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From discovery to delivery, UjenziPro provides end-to-end tools for 
              professional construction business management.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {keyCapabilities.map((capability, index) => {
              const IconComponent = capability.icon;
              return (
                <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 hover-scale">
                  <CardHeader>
                    <div className="mx-auto mb-4 p-4 bg-construction-orange/10 rounded-full w-fit">
                      <IconComponent className="h-8 w-8 text-construction-orange" aria-hidden="true" />
                    </div>
                    <CardTitle className="text-xl">{capability.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">{capability.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-accent" aria-labelledby="how-it-works-heading">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 id="how-it-works-heading" className="text-4xl font-bold mb-6">How It Works</h2>
            <p className="text-xl text-muted-foreground">Three simple steps to transform your construction business</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center hover-scale transition-all duration-300">
              <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                1
              </div>
              <h3 className="font-bold text-2xl mb-4">Create Your Profile</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Register and verify your business with detailed profiles, certifications, and service capabilities
              </p>
            </div>
            <div className="text-center hover-scale transition-all duration-300">
              <div className="bg-construction-orange text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                2
              </div>
              <h3 className="font-bold text-2xl mb-4">Connect & Transact</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Search, communicate, and execute professional transactions with QR tracking and digital documentation
              </p>
            </div>
            <div className="text-center hover-scale transition-all duration-300">
              <div className="bg-construction-blue text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                3
              </div>
              <h3 className="font-bold text-2xl mb-4">Scale & Succeed</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Build lasting partnerships, track performance analytics, and grow your construction business sustainably
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-muted" aria-labelledby="testimonials-heading">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 id="testimonials-heading" className="text-4xl font-bold mb-6">Success Stories</h2>
            <p className="text-xl text-muted-foreground">
              Real results from verified construction professionals across Kenya
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 hover-scale">
                <CardContent className="pt-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-construction-orange fill-current" />
                      ))}
                    </div>
                    {testimonial.verified && (
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <blockquote className="text-muted-foreground mb-6 italic leading-relaxed">
                    "{testimonial.content}"
                  </blockquote>
                  <div className="border-t pt-4">
                    <div className="font-semibold text-lg">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    <div className="text-xs text-primary mt-1">{testimonial.company}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="home-cta-background py-20 relative" aria-labelledby="cta-heading">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 id="cta-heading" className="text-4xl font-bold mb-6 text-white">
              Ready to Transform Your Construction Business?
            </h2>
            <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto">
              Join thousands of builders and suppliers already using UjenziPro's advanced digital platform 
              to streamline operations, track materials, and grow their businesses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button 
                  size="lg" 
                  className="text-lg px-10 py-4 hover-scale transition-all duration-300"
                >
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Start Building Connections Today
                </Button>
              </Link>
              <Link to="/about">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="bg-white/20 text-white border border-white/30 hover:bg-white hover:text-foreground text-lg px-10 py-4 hover-scale transition-all duration-300"
                  onClick={() => setShowPresentation(true)}
                >
                  <FileText className="mr-2 h-5 w-5" />
                  View Complete Workflow Presentation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Presentation Viewer */}
      {showPresentation && (
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="mb-8 text-center">
              <Button 
                onClick={() => setShowPresentation(false)}
                variant="outline"
                className="mb-4"
              >
                ← Back to Home
              </Button>
            </div>
            <UjenziProPresentationViewer />
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Index;
