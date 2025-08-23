import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { FeedbackForm } from "@/components/FeedbackForm";

export default function Feedback() {
  return (
    <div className="min-h-screen bg-gradient-construction">
      <Navigation />
      
      <header className="feedback-hero-background py-16 relative">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-white">We</span>{' '}
            <span className="text-primary">Value</span>{' '}
            <span className="text-construction-orange">Your</span>{' '}
            <span className="text-white">Feedback</span>
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Help us improve by sharing your thoughts, suggestions, or reporting any issues you've encountered.
          </p>
        </div>
      </header>
      
      <main className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Share Your Experience</h2>
              <p className="text-muted-foreground mb-8">
                Your feedback helps us build better solutions for Kenya's construction industry. 
                We read every submission and use your insights to improve our platform.
              </p>
            </div>
            
            <FeedbackForm />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}