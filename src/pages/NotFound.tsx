
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A1A2E] to-[#16213E] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-6">
        <h1 className="text-8xl font-bold bg-gradient-to-r from-[#ff4d4d] via-[#ff6b6b] to-[#ff8080] text-transparent bg-clip-text animate-pulse">
          404
        </h1>
        <div className="space-y-4">
          <p className="text-2xl text-white font-medium">Oops! Page Not Found</p>
          <p className="text-lg text-[#E5E5E5]/80">
            Looks like this page went on a journey to another dimension...
          </p>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#ff4d4d]/20 to-[#ff8080]/20 blur-xl" />
          <a
            href="/"
            className="relative inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-gradient-to-r from-[#E50914] to-[#ff4d4d] rounded-lg transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#E50914]/30"
          >
            Return to Home
          </a>
        </div>
        <div className="mt-8">
          <div className="text-[#E5E5E5]/60 animate-bounce">↓</div>
          <p className="text-[#E5E5E5]/60 text-sm mt-2">
            Keep scrolling to continue your adventure
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
