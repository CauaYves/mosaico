import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "./item";

describe("Item", () => {
  it("renderiza as partes com os data-slot certos", () => {
    const { container } = render(
      <ItemGroup>
        <Item>
          <ItemMedia variant="icon">1</ItemMedia>
          <ItemContent>
            <ItemTitle>Escolha as contas</ItemTitle>
            <ItemDescription>Marque as contas que vai recarregar.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button size="sm">Ver</Button>
          </ItemActions>
        </Item>
        <ItemSeparator />
      </ItemGroup>,
    );

    for (const slot of [
      "item-group",
      "item",
      "item-media",
      "item-content",
      "item-title",
      "item-description",
      "item-actions",
      "item-separator",
    ]) {
      expect(container.querySelector(`[data-slot="${slot}"]`)).toBeInTheDocument();
    }
    expect(screen.getByRole("list")).toHaveAttribute("data-slot", "item-group");
  });

  it.each([
    ["default", "border-transparent"],
    ["outline", "border-border"],
    ["muted", "bg-muted/50"],
  ] as const)("variante %s", (variant, classe) => {
    render(
      <Item variant={variant} data-testid="item">
        <ItemContent>
          <ItemTitle>Fase</ItemTitle>
        </ItemContent>
      </Item>,
    );

    const item = screen.getByTestId("item");
    expect(item).toHaveAttribute("data-variant", variant);
    expect(item).toHaveClass(classe);
  });

  it.each([
    ["default", "py-3.5"],
    ["sm", "py-3"],
    ["xs", "py-2.5"],
  ] as const)("tamanho %s, com className extra", (size, classe) => {
    render(
      <Item size={size} className="w-80" data-testid="item">
        <ItemContent>
          <ItemTitle>Fase</ItemTitle>
        </ItemContent>
      </Item>,
    );

    const item = screen.getByTestId("item");
    expect(item).toHaveAttribute("data-size", size);
    expect(item).toHaveClass(classe, "w-80");
  });

  it("com render, vira link: recebe foco por Tab e abre com Enter", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: React.MouseEvent) => event.preventDefault());
    render(
      <Item render={<a href="/contas/1" onClick={onClick} />} variant="outline">
        <ItemContent>
          <ItemTitle>Conta 0001</ItemTitle>
        </ItemContent>
      </Item>,
    );

    await user.tab();
    const link = screen.getByRole("link", { name: "Conta 0001" });
    expect(link).toHaveFocus();
    expect(link).toHaveAttribute("data-slot", "item");
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("dentro do ItemGroup, cada Item é item da lista e o separador é só visual", () => {
    render(
      <ItemGroup>
        <Item>
          <ItemContent>
            <ItemTitle>PIX</ItemTitle>
          </ItemContent>
        </Item>
        <ItemSeparator />
        <Item render={<a href="/cartao" />}>
          <ItemContent>
            <ItemTitle>Cartão</ItemTitle>
          </ItemContent>
        </Item>
      </ItemGroup>,
    );

    expect(screen.getByRole("listitem")).toHaveTextContent("PIX");
    expect(screen.getByRole("link", { name: "Cartão" })).toBeInTheDocument();
    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
  });

  it("fora do ItemGroup, o Item não finge ser item de lista", () => {
    render(
      <Item data-testid="item">
        <ItemContent>
          <ItemTitle>Sozinho</ItemTitle>
        </ItemContent>
      </Item>,
    );

    expect(screen.getByTestId("item")).not.toHaveAttribute("role");
  });

  it("não tem violações de acessibilidade", async () => {
    const { container } = render(
      <ItemGroup>
        <Item variant="outline">
          <ItemMedia variant="icon">1</ItemMedia>
          <ItemContent>
            <ItemTitle>Decisões e contrato</ItemTitle>
            <ItemDescription>Fechar as decisões em aberto.</ItemDescription>
          </ItemContent>
        </Item>
        <ItemSeparator />
        <Item variant="outline">
          <ItemMedia variant="icon">2</ItemMedia>
          <ItemContent>
            <ItemTitle>Fundação</ItemTitle>
          </ItemContent>
        </Item>
      </ItemGroup>,
    );
    await expect(container).toHaveNoAxeViolations();
  });
});
