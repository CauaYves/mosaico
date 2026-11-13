"use client";

import { Button } from "@multiclubes/ui/components/button";
import { SuccessCheck } from "@multiclubes/ui/components/success-check";
import * as React from "react";

export default function SuccessCheckDemo() {
  const [run, setRun] = React.useState(0);

  return (
    <div className="grid justify-items-center gap-6">
      <div className="grid justify-items-center gap-3 text-center">
        <SuccessCheck key={run} label="Pagamento confirmado" className="size-16" />
        <p className="text-lg font-semibold tracking-tight">Pagamento confirmado</p>
      </div>
      <Button variant="outline" size="sm" onClick={() => setRun((current) => current + 1)}>
        Repetir a animação
      </Button>
    </div>
  );
}
