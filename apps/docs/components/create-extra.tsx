"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@multiclubes/ui/components/accordion";
import { Alert, AlertDescription, AlertTitle } from "@multiclubes/ui/components/alert";
import { Badge } from "@multiclubes/ui/components/badge";
import { Button } from "@multiclubes/ui/components/button";
import { ButtonGroup } from "@multiclubes/ui/components/button-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@multiclubes/ui/components/card";
import { Field, FieldDescription, FieldLabel } from "@multiclubes/ui/components/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@multiclubes/ui/components/input-otp";
import { Kbd, KbdGroup } from "@multiclubes/ui/components/kbd";
import { Label } from "@multiclubes/ui/components/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@multiclubes/ui/components/pagination";
import { RadioGroup, RadioGroupItem } from "@multiclubes/ui/components/radio-group";
import { Skeleton } from "@multiclubes/ui/components/skeleton";
import { Spinner } from "@multiclubes/ui/components/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@multiclubes/ui/components/tabs";
import { Textarea } from "@multiclubes/ui/components/textarea";
import { ToggleGroup, ToggleGroupItem } from "@multiclubes/ui/components/toggle-group";
import {
  CaretDownIcon,
  CheckCircleIcon,
  CopyIcon,
  CreditCardIcon,
  GridFourIcon,
  ListIcon,
  PixLogoIcon,
  ReceiptIcon,
  RowsIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { QRCodeSVG } from "qrcode.react";
import type { ComponentType } from "react";

// Cartões do quadro do /create com componentes que a visão geral não usa. Todos os textos e
// valores são ilustrativos.

function AvisosTile() {
  return (
    <div className="flex flex-col gap-3">
      <Alert>
        <CheckCircleIcon />
        <AlertTitle>Alterações salvas</AlertTitle>
        <AlertDescription>As configurações já valem para todos.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <WarningIcon />
        <AlertTitle>Pagamento recusado</AlertTitle>
        <AlertDescription>Confira os dados do cartão e tente de novo.</AlertDescription>
      </Alert>
    </div>
  );
}

function PerguntasTile() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Perguntas frequentes</CardTitle>
        <CardDescription>Respostas rápidas.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion defaultValue={["prazo"]}>
          <AccordionItem value="prazo" className="data-open:bg-transparent">
            <AccordionTrigger>Qual é o prazo?</AccordionTrigger>
            <AccordionContent>Até 5 dias úteis depois da confirmação.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="cancelar" className="data-open:bg-transparent">
            <AccordionTrigger>Posso cancelar?</AccordionTrigger>
            <AccordionContent>Sim, a qualquer momento, sem multa.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="suporte" className="data-open:bg-transparent">
            <AccordionTrigger>Como falo com o suporte?</AccordionTrigger>
            <AccordionContent>Pelo chat ou pelo e-mail de atendimento.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}

