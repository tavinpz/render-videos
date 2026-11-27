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
  const world = useMemo(() => new PawWorld(T), [T]);
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

export const Paw3: React.FC<{ pasta: string; tempos: Tempos }> = ({ tempos }) => {
  const f = useCurrentFrame();
  const T = tempos;
  // flash branco curto nas trocas de lugar
  const w = useMemo(() => new PawWorld(T), [T]);
  const cuts = w.shots.slice(1).filter((s, i) => s.set !== w.shots[i].set).map((s) => Math.round(s.a * 30));
  const flash = cuts.reduce((a, F) => (f >= F && f < F + 4 ? [0.9, 0.6, 0.3, 0.1][f - F] : a), 0);
  return (
    <AbsoluteFill style={{ background: "#141A33" }}>
      <ThreeCanvas width={1080} height={1920} shadows gl={{ alpha: false, antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0 }}
        camera={{ fov: 36, near: 0.1, far: 400 }}>
        <Inner T={T} />
      </ThreeCanvas>
      {flash > 0 && <AbsoluteFill style={{ background: "#ffffff", opacity: flash }} />}
      <Overlay T={T} />
    </AbsoluteFill>
  );
};
