export type Sex='male'|'female';
export type Activity='sedentary'|'light'|'moderate'|'active'|'veryActive';
export type Goal='lose'|'maintain'|'gain';

export const ACTIVITY_FACTORS:Record<Activity,number>={sedentary:1.2,light:1.375,moderate:1.55,active:1.725,veryActive:1.9};

export function calcBmi(weightKg:number,heightCm:number):number{
 const heightM=heightCm/100;
 if(!(heightM>0)||!(weightKg>0))return 0;
 return weightKg/(heightM*heightM);
}

// Asian-Pacific (IDI & WPRO) cutoffs — lower thresholds than the generic WHO
// classification, matching common clinical/fitness practice in Vietnam.
export type BmiClass='underweight'|'normal'|'overweight'|'obese1'|'obese2';
export function classifyBmiAsian(bmi:number):BmiClass{
 if(bmi<18.5)return 'underweight';
 if(bmi<23)return 'normal';
 if(bmi<25)return 'overweight';
 if(bmi<30)return 'obese1';
 return 'obese2';
}

export function calcBmr(sex:Sex,weightKg:number,heightCm:number,age:number):number{
 const base=10*weightKg+6.25*heightCm-5*age;
 return sex==='male'?base+5:base-161;
}

export function calcTdee(bmr:number,activity:Activity):number{
 return bmr*ACTIVITY_FACTORS[activity];
}

const GOAL_CALORIE_MULTIPLIER:Record<Goal,number>={lose:.8,maintain:1,gain:1.12};
export function calcTargetCalories(tdee:number,goal:Goal):number{
 return tdee*GOAL_CALORIE_MULTIPLIER[goal];
}

const GOAL_PROTEIN_PER_KG:Record<Goal,number>={lose:2.2,maintain:2,gain:1.8};
const FAT_SHARE_OF_CALORIES=.25;
export interface Macros{proteinG:number;carbsG:number;fatG:number;proteinKcal:number;carbsKcal:number;fatKcal:number}
export function calcMacros(weightKg:number,calories:number,goal:Goal):Macros{
 const proteinG=GOAL_PROTEIN_PER_KG[goal]*weightKg,proteinKcal=proteinG*4;
 const fatKcal=calories*FAT_SHARE_OF_CALORIES,fatG=fatKcal/9;
 const carbsKcal=Math.max(0,calories-proteinKcal-fatKcal),carbsG=carbsKcal/4;
 return {proteinG,carbsG,fatG,proteinKcal,carbsKcal,fatKcal};
}

// Quick-reference "where to start" pointer for a PT, not a periodized program.
export function suggestGroupsForGoal(goal:Goal):string[]{
 if(goal==='lose')return ['quads','glutes','hamstrings','obliques'];
 if(goal==='gain')return ['chest','quads','glutes','midBack'];
 return ['chest','midBack','quads','obliques'];
}
