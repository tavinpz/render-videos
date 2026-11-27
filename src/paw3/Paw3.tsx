// Pawslated v3 — mini-história 3D toon (27/11/2026). Mesma cadeia de acabamento do desenho animado (Davi Xavier, MIT):
// contorno -> lente -> [bloom, tone map, cor]. Textos em DOM por cima: legenda 1 palavra, gancho, etiquetas, HUD.
import React, { useEffect, useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, getInputProps, useCurrentFrame, interpolate, Easing } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useFrame, useThree } from "@react-three/fiber";
import { BlendFunction, BloomEffect, EffectComposer, EffectPass, RenderPass, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import "@fontsource/nunito/900.css";
import { InkPass, noInkFallback } from "./ink";
import { LensBlur } from "./lensblur";
import { GradeEffect, GRADES, gradeFor } from "./grade";
import { PawWorld, Tempos } from "./world";
import { GuiltWorld } from "./world2";
import { FireworksWorld } from "./world3";
import { TreeWorld } from "./world4";
import { BathWorld } from "./world5";
const mkWorld = (T: Tempos) => ((T as any).ep === 5 ? new BathWorld(T) : (T as any).ep === 4 ? new TreeWorld(T) : (T as any).ep === 3 ? new FireworksWorld(T) : (T as any).ep === 2 ? new GuiltWorld(T) : new PawWorld(T));

const fwd = new THREE.Vector3();
const makeBloom = () => {
  const b = new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.55, luminanceThreshold: 0.95, luminanceSmoothing: 0.2, mipmapBlur: true, levels: 6, radius: 0.6 });
  const mip = b.mipmapBlurPass; const setSize = mip.setSize.bind(mip);
  mip.setSize = (w: number, h: number) => setSize(Math.round((1920 * w) / Math.max(h, 1)), 1920);
  return b;
};

const Inner: React.FC<{ T: Tempos }> = ({ T }) => {
  const f = useCurrentFrame();
  const { camera, scene } = useThree();
  const world = useMemo(() => mkWorld(T), [T]);
  const fx = useMemo(() => ({
    ink: new InkPass(scene, camera as THREE.PerspectiveCamera),
    lens: new LensBlur({ maxCoC: 22, nearScale: 1.2 }),
    bloom: makeBloom(),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
    grade: new GradeEffect(GRADES.golden, 1),
  }), [camera, scene]);
  useEffect(() => () => fx.ink.dispose(), [fx]);
  const gl = useThree((st) => st.gl);
  useMemo(() => { gl.shadowMap.type = THREE.PCFSoftShadowMap; gl.shadowMap.needsUpdate = true; }, [gl]);
  const size = useThree((st) => st.size);
  const ip = getInputProps() as { nopost?: boolean; ms?: number };
  const composer = useMemo(() => {
    const c = new EffectComposer(gl, { multisampling: ip.ms ?? 0, frameBufferType: THREE.HalfFloatType });
    c.addPass(new RenderPass(scene, camera)); c.addPass(fx.ink);
    c.addPass(new EffectPass(camera, fx.lens.pre)); c.addPass(new EffectPass(camera, fx.lens.main));
    c.addPass(new EffectPass(camera, fx.bloom, fx.tone, fx.grade));
    return c;
  }, [gl, scene, camera, fx]);
  useEffect(() => { composer.setSize(size.width, size.height); }, [composer, size]);
  useEffect(() => () => { composer.removeAllPasses(); }, [composer]);
  useFrame((_, dt) => { if (ip.nopost) gl.render(scene, camera); else composer.render(dt); }, 1);
  const cam = camera as THREE.PerspectiveCamera;
  const s = world.update(f, cam);
  noInkFallback(world.root);
  cam.getWorldDirection(fwd);
  fx.lens.focus = Math.max(0.3, s.focus().sub(cam.position).dot(fwd));
  fx.lens.cInf = s.set === "forest" ? 10 : 9;
  if ((T as any).ep >= 4) { const tag = fx.grade as any; if (!tag._cozy) { fx.grade.set({ ky: [0, 0.085, 0.265, 0.575, 0.83, 0.945, 1], sat: [1.05, 1.22, 1.15], tintS: [0.03, 0.004], tintM: [0.0, 0.006], tintH: [-0.016, 0.012], vig: [0.24, 0.4] }); tag._cozy = 1; } fx.grade.amount = 1; }
  else gradeFor(fx.grade, "golden");
  return <primitive object={world.root} dispose={null} />;
};

