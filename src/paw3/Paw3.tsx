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
const mkWorld = (T: Tempos) => ((T as any).ep === 3 ? new FireworksWorld(T) : (T as any).ep === 2 ? new GuiltWorld(T) : new PawWorld(T));

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
  gradeFor(fx.grade, "golden");
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
      {(T as any).ep === 3 ? <Overlay3 T={T} /> : (T as any).ep === 2 ? <Overlay2 T={T} /> : <Overlay T={T} />}
    </AbsoluteFill>
  );
};
