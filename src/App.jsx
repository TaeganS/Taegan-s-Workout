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
    { id:"ab_dead_bug", name:"Dead Bug", sets:"3", reps:"8 each side", note:"Back flat into floor. Arms reach back as legs alternate. Breathe out on extension. Best for APT correction." },
    { id:"ab_rkc", name:"RKC Plank", sets:"3", reps:"20–25s", note:"Squeeze glutes + quads + abs simultaneously. Elbows pull toward toes. Not passive." },
    { id:"ab_bird_dog", name:"Bird Dog", sets:"3", reps:"8 each side", note:"Opposite arm and leg. 3s hold. No hip rotation. Back flat." },
    { id:"ab_side_plank", name:"Side Plank (from knees)", sets:"2", reps:"20s each", note:"Elbow under shoulder. Hips stacked. Don't sag." },
    { id:"ab_reverse_crunch", name:"Reverse Crunch", sets:"3", reps:"12–15", note:"Lie on back. Knees bent. Curl hips up toward chest — not legs swinging up. Slow lower. Hip flexion not spinal flexion." },
    { id:"ab_tabletop_tap", name:"Tabletop Toe Tap", sets:"3", reps:"10 each side", note:"Lie on back. Both legs at 90° tabletop. Lower one heel slowly to tap floor. Back stays flat. Alternate sides. Dead bug variation — good for APT." },
  ],
  standing:[
    { id:"ab_pallof", name:"Pallof Press", sets:"3", reps:"10 each side", note:"Cable or band at chest. Press straight out. Hold 2s. Resist rotation. Anti-rotation core." },
    { id:"ab_march", name:"DB March", sets:"3", reps:"20 steps", note:"Hold DB at sides. March on spot driving knees up. Core resists rotation. Dynamic anti-rotation." },
    { id:"ab_kb_worlds", name:"KB Around the Worlds", sets:"3", reps:"8 each direction", note:"Light KB. Pass around body in circle. Controlled — no swinging. Keep light given hypermobile shoulder." },
    { id:"ab_suitcase", name:"Suitcase Carry", sets:"3", reps:"20m each side", note:"Heavy-ish DB one hand. Walk without leaning. QL and oblique anti-lateral flexion." },
    { id:"ab_captains", name:"Captain's Chair Knee Raises", sets:"3", reps:"10–12", note:"Arms on pads, back against pad. Slow controlled knee raise. Slow lower. Do NOT swing." },
    { id:"ab_woodchop", name:"Cable Woodchop", sets:"3", reps:"10 each side", note:"Cable at high position. Stand side-on. Pull diagonally across body from high to low. Rotate through trunk. Keep hips square. Anti-rotation with rotation — good for obliques without APT reinforcement." },
    { id:"ab_side_bend", name:"DB Side Bend", sets:"3", reps:"12 each side", note:"Hold DB one hand. Bend directly to the side and return. NOTE: less effective than anti-lateral flexion work for your profile but included as your choice. Keep weight moderate." },
  ],
};

// ─── SESSIONS ────────────────────────────────────────────────────────────────

// ─── PHYSIO TAB ───────────────────────────────────────────────────────────────
const PHYSIO_EXERCISES = [
  { id:"p_wall_push", category:"daily", name:"Wall Push-Ups", sets:"3", reps:"10", note:"Hands shoulder-width on wall. Slow push. Feel shoulder blades SPREAD apart at end — serratus anterior. Winging correction muscle." },
  { id:"p_ext_rot", category:"daily", name:"External Rotation + Abduction", sets:"3", reps:"12", note:"Elbow at 90°. Rotate forearm outward then arm out to shoulder height. 1–2kg only. Feel back of shoulder — rotator cuff." },
  { id:"p_thoracic", category:"daily", name:"Thoracic Mobility (foam roller)", sets:"2", reps:"10 per side", note:"Lie on foam roller across mid-back. Arms raise up and down overhead slowly. Opens thoracic spine. Don't force range." },
  { id:"p_single_bridge", category:"glute", name:"Single-Leg Glute Bridge (band)", sets:"2", reps:"12 each side", note:"Band just above knees. One foot flat, other leg extended. Drive hips up through grounded heel. Hips level — don't let one side drop. Lower slowly. Feel glute of grounded leg." },
  { id:"p_dead_bug", category:"core", name:"Dead Bug", sets:"3", reps:"8 each side", note:"Back flat into floor throughout. Breathe out as leg extends. APT correction." },
  { id:"p_bird_dog", category:"core", name:"Bird Dog", sets:"3", reps:"8 each side", note:"Opposite arm and leg. 3s hold. No hip rotation. Back flat." },
  { id:"p_rkc", category:"core", name:"RKC Plank", sets:"3", reps:"20s", note:"Squeeze glutes + quads + abs simultaneously. Elbows toward toes. Not passive." },
  { id:"p_clamshell", category:"hip", name:"Clamshells (band or BW)", sets:"2", reps:"15 each side", note:"Side-lying, feet together. Open top knee. Hips stacked — don't roll back. Feel glute med." },
  { id:"p_pigeon", category:"stretch", name:"Pigeon Stretch", sets:"3", reps:"30s each side", note:"Hip on floor or bench. Lean forward gently. Deep glute and hip rotator. Don't force range." },
  { id:"p_hip_flexor", category:"stretch", name:"Hip Flexor Stretch", sets:"2", reps:"30s each side", note:"Kneeling lunge. Gently press hips forward. Counteracts anterior pelvic tilt." },
];
const PHYSIO_CATEGORIES = [
  { id:"daily", label:"Daily Physio", color:"#f59e0b" },
  { id:"glute", label:"Glute Activation", color:"#059669" },
  { id:"core", label:"Core", color:"#e91e8c" },
  { id:"hip", label:"Hip Stability", color:"#0891b2" },
  { id:"stretch", label:"Stretches", color:"#7b1fa2" },
];

