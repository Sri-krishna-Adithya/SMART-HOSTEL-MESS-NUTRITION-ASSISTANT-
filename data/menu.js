// Nutrition values are approximate, per 100 g of the cooked/served item.
// serving = typical mess portion in grams. price = rupees, only for optional add-ons.
export const FOODS = {
  rice:        { name: 'Steamed rice',     per100: { kcal: 130, protein: 2.7, carbs: 28, fat: 0.3 }, serving: 200 },
  chapati:     { name: 'Chapati',          per100: { kcal: 297, protein: 9,   carbs: 46, fat: 7 },   serving: 40 },
  dal:         { name: 'Dal',              per100: { kcal: 105, protein: 6.5, carbs: 15, fat: 2.5 }, serving: 150 },
  sambar:      { name: 'Sambar',           per100: { kcal: 55,  protein: 2.5, carbs: 8,  fat: 1.5 }, serving: 150 },
  paneer:      { name: 'Paneer curry',     per100: { kcal: 190, protein: 9,   carbs: 6,  fat: 15 },  serving: 120 },
  eggCurry:    { name: 'Egg curry',        per100: { kcal: 150, protein: 9,   carbs: 5,  fat: 10 },  serving: 150 },
  chickenCurry:{ name: 'Chicken curry',    per100: { kcal: 165, protein: 16,  carbs: 4,  fat: 9 },   serving: 150 },
  vegCurry:    { name: 'Mixed veg curry',  per100: { kcal: 90,  protein: 2.5, carbs: 10, fat: 4.5 }, serving: 120 },
  aloo:        { name: 'Aloo curry',       per100: { kcal: 110, protein: 2,   carbs: 17, fat: 4 },   serving: 120 },
  rajma:       { name: 'Rajma',            per100: { kcal: 130, protein: 7,   carbs: 20, fat: 2 },   serving: 150 },
  chole:       { name: 'Chole',            per100: { kcal: 164, protein: 8,   carbs: 27, fat: 2.6 }, serving: 150 },
  vegBiryani:  { name: 'Veg biryani',      per100: { kcal: 150, protein: 3,   carbs: 24, fat: 4.5 }, serving: 250 },
  chickBiryani:{ name: 'Chicken biryani',  per100: { kcal: 190, protein: 10,  carbs: 25, fat: 5.5 }, serving: 250 },
  curdRice:    { name: 'Curd rice',        per100: { kcal: 120, protein: 3,   carbs: 18, fat: 3.5 }, serving: 200 },
  idli:        { name: 'Idli',             per100: { kcal: 130, protein: 4,   carbs: 26, fat: 0.5 }, serving: 120 },
  dosa:        { name: 'Dosa',             per100: { kcal: 168, protein: 4,   carbs: 29, fat: 4 },   serving: 90 },
  upma:        { name: 'Upma',             per100: { kcal: 120, protein: 3,   carbs: 20, fat: 3.5 }, serving: 200 },
  poha:        { name: 'Poha',             per100: { kcal: 130, protein: 2.5, carbs: 25, fat: 2.5 }, serving: 200 },
  pongal:      { name: 'Pongal',           per100: { kcal: 140, protein: 3.5, carbs: 22, fat: 4 },   serving: 200 },
  vada:        { name: 'Medu vada',        per100: { kcal: 290, protein: 8,   carbs: 30, fat: 15 },  serving: 50 },
  samosa:      { name: 'Samosa',           per100: { kcal: 262, protein: 4,   carbs: 24, fat: 17 },  serving: 60 },
  sprouts:     { name: 'Sprouts salad',    per100: { kcal: 110, protein: 8,   carbs: 18, fat: 0.6 }, serving: 100 },
  tea:         { name: 'Tea with milk',    per100: { kcal: 40,  protein: 1,   carbs: 6,  fat: 1.2 }, serving: 150 },
  // optional add-ons bought outside the mess (used by the budget-aware suggestions)
  boiledEgg:   { name: 'Boiled egg',       per100: { kcal: 155, protein: 13,  carbs: 1.1, fat: 11 }, serving: 50,  price: 7,  extra: true },
  milk:        { name: 'Milk',             per100: { kcal: 61,  protein: 3.2, carbs: 4.8, fat: 3.3 }, serving: 200, price: 14, extra: true },
  banana:      { name: 'Banana',           per100: { kcal: 89,  protein: 1.1, carbs: 23,  fat: 0.3 }, serving: 100, price: 6,  extra: true },
  curd:        { name: 'Curd',             per100: { kcal: 61,  protein: 3.5, carbs: 4.7, fat: 3.3 }, serving: 150, price: 10, extra: true },
  peanuts:     { name: 'Roasted peanuts',  per100: { kcal: 567, protein: 26,  carbs: 16,  fat: 49 },  serving: 30,  price: 8,  extra: true },
};

// Indexed by Date.getDay(): 0 = Sunday ... 6 = Saturday. The same week repeats through the month.
export const WEEK_MENU = [
  { breakfast: ['poha', 'tea'],         lunch: ['vegBiryani', 'curd', 'eggCurry'],      snacks: ['samosa', 'tea'],   dinner: ['chapati', 'chickenCurry', 'rice', 'dal'] },
  { breakfast: ['idli', 'sambar', 'tea'], lunch: ['rice', 'sambar', 'vegCurry', 'curd'],  snacks: ['sprouts', 'tea'],  dinner: ['chapati', 'paneer', 'rice', 'dal'] },
  { breakfast: ['dosa', 'sambar', 'tea'], lunch: ['rice', 'dal', 'aloo', 'curd'],         snacks: ['vada', 'tea'],     dinner: ['chapati', 'eggCurry', 'rice', 'sambar'] },
  { breakfast: ['upma', 'tea'],         lunch: ['rice', 'rajma', 'vegCurry'],           snacks: ['samosa', 'tea'],   dinner: ['chapati', 'chole', 'curdRice'] },
  { breakfast: ['pongal', 'vada', 'tea'], lunch: ['rice', 'dal', 'chickenCurry'],         snacks: ['sprouts', 'tea'],  dinner: ['chapati', 'aloo', 'rice', 'dal'] },
  { breakfast: ['idli', 'vada', 'tea'], lunch: ['rice', 'sambar', 'paneer', 'curd'],    snacks: ['vada', 'tea'],     dinner: ['chickBiryani', 'curd'] },
  { breakfast: ['dosa', 'tea'],         lunch: ['rice', 'chole', 'vegCurry'],           snacks: ['samosa', 'tea'],   dinner: ['chapati', 'eggCurry', 'dal', 'rice'] },
];
