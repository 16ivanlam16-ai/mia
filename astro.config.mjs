import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

const site = process.env.SITE_URL ?? "https://16ivanlam16-ai.github.io";
const base = process.env.BASE_PATH ?? "/mia";

function withSlash(pathname) {
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

export default defineConfig({
  site,
  base,
  trailingSlash: "always",
  output: "static",
  compressHTML: true,
  prefetch: true,
  build: {
    format: "directory",
  },
  integrations: [
    sitemap({
      filter(page) {
        let pathname = "";
        try {
          pathname = withSlash(new URL(page).pathname);
        } catch {
          return false;
        }
        const root = withSlash(base.startsWith("/") ? base : `/${base}`);
        if (pathname === root) return false;
        if (pathname.includes("/go/")) return false;
        if (pathname.endsWith("/404/")) return false;
        return true;
      },
      i18n: {
        defaultLocale: "zh-hant",
        locales: {
          "zh-hant": "zh-Hant-HK",
          "zh-hans": "zh-Hans",
        },
      },
    }),
  ],
});
