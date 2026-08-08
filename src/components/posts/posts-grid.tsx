import type { Post } from "@/types/post";
import { PostCard } from "@/components/posts/post-card";

interface PostsGridProps {
  posts: Post[];
  onApprove: (post: Post) => void;
  onReject: (post: Post) => void;
  onEdit: (post: Post) => void;
}

export function PostsGrid({ posts, onApprove, onReject, onEdit }: PostsGridProps) {
  if (posts.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          No posts found
        </p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          Try adjusting the status filter or check back when the n8n workflow generates new content.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onApprove={onApprove}
          onReject={onReject}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
