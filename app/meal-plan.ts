// "Khung nhóm thực phẩm" (food-group framework) menu generator — not a clinical
// meal plan. Each dish is a concrete example of a food-group combination, tagged
// so it can be filtered by what the client can actually cook, afford, and eat.
// Rotates deterministically across the requested day count so the same client
// preferences always produce the same menu (no randomness to keep it reproducible
// for a PT re-opening the same session).

export type MealSlot='breakfast'|'lunch'|'dinner'|'snack';
export type DietType='omnivore'|'vegetarian';
export type CookingLevel='quick'|'basic'|'confident';
export type BudgetTier='budget'|'moderate'|'generous';
export type PrepTime='under15'|'min15to30'|'over30';
export type AvoidTag='seafood'|'beef'|'pork'|'egg'|'dairy'|'nuts'|'gluten';

const COOKING_ORDER:Record<CookingLevel,number>={quick:0,basic:1,confident:2};
const BUDGET_ORDER:Record<BudgetTier,number>={budget:0,moderate:1,generous:2};
const PREP_ORDER:Record<PrepTime,number>={under15:0,min15to30:1,over30:2};

export interface Dish{
 id:string;slot:MealSlot;nameVi:string;nameEn:string;
 diet:DietType|'both';cookingLevel:CookingLevel;budgetTier:BudgetTier;prepTime:PrepTime;avoid:AvoidTag[];
}

export interface MealPrefs{
 diet:DietType;cookingLevel:CookingLevel;budgetTier:BudgetTier;prepTime:PrepTime;avoid:AvoidTag[];
}

