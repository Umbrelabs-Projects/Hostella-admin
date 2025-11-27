interface AdminTypeBadgeProps {
  type: string;
}

export function AdminTypeBadge({ type }: AdminTypeBadgeProps) {
  const getTypeStyles = (type: string) => {
    switch (type) {
      case "Admin":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200";
      case "Agent":
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200";
      case "Accounting":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${getTypeStyles(
        type
      )}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          type === "Admin"
            ? "bg-green-500"
            : type === "Accounting"
            ? "bg-amber-500"
            : "bg-gray-500"
        }`}
      />
      {type}
    </div>
  );
}
