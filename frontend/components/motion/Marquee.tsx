'use client';

export function Marquee({ text, speed = 1 }: { text: string; speed?: number }) {
  const repeatedText = `${text} • `.repeat(10);
  const duration = 120 / speed; // significantly slower base duration

  return (
    <>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee linear infinite;
        }
      `}</style>
      <div className="relative flex overflow-hidden whitespace-nowrap bg-foreground text-background py-6 flex-nowrap">
        <div 
          className="flex flex-shrink-0 animate-marquee"
          style={{ animationDuration: `${duration}s` }}
        >
          <p className="text-4xl md:text-6xl font-bold tracking-tighter uppercase pr-8">{repeatedText}</p>
        </div>
        <div 
          className="flex flex-shrink-0 animate-marquee"
          style={{ animationDuration: `${duration}s` }}
        >
          <p className="text-4xl md:text-6xl font-bold tracking-tighter uppercase pr-8">{repeatedText}</p>
        </div>
      </div>
    </>
  );
}