// Every slot below includes at least one dish with diet:'both', cookingLevel:'quick',
// budgetTier:'budget', prepTime:'under15' and avoid:[] — a guaranteed match for the
// most restrictive preference combination, so the generator never has to show an
// empty cell.
export const DISHES:Dish[]=[
 // Breakfast
 {id:'b1',slot:'breakfast',nameVi:'Phở gà',nameEn:'Chicken pho',diet:'omnivore',cookingLevel:'quick',budgetTier:'budget',prepTime:'under15',avoid:[]},
 {id:'b2',slot:'breakfast',nameVi:'Bánh mì trứng ốp la',nameEn:'Baguette with fried egg',diet:'both',cookingLevel:'quick',budgetTier:'budget',prepTime:'under15',avoid:['egg','gluten']},
 {id:'b3',slot:'breakfast',nameVi:'Xôi đậu xanh',nameEn:'Mung bean sticky rice',diet:'both',cookingLevel:'quick',budgetTier:'budget',prepTime:'under15',avoid:[]},
 {id:'b4',slot:'breakfast',nameVi:'Cháo yến mạch chuối',nameEn:'Oatmeal with banana',diet:'both',cookingLevel:'quick',budgetTier:'budget',prepTime:'under15',avoid:[]},
 {id:'b5',slot:'breakfast',nameVi:'Bún chả',nameEn:'Grilled pork with rice vermicelli',diet:'omnivore',cookingLevel:'basic',budgetTier:'budget',prepTime:'min15to30',avoid:['pork']},
 {id:'b6',slot:'breakfast',nameVi:'Sinh tố trái cây + sữa chua',nameEn:'Fruit smoothie with yogurt',diet:'both',cookingLevel:'quick',budgetTier:'budget',prepTime:'under15',avoid:['dairy']},
 {id:'b7',slot:'breakfast',nameVi:'Bánh cuốn chay',nameEn:'Steamed rice rolls (vegetarian)',diet:'both',cookingLevel:'basic',budgetTier:'budget',prepTime:'min15to30',avoid:['gluten']},
 {id:'b8',slot:'breakfast',nameVi:'Trứng luộc + khoai lang + rau',nameEn:'Boiled eggs, sweet potato & greens',diet:'both',cookingLevel:'quick',budgetTier:'budget',prepTime:'under15',avoid:['egg']},
 {id:'b9',slot:'breakfast',nameVi:'Cơm tấm sườn',nameEn:'Broken rice with grilled pork chop',diet:'omnivore',cookingLevel:'basic',budgetTier:'moderate',prepTime:'min15to30',avoid:['pork']},
 {id:'b10',slot:'breakfast',nameVi:'Bún đậu (chay)',nameEn:'Vermicelli with fried tofu (vegetarian)',diet:'vegetarian',cookingLevel:'basic',budgetTier:'budget',prepTime:'min15to30',avoid:[]},
 {id:'b11',slot:'breakfast',nameVi:'Yến mạch hạt (không sữa)',nameEn:'Overnight oats with nuts (dairy-free)',diet:'both',cookingLevel:'quick',budgetTier:'moderate',prepTime:'under15',avoid:['nuts']},
 // Lunch
 {id:'l1',slot:'lunch',nameVi:'Cơm + rau luộc + đậu hũ chiên',nameEn:'Rice, boiled greens & fried tofu',diet:'both',cookingLevel:'quick',budgetTier:'budget',prepTime:'under15',avoid:[]},
 {id:'l2',slot:'lunch',nameVi:'Cơm + cá kho + rau luộc',nameEn:'Rice, braised fish & boiled greens',diet:'omnivore',cookingLevel:'basic',budgetTier:'budget',prepTime:'min15to30',avoid:['seafood']},
 {id:'l3',slot:'lunch',nameVi:'Cơm + thịt kho trứng + canh rau',nameEn:'Rice, braised pork & egg, veg soup',diet:'omnivore',cookingLevel:'basic',budgetTier:'budget',prepTime:'min15to30',avoid:['pork','egg']},
 {id:'l4',slot:'lunch',nameVi:'Cơm + đậu hũ sốt cà + rau xào',nameEn:'Rice, tofu in tomato sauce & stir-fried greens',diet:'vegetarian',cookingLevel:'quick',budgetTier:'budget',prepTime:'under15',avoid:[]},
 {id:'l5',slot:'lunch',nameVi:'Bún thịt nướng',nameEn:'Grilled pork vermicelli bowl',diet:'omnivore',cookingLevel:'basic',budgetTier:'budget',prepTime:'min15to30',avoid:['pork','nuts']},
 {id:'l6',slot:'lunch',nameVi:'Cơm gà xé + salad',nameEn:'Shredded chicken rice with salad',diet:'omnivore',cookingLevel:'quick',budgetTier:'budget',prepTime:'under15',avoid:[]},
 {id:'l7',slot:'lunch',nameVi:'Canh chua cá + cơm',nameEn:'Sweet & sour fish soup with rice',diet:'omnivore',cookingLevel:'confident',budgetTier:'moderate',prepTime:'over30',avoid:['seafood']},
 {id:'l8',slot:'lunch',nameVi:'Bún bò Huế',nameEn:'Spicy Huế-style beef noodle soup',diet:'omnivore',cookingLevel:'confident',budgetTier:'moderate',prepTime:'over30',avoid:['beef']},
 {id:'l9',slot:'lunch',nameVi:'Cơm + đậu que xào thịt bò',nameEn:'Rice with beef & green bean stir-fry',diet:'omnivore',cookingLevel:'basic',budgetTier:'moderate',prepTime:'min15to30',avoid:['beef']},
 {id:'l10',slot:'lunch',nameVi:'Salad ức gà áp chảo',nameEn:'Pan-seared chicken breast salad',diet:'omnivore',cookingLevel:'basic',budgetTier:'moderate',prepTime:'min15to30',avoid:[]},
 {id:'l11',slot:'lunch',nameVi:'Cơm chay thập cẩm',nameEn:'Mixed vegetarian rice plate',diet:'vegetarian',cookingLevel:'basic',budgetTier:'budget',prepTime:'min15to30',avoid:[]},
 {id:'l12',slot:'lunch',nameVi:'Súp lơ xào tôm + cơm',nameEn:'Broccoli & shrimp stir-fry with rice',diet:'omnivore',cookingLevel:'basic',budgetTier:'generous',prepTime:'min15to30',avoid:['seafood']},
 // Dinner
 {id:'d1',slot:'dinner',nameVi:'Canh rau + đậu hũ hấp + cơm ít',nameEn:'Vegetable soup, steamed tofu & a little rice',diet:'both',cookingLevel:'quick',budgetTier:'budget',prepTime:'under15',avoid:[]},
 {id:'d2',slot:'dinner',nameVi:'Ức gà áp chảo + rau củ hấp',nameEn:'Pan-seared chicken breast & steamed vegetables',diet:'omnivore',cookingLevel:'basic',budgetTier:'moderate',prepTime:'min15to30',avoid:[]},
 {id:'d3',slot:'dinner',nameVi:'Cá hấp + rau luộc + cơm ít',nameEn:'Steamed fish, boiled greens & a little rice',diet:'omnivore',cookingLevel:'basic',budgetTier:'moderate',prepTime:'min15to30',avoid:['seafood']},
 {id:'d4',slot:'dinner',nameVi:'Trứng chiên rau củ + salad',nameEn:'Vegetable omelet with salad',diet:'both',cookingLevel:'quick',budgetTier:'budget',prepTime:'under15',avoid:['egg']},
 {id:'d5',slot:'dinner',nameVi:'Thịt bò xào rau củ + cơm ít',nameEn:'Beef & vegetable stir-fry with a little rice',diet:'omnivore',cookingLevel:'basic',budgetTier:'moderate',prepTime:'min15to30',avoid:['beef']},
 {id:'d6',slot:'dinner',nameVi:'Đậu hũ kho nấm + rau luộc',nameEn:'Braised tofu with mushroom & boiled greens',diet:'vegetarian',cookingLevel:'basic',budgetTier:'budget',prepTime:'min15to30',avoid:[]},
 {id:'d7',slot:'dinner',nameVi:'Canh bí đỏ nấu tôm + cơm ít',nameEn:'Pumpkin & shrimp soup with a little rice',diet:'omnivore',cookingLevel:'basic',budgetTier:'moderate',prepTime:'min15to30',avoid:['seafood']},
 {id:'d8',slot:'dinner',nameVi:'Canh cua rau đay + cơm',nameEn:'Jute leaf soup with crab & rice',diet:'omnivore',cookingLevel:'confident',budgetTier:'generous',prepTime:'over30',avoid:['seafood']},
 {id:'d9',slot:'dinner',nameVi:'Salad cá ngừ',nameEn:'Tuna salad',diet:'omnivore',cookingLevel:'quick',budgetTier:'moderate',prepTime:'under15',avoid:['seafood']},
 {id:'d10',slot:'dinner',nameVi:'Gà kho gừng + rau luộc + cơm ít',nameEn:'Ginger-braised chicken, boiled greens & a little rice',diet:'omnivore',cookingLevel:'basic',budgetTier:'budget',prepTime:'min15to30',avoid:[]},
 // Snack
 {id:'s1',slot:'snack',nameVi:'Trái cây tươi theo mùa',nameEn:'Seasonal fresh fruit',diet:'both',cookingLevel:'quick',budgetTier:'budget',prepTime:'under15',avoid:[]},
 {id:'s2',slot:'snack',nameVi:'Sữa chua không đường + hạt',nameEn:'Unsweetened yogurt with nuts',diet:'both',cookingLevel:'quick',budgetTier:'budget',prepTime:'under15',avoid:['dairy','nuts']},
 {id:'s3',slot:'snack',nameVi:'Chuối + bơ đậu phộng',nameEn:'Banana with peanut butter',diet:'both',cookingLevel:'quick',budgetTier:'budget',prepTime:'under15',avoid:['nuts']},
 {id:'s4',slot:'snack',nameVi:'Trứng luộc',nameEn:'Boiled egg',diet:'both',cookingLevel:'quick',budgetTier:'budget',prepTime:'under15',avoid:['egg']},
 {id:'s5',slot:'snack',nameVi:'Sữa hạt không đường',nameEn:'Unsweetened plant milk',diet:'both',cookingLevel:'quick',budgetTier:'moderate',prepTime:'under15',avoid:['nuts']},
 {id:'s6',slot:'snack',nameVi:'Khoai lang luộc',nameEn:'Boiled sweet potato',diet:'both',cookingLevel:'quick',budgetTier:'budget',prepTime:'under15',avoid:[]},
 {id:'s7',slot:'snack',nameVi:'Ức gà luộc xé nhỏ',nameEn:'Shredded boiled chicken breast',diet:'omnivore',cookingLevel:'basic',budgetTier:'moderate',prepTime:'min15to30',avoid:[]},
 {id:'s8',slot:'snack',nameVi:'Hạt điều/hạnh nhân rang',nameEn:'Roasted cashews or almonds',diet:'both',cookingLevel:'quick',budgetTier:'moderate',prepTime:'under15',avoid:['nuts']},
];