const GYM_SESSIONS = [
  {
    id:"mon", day:"Monday", label:"Shoulders & Arms", hasGluteFinisher:true, accent:"#1565c0",
    abPair:["ab_pallof","ab_march","ab_kb_worlds"],
    exercises:[
      { id:"lat_raise", name:"Seated Lateral Raise (DB or plate)", type:"isolation",
        note:"SETUP: seated, back supported. DB or plate. Lead with your elbow not your hand — imagine pouring a jug of water sideways. STOP exactly at shoulder height, not above. COMMON MISTAKE: shrugging neck or upper trap instead of lifting with lateral delt. If your neck tenses, the weight is too heavy. FEEL: burning in the side of the shoulder only.",
        warmup:{ note:"Very light × 12 reps — lateral delt only", defaultKg:null, defaultReps:12 },
        sets:[{range:"12–15"},{range:"12–15"},{range:"12–15"}] },
      { id:"rear_delt", name:"Rear Delt (reverse pec deck machine)", type:"isolation",
        note:"SETUP: seat adjusted so handles are at shoulder height. Arms slightly bent throughout — never lock elbows. MOVEMENT: drive elbows back and out in a wide arc. Slow controlled return. COMMON MISTAKE: pulling with biceps or shrugging. FEEL: squeeze behind the shoulder at the end of each rep. Machine only — no bent-over version due to lower back instability.",
        warmup:{ note:"Very light × 12 reps", defaultKg:null, defaultReps:12 },
        sets:[{range:"12–15"},{range:"12–15"},{range:"12–15"}] },
      { id:"tricep_bar", name:"Straight Bar Tricep Pushdown (cable)", type:"isolation",
        note:"SETUP: straight bar at cable machine, grip shoulder-width overhand. MOVEMENT: elbows completely pinned at sides — they must not move at all. Push bar down. STOP 5° before lockout — never snap to full extension (elbow hypermobility). SLOW return — 3 seconds up. COMMON MISTAKE: elbows drifting forward, turning this into a shoulder exercise. FEEL: only the back of the upper arm.",
        warmup:{ note:"Light × 12 reps", defaultKg:null, defaultReps:12 },
        sets:[{range:"12–15"},{range:"12–15"},{range:"12–15"}] },
      { id:"bicep_mon", name:"Cable Bicep Curl", type:"isolation",
        note:"SETUP: straight or EZ bar cable at low pulley. Stand close. MOVEMENT: elbows pinned at sides, do not drift forward. Curl up smoothly. SLOW return — 3 seconds down. STOP 10–15° before full arm extension at the bottom — hypermobile elbow risk. COMMON MISTAKE: swinging body or elbows drifting forward at the top. FEEL: full bicep working from bottom to top of each rep.",
        warmup:{ note:"Light × 12 reps", defaultKg:null, defaultReps:12 },
        sets:[{range:"12–15"},{range:"12–15"},{range:"12–15"}] },
    ],
  },
  {
    id:"tue", day:"Tuesday", label:"Lower A — Posterior Chain", accent:"#059669", hasGluteFinisher:true,
    abPair:["ab_dead_bug","ab_rkc"],
    exercises:[
      { id:"rdl_tue", name:"Romanian Deadlift (cable or DB)", type:"compound",
        note:"SETUP: cable or DBs, standing tall, slight soft bend in knees. MOVEMENT: push hips BACK — imagine a rope around your hips pulling them toward the wall behind you. Weight lowers because hips go back, not because you bend forward. STOP when you feel strong hamstring stretch, before pelvis tucks under. SLOW lowering — 4 seconds down. Stand to neutral at top. COMMON MISTAKE: bending knees too much (becomes a squat) or rounding lower back at the bottom. HYPERMOBILITY: stop at the first point of tension, do not push to end range.",
        warmup:{ note:"50% weight × 10 reps", defaultKg:null, defaultReps:10 },
        sets:[{range:"8–12"},{range:"8–12"},{range:"8–12"}] },
      { id:"heel_split_tue", name:"Heel Elevated Split Squat [PHYSIO]", type:"compound",
        note:"SETUP: front foot heel on plate or block, rear foot flat on floor. MOVEMENT: lower STRAIGHT DOWN — not leaning forward. VMO (inner quad) should fire hard. Both legs. STOP before knee goes to end range. COMMON MISTAKE: leaning forward or letting front knee cave. FEEL: front thigh (VMO) working, knee stable throughout.",
        warmup:{ note:"Bodyweight × 6 each side — feel VMO load", defaultKg:0, defaultReps:6 },
        sets:[{range:"8–12"},{range:"8–12"},{range:"8–12"}] },
      { id:"hip_abd_tue", name:"Cable Hip Abduction", type:"isolation",
        note:"SETUP: cable at ankle, stand side-on to machine. Hold machine lightly for balance only. MOVEMENT: leg moves directly out to the side — not forward, not back. Pelvis stays completely level — no leaning away from the cable. Slow return. COMMON MISTAKE: leaning your whole body away to get more range — this defeats the purpose entirely. FEEL: burning on the outside of the hip (glute med). Your most important hip stabiliser for hypermobility.",
        warmup:{ note:"Light × 12 reps each side", defaultKg:null, defaultReps:12 },
        sets:[{range:"12–15"},{range:"12–15"}] },
      { id:"ham_curl_tue", name:"Seated Hamstring Curl", type:"isolation",
        note:"SETUP: knee joint aligned with machine pivot point. Ankle pad just above the heel. MOVEMENT: curl legs up smoothly. Pause 1 second at top. SLOW lowering — 4 seconds down. STOP 10° short of full extension at the bottom — never snap to straight (knee hypermobility). COMMON MISTAKE: hips lifting off the seat to get more range — keep glutes on the seat throughout. FEEL: hamstring tension throughout, especially on the slow lowering phase.",
        warmup:{ note:"Light × 12 reps", defaultKg:null, defaultReps:12 },
        sets:[{range:"12–15"},{range:"12–15"},{range:"12–15"}] },
    ],
  },
  {
    id:"thu", day:"Thursday", label:"Back & Arms", hasGluteFinisher:true, accent:"#e91e8c",
    abPair:["ab_pallof","ab_kb_worlds","ab_captains"],
    exercises:[
      { id:"lat_pull_wed", name:"Narrow-Grip Lat Pulldown", type:"compound",
        note:"SETUP: narrow/neutral grip. Thighs under pads. BEFORE YOU PULL: depress shoulder blades — tuck them into your back pockets. Hold that. MOVEMENT: pull bar to upper chest, slight 10° lean back only. Slow controlled return. COMMON MISTAKE: using arms only without engaging lats. THINK: lead with elbows not hands. FEEL: wide stretch in lats at the top, contraction across mid-back at the bottom. Right scapula: keep it depressed throughout every rep.",
        warmup:{ note:"50% weight × 10 reps", defaultKg:null, defaultReps:10 },
        sets:[{range:"8–12"},{range:"8–12"},{range:"8–12"}] },
      { id:"chest_row_wed", name:"Chest-Supported Row Machine", type:"compound",
        note:"SETUP: adjust seat so handles are at mid-chest height when leaning forward. Lean chest fully into the pad — this removes ALL lower back involvement. MOVEMENT: pull handles toward your lower chest. Lead with elbows, not hands. Squeeze shoulder blades together at the end. SLOW return — 4 seconds, full arm extension. COMMON MISTAKE: lifting your chest off the pad to get more range — keep it in contact throughout. FEEL: mid-back, rhomboids and rear delt. You will likely go heavier here than single-arm row because your trunk is fully supported.",
        warmup:{ note:"Light weight × 10 reps", defaultKg:null, defaultReps:10 },
        sets:[{range:"8–12"},{range:"8–12"},{range:"8–12"}] },
      { id:"hammer_wed", name:"Hammer Curl (cable, neutral grip)", type:"isolation",
        note:"SETUP: rope or DBs, neutral grip (thumbs pointing up). MOVEMENT: elbows pinned at sides throughout. Curl up smoothly. SLOW return — 3 seconds down. STOP 10° short of full extension at the bottom (elbow hypermobility). COMMON MISTAKE: swinging at the bottom or elbows drifting forward at the top. FEEL: outer side of the upper arm and into the forearm (brachialis). Arm thickness comes from this muscle.",
        warmup:{ note:"Light × 12 reps", defaultKg:null, defaultReps:12 },
        sets:[{range:"12–15"},{range:"12–15"},{range:"12–15"}] },
      { id:"tricep_rope_wed", name:"Tricep Pushdown — rope (cable)", type:"isolation",
        note:"SETUP: rope attachment at high cable. Step back slightly. MOVEMENT: elbows pinned at sides — completely fixed. Push rope down and slightly apart at the bottom. STOP 5° before lockout (elbow hypermobility). SLOW return — 3 seconds up. COMMON MISTAKE: elbows drifting up, or bending forward to use body weight. Stand tall throughout. FEEL: only the back of the upper arm.",
        warmup:{ note:"Light × 12 reps", defaultKg:null, defaultReps:12 },
        sets:[{range:"12–15"},{range:"12–15"},{range:"12–15"}] },
    ],
  },
  {
    id:"sat", day:"Saturday", label:"Lower B — Quad/Glute", accent:"#7b1fa2",
    abPair:["ab_rkc","ab_tabletop_tap"],
    exercises:[
      { id:"hip_thrust_sat", name:"Hip Thrust (Smith or banded floor)", type:"compound",
        note:"SMITH: bench at mid-scapula, drive through heels, ribs down, 1s hold at top. BANDED FLOOR: band above knees, feet flat, drive hips up from floor. Both: glutes hard at top. Choose based on availability. This is your primary glute max exercise — go heavy.",
        warmup:{ note:"Bodyweight glute bridge × 15 — feel glutes fire", defaultKg:0, defaultReps:15 },
        sets:[{range:"8–12"},{range:"8–12"},{range:"8–12"}] },
      { id:"goblet_sat", name:"Heel Elevated Goblet Squat [PHYSIO]", type:"compound",
        note:"SETUP: heels elevated on plate or block, feet hip-width. DB held vertically at chest, elbows pointing down. MOVEMENT: squat STRAIGHT DOWN — hips go down, not back. STOP before pelvis tucks under. SLOW lowering — 4 seconds down. COMMON MISTAKE: sending bum backwards and leaning forward — your physio specifically corrected this pattern. FEEL: quads working hard.",
        warmup:{ note:"Bodyweight tripod squat × 8 — straight down, groove the pattern", defaultKg:0, defaultReps:8 },
        sets:[{range:"8–12"},{range:"8–12"},{range:"8–12"}] },
      { id:"bulgarian_sat", name:"Bulgarian Split Squat (DB)", type:"compound",
        note:"SETUP: rear foot on bench, front foot far enough forward that shin stays vertical when you lower. DBs at sides. MOVEMENT: lower straight down — front knee tracks over 2nd toe, not caving inward. STOP 3–4cm before back knee touches floor. Push through front heel to stand. COMMON MISTAKE: knee caving inward on the way up — drop weight immediately if this happens. FEEL: front leg glute and quad working hard.",
        warmup:{ note:"Bodyweight × 6 each side — feel balance and track the knee", defaultKg:0, defaultReps:6 },
        sets:[{range:"8–12"},{range:"8–12"},{range:"8–12"}] },
      { id:"adductor_sat", name:"Adductor Machine", type:"isolation",
        note:"SETUP: pads just above knees. Set starting position to MID-RANGE — not fully open. MOVEMENT: press legs together smoothly. Hold 1 second at full contraction. SLOW return — stop before reaching fully open position. Do NOT push to end range — hip hypermobility. FEEL: inner thigh contraction. Adductor magnus is one of the largest glute-assisting muscles.",
        warmup:{ note:"Light × 12 reps", defaultKg:null, defaultReps:12 },
        sets:[{range:"12–15"},{range:"12–15"},{range:"12–15"}] },
    ],
  },
  {
    id:"sun", day:"Sunday", label:"Back & Scapular", hasGluteFinisher:true, accent:"#0891b2",
    abPair:["ab_pallof","ab_kb_worlds"],
    exercises:[
      { id:"cable_row_sun", name:"Seated Cable Row (wide neutral grip)", type:"compound",
        note:"SETUP: wide neutral grip, sit tall, slight knee bend, arms extended. BEFORE YOU PULL: retract shoulder blades — pinch them together and DOWN. Hold that. MOVEMENT: pull elbows to sides, pause 1 second at chest. SLOW return — 4 seconds, let arms extend fully. COMMON MISTAKE: pulling with biceps and letting shoulder blades wing forward — if biceps are more tired than your back, this is happening. RIGHT SCAPULA: consciously press it down and back every single rep — this is your winging correction work. FEEL: rhomboids and mid-trapezius contracting between shoulder blades.",
        warmup:{ note:"50% working weight × 10 reps", defaultKg:null, defaultReps:10 },
        sets:[{range:"8–12"},{range:"8–12"},{range:"8–12"}] },
      { id:"lat_pull_sun", name:"Narrow-Grip Lat Pulldown", type:"compound",
        note:"Narrow/neutral grip. Depress shoulder blades FIRST. Pull to upper chest. 10° lean back only. Complements cable row — horizontal + vertical pull.",
        warmup:{ note:"50% weight × 10 reps", defaultKg:null, defaultReps:10 },
        sets:[{range:"8–12"},{range:"8–12"},{range:"8–12"}] },
      { id:"face_pulls_sun", name:"Face Pulls (rope, eye height)", type:"isolation",
        note:"SETUP: rope at eye height. Step back far enough to feel cable tension. MOVEMENT: pull rope toward forehead — elbows must stay HIGH and wide, above shoulder height throughout. At the end position rotate hands outward so thumbs point behind you. Slow return. COMMON MISTAKE: letting elbows drop below shoulder height (becomes a row) or skipping the external rotation at the end. WEIGHT: keep light — this is joint health, not strength. FEEL: rear deltoid and rotator cuff behind the shoulder. If you feel neck or upper trap, elbows are too low.",
        warmup:{ note:"Very light × 12 reps", defaultKg:null, defaultReps:12 },
        sets:[{range:"12–15"},{range:"12–15"},{range:"12–15"}] },
      { id:"ytw_sun", name:"Y-T-W Raises (prone on incline bench)", type:"isolation",
        note:"SETUP: face down on incline bench, arms hanging. MOVEMENT — three letters: Y: raise arms diagonally above head, thumbs up. T: raise arms straight out to sides horizontally. W: elbows bent 90°, raise so elbows are at shoulder height. Hold each position 1 second at the top. WEIGHT: 0.5–2kg maximum — neurological retraining not strength. COMMON MISTAKE: lifting with neck or upper traps instead of lower and mid traps — if your neck strains, drop to bodyweight. RIGHT SIDE: give extra focus — this is your primary scapular winging correction exercise. FEEL: muscles between and below shoulder blades, never your neck.",
        warmup:{ note:"Bodyweight × 6 each letter — feel lower traps, not neck", defaultKg:0, defaultReps:6 },
        sets:[{range:"10 each"},{range:"10 each"},{range:"10 each"}] },
    ],
  },
];

