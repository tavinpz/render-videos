// Mundo único com todos os cenários; a cada quadro posa câmera, luz, elenco e objetos do plano atual.
import * as THREE from "three";
import { V } from "./build";
import { ctex, cloudHD } from "./paint";
import { LIGHTS, LOOK, LightPreset } from "./lights";
import { TONE, CHAR, untone } from "./shade";
import { NOINK } from "./ink";
import { Pool, Actor, Fx, Stage, person, blob, lidAt, viewOf, setLight, syncSun, Who as WhoKey } from "./actors";
import { Outfit, FrontOpts, SideOpts, Expr, fxBurst, fxStars, fxPuff, fxRing, fxNote, fxCloud } from "./toon";
import { buildSets, SETS } from "./sets";
import { PropRack } from "./props";
import { FPS, V3, clamp01, glide, smooth, hh } from "./base";
import type { Ep, ShotSpec, At, ActSpec, Light } from "./spec";

// ---------------- elenco ----------------
const SK = ["#f1c39a", "#e8b48a", "#c99067", "#f5d0b0", "#a8703f"];
export const OUTFITS: Record<string, (v: number) => Outfit> = {
  mae: () => ({ jacket: "#d23b3b", dress: "#d23b3b", pants: "#3b3f52", boots: "#3a2a22", hat: "bun", hair: "#4a2c1e", skin: SK[0], build: "stout" }),
  davi: () => ({ jacket: "#3fa45a", pants: "#3b5b9a", boots: "#f4f1ea", hat: "hair", hair: "#2a201a", skin: SK[1], build: "kid" }),
  pai: () => ({ jacket: "#3f6fb5", pants: "#5a5f6b", boots: "#4a3426", hat: "hair", hair: "#2a201a", skin: SK[2], moustache: "#2a1d16" }),
  paiSunga: () => ({ jacket: SK[2], pants: "#d9453c", boots: SK[2], hat: "hair", hair: "#2a201a", skin: SK[2], moustache: "#2a1d16", build: "stout" }),
  vo: () => ({ jacket: "#7b5ac9", dress: "#7b5ac9", pants: "#3b3f52", boots: "#4a3426", hat: "bun", hair: "#dcd8d0", skin: SK[3], build: "stout", glasses: true }),
  kid: (v) => ({ jacket: ["#f08a2c", "#7b5ac9", "#e2453c", "#3f6fb5", "#f3d35a", "#e86e9a"][v % 6], pants: ["#3b5b9a", "#3b3f52", "#d9c7a0"][v % 3], boots: "#f4f1ea", hat: "hair", hair: ["#2a201a", "#5a3b2a", "#c9893a", "#1a1414"][v % 4], skin: SK[v % 5], build: "kid" }),
  amigo: (v) => ({ jacket: ["#f08a2c", "#e86e9a", "#3f6fb5"][v % 3], pants: "#3b5b9a", boots: "#f4f1ea", hat: v % 2 ? "cap" : "hair", cap: "#e2453c", hair: "#5a3b2a", skin: SK[(v + 2) % 5], build: "kid" }),
  apresentador: () => ({ jacket: "#2b3a5e", pants: "#2b2d36", boots: "#1d1a2a", hat: "hair", hair: "#1a1414", skin: SK[4], buttons: "#d9dde0" }),
  cientista: (v) => ({ jacket: "#f4f1ea", pants: "#5a5f6b", boots: "#3a2a22", hat: "hair", hair: ["#9a9a9a", "#4a3020", "#c9893a"][v % 3], skin: SK[(v + 1) % 5], glasses: true, buttons: "#9aa3b5" }),
  enfermeira: () => ({ jacket: "#7fd1c2", dress: "#7fd1c2", pants: "#ffffff", boots: "#ffffff", hat: "bun", hair: "#2a201a", skin: SK[2], build: "adult" }),
};
const KID_WHO: Record<string, boolean> = { davi: true, kid: true, amigo: true };

