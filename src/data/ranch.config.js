// ============================================================
// 🐴 RANCH CONFIGURATION FILE — REBA LOVE RANCH
// ============================================================
// This is the ONLY file you need to edit for a new ranch.
// Everything else — pages, UI, logic — stays exactly the same.
//
// HOW TO USE FOR A NEW RANCH:
// 1. Duplicate this entire project
// 2. Replace all values below with the new ranch's info
// 3. Deploy to a new Vercel project
// 4. Connect a new Appwrite project
// Done! New ranch live in ~30 minutes.
// ============================================================

export const RANCH_CONFIG = {

  // ── BRANDING ──────────────────────────────────────────────
  name: 'RebaLove Ranch',
  shortName: 'RLR',
  tagline: 'Ranch Sitter App',
  location: 'Sierra Nevada Foothills, CA',
  ownerName: 'Karen',
  ownerEmail: 'kmatthews4240@gmail.com', // ← Owner gets Admin tab

  // ── TRUCK / TRAILER NOTES ─────────────────────────────────
  vehicleNotes: {
    keysLocation: 'In the dish on the coat rack by the back door',
    trailerStatus: 'Trailer is already hitched and ready to go',
  },

  // ── ANIMALS ───────────────────────────────────────────────
  animals: [
    {
      name: 'Shadow',
      type: 'equine',
      breed: 'Horse',
      emoji: '🐴',
      notes: 'The biggest equine on the ranch. Generally good but will try to chase off the boys at feeding time.',
      likes: 'Carrots (cut in 1" slices), apples (cut in 1x1" pieces)',
      dislikes: 'Sharing food with the boys',
      odd_but_ok: null,
      evacuationOrder: 1,
      evacuationNote: 'Biggest — load first. Once Shadow is in, the others usually follow.',
      special: [
        '🚨 LOAD FIRST during evacuation. Once Shadow is in, the others usually follow.',
        '⚠️ DO NOT allow Shadow to chase off Luke or Snowy at feeding time. This is dangerous! If she tries: tell her firmly "no!" or "quit!". If that does not work — get big with your body, wave your arms like scaring a bear, look angry (fake it if you have to!) and chase her away. Do not let her back until she is invited.',
      ],
    },
    {
      name: 'Luke',
      type: 'equine',
      breed: 'Donkey',
      emoji: '🫏',
      notes: 'Sweet and gentle disposition. Requires daily medication — see special notes carefully.',
      likes: 'Chicken scratch (used to hide his medicine), carrots, apples',
      dislikes: 'Taking medicine straight — will not eat medicated pellets',
      odd_but_ok: 'Will not eat medicated pellets anymore — medicine must be given by hand hidden in chicken scratch. This is the only way he will take it!',
      evacuationOrder: 3,
      evacuationNote: 'Always load last.',
      special: [
        '💊 MEDICATION SCHEDULE — Read carefully, 4 times per day:',
        '💊 BEFORE BREAKFAST: ½ Pergolide (square pink pill) + 3 capsules Thyro-L — hide in a handful of chicken scratch, give by hand.',
        '💊 AROUND NOON: 3 capsules Thyro-L — hide in a handful of chicken scratch, give by hand.',
        '💊 BEFORE DINNER: 3 capsules Thyro-L — hide in a handful of chicken scratch, give by hand.',
        '💊 NIGHT CHECK: 3 capsules Thyro-L — hide in a handful of chicken scratch, give by hand.',
        'Load LAST during evacuation.',
      ],
    },
    {
      name: 'Snowy',
      type: 'equine',
      breed: 'Horse',
      emoji: '🐴',
      notes: 'Calm and cooperative.',
      likes: 'Carrots (cut in 1" slices), apples (cut in 1x1" pieces)',
      dislikes: null,
      odd_but_ok: null,
      evacuationOrder: 2,
      evacuationNote: "If Shadow won't go, try Snowy instead.",
      special: [
        "Will load into trailer if Shadow refuses. Try Snowy second if Shadow won't go.",
        'Load second in evacuation sequence.',
      ],
    },
    {
      name: 'Shiloh',
      type: 'dog',
      breed: 'Dog',
      emoji: '🐕',
      notes: 'Sweet girl.',
      likes: 'Dentastix after breakfast',
      dislikes: 'Too much water in the evening',
      odd_but_ok: 'Wets the bed — this is normal and known.',
      evacuationOrder: null,
      special: [
        '⚠️ NO water after 6:00 PM or she wets the bed.',
      ],
    },
    {
      name: 'Chickens',
      type: 'chicken',
      breed: 'Mixed flock',
      emoji: '🐔',
      notes: 'Free-ranging during the day.',
      likes: 'Scratch, mealworms, fruit (grapes, blueberries)',
      dislikes: null,
      odd_but_ok: 'Auto coop door opens at 6am and closes at 9pm. Gravity feeder goes INSIDE the cabinet at night check (was attracting skunks!) and is hung back out at breakfast.',
      evacuationOrder: null,
      special: [
        'Check all hens are inside at night check (~8:30pm). Close coop door if open (auto-closes 9pm).',
        '🗄️ IMPORTANT: Bring gravity feeder INSIDE the cabinet at night check — it was attracting skunks! Hang it back out again at breakfast.',
        'Scratch & mealworms are NOT optional — give 6 scoops scratch + 3 scoops mealworms at breakfast AND dinner.',
        'Fruit treat: a handful of grapes or blueberries. No additional scratch/mealworms with fruit.',
      ],
    },
    {
      name: 'Cats',
      type: 'cat',
      breed: 'Ranch cats',
      emoji: '🐈',
      notes: 'Outdoor / Mud Room cats.',
      likes: null,
      dislikes: 'Being inside the house',
      odd_but_ok: null,
      evacuationOrder: null,
      special: [
        '🚫 Cats are NOT allowed in the house. They are allowed in the Mud Room only.',
        'Check gravity feeder daily and fill if empty.',
      ],
    },
  ],

  // ── FEED SCHEDULE ─────────────────────────────────────────
  feedSchedule: [
    {
      animal: 'Luke (🫏 Donkey)',
      meals: [
        {
          time: 'breakfast',
          window: '6:30–7:30 AM',
          items: '1 bag breakfast pellets + 1 flake hay. BEFORE feeding: give ½ Pergolide (square pink pill) + 3 Thyro-L capsules hidden in a handful of chicken scratch — give by hand.',
          hasMed: true,
        },
        {
          time: 'dinner',
          window: '4:00–5:30 PM',
          items: '1 bag pellets + 1 flake hay. BEFORE dinner: give 3 Thyro-L capsules hidden in a handful of chicken scratch — give by hand.',
          hasMed: true,
        },
        {
          time: 'night_check',
          window: '8:00 PM',
          items: 'Check hay nets (fill if less than half full). Give 3 Thyro-L capsules hidden in a handful of chicken scratch — give by hand.',
          hasMed: true,
        },
      ],
    },
    {
      animal: 'Luke — Noon Medication Only',
      meals: [
        {
          time: 'dinner',
          window: '~Noon',
          items: '3 Thyro-L capsules hidden in a handful of chicken scratch — give by hand. Mid-day medication only, not a full feeding.',
          hasMed: true,
        },
      ],
    },
    {
      animal: 'Snowy',
      meals: [
        { time: 'breakfast', window: '6:30–7:30 AM', items: '1 bag breakfast pellets + 1 flake hay' },
        { time: 'dinner', window: '4:00–5:30 PM', items: '1 bag pellets + 1 flake hay' },
        { time: 'night_check', window: '8:00 PM', items: 'Check hay nets — fill any that are less than half full.' },
      ],
    },
    {
      animal: 'Shadow',
      meals: [
        { time: 'breakfast', window: '6:30–7:30 AM', items: '1 bag breakfast pellets + 1 flake hay. ⚠️ Watch Shadow — do not let her chase off the boys.' },
        { time: 'dinner', window: '4:00–5:30 PM', items: '1 bag pellets + 1 flake hay. ⚠️ Watch Shadow — do not let her chase off the boys.' },
        { time: 'night_check', window: '8:00 PM', items: 'Check hay nets — fill any that are less than half full (all 3 hay nets in barn).' },
      ],
    },
    {
      animal: 'Chickens',
      meals: [
        {
          time: 'breakfast',
          window: '6:30–7:30 AM',
          items: 'Hang gravity feeder back out (was stored inside overnight). Check feeder & water. Give 6 scoops scratch + 3 scoops mealworms — this is required, not optional.',
        },
        {
          time: 'dinner',
          window: '4:00–5:30 PM',
          items: 'Check feeder & water. Give 6 scoops scratch + 3 scoops mealworms.',
        },
        {
          time: 'night_check',
          window: '~8:30 PM',
          items: 'Confirm all hens in coop, close door if open (auto-closes 9pm). 🗄️ Bring gravity feeder INSIDE the cabinet for the night — prevents skunks!',
        },
      ],
    },
    {
      animal: 'Dogs',
      meals: [
        { time: 'breakfast', window: 'Morning', items: '1 scoop dry + 1 tbsp wet food each. Top off water. Give Dentastix.' },
        { time: 'dinner', window: 'Evening', items: '1 scoop dry + 1 tbsp wet food each. Top off water. ⚠️ No water for Shiloh after 6pm.' },
      ],
    },
    {
      animal: 'Cats',
      meals: [
        { time: 'breakfast', window: 'Daily', items: 'Check gravity feeder — fill if empty. Cats stay in Mud Room only.' },
      ],
    },
  ],

  // ── DAILY CHECKLIST TASKS ─────────────────────────────────
  dailyTasks: [
    { id: 'luke_med_am',      label: "Luke's morning medication (before breakfast)", icon: '💊', time: 'breakfast', note: '½ Pergolide + 3 Thyro-L capsules in chicken scratch — by hand' },
    { id: 'barn_water',       label: 'Top off barn water', icon: '💧', time: 'breakfast' },
    { id: 'chicken_feeder_out', label: 'Hang chicken gravity feeder back out', icon: '🐔', time: 'breakfast', note: 'Was stored inside overnight to prevent skunks' },
    { id: 'equine_breakfast', label: 'Equine breakfast pellets + hay', icon: '🌾', time: 'breakfast', note: '⚠️ Watch Shadow — do not let her chase off the boys' },
    { id: 'chicken_am',       label: 'Chicken scratch (6 scoops) + mealworms (3 scoops)', icon: '🐔', time: 'breakfast', note: 'Required — not optional' },
    { id: 'dog_breakfast',    label: 'Dog food + Dentastix', icon: '🐕', time: 'breakfast' },
    { id: 'cat_food',         label: 'Check cat gravity feeder', icon: '🐈', time: 'breakfast' },
    { id: 'manure_am',        label: 'Pick up manure — barn & yards', icon: '♻️', time: 'breakfast' },
    { id: 'luke_med_noon',    label: "Luke's noon medication", icon: '💊', time: 'dinner', note: '3 Thyro-L capsules in chicken scratch — by hand' },
    { id: 'luke_med_pm',      label: "Luke's pre-dinner medication", icon: '💊', time: 'dinner', note: '3 Thyro-L capsules in chicken scratch — give BEFORE dinner' },
    { id: 'equine_dinner',    label: 'Equine dinner pellets + hay', icon: '🌾', time: 'dinner', note: '⚠️ Watch Shadow — do not let her chase off the boys' },
    { id: 'chicken_pm',       label: 'Chicken scratch (6 scoops) + mealworms (3 scoops)', icon: '🐔', time: 'dinner' },
    { id: 'dog_dinner',       label: 'Dog dinner (no water for Shiloh after 6pm)', icon: '🐕', time: 'dinner' },
    { id: 'manure_pm',        label: 'Pick up manure — afternoon round', icon: '♻️', time: 'dinner' },
    { id: 'luke_med_night',   label: "Luke's night check medication", icon: '💊', time: 'night_check', note: '3 Thyro-L capsules in chicken scratch — by hand' },
    { id: 'hay_nets',         label: 'Check all 3 hay nets — fill if less than half full', icon: '🌾', time: 'night_check' },
    { id: 'chicken_night',    label: 'Verify all hens in coop (close door if open)', icon: '🐔', time: 'night_check', note: 'Auto-closes 9pm' },
    { id: 'chicken_feeder_in', label: '🗄️ Bring chicken gravity feeder inside cabinet', icon: '🐔', time: 'night_check', note: 'Prevents skunks — do not skip!' },
  ],

  // ── PROPERTY TASKS ────────────────────────────────────────
  propertyTasks: [
    {
      id: '1', title: 'Pick up manure — Barn & Donkey Yard',
      description: 'Morning AND afternoon: Pick up manure in and around the barn, donkey yard, and pumphouse yard. Place in black waste containers.',
      category: 'daily', frequency_days: 1, priority: 'high',
      supply_location: 'Black waste containers near barn',
    },
    {
      id: '2', title: 'Spread Manure',
      description: 'Go SLOWLY — lots of gravel mixed in. Listen for rock jams (wheels stop turning). Rock jam fix: reverse a few inches. The clutch bolt will break if you push through.',
      category: 'every_few_days', frequency_days: 3, priority: 'normal',
      supply_location: 'Manure spreader in barn',
      warning: 'Rock jam hazard! Listen carefully. Reverse to clear. Never force through.',
    },
    {
      id: '3', title: 'Check & Top Off Barn Water',
      description: 'Top off water in the barn at breakfast. Auto-timer runs 5:45–8:00am.',
      category: 'daily', frequency_days: 1, priority: 'high',
      supply_location: 'Barn water station',
    },
    {
      id: '4', title: 'Night Check — Lock Chicken Coop',
      description: 'Around 8:30pm — confirm all hens inside, close door if open. Auto-close is 9pm. Bring gravity feeder inside cabinet.',
      category: 'daily', frequency_days: 1, priority: 'high',
    },
    {
      id: '5', title: 'General Property Walk',
      description: 'Walk the property: check fences, gates, water lines, any hazards. Especially important after wind or storms — common in the Sierra Nevada foothills.',
      category: 'weekly', frequency_days: 7, priority: 'normal',
    },
    {
      id: '6', title: 'Check Perimeter Fencing',
      description: 'Look for any breaks, sagging wire, or leaning/fallen posts. Note and flag for owner. Especially after wind events.',
      category: 'weekly', frequency_days: 7, priority: 'normal',
    },
    {
      id: '7', title: 'Check Water Lines for Leaks',
      description: 'Look for wet spots near water lines. Check automatic faucet timer is working in barn.',
      category: 'weekly', frequency_days: 7, priority: 'normal',
      supply_location: 'Barn automatic faucet',
    },
  ],

  // ── MANURE SPREADING ──────────────────────────────────────
  manure: {
    frequencyDays: 3,
    frequencyLabel: '3–4',
    warning: 'Equines have been pooping on gravel — lots of rocks in the manure. Go slowly and listen for rock jams (wheels stop turning).',
    fixInstructions: 'Reverse a few inches and the jam releases. Do NOT push through — the clutch bolt will break.',
  },

  // ── EMERGENCY CONTACTS ────────────────────────────────────
  emergencyContacts: [
    {
      category: 'vets',
      title: '🏥 Veterinary',
      items: [
        { name: 'Loomis Basin Equine Medical', role: 'Equine Vet', phone: '9166527645', display: '(916) 652-7645', note: 'Primary equine care — Luke (donkey), Snowy & Shadow' },
        { name: 'Dr. De La Cruz', role: 'Equine Vet', phone: '9166527645', display: '(916) 652-7645', note: 'Same clinic as above' },
        { name: 'Cool Veterinary Hospital', role: 'Dogs & Cats Vet', phone: '5306861949', display: '(530) 686-1949', note: 'For dogs and cats' },
      ],
    },
    {
      category: 'owner',
      title: '👨‍👩‍👧 Owner & Family',
      items: [
        { name: 'Renee Gaw', role: "Karen's Daughter", phone: '9168694142', display: '(916) 869-4142', note: 'Contact for owner family emergencies' },
      ],
    },
    {
      category: 'neighbors',
      title: '🏡 Neighbors & Help',
      items: [
        { name: 'Peggy', role: 'Neighbor', phone: '7073375164', display: '(707) 337-5164', note: 'Call for help loading equines during evacuation' },
      ],
    },
    {
      category: 'evacuation',
      title: '🚨 Evacuation Locations',
      items: [
        { name: 'Cheri Burnett', role: 'Evacuation Host', phone: '9168355340', display: '(916) 835-5340', address: '8241 El Modena Ave, Elverta, CA 95626', note: "Chris (husband): (916) 765-1359 · Call first" },
        { name: 'Elverta Stables — Vadim', role: 'Evacuation Boarding', phone: '9163651198', display: '(916) 365-1198', address: '7751 Sorento Rd, Elverta, CA 95842', note: 'Call first' },
      ],
    },
  ],

  // ── EVACUATION PROTOCOL ───────────────────────────────────
  evacuationSteps: [
    { step: 1, icon: '🧘', text: 'BREATHE AND RELAX. Your anxiety transfers to the equines and makes loading harder.' },
    { step: 2, icon: '🔑', text: 'Truck keys are in the dish on the coat rack by the back door. Trailer is already hitched.' },
    { step: 3, icon: '🌾', text: 'Use the quad to grab a bale of hay. Throw it in the bed of the truck (keep tailgate UP).' },
    { step: 4, icon: '🐴', text: "Load SHADOW first (she's biggest). Stall divider stays latched to sidewall — room for all 3." },
    { step: 5, icon: '🤍', text: "If Shadow won't load, try Snowy. Load LUKE last." },
    { step: 6, icon: '🪢', text: 'Use SLIP KNOT (quick release) to tie to window bars. ALWAYS untie before off-loading.' },
    { step: 7, icon: '📞', text: 'If you need help, call neighbor Peggy: 707-337-5164.' },
  ],

  // ── EVACUATION QUICK CONTACTS ─────────────────────────────
  evacuationContacts: [
    { name: 'Peggy (Neighbor)', phone: '7073375164', display: '(707) 337-5164', note: 'Call for help loading horses' },
    { name: 'Cheri Burnett', phone: '9168355340', display: '(916) 835-5340', note: '8241 El Modena Ave, Elverta — call first' },
    { name: "Chris (Cheri's husband)", phone: '9167651359', display: '(916) 765-1359', note: 'Backup for Cheri' },
    { name: 'Elverta Stables — Vadim', phone: '9163651198', display: '(916) 365-1198', note: '7751 Sorento Rd, Elverta — call first' },
  ],

  // ── TREATS & EXTRAS ───────────────────────────────────────
  treats: [
    {
      animals: 'Luke (🫏), Snowy & Shadow',
      emoji: '🐴',
      description: '3–4 medium carrots cut into 1" slices + 1 apple cut into 1x1" pieces — shared among all three equines',
    },
    {
      animals: 'Chickens',
      emoji: '🐔',
      description: 'A handful of grapes OR blueberries. No additional scratch or mealworms with the fruit treat.',
    },
  ],

  // ── WATER NOTES ───────────────────────────────────────────
  waterNotes: [
    { emoji: '🐴', note: 'Barn water: top off at breakfast. Auto-timer runs 5:45–8:00 AM.' },
    { emoji: '🐕', note: 'Shiloh: NO water after 6:00 PM (wets the bed)', urgent: true },
    { emoji: '🐕', note: 'Top off dog water bowls twice a day.' },
  ],

  // ── SUPPLY NOTES ──────────────────────────────────────────
  ownerNotes: [
    {
      note_type: 'supply',
      animal: 'Luke',
      content: "Luke's medications: Pergolide (square pink pill — cut in half) and Thyro-L capsules are in the medicine cabinet in the barn. Chicken scratch used to hide the meds is in the feed room. Give meds by hand hidden in a small handful of scratch.",
    },
    {
      note_type: 'supply',
      animal: 'Chickens',
      content: 'Scratch and mealworms are in the cabinet inside the coop. Fresh crumble bucket is also there for refilling the gravity feeder. Remember to store the gravity feeder INSIDE the cabinet at night check to prevent skunks!',
    },
    {
      note_type: 'supply',
      animal: 'Property',
      content: 'Dog Dentastix are in the cabinet above the dog food bin in the mudroom. Wet food cans are on the shelf below.',
    },
  ],

}

// ── DERIVED HELPERS (do not edit) ─────────────────────────────
export const EVACUATION_ANIMALS = RANCH_CONFIG.animals
  .filter(a => a.evacuationOrder !== null)
  .sort((a, b) => a.evacuationOrder - b.evacuationOrder)

export const ANIMAL_NAMES = RANCH_CONFIG.animals.map(a => a.name)

export const animalsByType = (type) => RANCH_CONFIG.animals.filter(a => a.type === type)
