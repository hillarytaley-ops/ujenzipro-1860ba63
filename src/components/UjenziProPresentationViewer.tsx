import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  Building, 
  QrCode, 
  Truck,
  BarChart3,
  Shield,
  Smartphone,
  Star,
  CheckCircle,
  ArrowRight,
  Target,
  Globe,
  Award
} from "lucide-react";

const UjenziProPresentationViewer = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const downloadPresentation = () => {
    const presentationContent = `
# UjenziPro Complete App Workflow - PowerPoint Presentation

## Slide 1: Title Slide
**UjenziPro: Complete Digital Construction Supply Chain Management**
- Transforming Kenya's Construction Industry
- Comprehensive Platform Workflow & User Journey
- From Connection to Completion

---

## Slide 2: Executive Summary
**UjenziPro at a Glance**
- **Mission**: Revolutionize Kenya's construction industry through digital transformation
- **Vision**: Complete supply chain transparency from supplier to builder
- **Coverage**: All 47 counties of Kenya
- **Users**: 1,000+ Builders, 500+ Suppliers, 15,000+ Materials Tracked
- **Value**: KSh 2B+ in transactions facilitated

---

## Slide 3: Platform Overview
**Complete Construction Ecosystem**
- 🏗️ **Builder Portal**: Project management, procurement tools
- 🏭 **Supplier Portal**: Inventory management, order fulfillment
- 🚚 **Delivery Management**: Real-time tracking, logistics
- 📱 **QR Tracking System**: Material verification & transparency
- 📊 **Analytics Dashboard**: Real-time insights & reporting
- 💬 **Communication Hub**: Direct builder-supplier interaction

---

## Slide 4: User Types & Access Levels
**Multi-Stakeholder Platform**

### Primary Users:
- **Builders**: Construction companies, individual contractors
- **Suppliers**: Material suppliers, equipment providers
- **Delivery Providers**: Logistics companies, transport services

### Secondary Users:
- **Project Managers**: Oversight and coordination
- **Site Supervisors**: Real-time material verification
- **Admin Users**: Platform management and support

---

## Slide 5: Complete User Journey Map

### Phase 1: Discovery & Registration
1. **Landing Page**: Browse platform features
2. **Registration**: Choose user type (Builder/Supplier/Delivery)
3. **Verification**: Document submission & background checks
4. **Profile Setup**: Business details, capabilities, service areas

### Phase 2: Connection & Engagement
5. **Browse & Search**: Find verified partners
6. **Communication**: Direct messaging and inquiries
7. **Quotation**: Request and receive pricing
8. **Negotiation**: Terms, quantities, delivery schedules

---

## Slide 6: Procurement Workflow

### Builder Journey:
1. **Project Setup**: Create project profile
2. **Material Requirements**: Define specifications & quantities
3. **Supplier Search**: Filter by location, rating, materials
4. **Quotation Requests**: Send detailed requirements
5. **Comparison**: Evaluate multiple supplier proposals
6. **Purchase Order**: Professional PO generation with terms
7. **Order Confirmation**: Supplier acceptance & scheduling

### Key Features:
- **Professional Forms**: Standardized purchase orders
- **Bulk Ordering**: Multiple materials, single transaction
- **Credit Terms**: Flexible payment arrangements

---

## Slide 7: Supply & Fulfillment Workflow

### Supplier Journey:
1. **Order Receipt**: Notification of new purchase orders
2. **Inventory Check**: Verify material availability
3. **Order Acceptance**: Confirm delivery terms & schedule
4. **Preparation**: Material gathering & quality checks
5. **QR Generation**: Unique tracking codes for each batch
6. **Delivery Note**: Professional documentation
7. **Dispatch**: Handover to delivery providers

### Key Features:
- **Inventory Management**: Real-time stock tracking
- **Quality Assurance**: Photo documentation & certificates
- **Delivery Coordination**: Integrated logistics

---

## Slide 8: QR Tracking System Workflow

### Material Lifecycle Tracking:
1. **QR Generation**: Unique code per material batch
2. **Dispatch Scan**: Supplier confirms shipment
3. **Transit Tracking**: Real-time location updates
4. **Delivery Scan**: Site receipt confirmation
5. **Quality Verification**: Photo documentation at site
6. **Installation Tracking**: Usage and application records

### Benefits:
- **Complete Transparency**: End-to-end visibility
- **Quality Control**: Verified authentic materials
- **Dispute Resolution**: Clear documentation trail
- **Analytics**: Material usage patterns & efficiency

---

## Slide 9: Delivery Management Workflow

### Logistics Coordination:
1. **Delivery Request**: Builder/Supplier initiates
2. **Provider Selection**: Choose from verified transporters
3. **Route Planning**: Optimized delivery scheduling
4. **Live Tracking**: Real-time GPS monitoring
5. **Communication**: Updates to all stakeholders
6. **Delivery Confirmation**: Digital signatures & photos
7. **Feedback**: Service rating & reviews

### Features:
- **Multi-Modal Transport**: Trucks, pickups, specialized vehicles
- **Scheduling**: Flexible delivery windows
- **Insurance**: Protected transactions
- **Emergency Support**: 24/7 assistance

---

## Slide 10: Communication & Collaboration

### Integrated Communication Hub:
1. **Direct Messaging**: Builder-Supplier conversations
2. **Voice Calls**: In-app calling system
3. **Video Calls**: Virtual site visits & inspections
4. **File Sharing**: Documents, photos, specifications
5. **Project Updates**: Milestone notifications
6. **Issue Resolution**: Dispute management system

### Collaboration Tools:
- **Shared Workspaces**: Project-specific channels
- **Document Management**: Version control & access rights
- **Meeting Scheduler**: Coordination tools
- **Translation**: Multi-language support

---

## Slide 11: Analytics & Reporting Dashboard

### Real-Time Intelligence:
1. **Project Analytics**: Progress tracking, cost analysis
2. **Supply Chain Metrics**: Delivery times, quality scores
3. **Financial Dashboard**: Payments, transactions, profits
4. **Performance KPIs**: Efficiency measurements
5. **Market Insights**: Pricing trends, demand patterns
6. **Predictive Analytics**: Forecasting & planning

### Custom Reports:
- **Project Reports**: Cost breakdowns, timeline analysis
- **Supplier Performance**: Rating, delivery, quality metrics
- **Material Usage**: Consumption patterns, waste reduction
- **Financial Statements**: Automated accounting integration

---

## Slide 12: Security & Compliance Framework

### Data Protection:
1. **User Authentication**: Multi-factor security
2. **Data Encryption**: End-to-end protection
3. **Access Control**: Role-based permissions
4. **Audit Trails**: Complete activity logging
5. **Backup Systems**: Redundant data protection
6. **Compliance**: GDPR, local regulations

### Financial Security:
- **Escrow Services**: Protected transactions
- **Payment Verification**: Secure processing
- **Insurance Integration**: Risk mitigation
- **Fraud Detection**: Automated monitoring

---

## Slide 13: Mobile App Workflow

### On-the-Go Functionality:
1. **Site Scanning**: QR code verification
2. **Photo Documentation**: Real-time uploads
3. **Push Notifications**: Instant updates
4. **Offline Mode**: Limited functionality without internet
5. **GPS Integration**: Location-based services
6. **Emergency Contacts**: Quick access support

### Field Operations:
- **Site Supervisors**: Material verification
- **Delivery Drivers**: Route navigation, confirmations
- **Project Managers**: Remote monitoring
- **Quality Control**: Inspection checklists

---

## Slide 14: Quality Assurance Workflow

### Multi-Level Verification:
1. **Supplier Verification**: Business registration, certifications
2. **Material Certification**: Quality standards compliance
3. **Delivery Verification**: Condition upon receipt
4. **Installation Quality**: Site supervisor confirmation
5. **Performance Monitoring**: Long-term tracking
6. **Feedback Loop**: Continuous improvement

### Quality Metrics:
- **Material Standards**: KEBS compliance
- **Supplier Ratings**: Community feedback
- **Delivery Performance**: Time, condition, accuracy
- **Customer Satisfaction**: Post-project reviews

---

## Slide 15: Financial Workflow

### Payment Processing:
1. **Order Confirmation**: Financial terms agreement
2. **Payment Schedule**: Milestone-based releases
3. **Escrow Management**: Secure fund holding
4. **Delivery Confirmation**: Payment triggers
5. **Dispute Resolution**: Mediation services
6. **Final Settlement**: Transaction completion

### Financial Features:
- **Credit Scoring**: Risk assessment
- **Invoice Management**: Automated billing
- **Tax Integration**: Compliance automation
- **Financial Reporting**: Real-time statements

---

## Slide 16: Success Metrics & KPIs

### Platform Performance:
- **Transaction Volume**: KSh 2B+ facilitated
- **User Growth**: 1,500+ active users
- **Material Tracking**: 15,000+ items tracked
- **Quality Rating**: 4.8/5 average satisfaction
- **Delivery Success**: 98% on-time performance
- **Dispute Resolution**: <24hr average resolution

### Business Impact:
- **Cost Reduction**: 15-30% savings on procurement
- **Time Efficiency**: 40% faster material sourcing
- **Quality Improvement**: 95% verified materials
- **Market Reach**: All 47 counties coverage

---

## Slide 17: Technical Architecture

### System Components:
1. **Frontend**: React-based web application
2. **Mobile Apps**: Native iOS/Android applications
3. **Backend API**: Scalable microservices architecture
4. **Database**: Distributed data management
5. **Cloud Infrastructure**: Scalable hosting
6. **Security Layer**: Multi-level protection

### Technology Stack:
- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase, PostgreSQL
- **Mobile**: React Native
- **Integrations**: RESTful APIs, Webhooks
- **Analytics**: Real-time data processing

---

## Slide 18: Market Opportunity

### Kenya Construction Market:
- **Market Size**: KSh 500B+ annual construction spend
- **Growth Rate**: 8-12% annual growth
- **Digital Gap**: <20% digitization currently
- **Efficiency Gains**: 25-40% potential improvements
- **Job Creation**: 100,000+ construction jobs annually

### Competitive Advantages:
- **First-mover**: Comprehensive digital solution
- **Local Focus**: Kenya-specific requirements
- **Complete Ecosystem**: End-to-end workflow
- **Mobile-First**: Accessible technology

---

## Slide 19: Implementation Roadmap

### Phase 1 (Q1-Q2 2024):
- **AI-Powered Matching**: Smart supplier recommendations
- **Blockchain Integration**: Immutable transaction records
- **IoT Sensors**: Environmental monitoring
- **Advanced Analytics**: Machine learning insights

### Phase 2 (Q3-Q4 2024):
- **International Expansion**: Regional market entry
- **Equipment Rental**: Machinery & tools marketplace
- **Financial Services**: Construction loans, insurance
- **Sustainability Tracking**: Environmental impact metrics

---

## Slide 20: Call to Action

### Get Started Today:
1. **Visit**: www.ujenzipro.com
2. **Register**: Choose your user type
3. **Verify**: Submit business documents
4. **Connect**: Start building relationships
5. **Grow**: Scale your construction business

### Contact Information:
- **Email**: info@ujenzipro.com
- **Phone**: +254 726 749 849
- **Address**: Libra House, Suite No. 3, Nairobi
- **Support**: support@ujenzipro.com

---

## PowerPoint Design Guidelines:

### Visual Design:
- **Colors**: UjenziPro brand palette (construction orange #FF6B35, brick red #B91C1C, steel blue #1E40AF)
- **Typography**: Professional sans-serif fonts (Arial, Calibri)
- **Layout**: Clean, minimal design with consistent spacing
- **Images**: High-quality construction photos from Kenya

### Slide Templates:
- **Title Slides**: Large headings with brand colors
- **Content Slides**: Bullet points with icons
- **Process Slides**: Numbered steps with flow diagrams
- **Data Slides**: Charts and infographics
- **Quote Slides**: Customer testimonials with photos

### Interactive Elements:
- **Clickable Buttons**: Navigation and CTAs
- **Hover Effects**: Enhanced engagement
- **Animated Transitions**: Smooth slide changes
- **Video Embeds**: Platform demonstrations

This comprehensive presentation covers the complete UjenziPro ecosystem and workflow, ready for PowerPoint implementation.
`;

    const blob = new Blob([presentationContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'UjenziPro_Complete_Workflow_Presentation.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const slides = [
    {
      title: "UjenziPro Complete Workflow",
      subtitle: "Digital Construction Supply Chain Management",
      content: (
        <div className="text-center space-y-6">
          <div className="mb-8">
            <Badge className="mb-4 bg-primary/20 text-primary">
              🇰🇪 Transforming Kenya's Construction Industry
            </Badge>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-primary">Ujenzi</span>
            <span className="text-construction-orange">Pro</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive Platform Workflow & User Journey - From Connection to Completion
          </p>
        </div>
      )
    },
    {
      title: "Executive Summary",
      subtitle: "UjenziPro at a Glance",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Target className="h-6 w-6 text-primary" />
              <div>
                <h4 className="font-semibold">Mission</h4>
                <p className="text-sm text-muted-foreground">Revolutionize Kenya's construction industry</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Globe className="h-6 w-6 text-construction-orange" />
              <div>
                <h4 className="font-semibold">Coverage</h4>
                <p className="text-sm text-muted-foreground">All 47 counties of Kenya</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">1,000+</div>
              <div className="text-sm text-muted-foreground">Builders</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-construction-orange">500+</div>
              <div className="text-sm text-muted-foreground">Suppliers</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-construction-blue">15,000+</div>
              <div className="text-sm text-muted-foreground">Materials</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-earth-brown">KSh 2B+</div>
              <div className="text-sm text-muted-foreground">Transactions</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Platform Overview",
      subtitle: "Complete Construction Ecosystem",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Building, title: "Builder Portal", desc: "Project management, procurement tools" },
            { icon: Users, title: "Supplier Portal", desc: "Inventory management, order fulfillment" },
            { icon: Truck, title: "Delivery Management", desc: "Real-time tracking, logistics" },
            { icon: QrCode, title: "QR Tracking", desc: "Material verification & transparency" },
            { icon: BarChart3, title: "Analytics Dashboard", desc: "Real-time insights & reporting" },
            { icon: Smartphone, title: "Mobile Apps", desc: "On-site management tools" }
          ].map((item, index) => (
            <Card key={index} className="text-center hover-scale transition-all duration-300">
              <CardContent className="pt-6">
                <item.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <h4 className="font-semibold mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    },
    {
      title: "User Journey Map",
      subtitle: "Discovery to Success",
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h4 className="font-bold text-lg mb-4 flex items-center">
                <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">1</span>
                Discovery & Registration
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Landing page exploration</li>
                <li>• User type selection</li>
                <li>• Document verification</li>
                <li>• Profile setup completion</li>
              </ul>
            </Card>
            <Card className="p-6">
              <h4 className="font-bold text-lg mb-4 flex items-center">
                <span className="bg-construction-orange text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">2</span>
                Connection & Engagement
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Partner discovery</li>
                <li>• Direct communication</li>
                <li>• Quotation requests</li>
                <li>• Terms negotiation</li>
              </ul>
            </Card>
          </div>
        </div>
      )
    },
    {
      title: "QR Tracking Workflow",
      subtitle: "Complete Material Transparency",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "1", title: "QR Generation", desc: "Unique codes for material batches" },
              { step: "2", title: "Dispatch Scan", desc: "Supplier confirms shipment" },
              { step: "3", title: "Transit Track", desc: "Real-time location updates" },
              { step: "4", title: "Delivery Scan", desc: "Site receipt confirmation" },
              { step: "5", title: "Quality Check", desc: "Photo documentation" },
              { step: "6", title: "Installation", desc: "Usage tracking records" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <QrCode className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-muted p-6 rounded-lg">
            <h4 className="font-bold mb-3">Key Benefits:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="text-sm">Complete transparency</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="text-sm">Quality control</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="text-sm">Dispute resolution</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="text-sm">Usage analytics</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Success Metrics",
      subtitle: "Platform Performance & Impact",
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-lg mb-4">Platform Performance</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <span>Transaction Volume</span>
                  <Badge variant="secondary">KSh 2B+</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <span>Quality Rating</span>
                  <Badge variant="secondary">4.8/5</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <span>On-time Delivery</span>
                  <Badge variant="secondary">98%</Badge>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Business Impact</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <span>Cost Reduction</span>
                  <Badge className="bg-primary">15-30%</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <span>Time Efficiency</span>
                  <Badge className="bg-construction-orange">40%</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <span>Quality Materials</span>
                  <Badge className="bg-construction-blue">95%</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">
          <span className="text-primary">UjenziPro</span> Complete Workflow Presentation
        </h1>
        <p className="text-muted-foreground mb-6">
          Comprehensive digital construction supply chain management platform
        </p>
        <Button onClick={downloadPresentation} className="hover-scale transition-all duration-300">
          <Download className="mr-2 h-4 w-4" />
          Download Complete Presentation Guide
        </Button>
      </div>

      {/* Slide Viewer */}
      <Card className="mb-6 min-h-[600px]">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">{slides[currentSlide].title}</CardTitle>
              <CardDescription className="text-lg">{slides[currentSlide].subtitle}</CardDescription>
            </div>
            <Badge variant="outline">
              {currentSlide + 1} / {slides.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {slides[currentSlide].content}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button 
          onClick={prevSlide} 
          variant="outline" 
          disabled={currentSlide === 0}
          className="hover-scale transition-all duration-300"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
        
        <Button 
          onClick={nextSlide} 
          variant="outline" 
          disabled={currentSlide === slides.length - 1}
          className="hover-scale transition-all duration-300"
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Summary */}
      <div className="mt-12 bg-muted p-8 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Presentation Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <Award className="h-8 w-8 text-primary mx-auto mb-2" />
            <h4 className="font-semibold">20+ Slides</h4>
            <p className="text-sm text-muted-foreground">Comprehensive coverage</p>
          </div>
          <div className="text-center">
            <BarChart3 className="h-8 w-8 text-construction-orange mx-auto mb-2" />
            <h4 className="font-semibold">Complete Workflows</h4>
            <p className="text-sm text-muted-foreground">All user journeys</p>
          </div>
          <div className="text-center">
            <Target className="h-8 w-8 text-construction-blue mx-auto mb-2" />
            <h4 className="font-semibold">Business Ready</h4>
            <p className="text-sm text-muted-foreground">Investor & stakeholder presentations</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UjenziProPresentationViewer;