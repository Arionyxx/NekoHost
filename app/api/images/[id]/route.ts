import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const { id } = params;

    // Fetch the image to verify ownership and get storage key
    const { data: image, error: fetchError } = await supabase
      .from("images")
      .select("id, owner_id, storage_key")
      .eq("id", id)
      .single();

    if (fetchError || !image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Verify ownership
    if (image.owner_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden. You can only delete your own images." },
        { status: 403 }
      );
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("images")
      .remove([image.storage_key]);

    if (storageError) {
      console.error("Storage deletion error:", storageError);
      return NextResponse.json(
        { error: "Failed to delete image from storage" },
        { status: 500 }
      );
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from("images")
      .delete()
      .eq("id", id);

    if (dbError) {
      console.error("Database deletion error:", dbError);
      return NextResponse.json(
        { error: "Failed to delete image metadata" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Image deleted" });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { visibility } = body;

    if (!visibility || !["public", "private"].includes(visibility)) {
      return NextResponse.json(
        { error: "Invalid visibility value. Must be 'public' or 'private'." },
        { status: 400 }
      );
    }

    // Fetch the image to verify ownership
    const { data: image, error: fetchError } = await supabase
      .from("images")
      .select("id, owner_id")
      .eq("id", id)
      .single();

    if (fetchError || !image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Verify ownership
    if (image.owner_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden. You can only modify your own images." },
        { status: 403 }
      );
    }

    // Update visibility
    const { error: updateError } = await supabase
      .from("images")
      .update({ visibility })
      .eq("id", id);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update visibility" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      visibility,
      message: `Visibility updated to ${visibility}`,
    });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
