import { Navbar, Footer } from "@/components/layout";
import {
  Hero,
  TickerTape,
  StatsBar,
  CapabilitiesSection,
  BigStatSection,
  SloganSection,
  HowItWorksSection,
  ChatPreviewSection,
  CtaSection,
} from "@/components/home";
import { ScrollCursor } from "@/components/common";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <ScrollCursor />
      <main className="flex-1 pt-[60px]">
        <TickerTape />
        <Hero />
        <StatsBar />
        <CapabilitiesSection />
        <BigStatSection />
        <SloganSection />
        <HowItWorksSection />
        <ChatPreviewSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
