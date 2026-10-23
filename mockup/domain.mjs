// Bulkhead trade hardware preview: fictional catalog fixtures and purchasing rules.
// Pure data and functions. No DOM, no network, no Shopify connection.
// Every product, SKU, price and stock level below is an invented preview fixture,
// not data from any real store.

export const PREVIEW_NOTICE =
  "Preview data only. Products, prices, stock and B2B terms are fictional fixtures, not real store data.";

/** Maximum non-empty lines accepted by one quick order paste. */
export const MAX_ORDER_LINES = 50;

const GUEST_RULES = Object.freeze({ min: 1, step: 1, max: 999 });
const B2B_RULES = Object.freeze({ min: 5, step: 5, max: 100 });

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value)) deepFreeze(value[key]);
  }
  return value;
}

const round2 = (n) => Math.round(n * 100) / 100;

/* ---------------------------------------------------------------- catalog */

export const categories = deepFreeze([
  {
    id: "fasteners",
    name: "Fasteners",
    description: "Bolts, screws, nuts and washers in trade box quantities.",
    image: "assets/fasteners.jpg",
  },
  {
    id: "tools",
    name: "Hand tools",
    description: "Hammers, levels and everyday site tools.",
    image: "assets/tools.jpg",
  },
  {
    id: "electrical",
    name: "Electrical",
    description: "Cable, enclosures and installation accessories.",
    image: "assets/electrical.jpg",
  },
  {
    id: "plumbing",
    name: "Plumbing",
    description: "Fittings, seals and jointing consumables.",
    image: "assets/plumbing.jpg",
  },
  {
    id: "safety",
    name: "Safety & PPE",
    description: "Eye, hand and site protection for the crew.",
    image: "assets/safety.jpg",
  },
  {
    id: "adhesives",
    name: "Adhesives & sealants",
    description: "Cartridge adhesives, sealants and fillers.",
    image: "assets/adhesives.jpg",
  },
]);

