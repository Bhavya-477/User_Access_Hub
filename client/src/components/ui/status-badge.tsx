import { FC } from "react";

type StatusBadgeProps = {
  status: "Pending" | "Approved" | "Rejected";
  size?: "sm" | "md";
};

const StatusBadge: FC<StatusBadgeProps> = ({ status, size = "sm" }) => {
  const getStatusClasses = () => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const sizeClasses = size === "sm" 
    ? "px-2 text-xs leading-5" 
    : "px-3 py-1 text-sm";

  return (
    <span className={`inline-flex items-center ${sizeClasses} font-semibold rounded-full ${getStatusClasses()}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
