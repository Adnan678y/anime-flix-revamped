
export interface Channel {
  id: string;
  name: string;
  logo: string;
  url: string;
  drmKey?: string;
  category?: string;
  description?: string;
}

export const channels: Channel[] = [
  {
    id: "36",
    name: "ANIMAX",
    logo: "https://raw.githubusercontent.com/Raulabdul666/Drmpicture/refs/heads/main/Picsart_24-10-17_11-58-35-902.jpg",
    drmKey: "92032b0e41a543fb9830751273b8debd:03f8b65e2af785b10d6634735dbe6c11",
    url: "https://qp-pldt-live-grp-07-prod.akamaized.net/out/u/cg_animax_sd.mpd",
    category: "Animation",
    description: "Animax is an anime television channel that began broadcasting in Japan on June 1, 1998, and is owned by Sony Pictures Entertainment Japan Inc."
  },
  {
    id: "37",
    name: "Anime All Day",
    logo: "https://i.imgur.com/bYZtd0G.png",
    url: "http://cfd-v4-service-channel-stitcher-use1-1.prd.pluto.tv/stitch/hls/channel/5812b7d3249444e05d09cc49/master.m3u8",
    category: "Animation",
    description: "24/7 anime programming featuring a variety of popular anime series and movies."
  },
  {
    id: "38",
    name: "Naruto",
    logo: "https://i.imgur.com/M8X3Kvc.png",
    url: "http://cfd-v4-service-channel-stitcher-use1-1.prd.pluto.tv/stitch/hls/channel/5da0c85bd2c9c10009370984/master.m3u8",
    category: "Animation",
    description: "Dedicated channel featuring episodes from the popular anime series Naruto."
  },
  {
    id: "39",
    name: "One Piece",
    logo: "https://i.imgur.com/XsvbAWR.png",
    url: "http://cfd-v4-service-channel-stitcher-use1-1.prd.pluto.tv/stitch/hls/channel/5f7790b3ed0c88000720b241/master.m3u8",
    category: "Animation",
    description: "24/7 channel dedicated to the adventures of Monkey D. Luffy and his pirate crew in the popular anime One Piece."
  },
  {
    id: "42",
    name: "Magic Kids",
    logo: "https://i.imgur.com/CMImqQY.png",
    url: "https://magicstream.ddns.net/magicstream/stream.m3u8",
    category: "Animation",
    description: "Classic children's animation channel featuring nostalgic cartoon programming from the 90s and early 2000s."
  }
];
