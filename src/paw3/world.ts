// Pawslated v3 piloto 1 — "Why your dog sleeps at your feet" (27/11/2026).
// Dois lugares num mundo só: o quarto (origem) e a floresta dos ancestrais (x + 1000).
// Planos guiados pelos tempos das frases (public/<pasta>/tempos.json).
import * as THREE from "three";
import { Char, toon } from "./chars";
import { Dog, BISCUIT, WOLF } from "./dog";
import { NOINK } from "./ink";

export type Frase = { k: string; t0: number; t1: number; txt: string };
export type Tempos = { total: number; frases: Frase[]; palavras: { w: string; t0: number; t1: number; k: string }[] };

export const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const sm = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const eo = (x: number) => 1 - (1 - clamp01(x)) ** 3;
export const L = (a: number, b: number, u: number) => a + (b - a) * u;
export const FX = 1000; // floresta

const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, rep?: [number, number]) => {
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h; draw(cv.getContext("2d")!);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); }
  return t;
};
const GRAD = (toon("#fff") as THREE.MeshToonMaterial).gradientMap;
const toonMap = (map: THREE.Texture, color = "#ffffff") => new THREE.MeshToonMaterial({ map, color, gradientMap: GRAD });
export const M = (g: THREE.BufferGeometry, m: THREE.Material, p: THREE.Vector3, cast = true) => { const x = new THREE.Mesh(g, m); x.position.copy(p); x.castShadow = cast; x.receiveShadow = true; return x; };
export const B = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
export const RB = (w: number, h: number, d: number, r: number) => { const g = new THREE.BoxGeometry(w, h, d, 6, 6, 6); const p = g.attributes.position; const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const hx = w / 2 - r, hy = h / 2 - r, hz = d / 2 - r; const c = V(Math.max(-hx, Math.min(hx, v.x)), Math.max(-hy, Math.min(hy, v.y)), Math.max(-hz, Math.min(hz, v.z))); const n = v.clone().sub(c); if (n.length() > 1e-6) { n.setLength(r); v.copy(c.add(n)); } p.setXYZ(i, v.x, v.y, v.z); }
  g.computeVertexNormals(); return g; };

