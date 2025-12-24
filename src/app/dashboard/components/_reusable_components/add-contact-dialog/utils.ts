export const getColorClasses = (color: "blue" | "purple" | "amber") => {
  switch (color) {
    case "blue":
      return {
        iconBg: "bg-blue-100 dark:bg-blue-900/30",
        iconColor: "text-blue-600 dark:text-blue-400",
        border: "border-blue-200 dark:border-blue-800",
      };
    case "purple":
      return {
        iconBg: "bg-purple-100 dark:bg-purple-900/30",
        iconColor: "text-purple-600 dark:text-purple-400",
        border: "border-purple-200 dark:border-purple-800",
      };
    case "amber":
      return {
        iconBg: "bg-amber-100 dark:bg-amber-900/30",
        iconColor: "text-amber-600 dark:text-amber-400",
        border: "border-amber-200 dark:border-amber-800",
      };
  }
};

