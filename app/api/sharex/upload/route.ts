import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Database, TablesInsert } from "@/supabase/types";
import { logger, captureException } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limiter";

// Verify environment variables on module load
const checkEnvironmentVariables = () => {
  const requiredVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
  
  const missing = Object.entries(requiredVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  
  if (missing.length > 0) {
    console.error("[ShareX API] Missing environment variables on module load:", missing);
    logger.error({ missingVars: missing }, "ShareX API missing environment variables");
  } else {
    console.log("[ShareX API] Environment variables check passed");
  }
};

// Run check on module load
checkEnvironmentVariables();

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

// Rate limit: 100 uploads per hour per token
const RATE_LIMIT_CONFIG = {
  maxRequests: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
};

interface UploadResult {
  success: boolean;
  filename: string;
  url?: string;
  error?: string;
}

/**
 * ShareX upload endpoint
 * POST /api/sharex/upload
 * Authorization: Bearer <token>
 * Body: multipart/form-data with "file" field
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Log request details for debugging (without sensitive data)
    logger.info({
      method: request.method,
      url: request.url,
      hasAuthHeader: !!request.headers.get("authorization"),
    }, "ShareX upload request received");

    // Extract and validate Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn(
        { headers: request.headers },
        "Missing or invalid authorization header"
      );
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    if (!token || token.length < 32) {
      logger.warn("Invalid token format");
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 401 }
      );
    }

    // Hash the token for database lookup
    const tokenHash = await hashToken(token);

    // Create Supabase client with service role for token validation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Enhanced environment variable validation and logging
    if (!supabaseUrl || !supabaseServiceKey) {
      const missingVars = [];
      if (!supabaseUrl) missingVars.push("NEXT_PUBLIC_SUPABASE_URL");
      if (!supabaseServiceKey) missingVars.push("SUPABASE_SERVICE_ROLE_KEY");
      
      const errorMessage = `Missing required environment variables: ${missingVars.join(", ")}`;
      
      // Log to both logger and console for Vercel function logs
      logger.error({
        missingVariables: missingVars,
        hasSupabaseUrl: !!supabaseUrl,
        hasSupabaseServiceKey: !!supabaseServiceKey,
      }, errorMessage);
      
      console.error("[ShareX Upload Error]", errorMessage, {
        NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? "SET" : "MISSING",
        SUPABASE_SERVICE_ROLE_KEY: supabaseServiceKey ? "SET" : "MISSING",
      });
      
      captureException(new Error(errorMessage));
      
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

    // Validate token and get user ID
    const { data: tokenData, error: tokenError } = await supabase
      .from("api_tokens")
      .select("id, owner_id, description")
      .eq("token_hash", tokenHash)
      .single();

    if (tokenError || !tokenData) {
      // Log detailed error for debugging
      logger.warn(
        { 
          tokenHash: tokenHash.substring(0, 8),
          errorCode: tokenError?.code,
          errorMessage: tokenError?.message,
          errorDetails: tokenError?.details,
        },
        "Invalid or expired token"
      );
      
      // Log to console for Vercel logs
      if (tokenError) {
        console.error("[ShareX Token Validation Error]", {
          code: tokenError.code,
          message: tokenError.message,
          hint: tokenError.hint,
        });
      }
      
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const userId = tokenData.owner_id;
    const tokenId = tokenData.id;

    logger.info(
      { userId, tokenId, description: tokenData.description },
      "Token validated successfully"
    );

    // Check rate limit
    const rateLimitResult = checkRateLimit(tokenId, RATE_LIMIT_CONFIG);
    if (!rateLimitResult.success) {
      logger.warn(
        { userId, tokenId, limit: rateLimitResult.limit },
        "Rate limit exceeded"
      );
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          limit: rateLimitResult.limit,
          reset: new Date(rateLimitResult.reset).toISOString(),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.reset.toString(),
            "Retry-After": Math.ceil(
              (rateLimitResult.reset - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    // Update last_used_at timestamp
    await supabase
      .from("api_tokens")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", tokenId);

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      logger.warn({ userId }, "No file provided in request");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Upload the file
    const result = await uploadFile(file, userId, supabase);

    const duration = Date.now() - startTime;
    logger.info(
      {
        userId,
        tokenId,
        filename: file.name,
        success: result.success,
        duration,
      },
      "Upload request completed"
    );

    // Add rate limit headers to successful responses
    const headers: Record<string, string> = {
      "X-RateLimit-Limit": rateLimitResult.limit.toString(),
      "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
      "X-RateLimit-Reset": rateLimitResult.reset.toString(),
    };

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Upload failed" },
        { status: 400, headers }
      );
    }

    // Return ShareX-compatible response
    return NextResponse.json(
      {
        success: true,
        url: result.url,
        filename: result.filename,
      },
      { status: 200, headers }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Enhanced error logging for debugging
    const errorDetails = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      duration,
    };
    
    logger.error({ error: errorDetails }, "Unexpected error in ShareX upload");
    
    // Log to console for Vercel function logs
    console.error("[ShareX Upload Unexpected Error]", {
      message: errorDetails.message,
      name: errorDetails.name,
      duration: errorDetails.duration,
      stack: errorDetails.stack,
    });
    
    captureException(
      error instanceof Error ? error : new Error("Unknown error"),
      { endpoint: "/api/sharex/upload", ...errorDetails }
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function uploadFile(
  file: File,
  userId: string,
  supabase: ReturnType<typeof createClient<Database>>
): Promise<UploadResult> {
  const filename = file.name;

  try {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        filename,
        error: "File size exceeds 50MB limit",
      };
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        success: false,
        filename,
        error: "Invalid file type. Only images are allowed.",
      };
    }

    // Prepare storage path
    const extension = filename.split(".").pop()?.toLowerCase() || "";
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const storageKey = `${userId}/${timestamp}-${sanitizedFilename}`;

    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(fileBuffer);

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(storageKey, uint8Array, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      logger.error({ 
        error: uploadError, 
        filename, 
        storageKey,
        fileSize: file.size,
        mimeType: file.type,
      }, "Storage upload failed");
      
      console.error("[ShareX Storage Upload Error]", {
        message: uploadError.message,
        filename,
        storageKey,
      });
      
      return {
        success: false,
        filename,
        error: `Upload failed: ${uploadError.message}`,
      };
    }

    // Generate checksum
    const checksum = await generateChecksum(uint8Array);

    // Extract image dimensions
    let width: number | null = null;
    let height: number | null = null;

    if (file.type.startsWith("image/") && file.type !== "image/svg+xml") {
      try {
        const dimensions = await getImageDimensions(fileBuffer);
        width = dimensions.width;
        height = dimensions.height;
      } catch (err) {
        logger.warn({ filename, error: err }, "Could not extract dimensions");
      }
    }

    // Get user's default visibility preference
    const { data: profile } = await supabase
      .from("profiles")
      .select("sharex_default_visibility")
      .eq("id", userId)
      .single();

    const visibility = profile?.sharex_default_visibility || "private";

    // Create database record
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
      visibility,
    };

    const { data: imageData, error: dbError } = await supabase
      .from("images")
      .insert(imageRecord)
      .select()
      .single();

    if (dbError) {
      logger.error({ 
        error: dbError, 
        filename,
        storageKey,
        errorCode: dbError.code,
        errorDetails: dbError.details,
      }, "Database insert failed");
      
      console.error("[ShareX Database Insert Error]", {
        message: dbError.message,
        code: dbError.code,
        hint: dbError.hint,
        filename,
      });
      
      // Cleanup uploaded file
      await supabase.storage.from("images").remove([storageKey]);
      return {
        success: false,
        filename,
        error: `Failed to save metadata: ${dbError.message}`,
      };
    }

    // Construct view URL for ShareX (not direct storage URL)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const viewUrl = `${baseUrl}/i/${imageData.id}`;

    logger.info(
      { userId, filename, imageId: imageData.id, visibility, viewUrl },
      "Image uploaded successfully"
    );

    return {
      success: true,
      filename,
      url: viewUrl,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logger.error({ 
      error, 
      filename,
      errorMessage,
      errorStack,
    }, "Error during file upload");
    
    console.error("[ShareX File Upload Error]", {
      filename,
      message: errorMessage,
      stack: errorStack,
    });
    
    return {
      success: false,
      filename,
      error: errorMessage,
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

  // JPEG
  if (
    uint8Array[0] === 0xff &&
    uint8Array[1] === 0xd8 &&
    uint8Array[2] === 0xff
  ) {
    return getJPEGDimensions(uint8Array);
  }
  // PNG
  else if (
    uint8Array[0] === 0x89 &&
    uint8Array[1] === 0x50 &&
    uint8Array[2] === 0x4e &&
    uint8Array[3] === 0x47
  ) {
    return getPNGDimensions(uint8Array);
  }
  // GIF
  else if (
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

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
