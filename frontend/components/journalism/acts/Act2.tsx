/**
 * Act2LBOAnatomy - Full scrollytelling experience for Act 2
 * 
 * Anatomy of a Buyout - Shows the exact mechanics of an LBO:
 * 1. LBO waterfall (sources & uses)
 * 2. Debt structure (capital stack)
 * 3. EBITDA bridge (value creation attribution)
 * 
 * Each visualization is sticky on the left, narrative scrolls on right.
 */

'use client';

import { useEffect, useState } from 'react';
import { ScrollamaWrapper, ScrollStep, ProgressIndicator } from '../scrollytelling';
import { LBOWaterfallChart } from '../charts/LBOWaterfallChart';
import { DebtStructureChart } from '../charts/DebtStructureChart';
import { motion } from 'framer-motion';

interface WaterfallData {
  metadata: any;
  sources_uses: any;
}

interface DebtStructureData {
  metadata: any;
  tranches: any[];
}

export const Act2LBOAnatomy: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [waterfallData, setWaterfallData] = useState<WaterfallData | null>(null);
  const [debtStructureData, setDebtStructureData] = useState<DebtStructureData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    Promise.all([
      fetch('/data/lbo_waterfall.json').then((r) => r.json()),
      fetch('/data/debt_structure.json').then((r) => r.json()),
    ])
      .then(([waterfall, debtStructure]) => {
        setWaterfallData(waterfall);
        setDebtStructureData(debtStructure);
      })
      .catch((err) => console.error('Failed to load data:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-amber-500" />
          <p className="mt-4 text-slate-400">Loading Act 2...</p>
        </div>
      </div>
    );
  }

  const steps = [
    {
      id: 'step-1-intro',
      data: { type: 'intro' },
    },
    {
      id: 'step-2-waterfall',
      data: { type: 'waterfall', view: 'sources' },
    },
    {
      id: 'step-3-waterfall-debt',
      data: { type: 'waterfall', view: 'debt' },
    },
    {
      id: 'step-4-waterfall-fees',
      data: { type: 'waterfall', view: 'fees' },
    },
    {
      id: 'step-5-debt-structure',
      data: { type: 'debt_structure' },
    },
    {
      id: 'step-6-debt-detail',
      data: { type: 'debt_structure', detail: true },
    },
  ];

  const handleStepEnter = (step: any, index: number) => {
    setCurrentStep(index);
  };

  return (
    <div className="relative w-full bg-slate-950 text-amber-50">
      {/* Progress indicator */}
      <ProgressIndicator
        totalSteps={steps.length}
        currentStep={currentStep}
        actNumber={2}
        actTitle="Anatomy of a Buyout"
      />

      {/* Header section */}
      <section className="relative h-screen flex items-center justify-center px-4 md:px-8 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-playfair text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Anatomy of a <span className="text-amber-500">Buyout</span>
            </h1>
            <p className="text-lg md:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Walk through the exact mechanics of how an LBO works: the capital stack, the debt burden, and who bears the risk.
            </p>
            <p className="text-sm text-slate-500 uppercase tracking-widest">Scroll to begin</p>
          </motion.div>
        </div>
      </section>

      {/* Scrollytelling sections */}
      <ScrollamaWrapper
        steps={steps}
        threshold={0.5}
        onStepEnter={handleStepEnter}
      >
        {/* STEP 1: Introduction */}
        <ScrollStep
          id="step-1-intro"
          index={0}
          title="When KKR acquired Petco..."
          isActive={currentStep === 0}
          content={
            <div className="space-y-4">
              <p>
                When KKR acquired Petco in 2006 for <strong>$1.68 billion</strong>, the pet
                retailer took on <strong>$1.3 billion in debt</strong> it did not choose, to
                fund a transaction it did not initiate. The company's new owners put in{' '}
                <strong>$380 million</strong> of equity. <em>The dog food chain put in the rest.</em>
              </p>
              <p>
                This is not exceptional. It is the standard model. The mechanics are virtually
                identical whether the company is a pet retailer, a hospital chain, a software
                firm, or a private equity firm investing in PE.
              </p>
              <p>
                The following sections dissect how this machine works: what money comes in, where
                it goes, who bears the risk, and what happens to the company in between.
              </p>
            </div>
          }
        >
          {/* Visualization: Company headline/logo area */}
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-black rounded-lg border border-slate-700">
            <div className="text-6xl text-amber-500 font-playfair font-bold mb-4">🐕</div>
            <p className="text-2xl font-playfair text-amber-50">Petco</p>
            <p className="text-sm text-slate-500 mt-2">2006 KKR Acquisition</p>
          </div>
        </ScrollStep>

        {/* STEP 2: Sources of Capital */}
        <ScrollStep
          id="step-2-waterfall"
          index={1}
          title="Sources: Where The Money Comes From"
          isActive={currentStep === 1}
          content={
            <div className="space-y-4">
              <p>
                To buy this company, the PE firm must raise capital from three buckets:
              </p>
              <ul className="space-y-3 list-disc list-inside">
                <li>
                  <strong>Equity (35%)</strong>: Money from the fund's LP investors. This is the
                  GP's "skin in the game."
                </li>
                <li>
                  <strong>Senior Debt (40%)</strong>: Secured loans from banks, typically on a
                  first-lien basis. Lowest risk for lenders.
                </li>
                <li>
                  <strong>Subordinated Debt (25%)</strong>: Mezzanine, term loan B, or PIK notes.
                  Higher risk, higher rate.
                </li>
              </ul>
              <p className="text-sm text-slate-400 pt-2">
                Total: The PE firm raises {"$"}1B to buy a company. Scroll to see the full
                waterfall of how this {"$"}1B flows through the deal.
              </p>
            </div>
          }
        >
          {waterfallData ? (
            <LBOWaterfallChart data={waterfallData} activeStep={1} width={700} height={500} />
          ) : null}
        </ScrollStep>

        {/* STEP 3: Debt Deep Dive */}
        <ScrollStep
          id="step-3-waterfall-debt"
          index={2}
          title="The Debt Stack: Who Lends And Why"
          isActive={currentStep === 2}
          content={
            <div className="space-y-4">
              <p>
                In the $1B deal, the PE firm raises $650M of debt across multiple tranches. Each
                tier has a different interest rate, maturity, and recovery priority.
              </p>
              <p>
                <strong>Senior Secured (First Lien):</strong> Typically SOFR + 275–325 bps. Banks
                hold this because it's first in line if things go wrong.
              </p>
              <p>
                <strong>Term Loan B (Covenant-Lite):</strong> SOFR + 400–450 bps. No maintenance
                covenants—a feature that became pervasive post-2008. Investors get higher rates
                but accept less company discipline.
              </p>
              <p>
                <strong>Mezzanine/PIK:</strong> SOFR + 550–700 bps, or 12–14% fixed with
                payment-in-kind optionality. If cash is tight, interest accrues and compounds.
              </p>
            </div>
          }
        >
          {waterfallData ? (
            <LBOWaterfallChart data={waterfallData} activeStep={2} width={700} height={500} />
          ) : null}
        </ScrollStep>

        {/* STEP 4: Fees at Close */}
        <ScrollStep
          id="step-4-waterfall-fees"
          index={3}
          title="The Hidden Fees: Extracted Before Day One"
          isActive={currentStep === 3}
          content={
            <div className="space-y-4">
              <p>
                Before a single operational dollar is spent, the PE firm extracts fees:
              </p>
              <div className="bg-slate-900 border-l-4 border-amber-500 p-3 rounded space-y-2 text-sm">
                <p>
                  <strong>Transaction fees</strong> ({`~$25M`}): Paid to investment bankers, legal
                  counsel, advisors. Typically 2–2.5% of deal size.
                </p>
                <p>
                  <strong>Financing fees</strong> ({`~$10M`}): Debt arrangers, documentation, agent
                  bank. Typically 1–1.5% of debt raised.
                </p>
                <p>
                  <strong>Management fee at close</strong> ({`~$150M`}): Paid directly to the GP
                  "for monitoring." Often 10–15% of deal size.
                </p>
              </div>
              <p className="text-xs text-slate-400 pt-2">
                <strong>Total pre-operational cash extraction:</strong> {`~$185M`}. This is born
                entirely by the company—through higher debt financing needs or dilution of equity.
              </p>
            </div>
          }
        >
          {waterfallData ? (
            <LBOWaterfallChart data={waterfallData} activeStep={4} width={700} height={500} />
          ) : null}
        </ScrollStep>

        {/* STEP 5: Debt Structure Deep Dive */}
        <ScrollStep
          id="step-5-debt-structure"
          index={4}
          title="The Capital Stack: Priority & Risk"
          isActive={currentStep === 4}
          content={
            <div className="space-y-4">
              <p>
                Here is the complete capital stack for a typical $1B LBO. Each layer has a
                different seniority, rate, maturity, and recovery assumption in bankruptcy.
              </p>
              <p>
                The <strong>senior secured tranches</strong> (top 40%) recover ~95% in a
                restructuring. The <strong>equity tranche</strong> (bottom 5%) recovers $0.
              </p>
              <p className="text-sm text-slate-400">
                Click or hover on any tranche to see details on covenant structure and typical
                holders.
              </p>
            </div>
          }
        >
          {debtStructureData ? (
            <DebtStructureChart
              data={debtStructureData}
              totalDebtAmount={650_000_000}
            />
          ) : null}
        </ScrollStep>

        {/* STEP 6: Default Waterfall */}
        <ScrollStep
          id="step-6-debt-detail"
          index={5}
          title="When Things Go Wrong: The Default Cascade"
          isActive={currentStep === 5}
          content={
            <div className="space-y-4">
              <p>
                If the company underperforms and enters restructuring, losses cascade down the
                capital stack.
              </p>
              <p>
                Imagine the company is sold for $650M in a restructuring—a 35% loss from the
                original $1B purchase price.
              </p>
              <ul className="space-y-2 text-sm">
                <li>
                  ✓ <strong>Senior secured (first lien): {'$'}325M</strong> — recovers ~100%
                </li>
                <li>
                  ✓ <strong>Term Loan A: {'$'}250M</strong> — recovers ~100%
                </li>
                <li>
                  ≈ <strong>Term Loan B: {'$'}350M</strong> — recovers ~93%, takes a $25M loss
                </li>
                <li>
                  ✗ <strong>Mezzanine: {'$'}150M</strong> — total loss
                </li>
                <li>
                  ✗ <strong>Preferred equity: $50M</strong> — total loss
                </li>
                <li>
                  ✗ <strong>PE fund equity: $50M</strong> — total loss, entire investment wiped
                </li>
              </ul>
              <p className="text-xs text-slate-400 pt-2 italic">
                At $650M value, debt holders lose $175M cumulative; equity loses everything.
              </p>
            </div>
          }
        >
          {debtStructureData ? (
            <DebtStructureChart
              data={debtStructureData}
              totalDebtAmount={650_000_000}
              highlightedTrancheRank={3}
            />
          ) : null}
        </ScrollStep>

        {/* STEP 7: Conclusion */}
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 px-4">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="font-playfair text-4xl text-amber-50">The Operative Question</h2>
            <p className="text-lg text-slate-300 leading-relaxed">
              This structure is not designed to make the company stronger. It is designed to
              transfer risk from the PE firm onto the company and its stakeholders—workers,
              suppliers, creditors.
            </p>
            <p className="text-lg text-slate-300 leading-relaxed">
              If the investment succeeds, the PE firm and its LPs capture upside. If it fails,
              the company and its workers bear the cost.
            </p>
            <p className="text-sm text-slate-500 mt-8">
              Next: What happens to the company in the years between acquisition and exit?
            </p>
          </div>
        </div>
      </ScrollamaWrapper>
    </div>
  );
};

export default Act2LBOAnatomy;
