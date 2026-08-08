import { Bot, CalendarClock, ExternalLink, Pencil, ThumbsDown, ThumbsUp, MessageSquareQuote } from "lucide-react";
import type { Post } from "@/types/post";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  onApprove: (post: Post) => void;
  onReject: (post: Post) => void;
  onEdit: (post: Post) => void;
}

export function PostCard({ post, onApprove, onReject, onEdit }: PostCardProps) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {post.selectedTopic}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1">
              <CalendarClock className="h-3.5 w-3.5" />
              {formatDate(post.createdAt)}
            </span>
            <span className="inline-flex items-center gap-1">
              <ExternalLink className="h-3.5 w-3.5" />
              {post.source}
            </span>
          </div>
        </div>
        <StatusBadge status={post.status} />
      </div>

      {/* Body */}
      <div className="space-y-4 px-5 py-4">
        {/* Generated post */}
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <Bot className="h-3.5 w-3.5" />
            Generated Post
          </p>
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {post.post}
          </p>
        </div>

        {/* Hashtags */}
        <div className="flex flex-wrap gap-1.5">
          {post.hashtags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Reason */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/50">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <MessageSquareQuote className="h-3.5 w-3.5" />
            Why this post?
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">{post.reason}</p>
        </div>

        {/* Rejection reason */}
        {post.status === "rejected" && post.rejectedReason && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-900 dark:bg-rose-950/50">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-400">
              Rejection reason
            </p>
            <p className="text-sm text-rose-700 dark:text-rose-300">
              {post.rejectedReason}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-5 py-3 dark:border-slate-800">
        <Button
          size="sm"
          variant="success"
          onClick={() => onApprove(post)}
          disabled={post.status === "approved"}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          Approve
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onReject(post)}
          disabled={post.status === "rejected"}
        >
          <ThumbsDown className="h-3.5 w-3.5" />
          Reject
        </Button>
        <Button size="sm" variant="outline" onClick={() => onEdit(post)}>
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
      </div>
    </article>
  );
}
