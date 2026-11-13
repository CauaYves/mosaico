import { Ticket, TicketBody, TicketStub } from "@multiclubes/ui/components/ticket";

export default function TicketDemo() {
  return (
    <Ticket className="w-full max-w-sm">
      <TicketBody className="grid gap-2 pt-8">
        <p className="text-[15px] opacity-85">Mensalidade de novembro</p>
        <p className="font-heading text-5xl leading-none font-semibold tracking-tight tabular-nums">
          <span className="mr-1.5 text-xl font-medium opacity-80">R$</span>
          349,00
        </p>
      </TicketBody>
      <TicketStub className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 text-sm">
        <span className="font-medium">Título 0123-4</span>
        <span className="opacity-75">Vence em 10/11</span>
      </TicketStub>
    </Ticket>
  );
}
