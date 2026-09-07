// ============================================================
// Knowledge Base — Portuguese Real Estate Seed Content
// This serves as the initial knowledge base for the AI assistant.
// Later this will be replaced by a RAG system with vector DB.
// ============================================================

export interface KnowledgeEntry {
  category: string;
  title: string;
  content: string;
}

export const knowledgeBase: KnowledgeEntry[] = [
  // ─── Buying Process ──────────────────────────────────────
  {
    category: "buying_process",
    title: "Steps to Buy Property in Portugal",
    content: `The property buying process in Portugal typically follows these steps:

1. **Property Search & Selection**: Browse listings on platforms like Idealista, Imovirtual, or work with a buyer's agent.
2. **Property Analysis**: Evaluate the property's condition, location, legal status, and market value. Check the Caderneta Predial (property registry) and Certidão Permanente (land registry certificate).
3. **Obtain NIF (Tax Number)**: Foreign buyers must obtain a Portuguese tax identification number (NIF/Número de Identificação Fiscal). This can be done at a local tax office (Finanças) or through a fiscal representative.
4. **Due Diligence**: Verify property ownership, check for liens or encumbrances, review the Licença de Utilização (usage license), and confirm the property's legal status.
5. **Make an Offer**: Submit a formal offer. In Portugal, verbal offers are common but not legally binding. Only written contracts are enforceable.
6. **Promissory Contract (CPCV)**: Sign the Contrato de Promessa de Compra e Venda. This is a binding agreement where the buyer typically pays a 10-30% deposit. If the buyer withdraws, they lose the deposit. If the seller withdraws, they must return double the deposit.
7. **Final Deed (Escritura)**: The final purchase deed is signed at a notary office (Cartório Notarial). The remaining balance is paid, and ownership is officially transferred.
8. **Registration**: Register the property at the Land Registry (Conservatória do Registo Predial) and update the tax records at Finanças.

The entire process typically takes 1-3 months from offer to completion.`,
  },
  {
    category: "buying_process",
    title: "Role of a Buyer's Agent in Portugal",
    content: `A buyer's agent works exclusively for the buyer, unlike traditional real estate agents who represent the seller. Key benefits:

- **Price Negotiation**: Buyer's agents negotiate the best possible price. Their commission is often based on the savings achieved, aligning their interests with the buyer's.
- **Market Knowledge**: Deep understanding of local market conditions, fair pricing, and emerging opportunities.
- **Due Diligence**: They handle property verification, legal checks, and identify potential issues before purchase.
- **Access to Off-Market Properties**: Buyer's agents often have access to properties not publicly listed.
- **Language & Cultural Bridge**: Essential for foreign buyers navigating the Portuguese system.
- **Cost Savings**: Some buyer's agents charge commission based on the savings achieved through negotiation, so the buyer pays only when they save money.`,
  },

  // ─── Taxes & Costs ───────────────────────────────────────
  {
    category: "taxes",
    title: "IMT (Property Transfer Tax) in Portugal",
    content: `IMT (Imposto Municipal sobre Transmissões Onerosas de Imóveis) is the property transfer tax paid by the buyer. Rates for permanent residence (continental Portugal):

| Property Value | Rate | Deduction |
|---|---|---|
| Up to €101,917 | 0% | €0 |
| €101,917 – €139,412 | 2% | €2,038.34 |
| €139,412 – €190,086 | 5% | €6,220.70 |
| €190,086 – €316,772 | 7% | €10,022.42 |
| €316,772 – €633,453 | 8% | €13,189.14 |
| €633,453 – €1,102,920 | 6% (single rate) | — |
| Above €1,102,920 | 7.5% (single rate) | — |

For secondary residences or investment properties, rates are higher (starting at 1% for values up to €101,917, going up to 7.5%).

For properties in the Azores or Madeira, rates are reduced by approximately 20%.

IMT is paid before the deed signing (Escritura) at a tax office or online through the Portal das Finanças.`,
  },
  {
    category: "taxes",
    title: "Stamp Duty (Imposto de Selo)",
    content: `Stamp Duty (Imposto de Selo) is charged at a flat rate of **0.8%** of the property purchase price or the tax assessed value (Valor Patrimonial Tributário/VPT), whichever is higher.

For example, on a €300,000 property: Stamp Duty = €300,000 × 0.8% = **€2,400**.

If you take out a mortgage, an additional stamp duty of **0.6%** is applied to the loan amount.

Stamp duty is paid at the same time as IMT, before the deed signing.`,
  },
  {
    category: "taxes",
    title: "Annual Property Tax (IMI)",
    content: `IMI (Imposto Municipal sobre Imóveis) is the annual property tax in Portugal. Rates vary by municipality:

- **Urban properties**: 0.3% to 0.45% of the VPT (tax assessed value)
- **Rural properties**: 0.8% of the VPT
- **Properties owned by entities in tax havens**: 7.5%

Most Algarve municipalities apply rates between 0.3% and 0.4%.

IMI is paid annually, typically in April (single payment for amounts under €100), or in two installments (April and November for amounts between €100-€500), or three installments (April, July, November for amounts over €500).

New property owners may be eligible for a 3-year IMI exemption if the property is their permanent residence and the VPT does not exceed €125,000.`,
  },
  {
    category: "taxes",
    title: "Total Buying Costs Breakdown",
    content: `When buying property in Portugal, expect the following costs on top of the purchase price:

- **IMT (Property Transfer Tax)**: 0-7.5% depending on value and purpose
- **Stamp Duty**: 0.8% of purchase price
- **Notary Fees**: €500-€1,500 for the deed (Escritura)
- **Land Registry**: €250-€400 for property registration
- **Legal Fees**: 1-2% of purchase price (if using a lawyer, highly recommended)
- **Buyer's Agent Fee**: Varies — commonly a flat fee, a percentage of the purchase price, or a share of the negotiated savings
- **Energy Certificate**: €150-€300 (if not already available)
- **Mortgage Costs**: If applicable — bank valuation (€200-€400), stamp duty on loan (0.6%), and arrangement fees (0.5-1%)

**Total additional costs typically range from 6-10% of the purchase price** for a primary residence, or 8-12% for investment properties (due to higher IMT rates).`,
  },

  // ─── Energy Certificates ─────────────────────────────────
  {
    category: "energy_certificates",
    title: "Energy Performance Certificates (EPC) in Portugal",
    content: `All properties for sale or rent in Portugal must have a valid Energy Performance Certificate (Certificado Energético). Ratings range from A+ (most efficient) to F (least efficient).

**Rating Scale:**
- **A+ / A**: Highly efficient, modern construction with excellent insulation, solar panels, heat pumps
- **B / B-**: Good efficiency, typically newer buildings (post-2006) or well-renovated properties
- **C**: Average efficiency, common in buildings from 1990s-2000s
- **D**: Below average, typical of older buildings with some improvements
- **E / F**: Poor efficiency, older buildings without renovation, single-glazed windows, no insulation

**Impact on Value:**
Properties with better energy ratings command higher prices and lower running costs. A property rated A vs F can save €1,000-€3,000/year in energy costs.

**Renovation Incentives:**
Portugal offers tax incentives for energy-efficient renovations, including reduced VAT (6% instead of 23%) on renovation works and potential IMI reductions for improved energy ratings.

The certificate is valid for 10 years and must be obtained from a certified energy assessor (Perito Qualificado).`,
  },

  // ─── Golden Visa & Residency ─────────────────────────────
  {
    category: "residency",
    title: "Golden Visa Program (2024 Update)",
    content: `Portugal's Golden Visa program has undergone significant changes. As of 2023, **real estate investment is no longer eligible** for the Golden Visa. However, other investment routes remain:

**Current eligible investments:**
- **Fund investment**: Minimum €500,000 in qualifying Portuguese investment funds
- **Capital transfer**: Minimum €1,500,000 transferred to Portugal
- **Company creation**: Creating a company with at least 10 jobs
- **Research/cultural**: €500,000 contribution to scientific research or cultural heritage

**For those who already have property-based Golden Visas:**
- Existing visas can be renewed under the old rules
- The minimum stay requirement remains: 7 days in the first year, 14 days in subsequent two-year periods

**Alternative residency options for property buyers:**
- **D7 Visa (Passive Income Visa)**: For retirees or those with passive income. Requires proof of regular income (pension, investments, rental income). Minimum ~€760/month for a single applicant.
- **Digital Nomad Visa**: For remote workers earning at least 4x the Portuguese minimum wage (~€3,040/month).
- **NHR (Non-Habitual Resident) Tax Regime**: 10-year special tax status with flat 20% income tax on Portuguese-sourced income and potential tax exemptions on foreign income. Note: NHR has been reformed — new applicants from 2024 have different conditions.`,
  },

  // ─── Algarve Neighborhoods ───────────────────────────────
  {
    category: "neighborhoods",
    title: "Vilamoura — Luxury Marina Living",
    content: `Vilamoura is one of the Algarve's most prestigious areas, centered around its iconic marina.

**Character**: Upscale resort town with international atmosphere. Popular with British, German, and Scandinavian expats.

**Property Market**: Average prices €3,000-€5,000/m² for apartments near the marina. Luxury villas can reach €8,000+/m². Strong rental yields (4-6% gross) due to year-round tourism.

**Amenities**: 5 championship golf courses (including the famous Old Course), full-service marina with 1,000+ berths, casino, international restaurants, Falesia Beach.

**Transport**: 25 minutes from Faro Airport. Good road connections via A22/EN125.

**Investment Outlook**: Stable appreciation (3-5% annually). High demand for short-term rentals. New developments in Vilamoura World expanding the area.

**Best For**: Golf enthusiasts, marina lifestyle, luxury living, strong rental income.`,
  },
  {
    category: "neighborhoods",
    title: "Lagos — Historic Charm & Beach Life",
    content: `Lagos combines rich history with stunning coastline, making it one of the Algarve's most desirable towns.

**Character**: Authentic Portuguese town with a lively old center, cobblestone streets, and dramatic cliff-top beaches. Popular with younger expats and digital nomads.

**Property Market**: Average prices €2,500-€4,000/m² in the old town. New developments on the outskirts at €2,000-€3,000/m². Villas with sea views command premium prices.

**Amenities**: Historic old town with restaurants and bars, Ponta da Piedade (iconic rock formations), Meia Praia (long sandy beach), marina, surf spots, cultural events.

**Transport**: 1 hour from Faro Airport. Train station with connections to Lisbon (3.5 hours). Good road connections.

**Investment Outlook**: Strong appreciation (4-7% annually in recent years). Growing digital nomad community driving year-round demand. Excellent short-term rental potential.

**Best For**: Beach lovers, history enthusiasts, digital nomads, year-round living.`,
  },
  {
    category: "neighborhoods",
    title: "Tavira — Authentic Eastern Algarve",
    content: `Tavira is often called the most beautiful town in the Algarve, known for its traditional architecture and relaxed pace of life.

**Character**: Authentic Portuguese town straddling the Gilão River. Less touristy than western Algarve. Strong local community with traditional markets and festivals.

**Property Market**: More affordable than western Algarve. Average prices €1,800-€3,000/m² in the historic center. Renovated townhouses are popular. Newer developments on the outskirts at €1,500-€2,500/m².

**Amenities**: Ilha de Tavira (barrier island beach), Roman bridge, traditional markets, Ria Formosa Natural Park, golf courses, thermal springs nearby.

**Transport**: 30 minutes from Faro Airport. Train station. Close to the Spanish border (30 min to Ayamonte).

**Investment Outlook**: Growing appreciation as buyers seek authenticity. Good value compared to western Algarve. Increasing interest from remote workers.

**Best For**: Those seeking authentic Portugal, nature lovers, budget-conscious buyers, retirees.`,
  },
  {
    category: "neighborhoods",
    title: "Quinta do Lago & Vale do Lobo — Ultra-Luxury",
    content: `The "Golden Triangle" of the Algarve, Quinta do Lago and Vale do Lobo represent the pinnacle of luxury living in southern Portugal.

**Character**: Exclusive gated communities with world-class amenities. International clientele including celebrities, business leaders, and high-net-worth individuals.

**Property Market**: Premium pricing — €5,000-€15,000/m² depending on location and views. Luxury villas range from €2M to €20M+. Apartments from €500K to €2M+.

**Amenities**: Championship golf courses (San Lorenzo, Quinta do Lago North/South), private beaches, tennis academies, fine dining, designer boutiques, The Campus (sports facility).

**Transport**: 20 minutes from Faro Airport. Private road networks within the estates.

**Investment Outlook**: Resilient values even during downturns. Strong demand from international buyers. Limited supply maintains exclusivity. Rental yields lower (2-3%) but capital appreciation is strong.

**Best For**: Ultra-luxury lifestyle, golf, privacy, long-term capital appreciation.`,
  },
  {
    category: "neighborhoods",
    title: "Faro — The Capital City",
    content: `Faro is the Algarve's capital and administrative center, offering a more urban Portuguese experience.

**Character**: Working city with a charming old town (Cidade Velha), university town atmosphere, and authentic Portuguese daily life. Less touristy than coastal towns.

**Property Market**: Most affordable major Algarve city. Average prices €1,500-€2,500/m² in the city center. New developments near the university and hospital areas.

**Amenities**: International airport, university (UAlg), central hospital, Ria Formosa Natural Park, old town with cathedral, marina, shopping centers, cultural venues.

**Transport**: Home to Faro Airport. Train station with direct connections to Lisbon (2.5 hours). Bus hub for the entire Algarve.

**Investment Outlook**: Strong rental demand from students and professionals. Growing appreciation as buyers discover value. Good long-term rental yields (5-7%).

**Best For**: Year-round residents, investors seeking rental income, those wanting urban amenities, budget-conscious buyers.`,
  },

  // ─── Market Intelligence ─────────────────────────────────
  {
    category: "market",
    title: "Algarve Property Market Overview 2024-2025",
    content: `The Algarve property market continues to show resilience and growth:

**Price Trends**: Average property prices in the Algarve have increased approximately 8-12% year-over-year. The western Algarve (Lagos, Portimão) has seen the strongest growth, while the eastern Algarve (Tavira, Olhão) offers better value.

**Demand Drivers**: International buyers (particularly British, German, French, American, and Brazilian) continue to drive demand. The digital nomad visa and favorable tax regimes attract remote workers.

**Supply Constraints**: Limited new construction due to licensing delays and environmental regulations. This supports price stability and appreciation.

**Rental Market**: Short-term rental (AL license) yields range from 4-8% gross depending on location. Long-term rental demand is increasing due to housing shortage.

**Key Metrics**:
- Average price/m² (Algarve): €2,800-€3,200
- Average days on market: 60-90 days
- Price negotiation margin: 5-15% below asking price
- Most active price segment: €200,000-€500,000

**Outlook**: Continued moderate growth expected (5-8% annually). The Algarve remains one of Europe's most attractive property markets due to climate, safety, tax benefits, and quality of life.`,
  },
  {
    category: "market",
    title: "Negotiation Strategies for Portuguese Property",
    content: `Effective negotiation strategies when buying property in Portugal:

**Understanding the Market**:
- Properties listed for 90+ days typically have more negotiation room (8-15%)
- New listings (under 30 days) have less room (2-5%)
- Multiple price reductions signal motivated sellers
- Properties with high days-on-market and multiple reductions can often be negotiated 10-20% below asking

**Negotiation Tactics**:
1. **Start with data**: Use comparable sales, price/m² analysis, and market trends to justify your offer
2. **Identify seller motivation**: Divorce, inheritance, relocation, and financial pressure create urgency
3. **Condition-based negotiation**: Use property inspection findings to negotiate repairs or price reductions
4. **Cash offers**: Cash buyers (no mortgage contingency) can negotiate 3-5% additional discount
5. **Quick closing**: Offering a fast completion timeline can be worth 2-3% to motivated sellers
6. **Bundle costs**: Negotiate for the seller to cover some closing costs or include furniture/appliances`,
  },

  // ─── Legal & Documentation ───────────────────────────────
  {
    category: "legal",
    title: "Essential Documents for Property Purchase",
    content: `Key documents required when buying property in Portugal:

**Seller Must Provide**:
- **Caderneta Predial**: Property tax document from Finanças showing the VPT (tax assessed value), property description, and registered owner
- **Certidão Permanente**: Land registry certificate confirming ownership, any mortgages, liens, or encumbrances
- **Licença de Utilização**: Usage license confirming the property can be used for its intended purpose (residential, commercial, etc.)
- **Ficha Técnica de Habitação**: Technical housing file (for properties built after 2004) with construction details
- **Certificado Energético**: Energy performance certificate (valid for 10 years)

**Buyer Must Obtain**:
- **NIF (Número de Identificação Fiscal)**: Portuguese tax number — mandatory for any property transaction
- **Portuguese Bank Account**: Required for mortgage applications and utility payments
- **Proof of Funds**: Bank statements or mortgage pre-approval

**At the Deed (Escritura)**:
- Valid passport/ID
- NIF documents
- Proof of IMT and Stamp Duty payment
- Signed CPCV (if applicable)
- All property documents listed above

A qualified lawyer (advogado) should review all documents before signing any contracts.`,
  },
  {
    category: "legal",
    title: "CPCV (Promissory Contract) Explained",
    content: `The Contrato de Promessa de Compra e Venda (CPCV) is the binding preliminary contract in Portuguese property transactions.

**Key Elements**:
- **Parties**: Full identification of buyer and seller
- **Property Description**: Detailed description matching the land registry
- **Price**: Agreed purchase price and payment schedule
- **Deposit**: Typically 10-30% of the purchase price (sinal)
- **Completion Date**: Deadline for the final deed (Escritura)
- **Conditions**: Any conditions precedent (mortgage approval, building permits, etc.)

**Legal Protections**:
- If the **buyer withdraws**: They lose the deposit (sinal)
- If the **seller withdraws**: They must return **double** the deposit to the buyer
- These penalties can be modified by mutual agreement in the contract

**Important Considerations**:
- The CPCV should be notarized for additional legal protection
- Include clauses for property inspection, mortgage contingency, and clear title verification
- Specify what happens with existing tenants, furniture, or ongoing works
- Set a reasonable completion timeline (typically 30-90 days)

Always have a lawyer review the CPCV before signing.`,
  },

  // ─── Mortgage & Financing ────────────────────────────────
  {
    category: "financing",
    title: "Mortgages for Foreign Buyers in Portugal",
    content: `Portuguese banks offer mortgages to foreign buyers, though conditions differ from residents:

**Typical Terms for Non-Residents**:
- **LTV (Loan-to-Value)**: Up to 70-80% for non-residents (vs 80-90% for residents)
- **Interest Rates**: Variable (Euribor + spread of 0.9-1.5%) or fixed (2.5-4% for 5-30 years)
- **Term**: Up to 30 years, but the loan must be repaid before the borrower turns 75-80
- **Minimum Income**: Banks typically require that mortgage payments don't exceed 30-35% of net income

**Required Documents**:
- Passport and NIF
- Proof of income (3-6 months payslips, tax returns, or company accounts)
- Bank statements (6-12 months)
- Employment contract or business registration
- Property valuation (arranged by the bank)
- Credit report from home country

**Major Banks Offering Foreign Mortgages**:
- Millennium BCP, Novo Banco, Santander Totta, CGD (Caixa Geral de Depósitos), BPI

**Costs**:
- Bank valuation: €200-€400
- Mortgage stamp duty: 0.6% of loan amount
- Arrangement fee: 0.5-1% of loan amount
- Life insurance: Required (can be from external provider)
- Property insurance: Required (multi-risk policy)

**Tips**: Get pre-approval before making offers. Compare rates from at least 3 banks. Consider using a mortgage broker who specializes in foreign buyers.`,
  },

];