export const products = deepFreeze([
  {
    id: "hex-bolt",
    title: "Hex head bolt, zinc plated",
    category: "fasteners",
    sku: "BH-4410-075",
    mpn: "HX-M8-075",
    price: 12.8,
    stock: 246,
    image: "assets/fasteners.jpg",
    unit: "box of 100",
    specs: {
      Material: "Carbon steel, class 8.8",
      Size: "M8 × 75 mm",
      Finish: "Zinc plated",
    },
    description:
      "Full-thread hex head bolts for general structural and framing work. Sold in boxes of 100. Choose other diameters and lengths in the size matrix.",
  },
  {
    id: "wood-screw",
    title: "Countersunk wood screw, yellow passivated",
    category: "fasteners",
    sku: "BH-4425-050",
    mpn: "CW-45-050",
    price: 9.4,
    stock: 1840,
    image: "assets/fasteners.jpg",
    unit: "box of 200",
    specs: {
      Material: "Hardened steel",
      Size: "4.5 × 50 mm",
      Finish: "Yellow passivated",
    },
    description:
      "Twin-thread countersunk screws with a Pozi drive for fixing softwood, hardwood and sheet materials.",
  },
  {
    id: "claw-hammer",
    title: "Claw hammer, 16 oz fibreglass handle",
    category: "tools",
    sku: "BH-2210-016",
    mpn: "CH-16-FG",
    price: 18.9,
    stock: 34,
    image: "assets/tools.jpg",
    unit: "each",
    specs: {
      Material: "Forged steel head, fibreglass handle",
      Size: "16 oz / 330 mm",
      Finish: "Polished face",
    },
    description:
      "Balanced claw hammer with a shock-absorbing grip. Curved claw for nail pulling.",
  },
  {
    id: "spirit-level",
    title: "Box section spirit level, 600 mm",
    category: "tools",
    sku: "BH-2250-600",
    mpn: "SL-BX-600",
    price: 24.5,
    stock: 0,
    image: "assets/tools.jpg",
    unit: "each",
    specs: {
      Material: "Aluminium box section",
      Size: "600 mm",
      Finish: "Powder coated yellow",
    },
    description:
      "Three-vial level with shock-resistant end caps and a milled reference edge. Currently sold out in this preview.",
  },
  {
    id: "twin-earth-cable",
    title: "Twin and earth cable, 2.5 mm²",
    category: "electrical",
    sku: "BH-6130-025",
    mpn: "TE-25-050",
    price: 64.0,
    stock: 22,
    image: "assets/electrical.jpg",
    unit: "drum of 50 m",
    specs: {
      Material: "Copper conductor, PVC sheath",
      Size: "2.5 mm² × 50 m",
      Finish: "Grey sheath",
    },
    description:
      "Flat twin and earth installation cable for fixed wiring in dry and damp locations.",
  },
  {
    id: "junction-box",
    title: "Junction box IP65, 85 mm",
    category: "electrical",
    sku: "BH-6170-085",
    mpn: "JB-65-085",
    price: 11.2,
    stock: 9,
    image: "assets/electrical.jpg",
    unit: "pack of 5",
    specs: {
      Material: "Polypropylene",
      Size: "85 × 85 × 50 mm",
      Finish: "Grey, IP65 sealed",
    },
    description:
      "Weatherproof junction boxes with membrane glands. Low stock in this preview.",
  },
  {
    id: "compression-elbow",
    title: "Compression elbow, 15 mm",
    category: "plumbing",
    sku: "BH-3310-015",
    mpn: "CE-15-BR",
    price: 14.6,
    stock: 120,
    image: "assets/plumbing.jpg",
    unit: "pack of 10",
    specs: { Material: "Brass", Size: "15 mm", Finish: "Natural brass" },
    description:
      "90° compression elbows with olives included, for copper pipe in heating and water systems.",
  },
  {
    id: "ptfe-tape",
    title: "PTFE thread seal tape, 12 mm",
    category: "plumbing",
    sku: "BH-3350-012",
    mpn: "PT-12-012",
    price: 7.8,
    stock: 0,
    image: "assets/plumbing.jpg",
    unit: "pack of 10",
    specs: { Material: "PTFE", Size: "12 mm × 12 m", Finish: "White" },
    description:
      "Thread sealing tape for tapered threads on water and gas fittings. Currently sold out in this preview.",
  },
  {
    id: "safety-glasses",
    title: "Safety glasses, clear anti-scratch lens",
    category: "safety",
    sku: "BH-7110-001",
    mpn: "SG-CL-AS",
    price: 16.5,
    stock: 310,
    image: "assets/safety.jpg",
    unit: "box of 10",
    specs: {
      Material: "Polycarbonate",
      Size: "One size",
      Finish: "Clear, anti-scratch",
    },
    description:
      "Lightweight wrap-around safety glasses with side protection and a soft nose bridge.",
  },
  {
    id: "cut-gloves",
    title: "Cut-resistant work gloves, size L",
    category: "safety",
    sku: "BH-7140-010",
    mpn: "CG-L-05",
    price: 38.0,
    stock: 14,
    image: "assets/safety.jpg",
    unit: "pack of 12",
    specs: {
      Material: "HPPE knit, nitrile palm",
      Size: "L (size 9)",
      Finish: "Grey / black",
    },
    description:
      "Level 5 cut-resistant gloves with a breathable knit back and grip palm coating. Low stock in this preview.",
  },
  {
    id: "construction-adhesive",
    title: "Construction adhesive, 380 ml cartridge",
    category: "adhesives",
    sku: "BH-5210-380",
    mpn: "CA-380-GR",
    price: 31.2,
    stock: 76,
    image: "assets/adhesives.jpg",
    unit: "box of 12",
    specs: { Material: "Solvent-free polymer", Size: "380 ml", Finish: "Grey" },
    description:
      "Gap-filling interior and exterior adhesive for timber, masonry, metal and board.",
  },
  {
    id: "neutral-silicone",
    title: "Neutral cure silicone sealant, clear",
    category: "adhesives",
    sku: "BH-5240-310",
    mpn: "NS-310-CL",
    price: 28.8,
    stock: 5,
    image: "assets/adhesives.jpg",
    unit: "box of 24",
    specs: {
      Material: "Neutral cure silicone",
      Size: "310 ml",
      Finish: "Clear",
    },
    description:
      "Low-odour sealant for glazing, metal and non-porous surfaces. Low stock in this preview.",
  },
]);

