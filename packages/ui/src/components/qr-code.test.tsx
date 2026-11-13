import { render, screen } from "@testing-library/react";
import { QrCode } from "./qr-code";

const PIX =
  "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR";

describe("QrCode", () => {
  it("desenha o código com nome para o leitor de tela, numa moldura branca", () => {
    const { container } = render(
      <QrCode value={PIX} label="QR Code Pix de R$ 120,00" className="p-6" />,
    );

    const frame = container.querySelector('[data-slot="qr-code"]');
    expect(frame).toHaveClass("bg-white", "rounded-item", "p-6");

    const code = screen.getByRole("img", { name: "QR Code Pix de R$ 120,00" });
    expect(code.tagName.toLowerCase()).toBe("svg");
    expect(code.querySelectorAll("path").length).toBeGreaterThan(0);
  });

  it("o lado do código vem de size, e valores diferentes dão desenhos diferentes", () => {
    const { rerender } = render(<QrCode value={PIX} label="Código" size={120} />);
    const code = () => screen.getByRole("img", { name: "Código" });

    expect(code()).toHaveAttribute("width", "120");
    const before = code().innerHTML;

    rerender(<QrCode value={`${PIX}0`} label="Código" size={120} />);
    expect(code().innerHTML).not.toBe(before);
  });
});
