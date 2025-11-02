import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { TablesInsert } from "@/supabase/types";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/bmp",
  "image/tiff",
];

interface UploadResult {
  success: boolean;
  filename: string;
  url?: string;
  publicUrl?: string;
  imageId?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to upload images." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const results: UploadResult[] = [];

    for (const file of files) {
      const result = await uploadFile(file, user.id, supabase);
      results.push(result);
    }

    const allSuccess = results.every((r) => r.success);
    const status = allSuccess ? 200 : 207; // 207 Multi-Status for partial success

    return NextResponse.json(
      {
        results,
        summary: {
          total: results.length,
          successful: results.filter((r) => r.success).length,
          failed: results.filter((r) => !r.success).length,
        },
      },
      { status }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error during upload" },
      { status: 500 }
    );
  }
}

async function uploadFile(
  file: File,
  userId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
): Promise<UploadResult> {
  const filename = file.name;

  try {
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        filename,
        error: `File size exceeds 50MB limit`,
      };
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        success: false,
        filename,
        error: `Invalid file type. Only images are allowed.`,
      };
    }

    const extension = filename.split(".").pop()?.toLowerCase() || "";
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const storageKey = `${userId}/${timestamp}-${sanitizedFilename}`;

    const fileBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(fileBuffer);

    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(storageKey, uint8Array, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return {
        success: false,
        filename,
        error: `Upload failed: ${uploadError.message}`,
      };
    }

    const checksum = await generateChecksum(uint8Array);
    let width: number | null = null;
    let height: number | null = null;

    if (file.type.startsWith("image/") && file.type !== "image/svg+xml") {
      try {
        const dimensions = await getImageDimensions(fileBuffer);
        width = dimensions.width;
        height = dimensions.height;
      } catch (err) {
        console.warn("Could not extract image dimensions:", err);
      }
    }

    const imageRecord: TablesInsert<"images"> = {
      owner_id: userId,
      storage_key: storageKey,
      filename: sanitizedFilename,
      extension,
      size_bytes: file.size,
      width,
      height,
      mime_type: file.type,
      checksum,
      visibility: "public",
    };

    const { data: imageData, error: dbError } = await supabase
      .from("images")
      .insert(imageRecord)
      .select()
      .single();

    if (dbError) {
      console.error("Database insert error:", dbError);
      await supabase.storage.from("images").remove([storageKey]);
      return {
        success: false,
        filename,
        error: `Failed to save image metadata: ${dbError.message}`,
      };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(storageKey);

    return {
      success: true,
      filename,
      url: publicUrl,
      publicUrl,
      imageId: imageData.id,
    };
  } catch (error) {
    console.error(`Error uploading ${filename}:`, error);
    return {
      success: false,
      filename,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function generateChecksum(data: Uint8Array): Promise<string> {
  const buffer =
    data.buffer instanceof ArrayBuffer
      ? data.buffer
      : new ArrayBuffer(data.buffer.byteLength);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

async function getImageDimensions(
  buffer: ArrayBuffer
): Promise<{ width: number; height: number }> {
  const uint8Array = new Uint8Array(buffer);

  if (
    uint8Array[0] === 0xff &&
    uint8Array[1] === 0xd8 &&
    uint8Array[2] === 0xff
  ) {
    return getJPEGDimensions(uint8Array);
  } else if (
    uint8Array[0] === 0x89 &&
    uint8Array[1] === 0x50 &&
    uint8Array[2] === 0x4e &&
    uint8Array[3] === 0x47
  ) {
    return getPNGDimensions(uint8Array);
  } else if (
    uint8Array[0] === 0x47 &&
    uint8Array[1] === 0x49 &&
    uint8Array[2] === 0x46
  ) {
    return getGIFDimensions(uint8Array);
  }

  throw new Error("Unsupported image format for dimension extraction");
}

function getPNGDimensions(data: Uint8Array): { width: number; height: number } {
  const width =
    (data[16] << 24) | (data[17] << 16) | (data[18] << 8) | data[19];
  const height =
    (data[20] << 24) | (data[21] << 16) | (data[22] << 8) | data[23];
  return { width, height };
}

function getJPEGDimensions(data: Uint8Array): {
  width: number;
  height: number;
} {
  let offset = 2;
  while (offset < data.length) {
    if (data[offset] !== 0xff) break;

    const marker = data[offset + 1];
    if (marker === 0xc0 || marker === 0xc2) {
      const height = (data[offset + 5] << 8) | data[offset + 6];
      const width = (data[offset + 7] << 8) | data[offset + 8];
      return { width, height };
    }

    const segmentLength = (data[offset + 2] << 8) | data[offset + 3];
    offset += segmentLength + 2;
  }

  throw new Error("Could not find JPEG dimensions");
}

function getGIFDimensions(data: Uint8Array): { width: number; height: number } {
  const width = data[6] | (data[7] << 8);
  const height = data[8] | (data[9] << 8);
  return { width, height };
}
