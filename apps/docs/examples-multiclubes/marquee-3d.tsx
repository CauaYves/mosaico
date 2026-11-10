import { Card, CardContent } from "@multiclubes/ui/components/card";
import { Marquee } from "@multiclubes/ui/components/marquee";

const ITEMS = [
  { title: "Reserva confirmada", text: "Quadra 1, sábado às 10h." },
  { title: "Novo sócio", text: "Ana Martins entrou no plano Família." },
  { title: "Pagamento", text: "Mensalidade de novembro recebida." },
  { title: "Aviso", text: "Piscina fechada no domingo." },
  { title: "Check-in", text: "Academia, 18h32." },
];

function Item({ title, text }: (typeof ITEMS)[number]) {
  return (
    <Card className="w-48 py-4 shadow-sm">
      <CardContent className="flex flex-col gap-1 px-4">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{text}</p>
      </CardContent>
    </Card>
  );
}

/** Colunas verticais inclinadas em perspectiva, com degradê nas quatro bordas. */
export default function Marquee3d() {
  return (
    <div className="relative flex h-96 w-full max-w-3xl items-center justify-center overflow-hidden [mask-composite:intersect] [mask-image:linear-gradient(to_bottom,transparent,#000_25%,#000_75%,transparent),linear-gradient(to_right,transparent,#000_20%,#000_80%,transparent)] [perspective:300px]">
      <div className="flex gap-4 [transform:translateX(-50px)_translateZ(-100px)_rotateX(20deg)_rotateY(-10deg)_rotateZ(20deg)]">
        {[false, true, false, true].map((reverse, index) => (
          <Marquee
            // biome-ignore lint/suspicious/noArrayIndexKey: as colunas de exemplo são fixas.
            key={index}
            vertical
            pauseOnHover
            reverse={reverse}
            repeat={3}
            className="h-[36rem] [--duration:40s]"
          >
            {ITEMS.map((item) => (
              <Item key={item.title} {...item} />
            ))}
          </Marquee>
        ))}
      </div>
    </div>
  );
}
