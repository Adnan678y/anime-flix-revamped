import { VideoPlayer } from './components/VideoPlayer';

function App() {
  return (
    <div className="container mx-auto p-4">
      <VideoPlayer url="https://hls-streaming-seven.vercel.app/cnd/cnd.m3u8" />
    </div>
  );
}
