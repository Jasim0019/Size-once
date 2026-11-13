# SizeOnce — Universal Size Profile & Amazon Affiliate Integration

> **"Medium here. Large there. Small everywhere else. Same person. Different size at every brand."**

SizeOnce is a single-page, scroll-driven marketing website and interactive sizing engine demo for a fashion universal size profile platform, equipped with real-time brand management and direct Amazon Associates affiliate monetization.

---

## ✦ Amazon Affiliate Monetization Integration

SizeOnce enables seamless affiliate monetization:

1. **Size-Calibrated Affiliate Outbound Links:**
   - Every brand card in Section 5 (*One Body, Many Sizes*) features a direct outbound link:
     `Shop [Brand] in Size [M] on Amazon ↗`
   - Section 6 (*Product Detail Page Mock*) features an integrated outbound buy button:
     `Shop on Amazon in Size [M] ([Brand]) ↗`
   - Outbound URLs are automatically formatted with search parameters for that brand and the shopper's recommended size:
     `https://www.amazon.in/s?k=[Brand]+apparel+size+[Size]&tag=[YOUR_TAG]`

2. **Affiliate Tag Manager (In-App & Code):**
   - **In-App:** In Section 5, an Amazon Associates toolbar lets you enter your tag (*e.g. `yourtag-20`*), choose your marketplace (*Amazon India, Amazon US, Amazon UK, Amazon Germany*), and click **Save Tag**. It persists automatically to `localStorage`.
   - **In Code:** In `app.js`, edit the `AMAZON_CONFIG` object:
     ```javascript
     const AMAZON_CONFIG = {
       associateTag: 'yourtag-20', // Your Amazon Associates Tracking ID
       domain: 'amazon.in'         // or 'amazon.com', 'amazon.co.uk', etc.
     };
     ```

3. **FTC & Amazon Compliance:**
   - All outbound links include `rel="noopener noreferrer sponsored"`.
   - The site footer contains the mandatory Amazon Associate disclosure:
     *“As an Amazon Associate, SizeOnce earns from qualifying purchases.”*

---

## ✦ Core Features & Design System

- **Dark, Minimal, Premium Aesthetic:** Near-black (`#0A0A0A`) background, `#111`–`#161616` cards, 1px thin borders, 12–16px rounded corners, grotesque tight-tracked typography, thin outline vector icons, and an acid-yellow (`#E6F200`) accent used strictly for hero emphasis words.
- **Interactive Sizing Mannequin (Section 3):** Sliders and numeric inputs for Height, Chest, Waist, and Shoulders. Real-time SVG mannequin body part highlighting. Unit switcher (**CM / INCHES**).
- **Size Matching Engine (Section 4):** Diagram showing 4 input metrics streaming into the inference engine and branching out to 3 brand pattern blocks with live active row highlighting.
- **Custom Brand Management (Section 5):**
  - **Delete any brand** (including defaults like Zara, H&M, Brand C) with instant updates.
  - **Quick-Add popular brands** (*Zara, H&M, Brand C, Uniqlo, Nike, Levi's, Mango, ASOS, COS*).
  - **Add custom brands** with European Tailored, Fitted Athletic, Relaxed Oversized, or Generous Classic blocks.
  - LocalStorage persistence.
- **PDP Store Simulation (Section 6):** Switch active storefronts to preview how size recommendation banners adapt across brands.
- **B2B Business Model Flow (Section 7):** Vertical flow showing fashion brands paying for integration while shoppers receive size guidance for free.
- **Returns Reduction & Outcome (Section 8):** Key metrics and statements on eliminating size-related returns.
- **Dual CTA Forms (Section 9):** Brand demo request and shopper early access waitlist forms.

---

## ✦ Running Locally

```bash
# Start the local HTTP server
npm start

# Run verification tests
npm test
```

Visit in your browser:
**[http://127.0.0.1:3000/](http://127.0.0.1:3000/)**
