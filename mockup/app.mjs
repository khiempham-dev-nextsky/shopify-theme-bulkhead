import {
  categories,
  products,
  variants,
  matrixAxes,
  findItem,
  itemById,
  rulesFor,
  unitPrice,
  validateQuantity,
  parseOrder,
  addToCart,
} from "./domain.mjs";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escape = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const money = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    value,
  );
const paths = {
  search: "m21 21-4.5-4.5M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  bag: "M5 7h14l1 14H4L5 7Zm3 0V6a4 4 0 0 1 8 0v1",
  user: "M20 21a8 8 0 0 0-16 0M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  list: "M9 5h12M9 12h12M9 19h12M3 5h1M3 12h1M3 19h1",
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  table: "M3 4h18v16H3zM3 9h18M3 14h18M9 9v11M15 9v11",
  menu: "M3 6h18M3 12h18M3 18h18",
  "chevron-down": "m6 9 6 6 6-6",
  "chevron-right": "m9 5 7 7-7 7",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  close: "m6 6 12 12M6 18 18 6",
  pin: "M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  box: "m3 7 9-4 9 4v10l-9 4-9-4V7Zm0 0 9 4 9-4M12 11v10M7 5l9 4",
  shield: "m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Zm-4 9 3 3 5-6",
  layers: "m3 7 9-4 9 4-9 4-9-4Zm0 5 9 4 9-4M3 17l9 4 9-4",
  document: "M14 3H5v18h14V8l-5-5Zm0 0v5h5M8 12h8M8 16h6",
  truck:
    "M3 5h11v12H3zM14 9h4l3 4v4h-7M8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM20 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0",
  download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
  filter: "M3 6h18M6 12h12M9 18h6",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  zoom: "M10 6v8M6 10h8M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  check: "m5 12 4 4L19 6",
};
const icon = (name) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.box}"/></svg>`;
function hydrateIcons(root = document) {
  $$("[data-icon]", root).forEach((el) => {
    el.innerHTML = icon(el.dataset.icon);
  });
}
function readSaved() {
  try {
    const saved = JSON.parse(
      sessionStorage.getItem("bulkhead-preview") || "{}",
    );
    return {
      cart: Array.isArray(saved.cart)
        ? saved.cart.filter(
            (r) =>
              itemById(r.id) &&
              Number.isSafeInteger(r.quantity) &&
              r.quantity > 0,
          )
        : [],
      b2b: saved.b2b === true,
      density: saved.density === "compact" ? "compact" : "comfortable",
    };
  } catch {
    return { cart: [], b2b: false, density: "comfortable" };
  }
}
const state = {
  ...readSaved(),
  quickRows: [],
  quickError: "",
  quickDuplicates: 0,
  quickTab: "single",
  selectedVariant: "hex-bolt",
  searchItems: [],
  searchActive: -1,
};
function save() {
  try {
    sessionStorage.setItem(
      "bulkhead-preview",
      JSON.stringify({
        cart: state.cart,
        b2b: state.b2b,
        density: state.density,
      }),
    );
  } catch {
    /* Preview remains usable when browser storage is blocked. */
  }
}
let toastTimer;
function notify(message) {
  const node = $("#toast");
  node.textContent = message;
  node.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    node.hidden = true;
  }, 5000);
}
function openInfo(title, html) {
  $("#info-title").textContent = title;
  $("#info-content").innerHTML = html;
  const dialog = $("#info-dialog");
  if (!dialog.open) dialog.showModal();
}
function route() {
  const [name = "home", query = ""] = location.hash.slice(1).split("?");
  return { name: name || "home", params: new URLSearchParams(query) };
}
function navigateFilter(changes) {
  const { params } = route();
  for (const [key, value] of Object.entries(changes)) {
    if (value === "" || value === false || value === null) params.delete(key);
    else params.set(key, String(value));
  }
  const hash = "#collection" + (params.size ? "?" + params.toString() : "");
  if (location.hash === hash) render();
  else location.hash = hash;
}
function currentProduct() {
  return products.find((p) => p.id === route().params.get("id")) || products[0];
}
function stock(item) {
  return `<span class="status ${item.stock === 0 ? "out" : item.stock < 15 ? "low" : ""}">${item.stock === 0 ? "Out of stock" : item.stock < 15 ? `Only ${item.stock} in stock` : `${item.stock.toLocaleString()} in stock`}</span>`;
}
function quantity(
  item,
  name,
  value = rulesFor(item, state.b2b).min,
  extra = "",
) {
  const rule = rulesFor(item, state.b2b);
  return `<div class="quantity"><button type="button" data-qty="minus" aria-label="Decrease quantity for ${escape(item.sku)}" ${item.stock === 0 ? "disabled" : ""}>${icon("minus")}</button><input type="number" name="${escape(name)}" aria-label="Quantity for ${escape(item.sku)}" min="${rule.min}" step="${rule.step}" max="${Math.min(rule.max, item.stock)}" value="${escape(value)}" ${extra} ${item.stock === 0 ? "disabled" : ""}><button type="button" data-qty="plus" aria-label="Increase quantity for ${escape(item.sku)}" ${item.stock === 0 ? "disabled" : ""}>${icon("plus")}</button></div>`;
}
function productCard(p) {
  return `<article class="product-card"><a class="product-image" href="#product?id=${p.id}" aria-label="View ${escape(p.title)}"><img src="${p.image}" alt="${escape(categories.find((c) => c.id === p.category).name)} category illustration, AI generated" width="600" height="450" loading="lazy"></a><div class="product-card-body"><span class="product-sku">${escape(p.sku)}</span><h3><a href="#product?id=${p.id}">${escape(p.title)}</a></h3>${stock(p)}<div class="price-line"><span class="price">${money(p.price)}</span><span class="unit">/ ${escape(p.unit)}</span></div>${state.b2b ? '<span class="small muted">5% less at 20+ · 10% less at 50+</span>' : ""}<form class="card-add" data-add-form="${p.id}">${quantity(p, "quantity")}<button class="button primary" ${p.stock === 0 ? "disabled" : ""} aria-label="Add ${escape(p.title)} to cart">${p.stock === 0 ? "Sold out" : "Add"}</button></form></div></article>`;
}
const breadcrumbs = (label, middle = "") =>
  `<div class="breadcrumbs"><a href="#home">Home</a>${icon("chevron-right")}${middle ? `<a href="#collection">All products</a>${icon("chevron-right")}` : ""}<span>${escape(label)}</span></div>`;