const woodTex = canvasTex(512, 512, (g) => { g.fillStyle = "#9A6440"; g.fillRect(0, 0, 512, 512); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#8E5B39" : "#A56C46"; g.fillRect(0, i * 64, 512, 62); g.fillStyle = "rgba(60,30,15,.35)"; g.fillRect(0, i * 64 + 62, 512, 2); } }, [3, 3]);
const wallTex = canvasTex(256, 256, (g) => { g.fillStyle = "#3D4F86"; g.fillRect(0, 0, 256, 256); g.fillStyle = "#43568F"; for (let x = 0; x < 256; x += 32) g.fillRect(x, 0, 14, 256); }, [4, 2]);
const quiltTex = canvasTex(256, 256, (g) => { g.fillStyle = "#3F7FD0"; g.fillRect(0, 0, 256, 256); g.strokeStyle = "#2F64AE"; g.lineWidth = 6; for (let i = 0; i <= 256; i += 64) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(256, i); g.stroke(); } g.fillStyle = "#F2C94C"; for (let x = 32; x < 256; x += 64) for (let y = 32; y < 256; y += 64) { g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); } }, [2, 2]);
const skyTex = canvasTex(512, 512, (g) => { const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#0E1640"); gr.addColorStop(1, "#2B3B7A"); g.fillStyle = gr; g.fillRect(0, 0, 512, 512); g.fillStyle = "#fff"; for (let i = 0; i < 70; i++) { g.globalAlpha = 0.4 + (i % 5) / 8; g.beginPath(); g.arc((i * 137) % 512, (i * 71) % 400, i % 7 ? 1.4 : 2.6, 0, 7); g.fill(); } });
const unlit = (map: THREE.Texture) => new THREE.MeshBasicMaterial({ map, toneMapped: false });
export const glow = (c: string) => new THREE.MeshBasicMaterial({ color: c, toneMapped: false });

export type Shot = { k: string; a: number; b: number; set: "room" | "forest"; cam: [THREE.Vector3, THREE.Vector3]; look: [THREE.Vector3, THREE.Vector3]; fov: number; focus: () => THREE.Vector3 };

export class PawWorld {
  root = new THREE.Group();
  dog = new Dog(BISCUIT);
  owner = new Char({ shirt: "#E9A23B", skin: "#F3C9A3", hat: "hair", hair: "#3B2416" });
  ownerG = new THREE.Group();
  bump = new THREE.Mesh();
  wolves: Dog[] = [];
  lone = new Dog(WOLF);
  eyes = new THREE.Group();
  hall = new THREE.Mesh();
  doorLeaf = new THREE.Group();
  tripod = new THREE.Group();
  rec = new THREE.Mesh();
  lamp = new THREE.PointLight("#FFB25C", 14, 9, 1.4);
  moon = new THREE.DirectionalLight("#B4C6FF", 2.0);
  hemi = new THREE.HemisphereLight("#B9C6FF", "#6A4A3A", 1.2);
  fMoon = new THREE.DirectionalLight("#AFC2FF", 1.6);
  shots: Shot[] = [];
  T: Tempos;
  constructor(T: Tempos) {
    this.T = T;
    this.buildRoom();
    this.buildForest();
    this.root.add(this.hemi);
    this.makeShots();
  }
  fr(k: string) { return this.T.frases.find((f) => f.k === k)!; }

  buildRoom() {
    const r = new THREE.Group();
    // piso, paredes
    r.add(M(new THREE.PlaneGeometry(12, 10).rotateX(-Math.PI / 2), toonMap(woodTex), V(0, 0, 0), false));
    const wall = toonMap(wallTex);
    r.add(M(new THREE.PlaneGeometry(12, 4.2), wall, V(0, 2.1, -2.4), false));
    const side = M(new THREE.PlaneGeometry(10, 4.2), wall, V(-3.4, 2.1, 0), false); side.rotation.y = Math.PI / 2; r.add(side);
    // parede da porta (x = 3.4) com vão
    const dw = toonMap(wallTex);
    for (const [z, w] of [[-1.85, 1.1], [1.55, 4.3]] as [number, number][]) { const p = M(new THREE.PlaneGeometry(w, 4.2), dw, V(3.4, 2.1, z), false); p.rotation.y = -Math.PI / 2; r.add(p); }
    const top = M(new THREE.PlaneGeometry(1.1, 1.8), dw, V(3.4, 3.3, -0.75), false); top.rotation.y = -Math.PI / 2; r.add(top);
    // rodapé
    r.add(M(B(12, 0.14, 0.05), toon("#F3E6D2"), V(0, 0.07, -2.37)));
    // janela com lua
    const win = new THREE.Group();
    win.add(M(new THREE.PlaneGeometry(1.5, 1.3), unlit(skyTex), V(0, 0, 0.0), false));
    const moon = M(new THREE.CircleGeometry(0.17, 32), glow("#FFF6D8"), V(0.35, 0.3, 0.01), false); moon.layers.set(NOINK); win.add(moon);
    const fr = toon("#F3E6D2");
    for (const [x, y, w, h] of [[0, 0.68, 1.62, 0.08], [0, -0.68, 1.62, 0.1], [-0.78, 0, 0.08, 1.4], [0.78, 0, 0.08, 1.4], [0, 0, 0.05, 1.3], [0, 0, 1.5, 0.05]]) win.add(M(B(w, h, 0.08), fr, V(x, y, 0.03)));
    win.position.set(0.2, 2.3, -2.38); r.add(win);
    // cortinas
    for (const s of [-1, 1]) r.add(M(RB(0.4, 1.9, 0.1, 0.04), toon("#C75B6A"), V(0.2 + s * 1.0, 2.15, -2.28)));
    // cama: cabeceira em x = -1.9, pé em x = +1.4
    const wood = toon("#7A4A2C");
    r.add(M(RB(0.14, 1.5, 1.95, 0.05), wood, V(-1.95, 0.75, 0)));
    r.add(M(RB(0.12, 0.9, 1.95, 0.05), wood, V(1.55, 0.45, 0)));
    r.add(M(RB(3.4, 0.3, 1.9, 0.05), wood, V(-0.2, 0.3, 0)));
    r.add(M(RB(3.35, 0.24, 1.85, 0.1), toon("#F4F1EA"), V(-0.2, 0.55, 0)));
    // travesseiro
    r.add(M(RB(0.55, 0.2, 1.0, 0.09), toon("#FFFFFF"), V(-1.55, 0.74, 0)));
    // colcha (cobre do peito até o pé) e o volume do corpo por baixo
    const quilt = M(RB(2.55, 0.12, 1.95, 0.05), toonMap(quiltTex), V(0.1, 0.72, 0)); r.add(quilt);
    this.bump = M(new THREE.CapsuleGeometry(0.3, 1.5, 6, 16), toonMap(quiltTex), V(-0.3, 0.74, 0));
    this.bump.rotation.z = Math.PI / 2; this.bump.scale.set(1, 1, 0.55); r.add(this.bump);
    // dona: só a cabeça e o ombro fora da colcha
    this.owner.body.visible = false; for (const l of [this.owner.armL, this.owner.armR, this.owner.legL, this.owner.legR]) l.root.visible = false;
    this.ownerG.add(this.owner.root);
    this.owner.root.rotation.set(0, 0, Math.PI / 2);   // deitada, cabeça para -x
    this.owner.root.position.set(-0.62, 0.8, 0);
    this.owner.root.scale.setScalar(0.62);
    r.add(this.ownerG);
    // criado-mudo + abajur
    r.add(M(RB(0.6, 0.6, 0.55, 0.05), toon("#B07A4E"), V(-2.45, 0.3, -1.4)));
    r.add(M(new THREE.CylinderGeometry(0.07, 0.11, 0.3, 16), toon("#E8D9C0"), V(-2.45, 0.75, -1.4)));
    const shade = M(new THREE.CylinderGeometry(0.16, 0.26, 0.28, 24, 1, true), glow("#FFD9A0"), V(-2.45, 1.02, -1.4), false); r.add(shade);
    this.lamp.position.set(-2.4, 1.05, -1.2); this.lamp.castShadow = true; this.lamp.shadow.mapSize.set(1024, 1024); this.lamp.shadow.bias = -0.003; this.lamp.shadow.normalBias = 0.03; r.add(this.lamp);
    // tapete
    const rug = M(new THREE.CircleGeometry(1.1, 40).rotateX(-Math.PI / 2), toon("#E58B7A"), V(2.0, 0.012, 1.3), false); rug.scale.set(1.4, 1, 1); r.add(rug);
    // porta: batente + folha entreaberta + corredor que acende
    const jamb = toon("#F3E6D2");
    for (const [z, h, y, d] of [[-1.3, 2.4, 1.2, 0.08], [-0.2, 2.4, 1.2, 0.08]] as number[][]) r.add(M(B(0.12, h, d), jamb, V(3.38, y, z)));
    r.add(M(B(0.12, 0.1, 1.2), jamb, V(3.38, 2.42, -0.75)));
    const leaf = M(RB(0.06, 2.3, 1.0, 0.02), toon("#B98258"), V(0, 1.15, 0.5)); this.doorLeaf.add(leaf);
    const knob = M(new THREE.SphereGeometry(0.05, 12, 10), toon("#F2C230"), V(-0.06, 1.1, 0.85)); this.doorLeaf.add(knob);
    this.doorLeaf.position.set(3.35, 0, -1.25); this.doorLeaf.rotation.y = 1.1; r.add(this.doorLeaf);
    this.hall = M(new THREE.PlaneGeometry(1.1, 2.4), new THREE.MeshBasicMaterial({ color: "#161A30", toneMapped: false }), V(3.6, 1.2, -0.75), false);
    this.hall.rotation.y = -Math.PI / 2; this.hall.layers.set(NOINK); r.add(this.hall);
    // câmera no tripé (a pesquisa)
    const tp = toon("#2A2A33");
    for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; const leg = M(new THREE.CylinderGeometry(0.02, 0.02, 1.3, 8), tp, V(Math.cos(a) * 0.22, 0.6, Math.sin(a) * 0.22)); leg.rotation.set(Math.sin(a) * 0.32, 0, -Math.cos(a) * 0.32); this.tripod.add(leg); }
    this.tripod.add(M(RB(0.34, 0.22, 0.22, 0.04), toon("#33343C"), V(0, 1.28, 0)));
    const lens = M(new THREE.CylinderGeometry(0.08, 0.09, 0.16, 20), toon("#1E1E24"), V(0, 1.28, -0.17)); lens.rotation.x = Math.PI / 2; this.tripod.add(lens);
    this.rec = M(new THREE.SphereGeometry(0.03, 12, 10), glow("#FF3B3B"), V(0.12, 1.42, 0.0), false); this.rec.layers.set(NOINK); this.tripod.add(this.rec);
    this.tripod.position.set(2.6, 0, 1.9); this.tripod.lookAt(1.3, 0, 0.15); this.tripod.rotateY(Math.PI); r.add(this.tripod);
    // cachorro deitado no pé da cama, de costas para a dona, de frente para a porta (+x)
    this.dog.root.position.set(0.95, 0.66, 0.15); this.dog.root.rotation.y = Math.PI / 2;
    r.add(this.dog.root);
    // luz da lua pela janela
    this.moon.position.set(1.2, 6, -6); this.moon.target.position.set(0, 0, 0.5);
    this.moon.castShadow = true; this.moon.shadow.mapSize.set(2048, 2048);
    const sc = this.moon.shadow.camera as THREE.OrthographicCamera; sc.left = -5; sc.right = 5; sc.top = 5; sc.bottom = -5; sc.far = 20;
    this.moon.shadow.bias = -0.0008; this.moon.shadow.normalBias = 0.02;
    r.add(this.moon, this.moon.target);
    this.root.add(r);
  }

  buildForest() {
    const f = new THREE.Group(); f.position.x = FX;
    f.add(M(new THREE.CircleGeometry(40, 48).rotateX(-Math.PI / 2), toon("#2E5A4A"), V(0, 0, 0), false));
    const sky = M(new THREE.PlaneGeometry(120, 60), unlit(skyTex), V(0, 18, -30), false); sky.layers.set(NOINK); f.add(sky);
    const moon = M(new THREE.CircleGeometry(2.2, 40), glow("#FFF6D8"), V(6, 14, -29), false); moon.layers.set(NOINK); f.add(moon);
    const leaf = [toon("#1F4A3C"), toon("#28594A"), toon("#183B31")], trunk = toon("#4A3326");
    let s = 7;
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    for (let i = 0; i < 70; i++) {
      const a = rnd() * Math.PI * 2, d = 4 + rnd() * 18;
      const x = Math.cos(a) * d, z = Math.sin(a) * d - 2;
      if (x > -3.5 && x < 7.5 && z > -2.6) continue;
      const h = 2.5 + rnd() * 3.5, g = new THREE.Group();
      g.add(M(new THREE.CylinderGeometry(0.12, 0.16, 0.9, 8), trunk, V(0, 0.45, 0)));
      for (let k = 0; k < 3; k++) g.add(M(new THREE.ConeGeometry(1.1 - k * 0.25, h * 0.45, 9), leaf[(i + k) % 3], V(0, 0.9 + k * h * 0.22 + h * 0.2, 0)));
      g.position.set(x, 0, z); f.add(g);
    }
    // arbustos
    for (let i = 0; i < 14; i++) { const b = M(new THREE.SphereGeometry(0.5 + rnd() * 0.4, 16, 12), leaf[i % 3], V(-6 + rnd() * 12, 0.25, -4 - rnd() * 3)); b.scale.y = 0.7; f.add(b); }
    // matilha dormindo amontoada
    const spots: [number, number, number, number][] = [[0, 0, 0.3, 0.2], [0.55, 0.15, -2.2, 0.6], [-0.5, 0.25, 2.4, 0.5], [0.1, -0.55, 1.2, 0.4], [-0.2, 0.62, -0.8, 0.3]];
    for (const [x, z, ry, sc] of spots) {
      const w = new Dog({ ...WOLF, scale: 1.05 + sc * 0.2 }); w.root.position.set(x, 0, z); w.root.rotation.y = ry; f.add(w.root); this.wolves.push(w);
    }
    // o que dorme sozinho, longe
    this.lone.root.position.set(4.4, 0, 0.9); this.lone.root.rotation.y = -1.9; f.add(this.lone.root);
    // olhos no escuro (aparecem em "danger")
    for (const [x, z] of [[5.6, -0.6], [6.4, 0.6], [3.0, -1.6]]) for (const dx of [-0.09, 0.09]) { const e = M(new THREE.SphereGeometry(0.045, 10, 8), glow("#FFE45C"), V(x + dx, 0.55, z), false); e.layers.set(NOINK); this.eyes.add(e); }
    f.add(this.eyes);
    this.fMoon.position.set(FX + 6, 12, -10); this.fMoon.target.position.set(FX, 0, 0);
    this.fMoon.castShadow = true; this.fMoon.shadow.mapSize.set(2048, 2048);
    const sc = this.fMoon.shadow.camera as THREE.OrthographicCamera; sc.left = -8; sc.right = 8; sc.top = 8; sc.bottom = -8; sc.far = 40;
    this.root.add(f, this.fMoon, this.fMoon.target);
  }

  makeShots() {
    const d = () => this.dog.head.getWorldPosition(new THREE.Vector3());
    const own = () => this.owner.head.getWorldPosition(new THREE.Vector3());
    const pile = () => V(FX, 0.4, 0);
    const S = (k: string, set: "room" | "forest", c0: THREE.Vector3, c1: THREE.Vector3, l0: THREE.Vector3, l1: THREE.Vector3, fov: number, focus: () => THREE.Vector3, a?: number, b?: number): Shot => {
      const fr = this.fr(k); return { k, set, a: a ?? fr.t0 - 0.06, b: b ?? 0, cam: [c0, c1], look: [l0, l1], fov, focus };
    };
    const DH = V(1.33, 0.98, 0.15);
    const sh: Shot[] = [
      S("hook", "room", V(2.75, 1.55, 1.55), V(2.55, 1.45, 1.35), V(1.3, 0.95, 0.15), V(1.3, 0.97, 0.15), 34, d, 0),
      S("best", "room", V(3.3, 2.5, 0.9), V(3.0, 2.3, 0.6), V(-0.6, 0.75, 0), V(-0.6, 0.75, 0), 46, d),
      S("anc", "forest", V(FX + 0.5, 7, 9), V(FX + 0.3, 3.0, 5.5), V(FX, 0.6, 0), V(FX, 0.4, 0), 38, pile),
      S("close", "forest", V(FX + 2.8, 2.4, 4.6), V(FX - 2.0, 2.3, 4.8), V(FX, 0.3, 0), V(FX, 0.3, 0), 30, pile),
      S("alone", "forest", V(FX + 3.4, 1.2, 4.4), V(FX + 3.8, 1.0, 3.7), V(FX + 4.4, 0.4, 1.0), V(FX + 4.6, 0.45, 0.6), 34, () => this.lone.head.getWorldPosition(new THREE.Vector3())),
      S("pack", "room", V(3.2, 2.0, -0.7), V(3.0, 2.25, -0.4), V(-0.8, 0.8, 0), V(-0.8, 0.8, 0), 46, own),
      S("but", "room", V(2.6, 1.6, 1.25), V(2.5, 1.55, 1.15), DH, DH, 30, d),
      S("film", "room", V(2.3, 2.1, 3.0), V(2.1, 2.0, 2.7), V(1.3, 0.9, 0.15), V(1.3, 0.9, 0.15), 34, d),
      S("woke", "room", V(3.0, 1.9, -1.3), V(2.9, 1.85, -1.2), DH, DH, 36, d),
      S("cycle", "room", V(2.9, 2.3, -0.8), V(2.8, 2.25, -0.7), DH, DH, 36, d),
      S("near", "room", V(3.1, 1.9, 0.8), V(3.0, 1.8, 0.6), V(-0.3, 0.8, 0), V(-0.3, 0.8, 0), 42, d),
      S("roll", "room", V(2.8, 1.9, 0.9), V(2.6, 1.85, 0.75), V(-1.3, 0.85, 0), V(-1.3, 0.85, 0), 40, own),
      S("noise", "room", V(-1.6, 1.9, 0.8), V(-1.4, 1.8, 0.6), V(3.0, 1.0, -0.7), V(3.0, 1.0, -0.7), 40, d),
      S("feet", "room", V(-0.6, 1.75, 0.75), V(-0.4, 1.7, 0.6), V(3.3, 1.0, -0.7), V(3.3, 1.0, -0.7), 42, () => V(3.3, 1.0, -0.6)),
      S("clingy", "room", V(2.8, 1.7, -0.7), V(2.7, 1.65, -0.6), DH, DH, 34, d),
      S("keep", "room", V(3.2, 2.3, 0.6), V(3.25, 3.3, 1.2), V(-0.5, 0.8, 0), V(-0.8, 1.2, -0.6), 46, d),
      S("cta", "room", V(2.55, 1.45, 1.35), V(2.75, 1.55, 1.55), V(1.3, 0.97, 0.15), V(1.3, 0.95, 0.15), 34, d),
    ];
    for (let i = 0; i < sh.length; i++) sh[i].b = i + 1 < sh.length ? sh[i + 1].a : this.T.total + 1;
    this.shots = sh;
  }
  shotAt(t: number) { return this.shots.find((s) => t >= s.a && t < s.b) ?? this.shots[this.shots.length - 1]; }

  update(f: number, cam: THREE.PerspectiveCamera) {
    const t = f / 30, s = this.shotAt(t), u = (t - s.a) / Math.max(0.1, s.b - s.a);
    const k = sm(u);
    cam.position.lerpVectors(s.cam[0], s.cam[1], k);
    // tremida de impacto curta no início do plano
    const sh = Math.max(0, 1 - (t - s.a) / 0.25) * (["alone", "noise", "woke"].includes(s.k) ? 0.03 : 0);
    cam.position.x += Math.sin(t * 90) * sh; cam.position.y += Math.cos(t * 77) * sh;
    cam.lookAt(new THREE.Vector3().lerpVectors(s.look[0], s.look[1], k));
    cam.fov = s.fov; cam.updateProjectionMatrix();
    const fr = (key: string) => this.fr(key);
    const inK = (key: string) => s.k === key;
    // ---- cachorro (quarto)
    const p: Parameters<Dog["pose"]>[0] = { t, lie: 1, headUp: 0.85, wag: 0.15, ears: 0, eyes: 1, turn: 0 };
    if (inK("hook")) { p.turn = -0.5 * eo((t - 0.3) / 0.6); p.wag = 0.5; }
    if (inK("best")) { p.wag = 0.8; p.turn = -0.2; }
    if (inK("pack")) { p.turn = -1.2 * sm((t - fr("pack").t0 - 0.6) / 0.6); p.wag = 0.6; }
    if (inK("but")) { p.turn = -0.6; p.tilt = 0.35 * sm((t - fr("but").t0) / 0.5); p.ears = 0.3; }
    if (inK("film")) { p.headUp = 0; p.eyes = 0; p.wag = 0; }
    if (inK("woke")) { const fw = fr("woke"); const ph = ((t - fw.t0) * 2.6) % 1; const up = ph < 0.55; p.headUp = up ? 1 : 0.05; p.eyes = up ? 1 : 0; p.ears = up ? 0.6 : 0; p.turn = up ? -0.3 : 0; p.wag = 0; }
    if (inK("cycle")) { const fc = fr("cycle"), wd = this.T.palavras.filter((w) => w.k === "cycle"); const awake = wd.find((w) => /Five/.test(w.w))!.t0; const over = wd.find((w) => /Over/.test(w.w))!.t0;
      const st = t < awake ? 0 : t < over ? 1 : ((t - over) * 2.2) % 1 < 0.5 ? 1 : 0; p.headUp = st ? 1 : 0.05; p.eyes = st; p.ears = st * 0.4; p.wag = 0; void fc; }
    if (inK("near")) { const fn = fr("near"); const c = sm((t - fn.t0 - 0.4) / 1.6); this.dog.root.position.x = L(0.95, 0.35, c); p.lie = 1 - Math.sin(c * Math.PI) * 0.6; p.walk = c > 0 && c < 1 ? t * 1.4 : undefined; p.turn = -0.2; }
    else this.dog.root.position.x = inK("roll") || inK("noise") ? 0.35 : 0.95;
    if (inK("roll")) { const fr2 = fr("roll"); const c = sm((t - fr2.t0 - 0.9) / 0.5); p.ears = c; p.eyes = 0.4 + 0.6 * c; p.headUp = 0.4 + 0.6 * c; p.turn = -1.6 * c; }
    if (inK("noise")) { const hw = this.T.palavras.find((w) => w.k === "noise" && /hallway/.test(w.w))!; const c = eo((t - hw.t0 + 0.1) / 0.18); p.headUp = 0.05 + 0.95 * c; p.eyes = c; p.ears = c; p.turn = 0.15 * c; p.worried = 0.2 * c; }
    if (inK("feet")) { p.headUp = 1; p.turn = 0.05; p.ears = 0.3; }
    if (inK("clingy")) { p.turn = 0; p.worried = 0.6; p.wag = 0.3; }
    if (inK("keep")) { p.headUp = 0.6; p.eyes = sm((fr("keep").t1 - t) / 0.8); p.wag = 0.1; }
    if (inK("cta")) { p.turn = -0.55; p.wag = 0.9; p.tilt = 0.2; }
    this.dog.pose(p);
    // ---- dona (dorme; vira em "roll")
    let roll = 0;
    if (inK("roll")) roll = sm((t - fr("roll").t0 - 0.4) / 0.8);
    this.owner.pose({ t, face: "neutral", blink: 1, tilt: 0 });
    this.owner.head.rotation.x = roll * 0.9;
    this.bump.rotation.x = roll * 0.5; this.bump.position.z = roll * -0.12;
    // ---- corredor e porta
    const noise = inK("noise") ? sm((t - fr("noise").t0) / 0.3) : 0;
    (this.hall.material as THREE.MeshBasicMaterial).color.set(noise > 0 ? "#F7C873" : "#161A30");
    this.doorLeaf.rotation.y = 1.1 + noise * 0.12 * Math.sin(t * 20) * (1 - sm((t - fr("noise").t0 - 0.6) / 0.4));
    this.tripod.visible = inK("film") || inK("woke") || inK("cycle");
    this.rec.visible = Math.floor(t * 2) % 2 === 0;
    // ---- floresta
    this.wolves.forEach((w, i) => w.pose({ t: t + i * 0.7, lie: 1, curl: 0.6, headUp: 0, eyes: 0, wag: 0, breath: 1.3 }));
    const alone = inK("alone") ? sm((t - fr("alone").t0) / 0.5) : 0;
    this.lone.pose({ t, lie: 1, headUp: 0.4 + 0.6 * alone, eyes: alone > 0.1 ? 1 : 0, ears: alone, worried: alone, wag: 0 });
    this.eyes.visible = inK("alone");
    this.eyes.children.forEach((e, i) => { e.visible = alone > 0.2 + i * 0.03 && Math.floor(t * 3 + i) % 7 !== 0; });
    // luzes por lugar
    const forest = s.set === "forest";
    this.moon.visible = !forest; this.lamp.visible = !forest; this.fMoon.visible = forest;
    this.lamp.intensity = inK("keep") ? 17 : 14;
    this.hemi.intensity = forest ? (inK("alone") ? 0.6 : 1.0) : 1.35;
    return s;
  }
}
