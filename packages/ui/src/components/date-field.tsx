"use client";

import { CalendarBlankIcon } from "@phosphor-icons/react";
import { InputMask } from "@react-input/mask";
import { format, isValid, parse } from "date-fns";
import * as React from "react";
import { Button } from "@/registry/mosaico/components/mosaico/button";
import {
  clampDateToRange,
  DateWheelPicker,
} from "@/registry/mosaico/components/mosaico/date-wheel-picker";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/registry/mosaico/components/mosaico/drawer";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/registry/mosaico/components/mosaico/input-group";
import { useIsMobile } from "@/registry/mosaico/hooks/mosaico/use-mobile";

const DISPLAY_FORMAT = "dd/MM/yyyy";
const ISO_FORMAT = "yyyy-MM-dd";
const DATE_MASK = "__/__/____";

/** "dd/MM/yyyy" para "yyyy-MM-dd". Valor incompleto ou inválido vira "". */
function toISODate(value: string) {
  const parsed = parse(value, DISPLAY_FORMAT, new Date());
  return isValid(parsed) && value.length === DISPLAY_FORMAT.length
    ? format(parsed, ISO_FORMAT)
    : "";
}

/** "yyyy-MM-dd" para "dd/MM/yyyy". */
function toDisplayDate(value: string) {
  return format(parse(value, ISO_FORMAT, new Date()), DISPLAY_FORMAT);
}

/**
 * Converte o valor do campo para o rascunho da roda.
 *
 * O rascunho é sempre a data que a roda vai exibir — é ela que o "Ok" grava se o
 * usuário confirmar sem rolar nada. Por isso passa pelo mesmo limite da roda: sem
 * data (ou com uma incompleta, como o valor parcial da máscara) vira hoje, e uma
 * data fora de `minDate`/`maxDate` vira o limite mais próximo.
 */
function toDraftValue(value: string, minDate?: string, maxDate?: string) {
  return clampDateToRange(toISODate(value) || undefined, { minDate, maxDate });
}

interface DateFieldProps
  extends Pick<
    React.ComponentProps<"input">,
    "id" | "name" | "placeholder" | "required" | "aria-invalid" | "aria-describedby"
  > {
  /** Valor do campo, em "dd/MM/yyyy". Pode estar incompleto enquanto é digitado. */
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  /** Título do drawer. Sem `id` (e portanto sem <label>), é também o nome acessível do campo. */
  label?: string;
  /** Limite inferior da roda, em "yyyy-MM-dd". */
  minDate?: string;
  /** Limite superior da roda, em "yyyy-MM-dd". Padrão: hoje. */
  maxDate?: string;
  disabled?: boolean;
  /**
   * "auto" usa a roda em telas menores que 768px e o campo digitável nas maiores.
   * "drawer" e "input" fixam um dos modos.
   */
  mode?: "auto" | "drawer" | "input";
  className?: string;
}

/**
 * Campo de data com forma diferente por dispositivo.
 *
 * No mobile, um campo que abre um drawer com a roda de dia/mês/ano. A roda mexe num
 * rascunho, não no valor: só o "Ok" confirma, então fechar o drawer descarta a escolha.
 *
 * No desktop, a roda só atrapalha: com teclado, digitar "01/02/1990" é mais rápido
 * que rolar três colunas. Ali o campo vira um input com máscara.
 *
 * `minDate`/`maxDate` valem só para a roda. O campo digitável aceita qualquer data;
 * a validação fica com o formulário.
 */
function DateField({
  value,
  onChange,
  onBlur,
  label = "Data",
  minDate,
  maxDate,
  disabled,
  mode = "auto",
  className,
  ...inputProps
}: DateFieldProps) {
  const isMobile = useIsMobile();
  // Com `id`, o nome vem do <label htmlFor> (ex.: FieldLabel); aria-label o sobrescreveria.
  const accessibleLabel = inputProps.id ? undefined : label;
  const useDrawer = mode === "drawer" || (mode === "auto" && isMobile);

  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState(() => toDraftValue(value, minDate, maxDate));
  const displayInputRef = React.useRef<HTMLInputElement>(null);

  if (!useDrawer) {
    return (
      <InputGroup data-slot="date-field" className={className}>
        <InputMask
          component={InputGroupInput}
          mask={DATE_MASK}
          replacement={{ _: /\d/ }}
          inputMode="numeric"
          placeholder="dd/mm/aaaa"
          aria-label={accessibleLabel}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          {...inputProps}
        />
        <InputGroupAddon align="inline-end">
          <CalendarBlankIcon />
        </InputGroupAddon>
      </InputGroup>
    );
  }

  const handleOpenChange = (nextOpen: boolean) => {
    // Reabrir sempre parte do valor atual, descartando um rascunho que tenha
    // sobrado de uma abertura anterior cancelada.
    if (nextOpen) setDraft(toDraftValue(value, minDate, maxDate));
    else onBlur?.();
    setOpen(nextOpen);
  };

  const openDrawer = () => {
    if (!disabled) handleOpenChange(true);
  };

  const handleConfirm = () => {
    onChange(toDisplayDate(draft));
    setOpen(false);
    onBlur?.();
  };

  // O campo visível é somente leitura, e o navegador não valida campos somente
  // leitura: `required` seria ignorado. Nome e obrigatoriedade vão para um input
  // invisível sobre o campo, que participa do formulário e da validação nativa.
  const { name, required, ...displayInputProps } = inputProps;

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <InputGroup data-slot="date-field" className={className}>
        <input
          tabIndex={-1}
          aria-hidden="true"
          name={name}
          required={required}
          disabled={disabled}
          value={value}
          // Somente o campo visível altera o valor.
          onChange={() => {}}
          // A validação nativa foca o primeiro campo inválido; o foco vai para o visível.
          onFocus={() => displayInputRef.current?.focus()}
          className="pointer-events-none absolute inset-0 opacity-0"
        />
        <InputGroupInput
          ref={displayInputRef}
          aria-required={required || undefined}
          placeholder="dd/mm/aaaa"
          aria-label={accessibleLabel}
          value={value}
          disabled={disabled}
          // O valor só muda pela roda; `inputMode="none"` evita que o teclado virtual
          // suba ao tocar no campo.
          readOnly
          inputMode="none"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={openDrawer}
          // Um input somente leitura recebe foco pelo Tab, mas não abre nada sozinho:
          // sem isto o campo seria inalcançável por teclado.
          onKeyDown={(event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            openDrawer();
          }}
          {...displayInputProps}
        />
        <InputGroupAddon align="inline-end" onClick={openDrawer}>
          <CalendarBlankIcon />
        </InputGroupAddon>
      </InputGroup>

      <DrawerContent>
        {/* Em telas largas a roda esticada separa demais as colunas. */}
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>{label}</DrawerTitle>
            <DrawerDescription className="sr-only">
              Role as colunas para escolher dia, mês e ano.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4">
            <DateWheelPicker
              aria-label={label}
              value={draft}
              onValueChange={setDraft}
              minDate={minDate}
              maxDate={maxDate}
            />
          </div>
          <DrawerFooter>
            <Button type="button" onClick={handleConfirm}>
              Ok
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export { DateField, type DateFieldProps };
