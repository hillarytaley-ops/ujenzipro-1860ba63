
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/builders", label: "Builders" },
    { path: "/suppliers", label: "Suppliers" },
    { path: "/materials", label: "Materials" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return(
    <header className="bg-grey shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img 
            src="/lovable-uploads/6f428ab0-9c8e-425c-960b-8c987371f59e.png" 
            alt="BuildConnect254 Logo" 
            className="h-16 w-16 object-contain hover:scale-105 transition-transform duration-200 drop-shadow-md"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                isActive(item.path) ? "text-blue-600" : "text-gray-600"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <Button variant="outline">Sign In</Button>
          <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <nav className="px-4 py-4 space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActive(item.path) ? "text-blue-600" : "text-gray-600"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 space-y-2">
              <Button variant="outline" className="w-full">Sign In</Button>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Get Started</Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navigation;
