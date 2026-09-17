import {useEffect,useState} from 'react';
import {ArrowUpRight} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useLanguage} from './i18n';
import {LangToggle,AppTabs,type AppTab} from './nav';
import {MUSCLE_GROUPS} from './muscle-groups';
import {type Sex,type Activity,type Goal,calcBmi,classifyBmiAsian,type BmiClass,calcBmr,calcTdee,calcTargetCalories,calcMacros,suggestGroupsForGoal} from './calculators';

interface Inputs{sex:Sex;age:number;heightCm:number;weightKg:number;activity:Activity;goal:Goal}
const DEFAULT_INPUTS:Inputs={sex:'male',age:30,heightCm:170,weightKg:65,activity:'moderate',goal:'maintain'};
const STORAGE_KEY='pt-atlas-calc-inputs';

function loadInputs():Inputs{
 if(typeof window==='undefined')return DEFAULT_INPUTS;
 try{
  const raw=window.localStorage.getItem(STORAGE_KEY);
  if(!raw)return DEFAULT_INPUTS;
  const parsed=JSON.parse(raw) as Partial<Inputs>;
  return {...DEFAULT_INPUTS,...parsed};
 }catch{return DEFAULT_INPUTS;}
}

export interface CalculatorsPageProps{onNavigate:(tab:AppTab)=>void;onOpenGroupInAtlas:(groupId:string)=>void}

export function CalculatorsPage({onNavigate,onOpenGroupInAtlas}:CalculatorsPageProps){
 const {lang,t}=useLanguage();
 const [inputs,setInputs]=useState<Inputs>(loadInputs);
 useEffect(()=>{try{window.localStorage.setItem(STORAGE_KEY,JSON.stringify(inputs));}catch{/* localStorage unavailable */}},[inputs]);
 function setField<K extends keyof Inputs>(key:K,value:Inputs[K]){setInputs(s=>({...s,[key]:value}));}

 const bmi=calcBmi(inputs.weightKg,inputs.heightCm);
 const bmiClass=classifyBmiAsian(bmi);
 const bmr=calcBmr(inputs.sex,inputs.weightKg,inputs.heightCm,inputs.age);
 const tdee=calcTdee(bmr,inputs.activity);
 const target=calcTargetCalories(tdee,inputs.goal);
 const macros=calcMacros(inputs.weightKg,target,inputs.goal);
 const macroTotalKcal=Math.max(1,macros.proteinKcal+macros.carbsKcal+macros.fatKcal);
 const suggestedGroups=suggestGroupsForGoal(inputs.goal).map(id=>MUSCLE_GROUPS.find(g=>g.id===id)).filter((g):g is NonNullable<typeof g>=>!!g);

 const bmiLabel:Record<BmiClass,string>={underweight:t.bmiUnderweight,normal:t.bmiNormal,overweight:t.bmiOverweight,obese1:t.bmiObese1,obese2:t.bmiObese2};
 const goalLabel:Record<Goal,string>={lose:t.goalLose,maintain:t.goalMaintain,gain:t.goalGain};

 return <div className="calc-page">
  <header className="calc-header">
   <div className="calc-brand"><div className="eyebrow"><span className="status-dot"/> {t.calcEyebrow}</div><h1>PT Atlas</h1></div>
   <div className="calc-header-actions"><AppTabs tab="calculators" onChange={onNavigate}/><LangToggle/></div>
  </header>
  <main className="calc-main">
   <div className="calc-intro"><h2>{t.calcTitle}</h2><p>{t.calcSubtitle}</p></div>
   <div className="calc-grid">
    <section className="calc-card calc-form">
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
    </section>

    <section className="calc-card">
     <h3>{t.bmiResultHeading}</h3>
     <div className="calc-bmi-value">{bmi.toFixed(1)}</div>
     <span className={`calc-badge calc-badge-${bmiClass}`}>{bmiLabel[bmiClass]}</span>
     <p className="calc-note">{t.bmiAsianNote}</p>
    </section>

    <section className="calc-card">
     <h3>{t.caloriesHeading}</h3>
     <div className="calc-stat-row"><span>{t.bmrLabel}</span><strong>{Math.round(bmr).toLocaleString()} kcal</strong></div>
     <div className="calc-stat-row"><span>{t.tdeeLabel}</span><strong>{Math.round(tdee).toLocaleString()} kcal</strong></div>
     <div className="calc-stat-row calc-stat-highlight"><span>{t.targetCaloriesLabel(goalLabel[inputs.goal])}</span><strong>{Math.round(target).toLocaleString()} kcal{t.perDay}</strong></div>
    </section>

    <section className="calc-card">
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
    </section>

    <section className="calc-card calc-card-wide">
     <h3>{t.crossLinkHeading}</h3>
     <p className="calc-note">{t.crossLinkSubtitle}</p>
     <div className="calc-chip-row">
      {suggestedGroups.map(g=><button key={g.id} type="button" className="calc-chip" onClick={()=>onOpenGroupInAtlas(g.id)}>{lang==='vi'?g.nameVi:g.nameEn}<ArrowUpRight size={13}/></button>)}
     </div>
    </section>
   </div>
   <p className="calc-disclaimer">{t.calcDisclaimer}</p>
  </main>
 </div>;
}
