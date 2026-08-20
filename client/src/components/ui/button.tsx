import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 active:translate-y-px disabled:pointer-events-none disabled:opacity-40 motion-reduce:transform-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_0_0_1px_oklch(0.86_0.09_82/0.3),0_12px_40px_-16px_oklch(0.86_0.09_82/0.7)] hover:-translate-y-px hover:bg-primary/90 hover:shadow-[0_0_0_1px_oklch(0.86_0.09_82/0.5),0_18px_44px_-14px_oklch(0.86_0.09_82/0.9)]",
        secondary:
          "bg-secondary text-secondary-foreground hover:-translate-y-px hover:bg-secondary/70",
        ghost:
          "text-foreground/80 hover:bg-white/8 hover:text-foreground",
        outline:
          "border border-white/12 bg-transparent text-foreground hover:-translate-y-px hover:border-gold/35 hover:bg-white/6",
        gold: "bg-gold text-primary-foreground hover:-translate-y-px hover:bg-gold/90 hover:shadow-[0_16px_40px_-16px_oklch(0.86_0.09_82/0.8)]",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-7 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, asChild = false, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
});

export { Button, buttonVariants };
