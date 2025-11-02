import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/upload`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/auth/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  try {
    const supabase = createClient();

    // Fetch all public images for sitemap
    const { data: images } = await supabase
      .from("images")
      .select("id, created_at")
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .limit(1000); // Limit to prevent sitemap from being too large

    const imagePages: MetadataRoute.Sitemap =
      images?.map((image) => ({
        url: `${baseUrl}/i/${image.id}`,
        lastModified: new Date(image.created_at),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })) || [];

    return [...staticPages, ...imagePages];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return staticPages;
  }
}
