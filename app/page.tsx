import {flushSync} from 'react-dom';
import {registerAtlasTools} from './agent-tools';
import {useEffect,useMemo,useRef,useState} from 'react';
import {Activity,ArrowUpRight,ChevronRight,Focus,Info,Layers3,Pause,RotateCcw,RotateCw,Search,X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Slider} from '@/components/ui/slider';
import {Switch} from '@/components/ui/switch';
import {Sheet,SheetContent,SheetTitle,SheetDescription} from '@/components/ui/sheet';
import {Combobox,ComboboxInput,ComboboxContent,ComboboxList,ComboboxItem,ComboboxEmpty} from '@/components/ui/combobox';
import AnatomyScene from './scene';
import {DEFAULT_VISIBLE,SYSTEMS,EXPLANATIONS,explanation,type Atlas,type Concept,type SceneState,type SystemId,type View} from './anatomy';
import {MUSCLE_GROUPS,MUSCLE_GROUP_BY_PART,type MuscleGroup} from './muscle-groups';
import {LanguageProvider,useLanguage} from './i18n';

type SearchItem = {kind:'group';group:MuscleGroup} | {kind:'concept';concept:Concept};

const initial:SceneState={explode:0,visible:DEFAULT_VISIBLE,selected:[],isolate:false,view:'three-quarter',rotate:false,reset:0};