const FONT = "Nunito, Arial Rounded MT Bold, sans-serif";
const INK = "#1B1230";
const LIME = "#B6F23C";
const YEL = "#FFD84A";
const outline = (w: number, c = INK) => {
  const s: string[] = [];
  for (let a = 0; a < 16; a++) s.push(`${(Math.cos((a / 16) * Math.PI * 2) * w).toFixed(1)}px ${(Math.sin((a / 16) * Math.PI * 2) * w).toFixed(1)}px 0 ${c}`);
  return s.join(",") + `,0 ${w + 4}px 0 ${c}`;
};
const pop = (t: number, t0: number) => interpolate(t, [t0, t0 + 0.12, t0 + 0.2], [0.6, 1.12, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const Chip: React.FC<{ txt: string; t: number; t0: number; t1: number; y: number; bg?: string; fg?: string; size?: number; rot?: number; x?: number }> = ({ txt, t, t0, t1, y, bg = LIME, fg = INK, size = 52, rot = -3, x = 540 }) => {
  if (t < t0 || t > t1) return null;
  const k = pop(t, t0);
  return <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${k}) rotate(${rot}deg)`, background: bg, color: fg, fontFamily: FONT, fontWeight: 900, fontSize: size,
    padding: "10px 30px 14px", borderRadius: 26, border: `6px solid ${INK}`, boxShadow: `0 8px 0 ${INK}`, whiteSpace: "nowrap", letterSpacing: 1 }}>{txt}</div>;
};

const HI = new Set(["BED", "ACCIDENT", "BEST", "PILE", "ALONE", "DANGER", "PACK", "NOBODY", "TWENTY-THREE", "EIGHT", "SIXTEEN", "FIVE", "ASLEEP", "AWAKE", "CLOSE", "FEELS", "HALLWAY", "UP", "FEET", "DOOR", "CLINGY", "TOGETHER", "SEND"]);

const Overlay: React.FC<{ T: Tempos }> = ({ T }) => {
  const f = useCurrentFrame(); const t = f / 30;
  const fr = (k: string) => T.frases.find((x) => x.k === k)!;
  const wt = (k: string, re: RegExp) => T.palavras.find((w) => w.k === k && re.test(w.w))!.t0;
  const w = T.palavras.find((x) => t >= x.t0 - 0.02 && t < x.t1 + 0.12) ?? null;
  const word = w ? w.w.replace(/[.,?!]/g, "").toUpperCase() : "";
  // contador 1 → 23
  const fw = fr("woke");
  const n = Math.max(1, Math.min(23, Math.round(interpolate(t, [fw.t0 + 0.1, fw.t1 - 0.2], [1, 23], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.quad) }))));
  const hook = fr("hook");
  const cyc = fr("cycle");
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* gancho */}
      {t < hook.t1 + 0.25 && (
        <div style={{ position: "absolute", top: 300, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 104, lineHeight: 1.0, color: "#fff", textShadow: outline(8), transform: `scale(${pop(t, 0)})` }}>
          WHY AT<br /><span style={{ color: YEL }}>YOUR FEET?</span>
        </div>
      )}
      <Chip txt="LONG, LONG AGO" t={t} t0={fr("anc").t0} t1={fr("close").t0} y={360} bg="#E9E2FF" />
      <Chip txt="ALONE = DANGER" t={t} t0={wt("alone", /danger/)} t1={fr("alone").t1 + 0.12} y={360} bg="#FF6B5E" fg="#fff" rot={2} />
      <Chip txt="YOU = HIS PACK" t={t} t0={wt("pack", /pack/)} t1={fr("pack").t1 + 0.1} y={360} />
      {t >= fr("film").t0 && t < fw.t0 && (
        <div style={{ position: "absolute", top: 300, left: 110, right: 110, display: "flex", justifyContent: "space-between", fontFamily: FONT, fontWeight: 900, fontSize: 46, color: "#fff", textShadow: outline(5) }}>
          <span>NIGHT CAM</span><span><span style={{ color: "#FF4545", opacity: Math.floor(t * 2) % 2 ? 1 : 0.25 }}>●</span> REC</span>
        </div>
      )}
      {t >= fr("film").t0 && t < cyc.t1 && (
        <div style={{ position: "absolute", top: 1235, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 28, color: "#fff", opacity: 0.85, textShadow: outline(3) }}>Adams &amp; Johnson, 1993 · 24 dogs</div>
      )}
      {t >= fw.t0 && t < fw.t1 + 0.15 && (
        <div style={{ position: "absolute", top: 290, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, color: "#fff", textShadow: outline(8) }}>
          <div style={{ fontSize: 210, lineHeight: 1, color: YEL, transform: `scale(${1 + 0.08 * Math.max(0, 1 - ((t * 9) % 1))})` }}>{n}×</div>
          <div style={{ fontSize: 54 }}>WAKE-UPS IN 8 HOURS</div>
        </div>
      )}
      <Chip txt="16 MIN ASLEEP" t={t} t0={cyc.t0} t1={cyc.t1 + 0.1} y={340} bg="#9DB4FF" />
      <Chip txt="5 MIN AWAKE" t={t} t0={wt("cycle", /Five/)} t1={cyc.t1 + 0.1} y={460} bg={YEL} rot={3} />
      <Chip txt="AS CLOSE AS ALLOWED" t={t} t0={wt("near", /close/)} t1={fr("near").t1 + 0.1} y={360} />
      <Chip txt="CREAK!" t={t} t0={wt("noise", /hallway/) - 0.15} t1={fr("noise").t1} y={380} bg="#FFFFFF" size={72} rot={-6} x={720} />
      <Chip txt="DOOR ▶" t={t} t0={fr("feet").t0 + 0.2} t1={fr("feet").t1 + 0.1} y={420} bg={YEL} x={700} rot={2} />
      <Chip txt="◀ YOU" t={t} t0={wt("feet", /feel/)} t1={fr("feet").t1 + 0.1} y={540} bg="#9DB4FF" x={330} rot={-2} />
      <Chip txt="SEND THIS TO A DOG PARENT" t={t} t0={fr("cta").t0} t1={T.total + 1} y={360} bg={LIME} size={46} />
      {/* legenda: 1 palavra, centro da área segura */}
      {word && (
        <div style={{ position: "absolute", top: 1090, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 96, color: HI.has(word) ? YEL : "#fff", textShadow: outline(8), transform: `scale(${pop(t, w!.t0)})` }}>{word}</div>
      )}
      <div style={{ position: "absolute", top: 1262, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 26, color: "#fff", opacity: 0.7, textShadow: outline(2) }}>@pawslated</div>
    </AbsoluteFill>
  );
};

const HI2 = new Set(["GUILTY", "GUILT", "SLIPPER", "EARS", "EYES", "TAIL", "2009", "TREAT", "SECRETLY", "DIDN'T", "NOTHING", "WRONG", "SCOLDED", "CONFESSION", "CALM", "FACE", "SCOLDING", "SEND", "EXACTLY"]);
const Overlay2: React.FC<{ T: Tempos }> = ({ T }) => {
  const f = useCurrentFrame(); const t = f / 30;
  const fr = (k: string) => T.frases.find((x) => x.k === k)!;
  const wt = (k: string, re: RegExp) => (T.palavras.find((w) => w.k === k && re.test(w.w)) ?? T.palavras.find((w) => w.k === k)!).t0;
  const w = T.palavras.find((x) => t >= x.t0 - 0.02 && t < x.t1 + 0.12) ?? null;
  const word = w ? w.w.replace(/[.,?!:]/g, "").toUpperCase() : "";
  const hook = fr("hook");
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {t < hook.t1 + 0.25 && (
        <div style={{ position: "absolute", top: 300, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 104, lineHeight: 1.0, color: "#fff", textShadow: outline(8), transform: `scale(${pop(t, 0)})` }}>
          THAT GUILTY<br /><span style={{ color: YEL }}>FACE?</span>
        </div>
      )}
      <Chip txt="EARS BACK" t={t} t0={wt("face", /Ears/)} t1={fr("face").t1 + 0.15} y={340} bg="#9DB4FF" rot={-3} />
      <Chip txt="EYES UP" t={t} t0={wt("face", /Eyes/)} t1={fr("face").t1 + 0.15} y={455} bg={YEL} rot={2} />
      <Chip txt="TAIL LOW" t={t} t0={wt("face", /Tail/)} t1={fr("face").t1 + 0.15} y={570} bg={LIME} rot={-2} />
      {t >= fr("test").t0 && t < fr("result").t0 && (
        <div style={{ position: "absolute", top: 300, left: 110, right: 110, display: "flex", justifyContent: "space-between", fontFamily: FONT, fontWeight: 900, fontSize: 46, color: "#fff", textShadow: outline(5) }}>
          <span>THE TEST</span><span><span style={{ color: "#FF4545", opacity: Math.floor(t * 2) % 2 ? 1 : 0.25 }}>●</span> REC</span>
        </div>
      )}
      <Chip txt="BARNARD COLLEGE · 2009" t={t} t0={wt("test", /2009/)} t1={fr("test").t1 + 0.1} y={420} bg="#E9E2FF" size={44} />
      <Chip txt="DON'T EAT IT!" t={t} t0={wt("rule", /don't/)} t1={fr("rule").t1} y={430} bg="#FF6B5E" fg="#fff" rot={-4} />
      <Chip txt="ATE IT" t={t} t0={fr("swap").t0} t1={wt("swap", /scientist/) - 0.2} y={430} bg={LIME} />
      <Chip txt="TAKEN AWAY" t={t} t0={wt("swap", /scientist/)} t1={fr("swap").t1 + 0.1} y={430} bg="#9DB4FF" rot={3} />
      <Chip txt={'"HE ATE IT."'} t={t} t0={wt("lie", /told/)} t1={wt("lie", /didn't/) - 0.05} y={430} bg="#FFFFFF" size={60} rot={-3} />
      <Chip txt="(HE DIDN'T)" t={t} t0={wt("lie", /didn't/)} t1={fr("lie").t1 + 0.1} y={430} bg={YEL} size={60} rot={2} />
      <Chip txt="DID NOTHING WRONG" t={t} t0={wt("result", /nothing/)} t1={fr("result").t1 + 0.1} y={420} bg={LIME} />
      <Chip txt="= PLEASE CALM DOWN" t={t} t0={wt("signal", /please/)} t1={fr("signal").t1 + 0.1} y={420} bg="#FFFFFF" />
      <Chip txt="READING YOUR FACE" t={t} t0={fr("reading").t0 + 0.2} t1={fr("reading").t1 + 0.1} y={420} bg="#9DB4FF" />
      <Chip txt="✗ SCOLDING" t={t} t0={wt("tip", /skip/)} t1={fr("tip").t1 + 0.1} y={360} bg="#FF6B5E" fg="#fff" rot={-3} />
      <Chip txt="✓ MOVE IT UP HIGH" t={t} t0={wt("tip", /move/)} t1={fr("tip").t1 + 0.1} y={475} bg={LIME} rot={2} />
      <Chip txt="SEND THIS TO A DOG PARENT" t={t} t0={fr("cta").t0} t1={T.total + 1} y={360} bg={LIME} size={46} />
      {t >= fr("test").t0 && t < fr("signal").t0 && (
        <div style={{ position: "absolute", top: 1235, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 28, color: "#fff", opacity: 0.85, textShadow: outline(3) }}>Horowitz (2009), Behavioural Processes</div>
      )}
      {word && (
        <div style={{ position: "absolute", top: 1090, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 96, color: HI2.has(word) ? YEL : "#fff", textShadow: outline(8), transform: `scale(${pop(t, w!.t0)})` }}>{word}</div>
      )}
      <div style={{ position: "absolute", top: 1262, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 26, color: "#fff", opacity: 0.7, textShadow: outline(2) }}>@pawslated</div>
    </AbsoluteFill>
  );
};

const HI3 = new Set(["DRAMATIC", "FIREWORK", "BREAKING", "CAN'T", "SHAKES", "HIDES", "PANTS", "RUN", "HALF", "FEAR", "TIME", "QUIETLY", "TREAT", "LOUDER", "NEVER", "DEN", "COMFORT", "WORSE", "MIDNIGHT", "COUCH", "SEND", "HATES"]);
const Paw: React.FC<{ on: boolean; k: number }> = ({ on, k }) => (
  <div style={{ width: 120, height: 120, borderRadius: 60, background: on ? YEL : "rgba(255,255,255,.25)", border: `6px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, transform: `scale(${k})` }}>
    <svg width="70" height="70" viewBox="0 0 100 100"><g fill={INK}><ellipse cx="50" cy="66" rx="24" ry="20" /><circle cx="24" cy="40" r="10" /><circle cx="40" cy="24" r="10" /><circle cx="60" cy="24" r="10" /><circle cx="76" cy="40" r="10" /></g></svg>
  </div>
);
const Overlay3: React.FC<{ T: Tempos }> = ({ T }) => {
  const f = useCurrentFrame(); const t = f / 30;
  const fr = (k: string) => T.frases.find((x) => x.k === k)!;
  const wt = (k: string, re: RegExp) => (T.palavras.find((w) => w.k === k && re.test(w.w)) ?? T.palavras.find((w) => w.k === k)!).t0;
  const w = T.palavras.find((x) => t >= x.t0 - 0.02 && t < x.t1 + 0.12) ?? null;
  const word = w ? w.w.replace(/[.,?!:]/g, "").toUpperCase() : "";
  const hook = fr("hook"), lo = fr("louder"), pl = fr("play");
  const day = t < lo.t0 ? 1 : Math.max(1, Math.min(14, Math.round(interpolate(t, [lo.t0, lo.t1], [1, 14], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))));
  const st = fr("study"), hf = fr("half");
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {t < hook.t1 + 0.25 && (
        <div style={{ position: "absolute", top: 300, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 96, lineHeight: 1.0, color: "#fff", textShadow: outline(8), transform: `scale(${pop(t, 0)})` }}>
          HE'S NOT BEING<br /><span style={{ color: YEL }}>DRAMATIC</span>
        </div>
      )}
      <Chip txt="IN HIS EARS" t={t} t0={fr("ears").t0 + 0.1} t1={fr("ears").t1 + 0.05} y={360} bg={YEL} />
      <Chip txt="HE HEARS WHAT YOU CAN'T" t={t} t0={fr("hear").t0} t1={fr("hear").t1 + 0.1} y={360} bg="#9DB4FF" size={46} />
      <Chip txt="SHAKES" t={t} t0={wt("signs", /shakes/)} t1={fr("signs").t1 + 0.1} y={330} bg="#FF6B5E" fg="#fff" rot={-3} x={380} />
      <Chip txt="HIDES" t={t} t0={wt("signs", /hides/)} t1={fr("signs").t1 + 0.1} y={330} bg={YEL} rot={3} x={720} />
      <Chip txt="PANTS" t={t} t0={wt("signs", /pants/)} t1={fr("signs").t1 + 0.1} y={450} bg="#9DB4FF" rot={2} x={380} />
      <Chip txt="RUNS" t={t} t0={wt("signs", /run/)} t1={fr("signs").t1 + 0.1} y={450} bg={LIME} rot={-2} x={720} />
      {t >= st.t0 && t < hf.t1 + 0.1 && (
        <div style={{ position: "absolute", top: 300, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: FONT, fontWeight: 900, color: "#fff", textShadow: outline(7) }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 130px)", gap: 8 }}>
            {Array.from({ length: 10 }, (_, i) => <Paw key={i} on={t >= wt("half", /half/) && i < 5} k={pop(t, st.t0 + i * 0.12)} />)}
          </div>
          {t >= wt("half", /half/) && <div style={{ fontSize: 120, color: YEL, lineHeight: 1.1, transform: `scale(${pop(t, wt("half", /half/))})` }}>1 IN 2</div>}
          {t >= wt("half", /half/) && <div style={{ fontSize: 48 }}>FEAR LOUD NOISES</div>}
        </div>
      )}
      {t >= st.t0 && t < hf.t1 + 0.1 && (
        <div style={{ position: "absolute", top: 1235, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 26, color: "#fff", opacity: 0.85, textShadow: outline(3) }}>Blackwell et al. 2013 · Riemer 2019</div>
      )}
      <Chip txt="THERE'S STILL TIME ✓" t={t} t0={wt("good", /time/)} t1={fr("good").t1 + 0.1} y={360} bg={LIME} />
      {t >= pl.t0 && t < lo.t1 + 0.1 && (
        <div style={{ position: "absolute", top: 300, left: 140, right: 140, fontFamily: FONT, fontWeight: 900, color: "#fff", textShadow: outline(6), textAlign: "center" }}>
          <div style={{ fontSize: 76 }}>DAY <span style={{ color: YEL }}>{day}</span></div>
          <div style={{ marginTop: 10, height: 44, borderRadius: 22, border: `6px solid ${INK}`, background: "rgba(255,255,255,.35)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${8 + (day - 1) * 3.2}%`, background: LIME }} />
          </div>
          <div style={{ fontSize: 34, marginTop: 6 }}>VOLUME</div>
        </div>
      )}
      <Chip txt="NEVER TOO LOUD" t={t} t0={wt("louder", /Never/)} t1={lo.t1 + 0.1} y={560} bg="#FF6B5E" fg="#fff" rot={-3} />
      <Chip txt="COZY DEN" t={t} t0={fr("den").t0 + 0.1} t1={fr("den").t1 + 0.1} y={350} bg="#C9B6FF" />
      <Chip txt="AWAY FROM WINDOWS" t={t} t0={wt("den", /windows/) - 0.3} t1={fr("den").t1 + 0.1} y={465} bg={YEL} size={44} rot={2} />
      <Chip txt="COMFORT = OK ✓" t={t} t0={wt("night", /comfort/)} t1={fr("night").t1 + 0.1} y={360} bg={LIME} />
      <Chip txt="WON'T MAKE IT WORSE" t={t} t0={fr("worse").t0} t1={fr("worse").t1 + 0.1} y={360} bg="#9DB4FF" />
      {t >= fr("couch").t0 && t < fr("cta").t0 && (
        <div style={{ position: "absolute", top: 290, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, color: "#fff", textShadow: outline(8) }}>
          <div style={{ fontSize: 170, color: YEL, lineHeight: 1, transform: `scale(${pop(t, wt("couch", /midnight/))})` }}>{t < wt("couch", /midnight/) ? "23:59" : "00:00"}</div>
          <div style={{ fontSize: 50 }}>HAPPY NEW YEAR</div>
        </div>
      )}
      <Chip txt="SEND THIS TO A DOG PARENT" t={t} t0={fr("cta").t0} t1={T.total + 1} y={360} bg={LIME} size={46} />
      {word && (
        <div style={{ position: "absolute", top: 1090, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 96, color: HI3.has(word) ? YEL : "#fff", textShadow: outline(8), transform: `scale(${pop(t, w!.t0)})` }}>{word}</div>
      )}
      <div style={{ position: "absolute", top: 1262, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 26, color: "#fff", opacity: 0.7, textShadow: outline(2) }}>@pawslated</div>
    </AbsoluteFill>
  );
};

const HI4 = new Set(["CHRISTMAS", "TOY", "SHINY", "STRINGS", "BALLS", "WATER", "TINSEL", "BLOCK", "INTESTINES", "BACTERIA", "FERTILIZER", "CHOCOLATE", "DARKER", "WORSE", "GLASS", "BREAK", "SWALLOWED", "FIVE", "SKIP", "COVER", "HIGH", "LOCK", "TIE", "TIP", "PRESENT", "SEND"]);
const Overlay4: React.FC<{ T: Tempos }> = ({ T }) => {
  const f = useCurrentFrame(); const t = f / 30;
  const fr = (k: string) => T.frases.find((x) => x.k === k)!;
  const wt = (k: string, re: RegExp) => (T.palavras.find((w) => w.k === k && re.test(w.w)) ?? T.palavras.find((w) => w.k === k)!).t0;
  const w = T.palavras.find((x) => t >= x.t0 - 0.02 && t < x.t1 + 0.12) ?? null;
  const word = w ? w.w.replace(/[.,?!:]/g, "").toUpperCase() : "";
  const hook = fr("hook"), tin = fr("tinsel"), ch = fr("choc");
  const xr0 = wt("tinsel", /swallows/), xr = Math.min(1, Math.max(0, (t - xr0) / 1.6));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {t < hook.t1 + 0.25 && (
        <div style={{ position: "absolute", top: 300, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 100, lineHeight: 1.0, color: "#fff", textShadow: outline(8), transform: `scale(${pop(t, 0)})` }}>
          TO HIM, IT'S A<br /><span style={{ color: YEL }}>GIANT TOY</span>
        </div>
      )}
      <Chip txt="SHINY STRINGS" t={t} t0={wt("shiny", /Shiny/)} t1={fr("shiny").t1 + 0.1} y={330} bg="#DDE3EA" rot={-3} />
      <Chip txt="HANGING BALLS" t={t} t0={wt("shiny", /Hanging/)} t1={fr("shiny").t1 + 0.1} y={445} bg="#FF6B5E" fg="#fff" rot={2} />
      <Chip txt="A WATER BOWL?!" t={t} t0={wt("shiny", /water/)} t1={fr("shiny").t1 + 0.1} y={560} bg="#7BDFF2" rot={-2} />
      <Chip txt="WHAT VETS WARN ABOUT" t={t} t0={fr("vets").t0} t1={fr("vets").t1 + 0.1} y={360} bg={YEL} size={48} />
      <Chip txt="1 · TINSEL" t={t} t0={tin.t0} t1={xr0} y={360} bg="#DDE3EA" />
      {t >= xr0 && t < tin.t1 + 0.15 && (
        <div style={{ position: "absolute", top: 300, left: 140, width: 800, height: 760, borderRadius: 40, background: "#0E2340", border: `8px solid ${INK}`, boxShadow: `0 10px 0 ${INK}`, overflow: "hidden", transform: `scale(${pop(t, xr0)})` }}>
          <div style={{ position: "absolute", top: 18, left: 28, fontFamily: FONT, fontWeight: 900, fontSize: 40, color: "#7BDFF2", letterSpacing: 3 }}>X-RAY</div>
          <svg width="800" height="760" viewBox="0 0 800 760">
            <g fill="none" stroke="#7BDFF2" strokeWidth="10" opacity="0.55"><ellipse cx="400" cy="430" rx="250" ry="150" /><circle cx="640" cy="300" r="90" /><path d="M200 560 L190 700 M300 570 L300 700 M500 570 L500 700 M600 560 L610 700" /></g>
            <path d="M330 420 C360 380 420 470 450 420 S520 380 480 460 S380 500 420 440 S500 420 470 480" fill="none" stroke="#FF4D6D" strokeWidth="14" strokeLinecap="round" strokeDasharray="900" strokeDashoffset={900 * (1 - xr)} />
          </svg>
          <div style={{ position: "absolute", bottom: 26, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 56, color: "#FF4D6D" }}>BLOCKAGE</div>
        </div>
      )}
      <Chip txt="2 · TREE WATER" t={t} t0={fr("water").t0} t1={fr("water").t1 + 0.1} y={340} bg="#7BDFF2" />
      <Chip txt="BACTERIA + FERTILIZER" t={t} t0={wt("water", /bacteria/)} t1={fr("water").t1 + 0.1} y={455} bg="#8BE04E" size={46} rot={2} />
      <Chip txt="3 · CHOCOLATE" t={t} t0={ch.t0} t1={ch.t1 + 0.1} y={340} bg="#C98A4B" fg="#fff" />
      {t >= wt("choc", /darker/) && t < ch.t1 + 0.1 && (
        <div style={{ position: "absolute", top: 430, left: 270, right: 270, height: 280, display: "flex", alignItems: "flex-end", justifyContent: "space-around", fontFamily: FONT, fontWeight: 900, color: "#fff", textShadow: outline(5) }}>
          {[["MILK", 0.25, "#C98A4B"], ["DARK", 1, "#5B2C1A"]].map(([n, h, c], i) => (
            <div key={i} style={{ textAlign: "center" }}><div style={{ width: 150, height: 220 * (h as number) * sm2(t - wt("choc", /darker/), 0.4), background: c as string, border: `6px solid ${INK}`, borderRadius: 16 }} /><div style={{ fontSize: 40 }}>{n as string}</div></div>
          ))}
        </div>
      )}
      <Chip txt="4 · GLASS ORNAMENTS" t={t} t0={fr("orn").t0} t1={fr("orn").t1 + 0.1} y={340} bg="#9EDCF9" size={48} />
      <Chip txt="5-MINUTE FIX" t={t} t0={wt("fix", /five/)} t1={fr("fix").t1 + 0.1} y={360} bg={LIME} />
      <Chip txt="✗ TINSEL" t={t} t0={wt("skip", /tinsel/)} t1={fr("tie").t1 + 0.1} y={320} bg="#FF6B5E" fg="#fff" size={40} x={330} rot={-2} />
      <Chip txt="✓ COVER WATER" t={t} t0={wt("skip", /Cover/)} t1={fr("tie").t1 + 0.1} y={320} bg={LIME} size={40} x={740} rot={2} />
      <Chip txt="✓ UP HIGH" t={t} t0={wt("high", /Hang/)} t1={fr("tie").t1 + 0.1} y={420} bg={LIME} size={40} x={330} rot={2} />
      <Chip txt="✓ LOCK CHOCOLATE" t={t} t0={wt("high", /Lock/)} t1={fr("tie").t1 + 0.1} y={420} bg={LIME} size={40} x={740} rot={-2} />
      <Chip txt="✓ TIE THE TREE" t={t} t0={wt("tie", /tie/)} t1={fr("tie").t1 + 0.1} y={520} bg={LIME} size={40} />
      <Chip txt="MERRY & SAFE" t={t} t0={fr("safe").t0 + 0.6} t1={fr("safe").t1 + 0.1} y={360} bg="#FF6B5E" fg="#fff" />
      <Chip txt="SEND THIS BEFORE THEY DECORATE" t={t} t0={fr("cta").t0} t1={T.total + 1} y={360} bg={LIME} size={40} />
      {t >= fr("vets").t0 && t < fr("fix").t0 && (
        <div style={{ position: "absolute", top: 1235, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 26, color: "#fff", opacity: 0.85, textShadow: outline(3) }}>Sources: Cornell Vet · ASPCA · AVMA</div>
      )}
      {word && (
        <div style={{ position: "absolute", top: 1090, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 96, color: HI4.has(word) ? YEL : "#fff", textShadow: outline(8), transform: `scale(${pop(t, w!.t0)})` }}>{word}</div>
      )}
      <div style={{ position: "absolute", top: 1262, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 26, color: "#fff", opacity: 0.7, textShadow: outline(2) }}>@pawslated</div>
    </AbsoluteFill>
  );
};
const sm2 = (x: number, d: number) => { const u = Math.max(0, Math.min(1, x / d)); return u * u * (3 - 2 * u); };

