import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Target, Award, Globe } from "lucide-react";
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
      description: "15 years experience in construction and technology",
      image: "/placeholder.svg"
    },
    {
      name: "Hillary Kaptng'ei ",
      role: "CTO & Founder",
      description: "senior engineer at leading tech companies",
      image: "/placeholder.svg"
    },
    {
      name: "Eliud Rugut",
      role: "Head of Operations",
      description: "Expert in supply chain and logistics management",
      image: "/placeholder.svg"
    },
    {
      name: "Mary Akinyi",
      role: "Head of Business Development",
      description: "Specialist in B2B relationships and partnerships",
      image: "/placeholder.svg"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-construction">
      <Navigation />

      {/* Hero Section */}
      <section 
        className="text-white py-20 relative"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/lovable-uploads/6ea15a8f-a981-4c02-a56e-64ed62ab7a57.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-white/20 text-white border-white/30">
            🇰🇪 Proudly Kenyan
          </Badge>
          <h1 className="text-5xl font-bold mb-6">About UjenziPro</h1>
          <p className="text-xl max-w-3xl mx-auto opacity-90">
            We're on a mission to transform Kenya's construction industry by connecting builders 
            with trusted suppliers, making construction projects more efficient, affordable, and successful.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">Our Story</h2>
            <div className="prose prose-lg mx-auto">
              <p className="text-xl leading-relaxed mb-6 text-blue-900">
                UjenziPro was born from a simple observation: Kenya's construction industry needed 
                not just better connections, but complete project visibility. As builders struggled to find 
                reliable suppliers and track their material deliveries, while suppliers couldn't efficiently 
                reach their ideal customers, we saw an opportunity to revolutionize the entire construction workflow.
              </p>
              <p className="text-lg leading-relaxed mb-6 text-blue-900">
                Founded in 2023 by a team of construction industry veterans and technology experts, 
                we've quickly grown to become Kenya's leading platform for construction professionals. 
                Our comprehensive solution goes beyond simple connections - we provide real-time project tracking, 
                delivery management, and complete transparency throughout the construction supply chain.
              </p>
              <p className="text-lg leading-relaxed text-blue-900">
                Today, we're proud to serve thousands of builders and suppliers across all 47 counties, 
                facilitating millions of shillings in transactions, tracking thousands of deliveries, 
                and providing complete project visibility that's helping build the Kenya of tomorrow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto mb-4 p-4 bg-construction-orange/20 rounded-full w-fit">
                    <value.icon className="h-8 w-8 text-construction-orange" />
                  </div>
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{value.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-accent">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                    <Users className="h-12 w-12 text-muted-foreground" />
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
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section 
        className="py-20 text-white relative"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/lovable-uploads/6ea15a8f-a981-4c02-a56e-64ed62ab7a57.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-4xl font-bold text-center mb-12">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">1,000+</div>
              <div className="text-lg opacity-90">Active Builders</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-lg opacity-90">Verified Suppliers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-lg opacity-90">Successful Connections</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">KSh 2B+</div>
              <div className="text-lg opacity-90">Total Transactions</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