function Studio(){
 const {lang,setLang,t}=useLanguage();
 const detailTitle=useRef<HTMLHeadingElement>(null);
 const [atlas,setAtlas]=useState<Atlas|null>(null),[state,setState]=useState(initial),[progress,setProgress]=useState(0),[error,setError]=useState(''),[panel,setPanel]=useState<'layers'|'search'|null>(null),[details,setDetails]=useState(false),[about,setAbout]=useState(false),[query,setQuery]=useState(''),[chosen,setChosen]=useState<Concept|null>(null),[chosenGroup,setChosenGroup]=useState<MuscleGroup|null>(null);
 useEffect(()=>{const abort=new AbortController();setProgress(0);setError('');setAtlas(null);setChosen(null);setChosenGroup(null);setDetails(false);setState({...initial,visible:DEFAULT_VISIBLE});fetch('/models/atlas.json',{signal:abort.signal}).then(r=>{if(!r.ok)throw new Error('load-failed');return r.json();}).then(data=>setAtlas(data as Atlas)).catch(e=>{if(e.name!=='AbortError')setError(t.loadError);});return()=>abort.abort();},[]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==='/'&&!(e.target instanceof HTMLInputElement)&&!(e.target instanceof HTMLTextAreaElement)){e.preventDefault();setPanel('search');setDetails(false);}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[]);
 const parts=useMemo(()=>new Map(atlas?.parts.map(p=>[p.id,p])),[atlas]);
 const counts=useMemo(()=>Object.fromEntries(SYSTEMS.map(s=>[s.id,atlas?.parts.filter(p=>p.system===s.id).length??0])),[atlas]);
 const activeSystems=SYSTEMS.filter(s=>counts[s.id]>0);
 const selectedParts=state.selected.map(id=>parts.get(id)).filter(p=>!!p),selected=selectedParts[0];
 const detailSystem=SYSTEMS.find(s=>s.id===(chosenGroup?'muscular':selected?.system));
 const visibleCount=atlas?.parts.filter(p=>state.isolate?state.selected.includes(p.id):state.visible.includes(p.system)||state.selected.includes(p.id)).length??0;
 const groupItems=useMemo<SearchItem[]>(()=>{
  const term=query.toLowerCase().trim();
  const list=!term?MUSCLE_GROUPS.slice():MUSCLE_GROUPS.filter(g=>g.nameVi.toLowerCase().includes(term)||g.nameEn.toLowerCase().includes(term)||g.anatomicalEn.toLowerCase().includes(term)||g.aliases.some(a=>a.includes(term)));
  return list.slice().sort((a,b)=>a.order-b.order).map(group=>({kind:'group' as const,group}));
 },[query]);
 const conceptItems=useMemo<SearchItem[]>(()=>{
  if(!atlas)return[];
  const term=query.toLowerCase().trim();
  if(!term)return[];
  return atlas.concepts.filter(c=>c.name.toLowerCase().includes(term)||c.id.toLowerCase().includes(term)).sort((a,b)=>a.name.length-b.name.length).slice(0,40).map(concept=>({kind:'concept' as const,concept}));
 },[atlas,query]);
 const searchItems=useMemo(()=>[...groupItems,...conceptItems],[groupItems,conceptItems]);
 const choose=(c:Concept)=>{setChosenGroup(null);setChosen(c);setState(s=>({...s,selected:c.elements,isolate:false,rotate:false}));setDetails(true);setPanel(null);};
 useEffect(()=>{if(!atlas)return;return registerAtlasTools(atlas,c=>flushSync(()=>choose(c)));},[atlas]);
 const selectGroup=(group:MuscleGroup)=>{setChosen(null);setChosenGroup(group);setState(s=>({...s,selected:group.partIds,isolate:false,rotate:false}));setDetails(true);setPanel(null);};
 const choosePartDirect=(id:string)=>{
  const p=parts.get(id);if(!p)return;
  setChosenGroup(null);setChosen({id:p.conceptId,name:p.name,elements:[id]});setState(s=>({...s,selected:[id],isolate:false,rotate:false}));setDetails(true);setPanel(null);
 };
 const choosePart=(id:string)=>{
  const group=MUSCLE_GROUP_BY_PART.get(id);
  if(group){selectGroup(group);return;}
  choosePartDirect(id);
 };
 const toggle=(id:SystemId)=>{setDetails(false);setState(s=>({...s,selected:[],isolate:false,visible:s.visible.includes(id)?s.visible.filter(x=>x!==id):[...s.visible,id]}));};
 const reset=()=>{setState(s=>({...initial,visible:DEFAULT_VISIBLE,reset:s.reset+1}));setChosen(null);setChosenGroup(null);setDetails(false);setPanel(null);};
 const openPanel=(next:'layers'|'search')=>{setDetails(false);setPanel(p=>p===next?null:next);};
 const clearSelection=()=>{setState(s=>({...s,selected:[],isolate:false}));setDetails(false);setChosen(null);setChosenGroup(null);};
 return <main className="studio">
  {atlas&&<AnatomyScene atlas={atlas} state={{...state,inspectorOpen:details&&(selectedParts.length>0||!!chosenGroup)}} onSelect={choosePart} onProgress={n=>{setProgress(n);if(n===100)setError('');}} onError={setError}/>}
  <div className="vignette"/>
  <header className="identity"><div className="eyebrow"><span className="status-dot"/> {t.eyebrow}</div><h1>PT Atlas<Badge variant="outline" className="edition">3D</Badge></h1><div className="identity-meta">{t.identityMeta(atlas?atlas.parts.length.toLocaleString():'2,234')}</div></header>
  <nav className="top-actions" aria-label="Explorer panels">
   <Button variant="ghost" className={panel==='search'?'active':''} onClick={()=>openPanel('search')} aria-label={t.searchNav}><Search size={18}/><span>{t.searchNav}</span><kbd>/</kbd></Button>
   <div className="lang-toggle" role="group" aria-label={t.langToggleAria}>
    <Button variant="ghost" aria-pressed={lang==='vi'} className={lang==='vi'?'active':''} onClick={()=>setLang('vi')}>VI</Button>
    <Button variant="ghost" aria-pressed={lang==='en'} className={lang==='en'?'active':''} onClick={()=>setLang('en')}>EN</Button>
   </div>
   <Button variant="ghost" className="icon-button" aria-label={t.aboutNav} onClick={()=>{setDetails(false);setPanel(null);setAbout(true);}}><Info size={18}/></Button>
  </nav>
  <section className={`layers-panel glass ${panel==='layers'?'mobile-open':''}`} aria-label={t.systemsHeading}>
   <div className="panel-heading"><span>{t.systemsHeading}</span><Button variant="ghost" className="mobile-only icon-button" onClick={()=>setPanel(null)} aria-label={t.closeSystems}><X size={18}/></Button><Badge variant="secondary" className="desktop-only small-number">{activeSystems.length}</Badge></div>
   <div className="layer-presets"><Button variant="ghost" aria-pressed={activeSystems.every(x=>state.visible.includes(x.id))} onClick={()=>setState(s=>({...s,selected:[],isolate:false,visible:activeSystems.map(x=>x.id)}))}>{t.presetAll}</Button><Button variant="ghost" aria-pressed={state.visible.length===1&&state.visible[0]==='muscular'} onClick={()=>setState(s=>({...s,selected:[],isolate:false,visible:['muscular']}))}>{t.presetMuscles}</Button><Button variant="ghost" aria-pressed={state.visible.length===1&&state.visible[0]==='skeletal'} onClick={()=>setState(s=>({...s,selected:[],isolate:false,visible:['skeletal']}))}>{t.presetSkeleton}</Button></div>
   <div className="system-list">{activeSystems.map(s=>{const name=lang==='vi'?s.nameVi:s.name;return <div className={`system-row ${state.visible.includes(s.id)?'enabled':''}`} key={s.id}><Button variant="ghost" className="system-name" title={t.showOnly(name)} onClick={()=>setState(v=>({...v,visible:[s.id],isolate:false,selected:[]}))}><span className="system-dot" style={{background:s.color}}/>{name}<span className="system-count">{counts[s.id]}</span></Button><Switch checked={state.visible.includes(s.id)} onCheckedChange={()=>toggle(s.id)} aria-label={t.showOnly(name)} /></div>;})}</div>
   <div className="panel-foot"><span>{t.piecesVisible(visibleCount.toLocaleString())}</span><Button variant="ghost" onClick={()=>setState(s=>({...s,visible:[],selected:[],isolate:false}))}>{t.hideAll}</Button></div>
  </section>
  {panel==='search'&&<section className="search-panel glass" aria-label={t.searchHeading}>
   <div className="panel-heading"><span>{t.searchHeading}</span><Button variant="ghost" className="icon-button" onClick={()=>setPanel(null)} aria-label={t.closeSearch}><X size={18}/></Button></div>
   <Combobox<SearchItem> items={searchItems} value={null} onValueChange={item=>{if(!item)return;if(item.kind==='group')selectGroup(item.group);else choose(item.concept);}} inputValue={query} onInputValueChange={setQuery} itemToStringLabel={item=>item.kind==='group'?(lang==='vi'?item.group.nameVi:item.group.nameEn):item.concept.name} filter={null} open onOpenChange={open=>{if(!open)setPanel(null);}}>
    <ComboboxInput autoFocus placeholder={t.searchPlaceholder} aria-label={t.searchHeading} showTrigger={false}/>
    <ComboboxContent className="anatomy-search-results">
     <ComboboxEmpty>{t.searchEmpty}</ComboboxEmpty>
     <ComboboxList>{(item:SearchItem)=>item.kind==='group'
       ?<ComboboxItem key={`g-${item.group.id}`} value={item}><span className="search-result-name">{lang==='vi'?item.group.nameVi:item.group.nameEn}<span className="search-result-sub">{lang==='vi'?item.group.nameEn:item.group.nameVi}</span></span>{item.group.partIds.length===0&&<span className="small-number no-mesh-tag">{t.noMeshBadge}</span>}</ComboboxItem>
       :<ComboboxItem key={`c-${item.concept.id}`} value={item}><span className="search-result-name">{item.concept.name}</span><span className="small-number">{item.concept.elements.length} {item.concept.elements.length===1?'piece':'pieces'}</span></ComboboxItem>
     }</ComboboxList>
    </ComboboxContent>
   </Combobox>
   <p className="search-note">{query?t.searchNoteQuery:t.searchNoteDefault}</p>
  </section>}
  <nav className="view-controls glass" aria-label="Camera controls">{(['three-quarter','front','side','back'] as View[]).map((v,i)=><Button variant="ghost" key={v} className={state.view===v?'active':''} aria-pressed={state.view===v} disabled={state.explode>.8&&v!=='front'} onClick={()=>setState(s=>({...s,view:v,reset:s.reset+1,rotate:false}))} title={t.viewLabel(v)} aria-label={t.viewLabel(v)}><span>{['¾','F','S','B'][i]}</span></Button>)}<i/><Button variant="ghost" disabled={state.explode>=.4} aria-label={state.rotate?t.pauseRotation:t.rotateBody} title={t.autoRotate} className={state.rotate?'active':''} onClick={()=>setState(s=>({...s,rotate:!s.rotate}))}>{state.rotate?<Pause size={17}/>:<RotateCw size={18}/>}</Button><Button variant="ghost" aria-label={t.resetAria} title={t.resetTitle} onClick={reset}><RotateCcw size={17}/></Button></nav>
  <div className="scene-caption"><span className="caption-line"/><span>{state.isolate?(chosenGroup?(lang==='vi'?chosenGroup.nameVi:chosenGroup.nameEn):(chosen?.name??t.captionDefault)):state.explode>.95?t.captionInventory:state.explode>.05?t.captionSeparated:t.captionDefault}</span><span className="caption-line"/></div>
  <div className="bottom-dock glass"><Button variant="ghost" className="mobile-only dock-layers" onClick={()=>openPanel('layers')} aria-label={t.openSystems}><Layers3 size={20}/><span>{t.dockSystems}</span></Button><div className="explode-control"><div className="explode-label"><label id="explode-label">{t.explodeLabel}</label><output>{Math.round(state.explode*100)}<span>%</span></output></div><Slider aria-labelledby="explode-label" min={0} max={100} step={1} value={[state.explode*100]} onValueChange={v=>setState(s=>({...s,explode:(Array.isArray(v)?v[0]:v)/100,view:(Array.isArray(v)?v[0]:v)>80?'front':s.view,rotate:false}))}/><div className="slider-endpoints"><span>{t.assembled}</span><span>{t.everyPiece}</span></div></div><Button variant="ghost" className="dock-reset" onClick={reset} aria-label={t.resetAssemble}><RotateCcw size={18}/><span>{t.dockReset}</span></Button></div>
  <footer className="studio-footer"><span>{state.explode>.8?t.footerOrbitExplode:t.footerOrbit} <b>·</b> {t.footerPinch} <b>·</b> {t.footerTap}</span><Button variant="ghost" onClick={()=>{setDetails(false);setPanel(null);setAbout(true);}}>{t.sourceCredits} <ArrowUpRight size={12}/></Button></footer>
  {progress<100&&!error&&<div className="loading glass" role="status"><Activity size={18}/><div><strong>{t.loadingTitle}</strong><span>{t.loadingSubtitle(String(progress),atlas?atlas.parts.length.toLocaleString():'2,234')}</span><div className="loading-track"><i style={{width:`${progress}%`}}/></div></div></div>}
  {error&&<div className="loading glass error" role="alert"><p>{error}</p><Button variant="ghost" onClick={()=>location.reload()}>{t.reloadViewer}</Button></div>}
  <Sheet open={details&&(selectedParts.length>0||!!chosenGroup)} modal={false} disablePointerDismissal onOpenChange={setDetails}>
   <SheetContent initialFocus={detailTitle} className={`detail-sheet glass ${state.isolate?'is-isolated':''} ${chosenGroup?'is-pt-group':''}`} showCloseButton={true}>
    <div className="detail-header">
     <div className="detail-accent" style={{background:detailSystem?.color}}/>
     <div className="eyebrow">{(lang==='vi'?detailSystem?.nameVi:detailSystem?.name)?.toUpperCase()??'ANATOMY'}</div>
     <SheetTitle ref={detailTitle} tabIndex={-1} className="structure-title">{chosenGroup?(lang==='vi'?chosenGroup.nameVi:chosenGroup.nameEn):chosen?.name}</SheetTitle>
     {chosenGroup&&<div className="structure-subtitle">{lang==='vi'?`${chosenGroup.nameEn} · ${chosenGroup.anatomicalEn}`:chosenGroup.nameVi}</div>}
    </div>
    <div className="detail-scroll" key={`${chosenGroup?.id??chosen?.id}-${state.isolate}`}>
     {chosenGroup?<>
      <SheetDescription className="structure-description">{lang==='vi'?chosenGroup.functionVi:chosenGroup.functionEn}</SheetDescription>
      {(chosenGroup.noteVi||chosenGroup.noteEn)&&<p className="context-note pt-note">{lang==='vi'?chosenGroup.noteVi:chosenGroup.noteEn}</p>}
      <div className="pt-block"><h3>{t.exercisesHeading}</h3><ul className="pt-list">{(lang==='vi'?chosenGroup.exercisesVi:chosenGroup.exercisesEn).map((ex,i)=><li key={i}>{ex}</li>)}</ul></div>
      <div className="pt-block"><h3>{t.tipsHeading}</h3><ul className="pt-list pt-tips">{(lang==='vi'?chosenGroup.tipsVi:chosenGroup.tipsEn).map((tip,i)=><li key={i}>{tip}</li>)}</ul></div>
     </>:<>
      <SheetDescription className="structure-description">{chosen&&selected?explanation(chosen.name,selected.system,lang):''}</SheetDescription>
      {chosen&&!EXPLANATIONS[chosen.name.toLowerCase()]&&<span className="context-note">{t.contextNote}</span>}
     </>}
     <div className="structure-meta"><span>{t.atlasReference}<strong>{chosenGroup?chosenGroup.anatomicalEn:chosen?.id}</strong></span><span>{t.selectedPieces}<strong>{state.selected.length.toLocaleString()}</strong></span></div>
     {selectedParts.length>1&&<div className="member-list"><h3>{t.includedStructures}</h3>{selectedParts.slice(0,50).map(p=><Button variant="ghost" key={p.id} onClick={()=>choosePartDirect(p.id)}><span>{p.name}</span><ChevronRight size={14}/></Button>)}{selectedParts.length>50&&<p>{t.moreModeledPieces(selectedParts.length-50)}</p>}</div>}
     <a className="source-link" href="https://lifesciencedb.jp/bp3d/" target="_blank" rel="noreferrer">{t.viewAnatomicalSource} <ArrowUpRight size={14}/></a>
    </div>
    <div className="detail-actions"><Button className={`primary-action ${state.isolate?'active':''}`} disabled={state.selected.length===0} onClick={()=>setState(s=>({...s,isolate:!s.isolate,explode:0}))}><Focus size={18}/>{state.isolate?t.showSurrounding:t.isolateStructure}<ChevronRight size={16}/></Button><Button variant="ghost" className="secondary-action" onClick={clearSelection}>{t.clearSelection}</Button></div>
   </SheetContent>
  </Sheet>
  <Sheet open={about} onOpenChange={setAbout}>
   <SheetContent className="about-sheet glass">
    <div className="eyebrow">{t.aboutEyebrow}</div>
    <SheetTitle className="structure-title">{t.aboutTitle}</SheetTitle>
    <SheetDescription>{t.aboutDescription}</SheetDescription>
    <div className="about-copy">
     <p><strong>{lang==='vi'?'Nam · BodyParts3D':'Male · BodyParts3D'}</strong><br/>{t.aboutP1(atlas?atlas.parts.length.toLocaleString():'2,234')}</p>
     <p>{t.aboutP2}</p>
     <p>{t.aboutP3}</p>
     <h3>{t.aboutSourceHeading}</h3>
     <p>{t.aboutSourceP1}</p>
     <a href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html" target="_blank" rel="noreferrer">{t.datasetLicense} <ArrowUpRight size={14}/></a>
     <a href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html" target="_blank" rel="noreferrer">{t.originalGeometry} <ArrowUpRight size={14}/></a>
     <a href="https://academic.oup.com/nar/article/37/suppl_1/D782/1000752" target="_blank" rel="noreferrer">{t.readPublication} <ArrowUpRight size={14}/></a>
    </div>
   </SheetContent>
  </Sheet>
 </main>;
}

export default function Home(){
 return <LanguageProvider><Studio/></LanguageProvider>;
}
