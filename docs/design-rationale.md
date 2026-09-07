# Design rationale

Why the interface looks the way it does. Three directions were explored
before building; this records what they were, which one was chosen, and how
it changed once it met real content.

## The problem

Someone buying a house abroad is making the largest purchase of their life
in a legal system they do not know, in a language they may not read, with
the only professional in the room — the seller's agent — incentivised
against them. The interface has to carry weight: it is asking people to
trust numbers enough to act on them.

That ruled out the two obvious registers. A consumer property-portal look
(large photography, soft cards, aspirational copy) reads as marketing, and
marketing is what the buyer is trying to see past. A pure analytics look
(dense tables, no imagery) ignores that people choose houses emotionally
and then justify the choice with data.

## Directions explored

**Cartographic modernism.** Swiss typographic tradition crossed with data
journalism — near-black base, a single vivid accent used only for alerts
and calls to action, maximum data-ink, typography as the main navigational
cue. Maps as full-bleed canvases rather than boxed widgets.

*Rejected:* the discipline that makes this work on a terminal fights the
photography. Property listings are half image, and a layout built to
maximise data-ink has nowhere good to put them.

**Warm brutalism.** Visible structure, thick borders, warm materials —
cream, charcoal, terracotta, sage — with confidence meters rendered as
hand-drawn SVG and AI suggestions styled as sticky notes.

*Rejected:* the informality undercuts the content. Hand-drawn confidence
indicators on a €2.7M valuation invite the reader to discount it, which is
the opposite of what the numbers need.

**Glass observatory.** Layered transparency over a dark base, with the map
as the deepest layer and analysis panels floating above it. Status encoded
by luminance — a property's standing readable before any label is.

*Chosen.* The depth model matches how the data is actually consumed:
location as persistent context, analysis layered over it. Dark surfaces let
property photography carry colour without competing with the chrome, and
luminance-encoded status survives being glanced at.

## What was actually built

The implemented theme, "Obsidian & Gold", is the glass direction after
contact with real content. Two things changed.

The electric teal accent went. Against warm property photography it read as
a software product rather than a considered one, so the accent became a
warm gold (`oklch(0.76 0.10 70)`) — close enough to the imagery to sit with
it, bright enough to carry calls to action on a near-black ground
(`oklch(0.13 0.005 260)`).

Heavy glass blur went too. It costs paint performance on long scrolling
lists and, at the panel densities this application actually reaches, it
made numbers harder to read. Depth is now carried by surface elevation —
background, card, popover as three distinct steps — rather than by
transparency.

Semantic colour is deliberately narrow: green for favourable, blue for
neutral information, rose for risk. Nothing else in the interface is
allowed to be saturated, so a coloured element always means something.

Type splits three ways by job. Playfair Display for display headings, where
the serif signals editorial confidence. Inter for interface text. JetBrains
Mono for every figure — prices, areas, scores, percentages — so digits
align in tables and a number is always recognisable as a number.

## What this costs

The theme is dark-first and was designed that way; a light theme exists but
gets less attention. Gold on near-black clears WCAG AA for body text, but
the dimmed gold variants used for borders and inactive states sit below AA
for text and are only used non-textually. Any new text on those surfaces
needs re-checking rather than assuming the token is safe.
