import { Field as FieldPrimitive } from "@base-ui/react/field";
import { CaretDownIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import type * as React from "react";

type NativeSelectProps = Omit<React.ComponentProps<"select">, "size"> & {
  size?: "sm" | "default";
};

/**
 * O <select> do navegador com o visual do kit. É renderizado pelo Field.Control do Base UI, como
 * o Input: dentro de um Field, recebe o nome do FieldLabel, a descrição e o erro sem ids à mão.
 */
function NativeSelect({ className, size = "default", ...props }: NativeSelectProps) {
  return (
    <div
      className={cn(
        "group/native-select relative w-fit has-[select:disabled]:opacity-50",
        className,
      )}
      data-slot="native-select-wrapper"
      data-size={size}
    >
      <FieldPrimitive.Control
        render={<select />}
        data-slot="native-select"
        data-size={size}
        className="h-9 w-full min-w-0 appearance-none rounded-field border border-input bg-transparent py-1 pr-8 pl-3 text-sm transition-[color,box-shadow,background-color] outline-none select-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring/60 focus-visible:ring-1 focus-visible:ring-ring/60 disabled:pointer-events-none disabled:cursor-not-allowed aria-invalid:border-destructive/60 aria-invalid:ring-1 aria-invalid:ring-destructive/60 data-[size=sm]:h-8"
        {...(props as FieldPrimitive.Control.Props)}
      />
      <CaretDownIcon
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground select-none"
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  );
}

function NativeSelectOption({ className, ...props }: React.ComponentProps<"option">) {
  return (
    <option
      data-slot="native-select-option"
      className={cn("bg-[Canvas] text-[CanvasText]", className)}
      {...props}
    />
  );
}

function NativeSelectOptGroup({ className, ...props }: React.ComponentProps<"optgroup">) {
  return (
    <optgroup
      data-slot="native-select-optgroup"
      className={cn("bg-[Canvas] text-[CanvasText]", className)}
      {...props}
    />
  );
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption };
