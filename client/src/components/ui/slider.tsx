import * as SliderPrimitive from "@radix-ui/react-slider";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Slider({
  className,
  ...props
}: ComponentProps<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root
      className={cn(
        "relative flex w-full touch-none items-center select-none",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-white/10">
        <SliderPrimitive.Range className="absolute h-full bg-gold" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block size-5 rounded-full border border-gold/40 bg-foreground shadow-lg transition-[box-shadow,border-color] duration-200 hover:border-gold hover:shadow-[0_0_0_4px_oklch(0.86_0.09_82/0.2)] focus-visible:ring-2 focus-visible:ring-gold/40" />
    </SliderPrimitive.Root>
  );
}

export { Slider };
