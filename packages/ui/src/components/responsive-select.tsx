"use client";

import { cn } from "cn";
import type * as React from "react";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/registry/mosaico/components/mosaico/native-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/mosaico/components/mosaico/select";
import { useIsMobile } from "@/registry/mosaico/hooks/mosaico/use-mobile";

type ResponsiveSelectItem = {
  value: string;
  label: string;
  disabled?: boolean;
};

type ResponsiveSelectProps = Pick<
  React.ComponentProps<"select">,
  "id" | "name" | "required" | "aria-label" | "aria-invalid" | "aria-describedby"
> & {
  /** As opções, na ordem em que aparecem. */
  items: ResponsiveSelectItem[];
  /** Valor escolhido (controlado). `null` ou ausente mostra o placeholder. */
  value?: string | null;
  /** Valor inicial (não controlado). */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Texto mostrado enquanto nada foi escolhido. */
  placeholder?: string;
  disabled?: boolean;
  size?: "sm" | "default";
  /**
   * "auto" usa o seletor nativo do sistema em telas menores que 768px e o Select do kit nas
   * maiores. "native" e "select" fixam um dos dois.
   */
  mode?: "auto" | "native" | "select";
  className?: string;
};

/**
 * Seletor de opção com forma diferente por dispositivo, como o DateField.
 *
 * No celular, o <select> do sistema: abre a roda ou a folha nativa, com rolagem e acessibilidade
 * que o usuário já conhece. No desktop, o Select do kit, com a lista no visual do Mosaico.
 *
 * Os dois recebem o nome, a descrição e o erro de um Field em volta. O controle em uso traz
 * `data-responsive-select="native"` ou `"select"`, além do data-slot dele (native-select ou
 * select-trigger). Prefira o modo controlado
 * (`value` e `onValueChange`): a forma pode trocar quando a tela muda de largura.
 */
function ResponsiveSelect({
  items,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  disabled,
  size = "default",
  mode = "auto",
  className,
  ...controlProps
}: ResponsiveSelectProps) {
  const isMobile = useIsMobile();
  const native = mode === "native" || (mode === "auto" && isMobile);

  if (native) {
    // Sem valor escolhido, o placeholder vira a primeira opção, que não pode ser escolhida.
    const nativeValue = value === undefined ? undefined : (value ?? "");
    const nativeDefault =
      value === undefined ? (defaultValue ?? (placeholder ? "" : undefined)) : undefined;
    return (
      <NativeSelect
        data-responsive-select="native"
        size={size}
        disabled={disabled}
        value={nativeValue}
        defaultValue={nativeDefault}
        onChange={(event) => onValueChange?.(event.target.value)}
        className={cn("w-full", className)}
        {...controlProps}
      >
        {placeholder && (
          <NativeSelectOption value="" disabled>
            {placeholder}
          </NativeSelectOption>
        )}
        {items.map((item) => (
          <NativeSelectOption key={item.value} value={item.value} disabled={item.disabled}>
            {item.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    );
  }

  return (
    <Select
      items={items}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(next) => {
        if (next !== null) onValueChange?.(next as string);
      }}
      disabled={disabled}
      name={controlProps.name}
      required={controlProps.required}
    >
      <SelectTrigger
        data-responsive-select="select"
        size={size}
        id={controlProps.id}
        aria-label={controlProps["aria-label"]}
        aria-invalid={controlProps["aria-invalid"]}
        aria-describedby={controlProps["aria-describedby"]}
        className={cn("w-full", className)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value} disabled={item.disabled}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { ResponsiveSelect, type ResponsiveSelectItem, type ResponsiveSelectProps };
