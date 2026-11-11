import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Input } from "./input";

function EditarCartao({ showCloseButton }: { showCloseButton?: boolean }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>Editar cartão</DialogTrigger>
      <DialogContent showCloseButton={showCloseButton} className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Editar cartão</DialogTitle>
          <DialogDescription>Atualize o nome impresso no cartão.</DialogDescription>
        </DialogHeader>
        <Input aria-label="Nome no cartão" />
        <DialogFooter showCloseButton>
          <DialogClose render={<Button />}>Salvar</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const gatilho = () => screen.getByRole("button", { name: "Editar cartão" });

/** O foco está dentro do diálogo ou numa sentinela de foco do Base UI (no jsdom o Tab para nelas). */
function focoPreso(dialog: HTMLElement) {
  const ativo = document.activeElement as HTMLElement;
  return dialog.contains(ativo) || ativo.hasAttribute("data-base-ui-focus-guard");
}

async function abrir(user: ReturnType<typeof userEvent.setup>) {
  await user.click(gatilho());
  return screen.findByRole("dialog", { name: "Editar cartão" });
}

describe("Dialog", () => {
  it("abre pelo gatilho, com data-slot, título, descrição e className extra", async () => {
    const user = userEvent.setup();
    render(<EditarCartao />);

    const dialog = await abrir(user);
    expect(dialog).toHaveAttribute("data-slot", "dialog-content");
    expect(dialog).toHaveClass("rounded-surface", "sm:max-w-sm");
    expect(dialog).toHaveAccessibleDescription("Atualize o nome impresso no cartão.");
  });

  it("move o foco para dentro e o prende lá ao navegar com Tab, sem chegar ao gatilho", async () => {
    const user = userEvent.setup();
    render(<EditarCartao />);

    const botao = gatilho();
    const dialog = await abrir(user);
    await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement));

    for (let i = 0; i < 6; i++) {
      await user.tab();
      expect(focoPreso(dialog)).toBe(true);
      expect(document.activeElement).not.toBe(botao);
    }
    await user.tab({ shift: true });
    expect(focoPreso(dialog)).toBe(true);
  });

  it("Esc fecha e o foco volta ao gatilho", async () => {
    const user = userEvent.setup();
    render(<EditarCartao />);

    await abrir(user);
    await user.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(gatilho()).toHaveFocus();
  });

  it("o botão Fechar (em português) e o do rodapé fecham", async () => {
    const user = userEvent.setup();
    render(<EditarCartao />);

    await abrir(user);
    const fechar = screen.getAllByRole("button", { name: "Fechar" });
    expect(fechar).toHaveLength(2);
    await user.click(fechar[0] as HTMLElement);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(gatilho()).toHaveFocus();
  });

  it("abre pelo teclado: Enter no gatilho", async () => {
    const user = userEvent.setup();
    render(<EditarCartao />);

    await user.tab();
    expect(gatilho()).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(await screen.findByRole("dialog", { name: "Editar cartão" })).toBeInTheDocument();
  });

  it("sem showCloseButton, não mostra o X", async () => {
    const user = userEvent.setup();
    render(<EditarCartao showCloseButton={false} />);

    await abrir(user);
    expect(screen.getAllByRole("button", { name: "Fechar" })).toHaveLength(1);
  });

  it("a animação respeita prefers-reduced-motion: sem zoom, só o fade", async () => {
    const user = userEvent.setup();
    render(<EditarCartao />);

    expect(await abrir(user)).toHaveClass(
      "data-open:zoom-in-95",
      "motion-reduce:data-open:zoom-in-100",
      "motion-reduce:data-closed:zoom-out-100",
    );
  });

  it("não tem violações de acessibilidade aberto", async () => {
    const user = userEvent.setup();
    render(<EditarCartao />);

    await abrir(user);
    await expect(document.body).toHaveNoAxeViolations();
  });
});
