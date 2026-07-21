import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/"],
    },
    host: "https://budgetloom.xyz",
    sitemap: "https://budgetloom.xyz/sitemap.xml",
  };
}
