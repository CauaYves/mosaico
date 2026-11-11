"use client";

import { Badge } from "@multiclubes/ui/components/badge";
import { Button } from "@multiclubes/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@multiclubes/ui/components/card";
import { Checkbox } from "@multiclubes/ui/components/checkbox";
import { DateField } from "@multiclubes/ui/components/date-field";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@multiclubes/ui/components/field";
import { Input } from "@multiclubes/ui/components/input";
import { NativeSelect, NativeSelectOption } from "@multiclubes/ui/components/native-select";
import { Switch } from "@multiclubes/ui/components/switch";
import {
  ArrowRightIcon,
  CheckIcon,
  DotsThreeIcon,
  DownloadSimpleIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import * as React from "react";
import { EXTRA_TILES } from "@/components/create-extra";
import { OVERVIEW_TILES } from "@/components/create-overview";

type BoardEntry = { name: string; tile: React.ComponentType };

// Tudo o que aparece no quadro do /create. Os cartões extras entram intercalados com a visão
// geral, para os tipos de componente se misturarem. Todos os textos e valores são ilustrativos.
const OWN: BoardEntry[] = [
  { name: "button", tile: ButtonPreview },
  { name: "form", tile: FormPreview },
  { name: "plan-card", tile: PlanCard },
  { name: "activity-card", tile: ActivityCard },
];
const BOARD: BoardEntry[] = [
  ...OWN,
  ...Array.from({ length: Math.max(OVERVIEW_TILES.length, EXTRA_TILES.length) }, (_, index) =>
    [OVERVIEW_TILES[index], EXTRA_TILES[index]].filter((entry): entry is BoardEntry =>
      Boolean(entry),
    ),
  ).flat(),
];

/**
 * Quadro da prévia, em alvenaria: cada peça tem 22rem de largura e entra logo abaixo da
 * anterior, então não sobra espaço entre peças de alturas diferentes. O quadro é mais largo
 * que a tela e quem está em volta o rola nos dois sentidos.
 */
export function CreateBoard() {
  return (
    <div className="fluid-stagger w-[142.5rem] columns-6 gap-6 p-6 [column-fill:balance]">
      {BOARD.map(({ name, tile: Tile }) => (
        <div key={name} className="mb-6 break-inside-avoid animate-fluid-in">
          <Tile />
        </div>
      ))}
    </div>
  );
}

function ButtonPreview() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-2">
          <Button>Principal</Button>
          <Button variant="secondary">Secundário</Button>
          <Button variant="outline">Contorno</Button>
          <Button variant="ghost">Fantasma</Button>
          <Button variant="destructive">Excluir</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm">Pequeno</Button>
          <Button>Padrão</Button>
          <Button size="lg">Grande</Button>
          <Button size="icon" aria-label="Adicionar">
            <PlusIcon />
          </Button>
          <Button variant="outline" size="icon" aria-label="Mais opções">
            <DotsThreeIcon />
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button>
            <DownloadSimpleIcon data-icon="inline-start" />
            Baixar
          </Button>
          <Button variant="outline">
            Continuar
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
          <Button variant="destructive">
            <TrashIcon data-icon="inline-start" />
            Remover
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Novo</Badge>
          <Badge variant="secondary">Rascunho</Badge>
          <Badge variant="outline">
            <CheckIcon data-icon="inline-start" />
            Concluído
          </Badge>
          <Badge variant="destructive">Atrasado</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function FormPreview() {
  const [date, setDate] = React.useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastro</CardTitle>
        <CardDescription>Preencha os dados para continuar.</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="preview-name">Nome</FieldLabel>
            <Input id="preview-name" placeholder="Nome completo" />
          </Field>
          <div className="grid gap-4">
            <Field>
              <FieldLabel htmlFor="preview-date">Data</FieldLabel>
              <DateField
                id="preview-date"
                label="Data"
                mode="input"
                value={date}
                onChange={setDate}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="preview-plan">Plano</FieldLabel>
              <NativeSelect id="preview-plan" defaultValue="">
                <NativeSelectOption value="">Selecione</NativeSelectOption>
                <NativeSelectOption value="a">Plano A</NativeSelectOption>
                <NativeSelectOption value="b">Plano B</NativeSelectOption>
              </NativeSelect>
            </Field>
          </div>
          <FieldSeparator />
          <Field orientation="horizontal">
            <Checkbox id="preview-terms" defaultChecked />
            <FieldLabel htmlFor="preview-terms" className="font-normal">
              Aceito os termos de uso
            </FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <FieldLabel htmlFor="preview-news" className="flex-1 font-normal">
              Receber novidades por e-mail
            </FieldLabel>
            <Switch id="preview-news" />
          </Field>
          <FieldDescription>Você pode mudar essas opções depois.</FieldDescription>
        </FieldGroup>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" className="flex-1">
          Cancelar
        </Button>
        <Button className="flex-1">Salvar</Button>
      </CardFooter>
    </Card>
  );
}

function PlanCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Plano anual</CardTitle>
        <CardDescription>Renovação automática.</CardDescription>
        <CardAction>
          <Badge variant="secondary">Ativo</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <p className="font-heading text-3xl font-semibold tracking-tight">R$ 1.200</p>
        <p className="text-sm text-muted-foreground">por ano, em até 12 vezes</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Ver detalhes</Button>
      </CardFooter>
    </Card>
  );
}

function ActivityCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade recente</CardTitle>
        <CardDescription>Últimos 7 dias.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-3 text-sm">
          {["Item A atualizado", "Item B criado", "Item C removido"].map((entry, index) => (
            <li key={entry} className="flex items-center justify-between gap-3">
              <span>{entry}</span>
              <span className="text-muted-foreground tabular-nums">há {index + 1} dia(s)</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          Ver tudo
        </Button>
      </CardFooter>
    </Card>
  );
}
