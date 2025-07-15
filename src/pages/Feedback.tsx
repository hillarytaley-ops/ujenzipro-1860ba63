import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { FeedbackForm } from "@/components/FeedbackForm";

export default function Feedback() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-16 bg-dark-maroon text-white">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            We Value Your Feedback
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Help us improve by sharing your thoughts, suggestions, or reporting any issues you've encountered.
          </p>
        </div>
        
        <FeedbackForm />
      </main>
      
      <Footer />
    </div>
  );
}