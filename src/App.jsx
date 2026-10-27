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
    { id:"ab_pallof", name:"Pallof Press", sets:"3", reps:"10 each side", defaultKg:6.25, note:"Cable or band at chest. Press straight out. Hold 2s. Resist rotation. Anti-rotation core." },
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
    id:"tue", day:"Tuesday", label:"Lower A: Quad + Hamstring + Glute Med", accent:"#059669",
    warmupNote:"WARMUP (3 min):\n• Glute bridges 2x15 bodyweight (drive through heels, squeeze at top)\n• Banded lateral walk 2x15 each direction (semi-squat, band at ankles, primes glute med)\n• Calf and toe raises on yoga block 1x10 (physio drill, slow eccentric)",
    exercises:[
      { id:"leg_press_tue", name:"Leg Press", type:"compound",
        videoUrl:"https://www.youtube.com/results?search_query=leg+press+form+jeff+nippard",
        note:"SETUP: feet shoulder-width mid to slightly high on platform, toes turned out 10-15 degrees. Back flat against pad throughout.\n\nMOVEMENT: 4 seconds down. Stop at 90 degree knee bend. Press through heels. STOP 5 to 10 degrees before full knee extension at top. Never lock knees (hypermobility rule).\n\nSTARTING WEIGHT: 42.5kg.\n\nFEEL: quads and glutes working together.",
        warmup:{ note:"50% weight x 10-12 reps", defaultKg:null, defaultReps:12 },
        sets:[{range:"10-12",defaultKg:42.5},{range:"10-12",defaultKg:42.5},{range:"10-12",defaultKg:42.5}] },
      { id:"calf_press_tue", name:"Calf Press (superset with leg press)", type:"isolation",
        videoUrl:"https://www.youtube.com/results?search_query=calf+press+leg+press+form",
        note:"SUPERSET WITH LEG PRESS. Stay on the leg press machine between leg press sets.\n\nSETUP: slide feet so only balls of feet contact platform. Drop heels BELOW platform line for full stretch.\n\nMOVEMENT: press up through balls of feet. Hold 1s at top. Slow return.\n\nFULL RANGE OF MOTION is the point. Load same stack as leg press or lighter.",
        warmup:null,
        sets:[{range:"15-20",defaultKg:42.5},{range:"15-20",defaultKg:42.5},{range:"15-20",defaultKg:42.5}] },
      { id:"hack_squat_tue", name:"Hack Squat Machine", type:"compound",
        videoUrl:"https://www.youtube.com/results?search_query=hack+squat+form+jeff+nippard",
        note:"SETUP: back fully supported against pad. Feet shoulder-width mid-platform, toes slightly out.\n\nMOVEMENT: 4 seconds down. Stop before pelvis tucks under (butt wink). Push through full foot, emphasis on heels. STOP 5 to 10 degrees before full knee extension.\n\nSTARTING WEIGHT: start light, build up over sessions.\n\nFEEL: quads working hard, back supported, zero lower back strain.",
        warmup:{ note:"50% weight x 10 reps", defaultKg:null, defaultReps:10 },
        sets:[{range:"8-12",defaultKg:20},{range:"8-12",defaultKg:20},{range:"8-12",defaultKg:20}] },
      { id:"seated_ham_curl_tue", name:"Seated Hamstring Curl (machine)", type:"isolation",
        videoUrl:"https://www.youtube.com/results?search_query=seated+hamstring+curl+form+jeff+nippard",
        note:"SETUP: adjust seat so knees align with the machine pivot. Thigh pad just above your knees. Sit tall, hips fully against back pad.\n\nWHY SEATED: this position stretches hamstrings at the hip, producing more growth than lying curl (Maeo et al. 2021, ~55% more growth).\n\nMOVEMENT: curl smoothly down. Pause 1s at full contraction. 4 second return. STOP 10 degrees before full extension (knee hypermobility).\n\nSTARTING WEIGHT: 14kg.\n\nFEEL: full hamstring under load from a lengthened position.",
        warmup:{ note:"Light x 12 reps", defaultKg:null, defaultReps:12 },
        sets:[{range:"10-12",defaultKg:14},{range:"10-12",defaultKg:14},{range:"10-12",defaultKg:14}] },
      { id:"seated_abd_tue", name:"Seated Abduction Machine", type:"isolation",
        videoUrl:"https://www.youtube.com/results?search_query=seated+hip+abduction+machine+form",
        note:"SETUP: sit tall, back against pad, knees against the outer pads. Lean slightly forward for glute med emphasis.\n\nMOVEMENT: push knees apart with control. Pause 1s at full contraction. 3 second return.\n\nSTARTING WEIGHT: start moderate.\n\nFEEL: burning on outside of hips (glute med). Keep form strict, this is isolation not strength.",
        warmup:{ note:"Light x 12 reps", defaultKg:null, defaultReps:12 },
        sets:[{range:"12-15",defaultKg:20},{range:"12-15",defaultKg:20},{range:"12-15",defaultKg:20}] },
    ],
  },
  {
    id:"wed", day:"Wednesday", label:"Upper A: Back + Rear Delt + Biceps", accent:"#0891b2",
    warmupNote:"WARMUP (3 min):\n• Wall pushups hands at hip height 2x10 (protract at top, serratus activation)\n• Band pull-aparts 2x15 (rear delt prep)\n• Banded external rotations 2x10 each side (rotator cuff)\n• Y raise prone on floor 2x10 hold 1s (lower trap activation)",
    cooldownNote:"COOLDOWN (90 sec, same cable as bicep curl):\n• Half-kneeling Pallof press 1x10 each side at 6.25kg. Anti-rotation core work.",
    exercises:[
      { id:"lat_pull_wed", name:"Narrow Neutral Grip Lat Pulldown", type:"compound",
        videoUrl:"https://www.youtube.com/results?search_query=neutral+grip+lat+pulldown+form+jeff+nippard",
        note:"SETUP: close-grip neutral attachment (palms facing each other). Thighs under pads.\n\nBEFORE YOU PULL: depress shoulder blades, tuck them into your back pockets.\n\nMOVEMENT: pull to upper chest, 10 degree lean back only. 4 second return.\n\nHYPERMOBILITY: neutral grip protects the shoulder joint.\n\nRIGHT SCAPULA: keep it depressed throughout.\n\nSTARTING WEIGHT: 24kg.\n\nFEEL: wide stretch in lats at top, contraction across mid-back at bottom.",
        warmup:{ note:"50% weight x 12 reps", defaultKg:null, defaultReps:12 },
        sets:[{range:"8-12",defaultKg:24},{range:"8-12",defaultKg:24},{range:"8-12",defaultKg:24}] },
      { id:"chest_row_wed", name:"Chest-Supported Row (machine)", type:"compound",
        videoUrl:"https://www.youtube.com/results?search_query=chest+supported+row+machine+form",
        note:"SETUP: chest glued to the pad, this is the whole point. It removes your spine from the equation. Grip neutral or slightly wider than shoulder-width.\n\nBEFORE YOU PULL: depress shoulder blades DOWN into the pad first.\n\nMOVEMENT: pull elbows back and slightly out. Pause 1s at full contraction, squeeze mid-back. 4 second return.\n\nRIGHT SCAPULA: focus extra attention every rep, press it down and back.\n\nSTARTING WEIGHT: 20kg.\n\nFEEL: mid-back and rhomboids only, zero lower back involvement.",
        warmup:{ note:"50% weight x 10 reps", defaultKg:null, defaultReps:10 },
        sets:[{range:"8-12",defaultKg:20},{range:"8-12",defaultKg:20},{range:"8-12",defaultKg:20}] },
      { id:"rear_delt_wed", name:"Rear Delt Machine", type:"isolation",
        videoUrl:"https://www.youtube.com/results?search_query=rear+delt+machine+reverse+pec+deck+form",
        note:"SETUP: reverse pec deck (machine faces you). Chest against pad. Neutral grip or thumbs up on the handles.\n\nMOVEMENT: lead with elbows, not hands. Pull handles out and back until arms are in line with shoulders. Pause 1s at full contraction. Slow return.\n\nSTARTING WEIGHT: light, build up.\n\nFEEL: rear delts only, no bicep involvement.",
        warmup:{ note:"Very light x 12 reps", defaultKg:null, defaultReps:12 },
        sets:[{range:"12-15",defaultKg:10},{range:"12-15",defaultKg:10},{range:"12-15",defaultKg:10}] },
      { id:"cable_curl_wed", name:"Cable Bicep Curl", type:"isolation",
        videoUrl:"https://www.youtube.com/results?search_query=cable+bicep+curl+form+jeff+nippard",
        note:"SETUP: straight bar at low pulley. Stand close to the stack.\n\nMOVEMENT: elbows pulled back BEHIND hips, tuck them into the back of your waistband. Not at your sides, not in front, behind.\n\nCurl up. Pause 1 second at top. 3 second return. STOP 10 to 15 degrees before full extension at bottom (elbow hypermobility).\n\nSTARTING WEIGHT: 6.25kg.\n\nFEEL: full bicep tension throughout, zero chest or front delt.\n\nAFTER FINAL SET: do cooldown Pallof press at the same cable.",
        warmup:{ note:"Light x 12 reps", defaultKg:null, defaultReps:12 },
        sets:[{range:"10-12",defaultKg:6.25},{range:"10-12",defaultKg:6.25},{range:"10-12",defaultKg:6.25}] },
    ],
  },
  {
    id:"thu", day:"Thursday", label:"Full Body + Arms + Abs", accent:"#e91e8c",
    warmupNote:"WARMUP (2 min):\n• Banded clamshells 2x12 each side (glute med)\n• Band pull-aparts 2x15 (scapular prep for pressing)",
    abCircuitRotation:[
      [
        { id:"ab_dead_bug_together", name:"Double Arm Dead Bug (together)", sets:"3", reps:"10", note:"Lie on back, both arms straight up, both legs 90 degrees bent (tabletop). EXTEND BOTH LEGS at once while BOTH ARMS reach overhead. Back GLUED to floor the whole time (if back arches, legs too low, raise them). Return. Start bodyweight. Progress with 1-2kg DB in each hand at chest, then overhead. Together version works anti-extension harder, which is exactly what APT needs." },
        { id:"ab_pallof_press", name:"Pallof Press", sets:"3", reps:"10 each side", defaultKg:6.25, note:"Cable at chest height. Stand side-on. Press handle straight out, hold 2s. RESIST rotation the entire time. Pelvis stays square. Anti-rotation core." },
        { id:"ab_copenhagen", name:"Copenhagen Plank", sets:"2", reps:"20-25s each side", note:"Side-lying. Top foot on bench. Bottom leg hangs or rests lightly. Lift hips, body in a straight line. FEEL: inner thigh of top leg and lateral core. Start with 15s if new to this." },
      ],
      [
        { id:"ab_prone_arm_leg", name:"Prone Alternate Arm-Leg Lift", sets:"3", reps:"20", note:"Lie face down on mat. Lift opposite arm and leg together (right arm + left leg, then switch). Keep neck neutral. Squeeze glute of the lifted leg. Physio-prescribed, hits posterior chain and core." },
        { id:"ab_cable_woodchop", name:"Cable Woodchop", sets:"3", reps:"10 each side", defaultKg:6.25, note:"Cable at high position. Stand side-on. Pull diagonally across body from high to low. Rotate through trunk, keep hips square." },
        { id:"ab_side_plank_dip", name:"Side Plank with Hip Dip", sets:"2", reps:"10 each side", note:"Side plank position. Lower hips toward floor and return to straight line. Controlled. FEEL: lateral core (QL and obliques)." },
      ],
      [
        { id:"ab_dead_bug_db", name:"Double Arm Dead Bug with DB", sets:"3", reps:"10", note:"Same as weeks 1-2 but hold a 1-2kg DB in each hand. Keep back glued to floor. If back arches, drop the weight.", defaultKg:1 },
        { id:"ab_pallof_hk", name:"Half-kneeling Pallof Press", sets:"3", reps:"10 each side", defaultKg:6.25, note:"Half-kneeling position (inside knee up, outside knee down). Press handle out, resist rotation. Harder than standing because base is narrower." },
        { id:"ab_suitcase_carry", name:"Suitcase Carry", sets:"2", reps:"20m each side", note:"Hold moderate DB in one hand. Walk 20m without leaning. Core resists lateral flexion. Shoulders level the whole time." },
      ],
    ],
    exercises:[
      { id:"hip_thrust_thu", name:"Hip Thrust DB (light, form focus)", type:"compound",
        videoUrl:"https://www.youtube.com/results?search_query=dumbbell+hip+thrust+form",
        note:"SETUP: upper back on bench, feet flat hip-width on floor. DB across hip crease (use a towel pad to protect hips).\n\nBEFORE YOU PUSH: ribs DOWN, don't flare them. Drive through HEELS.\n\nMOVEMENT: hips rise until body is a straight line from knees to shoulders. Squeeze glutes hard at top, 1s hold. 4 second lowering. STOP before hips touch floor.\n\nRIGHT GLUTE: extra squeeze each rep (left tends to dominate).\n\nSTARTING WEIGHT: 10kg DB.\n\nTHIS IS THE ACTIVATION AND FORM SESSION, not the heavy day. Saturday is heavy.",
        warmup:{ note:"Bodyweight glute bridge x 15, feel both glutes fire equally", defaultKg:0, defaultReps:15 },
        sets:[{range:"10-12",defaultKg:10},{range:"10-12",defaultKg:10},{range:"10-12",defaultKg:10}] },
      { id:"bstance_rdl_thu", name:"B-stance RDL", type:"compound",
        videoUrl:"https://www.youtube.com/results?search_query=b+stance+rdl+form+jeff+nippard",
        note:"SETUP: stagger stance, back foot FULL on floor but offset slightly behind front foot. About 70 percent weight on front leg. DBs in both hands at sides.\n\nMOVEMENT: hinge at hips, push hips BACK as DBs travel down close to shins. Soft bend in front knee throughout. STOP at first point of hamstring tension, do not push to end range.\n\nDrive back up through front heel.\n\nSTARTING WEIGHT: 7kg DBs.\n\nFEEL: hamstring and glute of front leg.\n\nWHY B-STANCE OVER KICKSTAND: back foot flat gives more stable base, allows heavier loading for better hamstring stimulus.",
        warmup:{ note:"Bodyweight x 8 each side, feel the hip hinge", defaultKg:0, defaultReps:8 },
        sets:[{range:"8-10",defaultKg:7},{range:"8-10",defaultKg:7},{range:"8-10",defaultKg:7}] },
      { id:"skull_crush_thu", name:"Skull Crushers", type:"isolation",
        videoUrl:"https://www.youtube.com/results?search_query=skull+crushers+ez+bar+form+jeff+nippard",
        note:"SETUP: lie flat on bench with EZ bar or DBs. Grip overhand, slightly narrower than shoulder-width. Elbows point straight up at start.\n\nMOVEMENT: lower bar/DBs to just above forehead, elbows stay pinned (don't flare out). Press back up. STOP 5 degrees before full lockout (elbow hypermobility). Only forearms move.\n\nSTARTING WEIGHT: start light with EZ bar or 3-4kg DBs, build up.\n\nFEEL: back of upper arms (triceps) only.",
        warmup:{ note:"Light x 10 reps", defaultKg:null, defaultReps:10 },
        sets:[{range:"10-12",defaultKg:7.5},{range:"10-12",defaultKg:7.5},{range:"10-12",defaultKg:7.5}] },
      { id:"lat_raise_thu", name:"Lateral Raise (seated DB)", type:"isolation",
        videoUrl:"https://www.youtube.com/results?search_query=lateral+raise+form+jeff+nippard",
        note:"SETUP: seated, back supported against bench. DBs at sides.\n\nMOVEMENT: lead with elbow, raise arms straight out to sides. STOP at shoulder height, no higher. 3 second return.\n\nSTARTING WEIGHT: 2.5kg.\n\nFEEL: side of shoulder only.",
        warmup:{ note:"Very light x 12 reps", defaultKg:null, defaultReps:12 },
        sets:[{range:"12-15",defaultKg:2.5},{range:"12-15",defaultKg:2.5},{range:"12-15",defaultKg:2.5}] },
    ],
  },
  {
    id:"sat", day:"Saturday", label:"Lower B: Heavy Glute + Quad", accent:"#7b1fa2",
    warmupNote:"WARMUP (3 min):\n• Glute bridges 2x15 bodyweight or light DB\n• Banded lateral walk 2x15 each direction\n• Calf and toe raises on yoga block 1x10\n• T raise prone on floor 2x10 hold 1s (mid trap and rhomboid activation)",
    exercises:[
      { id:"hip_thrust_sat", name:"Hip Thrust Smith (heavy)", type:"compound",
        videoUrl:"https://www.youtube.com/results?search_query=smith+machine+hip+thrust+form",
        note:"SETUP: upper back on bench, Smith bar across hip crease (pad required). Feet flat hip-width on floor.\n\nBEFORE YOU PUSH: ribs DOWN. Drive through HEELS.\n\nMOVEMENT: hips rise until body is a straight line from knees to shoulders. Squeeze glutes hard at top, 1s hold. 4 second lowering. STOP before hips touch floor.\n\nRIGHT GLUTE: extra squeeze each rep.\n\nSTARTING WEIGHT: 17kg, progress every week.\n\nTHIS IS YOUR HEAVIEST HIP THRUST SESSION, go heavier than Thursday.",
        warmup:{ note:"Bodyweight glute bridge x 15, then build-up set at 50%", defaultKg:0, defaultReps:15 },
        sets:[{range:"8-12",defaultKg:17},{range:"8-12",defaultKg:17},{range:"8-12",defaultKg:17}] },
      { id:"bss_sat", name:"Bulgarian Split Squat (glute focused)", type:"compound",
        videoUrl:"https://www.youtube.com/results?search_query=glute+focused+bulgarian+split+squat+form",
        note:"SETUP: rear foot ELEVATED to hip height on bench. Front foot FURTHER FORWARD than normal so shin stays vertical. DBs at sides.\n\nMOVEMENT: lean torso FORWARD 30-40 degrees (hinge at hips). Lower straight down. STOP 3-4cm before back knee touches floor. Push through FRONT HEEL.\n\nFEEL IT IN GLUTE of front leg, not quad.\n\nSTARTING WEIGHT: 6kg DBs.\n\nCOMMON MISTAKE: knee caving inward, drop weight immediately if this happens.",
        warmup:{ note:"Bodyweight x 6 each side, track the knee", defaultKg:0, defaultReps:6 },
        sets:[{range:"8-10",defaultKg:6},{range:"8-10",defaultKg:6},{range:"8-10",defaultKg:6}] },
      { id:"pull_through_sat", name:"Cable Pull-through", type:"compound",
        videoUrl:"https://www.youtube.com/results?search_query=cable+pull+through+form+jeff+nippard",
        note:"SETUP: face AWAY from low cable. Rope attachment between legs, hold rope between thighs. Wide stance, soft knees.\n\nMOVEMENT: hinge hips BACK, let rope travel down between legs. Drive hips FORWARD using glutes to return. Squeeze at top.\n\nLOWER BACK STAYS NEUTRAL throughout, never overextend.\n\nSTARTING WEIGHT: 10-12kg.\n\nFEEL: glutes and hamstrings. This replaces back extensions, zero lower back strain.",
        warmup:{ note:"Light x 10 reps, feel the hinge", defaultKg:null, defaultReps:10 },
        sets:[{range:"10-12",defaultKg:12},{range:"10-12",defaultKg:12},{range:"10-12",defaultKg:12}] },
      { id:"cable_abd_sat", name:"Cable Hip Abduction", type:"isolation",
        videoUrl:"https://www.youtube.com/results?search_query=cable+hip+abduction+form",
        note:"SETUP: cable at ankle, stand side-on to machine. Hold machine lightly for balance only, do NOT lean.\n\nMOVEMENT: leg moves directly out to side, pelvis stays level. 3 second return.\n\nCOMMON MISTAKE: leaning away from cable removes glute med entirely.\n\nSTARTING WEIGHT: 5kg.\n\nFEEL: outside of hip burning (glute med).",
        warmup:{ note:"Light x 12 reps each side", defaultKg:null, defaultReps:12 },
        sets:[{range:"12-15",defaultKg:5},{range:"12-15",defaultKg:5},{range:"12-15",defaultKg:5}] },
    ],
  },
  {
    id:"sun", day:"Sunday", label:"Upper B: Back + Triceps + Biceps", accent:"#1565c0",
    warmupNote:"WARMUP (3 min):\n• Wall pushups hands at hip height 2x10 (protract at top)\n• Band pull-aparts 2x15\n• W raise prone on floor 2x10 (lower trap and rotator cuff)",
    exercises:[
      { id:"lat_pull_sun", name:"Narrow Neutral Grip Lat Pulldown", type:"compound",
        videoUrl:"https://www.youtube.com/results?search_query=neutral+grip+lat+pulldown+form+jeff+nippard",
        note:"SETUP: close-grip neutral attachment. Thighs under pads.\n\nBEFORE YOU PULL: depress shoulder blades, tuck them into back pockets.\n\nMOVEMENT: pull to upper chest, 10 degree lean back. 4 second return.\n\nSTARTING WEIGHT: 24kg (heavier target than Wednesday).\n\nPUSH 1-2 reps harder each set, this is your heavier pulldown day.",
        warmup:{ note:"50% weight x 12 reps", defaultKg:null, defaultReps:12 },
        sets:[{range:"8-12",defaultKg:24},{range:"8-12",defaultKg:24},{range:"8-12",defaultKg:24}] },
      { id:"single_row_sun", name:"Single-Arm Cable Row", type:"compound",
        videoUrl:"https://www.youtube.com/results?search_query=single+arm+cable+row+form",
        note:"SETUP: same-side knee AND hand on flat bench. Back completely flat, parallel to floor.\n\nMOVEMENT: pull handle toward lower hip. Trunk must NOT rotate. 4 second return.\n\nRIGHT SIDE: extra attention every set (scapular winging correction).\n\nSTARTING WEIGHT: 10kg.\n\nFEEL: mid-back contracting, never bicep.",
        warmup:{ note:"Light x 10 reps each side", defaultKg:null, defaultReps:10 },
        sets:[{range:"8-12",defaultKg:10},{range:"8-12",defaultKg:10},{range:"8-12",defaultKg:10}] },
      { id:"face_pull_sun", name:"Face Pulls Seated", type:"isolation",
        videoUrl:"https://www.youtube.com/results?search_query=face+pulls+seated+form+jeff+nippard",
        note:"SETUP: seated, rope at eye height.\n\nMOVEMENT: pull to forehead, elbows HIGH and wide above shoulder height. Rotate hands outward at end, thumbs point behind you.\n\nWEIGHT: always light, joint health not strength.\n\nSTARTING WEIGHT: 10kg.\n\nFEEL: rear delt and rotator cuff.",
        warmup:{ note:"Very light x 15 reps", defaultKg:null, defaultReps:15 },
        sets:[{range:"12-15",defaultKg:10},{range:"12-15",defaultKg:10},{range:"12-15",defaultKg:10}] },
      { id:"tricep_push_sun", name:"Tricep Pushdown (straight bar)", type:"isolation",
        videoUrl:"https://www.youtube.com/results?search_query=tricep+pushdown+form+jeff+nippard",
        note:"SETUP: straight bar at high cable. Overhand grip shoulder-width.\n\nMOVEMENT: elbows pinned completely at sides, they must not move. Push bar straight down. STOP 5 degrees before lockout (elbow hypermobility). 3 second return.\n\nSTARTING WEIGHT: 10kg.\n\nFEEL: back of upper arm only.",
        warmup:{ note:"Light x 12 reps", defaultKg:null, defaultReps:12 },
        sets:[{range:"10-12",defaultKg:10},{range:"10-12",defaultKg:10},{range:"10-12",defaultKg:10}] },
      { id:"hammer_curl_sun", name:"Hammer Curl DB", type:"isolation",
        videoUrl:"https://www.youtube.com/results?search_query=hammer+curl+form+jeff+nippard",
        note:"SETUP: standing, DBs at sides, neutral grip (thumbs up, palms face each other).\n\nMOVEMENT: curl up keeping neutral grip, elbows pinned at sides. Pause 1s at top. 3 second return. STOP 10 to 15 degrees before full extension at bottom (elbow hypermobility).\n\nSTARTING WEIGHT: start light, build up.\n\nFEEL: brachialis and brachioradialis (adds arm thickness).",
        warmup:{ note:"Light x 10 reps", defaultKg:null, defaultReps:10 },
        sets:[{range:"10-12",defaultKg:5},{range:"10-12",defaultKg:5},{range:"10-12",defaultKg:5}] },
    ],
  },
];