const HI5 = new Set(["BATHROOM", "WEIRD", "DOOR", "WAITS", "NOSE", "GAP", "VANISHED", "TINY", "TODDLERS", "WAITED", "GREET", "CALMED", "ATTACHMENT", "BOND", "PARENT", "BONUS", "TALK", "PET", "CLOSE", "GOOD", "PANICS", "VET", "CLINGY", "SHADOW", "SEND", "ALONE"]);
const Hearts: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t0, t1 }) => {
  if (t < t0 || t > t1) return null;
  return <>{Array.from({ length: 7 }, (_, i) => { const ph = ((t - t0) * 0.7 + i / 7) % 1; return <div key={i} style={{ position: "absolute", left: 220 + i * 95 + Math.sin(i * 3 + t * 2) * 30, top: 1000 - ph * 650, fontSize: 70, opacity: 1 - ph, color: "#FF5D73", textShadow: outline(4) }}>♥</div>; })}</>;
};
const Overlay5: React.FC<{ T: Tempos }> = ({ T }) => {
  const f = useCurrentFrame(); const t = f / 30;
  const fr = (k: string) => T.frases.find((x) => x.k === k)!;
  const wt = (k: string, re: RegExp) => (T.palavras.find((w) => w.k === k && re.test(w.w)) ?? T.palavras.find((w) => w.k === k)!).t0;
  const w = T.palavras.find((x) => t >= x.t0 - 0.02 && t < x.t1 + 0.12) ?? null;
  const word = w ? w.w.replace(/[.,?!:]/g, "").toUpperCase() : "";
  const hook = fr("hook");
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {t < hook.t1 + 0.25 && (
        <div style={{ position: "absolute", top: 300, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 100, lineHeight: 1.0, color: "#fff", textShadow: outline(8), transform: `scale(${pop(t, 0)})` }}>
          WHY HE FOLLOWS<br /><span style={{ color: YEL }}>YOU IN HERE</span>
        </div>
      )}
      <Chip txt="*CLICK*" t={t} t0={wt("door", /close/)} t1={wt("door", /waits/)} y={380} bg="#FFFFFF" size={64} rot={-5} x={700} />
      <Chip txt="NOSE AT THE GAP" t={t} t0={wt("door", /Nose/)} t1={fr("door").t1 + 0.1} y={380} bg={YEL} />
      <Chip txt="YOU: GONE?!" t={t} t0={wt("vanish", /vanished/)} t1={wt("vanish", /tiny/) - 0.05} y={380} bg="#FF6B5E" fg="#fff" rot={-3} />
      <Chip txt="TODDLER TEST, FOR DOGS" t={t} t0={wt("test", /toddlers/) - 0.6} t1={fr("test").t1 + 0.1} y={360} bg="#C9B6FF" size={46} />
      {t >= fr("test").t0 && t < fr("back").t1 + 0.1 && (
        <div style={{ position: "absolute", top: 455, left: 110, right: 110, display: "flex", justifyContent: "space-between", fontFamily: FONT, fontWeight: 900, fontSize: 40, color: "#fff", textShadow: outline(5) }}>
          <span>LAB · 1998</span><span><span style={{ color: "#FF4545", opacity: Math.floor(t * 2) % 2 ? 1 : 0.25 }}>●</span> REC</span>
        </div>
      )}
      <Chip txt="WAITED AT THE DOOR" t={t} t0={wt("left", /door/)} t1={fr("left").t1 + 0.1} y={360} bg={YEL} />
      <Chip txt="GREETED + CALMED DOWN" t={t} t0={wt("back", /greet/)} t1={fr("back").t1 + 0.1} y={360} bg={LIME} size={46} />
      <Chip txt="LIKE A CHILD & PARENT" t={t} t0={wt("bond", /child/) - 0.3} t1={fr("bond").t1 + 0.1} y={360} bg="#FFC8DD" size={48} />
      <Hearts t={t} t0={fr("bond").t0 + 0.3} t1={fr("bond").t1} />
      <Chip txt="+ BONUS" t={t} t0={fr("plus").t0} t1={fr("plus").t1 + 0.1} y={380} bg={YEL} size={72} rot={-4} />
      <Chip txt="✓ YOU TALK" t={t} t0={wt("good", /talk/)} t1={fr("good").t1 + 0.1} y={330} bg={LIME} size={44} x={340} rot={-2} />
      <Chip txt="✓ YOU PET" t={t} t0={wt("good", /pet/)} t1={fr("good").t1 + 0.1} y={330} bg={LIME} size={44} x={740} rot={2} />
      <Hearts t={t} t0={wt("good", /pet/)} t1={fr("good").t1} />
      <Chip txt="STAY CLOSE = GOOD STUFF" t={t} t0={fr("learn").t0 + 0.2} t1={fr("learn").t1 + 0.1} y={360} bg={YEL} size={46} />
      <Chip txt="PANICS WHEN ALONE?" t={t} t0={wt("worry", /panics/)} t1={fr("worry").t1 + 0.1} y={340} bg="#FF6B5E" fg="#fff" size={48} />
      <Chip txt="→ TALK TO YOUR VET" t={t} t0={wt("worry", /vet/) - 0.4} t1={fr("worry").t1 + 0.1} y={455} bg="#FFFFFF" size={46} rot={2} />
      <Chip txt="NOT CLINGY. YOUR SHADOW." t={t} t0={wt("shadow", /shadow/) - 0.5} t1={fr("shadow").t1 + 0.1} y={360} bg={LIME} size={44} />
      <Chip txt="SEND THIS TO A DOG PARENT" t={t} t0={fr("cta").t0} t1={T.total + 1} y={360} bg={LIME} size={46} />
      {t >= fr("test").t0 && t < fr("bond").t1 && (
        <div style={{ position: "absolute", top: 1235, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 26, color: "#fff", opacity: 0.85, textShadow: outline(3) }}>Topál et al. (1998), J. Comparative Psychology</div>
      )}
      {word && (
        <div style={{ position: "absolute", top: 1090, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 96, color: HI5.has(word) ? YEL : "#fff", textShadow: outline(8), transform: `scale(${pop(t, w!.t0)})` }}>{word}</div>
      )}
      <div style={{ position: "absolute", top: 1262, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 26, color: "#fff", opacity: 0.7, textShadow: outline(2) }}>@pawslated</div>
    </AbsoluteFill>
  );
};

