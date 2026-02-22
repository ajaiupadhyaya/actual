#!/usr/bin/env python3
"""
Build LBO Structure Data for Act 2: Anatomy of a Buyout

Generates three datasets:
1. LBO Waterfall - animated sources & uses for a $1B hypothetical acquisition
2. Debt Structure - capital stack with rates, terms, recovery assumptions
3. EBITDA Bridge - value creation attribution (multiple expansion, revenue growth, margin expansion, leverage paydown)

All output to /frontend/public/data/lbo_*.json
"""

import json
import os
from datetime import datetime
from typing import Any, Dict, List

# Target directory for output JSON files
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "data")
os.makedirs(OUTPUT_DIR, exist_ok=True)


def build_lbo_waterfall() -> Dict[str, Any]:
    """
    Generate animated waterfall for sources & uses of a typical $1B PE acquisition.
    
    Structure:
    - Sources: Equity (PE fund), Senior debt, Mezz, etc.
    - Uses: Purchase price, fees at close
    - Each element is a step in the animation
    """
    
    acquisition_value = 1_000_000_000  # $1B
    equity_pct = 0.35
    debt_pct = 0.65
    
    equity_amount = acquisition_value * equity_pct
    debt_amount = acquisition_value * debt_pct
    
    # Transaction fees (typical: 2-3% of deal size)
    transaction_fee = acquisition_value * 0.025
    financing_fee = debt_amount * 0.015  # 1.5% of debt raised
    management_fee_at_close = 150_000_000  # Typical management fee paid at close
    
    # Debt structure breakdown
    senior_debt_pct = 0.40  # 40% of total debt at senior secured rate
    term_b_pct = 0.35  # 35% at higher rate (covenant-lite)
    mezz_pct = 0.15  # 15% mezzanine
    pik_pct = 0.10  # 10% PIK toggle notes
    
    waterfall = {
        "metadata": {
            "generated": datetime.now().isoformat(),
            "deal_size_usd": acquisition_value,
            "description": "Hypothetical $1B LBO waterfall - sources & uses. Based on typical transaction 2020-2024.",
            "source": "PE industry standard structures + SEC S-4/8-K filings (Dell, Petco, Bausch Health, etc.)",
            "notes": [
                "The target company — not the PE firm — is responsible for the debt raised.",
                "Transaction fees ($25M) are paid upfront to advisors but born by the company through higher debt needs.",
                "Management fee at close ($150M) goes directly to the GP for 'monitoring' before any value creation.",
                "Debt breakdown uses covenant-lite proliferation (2015+ market: 70-80% covenant-lite)."
            ]
        },
        "sources_uses": {
            "sources": [
                {
                    "label": "PE Fund Equity",
                    "amount": equity_amount,
                    "pct_of_total": equity_pct * 100,
                    "description": "Committed capital from fund's LPs",
                    "color": "#2D7B2D",  # Dark green
                    "step": 1
                },
                {
                    "label": "Senior Secured Debt (First Lien)",
                    "amount": debt_amount * senior_debt_pct,
                    "pct_of_total": debt_pct * senior_debt_pct * 100,
                    "rate_range": "SOFR + 275-325 bps",
                    "maturity_years": 7,
                    "description": "Revolving credit + Term Loan A (first lien, covenanted)",
                    "color": "#D97706",  # Amber
                    "step": 2
                },
                {
                    "label": "Term Loan B (Covenant-Lite)",
                    "amount": debt_amount * term_b_pct,
                    "pct_of_total": debt_pct * term_b_pct * 100,
                    "rate_range": "SOFR + 400-450 bps",
                    "maturity_years": 8,
                    "description": "Unsecured, no maintenance covenants (2007+ market standard)",
                    "color": "#DC2626",  # Red
                    "step": 3
                },
                {
                    "label": "Mezzanine / 2nd Lien",
                    "amount": debt_amount * mezz_pct,
                    "pct_of_total": debt_pct * mezz_pct * 100,
                    "rate_range": "SOFR + 550-650 bps",
                    "maturity_years": 10,
                    "description": "Subordinated, higher spread for lower seniority",
                    "color": "#7C3AED",  # Violet
                    "step": 4
                },
                {
                    "label": "PIK Toggle Notes",
                    "amount": debt_amount * pik_pct,
                    "pct_of_total": debt_pct * pik_pct * 100,
                    "rate_range": "12-14% (toggle: pay in cash or add to principal)",
                    "maturity_years": 12,
                    "description": "Payment-in-kind option: if cash is tight, accrue as debt",
                    "color": "#991B1B",  # Dark red
                    "step": 5
                }
            ],
            "uses": [
                {
                    "label": "Purchase Price",
                    "amount": acquisition_value,
                    "pct_of_total": (acquisition_value / (acquisition_value + transaction_fee + financing_fee + management_fee_at_close)) * 100,
                    "description": "Goes to selling shareholders",
                    "color": "#1F2937",  # Dark slate
                    "step": 6
                },
                {
                    "label": "Transaction Fees",
                    "amount": transaction_fee,
                    "pct_of_total": (transaction_fee / (acquisition_value + transaction_fee + financing_fee + management_fee_at_close)) * 100,
                    "description": "Investment bankers, legal, advisors (2.5% of deal size)",
                    "color": "#F59E0B",  # Amber
                    "step": 7
                },
                {
                    "label": "Financing Fees",
                    "amount": financing_fee,
                    "pct_of_total": (financing_fee / (acquisition_value + transaction_fee + financing_fee + management_fee_at_close)) * 100,
                    "description": "Debt arrangers, documentation, agent fees (1.5% of debt raised)",
                    "color": "#FBBF24",  # Light amber
                    "step": 8
                },
                {
                    "label": "Management Fee at Close",
                    "amount": management_fee_at_close,
                    "pct_of_total": (management_fee_at_close / (acquisition_value + transaction_fee + financing_fee + management_fee_at_close)) * 100,
                    "description": "Paid to PE firm for 'monitoring' and advisory services (sometimes 15% of deal)",
                    "recipient": "PE Fund GP",
                    "color": "#EF4444",  # Red
                    "step": 9
                }
            ]
        },
        "leverage_metrics": {
            "total_debt": debt_amount,
            "total_equity": equity_amount,
            "total_sources_uses": acquisition_value + transaction_fee + financing_fee + management_fee_at_close,
            "debt_to_equity_ratio": debt_amount / equity_amount,
            "leverage_multiple": "~1.9x",  # Typical entry leverage pre-EBITDA impact
            "note": "Actual leverage depends on target EBITDA. If $150M EBITDA, debt/EBITDA = ~4.3x. If $100M EBITDA, ~6.5x."
        }
    }
    
    return waterfall


