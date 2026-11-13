import { CopyField } from "@multiclubes/ui/components/copy-field";
import { QrCode } from "@multiclubes/ui/components/qr-code";

const PIX =
  "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913MULTICLUBES6009SAO PAULO62070503***6304ABCD";

export default function QrCodePix() {
  return (
    <div className="grid w-full max-w-sm justify-items-center gap-4">
      <QrCode value={PIX} label="QR Code Pix de R$ 349,00" />
      <CopyField value={PIX} label="código Pix" className="w-full" />
      <p className="flex w-full items-center justify-between gap-4 px-1 text-sm text-muted-foreground">
        <span>Aguardando o pagamento</span>
        <span className="tabular-nums">Válido até 16:34</span>
      </p>
    </div>
  );
}