/* --------------------------------------------------------- hex bolt matrix */

const DIAMETERS = Object.freeze(["M6", "M8", "M10", "M12", "M16"]);
const LENGTHS = Object.freeze([25, 40, 50, 60, 75, 100]);

export const matrixAxes = deepFreeze({
  diameters: [...DIAMETERS],
  lengths: [...LENGTHS],
});

// Rows follow DIAMETERS, columns follow LENGTHS. Includes zero and low stock cells.
const MATRIX_STOCK = {
  M6: [820, 640, 510, 380, 215, 0],
  M8: [610, 480, 360, 300, 246, 120],
  M10: [0, 260, 190, 140, 88, 40],
  M12: [150, 95, 64, 30, 18, 0],
  M16: [0, 42, 26, 12, 6, 3],
};

const DIAMETER_FACTOR = { M6: 0.7, M8: 1, M10: 1.45, M12: 2.1, M16: 3.4 };
const HEX_BOLT = products[0];

function buildVariants() {
  const out = [];
  for (const diameter of DIAMETERS) {
    LENGTHS.forEach((length, col) => {
      const len3 = String(length).padStart(3, "0");
      const isCanonical = diameter === "M8" && length === 75;
      out.push({
        // M8 × 75 is the base product itself: it shares the product id so a cart
        // holds one line and one stock pool for that SKU.
        id: isCanonical
          ? HEX_BOLT.id
          : `hex-bolt-${diameter.toLowerCase()}-${len3}`,
        productId: HEX_BOLT.id,
        sku: isCanonical ? HEX_BOLT.sku : `BH-4410-${diameter}-${len3}`,
        mpn: `HX-${diameter}-${len3}`,
        diameter,
        length,
        price: isCanonical
          ? HEX_BOLT.price
          : round2(
              HEX_BOLT.price *
                DIAMETER_FACTOR[diameter] *
                (0.4 + 0.008 * length),
            ),
        stock: isCanonical ? HEX_BOLT.stock : MATRIX_STOCK[diameter][col],
      });
    });
  }
  return out;
}

export const variants = deepFreeze(buildVariants());

/* ----------------------------------------------------------------- lookup */

function normalizeProduct(p) {
  return Object.freeze({
    id: p.id,
    productId: p.id,
    title: p.title,
    sku: p.sku,
    mpn: p.mpn,
    price: p.price,
    stock: p.stock,
    image: p.image,
    unit: p.unit,
  });
}

function normalizeVariant(v) {
  return Object.freeze({
    id: v.id,
    productId: v.productId,
    title: `${HEX_BOLT.title}, ${v.diameter} × ${v.length} mm`,
    sku: v.sku,
    mpn: v.mpn,
    price: v.price,
    stock: v.stock,
    image: HEX_BOLT.image,
    unit: HEX_BOLT.unit,
  });
}

const itemsById = new Map();
const itemsByCode = new Map(); // lower-case SKU or MPN -> item

function register(item) {
  // First registration wins, so the base product stays canonical for its own id/SKU.
  if (itemsById.has(item.id)) return;
  itemsById.set(item.id, item);
  for (const code of [item.sku, item.mpn]) {
    const key = code.toLowerCase();
    if (!itemsByCode.has(key)) itemsByCode.set(key, item);
  }
}

for (const p of products) register(normalizeProduct(p));
for (const v of variants) register(normalizeVariant(v));

/** Item by canonical id (product id or variant id), or undefined. */
export function itemById(id) {
  return itemsById.get(String(id ?? ""));
}

/** Item by exact, case-insensitive SKU or MPN (surrounding whitespace ignored), or undefined. */
export function findItem(identifier) {
  const key = String(identifier ?? "")
    .trim()
    .toLowerCase();
  return key ? itemsByCode.get(key) : undefined;
}

/* ------------------------------------------------------------ rules/price */

