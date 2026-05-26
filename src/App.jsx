import { createClient } from "@supabase/supabase-js";
import { useState, useCallback, useEffect } from "react";

// ─── DAILY PHYSIO ─────────────────────────────────────────────────────────────
const DAILY_PHYSIO = [
  { id:"dp1", name:"Wall Push-Ups", sets:"3", reps:"10", note:"Hands shoulder-width on wall. Slow push. Feel shoulder blades SPREAD apart at end — serratus anterior activating. Winging correction muscle." },
  { id:"dp2", name:"External Rotation + Abduction", sets:"3", reps:"12", note:"Elbow at 90°. Rotate forearm outward (external rotation). Then arm out to shoulder height (abduction). 1–2kg only. Feel back of shoulder — rotator cuff." },
  { id:"dp3", name:"Thoracic Mobility — foam roller", sets:"2", reps:"10 per side", note:"Lie on foam roller across mid-back. Arms raise up and down overhead slowly — 10 reps each side. Opens thoracic spine. Don't force range." },
];

// ─── AB OPTIONS ───────────────────────────────────────────────────────────────
const AB_OPTIONS = {
  floor:[
    { id:"ab_dead_bug", name:"Dead Bug", sets:"3", reps:"8 each side", note:"Back flat into floor. Arms reach back as legs alternate. Breathe out on extension." },
    { id:"ab_rkc", name:"RKC Plank", sets:"3", reps:"20–25s", note:"Squeeze glutes + quads + abs simultaneously. Elbows pull toward toes. Not passive." },
    { id:"ab_bird_dog", name:"Bird Dog", sets:"3", reps:"8 each side", note:"Opposite arm and leg. 3s hold. No hip rotation. Back flat." },
    { id:"ab_side_plank", name:"Side Plank (from knees)", sets:"2", reps:"20s each", note:"Elbow under shoulder. Hips stacked. Don't sag." },
  ],
  standing:[
    { id:"ab_pallof", name:"Pallof Press", sets:"3", reps:"10 each side", note:"Cable or band at chest. Press straight out. Hold 2s. Resist rotation. Anti-rotation core." },
    { id:"ab_march", name:"DB March", sets:"3", reps:"20 steps", note:"Hold DB at sides. March on spot driving knees up. Core resists rotation. Dynamic anti-rotation." },
    { id:"ab_kb_worlds", name:"KB Around the Worlds", sets:"3", reps:"8 each direction", note:"Light KB. Pass around body in circle. Controlled — no swinging. Keep light given hypermobile shoulder." },
    { id:"ab_suitcase", name:"Suitcase Carry", sets:"3", reps:"20m each side", note:"Heavy-ish DB one hand. Walk without leaning. QL and oblique anti-lateral flexion." },
    { id:"ab_captains", name:"Captain's Chair Knee Raises", sets:"3", reps:"10–12", note:"Arms on pads, back against pad. Slow controlled knee raise. Slow lower. Do NOT swing." },
  ],
};

