// Static menu data — the entire menu is defined here so the Menu page,
// homepage preview, and signature-dish cards can all read from one source.

export const menuCategories = [
  {
    id: 'starters',
    label: 'Starters',
    note: 'small plates to open the table',
    items: [
      { name: 'Charred Sourdough', desc: 'cultured butter, embered honey', price: 9 },
      { name: 'Blistered Padrón Peppers', desc: 'flaked salt, lemon oil', price: 11 },
      { name: 'Smoked Burrata', desc: 'roast tomato, basil ash, crostini', price: 15 },
      { name: 'Hearth Clams', desc: 'nduja butter, fennel, grilled bread', price: 17 },
      { name: 'Beet Tartare', desc: 'smoked yolk, rye crumble, dill oil', price: 13 },
    ],
  },
  {
    id: 'wood-fired',
    label: 'Wood-Fired',
    note: 'straight off the hearth',
    items: [
      { name: 'Whole Branzino', desc: 'citrus, chili oil, charred fennel', price: 34 },
      { name: 'Bone-In Ribeye', desc: '18oz, embered garlic, salsa verde', price: 52 },
      { name: 'Half Chicken', desc: 'brined 24hr, calabrian glaze', price: 28 },
      { name: 'Charred Cauliflower', desc: 'tahini, pomegranate, herbs', price: 22 },
      { name: 'Lamb Chops', desc: 'rosemary embers, mint gremolata', price: 38 },
    ],
  },
  {
    id: 'mains',
    label: 'Mains',
    note: 'from the kitchen',
    items: [
      { name: 'Squid Ink Cavatelli', desc: 'uni butter, chili crumb', price: 26 },
      { name: 'Braised Short Rib', desc: 'smoked polenta, red wine jus', price: 31 },
      { name: 'Wild Mushroom Risotto', desc: 'aged parmesan, thyme oil', price: 24 },
      { name: 'Duck Breast', desc: 'charred plum, five-spice jus', price: 33 },
    ],
  },
  {
    id: 'desserts',
    label: 'Desserts',
    note: 'to finish',
    items: [
      { name: 'Basque Cheesecake', desc: 'burnt top, macerated berries', price: 12 },
      { name: 'Olive Oil Cake', desc: 'candied citrus, mascarpone', price: 11 },
      { name: 'Smoked Chocolate Tart', desc: 'sea salt, hazelnut praline', price: 13 },
      { name: 'Affogato', desc: 'espresso, vanilla, amaretti', price: 9 },
    ],
  },
  {
    id: 'drinks',
    label: 'Bar & Drinks',
    note: 'natural wine, cocktails, spirits',
    items: [
      { name: 'Ember Old Fashioned', desc: 'smoked bourbon, orange, bitters', price: 16 },
      { name: 'Amber Spritz', desc: 'aperitivo, prosecco, soda', price: 14 },
      { name: 'Natural Wine, Glass', desc: 'rotating selection — ask your server', price: 15 },
      { name: 'Charred Rosemary Fizz', desc: 'gin, rosemary, lemon, tonic', price: 15 },
      { name: 'House Espresso', desc: 'single origin, dark roast', price: 4 },
    ],
  },
]

export const signatureDishes = [
  {
    name: 'Bone-In Ribeye',
    tag: 'Hearth signature',
    price: 52,
    img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=900&q=80&auto=format&fit=crop',
  },
  {
    name: 'Whole Branzino',
    tag: 'Guest favorite',
    price: 34,
    img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=900&q=80&auto=format&fit=crop',
  },
  {
    name: 'Smoked Burrata',
    tag: "Chef's pick",
    price: 15,
    img: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=900&q=80&auto=format&fit=crop',
  },
]