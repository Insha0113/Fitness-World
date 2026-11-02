import { whatsappLink } from "@/config/site";

export function WhatsAppGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={className} fill="currentColor">
      <path d="M16.04 3C8.86 3 3.03 8.82 3.03 16c0 2.3.6 4.53 1.74 6.5L3 29l6.68-1.75A12.95 12.95 0 0 0 16.04 29C23.2 29 29 23.18 29 16S23.2 3 16.04 3Zm0 23.62c-2 0-3.95-.54-5.65-1.55l-.4-.24-3.97 1.04 1.06-3.86-.26-.4A10.6 10.6 0 0 1 5.4 16c0-5.86 4.77-10.63 10.64-10.63 5.86 0 10.6 4.77 10.6 10.63 0 5.87-4.76 10.62-10.6 10.62Zm5.83-7.95c-.32-.16-1.89-.93-2.18-1.04-.3-.1-.5-.16-.72.16-.21.32-.82 1.04-1 1.25-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.21-.18-.32-.02-.5.14-.65.15-.14.32-.37.48-.56.16-.18.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.53-.72-.54h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.08-1.11 2.65 0 1.56 1.14 3.07 1.3 3.29.16.2 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.45.2 2 .12.61-.09 1.89-.77 2.15-1.52.27-.75.27-1.39.19-1.52-.08-.14-.29-.22-.61-.38Z" />
    </svg>
  );
}

export function WhatsAppButton() {
  const href = whatsappLink() ?? "/contact#whatsapp";
  const external = href.startsWith("https://");
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      aria-label="Chat with Fitness World on WhatsApp"
      className="group relative grid h-14 w-14 place-items-center rounded-full bg-[#1fa855] text-white shadow-[0_10px_30px_-8px_rgba(31,168,85,0.7)] ring-2 ring-furnace/70 transition-transform duration-300 hover:scale-105"
    >
      <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-[#1fa855]/40 [animation-duration:2.8s]" />
      <WhatsAppGlyph className="relative h-7 w-7" />
    </a>
  );
}
