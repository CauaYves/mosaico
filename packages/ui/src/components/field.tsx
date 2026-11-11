"use client";

import { Field as FieldPrimitive } from "@base-ui/react/field";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { createContext, useContext, useMemo } from "react";
import { Label } from "@/registry/mosaico/components/mosaico/label";
import { Separator } from "@/registry/mosaico/components/mosaico/separator";

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        "flex flex-col gap-6 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
        className,
      )}
      {...props}
    />
  );
}

function FieldLegend({
  className,
  variant = "legend",
  ...props
}: React.ComponentProps<"legend"> & { variant?: "legend" | "label" }) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        "mb-3 font-medium data-[variant=label]:text-sm data-[variant=legend]:text-base",
        className,
      )}
      {...props}
    />
  );
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "group/field-group @container/field-group flex w-full flex-col gap-7 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4",
        className,
      )}
      {...props}
    />
  );
}

const fieldVariants = cva("group/field flex w-full gap-3 data-invalid:text-destructive", {
  variants: {
    orientation: {
      vertical: "flex-col *:w-full [&>.sr-only]:w-auto",
      horizontal:
        "flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
      responsive:
        "flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});

// As partes do Field do Base UI (descrição e erro) exigem um Field em volta. Fora dele, como
// num FieldSet, o FieldDescription e o FieldError renderizam o elemento simples de antes.
const InFieldContext = createContext(false);

/**
 * Campo de formulário sobre o Field do Base UI: o `FieldLabel` dá nome ao controle, e o
 * `FieldDescription` e o `FieldError` entram no `aria-describedby` dele, sem ids à mão. Funciona
 * com os controles do kit feitos sobre o Base UI (Input, InputGroupInput, Textarea, Select,
 * Checkbox, RadioGroup, Switch, Slider).
 *
 * `invalid` marca o campo com erro: o controle recebe `aria-invalid` e o campo, `data-invalid`.
 * `data-invalid`, como na documentação do shadcn, também vale.
 */
function Field({
  className,
  orientation = "vertical",
  invalid,
  ...props
}: Omit<FieldPrimitive.Root.Props, "className"> & {
  className?: string;
  "data-invalid"?: boolean | "true" | "false";
} & VariantProps<typeof fieldVariants>) {
  const { "data-invalid": dataInvalid, ...rest } = props;
  return (
    <InFieldContext.Provider value={true}>
      <FieldPrimitive.Root
        role="group"
        data-slot="field"
        data-orientation={orientation}
        invalid={invalid ?? (dataInvalid === true || dataInvalid === "true" ? true : undefined)}
        className={cn(fieldVariants({ orientation }), className)}
        {...rest}
      />
    </InFieldContext.Provider>
  );
}

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn("group/field-content flex flex-1 flex-col gap-1 leading-snug", className)}
      {...props}
    />
  );
}

function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  // Fora de um Field (rótulo solto com htmlFor, ou o cartão de escolha que envolve um Field),
  // fica o <label> simples: a ligação com o controle é pelo htmlFor de quem usa.
  const inField = useContext(InFieldContext);
  const labelClassName = cn(
    "group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-disabled/field:opacity-50 has-data-checked:bg-input/30 has-[>[data-slot=field]]:rounded-item has-[>[data-slot=field]]:border has-[>[data-slot=field]]:not-has-[:disabled,[data-disabled]]:hover:bg-input/40 has-[>[data-slot=field]]:has-[:focus-visible]:border-ring/60 has-[>[data-slot=field]]:has-[:focus-visible]:ring-1 has-[>[data-slot=field]]:has-[:focus-visible]:ring-ring/60 *:data-[slot=field]:p-4",
    "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",
    className,
  );
  if (!inField) {
    return <Label data-slot="field-label" className={labelClassName} {...props} />;
  }
  return (
    <FieldPrimitive.Label
      render={<Label />}
      data-slot="field-label"
      className={labelClassName}
      {...props}
    />
  );
}

function FieldTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-label"
      className={cn(
        "flex w-fit items-center gap-2 text-sm font-medium group-data-disabled/field:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  const Description = useContext(InFieldContext) ? FieldPrimitive.Description : "p";
  return (
    <Description
      data-slot="field-description"
      className={cn(
        "text-left text-sm leading-normal font-normal text-muted-foreground group-has-data-horizontal/field:text-balance [[data-variant=legend]+&]:-mt-1.5",
        "last:mt-0 nth-last-2:-mt-1",
        "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className,
      )}
      {...props}
    />
  );
}

function FieldSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  children?: React.ReactNode;
}) {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn(
        "relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2",
        className,
      )}
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span
          className="relative mx-auto block w-fit bg-background px-2 text-muted-foreground"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  );
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>;
}) {
  const inField = useContext(InFieldContext);
  const content = useMemo(() => {
    if (children) {
      return children;
    }

    if (!errors?.length) {
      return null;
    }

    const uniqueErrors = [...new Map(errors.map((error) => [error?.message, error])).values()];

    if (uniqueErrors?.length === 1) {
      return uniqueErrors[0]?.message;
    }

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {uniqueErrors.map((error, index) => error?.message && <li key={index}>{error.message}</li>)}
      </ul>
    );
  }, [children, errors]);

  if (!content) {
    return null;
  }

  const errorProps = {
    role: "alert",
    "data-slot": "field-error",
    className: cn("text-sm font-normal text-destructive", className),
    ...props,
  };
  // match: o erro aparece sempre que tiver conteúdo; a validação é de quem usa o campo.
  return inField ? (
    <FieldPrimitive.Error match {...errorProps}>
      {content}
    </FieldPrimitive.Error>
  ) : (
    <div {...errorProps}>{content}</div>
  );
}

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
};
