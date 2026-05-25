import type React from "react";
import Link from "next/link";

interface DropdownItemProps {
  tag?: "a" | "button";
  href?: string;
  onClick?: () => void | Promise<void>;
  onItemClick?: () => void | Promise<void>;
  baseClassName?: string;
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  tag = "button",
  href,
  onClick,
  onItemClick,
  baseClassName = "block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900",
  className = "",
  disabled = false,
  children,
}) => {
  const combinedClasses = `${baseClassName} ${className}`.trim();

  const handleClick = async (event: React.MouseEvent) => {
    if (tag === "button" || disabled) {
      event.preventDefault();
    }
    if (disabled) return;

    if (onClick) onClick();
    if (onItemClick) onItemClick();
  };

  if (tag === "a" && href) {
    return (
      <Link
        href={href}
        className={combinedClasses}
        onClick={handleClick}
        aria-disabled={disabled}
      >
        {children}
      </Link>
    );
  }

  return (
    <button onClick={handleClick} className={combinedClasses} disabled={disabled}>
      {children}
    </button>
  );
};
