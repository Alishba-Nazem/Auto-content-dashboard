import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type PatchBody = {
  status?: unknown;
  selectedTopic?: unknown;
  post?: unknown;
  hashtags?: unknown;
};

function isAllowedStatus(value: unknown): value is "approved" | "rejected" {
  return value === "approved" || value === "rejected";
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0 && value.every(isNonEmptyString);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { success: false, error: "Post id is required" },
      { status: 400 }
    );
  }

  let body: PatchBody;

  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const hasStatusUpdate = body.status !== undefined;
  const hasContentUpdate =
    body.selectedTopic !== undefined ||
    body.post !== undefined ||
    body.hashtags !== undefined;

  if (!hasStatusUpdate && !hasContentUpdate) {
    return NextResponse.json(
      { success: false, error: "No valid fields provided" },
      { status: 400 }
    );
  }

  if (hasStatusUpdate && !isAllowedStatus(body.status)) {
    return NextResponse.json(
      { success: false, error: "status must be 'approved' or 'rejected'" },
      { status: 400 }
    );
  }

  if (body.selectedTopic !== undefined && !isNonEmptyString(body.selectedTopic)) {
    return NextResponse.json(
      { success: false, error: "selectedTopic must be a non-empty string" },
      { status: 400 }
    );
  }

  if (body.post !== undefined && !isNonEmptyString(body.post)) {
    return NextResponse.json(
      { success: false, error: "post must be a non-empty string" },
      { status: 400 }
    );
  }

  if (body.hashtags !== undefined && !isStringArray(body.hashtags)) {
    return NextResponse.json(
      { success: false, error: "hashtags must be a non-empty array of strings" },
      { status: 400 }
    );
  }

  const data: {
    status?: "approved" | "rejected";
    selectedTopic?: string;
    post?: string;
    hashtags?: string[];
  } = {};

  if (hasStatusUpdate && isAllowedStatus(body.status)) {
    data.status = body.status;
  }

  if (body.selectedTopic !== undefined && isNonEmptyString(body.selectedTopic)) {
    data.selectedTopic = body.selectedTopic.trim();
  }

  if (body.post !== undefined && isNonEmptyString(body.post)) {
    data.post = body.post.trim();
  }

  if (body.hashtags !== undefined && isStringArray(body.hashtags)) {
    data.hashtags = body.hashtags.map((tag) => tag.trim());
  }

  try {
    const post = await prisma.post.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      success: true,
      data: post,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Post not found" },
      { status: 404 }
    );
  }
}