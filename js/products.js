/* ==========================================================================
   MAMS GLAM — product catalogue
   --------------------------------------------------------------------------
   Single source of truth for every product on the site.
   Adding a product = adding one object to MAMS_PRODUCTS below.
   Structured so it maps 1:1 onto Shopify product handles, options and
   variants when this storefront converts to an Online Store 2.0 theme.

   Colour hexes are for swatch dots only — real casts vary slightly.
   ========================================================================== */

window.MAMS_PRODUCTS = [
  {
    id: 'shell-dish',
    name: 'The Shell Dish',
    type: 'Dishes',
    price: 28,
    // TODO: confirm price
    badge: 'Bestseller',
    tagline: 'A scalloped jewel for rings, earrings and small treasures.',
    story:
      'Poured from the shell that started it all — the same scallop that crowns our ' +
      'logo. Each dish is cast by hand, cured slowly for a week, then sanded until ' +
      'the ridges feel like sea-worn stone. Also poured as a bow-topped edition, and ' +
      'as the Double Shell — two scallops meeting in one quiet pour.',
    materials: 'Hand-cast jesmonite, sealed with a water-based, low-VOC finish.',
    size: 'Approx. 11 × 10 × 2.5 cm. Holds rings, earrings and little treasures.',
    care: 'Wipe with a soft, damp cloth. Not dishwasher or oven safe; keep perfume and oils off the surface.',
    colours: [
      { name: 'Blush', hex: '#E8B7B1', image: 'images/shell-dish-blush-1.jpg' },
      { name: 'Ivory', hex: '#F1EBDF', image: 'images/shell-dish-ivory-1.jpg' },
      { name: 'Mint', hex: '#BEE0CE', image: 'images/shell-dish-colour-range.jpg' },
      { name: 'Sky', hex: '#BDD4E5', image: 'images/shell-dish-colour-range.jpg' },
      { name: 'Peach', hex: '#E5A87E', image: 'images/shell-dish-colour-range.jpg' },
      { name: 'Charcoal', hex: '#4B4F52', image: 'images/shell-dish-colour-range.jpg' }
    ],
    images: [
      { src: 'images/shell-dish-colour-range.jpg', alt: 'Six Shell Dishes in blush, charcoal, peach, ivory, mint and sky, arranged in a circle around a single pearl' },
      { src: 'images/shell-dish-ivory-1.jpg', alt: 'The Shell Dish in ivory with dried flowers, pearls and a ring box on warm travertine' },
      { src: 'images/shell-dish-blush-bow.jpg', alt: 'The Shell Dish in blush resting on an oak shelf beside stacked books and dried stems' },
      { src: 'images/shell-dish-blush-1.jpg', alt: 'The Shell Dish in blush holding pearl earrings, resting on a linen-bound book' },
      { src: 'images/shell-dish-double.jpg', alt: 'The Double Shell Dish in terracotta — two scallops poured as one — beside rough gemstones' }
    ]
  },
  {
    id: 'ribbed-valet-tray',
    name: 'The Ribbed Valet Tray',
    type: 'Trays',
    price: 34,
    // TODO: confirm price
    badge: 'New',
    tagline: 'A soft-lined landing place for keys, lenses and everyday carry.',
    story:
      'The capsule silhouette is ribbed by the mould itself — no two ridges line up ' +
      'the same way twice. A removable grey felt base keeps watches and glasses ' +
      'scratch-free, and the whole insert lifts out for cleaning.',
    materials: 'Hand-cast jesmonite with a pressed-wool felt base.',
    size: 'Approx. 18 × 10 × 4.5 cm. Sits happily on any entryway table.',
    care: 'Lift out the felt insert to refresh. Wipe the tray with a soft, damp cloth.',
    colours: [
      { name: 'Terracotta', hex: '#C06A45', image: 'images/ribbed-valet-terracotta-1.jpg' },
      { name: 'Cobalt', hex: '#3E5A97', image: 'images/ribbed-valet-colour-range.jpg' },
      { name: 'Caramel', hex: '#C7A066', image: 'images/ribbed-valet-colour-range.jpg' },
      { name: 'Stone', hex: '#B5ACA0', image: 'images/ribbed-valet-colour-range.jpg' },
      { name: 'Dusty Blue', hex: '#93AEC0', image: 'images/ribbed-valet-terracotta-1.jpg' },
      { name: 'Rose', hex: '#D8A5A0', image: 'images/ribbed-valet-rose-1.jpg' }
    ],
    images: [
      { src: 'images/ribbed-valet-colour-range.jpg', alt: 'Ribbed Valet Trays in terracotta, cobalt, caramel and stone with grey felt bases and tortoiseshell glasses' },
      { src: 'images/ribbed-valet-terracotta-1.jpg', alt: 'The Ribbed Valet Tray in terracotta and dusty blue holding sunglasses and keys' },
      { src: 'images/ribbed-valet-rose-1.jpg', alt: 'The Ribbed Valet Tray in rose on marble with dried bunny-tail grasses' }
    ]
  },
  {
    id: 'pebble-nesting-bowls',
    name: 'The Pebble Nesting Bowls',
    type: 'Bowls',
    price: 42,
    // TODO: confirm price
    badge: '',
    tagline: 'Three organic bowls that stack like river stones.',
    story:
      'Cast from three sizes of one soft pebble shape, they nest into a single ' +
      'sculptural object when company comes, and fan out across the table when it ' +
      'is just you. Keys and coins by the door, olives at dinner.',
    materials: 'Hand-cast jesmonite, sealed matte.',
    size: 'Set of three, from approx. 10 cm to 22 cm across; they nest within 6 cm of height.',
    care: 'Wipe clean with a damp cloth. Not for hot foods or the dishwasher.',
    colours: [
      { name: 'Olive', hex: '#6C7444', image: 'images/pebble-bowls-olive-1.jpg' },
      { name: 'Orange', hex: '#D97F3A', image: 'images/pebble-bowls-trio.jpg' },
      { name: 'Periwinkle', hex: '#7D87C5', image: 'images/pebble-bowls-trio.jpg' },
      { name: 'Sand', hex: '#CCBEA7', image: 'images/pebble-bowls-trio.jpg' }
    ],
    images: [
      { src: 'images/pebble-bowls-trio.jpg', alt: 'Three Pebble Nesting Bowls in orange, periwinkle and sand holding keys and coins on a walnut table' },
      { src: 'images/pebble-bowls-olive-1.jpg', alt: 'The Pebble Nesting Bowls in olive with rosemary and peppercorns on a bamboo board' },
      { src: 'images/pebble-bowls-nested.jpg', alt: 'Pebble Nesting Bowls in navy, charcoal, cream and orange stacked inside one another' }
    ]
  },
  {
    id: 'oval-vanity-tray',
    name: 'The Oval Vanity Tray',
    type: 'Trays',
    price: 36,
    // TODO: confirm price
    badge: '',
    tagline: 'A quiet stage for perfume, pearls and the morning routine.',
    story:
      'Smooth ovals with a generous lip, so nothing rolls away while you get ready. ' +
      'Poured two ways: with a scalloped edge in plum and mauve, or finished with ' +
      'hand-made lilac flowers cast from vintage button moulds — each tray blooms ' +
      'a little differently.',
    materials: 'Hand-cast jesmonite; floral edition with cast lilac blooms.',
    size: 'Approx. 26 × 14 × 2.5 cm (floral edition 24 × 13 cm).',
    care: 'Wipe with a soft, damp cloth. Keep long-wearing perfume off the surface to protect the seal.',
    colours: [
      { name: 'Plum', hex: '#8C6B72', image: 'images/oval-vanity-plum-mauve.jpg' },
      { name: 'Mauve', hex: '#AF8E9E', image: 'images/oval-vanity-plum-mauve.jpg' },
      { name: 'Floral White', hex: '#F2EDE3', image: 'images/oval-vanity-floral-1.jpg' },
      { name: 'Terracotta', hex: '#BE6E4F', image: 'images/oval-vanity-terracotta-1.jpg' }
    ],
    images: [
      { src: 'images/oval-vanity-plum-mauve.jpg', alt: 'Two scalloped Oval Vanity Trays in plum and mauve with a tulip and pearl necklaces, in warm afternoon light' },
      { src: 'images/oval-vanity-floral-1.jpg', alt: 'The Oval Vanity Tray in white with hand-made lilac flowers beside perfume bottles' },
      { src: 'images/oval-vanity-terracotta-1.jpg', alt: 'The Oval Vanity Tray in terracotta holding gold hoops and rings beside a candle' }
    ]
  },
  {
    id: 'round-stone-platters',
    name: 'The Round Stone Platters',
    type: 'Platters',
    price: 48,
    // TODO: confirm price
    badge: 'New',
    tagline: 'Stone-look platters, terrazzo saucers, quiet centrepieces.',
    story:
      'Mineral pigment gives each platter the grain of cut stone, speckled or solid. ' +
      'They nest for storage and layer beautifully; the terrazzo saucers keep happy ' +
      'company with small plants, and the wavy tray holds eggs like a little sculpture.',
    materials: 'Hand-cast jesmonite with mineral pigment; terrazzo chips mixed by hand.',
    size: 'Nesting set approx. 20 / 26 / 32 cm. Saucers approx. 12 and 17 cm.',
    care: 'Wipe clean; use coasters under hot dishes. Sealed against water, not against cutting.',
    colours: [
      { name: 'Navy', hex: '#46557E', image: 'images/stone-platters-nested.jpg' },
      { name: 'Charcoal', hex: '#4A4845', image: 'images/stone-platters-nested.jpg' },
      { name: 'Sand', hex: '#D9CBAD', image: 'images/stone-platters-nested.jpg' },
      { name: 'Terracotta', hex: '#B97250', image: 'images/stone-platters-nested.jpg' },
      { name: 'Terrazzo', hex: '#DACDB6', image: 'images/stone-platters-terrazzo-saucers.jpg' }
    ],
    images: [
      { src: 'images/stone-platters-nested.jpg', alt: 'Round Stone Platters in charcoal, navy, sand and terracotta nested on a marble table' },
      { src: 'images/stone-platters-terrazzo-saucers.jpg', alt: 'Terrazzo plant saucers in blush and sand holding succulents and a cactus on a windowsill' },
      { src: 'images/terrazzo-wavy-tray.jpg', alt: 'The terrazzo wavy tray with coral and cobalt chips on a pale background' },
      { src: 'images/terrazzo-egg-holder.jpg', alt: 'Terrazzo wavy egg holders in charcoal and sage holding fresh eggs in a sunny kitchen' }
    ]
  },
  {
    id: 'heat-safe-mat',
    name: 'The Heat-Safe Mat',
    type: 'Vanity',
    price: 18,
    // TODO: confirm price
    badge: '',
    tagline: 'A soft landing for straighteners and tongs — folds into its own pouch.',
    story:
      'The same wavy relief as our cast trays, moulded in food-grade silicone that ' +
      'shrugs off 230 °C. It lies flat beside the mirror, then folds and snaps into ' +
      'a pouch for the gym bag.',
    materials: 'Food-grade silicone, heat resistant to 230 °C.',
    size: 'Flat approx. 24 × 12 cm; folds to palm size.',
    care: 'Rinse in warm soapy water; dishwasher safe.',
    colours: [
      { name: 'Charcoal', hex: '#4B4B4F', image: 'images/heat-safe-mat-trio.jpg' },
      { name: 'Blush', hex: '#E3A7B4', image: 'images/heat-safe-pouch-colours.jpg' },
      { name: 'Mint', hex: '#BFDCC8', image: 'images/heat-safe-pouch-colours.jpg' },
      { name: 'Stone', hex: '#CFCBC3', image: 'images/heat-safe-mat-trio.jpg' },
      { name: 'Tangerine', hex: '#DE8A3C', image: 'images/heat-safe-pouch-colours.jpg' }
    ],
    images: [
      { src: 'images/heat-safe-mat-trio.jpg', alt: 'Three Heat-Safe Mats fanned out in stone, blush and charcoal' },
      { src: 'images/heat-safe-pouch-colours.jpg', alt: 'Heat-Safe Mats folded into pouches in mint, blush, black and tangerine' },
      { src: 'images/heat-safe-mat-in-use.jpg', alt: 'The Heat-Safe Mat in charcoal holding a hair straightener, flat and folded' }
    ]
  },
  {
    id: 'brush-case',
    name: 'The Brush Case',
    type: 'Vanity',
    price: 24,
    // TODO: confirm price
    badge: '',
    tagline: 'Brushes travel clean — and the lid cleans them on the way.',
    story:
      'A zip case in warm nude silicone with a textured cleaning pad moulded into ' +
      'the lid: swish, rinse, pack. Fits four to six brushes up to 18 cm.',
    materials: 'Soft-touch silicone with moulded cleaning texture.',
    size: 'Approx. 19 × 6 cm closed.',
    care: 'Rinse in warm soapy water; air dry closed.',
    colours: [
      { name: 'Nude', hex: '#D9BFA9', image: 'images/brush-case-open.jpg' }
    ],
    images: [
      { src: 'images/brush-case-open.jpg', alt: 'Makeup brushes in clear protective sleeves fanned across the open Brush Case' },
      { src: 'images/brush-case-detail.jpg', alt: 'The Brush Case in nude with its textured cleaning lid, holding two brushes' }
    ]
  }
];

/* Lookup helper — used by product.html, search, quick-add and the cart. */
window.MAMS = {
  products: window.MAMS_PRODUCTS,
  find: function (id) {
    return this.products.find(function (p) { return p.id === id; }) || null;
  },
  money: function (n) {
    return '$' + Number(n).toFixed(2).replace(/\.00$/, '');
  }
};
