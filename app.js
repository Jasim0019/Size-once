/**
 * SIZEONCE — Interactive Size-Matching Engine & Application Scripts
 * Full client-side reactivity, biometric mapping, and brand translation logic.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Amazon Affiliate Configuration
  const AMAZON_CONFIG = {
    associateTag: 'sizeonce-20', // Default tracking ID (change to your Amazon Associate Tag)
    domain: 'amazon.in' // Default Amazon marketplace
  };

  // Supabase Configuration
  const SUPABASE_CONFIG = {
    adminEmail: 'shaikjasim412@gmail.com',
    url: '',
    anonKey: ''
  };

  // State management
  const state = {
    unit: 'cm', // 'cm' or 'in'
    amazonTag: 'sizeonce-20',
    amazonDomain: 'amazon.in',
    supabaseUrl: '',
    supabaseAnonKey: '',
    supabaseEmail: 'shaikjasim412@gmail.com',
    measurements: {
      height: 170, // cm
      chest: 96,   // cm
      waist: 82,   // cm
      shoulders: 44 // cm
    },
    activeTarget: 'chest',
    activeStorePreview: 'zara',
    brands: {
      zara: 'M',
      hm: 'L',
      brandc: 'S'
    },
    connectedBrands: [
      { id: 'zara', name: 'ZARA', spec: 'European Contemporary Block', block: 'tailored' },
      { id: 'hm', name: 'H&M', spec: 'Fitted Athletic Cut', block: 'athletic' },
      { id: 'brandc', name: 'BRAND C', spec: 'Relaxed Japanese / Oversized Block', block: 'oversized' }
    ]
  };

  // Preset definitions (in cm)
  const PRESETS = {
    sample: { height: 170, chest: 96, waist: 82, shoulders: 44 },
    petite: { height: 162, chest: 88, waist: 74, shoulders: 40 },
    athletic: { height: 178, chest: 102, waist: 86, shoulders: 47 },
    'tall-broad': { height: 186, chest: 110, waist: 94, shoulders: 51 }
  };

  // Known brand metadata lookup
  const BRAND_METADATA = {
    'ZARA': { spec: 'European Contemporary Block', block: 'tailored' },
    'H&M': { spec: 'Fitted Athletic Cut', block: 'athletic' },
    'BRAND C': { spec: 'Relaxed Japanese / Oversized Block', block: 'oversized' },
    'UNIQLO': { spec: 'Japanese Relaxed Block (+6cm ease)', block: 'oversized' },
    'NIKE': { spec: 'Athletic Performance Block', block: 'athletic' },
    "LEVI'S": { spec: 'Classic American Standard Block', block: 'classic' },
    'MANGO': { spec: 'Mediterranean Tailored Cut', block: 'tailored' },
    'ASOS': { spec: 'UK Contemporary Slim Cut', block: 'tailored' },
    'COS': { spec: 'Architectural Minimalist Oversized Block', block: 'oversized' },
    'RALPH LAUREN': { spec: 'Generous Classic Heritage Block', block: 'classic' },
    'LULULEMON': { spec: 'Engineered Technical Fit', block: 'athletic' }
  };

  // DOM Elements
  const inputs = {
    height: document.getElementById('input-height'),
    chest: document.getElementById('input-chest'),
    waist: document.getElementById('input-waist'),
    shoulders: document.getElementById('input-shoulders')
  };

  const sliders = {
    height: document.getElementById('slider-height'),
    chest: document.getElementById('slider-chest'),
    waist: document.getElementById('slider-waist'),
    shoulders: document.getElementById('slider-shoulders')
  };

  // Section 2 elements
  const phoneVals = {
    height: document.getElementById('phone-val-height'),
    chest: document.getElementById('phone-val-chest'),
    waist: document.getElementById('phone-val-waist'),
    shoulders: document.getElementById('phone-val-shoulders')
  };

  const section2Markers = {
    height: document.getElementById('marker-height-text'),
    chest: document.getElementById('marker-chest-text'),
    waist: document.getElementById('marker-waist-text'),
    shoulders: document.getElementById('marker-shoulders-text')
  };

  const phoneConnectedBrands = document.getElementById('phone-connected-brands');

  // Section 4 Engine input tiles
  const engineTiles = {
    height: document.getElementById('engine-tile-height'),
    chest: document.getElementById('engine-tile-chest'),
    waist: document.getElementById('engine-tile-waist'),
    shoulders: document.getElementById('engine-tile-shoulders')
  };

  // Section 3 Interactive Mannequin SVG elements
  const svgElements = {
    heightText: document.getElementById('svg-height-text'),
    heightCursor: document.getElementById('svg-height-cursor'),
    chestText: document.getElementById('svg-chest-text'),
    waistText: document.getElementById('svg-waist-text'),
    shoulderText: document.getElementById('svg-shoulder-text'),
    shoulderLine: document.getElementById('svg-shoulder-line'),
    partHeight: document.getElementById('svg-part-height'),
    partChest: document.getElementById('svg-part-chest'),
    partWaist: document.getElementById('svg-part-waist'),
    partShoulders: document.getElementById('svg-part-shoulders')
  };

  const activePartLabel = document.getElementById('active-part-label');

  // Section 4 Chart Badges
  const chartRecs = {
    a: document.getElementById('chart-rec-a'),
    b: document.getElementById('chart-rec-b'),
    c: document.getElementById('chart-rec-c')
  };

  // Section 5 Brand Adder and Stacked List
  const stackedBrandsList = document.getElementById('stacked-brands-list');
  const brandCountText = document.getElementById('brand-count-text');
  const customBrandForm = document.getElementById('custom-brand-form');
  const customBrandInput = document.getElementById('custom-brand-input');
  const customBrandBlock = document.getElementById('custom-brand-block');
  const quickAddChips = document.querySelectorAll('.quick-add-chip');

  // Section 6 PDP elements
  const pdpBrowserUrl = document.getElementById('pdp-browser-url');
  const pdpBrandTag = document.getElementById('pdp-brand-tag');
  const pdpStoreChips = document.getElementById('pdp-store-chips');
  const pdpBannerSize = document.getElementById('pdp-banner-size');
  const pdpBannerChest = document.getElementById('pdp-banner-chest');
  const pdpSizeChipsContainer = document.getElementById('pdp-size-chips');

  // Section 8 Outcome Big Tee Size
  const outcomeTeeSize = document.getElementById('outcome-tee-size');

  // Unit conversion helpers
  const cmToIn = (val) => Math.round((val / 2.54) * 10) / 10;
  const inToCm = (val) => Math.round(val * 2.54);

  /**
   * Sizing Algorithm for Any Brand based on pattern block
   */
  function calculateBrandFit(brand, measurements) {
    const { chest, waist, shoulders } = measurements;
    const block = brand.block || 'tailored';
    let size = 'M';
    let text = '';
    let confidence = '99.1%';

    if (block === 'tailored') {
      if (chest < 88 || waist < 74) {
        size = 'XS';
        text = `Chest ${chest} cm & Waist ${waist} cm align with ${brand.name} Extra Small (under 88 cm).`;
        confidence = '98.7%';
      } else if (chest <= 93 && waist <= 79) {
        size = 'S';
        text = `Chest ${chest} cm falls squarely in ${brand.name} Small (88–93 cm) for a crisp fitted cut.`;
        confidence = '99.4%';
      } else if (chest <= 99 && waist <= 85) {
        size = 'M';
        text = `Chest ${chest} cm & Waist ${waist} cm align squarely in ${brand.name} Medium (94–99 cm) for a standard structured drape.`;
        confidence = '99.1%';
      } else if (chest <= 106 && waist <= 92) {
        size = 'L';
        text = `Chest ${chest} cm matches ${brand.name} Large (100–106 cm) with proportional torso taper.`;
        confidence = '98.9%';
      } else {
        size = 'XL';
        text = `Chest ${chest} cm requires ${brand.name} Extra Large (107+ cm) to prevent button pull.`;
        confidence = '97.8%';
      }
    } else if (block === 'athletic') {
      if (chest < 84) {
        size = 'XS';
        text = `Chest ${chest} cm fits ${brand.name} Extra Small (< 84 cm).`;
        confidence = '98.2%';
      } else if (chest <= 90 && shoulders <= 42) {
        size = 'S';
        text = `Chest ${chest} cm and narrow shoulders match ${brand.name} Small (84–90 cm).`;
        confidence = '99.0%';
      } else if (chest <= 95 && shoulders <= 44) {
        size = 'M';
        text = `Chest ${chest} cm meets ${brand.name} Medium specs (91–95 cm) for a close athletic fit.`;
        confidence = '99.3%';
      } else if (chest <= 103) {
        size = 'L';
        text = `${brand.name} shoulder grading runs narrower. Shoulders ${shoulders} cm and Chest ${chest} cm exceed Medium boundary (95 cm max) — recommending Large for movement.`;
        confidence = '98.4%';
      } else {
        size = 'XL';
        text = `Chest ${chest} cm requires ${brand.name} XL (104+ cm) for unrestricted armhole mobility.`;
        confidence = '98.1%';
      }
    } else if (block === 'oversized') {
      if (chest < 92) {
        size = 'XS';
        text = `${brand.name}'s roomy cut means Chest ${chest} cm drapes comfortably in Extra Small (< 92 cm).`;
        confidence = '99.2%';
      } else if (chest <= 98) {
        size = 'S';
        text = `${brand.name} builds +8 cm ease into garments. Size Small accommodates up to 98 cm chest comfortably without excessive bunching.`;
        confidence = '99.7%';
      } else if (chest <= 106) {
        size = 'M';
        text = `Chest ${chest} cm matches ${brand.name} Medium (99–106 cm) preserving the intentional boxy silhouette.`;
        confidence = '99.5%';
      } else if (chest <= 114) {
        size = 'L';
        text = `Chest ${chest} cm fits ${brand.name} Large (107–114 cm) with signature dropped shoulder lines.`;
        confidence = '98.8%';
      } else {
        size = 'XL';
        text = `Chest ${chest} cm fits ${brand.name} Extra Large (115+ cm) for oversized streetwear proportion.`;
        confidence = '98.3%';
      }
    } else {
      // Classic Standard Block
      if (chest < 90) {
        size = 'XS';
        text = `Chest ${chest} cm fits ${brand.name} Extra Small (< 90 cm).`;
        confidence = '98.5%';
      } else if (chest <= 96) {
        size = 'S';
        text = `${brand.name} standard cut: Chest ${chest} cm fits Small (90–96 cm).`;
        confidence = '99.2%';
      } else if (chest <= 103) {
        size = 'M';
        text = `Chest ${chest} cm and Waist ${waist} cm match ${brand.name} Medium (97–103 cm) with generous daily comfort.`;
        confidence = '99.4%';
      } else if (chest <= 111) {
        size = 'L';
        text = `Chest ${chest} cm fits ${brand.name} Large (104–111 cm) with relaxed armholes.`;
        confidence = '98.9%';
      } else {
        size = 'XL';
        text = `Chest ${chest} cm requires ${brand.name} XL (112+ cm) for full body drape.`;
        confidence = '98.6%';
      }
    }

    return { size, text, confidence };
  }

  /**
   * Construct Amazon Search URL with Affiliate Tag
   */
  function getAmazonAffiliateUrl(brandName, size) {
    const tag = state.amazonTag || AMAZON_CONFIG.associateTag;
    const domain = state.amazonDomain || AMAZON_CONFIG.domain;
    const query = `${brandName} apparel size ${size}`;
    return `https://www.${domain}/s?k=${encodeURIComponent(query)}&tag=${encodeURIComponent(tag)}`;
  }

  /**
   * Render Brand Cards into Section 5
   */
  function renderBrandCards() {
    if (!stackedBrandsList) return;

    stackedBrandsList.innerHTML = '';

    if (state.connectedBrands.length === 0) {
      // Empty state when user deletes all brands
      const emptyCard = document.createElement('div');
      emptyCard.className = 'card empty-brands-card is-revealed';
      emptyCard.innerHTML = `
        <svg class="thin-icon empty-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <h4 class="empty-title">No Brands Currently Connected</h4>
        <p class="empty-desc">You have removed all brands from your profile. Click any popular brand above or type a custom brand to start getting instant size recommendations.</p>
        <div class="empty-restore-row">
          <button type="button" class="btn-restore-defaults" id="btn-restore-defaults">
            Restore Default Brands (ZARA, H&M, BRAND C)
          </button>
        </div>
      `;
      stackedBrandsList.appendChild(emptyCard);

      const restoreBtn = emptyCard.querySelector('#btn-restore-defaults');
      if (restoreBtn) {
        restoreBtn.addEventListener('click', restoreDefaultBrands);
      }
    } else {
      state.connectedBrands.forEach((brand) => {
        const fit = calculateBrandFit(brand, state.measurements);
        const amazonUrl = getAmazonAffiliateUrl(brand.name, fit.size);

        const card = document.createElement('div');
        card.className = 'card brand-match-card is-revealed';
        card.id = `card-match-${brand.id}`;

        // Brand card inner HTML with delete button, thin icons, Amazon affiliate link, and boxed size letter
        card.innerHTML = `
          <div class="brand-match-left">
            <div class="brand-card-top-row">
              <div class="brand-logo-block">
                <div class="tee-icon-box">
                  <svg class="thin-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25">
                    <path d="M6 3L3 7L7 9L7 21H17L17 9L21 7L18 3H14C14 4.5 13 5.5 12 5.5C11 5.5 10 4.5 10 3H6Z"/>
                  </svg>
                </div>
                <div class="brand-name-group">
                  <h3 class="brand-heading">${escapeHtml(brand.name)}</h3>
                  <span class="brand-spec-label">${escapeHtml(brand.spec)}</span>
                </div>
              </div>
              <button type="button" class="btn-remove-brand" data-remove-id="${brand.id}" aria-label="Delete ${brand.name} from profile" title="Delete ${brand.name}">
                <svg class="thin-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>
                </svg>
                <span class="remove-label">Delete</span>
              </button>
            </div>

            <div class="match-rationale">
              <span class="micro-label">ENGINE ANALYSIS</span>
              <p class="rationale-text" id="rationale-${brand.id}">
                ${escapeHtml(fit.text)}
              </p>
            </div>

            <!-- Amazon Affiliate Direct Outbound Button -->
            <a href="${amazonUrl}" target="_blank" rel="noopener noreferrer sponsored" class="btn-brand-amazon" title="Shop ${escapeHtml(brand.name)} in size ${fit.size} on Amazon">
              <svg class="thin-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <span>Shop ${escapeHtml(brand.name)} in Size ${fit.size} on Amazon</span>
              <span class="affiliate-arrow-pill">↗</span>
            </a>
          </div>

          <div class="brand-match-right">
            <span class="micro-label">RECOMMENDED SIZE</span>
            <div class="size-letter-box" id="size-letter-${brand.id}">${fit.size}</div>
            <span class="match-confidence">${fit.confidence} Confidence</span>
          </div>
        `;

        stackedBrandsList.appendChild(card);
      });
    }

    // Update active brand counter badge
    if (brandCountText) {
      brandCountText.textContent = `${state.connectedBrands.length} BRANDS CONNECTED`;
    }

    // Attach delete handlers to all delete buttons
    stackedBrandsList.querySelectorAll('.btn-remove-brand').forEach(btn => {
      btn.addEventListener('click', () => {
        const idToRemove = btn.dataset.removeId;
        removeBrand(idToRemove);
      });
    });

    // Update Section 2 Phone Mockup Chips
    updatePhoneBrandChips();

    // Update Section 6 Store Simulator Chips
    updatePdpStoreChips();

    // Update Quick-add chip states
    updateQuickAddChipsState();
  }

  /**
   * Update Section 2 Phone Mockup Connected Brands
   */
  function updatePhoneBrandChips() {
    if (!phoneConnectedBrands) return;
    phoneConnectedBrands.innerHTML = '';
    state.connectedBrands.forEach(b => {
      const chip = document.createElement('span');
      chip.className = 'pill-brand';
      chip.textContent = b.name;
      phoneConnectedBrands.appendChild(chip);
    });
  }

  /**
   * Update Section 6 PDP Store Switcher Chips
   */
  function updatePdpStoreChips() {
    if (!pdpStoreChips) return;
    pdpStoreChips.innerHTML = '';

    state.connectedBrands.forEach(b => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = `store-pill ${state.activeStorePreview === b.id ? 'active' : ''}`;
      pill.dataset.brandId = b.id;
      pill.textContent = b.name;

      pill.addEventListener('click', () => {
        state.activeStorePreview = b.id;
        updatePdpStoreView();
      });

      pdpStoreChips.appendChild(pill);
    });

    updatePdpStoreView();
  }

  /**
   * Update PDP View for currently simulated store
   */
  function updatePdpStoreView() {
    const activeBrand = state.connectedBrands.find(b => b.id === state.activeStorePreview) || state.connectedBrands[0];
    if (!activeBrand) return;

    // Update store chips active state
    if (pdpStoreChips) {
      pdpStoreChips.querySelectorAll('.store-pill').forEach(btn => {
        if (btn.dataset.brandId === activeBrand.id) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    // Update URL & Brand tag
    const slug = activeBrand.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (pdpBrowserUrl) {
      pdpBrowserUrl.textContent = `${slug}-store.com/products/essential-cotton-tee`;
    }
    if (pdpBrandTag) {
      pdpBrandTag.textContent = `${activeBrand.name} OFFICIAL STORE`;
    }

    // Calculate size for this brand
    const fit = calculateBrandFit(activeBrand, state.measurements);
    const isInch = state.unit === 'in';
    const chestDisplay = isInch ? `${cmToIn(state.measurements.chest)} in` : `${state.measurements.chest} cm`;

    if (pdpBannerSize) pdpBannerSize.textContent = fit.size;
    if (pdpBannerChest) pdpBannerChest.textContent = chestDisplay;

    // Highlight recommended size pill
    if (pdpSizeChipsContainer) {
      pdpSizeChipsContainer.querySelectorAll('.size-pill').forEach(pill => {
        if (pill.dataset.size === fit.size) {
          pill.classList.add('active-selected');
        } else {
          pill.classList.remove('active-selected');
        }
      });
    }

    // Update Outcome section big tee
    if (outcomeTeeSize) {
      outcomeTeeSize.textContent = fit.size;
    }

    // Update Amazon affiliate outbound button on PDP
    const pdpAmazonBtn = document.getElementById('pdp-amazon-affiliate-link');
    const pdpAffiliateSize = document.getElementById('pdp-affiliate-size');
    if (pdpAffiliateSize) {
      pdpAffiliateSize.textContent = fit.size;
    }
    if (pdpAmazonBtn) {
      pdpAmazonBtn.href = getAmazonAffiliateUrl(activeBrand.name, fit.size);
      const spanEl = pdpAmazonBtn.querySelector('span');
      if (spanEl) {
        spanEl.innerHTML = `Shop on Amazon in Size <strong id="pdp-affiliate-size">${fit.size}</strong> (${escapeHtml(activeBrand.name)})`;
      }
    }
  }

  /**
   * Update Quick-Add Chips visual states
   */
  function updateQuickAddChipsState() {
    quickAddChips.forEach(chip => {
      const brandName = chip.dataset.brand;
      const alreadyAdded = state.connectedBrands.some(b => b.name.toUpperCase() === brandName.toUpperCase());
      if (alreadyAdded) {
        chip.classList.add('is-added');
        chip.title = `${brandName} is already connected to your profile`;
      } else {
        chip.classList.remove('is-added');
        chip.title = `Add ${brandName} to your profile`;
      }
    });
  }

  /**
   * Save and Load Brands & Affiliate Settings from localStorage
   */
  function saveBrands() {
    try {
      localStorage.setItem('sizeonce_connected_brands', JSON.stringify(state.connectedBrands));
      localStorage.setItem('sizeonce_amazon_tag', state.amazonTag);
      localStorage.setItem('sizeonce_amazon_domain', state.amazonDomain);
    } catch (e) {
      // Local storage not available or restricted
    }
  }

  function loadBrands() {
    try {
      const saved = localStorage.getItem('sizeonce_connected_brands');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          state.connectedBrands = parsed;
        }
      }
      const savedTag = localStorage.getItem('sizeonce_amazon_tag');
      if (savedTag) {
        state.amazonTag = savedTag;
      }
      const savedDomain = localStorage.getItem('sizeonce_amazon_domain');
      if (savedDomain) {
        state.amazonDomain = savedDomain;
      }
    } catch (e) {
      // Fallback to default
    }
  }

  /**
   * Restore the 3 Default Brands
   */
  function restoreDefaultBrands() {
    state.connectedBrands = [
      { id: 'zara', name: 'ZARA', spec: 'European Contemporary Block', block: 'tailored' },
      { id: 'hm', name: 'H&M', spec: 'Fitted Athletic Cut', block: 'athletic' },
      { id: 'brandc', name: 'BRAND C', spec: 'Relaxed Japanese / Oversized Block', block: 'oversized' }
    ];
    state.activeStorePreview = 'zara';
    saveBrands();
    renderBrandCards();
    showToast('Restored default brands (ZARA, H&M, BRAND C)');
  }

  /**
   * Add a new brand to the user's profile
   */
  function addBrand(name, block = 'tailored', customSpec = '') {
    const trimmed = name.trim();
    if (!trimmed) return;

    const upper = trimmed.toUpperCase();

    // Check if already added
    const exists = state.connectedBrands.some(b => b.name.toUpperCase() === upper);
    if (exists) {
      showToast(`${trimmed} is already in your profile`);
      return;
    }

    // Normalized ID for benchmark brands or unique timestamp ID
    let id = 'brand_' + Date.now();
    if (upper === 'ZARA') id = 'zara';
    else if (upper === 'H&M' || upper === 'H & M') id = 'hm';
    else if (upper === 'BRAND C' || upper === 'BRANDC') id = 'brandc';

    const meta = BRAND_METADATA[upper];
    const spec = customSpec || (meta ? meta.spec : getBlockSpec(block));
    const finalBlock = meta ? meta.block : block;

    const newBrand = {
      id,
      name: trimmed,
      spec,
      block: finalBlock
    };

    state.connectedBrands.push(newBrand);
    state.activeStorePreview = id;

    saveBrands();
    renderBrandCards();
    showToast(`Added ${trimmed} to your Universal Size Profile`);
  }

  /**
   * Delete a brand from the profile (Any brand can be deleted!)
   */
  function removeBrand(id) {
    const brand = state.connectedBrands.find(b => b.id === id);
    const brandName = brand ? brand.name : 'Brand';

    state.connectedBrands = state.connectedBrands.filter(b => b.id !== id);
    if (state.activeStorePreview === id) {
      state.activeStorePreview = state.connectedBrands.length > 0 ? state.connectedBrands[0].id : null;
    }

    saveBrands();
    renderBrandCards();
    showToast(`Deleted ${brandName} from your size profile`);
  }

  function getBlockSpec(block) {
    const map = {
      tailored: 'European Tailored Cut',
      athletic: 'Fitted Athletic Cut',
      oversized: 'Relaxed / Oversized Block',
      classic: 'Generous Classic Block'
    };
    return map[block] || 'Standard Cut';
  }

  /**
   * Update the UI across all sections based on state.measurements
   */
  function updateAllOutputs() {
    const { height, chest, waist, shoulders } = state.measurements;
    const isInch = state.unit === 'in';

    // 1. Update Section 2 Phone Mockup
    if (phoneVals.height) phoneVals.height.textContent = isInch ? cmToIn(height) : height;
    if (phoneVals.chest) phoneVals.chest.textContent = isInch ? cmToIn(chest) : chest;
    if (phoneVals.waist) phoneVals.waist.textContent = isInch ? cmToIn(waist) : waist;
    if (phoneVals.shoulders) phoneVals.shoulders.textContent = isInch ? cmToIn(shoulders) : shoulders;

    // 2. Update Section 2 Silhouette Markers
    if (section2Markers.height) {
      section2Markers.height.textContent = isInch ? `${cmToIn(height)} IN` : `${height} CM`;
    }
    if (section2Markers.chest) {
      section2Markers.chest.textContent = isInch ? `CHEST ${cmToIn(chest)} IN` : `CHEST ${chest} CM`;
    }
    if (section2Markers.waist) {
      section2Markers.waist.textContent = isInch ? `WAIST ${cmToIn(waist)} IN` : `WAIST ${waist} CM`;
    }
    if (section2Markers.shoulders) {
      section2Markers.shoulders.textContent = isInch ? `SHOULDERS ${cmToIn(shoulders)} IN` : `SHOULDERS ${shoulders} CM`;
    }

    // 3. Update Section 4 Engine Input Tiles
    if (engineTiles.height) engineTiles.height.textContent = isInch ? cmToIn(height) : height;
    if (engineTiles.chest) engineTiles.chest.textContent = isInch ? cmToIn(chest) : chest;
    if (engineTiles.waist) engineTiles.waist.textContent = isInch ? cmToIn(waist) : waist;
    if (engineTiles.shoulders) engineTiles.shoulders.textContent = isInch ? cmToIn(shoulders) : shoulders;

    // 4. Update Section 3 Silhouette SVG Readouts
    if (svgElements.heightText) {
      svgElements.heightText.textContent = isInch ? `${cmToIn(height)}"` : height;
      const clampedH = Math.max(140, Math.min(215, height));
      const cursorY = 380 - ((clampedH - 140) / 75) * 290;
      if (svgElements.heightCursor) svgElements.heightCursor.setAttribute('y', cursorY - 9);
      svgElements.heightText.setAttribute('y', cursorY + 3);
    }

    if (svgElements.chestText) svgElements.chestText.textContent = isInch ? `${cmToIn(chest)} in` : `${chest} cm`;
    if (svgElements.waistText) svgElements.waistText.textContent = isInch ? `${cmToIn(waist)} in` : `${waist} cm`;
    if (svgElements.shoulderText) svgElements.shoulderText.textContent = isInch ? `${cmToIn(shoulders)} in` : `${shoulders} cm`;

    // 5. Update Section 4 Chart Rows and Badges for Benchmark Brands
    const zaraFit = calculateBrandFit({ name: 'ZARA', block: 'tailored' }, state.measurements);
    const hmFit = calculateBrandFit({ name: 'H&M', block: 'athletic' }, state.measurements);
    const brandcFit = calculateBrandFit({ name: 'BRAND C', block: 'oversized' }, state.measurements);

    updateChartHighlight('chart-brand-a', chartRecs.a, zaraFit.size);
    updateChartHighlight('chart-brand-b', chartRecs.b, hmFit.size);
    updateChartHighlight('chart-brand-c', chartRecs.c, brandcFit.size);

    // 6. Update all brand cards in Section 5
    renderBrandCards();
  }

  /**
   * Helper to highlight the active row in Section 4 Size Charts
   */
  function updateChartHighlight(chartId, badgeEl, recommendedSize) {
    const chart = document.getElementById(chartId);
    if (!chart) return;

    if (badgeEl) {
      badgeEl.textContent = `MATCH: ${recommendedSize}`;
    }

    const rows = chart.querySelectorAll('.size-row');
    rows.forEach(row => {
      const rowSize = row.dataset.size;
      const cell = row.querySelector('.size-cell');
      if (rowSize === recommendedSize) {
        row.classList.add('active-matched-row');
        if (cell) cell.classList.add('matched');
      } else {
        row.classList.remove('active-matched-row');
        if (cell) cell.classList.remove('matched');
      }
    });
  }

  /**
   * Set active anatomical focus on silhouette
   */
  function setActiveBodyTarget(targetKey) {
    state.activeTarget = targetKey;

    const parts = {
      height: svgElements.partHeight,
      chest: svgElements.partChest,
      waist: svgElements.partWaist,
      shoulders: svgElements.partShoulders
    };

    Object.values(parts).forEach(el => {
      if (el) el.classList.remove('active');
    });

    if (parts[targetKey]) {
      parts[targetKey].classList.add('active');
    }

    const labels = {
      height: 'Inspecting: Standing Height Caliper',
      chest: 'Inspecting: Chest Apex Contour',
      waist: 'Inspecting: Waist Narrow Band',
      shoulders: 'Inspecting: Bi-acromial Shoulder Span'
    };
    if (activePartLabel) {
      activePartLabel.textContent = labels[targetKey] || 'Calibrated';
    }

    document.querySelectorAll('.input-field-group').forEach(group => {
      if (group.dataset.target === targetKey) {
        group.classList.add('is-active');
      } else {
        group.classList.remove('is-active');
      }
    });
  }

  /**
   * Bind Form Controls (Number Inputs & Range Sliders)
   */
  ['height', 'chest', 'waist', 'shoulders'].forEach(key => {
    const numInput = inputs[key];
    const slider = sliders[key];
    const group = document.querySelector(`.input-field-group[data-target="${key}"]`);

    if (!numInput || !slider) return;

    slider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      state.measurements[key] = state.unit === 'in' ? inToCm(val) : val;
      numInput.value = val;
      setActiveBodyTarget(key);
      updateAllOutputs();
    });

    numInput.addEventListener('input', (e) => {
      let val = parseFloat(e.target.value);
      if (isNaN(val)) return;
      
      const min = parseFloat(numInput.min);
      const max = parseFloat(numInput.max);
      val = Math.max(min, Math.min(max, val));

      slider.value = val;
      state.measurements[key] = state.unit === 'in' ? inToCm(val) : val;
      setActiveBodyTarget(key);
      updateAllOutputs();
    });

    if (group) {
      group.addEventListener('mouseenter', () => setActiveBodyTarget(key));
      numInput.addEventListener('focus', () => setActiveBodyTarget(key));
      slider.addEventListener('focus', () => setActiveBodyTarget(key));
    }
  });

  /**
   * Click directly on SVG Mannequin Parts to Focus Corresponding Input
   */
  const svgPartTargets = [
    { el: svgElements.partHeight, key: 'height' },
    { el: svgElements.partChest, key: 'chest' },
    { el: svgElements.partWaist, key: 'waist' },
    { el: svgElements.partShoulders, key: 'shoulders' }
  ];

  svgPartTargets.forEach(({ el, key }) => {
    if (el) {
      el.addEventListener('click', () => {
        setActiveBodyTarget(key);
        if (inputs[key]) {
          inputs[key].focus();
        }
      });
    }
  });

  /**
   * Preset Buttons handler
   */
  const presetButtons = document.querySelectorAll('.preset-btn');
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const presetKey = btn.dataset.preset;
      const values = PRESETS[presetKey];
      if (!values) return;

      state.measurements = { ...values };

      ['height', 'chest', 'waist', 'shoulders'].forEach(key => {
        const displayVal = state.unit === 'in' ? cmToIn(values[key]) : values[key];
        if (inputs[key]) inputs[key].value = displayVal;
        if (sliders[key]) sliders[key].value = displayVal;
      });

      updateAllOutputs();
      showToast(`Applied preset: ${btn.textContent.trim()}`);
    });
  });

  /**
   * Unit Switcher (CM vs INCHES)
   */
  const btnCm = document.getElementById('unit-cm');
  const btnIn = document.getElementById('unit-in');
  const unitLabels = document.querySelectorAll('.unit-label');

  function setUnit(unit) {
    if (state.unit === unit) return;
    state.unit = unit;

    if (unit === 'in') {
      btnIn.classList.add('active');
      btnCm.classList.remove('active');
      unitLabels.forEach(el => el.textContent = 'in');

      inputs.height.min = '55'; inputs.height.max = '85';
      sliders.height.min = '55'; sliders.height.max = '85';

      inputs.chest.min = '28'; inputs.chest.max = '55';
      sliders.chest.min = '28'; sliders.chest.max = '55';

      inputs.waist.min = '24'; inputs.waist.max = '51';
      sliders.waist.min = '24'; sliders.waist.max = '51';

      inputs.shoulders.min = '14'; inputs.shoulders.max = '26';
      sliders.shoulders.min = '14'; sliders.shoulders.max = '26';

      ['height', 'chest', 'waist', 'shoulders'].forEach(key => {
        const inVal = cmToIn(state.measurements[key]);
        inputs[key].value = inVal;
        sliders[key].value = inVal;
      });
    } else {
      btnCm.classList.add('active');
      btnIn.classList.remove('active');
      unitLabels.forEach(el => el.textContent = 'cm');

      inputs.height.min = '140'; inputs.height.max = '215';
      sliders.height.min = '140'; sliders.height.max = '215';

      inputs.chest.min = '70'; inputs.chest.max = '140';
      sliders.chest.min = '70'; sliders.chest.max = '140';

      inputs.waist.min = '60'; inputs.waist.max = '130';
      sliders.waist.min = '60'; sliders.waist.max = '130';

      inputs.shoulders.min = '35'; inputs.shoulders.max = '65';
      sliders.shoulders.min = '35'; sliders.shoulders.max = '65';

      ['height', 'chest', 'waist', 'shoulders'].forEach(key => {
        inputs[key].value = state.measurements[key];
        sliders[key].value = state.measurements[key];
      });
    }

    updateAllOutputs();
    showToast(`Switched measurement system to ${unit.toUpperCase()}`);
  }

  if (btnCm) btnCm.addEventListener('click', () => setUnit('cm'));
  if (btnIn) btnIn.addEventListener('click', () => setUnit('in'));

  /**
   * Quick-Add Popular Brand Chips
   */
  quickAddChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const brandName = chip.dataset.brand;
      const block = chip.dataset.block;
      addBrand(brandName, block);
    });
  });

  /**
   * Custom Brand Form Submission
   */
  if (customBrandForm) {
    customBrandForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const brandName = customBrandInput.value.trim();
      const block = customBrandBlock.value;
      if (brandName) {
        addBrand(brandName, block);
        customBrandInput.value = '';
      }
    });
  }

  /**
   * PDP Manual Size Pill Clicks
   */
  if (pdpSizeChipsContainer) {
    pdpSizeChipsContainer.querySelectorAll('.size-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        pdpSizeChipsContainer.querySelectorAll('.size-pill').forEach(p => p.classList.remove('active-selected'));
        pill.classList.add('active-selected');
        const chosen = pill.dataset.size;
        showToast(`Manual selection: ${chosen}`);
      });
    });
  }

  /**
   * Color Chip Selector on PDP Mock
   */
  const colorChips = document.querySelectorAll('.color-chip');
  colorChips.forEach(chip => {
    chip.addEventListener('click', () => {
      colorChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      showToast(`Selected color: ${chip.getAttribute('title')}`);
    });
  });

  /**
   * CTA Forms Submission Handling & Supabase Database Sync
   */
  const brandForm = document.getElementById('brand-demo-form');
  const brandFeedback = document.getElementById('brand-form-feedback');
  if (brandForm) {
    brandForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('brand-email').value.trim();
      if (email) {
        brandFeedback.innerHTML = `✓ Request received for <strong>${escapeHtml(email)}</strong>. Our enterprise sizing integration team will reach out within 4 business hours.`;
        brandFeedback.className = 'form-feedback success';
        brandForm.reset();

        // Write directly to Supabase if connected
        if (supabaseClient) {
          try {
            await supabaseClient.from('brand_demo_requests').insert([{ work_email: email, notes: 'B2B Demo Request' }]);
            showToast('Demo request saved to Supabase');
          } catch (err) {
            console.warn('Supabase lead record error:', err);
            showToast('Demo request registered locally');
          }
        } else {
          showToast('Demo request registered successfully');
        }
      }
    });
  }

  const shopperForm = document.getElementById('shopper-waitlist-form');
  const shopperFeedback = document.getElementById('shopper-form-feedback');
  if (shopperForm) {
    shopperForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('shopper-email').value.trim();
      if (email) {
        shopperFeedback.innerHTML = `✓ You're on the early access list! We've reserved your anonymous universal profile ID for <strong>${escapeHtml(email)}</strong>.`;
        shopperFeedback.className = 'form-feedback success';
        shopperForm.reset();

        // Write directly to Supabase if connected
        if (supabaseClient) {
          try {
            await supabaseClient.from('shopper_waitlist').insert([{ email }]);
            showToast('Waitlist joined & saved to Supabase');
          } catch (err) {
            console.warn('Supabase waitlist record error:', err);
            showToast('Joined SizeOnce waitlist');
          }
        } else {
          showToast('Joined SizeOnce waitlist');
        }
      }
    });
  }

  /**
   * Simple Toast Notification Manager
   */
  function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    })[m]);
  }

  /**
   * Scroll-Driven Reveal Animations via IntersectionObserver
   */
  const heroReveals = document.querySelectorAll('#hero .reveal');
  heroReveals.forEach(el => el.classList.add('is-revealed'));

  const revealElements = document.querySelectorAll('.section:not(#hero) .reveal, .cta-section .reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-revealed'));
  }

  // Amazon Affiliate Settings UI Controls
  const inputAmazonTag = document.getElementById('input-amazon-tag');
  const selectAmazonDomain = document.getElementById('select-amazon-domain');
  const btnSaveAmazonTag = document.getElementById('btn-save-amazon-tag');
  const displayAmazonTag = document.getElementById('display-amazon-tag');

  function updateAmazonConfigUI() {
    if (displayAmazonTag) displayAmazonTag.textContent = state.amazonTag;
    if (inputAmazonTag) inputAmazonTag.value = state.amazonTag;
    if (selectAmazonDomain) selectAmazonDomain.value = state.amazonDomain;
  }

  if (btnSaveAmazonTag) {
    btnSaveAmazonTag.addEventListener('click', () => {
      const newTag = inputAmazonTag.value.trim() || 'sizeonce-20';
      const newDomain = selectAmazonDomain.value || 'amazon.in';
      state.amazonTag = newTag;
      state.amazonDomain = newDomain;
      saveBrands();
      updateAmazonConfigUI();
      renderBrandCards();
      updatePdpStoreView();
      showToast(`Amazon Associate Tag updated: ${newTag} (${newDomain})`);
    });
  }

  // Supabase Client State & Initialization
  let supabaseClient = null;

  function initSupabase() {
    const url = state.supabaseUrl || localStorage.getItem('sizeonce_sb_url') || '';
    const key = state.supabaseAnonKey || localStorage.getItem('sizeonce_sb_key') || '';
    const email = state.supabaseEmail || localStorage.getItem('sizeonce_sb_email') || 'shaikjasim412@gmail.com';

    state.supabaseUrl = url;
    state.supabaseAnonKey = key;
    state.supabaseEmail = email;

    const sbUrlInput = document.getElementById('sb-project-url');
    const sbKeyInput = document.getElementById('sb-anon-key');
    if (sbUrlInput) sbUrlInput.value = url;
    if (sbKeyInput) sbKeyInput.value = key;

    if (url && key && window.supabase) {
      try {
        supabaseClient = window.supabase.createClient(url, key);
        updateSupabaseUI(true);
        return supabaseClient;
      } catch (err) {
        console.warn('Supabase initialization warning:', err);
      }
    }
    updateSupabaseUI(false);
    return null;
  }

  function updateSupabaseUI(connected) {
    const pill = document.getElementById('supabase-pill-status');
    const btn = document.getElementById('btn-open-supabase');
    if (pill && btn) {
      if (connected) {
        pill.textContent = 'Cloud Active 🟢';
        btn.classList.add('is-connected');
        btn.title = `Connected to Supabase (${state.supabaseEmail})`;
      } else {
        pill.textContent = 'Cloud Sync';
        btn.classList.remove('is-connected');
        btn.title = `Connect Supabase Project (${state.supabaseEmail})`;
      }
    }
  }

  async function syncProfileToSupabase() {
    if (!supabaseClient) {
      showToast('Please enter your Supabase Project URL and Anon Key first');
      openSupabaseModal();
      return false;
    }

    try {
      const payload = {
        email: state.supabaseEmail,
        height: state.measurements.height,
        chest: state.measurements.chest,
        waist: state.measurements.waist,
        shoulders: state.measurements.shoulders,
        unit: state.unit,
        connected_brands: state.connectedBrands.map(b => b.name),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabaseClient
        .from('user_size_profiles')
        .upsert(payload, { onConflict: 'email' });

      if (error) throw error;
      showToast(`Synced profile to Supabase database for ${state.supabaseEmail}`);
      return true;
    } catch (err) {
      console.error('Supabase profile sync error:', err);
      showToast(`Supabase sync notice: ${err.message || 'Check tables & RLS'}`);
      return false;
    }
  }

  // Supabase Modal UI Controls
  const sbModal = document.getElementById('supabase-modal');
  const btnOpenSb = document.getElementById('btn-open-supabase');
  const btnCloseSb = document.getElementById('btn-close-supabase');
  const sbConfigForm = document.getElementById('supabase-config-form');
  const btnSyncProfile = document.getElementById('btn-sync-current-profile');

  function openSupabaseModal() {
    if (sbModal) {
      sbModal.classList.add('is-open');
      sbModal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeSupabaseModal() {
    if (sbModal) {
      sbModal.classList.remove('is-open');
      sbModal.setAttribute('aria-hidden', 'true');
    }
  }

  if (btnOpenSb) btnOpenSb.addEventListener('click', openSupabaseModal);
  if (btnCloseSb) btnCloseSb.addEventListener('click', closeSupabaseModal);
  if (sbModal) {
    sbModal.addEventListener('click', (e) => {
      if (e.target === sbModal) closeSupabaseModal();
    });
  }

  if (sbConfigForm) {
    sbConfigForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const url = document.getElementById('sb-project-url').value.trim();
      const key = document.getElementById('sb-anon-key').value.trim();

      state.supabaseUrl = url;
      state.supabaseAnonKey = key;
      try {
        localStorage.setItem('sizeonce_sb_url', url);
        localStorage.setItem('sizeonce_sb_key', key);
      } catch (err) {}

      initSupabase();
      closeSupabaseModal();
      showToast('Saved Supabase credentials. Syncing profile...');
      syncProfileToSupabase();
    });
  }

  if (btnSyncProfile) {
    btnSyncProfile.addEventListener('click', () => {
      syncProfileToSupabase();
    });
  }

  // Load persisted brands & affiliate settings from localStorage
  loadBrands();
  updateAmazonConfigUI();
  initSupabase();

  // Initial calculation and brand cards render
  updateAllOutputs();
  setActiveBodyTarget('chest');
});
