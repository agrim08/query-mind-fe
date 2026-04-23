import React from 'react';

export default function Hero() {
  return (
    <section className="relative w-full min-h-[80vh] flex flex-col items-center justify-center overflow-hidden bg-[#080909]">
      {/* Background radial gradient glow from accent at 4% opacity */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle at top center, rgba(200,240,77,0.04) 0%, transparent 70%)'
        }}
      ></div>

      {/* Subtle dot-grid overlay at 15% opacity */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#27282b 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.15
        }}
      ></div>

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl px-6 mx-auto">
        
        {/* TODO: Add framer-motion enter animations to these elements */}

        {/* Eyebrow chip */}
        <div className="flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-[rgba(200,240,77,0.07)] border border-[#27282b]">
          <span className="text-[13px] font-medium text-[#c8f04d]" style={{ fontFamily: 'var(--font-geist, sans-serif)' }}>
            ◆ Powered by Gemini 2.5 Flash + Pinecone
          </span>
        </div>

        {/* Headline */}
        <h1 
          className="text-[64px] font-[800] text-[#f0f1f2] leading-[1.1] mb-6 tracking-[-0.05em]"
          style={{ fontFamily: 'var(--font-bricolage, sans-serif)' }}
        >
          Query your database in{' '}
          <span className="relative inline-block border-b-[2px] border-[#c8f04d]">
            plain English.
          </span>
        </h1>

        {/* Subheadline */}
        <p 
          className="text-[18px] text-[#8a8d93] leading-[1.7] max-w-2xl mb-10"
          style={{ fontFamily: 'var(--font-geist, sans-serif)' }}
        >
          Connect your database. Ask your question. Get the answer. No SQL. No developer. No waiting.
        </p>

        {/* CTA Row */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
          <button 
            className="px-6 py-3 rounded-[8px] bg-[#c8f04d] text-[#080909] font-medium text-[15px] transition-transform hover:scale-105 active:scale-95"
            style={{ fontFamily: 'var(--font-geist, sans-serif)' }}
          >
            Start querying →
          </button>
          <button 
            className="px-6 py-3 rounded-[8px] bg-[#141516] border border-[#27282b] text-[#f0f1f2] font-medium text-[15px] transition-colors hover:bg-[#1a1b1d]"
            style={{ fontFamily: 'var(--font-geist, sans-serif)' }}
          >
            See how it works
          </button>
        </div>

        {/* Proof Points */}
        <div 
          className="flex flex-wrap items-center justify-center gap-3 text-[12px] text-[#4d5057]"
          style={{ fontFamily: 'var(--font-geist-mono, monospace)' }}
        >
          <span>No credit card</span>
          <span>·</span>
          <span>Works with any Postgres DB</span>
          <span>·</span>
          <span>Results in seconds</span>
        </div>

      </div>
    </section>
  );
}
