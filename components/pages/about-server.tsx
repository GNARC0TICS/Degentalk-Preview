import Link from 'next/link';

// Server Component - No client-side JS, immediate render
export function AboutServerContent() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      {/* Header Section - Pure server-rendered */}
      <div className="mb-12 relative">
        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            About Degentalk™
          </h1>
        </div>
        
        {/* Tagline - Server rendered, styled with CSS */}
        <p className="text-xl md:text-2xl text-zinc-400 font-medium">
          The <span className="text-emerald-400">satirical crypto community</span> that gets it.
        </p>
      </div>

      {/* Mission Statement - Static content */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6 text-white">Our Mission</h2>
        <p className="text-lg text-zinc-300 leading-relaxed mb-6">
          Born in the chaos of market crashes and rug pulls, Degentalk is a 
          <span className="text-emerald-400 font-semibold"> safe haven</span> for crypto degens 
          who've seen it all. We're building the most unhinged, addictive, and 
          brutally honest <Link href="/forums" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2">cryptocurrency forum</Link> on the internet.
        </p>
        <p className="text-lg text-zinc-300 leading-relaxed">
          Ready to dive deeper? Check out our <Link href="/features" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2">platform features</Link> or 
          explore the <Link href="/roadmap" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2">development roadmap</Link>.
        </p>
      </section>

      {/* Values Section - Pure HTML/CSS */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-white">Our Values</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <h3 className="text-xl font-bold mb-3 text-emerald-400">Radical Transparency</h3>
            <p className="text-zinc-300">No sugar-coating, no corporate BS. Just raw, unfiltered crypto discourse.</p>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <h3 className="text-xl font-bold mb-3 text-emerald-400">Community First</h3>
            <p className="text-zinc-300">Built by degens, for degens. Every feature shaped by <Link href="/contact" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2">community feedback</Link>.</p>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <h3 className="text-xl font-bold mb-3 text-emerald-400">$DGT Economy</h3>
            <p className="text-zinc-300">Our native token powers everything. Learn more in our <Link href="/faq" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2">FAQ section</Link>.</p>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <h3 className="text-xl font-bold mb-3 text-emerald-400">Gamified Experience</h3>
            <p className="text-zinc-300">XP, levels, and rewards that matter. <Link href="/auth/signup" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2">Join now</Link> to start earning.</p>
          </div>
        </div>
      </section>

      {/* Static Timeline */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-white">Our Journey</h2>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-zinc-800"></div>
          <div className="space-y-8">
            <div className="relative flex items-start gap-4">
              <div className="absolute left-4 w-2 h-2 bg-emerald-400 rounded-full -translate-x-1/2"></div>
              <div className="ml-12">
                <h3 className="font-bold text-lg text-white">2022: The Idea</h3>
                <p className="text-zinc-400">Conceived during the Terra Luna collapse. We knew crypto needed better.</p>
              </div>
            </div>
            <div className="relative flex items-start gap-4">
              <div className="absolute left-4 w-2 h-2 bg-emerald-400 rounded-full -translate-x-1/2"></div>
              <div className="ml-12">
                <h3 className="font-bold text-lg text-white">2023: Building in the Bear</h3>
                <p className="text-zinc-400">While others fled, we built. Feature by feature, degen by degen.</p>
              </div>
            </div>
            <div className="relative flex items-start gap-4">
              <div className="absolute left-4 w-2 h-2 bg-emerald-400 rounded-full -translate-x-1/2"></div>
              <div className="ml-12">
                <h3 className="font-bold text-lg text-white">2024: The Launch</h3>
                <p className="text-zinc-400">Ready to unleash controlled chaos on the crypto world. <Link href="/auth/signup" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2">Be part of history</Link>.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}