const HOME_SESSIONS = [
    {
    id:"mon", day:"Monday", label:"Active Rest — Walk", accent:"#6b7280", type:"active_rest",
    canRun: false,
    walkNote:"40+ min easy walk. Recovery day after Saturday and Sunday. Keep it gentle — HR 100-120. No running today.",
    clamshellNote:"🏠 Home add-on: Banded clamshells — 2×15 each direction. Side-lying, band just above knees, feet together. Open top knee without rolling hips back. Feel glute med. IT band + glute med frequency — do these before or after your walk.",
    coreOptions:[
      { id:"ab_dead_bug", name:"Dead Bug", reps:"3x8 each side", note:"Back flat. Arms reach back as legs alternate." },
      { id:"ab_bird_dog", name:"Bird Dog", reps:"3x8 each side", note:"Opposite arm and leg. 3s hold. No hip rotation." },
      { id:"ab_side_plank", name:"Side Plank", reps:"3x20s each side", note:"Elbow under shoulder. Hips stacked." },
      { id:"ab_reverse_crunch", name:"Reverse Crunch", reps:"3x12", note:"Curl hips toward chest. Slow lower." },
      { id:"ab_tabletop_tap", name:"Tabletop Toe Tap", reps:"3x10 each side", note:"Both legs at 90 degrees. Lower one heel to tap floor." },
      { id:"ab_rkc", name:"RKC Plank", reps:"3x20s", note:"Squeeze glutes + quads + abs. Elbows toward toes." },
    ],
  },
  {
    id:"fri", day:"Friday", label:"Active Rest — Walk Only", accent:"#6b7280", type:"active_rest",
    canRun: false,
    coreOptions:[
      { id:"ab_dead_bug", name:"Dead Bug", reps:"3×8 each side", note:"Back flat into floor. Arms reach back as legs alternate. Breathe out on extension." },
      { id:"ab_bird_dog", name:"Bird Dog", reps:"3×8 each side", note:"Opposite arm and leg. 3s hold. No hip rotation. Back flat." },
      { id:"ab_side_plank", name:"Side Plank", reps:"3×20s each side", note:"Elbow under shoulder. Hips stacked. Don't sag." },
      { id:"ab_reverse_crunch", name:"Reverse Crunch", reps:"3×12", note:"Curl hips up toward chest. Slow lower. Hip flexion not spinal flexion." },
      { id:"ab_tabletop_tap", name:"Tabletop Toe Tap", reps:"3×10 each side", note:"Both legs at 90°. Lower one heel slowly to tap floor. Back stays flat. Alternate sides." },
      { id:"ab_rkc", name:"RKC Plank", reps:"3×20s", note:"Squeeze glutes + quads + abs simultaneously. Elbows pull toward toes. Not passive." },
    ],
    walkNote:"40+ min easy walk. Walk only today — protects Saturday legs. HR 100–120. No running.",
    runProtocol: null,
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
async function saveSetLog(sessionId, exerciseId, setType, setIndex, kg, reps) {
  const today = (()=>{ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();
  try { await supabase.from('workout_logs').upsert(
    { session_id: sessionId, session_date: today, exercise_id: exerciseId, set_type: setType, set_index: setIndex, kg, reps },
    { onConflict: 'session_id,session_date,exercise_id,set_type,set_index' }
  ); } catch {}
}

async function loadSessionDraft(sessionId) {
  const today = (()=>{ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();
  try {
    const { data } = await supabase.from('workout_logs')
      .select('*')
      .eq('session_id', sessionId)
      .eq('session_date', today);
    return data || [];
  } catch { return []; }
}

async function loadProgramStartDate() {
  // Try localStorage first — fastest and works offline
  let local = null;
  try { local = localStorage.getItem('program_start_date') || null; } catch {}
  if (local) return local;
  // Fallback to Supabase (use maybeSingle so 0 rows returns null, not an error)
  try {
    const { data } = await supabase.from('app_settings').select('value').eq('key','program_start_date').maybeSingle();
    if (data?.value) {
      try { localStorage.setItem('program_start_date', data.value); } catch {}
      return data.value;
    }
  } catch {}
  return null;
}
async function saveProgramStartDate(dateStr) {
  // Always write to localStorage first so it survives Supabase failures
  try { localStorage.setItem('program_start_date', dateStr); } catch {}
  try {
    await supabase.from('app_settings').upsert({ key:'program_start_date', value:dateStr }, { onConflict:'key' });
  } catch {}
}
async function loadWeekOverride() {
  try {
    const { data } = await supabase.from('app_settings').select('value').eq('key','week_override').single();
    return data ? JSON.parse(data.value) : null; // {week: N, setAt: dateStr}
  } catch { return null; }
}
async function saveWeekOverride(week) {
  const payload = JSON.stringify({ week, setAt: (()=>{ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })() });
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

async function saveExerciseNote(exerciseId, noteText) {
  try { await supabase.from('exercise_notes').upsert(
    { exercise_id: exerciseId, note_text: noteText },
    { onConflict: 'exercise_id' }
  ); } catch {}
}

async function persistSession(sessionId, data) {
  const today = (()=>{ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();
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
  const [val, setVal] = useState(""); // always starts empty — clear on tap behaviour
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
        {sublabel&&<div style={{textAlign:"center",color:"#e91e8c",fontSize:11,marginBottom:2,fontWeight:600}}>{sublabel}</div>}
        {initial!=null&&<div style={{textAlign:"center",color:"#3a3a5a",fontSize:11,marginBottom:6}}>previously: {initial}</div>}
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
      <div style={{fontSize:11,color:"#2a2a4a",marginBottom:8,fontStyle:"italic"}}>First exercise is compulsory · second is optional if you have time</div>

      {/* Planned exercises */}
      {plannedExercises.map((ex,i) => (
        <div key={ex.id}>
          {i===0&&<div style={{fontSize:9,color:accent,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>Compulsory</div>}
          {i===1&&<div style={{fontSize:9,color:"#3a3a5a",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>Optional — if time</div>}
          {renderExercise(ex)}
        </div>
      ))}

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


// ── Ab Circuit Block (Thursday dedicated circuit) ─────────────────────────────
function AbCircuitBlock({ circuit, done, setDone, accent, abLogs, setAbLogs, onAbModal }) {
  const [expanded, setExpanded] = useState(null);
  const allDone = circuit.every(ex => done[ex.id]);

  return (
    <div style={{background:"#10102a",borderRadius:20,padding:"15px 14px",marginBottom:12,border:`1px solid ${allDone?accent+"40":"#1e1e38"}`}}>
      <div style={{fontSize:10,color:accent,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:4}}>Ab Circuit — complete all 4</div>
      <div style={{fontSize:11,color:"#2a2a4a",marginBottom:10,fontStyle:"italic"}}>Anti-extension · anti-rotation · lateral stability · full anterior chain</div>
      {circuit.map((ex)=>{
        const isDone = done[ex.id];
        const log = abLogs[ex.id] || { kg:null, reps:null };
        const isOpen = expanded === ex.id;
        return (
          <div key={ex.id} style={{marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",
              background:isDone?(accent+"18"):"#080814",borderRadius:12,
              border:`1px solid ${isDone?accent+"50":"#1e1e38"}`,cursor:"pointer"}}
              onClick={()=>setDone(p=>({...p,[ex.id]:!p[ex.id]}))}>
              <div style={{width:20,height:20,borderRadius:6,background:isDone?accent:"#1a1a30",
                border:`1.5px solid ${isDone?accent:"#2a2a4a"}`,display:"flex",alignItems:"center",
                justifyContent:"center",flexShrink:0}}>
                {isDone&&<ITick s={11}/>}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:isDone?accent:"#ccc"}}>{ex.name}</div>
                <div style={{fontSize:11,color:"#2a2a4a",marginTop:1}}>{ex.sets} sets · {ex.reps}</div>
              </div>
              <button onClick={e=>{e.stopPropagation();setExpanded(isOpen?null:ex.id);}} style={{background:"#1a1a30",border:"none",borderRadius:8,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",color:isOpen?accent:"#3a3a5a",cursor:"pointer"}}>
                <IInfo/>
              </button>
            </div>
            {isOpen&&<div style={{background:"#080814",borderRadius:"0 0 10px 10px",padding:"8px 12px",fontSize:11,color:"#666",lineHeight:1.6,borderLeft:`3px solid ${accent}`,marginTop:-4}}>{ex.note}</div>}
            {isDone&&ex.defaultKg!=null&&(
              <div style={{background:"#080814",borderRadius:"0 0 12px 12px",padding:"10px 12px",marginTop:-4,border:`1px solid ${accent}20`,borderTop:"none"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:4}}>
                  <div style={{fontSize:9,color:"#2a2a4a",textAlign:"center"}}>KG</div>
                  <div style={{fontSize:9,color:"#2a2a4a",textAlign:"center"}}>REPS / TIME</div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {["kg","reps"].map(field=>(
                    <button key={field} onClick={()=>onAbModal({exId:ex.id,field})} style={{background:"#10102a",border:`1px solid ${log[field]!=null?"#252540":"#1e1e38"}`,borderRadius:10,height:44,color:log[field]!=null?"#fff":"#2a2a4a",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                      {log[field]!=null?`${log[field]}`:"—"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
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

  // Travel week: normal Mon–Thu, then Sat+Sun sessions moved to Fri+Sat, Sunday away
  const travelSessionIds = ["mon","tue","wed","thu","sat","sun"];
  const travelSchedule = [
    { ...HOME_SESSIONS.find(s=>s.id==="mon"), travelDay:"Monday — Active Rest (walk)" },
    { ...GYM_SESSIONS.find(s=>s.id==="tue"), travelDay:"Tuesday — Lower A" },
    { ...GYM_SESSIONS.find(s=>s.id==="wed"), travelDay:"Wednesday — Upper A" },
    { ...GYM_SESSIONS.find(s=>s.id==="thu"), travelDay:"Thursday — Full Body + Abs" },
    { ...GYM_SESSIONS.find(s=>s.id==="sat"), travelDay:"Friday — Lower B (moved from Sat)" },
    { ...GYM_SESSIONS.find(s=>s.id==="sun"), travelDay:"Saturday — Upper B (moved from Sun)" },
    { id:"weekend_away", day:"Sunday", label:"Away — rest and recover 🌍", accent:"#6b7280", type:"travel_rest", travelDay:"Sunday away" },
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
              {travelWeek?"Sat + Sun sessions moved to Fri + Sat":"Tap to shift weekend sessions to weekdays"}
            </div>
          </div>
          <div style={{width:44,height:26,borderRadius:13,background:travelWeek?"#f59e0b":"#1e1e38",position:"relative",transition:"background 0.2s",flexShrink:0}}>
            <div style={{position:"absolute",top:3,left:travelWeek?21:3,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
          </div>
        </div>
        {travelWeek&&(
          <div style={{marginTop:12,background:"#0a0a00",borderRadius:12,padding:"10px 12px",border:"1px solid #f59e0b30"}}>
            <div style={{fontSize:10,color:"#f59e0b",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>This week's schedule</div>
            {[["Mon","Active Rest (walk)"],["Tue","Lower A — Posterior Chain"],["Wed","Upper A — Back & Biceps"],["Thu","Hot Yoga + Light Gym"],["Fri","Lower B (moved from Sat)"],["Sat","Upper B (moved from Sun)"],["Sun","Away — rest and recover 🌍"]].map(([day,sess])=>(
              <div key={day} style={{display:"flex",gap:12,marginBottom:5,alignItems:"center"}}>
                <div style={{fontSize:10,color:"#f59e0b",fontWeight:700,width:32,flexShrink:0}}>{day}</div>
                <div style={{fontSize:11,color:"#888"}}>{sess}</div>
              </div>
            ))}
            <div style={{fontSize:10,color:"#3a3a5a",marginTop:8,fontStyle:"italic"}}>Lower A Tue → Lower B Fri = 72h. Full Body Wed → Upper B Thu = 24h (upper only, fine). Good recovery across the week.</div>
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


// ── Legacy exercise ID fallback map ──────────────────────────────────────────
// When an exercise ID has no previous data, check these legacy IDs from older program versions
const LEGACY_ID_MAP = {
  "kickstand_rdl_tue":   ["rdl_tue"],
  "leg_press_tue":       ["heel_split_tue"],
  "lying_ham_curl_sat":  ["ham_curl_sat"],
  "hip_abd_tue":       ["hip_abd_tue"],
  "lat_pull_mon":      ["lat_pull_wed","lat_pull_sun"],
  "single_row_mon":    ["single_row_wed","chest_row_wed"],
  "face_pull_mon":     ["face_pull_sun"],
  "cable_curl_mon":    ["cable_curl_mon"],
  "hip_thrust_thu":    ["hip_thrust_sat","hip_thrust_tue"],
  "step_up_thu":       ["kickback_sat"],
  "cable_row_thu":     ["cable_row_sun"],
  "tricep_ext_thu":    ["rope_push_wed"],
  "lat_raise_thu":     ["lateral_raise_mon"],
  "goblet_sat":        ["goblet_sat"],
  "bulgarian_sat":     ["bulgarian_sat"],
  "adductor_sat":      ["adductor_sat"],
  "hip_abd_sat":       ["hip_abd_sat"],
  "lat_pull_sun":      ["lat_pull_wed"],
  "lat_raise_sun":     ["lateral_raise_mon"],
  "rear_delt_sun":     ["rear_delt_mon"],
  "tricep_push_sun":   ["rope_push_wed","tricep_push_sun"],
  "hammer_curl_sun":   ["hammer_curl_wed"],
  "ytw_sun":           ["ytw_sun"],
};

function getPrevLogs(history, sessionId, exerciseId) {
  const direct = history[sessionId]?.logs?.[exerciseId];
  if (direct) return direct;
  // Check legacy IDs across all sessions
  const fallbacks = LEGACY_ID_MAP[exerciseId] || [];
  for (const legacyId of fallbacks) {
    for (const sid of Object.keys(history)) {
      const found = history[sid]?.logs?.[legacyId];
      if (found) return found;
    }
  }
  return null;
}

// ── Progressive overload suggestion ──────────────────────────────────────────
function getOverloadSuggestion(ex, prevLogs) {
  if (!prevLogs) return null;
  const sets = prevLogs.sets;
  if (!sets || sets.length === 0) return null;

  const range = ex.sets[0]?.range || "8-12";
  const [lo, hi] = range.split("–").map(Number);
  if (!lo || !hi) return null;

  const allDone = sets.every(s => s.reps != null);
  if (!allDone) return null;

  // Use last set (heaviest, ascending pyramid) as the progression trigger
  const lastSet = sets[sets.length - 1];
  const lastHitTop = lastSet?.reps >= hi;
  const lastBelowBottom = lastSet?.reps < lo;
  const lastKg = lastSet?.kg;
  const increment = ex.type === "compound" ? 2.5 : 1;

  if (lastBelowBottom) {
    const suggested = lastKg ? Math.round((lastKg * 0.9) * 2) / 2 : null;
    return {
      type: "drop",
      text: `Last: ${sets.map(s=>`${s.kg??'—'}kg×${s.reps??'—'}`).join(", ")}`,
      suggestion: suggested ? `Drop to ${suggested}kg — last set below target range` : "Drop weight — check form",
      color: "#ef4444"
    };
  }
  if (lastHitTop) {
    const suggested = lastKg ? lastKg + increment : null;
    return {
      type: "increase",
      text: `Last: ${sets.map(s=>`${s.kg??'—'}kg×${s.reps??'—'}`).join(", ")}`,
      suggestion: suggested ? `Try ${suggested}kg today — your heaviest set hit ${hi} reps last session` : "Increase weight today",
      color: "#10b981"
    };
  }
  return {
    type: "same",
    text: `Last: ${sets.map(s=>`${s.kg??'—'}kg×${s.reps??'—'}`).join(", ")}`,
    suggestion: `Same weight — aim for more reps on your heaviest set`,
    color: "#f59e0b"
  };
}

function GymSession({ session, history, onSave, onBack, exerciseNotes={}, onNoteSave, currentWeek=1 }) {
  const [draftLoaded, setDraftLoaded] = useState(false);
  const prev = history[session.id]||{};
  // Week A = odd weeks, Week B = even weeks. Resolve alt exercises for Week B.
  const isWeekB = currentWeek % 2 === 0;
  const resolvedExercises = session.exercises.map(ex => {
    if (isWeekB && ex.altId) {
      return { ...ex, id: ex.altId, name: ex.altName, note: ex.altNote, _weekLabel:"B" };
    }
    return ex.altId ? { ...ex, _weekLabel:"A" } : ex;
  });
  // Ab circuit rotation: 3 circuits, each lasts 2 weeks. Weeks 1-2 = circuit 0, 3-4 = circuit 1, 5-6 = circuit 2, then repeats.
  const abCircuitIndex = Math.floor((currentWeek - 1) / 2) % 3;
  const effectiveAbCircuit = session.abCircuitRotation
    ? session.abCircuitRotation[abCircuitIndex]
    : (session.abCircuit || null);
  const abCircuitWeekLabel = session.abCircuitRotation ? `Weeks ${abCircuitIndex*2+1}-${abCircuitIndex*2+2}` : null;
  const initDP = ()=>{ const d={}; DAILY_PHYSIO.forEach(e=>{d[e.id]=false;}); return d; };
  const initAbs = ()=>{ const d={}; [...AB_OPTIONS.floor,...AB_OPTIONS.standing].forEach(e=>{d[e.id]=false;}); if(effectiveAbCircuit) effectiveAbCircuit.forEach(e=>{d[e.id]=false;}); return d; };
  const initLogs = (draft=[])=>{
    const logs={};
    resolvedExercises.forEach(ex=>{
      const p=getPrevLogs(history, session.id, ex.id);
      logs[ex.id]={
        warmup:ex.warmup ? { kg:p?.warmup?.kg??ex.warmup.defaultKg, reps:p?.warmup?.reps??ex.warmup.defaultReps, done:false } : { kg:null, reps:null, done:false },
        sets:ex.sets.map((setDef,si)=>{
          const draftSet = draft.find(d=>d.exercise_id===ex.id && d.set_type==='working' && d.set_index===si);
          return { kg:draftSet?.kg??p?.sets?.[si]?.kg??setDef.defaultKg??null, reps:draftSet?.reps??p?.sets?.[si]?.reps??null, done:!!draftSet };
        }),
      };
    });
    return logs;
  };

  const [dpDone,setDpDone]=useState(initDP);
  const [abDone,setAbDone]=useState(initAbs);
  const [logs,setLogs]=useState(initLogs);
  const [modal,setModal]=useState(null);
  const [editingNote,setEditingNote]=useState(null);
  const [abLogs,setAbLogs]=useState(()=>{
    const d={};
    [...AB_OPTIONS.floor,...AB_OPTIONS.standing].forEach(e=>{d[e.id]={kg:e.defaultKg??null,reps:null,sets:null};});
    // Also initialise ab circuit exercises (Thursday rotation)
    if(effectiveAbCircuit) effectiveAbCircuit.forEach(e=>{d[e.id]={kg:e.defaultKg??null,reps:null,sets:null};});
    return d;
  });
  const [abNotes,setAbNotes]=useState({});
  const [abModal,setAbModal]=useState(null);
  const [finisherLogs,setFinisherLogs]=useState(()=>{
    const prevF = prev?.finisher;
    if (prevF && prevF.sets && prevF.sets.length) {
      return { sets: prevF.sets.map(s=>({ kg:s.kg, reps:s.reps, done:false })) };
    }
    return { sets: [{kg:11,reps:null,done:false},{kg:11,reps:null,done:false}] };
  });
  const [finisherModal,setFinisherModal]=useState(null);
  const [expanded,setExpanded]=useState(null);
  const [phase,setPhase]=useState("main");

  // Load today's draft on mount for resume
  useEffect(()=>{
    if(draftLoaded) return;
    loadSessionDraft(session.id).then(draft=>{
      if(draft.length>0){
        setLogs(initLogs(draft));
        // Restore ab weights from draft
        const abRows = draft.filter(r=>r.set_type==='ab');
        if(abRows.length>0){
          setAbLogs(p=>{ const d={...p}; abRows.forEach(r=>{ if(d[r.exercise_id]) d[r.exercise_id]={...d[r.exercise_id],kg:r.kg,reps:r.reps}; }); return d; });
        }
      }
      setDraftLoaded(true);
    });
  },[]);

  const allDPDone=Object.values(dpDone).every(Boolean);
  const totalSets=resolvedExercises.reduce((a,e)=>a+e.sets.length,0);
  const doneSets=Object.values(logs).reduce((a,ex)=>a+ex.sets.filter(s=>s.done).length,0);
  const allMainDone=doneSets===totalSets;
  const suggestedAbsDone=(session.abPair||[]).every(id=>abDone[id]);
  const canFinish=true;

  const handleSave=useCallback(val=>{
    if(!modal) return;
    const{exId,setType,si,field}=modal;
    setLogs(p=>{
      const ex={...p[exId]};
      if(setType==="warmup"){ex.warmup={...ex.warmup,[field]:val};}
      else{
        ex.sets=ex.sets.map((s,i)=>{
          if(i!==si) return s;
          const updated={...s,[field]:val};
          // Auto-save if set is already ticked
          if(updated.done) saveSetLog(session.id, exId, 'working', si, updated.kg, updated.reps);
          return updated;
        });
      }
      return{...p,[exId]:ex};
    });
  },[modal]);

  const toggleDone=(exId,si)=>setLogs(p=>{
    const updated={...p,[exId]:{...p[exId],sets:p[exId].sets.map((s,i)=>{
      if(i!==si) return s;
      const newDone=!s.done;
      // Auto-save immediately when ticked
      if(newDone) saveSetLog(session.id, exId, 'working', si, s.kg, s.reps);
      return {...s,done:newDone};
    })}};
    return updated;
  });
  const toggleWarmup=exId=>setLogs(p=>({...p,[exId]:{...p[exId],warmup:{...p[exId].warmup,done:!p[exId].warmup.done}}}));
  const markAll=exId=>setLogs(p=>({...p,[exId]:{...p[exId],sets:p[exId].sets.map(s=>({...s,done:true}))}}));

  const finish=()=>{
    const result={date:new Date().toISOString(),logs:{}};
    resolvedExercises.forEach(ex=>{
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
        {resolvedExercises.map(ex=>(
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

        {session.warmupNote&&(
          <div style={{background:"#0a1a0a",borderRadius:16,padding:"14px 16px",marginBottom:12,border:"1px solid #10b98140"}}>
            <div style={{fontSize:10,color:"#10b981",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:6}}>⚡ Before you start</div>
            <div style={{fontSize:12,color:"#999",lineHeight:1.7,whiteSpace:"pre-line"}}>{session.warmupNote}</div>
          </div>
        )}

        {resolvedExercises.map(ex=>{
          const exLog=logs[ex.id];
          const allDone=exLog.sets.every(s=>s.done);
          const isOpen=expanded===ex.id;
          const isCompound=ex.type==="compound";
          const overload = getOverloadSuggestion(ex, getPrevLogs(history, session.id, ex.id));
          return (
            <div key={ex.id} style={{background:"#10102a",borderRadius:20,padding:"15px 13px",marginBottom:12,border:`1px solid ${allDone?session.accent+"60":"#1e1e38"}`,transition:"border-color 0.3s"}}>
              {ex._weekLabel&&(
                <div style={{fontSize:9,color:ex._weekLabel==="B"?"#f59e0b":session.accent,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8,background:ex._weekLabel==="B"?"#f59e0b18":session.accent+"18",borderRadius:6,padding:"3px 8px",display:"inline-block"}}>
                  Week {ex._weekLabel} variation
                </div>
              )}
              {overload&&(
                <div style={{background:overload.color+"15",borderRadius:10,padding:"8px 12px",marginBottom:10,border:`1px solid ${overload.color}35`}}>
                  <div style={{fontSize:10,color:overload.color,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:2}}>
                    {overload.type==="increase"?"📈 Increase weight":overload.type==="drop"?"⬇️ Drop weight":"💪 Keep going"}
                  </div>
                  <div style={{fontSize:11,color:"#666",marginBottom:2}}>{overload.text}</div>
                  <div style={{fontSize:12,color:overload.color,fontWeight:600}}>{overload.suggestion}</div>
                </div>
              )}
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

              {isOpen&&(
                <div style={{background:"#080814",borderRadius:10,padding:"10px 12px",marginBottom:12,fontSize:12,color:"#999",lineHeight:1.7,borderLeft:`3px solid ${session.accent}`,whiteSpace:"pre-line"}}>
                  {ex.note}
                  {ex.videoUrl&&(
                    <div style={{marginTop:10}}>
                      <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer" style={{color:session.accent,fontSize:12,fontWeight:700,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:5}}>
                        ▶ Watch form video
                      </a>
                    </div>
                  )}
                </div>
              )}

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

        {session.cooldownNote&&(
          <div style={{background:"#1a0a1a",borderRadius:16,padding:"14px 16px",marginBottom:12,border:"1px solid #a855f740"}}>
            <div style={{fontSize:10,color:"#a855f7",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:6}}>🧘 Cooldown</div>
            <div style={{fontSize:12,color:"#999",lineHeight:1.7,whiteSpace:"pre-line"}}>{session.cooldownNote}</div>
          </div>
        )}

        {effectiveAbCircuit
          ? (
            <div>
              {abCircuitWeekLabel&&(
                <div style={{fontSize:10,color:session.accent,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8,padding:"6px 12px",background:session.accent+"18",borderRadius:8,display:"inline-block"}}>
                  Ab circuit: {abCircuitWeekLabel}
                </div>
              )}
              <AbCircuitBlock circuit={effectiveAbCircuit} done={abDone} setDone={setAbDone} accent={session.accent} abLogs={abLogs} setAbLogs={setAbLogs} onAbModal={(m)=>setAbModal(m)}/>
            </div>
          )
          : session.abPair ? <AbBlock done={abDone} setDone={setAbDone} accent={session.accent} abLogs={abLogs} setAbLogs={setAbLogs} abNotes={abNotes} onAbNoteSave={async(exId,note)=>{ setAbNotes(p=>({...p,[exId]:note})); await saveExerciseNote("ab_"+exId, note); }} onAbModal={(m)=>setAbModal(m)} abPair={session.abPair||[]}/>
          : null
        }

        {canFinish
          ?<button onClick={finish} style={{width:"100%",background:"linear-gradient(135deg,#e91e8c,#9c27b0)",border:"none",borderRadius:18,height:66,color:"#fff",fontSize:18,fontWeight:900,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 8px 40px rgba(233,30,140,0.5)"}}>Complete Session 🎉</button>
          :<div style={{textAlign:"center",fontSize:12,color:"#1e1e38",padding:"10px 0"}}>{`${totalSets-doneSets} working sets left`}</div>
        }
      </div>

      {abModal&&<Numpad
        label={abModal.field==="kg"?"Weight (kg)":"Reps / Time"}
        sublabel={null}
        initial={abLogs[abModal.exId]?.[abModal.field]}
        onSave={val=>{ setAbLogs(p=>{ const updated={...p,[abModal.exId]:{...p[abModal.exId],[abModal.field]:val}}; if(abModal.field==="kg") saveSetLog(session.id, abModal.exId, 'ab', 0, val, updated[abModal.exId].reps); return updated; }); }}
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
  const [walkCoreDone, setWalkCoreDone] = useState({});
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

        {/* Banded clamshells note — Monday only */}
        {session.clamshellNote && (
          <div style={{background:"#10102a",borderRadius:20,padding:"16px 16px",marginBottom:12,border:"1px solid #0891b230"}}>
            <div style={{fontSize:10,color:"#0891b2",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>Home Add-on · Glute Med</div>
            <div style={{fontSize:15,fontWeight:800,color:"#fff",marginBottom:4}}>Banded Clamshells</div>
            <div style={{fontSize:12,color:"#3a3a5a",lineHeight:1.6}}>{session.clamshellNote}</div>
          </div>
        )}

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

        {session.coreOptions&&(
          <div style={{background:"#10102a",borderRadius:20,padding:"16px 16px",marginBottom:12,border:"1px solid #1e1e38"}}>
            <div style={{fontSize:10,color:session.accent,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>Core — pick any, all bodyweight</div>
            <div style={{fontSize:11,color:"#2a2a4a",marginBottom:12,fontStyle:"italic"}}>No equipment needed · do as many as you like · tap to tick off</div>
            {session.coreOptions.map(ex=>{
              const done = walkCoreDone[ex.id]||false;
              return (
                <div key={ex.id} onClick={()=>setWalkCoreDone(p=>({...p,[ex.id]:!p[ex.id]}))} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:done?session.accent+"18":"#080814",borderRadius:12,border:`1px solid ${done?session.accent+"50":"#1e1e38"}`,marginBottom:8,cursor:"pointer",transition:"all 0.2s"}}>
                  <div style={{width:20,height:20,borderRadius:6,background:done?session.accent:"#1a1a30",border:`1.5px solid ${done?session.accent:"#2a2a4a"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {done&&<ITick s={11}/>}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:done?session.accent:"#ccc"}}>{ex.name}</div>
                    <div style={{fontSize:11,color:"#2a2a4a",marginTop:1}}>{ex.reps}</div>
                  </div>
                </div>
              );
            })}
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


// ── Start Date Prompt ─────────────────────────────────────────────────────────
function StartDatePrompt({ onConfirm }) {
  const today = (()=>{ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();
  const [selectedDate, setSelectedDate] = useState(today);
  return (
    <div style={{minHeight:"100vh",background:"#080814",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{fontSize:50,marginBottom:16}}>📅</div>
      <h2 style={{color:"#fff",fontSize:22,fontWeight:900,textAlign:"center",margin:"0 0 8px"}}>When did Week 1 start?</h2>
      <p style={{color:"#555",fontSize:13,textAlign:"center",margin:"0 0 28px",maxWidth:280,lineHeight:1.5}}>This sets your program clock. The app calculates your current week automatically from here — you will never need to update it manually.</p>
      <input
        type="date"
        value={selectedDate}
        onChange={e=>setSelectedDate(e.target.value)}
        style={{background:"#10102a",border:"1px solid #2a2a4a",borderRadius:12,padding:"14px 16px",color:"#fff",fontSize:16,fontFamily:"inherit",marginBottom:20,width:240,textAlign:"center"}}
      />
      <button
        onClick={()=>{ if(selectedDate) onConfirm(selectedDate); }}
        style={{background:"linear-gradient(135deg,#e91e8c,#9c27b0)",border:"none",borderRadius:16,padding:"16px 48px",color:"#fff",fontSize:16,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}
      >
        Start tracking
      </button>
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
    setWeekOverride({week:currentWeek,setAt:(()=>{ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })()});
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
        defaultValue={(()=>{ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })()}
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
    if(gym) return <GymSession session={gym} history={history} exerciseNotes={exerciseNotes} onNoteSave={async(exId,note)=>{ setExerciseNotes(p=>({...p,[exId]:note})); await saveExerciseNote(exId,note); }} onSave={handleSave} onBack={()=>setActive(null)} currentWeek={currentWeek}/>;
    if(home&&home.type==="rest") return <RestDay session={home} history={history} onSave={handleSave} onBack={()=>setActive(null)}/>;
    if(home&&home.type==="home") return <RunSession session={home} history={history} onSave={handleSave} onBack={()=>setActive(null)}/>;
    if(home&&home.type==="active_rest") return <ActiveRestScreen session={home} history={history} onSave={handleSave} onBack={()=>setActive(null)}/>;
  }
  if(physioTab) return <PhysioScreen physioDone={physioDone} onToggle={handlePhysioToggle} onBack={()=>setPhysioTab(false)} currentWeek={currentWeek}/>;
  return <HomeScreen onSelect={setActive} history={history} travelWeek={travelWeek} setTravelWeek={setTravelWeek} currentWeek={currentWeek} onRepeatWeek={handleRepeatWeek} onPhysioTab={()=>setPhysioTab(true)} physioDone={physioDone}/>;
}
