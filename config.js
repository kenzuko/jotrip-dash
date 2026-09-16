window.JOTRIP_CONFIG = {
  repo: "kenzuko/Jotrip-Lab",
  weatherBranch: "feat/weather-lab-data-engine-v1",
  airportBranch: "feat/weather-lab-data-engine-v1",
  weatherWebUrl: null,
  airportWebUrl: "https://airport.openphuquoc.com",
  refreshMs: 120000,
  staleMinutes: { weather: 180, airQuality: 360, tide: 180, airport: 30 },
  auth: {
    mode: "local-preview",
    provider: "supabase",
    supabaseUrl: "",
    supabaseAnonKey: "",
    inviteFunctionUrl: ""
  }
};

document.addEventListener('DOMContentLoaded',()=>{
  ['./ops-extended.css?v=20260916-3','./command-v3.css?v=20260916-3'].forEach(href=>{
    const css=document.createElement('link');
    css.rel='stylesheet';
    css.href=href;
    document.head.appendChild(css);
  });
  const data=document.createElement('script');
  data.src='./ops-data.js?v=20260916-3';
  data.onload=()=>{
    const ext=document.createElement('script');
    ext.src='./ops-extended.js?v=20260916-3';
    ext.onload=()=>{
      const actions=document.createElement('script');
      actions.src='./ops-actions.js?v=20260916-3';
      actions.onload=()=>{
        const v3=document.createElement('script');
        v3.src='./command-v3.js?v=20260916-3';
        document.body.appendChild(v3);
      };
      document.body.appendChild(actions);
    };
    document.body.appendChild(ext);
  };
  document.body.appendChild(data);
});
