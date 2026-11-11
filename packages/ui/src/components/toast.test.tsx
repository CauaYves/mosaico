import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";
import {
  createToastManager,
  Toast,
  ToastContent,
  Toaster,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  useToastManager,
} from "./toast";

function setup() {
  const manager = createToastManager();
  render(
    <Toaster toastManager={manager}>
      <Button onClick={() => manager.add({ title: "Pagamento aprovado", type: "success" })}>
        Pagar
      </Button>
    </Toaster>,
  );
  return manager;
}

describe("Toast", () => {
  it("anuncia o aviso numa região aria-live com nome em português", async () => {
    const manager = setup();

    act(() => {
      manager.add({ title: "Pagamento aprovado", description: "Recibo enviado por e-mail." });
    });

    const regiao = screen.getByRole("region", { name: "Avisos" });
    expect(regiao).toHaveAttribute("aria-live", "polite");
    expect(regiao).toHaveAttribute("data-slot", "toast-viewport");
    expect(await screen.findByText("Pagamento aprovado")).toBeInTheDocument();
    expect(regiao).toContainElement(screen.getByText("Recibo enviado por e-mail."));
  });

  it("cada aviso tem data-slot, título e descrição ligados", async () => {
    const manager = setup();

    act(() => {
      manager.add({
        title: "Pagamento recusado",
        description: "Tente outro cartão.",
        type: "error",
      });
    });

    const aviso = await screen.findByRole("dialog", { name: "Pagamento recusado" });
    expect(aviso).toHaveAttribute("data-slot", "toast");
    expect(aviso).toHaveAccessibleDescription("Tente outro cartão.");
  });

  it("o tipo não depende só da cor: cada um tem ícone próprio", async () => {
    const manager = setup();

    act(() => {
      manager.add({ title: "Sucesso", type: "success" });
      manager.add({ title: "Erro", type: "error" });
    });

    await screen.findByText("Erro");
    const icones = document.querySelectorAll('[data-slot="toast-icon"] svg');
    expect(icones).toHaveLength(2);
    expect(icones[0]?.innerHTML).not.toBe(icones[1]?.innerHTML);
  });

  it("superfície por fundo, sombra e anel suave, sem borda", async () => {
    const manager = setup();

    act(() => {
      manager.add({ title: "Salvo" });
    });

    const aviso = await screen.findByRole("dialog", { name: "Salvo" });
    expect(aviso).toHaveClass("bg-popover", "shadow-lg", "ring-1");
    expect(aviso).not.toHaveClass("border");
    expect(aviso).toHaveClass("motion-reduce:[transition:opacity_150ms]");
  });

  it("aparece a partir de um clique e fecha pelo botão Fechar aviso", async () => {
    const user = userEvent.setup();
    setup();

    await user.click(screen.getByRole("button", { name: "Pagar" }));
    const aviso = await screen.findByRole("dialog", { name: "Pagamento aprovado" });

    const fechar = aviso.querySelector('[data-slot="toast-close"]') as HTMLElement;
    expect(fechar).toHaveAttribute("aria-label", "Fechar aviso");
    await user.click(fechar);
    await waitFor(() => expect(screen.queryByText("Pagamento aprovado")).not.toBeInTheDocument());
  });

  it("pelo teclado: o aviso recebe foco e Esc o fecha", async () => {
    const user = userEvent.setup();
    const manager = setup();

    act(() => {
      manager.add({ title: "Código copiado", timeout: 0 });
    });
    const aviso = await screen.findByRole("dialog", { name: "Código copiado" });

    aviso.focus();
    expect(aviso).toHaveFocus();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByText("Código copiado")).not.toBeInTheDocument());
  });

  it("aceita className extra na região e no aviso, montando as partes à mão", async () => {
    const manager = createToastManager();
    function Lista() {
      const { toasts } = useToastManager();
      return toasts.map((item) => (
        <Toast key={item.id} toast={item} className="max-w-xs">
          <ToastContent>
            <ToastTitle />
          </ToastContent>
        </Toast>
      ));
    }
    render(
      <ToastProvider toastManager={manager}>
        <ToastPortal>
          <ToastViewport className="bottom-8">
            <Lista />
          </ToastViewport>
        </ToastPortal>
      </ToastProvider>,
    );

    act(() => {
      manager.add({ title: "Salvo" });
    });
    expect(screen.getByRole("region", { name: "Avisos" })).toHaveClass("fixed", "bottom-8");
    expect(await screen.findByRole("dialog", { name: "Salvo" })).toHaveClass("max-w-xs");
  });

  it("não tem violações de acessibilidade com um aviso aberto", async () => {
    const manager = setup();

    act(() => {
      manager.add({ title: "Pagamento aprovado", description: "Recibo enviado.", type: "success" });
    });
    await screen.findByText("Pagamento aprovado");
    await expect(document.body).toHaveNoAxeViolations();
  });
});
