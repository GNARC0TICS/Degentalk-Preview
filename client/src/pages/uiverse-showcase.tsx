import React, { useState } from 'react';
import { PumpButton, CopeButton, Red3DButton } from '@app/components/uiverse-clones/buttons';
import { DegenLoader, SleepyLoader, RadarLoader } from '@app/components/uiverse-clones/loaders';
// import { UiverseConfigProvider } from '@app/contexts/UiverseConfigContext';
import { Wide } from '@app/layout/primitives/Wide';

export default function UiverseShowcase() {
  const [showLoaders, setShowLoaders] = useState({
    degen: false,
    sleepy: false,
    radar: false
  });

  const handleLoaderDemo = (loader: keyof typeof showLoaders) => {
    setShowLoaders(prev => ({ ...prev, [loader]: true }));
    setTimeout(() => {
      setShowLoaders(prev => ({ ...prev, [loader]: false }));
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-black text-white py-12">
        <Wide as="div" className="space-y-16">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Uiverse Component Showcase
            </h1>
            <p className="text-zinc-400 text-xl">
              Fun, engaging UI components for the most unhinged web3 forum of 2025! 🚀
            </p>
          </div>

          {/* Buttons Section */}
          <section className="space-y-8">
            <h2 className="text-3xl font-bold text-emerald-400">🎯 Buttons</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* PumpButton */}
              <div className="bg-zinc-900 rounded-lg p-6 space-y-4">
                <h3 className="text-xl font-semibold text-cyan-300">PumpButton</h3>
                <p className="text-zinc-400 text-sm">
                  For positive actions that make numbers go up! Perfect for deposits, buys, and creating content.
                </p>
                <div className="space-y-3">
                  <PumpButton variant="pump" onClick={() => alert('PUMP IT! 📈')}>
                    Deposit Crypto
                  </PumpButton>
                  <PumpButton variant="pump" size="sm">
                    Buy DGT
                  </PumpButton>
                  <PumpButton variant="pump" size="lg" pulse={false}>
                    Create Epic Thread
                  </PumpButton>
                </div>
              </div>

              {/* CopeButton */}
              <div className="bg-zinc-900 rounded-lg p-6 space-y-4">
                <h3 className="text-xl font-semibold text-zinc-300">CopeButton</h3>
                <p className="text-zinc-400 text-sm">
                  For those moments when you just have to cope. Cancel actions, close dialogs, or back out gracefully.
                </p>
                <div className="space-y-3">
                  <CopeButton onClick={() => alert('Coping... 😔')}>
                    Cancel Order
                  </CopeButton>
                  <CopeButton size="sm">
                    Nevermind
                  </CopeButton>
                  <CopeButton size="lg">
                    I'll Think About It
                  </CopeButton>
                </div>
              </div>

              {/* Red3DButton */}
              <div className="bg-zinc-900 rounded-lg p-6 space-y-4">
                <h3 className="text-xl font-semibold text-red-400">Red3DButton</h3>
                <p className="text-zinc-400 text-sm">
                  For destructive actions that need that extra "are you sure?" vibe. Delete, ban, or reset with style.
                </p>
                <div className="space-y-3">
                  <Red3DButton onClick={() => alert('DESTROYED! 💥')}>
                    Delete Forever
                  </Red3DButton>
                  <Red3DButton size="sm">
                    Ban User
                  </Red3DButton>
                  <Red3DButton size="lg">
                    NUKE EVERYTHING
                  </Red3DButton>
                </div>
              </div>
            </div>

            {/* Dump variant showcase */}
            <div className="bg-zinc-900/50 rounded-lg p-6 space-y-4">
              <h3 className="text-xl font-semibold text-pink-400">PumpButton - Dump Variant</h3>
              <p className="text-zinc-400 text-sm">
                When numbers need to go down. Withdrawals, sales, and bearish actions.
              </p>
              <div className="flex gap-4 flex-wrap">
                <PumpButton variant="dump" onClick={() => alert('DUMP IT! 📉')}>
                  Withdraw Funds
                </PumpButton>
                <PumpButton variant="dump" size="sm">
                  Sell Position
                </PumpButton>
                <PumpButton variant="neutral">
                  Hold Steady
                </PumpButton>
              </div>
            </div>
          </section>

          {/* Loaders Section */}
          <section className="space-y-8">
            <h2 className="text-3xl font-bold text-emerald-400">⏳ Loaders</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* DegenLoader */}
              <div className="bg-zinc-900 rounded-lg p-6 space-y-4">
                <h3 className="text-xl font-semibold text-emerald-300">DegenLoader</h3>
                <p className="text-zinc-400 text-sm">
                  For crypto operations. Shows spinning dollar signs and orbiting coins. Perfect for wallet operations.
                </p>
                <div className="flex justify-center py-8">
                  {showLoaders.degen ? (
                    <DegenLoader size="md" />
                  ) : (
                    <PumpButton 
                      variant="pump" 
                      size="sm"
                      onClick={() => handleLoaderDemo('degen')}
                    >
                      Show Demo
                    </PumpButton>
                  )}
                </div>
              </div>

              {/* SleepyLoader */}
              <div className="bg-zinc-900 rounded-lg p-6 space-y-4">
                <h3 className="text-xl font-semibold text-purple-300">SleepyLoader</h3>
                <p className="text-zinc-400 text-sm">
                  For long operations. Shows funny messages and a sleepy face. Keeps users entertained during waits.
                </p>
                <div className="flex justify-center py-8">
                  {showLoaders.sleepy ? (
                    <SleepyLoader size="md" />
                  ) : (
                    <PumpButton 
                      variant="neutral" 
                      size="sm"
                      onClick={() => handleLoaderDemo('sleepy')}
                    >
                      Show Demo
                    </PumpButton>
                  )}
                </div>
              </div>

              {/* RadarLoader */}
              <div className="bg-zinc-900 rounded-lg p-6 space-y-4">
                <h3 className="text-xl font-semibold text-cyan-300">RadarLoader</h3>
                <p className="text-zinc-400 text-sm">
                  For search operations. Shows a radar sweep animation with blinking detection dots. Very sci-fi!
                </p>
                <div className="flex justify-center py-8">
                  {showLoaders.radar ? (
                    <RadarLoader size="md" />
                  ) : (
                    <PumpButton 
                      variant="pump" 
                      size="sm"
                      onClick={() => handleLoaderDemo('radar')}
                    >
                      Show Demo
                    </PumpButton>
                  )}
                </div>
              </div>
            </div>

            {/* Loader sizes */}
            <div className="bg-zinc-900/50 rounded-lg p-6 space-y-4">
              <h3 className="text-xl font-semibold">Loader Sizes</h3>
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center space-y-2">
                  <p className="text-zinc-400">Small</p>
                  <DegenLoader size="sm" text="Loading..." />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-zinc-400">Medium</p>
                  <RadarLoader size="md" text="Scanning..." />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-zinc-400">Large</p>
                  <SleepyLoader size="lg" messages={["Large and in charge...", "Still loading though..."]} />
                </div>
              </div>
            </div>
          </section>

          {/* Configuration Note */}
          <section className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-lg p-8 space-y-4">
            <h2 className="text-2xl font-bold text-amber-400">⚙️ Admin Configurable</h2>
            <p className="text-zinc-300">
              All these components are fully configurable through the admin panel! Admins can:
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li>Change button colors and gradients for different seasons or events</li>
              <li>Customize loader messages based on user levels (newbie, trader, whale, degen)</li>
              <li>Enable/disable particle effects and animations</li>
              <li>Set different themes for holidays (Christmas, Halloween, etc.)</li>
              <li>A/B test different button styles and loader personalities</li>
            </ul>
            <p className="text-emerald-400 font-semibold">
              Check out <code className="bg-zinc-800 px-2 py-1 rounded">/config/uiverse-components.config.ts</code> for all configuration options!
            </p>
          </section>

          {/* Coming Soon */}
          <section className="text-center space-y-4 py-12">
            <h2 className="text-3xl font-bold text-zinc-600">🚧 Coming Soon</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="bg-zinc-900 rounded-lg p-4">
                <p className="text-zinc-400">BrutalistCard</p>
              </div>
              <div className="bg-zinc-900 rounded-lg p-4">
                <p className="text-zinc-400">ShopCard3D</p>
              </div>
              <div className="bg-zinc-900 rounded-lg p-4">
                <p className="text-zinc-400">AnimatedCheckbox</p>
              </div>
              <div className="bg-zinc-900 rounded-lg p-4">
                <p className="text-zinc-400">MacTerminal</p>
              </div>
            </div>
          </section>
        </Wide>
      </div>
  );
}