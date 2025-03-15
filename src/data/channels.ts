
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
  } , 
    {
     id: "37",
     name: "Anime All Day",
     logo: "https://i.imgur.com/bYZtd0G.png",
     url: "https://testing.api74.workers.dev/animax?key=Adnankevu83grv9oebr",
     category: "Animation",
     description: "24/7 anime programming featuring a variety of popular anime series and movies."
   }
];
