import { Badge } from "@/components/ui/badge";
import type { PostStatus } from "@/types/post";
import { capitalize } from "@/lib/utils";

const statusStyles: Record<PostStatus, "pending" | "approved" | "rejected"> = {
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
};

export function StatusBadge({ status }: { status: PostStatus }) {
  return (
    <Badge variant={statusStyles[status]}>
      <span
        className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${
          status === "approved"
            ? "bg-emerald-500"
            : status === "rejected"
            ? "bg-rose-500"
            : "bg-amber-500"
        }`}
      />
      {capitalize(status)}
    </Badge>
  );
}
