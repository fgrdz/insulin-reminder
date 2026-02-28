import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
  { href: "/lembretes/novo", label: "Novo lembrete" },
  { href: "/lembretes", label: "Meus lembretes" },
];

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Image
        src="/ico.png"
        width={50}
        height={50}
        alt="Icone da hello kitty"
      />
      <span className="text-primary text-2xl font-bold tracking-tight">
        Insulin Reminder
      </span>
    </div>
  );
}

export default function Header() {
  return (
    <header className="w-full bg-accent px-6 py-4 shadow-2xl">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-4">
          <Link
            href="/lembretes/novo"
            className="text-primary font-bold text-md hover:opacity-80 transition-opacity"
          >
            Novo lembrete
          </Link>
          <Link
            href="/lembretes"
            className="bg-background text-primary text-md font-semibold px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity"
          >
            Meus lembretes
          </Link>
        </nav>

        {/* Mobile nav */}
        <Sheet>
          <SheetTrigger
            className="sm:hidden text-primary p-1 rounded-md hover:opacity-80 transition-opacity"
            aria-label="Abrir menu"
          >
            <Menu size={28} />
          </SheetTrigger>
          <SheetContent side="right" className="bg-accent border-border w-64">
            <SheetHeader>
              <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-2 mt-6">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-primary font-semibold text-lg px-4 py-3 rounded-xl hover:bg-background/40 transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
