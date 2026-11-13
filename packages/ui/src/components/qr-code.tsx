"use client";

import { cn } from "cn";
import { QRCodeSVG } from "qrcode.react";
import type * as React from "react";

/**
 * QR Code numa moldura, para a pessoa ler com a câmera de outro aparelho, como o do Pix.
 *
 * As cores são fixas, escuro sobre branco, nos dois temas: leitores de QR Code precisam do
 * contraste, e um código claro sobre fundo escuro falha em parte deles. A moldura branca é a
 * margem de silêncio do código.
 */
function QrCode({
  value,
  label,
  size = 184,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  /** O conteúdo do código, como o "copia e cola" do Pix. */
  value: string;
  /** O que o código é, para leitores de tela (ex. "QR Code Pix de R$ 120,00"). */
  label: string;
  /** Lado do código, em pixels. */
  size?: number;
}) {
  return (
    <div
      data-slot="qr-code"
      className={cn("inline-block rounded-item bg-white p-4 ring-1 ring-black/10", className)}
      {...props}
    >
      <QRCodeSVG
        value={value}
        size={size}
        marginSize={0}
        fgColor="#0a0a0a"
        bgColor="#ffffff"
        title={label}
        role="img"
        aria-label={label}
        className="block"
      />
    </div>
  );
}

export { QrCode };