const HOME_SESSIONS = [
  {
    id:"wed", day:"Wednesday", label:"Active Rest — Walk + Run", accent:"#10b981", type:"active_rest",
    canRun: true,
    walkNote:"40+ min brisk walk. HR 100–125. Outside preferred. This is your run day if you feel up to it.",
    runProtocol:[
      { weeks:"Wk 1–2", structure:"Walk only", detail:"40 min brisk walk. No running yet — connective tissue base.", icon:"🚶" },
      { weeks:"Wk 3–4", structure:"1 min jog / 4 min walk", detail:"× 5 intervals. Slow jog — hold a full sentence. Joints must feel fine next day.", icon:"🏃" },
      { weeks:"Wk 5–6", structure:"2 min jog / 3 min walk", detail:"× 5 intervals. Same slow pace — extend time, don't speed up.", icon:"🏃" },
      { weeks:"Wk 7–8", structure:"3 min jog / 2 min walk", detail:"× 5 intervals. More jogging than walking.", icon:"🏃" },
      { weeks:"Wk 9–10", structure:"5 min jog / 2 min walk", detail:"× 4 intervals. Joints should feel comfortable.", icon:"🏃" },
      { weeks:"Wk 11–12", structure:"8 min jog / 2 min walk", detail:"× 3 intervals. Nearly continuous.", icon:"🏃" },
      { weeks:"Post Phase 1", structure:"Build to 30 min continuous", detail:"Add 1–2 min per session. JOINT RULE: if aching the next day, repeat that week before progressing.", icon:"🏅" },
    ],
  },
  {
    id:"fri", day:"Friday", label:"Active Rest — Walk Only", accent:"#6b7280", type:"active_rest",
    canRun: false,
    walkNote:"40+ min easy walk. Walk only today — protects Saturday legs. HR 100–120. No running.",
    runProtocol: null,
  },
];

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
    { id:"ab_dead_bug", name:"Dead Bug", sets:"3", reps:"8 each side", note:"Back flat into floor. Arms reach back as legs alternate. Breathe out on extension. Best for APT correction." },
    { id:"ab_rkc", name:"RKC Plank", sets:"3", reps:"20–25s", note:"Squeeze glutes + quads + abs simultaneously. Elbows pull toward toes. Not passive." },
    { id:"ab_bird_dog", name:"Bird Dog", sets:"3", reps:"8 each side", note:"Opposite arm and leg. 3s hold. No hip rotation. Back flat." },
    { id:"ab_side_plank", name:"Side Plank (from knees)", sets:"2", reps:"20s each", note:"Elbow under shoulder. Hips stacked. Don't sag." },
    { id:"ab_reverse_crunch", name:"Reverse Crunch", sets:"3", reps:"12–15", note:"Lie on back. Knees bent. Curl hips up toward chest — not legs swinging up. Slow lower. Hip flexion not spinal flexion." },
    { id:"ab_tabletop_tap", name:"Tabletop Toe Tap", sets:"3", reps:"10 each side", note:"Lie on back. Both legs at 90° tabletop. Lower one heel slowly to tap floor. Back stays flat. Alternate sides. Dead bug variation — good for APT." },
  ],
  standing:[
    { id:"ab_pallof", name:"Pallof Press", sets:"3", reps:"10 each side", note:"Cable or band at chest. Press straight out. Hold 2s. Resist rotation. Anti-rotation core." },
    { id:"ab_march", name:"DB March", sets:"3", reps:"20 steps", note:"Hold DB at sides. March on spot driving knees up. Core resists rotation. Dynamic anti-rotation." },
    { id:"ab_kb_worlds", name:"KB Around the Worlds", sets:"3", reps:"8 each direction", note:"Light KB. Pass around body in circle. Controlled — no swinging. Keep light given hypermobile shoulder." },
    { id:"ab_suitcase", name:"Suitcase Carry", sets:"3", reps:"20m each side", note:"Heavy-ish DB one hand. Walk without leaning. QL and oblique anti-lateral flexion." },
    { id:"ab_captains", name:"Captain's Chair Knee Raises", sets:"3", reps:"10–12", note:"Arms on pads, back against pad. Slow controlled knee raise. Slow lower. Do NOT swing." },
    { id:"ab_side_bend", name:"DB Side Bend", sets:"3", reps:"12 each side", note:"Hold DB one hand. Bend directly to the side and return. NOTE: less effective than anti-lateral flexion work for your profile but included as your choice. Keep weight moderate." },
  ],
};

// ─── SESSIONS ────────────────────────────────────────────────────────────────

// ─── PHYSIO TAB ───────────────────────────────────────────────────────────────
const PHYSIO_EXERCISES = [
  { id:"p_wall_push", category:"daily", name:"Wall Push-Ups", sets:"3", reps:"10", note:"Hands shoulder-width on wall. Slow push. Feel shoulder blades SPREAD apart at end — serratus anterior. Winging correction muscle." },
  { id:"p_ext_rot", category:"daily", name:"External Rotation + Abduction", sets:"3", reps:"12", note:"Elbow at 90°. Rotate forearm outward then arm out to shoulder height. 1–2kg only. Feel back of shoulder — rotator cuff." },
  { id:"p_thoracic", category:"daily", name:"Thoracic Mobility (foam roller)", sets:"2", reps:"10 per side", note:"Lie on foam roller across mid-back. Arms raise up and down overhead slowly. Opens thoracic spine. Don't force range." },
  { id:"p_single_bridge", category:"glute", name:"Single-Leg Glute Bridge (band)", sets:"2", reps:"12 each side", note:"Band just above knees. One foot flat, other leg extended. Drive hips up through grounded heel. Hips level — don't let one side drop. Lower slowly. Feel glute of grounded leg." },
  { id:"p_dead_bug", category:"core", name:"Dead Bug", sets:"3", reps:"8 each side", note:"Back flat into floor throughout. Breathe out as leg extends. APT correction." },
  { id:"p_bird_dog", category:"core", name:"Bird Dog", sets:"3", reps:"8 each side", note:"Opposite arm and leg. 3s hold. No hip rotation. Back flat." },
  { id:"p_rkc", category:"core", name:"RKC Plank", sets:"3", reps:"20s", note:"Squeeze glutes + quads + abs simultaneously. Elbows toward toes. Not passive." },
  { id:"p_clamshell", category:"hip", name:"Clamshells (band or BW)", sets:"2", reps:"15 each side", note:"Side-lying, feet together. Open top knee. Hips stacked — don't roll back. Feel glute med." },
  { id:"p_pigeon", category:"stretch", name:"Pigeon Stretch", sets:"3", reps:"30s each side", note:"Hip on floor or bench. Lean forward gently. Deep glute and hip rotator. Don't force range." },
  { id:"p_hip_flexor", category:"stretch", name:"Hip Flexor Stretch", sets:"2", reps:"30s each side", note:"Kneeling lunge. Gently press hips forward. Counteracts anterior pelvic tilt." },
];
const PHYSIO_CATEGORIES = [
  { id:"daily", label:"Daily Physio", color:"#f59e0b" },
  { id:"glute", label:"Glute Activation", color:"#059669" },
  { id:"core", label:"Core", color:"#e91e8c" },
  { id:"hip", label:"Hip Stability", color:"#0891b2" },
  { id:"stretch", label:"Stretches", color:"#7b1fa2" },
];

