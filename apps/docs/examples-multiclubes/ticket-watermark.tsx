import { Ticket, TicketBody, TicketStub, TicketWatermark } from "@multiclubes/ui/components/ticket";
import { TicketIcon } from "@phosphor-icons/react/dist/ssr";

export default function TicketWatermarkExample() {
  return (
    <Ticket className="w-full max-w-sm">
      <TicketBody className="grid gap-2 pt-8">
        <TicketWatermark>
          <TicketIcon weight="fill" />
        </TicketWatermark>
        <p className="text-[15px] opacity-85">Convites para 20/12</p>
        <p className="font-heading text-5xl leading-none font-semibold tracking-tight tabular-nums">
          <span className="mr-1.5 text-xl font-medium opacity-80">R$</span>
          300,00
        </p>
      </TicketBody>
      <TicketStub className="flex items-baseline justify-between gap-4 text-sm">
        <span className="font-medium">3 convites</span>
        <span className="opacity-75">Parque aquático</span>
      </TicketStub>
    </Ticket>
  );
}