def build_debt_structure() -> Dict[str, Any]:
    """
    Generate capital stack exploded view with tranche details, rates, priority, recovery.
    """
    
    debt_structure = {
        "metadata": {
            "generated": datetime.now().isoformat(),
            "description": "Typical PE LBO capital stack breakdown with rates, terms, covenant structure, and default recovery order.",
            "source": "LCD/LSTA (Loan Syndications & Trading Assoc), SIFMA, recent 10-K/8-K filings (2020-2024)",
            "assumptions": {
                "base_rate": "SOFR",
                "sofr_level_date": "2024-02-01",
                "sofr_rate": 5.33,
                "recovery_rates": "Based on historical recovery studies after restructuring"
            }
        },
        "tranches": [
            {
                "rank": 1,
                "name": "Senior Secured Revolving Credit",
                "tranche_type": "Revolver",
                "size_pct": 0.15,
                "size_representative": "$150M",
                "typical_spread_bps": 300,
                "all_in_rate": "SOFR + 300 = ~8.3%",
                "maturity_years": 7,
                "covenant_structure": "Maintenance covenants: max net leverage, min interest coverage",
                "seniority": "First lien",
                "recovery_in_default": 0.95,  # 95% recovery
                "typical_holders": "Lead banks, agent bank",
                "color": "#059669",  # Emerald
                "icon": "shield-check"
            },
            {
                "rank": 2,
                "name": "Senior Secured TL-A",
                "tranche_type": "Term Loan A",
                "size_pct": 0.25,
                "size_representative": "$250M",
                "typical_spread_bps": 325,
                "all_in_rate": "SOFR + 325 = ~8.6%",
                "maturity_years": 7,
                "covenant_structure": "Maintenance covenants (less strict than revolver)",
                "seniority": "First lien, same-day basis as revolver",
                "recovery_in_default": 0.92,
                "typical_holders": "Banks, credit funds",
                "color": "#10B981",  # Green
                "icon": "shield"
            },
            {
                "rank": 3,
                "name": "Senior Secured TL-B (Covenant-Lite)",
                "tranche_type": "Term Loan B",
                "size_pct": 0.35,
                "size_representative": "$350M",
                "typical_spread_bps": 425,
                "all_in_rate": "SOFR + 425 = ~9.6%",
                "maturity_years": 8,
                "covenant_structure": "NO maintenance covenants (only financial reporting)",
                "seniority": "First lien, but often second-day basis or cash sweep subordination",
                "recovery_in_default": 0.85,
                "typical_holders": "CLO equity, direct lenders, hedge funds",
                "color": "#F59E0B",  # Amber
                "icon": "alert-circle"
            },
            {
                "rank": 4,
                "name": "Second Lien / PIK Lender",
                "tranche_type": "Term Loan / Secured Notes",
                "size_pct": 0.15,
                "size_representative": "$150M",
                "typical_spread_bps": 600,
                "all_in_rate": "SOFR + 600 = ~11.3% (or 12% PIK toggle)",
                "maturity_years": 9,
                "covenant_structure": "Minimal; if cash troubled, payment-in-kind (PIK) toggle allows compounding interest",
                "seniority": "Second lien (subordinated to TL-A/B)",
                "recovery_in_default": 0.45,
                "typical_holders": "Unitranche funds, BDCs, direct credit investors",
                "color": "#DC2626",  # Red
                "icon": "alert-triangle"
            },
            {
                "rank": 5,
                "name": "Preferred Equity / Mezz",
                "tranche_type": "Preferred Stock / Mezzanine",
                "size_pct": 0.05,
                "size_representative": "$50M",
                "typical_spread_bps": None,
                "all_in_rate": "10-12% coupon",
                "maturity_years": 10,
                "covenant_structure": "Dividend gating (suspended if covenant breach)",
                "seniority": "Subordinated to all debt",
                "recovery_in_default": 0.15,
                "typical_holders": "Growth funds, co-invest sponsors",
                "color": "#8B5CF6",  # Violet
                "icon": "flag"
            },
            {
                "rank": 6,
                "name": "Common Equity (PE Fund)",
                "tranche_type": "Equity",
                "size_pct": 0.05,
                "size_representative": "$50M",
                "typical_spread_bps": None,
                "all_in_rate": "Target: 20-30%+ IRR (average 18-25% across fund)",
                "maturity_years": 5.5,  # Typical hold period
                "covenant_structure": "N/A (equity holder)",
                "seniority": "Last (residual claimant)",
                "recovery_in_default": 0.00,  # Wipes out first
                "typical_holders": "PE fund LPs receive distributions",
                "color": "#059669",  # Dark green
                "icon": "trending-up"
            }
        ],
        "default_waterfall": {
            "description": "In a restructuring, losses cascade down the capital stack",
            "scenario": "$650M asset value (65% recovery on $1B original purchase price + growth)",
            "steps": [
                {
                    "tranche": "Senior Secured Revolving Credit",
                    "amount_owed": 75_000_000,
                    "amount_recovered": 75_000_000,
                    "recovery_rate": 1.00,
                    "impact": "Fully recovers"
                },
                {
                    "tranche": "Senior Secured TL-A",
                    "amount_owed": 250_000_000,
                    "amount_recovered": 250_000_000,
                    "recovery_rate": 1.00,
                    "impact": "Fully recovers"
                },
                {
                    "tranche": "Senior Secured TL-B",
                    "amount_owed": 350_000_000,
                    "amount_recovered": 325_000_000,  # Partial recovery
                    "recovery_rate": 0.93,
                    "impact": "~93% recovery ($25M loss)"
                },
                {
                    "tranche": "Second Lien / PIK",
                    "amount_owed": 150_000_000,
                    "amount_recovered": 0,  # Wipes out
                    "recovery_rate": 0.00,
                    "impact": "Total loss"
                },
                {
                    "tranche": "Preferred Equity",
                    "amount_owed": 50_000_000,
                    "amount_recovered": 0,
                    "recovery_rate": 0.00,
                    "impact": "Total loss"
                },
                {
                    "tranche": "Common Equity (PE Fund)",
                    "amount_owed": 50_000_000,
                    "amount_recovered": 0,
                    "recovery_rate": 0.00,
                    "impact": "Total loss"
                }
            ]
        }
    }
    
    return debt_structure


