import { QrCode } from "@multiclubes/ui/components/qr-code";

const PIX =
  "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913MULTICLUBES6009SAO PAULO62070503***6304ABCD";

export default function QrCodeDemo() {
  return <QrCode value={PIX} label="QR Code Pix de R$ 349,00" />;
}
