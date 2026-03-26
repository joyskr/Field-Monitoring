import { cn } from "@/lib/utils";

interface BadgeProps {
  label: string;
  className?: string;
  variant?: "default" | "active" | "upcoming" | "expired" | "paused" | "terminated" | "approved" | "pending" | "rejected" | "sending";
}

const variantMap: Record<string, string> = {
  default: "bg-gray-100 text-gray-600",
  active: "bg-green-100 text-green-700 border border-green-300",
  upcoming: "bg-blue-100 text-blue-700 border border-blue-300",
  expired: "bg-gray-100 text-gray-600 border border-gray-300",
  paused: "bg-yellow-100 text-yellow-700 border border-yellow-300",
  terminated: "bg-red-100 text-red-700 border border-red-300",
  approved: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  rejected: "bg-red-100 text-red-700",
  sending: "bg-blue-100 text-blue-700",
};

export default function Badge({ label, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium",
        variantMap[variant],
        className
      )}
    >
      {label}
    </span>
  );
}
