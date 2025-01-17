"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";
import { runAsynchronously } from "@stackframe/stack-shared/dist/utils/promises";
import { useAsyncCallback } from "@stackframe/stack-shared/dist/hooks/use-async-callback";
import { Spinner } from "./spinner";

interface OriginalSwitchProps extends React.ComponentProps<typeof SwitchPrimitives.Root> {}

const OriginalSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  OriginalSwitchProps
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
));
OriginalSwitch.displayName = SwitchPrimitives.Root.displayName;
interface AsyncSwitchProps extends OriginalSwitchProps {
  onCheckedChange?: (checked: boolean) => Promise<void> | void,
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void> | void,
  loading?: boolean,
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  AsyncSwitchProps
>(({ loading: loadingProp, onClick, onCheckedChange, ...props }, ref) => {
  const [handleClick, isLoadingClick] = useAsyncCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    await onClick?.(e);
  }, [onClick]);

  const [handleCheckedChange, isLoadingCheckedChange] = useAsyncCallback(async (checked: boolean) => {
    await onCheckedChange?.(checked);
  }, [onCheckedChange]);

  const loading = loadingProp || isLoadingClick || isLoadingCheckedChange;

  return (
    <span className="relative leading-[0]">
      <OriginalSwitch
        {...props}
        ref={ref}
        onClick={(e) => runAsynchronously(handleClick(e))}
        onCheckedChange={(checked) => runAsynchronously(handleCheckedChange(checked))}
        disabled={props.disabled || loading}
        style={{
          visibility: loading ? "hidden" : "visible",
          ...props.style,
        }}
      />
      <span className={cn("absolute inset-0 flex items-center justify-center", !loading && "hidden")}>
        <Spinner />
      </span>
    </span>
  );
});
Switch.displayName = "Switch";

export { Switch };
