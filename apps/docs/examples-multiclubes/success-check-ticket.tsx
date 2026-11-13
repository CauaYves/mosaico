import { SuccessCheck } from "@multiclubes/ui/components/success-check";
import { Ticket, TicketBody, TicketStub } from "@multiclubes/ui/components/ticket";

export default function SuccessCheckTicket() {
  return (
    <Ticket tone="success" className="w-full max-w-sm">
      <TicketBody className="grid gap-5">
        <SuccessCheck tone="inverse" label="Pago" />
        <div className="grid gap-1.5">
          <p className="text-2xl leading-tight font-semibold tracking-tight">
            Pagamento confirmado
          </p>
          <p className="flex items-baseline justify-between gap-4">
            <span className="text-[15px] opacity-85">Mensalidade de novembro</span>
            <span className="text-xl font-semibold tracking-tight tabular-nums">R$ 349,00</span>
          </p>
        </div>
      </TicketBody>
      <TicketStub className="text-sm opacity-85">
        O comprovante foi enviado para o seu e-mail.
      </TicketStub>
    </Ticket>
  );
}
