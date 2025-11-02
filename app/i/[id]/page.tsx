import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ImageDetailViewer from "@/components/ImageDetailViewer";
import type { Metadata } from "next";

interface ImageData {
  id: string;
  filename: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  created_at: string;
  storage_key: string;
  owner_id: string;
  visibility: "public" | "private";
  mime_type: string;
  profiles: {
    display_name: string | null;
    id: string;
  };
}

async function getImage(id: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("images")
    .select(
      `
      id,
      filename,
      size_bytes,
      width,
      height,
      created_at,
      storage_key,
      owner_id,
      visibility,
      mime_type,
      profiles!images_owner_id_fkey (
        display_name,
        id
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as unknown as ImageData;
}

async function checkAccess(image: ImageData) {
  if (image.visibility === "public") {
    return true;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id === image.owner_id;
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const image = await getImage(params.id);

  if (!image) {
    return {
      title: "Image Not Found",
      description: "The requested image could not be found.",
    };
  }

  const hasAccess = await checkAccess(image);
  if (!hasAccess) {
    return {
      title: "Private Image",
      description: "This image is private and cannot be accessed.",
    };
  }

  const supabase = createClient();
  const {
    data: { publicUrl },
  } = supabase.storage.from("images").getPublicUrl(image.storage_key);

  const uploaderName = image.profiles?.display_name || "Unknown User";
  const dimensions =
    image.width && image.height
      ? `${image.width}×${image.height}`
      : "Unknown dimensions";

  const title = `${image.filename} - Uploaded by ${uploaderName}`;
  const description = `View ${image.filename} (${dimensions}) uploaded by ${uploaderName}. ${image.visibility === "public" ? "Public" : "Private"} image.`;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const pageUrl = `${baseUrl}/i/${image.id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: pageUrl,
      images: [
        {
          url: publicUrl,
          width: image.width || 1200,
          height: image.height || 630,
          alt: image.filename,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [publicUrl],
    },
    other: {
      "og:image:width": String(image.width || 1200),
      "og:image:height": String(image.height || 630),
    },
  };
}

export default async function ImageDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const image = await getImage(params.id);

  if (!image) {
    notFound();
  }

  const hasAccess = await checkAccess(image);
  if (!hasAccess) {
    notFound();
  }

  const supabase = createClient();
  const {
    data: { publicUrl },
  } = supabase.storage.from("images").getPublicUrl(image.storage_key);

  return (
    <ImageDetailViewer
      image={{
        ...image,
        imageUrl: publicUrl,
      }}
    />
  );
}