// ─── SESSIONS ────────────────────────────────────────────────────────────────
const GYM_SESSIONS = [
  {
    id:"mon", day:"Monday", label:"Shoulders & Arms", accent:"#1565c0",
    abPair:["ab_pallof","ab_march"],
    exercises:[
      { id:"lat_raise", name:"Seated Lateral Raise (DB or plate)", type:"isolation",
        note:"DB: seated, lead with elbow, stop at shoulder height. Plate: hold with both hands, raise to shoulder height. STOP AT SHOULDER HEIGHT — not above. Feel lateral deltoid only. Not neck, not upper trap.",
        warmup:{ note:"Very light × 12 reps — lateral delt only", defaultKg:null, defaultReps:12 },
        sets:[{range:"12–15"},{range:"12–15"},{range:"12–15"}] },
      { id:"rear_delt", name:"Rear Delt (reverse pec deck machine)", type:"isolation",
        note:"Arms slightly bent. Slow. Feel posterior shoulder. Machine only — no bent-over version.",
        warmup:{ note:"Very light × 12 reps", defaultKg:null, defaultReps:12 },
        sets:[{range:"12–15"},{range:"12–15"},{range:"12–15"}] },
      { id:"tricep_bar", name:"Straight Bar Tricep Pushdown (cable)", type:"isolation",
        note:"Straight bar attachment. Elbows pinned. Extend — STOP 5° before lockout. Slow return. Different wrist position to rope — hits lateral head. No shoulder involvement.",
        warmup:{ note:"Light × 12 reps", defaultKg:null, defaultReps:12 },
        sets:[{range:"12–15"},{range:"12–15"},{range:"12–15"}] },
      { id:"bicep_mon", name:"Cable Bicep Curl", type:"isolation",
        note:"Elbows pinned. Slow return. STOP 10–15° before full extension — hypermobile elbow. Constant tension prevents swinging.",
        warmup:{ note:"Light × 12 reps", defaultKg:null, defaultReps:12 },
        sets:[{range:"12–15"},{range:"12–15"},{range:"12–15"}] },
    ],
  },
  {
    id:"tue", day:"Tuesday", label:"Lower A — Glute/Ham", accent:"#059669",
    abPair:["ab_rkc","ab_captains"],
    exercises:[
      { id:"hip_thrust_tue", name:"Hip Thrust (Smith machine or bench)", type:"compound",
        note:"Bench at mid-scapula. Drive through heels. At top: glutes HARD + ribs DOWN — no lower back arch. 1s hold. If you feel lower back, feet are too far forward.",
        warmup:{ note:"Bodyweight × 15 — feel glutes fire before any load", defaultKg:0, defaultReps:15 },
        sets:[{range:"8–12"},{range:"8–12"},{range:"8–12"}] },
      { id:"rdl_tue", name:"Romanian Deadlift (cable or DB)", type:"compound",
        note:"Hinge from hips. Soft knee. Send hips BACK. Stop when hamstrings load — before pelvis tucks. Slow lowering. Stop at neutral at top — do not hyperextend.",
        warmup:{ note:"50% weight × 10 reps", defaultKg:null, defaultReps:10 },
        sets:[{range:"8–12"},{range:"8–12"},{range:"8–12"}] },
      { id:"heel_split_tue", name:"Heel Elevated Split Squat [PHYSIO]", type:"compound",
        note:"Front foot heel elevated on plate/block. Rear foot on floor. Squat STRAIGHT DOWN — not forward lean. VMO focus. Physio prescribed. Controls hypermobile knee. Both legs.",
        warmup:{ note:"Bodyweight × 6 each side — feel VMO load", defaultKg:0, defaultReps:6 },
        sets:[{range:"8–12"},{range:"8–12"},{range:"8–12"}] },
      { id:"kickback_tue", name:"Single-Leg Cable Kickback", type:"isolation",
        note:"Cable at ankle. Kick straight back — small controlled range. Hips square — no rotation. Feel glute squeeze at end. Both sides.",
        warmup:{ note:"Light × 12 reps each side", defaultKg:null, defaultReps:12 },
        sets:[{range:"12–15"},{range:"12–15"},{range:"12–15"}] },
      { id:"ham_curl_tue", name:"Seated Hamstring Curl", type:"isolation",
        note:"Slow eccentric. Stop 10° short of full extension at bottom — knee hypermobility. Feel hamstring throughout.",
        warmup:{ note:"Light × 12 reps", defaultKg:null, defaultReps:12 },
        sets:[{range:"12–15"},{range:"12–15"},{range:"12–15"}] },
    ],
  },
  {
    id:"wed", day:"Wednesday", label:"Back & Arms", accent:"#e91e8c",
    abPair:["ab_suitcase","ab_kb_worlds"],
    exercises:[
      { id:"lat_pull_wed", name:"Narrow-Grip Lat Pulldown", type:"compound",
        note:"Narrow/neutral grip. Depress shoulder blades FIRST. Pull to upper chest. 10° lean back only. Better lat isolation and safer shoulder position than wide grip.",
        warmup:{ note:"50% weight × 10 reps", defaultKg:null, defaultReps:10 },
        sets:[{range:"8–12"},{range:"8–12"},{range:"8–12"}] },
      { id:"single_row_wed", name:"Single-Arm DB Row", type:"compound",
        note:"Support on bench. Pull elbow to HIP — not shoulder. Trunk still. RIGHT side first every set — winging side needs the volume.",
        warmup:{ note:"Light DB × 10 reps each side", defaultKg:null, defaultReps:10 },
        sets:[{range:"8–12"},{range:"8–12"},{range:"8–12"}] },
      { id:"hammer_wed", name:"Hammer Curl (cable, neutral grip)", type:"isolation",
        note:"Neutral grip (thumbs up). Slow curl and return. Stop 10° short of full extension at bottom. Brachialis — arm thickness and elbow joint protection.",
        warmup:{ note:"Light × 12 reps", defaultKg:null, defaultReps:12 },
        sets:[{range:"12–15"},{range:"12–15"},{range:"12–15"}] },
      { id:"tricep_rope_wed", name:"Tricep Pushdown — rope (cable)", type:"isolation",
        note:"Rope attachment. Elbows pinned. Extend — STOP 5° before lockout. Slow return. Rope allows wrists to rotate naturally at bottom.",
        warmup:{ note:"Light × 12 reps", defaultKg:null, defaultReps:12 },
        sets:[{range:"12–15"},{range:"12–15"},{range:"12–15"}] },
    ],
  },
  {
    id:"sat", day:"Saturday", label:"Lower B — Quad/Glute", accent:"#7b1fa2",
    abPair:["ab_dead_bug","ab_captains"],
    exercises:[
      { id:"hip_thrust_sat", name:"Hip Thrust (Smith or banded floor)", type:"compound",
        note:"SMITH: bench at mid-scapula, drive through heels, ribs down, 1s hold. BANDED FLOOR: band above knees, feet flat, drive hips up from floor. Both: glutes hard at top. Choose based on availability.",
        warmup:{ note:"Bodyweight glute bridge × 15 — feel glutes fire", defaultKg:0, defaultReps:15 },
        sets:[{range:"8–12"},{range:"8–12"},{range:"8–12"}] },
      { id:"goblet_sat", name:"Heel Elevated Goblet Squat [PHYSIO]", type:"compound",
        note:"Heels on plate or yoga block. DB at chest. STRAIGHT DOWN — not bum backwards. Stop before pelvis tucks. Slow lowering. Physio prescription with progressive load.",
        warmup:{ note:"Bodyweight tripod squat × 8 — straight down, groove the pattern", defaultKg:0, defaultReps:8 },
        sets:[{range:"8–12"},{range:"8–12"},{range:"8–12"}] },
      { id:"bulgarian_sat", name:"Bulgarian Split Squat (DB)", type:"compound",
        note:"Rear foot on bench. Front knee over 2nd toe — not inward. STOP 3–4cm before end depth. Both legs. Form before load every session.",
        warmup:{ note:"Bodyweight × 6 each side — feel balance and track the knee", defaultKg:0, defaultReps:6 },
        sets:[{range:"8–12"},{range:"8–12"},{range:"8–12"}] },
      { id:"adductor_sat", name:"Adductor Machine", type:"isolation",
        note:"MID-RANGE only — not full stretch. Hip hypermobility end-range risk. Adductor magnus assists glutes. Inner thigh stability.",
        warmup:{ note:"Light × 12 reps", defaultKg:null, defaultReps:12 },
        sets:[{range:"12–15"},{range:"12–15"},{range:"12–15"}] },
    ],
  },
  {
    id:"sun", day:"Sunday", label:"Back & Scapular", accent:"#0891b2",
    abPair:["ab_pallof","ab_bird_dog"],
    exercises:[
      { id:"cable_row_sun", name:"Seated Cable Row (wide neutral grip)", type:"compound",
        note:"Shoulder blades pull BACK before arms move. Pause 1s at chest. Slow return. Feel mid-back and rhomboids, not biceps. Right scapula: press down and back throughout.",
        warmup:{ note:"50% working weight × 10 reps", defaultKg:null, defaultReps:10 },
        sets:[{range:"8–12"},{range:"8–12"},{range:"8–12"}] },
      { id:"lat_pull_sun", name:"Narrow-Grip Lat Pulldown", type:"compound",
        note:"Narrow/neutral grip. Depress shoulder blades FIRST. Pull to upper chest. 10° lean back only. Complements cable row — horizontal + vertical pull.",
        warmup:{ note:"50% weight × 10 reps", defaultKg:null, defaultReps:10 },
        sets:[{range:"8–12"},{range:"8–12"},{range:"8–12"}] },
      { id:"face_pulls_sun", name:"Face Pulls (rope, eye height)", type:"isolation",
        note:"Pull rope to forehead. Elbows HIGH and wide. Rotate hands outward — thumbs back at end. Feel posterior shoulder and rotator cuff. Light weight only.",
        warmup:{ note:"Very light × 12 reps", defaultKg:null, defaultReps:12 },
        sets:[{range:"12–15"},{range:"12–15"},{range:"12–15"}] },
      { id:"ytw_sun", name:"Y-T-W Raises (prone on incline bench)", type:"isolation",
        note:"Y: thumbs up arms form Y. T: arms horizontal. W: elbows bent. 1s hold at top each rep. 0.5–2kg MAX — motor control not strength. Right side extra attention. No neck extension. Scapular winging correction.",
        warmup:{ note:"Bodyweight × 6 each letter — feel lower traps, not neck", defaultKg:0, defaultReps:6 },
        sets:[{range:"10 each"},{range:"10 each"},{range:"10 each"}] },
    ],
  },
];

const HOME_SESSIONS = [
  {
    id:"thu", day:"Thursday", label:"Run + Home Physio", accent:"#d97706", type:"home",
    runProtocol:[
      { weeks:"Wk 1–2", structure:"Walk only", detail:"40 min brisk walk. HR 100–125. No running yet — connective tissue base.", icon:"🚶" },
      { weeks:"Wk 3–4", structure:"1 min jog / 4 min walk", detail:"× 5 intervals = 25 min. Slow jog — hold a full sentence. Joints must feel fine next day.", icon:"🏃" },
      { weeks:"Wk 5–6", structure:"2 min jog / 3 min walk", detail:"× 5 intervals. Same slow pace — extend time, don't speed up.", icon:"🏃" },
      { weeks:"Wk 7–8", structure:"3 min jog / 2 min walk", detail:"× 5 intervals. More jogging than walking.", icon:"🏃" },
      { weeks:"Wk 9–10", structure:"5 min jog / 2 min walk", detail:"× 4 intervals. Joints should feel comfortable.", icon:"🏃" },
      { weeks:"Wk 11–12", structure:"8 min jog / 2 min walk", detail:"× 3 intervals. Nearly continuous.", icon:"🏃" },
      { weeks:"Post Phase 1", structure:"Build to 30 min continuous", detail:"Add 1–2 min per session. JOINT RULE: if aching the next day, repeat that week before progressing.", icon:"🏅" },
    ],
    physioExercises:[
      { id:"thu_dead_bug", name:"Dead Bug", sets:3, reps:"8 each side", hold:"slow", note:"Back flat. Breathe out on extension. APT correction." },
      { id:"thu_bird_dog", name:"Bird Dog", sets:3, reps:"8 each side", hold:"3s hold", note:"Opposite arm and leg. No hip rotation. Back flat." },
      { id:"thu_rkc", name:"RKC Plank", sets:3, reps:"20s", hold:"isometric", note:"Squeeze glutes + quads + abs. Not passive." },
      { id:"thu_clamshell", name:"Clamshells (band or BW)", sets:2, reps:"15 each side", hold:"slow", note:"Side-lying. Open top knee. Hips stacked. Feel glute med." },
      { id:"thu_pigeon", name:"Pigeon Stretch", sets:3, reps:"30s each side", hold:"hold", note:"Hip on floor or bench. Lean forward gently. Don't force range." },
    ],
  },
  {
    id:"fri", day:"Friday", label:"Rest Day", accent:"#6b7280", type:"rest",
    optionalWalk:true,
  },
];