/** Quantity rule. Stock is enforced by validateQuantity, not here. */
export function rulesFor(item, b2b = false) {
  const rules = b2b ? B2B_RULES : GUEST_RULES;
  return { min: rules.min, step: rules.step, max: rules.max };
}

/** Unit price at a quantity. B2B volume tiers: 20+ is 5% off, 50+ is 10% off. */
export function unitPrice(item, qty, b2b = false) {
  const price = Number(item?.price) || 0;
  if (!b2b) return price;
  const n = Number(qty);
  if (n >= 50) return round2(price * 0.9);
  if (n >= 20) return round2(price * 0.95);
  return price;
}

/* ------------------------------------------------------------- validation */

function parseWhole(qty) {
  if (typeof qty === "number") return Number.isInteger(qty) ? qty : NaN;
  if (typeof qty === "string" && /^\d+$/.test(qty.trim()))
    return Number(qty.trim());
  return NaN;
}

function label(item) {
  return item.sku;
}

/**
 * Returns '' when `qty` can be added, otherwise an actionable message.
 * Min, step and max apply to the combined quantity (`existing` already in cart + `qty`).
 * Never rounds: the message suggests valid quantities instead.
 */
export function validateQuantity(
  item,
  qty,
  { b2b = false, existing = 0 } = {},
) {
  if (!item) return "Item not found. Check the SKU or MPN.";
  const stock = Math.max(0, Math.floor(Number(item.stock) || 0));
  if (stock === 0) return `${label(item)} is out of stock.`;

  const n = parseWhole(qty);
  if (!Number.isFinite(n) || n < 1) return "Enter a whole number of 1 or more.";

  const held = Math.max(0, Math.floor(Number(existing) || 0));
  const total = held + n;
  const { min, step, max } = rulesFor(item, b2b);
  const cap = Math.min(max, stock);
  const maxValid = Math.floor(cap / step) * step;
  const inCart = held ? ` (${held} already in your cart)` : "";

  if (maxValid < min) {
    return `Only ${stock} of ${label(item)} in stock, which is below the minimum order of ${min}${step > 1 ? ` in multiples of ${step}` : ""}.`;
  }

  if (total < min) {
    const need = min - held;
    return `Minimum order is ${min}${inCart}. Enter ${need} or more.`;
  }

  const room = maxValid - held;
  if (total > stock) {
    return room > 0
      ? `Only ${stock} of ${label(item)} in stock${inCart}. You can add up to ${room}.`
      : `All available stock of ${label(item)} (${stock}) is already in your cart.`;
  }

  if (total > max) {
    return room > 0
      ? `Maximum per order is ${max}${inCart}. You can add up to ${room}.`
      : `Your cart already holds the maximum of ${max} for ${label(item)}.`;
  }

  if (total % step !== 0) {
    const lowerTotal = Math.floor(total / step) * step;
    const upperTotal = lowerTotal + step;
    const options = [];
    if (lowerTotal >= min && lowerTotal > held) options.push(lowerTotal - held);
    if (upperTotal <= maxValid) options.push(upperTotal - held);
    const hint = options.length ? ` Try ${options.join(" or ")}.` : "";
    return `Quantity must make a total in multiples of ${step}${inCart}; ${total} is not.${hint}`;
  }

  return "";
}

/* ------------------------------------------------------------- quick order */

function cartQuantities(cart) {
  const map = new Map();
  for (const row of Array.isArray(cart) ? cart : []) {
    const q = row && Number.isInteger(row.quantity) ? row.quantity : 0;
    if (!row || row.id == null || q < 1) continue;
    map.set(row.id, (map.get(row.id) ?? 0) + q);
  }
  return map;
}

/**
 * Parses pasted quick order text (one `SKU[, qty]` per line; comma, tab or whitespace separated).
 * Returns { rows, error, duplicates }. Rows for the same item (matched by SKU or MPN,
 * case-insensitive) are merged before validation; `duplicates` counts merged-away lines.
 * Rows: { identifier, item, quantity, error, lines } with `item` undefined when unknown.
 * Text is treated as data only; callers must render it with textContent.
 */