/**
 * Get all knowledge base entries as a formatted string for the AI system prompt.
 * Groups entries by category for better context.
 */
export function getKnowledgeBaseContext(): string {
  const categories = new Map<string, KnowledgeEntry[]>();

  for (const entry of knowledgeBase) {
    const existing = categories.get(entry.category) || [];
    existing.push(entry);
    categories.set(entry.category, existing);
  }

  const categoryLabels: Record<string, string> = {
    buying_process: "Property Buying Process",
    taxes: "Taxes & Costs",
    energy_certificates: "Energy Certificates",
    residency: "Residency & Visa Programs",
    neighborhoods: "Algarve Neighborhoods",
    market: "Market Intelligence",
    legal: "Legal & Documentation",
    financing: "Mortgage & Financing",
  };

  let context = "## Portuguese Real Estate Knowledge Base\n\n";

  for (const [category, entries] of Array.from(categories)) {
    const label = categoryLabels[category] || category;
    context += `### ${label}\n\n`;
    for (const entry of entries) {
      context += `**${entry.title}**\n${entry.content}\n\n`;
    }
  }

  return context;
}

/**
 * Search the knowledge base for entries relevant to a query.
 * Simple keyword matching — will be replaced by vector search later.
 */
export function searchKnowledge(query: string, maxResults = 5): KnowledgeEntry[] {
  const queryLower = query.toLowerCase();
  const keywords = queryLower.split(/\s+/).filter((w) => w.length > 3);

  const scored = knowledgeBase.map((entry) => {
    const text = `${entry.title} ${entry.content} ${entry.category}`.toLowerCase();
    let score = 0;

    // Exact phrase match in title
    if (text.includes(queryLower)) score += 10;

    // Keyword matches
    for (const keyword of keywords) {
      if (entry.title.toLowerCase().includes(keyword)) score += 5;
      if (entry.content.toLowerCase().includes(keyword)) score += 2;
      if (entry.category.toLowerCase().includes(keyword)) score += 3;
    }

    return { entry, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map((s) => s.entry);
}
