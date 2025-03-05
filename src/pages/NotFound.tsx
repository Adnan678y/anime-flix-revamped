
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { ArrowDown, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrollProgress, setScrollProgress] = useState(0);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      if (!pageRef.current) return;
      
      // Calculate how far down the user has scrolled as a percentage
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = Math.max(
        pageRef.current.scrollHeight,
        windowHeight * 1.5
      );
      
      // Calculate scroll percentage (0 to 100)
      const newProgress = Math.min(
        100,
        (scrollPosition / (documentHeight - windowHeight)) * 100
      );
      
      setScrollProgress(newProgress);
      
      // If scrolled more than 80%, navigate to home
      if (newProgress > 80) {
        navigate("/");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [navigate]);

  return (
    <div 
      ref={pageRef}
      className="min-h-[150vh] bg-gradient-to-b from-[#1A1A2E] to-[#16213E] relative"
    >
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="max-w-2xl w-full text-center space-y-6">
          <h1 className="text-8xl font-bold bg-gradient-to-r from-[#E50914] via-[#ff6b6b] to-[#ff8080] text-transparent bg-clip-text animate-pulse">
            404
          </h1>
          <div className="space-y-4">
            <p className="text-2xl text-white font-medium">Oops! Page Not Found</p>
            <p className="text-lg text-[#E5E5E5]/80">
              Looks like this page went on a journey to another dimension...
            </p>
          </div>
          <div className="relative mt-8">
            <div className="absolute inset-0 bg-gradient-to-r from-[#E50914]/20 to-[#ff8080]/20 blur-xl" />
            <Button
              onClick={() => navigate("/")}
              className="relative inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-gradient-to-r from-[#E50914] to-[#ff4d4d] rounded-lg transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#E50914]/30"
            >
              <Home className="mr-2 h-5 w-5" />
              Return to Home
            </Button>
          </div>
          
          <div className="pt-12 animate-bounce">
            <div className="flex flex-col items-center">
              <p className="text-[#E5E5E5]/80 mb-4">Keep scrolling to go home</p>
              <ArrowDown className="w-8 h-8 text-[#E5E5E5]/80" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress indicator */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-[#E5E5E5]/20">
        <div 
          className="h-full bg-[#E50914] transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      
      {/* Transition element at bottom of page */}
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-6 animate-fade-in">
          <h2 className="text-3xl font-bold text-white">Taking you home...</h2>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#E50914]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
