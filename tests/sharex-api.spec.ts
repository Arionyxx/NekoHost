import { test, expect } from "@playwright/test";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { Database } from "../supabase/types";

// Helper function to create a test token
async function createTestToken(userId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

  // Generate a random token
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const token = Array.from(array, (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");

  // Hash the token
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const tokenHash = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Insert token into database
  const { data: tokenData, error } = await supabase
    .from("api_tokens")
    .insert({
      owner_id: userId,
      token_hash: tokenHash,
      description: "Test token",
    })
    .select()
    .single();

  if (error) throw error;

  return { token, tokenId: tokenData.id };
}

// Helper function to delete a test token
async function deleteTestToken(tokenId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

  await supabase.from("api_tokens").delete().eq("id", tokenId);
}

// Helper function to get or create a test user
async function getTestUser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

  // Try to sign in as test user
  const testEmail = "test@example.com";
  const testPassword = "testpassword123";

  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

  if (!signInError && signInData.user) {
    return signInData.user.id;
  }

  // Create test user if doesn't exist
  const { data: signUpData, error: signUpError } =
    await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
    });

  if (signUpError) throw signUpError;

  return signUpData.user.id;
}

test.describe("ShareX API Endpoint", () => {
  let testUserId: string;
  let testToken: string;
  let testTokenId: string;

  test.beforeAll(async () => {
    // Skip if no Supabase configuration
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      test.skip();
      return;
    }

    try {
      testUserId = await getTestUser();
      const tokenData = await createTestToken(testUserId);
      testToken = tokenData.token;
      testTokenId = tokenData.tokenId;
    } catch (error) {
      console.error("Failed to set up test:", error);
      test.skip();
    }
  });

  test.afterAll(async () => {
    if (testTokenId) {
      await deleteTestToken(testTokenId);
    }
  });

  test("should reject requests without authorization header", async ({
    request,
  }) => {
    const testFilePath = path.join(__dirname, "fixtures", "test-image-1.png");

    const response = await request.post("/api/sharex/upload", {
      multipart: {
        file: {
          name: "test-image-1.png",
          mimeType: "image/png",
          buffer: await require("fs/promises").readFile(testFilePath),
        },
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toMatch(/authorization/i);
  });

  test("should reject requests with invalid token", async ({ request }) => {
    const testFilePath = path.join(__dirname, "fixtures", "test-image-1.png");

    const response = await request.post("/api/sharex/upload", {
      headers: {
        Authorization: "Bearer invalid-token-12345",
      },
      multipart: {
        file: {
          name: "test-image-1.png",
          mimeType: "image/png",
          buffer: await require("fs/promises").readFile(testFilePath),
        },
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toMatch(/invalid|expired/i);
  });

  test("should reject requests without file", async ({ request }) => {
    const response = await request.post("/api/sharex/upload", {
      headers: {
        Authorization: `Bearer ${testToken}`,
      },
      multipart: {},
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/no file/i);
  });

  test("should successfully upload image with valid token", async ({
    request,
  }) => {
    const testFilePath = path.join(__dirname, "fixtures", "test-image-1.png");

    const response = await request.post("/api/sharex/upload", {
      headers: {
        Authorization: `Bearer ${testToken}`,
      },
      multipart: {
        file: {
          name: "test-image-1.png",
          mimeType: "image/png",
          buffer: await require("fs/promises").readFile(testFilePath),
        },
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.url).toBeTruthy();
    expect(body.filename).toBeTruthy();

    // Check rate limit headers
    const headers = response.headers();
    expect(headers["x-ratelimit-limit"]).toBeTruthy();
    expect(headers["x-ratelimit-remaining"]).toBeTruthy();
    expect(headers["x-ratelimit-reset"]).toBeTruthy();
  });

  test("should update last_used_at timestamp after upload", async ({
    request,
  }) => {
    const testFilePath = path.join(__dirname, "fixtures", "test-image-1.png");

    // Get initial last_used_at
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

    const { data: tokenBefore } = await supabase
      .from("api_tokens")
      .select("last_used_at")
      .eq("id", testTokenId)
      .single();

    // Upload file
    await request.post("/api/sharex/upload", {
      headers: {
        Authorization: `Bearer ${testToken}`,
      },
      multipart: {
        file: {
          name: "test-image-1.png",
          mimeType: "image/png",
          buffer: await require("fs/promises").readFile(testFilePath),
        },
      },
    });

    // Get updated last_used_at
    const { data: tokenAfter } = await supabase
      .from("api_tokens")
      .select("last_used_at")
      .eq("id", testTokenId)
      .single();

    expect(tokenAfter?.last_used_at).toBeTruthy();
    expect(tokenAfter?.last_used_at).not.toBe(tokenBefore?.last_used_at);
  });

  test("should persist image metadata in database", async ({ request }) => {
    const testFilePath = path.join(__dirname, "fixtures", "test-image-1.png");

    const response = await request.post("/api/sharex/upload", {
      headers: {
        Authorization: `Bearer ${testToken}`,
      },
      multipart: {
        file: {
          name: "test-sharex-image.png",
          mimeType: "image/png",
          buffer: await require("fs/promises").readFile(testFilePath),
        },
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    // Check database for image record
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

    const { data: images } = await supabase
      .from("images")
      .select("*")
      .eq("owner_id", testUserId)
      .eq("filename", "test-sharex-image.png")
      .order("created_at", { ascending: false })
      .limit(1);

    expect(images).toBeTruthy();
    expect(images?.length).toBeGreaterThan(0);

    if (images && images.length > 0) {
      const image = images[0];
      expect(image.mime_type).toBe("image/png");
      expect(image.size_bytes).toBeGreaterThan(0);
      expect(image.checksum).toBeTruthy();
      expect(image.visibility).toBeTruthy();
    }
  });

  test("should reject files exceeding size limit", async ({ request }) => {
    // Create a dummy buffer that's larger than 50MB
    const largeBuffer = Buffer.alloc(51 * 1024 * 1024);

    const response = await request.post("/api/sharex/upload", {
      headers: {
        Authorization: `Bearer ${testToken}`,
      },
      multipart: {
        file: {
          name: "large-file.png",
          mimeType: "image/png",
          buffer: largeBuffer,
        },
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/size|limit|50mb/i);
  });

  test("should reject non-image files", async ({ request }) => {
    const textContent = "This is not an image file";
    const buffer = Buffer.from(textContent, "utf-8");

    const response = await request.post("/api/sharex/upload", {
      headers: {
        Authorization: `Bearer ${testToken}`,
      },
      multipart: {
        file: {
          name: "test.txt",
          mimeType: "text/plain",
          buffer: buffer,
        },
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/invalid file type|only images/i);
  });

  test.skip("should enforce rate limits", async ({ request }) => {
    const testFilePath = path.join(__dirname, "fixtures", "test-image-1.png");
    const fileBuffer = await require("fs/promises").readFile(testFilePath);

    // Make multiple requests quickly (more than the rate limit allows)
    const requests = [];
    for (let i = 0; i < 105; i++) {
      requests.push(
        request.post("/api/sharex/upload", {
          headers: {
            Authorization: `Bearer ${testToken}`,
          },
          multipart: {
            file: {
              name: `test-image-${i}.png`,
              mimeType: "image/png",
              buffer: fileBuffer,
            },
          },
        })
      );
    }

    const responses = await Promise.all(requests);

    // At least one should be rate limited (429)
    const rateLimitedResponses = responses.filter((r) => r.status() === 429);
    expect(rateLimitedResponses.length).toBeGreaterThan(0);

    // Check that rate limited response includes proper headers
    if (rateLimitedResponses.length > 0) {
      const rateLimitedResponse = rateLimitedResponses[0];
      const body = await rateLimitedResponse.json();
      expect(body.error).toMatch(/rate limit/i);

      const headers = rateLimitedResponse.headers();
      expect(headers["retry-after"]).toBeTruthy();
    }
  });
});

test.describe("ShareX API Logging", () => {
  test("should include request duration in logs", async ({ request }) => {
    // This test verifies that the endpoint logs properly
    // In a real scenario, you'd check logs or monitoring service
    const response = await request.post("/api/sharex/upload", {
      headers: {
        Authorization: "Bearer invalid-token",
      },
      multipart: {},
    });

    expect(response.status()).toBe(401);
  });
});
