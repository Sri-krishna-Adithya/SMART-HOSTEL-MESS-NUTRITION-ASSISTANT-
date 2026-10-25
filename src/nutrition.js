export const MEALS = ['breakfast', 'lunch', 'snacks', 'dinner'];

const ACTIVITY = { low: 1.2, moderate: 1.45, high: 1.65 };
const GOAL_ADJUST = { lose: -400, maintain: 0, gain: 350 };
const MAX_GRAMS = 2000;

export function calcTargets({ sex, age, heightCm, weightKg, activity, goal }) {
  if (!(age >= 14 && age <= 80)) throw new Error('Age must be between 14 and 80');
  if (!(heightCm >= 120 && heightCm <= 220)) throw new Error('Height must be between 120 and 220 cm');
  if (!(weightKg >= 30 && weightKg <= 200)) throw new Error('Weight must be between 30 and 200 kg');
  if (!(activity in ACTIVITY) || !(goal in GOAL_ADJUST)) throw new Error('Pick an activity level and a goal');

  // Mifflin-St Jeor equation
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + (sex === 'male' ? 5 : -161);
  const calories = Math.round(bmr * ACTIVITY[activity] + GOAL_ADJUST[goal]);
  const protein = Math.round(weightKg * (goal === 'gain' ? 1.8 : 1.4));
  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);
  return { calories, protein, carbs, fat };
}

export function toGrams(food, quantity, unit) {
  const q = Number(quantity);
  if (!Number.isFinite(q) || q <= 0) throw new Error('Enter a quantity greater than 0');
  const grams = unit === 'serving' ? q * food.serving : q;
  if (grams > MAX_GRAMS) throw new Error('That quantity looks too large');
  return grams;
}

export function scaleFood(food, grams) {
  const f = grams / 100;
  const { kcal, protein, carbs, fat } = food.per100;
  return { kcal: kcal * f, protein: protein * f, carbs: carbs * f, fat: fat * f };
}

export function sumEntries(entries, foods) {
  const total = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
  for (const e of entries) {
    const food = foods[e.foodId];
    if (!food) continue; // menu changed since the entry was saved
    const n = scaleFood(food, e.grams);
    total.kcal += n.kcal;
    total.protein += n.protein;
    total.carbs += n.carbs;
    total.fat += n.fat;
  }
  return total;
}

// Ranks candidate foods by how much of the remaining protein one serving covers,
// without blowing the calorie target or the budget. Price 0 means free (mess food).
export function suggestFoods({ candidates, foods, remaining, budgetLeft = Infinity, limit = 3 }) {
  if (remaining.protein <= 0 || remaining.kcal <= 0) return [];
  return candidates
    .map((id) => {
      const food = foods[id];
      const n = scaleFood(food, food.serving);
      return { id, food, nutrients: n, cost: food.price || 0 };
    })
    .filter((c) => c.cost <= budgetLeft && c.nutrients.kcal <= remaining.kcal + 50)
    .map((c) => ({ ...c, score: Math.min(c.nutrients.protein, remaining.protein) / (c.nutrients.kcal / 100) - c.cost * 0.05 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
