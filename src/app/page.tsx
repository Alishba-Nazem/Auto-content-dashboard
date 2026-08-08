"use client";

import { useEffect, useMemo, useState } from "react";
import { Inbox } from "lucide-react";
import type { Post, PostStatus, Stats } from "@/types/post";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { PostsGrid } from "@/components/posts/posts-grid";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PostsApiResponse = {
  success: boolean;
  data?: Post[];
};

const filters: { label: string; value: PostStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];
export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<PostStatus | "all">("all");
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editSelectedTopic, setEditSelectedTopic] = useState("");
  const [editPostText, setEditPostText] = useState("");
  const [editHashtagsText, setEditHashtagsText] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const loadPosts = async () => {
    const response = await fetch("/api/posts", { cache: "no-store" });

    if (!response.ok) {
      throw new Error("Failed to fetch posts");
    }

    const payload = (await response.json()) as PostsApiResponse;
    setPosts(payload.data ?? []);
  };

  useEffect(() => {
    let mounted = true;

    async function fetchPosts() {
      try {
        const response = await fetch("/api/posts", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }

        const payload = (await response.json()) as PostsApiResponse;

        if (mounted) {
          setPosts(payload.data ?? []);
        }
      } catch {
        if (mounted) {
          setPosts([]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchPosts();

    return () => {
      mounted = false;
    };
  }, []);

  const stats: Stats = useMemo(
    () => ({
      total: posts.length,
      pending: posts.filter((p) => p.status === "pending").length,
      approved: posts.filter((p) => p.status === "approved").length,
      rejected: posts.filter((p) => p.status === "rejected").length,
    }),
    [posts]
  );

  const filteredPosts = useMemo(
    () =>
      activeFilter === "all"
        ? posts
        : posts.filter((post) => post.status === activeFilter),
    [posts, activeFilter]
  );

  const handleApprove = (post: Post) => {
    void updatePostStatus(post.id, "approved");
  };

  const handleReject = (post: Post) => {
    void updatePostStatus(post.id, "rejected");
  };

  const updatePostStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update post status");
      }

      await loadPosts();
    } catch {
      // Keep current UI behavior unchanged for now.
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setEditSelectedTopic(post.selectedTopic);
    setEditPostText(post.post);
    setEditHashtagsText(post.hashtags.join(", "));
  };

  const closeEditModal = () => {
    if (isSavingEdit) {
      return;
    }

    setEditingPost(null);
    setEditSelectedTopic("");
    setEditPostText("");
    setEditHashtagsText("");
  };

  const handleSaveEdit = async () => {
    if (!editingPost) {
      return;
    }

    const hashtags = editHashtagsText
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    if (!editSelectedTopic.trim() || !editPostText.trim() || hashtags.length === 0) {
      return;
    }

    try {
      setIsSavingEdit(true);

      const response = await fetch(`/api/posts/${editingPost.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedTopic: editSelectedTopic,
          post: editPostText,
          hashtags,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update post");
      }

      await loadPosts();
      closeEditModal();
    } catch {
      // Keep current UI behavior unchanged for now.
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page heading */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Generated Posts
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Review, approve, and manage content generated by your AI agent.
          </p>
        </div>

        {/* Stats */}
        <StatsCards stats={stats} />

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Button
                key={filter.value}
                size="sm"
                variant={activeFilter === filter.value ? "default" : "outline"}
                onClick={() => setActiveFilter(filter.value)}
                className={cn(
                  activeFilter === filter.value &&
                    "bg-indigo-600 text-white hover:bg-indigo-700"
                )}
              >
                {filter.label}
                {filter.value !== "all" && (
                  <span className="ml-1 rounded-full bg-white/20 px-1.5 text-xs">
                    {posts.filter((p) => p.status === filter.value).length}
                  </span>
                )}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Inbox className="h-3.5 w-3.5" />
            {filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""}{" "}
            shown
          </div>
        </div>

        {/* Posts grid */}
        {isLoading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Loading posts...
            </p>
          </div>
        ) : (
          <PostsGrid
            posts={filteredPosts}
            onApprove={handleApprove}
            onReject={handleReject}
            onEdit={handleEdit}
          />
        )}

        {editingPost && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-3 sm:items-center sm:p-6">
            <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Edit Post
                </h3>
                <Button size="sm" variant="outline" onClick={closeEditModal} disabled={isSavingEdit}>
                  Cancel
                </Button>
              </div>

              <div className="space-y-4 px-5 py-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Selected Topic
                  </label>
                  <input
                    value={editSelectedTopic}
                    onChange={(event) => setEditSelectedTopic(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Post
                  </label>
                  <textarea
                    value={editPostText}
                    onChange={(event) => setEditPostText(event.target.value)}
                    rows={6}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Hashtags (comma-separated)
                  </label>
                  <input
                    value={editHashtagsText}
                    onChange={(event) => setEditHashtagsText(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-4 dark:border-slate-800">
                <Button variant="outline" onClick={closeEditModal} disabled={isSavingEdit}>
                  Close
                </Button>
                <Button
                  variant="default"
                  onClick={() => void handleSaveEdit()}
                  disabled={
                    isSavingEdit ||
                    !editSelectedTopic.trim() ||
                    !editPostText.trim() ||
                    !editHashtagsText.trim()
                  }
                >
                  {isSavingEdit ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

