import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";
import { Button } from "./button";

function ConfirmarPagamento({
  onConfirm,
  size,
}: {
  onConfirm?: () => void;
  size?: "default" | "sm";
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button />}>Pagar R$ 120,00</AlertDialogTrigger>
      <AlertDialogContent size={size} className="gap-4">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar pagamento?</AlertDialogTitle>
          <AlertDialogDescription>
            Vamos cobrar R$ 120,00 no cartão final 1111.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Voltar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirmar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const gatilho = () => screen.getByRole("button", { name: "Pagar R$ 120,00" });

/**
 * Espera o foco assentar dentro do diálogo ou numa sentinela de foco do Base UI (no jsdom o Tab
 * para nelas; no navegador elas devolvem o foco ao popup na hora). A sentinela pode devolver o
 * foco um instante depois do Tab, por isso o waitFor. Se falhar, diz onde o foco ficou.
 */
async function esperarFocoPreso(dialog: HTMLElement, gatilho: HTMLElement) {
  await waitFor(() => {
    const ativo = document.activeElement as HTMLElement;
    const preso =
      ativo !== gatilho &&
      (dialog.contains(ativo) || ativo.hasAttribute("data-base-ui-focus-guard"));
    expect(preso, `foco em ${ativo.outerHTML.slice(0, 120)}`).toBe(true);
  });
}

async function abrir(user: ReturnType<typeof userEvent.setup>) {
  await user.click(gatilho());
  return screen.findByRole("alertdialog", { name: "Confirmar pagamento?" });
}

describe("AlertDialog", () => {
  it("abre pelo gatilho, com data-slot, tamanho, descrição e className extra", async () => {
    const user = userEvent.setup();
    render(<ConfirmarPagamento size="sm" />);

    const dialog = await abrir(user);
    expect(dialog).toHaveAttribute("data-slot", "alert-dialog-content");
    expect(dialog).toHaveAttribute("data-size", "sm");
    expect(dialog).toHaveClass("gap-4");
    expect(dialog).toHaveAccessibleDescription("Vamos cobrar R$ 120,00 no cartão final 1111.");
  });

  it("prende o foco dentro ao navegar com Tab, sem chegar ao gatilho", async () => {
    const user = userEvent.setup();
    render(<ConfirmarPagamento />);

    const botao = gatilho();
    const dialog = await abrir(user);
    await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement));
    for (let i = 0; i < 4; i++) {
      await user.tab();
      await esperarFocoPreso(dialog, botao);
    }
  });

  it("não fecha clicando fora", async () => {
    const user = userEvent.setup();
    render(<ConfirmarPagamento />);

    await abrir(user);
    const overlay = document.querySelector('[data-slot="alert-dialog-overlay"]') as HTMLElement;
    await user.click(overlay);
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("Esc fecha e o foco volta ao gatilho", async () => {
    const user = userEvent.setup();
    render(<ConfirmarPagamento />);

    await abrir(user);
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(gatilho()).toHaveFocus();
  });

  it("Voltar fecha sem confirmar; Confirmar chama a ação", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<ConfirmarPagamento onConfirm={onConfirm} />);

    await abrir(user);
    await user.click(screen.getByRole("button", { name: "Voltar" }));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(onConfirm).not.toHaveBeenCalled();
    expect(gatilho()).toHaveFocus();

    await abrir(user);
    await user.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("pelo teclado: Enter abre e Espaço aciona Voltar", async () => {
    const user = userEvent.setup();
    render(<ConfirmarPagamento />);

    await user.tab();
    await user.keyboard("{Enter}");
    await screen.findByRole("alertdialog");
    screen.getByRole("button", { name: "Voltar" }).focus();
    await user.keyboard(" ");
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  });

  it("a animação respeita prefers-reduced-motion: sem zoom, só o fade", async () => {
    const user = userEvent.setup();
    render(<ConfirmarPagamento />);

    expect(await abrir(user)).toHaveClass(
      "motion-reduce:data-open:zoom-in-100",
      "motion-reduce:data-closed:zoom-out-100",
    );
  });

  it("não tem violações de acessibilidade aberto", async () => {
    const user = userEvent.setup();
    render(<ConfirmarPagamento />);

    await abrir(user);
    await expect(document.body).toHaveNoAxeViolations();
  });
});