import { timeOf, shotFrames } from "./tempo";
export { timeOf, shotFrames };
const keyed = <T,>(ep: Ep, v: T | [At, T][] | undefined, t: number, def: T, lead = 2 / FPS): T => {
  if (v === undefined) return def;
  if (!Array.isArray(v) || (v.length && !Array.isArray(v[0]))) return v as T;
  let cur = def;
  for (const [a, x] of v as [At, T][]) if (t >= timeOf(ep, a) - lead) cur = x;
  return cur;
};
const keyedNum = (ep: Ep, v: number | [At, number][] | undefined, t: number, def: number, ramp = 0.45) => {
  if (v === undefined) return def;
  if (typeof v === "number") return v;
  let cur = v.length ? v[0][1] : def;
  for (let i = 1; i < v.length; i++) { const t0 = timeOf(ep, v[i][0]); if (t >= t0) cur = v[i - 1][1] + (v[i][1] - v[i - 1][1]) * glide((t - t0) / ramp); }
  return cur;
};

// ---------------- luz ----------------
const STORM: LightPreset = { ...LIGHTS.day, lit: [0.95, 0.98, 1.08], shade: [0.3, 0.32, 0.42], lift: [0.06, 0.08, 0.14], charTint: [0.86, 0.9, 1.0],
  fog: "#8592a8", fogNear: 18, fogFar: 160, sunI: 1.4, sky: "#b8c4d8", hemiI: 0.7 };
const LOOK_STORM = { ...LOOK.day, sky: { c: ["#8a96aa", "#7d8aa0", "#6a7790", "#59657e", "#4a546a"], e: [0, 3, 8, 16, 40] }, cloud: { lit: "#c9cfdb", mid: "#a9b1c2", shade: "#8a93a8" } };
const lightOf = (l: Light) => (l === "storm" ? STORM : LIGHTS[l]);
const lookOf = (l: Light) => (l === "storm" ? LOOK_STORM : LOOK[l]);
export const gradeKey = (l: Light): "day" | "golden" => (l === "golden" ? "golden" : "day");

export type CamNow = { pos: V3; look: V3; fov: number; roll: number };
export const camAt = (ep: Ep, si: number, f: number, fr: { a: number; b: number }): CamNow => {
  const s = ep.shots[si], c = s.cam, n = f - fr.a, len = Math.max(1, fr.b - fr.a);
  const k = c.p2 || c.l2 || c.fov2 ? glide(n / Math.min(len, (c.dur ?? 1.2) * FPS)) : 0;
  const mix3 = (a: V3, b: V3 | undefined): V3 => (b ? (a.map((x, i) => x + (b[i] - x) * k) as V3) : a);
  const o = SETS[s.set].o;
  const pos = mix3(c.p, c.p2).map((x, i) => x + o[i]) as V3, look = mix3(c.l, c.l2).map((x, i) => x + o[i]) as V3;
  let fov = (c.fov ?? 40) + ((c.fov2 ?? c.fov ?? 40) - (c.fov ?? 40)) * k;
  fov = (360 / Math.PI) * Math.atan(Math.tan((fov * Math.PI) / 360) * Math.exp(-(c.creep ?? 0.0025) * n)); // toda espera avança devagar
  let roll = c.roll ?? 0;
  // tremida de impacto: troca de lado a cada quadro, some em 7 quadros
  const kicks: number[] = s.kick === true ? [fr.a / FPS] : Array.isArray(s.kick) ? s.kick.map((a) => timeOf(ep, a)) : [];
  for (const kt of kicks) {
    const q = f - Math.round(kt * FPS);
    if (q >= 0 && q < 7) { const a = (q % 2 ? -1 : 1) * (1 - q / 7), d: V3 = [look[0] - pos[0], look[1] - pos[1], look[2] - pos[2]];
      const L = Math.hypot(...d), h = Math.hypot(d[0], d[2]) || 1, m = (3 / 640) * Math.tan((fov * Math.PI) / 360) * L * a * 3;
      look[0] -= (d[2] / h) * m; look[1] += 0.6 * m; look[2] += (d[0] / h) * m; roll += a * 0.008; }
  }
  return { pos, look, fov, roll };
};

