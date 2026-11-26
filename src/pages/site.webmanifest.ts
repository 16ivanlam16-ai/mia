import type { APIRoute } from "astro";

export const GET: APIRoute = () => {
  const base = import.meta.env.BASE_URL;
  const body = {
    name: "Mia",
    short_name: "Mia",
    lang: "zh-Hant-HK",
    start_url: `${base}zh-hant/`,
    display: "browser",
    background_color: "#f4f1ea",
    theme_color: "#243330",
    icons: [
      { src: `${base}favicon.svg`, sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: `${base}apple-touch-icon.png`, sizes: "180x180", type: "image/png" },
    ],
  };
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/manifest+json; charset=utf-8" },
  });
};
