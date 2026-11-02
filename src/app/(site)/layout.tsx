import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { FloatingDock } from "@/components/site/FloatingDock";
import SmoothScroll from "@/components/SmoothScroll";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScroll>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <FloatingDock />
    </SmoothScroll>
  );
}