const GYM_SESSIONS = [
  {
    id:"mon", day:"Monday", label:"Shoulders & Arms", accent:"#1565c0",
    abPair:["ab_pallof","ab_march","ab_kb_worlds"],
    exercises:[
      { id:"lat_raise", name:"Seated Lateral Raise (DB or plate)", type:"isolation",
        note:"SETUP: seated, back supported. DB or plate. Lead with your elbow not your hand — imagine pouring a jug of water sideways. STOP exactly at shoulder height, not above. COMMON MISTAKE: shrugging neck or upper trap instead of lifting with lateral delt. If your neck tenses, the weight is too heavy. FEEL: burning in the side of the shoulder only.",
        warmup:{ note:"Very light × 12 reps — lateral delt only", defaultKg:null, defaultReps:12 },
        sets:[{range:"12–15"},{range:"12–15"},{range:"12–15"}] },
      { id:"rear_delt", name:"Rear Delt (reverse pec deck machine)", type:"isolation",
        note:"SETUP: seat adjusted so handles are at shoulder height. Arms slightly bent throughout — never lock elbows. MOVEMENT: drive elbows back and out in a wide arc. Slow controlled return. COMMON MISTAKE: pulling with biceps or shrugging. FEEL: squeeze behind the shoulder at the end of each rep. Machine only — no bent-over version due to lower back instability.",
        warmup:{ note:"Very light × 12 reps", defaultKg:null, defaultReps:12 },
        sets:[{range:"12–15"},{range:"12–15"},{range:"12–15"}] },
      { id:"tricep_bar", name:"Straight Bar Tricep Pushdown (cable)", type:"isolation",
        note:"SETUP: straight bar at cable machine, grip shoulder-width overhand. MOVEMENT: elbows completely pinned at sides — they must not move at all. Push bar down. STOP 5° before lockout — never snap to full extension (elbow hypermobility). SLOW return — 3 seconds up. COMMON MISTAKE: elbows drifting forward, turning this into a shoulder exercise. FEEL: only the back of the upper arm.",
        warmup:{ note:"Light × 12 reps", defaultKg:null, defaultReps:12 },
        sets:[{range:"12–15"},{range:"12–15"},{range:"12–15"}] },
      { id:"bicep_mon", name:"Cable Bicep Curl", type:"isolation",
        note:"SETUP: straight or EZ bar cable at low pulley. Stand close. MOVEMENT: elbows pinned at sides, do not drift forward. Curl up smoothly. SLOW return — 3 seconds down. STOP 10–15° before full arm extension at the bottom — hypermobile elbow risk. COMMON MISTAKE: swinging body or elbows drifting forward at the top. FEEL: full bicep working from bottom to top of each rep.",
        warmup:{ note:"Light × 12 reps", defaultKg:null, defaultReps:12 },
        sets:[{range:"12–15"},{range:"12–15"},{range:"12–15"}] },
    ],
  },
  {
    id:"tue", day:"Tuesday", label:"Lower A — Posterior Chain", accent:"#059669",
    abPair:["ab_dead_bug","ab_rkc"],
    exercises:[
      { id:"rdl_tue", name:"Romanian Deadlift (cable or DB)", type:"compound",
        note:"SETUP: cable or DBs, standing tall, slight soft bend in knees. MOVEMENT: push hips BACK — imagine a rope around your hips pulling them toward the wall behind you. Weight lowers because hips go back, not because you bend forward. STOP when you feel strong hamstring stretch, before pelvis tucks under. SLOW lowering — 4 seconds down. Stand to neutral at top. COMMON MISTAKE: bending knees too much (becomes a squat) or rounding lower back at the bottom. HYPERMOBILITY: stop at the first point of tension, do not push to end range.",
        warmup:{ note:"50% weight × 10 reps", defaultKg:null, defaultReps:10 },
        sets:[{range:"8–12"},{range:"8–12"},{range:"8–12"}] },
      { id:"heel_split_tue", name:"Heel Elevated Split Squat [PHYSIO]", type:"compound",
        note:"SETUP: front foot heel on plate or block, rear foot flat on floor. MOVEMENT: lower STRAIGHT DOWN — not leaning forward. VMO (inner quad) should fire hard. Both legs. STOP before knee goes to end range. COMMON MISTAKE: leaning forward or letting front knee cave. FEEL: front thigh (VMO) working, knee stable throughout.",
        warmup:{ note:"Bodyweight × 6 each side — feel VMO load", defaultKg:0, defaultReps:6 },
        sets:[{range:"8–12"},{range:"8–12"},{range:"8–12"}] },
      { id:"hip_abd_tue", name:"Cable Hip Abduction", type:"isolation",
        note:"SETUP: cable at ankle, stand side-on to machine. Hold machine lightly for balance only. MOVEMENT: leg moves directly out to the side — not forward, not back. Pelvis stays completely level — no leaning away from the cable. Slow return. COMMON MISTAKE: leaning your whole body away to get more range — this defeats the purpose entirely. FEEL: burning on the outside of the hip (glute med). Your most important hip stabiliser for hypermobility.",
        warmup:{ note:"Light × 12 reps each side", defaultKg:null, defaultReps:12 },
        sets:[{range:"12–15"},{range:"12–15"}] },
      { id:"ham_curl_tue", name:"Seated Hamstring Curl", type:"isolation",
        note:"SETUP: knee joint aligned with machine pivot point. Ankle pad just above the heel. MOVEMENT: curl legs up smoothly. Pause 1 second at top. SLOW lowering — 4 seconds down. STOP 10° short of full extension at the bottom — never snap to straight (knee hypermobility). COMMON MISTAKE: hips lifting off the seat to get more range — keep glutes on the seat throughout. FEEL: hamstring tension throughout, especially on the slow lowering phase.",
        warmup:{ note:"Light × 12 reps", defaultKg:null, defaultReps:12 },
        sets:[{range:"12–15"},{range:"12–15"},{range:"12–15"}] },
    ],
  },
  {
    id:"thu", day:"Thursday", label:"Back & Arms", accent:"#e91e8c",
    abPair:["ab_pallof","ab_kb_worlds","ab_captains"],
    exercises:[
      { id:"lat_pull_wed", name:"Narrow-Grip Lat Pulldown", type:"compound",
        note:"SETUP: narrow/neutral grip. Thighs under pads. BEFORE YOU PULL: depress shoulder blades — tuck them into your back pockets. Hold that. MOVEMENT: pull bar to upper chest, slight 10° lean back only. Slow controlled return. COMMON MISTAKE: using arms only without engaging lats. THINK: lead with elbows not hands. FEEL: wide stretch in lats at the top, contraction across mid-back at the bottom. Right scapula: keep it depressed throughout every rep.",
        warmup:{ note:"50% weight × 10 reps", defaultKg:null, defaultReps:10 },
        sets:[{range:"8–12"},{range:"8–12"},{range:"8–12"}] },
      { id:"chest_row_wed", name:"Chest-Supported Row Machine", type:"compound",
        note:"SETUP: adjust seat so handles are at mid-chest height when leaning forward. Lean chest fully into the pad — this removes ALL lower back involvement. MOVEMENT: pull handles toward your lower chest. Lead with elbows, not hands. Squeeze shoulder blades together at the end. SLOW return — 4 seconds, full arm extension. COMMON MISTAKE: lifting your chest off the pad to get more range — keep it in contact throughout. FEEL: mid-back, rhomboids and rear delt. You will likely go heavier here than single-arm row because your trunk is fully supported.",
        warmup:{ note:"Light weight × 10 reps", defaultKg:null, defaultReps:10 },
        sets:[{range:"8–12"},{range:"8–12"},{range:"8–12"}] },
      { id:"hammer_wed", name:"Hammer Curl (cable, neutral grip)", type:"isolation",
        note:"SETUP: rope or DBs, neutral grip (thumbs pointing up). MOVEMENT: elbows pinned at sides throughout. Curl up smoothly. SLOW return — 3 seconds down. STOP 10° short of full extension at the bottom (elbow hypermobility). COMMON MISTAKE: swinging at the bottom or elbows drifting forward at the top. FEEL: outer side of the upper arm and into the forearm (brachialis). Arm thickness comes from this muscle.",
        warmup:{ note:"Light × 12 reps", defaultKg:null, defaultReps:12 },
        sets:[{range:"12–15"},{range:"12–15"},{range:"12–15"}] },
      { id:"tricep_rope_wed", name:"Tricep Pushdown — rope (cable)", type:"isolation",
        note:"SETUP: rope attachment at high cable. Step back slightly. MOVEMENT: elbows pinned at sides — completely fixed. Push rope down and slightly apart at the bottom. STOP 5° before lockout (elbow hypermobility). SLOW return — 3 seconds up. COMMON MISTAKE: elbows drifting up, or bending forward to use body weight. Stand tall throughout. FEEL: only the back of the upper arm.",
        warmup:{ note:"Light × 12 reps", defaultKg:null, defaultReps:12 },
        sets:[{range:"12–15"},{range:"12–15"},{range:"12–15"}] },
    ],
  },
  {
    id:"sat", day:"Saturday", label:"Lower B — Quad/Glute", accent:"#7b1fa2",
    abPair:["ab_rkc","ab_tabletop_tap"],
    exercises:[
      { id:"hip_thrust_sat", name:"Hip Thrust (Smith or banded floor)", type:"compound",
        note:"SMITH: bench at mid-scapula, drive through heels, ribs down, 1s hold at top. BANDED FLOOR: band above knees, feet flat, drive hips up from floor. Both: glutes hard at top. Choose based on availability. This is your primary glute max exercise — go heavy.",
        warmup:{ note:"Bodyweight glute bridge × 15 — feel glutes fire", defaultKg:0, defaultReps:15 },
        sets:[{range:"8–12"},{range:"8–12"},{range:"8–12"}] },
      { id:"goblet_sat", name:"Heel Elevated Goblet Squat [PHYSIO]", type:"compound",
        note:"SETUP: heels elevated on plate or block, feet hip-width. DB held vertically at chest, elbows pointing down. MOVEMENT: squat STRAIGHT DOWN — hips go down, not back. STOP before pelvis tucks under. SLOW lowering — 4 seconds down. COMMON MISTAKE: sending bum backwards and leaning forward — your physio specifically corrected this pattern. FEEL: quads working hard.",
        warmup:{ note:"Bodyweight tripod squat × 8 — straight down, groove the pattern", defaultKg:0, defaultReps:8 },
        sets:[{range:"8–12"},{range:"8–12"},{range:"8–12"}] },
      { id:"bulgarian_sat", name:"Bulgarian Split Squat (DB)", type:"compound",
        note:"SETUP: rear foot on bench, front foot far enough forward that shin stays vertical when you lower. DBs at sides. MOVEMENT: lower straight down — front knee tracks over 2nd toe, not caving inward. STOP 3–4cm before back knee touches floor. Push through front heel to stand. COMMON MISTAKE: knee caving inward on the way up — drop weight immediately if this happens. FEEL: front leg glute and quad working hard.",
        warmup:{ note:"Bodyweight × 6 each side — feel balance and track the knee", defaultKg:0, defaultReps:6 },
        sets:[{range:"8–12"},{range:"8–12"},{range:"8–12"}] },
      { id:"adductor_sat", name:"Adductor Machine", type:"isolation",
        note:"SETUP: pads just above knees. Set starting position to MID-RANGE — not fully open. MOVEMENT: press legs together smoothly. Hold 1 second at full contraction. SLOW return — stop before reaching fully open position. Do NOT push to end range — hip hypermobility. FEEL: inner thigh contraction. Adductor magnus is one of the largest glute-assisting muscles.",
        warmup:{ note:"Light × 12 reps", defaultKg:null, defaultReps:12 },
        sets:[{range:"12–15"},{range:"12–15"},{range:"12–15"}] },
    ],
  },
  {
    id:"sun", day:"Sunday", label:"Back & Scapular", accent:"#0891b2",
    abPair:["ab_pallof","ab_kb_worlds"],
    exercises:[
      { id:"cable_row_sun", name:"Seated Cable Row (wide neutral grip)", type:"compound",
        note:"SETUP: wide neutral grip, sit tall, slight knee bend, arms extended. BEFORE YOU PULL: retract shoulder blades — pinch them together and DOWN. Hold that. MOVEMENT: pull elbows to sides, pause 1 second at chest. SLOW return — 4 seconds, let arms extend fully. COMMON MISTAKE: pulling with biceps and letting shoulder blades wing forward — if biceps are more tired than your back, this is happening. RIGHT SCAPULA: consciously press it down and back every single rep — this is your winging correction work. FEEL: rhomboids and mid-trapezius contracting between shoulder blades.",
        warmup:{ note:"50% working weight × 10 reps", defaultKg:null, defaultReps:10 },
        sets:[{range:"8–12"},{range:"8–12"},{range:"8–12"}] },
      { id:"lat_pull_sun", name:"Narrow-Grip Lat Pulldown", type:"compound",
        note:"Narrow/neutral grip. Depress shoulder blades FIRST. Pull to upper chest. 10° lean back only. Complements cable row — horizontal + vertical pull.",
        warmup:{ note:"50% weight × 10 reps", defaultKg:null, defaultReps:10 },
        sets:[{range:"8–12"},{range:"8–12"},{range:"8–12"}] },
      { id:"face_pulls_sun", name:"Face Pulls (rope, eye height)", type:"isolation",
        note:"SETUP: rope at eye height. Step back far enough to feel cable tension. MOVEMENT: pull rope toward forehead — elbows must stay HIGH and wide, above shoulder height throughout. At the end position rotate hands outward so thumbs point behind you. Slow return. COMMON MISTAKE: letting elbows drop below shoulder height (becomes a row) or skipping the external rotation at the end. WEIGHT: keep light — this is joint health, not strength. FEEL: rear deltoid and rotator cuff behind the shoulder. If you feel neck or upper trap, elbows are too low.",
        warmup:{ note:"Very light × 12 reps", defaultKg:null, defaultReps:12 },
        sets:[{range:"12–15"},{range:"12–15"},{range:"12–15"}] },
      { id:"ytw_sun", name:"Y-T-W Raises (prone on incline bench)", type:"isolation",
        note:"SETUP: face down on incline bench, arms hanging. MOVEMENT — three letters: Y: raise arms diagonally above head, thumbs up. T: raise arms straight out to sides horizontally. W: elbows bent 90°, raise so elbows are at shoulder height. Hold each position 1 second at the top. WEIGHT: 0.5–2kg maximum — neurological retraining not strength. COMMON MISTAKE: lifting with neck or upper traps instead of lower and mid traps — if your neck strains, drop to bodyweight. RIGHT SIDE: give extra focus — this is your primary scapular winging correction exercise. FEEL: muscles between and below shoulder blades, never your neck.",
        warmup:{ note:"Bodyweight × 6 each letter — feel lower traps, not neck", defaultKg:0, defaultReps:6 },
        sets:[{range:"10 each"},{range:"10 each"},{range:"10 each"}] },
    ],
  },
];

