import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-violet-500",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-600/25 hover:shadow-violet-600/40 hover:brightness-110",
        outline:
          "border border-white/15 bg-white/5 text-foreground hover:bg-white/10 backdrop-blur-sm",
        ghost: "hover:bg-white/10 text-foreground",
        demo:
          "border border-white/10 bg-white/5 text-foreground hover:bg-white/10 hover:border-violet-400/40 backdrop-blur-sm",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
