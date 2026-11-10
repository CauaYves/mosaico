"use client";

import { Avatar, AvatarFallback } from "@multiclubes/ui/components/avatar";
import { Bubble, BubbleContent } from "@multiclubes/ui/components/bubble";
import { Button } from "@multiclubes/ui/components/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@multiclubes/ui/components/input-group";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
} from "@multiclubes/ui/components/message";
import { DotsThreeIcon, PaperclipIcon, PaperPlaneRightIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

type Role = "assistant" | "user";

type ChatMessage = {
  id: number;
  role: Role;
  text: string;
  time: string;
  list?: string[];
  suggestions?: string[];
};

const initialMessages: ChatMessage[] = [
  { id: 1, role: "assistant", text: "Olá! Como posso ajudar?", time: "09:40" },
  { id: 2, role: "user", text: "Pergunta de exemplo", time: "09:41" },
  {
    id: 3,
    role: "assistant",
    text: "Resposta de exemplo com alguns pontos:",
    list: ["Primeiro ponto", "Segundo ponto", "Terceiro ponto"],
    suggestions: ["Sugestão 1", "Sugestão 2"],
    time: "09:41",
  },
  { id: 4, role: "user", text: "Outra pergunta de exemplo", time: "09:42" },
  { id: 5, role: "assistant", text: "Outra resposta de exemplo.", time: "09:42" },
];

function now() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function AssistantAvatar({ className }: { className?: string }) {
  return (
    <Avatar className={className}>
      <AvatarFallback>AS</AvatarFallback>
    </Avatar>
  );
}

export default function Chat01() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [value, setValue] = useState("");
  const [typing, setTyping] = useState(true);
  const viewportRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(initialMessages.length + 1);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // biome-ignore lint/correctness/useExhaustiveDependencies: rola ao fim quando a lista ou o indicador mudam
  useEffect(() => {
    const el = viewportRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => () => clearTimeout(timer.current), []);

  function send(text: string) {
    const content = text.trim();
    if (!content) return;
    setMessages((prev) => [
      ...prev,
      { id: nextId.current++, role: "user", text: content, time: now() },
    ]);
    setValue("");
    setTyping(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId.current++,
          role: "assistant",
          text: "Resposta de exemplo à sua mensagem.",
          time: now(),
        },
      ]);
      setTyping(false);
    }, 1000);
  }

  // Tela inteira, sem cartão em volta: o chat é a página. As partes se separam por espaço, não
  // por bordas; a única borda é o contorno do campo de mensagem (regras de design).
  return (
    <section
      aria-label="Chat com o assistente"
      className="flex h-svh flex-col bg-background text-foreground"
    >
      <header className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 pt-6 pb-2">
        <AssistantAvatar />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium">Assistente</span>
          <span className="text-xs text-muted-foreground">Online</span>
        </div>
        <Button variant="ghost" size="icon" aria-label="Abrir menu">
          <DotsThreeIcon weight="bold" />
        </Button>
      </header>

      <div
        ref={viewportRef}
        role="log"
        aria-live="polite"
        aria-label="Mensagens"
        className="min-h-0 flex-1 overflow-y-auto"
      >
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-6">
          {messages.map((m) => (
            <Message key={m.id} align={m.role === "user" ? "end" : "start"}>
              {m.role === "assistant" && (
                <MessageAvatar>
                  <AssistantAvatar />
                </MessageAvatar>
              )}
              <MessageContent>
                <Bubble variant={m.role === "user" ? "default" : "muted"}>
                  <BubbleContent>
                    {m.text}
                    {m.list && (
                      <ul className="mt-1.5 list-disc space-y-0.5 pl-4">
                        {m.list.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </BubbleContent>
                </Bubble>
                {m.suggestions && (
                  <div className="flex flex-wrap gap-2">
                    {m.suggestions.map((s) => (
                      <Button key={s} variant="secondary" size="sm" onClick={() => send(s)}>
                        {s}
                      </Button>
                    ))}
                  </div>
                )}
                <MessageFooter>{m.time}</MessageFooter>
              </MessageContent>
            </Message>
          ))}

          {typing && (
            <Message>
              <MessageAvatar>
                <AssistantAvatar />
              </MessageAvatar>
              <MessageContent>
                <Bubble variant="muted">
                  <BubbleContent className="flex items-center gap-1 py-3.5">
                    <span className="sr-only">Assistente digitando…</span>
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        aria-hidden
                        className="size-1.5 animate-bounce rounded-full bg-muted-foreground"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </BubbleContent>
                </Bubble>
              </MessageContent>
            </Message>
          )}
        </div>
      </div>

      {/* Campo de mensagem no padrão do InputGroup com textarea: ações na faixa de baixo. */}
      <form
        className="mx-auto w-full max-w-2xl px-4 pt-2 pb-6"
        onSubmit={(e) => {
          e.preventDefault();
          send(value);
        }}
      >
        <InputGroup>
          <InputGroupTextarea
            value={value}
            aria-label="Mensagem"
            placeholder="Escreva uma mensagem…"
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(value);
              }
            }}
          />
          <InputGroupAddon align="block-end">
            <InputGroupButton size="icon-sm" aria-label="Anexar arquivo">
              <PaperclipIcon />
            </InputGroupButton>
            <InputGroupButton
              type="submit"
              variant="default"
              size="icon-sm"
              className="ml-auto"
              aria-label="Enviar mensagem"
              disabled={!value.trim()}
            >
              <PaperPlaneRightIcon weight="fill" />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>
    </section>
  );
}