const HOME_SESSIONS = [
  {
    id:"thu", day:"Thursday", label:"Run or Walk", accent:"#d97706", type:"home",
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
  const { data: noteRows } = await supabase
    .from('exercise_notes')
    .select('*');
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
  // Attach persistent notes
  const exerciseNotes = {};
  if (noteRows) {
    noteRows.forEach(n => { exerciseNotes[n.exercise_id] = n.note_text; });
  }
  return { sessions: history, notes: exerciseNotes };
}

// Calendar-based week tracking — set once, calculates automatically forever
async function loadProgramStartDate() {
  try {
    const { data } = await supabase.from('app_settings').select('value').eq('key','program_start_date').single();
    return data ? data.value : null;
  } catch { return null; }
}
async function saveProgramStartDate(dateStr) {
  await supabase.from('app_settings').upsert({ key:'program_start_date', value:dateStr }, { onConflict:'key' });
}
async function loadWeekOverride() {
  try {
    const { data } = await supabase.from('app_settings').select('value').eq('key','week_override').single();
    return data ? JSON.parse(data.value) : null; // {week: N, setAt: dateStr}
  } catch { return null; }
}
async function saveWeekOverride(week) {
  const payload = JSON.stringify({ week, setAt: new Date().toISOString().split('T')[0] });
  await supabase.from('app_settings').upsert({ key:'week_override', value:payload }, { onConflict:'key' });
}
function calculateCurrentWeek(startDateStr, overrideData) {
  if (!startDateStr) return 1;
  const start = new Date(startDateStr);
  const today = new Date();
  start.setHours(0,0,0,0);
  today.setHours(0,0,0,0);
  const daysSinceStart = Math.floor((today - start) / (1000*60*60*24));
  const calendarWeek = Math.max(1, Math.floor(daysSinceStart / 7) + 1);
  // If there's an override (manual repeat-a-week), apply offset from when it was set
  if (overrideData && overrideData.week) {
    const overrideSetDate = new Date(overrideData.setAt);
    overrideSetDate.setHours(0,0,0,0);
    const daysSinceOverride = Math.floor((today - overrideSetDate) / (1000*60*60*24));
    const weeksSinceOverride = Math.floor(daysSinceOverride / 7);
    return overrideData.week + weeksSinceOverride;
  }
  return calendarWeek;
}
async function loadPhysioProgress() {
  const monday = new Date();
  monday.setDate(monday.getDate() - ((monday.getDay()+6)%7));
  monday.setHours(0,0,0,0);
  try {
    const { data } = await supabase.from('physio_completions').select('*').gte('week_start', monday.toISOString().split('T')[0]);
    const done = {};
    if (data) data.forEach(r => { done[r.exercise_id] = true; });
    return done;
  } catch { return {}; }
}
async function savePhysioCompletion(exerciseId, isDone) {
  const monday = new Date();
  monday.setDate(monday.getDate() - ((monday.getDay()+6)%7));
  monday.setHours(0,0,0,0);
  const weekStart = monday.toISOString().split('T')[0];
  if (isDone) {
    await supabase.from('physio_completions').upsert({ exercise_id: exerciseId, week_start: weekStart }, { onConflict: 'exercise_id,week_start' });
  } else {
    await supabase.from('physio_completions').delete().eq('exercise_id', exerciseId).eq('week_start', weekStart);
  }
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

// ── Glute Finisher Block (editable sets) ────────────────────────────────────
function GluteFinisherBlock({ accent, finisherLogs, setFinisherLogs, onModal, prevFinisher }) {
  const [expanded, setExpanded] = useState(false);
  const addSet = () => setFinisherLogs(p => ({ ...p, sets: [...p.sets, { kg:null, reps:null, done:false }] }));
  const removeSet = () => setFinisherLogs(p => ({ ...p, sets: p.sets.length > 1 ? p.sets.slice(0,-1) : p.sets }));
  const toggleSet = (si) => setFinisherLogs(p => ({ ...p, sets: p.sets.map((s,i)=>i===si?{...s,done:!s.done}:s) }));
  const allDone = finisherLogs.sets.length > 0 && finisherLogs.sets.every(s => s.done);

  return (
    <div style={{background:"#10102a",borderRadius:20,padding:"15px 13px",marginBottom:12,border:`1px solid ${allDone?"#7b1fa260":"#1e1e38"}`,transition:"border-color 0.3s"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <div style={{flex:1,marginRight:8}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
            <span style={{fontSize:14}}>🍑</span>
            <div style={{fontSize:15,fontWeight:800,color:allDone?"#7b1fa2":"#fff"}}>DB Hip Thrust — Finisher</div>
          </div>
          <div style={{fontSize:10,color:"#1e1e38",paddingLeft:21}}>Glute frequency work · editable sets · physio recommended</div>
        </div>
        <button onClick={()=>setExpanded(p=>!p)} style={{background:"#181830",border:"none",borderRadius:8,width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",color:expanded?"#7b1fa2":"#3a3a5a",cursor:"pointer",flexShrink:0}}>
          <IInfo/>
        </button>
      </div>

      {expanded&&<div style={{background:"#080814",borderRadius:10,padding:"10px 12px",marginBottom:12,fontSize:12,color:"#666",lineHeight:1.6,borderLeft:"3px solid #7b1fa2"}}>
        Sit against bench, DB held horizontally across hip creases with both hands. Drive through heels. Glutes hard + ribs down at top — no lower back arch. Default 2 sets — increase to 3 using the + button below if you have time and energy. This is frequency work, not your main glute stimulus — keep it light and quick.
      </div>}

      {prevFinisher&&prevFinisher.sets?.length>0&&(
        <div style={{display:"flex",gap:5,marginBottom:10,flexWrap:"wrap"}}>
          {prevFinisher.sets.map((s,si)=>(
            <div key={si} style={{fontSize:10,color:"#2a2a4a",background:"#080814",padding:"2px 8px",borderRadius:20,border:"1px solid #1a1a30"}}>
              Last S{si+1}:{s.kg??'—'}kg×{s.reps??'—'}
            </div>
          ))}
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"52px 1fr 1fr 40px",gap:6,marginBottom:4}}>
        {["","KG","REPS","✓"].map((h,i)=><div key={i} style={{fontSize:9,color:"#2a2a4a",textAlign:"center"}}>{h}</div>)}
      </div>

      {finisherLogs.sets.map((s,si)=>(
        <div key={si} style={{display:"grid",gridTemplateColumns:"52px 1fr 1fr 40px",gap:6,marginBottom:6,alignItems:"center"}}>
          <div style={{fontSize:11,color:"#7b1fa2",fontWeight:700,textAlign:"center"}}>S{si+1}</div>
          <button onClick={()=>onModal({field:"kg",si})} style={{background:s.done?"#7b1fa218":"#0a0a18",border:`1.5px solid ${s.done?"#7b1fa260":"#161628"}`,borderRadius:12,height:44,color:s.kg!=null?"#fff":"#1e1e38",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
            {s.kg!=null?`${s.kg}`:"—"}
          </button>
          <button onClick={()=>onModal({field:"reps",si})} style={{background:s.done?"#7b1fa218":"#0a0a18",border:`1.5px solid ${s.done?"#7b1fa260":"#161628"}`,borderRadius:12,height:44,color:s.reps!=null?"#fff":"#1e1e38",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
            {s.reps!=null?`${s.reps}`:"—"}
          </button>
          <button onClick={()=>toggleSet(si)} style={{background:s.done?"#7b1fa2":"#0a0a18",border:`1.5px solid ${s.done?"#7b1fa2":"#161628"}`,borderRadius:12,height:44,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",cursor:"pointer"}}>
            {s.done&&<ITick s={14}/>}
          </button>
        </div>
      ))}

      <div style={{display:"flex",gap:8,marginTop:8}}>
        <button onClick={removeSet} style={{flex:1,background:"#080814",border:"1px solid #1e1e38",borderRadius:10,height:36,color:"#555",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>− Remove set</button>
        <button onClick={addSet} style={{flex:1,background:"#7b1fa220",border:"1px solid #7b1fa250",borderRadius:10,height:36,color:"#7b1fa2",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>+ Add set</button>
      </div>
    </div>
  );
}

function AbBlock({ done, setDone, accent, abLogs, setAbLogs, abNotes, onAbNoteSave, onAbModal, abPair }) {
  const allAbs = [...AB_OPTIONS.floor,...AB_OPTIONS.standing];
  const [editingNote, setEditingNote] = useState(null);
  const [showSwaps, setShowSwaps] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const plannedExercises = abPair.map(id => allAbs.find(a => a.id === id)).filter(Boolean);
  const swapGroups = [
    { label:"Floor — bodyweight", color:"#e91e8c", ids:["ab_dead_bug","ab_rkc","ab_bird_dog","ab_side_plank","ab_reverse_crunch","ab_tabletop_tap"] },
    { label:"Cable machine", color:"#0891b2", ids:["ab_pallof","ab_woodchop"] },
    { label:"Standing — no cable", color:"#059669", ids:["ab_march","ab_kb_worlds","ab_captains"] },
  ];

  const renderExercise = (ex, isSwap=false) => {
    const isDone = done[ex.id];
    const log = abLogs[ex.id] || { kg:null, reps:null, sets:null };
    const isOpen = expanded === ex.id;
    return (
      <div key={ex.id} style={{marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",
          background:isDone?(accent+"18"):"#080814",borderRadius:12,
          border:`1px solid ${isDone?accent+"50":"#1e1e38"}`,cursor:"pointer",transition:"all 0.2s"}}
          onClick={()=>setDone(p=>({...p,[ex.id]:!p[ex.id]}))}>
          <div style={{width:20,height:20,borderRadius:6,background:isDone?accent:"#1a1a30",
            border:`1.5px solid ${isDone?accent:"#2a2a4a"}`,display:"flex",alignItems:"center",
            justifyContent:"center",flexShrink:0,transition:"all 0.2s"}}>
            {isDone&&<ITick s={11}/>}
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:isDone?accent:"#ccc"}}>{ex.name}</div>
            <div style={{fontSize:11,color:"#2a2a4a",marginTop:1}}>3 sets · {ex.reps}</div>
          </div>
          <button onClick={e=>{e.stopPropagation();setExpanded(isOpen?null:ex.id);}} style={{background:"#1a1a30",border:"none",borderRadius:8,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",color:isOpen?accent:"#3a3a5a",cursor:"pointer"}}>
            <IInfo/>
          </button>
        </div>
        {isOpen&&<div style={{background:"#080814",borderRadius:"0 0 10px 10px",padding:"8px 12px",fontSize:11,color:"#666",lineHeight:1.6,borderLeft:`3px solid ${accent}`,marginTop:-4}}>{ex.note}</div>}
        {isDone&&(
          <div style={{background:"#080814",borderRadius:"0 0 12px 12px",padding:"10px 12px",marginTop:-4,border:`1px solid ${accent}20`,borderTop:"none"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:4}}>
              <div style={{fontSize:9,color:"#2a2a4a",textAlign:"center"}}>SETS</div>
              <div style={{fontSize:9,color:"#2a2a4a",textAlign:"center"}}>KG (optional)</div>
              <div style={{fontSize:9,color:"#2a2a4a",textAlign:"center"}}>REPS / TIME</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
              {["sets","kg","reps"].map(field=>(
                <button key={field} onClick={()=>onAbModal({exId:ex.id,field})} style={{background:"#10102a",border:`1px solid ${log[field]!=null?"#252540":"#1e1e38"}`,borderRadius:10,height:44,color:log[field]!=null?"#fff":"#2a2a4a",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                  {log[field]!=null?`${log[field]}`:"—"}
                </button>
              ))}
            </div>
            {editingNote===ex.id ? (
              <div>
                <textarea defaultValue={abNotes[ex.id]||""} id={`abnote_${ex.id}`} placeholder="Add notes..." style={{width:"100%",background:"#10102a",border:"1px solid #2a2a4a",borderRadius:8,padding:"8px",color:"#ccc",fontSize:11,fontFamily:"inherit",resize:"none",height:54,boxSizing:"border-box"}}/>
                <div style={{display:"flex",gap:6,marginTop:6}}>
                  <button onClick={()=>setEditingNote(null)} style={{flex:1,background:"#1a1a30",border:"none",borderRadius:8,height:30,color:"#555",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
                  <button onClick={()=>{ const val=document.getElementById(`abnote_${ex.id}`).value; onAbNoteSave(ex.id,val); setEditingNote(null); }} style={{flex:2,background:accent,border:"none",borderRadius:8,height:30,color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Save</button>
                </div>
              </div>
            ) : (
              <div onClick={()=>setEditingNote(ex.id)} style={{cursor:"pointer",display:"flex",gap:6,alignItems:"flex-start"}}>
                <span style={{fontSize:10,color:"#2a2a4a"}}>📝</span>
                <span style={{fontSize:11,color:abNotes[ex.id]?"#777":"#2a2a4a",fontStyle:abNotes[ex.id]?"normal":"italic"}}>{abNotes[ex.id]||"Add notes..."}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{background:"#10102a",borderRadius:20,padding:"15px 14px",marginBottom:12,border:"1px solid #1e1e38"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
        <div style={{fontSize:10,color:accent,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase"}}>Core / Abs — optional</div>
        <button onClick={()=>setShowSwaps(p=>!p)} style={{background:"#1a1a30",border:"none",borderRadius:8,padding:"4px 10px",color:"#555",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>
          {showSwaps?"Hide swaps":"Swap options"}
        </button>
      </div>
      <div style={{fontSize:11,color:"#2a2a4a",marginBottom:12,fontStyle:"italic"}}>Today's planned exercises · 3 sets each · tap to log</div>

      {/* Planned exercises */}
      {plannedExercises.map(ex => renderExercise(ex))}

      {/* Swap groups dropdown */}
      {showSwaps&&(
        <div style={{marginTop:12,borderTop:"1px solid #1a1a30",paddingTop:12}}>
          <div style={{fontSize:10,color:"#3a3a5a",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>Swap options — grouped by equipment</div>
          {swapGroups.map(group=>(
            <div key={group.label} style={{marginBottom:12}}>
              <div style={{fontSize:10,color:group.color,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:6}}>{group.label}</div>
              {group.ids.map(id=>{
                const ex = allAbs.find(a=>a.id===id);
                if (!ex) return null;
                return renderExercise(ex, true);
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


// ── Home Screen ───────────────────────────────────────────────────────────────
function HomeScreen({ onSelect, history, travelWeek, setTravelWeek, currentWeek, onRepeatWeek, onPhysioTab, physioDone }) {
  const weekAgo = new Date(Date.now()-7*86400000);
  const allSessions = [...GYM_SESSIONS,...HOME_SESSIONS.filter(s=>s.type!=="rest")];
  const doneCount = allSessions.filter(s=>history[s.id]?.date&&new Date(history[s.id].date)>weekAgo).length;
  const dayOrder = ["mon","tue","wed","thu","fri","sat","sun"];

  // Normal week order
  const normalOrder = [...GYM_SESSIONS,...HOME_SESSIONS].sort((a,b)=>dayOrder.indexOf(a.id)-dayOrder.indexOf(b.id));

  // Travel week: Mon Shoulders, Tue Lower A, Wed Back & Arms, Thu Lower B, Fri Back & Scapular — Sat/Sun away
  const travelSessionIds = ["mon","tue","wed","sat","sun"]; // sat=Lower B, sun=Back & Scap shown as Thu/Fri
  const travelSchedule = [
    { ...GYM_SESSIONS.find(s=>s.id==="mon"), travelDay:"Monday" },
    { ...GYM_SESSIONS.find(s=>s.id==="tue"), travelDay:"Tuesday" },
    { ...GYM_SESSIONS.find(s=>s.id==="wed"), travelDay:"Wednesday" },
    { ...HOME_SESSIONS.find(s=>s.id==="thu"), travelDay:"Thursday — Run SKIPPED this week" },
    { ...GYM_SESSIONS.find(s=>s.id==="sat"), travelDay:"Thursday — Lower B (moved from Sat)" },
    { ...GYM_SESSIONS.find(s=>s.id==="sun"), travelDay:"Friday — Back & Scapular (moved from Sun)" },
    { id:"fri_travel", day:"Friday", label:"Rest / Travel", accent:"#6b7280", type:"travel_rest", travelDay:"Saturday + Sunday" },
  ];

  return (
    <div style={{minHeight:"100vh",background:"#080814",fontFamily:"'DM Sans',system-ui,sans-serif",paddingBottom:48}}>
      <div style={{padding:"56px 20px 24px",background:"linear-gradient(180deg,#180824 0%,#080814 100%)"}}>
        <div style={{fontSize:10,color:"#e91e8c",fontWeight:700,letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:8}}>Phase 1 · Weeks 1–4</div>
        <h1 style={{fontSize:30,fontWeight:900,color:"#fff",margin:"0 0 4px",letterSpacing:"-0.04em",lineHeight:1.1}}>Good to see you,<br/>Taegan 💪</h1>
        <p style={{color:"#444",fontSize:13,margin:"8px 0 16px"}}>{doneCount}/{allSessions.length} sessions this week</p>
        <div style={{background:"#1a1a2e",borderRadius:8,height:6,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${(doneCount/allSessions.length)*100}%`,background:"linear-gradient(90deg,#e91e8c,#9c27b0)",borderRadius:8,transition:"width 0.6s"}}/>
        </div>

        {/* Week tracker — auto-calculated from calendar */}
        <div style={{marginTop:16,background:"#0a0a18",borderRadius:12,padding:"12px 14px",border:"1px solid #1e1e38"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{fontSize:10,color:"#3a3a5a",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase"}}>Current week</div>
              <div style={{fontSize:22,fontWeight:900,color:"#e91e8c",letterSpacing:"-0.04em"}}>Week {currentWeek}</div>
            </div>
            <button onClick={()=>{ if(window.confirm("Repeat this week instead of advancing? Use this if joints are aching and you need another week at the same level.")) onRepeatWeek(); }} style={{background:"#1e1e38",border:"none",borderRadius:10,padding:"8px 12px",color:"#888",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
              ↻ Repeat week
            </button>
          </div>
          <div style={{fontSize:10,color:"#2a2a4a",marginTop:6}}>Advances automatically every Monday — no need to update it</div>
        </div>
      </div>

      {/* Physio tab button */}
      <div style={{margin:"0 16px 14px"}}>
        <button onClick={onPhysioTab} style={{width:"100%",background:"#10102a",border:`1px solid ${Object.values(physioDone).filter(Boolean).length>0?"#f59e0b50":"#1e1e38"}`,borderRadius:16,padding:"13px 16px",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:20}}>🏥</span>
            <div style={{textAlign:"left"}}>
              <div style={{fontSize:11,color:"#f59e0b",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase"}}>Physio tab</div>
              <div style={{fontSize:12,color:"#3a3a5a"}}>{Object.values(physioDone).filter(Boolean).length}/{PHYSIO_EXERCISES.length} exercises this week · tap to log</div>
            </div>
          </div>
          <span style={{color:"#3a3a5a",fontSize:16}}>›</span>
        </button>
      </div>

      {/* Travel week toggle */}
      <div style={{margin:"0 16px 14px",background:travelWeek?"#1a1a0a":"#10102a",borderRadius:16,padding:"14px 16px",border:`1px solid ${travelWeek?"#f59e0b60":"#1e1e38"}`,cursor:"pointer"}} onClick={()=>setTravelWeek(p=>!p)}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:11,color:travelWeek?"#f59e0b":"#555",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:3}}>
              {travelWeek?"✈️ Travel Week Mode ON":"✈️ Away this weekend?"}
            </div>
            <div style={{fontSize:12,color:travelWeek?"#aaa":"#3a3a5a"}}>
              {travelWeek?"Sat + Sun sessions moved to Thu + Fri":"Tap to shift weekend sessions to weekdays"}
            </div>
          </div>
          <div style={{width:44,height:26,borderRadius:13,background:travelWeek?"#f59e0b":"#1e1e38",position:"relative",transition:"background 0.2s",flexShrink:0}}>
            <div style={{position:"absolute",top:3,left:travelWeek?21:3,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
          </div>
        </div>
        {travelWeek&&(
          <div style={{marginTop:12,background:"#0a0a00",borderRadius:12,padding:"10px 12px",border:"1px solid #f59e0b30"}}>
            <div style={{fontSize:10,color:"#f59e0b",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>This week's schedule</div>
            {[["Mon","Shoulders & Arms"],["Tue","Lower A — Glute/Ham"],["Wed","Back & Arms"],["Thu","Lower B (moved from Sat)"],["Fri","Back & Scapular (moved from Sun)"],["Sat–Sun","Away — rest + recover 🌍"],["Run","Skipped this week — resume next Thursday"]].map(([day,sess])=>(
              <div key={day} style={{display:"flex",gap:12,marginBottom:5,alignItems:"center"}}>
                <div style={{fontSize:10,color:"#f59e0b",fontWeight:700,width:32,flexShrink:0}}>{day}</div>
                <div style={{fontSize:11,color:"#888"}}>{sess}</div>
              </div>
            ))}
            <div style={{fontSize:10,color:"#3a3a5a",marginTop:8,fontStyle:"italic"}}>Lower A Tue → Lower B Thu = 48h. Workable because posterior chain vs quad dominant split.</div>
          </div>
        )}
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
        {(travelWeek ? travelSchedule : normalOrder).map((session,idx)=>{
          const last=history[session.id];
          const done=last?.date&&new Date(last.date)>weekAgo;
          const isRest=session.type==="rest"||session.type==="travel_rest";
          const isHome=session.type==="home"&&!isRest;
          const displayDay = travelWeek ? session.travelDay : session.day;
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
                      {displayDay}{isHome?" · Home":isRest?" · Rest":""}
                    </div>
                    <div style={{fontSize:17,fontWeight:900,color:"#fff",letterSpacing:"-0.02em"}}>{session.label}</div>
                    {!isRest&&<div style={{fontSize:11,color:"#2a2a4a",marginTop:3}}>
                      {isHome?"Run + physio drills":session.exercises?`${session.exercises.length} exercises · warm-up + 3 sets each`:""}
                    </div>}
                    {isRest&&session.type==="travel_rest"&&<div style={{fontSize:11,color:"#2a2a4a",marginTop:3}}>🌍 Away — rest, recover, enjoy it.</div>}
                    {isRest&&session.type!=="travel_rest"&&<div style={{fontSize:11,color:"#2a2a4a",marginTop:3}}>Rest is training. You've earned this.</div>}
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
function GymSession({ session, history, onSave, onBack, exerciseNotes={}, onNoteSave }) {
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
  const [editingNote,setEditingNote]=useState(null);
  const [abLogs,setAbLogs]=useState(()=>{ const d={}; [...AB_OPTIONS.floor,...AB_OPTIONS.standing].forEach(e=>{d[e.id]={kg:null,reps:null,sets:null};}); return d; });
  const [abNotes,setAbNotes]=useState({});
  const [abModal,setAbModal]=useState(null);
  const [finisherLogs,setFinisherLogs]=useState(()=>{
    const prevF = prev?.finisher;
    if (prevF && prevF.sets && prevF.sets.length) {
      return { sets: prevF.sets.map(s=>({ kg:s.kg, reps:s.reps, done:false })) };
    }
    return { sets: [{kg:null,reps:null,done:false},{kg:null,reps:null,done:false}] };
  });
  const [finisherModal,setFinisherModal]=useState(null);
  const [expanded,setExpanded]=useState(null);
  const [phase,setPhase]=useState("main");

  const allDPDone=Object.values(dpDone).every(Boolean);
  const totalSets=session.exercises.reduce((a,e)=>a+e.sets.length,0);
  const doneSets=Object.values(logs).reduce((a,ex)=>a+ex.sets.filter(s=>s.done).length,0);
  const allMainDone=doneSets===totalSets;
  const suggestedAbsDone=session.abPair.every(id=>abDone[id]);
  const canFinish=true;

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
    if(session.hasGluteFinisher){
      result.finisher={ sets: finisherLogs.sets.map(s=>({kg:s.kg,reps:s.reps})) };
    }
    onSave(session.id,result);
    setPhase("done");
  };

  if(phase==="done") return (
    <div style={{minHeight:"100vh",background:"#080814",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{fontSize:80,marginBottom:16}}>🎉</div>
      <h2 style={{color:"#fff",fontSize:30,fontWeight:900,margin:0,textAlign:"center"}}>Session done!</h2>
      <p style={{color:"#555",fontSize:14,textAlign:"center",margin:"8px 0 16px"}}>{session.day} · {session.label}</p>
      <button onClick={()=>setPhase("main")} style={{background:"#10102a",border:"1px solid #1e1e38",borderRadius:14,padding:"12px 28px",color:"#888",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",marginBottom:16}}>
        ✏️ Edit / update this session
      </button>
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

              {/* Persistent notes */}
              <div style={{marginTop:10,borderTop:"1px solid #1a1a30",paddingTop:10}}>
                {editingNote===ex.id ? (
                  <div>
                    <textarea
                      defaultValue={exerciseNotes[ex.id]||""}
                      id={`note_${ex.id}`}
                      placeholder="Add your notes for this exercise..."
                      style={{width:"100%",background:"#080814",border:"1px solid #2a2a4a",borderRadius:10,padding:"8px 10px",color:"#ccc",fontSize:12,fontFamily:"inherit",resize:"none",height:72,boxSizing:"border-box"}}
                    />
                    <div style={{display:"flex",gap:8,marginTop:6}}>
                      <button onClick={()=>setEditingNote(null)} style={{flex:1,background:"#1a1a30",border:"none",borderRadius:8,height:34,color:"#555",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
                      <button onClick={()=>{ const val=document.getElementById(`note_${ex.id}`).value; onNoteSave(ex.id,val); setEditingNote(null); }} style={{flex:2,background:"#e91e8c",border:"none",borderRadius:8,height:34,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Save note</button>
                    </div>
                  </div>
                ) : (
                  <div onClick={()=>setEditingNote(ex.id)} style={{cursor:"pointer",display:"flex",alignItems:"flex-start",gap:8}}>
                    <span style={{fontSize:11,color:"#2a2a4a",flexShrink:0,marginTop:1}}>📝</span>
                    <span style={{fontSize:11,color:exerciseNotes[ex.id]?"#888":"#2a2a4a",fontStyle:exerciseNotes[ex.id]?"normal":"italic",lineHeight:1.4}}>
                      {exerciseNotes[ex.id]||"Tap to add notes..."}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {session.hasGluteFinisher&&(
          <GluteFinisherBlock
            accent={session.accent}
            finisherLogs={finisherLogs}
            setFinisherLogs={setFinisherLogs}
            onModal={(m)=>setFinisherModal(m)}
            prevFinisher={prev?.finisher}
          />
        )}

        <AbBlock done={abDone} setDone={setAbDone} accent={session.accent} abLogs={abLogs} setAbLogs={setAbLogs} abNotes={abNotes} onAbNoteSave={async(exId,note)=>{ setAbNotes(p=>({...p,[exId]:note})); await saveExerciseNote("ab_"+exId, note); }} onAbModal={(m)=>setAbModal(m)} abPair={session.abPair||[]}/>

        {canFinish
          ?<button onClick={finish} style={{width:"100%",background:"linear-gradient(135deg,#e91e8c,#9c27b0)",border:"none",borderRadius:18,height:66,color:"#fff",fontSize:18,fontWeight:900,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 8px 40px rgba(233,30,140,0.5)"}}>Complete Session 🎉</button>
          :<div style={{textAlign:"center",fontSize:12,color:"#1e1e38",padding:"10px 0"}}>{`${totalSets-doneSets} working sets left`}</div>
        }
      </div>

      {abModal&&<Numpad
        label={abModal.field==="kg"?"Weight (kg)":"Reps / Time"}
        sublabel={null}
        initial={abLogs[abModal.exId]?.[abModal.field]}
        onSave={val=>setAbLogs(p=>({...p,[abModal.exId]:{...p[abModal.exId],[abModal.field]:val}}))}
        onClose={()=>setAbModal(null)}
      />}
      {finisherModal&&<Numpad
        label={finisherModal.field==="kg"?"Weight (kg)":"Reps"}
        sublabel="DB Hip Thrust Finisher"
        initial={finisherLogs.sets[finisherModal.si]?.[finisherModal.field]}
        onSave={val=>setFinisherLogs(p=>({...p,sets:p.sets.map((s,i)=>i===finisherModal.si?{...s,[finisherModal.field]:val}:s)}))}
        onClose={()=>setFinisherModal(null)}
      />}
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
  const canFinish=runDone&&allExDone;

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

        {canFinish
          ?<button onClick={finish} style={{width:"100%",background:`linear-gradient(135deg,${session.accent},#e91e8c)`,border:"none",borderRadius:18,height:66,color:"#fff",fontSize:18,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>Complete Run Day 🏃</button>
          :<div style={{textAlign:"center",fontSize:12,color:"#1e1e38",padding:"10px 0"}}>{!runDone?"Tick run when done →":"Tick all physio exercises"}</div>
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



        <button onClick={finish} style={{width:"100%",background:"linear-gradient(135deg,#374151,#6b7280)",border:"none",borderRadius:18,height:62,color:"#fff",fontSize:17,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>
          Log Friday {walkDone?"(rest + walk) ✓":"(rest) ✓"}
        </button>
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────


// ── Active Rest Screen ────────────────────────────────────────────────────────
function ActiveRestScreen({ session, history, onSave, onBack }) {
  const prev = history[session.id] || {};
  const [walkDone, setWalkDone] = useState(false);
  const [runDone, setRunDone] = useState(false);
  const [runWeek, setRunWeek] = useState(prev.runWeek ?? 3);
  const [expandedRun, setExpandedRun] = useState(false);
  const [phase, setPhase] = useState("main");

  const finish = () => {
    onSave(session.id, { date: new Date().toISOString(), walked: walkDone, runWeek });
    setPhase("done");
  };

  if (phase === "done") return (
    <div style={{minHeight:"100vh",background:"#080814",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{fontSize:80,marginBottom:16}}>{runDone?"🏃":"🚶"}</div>
      <h2 style={{color:"#fff",fontSize:28,fontWeight:900,margin:0,textAlign:"center"}}>{session.day} done!</h2>
      <p style={{color:"#555",fontSize:14,textAlign:"center",margin:"8px 0 32px"}}>{runDone?"Run + walk":"Walk"} completed</p>
      <button onClick={onBack} style={{background:`linear-gradient(135deg,${session.accent},#e91e8c)`,color:"#fff",border:"none",borderRadius:16,padding:"16px 52px",fontSize:16,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>Back</button>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#080814",fontFamily:"'DM Sans',sans-serif",paddingBottom:80}}>
      <div style={{background:`linear-gradient(180deg,${session.accent}28 0%,#080814 100%)`,padding:"48px 18px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={onBack} style={{background:"#1e1e38",border:"none",borderRadius:10,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",color:"#aaa",cursor:"pointer"}}><IBack/></button>
          <div>
            <div style={{fontSize:10,color:session.accent,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase"}}>{session.day} · Active Rest</div>
            <div style={{fontSize:19,fontWeight:900,color:"#fff"}}>{session.label}</div>
          </div>
        </div>
      </div>

      <div style={{padding:"12px 14px"}}>
        {/* Walk tick */}
        <div style={{background:"#10102a",borderRadius:20,padding:"16px 16px",marginBottom:12,border:`1px solid ${walkDone?session.accent+"60":"#1e1e38"}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{flex:1,marginRight:14}}>
              <div style={{fontSize:10,color:session.accent,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>Walk</div>
              <div style={{fontSize:16,fontWeight:800,color:"#fff"}}>40+ Min Walk</div>
              <div style={{fontSize:12,color:"#3a3a5a",marginTop:4,lineHeight:1.5}}>{session.walkNote}</div>
            </div>
            <button onClick={()=>setWalkDone(p=>!p)} style={{background:walkDone?session.accent+"25":"#0a0a18",border:`1.5px solid ${walkDone?session.accent:"#161628"}`,borderRadius:14,width:52,height:52,display:"flex",alignItems:"center",justifyContent:"center",color:walkDone?session.accent:"#3a3a5a",cursor:"pointer",flexShrink:0,transition:"all 0.2s"}}>
              <ITick s={20}/>
            </button>
          </div>
        </div>

        {/* Run protocol — only on Wednesday */}
        {session.canRun && session.runProtocol && (
          <div style={{background:"#10102a",borderRadius:20,padding:"16px 16px",marginBottom:12,border:`1px solid ${runDone?"#10b98160":"#1e1e38"}`}}>
            <div style={{fontSize:10,color:session.accent,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:10}}>Run — optional</div>
            <div style={{background:"#080814",borderRadius:14,padding:"12px 14px",marginBottom:12,border:"1px solid #1e1e38"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontSize:12,fontWeight:700,color:"#aaa"}}>Current week protocol</div>
                <button onClick={()=>setExpandedRun(p=>!p)} style={{background:"#1a1a30",border:"none",borderRadius:8,padding:"4px 10px",color:session.accent,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{expandedRun?"Hide":"All weeks"}</button>
              </div>
              {(()=>{
                const wk = session.runProtocol[Math.min(runWeek-1, session.runProtocol.length-1)];
                return (
                  <div style={{background:"#10102a",borderRadius:12,padding:"12px 14px",border:`1px solid ${session.accent}40`}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                      <div style={{fontSize:10,color:session.accent,fontWeight:700,textTransform:"uppercase"}}>{wk.weeks}</div>
                      <span style={{fontSize:20}}>{wk.icon}</span>
                    </div>
                    <div style={{fontSize:15,fontWeight:800,color:"#fff",marginBottom:4}}>{wk.structure}</div>
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
              <div style={{fontSize:12,color:"#3a3a5a"}}>Tick if you ran today</div>
              <button onClick={()=>setRunDone(p=>!p)} style={{background:runDone?"#10b98125":"#0a0a18",border:`1.5px solid ${runDone?"#10b981":"#161628"}`,borderRadius:14,width:52,height:52,display:"flex",alignItems:"center",justifyContent:"center",color:runDone?"#10b981":"#3a3a5a",cursor:"pointer",transition:"all 0.2s"}}>
                <ITick s={20}/>
              </button>
            </div>
          </div>
        )}

        <button onClick={finish} style={{width:"100%",background:`linear-gradient(135deg,${session.accent},#059669)`,border:"none",borderRadius:18,height:62,color:"#fff",fontSize:17,fontWeight:900,cursor:"pointer",fontFamily:"inherit",marginTop:8}}>
          Log {session.day} ✓
        </button>
      </div>
    </div>
  );
}

// ── Physio Screen ─────────────────────────────────────────────────────────────
function PhysioScreen({ physioDone, onToggle, onBack, currentWeek }) {
  const totalEx = PHYSIO_EXERCISES.length;
  const doneCount = Object.values(physioDone).filter(Boolean).length;
  const [expanded, setExpanded] = useState(null);

  // Last week completion stored in state for display
  const pct = Math.round((doneCount/totalEx)*100);

  return (
    <div style={{minHeight:"100vh",background:"#080814",fontFamily:"'DM Sans',sans-serif",paddingBottom:80}}>
      <div style={{background:"linear-gradient(180deg,#1a1400 0%,#080814 100%)",padding:"48px 18px 16px",position:"sticky",top:0,zIndex:10,backdropFilter:"blur(12px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <button onClick={onBack} style={{background:"#1e1e38",border:"none",borderRadius:10,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",color:"#aaa",cursor:"pointer"}}><IBack/></button>
          <div>
            <div style={{fontSize:10,color:"#f59e0b",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase"}}>Week {currentWeek}</div>
            <div style={{fontSize:19,fontWeight:900,color:"#fff",letterSpacing:"-0.03em"}}>Physio</div>
          </div>
          <div style={{marginLeft:"auto",fontSize:12,color:"#2a2a4a"}}>{doneCount}/{totalEx} this week</div>
        </div>
        <div style={{background:"#1a1a2e",borderRadius:6,height:5,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#f59e0b,#e91e8c)",borderRadius:6,transition:"width 0.4s"}}/>
        </div>
        <div style={{marginTop:6,fontSize:11,color:"#2a2a4a"}}>Tick off at your own pace · resets every Monday</div>
      </div>

      <div style={{padding:"8px 14px"}}>
        <div style={{background:"#10102a",borderRadius:14,padding:"12px 14px",marginBottom:16,border:"1px solid #f59e0b20"}}>
          <div style={{fontSize:11,color:"#f59e0b",fontWeight:600,marginBottom:4}}>How to use this tab</div>
          <div style={{fontSize:11,color:"#3a3a5a",lineHeight:1.6}}>These are your physio-prescribed exercises. Do them whenever you can throughout the week — morning, lunch, evening, whenever. They reset every Monday so you start fresh each week.</div>
        </div>

        {PHYSIO_CATEGORIES.map(cat=>{
          const exercises = PHYSIO_EXERCISES.filter(e=>e.category===cat.id);
          const catDone = exercises.filter(e=>physioDone[e.id]).length;
          return (
            <div key={cat.id} style={{marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{fontSize:10,color:cat.color,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase"}}>{cat.label}</div>
                <div style={{fontSize:11,color:"#2a2a4a"}}>{catDone}/{exercises.length}</div>
              </div>
              {exercises.map((ex,i)=>{
                const done = physioDone[ex.id]||false;
                const isOpen = expanded===ex.id;
                return (
                  <div key={ex.id} style={{marginBottom:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:done?"#0a120a":"#10102a",borderRadius:14,border:`1px solid ${done?cat.color+"50":"#1e1e38"}`,transition:"all 0.2s"}}>
                      <button onClick={()=>onToggle(ex.id,!done)} style={{width:24,height:24,borderRadius:7,background:done?cat.color:"#1a1a30",border:`1.5px solid ${done?cat.color:"#2a2a4a"}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,transition:"all 0.2s"}}>
                        {done&&<ITick s={13}/>}
                      </button>
                      <div style={{flex:1,cursor:"pointer"}} onClick={()=>onToggle(ex.id,!done)}>
                        <div style={{fontSize:14,fontWeight:700,color:done?cat.color:"#fff",transition:"color 0.2s"}}>{ex.name}</div>
                        <div style={{fontSize:11,color:"#2a2a4a",marginTop:2}}>{ex.sets} sets · {ex.reps}</div>
                      </div>
                      <button onClick={()=>setExpanded(isOpen?null:ex.id)} style={{background:"#1a1a30",border:"none",borderRadius:8,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",color:isOpen?cat.color:"#3a3a5a",cursor:"pointer"}}>
                        <IInfo/>
                      </button>
                    </div>
                    {isOpen&&<div style={{background:"#080814",borderRadius:"0 0 12px 12px",padding:"10px 14px",fontSize:12,color:"#666",lineHeight:1.6,borderLeft:`3px solid ${cat.color}`,marginTop:-4}}>{ex.note}</div>}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const [history,setHistory]=useState({});
  const [exerciseNotes,setExerciseNotes]=useState({});
  const [loading,setLoading]=useState(true);
  const [active,setActive]=useState(null);
  const [travelWeek,setTravelWeek]=useState(false);
  const [currentWeek,setCurrentWeek]=useState(1);
  const [programStartDate,setProgramStartDate]=useState(null);
  const [weekOverride,setWeekOverride]=useState(null);
  const [physioTab,setPhysioTab]=useState(false);
  const [physioDone,setPhysioDone]=useState({});
  const [showStartDatePrompt,setShowStartDatePrompt]=useState(false);

  useEffect(()=>{
    Promise.all([fetchHistory(),loadProgramStartDate(),loadWeekOverride(),loadPhysioProgress()]).then(([result,startDate,override,physio])=>{
      setHistory(result.sessions||{});
      setExerciseNotes(result.notes||{});
      setPhysioDone(physio||{});
      if(startDate){
        setProgramStartDate(startDate);
        setWeekOverride(override);
        setCurrentWeek(calculateCurrentWeek(startDate,override));
      } else {
        setShowStartDatePrompt(true);
      }
      setLoading(false);
    });
  },[]);

  const handleSetStartDate=async(dateStr)=>{
    await saveProgramStartDate(dateStr);
    setProgramStartDate(dateStr);
    setCurrentWeek(calculateCurrentWeek(dateStr,null));
    setShowStartDatePrompt(false);
  };

  const handleRepeatWeek=async()=>{
    await saveWeekOverride(currentWeek);
    setWeekOverride({week:currentWeek,setAt:new Date().toISOString().split('T')[0]});
  };

  const handleSave=async(id,data)=>{
    setHistory(p=>({...p,[id]:data}));
    await persistSession(id,data);
  };
  const handlePhysioToggle=async(exId,done)=>{ setPhysioDone(p=>({...p,[exId]:done})); await savePhysioCompletion(exId,done); };

  if(loading) return (
    <div style={{minHeight:"100vh",background:"#080814",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{fontSize:40,marginBottom:16}}>💪</div>
      <div style={{color:"#555",fontSize:14}}>Loading your program...</div>
    </div>
  );

  if(showStartDatePrompt) return (
    <div style={{minHeight:"100vh",background:"#080814",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{fontSize:50,marginBottom:16}}>📅</div>
      <h2 style={{color:"#fff",fontSize:22,fontWeight:900,textAlign:"center",margin:"0 0 8px"}}>When did Week 1 start?</h2>
      <p style={{color:"#555",fontSize:13,textAlign:"center",margin:"0 0 28px",maxWidth:280,lineHeight:1.5}}>This sets your program clock. From here the app calculates your current week automatically — you'll never need to update it manually.</p>
      <input
        type="date"
        id="startDateInput"
        defaultValue={new Date().toISOString().split('T')[0]}
        style={{background:"#10102a",border:"1px solid #2a2a4a",borderRadius:12,padding:"14px 16px",color:"#fff",fontSize:16,fontFamily:"inherit",marginBottom:20,width:240,textAlign:"center"}}
      />
      <button onClick={()=>{ const val=document.getElementById('startDateInput').value; if(val) handleSetStartDate(val); }} style={{background:"linear-gradient(135deg,#e91e8c,#9c27b0)",border:"none",borderRadius:16,padding:"16px 48px",color:"#fff",fontSize:16,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>
        Start tracking
      </button>
    </div>
  );

  if(active){
    const gym=GYM_SESSIONS.find(s=>s.id===active);
    const home=HOME_SESSIONS.find(s=>s.id===active);
    if(gym) return <GymSession session={gym} history={history} exerciseNotes={exerciseNotes} onNoteSave={async(exId,note)=>{ setExerciseNotes(p=>({...p,[exId]:note})); await saveExerciseNote(exId,note); }} onSave={handleSave} onBack={()=>setActive(null)}/>;
    if(home&&home.type==="rest") return <RestDay session={home} history={history} onSave={handleSave} onBack={()=>setActive(null)}/>;
    if(home&&home.type==="home") return <RunSession session={home} history={history} onSave={handleSave} onBack={()=>setActive(null)}/>;
    if(home&&home.type==="active_rest") return <ActiveRestScreen session={home} history={history} onSave={handleSave} onBack={()=>setActive(null)}/>;
  }
  if(physioTab) return <PhysioScreen physioDone={physioDone} onToggle={handlePhysioToggle} onBack={()=>setPhysioTab(false)} currentWeek={currentWeek}/>;
  return <HomeScreen onSelect={setActive} history={history} travelWeek={travelWeek} setTravelWeek={setTravelWeek} currentWeek={currentWeek} onRepeatWeek={handleRepeatWeek} onPhysioTab={()=>setPhysioTab(true)} physioDone={physioDone}/>;
}