// ── Supabase ──────────────────────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

async function fetchHistory() {
  const { data: completions } = await supabase
    .from('session_completions')
    .select('*')
    .order('session_date', { ascending: false });
  const { data: logs } = await supabase
    .from('workout_logs')
    .select('*')
    .order('session_date', { ascending: false });
  if (!completions) return {};
  const history = {};
  completions.forEach(c => {
    if (!history[c.session_id]) {
      history[c.session_id] = {
        date: c.session_date + 'T00:00:00.000Z',
        runWeek: c.run_week,
        walked: c.walked,
        logs: {},
      };
    }
  });
  if (logs) {
    logs.forEach(log => {
      const h = history[log.session_id];
      if (!h) return;
      if (!h.logs[log.exercise_id]) h.logs[log.exercise_id] = { warmup: {}, sets: [] };
      if (log.set_type === 'warmup') {
        h.logs[log.exercise_id].warmup = { kg: log.kg, reps: log.reps };
      } else {
        const idx = log.set_index;
        while (h.logs[log.exercise_id].sets.length <= idx) h.logs[log.exercise_id].sets.push({});
        if (!h.logs[log.exercise_id].sets[idx].kg) {
          h.logs[log.exercise_id].sets[idx] = { kg: log.kg, reps: log.reps };
        }
      }
    });
  }
  return history;
}

