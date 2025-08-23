import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Target, Award, Globe, FileText, Package, QrCode, Truck, Camera, BarChart3 } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Our Mission", 
      description: "To revolutionize Kenya's construction industry by creating seamless connections between builders and suppliers, fostering growth and innovation."
    },
    {
      icon: Users,
      title: "Community First",
      description: "We believe in building strong relationships and supporting local businesses to create a thriving construction ecosystem."
    },
    {
      icon: Award,
      title: "Quality Assurance",
      description: "Every supplier and builder on our platform is verified to ensure the highest standards of quality and reliability."
    },
    {
      icon: Globe,
      title: "National Reach",
      description: "Connecting construction professionals across all 47 counties of Kenya, from Nairobi to remote rural areas."
    }
  ];

  const team = [
    {
      name: "Sila Kapting'ei",
      role: "CEO",
      description: "Visionary leader with 15+ years transforming construction through innovative technology solutions and strategic partnerships",
      image: "/lovable-uploads/6282de19-c0b1-4ee6-b5f5-5317b8ca1168.png",
      alt: "Sila Kapting'ei, CEO of UjenziPro"
    },
    {
      name: "Hillary Kapting'ei",
      role: "CTO & Founder",
      description: "Technical architect and former senior engineer who built scalable systems at leading tech companies across Africa",
      image: "/lovable-uploads/7a56d657-b18e-45cb-9f19-3ab4d8f4ce49.png",
      alt: "Hillary Kapting'ei, CTO and Founder of UjenziPro"
    },
    {
      name: "Eliud Rugut",
      role: "Head of Operations",
      description: "Supply chain optimization expert with deep expertise in construction logistics and digital transformation",
      image: "/lovable-uploads/b977c222-ce21-4393-bb5a-c35df9ce0000.png",
      alt: "Eliud Rugut, Head of Operations at UjenziPro"
    },
    {
      name: "Mary Akinyi",
      role: "Head of Business Development",
      description: "Strategic partnership specialist driving B2B relationships and market expansion across Kenya's construction sector",
      image: "/lovable-uploads/e2233f15-caa6-45be-b6cb-0531b0e0baa6.png",
      alt: "Mary Akinyi, Head of Business Development at UjenziPro"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-construction">
      <Navigation />

      {/* Hero Section */}
      <header className="hero-background py-20 relative">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-white/20 text-white border-white/30 animate-fade-in">
            🇰🇪 Proudly Kenyan
          </Badge>
          <h1 className="text-5xl font-bold mb-6 animate-fade-in">
            <span className="text-background">About</span>{' '}
            <span className="text-primary">Ujenzi</span><span className="text-construction-orange">Pro</span>
          </h1>
          <p className="text-xl max-w-3xl mx-auto text-background/90 animate-fade-in">
            We're transforming Kenya's construction industry with comprehensive digital solutions - 
            from supplier connections and procurement management to real-time delivery tracking, 
            QR-coded material verification, and complete project visibility.
          </p>
        </div>
      </header>

      {/* Our Story Section */}
      <section className="py-20 bg-muted" aria-labelledby="story-heading">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 id="story-heading" className="text-4xl font-bold text-center mb-12">Our Story</h2>
            <div className="prose prose-lg mx-auto">
              <p className="text-xl leading-relaxed mb-6 text-foreground">
                UjenziPro was born from a simple observation: Kenya's construction industry needed 
                complete digital transformation. As builders struggled with procurement inefficiencies, 
                material tracking challenges, and delivery management complexities, while suppliers 
                lacked professional tools for documentation and customer communication, we saw an 
                opportunity to revolutionize the entire construction workflow.
              </p>
              <p className="text-lg leading-relaxed mb-6 text-muted-foreground">
                Founded in 2023 by a team of construction industry veterans and technology experts, 
                we've rapidly evolved from a simple connection platform to a comprehensive construction 
                management ecosystem. Today, we offer professional procurement tools, real-time material 
                tracking with QR technology, delivery note management, live project monitoring, and 
                complete supply chain transparency.
              </p>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Our platform now serves thousands of builders and suppliers across all 47 counties, 
                facilitating millions of shillings in transactions, tracking materials from dispatch to delivery, 
                managing professional purchase orders and delivery notes, and providing the digital infrastructure 
                that's building the Kenya of tomorrow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-secondary" aria-labelledby="values-heading">
        <div className="container mx-auto px-4">
          <h2 id="values-heading" className="text-4xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 hover-scale">
                  <CardHeader>
                    <div className="mx-auto mb-4 p-4 bg-construction-orange/20 rounded-full w-fit">
                      <IconComponent className="h-8 w-8 text-construction-orange" aria-hidden="true" />
                    </div>
                    <CardTitle className="text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{value.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-accent" aria-labelledby="team-heading">
        <div className="container mx-auto px-4">
          <h2 id="team-heading" className="text-4xl font-bold text-center mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {team.map((member, index) => (
              <article key={index}>
                <Card className="text-center hover:shadow-lg transition-all duration-300 hover-scale">
                <CardHeader>
                  <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full overflow-hidden">
                    <img 
                      src={member.image} 
                      alt={member.alt}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription className="text-primary font-medium">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{member.description}</p>
                  </CardContent>
                </Card>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section className="py-20 bg-muted" aria-labelledby="features-heading">
        <div className="container mx-auto px-4">
          <h2 id="features-heading" className="text-4xl font-bold text-center mb-12">Platform Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-all duration-300 hover-scale">
              <CardHeader>
                <div className="mx-auto mb-4 p-4 bg-construction-blue/20 rounded-full w-fit">
                  <FileText className="h-8 w-8 text-construction-blue" aria-hidden="true" />
                </div>
                <CardTitle className="text-lg">Professional Procurement</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Comprehensive purchase order forms and quotation management for professional builders and companies
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300 hover-scale">
              <CardHeader>
                <div className="mx-auto mb-4 p-4 bg-primary/20 rounded-full w-fit">
                  <QrCode className="h-8 w-8 text-primary" aria-hidden="true" />
                </div>
                <CardTitle className="text-lg">QR Material Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Advanced QR code system for tracking materials from dispatch through delivery to receipt
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300 hover-scale">
              <CardHeader>
                <div className="mx-auto mb-4 p-4 bg-construction-orange/20 rounded-full w-fit">
                  <Truck className="h-8 w-8 text-construction-orange" aria-hidden="true" />
                </div>
                <CardTitle className="text-lg">Delivery Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Professional delivery note forms and real-time tracking for suppliers and builders
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300 hover-scale">
              <CardHeader>
                <div className="mx-auto mb-4 p-4 bg-earth-brown/20 rounded-full w-fit">
                  <Camera className="h-8 w-8 text-earth-brown" aria-hidden="true" />
                </div>
                <CardTitle className="text-lg">Live Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Camera integration and live streaming for real-time project monitoring and security
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300 hover-scale">
              <CardHeader>
                <div className="mx-auto mb-4 p-4 bg-primary/20 rounded-full w-fit">
                  <BarChart3 className="h-8 w-8 text-primary" aria-hidden="true" />
                </div>
                <CardTitle className="text-lg">Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Comprehensive material tracking dashboard with real-time analytics and reporting
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300 hover-scale">
              <CardHeader>
                <div className="mx-auto mb-4 p-4 bg-construction-blue/20 rounded-full w-fit">
                  <Package className="h-8 w-8 text-construction-blue" aria-hidden="true" />
                </div>
                <CardTitle className="text-lg">Supply Chain Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Complete supply chain visibility from supplier to builder with documentation at every step
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-background py-20 relative" aria-labelledby="impact-heading">
        <div className="container mx-auto px-4 relative z-10">
          <h2 id="impact-heading" className="text-4xl font-bold text-center mb-12 text-background">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2 text-background">1,000+</div>
              <div className="text-lg text-background/90">Active Builders</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 text-background">500+</div>
              <div className="text-lg text-background/90">Verified Suppliers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 text-background">15,000+</div>
              <div className="text-lg text-background/90">Materials Tracked</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 text-background">KSh 2B+</div>
              <div className="text-lg text-background/90">Total Transactions</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mt-12">
            <div>
              <div className="text-3xl font-bold mb-2 text-background">5,000+</div>
              <div className="text-base text-background/90">Purchase Orders Processed</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2 text-background">8,000+</div>
              <div className="text-base text-background/90">Delivery Notes Generated</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2 text-background">25,000+</div>
              <div className="text-base text-background/90">QR Codes Scanned</div>
            </div>
          </div>
        </div>
      </section>

      {/* Future Vision Section */}
      <section className="py-20 bg-accent" aria-labelledby="future-heading">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 id="future-heading" className="text-4xl font-bold mb-8">Building the Future</h2>
            <p className="text-xl leading-relaxed mb-8 text-foreground">
              We're not just digitizing construction - we're reimagining it. Our platform combines 
              cutting-edge technology with deep industry knowledge to create solutions that address 
              real construction challenges.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <Card className="p-6 hover-scale transition-all duration-300">
                <h3 className="text-xl font-semibold mb-4">For Builders</h3>
                <p className="text-muted-foreground">
                  Professional procurement tools, real-time material tracking, and complete 
                  project visibility to manage construction projects with confidence.
                </p>
              </Card>
              <Card className="p-6 hover-scale transition-all duration-300">
                <h3 className="text-xl font-semibold mb-4">For Suppliers</h3>
                <p className="text-muted-foreground">
                  Professional delivery documentation, direct customer communication, and 
                  advanced tracking systems to enhance service delivery.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
