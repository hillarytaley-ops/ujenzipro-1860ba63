import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { FeedbackForm } from "@/components/FeedbackForm";

export default function Feedback() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main 
        className="container mx-auto px-4 py-16 bg-powder-blue relative"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/lovable-uploads/7cfcf7b9-f15f-4327-809e-aa6ddc908424.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              We Value Your Feedback
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Help us improve by sharing your thoughts, suggestions, or reporting any issues you've encountered.
            </p>
          </div>
          
          <FeedbackForm />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}