function fits(dish:Dish,prefs:MealPrefs):boolean{
 if(dish.diet!=='both'&&dish.diet!==prefs.diet)return false;
 if(COOKING_ORDER[prefs.cookingLevel]<COOKING_ORDER[dish.cookingLevel])return false;
 if(BUDGET_ORDER[prefs.budgetTier]<BUDGET_ORDER[dish.budgetTier])return false;
 if(PREP_ORDER[prefs.prepTime]<PREP_ORDER[dish.prepTime])return false;
 if(dish.avoid.some(a=>prefs.avoid.includes(a)))return false;
 return true;
}

// Zero avoid tags, diet 'both', the loosest cooking/budget/prep tier — every slot
// has one, so this is always a valid match regardless of prefs.
const UNIVERSAL_FALLBACK:Record<MealSlot,string>={breakfast:'b4',lunch:'l1',dinner:'d1',snack:'s1'};

export interface DayMenu{day:number;meals:Record<MealSlot,Dish>}

export function generateMenu(days:number,prefs:MealPrefs):DayMenu[]{
 const bySlot:Record<MealSlot,Dish[]>={breakfast:[],lunch:[],dinner:[],snack:[]};
 for(const dish of DISHES)bySlot[dish.slot].push(dish);
 const pools:Record<MealSlot,Dish[]>={
  breakfast:bySlot.breakfast.filter(d=>fits(d,prefs)),
  lunch:bySlot.lunch.filter(d=>fits(d,prefs)),
  dinner:bySlot.dinner.filter(d=>fits(d,prefs)),
  snack:bySlot.snack.filter(d=>fits(d,prefs)),
 };
 const fallback=(slot:MealSlot)=>DISHES.find(d=>d.id===UNIVERSAL_FALLBACK[slot])!;
 (Object.keys(pools) as MealSlot[]).forEach(slot=>{if(pools[slot].length===0)pools[slot]=[fallback(slot)];});
 const result:DayMenu[]=[];
 for(let day=1;day<=days;day++){
  const meals={} as Record<MealSlot,Dish>;
  (Object.keys(pools) as MealSlot[]).forEach(slot=>{
   const pool=pools[slot];
   meals[slot]=pool[(day-1)%pool.length];
  });
  result.push({day,meals});
 }
 return result;
}

// Rough per-meal share of the day's calorie target, used only to label meal
// cards with an approximate band — not a precise per-dish calorie count.
export const MEAL_CALORIE_SHARE:Record<MealSlot,number>={breakfast:.25,lunch:.35,dinner:.3,snack:.1};
