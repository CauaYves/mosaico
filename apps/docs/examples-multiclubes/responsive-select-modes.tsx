import { ResponsiveSelect } from "@multiclubes/ui/components/responsive-select";

const FORMAS = [
  { label: "PIX", value: "pix" },
  { label: "Cartão de crédito", value: "credito" },
  { label: "Cartão salvo", value: "salvo" },
];

export default function ResponsiveSelectModes() {
  return (
    <div className="grid w-full max-w-md gap-4 sm:grid-cols-2">
      <ResponsiveSelect
        items={FORMAS}
        defaultValue="pix"
        mode="native"
        aria-label="Forma de pagamento (nativo)"
      />
      <ResponsiveSelect
        items={FORMAS}
        defaultValue="pix"
        mode="select"
        aria-label="Forma de pagamento (Select do kit)"
      />
    </div>
  );
}