async function persistSession(sessionId, data) {
  const today = new Date().toISOString().split('T')[0];
  await supabase.from('session_completions').upsert(
    { session_id: sessionId, session_date: today, run_week: data.runWeek || null, walked: data.walked || false },
    { onConflict: 'session_id,session_date' }
  );
  if (data.logs) {
    const rows = [];
    Object.entries(data.logs).forEach(([exId, exData]) => {
      if (exData.warmup) rows.push({ session_id: sessionId, session_date: today, exercise_id: exId, set_type: 'warmup', set_index: 0, kg: exData.warmup.kg, reps: exData.warmup.reps });
      if (exData.sets) exData.sets.forEach((s, i) => rows.push({ session_id: sessionId, session_date: today, exercise_id: exId, set_type: 'work', set_index: i, kg: s.kg, reps: s.reps }));
    });
    if (rows.length > 0) await supabase.from('workout_logs').insert(rows);
  }
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const IBack = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const ITick = ({s=16}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IInfo = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;

// ── Numpad ────────────────────────────────────────────────────────────────────
function Numpad({ label, sublabel, initial, onSave, onClose }) {
  const [val, setVal] = useState(initial != null ? String(initial) : "");
  const press = d => {
    if (d === "⌫") { setVal(v => v.slice(0,-1)); return; }
    if (d === "." && val.includes(".")) return;
    if (val === "0" && d !== ".") { setVal(d); return; }
    setVal(v => (v+d).slice(0,6));
  };
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:300,backdropFilter:"blur(8px)"}} onClick={onClose}>
      <div style={{background:"#10102a",borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,padding:"22px 20px 44px"}} onClick={e=>e.stopPropagation()}>
        <div style={{textAlign:"center",color:"#555",fontSize:11,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:2}}>{label}</div>
        {sublabel&&<div style={{textAlign:"center",color:"#e91e8c",fontSize:11,marginBottom:6,fontWeight:600}}>{sublabel}</div>}
        <div style={{textAlign:"center",fontSize:52,fontWeight:900,color:"#fff",minHeight:64,letterSpacing:"-0.04em"}}>
          {val||<span style={{color:"#2a2a3a"}}>0</span>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginTop:16}}>
          {["1","2","3","4","5","6","7","8","9",".","0","⌫"].map(d=>(
            <button key={d} onClick={()=>press(d)} style={{background:d==="⌫"?"#1e1e38":"#181830",border:"none",borderRadius:14,height:64,color:d==="⌫"?"#e91e8c":"#fff",fontSize:d==="⌫"?22:28,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}
              onPointerDown={e=>e.currentTarget.style.transform="scale(0.92)"}
              onPointerUp={e=>e.currentTarget.style.transform="scale(1)"}
            >{d}</button>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:10,marginTop:10}}>
          <button onClick={onClose} style={{background:"#181830",border:"none",borderRadius:14,height:58,color:"#555",fontSize:15,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
          <button onClick={()=>{onSave(val===""?null:parseFloat(val));onClose();}} style={{background:"linear-gradient(135deg,#e91e8c,#9c27b0)",border:"none",borderRadius:14,height:58,color:"#fff",fontSize:16,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ── Daily Physio Block ────────────────────────────────────────────────────────
function DailyPhysioBlock({ done, setDone }) {
  const allDone = Object.values(done).every(Boolean);
  return (
    <div style={{background:"#10102a",borderRadius:20,padding:"15px 14px",marginBottom:12,border:`1px solid ${allDone?"#f59e0b60":"#1e1e38"}`}}>
      <div style={{fontSize:10,color:"#f59e0b",fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:4}}>Daily Physio — do first, every day</div>
      <div style={{fontSize:11,color:"#2a2a4a",marginBottom:12,fontStyle:"italic"}}>Prescribed every day. ~8 min.</div>
      {DAILY_PHYSIO.map((ex,i)=>(
        <div key={ex.id} style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:i<DAILY_PHYSIO.length-1?12:0,paddingBottom:i<DAILY_PHYSIO.length-1?12:0,borderBottom:i<DAILY_PHYSIO.length-1?"1px solid #1a1a30":"none"}}>
          <div style={{flex:1,marginRight:12}}>
            <div style={{fontSize:13,fontWeight:800,color:done[ex.id]?"#f59e0b":"#fff",transition:"color 0.3s"}}>{ex.name}</div>
            <div style={{fontSize:11,color:"#3a3a5a",marginTop:2}}>{ex.sets} sets · {ex.reps}</div>
            <div style={{fontSize:11,color:"#1e1e38",marginTop:3,lineHeight:1.5,fontStyle:"italic"}}>{ex.note}</div>
          </div>
          <button onClick={()=>setDone(p=>({...p,[ex.id]:!p[ex.id]}))} style={{background:done[ex.id]?"#f59e0b20":"#0a0a18",border:`1.5px solid ${done[ex.id]?"#f59e0b":"#161628"}`,borderRadius:12,width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",color:done[ex.id]?"#f59e0b":"#3a3a5a",cursor:"pointer",flexShrink:0,transition:"all 0.2s"}}>
            <ITick s={16}/>
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Ab Block ──────────────────────────────────────────────────────────────────
function AbBlock({ abPair, done, setDone, accent }) {
  const [showAll, setShowAll] = useState(false);
  const allDone = abPair.every(id=>done[id]);
  const allAbs = [...AB_OPTIONS.floor,...AB_OPTIONS.standing];
  const defaultPair = abPair.map(id=>allAbs.find(a=>a.id===id)).filter(Boolean);
  const displayList = showAll ? allAbs : defaultPair;

  return (
    <div style={{background:"#10102a",borderRadius:20,padding:"15px 14px",marginBottom:12,border:`1px solid ${allDone?accent+"60":"#1e1e38"}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
        <div style={{fontSize:10,color:accent,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase"}}>Core / Abs</div>
        <button onClick={()=>setShowAll(p=>!p)} style={{background:"#1a1a30",border:"none",borderRadius:8,padding:"4px 10px",color:"#555",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>{showAll?"Show less":"All options"}</button>
      </div>
      <div style={{fontSize:11,color:"#2a2a4a",marginBottom:12,fontStyle:"italic"}}>{showAll?"All options — pick any 2":"Today's suggested pair · tap 'All options' to swap"}</div>
      <div style={{marginBottom:8,padding:"6px 10px",background:"#080814",borderRadius:8,border:"1px solid #1e1e38"}}>
        <div style={{fontSize:9,color:"#3a3a5a",marginBottom:4,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase"}}>Floor exercises</div>
        <div style={{fontSize:10,color:"#2a2a4a"}}>Dead Bug · RKC Plank · Bird Dog · Side Plank</div>
        <div style={{fontSize:9,color:"#3a3a5a",marginTop:6,marginBottom:4,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase"}}>Standing / No mat</div>
        <div style={{fontSize:10,color:"#2a2a4a"}}>Pallof Press · DB March · KB Around the Worlds · Suitcase Carry · Captain's Chair</div>
      </div>
      {displayList.map((ex,i)=>(
        <div key={ex.id} style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:i<displayList.length-1?12:0,paddingBottom:i<displayList.length-1?12:0,borderBottom:i<displayList.length-1?"1px solid #1a1a30":"none"}}>
          <div style={{flex:1,marginRight:12}}>
            <div style={{fontSize:13,fontWeight:800,color:done[ex.id]?accent:"#fff",transition:"color 0.3s"}}>{ex.name}</div>
            <div style={{fontSize:11,color:"#3a3a5a",marginTop:2}}>{ex.sets} sets · {ex.reps}</div>
            <div style={{fontSize:11,color:"#1e1e38",marginTop:3,lineHeight:1.5,fontStyle:"italic"}}>{ex.note}</div>
          </div>
          <button onClick={()=>setDone(p=>({...p,[ex.id]:!p[ex.id]}))} style={{background:done[ex.id]?accent+"20":"#0a0a18",border:`1.5px solid ${done[ex.id]?accent:"#161628"}`,borderRadius:12,width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",color:done[ex.id]?accent:"#3a3a5a",cursor:"pointer",flexShrink:0,transition:"all 0.2s"}}>
            <ITick s={16}/>
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Home Screen ───────────────────────────────────────────────────────────────
function HomeScreen({ onSelect, history }) {
  const weekAgo = new Date(Date.now()-7*86400000);
  const allSessions = [...GYM_SESSIONS,...HOME_SESSIONS.filter(s=>s.type!=="rest")];
  const doneCount = allSessions.filter(s=>history[s.id]?.date&&new Date(history[s.id].date)>weekAgo).length;
  const dayOrder = ["mon","tue","wed","thu","fri","sat","sun"];
  const allInOrder = [
    ...GYM_SESSIONS,
    ...HOME_SESSIONS,
  ].sort((a,b)=>dayOrder.indexOf(a.id)-dayOrder.indexOf(b.id));

  return (
    <div style={{minHeight:"100vh",background:"#080814",fontFamily:"'DM Sans',system-ui,sans-serif",paddingBottom:48}}>
      <div style={{padding:"56px 20px 24px",background:"linear-gradient(180deg,#180824 0%,#080814 100%)"}}>
        <div style={{fontSize:10,color:"#e91e8c",fontWeight:700,letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:8}}>Phase 1 · Weeks 1–4</div>
        <h1 style={{fontSize:30,fontWeight:900,color:"#fff",margin:"0 0 4px",letterSpacing:"-0.04em",lineHeight:1.1}}>Good to see you,<br/>Taegan 💪</h1>
        <p style={{color:"#444",fontSize:13,margin:"8px 0 16px"}}>{doneCount}/{allSessions.length} sessions this week</p>
        <div style={{background:"#1a1a2e",borderRadius:8,height:6,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${(doneCount/allSessions.length)*100}%`,background:"linear-gradient(90deg,#e91e8c,#9c27b0)",borderRadius:8,transition:"width 0.6s"}}/>
        </div>
      </div>

      <div style={{margin:"0 16px 14px",background:"#10102a",borderRadius:16,padding:"12px 15px",border:"1px solid #f59e0b30"}}>
        <div style={{fontSize:10,color:"#f59e0b",fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:6}}>Daily physio — every session</div>
        <div style={{fontSize:12,color:"#3a3a5a"}}>Wall push-ups · External rotation + abduction · Thoracic foam roller</div>
        <div style={{fontSize:11,color:"#2a2a4a",marginTop:3}}>~8 min · appears at top of every session · do it first</div>
      </div>

      <div style={{margin:"0 16px 14px",background:"#10102a",borderRadius:16,padding:"12px 15px",border:"1px solid #1e1e38"}}>
        <div style={{fontSize:10,color:"#e91e8c",fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:8}}>Progress rule</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
          {[["All 3 sets hit top of range","⬆️ Heavier next session"],["Still in range","➕ Add reps first"],["Missed bottom","↔️ Same weight again"],["Pain / wrong feel","⬇️ Drop 10%, note it"]].map(([s,a])=>(
            <div key={s} style={{background:"#080814",borderRadius:10,padding:"8px 10px"}}>
              <div style={{fontSize:10,color:"#3a3a5a",marginBottom:2,lineHeight:1.3}}>{s}</div>
              <div style={{fontSize:11,fontWeight:700,color:"#aaa"}}>{a}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:"0 16px"}}>
        {allInOrder.map(session=>{
          const last=history[session.id];
          const done=last?.date&&new Date(last.date)>weekAgo;
          const isRest=session.type==="rest";
          const isHome=session.type==="home"&&!isRest;
          return (
            <div key={session.id} onClick={()=>onSelect(session.id)} style={{
              background:"#10102a",borderRadius:20,padding:"16px 17px 14px",marginBottom:10,
              border:`1px solid ${done?session.accent+"60":"#1e1e38"}`,
              cursor:isRest?"pointer":"pointer",
              boxShadow:done?`0 4px 20px ${session.accent}18`:"none",
              position:"relative",overflow:"hidden",transition:"transform 0.1s",
              opacity:isRest?0.5:1,
            }}
              onPointerDown={e=>e.currentTarget.style.transform="scale(0.97)"}
              onPointerUp={e=>e.currentTarget.style.transform="scale(1)"}
            >
              <div style={{position:"absolute",left:0,top:0,bottom:0,width:4,background:session.accent,borderRadius:"20px 0 0 20px"}}/>
              <div style={{marginLeft:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div>
                    <div style={{fontSize:10,color:session.accent,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:3}}>
                      {session.day}{isHome?" · Home":isRest?" · Rest":""}
                    </div>
                    <div style={{fontSize:17,fontWeight:900,color:"#fff",letterSpacing:"-0.02em"}}>{session.label}</div>
                    {!isRest&&<div style={{fontSize:11,color:"#2a2a4a",marginTop:3}}>
                      {isHome?"Run + physio drills":session.exercises?`${session.exercises.length} exercises · warm-up + 3 sets each`:""}
                    </div>}
                    {isRest&&<div style={{fontSize:11,color:"#2a2a4a",marginTop:3}}>Rest is training. You've earned this.</div>}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5}}>
                    {done&&<div style={{background:session.accent+"25",color:session.accent,fontSize:10,fontWeight:800,padding:"3px 10px",borderRadius:20}}>DONE ✓</div>}
                    {last?.date&&<div style={{fontSize:10,color:"#2a2a4a"}}>{new Date(last.date).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</div>}
                  </div>
                </div>
                {session.exercises&&(
                  <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:10}}>
                    {session.exercises.map(ex=>(
                      <span key={ex.id} style={{fontSize:10,color:ex.type==="compound"?session.accent+"cc":"#2a2a4a",background:"#080814",padding:"3px 8px",borderRadius:20,border:`1px solid ${ex.type==="compound"?session.accent+"30":"#1e1e38"}`}}>
                        {ex.name.split(" ").slice(0,2).join(" ")}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800;900&display=swap');`}</style>
    </div>
  );
}

// ── Gym Session ───────────────────────────────────────────────────────────────
function GymSession({ session, history, onSave, onBack }) {
  const prev = history[session.id]||{};
  const initDP = ()=>{ const d={}; DAILY_PHYSIO.forEach(e=>{d[e.id]=false;}); return d; };
  const initAbs = ()=>{ const d={}; [...AB_OPTIONS.floor,...AB_OPTIONS.standing].forEach(e=>{d[e.id]=false;}); return d; };
  const initLogs = ()=>{
    const logs={};
    session.exercises.forEach(ex=>{
      const p=prev?.logs?.[ex.id];
      logs[ex.id]={
        warmup:{ kg:p?.warmup?.kg??ex.warmup.defaultKg, reps:p?.warmup?.reps??ex.warmup.defaultReps, done:false },
        sets:ex.sets.map((_,si)=>({ kg:p?.sets?.[si]?.kg??null, reps:p?.sets?.[si]?.reps??null, done:false })),
      };
    });
    return logs;
  };

  const [dpDone,setDpDone]=useState(initDP);
  const [abDone,setAbDone]=useState(initAbs);
  const [logs,setLogs]=useState(initLogs);
  const [modal,setModal]=useState(null);
  const [expanded,setExpanded]=useState(null);
  const [phase,setPhase]=useState("main");

  const allDPDone=Object.values(dpDone).every(Boolean);
  const totalSets=session.exercises.reduce((a,e)=>a+e.sets.length,0);
  const doneSets=Object.values(logs).reduce((a,ex)=>a+ex.sets.filter(s=>s.done).length,0);
  const allMainDone=doneSets===totalSets;
  const suggestedAbsDone=session.abPair.every(id=>abDone[id]);
  const canFinish=allDPDone&&allMainDone&&suggestedAbsDone;

  const handleSave=useCallback(val=>{
    if(!modal) return;
    const{exId,setType,si,field}=modal;
    setLogs(p=>{
      const ex={...p[exId]};
      if(setType==="warmup"){ex.warmup={...ex.warmup,[field]:val};}
      else{ex.sets=ex.sets.map((s,i)=>i===si?{...s,[field]:val}:s);}
      return{...p,[exId]:ex};
    });
  },[modal]);

  const toggleDone=(exId,si)=>setLogs(p=>({...p,[exId]:{...p[exId],sets:p[exId].sets.map((s,i)=>i===si?{...s,done:!s.done}:s)}}));
  const toggleWarmup=exId=>setLogs(p=>({...p,[exId]:{...p[exId],warmup:{...p[exId].warmup,done:!p[exId].warmup.done}}}));
  const markAll=exId=>setLogs(p=>({...p,[exId]:{...p[exId],sets:p[exId].sets.map(s=>({...s,done:true}))}}));

  const finish=()=>{
    const result={date:new Date().toISOString(),logs:{}};
    session.exercises.forEach(ex=>{
      result.logs[ex.id]={
        warmup:{kg:logs[ex.id].warmup.kg,reps:logs[ex.id].warmup.reps},
        sets:logs[ex.id].sets.map(s=>({kg:s.kg,reps:s.reps})),
      };
    });
    onSave(session.id,result);
    setPhase("done");
  };

  if(phase==="done") return (
    <div style={{minHeight:"100vh",background:"#080814",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{fontSize:80,marginBottom:16}}>🎉</div>
      <h2 style={{color:"#fff",fontSize:30,fontWeight:900,margin:0,textAlign:"center"}}>Session done!</h2>
      <p style={{color:"#555",fontSize:14,textAlign:"center",margin:"8px 0 28px"}}>{session.day} · {session.label}</p>
      <div style={{background:"#10102a",borderRadius:20,padding:20,width:"100%",maxWidth:380,border:`1px solid ${session.accent}40`,marginBottom:24}}>
        <div style={{fontSize:10,color:session.accent,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:12}}>What you lifted</div>
        {session.exercises.map(ex=>(
          <div key={ex.id} style={{marginBottom:10}}>
            <div style={{fontSize:11,fontWeight:700,color:"#666",marginBottom:4}}>{ex.name}</div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              <div style={{fontSize:10,color:"#2a2a4a",background:"#080814",padding:"2px 8px",borderRadius:20,border:"1px dashed #1e1e38"}}>
                WU:{logs[ex.id].warmup.kg!=null?`${logs[ex.id].warmup.kg}kg`:"—"}×{logs[ex.id].warmup.reps??'—'}
              </div>
              {logs[ex.id].sets.map((s,si)=>(
                <div key={si} style={{fontSize:10,color:"#555",background:"#080814",padding:"2px 8px",borderRadius:20,border:"1px solid #1e1e38"}}>
                  S{si+1}:{s.kg!=null?`${s.kg}kg`:"—"}×{s.reps??'—'}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button onClick={onBack} style={{background:`linear-gradient(135deg,${session.accent},#9c27b0)`,color:"#fff",border:"none",borderRadius:16,padding:"16px 52px",fontSize:16,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>Back to sessions</button>
    </div>
  );

  const hasPrev=Object.keys(prev?.logs||{}).length>0;

  return (
    <div style={{minHeight:"100vh",background:"#080814",fontFamily:"'DM Sans',sans-serif",paddingBottom:100}}>
      <div style={{background:`linear-gradient(180deg,${session.accent}28 0%,#080814 100%)`,padding:"48px 18px 14px",position:"sticky",top:0,zIndex:10,backdropFilter:"blur(12px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <button onClick={onBack} style={{background:"#1e1e38",border:"none",borderRadius:10,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",color:"#aaa",cursor:"pointer"}}><IBack/></button>
          <div>
            <div style={{fontSize:10,color:session.accent,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase"}}>{session.day}</div>
            <div style={{fontSize:19,fontWeight:900,color:"#fff",letterSpacing:"-0.03em"}}>{session.label}</div>
          </div>
          <div style={{marginLeft:"auto",fontSize:11,color:"#2a2a4a",fontWeight:600}}>{doneSets}/{totalSets} sets</div>
        </div>
        <div style={{background:"#1a1a2e",borderRadius:6,height:5,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${(doneSets/totalSets)*100}%`,background:session.accent,borderRadius:6,transition:"width 0.3s"}}/>
        </div>
        {hasPrev&&<div style={{marginTop:6,fontSize:11,color:"#2a2a4a"}}>⟳ Pre-filled from last session · tap to adjust</div>}
      </div>

      <div style={{padding:"8px 14px"}}>
        <DailyPhysioBlock done={dpDone} setDone={setDpDone}/>

        <div style={{background:"#10102a",borderRadius:12,padding:"9px 13px",marginBottom:12,display:"flex",gap:14,flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:6,height:6,borderRadius:"50%",background:session.accent}}/><span style={{fontSize:11,color:"#3a3a5a"}}>Compound: 8–12 reps</span></div>
          <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:6,height:6,borderRadius:"50%",background:"#333"}}/><span style={{fontSize:11,color:"#3a3a5a"}}>Isolation: 12–15 reps</span></div>
        </div>

        {session.exercises.map(ex=>{
          const exLog=logs[ex.id];
          const allDone=exLog.sets.every(s=>s.done);
          const isOpen=expanded===ex.id;
          const isCompound=ex.type==="compound";
          return (
            <div key={ex.id} style={{background:"#10102a",borderRadius:20,padding:"15px 13px",marginBottom:12,border:`1px solid ${allDone?session.accent+"60":"#1e1e38"}`,transition:"border-color 0.3s"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div style={{flex:1,marginRight:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:isCompound?session.accent:"#333",flexShrink:0}}/>
                    <div style={{fontSize:15,fontWeight:800,color:allDone?session.accent:"#fff",transition:"color 0.3s"}}>{ex.name}</div>
                  </div>
                  <div style={{fontSize:10,color:"#1e1e38",paddingLeft:13}}>{isCompound?"Compound · 8–12 reps":"Isolation · 12–15 reps"} · warm-up + 3 sets</div>
                </div>
                <button onClick={()=>setExpanded(isOpen?null:ex.id)} style={{background:"#181830",border:"none",borderRadius:8,width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",color:isOpen?session.accent:"#3a3a5a",cursor:"pointer",flexShrink:0}}>
                  <IInfo/>
                </button>
              </div>

              {isOpen&&<div style={{background:"#080814",borderRadius:10,padding:"10px 12px",marginBottom:12,fontSize:12,color:"#666",lineHeight:1.6,borderLeft:`3px solid ${session.accent}`}}>{ex.note}</div>}

              {prev?.logs?.[ex.id]&&(
                <div style={{display:"flex",gap:5,marginBottom:10,flexWrap:"wrap"}}>
                  <div style={{fontSize:10,color:"#1e1e38",background:"#080814",padding:"2px 8px",borderRadius:20,border:"1px dashed #1a1a30"}}>
                    Last WU:{prev.logs[ex.id].warmup?.kg??'—'}kg×{prev.logs[ex.id].warmup?.reps??'—'}
                  </div>
                  {prev.logs[ex.id].sets?.map((s,si)=>(
                    <div key={si} style={{fontSize:10,color:"#2a2a4a",background:"#080814",padding:"2px 8px",borderRadius:20,border:"1px solid #1a1a30"}}>
                      Last S{si+1}:{s.kg??'—'}kg×{s.reps??'—'}
                    </div>
                  ))}
                </div>
              )}

              <div style={{display:"grid",gridTemplateColumns:"52px 1fr 1fr 40px",gap:6,marginBottom:4}}>
                {["","KG","REPS","✓"].map((h,i)=><div key={i} style={{fontSize:9,color:"#2a2a4a",textAlign:"center"}}>{h}</div>)}
              </div>

              <div style={{display:"grid",gridTemplateColumns:"52px 1fr 1fr 40px",gap:6,marginBottom:4,alignItems:"center"}}>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:9,color:"#f59e0b",fontWeight:700}}>WARM</div>
                  <div style={{fontSize:9,color:"#f59e0b",fontWeight:700}}>UP</div>
                </div>
                {["kg","reps"].map(field=>(
                  <button key={field} onClick={()=>setModal({exId:ex.id,setType:"warmup",field})} style={{
                    background:exLog.warmup.done?"#f59e0b18":"#0a0a18",
                    border:`1.5px dashed ${exLog.warmup.done?"#f59e0b60":"#1e1e30"}`,
                    borderRadius:12,height:44,display:"flex",alignItems:"center",justifyContent:"center",
                    color:exLog.warmup[field]!=null?(exLog.warmup.done?"#f59e0b":"#ccc"):"#2a2a4a",
                    fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit",
                  }}>
                    {exLog.warmup[field]!=null?`${exLog.warmup[field]}`:"—"}
                  </button>
                ))}
                <button onClick={()=>toggleWarmup(ex.id)} style={{background:exLog.warmup.done?"#f59e0b20":"#0a0a18",border:`1.5px dashed ${exLog.warmup.done?"#f59e0b60":"#1e1e30"}`,borderRadius:12,height:44,display:"flex",alignItems:"center",justifyContent:"center",color:exLog.warmup.done?"#f59e0b":"#2a2a4a",cursor:"pointer"}}>
                  <ITick s={13}/>
                </button>
              </div>
              <div style={{fontSize:10,color:"#1e1e38",marginBottom:8,paddingLeft:4,fontStyle:"italic"}}>{ex.warmup.note}</div>

              {ex.sets.map((set,si)=>{
                const s=exLog.sets[si];
                return (
                  <div key={si} style={{display:"grid",gridTemplateColumns:"52px 1fr 1fr 40px",gap:6,marginBottom:8,alignItems:"center"}}>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:11,color:"#444",fontWeight:700}}>S{si+1}</div>
                      <div style={{fontSize:9,color:"#1e1e38"}}>{set.range}</div>
                    </div>
                    {["kg","reps"].map(field=>(
                      <button key={field} onClick={()=>setModal({exId:ex.id,setType:"work",si,field})} style={{
                        background:s.done?session.accent+"20":"#0a0a18",
                        border:`1.5px solid ${s.done?session.accent+"70":s[field]!=null?"#252540":"#161628"}`,
                        borderRadius:12,height:48,display:"flex",alignItems:"center",justifyContent:"center",
                        color:s[field]!=null?(s.done?session.accent:"#fff"):"#1e1e38",
                        fontSize:17,fontWeight:800,cursor:"pointer",transition:"all 0.2s",fontFamily:"inherit",
                      }}>
                        {s[field]!=null?`${s[field]}`:"—"}
                      </button>
                    ))}
                    <button onClick={()=>toggleDone(ex.id,si)} style={{background:s.done?session.accent:"#0a0a18",border:`1.5px solid ${s.done?session.accent:"#161628"}`,borderRadius:12,height:48,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",cursor:"pointer",transition:"all 0.2s"}}>
                      <ITick s={15}/>
                    </button>
                  </div>
                );
              })}
              <button onClick={()=>markAll(ex.id)} style={{width:"100%",background:"transparent",border:"none",color:"#1e1e38",fontSize:12,fontWeight:600,padding:"3px 0 0",cursor:"pointer",fontFamily:"inherit"}}>Mark All ✓</button>
            </div>
          );
        })}

        <AbBlock abPair={session.abPair} done={abDone} setDone={setAbDone} accent={session.accent}/>

        {!allDPDone&&<div style={{background:"#f59e0b15",borderRadius:12,padding:"10px 14px",marginBottom:12,border:"1px solid #f59e0b30",fontSize:12,color:"#f59e0b",textAlign:"center"}}>⚠️ Tick all daily physio exercises to unlock finish</div>}

        {canFinish
          ?<button onClick={finish} style={{width:"100%",background:"linear-gradient(135deg,#e91e8c,#9c27b0)",border:"none",borderRadius:18,height:66,color:"#fff",fontSize:18,fontWeight:900,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 8px 40px rgba(233,30,140,0.5)"}}>Complete Session 🎉</button>
          :<div style={{textAlign:"center",fontSize:12,color:"#1e1e38",padding:"10px 0"}}>{!allMainDone?`${totalSets-doneSets} working sets left`:!suggestedAbsDone?"Tick both core exercises →":"Tick daily physio to finish"}</div>
        }
      </div>

      {modal&&<Numpad
        label={modal.field==="kg"?"Weight (kg)":"Reps"}
        sublabel={modal.setType==="warmup"
          ?prev?.logs?.[modal.exId]?.warmup?.[modal.field]!=null?`Last: ${prev.logs[modal.exId].warmup[modal.field]}${modal.field==="kg"?"kg":" reps"}`:null
          :prev?.logs?.[modal.exId]?.sets?.[modal.si]?.[modal.field]!=null?`Last: ${prev.logs[modal.exId].sets[modal.si][modal.field]}${modal.field==="kg"?"kg":" reps"}`:null
        }
        initial={modal.setType==="warmup"?logs[modal.exId]?.warmup?.[modal.field]:logs[modal.exId]?.sets?.[modal.si]?.[modal.field]}
        onSave={handleSave}
        onClose={()=>setModal(null)}
      />}
    </div>
  );
}

// ── Run Session (Thursday) ────────────────────────────────────────────────────
function RunSession({ session, history, onSave, onBack }) {
  const prev = history[session.id]||{};
  const initDP=()=>{ const d={}; DAILY_PHYSIO.forEach(e=>{d[e.id]=false;}); return d; };
  const [dpDone,setDpDone]=useState(initDP);
  const [runDone,setRunDone]=useState(false);
  const [exDone,setExDone]=useState(()=>{ const d={}; session.physioExercises.forEach(e=>{d[e.id]=false;}); return d; });
  const [runWeek,setRunWeek]=useState(prev.runWeek??3);
  const [expandedRun,setExpandedRun]=useState(false);
  const [phase,setPhase]=useState("main");

  const allDPDone=Object.values(dpDone).every(Boolean);
  const allExDone=Object.values(exDone).every(Boolean);
  const canFinish=allDPDone&&runDone&&allExDone;

  const finish=()=>{ onSave(session.id,{date:new Date().toISOString(),runWeek}); setPhase("done"); };

  if(phase==="done") return (
    <div style={{minHeight:"100vh",background:"#080814",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{fontSize:80,marginBottom:16}}>🏃</div>
      <h2 style={{color:"#fff",fontSize:30,fontWeight:900,margin:0,textAlign:"center"}}>Run day done!</h2>
      <p style={{color:"#555",fontSize:14,textAlign:"center",margin:"8px 0 32px"}}>Thursday · Run + Home Physio</p>
      <button onClick={onBack} style={{background:`linear-gradient(135deg,${session.accent},#e91e8c)`,color:"#fff",border:"none",borderRadius:16,padding:"16px 52px",fontSize:16,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>Back to sessions</button>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#080814",fontFamily:"'DM Sans',sans-serif",paddingBottom:100}}>
      <div style={{background:`linear-gradient(180deg,${session.accent}28 0%,#080814 100%)`,padding:"48px 18px 14px",position:"sticky",top:0,zIndex:10,backdropFilter:"blur(12px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={onBack} style={{background:"#1e1e38",border:"none",borderRadius:10,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",color:"#aaa",cursor:"pointer"}}><IBack/></button>
          <div>
            <div style={{fontSize:10,color:session.accent,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase"}}>Thursday · Home</div>
            <div style={{fontSize:19,fontWeight:900,color:"#fff",letterSpacing:"-0.03em"}}>Run + Home Physio</div>
          </div>
        </div>
      </div>

      <div style={{padding:"16px 14px"}}>
        <DailyPhysioBlock done={dpDone} setDone={setDpDone}/>

        <div style={{background:"#10102a",borderRadius:20,padding:"15px 14px",marginBottom:12,border:`1px solid ${runDone?session.accent+"60":"#1e1e38"}`}}>
          <div style={{fontSize:10,color:session.accent,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:10}}>Running Protocol — Week {runWeek}</div>
          <div style={{background:"#080814",borderRadius:14,padding:"12px 14px",marginBottom:12,border:"1px solid #1e1e38"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:12,fontWeight:700,color:"#aaa"}}>Current week</div>
              <button onClick={()=>setExpandedRun(p=>!p)} style={{background:"#1a1a30",border:"none",borderRadius:8,padding:"4px 10px",color:session.accent,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{expandedRun?"Hide":"All weeks"}</button>
            </div>
            {(()=>{
              const wk=session.runProtocol[Math.min(runWeek-1,session.runProtocol.length-1)];
              return (
                <div style={{background:"#10102a",borderRadius:12,padding:"12px 14px",border:`1px solid ${session.accent}40`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <div style={{fontSize:10,color:session.accent,fontWeight:700,textTransform:"uppercase"}}>{wk.weeks}</div>
                    <span style={{fontSize:20}}>{wk.icon}</span>
                  </div>
                  <div style={{fontSize:16,fontWeight:800,color:"#fff",marginBottom:4}}>{wk.structure}</div>
                  <div style={{fontSize:12,color:"#666",lineHeight:1.5}}>{wk.detail}</div>
                  <div style={{display:"flex",gap:8,marginTop:12}}>
                    <button onClick={()=>setRunWeek(p=>Math.max(1,p-1))} style={{flex:1,background:"#080814",border:"1px solid #1e1e38",borderRadius:10,padding:"8px 0",color:"#555",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>← Back</button>
                    <button onClick={()=>setRunWeek(p=>Math.min(session.runProtocol.length,p+1))} style={{flex:1,background:session.accent+"20",border:`1px solid ${session.accent}50`,borderRadius:10,padding:"8px 0",color:session.accent,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Next week →</button>
                  </div>
                </div>
              );
            })()}
            {expandedRun&&(
              <div style={{marginTop:10}}>
                {session.runProtocol.map((wk,i)=>(
                  <div key={i} onClick={()=>{setRunWeek(i+1);setExpandedRun(false);}} style={{background:runWeek===i+1?"#10102a":"transparent",borderRadius:10,padding:"8px 12px",marginBottom:5,border:`1px solid ${runWeek===i+1?session.accent+"50":"#1e1e38"}`,cursor:"pointer"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontSize:10,color:runWeek===i+1?session.accent:"#3a3a5a",fontWeight:600}}>{wk.weeks}</div>
                        <div style={{fontSize:12,fontWeight:700,color:runWeek===i+1?"#fff":"#555"}}>{wk.structure}</div>
                      </div>
                      <span>{wk.icon}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:12,color:"#3a3a5a"}}>Tick when run complete</div>
            <button onClick={()=>setRunDone(p=>!p)} style={{background:runDone?session.accent+"25":"#0a0a18",border:`1.5px solid ${runDone?session.accent:"#161628"}`,borderRadius:14,width:52,height:52,display:"flex",alignItems:"center",justifyContent:"center",color:runDone?session.accent:"#3a3a5a",cursor:"pointer",transition:"all 0.2s"}}>
              <ITick s={20}/>
            </button>
          </div>
        </div>

        <div style={{background:"#10102a",borderRadius:20,padding:"15px 14px",marginBottom:14,border:"1px solid #1e1e38"}}>
          <div style={{fontSize:10,color:session.accent,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:12}}>Home physio exercises</div>
          {session.physioExercises.map((ex,i)=>{
            const done=exDone[ex.id];
            return (
              <div key={ex.id} style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:i<session.physioExercises.length-1?14:0,paddingBottom:i<session.physioExercises.length-1?14:0,borderBottom:i<session.physioExercises.length-1?"1px solid #1a1a30":"none"}}>
                <div style={{flex:1,marginRight:12}}>
                  <div style={{fontSize:14,fontWeight:800,color:done?session.accent:"#fff",transition:"color 0.3s"}}>{ex.name}</div>
                  <div style={{fontSize:11,color:"#3a3a5a",marginTop:2}}>{ex.sets} sets · {ex.reps} · {ex.hold}</div>
                  <div style={{fontSize:11,color:"#1e1e38",marginTop:3,lineHeight:1.5,fontStyle:"italic"}}>{ex.note}</div>
                </div>
                <button onClick={()=>setExDone(p=>({...p,[ex.id]:!p[ex.id]}))} style={{background:done?session.accent:"#0a0a18",border:`1.5px solid ${done?session.accent:"#161628"}`,borderRadius:12,width:46,height:46,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",cursor:"pointer",flexShrink:0,transition:"all 0.2s"}}>
                  <ITick s={17}/>
                </button>
              </div>
            );
          })}
        </div>

        {!allDPDone&&<div style={{background:"#f59e0b15",borderRadius:12,padding:"10px 14px",marginBottom:12,border:"1px solid #f59e0b30",fontSize:12,color:"#f59e0b",textAlign:"center"}}>⚠️ Tick daily physio to unlock finish</div>}

        {canFinish
          ?<button onClick={finish} style={{width:"100%",background:`linear-gradient(135deg,${session.accent},#e91e8c)`,border:"none",borderRadius:18,height:66,color:"#fff",fontSize:18,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>Complete Run Day 🏃</button>
          :<div style={{textAlign:"center",fontSize:12,color:"#1e1e38",padding:"10px 0"}}>{!allDPDone?"Complete daily physio first →":!runDone?"Tick run when done →":"Tick all physio exercises"}</div>
        }
      </div>
    </div>
  );
}

// ── Rest Day (Friday) ─────────────────────────────────────────────────────────
function RestDay({ session, history, onSave, onBack }) {
  const [walkDone, setWalkDone] = useState(false);
  const [phase, setPhase] = useState("main");

  const finish = () => {
    onSave(session.id, { date: new Date().toISOString(), walked: walkDone });
    setPhase("done");
  };

  if (phase === "done") return (
    <div style={{minHeight:"100vh",background:"#080814",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{fontSize:80,marginBottom:16}}>{walkDone ? "🚶" : "😴"}</div>
      <h2 style={{color:"#fff",fontSize:30,fontWeight:900,margin:0,textAlign:"center"}}>{walkDone ? "Walk done!" : "Rest logged!"}</h2>
      <p style={{color:"#555",fontSize:14,textAlign:"center",margin:"8px 0 32px"}}>Friday · {walkDone ? "Rest + walk" : "Full rest"}</p>
      <button onClick={onBack} style={{background:"linear-gradient(135deg,#6b7280,#4b5563)",color:"#fff",border:"none",borderRadius:16,padding:"16px 52px",fontSize:16,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>Back to sessions</button>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#080814",fontFamily:"'DM Sans',sans-serif",paddingBottom:100}}>
      <div style={{background:"linear-gradient(180deg,#6b728028 0%,#080814 100%)",padding:"48px 18px 20px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
          <button onClick={onBack} style={{background:"#1e1e38",border:"none",borderRadius:10,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",color:"#aaa",cursor:"pointer"}}><IBack/></button>
          <div>
            <div style={{fontSize:10,color:"#6b7280",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase"}}>Friday</div>
            <div style={{fontSize:19,fontWeight:900,color:"#fff",letterSpacing:"-0.03em"}}>Rest Day</div>
          </div>
        </div>
      </div>

      <div style={{padding:"0 14px"}}>
        {/* Rest message */}
        <div style={{background:"#10102a",borderRadius:20,padding:"20px 18px",marginBottom:14,border:"1px solid #1e1e38",textAlign:"center"}}>
          <div style={{fontSize:40,marginBottom:12}}>😴</div>
          <div style={{fontSize:16,fontWeight:800,color:"#fff",marginBottom:8}}>Rest is training.</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Your muscles grow during recovery, not during the session. Today is part of the program — not a gap in it.</div>
        </div>

        {/* Optional walk */}
        <div style={{background:"#10102a",borderRadius:20,padding:"18px 16px",marginBottom:14,border:`1px solid ${walkDone?"#6b728060":"#1e1e38"}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{flex:1,marginRight:14}}>
              <div style={{fontSize:10,color:"#6b7280",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>Optional — mental health walk</div>
              <div style={{fontSize:16,fontWeight:800,color:walkDone?"#9ca3af":"#fff"}}>40-Minute Easy Walk</div>
              <div style={{fontSize:12,color:"#3a3a5a",marginTop:4,lineHeight:1.5}}>HR 100–120 · conversational pace · outside if possible · no work calls · podcast or music</div>
              <div style={{fontSize:11,color:"#2a2a4a",marginTop:6,fontStyle:"italic"}}>Won't affect recovery — gentle movement aids it. Do it because it makes you feel better, not because you have to.</div>
            </div>
            <button onClick={()=>setWalkDone(p=>!p)} style={{background:walkDone?"#6b728025":"#0a0a18",border:`1.5px solid ${walkDone?"#6b7280":"#161628"}`,borderRadius:14,width:52,height:52,display:"flex",alignItems:"center",justifyContent:"center",color:walkDone?"#9ca3af":"#3a3a5a",cursor:"pointer",flexShrink:0,transition:"all 0.2s"}}>
              <ITick s={20}/>
            </button>
          </div>
        </div>

        {/* Daily physio reminder */}
        <div style={{background:"#10102a",borderRadius:16,padding:"14px 16px",marginBottom:20,border:"1px solid #f59e0b20"}}>
          <div style={{fontSize:10,color:"#f59e0b",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>Daily physio reminder</div>
          <div style={{fontSize:12,color:"#3a3a5a"}}>Wall push-ups · External rotation · Thoracic foam roller</div>
          <div style={{fontSize:11,color:"#2a2a4a",marginTop:3}}>8 min · can be done at home before school or in the evening</div>
        </div>

        <button onClick={finish} style={{width:"100%",background:"linear-gradient(135deg,#374151,#6b7280)",border:"none",borderRadius:18,height:62,color:"#fff",fontSize:17,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>
          Log Friday {walkDone?"(rest + walk) ✓":"(rest) ✓"}
        </button>
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [history,setHistory]=useState({});
  const [loading,setLoading]=useState(true);
  const [active,setActive]=useState(null);

  useEffect(()=>{
    fetchHistory().then(h=>{ setHistory(h); setLoading(false); });
  },[]);

  const handleSave=async(id,data)=>{
    setHistory(p=>({...p,[id]:data}));
    await persistSession(id,data);
  };

  if(loading) return (
    <div style={{minHeight:"100vh",background:"#080814",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{fontSize:40,marginBottom:16}}>💪</div>
      <div style={{color:"#555",fontSize:14}}>Loading your program...</div>
    </div>
  );

  if(active){
    const gym=GYM_SESSIONS.find(s=>s.id===active);
    const home=HOME_SESSIONS.find(s=>s.id===active);
    if(gym) return <GymSession session={gym} history={history} onSave={handleSave} onBack={()=>setActive(null)}/>;
    if(home&&home.type==="rest") return <RestDay session={home} history={history} onSave={handleSave} onBack={()=>setActive(null)}/>;
    if(home&&home.type==="home") return <RunSession session={home} history={history} onSave={handleSave} onBack={()=>setActive(null)}/>;
  }
  return <HomeScreen onSelect={setActive} history={history}/>;
}
