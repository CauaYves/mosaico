"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarVerified,
} from "@multiclubes/ui/components/avatar";
import { Badge } from "@multiclubes/ui/components/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@multiclubes/ui/components/breadcrumb";
import { Button } from "@multiclubes/ui/components/button";
import { Calendar } from "@multiclubes/ui/components/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@multiclubes/ui/components/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@multiclubes/ui/components/chart";
import { Checkbox } from "@multiclubes/ui/components/checkbox";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@multiclubes/ui/components/empty";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@multiclubes/ui/components/field";
import { Input } from "@multiclubes/ui/components/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupTextarea,
} from "@multiclubes/ui/components/input-group";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@multiclubes/ui/components/item";
import { NativeSelect, NativeSelectOption } from "@multiclubes/ui/components/native-select";
import { Progress } from "@multiclubes/ui/components/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@multiclubes/ui/components/select";
import { Slider } from "@multiclubes/ui/components/slider";
import { Switch } from "@multiclubes/ui/components/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@multiclubes/ui/components/table";
import { Textarea } from "@multiclubes/ui/components/textarea";
import {
  CaretRightIcon,
  FolderIcon,
  GearIcon,
  InfoIcon,
  PaperPlaneRightIcon,
  TrayIcon,
  UserIcon,
} from "@phosphor-icons/react";
import type { ComponentType } from "react";
import { ptBR } from "react-day-picker/locale";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const HISTORICO = [
  [42, 38],
  [48, 41],
  [51, 44],
  [30, 36],
  [46, 40],
  [58, 47],
  [66, 52],
  [60, 50],
  [54, 49],
  [62, 53],
  [70, 58],
  [76, 61],
].map(([atual, anterior], i) => ({ mes: MESES[i], atual, anterior }));

const historicoConfig = {
  atual: { label: "2026", color: "var(--chart-brand)" },
  anterior: { label: "2025", color: "color-mix(in oklab, var(--chart-brand) 45%, transparent)" },
} satisfies ChartConfig;

