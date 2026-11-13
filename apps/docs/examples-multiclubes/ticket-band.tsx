import { Ticket, TicketBody } from "@multiclubes/ui/components/ticket";

export default function TicketBand() {
  return (
    <div className="w-full max-w-sm overflow-hidden rounded-item bg-muted pb-24">
      <Ticket band>
        <TicketBody className="flex items-baseline justify-between gap-4 px-4 pt-4 pb-3.5">
          <span className="min-w-0 truncate text-[15px] opacity-85">Mensalidade de novembro</span>
          <span className="text-xl font-semibold tracking-tight tabular-nums">R$ 349,00</span>
        </TicketBody>
      </Ticket>
    </div>
  );
}
