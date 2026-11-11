"use client";

import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import * as React from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/registry/mosaico/components/mosaico/input-group";

/** Tempo, em ms, em que o botão mostra o check depois de copiar. */
const COPIED_MS = 2000;

type CopyFieldProps = Omit<React.ComponentProps<typeof InputGroup>, "onCopy" | "children"> & {
  /** Texto exibido e copiado, como o código "copia e cola" do PIX. */
  value: string;
  /**
   * O que é copiado, em minúsculas no meio da frase (ex. "código PIX"). Dá nome ao botão
   * ("Copiar código PIX") e ao campo. Sem `label`, o botão se chama "Copiar" e o campo recebe o
   * nome do FieldLabel, quando está num Field, ou do `aria-label` passado.
   */
  label?: string;
  /** Chamado depois de copiar com sucesso. */
  onCopy?: (value: string) => void;
  disabled?: boolean;
};

/**
 * Campo somente leitura com botão de copiar, para códigos que a pessoa leva para outro app
 * (PIX "copia e cola", cupom, link de convite). Copiar avisa "Copiado" ao leitor de tela e
 * troca o ícone por um check. Sem acesso à área de transferência, o texto fica selecionado
 * para a pessoa copiar pelo teclado.
 */
function CopyField({ value, label, onCopy, disabled, className, ...props }: CopyFieldProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [copied, setCopied] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(timeout);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setFailed(false);
      setCopied(true);
      onCopy?.(value);
    } catch {
      setCopied(false);
      setFailed(true);
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  };

  const buttonLabel = label ? `Copiar ${label}` : "Copiar";
  let status = "";
  if (copied) status = "Copiado";
  else if (failed) status = "Não foi possível copiar. O texto está selecionado: use Ctrl+C.";

  return (
    <InputGroup
      data-slot="copy-field"
      data-copied={copied || undefined}
      data-disabled={disabled || undefined}
      className={className}
      {...props}
    >
      <InputGroupInput
        ref={inputRef}
        readOnly
        disabled={disabled}
        value={value}
        aria-label={label}
        spellCheck={false}
        className="truncate"
        onFocus={(event) => event.currentTarget.select()}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          data-slot="copy-field-button"
          size="icon-sm"
          aria-label={buttonLabel}
          disabled={disabled}
          onClick={copy}
        >
          {copied ? <CheckIcon aria-hidden="true" /> : <CopyIcon aria-hidden="true" />}
        </InputGroupButton>
      </InputGroupAddon>
      <span aria-live="polite" className="sr-only">
        {status}
      </span>
    </InputGroup>
  );
}

export { CopyField };
