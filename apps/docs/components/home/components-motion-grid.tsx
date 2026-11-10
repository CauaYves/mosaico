"use client";

import { Alert, AlertDescription, AlertTitle } from "@multiclubes/ui/components/alert";
import { Avatar, AvatarFallback, AvatarGroup } from "@multiclubes/ui/components/avatar";
import { Badge } from "@multiclubes/ui/components/badge";
import { BottomNav, BottomNavItem } from "@multiclubes/ui/components/bottom-nav";
import { BrandLoader } from "@multiclubes/ui/components/brand-loader";
import { Button } from "@multiclubes/ui/components/button";
import { Calendar } from "@multiclubes/ui/components/calendar";
import { Card, CardContent } from "@multiclubes/ui/components/card";
import { Checkbox } from "@multiclubes/ui/components/checkbox";
import { DateField } from "@multiclubes/ui/components/date-field";
import { Field, FieldGroup, FieldLabel } from "@multiclubes/ui/components/field";
import { GradientPanel } from "@multiclubes/ui/components/gradient-panel";
import { Input } from "@multiclubes/ui/components/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@multiclubes/ui/components/input-group";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@multiclubes/ui/components/input-otp";
import { Kbd } from "@multiclubes/ui/components/kbd";
import { Label } from "@multiclubes/ui/components/label";
import { Marquee } from "@multiclubes/ui/components/marquee";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@multiclubes/ui/components/pagination";
import { Progress, ProgressLabel, ProgressValue } from "@multiclubes/ui/components/progress";
import { RadioGroup, RadioGroupItem } from "@multiclubes/ui/components/radio-group";
import { Seal } from "@multiclubes/ui/components/seal";
import { Skeleton } from "@multiclubes/ui/components/skeleton";
import { Slider } from "@multiclubes/ui/components/slider";
import { Spinner } from "@multiclubes/ui/components/spinner";
import { Table, TableBody, TableCell, TableRow } from "@multiclubes/ui/components/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@multiclubes/ui/components/tabs";
import { Textarea } from "@multiclubes/ui/components/textarea";
import { ThemeToggle } from "@multiclubes/ui/components/theme-toggle";
import { ToggleGroup, ToggleGroupItem } from "@multiclubes/ui/components/toggle-group";
import {
  CalendarBlankIcon,
  CalendarCheckIcon,
  ChatCircleIcon,
  CursorIcon,
  HouseIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  StarIcon,
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  UserIcon,
} from "@phosphor-icons/react/dist/ssr";
import { cn } from "cn";
import { useTheme } from "next-themes";
import * as React from "react";
import { ptBR } from "react-day-picker/locale";
import { BRAND_COLORS, LogoMark } from "@/components/logo";

/* --------------------------------------------------------------------------------------------- */
/* Dados                                                                                         */
/* --------------------------------------------------------------------------------------------- */

const OCCUPANCY = {
  dia: [
    { label: "Quadras", value: 82 },
    { label: "Piscina", value: 46 },
    { label: "Academia", value: 64 },
  ],
  semana: [
    { label: "Quadras", value: 71 },
    { label: "Piscina", value: 58 },
    { label: "Academia", value: 77 },
  ],
  mes: [
    { label: "Quadras", value: 66 },
    { label: "Piscina", value: 62 },
    { label: "Academia", value: 70 },
  ],
} as const;

const MEMBERS = [
  { name: "Ana Martins", plan: "Família", status: "Ativo" },
  { name: "Caio Souza", plan: "Individual", status: "Pendente" },
  { name: "Júlia Prado", plan: "Corporativo", status: "Ativo" },
] as const;

const TOKENS = [
  { name: "primary", className: "bg-primary" },
  { name: "highlight", className: "bg-highlight" },
  { name: "secondary", className: "bg-secondary" },
  { name: "muted", className: "bg-muted" },
  { name: "accent", className: "bg-accent" },
] as const;

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

/* --------------------------------------------------------------------------------------------- */
/* Peças                                                                                         */
/* --------------------------------------------------------------------------------------------- */

/**
 * Superfície dos cards da vitrine: fundo do card opaco com sombra leve, como os cartões do
 * marquee 3D de referência. Sem desfoque de vidro: dentro do 3D ele pesa demais na rolagem.
 */
const GLASS = "bg-card shadow-sm";

