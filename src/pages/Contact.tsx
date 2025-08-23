
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
}

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[\+]?[0-9]{10,15}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid phone number";
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }
    
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters long";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Please fix the errors",
        description: "Check the form fields and try again.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you within 24 hours.",
      });
      
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
      setErrors({});
      
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please try again later or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-construction">
      <Navigation />

      {/* Hero Section */}
      <header className="contact-hero-background py-16 relative">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-background">Get</span>{' '}
            <span className="text-primary">In</span>{' '}
            <span className="text-construction-orange">Touch</span>
          </h1>
          <p className="text-xl text-background/90">We're here to help you connect, build, and succeed</p>
        </div>
      </header>

      {/* Contact Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            
            {/* Contact Form */}
            <Card className="hover-scale transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl">Send us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input 
                        id="firstName" 
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        placeholder="Enter your first name"
                        aria-describedby={errors.firstName ? "firstName-error" : undefined}
                        className={errors.firstName ? "border-destructive" : ""}
                      />
                      {errors.firstName && (
                        <p id="firstName-error" className="text-sm text-destructive" role="alert">
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input 
                        id="lastName" 
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        placeholder="Enter your last name"
                        aria-describedby={errors.lastName ? "lastName-error" : undefined}
                        className={errors.lastName ? "border-destructive" : ""}
                      />
                      {errors.lastName && (
                        <p id="lastName-error" className="text-sm text-destructive" role="alert">
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Enter your email address"
                      aria-describedby={errors.email ? "email-error" : undefined}
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && (
                      <p id="email-error" className="text-sm text-destructive" role="alert">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+254 700 000 000"
                      aria-describedby={errors.phone ? "phone-error" : undefined}
                      className={errors.phone ? "border-destructive" : ""}
                    />
                    {errors.phone && (
                      <p id="phone-error" className="text-sm text-destructive" role="alert">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input 
                      id="subject" 
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      placeholder="What is this regarding?"
                      aria-describedby={errors.subject ? "subject-error" : undefined}
                      className={errors.subject ? "border-destructive" : ""}
                    />
                    {errors.subject && (
                      <p id="subject-error" className="text-sm text-destructive" role="alert">
                        {errors.subject}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea 
                      id="message" 
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Tell us more about how we can help you..." 
                      rows={6}
                      aria-describedby={errors.message ? "message-error" : undefined}
                      className={errors.message ? "border-destructive" : ""}
                    />
                    {errors.message && (
                      <p id="message-error" className="text-sm text-destructive" role="alert">
                        {errors.message}
                      </p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-6">Contact Information</h2>
                <p className="text-muted-foreground mb-8">
                  Have questions? We'd love to hear from you. Send us a message and we'll 
                  respond as soon as possible.
                </p>
              </div>

              <div className="space-y-6">
                <Card className="hover-scale transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-construction-blue/20 rounded-full">
                        <MapPin className="h-6 w-6 text-construction-blue" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Office Address</h3>
                        <address className="text-muted-foreground not-italic">
                          Libra House, Suite No. 3<br />
                          P.O BOX 73329-00200<br />
                          Nairobi, Kenya
                        </address>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover-scale transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-construction-orange/20 rounded-full">
                        <Phone className="h-6 w-6 text-construction-orange" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Phone Numbers</h3>
                        <div className="text-muted-foreground">
                          <a href="tel:+254726749849" className="block hover:text-primary transition-colors">
                            +254 726 749 849
                          </a>
                          <a href="tel:+254733987654" className="block hover:text-primary transition-colors">
                            +254 733 987 654
                          </a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover-scale transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-primary/20 rounded-full">
                        <Mail className="h-6 w-6 text-primary" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Email Addresses</h3>
                        <div className="text-muted-foreground">
                          <a href="mailto:info@ujenzipro.com" className="block hover:text-primary transition-colors">
                            info@ujenzipro.com
                          </a>
                          <a href="mailto:support@ujenzipro.com" className="block hover:text-primary transition-colors">
                            support@ujenzipro.com
                          </a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover-scale transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-earth-brown/20 rounded-full">
                        <Clock className="h-6 w-6 text-earth-brown" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Business Hours</h3>
                        <div className="text-muted-foreground">
                          <time>Monday - Friday: 8:00 AM - 6:00 PM</time><br />
                          <time>Saturday: 9:00 AM - 4:00 PM</time><br />
                          <time>Sunday: Closed</time>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="contact-faq-background py-16 relative" aria-labelledby="faq-heading">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 id="faq-heading" className="text-3xl font-bold mb-4 text-background">Frequently Asked Questions</h2>
            <p className="text-background/80">Quick answers to common questions</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1">
                <Card className="overflow-hidden">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <CardTitle className="text-lg text-left">How do I register as a builder or supplier?</CardTitle>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardContent className="pt-0">
                      <p className="text-muted-foreground">
                        Click on "Get Started" and select whether you're a builder or supplier. 
                        Fill out the registration form with your business details and we'll verify your account within 24 hours.
                      </p>
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <Card className="overflow-hidden">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <CardTitle className="text-lg text-left">Is there a fee to use UjenziPro?</CardTitle>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardContent className="pt-0">
                      <p className="text-muted-foreground">
                        Basic registration and browsing is free. We charge a small commission only when successful 
                        transactions are completed through our platform.
                      </p>
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <Card className="overflow-hidden">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <CardTitle className="text-lg text-left">How do you verify suppliers and builders?</CardTitle>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardContent className="pt-0">
                      <p className="text-muted-foreground">
                        We verify business registration documents, check references, and conduct background checks. 
                        All verified members receive a badge on their profile.
                      </p>
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <Card className="overflow-hidden">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <CardTitle className="text-lg text-left">What payment methods do you accept?</CardTitle>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardContent className="pt-0">
                      <p className="text-muted-foreground">
                        We support M-Pesa, bank transfers, and cash payments. All transactions are secured and 
                        verified to ensure safe business operations for all parties involved.
                      </p>
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <Card className="overflow-hidden">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <CardTitle className="text-lg text-left">How does the QR tracking system work?</CardTitle>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardContent className="pt-0">
                      <p className="text-muted-foreground">
                        Each delivery gets a unique QR code that tracks materials from dispatch to delivery. 
                        Simply scan the code to see real-time location, delivery status, and verification details.
                      </p>
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