def build_ebitda_bridge() -> Dict[str, Any]:
    """
    Generate EBITDA bridge showing value creation attribution.
    
    Typical PE return decomposition (2010s-2020s):
    - Multiple expansion: ~40-60% of returns
    - Revenue growth: ~15-25%
    - Margin expansion: ~15-25%
    - Leverage paydown / EBITDA growth: ~10-15%
    """
    
    # Sample company scenario
    entry_ebitda = 100_000_000  # $100M entry EBITDA
    entry_multiple = 10.0  # 10x EBITDA paid at entry
    entry_value = entry_ebitda * entry_multiple
    
    # 5-year hold assumptions
    years_held = 5
    revenue_growth_cagr = 0.08  # 8% revenue CAGR
    margin_expansion_bps = 150  # 150 bps improvement in EBITDA margin
    
    exit_multiple = 12.0  # Sold at 12x (0.5x expansion vs entry)
    exit_ebitda = entry_ebitda * (1 + revenue_growth_cagr) ** years_held
    exit_value = exit_ebitda * exit_multiple
    
    # Leverage paydown
    entry_leverage = 5.0  # 5x debt/EBITDA at entry
    entry_debt = entry_ebitda * entry_leverage
    exit_leverage = 3.5  # De-levered to 3.5x
    exit_debt = exit_ebitda * exit_leverage
    debt_paydown = entry_debt - exit_debt
    
    # Return calculation
    equity_invested = entry_value / 2.5  # Assume 40% equity funded, 60% debt
    equity_realized = exit_value - exit_debt  # Equity value after debt payoff
    moic = equity_realized / equity_invested  # Money multiple
    irr = (moic ** (1 / years_held) - 1) * 100  # Simplified IRR
    
    # Decompose exits value growth
    value_from_ebitda_growth = (exit_ebitda - entry_ebitda) * entry_multiple
    value_from_multiple_expansion = entry_ebitda * (exit_multiple - entry_multiple)
    total_value_created = value_from_ebitda_growth + value_from_multiple_expansion
    
    bridge = {
        "metadata": {
            "generated": datetime.now().isoformat(),
            "description": "Value creation attribution in a typical PE-backed company over 5-year hold period",
            "source": "Axelson et al., Kaplan & Strömberg, NBER working papers; SEC filings",
            "key_finding": "In 2010s, ~60% of PE returns came from multiple expansion (market-driven), not operational improvement",
            "scenario": {
                "company": "Unnamed $100M EBITDA industrial services company",
                "entry_year": 2019,
                "exit_year": 2024,
                "hold_period_years": years_held
            }
        },
        "entry_snapshot": {
            "revenue_estimated": entry_ebitda * 5.5,  # Assume 4.5-6x revenue/EBITDA
            "ebitda": entry_ebitda,
            "ebitda_margin_pct": (entry_ebitda / (entry_ebitda * 5.5)) * 100,
            "purchase_price": entry_value,
            "purchase_multiple_ebitda": entry_multiple,
            "debt_raised": entry_debt,
            "leverage_multiple": entry_leverage,
            "equity_invested": equity_invested
        },
        "exit_snapshot": {
            "revenue_estimated": exit_ebitda * 5.8,  # Slightly higher revenue multiple
            "ebitda": exit_ebitda,
            "ebitda_margin_pct": (exit_ebitda / (exit_ebitda * 5.8)) * 100 + (margin_expansion_bps / 100),
            "sale_price": exit_value,
            "sale_multiple_ebitda": exit_multiple,
            "debt_repaid": exit_debt,
            "leverage_multiple_exit": exit_leverage,
            "equity_value": equity_realized
        },
        "value_creation_waterfall": [
            {
                "step": 1,
                "driver": "EBITDA Growth",
                "amount": value_from_ebitda_growth,
                "pct_of_total": (value_from_ebitda_growth / total_value_created) * 100 if total_value_created > 0 else 0,
                "description": f"8% annual revenue growth + margin management → EBITDA grows {(exit_ebitda / entry_ebitda - 1) * 100:.1f}%",
                "color": "#2563EB"  # Blue
            },
            {
                "step": 2,
                "driver": "Multiple Expansion",
                "amount": value_from_multiple_expansion,
                "pct_of_total": (value_from_multiple_expansion / total_value_created) * 100 if total_value_created > 0 else 0,
                "description": f"Market sentiment shift: {entry_multiple}x → {exit_multiple}x (not operational improvement)",
                "color": "#059669",  # Green
                "note": "This is market-driven, not value-created by PE firm"
            },
            {
                "step": 3,
                "driver": "Leverage Paydown",
                "amount": debt_paydown,
                "pct_of_total_debt_reduction": ((entry_debt - exit_debt) / entry_debt) * 100,
                "description": f"Debt reduced {entry_leverage}x → {exit_leverage}x, freeing up {debt_paydown / 1_000_000:.0f}M for equity holders",
                "color": "#7C3AED"  # Violet
            }
        ],
        "equity_returns": {
            "equity_invested": equity_invested,
            "equity_realized": equity_realized,
            "profit": equity_realized - equity_invested,
            "moic": moic,
            "irr_pct": irr,
            "fee_impact": {
                "management_fees_5yr": equity_invested * 0.02 * years_held,  # 2% annually on invested capital
                "carried_interest_pct": 20,
                "net_carry_on_profit": (equity_realized - equity_invested) * 0.20,
                "note": "Typical GP takes 20% carry (far share of this upside)"
            }
        },
        "comparative_benchmark": {
            "s_p_500_cagr_same_period": 0.12,  # 12% CAGR 2019-2024
            "s_p_500_moic": (1.12) ** years_held,
            "pe_fund_moic": moic,
            "outperformance_moic": moic - (1.12) ** years_held,
            "note": "This hypothetical PE return beats public markets, but is representative only during favorable multiple environments"
        }
    }
    
    return bridge