function Heading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="leading-tight">
      <p className="text-sm font-semibold">{title}</p>
      {description ? <p className="mt-0.5 text-xs text-muted-foreground">{description}</p> : null}
    </div>
  );
}

function OccupancyCard() {
  return (
    <Card className={cn("py-5", GLASS)}>
      <CardContent className="px-5">
        <Tabs defaultValue="dia" className="gap-4">
          {/* Título em cima e abas embaixo*/}
          <div className="flex flex-col gap-3">
            <Heading title="Ocupação" description="Uso dos espaços" />
            <TabsList className="w-full">
              <TabsTrigger value="dia">Dia</TabsTrigger>
              <TabsTrigger value="semana">Semana</TabsTrigger>
              <TabsTrigger value="mes">Mês</TabsTrigger>
            </TabsList>
          </div>
          {(Object.keys(OCCUPANCY) as (keyof typeof OCCUPANCY)[]).map((period) => (
            <TabsContent key={period} value={period} className="flex flex-col gap-3">
              {OCCUPANCY[period].map((row) => (
                <Progress key={row.label} value={row.value} className="gap-1.5">
                  <ProgressLabel className="text-xs">{row.label}</ProgressLabel>
                  <ProgressValue className="text-xs" />
                </Progress>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

function MembersCard() {
  const [query, setQuery] = React.useState("");
  const visible = MEMBERS.filter((member) =>
    member.name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <Card className={cn("py-5", GLASS)}>
      <CardContent className="flex flex-col gap-3 px-5">
        <div className="flex items-center justify-between gap-3">
          <Heading title="Sócios" description={`${MEMBERS.length} cadastrados`} />
          <AvatarGroup>
            {MEMBERS.map((member) => (
              <Avatar key={member.name}>
                <AvatarFallback className="text-xs">{initials(member.name)}</AvatarFallback>
              </Avatar>
            ))}
          </AvatarGroup>
        </div>
        <InputGroup>
          <InputGroupAddon>
            <MagnifyingGlassIcon />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Buscar sócio"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Buscar sócio"
          />
        </InputGroup>
        <div className="min-h-[9.5rem]">
          {visible.length ? (
            <Table>
              <TableBody>
                {visible.map((member) => (
                  <TableRow key={member.name}>
                    <TableCell className="pl-0">
                      <p className="font-medium leading-tight">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.plan}</p>
                    </TableCell>
                    <TableCell className="pr-0 text-right">
                      <Badge variant={member.status === "Ativo" ? "default" : "secondary"}>
                        {member.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nenhum sócio encontrado.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TokensCard() {
  return (
    <Card className={cn("py-5", GLASS)}>
      <CardContent className="flex flex-col gap-4 px-5">
        <Heading title="Tema" description="Tokens compartilhados" />
        <div className="grid grid-cols-5 gap-1.5">
          {TOKENS.map((token) => (
            <span
              key={token.name}
              title={token.name}
              className={cn("h-8 rounded-field border border-line", token.className)}
            />
          ))}
        </div>
        <Slider defaultValue={[60]} aria-label="Intensidade" />
      </CardContent>
    </Card>
  );
}

/** O Theme Toggle do kit, o botão de tema padrão do Mosaico: troca o tema do site de verdade. */
function ThemeCard() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <Card className={cn("py-4", GLASS)}>
      <CardContent className="flex items-center justify-between gap-3 px-4">
        <Heading title="Tema" description="Claro ou escuro" />
        <ThemeToggle theme={resolvedTheme} onThemeChange={setTheme} variant="outline" />
      </CardContent>
    </Card>
  );
}

/* Componentes próprios da Multiclubes (components-multiclubes). */

/** Brand Loader: o "m" se desenhando enquanto carrega. */
function BrandLoaderCard() {
  return (
    <Card className={cn("py-5", GLASS)}>
      <CardContent className="flex items-center gap-4 px-5">
        <BrandLoader className="size-10" />
        <Heading title="Sincronizando" description="Buscando as reservas do dia" />
      </CardContent>
    </Card>
  );
}

/**
 * Bottom Nav: a barra de navegação do app, com o indicador que desliza. O componente já é a
 * pílula (fundo, sombra e anel próprios), então vai sem moldura: uma moldura por fora criava
 * duas pílulas e deslocava o indicador.
 */
function BottomNavCard() {
  return (
    <div className="flex justify-center">
      <BottomNav defaultValue="inicio" aria-label="Navegação do app">
        <BottomNavItem value="inicio" label="Início" icon={<HouseIcon />} />
        <BottomNavItem value="agenda" label="Agenda" icon={<CalendarBlankIcon />} />
        <BottomNavItem value="mensagens" label="Mensagens" icon={<ChatCircleIcon />} badge={3} />
        <BottomNavItem value="perfil" label="Perfil" icon={<UserIcon />} />
      </BottomNav>
    </div>
  );
}

/** Date Field: o campo de data com máscara (no celular de verdade, abre a roda). */
function DateFieldCard() {
  const id = React.useId();
  const [value, setValue] = React.useState("");
  return (
    <Card className={cn("py-5", GLASS)}>
      <CardContent className="px-5">
        <Field>
          <FieldLabel htmlFor={id}>Data de nascimento</FieldLabel>
          <DateField
            id={id}
            label="Data de nascimento"
            mode="input"
            value={value}
            onChange={setValue}
          />
        </Field>
      </CardContent>
    </Card>
  );
}

/** Gradient Panel: o fundo em degradê da marca, com um destaque por cima. */
function GradientCard() {
  return (
    <GradientPanel
      aria-label="Destaque"
      className="flex h-28 items-end overflow-hidden rounded-surface p-4"
    >
      <p className="text-sm font-semibold">Novo app do sócio</p>
    </GradientPanel>
  );
}

function LoginCard() {
  const id = React.useId();
  return (
    <Card className={cn("py-5", GLASS)}>
      <CardContent className="px-5">
        <div className="mb-4 flex items-center gap-2.5">
          <span
            className="flex size-8 items-center justify-center rounded-field"
            style={{ backgroundColor: BRAND_COLORS.blue, color: BRAND_COLORS.yellow }}
          >
            <LogoMark className="w-5" />
          </span>
          <Heading title="Entrar no clube" description="Acesse sua conta de sócio" />
        </div>
        <FieldGroup className="gap-3">
          <Field>
            <FieldLabel htmlFor={`${id}-email`}>E-mail</FieldLabel>
            <Input id={`${id}-email`} type="email" placeholder="voce@clube.com.br" />
          </Field>
          <Field orientation="horizontal">
            <Checkbox id={`${id}-lembrar`} defaultChecked />
            <FieldLabel htmlFor={`${id}-lembrar`} className="font-normal">
              Manter conectado
            </FieldLabel>
          </Field>
          <Button className="w-full">Entrar</Button>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}

function CalendarCard({
  date,
  onSelect,
}: {
  date: Date | undefined;
  onSelect: (date: Date | undefined) => void;
}) {
  return (
    <Card className={cn("py-3", GLASS)}>
      <CardContent className="flex justify-center px-2">
        <Calendar
          mode="single"
          locale={ptBR}
          selected={date}
          onSelect={onSelect}
          defaultMonth={new Date(2026, 10, 1)}
          className="bg-transparent"
        />
      </CardContent>
    </Card>
  );
}

function ReservationAlert({ date }: { date: Date | undefined }) {
  return (
    <Alert className={GLASS}>
      <CalendarCheckIcon weight="duotone" className="text-primary" />
      <AlertTitle>Reserva confirmada</AlertTitle>
      <AlertDescription>
        {date
          ? `Quadra 1, ${date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}.`
          : "Escolha um dia no calendário."}
      </AlertDescription>
    </Alert>
  );
}

function OtpCard() {
  return (
    <Card className={cn("py-5", GLASS)}>
      <CardContent className="flex flex-col gap-3 px-5">
        <div className="flex items-center gap-3">
          <Seal className="size-9" />
          <Heading title="Verifique seu e-mail" description="Digite o código enviado" />
        </div>
        <InputOTP maxLength={6} defaultValue="482" aria-label="Código">
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
    </Card>
  );
}

function SearchPill() {
  return (
    <InputGroup className={cn("h-10 rounded-full", GLASS)}>
      <InputGroupAddon>
        <MagnifyingGlassIcon />
      </InputGroupAddon>
      <InputGroupInput placeholder="Buscar" aria-label="Buscar componentes" />
      <InputGroupAddon align="inline-end">
        <Kbd>/</Kbd>
      </InputGroupAddon>
    </InputGroup>
  );
}

function BadgesPill() {
  return (
    <div className={cn("flex items-center gap-1.5 rounded-full border p-2", GLASS)}>
      <Badge>Ativo</Badge>
      <Badge variant="secondary">Pendente</Badge>
      <Badge className="bg-highlight text-highlight-foreground">
        <StarIcon weight="fill" /> Destaque
      </Badge>
    </div>
  );
}

/**
 * Par de ações, como o rodapé de um formulário: dois botões separados, cada um com os cantos
 * inteiros. Emendados num Button Group, a divisão reta entre eles não combinava com a vitrine.
 */
function ActionsPill() {
  return (
    <div className="flex items-center justify-center gap-2">
      <Button variant="outline" size="sm" className={GLASS}>
        Cancelar
      </Button>
      <Button size="sm">
        <PlusIcon data-icon="inline-start" weight="bold" /> Novo sócio
      </Button>
    </div>
  );
}

function LoadingCard() {
  return (
    <Card className={cn("py-4", GLASS)}>
      <CardContent className="flex items-center gap-3 px-4">
        <Skeleton className="size-9 shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-2.5 w-3/4" />
          <Skeleton className="h-2.5 w-1/2" />
        </div>
        <Spinner className="text-primary" />
      </CardContent>
    </Card>
  );
}

function PaginationPill() {
  return (
    <div className={cn("rounded-full border p-1", GLASS)}>
      <Pagination>
        <PaginationContent>
          {[1, 2, 3, 4].map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                isActive={page === 2}
                onClick={(event) => event.preventDefault()}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
        </PaginationContent>
      </Pagination>
    </div>
  );
}

const TASKS = [
  { label: "Renovar plano anual", done: true },
  { label: "Reservar quadra 2", done: true },
  { label: "Enviar comprovante", done: false },
  { label: "Atualizar dados", done: false },
] as const;

/** Checklist com progresso: marcar um item atualiza a barra. */
function ChecklistCard() {
  const id = React.useId();
  const [done, setDone] = React.useState<boolean[]>(TASKS.map((task) => task.done));
  const total = done.filter(Boolean).length;
  return (
    <Card className={cn("py-5", GLASS)}>
      <CardContent className="flex flex-col gap-3 px-5">
        <div className="flex items-center justify-between gap-3">
          <Heading title="Pendências" description="Antes da próxima visita" />
          <span className="font-mono text-xs text-muted-foreground tabular-nums">
            {total}/{TASKS.length}
          </span>
        </div>
        <Progress value={(total / TASKS.length) * 100} aria-label="Pendências concluídas" />
        <div className="flex flex-col gap-2.5">
          {TASKS.map((task, index) => (
            <Field key={task.label} orientation="horizontal">
              <Checkbox
                id={`${id}-${index}`}
                checked={done[index]}
                onCheckedChange={(checked) =>
                  setDone((current) => current.map((value, i) => (i === index ? checked : value)))
                }
              />
              <FieldLabel
                htmlFor={`${id}-${index}`}
                className={cn("font-normal", done[index] && "text-muted-foreground line-through")}
              >
                {task.label}
              </FieldLabel>
            </Field>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/** Notas: o contador acompanha o que se digita. */
function NotesCard() {
  const id = React.useId();
  const [text, setText] = React.useState("Levar a carteirinha nova na recepção.");
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return (
    <Card className={cn("py-5", GLASS)}>
      <CardContent className="flex flex-col gap-3 px-5">
        <Label htmlFor={id}>Observações</Label>
        <Textarea
          id={id}
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="min-h-20 resize-none"
        />
        <p className="text-xs text-muted-foreground tabular-nums">
          {words} {words === 1 ? "palavra" : "palavras"}
        </p>
      </CardContent>
    </Card>
  );
}

const PLANS = [
  { value: "individual", label: "Individual", price: "R$ 189" },
  { value: "familia", label: "Família", price: "R$ 329" },
  { value: "corporativo", label: "Corporativo", price: "R$ 459" },
] as const;

/** Escolha de plano: o resumo acompanha a opção marcada. */
function PlanCard() {
  const id = React.useId();
  const [plan, setPlan] = React.useState<string>("familia");
  const current = PLANS.find((item) => item.value === plan) ?? PLANS[1];
  return (
    <Card className={cn("py-5", GLASS)}>
      <CardContent className="flex flex-col gap-3 px-5">
        <Heading title="Plano" description={`${current.price} por mês`} />
        <RadioGroup value={plan} onValueChange={(value) => setPlan(String(value))}>
          {PLANS.map((item) => (
            <Field key={item.value} orientation="horizontal">
              <RadioGroupItem id={`${id}-${item.value}`} value={item.value} />
              <FieldLabel htmlFor={`${id}-${item.value}`} className="flex-1 font-normal">
                {item.label}
              </FieldLabel>
              <span className="text-xs text-muted-foreground tabular-nums">{item.price}</span>
            </Field>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}

/** Texto do aviso: alinhamento e tamanho mudam a prévia na hora. */
function TextStyleCard() {
  const [align, setAlign] = React.useState("left");
  const [size, setSize] = React.useState([14]);
  return (
    <Card className={cn("py-5", GLASS)}>
      <CardContent className="flex flex-col gap-3 px-5">
        <div className="flex items-center justify-between gap-3">
          <Heading title="Aviso" />
          <ToggleGroup
            variant="outline"
            size="sm"
            aria-label="Alinhamento"
            value={[align]}
            onValueChange={(value) => value[0] && setAlign(value[0])}
          >
            <ToggleGroupItem value="left" aria-label="Alinhar à esquerda">
              <TextAlignLeftIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="center" aria-label="Centralizar">
              <TextAlignCenterIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="right" aria-label="Alinhar à direita">
              <TextAlignRightIcon />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <p
          className="rounded-field bg-muted/60 px-3 py-2 leading-snug transition-all"
          style={{ textAlign: align as React.CSSProperties["textAlign"], fontSize: size[0] }}
        >
          Piscina fechada para manutenção no domingo.
        </p>
        <Slider
          value={size}
          onValueChange={(value) => setSize(Array.isArray(value) ? [...value] : [value])}
          min={12}
          max={18}
          aria-label="Tamanho do texto"
        />
      </CardContent>
    </Card>
  );
}

/** O "dedo": um cursor com o nome do kit, logo abaixo do "Ver componentes", apontando para ele. */
export function HeroPointer() {
  return (
    <div className="pointer-events-none flex items-start" aria-hidden>
      <CursorIcon weight="fill" className="size-6 text-primary drop-shadow-md" />
      <span className="mt-5 -ml-0.5 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-md">
        Mosaico
      </span>
    </div>
  );
}

/* --------------------------------------------------------------------------------------------- */
/* Composição                                                                                    */
/* --------------------------------------------------------------------------------------------- */

/*
 * Borda esquerda do painel: uma onda vertical que divide o texto dos componentes. Sai do
 * topo da página logo depois do item "Components" do header (que é transparente ali; no
 * desktop a distância entre os dois é fixa), desce em curva aberta até perto do título, depois inclina para a direita e volta para a esquerda no fim. É um S simétrico por rotação de 180° em torno do
 * centro, como a onda do login: a curva que entra e a que sai têm o mesmo tamanho. Por cima,
 * um cisalhamento de 2° inclina o S inteiro sem quebrar essa proporção. O SVG é só a faixa da onda, de 20rem; à direita da curva fica visível e o
 * resto do painel é cheio. A borda é nítida: o esfumado fica por dentro do painel.
 */
const WAVE_EDGE = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 1440' preserveAspectRatio='none'><path d='M200,0 C118,50 91.8,432 117,720 C129.6,864 163.6,1296 120.2,1440 L200,1440 L200,0 Z'/></svg>",
)}")`;
/*
 * No celular e no tablet o painel fica em cima do texto e termina numa onda horizontal só
 * (a de cima do login-01, sem a camada dupla): à vista fica o que está acima da curva.
 */
const WAVE_BOTTOM = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 375 95' preserveAspectRatio='none'><path d='M0,0 L375,0 L375,16 C275,109 195,-28 0,60 Z'/></svg>",
)}")`;

/*
 * As duas máscaras do painel em variáveis: a de baixo vale até lg e a lateral a partir dele
 * (as classes escolhem qual; um style inline não muda com o tamanho da tela).
 */
const MASKS = {
  "--mask-y-image": `linear-gradient(#000, #000), ${WAVE_BOTTOM}`,
  "--mask-y-size": "100% calc(100% - 5rem + 1px), 100% 5rem",
  "--mask-y-position": "0 0, 0 100%",
  "--mask-x-image": `${WAVE_EDGE}, linear-gradient(#000, #000)`,
  "--mask-x-size": "20rem 100%, calc(100% - 20rem + 1px) 100%",
  "--mask-x-position": "0 0, 20rem 0",
} as React.CSSProperties;

const MASK_CLASS =
  "[mask-repeat:no-repeat] [mask-image:var(--mask-y-image)] [mask-size:var(--mask-y-size)] [mask-position:var(--mask-y-position)] lg:[mask-image:var(--mask-x-image)] lg:[mask-size:var(--mask-x-size)] lg:[mask-position:var(--mask-x-position)]";

/**
 * Degradê nas quatro bordas, como no marquee 3D de referência: os cards somem no fundo do
 * painel em cima, embaixo e dos lados, e a primeira e a última coluna ficam quase apagadas. Feito com máscara (as duas faixas se cruzam), então
 * funciona sobre o fundo esfumado nos dois temas.
 */
const FADE =
  "[mask-image:linear-gradient(to_bottom,transparent,#000_22%,#000_78%,transparent),linear-gradient(to_right,transparent,#000_32%,#000_70%,transparent)] [mask-composite:intersect]";

/*
 * Cena 3D do desktop, inspirada no marquee 3D de referência, mas mais contida: as colunas
 * levemente deitadas e giradas (rotateX 14°, rotateY -7°, rotateZ 14°), com a câmera longe
 * (perspective 900px). Os cards ficam no tamanho real, sem redução nem profundidade
 * (translateZ): o navegador desenha o texto e as bordas no tamanho final e só depois inclina.
 * Encolher a cena já desenhada é o que serrilha, principalmente em tela com zoom de 100%. backface-visibility nas colunas suaviza as bordas giradas.
 * Os cards ficam 12% menores que o resto do hero com `zoom` (que refaz o layout no tamanho
 * menor, sem encolher a imagem pronta, então não serrilha).
 */
const SCENE =
  "lg:[zoom:0.88] lg:[transform:translateX(-4rem)_rotateX(14deg)_rotateY(-7deg)_rotateZ(14deg)]";

/**
 * Vitrine do hero: um painel recortado por uma onda vertical, ao lado do texto, onde os
 * componentes do kit passam em colunas, em ritmos diferentes, como numa galeria. São
 * componentes reais, mas só de vitrine (Marquee decorative): não reagem a clique nem foco, e
 * a rolagem segue sempre. A ideia é mostrar que tudo sai das mesmas peças base. No celular e no tablet o painel ocupa o topo da
 * tela, por baixo do header, e termina numa onda horizontal logo acima do texto: uma coluna no
 * celular e duas no tablet. No desktop são três colunas a partir de 1024px e quatro a partir
 * de 1280px. Entram também os componentes próprios da Multiclubes
 * (Brand Loader, Bottom Nav, Date Field, Gradient Panel, Seal e Theme Toggle).
 */
export function ComponentsMotionGrid() {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 10, 14));
  // Os cards chegam completos no HTML, com todas as cópias do laço, e ficam parados. Só depois
  // que a página terminou de carregar (fontes e imagens) e o navegador ficou ocioso a rolagem
  // começa, sem nada sendo montado ou trocando de lugar no meio do movimento.
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    const idle = window.requestIdleCallback ?? ((run: () => void) => window.setTimeout(run, 200));
    let id: number | undefined;
    // Um recurso lento não segura a animação: no máximo 2,5s depois de montar, ela começa.
    const fallback = window.setTimeout(() => setReady(true), 2500);
    const start = () => {
      id = idle(() => setReady(true), { timeout: 800 });
    };
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      window.clearTimeout(fallback);
      if (id !== undefined) cancel(id);
    };
  }, []);

  return (
    <section
      aria-label="Prévia dos componentes do Mosaico"
      // No desktop o meio da onda fica a 40% da largura do hero (11.75rem depois do início do
      // painel), ou 14rem depois do início do texto se a tela for estreita (largura do hero, não da tela,
      // porque o hero pode ter zoom; a coluna do texto tem 23rem e a
      // onda nunca encosta nela) e vai do topo da página, por baixo do header, até o fim do hero.
      className="group/hero relative min-h-[26rem] flex-1 lg:absolute lg:inset-y-0 lg:right-0 lg:left-[calc(max(40%-11.75rem,max(3rem,(40%-23rem)/2)+14rem))] lg:h-auto"
    >
      <div
        // No claro um tom mais escuro que o da página, para o painel se destacar; no escuro, o
        // mesmo de antes. --smoke é a cor das manchas do fundo esfumado.
        className={cn(
          "absolute inset-0 bg-foreground/[0.06] [--smoke:color-mix(in_oklab,var(--foreground)_6%,transparent)] dark:bg-muted/25 dark:[--smoke:var(--muted)]",
          MASK_CLASS,
        )}
        style={MASKS}
      >
        {/* Fundo esfumado, na mesma cor do fundo dos componentes: manchas mais densas e
            desfocadas sobre o tom base, para o painel não ser um bloco chapado. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-8 bg-[radial-gradient(ellipse_45%_38%_at_18%_22%,var(--smoke),transparent_72%),radial-gradient(ellipse_40%_42%_at_62%_58%,var(--smoke),transparent_72%),radial-gradient(ellipse_38%_32%_at_30%_88%,var(--smoke),transparent_70%),radial-gradient(ellipse_34%_36%_at_92%_16%,var(--smoke),transparent_70%)] blur-3xl"
        />
        <div className={cn("absolute inset-0 overflow-hidden lg:[perspective:900px]", FADE)}>
          <div
            className={cn(
              // A área das colunas é bem maior que o painel e cada coluna repete o conteúdo 4
              // vezes, para a inclinação nunca mostrar canto ou fim de coluna vazio; o painel
              // corta o que sobra.
              "absolute flex items-stretch justify-center gap-4 max-lg:inset-x-4 max-lg:inset-y-0 lg:-inset-y-1/2 lg:-right-1/3 lg:-left-1/4",
              SCENE,
            )}
          >
            {/* Como numa grade de fotos: colunas da mesma largura, e a variedade vem da altura dos
                cards. Cada coluna alterna alto, curto e pílula, e as colunas começam desencontradas
                (o sentido e o ritmo de cada uma também mudam). */}
            <Marquee
              vertical
              decorative
              data-ready={ready}
              repeat={3}
              className="h-full w-64 shrink-0 p-0 *:[backface-visibility:hidden] data-[ready=false]:*:[animation-play-state:paused] [--gap:1rem] [--duration:74s]"
            >
              <CalendarCard date={date} onSelect={setDate} />
              <ThemeCard />
              <ChecklistCard />
              <BadgesPill />
              <NotesCard />
            </Marquee>
            <Marquee
              vertical
              decorative
              data-ready={ready}
              repeat={3}
              reverse
              className="h-full w-64 shrink-0 p-0 *:[backface-visibility:hidden] data-[ready=false]:*:[animation-play-state:paused] [--gap:1rem] [--duration:88s] max-sm:hidden"
            >
              <ReservationAlert date={date} />
              <MembersCard />
              <LoadingCard />
              <PlanCard />
              <ActionsPill />
            </Marquee>
            <Marquee
              vertical
              decorative
              data-ready={ready}
              repeat={3}
              className="h-full w-64 shrink-0 p-0 *:[backface-visibility:hidden] data-[ready=false]:*:[animation-play-state:paused] [--gap:1rem] [--duration:66s] max-lg:hidden"
            >
              <OccupancyCard />
              <BottomNavCard />
              <LoginCard />
              <GradientCard />
              <SearchPill />
            </Marquee>
            {/* A quarta coluna a partir de 1280px; pode sair um pouco pela borda direita. */}
            <Marquee
              vertical
              decorative
              data-ready={ready}
              repeat={3}
              reverse
              className="h-full w-64 shrink-0 p-0 *:[backface-visibility:hidden] data-[ready=false]:*:[animation-play-state:paused] [--gap:1rem] [--duration:96s] max-xl:hidden"
            >
              <TokensCard />
              <TextStyleCard />
              <DateFieldCard />
              <OtpCard />
              <BrandLoaderCard />
              <PaginationPill />
            </Marquee>
          </div>
        </div>
      </div>
    </section>
  );
}
