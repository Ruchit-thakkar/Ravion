import Link from "next/link";
import { ArrowUpRight, Mail, MessageCircle, Phone } from "lucide-react";

export const metadata = {
  title: "Ruchit Thakkar — Ravion",
  description: "Creative designer and digital builder.",
};

export default function Page() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#2e211d] p-6 text-cream">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto grid h-22 w-22 place-items-center rounded-full border border-white/50 font-serif text-3xl">
          RT
        </div>
        <p className="mt-6 font-mono text-xs tracking-[.25em] text-[#dfb77b]">
          CREATIVE DESIGNER & DIGITAL BUILDER
        </p>
        <h1 className="my-6 font-serif text-5xl">Making ideas feel alive.</h1>

        <div className="grid gap-3 text-left text-sm">
          <Link
            className="flex items-center justify-between bg-white p-4 text-ink transition-transform hover:-translate-y-0.5 active:scale-[0.99]"
            href="/"
          >
            <span className="font-medium">Visit Ravion</span>
            <ArrowUpRight size={17} />
          </Link>

          <a
            className="flex items-center justify-between bg-white p-4 text-ink transition-transform hover:-translate-y-0.5 active:scale-[0.99]"
            href="tel:+917990774831"
          >
            <span className="flex items-center gap-2.5 font-medium">
              <Phone size={17} className="text-[#082d2a]" />
              Call (+91 79907 74831)
            </span>
            <ArrowUpRight size={17} />
          </a>

          <a
            className="flex items-center justify-between bg-white p-4 text-ink transition-transform hover:-translate-y-0.5 active:scale-[0.99]"
            href="https://wa.me/917990774831"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="flex items-center gap-2.5 font-medium">
              <MessageCircle size={17} className="text-emerald-600" />
              WhatsApp
            </span>
            <ArrowUpRight size={17} />
          </a>

          <a
            className="flex items-center justify-between bg-white p-4 text-ink transition-transform hover:-translate-y-0.5 active:scale-[0.99]"
            href="mailto:ruchitthakkar12@gmail.com"
          >
            <span className="flex items-center gap-2.5 font-medium">
              <Mail size={17} className="text-[#c99a55]" />
              Email (ruchitthakkar12@gmail.com)
            </span>
            <ArrowUpRight size={17} />
          </a>
        </div>
      </div>
    </main>
  );
}
