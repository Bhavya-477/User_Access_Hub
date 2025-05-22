import { FC } from "react";

const Logo: FC<{ size?: "sm" | "md" | "lg" }> = ({ size = "md" }) => {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16"
  };

  return (
    <div className={`${sizes[size]} bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-xl`}>
      <span>A</span>
    </div>
  );
};

export default Logo;
