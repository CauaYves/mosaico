"use client";

import { Alert, AlertDescription, AlertTitle } from "@multiclubes/ui/components/alert";
import { Avatar, AvatarFallback, AvatarGroup } from "@multiclubes/ui/components/avatar";
import { Badge } from "@multiclubes/ui/components/badge";
import { Button } from "@multiclubes/ui/components/button";
import { ButtonGroup } from "@multiclubes/ui/components/button-group";
import { Calendar } from "@multiclubes/ui/components/calendar";
import { Card, CardContent } from "@multiclubes/ui/components/card";
import { Checkbox } from "@multiclubes/ui/components/checkbox";
import { Field, FieldGroup, FieldLabel } from "@multiclubes/ui/components/field";
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
import { Kbd, KbdGroup } from "@multiclubes/ui/components/kbd";
import { Label } from "@multiclubes/ui/components/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@multiclubes/ui/components/pagination";
import { Progress, ProgressLabel, ProgressValue } from "@multiclubes/ui/components/progress";
import { Seal } from "@multiclubes/ui/components/seal";
import { Skeleton } from "@multiclubes/ui/components/skeleton";
import { Slider } from "@multiclubes/ui/components/slider";
import { Spinner } from "@multiclubes/ui/components/spinner";
import { Switch } from "@multiclubes/ui/components/switch";
import { Table, TableBody, TableCell, TableRow } from "@multiclubes/ui/components/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@multiclubes/ui/components/tabs";
import {
  CalendarCheckIcon,
  CursorIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  StarIcon,
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
 * Vidro: fundo do card levemente translúcido e desfocado, para que um componente por cima de
 * outro ainda deixe ver, de leve, o que está atrás.
 */
const GLASS =
  "bg-card/75 backdrop-blur-md shadow-[0_12px_40px_-16px_rgb(0_0_0/0.28)] dark:shadow-[0_12px_40px_-16px_rgb(0_0_0/0.8)]";

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
          <div className="flex items-start justify-between gap-3">
            <Heading title="Ocupação" description="Uso dos espaços" />
            <TabsList>
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

function ThemeCard() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return (
    <Card className={cn("py-4", GLASS)}>
      <CardContent className="flex items-center justify-between gap-3 px-4">
        <Label htmlFor="hero-tema">Modo escuro</Label>
        <Switch
          id="hero-tema"
          checked={mounted && resolvedTheme === "dark"}
          onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        />
      </CardContent>
    </Card>
  );
}

function LoginCard() {
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
            <FieldLabel htmlFor="hero-email">E-mail</FieldLabel>
            <Input id="hero-email" type="email" placeholder="voce@clube.com.br" />
          </Field>
          <Field orientation="horizontal">
            <Checkbox id="hero-lembrar" defaultChecked />
            <FieldLabel htmlFor="hero-lembrar" className="font-normal">
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
      <InputGroupInput placeholder="Buscar componentes" aria-label="Buscar componentes" />
      <InputGroupAddon align="inline-end">
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
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

function ActionsPill() {
  return (
    <div className={cn("rounded-full border p-1.5", GLASS)}>
      <ButtonGroup>
        <Button variant="outline" size="sm">
          Cancelar
        </Button>
        <Button size="sm">
          <PlusIcon data-icon="inline-start" weight="bold" /> Novo sócio
        </Button>
      </ButtonGroup>
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

/** O "dedo": um cursor com o nome do kit, quase encostando no título. */
function Pointer() {
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

/** Posição na tela de 1000 × 800 da composição: x, y, largura e camada. */
type Spot = { x: number; y: number; w?: number; z: number };

function Place({ spot, children }: { spot: Spot; children: React.ReactNode }) {
  return (
    <div className="absolute" style={{ left: spot.x, top: spot.y, width: spot.w, zIndex: spot.z }}>
      {children}
    </div>
  );
}

/**
 * Vitrine do hero, como "A Criação de Adão": no desktop, os componentes se espalham à
 * direita, se sobrepõem em camadas (o vidro deixa ver o de trás) e afunilam para a esquerda
 * até um cursor que quase toca o título. Tudo funciona: abas, busca, calendário, tema.
 * No celular e no tablet, os principais cards aparecem em grade, abaixo do texto.
 */
export function HeroPreview() {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 10, 14));

  return (
    <section aria-label="Prévia dos componentes do Mosaico">
      {/* Desktop: a composição começa um pouco à esquerda do centro, onde o texto termina. */}
      <div className="absolute top-1/2 left-[calc(50%-14.5rem)] z-10 hidden h-[800px] w-[1000px] origin-left -translate-y-1/2 scale-[0.88] lg:block min-[1400px]:scale-100">
        <Place spot={{ x: 14, y: 338, z: 50 }}>
          <Pointer />
        </Place>
        <Place spot={{ x: 112, y: 298, z: 40 }}>
          <BadgesPill />
        </Place>
        <Place spot={{ x: 92, y: 398, z: 40 }}>
          <ActionsPill />
        </Place>
        <Place spot={{ x: 128, y: 222, w: 260, z: 30 }}>
          <SearchPill />
        </Place>
        <Place spot={{ x: 196, y: 486, w: 210, z: 30 }}>
          <ThemeCard />
        </Place>
        <Place spot={{ x: 150, y: 590, w: 210, z: 40 }}>
          <LoadingCard />
        </Place>
        <Place spot={{ x: 176, y: 690, z: 30 }}>
          <PaginationPill />
        </Place>
        <Place spot={{ x: 350, y: 30, w: 340, z: 10 }}>
          <OccupancyCard />
        </Place>
        <Place spot={{ x: 380, y: 548, w: 260, z: 20 }}>
          <LoginCard />
        </Place>
        <Place spot={{ x: 440, y: 250, w: 320, z: 30 }}>
          <MembersCard />
        </Place>
        <Place spot={{ x: 700, y: -10, w: 290, z: 5 }}>
          <CalendarCard date={date} onSelect={setDate} />
        </Place>
        <Place spot={{ x: 736, y: 330, w: 220, z: 35 }}>
          <TokensCard />
        </Place>
        <Place spot={{ x: 600, y: 590, w: 290, z: 35 }}>
          <ReservationAlert date={date} />
        </Place>
        <Place spot={{ x: 690, y: 676, w: 270, z: 25 }}>
          <OtpCard />
        </Place>
      </div>

      {/* Celular e tablet: grade simples abaixo do texto. */}
      <div className="grid gap-4 px-6 pb-12 sm:grid-cols-2 lg:hidden">
        <OccupancyCard />
        <MembersCard />
        <TokensCard />
        <ThemeCard />
      </div>
    </section>
  );
}
