import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export function Button({ className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition ${className}`}
      {...props}
    />
  );
}