export class World {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private sky: THREE.Mesh; private skyMat: THREE.ShaderMaterial;
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private clouds: THREE.Mesh[] = [];
  private cloudMaps: Record<string, THREE.Texture[]>;
  private rack: PropRack;
  private water: THREE.Mesh;
  private frustum = new THREE.Frustum(); private m4 = new THREE.Matrix4(); private v = new THREE.Vector3(); private sph = new THREE.Sphere();
  private frames: { a: number; b: number }[];

  constructor(private ep: Ep) {
    const R = this.root;
    this.frames = shotFrames(ep);
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() }, c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el)); c = mix(c, c2, smoothstep(e.x, e.y, el)); c = mix(c, c3, smoothstep(e.y, e.z, el)); c = mix(c, c4, smoothstep(e.z, e.w, el));
          gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1100, 48, 24), this.skyMat);
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK); R.add(this.sky);
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6);
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(2048, 2048);
    R.add(this.hemi, this.sun, this.sun.target);
    this.cloudMaps = { day: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud)), golden: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.golden.cloud)), storm: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK_STORM.cloud)) };
    for (let i = 0; i < 10; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: this.cloudMaps.day[i % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      m.layers.set(NOINK); this.clouds.push(m); R.add(m);
    }
    buildSets(R);
    this.rack = new PropRack(R);
    // água da enchente (rua)
    const wt = ctex("agua", 256, 256, (g, r) => { g.fillStyle = "#6f8fa8"; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(255,255,255,${0.08 + r() * 0.12})`; g.fillRect(r() * 256, r() * 256, 20 + r() * 40, 3); } });
    wt.wrapS = wt.wrapT = THREE.RepeatWrapping; wt.repeat.set(20, 60);
    this.water = new THREE.Mesh(new THREE.PlaneGeometry(60, 300).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ map: wt, transparent: true, opacity: 0.92 }));
    this.water.position.set(SETS.rua.o[0], -1, SETS.rua.o[2] + 20); this.water.receiveShadow = true; R.add(this.water);
  }
  shotIndex(f: number) { let i = 0; while (i + 1 < this.frames.length && f >= this.frames[i + 1].a) i++; return i; }
  frameRange(i: number) { return this.frames[i]; }
  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  /** quem tem rosto no plano, no instante t */
  private stage(s: ShotSpec, t: number, t0: number, cam: { pos: THREE.Vector3; right: THREE.Vector3 }): Stage {
    const out: Stage = { places: [], fx: [] }, ep = this.ep, o = SETS[s.set].o;
    setLight(gradeKey(s.light ?? "day")); syncSun(cam);
    (s.acts ?? []).forEach((a: ActSpec, i) => {
      if (a.from !== undefined && t < timeOf(ep, a.from)) return;
      if (a.to !== undefined && t >= timeOf(ep, a.to)) return;
      const dt = t - t0;
      let x = o[0] + a.x, z = o[2] + a.z;
      let y = o[1] + (a.y ?? 0) + (a.hop ? Math.abs(Math.sin(dt * 7 + i)) * a.hop : 0);
      if (a.rise) { const ta = timeOf(ep, a.rise[0]); y += a.rise[1] + (a.rise[2] - a.rise[1]) * glide((t - ta) / 1.1); }
      if (a.walk) { x += a.walk[0] * a.walk[2] * dt; z += a.walk[1] * a.walk[2] * dt; }
      const sc = keyedNum(ep, a.s, t, 1) * (KID_WHO[a.who] ? 0.82 : 1);
      const expr = keyed<Expr>(ep, a.ex, t, "neutral");
      const armK = keyed<string>(ep, a.arms as never, t, "none");
      const shake = a.shake ? Math.sin(t * 60 + i) * a.shake * 0.02 : 0;
      const ostr = a.who + (a.v ?? 0);
      const who: WhoKey = { i: i * 13 + (a.v ?? 0) * 7 + 11, o: OUTFITS[a.who](a.v ?? 0), okey: ostr };
      const moving = !!a.walk || a.mode === "stroll" || a.mode === "march";
      const ph = moving ? ((dt * 1.6) % 1 + 1) % 1 : 0;
      const view = a.walk ? viewOf(cam, x, z, a.walk[0], a.walk[1]) : { side: !!a.side, mirror: false, fs: 1 };
      const blink = lidAt(t, who.i, a.ex && Array.isArray(a.ex) ? (a.ex as [At, Expr][]).map(([k]) => timeOf(ep, k)) : []);
      const fo: FrontOpts = { phase: ph, expr, mode: moving ? "stroll" : (a.mode ?? "stand"), blink, look: a.look ?? 0, facing: a.facing ?? 0,
        ...(a.wave ? { wave: Math.round(Math.sin(t * 9 + i) * 15) / 15 } : {}), ...(armK !== "none" ? { arms: armK as FrontOpts["arms"] } : {}) };
      const so: SideOpts = { phase: ph, expr, mode: moving ? "stroll" : "stand", blink, stride: view.fs } as SideOpts;
      out.places.push(person(cam, who, x + shake, y, z, view, fo, so, sc));
      if ((a.y ?? 0) < 0.3) blob(out, x, o[1] + 0.005, z, sc);
    });
    for (const e of s.fx ?? []) {
      const ta = timeOf(ep, e.at), d = e.dur ?? 0.45;
      if (t < ta || t >= ta + d) continue;
      const u = Math.round(((t - ta) / d) * 30) / 30;
      const draw = { burst: (p: never) => fxBurst(p, u), stars: (p: never) => fxStars(p, u), puff: (p: never) => fxPuff(p, u), ring: (p: never) => fxRing(p, u), note: (p: never) => fxNote(p, Math.floor(u * 3)), cloud: (p: never) => fxCloud(p, 3) }[e.k];
      out.fx.push({ key: `${e.k}${u}`, cw: 500, ch: 500, draw: draw as never, x: o[0] + e.x, y: o[1] + e.y, z: o[2] + e.z, w: e.w, h: e.w });
    }
    return out;
  }

  update(f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const si = this.shotIndex(f), s = this.ep.shots[si], fr = this.frames[si], t = f / FPS, t0 = fr.a / FPS;
    const light: Light = s.light ?? "day", L = lightOf(light), K = lookOf(light), o = SETS[s.set].o;
    const c = camAt(this.ep, si, f, fr);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.1; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    cam.layers.enable(NOINK);
    const focus = V(...c.look), dist = cam.position.distanceTo(focus);
    // sol relativo à câmera: de lado/trás-direita (az 120) e alto
    const fx0 = c.look[0] - c.pos[0], fz0 = c.look[2] - c.pos[2], n0 = Math.hypot(fx0, fz0) || 1;
    const az = THREE.MathUtils.degToRad(light === "golden" ? 20 : 125), el = THREE.MathUtils.degToRad(light === "golden" ? 9 : SETS[s.set].ext ? 48 : 62);
    const hx = (fx0 / n0) * Math.cos(az) - (fz0 / n0) * Math.sin(az), hz = (fz0 / n0) * Math.cos(az) + (fx0 / n0) * Math.sin(az);
    const sunDir = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    const Rr = THREE.MathUtils.clamp(dist * 1.2 + 6, 10, 90);
    this.sun.position.copy(focus).addScaledVector(sunDir, 200); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera; sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 10; sc.far = 450; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad; CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    const su = this.skyMat.uniforms; K.sky.c.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((d) => THREE.MathUtils.degToRad(d)); su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar * 1.4 * (s.fogK ?? 1); this.fog.near = L.fogNear * (s.fogK ?? 1); scene.fog = this.fog; scene.background = null;
    for (let i = 0; i < this.clouds.length; i++) {
      const m = this.clouds[i], a = (i / 10) * Math.PI * 2 + 0.3, d = 620 + (i % 3) * 60, w = 140 + (i % 4) * 30;
      m.position.set(cam.position.x + Math.cos(a) * d, 110 + (i % 4) * 40, cam.position.z + Math.sin(a) * d); m.scale.set(w, w / 2, 1);
      m.lookAt(cam.position.x, m.position.y, cam.position.z); (m.material as THREE.MeshBasicMaterial).map = this.cloudMaps[light][i % 4];
    }
    // enchente
    const fl = s.flood === undefined ? -1 : typeof s.flood === "number" ? s.flood : s.flood[0] + (s.flood[1] - s.flood[0]) * smooth((t - t0) / Math.max(0.5, (fr.b - fr.a) / FPS));
    this.water.visible = fl > -0.5; this.water.position.y = fl;
    // objetos
    this.rack.begin();
    for (const p of s.props ?? []) {
      if (p.from !== undefined && t < timeOf(this.ep, p.from)) continue;
      if (p.to !== undefined && t >= timeOf(this.ep, p.to)) continue;
      let y = p.y ?? 0;
      if (p.rise) { const ta = timeOf(this.ep, p.rise[0]); y += p.rise[1] + (p.rise[2] - p.rise[1]) * glide((t - ta) / 0.6); }
      const dt = t - t0, dr = p.drift ?? [0, 0, 0];
      const bob = s.flood !== undefined && p.k === "carro" ? Math.sin(t * 2 + p.x) * 0.15 : 0;
      this.rack.place(p.k, o[0] + p.x + dr[0] * dt, o[1] + y + dr[1] * dt + bob, o[2] + p.z + dr[2] * dt, p.s ?? 1, (p.yaw ?? 0) + (p.spin ?? 0) * dt, (p.roll ?? 0) + bob * 0.2, p.pitch ?? 0);
    }
    // elenco + efeitos
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const st = this.stage(s, t, t0, { pos: cam.position, right });
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    let ai = 0; const used: Actor[] = [];
    for (const p of st.places) {
      const sc2 = p.scale ?? 1;
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y + 1.1 * sc2, p.z), 3.5 * sc2))) continue;
      const a = this.actor(ai++); const [w, h, k] = p.size ?? [300, 500, 0.5];
      a.r = this.pool.req(p.key, w, h, k, p.draw); a.mesh.visible = true; a.mesh.position.set(p.x, p.y, p.z);
      a.mesh.rotation.set(0, p.yaw ?? Math.atan2(cam.position.x - p.x, cam.position.z - p.z), p.roll ?? 0);
      a.mesh.scale.set(p.mirror ? -sc2 : sc2, sc2, sc2); a.mesh.castShadow = L.actorShadow; used.push(a);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    let fi = 0; const fused: Fx[] = [];
    for (const p of st.fx) {
      const e2 = this.fx(fi++); e2.r = this.pool.req(p.key, p.cw, p.ch, 1, p.draw); e2.use(!!p.soft); e2.mesh.visible = true;
      e2.mesh.position.set(p.x, p.y, p.z);
      if (p.flat) e2.mesh.rotation.set(-Math.PI / 2, 0, p.rot ?? 0); else { e2.mesh.quaternion.copy(cam.quaternion); e2.mesh.rotateZ(p.rot ?? 0); }
      e2.mesh.scale.set(p.w, p.h, 1); fused.push(e2);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush(); for (const a of used) a.bind(); for (const e3 of fused) e3.bind();
    return { focus, shot: s, si, dist };
  }
}
export { hh, clamp01 };
