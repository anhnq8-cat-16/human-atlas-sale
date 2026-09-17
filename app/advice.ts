import type {Sex,Goal,Activity} from './calculators';

export interface InBodyInput{bodyFatPercent?:number;smmKg?:number;tbwPercent?:number;visceralFatLevel?:number}

// General reference bands for a PT consultation tool — not clinical diagnostic
// cutoffs. Body-fat bands follow commonly cited ACE-style categories; SMM is
// expressed as a %-of-bodyweight ratio (a common simplification since precise
// norms are device/population-specific); visceral fat follows the level bands
// most InBody consumer reports use (1–9 healthy, 10–14 watch, 15+ high).
export type BodyFatBand='low'|'fitness'|'average'|'high';
export function classifyBodyFat(sex:Sex,percent:number):BodyFatBand{
 if(sex==='male'){
  if(percent<14)return 'low';
  if(percent<18)return 'fitness';
  if(percent<25)return 'average';
  return 'high';
 }
 if(percent<21)return 'low';
 if(percent<25)return 'fitness';
 if(percent<32)return 'average';
 return 'high';
}

export type SmmBand='low'|'average'|'high';
export function classifySmm(sex:Sex,smmKg:number,weightKg:number):SmmBand{
 if(!(weightKg>0)||!(smmKg>=0))return 'average';
 const ratio=smmKg/weightKg*100;
 if(sex==='male'){
  if(ratio<40)return 'low';
  if(ratio<45)return 'average';
  return 'high';
 }
 if(ratio<31)return 'low';
 if(ratio<36)return 'average';
 return 'high';
}

export type VisceralBand='healthy'|'watch'|'high';
export function classifyVisceral(level:number):VisceralBand{
 if(level<=9)return 'healthy';
 if(level<=14)return 'watch';
 return 'high';
}

export interface Tip{id:string;textVi:string;textEn:string}

const UNIVERSAL_TIPS:Tip[]=[
 {id:'sleep',textVi:'Ngủ đủ 7–8 tiếng/đêm — ưu tiên ngang với tập luyện và ăn uống.',textEn:'Get 7–8 hours of sleep a night — treat it as equally important as training and diet.'},
 {id:'water',textVi:'Uống đủ nước, khoảng 35ml/kg cân nặng mỗi ngày, nhất là quanh buổi tập.',textEn:'Drink enough water — roughly 35ml per kg of body weight a day, especially around training.'},
];

const GOAL_TIPS:Record<Goal,Tip[]>={
 lose:[
  {id:'lose-neat',textVi:'Tăng vận động ngoài phòng gym (đi bộ, đi cầu thang bộ) — vận động không tập luyện (NEAT) ảnh hưởng nhiều đến tổng năng lượng tiêu hao trong ngày.',textEn:'Increase everyday movement outside the gym (walking, stairs) — non-exercise activity (NEAT) has a big effect on total daily energy burn.'},
  {id:'lose-whole-food',textVi:'Ưu tiên thực phẩm nguyên chất, hạn chế đồ uống có đường và rượu bia trong giai đoạn giảm cân.',textEn:'Favor whole foods and limit sugary drinks and alcohol during a cutting phase.'},
  {id:'lose-portion',textVi:'Ước lượng khẩu phần bằng tay (lòng bàn tay, nắm tay) thay vì cân đo quá khắt khe — dễ duy trì lâu dài hơn.',textEn:'Estimate portions with your hand (palm, fist) rather than strict weighing — easier to sustain long term.'},
 ],
 gain:[
  {id:'gain-no-skip',textVi:'Ăn đủ bữa, không bỏ bữa — thặng dư calo cần đều đặn mỗi ngày để tăng cơ hiệu quả.',textEn:"Don't skip meals — a calorie surplus needs to be consistent day to day to build muscle effectively."},
  {id:'gain-recovery',textVi:'Ưu tiên ngủ đủ giấc và giảm stress — đây là thời điểm cơ phục hồi và phát triển.',textEn:'Prioritize sleep and stress management — this is when muscle recovers and grows.'},
  {id:'gain-overload',textVi:'Tăng tạ/khối lượng tập từ từ mỗi 1–2 tuần (progressive overload) thay vì tăng đột ngột.',textEn:'Increase training load gradually every 1–2 weeks (progressive overload) rather than jumping up suddenly.'},
 ],
 maintain:[
  {id:'maintain-vary',textVi:'Duy trì lịch tập đều đặn, thay đổi bài tập định kỳ để tránh nhàm chán và chững lại (plateau).',textEn:'Keep a consistent training schedule and rotate exercises periodically to avoid boredom and plateaus.'},
  {id:'maintain-track',textVi:'Theo dõi cân nặng/vòng eo định kỳ (1–2 tuần/lần) để phát hiện sớm xu hướng thay đổi.',textEn:'Check weight/waist measurement periodically (every 1–2 weeks) to catch trends early.'},
 ],
};

