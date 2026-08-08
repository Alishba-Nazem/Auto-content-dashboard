import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type IncomingPostBody = {
  selectedTopic?: unknown;
  reason?: unknown;
  post?: unknown;
  hashtags?: unknown;
  source?: unknown;
};

function isString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validatePostBody(body: IncomingPostBody) {
  const { selectedTopic, reason, post, hashtags, source } = body;

  if (!isString(selectedTopic)) {
    return "selectedTopic is required";
  }

  if (!isString(reason)) {
    return "reason is required";
  }

  if (!isString(post)) {
    return "post is required";
  }

  if (
    !Array.isArray(hashtags) ||
    hashtags.length === 0 ||
    !hashtags.every(isString)
  ) {
    return "hashtags must be a non-empty array of strings";
  }

  if (!isString(source)) {
    return "source is required";
  }

  return null;
}

export async function POST(request: Request) {
  let body: IncomingPostBody;

  try {
    body = (await request.json()) as IncomingPostBody;
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid JSON body",
      },
      { status: 400 }
    );
  }

  const validationError = validatePostBody(body);

  if (validationError) {
    return NextResponse.json(
      {
        success: false,
        error: validationError,
      },
      { status: 400 }
    );
  }

  // Validation above guarantees these values have the correct types.
  const selectedTopic = body.selectedTopic as string;
  const reason = body.reason as string;
  const postContent = body.post as string;
  const hashtags = body.hashtags as string[];
  const source = body.source as string;

  const post = await prisma.post.create({
    data: {
      selectedTopic: selectedTopic.trim(),
      reason: reason.trim(),
      post: postContent.trim(),
      hashtags: hashtags.map((tag) => tag.trim()),
      source: source.trim(),
    },
  });

  return NextResponse.json(
    {
      success: true,
      data: post,
    },
    { status: 201 }
  );
}

export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json({
    success: true,
    data: posts,
  });
}