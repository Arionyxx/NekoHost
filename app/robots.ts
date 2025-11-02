import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/gallery", "/i/"],
        disallow: ["/api/", "/auth/", "/profile", "/settings", "/upload"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