const guideData = [
  {
    id: "bolt-grades",
    category: "Fastener guide",
    title: "Choosing the right bolt grade",
    description:
      "A practical introduction to markings, strength classes and choosing a bolt for the job.",
    body: "<h2>Start with the specification</h2><p>Use the grade, diameter and length listed in the project specification. Do not substitute a different strength class on a structural connection without approval from the responsible engineer.</p><h2>Read the head marking</h2><p>A metric marking such as 8.8 describes the strength class. The first number relates to nominal tensile strength; the second describes the yield-strength ratio. The marking does not identify a coating or corrosion class.</p><h2>Check the complete connection</h2><p>Match nuts and washers to the assembly specification. Check thread pitch, grip length, coating compatibility and installation requirements. This general guide is not an engineering specification.</p>",
  },
  {
    id: "measure-fittings",
    category: "Plumbing reference",
    title: "Measure twice. Order the right fitting.",
    description:
      "How pipe diameter, connection type and thread size affect fitting selection.",
    body: "<h2>Identify the connection</h2><p>Compression, solder, push-fit and threaded connections are not interchangeable. Identify the existing pipe material and the connection method before ordering.</p><h2>Measure the correct dimension</h2><p>For compression fittings, measure the pipe outside diameter. A nominal thread size is not the measured outside diameter of the thread. Use an appropriate thread gauge and the supplier’s dimension table.</p><h2>Confirm the application</h2><p>Check pressure, temperature and fluid compatibility against the manufacturer’s technical documentation. Use a qualified installer where required by local rules.</p>",
  },
  {
    id: "site-kit",
    category: "Site essentials",
    title: "A better-stocked site kit",
    description:
      "Keep everyday consumables together and make the next replenishment easier.",
    body: "<h2>Group by the task</h2><p>Keep fixings, drilling accessories, sealants and personal protection in separate labeled bins. Store safety equipment and chemical products according to the manufacturer’s instructions.</p><h2>Record the product code</h2><p>Keep the SKU and pack size with each bin. The same description can cover several diameters, lengths or grades, so do not rely on the product name alone.</p><h2>Build a replenishment list</h2><p>Count remaining packs and record the required quantities before ordering. Use the quick order pad to check each SKU and resolve unavailable items before adding the order to your cart.</p>",
  },
];
function guideCards() {
  return guideData
    .map(
      (g) =>
        `<article class="guide-card"><span class="guide-category">${g.category}</span><h3>${g.title}</h3><p>${g.description}</p><a class="text-link" href="#guide?id=${g.id}">Read guide ${icon("arrow")}</a></article>`,
    )
    .join("");
}
function quickMarkup(full = false) {
  return `<div class="quick-box"><div class="quick-tabs" role="tablist" aria-label="Quick order entry"><button class="quick-tab" id="single-tab" role="tab" aria-selected="${state.quickTab === "single"}" aria-controls="single-panel" tabindex="${state.quickTab === "single" ? "0" : "-1"}" data-quick-tab="single">Add by SKU</button><button class="quick-tab" id="paste-tab" role="tab" aria-selected="${state.quickTab === "paste"}" aria-controls="paste-panel" tabindex="${state.quickTab === "paste" ? "0" : "-1"}" data-quick-tab="paste">Paste a list</button></div><div class="quick-panel" id="single-panel" role="tabpanel" aria-labelledby="single-tab" ${state.quickTab !== "single" ? "hidden" : ""}><form id="single-order" class="quick-entry"><div class="field"><label for="quick-sku">SKU or manufacturer part number</label><input id="quick-sku" name="sku" placeholder="e.g. BH-4410-075" required autocomplete="off"></div><div class="field"><label for="quick-qty">Quantity</label><input id="quick-qty" name="quantity" type="number" min="1" step="1" value="${state.b2b ? "5" : "1"}" required></div><button class="button dark-button">Find product ${icon("arrow")}</button></form><p class="helper">Try BH-4410-075 or HX-M8-075. Quantities refer to the listed pack, not individual pieces.</p></div><div class="quick-panel" id="paste-panel" role="tabpanel" aria-labelledby="paste-tab" ${state.quickTab !== "paste" ? "hidden" : ""}><div class="field"><label for="order-paste">Paste up to 50 lines. One SKU and quantity per line.</label><textarea id="order-paste" placeholder="BH-4410-075, 10&#10;BH-3310-015, 5&#10;BH-2250-600, 2" spellcheck="false"></textarea></div><div class="paste-actions"><button class="text-link" type="button" id="load-sample">Use sample list</button><button class="button dark-button" id="check-list">Check list ${icon("arrow")}</button></div><p class="helper">Separate with a comma, tab or space. Duplicate SKUs are combined. Missing quantity uses the account minimum.</p></div><div id="quick-feedback" role="status" aria-live="polite"></div><div id="quick-results"></div><div class="quick-bottom"><div class="quick-total"><span id="quick-ready" class="small muted">No items checked yet</span><strong id="quick-total">${money(0)}</strong></div><button class="button primary" id="quick-add" disabled>Add checked items to cart ${icon("bag")}</button></div></div>${full ? '<p class="sample-note">Review fixture: 12 products and 30 bolt variants. Unknown SKUs return an inline error. No request is sent to a store.</p>' : ""}`;
}
function homePage() {
  return `<div class="container"><section class="hero" aria-labelledby="hero-title"><div class="hero-copy"><span class="eyebrow">For the people who build</span><h1 id="hero-title">Built for the<br>working day.</h1><p class="hero-description">The right tools and materials. Clear specifications. Less time ordering, more time on the job.</p><div class="button-row"><a class="button primary" href="#collection">Shop all products ${icon("arrow")}</a><a class="button secondary" href="#quick-order">Quick order ${icon("list")}</a></div></div><figure class="hero-visual"><img src="assets/hero.jpg" alt="AI-generated illustration of a warehouse workbench and industrial supplies" width="1599" height="900" fetchpriority="high"><figcaption class="hero-caption">Tools for the job. Supply for the crew.</figcaption></figure></section><div class="popular-searches"><span>Popular searches:</span><a href="#collection?category=fasteners">Hex bolts ${icon("arrow")}</a><a href="#collection?category=tools">Hand tools ${icon("arrow")}</a><a href="#collection?category=safety">Site essentials ${icon("arrow")}</a></div><section class="trust-strip" aria-label="Catalog features">${[
    ["box", "Stock you can see", "Availability on every item"],
    ["layers", "Order your way", "Single packs or bulk lists"],
    ["shield", "Built for trade", "Account-specific buying tools"],
    ["document", "Know what you’re buying", "Specifications, not guesswork"],
  ]
    .map(
      ([i, t, d]) =>
        `<div class="trust-item">${icon(i)}<div><strong>${t}</strong><small>${d}</small></div></div>`,
    )
    .join(
      "",
    )}</section><section class="section"><div class="section-heading"><div><h2>Every job starts here.</h2><p>Find the right department. Get straight to work.</p></div><a class="text-link" href="#collection">All departments ${icon("arrow")}</a></div><div class="categories">${categories.map((c) => `<article class="category-card"><a href="#collection?category=${c.id}" aria-label="Shop ${escape(c.name)}"><img src="${c.image}" alt="${escape(c.name)} category illustration" width="300" height="225" loading="lazy"></a><div class="category-copy"><h3>${escape(c.name)}</h3><p>${products.filter((p) => p.category === c.id).length} sample products</p><a href="#collection?category=${c.id}">Shop department ${icon("arrow")}</a></div></article>`).join("")}</div></section></div><section class="section quick-section"><div class="container"><div class="quick-intro"><div><h2>Know your codes? Skip the browsing.</h2><p>Enter a SKU or paste your materials list. Check stock, set quantities and build your order in one place.</p></div><a class="text-link" href="#quick-order">Open quick order ${icon("arrow")}</a></div>${quickMarkup()}</div></section><div class="container"><section class="section"><div class="section-heading"><div><h2>Always in the toolkit.</h2><p>Everyday essentials, ready for your next list.</p></div><a class="text-link" href="#collection">Shop essentials ${icon("arrow")}</a></div><div class="product-grid">${[products[0], products[2], products[6], products[8]].map(productCard).join("")}</div></section><section class="trade-band"><h2>Your business.<br>Better equipped.</h2><p>A buying experience built around your crew. Review account pricing, quantity breaks and company delivery locations.</p><a class="button primary" href="#trade">Open a trade account ${icon("arrow")}</a></section><div class="brand-row"><span>A place for your supplier brands</span><div class="brand-marks" aria-label="Placeholder geometric supplier marks"><svg viewBox="0 0 48 32" fill="none" stroke="currentColor" aria-hidden="true"><path d="m8 26 8-20 8 20 8-20 8 20M12 18h24"/></svg><svg viewBox="0 0 48 32" fill="none" stroke="currentColor" aria-hidden="true"><path d="M8 7h24l8 9-8 9H8l8-9-8-9ZM16 16h24"/></svg><svg viewBox="0 0 48 32" fill="none" stroke="currentColor" aria-hidden="true"><path d="m24 3 16 13-16 13L8 16 24 3Zm0 8 6 5-6 5-6-5 6-5Z"/></svg><svg viewBox="0 0 48 32" fill="none" stroke="currentColor" aria-hidden="true"><path d="M8 25V7h8v18M24 25V7h8v18M40 25V7M8 16h32"/></svg><svg viewBox="0 0 48 32" fill="none" stroke="currentColor" aria-hidden="true"><path d="m24 3 15 8v10l-15 8-15-8V11l15-8ZM9 11l15 8 15-8M24 19v10"/></svg></div></div><section class="section"><div class="section-heading"><div><h2>A little know-how goes a long way.</h2><p>Practical references for the work ahead.</p></div><a class="text-link" href="#guides">All guides ${icon("arrow")}</a></div><div class="guide-grid">${guideCards()}</div></section></div><section class="newsletter"><div class="container newsletter-inner"><div><h2>Keep your toolkit up to date.</h2><p>Product updates and practical advice. Preview signup only.</p></div><form id="newsletter-form"><div class="field"><label for="newsletter-email">Email address</label><input id="newsletter-email" name="email" type="email" autocomplete="email" placeholder="you@company.com" required></div><button class="button dark-button">Sign up ${icon("arrow")}</button><span id="newsletter-result" class="sr-only" role="status"></span></form></div></section>`;
}
function getFilteredProducts(params) {
  const query = (params.get("q") || "").toLowerCase();
  let result = products.filter(
    (p) =>
      (!params.get("category") || p.category === params.get("category")) &&
      (!query ||
        [p.title, p.sku, p.mpn, p.description].some((s) =>
          s.toLowerCase().includes(query),
        )) &&
      (!params.has("stock") || p.stock > 0) &&
      (!params.get("min") || p.price >= Number(params.get("min"))) &&
      (!params.get("max") || p.price <= Number(params.get("max"))),
  );
  if (params.get("sort") === "price-asc")
    result.sort((a, b) => a.price - b.price);
  if (params.get("sort") === "price-desc")
    result.sort((a, b) => b.price - a.price);
  if (params.get("sort") === "name")
    result.sort((a, b) => a.title.localeCompare(b.title));
  return result;
}
function filterMarkup(prefix) {
  const { params } = route();
  return `<div class="filter-group"><h3>Availability</h3><label class="check-label"><input type="checkbox" data-filter="stock" ${params.has("stock") ? "checked" : ""}>In stock only</label></div><div class="filter-group"><h3>Department</h3>${categories.map((c) => `<label class="check-label"><input type="radio" name="${prefix}-department" data-filter="category" value="${c.id}" ${params.get("category") === c.id ? "checked" : ""}>${escape(c.name)}</label>`).join("")}<label class="check-label"><input type="radio" name="${prefix}-department" data-filter="category" value="" ${!params.get("category") ? "checked" : ""}>All departments</label></div><div class="filter-group"><h3>Price per pack</h3><div class="price-filters"><div class="field"><label for="${prefix}-min">Min ($)</label><input id="${prefix}-min" type="number" min="0" step="0.01" data-filter="min" value="${escape(params.get("min") || "")}" placeholder="0"></div><div class="field"><label for="${prefix}-max">Max ($)</label><input id="${prefix}-max" type="number" min="0" step="0.01" data-filter="max" value="${escape(params.get("max") || "")}" placeholder="100"></div></div><p class="filter-note">Filters apply on change.</p></div><button class="filter-reset" data-clear-filters>Clear all filters</button>`;
}
function catalogTable(list) {
  return `<div class="table-wrap catalog-table" tabindex="0" role="region" aria-label="Product table, scroll horizontally to see quantity and Add"><table class="data-table"><thead><tr><th>Product / SKU</th><th>Material</th><th>Size</th><th>Availability</th><th class="num">Price</th><th>Quantity / Add</th></tr></thead><tbody>${list.map((p) => `<tr><td class="row-product"><img src="${p.image}" alt="" width="48" height="48" loading="lazy"><a href="#product?id=${p.id}">${escape(p.title)}</a><small class="mono">${p.sku}</small></td><td>${escape(p.specs.Material)}</td><td>${escape(p.specs.Size)}</td><td>${stock(p)}</td><td class="num"><strong>${money(p.price)}</strong><small class="unit"> / ${escape(p.unit)}</small>${state.b2b ? '<p class="small muted">20+ saves 5%</p>' : ""}</td><td><form class="card-add" data-add-form="${p.id}">${quantity(p, "quantity")}<button class="button primary" ${!p.stock ? "disabled" : ""} aria-label="Add ${escape(p.title)}">Add</button></form></td></tr>`).join("")}</tbody></table></div>`;
}
function collectionPage() {
  const { params } = route();
  const cat = categories.find((c) => c.id === params.get("category"));
  const title = params.get("q")
    ? `Results for “${params.get("q")}”`
    : cat?.name || "All products";
  const list = getFilteredProducts(params);
  const view = ["grid", "list", "table"].includes(params.get("view"))
    ? params.get("view")
    : "grid";
  return `<div class="container">${breadcrumbs(title)}<section class="page-intro"><h1>${escape(title)}</h1><p>${escape(cat?.description || "Find the right part, compare the details and order the quantities you need.")}</p><p class="sample-note">12 sample products across 6 departments. This preview does not represent the planned 500+ product store.</p></section><div class="collection-chips"><a class="collection-chip" href="#collection" aria-current="${!cat}">All departments</a>${categories.map((c) => `<a class="collection-chip" href="#collection?category=${c.id}${view !== "grid" ? "&view=" + view : ""}" aria-current="${cat?.id === c.id}">${escape(c.name)}</a>`).join("")}</div><div class="catalog-toolbar"><div class="toolbar-group"><button class="button secondary filter-button" id="filter-open">${icon("filter")}Filters</button><span class="toolbar-count small muted" aria-live="polite">${list.length} products</span></div><div class="toolbar-group"><label class="sort-label"><span>Sort by</span><select id="catalog-sort" aria-label="Sort products">${[
    ["featured", "Featured"],
    ["price-asc", "Price: low to high"],
    ["price-desc", "Price: high to low"],
    ["name", "Name: A to Z"],
  ]
    .map(
      ([v, t]) =>
        `<option value="${v}" ${params.get("sort") === v ? "selected" : ""}>${t}</option>`,
    )
    .join(
      "",
    )}</select></label><div class="view-switcher" role="group" aria-label="Product view">${["grid", "list", "table"].map((v) => `<button data-view="${v}" aria-pressed="${view === v}" aria-label="${v[0].toUpperCase() + v.slice(1)} view">${icon(v)}<span>${v[0].toUpperCase() + v.slice(1)}</span></button>`).join("")}</div></div></div><div class="catalog-layout"><aside class="catalog-sidebar" aria-label="Product filters">${filterMarkup("desktop")}</aside><div>${!list.length ? '<div class="empty-state"><h3>No matching products</h3><p>Try another search or remove a filter.</p><button class="button secondary" data-clear-filters>Clear filters</button><a class="text-link" href="#collection">Browse all products</a></div>' : view === "table" ? catalogTable(list) : `<div class="${view === "list" ? "list-view" : "product-grid"}">${list.map(productCard).join("")}</div>`}<p class="catalog-footnote">Showing ${list.length} of ${list.length} matching sample products. Grid is the default for browsing; Table is for comparing specifications and ordering.</p></div></div></div>`;
}
function tiers(item, qty) {
  return `<table class="price-tiers" aria-label="Sample trade price breaks"><thead><tr><th>Quantity (${escape(item.unit)})</th><th>Unit price</th></tr></thead><tbody>${[
    [5, 19, 1],
    [20, 49, 0.95],
    [50, 100, 0.9],
  ]
    .map(
      ([min, max, rate]) =>
        `<tr class="${qty >= min && qty <= max ? "active" : ""}"><td>${min}–${max}${qty >= min && qty <= max ? " · Your current tier" : ""}</td><td>${money(item.price * rate)}</td></tr>`,
    )
    .join("")}</tbody></table>`;
}
function productPage() {
  const p = currentProduct();
  const isBolt = p.id === "hex-bolt";
  state.selectedVariant = isBolt ? "hex-bolt" : p.id;
  const rule = rulesFor(p, state.b2b);
  return `<div class="container">${breadcrumbs(p.title, true)}<section class="product-layout"><div><div class="product-gallery"><div class="thumbnails"><button class="thumbnail" aria-label="View product image" aria-pressed="true"><img src="${p.image}" alt="" width="64" height="64"></button><button class="thumbnail" id="product-zoom-thumb" aria-label="Open large product image"><span data-icon="zoom"></span></button></div><div class="main-product-image"><img id="main-product-photo" src="${p.image}" alt="AI-generated ${escape(categories.find((c) => c.id === p.category).name)} category illustration, not a SKU photograph" width="1200" height="900"><button class="icon-button zoom-button" id="product-zoom" aria-label="Zoom product image">${icon("zoom")}</button></div></div><p class="sample-note">AI-generated category image. Illustrative only; not an exact product photograph.</p></div><div class="product-buybox"><span class="small muted">${escape(categories.find((c) => c.id === p.category).name)} / Bulkhead supply catalog</span><h1>${escape(p.title)}</h1><div class="mono" id="product-identifiers">SKU ${p.sku}<br>MPN ${p.mpn} · ${escape(p.unit)}</div><p class="product-description">${escape(p.description)}</p><div id="product-stock">${stock(p)}</div><div class="product-pricing"><span class="price-label">${state.b2b ? "Your sample trade price" : "Price per " + escape(p.unit)}</span><div class="price-line"><span class="price" id="product-price">${money(p.price)}</span><span class="unit">/ ${escape(p.unit)}</span></div><div id="product-tiers">${state.b2b ? tiers(p, rule.min) : ""}</div></div><form id="product-buy-form">${isBolt ? `<div class="variant-fields"><div class="field"><label for="bolt-diameter">Diameter</label><select id="bolt-diameter">${matrixAxes.diameters.map((d) => `<option ${d === "M8" ? "selected" : ""}>${d}</option>`).join("")}</select></div><div class="field"><label for="bolt-length">Length</label><select id="bolt-length">${matrixAxes.lengths.map((l) => `<option value="${l}" ${String(l) === "75" ? "selected" : ""}>${l} mm</option>`).join("")}</select></div></div>` : ""}<div class="buy-row">${quantity(p, "quantity", rule.min, 'id="product-qty"')}<button class="button primary" id="product-add" ${!p.stock ? "disabled" : ""}>Add to cart · <span id="product-line-total">${money(unitPrice(p, rule.min, state.b2b) * rule.min)}</span>${icon("bag")}</button></div><p class="quantity-rules">${state.b2b ? "Sample trade rules: minimum 5 packs, multiples of 5, maximum 100." : "Order from 1 pack. Trade quantity rules appear only in trade preview."}</p><p class="row-error" id="product-error" role="status" aria-live="polite"></p></form><div class="product-service">${icon("truck")}Delivery and collection options are set at checkout.</div>${!state.b2b ? '<a class="text-link small" href="#trade">Buying for your business? Open a trade account ' + icon("arrow") + "</a>" : ""}</div></section><nav class="product-nav" aria-label="Product details">${isBolt ? '<a href="#matrix" data-scroll="matrix">Order multiple sizes</a>' : ""}<a href="#specifications" data-scroll="specifications">Specifications</a><a href="#downloads" data-scroll="downloads">Downloads</a><a href="#product-faq" data-scroll="product-faq">Questions</a></nav>${isBolt ? matrixMarkup() : ""}<section class="spec-download-layout"><div id="specifications"><h2>Made to specification.</h2><table class="spec-table"><tbody>${Object.entries(
    p.specs,
  )
    .map(([k, v]) => `<tr><td>${escape(k)}</td><td>${escape(v)}</td></tr>`)
    .join(
      "",
    )}<tr><td>Pack quantity</td><td>${escape(p.unit)}</td></tr><tr><td>Manufacturer part number</td><td class="mono">${p.mpn}</td></tr></tbody></table></div><div id="downloads"><h2>Keep the details handy.</h2><button class="download-link" data-download="${p.id}">${icon("document")}<span>Product specification<small>CSV · Sample catalog data</small></span>${icon("download")}</button><p class="sample-note">Downloads contain preview specifications only. No certification or compliance documents are implied.</p></div></section><section class="faq" id="product-faq"><h2>Before you order.</h2><details><summary>What does the quantity refer to?</summary><p>The quantity is the number of listed packs. For a box of 100 bolts, a quantity of 2 means 2 boxes, or 200 bolts.</p></details><details><summary>Can I order several sizes together?</summary><p>Yes. On the hex bolt product, enter pack quantities into the size matrix and add all available selections together. Unavailable sizes are marked in the matrix.</p></details><details><summary>How do trade quantities and prices work?</summary><p>Use “View as trade buyer” in the preview bar to review sample quantity rules and price breaks. In the future theme these values must come from the customer’s Shopify catalog, not these sample rules.</p></details></section><section class="section"><div class="section-heading"><h2>Keep the job moving.</h2><a class="text-link" href="#collection">Shop all products ${icon("arrow")}</a></div><div class="product-grid">${products
    .filter((x) => x.id !== p.id && x.stock > 0)
    .slice(0, 4)
    .map(productCard)
    .join("")}</div></section></div>`;
}
function matrixMarkup() {
  return `<section id="matrix"><div class="section-heading"><div><h2>Every size. One order.</h2><p>Enter pack quantities below. Availability is shown for each size.</p></div></div><div class="table-wrap" tabindex="0" role="region" aria-label="Bulk variant matrix, scroll horizontally for all lengths"><table class="matrix-table"><thead><tr><th scope="col">Diameter / length</th>${matrixAxes.lengths.map((l) => `<th scope="col">${l} mm</th>`).join("")}</tr></thead><tbody>${matrixAxes.diameters
    .map(
      (d) =>
        `<tr><th scope="row">${d}</th>${matrixAxes.lengths
          .map((l) => {
            const v = variants.find(
              (v) => v.diameter === d && String(v.length) === String(l),
            );
            return `<td>${v.stock ? `<input type="number" data-matrix="${v.id}" aria-label="Packs of ${d} by ${l} mm" min="0" step="${state.b2b ? 5 : 1}" value="0"><small>${v.stock} in stock</small>` : '<span class="matrix-unavailable">Unavailable</span>'}</td>`;
          })
          .join("")}</tr>`,
    )
    .join(
      "",
    )}</tbody></table></div><div class="matrix-footer"><span class="small" id="matrix-total" role="status" aria-live="polite">0 packs selected · ${money(0)}</span><button class="button primary" id="matrix-add" disabled>Add selected sizes ${icon("bag")}</button></div><div id="matrix-errors" class="error" role="status" aria-live="polite"></div></section>`;
}
function quickPage() {
  return `<div class="container full-quick">${breadcrumbs("Quick order")}<section class="page-intro"><span class="eyebrow">Less browsing. More building.</span><h1>From list to cart.</h1><p>Already know what you need? Check your SKUs, see available stock and add the valid lines together. Errors won’t hold up the rest of your list.</p></section><section class="section" style="padding-top:0">${quickMarkup(true)}</section><section class="faq"><h2>Good to know.</h2><details><summary>What can I paste?</summary><p>Use one SKU or MPN per line followed by a quantity. Separate them with a comma, tab or space. A list can contain up to 50 nonempty lines. Repeated codes are combined before quantities are checked.</p></details><details><summary>Will the list be sent to a store?</summary><p>No. The preview validates against local sample data only, and the cart is stored in this browser tab for design review. There is no checkout or account connection.</p></details></section></div>`;
}
function tradePage() {
  return `<div class="container">${breadcrumbs("Trade account")}<section class="section trade-page"><div><span class="eyebrow">For your business</span><h1>A proper partner<br>for the job.</h1><p class="product-description">Keep your team supplied with buying tools built for repeat orders and working quantities.</p><div class="trade-benefits"><div><h3>Prices for the quantities you need</h3><p>Review customer-specific price breaks when your account has an assigned trade catalog.</p></div><div><h3>One company. The right destination.</h3><p>See the active company delivery location before building your order.</p></div><div><h3>Less time repeating yourself</h3><p>Order by SKU, compare specifications and add multiple sizes in one place.</p></div></div><button class="text-link" id="trade-preview">${state.b2b ? "Switch to guest preview" : "Try the trade buyer preview"} ${icon("arrow")}</button></div><form class="trade-form" id="trade-form" novalidate><h2>Tell us about your business.</h2><p class="sample-note">Design review only. This form does not send or store your details. Use sample information.</p><div class="form-grid">${[
    ["name", "Full name", "text", "name"],
    ["company", "Company name", "text", "organization"],
    ["email", "Work email", "email", "email"],
    ["phone", "Phone number", "tel", "tel"],
  ]
    .map(
      ([id, label, type, auto]) =>
        `<div class="field"><label for="trade-${id}">${label}</label><input id="trade-${id}" name="${id}" type="${type}" autocomplete="${auto}" required aria-describedby="error-${id}"><span class="form-error" id="error-${id}"></span></div>`,
    )
    .join(
      "",
    )}<div class="field wide"><label for="trade-note">What do you usually buy? <span class="muted">(optional)</span></label><textarea id="trade-note" name="note" rows="3" placeholder="Tell us about the materials your team uses."></textarea></div></div><p class="helper">In the live store, the merchant’s privacy and data-processing notice will appear here. No tax ID is requested.</p><button class="button primary" type="submit">Review application ${icon("arrow")}</button><div id="trade-result" class="form-result" role="status" aria-live="polite"></div></form></section></div>`;
}
function guidePage() {
  const g = guideData.find((g) => g.id === route().params.get("id"));
  if (!g) return guidesPage();
  return `<div class="container">${breadcrumbs("Guides & resources")}<article class="article"><span class="eyebrow">${g.category}</span><h1>${g.title}</h1><p>${g.description}</p>${g.body}<a class="text-link" href="#guides">All guides ${icon("arrow")}</a></article></div>`;
}
function guidesPage() {
  return `<div class="container">${breadcrumbs("Guides & resources")}<section class="page-intro"><h1>Know your materials.</h1><p>Practical starting points for choosing supplies and keeping the job organized.</p></section><div class="guide-grid section">${guideCards()}</div></div>`;
}
function updateHeader() {
  $("#mode-toggle").textContent = state.b2b
    ? "View as guest"
    : "View as trade buyer";
  $("#mode-toggle").setAttribute("aria-pressed", String(state.b2b));
  $("#ship-to").hidden = !state.b2b;
  $(".nav-trade").hidden = state.b2b;
  const count = state.cart.reduce((sum, r) => sum + r.quantity, 0);
  $("#cart-count").textContent = count;
  $("#cart-open").setAttribute("aria-label", `Open cart, ${count} items`);
  $("#drawer-count").textContent = `(${count})`;
  document.body.dataset.density = state.density;
  $("#density").value = state.density;
}
function render({ focus = false } = {}) {
  const { name } = route();
  const pages = {
    home: homePage,
    collection: collectionPage,
    product: productPage,
    "quick-order": quickPage,
    trade: tradePage,
    guides: guidesPage,
    guide: guidePage,
  };
  $("#main").innerHTML = (pages[name] || homePage)();
  document.title = `${{ home: "Built for the working day", collection: "Product catalog", product: currentProduct().title, "quick-order": "Quick order", trade: "Trade accounts", guides: "Guides & resources", guide: "Buying guide" }[name] || "Design preview"} | Bulkhead`;
  $("#departments").innerHTML = categories
    .map(
      (c) =>
        `<a href="#collection?category=${c.id}">${escape(c.name)} ${icon("arrow")}</a>`,
    )
    .join("");
  if (name === "collection")
    $("#mobile-filters").innerHTML = filterMarkup("mobile");
  updateHeader();
  hydrateIcons();
  if (name === "product") {
    const selected = variants.find((v) => v.id === route().params.get("variant"));
    if (selected && currentProduct().id === "hex-bolt") {
      $("#bolt-diameter").value = selected.diameter;
      $("#bolt-length").value = selected.length;
    }
    updateProduct();
  }
  if ($("#quick-results")) updateQuick();
  if ($("#cart-dialog").open) renderCart();
  if (focus) {
    $("#main").focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }
}
function updateQuick() {
  if (!$("#quick-results")) return;
  const rows = state.quickRows;
  rows.forEach((r) => {
    if (r.item)
      r.error = r.parseError || validateQuantity(r.item, r.quantity, {
        b2b: state.b2b,
        existing: state.cart.find((c) => c.id === r.item.id)?.quantity || 0,
      });
  });
  const valid = rows.filter((r) => r.item && !r.error);
  const total = valid.reduce(
    (sum, r) =>
      sum +
      unitPrice(r.item, Number(r.quantity), state.b2b) * Number(r.quantity),
    0,
  );
  $("#quick-feedback").innerHTML = state.quickError
    ? `<div class="quick-panel error">${escape(state.quickError)}</div>`
    : state.quickDuplicates
      ? `<p class="quick-panel small muted">${state.quickDuplicates} duplicate ${state.quickDuplicates === 1 ? "line combined" : "lines combined"}. Quantities have been added together.</p>`
      : "";
  $("#quick-results").innerHTML = !rows.length
    ? ""
    : `<div class="table-wrap"><table class="data-table quick-table"><thead><tr><th>SKU</th><th>Product / pack</th><th>Availability</th><th class="num">Unit price</th><th>Quantity</th><th class="num">Line total</th></tr></thead><tbody>${rows.map((r, i) => `<tr><td class="sku-cell">${escape(r.item?.sku || r.identifier)}</td><td class="row-product">${r.item ? `<a href="#product?id=${r.item.productId || r.item.id}">${escape(r.item.title)}</a><small>${escape(r.item.unit)}</small>` : "<strong>Product not found</strong>"}${r.error ? `<span class="row-error" id="quick-error-${i}">${escape(r.error)}</span>` : ""}</td><td>${r.item ? stock(r.item) : '<span class="error small">Check SKU or MPN</span>'}</td><td class="num">${r.item ? money(unitPrice(r.item, Number(r.quantity) || 0, state.b2b)) : " "}</td><td>${r.item ? quantity(r.item, `quick-${i}`, r.quantity, `data-quick-row="${i}" ${r.error ? `aria-invalid="true" aria-describedby="quick-error-${i}"` : ""}`) : `<span class="mono">${escape(r.quantity)}</span>`}</td><td class="num">${r.item && !r.error ? money(unitPrice(r.item, Number(r.quantity), state.b2b) * Number(r.quantity)) : " "}</td></tr>`).join("")}</tbody></table></div>`;
  $("#quick-ready").textContent =
    `${valid.length} of ${rows.length} ${rows.length === 1 ? "line" : "lines"} ready to add`;
  $("#quick-total").textContent = money(total);
  $("#quick-add").disabled = valid.length === 0;
}
function addEntries(entries) {
  const result = addToCart(state.cart, entries, { b2b: state.b2b });
  state.cart = result.cart;
  save();
  updateHeader();
  updateQuick();
  if ($("#cart-dialog").open) renderCart();
  if (result.added)
    notify(
      `${result.added} ${result.added === 1 ? "pack" : "packs"} added to your preview cart.`,
    );
  return result;
}
function showAddError(result) {
  if (result.errors.length)
    notify(result.errors.map((e) => e.message).join(" "));
}
function renderCart() {
  const lines = state.cart.map((r) => ({ ...r, item: itemById(r.id) }));
  $("#cart-content").innerHTML = !lines.length
    ? `<div class="cart-empty">${icon("bag")}<h3>Your next job starts here.</h3><p>Your preview cart is empty. Add a product or use quick order to build a materials list.</p><a class="button primary" href="#collection">Browse products ${icon("arrow")}</a></div>`
    : `${lines
        .map((r) => {
          const error = validateQuantity(r.item, r.quantity, {
            b2b: state.b2b,
          });
          return `<article class="cart-line"><img src="${r.item.image}" alt="" width="64" height="64"><div><h3><a href="#product?id=${r.item.productId || r.item.id}">${escape(r.item.title)}</a></h3><span class="mono">${r.item.sku}</span><span class="unit">${escape(r.item.unit)} · ${money(unitPrice(r.item, r.quantity, state.b2b))} each</span><div class="cart-line-bottom"><div class="cart-line-actions">${quantity(r.item, "quantity", r.quantity, `data-cart-id="${r.id}"`)}<button class="remove-line" data-remove="${r.id}">Remove</button></div><strong class="mono">${money(unitPrice(r.item, r.quantity, state.b2b) * r.quantity)}</strong></div>${error ? `<p class="row-error">${escape(error)}</p>` : ""}</div></article>`;
        })
        .join(
          "",
        )}<div class="cart-summary"><div class="subtotal"><span>Subtotal</span><strong class="mono">${money(lines.reduce((sum, r) => sum + unitPrice(r.item, r.quantity, state.b2b) * r.quantity, 0))}</strong></div><p class="small muted">${state.b2b ? "Sample trade tiers applied by line quantity." : "Taxes and shipping are not calculated in this preview."}</p><button class="button primary" id="review-order">Review order ${icon("arrow")}</button><p class="sample-note">Preview only. Checkout is not connected and no order will be placed.</p><button class="filter-reset" id="clear-cart">Clear preview cart</button></div>`;
  updateHeader();
}
function updateProduct() {
  const p = currentProduct();
  const variant =
    p.id === "hex-bolt"
      ? variants.find(
          (v) =>
            v.diameter === $("#bolt-diameter").value &&
            String(v.length) === $("#bolt-length").value,
        )
      : p;
  const item = itemById(variant.id);
  state.selectedVariant = item.id;
  if (p.id === "hex-bolt") {
    const params = route().params;
    params.set("variant", item.id);
    const hash = "#product?" + params.toString();
    if (location.hash !== hash) history.replaceState(null, "", hash);
    for (const row of $$(".spec-table tr")) {
      if (row.cells[0].textContent === "Size") {
        row.cells[1].textContent = `${variant.diameter} × ${variant.length} mm`;
      }
      if (row.cells[0].textContent === "Manufacturer part number") {
        row.cells[1].textContent = item.mpn;
      }
    }
  }
  $("#product-identifiers").innerHTML =
    `SKU ${item.sku}<br>MPN ${item.mpn} · ${escape(item.unit)}`;
  $("#product-stock").innerHTML = stock(item);
  const qty = Number($("#product-qty").value);
  const existing = state.cart.find((r) => r.id === item.id)?.quantity || 0;
  const error = validateQuantity(item, $("#product-qty").value, {
    b2b: state.b2b,
    existing,
  });
  $("#product-price").textContent = money(unitPrice(item, qty, state.b2b));
  $("#product-line-total").textContent = money(
    unitPrice(item, qty, state.b2b) *
      (Number.isFinite(qty) && qty > 0 ? qty : 0),
  );
  $("#product-tiers").innerHTML = state.b2b ? tiers(item, qty) : "";
  $("#product-error").textContent = error;
  $("#product-qty").setAttribute("aria-invalid", String(Boolean(error)));
  $("#product-qty").setAttribute("aria-describedby", "product-error");
  $("#product-qty").max = Math.min(rulesFor(item, state.b2b).max, item.stock);
  $("#product-qty").disabled = !item.stock;
  $$(".buy-row .quantity button").forEach((b) => (b.disabled = !item.stock));
  $("#product-add").disabled = !item.stock;
}
function updateMatrix() {
  const entries = $$("[data-matrix]")
    .filter((n) => n.value !== "" && Number(n.value) !== 0)
    .map((n) => ({ item: itemById(n.dataset.matrix), quantity: n.value }));
  const errors = entries
    .map((e) => ({
      item: e.item,
      error: validateQuantity(e.item, e.quantity, {
        b2b: state.b2b,
        existing: state.cart.find((r) => r.id === e.item.id)?.quantity || 0,
      }),
    }))
    .filter((e) => e.error);
  $$("[data-matrix]").forEach((n) =>
    n.setAttribute(
      "aria-invalid",
      String(errors.some((e) => e.item.id === n.dataset.matrix)),
    ),
  );
  const qty = entries.reduce((sum, e) => sum + (Number(e.quantity) || 0), 0);
  const total = entries.reduce(
    (sum, e) =>
      sum +
      unitPrice(e.item, Number(e.quantity) || 0, state.b2b) *
        (Number(e.quantity) || 0),
    0,
  );
  $("#matrix-total").textContent = `${qty} packs selected · ${money(total)}`;
  $("#matrix-add").disabled = entries.length === 0;
  $("#matrix-errors").textContent = errors
    .map((e) => `${e.item.sku}: ${e.error}`)
    .join(" ");
  return entries;
}
function showSearch() {
  const input = $("#search-input");
  const query = input.value.trim().toLowerCase();
  const scope = $("#search-scope").value;
  state.searchActive = -1;
  if (!query) {
    closeSearch();
    return;
  }
  const exact = findItem(query);
  let results = products
    .filter(
      (p) =>
        (!scope || p.category === scope) &&
        [p.title, p.sku, p.mpn].some((v) => v.toLowerCase().includes(query)),
    )
    .map((p) => itemById(p.id));
  if (
    exact &&
    (!scope ||
      products.find((p) => p.id === (exact.productId || exact.id))?.category ===
        scope)
  )
    results = [exact, ...results.filter((p) => p.id !== exact.id)];
  state.searchItems = results.slice(0, 6);
  $("#search-results").innerHTML = state.searchItems.length
    ? state.searchItems
        .map(
          (p, i) =>
            `<div class="search-result" id="search-option-${i}" role="option" aria-selected="false" data-search-index="${i}"><img src="${p.image}" alt="" width="48" height="48"><div>${escape(p.title)}<small>${p.sku} · MPN ${p.mpn}</small></div><strong class="result-price small">${money(p.price)}</strong></div>`,
        )
        .join("")
    : '<div class="search-empty">No sample products found. Try BH-4410-075.</div>';
  $("#search-results").hidden = false;
  input.setAttribute("aria-expanded", "true");
  input.removeAttribute("aria-activedescendant");
}
function closeSearch() {
  $("#search-results").hidden = true;
  $("#search-input").setAttribute("aria-expanded", "false");
  $("#search-input").removeAttribute("aria-activedescendant");
  state.searchActive = -1;
}
function chooseSearch(index) {
  const p = state.searchItems[index];
  if (!p) return;
  closeSearch();
  location.hash = `#product?id=${p.productId || p.id}&variant=${p.id}`;
}
function toggleMode() {
  state.b2b = !state.b2b;
  save();
  const scrollY = window.scrollY;
  render();
  window.scrollTo({ top: scrollY, behavior: "instant" });
  notify(
    state.b2b
      ? "Trade preview enabled. Sample price breaks and quantity rules are visible."
      : "Guest preview enabled. Trade-only information is hidden.",
  );
}
function tradeFieldError(input) {
  let error = "";
  if (!input.value.trim()) error = "This field is required.";
  else if (input.type === "email" && !input.validity.valid)
    error = "Enter a valid email address.";
  const output = $(`#error-${input.name}`);
  if (output) output.textContent = error;
  input.setAttribute("aria-invalid", String(Boolean(error)));
  return error;
}

