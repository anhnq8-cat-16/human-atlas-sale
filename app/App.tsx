import {useEffect,useState} from 'react';
import {LanguageProvider} from './i18n';
import {Studio} from './page';
import {CalculatorsPage} from './calculators-page';
import type {AppTab} from './nav';

const TAB_STORAGE_KEY='pt-atlas-tab';

function readInitialTab():AppTab{
 if(typeof window==='undefined')return 'atlas';
 try{const stored=window.localStorage.getItem(TAB_STORAGE_KEY);if(stored==='atlas'||stored==='calculators')return stored;}catch{/* localStorage unavailable */}
 return 'atlas';
}

function Router(){
 const [tab,setTabState]=useState<AppTab>(readInitialTab);
 const [pendingGroupId,setPendingGroupId]=useState<string|null>(null);
 useEffect(()=>{try{window.localStorage.setItem(TAB_STORAGE_KEY,tab);}catch{/* localStorage unavailable */}},[tab]);
 const setTab=(next:AppTab)=>setTabState(next);
 const goToAtlasGroup=(groupId:string)=>{setPendingGroupId(groupId);setTab('atlas');};
 return tab==='atlas'
  ?<Studio onNavigate={setTab} pendingGroupId={pendingGroupId} onConsumedPendingGroup={()=>setPendingGroupId(null)}/>
  :<CalculatorsPage onNavigate={setTab} onOpenGroupInAtlas={goToAtlasGroup}/>;
}

export default function App(){
 return <LanguageProvider><Router/></LanguageProvider>;
}