function TabelaTile() {
  const linhas = [
    { nome: "Item 1", status: "Ativo", valor: "0.000" },
    { nome: "Item 2", status: "Pendente", valor: "0.000" },
    { nome: "Item 3", status: "Ativo", valor: "0.000" },
    { nome: "Item 4", status: "Inativo", valor: "0.000" },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Título da tabela</CardTitle>
        <CardDescription>Subtítulo da tabela.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {linhas.map((linha) => (
              <TableRow key={linha.nome}>
                <TableCell className="font-medium">{linha.nome}</TableCell>
                <TableCell>
                  <Badge variant={linha.status === "Ativo" ? "default" : "outline"}>
                    {linha.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">{linha.valor}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function PeriodoTile() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Título da página</CardTitle>
        <CardDescription>Descrição curta da página.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-3">
        <NativeSelect aria-label="Período atual" defaultValue="2026" className="flex-1">
          <NativeSelectOption value="2026">2026</NativeSelectOption>
          <NativeSelectOption value="2025">2025</NativeSelectOption>
        </NativeSelect>
        <span className="text-sm text-muted-foreground">vs</span>
        <NativeSelect aria-label="Período de comparação" defaultValue="2025" className="flex-1">
          <NativeSelectOption value="2025">2025</NativeSelectOption>
          <NativeSelectOption value="2024">2024</NativeSelectOption>
        </NativeSelect>
      </CardContent>
    </Card>
  );
}

// 2. Indicador com ícone em halo
function HistoricoTile() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Histórico
          <InfoIcon className="size-4 text-muted-foreground" aria-label="Mais informações" />
        </CardTitle>
        <CardDescription>Subtítulo do gráfico.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={historicoConfig} className="h-44 w-full">
          <LineChart data={HISTORICO} margin={{ left: 12, right: 12, top: 8, bottom: 0 }}>
            <YAxis hide domain={[25, 80]} />
            <CartesianGrid vertical={false} strokeOpacity={0.4} />
            <XAxis dataKey="mes" hide />
            <ChartTooltip cursor content={<ChartTooltipContent hideIndicator />} />
            <Line
              dataKey="anterior"
              type="monotone"
              stroke="var(--color-anterior)"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              dataKey="atual"
              type="monotone"
              stroke="var(--color-atual)"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function CampoTile() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Título</CardTitle>
        <CardDescription>Subtítulo</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="campo-nome">Nome</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <UserIcon aria-hidden />
              </InputGroupAddon>
              <InputGroupInput id="campo-nome" placeholder="Placeholder" />
            </InputGroup>
            <FieldDescription>Texto de ajuda.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="campo-email">E-mail</FieldLabel>
            <Input id="campo-email" type="email" placeholder="Placeholder" />
            <FieldDescription>Texto de ajuda.</FieldDescription>
          </Field>
          <FieldSet>
            <FieldLegend variant="label">Grupo</FieldLegend>
            <Field orientation="horizontal">
              <Checkbox id="campo-opcao" />
              <FieldLabel htmlFor="campo-opcao">Opção</FieldLabel>
            </Field>
          </FieldSet>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}

function ProgressoTile() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Título</CardTitle>
        <CardDescription>Subtítulo</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-3xl font-semibold tabular-nums">0.000</p>
        <Progress value={60} aria-label="Progresso" />
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Filtro 1
          </Button>
          <Button variant="outline" size="sm">
            Filtro 2
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

const BARRAS = [48, 86, 62, 40, 71].map((valor, i) => ({
  item: `Item ${i + 1}`,
  valor,
}));

const barrasConfig = {
  valor: { label: "Valor", color: "var(--chart-brand)" },
} satisfies ChartConfig;

function BarrasTile() {
  const destaque = 1;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Título do gráfico</CardTitle>
        <CardDescription>Subtítulo do gráfico.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={barrasConfig} className="h-48 w-full">
          <BarChart
            data={BARRAS}
            layout="vertical"
            barCategoryGap={10}
            margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="item"
              axisLine={false}
              tickLine={false}
              width={48}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideIndicator />} />
            <Bar dataKey="valor" radius={[0, 6, 6, 0]} barSize={22} isAnimationActive={false}>
              {BARRAS.map((d, i) => (
                <Cell
                  key={d.item}
                  // Cores sólidas: a barra em destaque na cor da marca e as outras num cinza
                  // opaco, misturado com o fundo do card.
                  fill={
                    i === destaque
                      ? "var(--chart-brand)"
                      : "color-mix(in oklab, var(--foreground) 22%, var(--card))"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const ROSCA_OPACIDADES = [1, 0.8, 0.6, 0.45, 0.3, 0.2];
const ROSCA = [34, 24, 18, 14, 8, 2].map((valor, i) => ({
  nome: `Item ${i + 1}`,
  valor,
  fill: "var(--chart-brand)",
  fillOpacity: ROSCA_OPACIDADES[i],
}));
const roscaConfig = {
  valor: { label: "Valor", color: "var(--chart-brand)" },
} satisfies ChartConfig;

function RoscaTile() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Título</CardTitle>
        <CardDescription>Subtítulo do gráfico.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <ChartContainer config={roscaConfig} className="mx-auto aspect-square h-48">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideIndicator nameKey="nome" />} />
              <Pie
                data={ROSCA}
                dataKey="valor"
                nameKey="nome"
                innerRadius="62%"
                outerRadius="80%"
                startAngle={90}
                endAngle={-270}
                // Fatias retas com um vão entre elas: as pontas redondas avançavam sobre as
                // vizinhas e escondiam as fatias pequenas.
                paddingAngle={2}
                isAnimationActive={false}
              />
            </PieChart>
          </ChartContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="text-2xl font-bold tabular-nums">0.000</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LimiteTile() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Título</CardTitle>
        <CardDescription>Subtítulo</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel>Opção</FieldLabel>
            <Select defaultValue="1">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Opção 1</SelectItem>
                <SelectItem value="2">Opção 2</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Limite</FieldLabel>
            <Slider defaultValue={[40]} min={0} max={100} aria-label="Limite" />
            <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
              <span>0</span>
              <span>100</span>
            </div>
          </Field>
          <Field>
            <FieldLabel htmlFor="limite-notas">Notas</FieldLabel>
            <Textarea id="limite-notas" placeholder="Placeholder" />
          </Field>
          <Button>Salvar</Button>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}

function ListaTile() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Título da lista</CardTitle>
        <CardDescription>Subtítulo da lista.</CardDescription>
      </CardHeader>
      <CardContent>
        <ItemGroup>
          {["Item 1", "Item 2", "Item 3"].map((nome) => (
            <Item key={nome} size="sm">
              <ItemMedia variant="icon">
                <FolderIcon />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{nome}</ItemTitle>
                <ItemDescription>Descrição curta.</ItemDescription>
              </ItemContent>
              <ItemActions>
                <CaretRightIcon className="size-4 text-muted-foreground" aria-hidden />
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      </CardContent>
    </Card>
  );
}

function VazioTile() {
  return (
    <Card>
      <CardContent>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TrayIcon />
            </EmptyMedia>
            <EmptyTitle>Título</EmptyTitle>
            <EmptyDescription>Nada por aqui ainda. Texto de apoio.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button>Ação</Button>
          </EmptyContent>
        </Empty>
      </CardContent>
    </Card>
  );
}

function ContaTile() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Título</CardTitle>
        <CardDescription>Subtítulo</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="conta-email">E-mail</FieldLabel>
            <Input id="conta-email" type="email" placeholder="Placeholder" />
          </Field>
          <Field>
            <div className="flex items-center">
              <FieldLabel htmlFor="conta-senha">Senha</FieldLabel>
              <a href="#conta" className="ml-auto text-sm underline-offset-4 hover:underline">
                Esqueceu?
              </a>
            </div>
            <Input id="conta-senha" type="password" />
          </Field>
          <Button disabled>Entrar</Button>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}

function NotasTile() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notas</CardTitle>
        <CardDescription>Subtítulo</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Textarea aria-label="Notas" placeholder="Placeholder" />
        <Button className="self-end">Salvar</Button>
      </CardContent>
    </Card>
  );
}

function ChatTile() {
  return (
    <Card>
      <CardContent>
        <InputGroup>
          <InputGroupTextarea aria-label="Mensagem" placeholder="Placeholder" />
          <InputGroupAddon align="block-end">
            <InputGroupButton
              variant="default"
              size="icon-sm"
              className="ml-auto"
              aria-label="Enviar"
            >
              <PaperPlaneRightIcon />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </CardContent>
    </Card>
  );
}

function NavegacaoTile() {
  return (
    <Card>
      <CardHeader>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#nav">Início</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#nav">Seção</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Página</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </CardHeader>
      <CardContent>
        <ItemGroup>
          {["Item 1", "Item 2", "Item 3"].map((nome) => (
            <Item key={nome} size="xs" render={<a href="#nav" />}>
              <ItemContent>
                <ItemTitle>{nome}</ItemTitle>
              </ItemContent>
              <ItemActions>
                <CaretRightIcon className="size-4 text-muted-foreground" aria-hidden />
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      </CardContent>
    </Card>
  );
}

function ResumoTile() {
  const linhas = [
    { nome: "Item 1", barras: [30, 60, 45, 80, 55] },
    { nome: "Item 2", barras: [50, 35, 70, 40, 65] },
    { nome: "Item 3", barras: [75, 55, 30, 60, 85] },
    { nome: "Item 4", barras: [40, 70, 50, 25, 45] },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Título do resumo</CardTitle>
        <CardDescription>Subtítulo do resumo.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {linhas.map((linha) => (
          <div key={linha.nome} className="flex items-center justify-between gap-3 text-sm">
            <span>{linha.nome}</span>
            <div className="flex h-6 items-end gap-0.5" aria-hidden>
              {linha.barras.map((altura, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: lista estática
                  key={i}
                  className="w-1.5 rounded-sm bg-(--chart-brand)"
                  style={{ height: `${altura}%`, opacity: 0.4 + (altura / 100) * 0.6 }}
                />
              ))}
            </div>
            <span className="w-12 text-right text-muted-foreground tabular-nums">0.000</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ConfiguracoesTile() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GearIcon className="size-4" aria-hidden />
          Configurações
        </CardTitle>
        <CardDescription>Subtítulo</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          {[1, 2, 3].map((n) => (
            <Field key={n} orientation="horizontal">
              <div className="flex flex-1 flex-col gap-0.5">
                <FieldLabel htmlFor={`config-${n}`}>Opção {n}</FieldLabel>
                <FieldDescription>Descrição da opção.</FieldDescription>
              </div>
              <Switch id={`config-${n}`} defaultChecked={n !== 2} />
            </Field>
          ))}
        </FieldGroup>
      </CardContent>
    </Card>
  );
}

function EquipeTile() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Título</CardTitle>
        <CardDescription>Subtítulo</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <AvatarGroup>
          <Avatar>
            {/* Provisório: iniciais até o logo real do cliente. */}
            <AvatarFallback className="bg-[#c4161c] text-[10px] font-bold text-white">
              FLA
            </AvatarFallback>
            <AvatarVerified />
          </Avatar>
          {["B", "C"].map((letra) => (
            <Avatar key={letra}>
              <AvatarFallback>{letra}</AvatarFallback>
            </Avatar>
          ))}
          <AvatarGroupCount>+3</AvatarGroupCount>
        </AvatarGroup>
        <div className="flex flex-wrap gap-2">
          <Badge>Etiqueta</Badge>
          <Badge variant="secondary">Etiqueta</Badge>
          <Badge variant="outline">Etiqueta</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function CalendarioTile() {
  return (
    <Card>
      <CardContent className="flex justify-center">
        <Calendar mode="single" locale={ptBR} />
      </CardContent>
    </Card>
  );
}

/** Cartões da visão geral, na ordem em que entram no quadro do /create. */
export const OVERVIEW_TILES: { name: string; tile: ComponentType }[] = [
  { name: "periodo", tile: PeriodoTile },
  { name: "historico", tile: HistoricoTile },
  { name: "limite", tile: LimiteTile },
  { name: "tabela", tile: TabelaTile },
  { name: "lista", tile: ListaTile },
  { name: "progresso", tile: ProgressoTile },
  { name: "barras", tile: BarrasTile },
  { name: "rosca", tile: RoscaTile },
  { name: "conta", tile: ContaTile },
  { name: "resumo", tile: ResumoTile },
  { name: "vazio", tile: VazioTile },
  { name: "campo", tile: CampoTile },
  { name: "configuracoes", tile: ConfiguracoesTile },
  { name: "navegacao", tile: NavegacaoTile },
  { name: "chat", tile: ChatTile },
  { name: "equipe", tile: EquipeTile },
  { name: "notas", tile: NotasTile },
  { name: "calendario", tile: CalendarioTile },
];