document.addEventListener("submit", (event) => {
  const form = event.target;
  if (form.matches("[data-add-form]")) {
    event.preventDefault();
    const item = itemById(form.dataset.addForm);
    showAddError(
      addEntries([{ item, quantity: form.elements.quantity.value }]),
    );
  }
  if (form.id === "single-order") {
    event.preventDefault();
    const result = parseOrder(
      `${form.elements.sku.value}, ${form.elements.quantity.value}`,
      { b2b: state.b2b, cart: state.cart },
    );
    state.quickRows.push(...result.rows);
    state.quickRows = mergeQuickRows(state.quickRows);
    state.quickError = result.error;
    updateQuick();
  }
  if (form.id === "product-buy-form") {
    event.preventDefault();
    const result = addEntries([
      {
        item: itemById(state.selectedVariant),
        quantity: $("#product-qty").value,
      },
    ]);
    $("#product-error").textContent = result.errors
      .map((e) => e.message)
      .join(" ");
    if (result.added) updateProduct();
  }
  if (form.id === "header-search") {
    event.preventDefault();
    if (state.searchActive >= 0) chooseSearch(state.searchActive);
    else {
      const q = $("#search-input").value.trim();
      if (q) {
        const exact = findItem(q);
        if (exact) location.hash = `#product?id=${exact.productId || exact.id}&variant=${exact.id}`;
        else
          location.hash =
            "#collection?" +
            new URLSearchParams({
              q,
              ...($("#search-scope").value
                ? { category: $("#search-scope").value }
                : {}),
            });
        closeSearch();
      }
    }
  }
  if (form.id === "newsletter-form") {
    event.preventDefault();
    $("#newsletter-result").textContent =
      "Preview complete. No subscription was created and your email was not sent.";
    notify(
      "Preview complete. No subscription was created and your email was not sent.",
    );
    form.reset();
  }
  if (form.id === "trade-form") {
    event.preventDefault();
    const fields = $$("input[required]", form);
    const invalid = fields.filter(tradeFieldError);
    if (invalid.length) {
      invalid[0].focus();
      $("#trade-result").textContent = "";
      return;
    }
    $("#trade-result").textContent =
      "Application preview complete. No information was sent or stored. The live store will submit to the merchant for review.";
    form.reset();
  }
});
function mergeQuickRows(rows) {
  const merged = [];
  for (const row of rows) {
    const found = merged.find((r) => r.item?.id && r.item.id === row.item?.id);
    if (
      found &&
      Number.isFinite(Number(found.quantity)) &&
      Number.isFinite(Number(row.quantity))
    ) {
      found.quantity = Number(found.quantity) + Number(row.quantity);
      state.quickDuplicates++;
    } else merged.push(row);
  }
  return merged;
}
document.addEventListener("click", (event) => {
  const target = event.target.closest("button,a,[data-search-index]");
  if (!target) return;
  if (target.classList.contains("skip-link")) {
    event.preventDefault();
    $("#main").focus();
    return;
  }
  if (target.closest("[data-scroll]")) {
    event.preventDefault();
    document
      .getElementById(target.dataset.scroll)
      ?.scrollIntoView({ behavior: "smooth" });
    return;
  }
  if (target.hasAttribute("data-close")) target.closest("dialog").close();
  if (target.dataset.qty) {
    const input = $("input", target.closest(".quantity"));
    const step = Number(input.step) || 1;
    const min = Number(input.min) || 1;
    const value = Number(input.value) || 0;
    input.value = Math.max(
      min,
      value + (target.dataset.qty === "plus" ? step : -step),
    );
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }
  if (target.id === "cart-open") {
    renderCart();
    $("#cart-dialog").showModal();
  }
  if (target.id === "mode-toggle" || target.id === "trade-preview")
    toggleMode();
  if (target.id === "menu-toggle") {
    const open = target.getAttribute("aria-expanded") !== "true";
    target.setAttribute("aria-expanded", String(open));
    target.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation",
    );
    $(".navigation").classList.toggle("mobile-open", open);
  }
  if (target.id === "departments-toggle") {
    const open = $("#departments").hidden;
    $("#departments").hidden = !open;
    target.setAttribute("aria-expanded", String(open));
  }
  if (target.hasAttribute("data-quick-tab"))
    setQuickTab(target.dataset.quickTab);
  if (target.id === "load-sample") {
    $("#order-paste").value =
      `BH-4410-075, ${state.b2b ? 10 : 2}\nBH-3310-015, 5\nBH-2250-600, 2\nUNKNOWN-SKU, 1`;
    $("#order-paste").focus();
  }
  if (target.id === "check-list") {
    const result = parseOrder($("#order-paste").value, {
      b2b: state.b2b,
      cart: state.cart,
    });
    state.quickRows = result.rows;
    state.quickError = result.error;
    state.quickDuplicates = result.duplicates;
    updateQuick();
  }
  if (target.id === "quick-add") {
    const valid = state.quickRows.filter((r) => r.item && !r.error);
    const submitted = new Set(valid.map((r) => r.item.id));
    const result = addEntries(
      valid.map((r) => ({ item: r.item, quantity: r.quantity })),
    );
    const failed = new Set(result.errors.map((e) => e.id));
    state.quickRows = state.quickRows.filter(
      (r) => !r.item || !submitted.has(r.item.id) || failed.has(r.item.id),
    );
    state.quickError = result.errors.map((e) => e.message).join(" ");
    updateQuick();
  }
  if (target.hasAttribute("data-view"))
    navigateFilter({ view: target.dataset.view });
  if (target.id === "filter-open") {
    $("#mobile-filters").innerHTML = filterMarkup("mobile");
    $("#filter-dialog").showModal();
  }
  if (target.id === "apply-filters") $("#filter-dialog").close();
  if (target.hasAttribute("data-clear-filters"))
    navigateFilter({ stock: null, category: null, min: null, max: null });
  if (target.hasAttribute("data-remove")) {
    state.cart = state.cart.filter((r) => r.id !== target.dataset.remove);
    save();
    renderCart();
    updateQuick();
    notify("Item removed from preview cart.");
  }
  if (target.id === "clear-cart") {
    state.cart = [];
    save();
    renderCart();
    updateQuick();
    notify("Preview cart cleared.");
  }
  if (target.id === "review-order") {
    const invalid = state.cart
      .map((r) => ({
        item: itemById(r.id),
        error: validateQuantity(itemById(r.id), r.quantity, { b2b: state.b2b }),
      }))
      .filter((r) => r.error);
    $("#cart-dialog").close();
    openInfo(
      invalid.length ? "Check your quantities" : "Your preview order",
      invalid.length
        ? `<p>Resolve these lines before continuing:</p>${invalid.map((r) => `<p class="error">${escape(r.item.sku)}: ${escape(r.error)}</p>`).join("")}`
        : `<p>Your list contains ${state.cart.length} product ${state.cart.length === 1 ? "line" : "lines"}.</p><p>This is the end of the design-review flow. No order has been placed, no payment collected and no details sent to Shopify.</p><button class="button primary" data-close>Continue reviewing</button>`,
    );
  }
  if (target.id === "product-zoom" || target.id === "product-zoom-thumb") {
    const p = currentProduct();
    openInfo(
      "Product image",
      `<img class="zoom-image" src="${p.image}" alt="AI-generated category image"><p class="sample-note">Illustrative category photo, not the exact SKU.</p>`,
    );
  }
  if (target.id === "matrix-add") {
    const entries = updateMatrix();
    const result = addEntries(entries);
    const errors = new Set(result.errors.map((e) => e.id));
    $$("[data-matrix]").forEach((n) => {
      if (!errors.has(n.dataset.matrix)) n.value = 0;
    });
    updateMatrix();
    $("#matrix-errors").textContent = result.errors
      .map((e) => `${e.id}: ${e.message}`)
      .join(" ");
  }
  if (target.hasAttribute("data-download")) {
    const p = products.find((p) => p.id === target.dataset.download);
    const item = p.id === "hex-bolt" ? itemById(state.selectedVariant) : p;
    const selected = variants.find((variant) => variant.id === item.id);
    const specs = { ...p.specs };
    if (selected) specs.Size = `${selected.diameter} × ${selected.length} mm`;
    const rows = [
      ["Field", "Value"],
      ["Notice", "Fictional design preview. Not a technical certification."],
      ["Product", p.title],
      ["SKU", item.sku],
      ["MPN", item.mpn],
      ...Object.entries(specs),
      ["Pack", item.unit],
    ];
    const csv = rows
      .map((row) =>
        row.map((v) => '"' + String(v).replaceAll('"', '""') + '"').join(","),
      )
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = item.sku + "-preview-specifications.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Sample specifications downloaded as CSV.");
  }
  if (target.dataset.info) {
    const content = {
      "Delivery & collection":
        "Delivery methods, collection locations, lead times and cutoff times will be supplied by the merchant. This preview makes no fulfillment promise.",
      Returns:
        "The live store will provide the merchant’s returns policy, eligibility requirements and instructions. No transaction takes place in this preview.",
      "Contact us":
        "Contact details will be supplied by the merchant. To review the contact fields, use the trade account form with sample information.",
      "About Bulkhead":
        "Bulkhead is an industrial catalog design for hardware and trade supplies. This standalone HTML preview is based on the accepted Bulkhead plan.",
      Privacy:
        "This preview sends no form data and includes no analytics. Your preview cart, buyer mode and density are kept in this tab’s sessionStorage. Images and fonts are local assets.",
      "Trade terms":
        "All prices, price breaks, stock levels, quantity rules and company locations are fictional design-review fixtures. Actual trade terms will depend on the merchant and customer catalog.",
    };
    openInfo(target.dataset.info, `<p>${content[target.dataset.info]}</p>`);
  }
  if (target.dataset.searchIndex !== undefined)
    chooseSearch(Number(target.dataset.searchIndex));
  if (
    target.tagName === "A" &&
    target.getAttribute("href")?.startsWith("#") &&
    !target.dataset.scroll
  ) {
    $$("dialog[open]").forEach((d) => d.close());
    closeSearch();
    $("#departments").hidden = true;
    $("#departments-toggle").setAttribute("aria-expanded", "false");
    $(".navigation").classList.remove("mobile-open");
    $("#menu-toggle").setAttribute("aria-expanded", "false");
    $("#menu-toggle").setAttribute("aria-label", "Open navigation");
  }
});
function setQuickTab(tab) {
  state.quickTab = tab;
  $$("[data-quick-tab]").forEach((b) => {
    b.setAttribute("aria-selected", String(b.dataset.quickTab === tab));
    b.tabIndex = b.dataset.quickTab === tab ? 0 : -1;
  });
  $("#single-panel").hidden = tab !== "single";
  $("#paste-panel").hidden = tab !== "paste";
}
document.addEventListener("input", (event) => {
  const input = event.target;
  if (input.id === "search-input") showSearch();
  if (input.id === "product-qty") updateProduct();
  if (input.hasAttribute("data-matrix")) updateMatrix();
});
document.addEventListener("change", (event) => {
  const input = event.target;
  if (input.id === "density") {
    state.density = input.value;
    save();
    updateHeader();
  }
  if (input.id === "search-scope") showSearch();
  if (input.id === "catalog-sort") navigateFilter({ sort: input.value });
  if (input.dataset.filter) {
    const focusId = input.id;
    const filter = input.dataset.filter;
    const value =
      input.type === "checkbox" ? (input.checked ? "1" : null) : input.value;
    navigateFilter({ [filter]: value });
    if ($("#filter-dialog").open) {
      $("#mobile-filters").innerHTML = filterMarkup("mobile");
      if (focusId) document.getElementById(focusId)?.focus();
    }
  }
  if (["bolt-diameter", "bolt-length", "product-qty"].includes(input.id))
    updateProduct();
  if (input.dataset.quickRow !== undefined) {
    const index = Number(input.dataset.quickRow);
    state.quickRows[index].quantity = input.value;
    updateQuick();
    $(`[data-quick-row="${index}"]`)?.focus();
  }
  if (input.dataset.cartId) {
    const item = itemById(input.dataset.cartId);
    const error = validateQuantity(item, input.value, { b2b: state.b2b });
    if (error) {
      notify(error);
      const line = input.closest(".cart-line");
      let message = $(".row-error", line);
      if (!message) {
        message = document.createElement("p");
        message.className = "row-error";
        $("div", line).append(message);
      }
      message.textContent = error;
      input.setAttribute("aria-invalid", "true");
    } else {
      state.cart = state.cart.map((r) =>
        r.id === item.id ? { ...r, quantity: Number(input.value) } : r,
      );
      save();
      renderCart();
      $(`[data-cart-id="${item.id}"]`)?.focus();
      updateQuick();
      notify("Cart quantity updated.");
    }
  }
});
document.addEventListener("focusout", (event) => {
  if (event.target.matches("#trade-form input[required]"))
    tradeFieldError(event.target);
});
document.addEventListener("keydown", (event) => {
  if (event.target.id === "search-input" && !$("#search-results").hidden) {
    if (["ArrowDown", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      if (!state.searchItems.length) return;
      state.searchActive =
        (state.searchActive +
          (event.key === "ArrowDown" ? 1 : -1) +
          state.searchItems.length) %
        state.searchItems.length;
      $$("[data-search-index]").forEach((n, i) =>
        n.setAttribute("aria-selected", String(i === state.searchActive)),
      );
      event.target.setAttribute(
        "aria-activedescendant",
        `search-option-${state.searchActive}`,
      );
      $("#search-option-" + state.searchActive)?.scrollIntoView({
        block: "nearest",
      });
    }
    if (event.key === "Escape") closeSearch();
  }
  if (
    event.target.matches("[data-quick-tab]") &&
    ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
  ) {
    event.preventDefault();
    const tab =
      event.key === "Home"
        ? "single"
        : event.key === "End"
          ? "paste"
          : state.quickTab === "single"
            ? "paste"
            : "single";
    setQuickTab(tab);
    $(`[data-quick-tab="${tab}"]`).focus();
  }
  if (event.key === "Escape") {
    $("#departments").hidden = true;
    $("#departments-toggle").setAttribute("aria-expanded", "false");
    $(".navigation").classList.remove("mobile-open");
    $("#menu-toggle").setAttribute("aria-expanded", "false");
    $("#menu-toggle").setAttribute("aria-label", "Open navigation");
  }
});
document.addEventListener("click", (event) => {
  if (!event.target.closest("#header-search")) closeSearch();
  if (
    !event.target.closest("#departments") &&
    !event.target.closest("#departments-toggle")
  ) {
    $("#departments").hidden = true;
    $("#departments-toggle").setAttribute("aria-expanded", "false");
  }
});
$$("dialog").forEach((dialog) =>
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (
        event.clientX < r.left ||
        event.clientX > r.right ||
        event.clientY < r.top ||
        event.clientY > r.bottom
      )
        dialog.close();
    }
  }),
);
window.addEventListener("hashchange", () => render({ focus: true }));
render();
