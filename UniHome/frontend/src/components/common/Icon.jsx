const paths = {
  login: <><path d="M13 3h7v18h-7M3 12h12m-5-5 5 5-5 5" /></>,
  userPlus: <><circle cx="9" cy="7" r="4" /><path d="M2 21v-2a7 7 0 0 1 14 0v2H2M19 7v6M16 10h6" /></>,
  lock: <><rect x="4" y="10" width="16" height="12" rx="2" /><path d="M8 10V6a4 4 0 0 1 8 0v4M12 15v3" /></>,
  mail: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 6 10 7L22 6" /></>,
  eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <><path d="m3 3 18 18M10 5a12 12 0 0 1 2 0c6 0 10 7 10 7a19 19 0 0 1-3 4M6 6a23 23 0 0 0-4 6s4 7 10 7a13 13 0 0 0 5-1M10 10a3 3 0 0 0 4 4" /></>,
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  shield: <><path d="m12 2 8 3v7c0 5-8 10-8 10S4 17 4 12V5l8-3Z" /><path d="m8 12 3 3 5-6" /></>,
  document: <><path d="M14 2H5v20h14V7l-5-5ZM14 2v6h5M8 12h8M8 16h8" /></>,
  pin: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  money: <><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="12" cy="12" r="3" /><path d="M6 9h.1M18 15h.1" /></>,
  area: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m7 15 9-7M7 11v4h4M12 8h4v4" /></>,
  sparkles: <><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3ZM20 2v4M18 4h4" /></>,
  bot: <><rect x="4" y="7" width="16" height="13" rx="3" /><path d="M12 3v4M2 12v4M22 12v4M8 16h8M8 11h.1M16 11h.1" /><circle cx="12" cy="2" r="1" /></>,
  mic: <><rect x="9" y="2" width="6" height="13" rx="3" /><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M9 22h6" /></>,
  bolt: <path d="m13 2-9 12h7l-1 8 10-12h-7l1-8Z" />,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></>,
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />,
  map: <><path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5ZM9 3v16M15 5v16" /></>,
  building: <path d="M5 21V5h10v16M15 10h4v11M3 21h18M8 8h1m2 0h1M8 11h1m2 0h1M8 14h1m2 0h1M9 21v-4h3v4M17 13h.1M17 16h.1" />,
  bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4M12 2V1" />,
  user: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="9" r="3" /><path d="M6 18c.6-3 2.6-4.5 6-4.5s5.4 1.5 6 4.5" /></>,
  close: <path d="m6 6 12 12M18 6 6 18" />,
};
export default function Icon({ name, className = "" }) {
  return <svg className={`icon ${className}`} viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}
