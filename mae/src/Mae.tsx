// Composição MaeShort: um episódio do Mãe Mandou (props: { ep: "e06" }). Pós igual ao template aprovado:
// contorno -> lente (pré + principal) -> [bloom, tone map NEUTRAL, cor]. Chuva, granizo, arco-íris e flash são efeitos 2D por cima.
import React, { useEffect, useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, getInputProps, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useFrame, useThree } from "@react-three/fiber";
import { BlendFunction, BloomEffect, EffectComposer, EffectPass, RenderPass, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { World, timeOf, gradeKey } from "./motor/mundo";
import { InkPass, noInkFallback } from "./motor/ink";
import { LensBlur } from "./motor/lensblur";
import { GradeEffect, GRADES, GRADE_STRENGTH, gradeFor } from "./motor/grade";
import { FPS, hh } from "./motor/base";
import { EPS } from "./eps";
import type { Ep } from "./motor/spec";

const makeBloom = () => {
  const b = new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.5, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true, levels: 6, radius: 0.6 });
  const mip = b.mipmapBlurPass, setSize = mip.setSize.bind(mip);
  mip.setSize = (w: number, h: number) => setSize(Math.round((1920 * w) / Math.max(h, 1)), 1920);
  return b;
};
const fwd = new THREE.Vector3();

const Inner: React.FC<{ ep: Ep }> = ({ ep }) => {
  const f = useCurrentFrame();
  const { camera, scene } = useThree();
  const world = useMemo(() => new World(ep), [ep]);
  const ms = (getInputProps() as { ms?: number }).ms ?? 4;
  const fx = useMemo(() => ({
    ink: new InkPass(scene, camera as THREE.PerspectiveCamera), lens: new LensBlur({ maxCoC: 24, nearScale: 1.2 }),
    bloom: makeBloom(), tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }), grade: new GradeEffect(GRADES.day, GRADE_STRENGTH.day),
  }), [camera, scene]);
  useEffect(() => () => fx.ink.dispose(), [fx]);
  const gl = useThree((st) => st.gl), size = useThree((st) => st.size);
  const composer = useMemo(() => {
    const c = new EffectComposer(gl, { multisampling: ms, frameBufferType: THREE.HalfFloatType });
    c.addPass(new RenderPass(scene, camera)); c.addPass(fx.ink);
    c.addPass(new EffectPass(camera, fx.lens.pre)); c.addPass(new EffectPass(camera, fx.lens.main));
    c.addPass(new EffectPass(camera, fx.bloom, fx.tone, fx.grade));
    return c;
  }, [gl, scene, camera, fx, ms]);
  useEffect(() => { composer.setSize(size.width, size.height); }, [composer, size]);
  useEffect(() => () => { composer.removeAllPasses(); }, [composer]);
  useFrame((_, dt) => { composer.render(dt); }, 1);
  const cam = camera as THREE.PerspectiveCamera;
  const r = world.update(f, cam, scene);
  noInkFallback(world.root);
  cam.getWorldDirection(fwd);
  fx.lens.focus = Math.max(0.3, r.focus.clone().sub(cam.position).dot(fwd));
  fx.lens.cInf = r.shot.dof ?? (cam.fov < 26 ? 12 : cam.fov < 36 ? 9 : 5);
  gradeFor(fx.grade, gradeKey(r.shot.light ?? "day"));
  return <primitive object={world.root} dispose={null} />;
};

/** chuva/granizo desenhados em 2D por cima (efeito, não objeto) */
const Rain: React.FC<{ k: number; hail: boolean; f: number }> = ({ k, hail, f }) => {
  const n = Math.round(40 + 260 * k);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: n }, (_, i) => {
        const x0 = hh(i, 1) * 1180 - 50, sp = hail ? 38 : 70 + 40 * hh(i, 2), y = ((hh(i, 3) * 2200 + f * sp) % 2200) - 140;
        return hail
          ? <circle key={i} cx={x0 - y * 0.08} cy={y} r={7 + 6 * hh(i, 4)} fill="#f4f8ff" stroke="#9fb2cc" strokeWidth={2} />
          : <line key={i} x1={x0 - y * 0.12} y1={y} x2={x0 - y * 0.12 - 8} y2={y + 60 + 40 * hh(i, 5)} stroke="#dbe8ff" strokeOpacity={0.55} strokeWidth={3} />;
      })}
    </svg>
  );
};
const Rainbow: React.FC<{ u: number }> = ({ u }) => {
  const cols = ["#e2453c", "#f08a2c", "#f3d35a", "#3fa45a", "#3f8fe0", "#6a5ac9"];
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.85 }}>
      <defs><clipPath id="rv"><rect x={0} y={0} width={1080 * u} height={1920} /></clipPath></defs>
      <g clipPath="url(#rv)" style={{ filter: "blur(3px)" }}>
        {cols.map((c, i) => <path key={i} d={`M ${-60 + i * 26} 1050 A ${640 - i * 26} ${640 - i * 26} 0 0 1 ${1140 - i * 26} 1050`} fill="none" stroke={c} strokeWidth={28} />)}
      </g>
    </svg>
  );
};

export const MaeShort: React.FC<{ ep?: string }> = ({ ep: id }) => {
  const f = useCurrentFrame();
  const ep = EPS[id ?? (getInputProps() as { ep?: string }).ep ?? "e06"];
  const world = useMemo(() => new World(ep), [ep]);
  const si = world.shotIndex(f), s = ep.shots[si], fr = world.frameRange(si), t = f / FPS;
  const flash = s.flash && f - fr.a < 4 ? [0.9, 0.6, 0.35, 0.15][f - fr.a] : 0;
  const rb = s.rainbow ? Math.min(1, (t - fr.a / FPS) / 1.2) : 0;
  return (
    <AbsoluteFill style={{ background: "#cfe3f2" }}>
      <ThreeCanvas width={1080} height={1920} shadows gl={{ alpha: false, antialias: false, stencil: false, powerPreference: "high-performance" }} camera={{ fov: 40, near: 0.1, far: 1500 }}>
        <Inner ep={ep} />
      </ThreeCanvas>
      {s.tint && <AbsoluteFill style={{ background: s.tint, opacity: 0.18, mixBlendMode: "multiply" }} />}
      {(s.rain ?? 0) > 0 && <Rain k={s.rain!} hail={!!s.hail} f={f} />}
      {rb > 0 && <Rainbow u={rb} />}
      {flash > 0 && <AbsoluteFill style={{ background: "#fff", opacity: flash }} />}
    </AbsoluteFill>
  );
};
export const totalFrames = (id: string) => Math.round(EPS[id].tempos.total * FPS);
export { timeOf };
