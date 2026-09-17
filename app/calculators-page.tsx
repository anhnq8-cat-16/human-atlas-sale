import {useEffect,useMemo,useState} from 'react';
import {ArrowUpRight} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useLanguage} from './i18n';
import {LangToggle,AppTabs,type AppTab} from './nav';
import {MUSCLE_GROUPS} from './muscle-groups';
import {type Sex,type Activity,type Goal,calcBmi,classifyBmiAsian,type BmiClass,calcBmr,calcTdee,calcTargetCalories,calcMacros,suggestGroupsForGoal} from './calculators';
import {type InBodyInput,type BodyFatBand,type SmmBand,type VisceralBand,classifyBodyFat,classifySmm,classifyVisceral,selectLifestyleTips,suggestTraining} from './advice';
import {type DietType,type CookingLevel,type BudgetTier,type PrepTime,type AvoidTag,type MealSlot,generateMenu,MEAL_CALORIE_SHARE} from './meal-plan';

interface Inputs{sex:Sex;age:number;heightCm:number;weightKg:number;activity:Activity;goal:Goal}
const DEFAULT_INPUTS:Inputs={sex:'male',age:30,heightCm:170,weightKg:65,activity:'moderate',goal:'maintain'};
const STORAGE_KEY='pt-atlas-calc-inputs';

interface InBodyState{bodyFatPercent:string;smmKg:string;tbwPercent:string;visceralFatLevel:string}
const DEFAULT_INBODY:InBodyState={bodyFatPercent:'',smmKg:'',tbwPercent:'',visceralFatLevel:''};
const INBODY_STORAGE_KEY='pt-atlas-calc-inbody';

interface MealPrefsState{diet:DietType;cookingLevel:CookingLevel;budgetTier:BudgetTier;prepTime:PrepTime;avoid:AvoidTag[];days:7|10}
const DEFAULT_MEAL_PREFS:MealPrefsState={diet:'omnivore',cookingLevel:'basic',budgetTier:'moderate',prepTime:'min15to30',avoid:[],days:7};
const MEAL_PREFS_STORAGE_KEY='pt-atlas-calc-mealprefs';

const ALL_AVOID_TAGS:AvoidTag[]=['seafood','beef','pork','egg','dairy','nuts','gluten'];
const SLOT_ORDER:MealSlot[]=['breakfast','lunch','dinner','snack'];

function loadJSON<T>(key:string,fallback:T):T{
 if(typeof window==='undefined')return fallback;
 try{
  const raw=window.localStorage.getItem(key);
  if(!raw)return fallback;
  return {...fallback,...JSON.parse(raw) as Partial<T>};
 }catch{return fallback;}
}
function parseOptional(s:string):number|undefined{
 if(s.trim()==='')return undefined;
 const n=Number(s);
 return Number.isFinite(n)?n:undefined;
}

export interface CalculatorsPageProps{onNavigate:(tab:AppTab)=>void;onOpenGroupInAtlas:(groupId:string)=>void}

