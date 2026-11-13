import { render, screen } from "@testing-library/react";
import { SuccessCheck } from "./success-check";

describe("SuccessCheck", () => {
  it("é uma imagem com nome para o leitor de tela, e as peças são decorativas", () => {
    const { container } = render(<SuccessCheck className="size-16" />);

    const mark = screen.getByRole("img", { name: "Concluído" });
    expect(mark).toHaveAttribute("data-slot", "success-check");
    expect(mark).toHaveClass("size-16");
    for (const piece of container.querySelectorAll("svg")) {
      expect(piece).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("aceita outro nome", () => {
    render(<SuccessCheck label="Pagamento confirmado" />);

    expect(screen.getByRole("img", { name: "Pagamento confirmado" })).toBeInTheDocument();
  });

  it("o tom define a cor do disco e a do check", () => {
    const { rerender } = render(<SuccessCheck />);
    expect(screen.getByRole("img")).toHaveClass(
      "text-success",
      "[--success-check-mark:var(--success-foreground)]",
    );

    rerender(<SuccessCheck tone="inverse" />);
    expect(screen.getByRole("img")).toHaveClass("[--success-check-mark:var(--success)]");
    expect(screen.getByRole("img")).not.toHaveClass("text-success");
  });

  it("anima a entrada por padrão, respeita movimento reduzido e pode entrar pronta", () => {
    const { container, rerender } = render(<SuccessCheck />);
    const animated = () =>
      [...container.querySelectorAll("circle, path, span[aria-hidden]")].filter((piece) =>
        piece.getAttribute("class")?.includes("animate-["),
      );

    expect(animated()).toHaveLength(3);
    for (const piece of animated()) expect(piece).toHaveClass("motion-reduce:animate-none");

    rerender(<SuccessCheck animated={false} />);
    expect(animated()).toHaveLength(0);
  });
});