function AbasTile() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatório</CardTitle>
        <CardDescription>Resumo por período.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="semana">
          <TabsList className="w-full">
            <TabsTrigger value="dia">Dia</TabsTrigger>
            <TabsTrigger value="semana">Semana</TabsTrigger>
            <TabsTrigger value="mes">Mês</TabsTrigger>
          </TabsList>
          {[
            ["dia", "000", "+0%"],
            ["semana", "0.000", "+12%"],
            ["mes", "00.000", "+4%"],
          ].map(([value, total, delta]) => (
            <TabsContent key={value} value={value} className="flex items-end justify-between pt-4">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="font-heading text-3xl font-semibold tracking-tight tabular-nums">
                  {total}
                </p>
              </div>
              <Badge variant="secondary">{delta}</Badge>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

function PagamentoTile() {
  const opcoes = [
    { value: "pix", label: "Pix", note: "Aprovação na hora", icon: PixLogoIcon },
    { value: "cartao", label: "Cartão de crédito", note: "Até 12 vezes", icon: CreditCardIcon },
    { value: "boleto", label: "Boleto", note: "Até 3 dias úteis", icon: ReceiptIcon },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Forma de pagamento</CardTitle>
        <CardDescription>Escolha como pagar.</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup defaultValue="pix" className="gap-2">
          {opcoes.map(({ value, label, note, icon: Icon }) => (
            <Label
              key={value}
              htmlFor={`pagamento-${value}`}
              className="flex items-center gap-3 rounded-field border p-3 font-normal has-data-checked:border-primary has-data-checked:bg-primary/5"
            >
              <Icon className="size-5 text-muted-foreground" />
              <span className="flex flex-1 flex-col">
                <span className="text-sm font-medium">{label}</span>
                <span className="text-xs text-muted-foreground">{note}</span>
              </span>
              <RadioGroupItem value={value} id={`pagamento-${value}`} />
            </Label>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}

function VisualizacaoTile() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visualização</CardTitle>
        <CardDescription>Como mostrar a lista.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ToggleGroup defaultValue={["grade"]} variant="outline" aria-label="Modo de exibição">
          <ToggleGroupItem value="grade" aria-label="Grade">
            <GridFourIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="lista" aria-label="Lista">
            <ListIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="linhas" aria-label="Linhas">
            <RowsIcon />
          </ToggleGroupItem>
        </ToggleGroup>
        <ButtonGroup>
          <Button variant="outline">Exportar</Button>
          <Button variant="outline" size="icon" aria-label="Mais formatos">
            <CaretDownIcon />
          </Button>
        </ButtonGroup>
      </CardContent>
    </Card>
  );
}

function VerificacaoTile() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Verificação</CardTitle>
        <CardDescription>Digite o código enviado por SMS.</CardDescription>
      </CardHeader>
      <CardContent>
        <InputOTP maxLength={6} defaultValue="482">
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </CardContent>
      <CardFooter className="justify-between gap-2">
        <Button variant="link" className="px-0">
          Reenviar código
        </Button>
        <Button>Confirmar</Button>
      </CardFooter>
    </Card>
  );
}

function AtalhosTile() {
  const atalhos = [
    ["Buscar", ["Ctrl", "K"]],
    ["Novo item", ["Ctrl", "N"]],
    ["Salvar", ["Ctrl", "S"]],
    ["Fechar", ["Esc"]],
  ] as const;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Atalhos</CardTitle>
        <CardDescription>Do teclado.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-3 text-sm">
          {atalhos.map(([acao, teclas]) => (
            <li key={acao} className="flex items-center justify-between">
              <span>{acao}</span>
              <KbdGroup>
                {teclas.map((tecla) => (
                  <Kbd key={tecla}>{tecla}</Kbd>
                ))}
              </KbdGroup>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function CarregandoTile() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Spinner />
          Carregando
        </CardTitle>
        <CardDescription>Buscando os dados.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {[0, 1, 2].map((linha) => (
          <div key={linha} className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function PaginacaoTile() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resultados</CardTitle>
        <CardDescription>Página 2 de 10.</CardDescription>
      </CardHeader>
      <CardContent>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" text="" aria-label="Página anterior" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" text="" aria-label="Próxima página" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardContent>
    </Card>
  );
}

function ComentarioTile() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Deixe um comentário</CardTitle>
        <CardDescription>Ele aparece para a equipe.</CardDescription>
      </CardHeader>
      <CardContent>
        <Field>
          <FieldLabel htmlFor="create-comentario">Comentário</FieldLabel>
          <Textarea id="create-comentario" placeholder="Escreva aqui..." rows={4} />
          <FieldDescription>Até 500 caracteres.</FieldDescription>
        </Field>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="ghost">Descartar</Button>
        <Button>Publicar</Button>
      </CardFooter>
    </Card>
  );
}

function QrCodeTile() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingresso</CardTitle>
        <CardDescription>Apresente o código na entrada.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {/* Fundo branco e módulos escuros nos dois modos: QR invertido falha em muitos leitores. */}
        <div className="rounded-field bg-white p-6 ring-1 ring-foreground/10">
          <QRCodeSVG
            value="https://example.com/ingresso/000000"
            size={160}
            level="M"
            fgColor="#0a0a0a"
            bgColor="#ffffff"
            title="QR Code do ingresso"
          />
        </div>
        <div className="flex w-full items-center justify-between gap-3 rounded-field bg-muted px-3 py-2">
          <span className="font-mono text-sm tracking-widest">0000-0000</span>
          <Button variant="ghost" size="icon-sm" aria-label="Copiar código">
            <CopyIcon />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/** Cartões extras do quadro do /create. */
export const EXTRA_TILES: { name: string; tile: ComponentType }[] = [
  { name: "avisos", tile: AvisosTile },
  { name: "perguntas", tile: PerguntasTile },
  { name: "abas", tile: AbasTile },
  { name: "qr-code", tile: QrCodeTile },
  { name: "pagamento", tile: PagamentoTile },
  { name: "visualizacao", tile: VisualizacaoTile },
  { name: "verificacao", tile: VerificacaoTile },
  { name: "atalhos", tile: AtalhosTile },
  { name: "carregando", tile: CarregandoTile },
  { name: "paginacao", tile: PaginacaoTile },
  { name: "comentario", tile: ComentarioTile },
];
