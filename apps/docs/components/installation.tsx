import Link from "next/link";
import { CodeBlockCommand } from "@/components/code-block-command";

/** Substitui a seção "Installation" do shadcn: o componente vem do registry do Mosaico. */
export function Installation({ name }: { name: string }) {
  const address = `CauaYves/mosaico/${name}`;
  return (
    <>
      <p>
        Instale pelo registry do Mosaico. O componente vai para <code>components/mosaico/</code> e
        já traz o tema Multiclubes (veja a <Link href="/docs/installation">instalação</Link>).
      </p>
      <figure data-rehype-pretty-code-figure="">
        <CodeBlockCommand
          __npm__={`npx shadcn@latest add ${address}`}
          __pnpm__={`pnpm dlx shadcn@latest add ${address}`}
          __yarn__={`yarn dlx shadcn@latest add ${address}`}
          __bun__={`bunx --bun shadcn@latest add ${address}`}
        />
      </figure>
    </>
  );
}
