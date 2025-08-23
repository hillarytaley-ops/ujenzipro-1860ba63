import React from 'react';
import { Download, FileText, Users, Truck, QrCode, CreditCard, MapPin, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import workflowDiagram from '@/assets/workflow-diagram.png';
import systemArchitecture from '@/assets/system-architecture.png';

const PresentationSummary: React.FC = () => {
  const downloadSummary = () => {
    // Create a downloadable text file with the workflow summary
    const summaryContent = `
# JengaGuard Construction Supply Chain Management System
## Comprehensive Workflow Summary

### EXECUTIVE OVERVIEW
JengaGuard is a digital platform that revolutionizes construction supply chain operations through:
- Automated procurement processes
- Real-time delivery tracking
- Integrated payment systems
- QR code material verification
- Professional builder/supplier network

### COMPLETE WORKFLOW PROCESS

PHASE 1: PROCUREMENT & QUOTATION
1. Quotation Request - Builders submit material requirements
2. Supplier Response - Competitive quotes with pricing and availability
3. Purchase Order Creation - Formal orders with delivery specifications

PHASE 2: ORDER MANAGEMENT & QR CODING
4. QR Code Generation - Unique identifiers for each material batch
5. Material Preparation - Suppliers prepare and code materials
6. Dispatch Ready Status - Materials ready for delivery

PHASE 3: DELIVERY & TRACKING
7. Delivery Scheduling - Coordinated pickup and delivery times
8. Real-Time GPS Tracking - Live location updates and ETAs
9. Live Communication - Real-time messaging between all parties

PHASE 4: RECEIPT & ACKNOWLEDGMENT
10. Material Receipt - QR scanning and quality verification
11. Digital Acknowledgment - Professional builders sign delivery notes
12. Goods Received Note - Detailed receipt documentation

PHASE 5: PAYMENT & CLOSURE
13. Payment Processing - Multiple Kenyan payment methods
14. Project Documentation - Complete audit trail and receipts

### KEY BENEFITS
- 60% reduction in procurement time
- Real-time supply chain visibility
- Automated documentation
- Improved cost control
- Enhanced quality assurance

### TECHNOLOGY STACK
Frontend: React + TypeScript + Tailwind CSS
Backend: Supabase + Edge Functions
Integrations: QR codes, GPS, M-Pesa, Email notifications

### SUCCESS METRICS
- Order fulfillment efficiency
- Delivery accuracy rates
- Payment processing speed
- User satisfaction scores
- System reliability metrics
    `;

    const blob = new Blob([summaryContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'JengaGuard_Workflow_Summary.txt';
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
      title: "Procurement & Quotation",
      description: "Builders request quotes, suppliers respond, purchase orders created",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: <QrCode className="h-6 w-6" />,
      title: "QR Code Generation",
      description: "Unique material tracking codes for inventory management",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: <Truck className="h-6 w-6" />,
      title: "Delivery & Tracking",
      description: "Real-time GPS tracking with live communication",
      color: "bg-orange-100 text-orange-600"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Receipt & Acknowledgment",
      description: "Digital signatures and goods received documentation",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Payment & Closure",
      description: "Secure payments with complete audit trails",
      color: "bg-red-100 text-red-600"
    }
  ];

  const keyFeatures = [
    { icon: <Users />, title: "Multi-Role Platform", desc: "Builders, Suppliers, Delivery Providers" },
    { icon: <MapPin />, title: "Real-Time Tracking", desc: "GPS monitoring and live updates" },
    { icon: <QrCode />, title: "QR Verification", desc: "Material authentication and tracking" },
    { icon: <CreditCard />, title: "Kenyan Payments", desc: "M-Pesa, Bank Transfer, Escrow" },
    { icon: <Shield />, title: "Digital Security", desc: "Encrypted data and secure authentication" },
    { icon: <FileText />, title: "Documentation", desc: "Automated paperwork and compliance" }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">JengaGuard Supply Chain Management</h1>
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
              alt="JengaGuard Workflow Diagram" 
              className="w-full h-auto rounded-lg border"
            />
            <Button 
              onClick={() => downloadDiagram(workflowDiagram, 'JengaGuard_Workflow_Diagram.png')}
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
              alt="JengaGuard System Architecture" 
              className="w-full h-auto rounded-lg border"
            />
            <Button 
              onClick={() => downloadDiagram(systemArchitecture, 'JengaGuard_System_Architecture.png')}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflowSteps.map((step, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${step.color}`}>
                  {step.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                <Badge variant="outline">Phase {index + 1}</Badge>
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
            <div className="text-3xl font-bold text-green-600">60%</div>
            <div className="text-sm text-muted-foreground">Reduction in Procurement Time</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">100%</div>
            <div className="text-sm text-muted-foreground">Real-Time Visibility</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">99.9%</div>
            <div className="text-sm text-muted-foreground">System Uptime</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600">95%</div>
            <div className="text-sm text-muted-foreground">User Satisfaction</div>
          </CardContent>
        </Card>
      </div>

      {/* PowerPoint Notes */}
      <Card>
        <CardHeader>
          <CardTitle>PowerPoint Presentation Notes</CardTitle>
          <CardDescription>Key talking points for each workflow phase</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Slide 1: Problem Statement</h4>
            <p className="text-sm">Traditional construction supply chains lack transparency, real-time tracking, and digital documentation, leading to delays and cost overruns.</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Slide 2: Solution Overview</h4>
            <p className="text-sm">JengaGuard provides an end-to-end digital platform connecting builders, suppliers, and delivery providers with real-time tracking and automated processes.</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Slide 3: Key Benefits</h4>
            <p className="text-sm">60% faster procurement, 100% supply chain visibility, automated documentation, and integrated Kenyan payment systems.</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Slide 4: Implementation Impact</h4>
            <p className="text-sm">Reduced project delays, improved cost control, enhanced quality assurance, and better stakeholder collaboration.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PresentationSummary;