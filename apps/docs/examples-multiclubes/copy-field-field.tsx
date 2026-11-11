import { CopyField } from "@multiclubes/ui/components/copy-field";
import { Field, FieldDescription, FieldLabel } from "@multiclubes/ui/components/field";

export default function CopyFieldField() {
  return (
    <Field className="max-w-sm">
      <FieldLabel>Cupom de desconto</FieldLabel>
      <CopyField value="BEMVINDO10" />
      <FieldDescription>Use no carrinho para ganhar 10% na primeira recarga.</FieldDescription>
    </Field>
  );
}
