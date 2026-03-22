export const ANIMAL_TYPES = {
  equine: { label: 'Equines', emoji: '🐴', color: '#8B6914' },
  chicken: { label: 'Chickens', emoji: '🐔', color: '#E67E22' },
  dog: { label: 'Dogs', emoji: '🐕', color: '#7D5A3C' },
  cat: { label: 'Cats', emoji: '🐈', color: '#9B59B6' },
}

export const MEAL_TIMES = {
  breakfast: { label: 'Breakfast', time: '6:30 – 7:30 AM', icon: '🌅' },
  dinner: { label: 'Dinner', time: '4:00 – 5:30 PM', icon: '🌇' },
  night_check: { label: 'Night Check', time: '8:00 – 8:30 PM', icon: '🌙' },
}

export const CARE_TYPES = {
  feeding: { label: 'Feeding', icon: '🌾' },
  snack: { label: 'Snack / Treat', icon: '🥕' },
  hygiene: { label: 'Hygiene', icon: '🧼' },
  grooming: { label: 'Grooming', icon: '✂️' },
  medication: { label: 'Medication', icon: '💊' },
  check: { label: 'Health Check', icon: '👁️' },
  water: { label: 'Water', icon: '💧' },
}

export const BRAND = {
  skyBlue: '#4A90E2',
  petalPink: '#FFB7C5',
  forestGreen: '#2E7D32',
  warmBeige: '#FDF3E1',
  slateGrey: '#5A6978',
  charcoalBlack: '#333333',
}

// Static feed schedule data matching the ranch instructions
export const STATIC_FEED_SCHEDULE = [
  {
    animal: 'Luke', type: 'equine',
    meals: [
      { time: 'breakfast', window: '6:30–7:30 AM', items: '1 bag breakfast pellets (WITH MEDICINE) + 1 flake hay', hasMed: true },
      { time: 'dinner', window: '4:00–5:30 PM', items: '1 bag pellets + 1 flake hay' },
      { time: 'night_check', window: '8:00 PM', items: '½ flake hay' },
    ]
  },
  {
    animal: 'Snowy', type: 'equine',
    meals: [
      { time: 'breakfast', window: '6:30–7:30 AM', items: '1 bag breakfast pellets + 1 flake hay' },
      { time: 'dinner', window: '4:00–5:30 PM', items: '1 bag pellets + 1 flake hay' },
      { time: 'night_check', window: '8:00 PM', items: '½ flake hay' },
    ]
  },
  {
    animal: 'Belle', type: 'equine',
    meals: [
      { time: 'breakfast', window: '6:30–7:30 AM', items: '1 bag breakfast pellets + 1 flake hay' },
      { time: 'dinner', window: '4:00–5:30 PM', items: '1 bag pellets + 1 flake hay' },
      { time: 'night_check', window: '8:00 PM', items: '1 flake hay (full flake — extra for Belle!)' },
    ]
  },
  {
    animal: 'Chickens', type: 'chicken',
    meals: [
      { time: 'breakfast', window: '6:30–7:30 AM', items: 'Check gravity feeder & water. Optional treat: 2 scoops mealworms + 2 scoops scratch.' },
      { time: 'dinner', window: '4:00–5:30 PM', items: 'Check gravity feeder & water.' },
      { time: 'night_check', window: '~8:30 PM', items: 'Confirm all hens in coop. Close door if still open (auto-closes at 9pm).' },
    ]
  },
  {
    animal: 'Dogs', type: 'dog',
    meals: [
      { time: 'breakfast', window: 'Morning', items: '1 scoop dry + 1 tbsp wet food each. Top off water. Give Dentastix.' },
      { time: 'dinner', window: 'Evening', items: '1 scoop dry + 1 tbsp wet food each. Top off water. ⚠️ No water for Shiloh after 6pm.' },
    ]
  },
  {
    animal: 'Cats', type: 'cat',
    meals: [
      { time: 'breakfast', window: 'Daily', items: 'Check gravity feeder — fill if empty. Cats stay in Mud Room only (not in the house).' },
    ]
  },
]

export const EVACUATION_STEPS = [
  { step: 1, icon: '🧘', text: 'BREATHE AND RELAX. Your anxiety transfers to the equines and makes loading harder.' },
  { step: 2, icon: '🔑', text: 'Truck keys are in the dish on the coat rack by the back door. Trailer is already hitched.' },
  { step: 3, icon: '🌾', text: 'Use the quad to grab a bale of hay. Throw it in the bed of the truck (keep tailgate UP).' },
  { step: 4, icon: '🐴', text: 'Load BELLE first (she\'s biggest). Stall divider stays latched to sidewall — room for all 3.' },
  { step: 5, icon: '🤍', text: 'If Belle won\'t load, try Snowy. Load LUKE last.' },
  { step: 6, icon: '🪢', text: 'Use SLIP KNOT (quick release) to tie to window bars. ALWAYS untie before off-loading.' },
  { step: 7, icon: '📞', text: 'If you need help, call neighbor Peggy: 707-337-5164.' },
]
