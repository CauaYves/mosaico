import { render, screen } from "@testing-library/react";
import { Ticket, TicketBody, TicketStub, TicketWatermark } from "./ticket";

const slot = (container: HTMLElement, name: string) =>
  container.querySelector(`[data-slot="${name}"]`) as HTMLElement;

describe("Ticket", () => {
  it("renderiza as partes com data-slot, na ordem, e fecha com a borda serrilhada", () => {
    const { container } = render(
      <Ticket className="max-w-sm">
        <TicketBody>Mensalidade de novembro</TicketBody>
        <TicketStub>Título 0123-4</TicketStub>
      </Ticket>,
    );

    const root = slot(container, "ticket");
    expect(root).toHaveClass("max-w-sm");
    expect([...root.children].map((child) => child.getAttribute("data-slot"))).toEqual([
      "ticket-body",
      "ticket-stub",
      "ticket-teeth",
    ]);
    expect(screen.getByText("Mensalidade de novembro")).toBe(slot(container, "ticket-body"));
    expect(screen.getByText("Título 0123-4")).toBe(slot(container, "ticket-stub"));
  });

  it("a borda serrilhada é decorativa e usa a cor do canhoto", () => {
    const { container } = render(
      <Ticket>
        <TicketBody>Reserva</TicketBody>
      </Ticket>,
    );

    const teeth = slot(container, "ticket-teeth");
    expect(teeth).toHaveAttribute("aria-hidden", "true");
    expect(teeth).toHaveClass("bg-(--ticket-color)");
    expect(teeth.style.mask).toContain("data:image/svg+xml");
  });

  it("o tom define a cor do canhoto, do texto e da sombra", () => {
    const { container, rerender } = render(<Ticket />);
    expect(slot(container, "ticket")).toHaveClass(
      "text-primary-foreground",
      "[--ticket-color:var(--primary)]",
    );

    rerender(<Ticket tone="success" />);
    expect(slot(container, "ticket")).toHaveClass(
      "text-success-foreground",
      "[--ticket-color:var(--success)]",
    );

    rerender(<Ticket tone="card" />);
    expect(slot(container, "ticket")).toHaveClass(
      "text-card-foreground",
      "[--ticket-color:var(--card)]",
    );
  });

  it("os recortes do picote são furos na máscara do destacável, e o style extra é mantido", () => {
    const { container } = render(
      <Ticket>
        <TicketBody />
        <TicketStub style={{ minHeight: 80 }} className="pb-6" />
      </Ticket>,
    );

    const stub = slot(container, "ticket-stub");
    expect(stub.style.mask.match(/circle/g)).toHaveLength(2);
    expect(stub.style.maskComposite).toBe("exclude, exclude, add");
    expect(stub.style.minHeight).toBe("80px");
    expect(stub).toHaveClass("pb-6");
  });

  it("o corpo cede respiro ao destacável que vem logo depois e aceita className", () => {
    const { container } = render(
      <Ticket>
        <TicketBody className="text-center" />
      </Ticket>,
    );

    expect(slot(container, "ticket-body")).toHaveClass(
      "has-[+[data-slot=ticket-stub]]:pb-3",
      "text-center",
    );
  });

  it("em faixa, a raiz marca data-band e o corpo perde os cantos de cima", () => {
    const { container, rerender } = render(
      <Ticket>
        <TicketBody />
      </Ticket>,
    );
    expect(slot(container, "ticket")).not.toHaveAttribute("data-band");

    rerender(
      <Ticket band>
        <TicketBody />
      </Ticket>,
    );
    expect(slot(container, "ticket")).toHaveAttribute("data-band");
    expect(slot(container, "ticket")).toHaveClass("group/ticket");
    expect(slot(container, "ticket-body")).toHaveClass("group-data-band/ticket:rounded-t-none");
  });

  it("a marca-d'água é decorativa: com src vira máscara, sem src mostra o filho", () => {
    const { container, rerender } = render(
      <Ticket>
        <TicketBody>
          <TicketWatermark src="/emblema.svg" />
        </TicketBody>
      </Ticket>,
    );

    const mark = slot(container, "ticket-watermark");
    expect(mark).toHaveAttribute("aria-hidden", "true");
    expect(mark).toHaveClass("bg-current");
    expect(mark.style.maskImage).toContain("/emblema.svg");

    rerender(
      <Ticket>
        <TicketBody>
          <TicketWatermark>
            <svg data-testid="desenho" />
          </TicketWatermark>
        </TicketBody>
      </Ticket>,
    );

    const drawn = slot(container, "ticket-watermark");
    expect(drawn).not.toHaveClass("bg-current");
    expect(drawn).toContainElement(screen.getByTestId("desenho"));
  });
});