const INBODY_TIPS:{id:string;when:(i:InBodyInput,sex:Sex,weightKg:number)=>boolean;textVi:string;textEn:string}[]=[
 {
  id:'visceral-watch',
  when:i=>i.visceralFatLevel!=null&&classifyVisceral(i.visceralFatLevel)!=='healthy',
  textVi:'Mỡ nội tạng đang ở mức cần chú ý — nên tăng cường bài tập tim mạch (cardio) và khuyến khích khách kiểm tra sức khỏe tổng quát định kỳ.',
  textEn:'Visceral fat is at a level worth watching — add more cardio and encourage the client to get regular general health checkups.',
 },
 {
  id:'smm-low',
  when:(i,sex,weightKg)=>i.smmKg!=null&&classifySmm(sex,i.smmKg,weightKg)==='low',
  textVi:'Khối cơ xương đang thấp hơn khung tham khảo — ưu tiên bài tập kháng lực (tạ) và đảm bảo đủ đạm mỗi bữa.',
  textEn:'Skeletal muscle mass is below the reference range — prioritize resistance training and make sure protein is adequate at every meal.',
 },
 {
  id:'fat-high',
  when:(i,sex)=>i.bodyFatPercent!=null&&classifyBodyFat(sex,i.bodyFatPercent)==='high',
  textVi:'Tỷ lệ mỡ cơ thể đang ở mức cao — có thể trao đổi thêm với khách về việc ưu tiên mục tiêu giảm mỡ trước.',
  textEn:'Body fat percentage is on the high side — worth discussing with the client whether to prioritize fat loss first.',
 },
];

export function selectLifestyleTips(goal:Goal,sex:Sex,weightKg:number,inbody:InBodyInput={}):Tip[]{
 const tips=[...UNIVERSAL_TIPS,...GOAL_TIPS[goal]];
 for(const t of INBODY_TIPS)if(t.when(inbody,sex,weightKg))tips.push({id:t.id,textVi:t.textVi,textEn:t.textEn});
 return tips;
}

export interface TrainingSuggestion{daysPerWeek:string;splitVi:string;splitEn:string}
export function suggestTraining(goal:Goal,activity:Activity):TrainingSuggestion{
 const experienced=activity==='active'||activity==='veryActive';
 if(goal==='gain'){
  if(experienced)return {daysPerWeek:'5',splitVi:'Chia đẩy/kéo/chân (Push/Pull/Legs) — tập kháng lực là trọng tâm',splitEn:'Push/Pull/Legs split — resistance training as the main focus'};
  return {daysPerWeek:'3–4',splitVi:'Toàn thân (full-body) hoặc chia trên/dưới — tập kháng lực là trọng tâm',splitEn:'Full-body or upper/lower split — resistance training as the main focus'};
 }
 if(goal==='lose'){
  if(experienced)return {daysPerWeek:'4–5',splitVi:'Tập kháng lực toàn thân kết hợp 2–3 buổi cardio/HIIT ngắn',splitEn:'Full-body resistance training combined with 2–3 short cardio/HIIT sessions'};
  return {daysPerWeek:'3',splitVi:'Toàn thân (full-body) 3 buổi/tuần, kết hợp đi bộ hằng ngày',splitEn:'3 full-body sessions per week, plus daily walking'};
 }
 return {daysPerWeek:'3–4',splitVi:'Toàn thân hoặc chia theo nhóm cơ tuỳ sở thích — duy trì đều đặn là quan trọng nhất',splitEn:'Full-body or a muscle-group split based on preference — consistency matters most'};
}