export function CalculatorsPage({onNavigate,onOpenGroupInAtlas}:CalculatorsPageProps){
 const {lang,t}=useLanguage();
 const [inputs,setInputs]=useState<Inputs>(()=>loadJSON(STORAGE_KEY,DEFAULT_INPUTS));
 const [inbody,setInbody]=useState<InBodyState>(()=>loadJSON(INBODY_STORAGE_KEY,DEFAULT_INBODY));
 const [mealPrefs,setMealPrefs]=useState<MealPrefsState>(()=>loadJSON(MEAL_PREFS_STORAGE_KEY,DEFAULT_MEAL_PREFS));
 useEffect(()=>{try{window.localStorage.setItem(STORAGE_KEY,JSON.stringify(inputs));}catch{/* localStorage unavailable */}},[inputs]);
 useEffect(()=>{try{window.localStorage.setItem(INBODY_STORAGE_KEY,JSON.stringify(inbody));}catch{/* localStorage unavailable */}},[inbody]);
 useEffect(()=>{try{window.localStorage.setItem(MEAL_PREFS_STORAGE_KEY,JSON.stringify(mealPrefs));}catch{/* localStorage unavailable */}},[mealPrefs]);
 function setField<K extends keyof Inputs>(key:K,value:Inputs[K]){setInputs(s=>({...s,[key]:value}));}
 function setInbodyField<K extends keyof InBodyState>(key:K,value:InBodyState[K]){setInbody(s=>({...s,[key]:value}));}
 function setMealField<K extends keyof MealPrefsState>(key:K,value:MealPrefsState[K]){setMealPrefs(s=>({...s,[key]:value}));}
 function toggleAvoid(tag:AvoidTag){setMealPrefs(s=>({...s,avoid:s.avoid.includes(tag)?s.avoid.filter(a=>a!==tag):[...s.avoid,tag]}));}

 const bmi=calcBmi(inputs.weightKg,inputs.heightCm);
 const bmiClass=classifyBmiAsian(bmi);
 const bmr=calcBmr(inputs.sex,inputs.weightKg,inputs.heightCm,inputs.age);
 const tdee=calcTdee(bmr,inputs.activity);
 const target=calcTargetCalories(tdee,inputs.goal);
 const macros=calcMacros(inputs.weightKg,target,inputs.goal);
 const macroTotalKcal=Math.max(1,macros.proteinKcal+macros.carbsKcal+macros.fatKcal);
 const suggestedGroups=suggestGroupsForGoal(inputs.goal).map(id=>MUSCLE_GROUPS.find(g=>g.id===id)).filter((g):g is NonNullable<typeof g>=>!!g);

 const bodyFatNum=parseOptional(inbody.bodyFatPercent);
 const smmNum=parseOptional(inbody.smmKg);
 const tbwNum=parseOptional(inbody.tbwPercent);
 const visceralNum=parseOptional(inbody.visceralFatLevel);
 const inbodyInput:InBodyInput={bodyFatPercent:bodyFatNum,smmKg:smmNum,tbwPercent:tbwNum,visceralFatLevel:visceralNum};
 const bodyFatBand=bodyFatNum!=null?classifyBodyFat(inputs.sex,bodyFatNum):undefined;
 const smmBand=smmNum!=null&&inputs.weightKg>0?classifySmm(inputs.sex,smmNum,inputs.weightKg):undefined;
 const visceralBand=visceralNum!=null?classifyVisceral(visceralNum):undefined;

 const menu=useMemo(()=>generateMenu(mealPrefs.days,{diet:mealPrefs.diet,cookingLevel:mealPrefs.cookingLevel,budgetTier:mealPrefs.budgetTier,prepTime:mealPrefs.prepTime,avoid:mealPrefs.avoid}),[mealPrefs]);
 const tips=useMemo(()=>selectLifestyleTips(inputs.goal,inputs.sex,inputs.weightKg,inbodyInput),[inputs.goal,inputs.sex,inputs.weightKg,bodyFatNum,smmNum,visceralNum]);
 const training=useMemo(()=>suggestTraining(inputs.goal,inputs.activity),[inputs.goal,inputs.activity]);

 const bmiLabel:Record<BmiClass,string>={underweight:t.bmiUnderweight,normal:t.bmiNormal,overweight:t.bmiOverweight,obese1:t.bmiObese1,obese2:t.bmiObese2};
 const goalLabel:Record<Goal,string>={lose:t.goalLose,maintain:t.goalMaintain,gain:t.goalGain};
 const bodyFatBandLabel:Record<BodyFatBand,string>={low:t.bodyFatBandLow,fitness:t.bodyFatBandFitness,average:t.bodyFatBandAverage,high:t.bodyFatBandHigh};
 const smmBandLabel:Record<SmmBand,string>={low:t.smmBandLow,average:t.smmBandAverage,high:t.smmBandHigh};
 const visceralBandLabel:Record<VisceralBand,string>={healthy:t.visceralBandHealthy,watch:t.visceralBandWatch,high:t.visceralBandHigh};
 const avoidLabel:Record<AvoidTag,string>={seafood:t.avoidSeafood,beef:t.avoidBeef,pork:t.avoidPork,egg:t.avoidEgg,dairy:t.avoidDairy,nuts:t.avoidNuts,gluten:t.avoidGluten};
 const slotLabel:Record<MealSlot,string>={breakfast:t.slotBreakfast,lunch:t.slotLunch,dinner:t.slotDinner,snack:t.slotSnack};

 return <div className="calc-page">
  <header className="calc-header">
   <div className="calc-brand"><div className="eyebrow"><span className="status-dot"/> {t.calcEyebrow}</div><h1>PT Atlas</h1></div>
   <div className="calc-header-actions"><AppTabs tab="calculators" onChange={onNavigate}/><LangToggle/></div>
  </header>
  <main className="calc-main">
   <div className="calc-intro"><h2>{t.calcTitle}</h2><p>{t.calcSubtitle}</p></div>

   <section className="calc-section">
    <div className="calc-row calc-row-2">
     <div className="calc-card">
      <h3>{t.formSectionHeading}</h3>
      <div className="calc-field">
       <label>{t.formSex}</label>
       <div className="calc-segmented">
        <button type="button" aria-pressed={inputs.sex==='male'} className={inputs.sex==='male'?'active':''} onClick={()=>setField('sex','male')}>{t.sexMale}</button>
        <button type="button" aria-pressed={inputs.sex==='female'} className={inputs.sex==='female'?'active':''} onClick={()=>setField('sex','female')}>{t.sexFemale}</button>
       </div>
      </div>
      <div className="calc-field-row">
       <div className="calc-field">
        <label htmlFor="calc-age">{t.formAge}</label>
        <div className="calc-input-unit"><input id="calc-age" type="number" inputMode="numeric" min={10} max={100} value={inputs.age} onChange={e=>setField('age',Number(e.target.value))}/><span>{t.formAgeUnit}</span></div>
       </div>
       <div className="calc-field">
        <label htmlFor="calc-height">{t.formHeight}</label>
        <div className="calc-input-unit"><input id="calc-height" type="number" inputMode="numeric" min={100} max={250} value={inputs.heightCm} onChange={e=>setField('heightCm',Number(e.target.value))}/><span>{t.formHeightUnit}</span></div>
       </div>
       <div className="calc-field">
        <label htmlFor="calc-weight">{t.formWeight}</label>
        <div className="calc-input-unit"><input id="calc-weight" type="number" inputMode="numeric" min={30} max={250} value={inputs.weightKg} onChange={e=>setField('weightKg',Number(e.target.value))}/><span>{t.formWeightUnit}</span></div>
       </div>
      </div>
      <div className="calc-field">
       <label htmlFor="calc-activity">{t.formActivity}</label>
       <select id="calc-activity" value={inputs.activity} onChange={e=>setField('activity',e.target.value as Activity)}>
        <option value="sedentary">{t.activitySedentary}</option>
        <option value="light">{t.activityLight}</option>
        <option value="moderate">{t.activityModerate}</option>
        <option value="active">{t.activityActive}</option>
        <option value="veryActive">{t.activityVeryActive}</option>
       </select>
      </div>
      <div className="calc-field">
       <label>{t.formGoal}</label>
       <div className="calc-segmented calc-segmented-3">
        <button type="button" aria-pressed={inputs.goal==='lose'} className={inputs.goal==='lose'?'active':''} onClick={()=>setField('goal','lose')}>{t.goalLose}</button>
        <button type="button" aria-pressed={inputs.goal==='maintain'} className={inputs.goal==='maintain'?'active':''} onClick={()=>setField('goal','maintain')}>{t.goalMaintain}</button>
        <button type="button" aria-pressed={inputs.goal==='gain'} className={inputs.goal==='gain'?'active':''} onClick={()=>setField('goal','gain')}>{t.goalGain}</button>
       </div>
      </div>
      <Button variant="ghost" className="calc-reset" onClick={()=>setInputs(DEFAULT_INPUTS)}>{t.resetForm}</Button>
      <p className="calc-saved-note">{t.calcSavedNote}</p>
     </div>

     <div className="calc-card">
      <h3>{t.inbodyHeading}</h3>
      <p className="calc-note calc-note-lead">{t.inbodySubtitle}</p>
      <p className="calc-inbody-recommend">{t.inbodyRecommendedNote}</p>
      <div className="calc-field-row calc-field-row-2">
       <div className="calc-field">
        <label htmlFor="calc-bodyfat">{t.inbodyBodyFat}</label>
        <div className="calc-input-unit"><input id="calc-bodyfat" type="number" inputMode="decimal" min={3} max={60} value={inbody.bodyFatPercent} onChange={e=>setInbodyField('bodyFatPercent',e.target.value)}/><span>%</span></div>
        {bodyFatBand&&<span className={`calc-badge calc-badge-inbody-${bodyFatBand}`}>{bodyFatBandLabel[bodyFatBand]}</span>}
       </div>
       <div className="calc-field">
        <label htmlFor="calc-smm">{t.inbodySmm}</label>
        <div className="calc-input-unit"><input id="calc-smm" type="number" inputMode="decimal" min={10} max={80} value={inbody.smmKg} onChange={e=>setInbodyField('smmKg',e.target.value)}/><span>kg</span></div>
        {smmBand&&<span className={`calc-badge calc-badge-inbody-${smmBand}`}>{smmBandLabel[smmBand]}</span>}
       </div>
      </div>
      <div className="calc-field-row calc-field-row-2">
       <div className="calc-field">
        <label htmlFor="calc-tbw">{t.inbodyTbw}</label>
        <div className="calc-input-unit"><input id="calc-tbw" type="number" inputMode="decimal" min={20} max={80} value={inbody.tbwPercent} onChange={e=>setInbodyField('tbwPercent',e.target.value)}/><span>%</span></div>
       </div>
       <div className="calc-field">
        <label htmlFor="calc-visceral">{t.inbodyVisceral}</label>
        <div className="calc-input-unit"><input id="calc-visceral" type="number" inputMode="numeric" min={1} max={30} value={inbody.visceralFatLevel} onChange={e=>setInbodyField('visceralFatLevel',e.target.value)}/><span>lv</span></div>
        {visceralBand&&<span className={`calc-badge calc-badge-inbody-${visceralBand==='healthy'?'low':visceralBand==='watch'?'average':'high'}`}>{visceralBandLabel[visceralBand]}</span>}
       </div>
      </div>
      <Button variant="ghost" className="calc-reset" onClick={()=>setInbody(DEFAULT_INBODY)}>{t.inbodyClear}</Button>
      <p className="calc-saved-note">{t.inbodyReferenceNote}</p>
     </div>
    </div>
   </section>

   <section className="calc-section">
    <div className="calc-row calc-row-3">
     <div className="calc-card">
      <h3>{t.bmiResultHeading}</h3>
      <div className="calc-bmi-value">{bmi.toFixed(1)}</div>
      <span className={`calc-badge calc-badge-${bmiClass}`}>{bmiLabel[bmiClass]}</span>
      <p className="calc-note">{t.bmiAsianNote}</p>
     </div>

     <div className="calc-card">
      <h3>{t.caloriesHeading}</h3>
      <div className="calc-stat-row"><span>{t.bmrLabel}</span><strong>{Math.round(bmr).toLocaleString()} kcal</strong></div>
      <div className="calc-stat-row"><span>{t.tdeeLabel}</span><strong>{Math.round(tdee).toLocaleString()} kcal</strong></div>
      <div className="calc-stat-row calc-stat-highlight"><span>{t.targetCaloriesLabel(goalLabel[inputs.goal])}</span><strong>{Math.round(target).toLocaleString()} kcal{t.perDay}</strong></div>
     </div>

     <div className="calc-card">
      <h3>{t.macrosHeading}</h3>
      <div className="calc-macro-bar" aria-hidden="true">
       <span style={{width:`${macros.proteinKcal/macroTotalKcal*100}%`,background:'#263b48'}}/>
       <span style={{width:`${macros.carbsKcal/macroTotalKcal*100}%`,background:'#458a85'}}/>
       <span style={{width:`${macros.fatKcal/macroTotalKcal*100}%`,background:'#c08a45'}}/>
      </div>
      <div className="calc-macro-list">
       <div className="calc-macro-row"><span className="calc-dot" style={{background:'#263b48'}}/>{t.proteinLabel}<strong>{Math.round(macros.proteinG)} g</strong></div>
       <div className="calc-macro-row"><span className="calc-dot" style={{background:'#458a85'}}/>{t.carbsLabel}<strong>{Math.round(macros.carbsG)} g</strong></div>
       <div className="calc-macro-row"><span className="calc-dot" style={{background:'#c08a45'}}/>{t.fatLabel}<strong>{Math.round(macros.fatG)} g</strong></div>
      </div>
     </div>
    </div>
   </section>

   <section className="calc-section">
    <div className="calc-card">
     <h3>{t.personalizeHeading}</h3>
     <div className="calc-row calc-row-2">
      <div className="calc-field">
       <label>{t.cookingHeading}</label>
       <div className="calc-segmented calc-segmented-vert">
        <button type="button" aria-pressed={mealPrefs.cookingLevel==='quick'} className={mealPrefs.cookingLevel==='quick'?'active':''} onClick={()=>setMealField('cookingLevel','quick')}>{t.cookingQuick}</button>
        <button type="button" aria-pressed={mealPrefs.cookingLevel==='basic'} className={mealPrefs.cookingLevel==='basic'?'active':''} onClick={()=>setMealField('cookingLevel','basic')}>{t.cookingBasic}</button>
        <button type="button" aria-pressed={mealPrefs.cookingLevel==='confident'} className={mealPrefs.cookingLevel==='confident'?'active':''} onClick={()=>setMealField('cookingLevel','confident')}>{t.cookingConfident}</button>
       </div>
      </div>
      <div className="calc-field">
       <label>{t.dietHeading}</label>
       <div className="calc-segmented">
        <button type="button" aria-pressed={mealPrefs.diet==='omnivore'} className={mealPrefs.diet==='omnivore'?'active':''} onClick={()=>setMealField('diet','omnivore')}>{t.dietOmnivore}</button>
        <button type="button" aria-pressed={mealPrefs.diet==='vegetarian'} className={mealPrefs.diet==='vegetarian'?'active':''} onClick={()=>setMealField('diet','vegetarian')}>{t.dietVegetarian}</button>
       </div>
       <label className="calc-field-spaced">{t.budgetHeading}</label>
       <div className="calc-segmented">
        <button type="button" aria-pressed={mealPrefs.budgetTier==='budget'} className={mealPrefs.budgetTier==='budget'?'active':''} onClick={()=>setMealField('budgetTier','budget')}>{t.budgetBudget}</button>
        <button type="button" aria-pressed={mealPrefs.budgetTier==='moderate'} className={mealPrefs.budgetTier==='moderate'?'active':''} onClick={()=>setMealField('budgetTier','moderate')}>{t.budgetModerate}</button>
        <button type="button" aria-pressed={mealPrefs.budgetTier==='generous'} className={mealPrefs.budgetTier==='generous'?'active':''} onClick={()=>setMealField('budgetTier','generous')}>{t.budgetGenerous}</button>
       </div>
       <label className="calc-field-spaced">{t.prepHeading}</label>
       <div className="calc-segmented">
        <button type="button" aria-pressed={mealPrefs.prepTime==='under15'} className={mealPrefs.prepTime==='under15'?'active':''} onClick={()=>setMealField('prepTime','under15')}>{t.prepUnder15}</button>
        <button type="button" aria-pressed={mealPrefs.prepTime==='min15to30'} className={mealPrefs.prepTime==='min15to30'?'active':''} onClick={()=>setMealField('prepTime','min15to30')}>{t.prepMin15to30}</button>
        <button type="button" aria-pressed={mealPrefs.prepTime==='over30'} className={mealPrefs.prepTime==='over30'?'active':''} onClick={()=>setMealField('prepTime','over30')}>{t.prepOver30}</button>
       </div>
      </div>
     </div>
     <div className="calc-field calc-field-spaced">
      <label>{t.avoidHeading}</label>
      <div className="calc-chip-row">
       {ALL_AVOID_TAGS.map(tag=><button key={tag} type="button" className={`calc-chip calc-chip-toggle ${mealPrefs.avoid.includes(tag)?'active':''}`} aria-pressed={mealPrefs.avoid.includes(tag)} onClick={()=>toggleAvoid(tag)}>{avoidLabel[tag]}</button>)}
      </div>
     </div>
     <div className="calc-field calc-field-spaced">
      <label>{t.daysHeading}</label>
      <div className="calc-segmented calc-segmented-narrow">
       <button type="button" aria-pressed={mealPrefs.days===7} className={mealPrefs.days===7?'active':''} onClick={()=>setMealField('days',7)}>{t.days7}</button>
       <button type="button" aria-pressed={mealPrefs.days===10} className={mealPrefs.days===10?'active':''} onClick={()=>setMealField('days',10)}>{t.days10}</button>
      </div>
     </div>
    </div>
   </section>

   <section className="calc-section">
    <div className="calc-card">
     <h3>{t.mealPlanHeading}</h3>
     <p className="calc-note calc-note-lead">{t.mealPlanFrameworkNote}</p>
     <div className="calc-menu-grid">
      {menu.map(day=><div className="calc-menu-day" key={day.day}>
       <div className="calc-menu-day-label">{t.dayLabel(day.day)}</div>
       {SLOT_ORDER.map(slot=><div className="calc-menu-slot" key={slot}>
        <div className="calc-menu-slot-label">{slotLabel[slot]} <span className="calc-menu-kcal">≈{Math.round(target*MEAL_CALORIE_SHARE[slot])} kcal</span></div>
        <div className="calc-menu-dish">{lang==='vi'?day.meals[slot].nameVi:day.meals[slot].nameEn}</div>
       </div>)}
      </div>)}
     </div>
    </div>
   </section>

   <section className="calc-section">
    <div className="calc-row calc-row-2">
     <div className="calc-card">
      <h3>{t.crossLinkHeading}</h3>
      <p className="calc-note">{t.crossLinkSubtitle}</p>
      <div className="calc-chip-row">
       {suggestedGroups.map(g=><button key={g.id} type="button" className="calc-chip" onClick={()=>onOpenGroupInAtlas(g.id)}>{lang==='vi'?g.nameVi:g.nameEn}<ArrowUpRight size={13}/></button>)}
      </div>
     </div>
     <div className="calc-card">
      <h3>{t.trainingHeading}</h3>
      <div className="calc-stat-row"><span>{t.trainingDaysLabel}</span><strong>{training.daysPerWeek}</strong></div>
      <p className="calc-note calc-training-split">{lang==='vi'?training.splitVi:training.splitEn}</p>
     </div>
    </div>
   </section>

   <section className="calc-section">
    <div className="calc-card">
     <h3>{t.lifestyleHeading}</h3>
     <ul className="pt-list calc-tips-list">
      {tips.map(tip=><li key={tip.id}>{lang==='vi'?tip.textVi:tip.textEn}</li>)}
     </ul>
    </div>
   </section>

   <div className="calc-disclaimer-box">
    <strong>{t.mealDisclaimerHeading}</strong>
    <p>{t.mealDisclaimerText}</p>
   </div>
   <p className="calc-disclaimer">{t.calcDisclaimer}</p>
  </main>
 </div>;
}
