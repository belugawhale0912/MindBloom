import * as React from "react";
import { cn } from "@/lib/utils";

const Slider = React.forwardRef(
  (
    {
      className,
      value,
      defaultValue,
      onValueChange,
      min = 0,
      max = 100,
      step = 1,
      ...props
    },
    ref,
  ) => {
    // Convert array value to single number for native input range
    const currentValue = value
      ? value[0]
      : defaultValue
        ? defaultValue[0]
        : min;

    const handleChange = (e) => {
      const val = parseFloat(e.target.value);
      if (onValueChange) {
        onValueChange([val]);
      }
    };

    return (
      <input
        type="range"
        ref={ref}
        value={currentValue}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        className={cn(
          "w-full h-2 rounded-lg appearance-none cursor-pointer bg-secondary accent-primary hover:accent-primary/80",
          className,
        )}
        {...props}
      />
    );
  },
);
Slider.displayName = "Slider";

export { Slider };
