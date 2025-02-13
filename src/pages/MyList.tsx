import { useSearchParams } from 'react-router-dom';
import VideoPlayer from '@/components/VideoPlayer';

const Index = () => {
  const [searchParams] = useSearchParams();
  const isEmbed = searchParams.get('embed') === 'true';
  const videoUrl = 'https://hls-streaming-seven.vercel.app/cnd/cnd.m3u8';

  return (
    <div className={`w-full h-screen ${isEmbed ? 'bg-black' : 'bg-gray-100 flex items-center justify-center'}`}>
      <VideoPlayer url={videoUrl} />
    </div>
  );
};

export default Index;
