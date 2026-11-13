import { Ticket, TicketBody, TicketStub } from "@multiclubes/ui/components/ticket";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr";

export default function TicketTones() {
  return (
    <div className="grid w-full max-w-3xl gap-8 sm:grid-cols-3">
      <Ticket>
        <TicketBody className="grid gap-1">
          <p className="text-sm opacity-85">A pagar</p>
          <p className="text-2xl font-semibold tracking-tight tabular-nums">R$ 120,00</p>
        </TicketBody>
        <TicketStub className="text-sm">Reserva da quadra 3</TicketStub>
      </Ticket>

      <Ticket tone="success">
        <TicketBody className="grid gap-1">
          <p className="flex items-center gap-1.5 text-sm opacity-85">
            <CheckCircleIcon weight="fill" aria-hidden="true" />
            Pago
          </p>
          <p className="text-2xl font-semibold tracking-tight tabular-nums">R$ 120,00</p>
        </TicketBody>
        <TicketStub className="text-sm">Reserva da quadra 3</TicketStub>
      </Ticket>

      <Ticket tone="card">
        <TicketBody className="grid gap-1">
          <p className="text-sm text-muted-foreground">Estornado</p>
          <p className="text-2xl font-semibold tracking-tight tabular-nums">R$ 120,00</p>
        </TicketBody>
        <TicketStub className="text-sm">Reserva da quadra 3</TicketStub>
      </Ticket>
    </div>
  );
}
