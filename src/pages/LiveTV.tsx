
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { channels, Channel } from '@/data/channels';
import ShakaPlayer from '@/components/ShakaPlayer';
import { Tv, Info, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const LiveTV = () => {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(channels[0] || null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const { toast } = useToast();

  // Load Shaka Player script if not loaded
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.document.getElementById('shaka-player-script')) {
      const script = document.createElement('script');
      script.id = 'shaka-player-script';
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.3.5/shaka-player.compiled.js';
      script.async = true;
      script.onload = () => {
        console.log('Shaka Player script loaded');
        setIsScriptLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Shaka Player script');
      };
      document.body.appendChild(script);
    } else {
      setIsScriptLoaded(true);
    }
  }, []);

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannel(channel);
    toast({
      title: "Channel changed",
      description: `Now watching ${channel.name}`,
      duration: 2000,
    });
  };

  // Filter out channels with known issues based on console logs
  const workingChannels = channels;

  return (
    <div className="min-h-screen bg-gradient-to-b from-netflix-black to-netflix-dark">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-20 pb-8">
        <div className="flex items-center gap-2 mb-6">
          <Tv className="w-6 h-6 text-netflix-red" />
          <h1 className="text-2xl font-bold text-white">Live TV</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Main video player */}
          <div className="order-2 lg:order-1">
            {selectedChannel && isScriptLoaded ? (
              <div className="bg-netflix-dark rounded-lg overflow-hidden shadow-xl">
                <ShakaPlayer 
                  src={selectedChannel.url}
                  drmKey={selectedChannel.drmKey}
                  title={selectedChannel.name}
                />
                
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <img 
                      src={selectedChannel.logo} 
                      alt={selectedChannel.name} 
                      className="w-10 h-10 object-contain rounded"
                    />
                    <h2 className="text-xl font-bold text-white">{selectedChannel.name}</h2>
                  </div>
                  
                  {selectedChannel.description && (
                    <p className="text-netflix-gray text-sm">{selectedChannel.description}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-netflix-dark/50 rounded-lg flex items-center justify-center">
                <p className="text-netflix-gray">
                  {!isScriptLoaded ? "Loading player..." : "Select a channel to start watching"}
                </p>
              </div>
            )}
          </div>
          
          {/* Channel list */}
          <div className="order-1 lg:order-2">
            <div className="bg-netflix-dark/50 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Info className="w-4 h-4 text-netflix-red" />
                Available Channels
              </h3>
              
              <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {channels.length > 0 ? (
                  channels.map(channel => (
                    <button
                      key={channel.id}
                      onClick={() => handleChannelSelect(channel)}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        selectedChannel?.id === channel.id 
                          ? 'bg-netflix-red text-white' 
                          : 'bg-netflix-dark hover:bg-netflix-dark/70 text-white/80'
                      }`}
                    >
                      <img 
                        src={channel.logo} 
                        alt={channel.name}
                        className="w-10 h-10 object-contain rounded bg-white/10"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                      <div className="text-left">
                        <p className="font-medium">{channel.name}</p>
                        {channel.category && (
                          <p className="text-xs opacity-80">{channel.category}</p>
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-netflix-dark/30 rounded-lg">
                      <Skeleton className="w-10 h-10 rounded" />
                      <div>
                        <Skeleton className="w-24 h-4 mb-2" />
                        <Skeleton className="w-16 h-3" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTV;
