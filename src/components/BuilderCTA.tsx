import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CTA_IMAGE_URL = '/lovable-uploads/6ea15a8f-a981-4c02-a56e-64ed62ab7a57.png';

export const BuilderCTA = () => {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate('/auth');
  };

  return (
    <section 
      className="py-16 text-white relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('${CTA_IMAGE_URL}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="container mx-auto px-4 text-center relative z-10">
        <h2 className="text-3xl font-bold mb-4">Need Construction Materials?</h2>
        <p className="text-xl mb-8 opacity-90">
          Register as a buyer to connect with verified suppliers and get competitive prices for your construction projects
        </p>
        <Button 
          size="lg" 
          className="bg-secondary text-secondary-foreground hover:bg-secondary/80 text-lg px-8 py-4"
          onClick={handleRegisterClick}
        >
          Register as Buyer
        </Button>
      </div>
    </section>
  );
};