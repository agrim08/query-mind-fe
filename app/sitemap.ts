import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** Served at /sitemap.xml. Only public pages; the app itself sits behind sign-in. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/sign-up`, changeFrequency: "monthly", priority: 0.5 },
  ];
}
