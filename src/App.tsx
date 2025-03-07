
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AnimeDetails from "./pages/AnimeDetails";
import Search from "./pages/Search";
import Episode from "./pages/Episode";
import MyList from "./pages/MyList";
import NotFound from "./pages/NotFound";
import Trending from "./pages/Trending";
import Dubbed from "./pages/Dubbed";
import LiveTV from "./pages/LiveTV";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/anime/:id" element={<AnimeDetails />} />
          <Route path="/search" element={<Search />} />
          <Route path="/episode/:id" element={<Episode />} />
          <Route path="/my-list" element={<MyList />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/dubbed" element={<Dubbed />} />
          <Route path="/live-tv" element={<LiveTV />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
