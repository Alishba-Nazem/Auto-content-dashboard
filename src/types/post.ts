export type PostStatus = "pending" | "approved" | "rejected";

export interface Post {
  id: string;
  selectedTopic: string;
  source: string;
  post: string;
  hashtags: string[];
  reason: string;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
  rejectedReason?: string | null;
}

export interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}
