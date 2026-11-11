"use client";

import { ResponsiveSelect } from "@multiclubes/ui/components/responsive-select";
import * as React from "react";

const PARCELAS = [
  { label: "1x de R$ 120,00", value: "1" },
  { label: "2x de R$ 60,00", value: "2" },
  { label: "3x de R$ 40,00", value: "3" },
  { label: "4x de R$ 30,00", value: "4" },
];

export default function ResponsiveSelectDemo() {
  const [parcelas, setParcelas] = React.useState<string | null>(null);

  return (
    <ResponsiveSelect
      items={PARCELAS}
      value={parcelas}
      onValueChange={setParcelas}
      placeholder="Escolha as parcelas"
      aria-label="Parcelas"
      className="max-w-xs"
    />
  );
}