export function parseOrder(text, { b2b = false, cart = [] } = {}) {
  const raw = String(text ?? "");
  const entries = [];
  raw.split(/\r\n|\r|\n/).forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed)
      entries.push({
        line: index + 1,
        tokens: trimmed.split(/[\s,]+/).filter(Boolean),
      });
  });

  if (entries.length === 0)
    return {
      rows: [],
      error: "Paste at least one line in the form SKU, quantity.",
      duplicates: 0,
    };
  if (entries.length > MAX_ORDER_LINES) {
    return {
      rows: [],
      error: `Quick order accepts up to ${MAX_ORDER_LINES} lines at a time and you pasted ${entries.length}. Split the list into smaller batches.`,
      duplicates: 0,
    };
  }

  const held = cartQuantities(cart);
  const groups = new Map(); // key -> accumulated row state
  let duplicates = 0;

  for (const { line, tokens } of entries) {
    const identifier = tokens[0];
    const item = findItem(identifier);
    const key = item ? `id:${item.id}` : `raw:${identifier.toLowerCase()}`;
    let group = groups.get(key);
    if (group) duplicates += 1;
    else {
      group = {
        identifier,
        item,
        total: 0,
        hasQuantity: false,
        badValue: undefined,
        lineError: "",
        lines: [],
      };
      groups.set(key, group);
    }
    group.lines.push(line);

    if (tokens.length > 2) {
      group.lineError ||= `Line ${line}: expected "SKU, quantity" but found ${tokens.length} values.`;
      continue;
    }
    if (tokens.length === 1) {
      group.total += rulesFor(item, b2b).min;
      group.hasQuantity = true;
      continue;
    }
    const value = tokens[1];
    if (/^\d+$/.test(value)) {
      group.total += Number(value);
      group.hasQuantity = true;
    } else if (group.badValue === undefined) {
      group.badValue = value; // kept verbatim so the user sees what they typed
    }
  }

  const rows = [];
  for (const group of groups.values()) {
    const { identifier, item, lines } = group;
    const quantity =
      group.badValue !== undefined ? group.badValue : group.total;
    let error = "";
    if (!item) error = `No item matches "${identifier}". Check the SKU or MPN.`;
    else if (group.lineError) error = group.lineError;
    else
      error = validateQuantity(item, quantity, {
        b2b,
        existing: held.get(item.id) ?? 0,
      });
    rows.push({ identifier, item, quantity, error, parseError: group.lineError, lines });
  }

  return { rows, error: "", duplicates };
}

/* -------------------------------------------------------------------- cart */

/**
 * Adds entries ({ item, quantity }) to a cart ({ id, quantity } rows) without mutating inputs.
 * Entries for the same id are merged before validation; each id is validated against the
 * canonical catalog item, combined with what is already in the cart. Invalid ids are skipped
 * and reported in `errors` ({ id, message }). `added` is the total units added.
 */
export function addToCart(cart, entries, { b2b = false } = {}) {
  const held = cartQuantities(cart);
  const merged = new Map(); // id -> { quantity, bad }

  for (const entry of Array.isArray(entries) ? entries : []) {
    const id = entry?.item?.id;
    const key = id == null ? "" : String(id);
    const n = parseWhole(entry?.quantity);
    const slot = merged.get(key) ?? { quantity: 0, bad: undefined };
    if (Number.isFinite(n) && n >= 1) slot.quantity += n;
    else if (slot.bad === undefined) slot.bad = entry?.quantity;
    merged.set(key, slot);
  }

  const next = new Map(held);
  const errors = [];
  let added = 0;

  for (const [id, { quantity, bad }] of merged) {
    const item = itemById(id);
    if (!item) {
      errors.push({ id, message: "Item not found. It was not added." });
      continue;
    }
    const message = validateQuantity(item, bad !== undefined ? bad : quantity, {
      b2b,
      existing: held.get(item.id) ?? 0,
    });
    if (message) {
      errors.push({ id: item.id, message });
      continue;
    }
    next.set(item.id, (next.get(item.id) ?? 0) + quantity);
    added += quantity;
  }

  return {
    cart: Array.from(next, ([id, quantity]) => ({ id, quantity })),
    errors,
    added,
  };
}
