import { Button, Reveal, Magnetic } from "@/components/common";

export function CtaSection() {
  return (
    <section className="relative mx-auto max-w-[1200px] px-5 py-24 text-center md:px-12">
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(74,222,128,0.05) 0%, transparent 70%)",
        }}
      />
      <Reveal className="relative">
        <h2 className="mb-3 text-[clamp(26px,4vw,42px)] font-extrabold tracking-tight">開始你的第一筆分析</h2>
        <p className="mb-8 text-base text-ink-fg-secondary">無需註冊，直接與 AI Agent 對話。</p>
        <Magnetic>
          <Button
            href="/chat"
            variant="primary"
            size="lg"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            }
          >
            進入 Chat
          </Button>
        </Magnetic>
      </Reveal>
    </section>
  );
}
