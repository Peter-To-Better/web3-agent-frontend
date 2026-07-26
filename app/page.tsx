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
import { getTickerSnapshot } from "@/lib/market-data";
import { getFearGreedIndex } from "@/lib/fear-greed";

export default async function HomePage() {
  const [tickerQuotes, fearGreed] = await Promise.all([
    getTickerSnapshot().catch(() => []),
    getFearGreedIndex().catch(() => null),
  ]);

  return (
    <>
      <Navbar />
      <ScrollCursor />
      <main className="flex-1 pt-[60px]">
        <TickerTape initialQuotes={tickerQuotes} />
        <Hero />
        <StatsBar />
        <CapabilitiesSection />
        <BigStatSection reading={fearGreed} />
        <SloganSection />
        <HowItWorksSection />
        <ChatPreviewSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