def main():
    """Generate all LBO data files."""
    
    print("=" * 70)
    print("BUILDING LBO DATA FOR ACT 2: ANATOMY OF A BUYOUT")
    print("=" * 70)
    
    # Build datasets
    datasets = {
        "lbo_waterfall": build_lbo_waterfall(),
        "debt_structure": build_debt_structure(),
        "ebitda_bridge": build_ebitda_bridge(),
    }
    
    # Write JSON files
    for name, data in datasets.items():
        filepath = os.path.join(OUTPUT_DIR, f"{name}.json")
        with open(filepath, "w") as f:
            json.dump(data, f, indent=2)
        print(f"✓ Written: {filepath}")
        print(f"  Metadata: {data['metadata']['description']}")
        print()
    
    # Create manifest for validation
    manifest = {
        "generated": datetime.now().isoformat(),
        "act": "Act 2: Anatomy of a Buyout",
        "datasets": list(datasets.keys()),
        "total_files": len(datasets),
        "output_directory": OUTPUT_DIR
    }
    
    manifest_path = os.path.join(OUTPUT_DIR, "_act2_manifest.json")
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"✓ Written: {manifest_path}")
    
    print("=" * 70)
    print(f"SUCCESS: Generated {len(datasets)} datasets for Act 2")
    print("=" * 70)


if __name__ == "__main__":
    main()
