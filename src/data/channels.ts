
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
     url: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/5812b7d3249444e05d09cc49/3063648/playlist.m3u8?terminate=false&sid=SAMSUNG-TVPLUS-cc81e636-ba53-4e1a-925d-309fc469a392&deviceDNT=0&deviceLat=0&deviceLon=0&deviceModel=samsung&deviceVersion=unknown&embedPartner=samsung-tvplus&samsung_app_domain=https%3A%2F%2Fwww.samsung.com%2Fus%2Fappstore%2Fapp.do%3FappId%3DG15147002586&samsung_app_name=Samsung%20TV%20Plus&serverSideAds=true&appName=samsungtvplus&deviceId=c050263b-325d-4f55-84ff-0e4c08ab01f2&appVersion=unknown&deviceType=samsung-tvplus&deviceMake=samsung&includeDeviceUA=true&us_privacy=1YNY",
     category: "Animation",
     description: "24/7 anime programming featuring a variety of popular anime series and movies."
   }
];
