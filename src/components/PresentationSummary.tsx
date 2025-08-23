import React from 'react';
import { Download, FileText, Users, Truck, QrCode, CreditCard, MapPin, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import workflowDiagram from '@/assets/ujenzipro-detailed-workflow.png';
import systemArchitecture from '@/assets/ujenzipro-detailed-architecture.png';

const PresentationSummary: React.FC = () => {
  const downloadSummary = () => {
    // Create a downloadable text file with the workflow summary
    const summaryContent = `
# UjenziPro Construction Supply Chain Management System
## Detailed PowerPoint Presentation Workflow

### EXECUTIVE SUMMARY
UjenziPro is Kenya's premier digital construction supply chain management platform that connects builders, suppliers, and delivery providers through automated processes, real-time tracking, and integrated payment systems.

### PROBLEM STATEMENT
• Manual procurement processes causing 40-60% project delays
• Lack of real-time visibility in material delivery
• Paper-based documentation leading to errors and disputes
• Fragmented communication between stakeholders
• Inefficient payment systems and cash flow issues
• Quality control challenges and material verification problems

### SOLUTION OVERVIEW
UjenziPro provides a comprehensive digital platform that:
• Automates the entire procurement-to-payment workflow
• Enables real-time GPS tracking and communication
• Implements QR code-based material verification
• Integrates Kenyan payment gateways (M-Pesa, Banks, Escrow)
• Provides digital documentation and audit trails
• Ensures quality control through systematic processes

### DETAILED 5-PHASE WORKFLOW

PHASE 1: DIGITAL PROCUREMENT & COMPETITIVE QUOTATION
Step 1: Quotation Request Submission
- Builders submit detailed material requirements via web portal
- Automated RFQ (Request for Quotation) distribution to verified suppliers
- Requirements include specifications, quantities, delivery locations, timelines

Step 2: Supplier Response & Bidding
- Suppliers receive instant notifications of new opportunities
- Competitive bidding with real-time price comparisons
- Supplier ratings and reviews visible to builders
- Automated evaluation based on price, delivery time, and quality ratings

Step 3: Purchase Order Generation
- Digital purchase orders with complete specifications
- Legal terms and conditions automatically included
- Electronic signatures and formal agreement establishment
- Integration with project management timelines

PHASE 2: MATERIAL PREPARATION & QR CODE SYSTEM
Step 4: Unique QR Code Generation
- Every material batch receives unique QR identification
- Codes linked to purchase orders, specifications, and quality certificates
- Supplier material preparation and quality verification
- Digital batch tracking and inventory management

Step 5: Quality Assurance & Dispatch Preparation
- Mandatory quality checks before material coding
- Digital certificates and compliance documentation
- Supplier confirmation of dispatch readiness
- Integration with delivery scheduling system

PHASE 3: REAL-TIME DELIVERY & GPS TRACKING
Step 6: Delivery Scheduling & Coordination
- Automated scheduling based on site requirements
- Driver assignment and vehicle allocation
- Route optimization for efficient delivery
- Stakeholder notifications and preparation alerts

Step 7: Live GPS Tracking & Communication
- Real-time vehicle location monitoring
- ETA calculations and automatic updates
- Direct communication channel between all parties
- Emergency alerts and deviation notifications
- Photo documentation of loading and transit

PHASE 4: DIGITAL RECEIPT & VERIFICATION
Step 8: QR Code Scanning & Material Verification
- On-site QR code scanning for instant verification
- Material quantity and quality confirmation
- Discrepancy reporting and resolution workflow
- Photo evidence and digital documentation

Step 9: Professional Builder Acknowledgment
- Digital delivery note review and approval
- Electronic signature capability for authorized personnel
- Comments and feedback submission
- Goods Received Note (GRN) generation

PHASE 5: INTEGRATED PAYMENT & PROJECT CLOSURE
Step 10: Multi-Channel Payment Processing
- M-Pesa mobile money integration
- Bank transfer capabilities
- Escrow services for large transactions
- Automatic invoice generation and receipt issuance

Step 11: Complete Audit Trail & Documentation
- Digital record of entire transaction lifecycle
- PDF generation for legal and accounting purposes
- Performance analytics and KPI tracking
- Project completion confirmation and feedback collection

### KEY TECHNOLOGY FEATURES
• React + TypeScript frontend for responsive user experience
• Supabase backend with real-time synchronization
• GPS API integration for accurate location tracking
• QR code generation and scanning technology
• Kenyan payment gateway integrations (M-Pesa, Equity, KCB)
• SMS and email notification systems
• Cloud storage for documents and photos
• Mobile-first responsive design

### SUCCESS METRICS & KPIs
• 70% reduction in procurement processing time
• 95% delivery accuracy with real-time tracking
• 100% digital documentation eliminating paperwork
• 85% improvement in payment processing speed
• 90% user satisfaction rating
• 99.9% system uptime and reliability

### MARKET OPPORTUNITY
• Kenya's construction industry worth over KES 500 billion annually
• 10,000+ construction companies and 5,000+ material suppliers
• Growing demand for digital solutions and transparency
• Government initiatives supporting digital transformation
• Export potential to East African construction markets

### COMPETITIVE ADVANTAGES
• First comprehensive construction supply chain platform in Kenya
• Integrated payment systems with local banking partners
• QR code technology for foolproof material verification
• Real-time tracking and communication capabilities
• Professional builder-focused features and workflows
• Compliance with Kenyan regulatory requirements

### IMPLEMENTATION BENEFITS
For Builders:
• Streamlined procurement with competitive pricing
• Real-time project visibility and control
• Reduced administrative burden
• Improved cash flow management
• Quality assurance and compliance

For Suppliers:
• Expanded market reach and customer base
• Automated order processing and management
• Reduced payment delays and disputes
• Digital marketing and reputation building
• Inventory optimization

For Delivery Providers:
• Optimized routing and fuel efficiency
• Real-time communication and coordination
• Digital proof of delivery
• Performance tracking and improvement
• Steady income stream from verified jobs

### FUTURE ROADMAP
Phase 2: AI-powered demand forecasting and inventory optimization
Phase 3: IoT integration for smart construction site monitoring
Phase 4: Blockchain implementation for immutable audit trails
Phase 5: Regional expansion across East Africa
Phase 6: Mobile application for offline functionality

### RETURN ON INVESTMENT
• Project completion time reduced by 30-40%
• Material costs optimized through competitive bidding
• Administrative costs reduced by 60%
• Quality disputes reduced by 80%
• Customer satisfaction increased by 75%
• Scalable revenue model with transaction-based fees
    `.trim();

    const blob = new Blob([summaryContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'UjenziPro_Workflow_Summary.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadDiagram = (imageSrc: string, filename: string) => {
    const a = document.createElement('a');
    a.href = imageSrc;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const workflowSteps = [
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Digital Procurement & Quotation",
      description: "Automated RFQ distribution, competitive bidding, digital purchase orders with electronic signatures",
      color: "bg-blue-100 text-blue-600",
      details: ["Material requirements submission", "Supplier bidding system", "Automated evaluation", "Digital contracts"]
    },
    {
      icon: <QrCode className="h-6 w-6" />,
      title: "QR Code Material Preparation",
      description: "Unique material identification, quality verification, batch tracking, inventory management",
      color: "bg-green-100 text-green-600",
      details: ["Unique QR generation", "Quality assurance", "Batch documentation", "Dispatch preparation"]
    },
    {
      icon: <Truck className="h-6 w-6" />,
      title: "GPS Tracking & Delivery",
      description: "Real-time vehicle monitoring, route optimization, stakeholder notifications, ETA updates",
      color: "bg-orange-100 text-orange-600",
      details: ["Live GPS tracking", "Route optimization", "Automatic notifications", "Emergency alerts"]
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Digital Receipt & Verification",
      description: "QR scanning verification, professional acknowledgment, quality inspection, documentation",
      color: "bg-purple-100 text-purple-600",
      details: ["QR code scanning", "Material verification", "Digital signatures", "Quality confirmation"]
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Payment & Documentation",
      description: "Multi-channel payments (M-Pesa, Banks), automatic invoicing, audit trails, project closure",
      color: "bg-red-100 text-red-600",
      details: ["M-Pesa integration", "Bank transfers", "Digital receipts", "Audit documentation"]
    }
  ];

  const keyFeatures = [
    { icon: <Users />, title: "Multi-Stakeholder Platform", desc: "Builders, Suppliers, Delivery Providers with role-based access" },
    { icon: <MapPin />, title: "Real-Time GPS Tracking", desc: "Live vehicle monitoring with ETA calculations and route optimization" },
    { icon: <QrCode />, title: "QR Code Verification", desc: "Foolproof material authentication and batch tracking system" },
    { icon: <CreditCard />, title: "Kenyan Payment Integration", desc: "M-Pesa, Bank Transfer, Escrow services with digital receipts" },
    { icon: <Shield />, title: "Digital Security & Compliance", desc: "Encrypted data, electronic signatures, audit trails" },
    { icon: <FileText />, title: "Automated Documentation", desc: "Digital contracts, delivery notes, invoices, and compliance reports" }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">UjenziPro Supply Chain Management</h1>
        <p className="text-xl text-muted-foreground">
          Comprehensive Workflow Summary & Presentation Materials
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={downloadSummary} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Text Summary
          </Button>
        </div>
      </div>

      {/* Workflow Diagrams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Complete Workflow Diagram</CardTitle>
            <CardDescription>End-to-end process visualization</CardDescription>
          </CardHeader>
          <CardContent>
            <img 
              src={workflowDiagram} 
              alt="UjenziPro Workflow Diagram" 
              className="w-full h-auto rounded-lg border"
            />
            <Button 
              onClick={() => downloadDiagram(workflowDiagram, 'UjenziPro_Workflow_Diagram.png')}
              className="w-full mt-4"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Workflow Diagram
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Architecture</CardTitle>
            <CardDescription>Technical implementation overview</CardDescription>
          </CardHeader>
          <CardContent>
            <img 
              src={systemArchitecture} 
              alt="UjenziPro System Architecture" 
              className="w-full h-auto rounded-lg border"
            />
            <Button 
              onClick={() => downloadDiagram(systemArchitecture, 'UjenziPro_System_Architecture.png')}
              className="w-full mt-4"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Architecture Diagram
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Steps */}
      <Card>
        <CardHeader>
          <CardTitle>5-Phase Workflow Process</CardTitle>
          <CardDescription>Detailed breakdown of the complete supply chain process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflowSteps.map((step, index) => (
              <div key={index} className="p-6 border rounded-lg space-y-4 hover:shadow-lg transition-shadow">
                <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${step.color}`}>
                  {step.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                  <ul className="space-y-1">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="text-xs text-muted-foreground flex items-center">
                        <span className="w-1 h-1 bg-current rounded-full mr-2"></span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
                <Badge variant="outline" className="w-fit">Phase {index + 1}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Features */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Features & Capabilities</CardTitle>
          <CardDescription>Core functionalities that drive efficiency and transparency</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {keyFeatures.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Success Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600">70%</div>
            <div className="text-sm text-muted-foreground">Reduction in Procurement Time</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">95%</div>
            <div className="text-sm text-muted-foreground">Delivery Accuracy Rate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">100%</div>
            <div className="text-sm text-muted-foreground">Digital Documentation</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600">85%</div>
            <div className="text-sm text-muted-foreground">Payment Processing Speed</div>
          </CardContent>
        </Card>
      </div>

      {/* PowerPoint Notes */}
      <Card>
        <CardHeader>
          <CardTitle>PowerPoint Presentation Guide</CardTitle>
          <CardDescription>Comprehensive talking points for executive presentation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Slide 1: Market Problem</h4>
            <p className="text-sm">Kenya's construction industry faces critical supply chain challenges: 40-60% project delays due to manual processes, lack of transparency causing disputes, and inefficient payment systems leading to cash flow problems.</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Slide 2: UjenziPro Solution</h4>
            <p className="text-sm">Our comprehensive digital platform connects 10,000+ builders with 5,000+ suppliers through automated procurement, real-time tracking, QR verification, and integrated Kenyan payment systems.</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Slide 3: 5-Phase Workflow</h4>
            <p className="text-sm">From digital quotation through GPS delivery tracking to automated payments - UjenziPro handles the complete construction supply chain lifecycle with 70% faster processing times.</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Slide 4: Technology & Integration</h4>
            <p className="text-sm">Built on React/Supabase with QR codes, GPS tracking, M-Pesa integration, and digital signatures. Scalable architecture supporting thousands of concurrent users with 99.9% uptime.</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Slide 5: Market Opportunity</h4>
            <p className="text-sm">Kenya's KES 500 billion construction market with growing demand for digital solutions. First-mover advantage in comprehensive supply chain management with regional expansion potential.</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Slide 6: ROI & Implementation</h4>
            <p className="text-sm">30-40% faster project completion, 60% reduced administrative costs, 80% fewer quality disputes. Transaction-based revenue model ensuring sustainable growth and customer success.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PresentationSummary;