import {Button} from '@/components/ui/button';
import {useLanguage} from './i18n';

export function LangToggle(){
 const {lang,setLang,t}=useLanguage();
 return <div className="lang-toggle" role="group" aria-label={t.langToggleAria}>
  <Button variant="ghost" aria-pressed={lang==='vi'} className={lang==='vi'?'active':''} onClick={()=>setLang('vi')}>VI</Button>
  <Button variant="ghost" aria-pressed={lang==='en'} className={lang==='en'?'active':''} onClick={()=>setLang('en')}>EN</Button>
 </div>;
}

export type AppTab='atlas'|'calculators';
export function AppTabs({tab,onChange}:{tab:AppTab;onChange:(t:AppTab)=>void}){
 const {t}=useLanguage();
 return <div className="app-tabs" role="group" aria-label={t.appTabsAria}>
  <Button variant="ghost" aria-pressed={tab==='atlas'} className={tab==='atlas'?'active':''} onClick={()=>onChange('atlas')}>{t.tabAtlas}</Button>
  <Button variant="ghost" aria-pressed={tab==='calculators'} className={tab==='calculators'?'active':''} onClick={()=>onChange('calculators')}>{t.tabCalculators}</Button>
 </div>;
}
