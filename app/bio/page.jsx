import Link from "next/link";
import { ArrowUpRight, Mail, MessageCircle, Phone } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: "Ravion — Bio & Links",
  description: "Official links and contact channels for Ravion.",
};

export default function Page() {
  return (
    <main className="grid min-h-screen place-items-center overflow-hidden bg-[#062b28] p-6 text-cream">
      <div className="w-full max-w-md text-center">
        <img
          className="mx-auto w-48 bg-cream p-2 rounded"
          src="/assets/ravion_logo_svg-01.svg"
          alt={siteConfig.name}
        />
        <p className="mt-6 font-mono text-xs tracking-[.25em] text-[#dfb77b]">
          BUILD · CREATE · INNOVATE
        </p>
        <h1 className="my-6 font-serif text-5xl">Made with imagination.</h1>

        <div className="grid gap-3 text-left text-sm">
          <Link
            className="flex items-center justify-between bg-white p-4 text-ink transition-transform hover:-translate-y-0.5 active:scale-[0.99]"
            href="/"
          >
            <span className="font-medium">Visit Ravion</span>
            <ArrowUpRight size={17} />
          </Link>

          <Link
            className="flex items-center justify-between bg-white p-4 text-ink transition-transform hover:-translate-y-0.5 active:scale-[0.99]"
            href="/samples"
          >
            <span className="font-medium">View latest work</span>
            <ArrowUpRight size={17} />
          </Link>

          <a
            className="flex items-center justify-between bg-white p-4 text-ink transition-transform hover:-translate-y-0.5 active:scale-[0.99]"
            href={`tel:${siteConfig.contact.phoneRaw}`}
          >
            <span className="flex items-center gap-2.5 font-medium">
              <Phone size={17} className="text-[#082d2a]" />
              Direct Call ({siteConfig.contact.phone})
            </span>
            <ArrowUpRight size={17} />
          </a>

          <a
            className="flex items-center justify-between bg-white p-4 text-ink transition-transform hover:-translate-y-0.5 active:scale-[0.99]"
            href={siteConfig.contact.whatsappUrl}
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
            href={`mailto:${siteConfig.contact.email}`}
          >
            <span className="flex items-center gap-2.5 font-medium">
              <Mail size={17} className="text-[#c99a55]" />
              Email Us ({siteConfig.contact.email})
            </span>
            <ArrowUpRight size={17} />
          </a>
        </div>
      </div>
    </main>
  );
}
