import { BuilderSearch } from "./BuilderSearch";

interface BuilderHeroProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  locationFilter: string;
  onLocationFilterChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  budgetFilter: string;
  onBudgetFilterChange: (value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const HERO_IMAGE_URL = '/lovable-uploads/6ea15a8f-a981-4c02-a56e-64ed62ab7a57.png';

export const BuilderHero = (props: BuilderHeroProps) => {
  return (
    <section 
      className="py-16 relative bg-gradient-hero"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('${HERO_IMAGE_URL}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="container mx-auto px-4 text-center relative z-10">
        <h1 className="text-4xl font-bold mb-4 text-white">
          <span className="text-white">Material</span>{' '}
          <span className="text-primary">Buyers</span>{' '}
          <span className="text-construction-orange">Marketplace</span>
        </h1>
        <p className="text-xl mb-8 text-white/90">
          Connect suppliers with builders who need construction materials - from small projects to large developments
        </p>
        
        <BuilderSearch {...props} />
      </div>
    </section>
  );
};