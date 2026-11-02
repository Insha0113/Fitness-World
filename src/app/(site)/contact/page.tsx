import type { Metadata } from "next";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { Container } from "@/components/ui/primitives";
import { LeadForm } from "@/components/forms/LeadForm";
import { WhatsAppGlyph } from "@/components/site/WhatsAppButton";
import { site, whatsappLink } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Visit, call, WhatsApp or write to Fitness World.",
};

export default function ContactPage() {
  const wa = whatsappLink();
  const { contact } = site;
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(contact.mapQuery)}&output=embed`;

  return (
    <div className="bg-pitch pb-24 pt-[72px]">
      <Container className="pt-12 lg:pt-20">
        <h1 className="display text-[clamp(3.4rem,9vw,8rem)] text-bone">Talk to us</h1>
        <p className="mt-4 max-w-[50ch] text-lg text-ash">Visit the gym, send a message or ask us to call you back.</p>

        <div className="mt-14 grid gap-12 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-5">
            <ul className="space-y-6">
              <li className="flex gap-4">
                <MapPin className="mt-1 shrink-0 text-furnace" aria-hidden />
                <div>
                  <p className="font-semibold text-bone">Address</p>
                  <address className="not-italic text-ash">
                    {contact.addressLines.map((l) => (
                      <span key={l} className="block">
                        {l}
                      </span>
                    ))}
                  </address>
                </div>
              </li>
              <li className="flex gap-4">
                <Phone className="mt-1 shrink-0 text-furnace" aria-hidden />
                <div>
                  <p className="font-semibold text-bone">Phone</p>
                  {contact.phone ? (
                    <a href={`tel:${contact.phone}`} className="text-ash hover:text-ember">
                      {contact.phone}
                    </a>
                  ) : (
                    <p className="text-ash">Number coming soon</p>
                  )}
                </div>
              </li>
              <li id="whatsapp" className="flex gap-4">
                <WhatsAppGlyph className="mt-1 h-6 w-6 shrink-0 text-[#1fa855]" />
                <div>
                  <p className="font-semibold text-bone">WhatsApp</p>
                  {wa ? (
                    <a href={wa} target="_blank" rel="noopener noreferrer" className="text-ash hover:text-ember">
                      Chat with us on WhatsApp
                    </a>
                  ) : (
                    <p className="text-ash">WhatsApp enquiries open soon. Use the form for now.</p>
                  )}
                </div>
              </li>
              <li className="flex gap-4">
                <Mail className="mt-1 shrink-0 text-furnace" aria-hidden />
                <div>
                  <p className="font-semibold text-bone">Email</p>
                  {contact.email ? (
                    <a href={`mailto:${contact.email}`} className="text-ash hover:text-ember">
                      {contact.email}
                    </a>
                  ) : (
                    <p className="text-ash">Email address coming soon</p>
                  )}
                </div>
              </li>
              <li className="flex gap-4">
                <Clock className="mt-1 shrink-0 text-furnace" aria-hidden />
                <div>
                  <p className="font-semibold text-bone">Working hours</p>
                  <dl className="text-ash">
                    {site.hours.map((h) => (
                      <div key={h.days} className="flex gap-3">
                        <dt>{h.days}:</dt>
                        <dd>{h.time}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </li>
            </ul>
            <div className="aspect-[4/3] overflow-hidden rounded-md border border-line">
              <iframe
                title="Map showing the Fitness World location"
                src={mapSrc}
                className="h-full w-full grayscale invert-[.9] hue-rotate-180"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="relative rounded-lg border border-line bg-coal p-6 sm:p-10">
              <h2 className="display text-[2.6rem] text-bone">Send an enquiry</h2>
              <p className="mb-8 mt-2 text-ash">We reply to every message. Want a call instead? Choose a time below.</p>
              <LeadForm intent="CONTACT" submitLabel="Send enquiry" />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
