import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "cn";
import type * as React from "react";

type InputProps = Omit<React.ComponentProps<"input">, "size"> & {
  /**
   * "xl" é o campo grande das telas de uma pergunta por vez no celular, na altura do Button xl.
   * Substitui o atributo `size` do <input>, que mede a largura em caracteres: para isso, use `className`.
   * O InputGroup e o DateField leem o tipo daqui, então um tamanho novo chega aos três.
   */
  size?: "default" | "xl";
};

function Input({ className, type, size = "default", ...props }: InputProps) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      data-size={size}
      className={cn(
        "h-9 w-full min-w-0 rounded-field border border-input bg-transparent px-3 py-1 text-base transition-[color,box-shadow,background-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring/60 focus-visible:ring-1 focus-visible:ring-ring/60 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive/60 aria-invalid:ring-1 aria-invalid:ring-destructive/60 md:text-sm data-[size=xl]:h-14 data-[size=xl]:px-5 data-[size=xl]:text-xl",
        className,
      )}
      {...props}
    />
  );
}

export { Input, type InputProps };