export const Paw3: React.FC<{ pasta: string; tempos: Tempos }> = ({ tempos }) => {
  const f = useCurrentFrame();
  const T = tempos;
  // flash branco curto nas trocas de lugar
  const w = useMemo(() => mkWorld(T), [T]);
  const cuts = w.shots.slice(1).filter((s, i) => s.set !== w.shots[i].set).map((s) => Math.round(s.a * 30));
  const flash = cuts.reduce((a, F) => (f >= F && f < F + 4 ? [0.9, 0.6, 0.3, 0.1][f - F] : a), 0);
  return (
    <AbsoluteFill style={{ background: "#141A33" }}>
      <ThreeCanvas width={1080} height={1920} shadows gl={{ alpha: false, antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0 }}
        camera={{ fov: 36, near: 0.1, far: 400 }}>
        <Inner T={T} />
      </ThreeCanvas>
      {flash > 0 && <AbsoluteFill style={{ background: "#ffffff", opacity: flash }} />}
      {(T as any).ep === 5 ? <Overlay5 T={T} /> : (T as any).ep === 4 ? <Overlay4 T={T} /> : (T as any).ep === 3 ? <Overlay3 T={T} /> : (T as any).ep === 2 ? <Overlay2 T={T} /> : <Overlay T={T} />}
    </AbsoluteFill>
  );
};
