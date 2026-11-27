// Pawslated v3 ep3 — "Your dog isn't being dramatic on New Year's Eve" (27/11/2026).
// Sala nova: sofá, janela grande com fogos lá fora (explosões de partículas + clarão colorido na sala), toca/caminha.
// Fatos: Blackwell, Bradshaw & Casey (2013) Appl. Anim. Behav. Sci.: quase metade dos donos relata sinal de medo de
// barulhos como fogos; Riemer (2019) PLoS One: 52% afetados ao menos em parte por medo de fogos.
import * as THREE from "three";
import { Char, toon } from "./chars";
import { Dog } from "./dog";
import { NOINK } from "./ink";
import { PawWorld, Tempos, Shot, V, sm, eo, M, RB, glow } from "./world";

const cTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, rep?: [number, number]) => {
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h; draw(cv.getContext("2d")!);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); }
  return t;
};
const GRAD = (toon("#fff") as THREE.MeshToonMaterial).gradientMap;
const tm = (map: THREE.Texture) => new THREE.MeshToonMaterial({ map, color: "#fff", gradientMap: GRAD });
const floorT = cTex(512, 512, (g) => { g.fillStyle = "#B57A4E"; g.fillRect(0, 0, 512, 512); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#A86F45" : "#BF8556"; g.fillRect(0, i * 64, 512, 62); g.fillStyle = "rgba(60,30,15,.3)"; g.fillRect(0, i * 64 + 62, 512, 2); } }, [3, 3]);
const wallT = cTex(256, 256, (g) => { g.fillStyle = "#5E4A8A"; g.fillRect(0, 0, 256, 256); g.fillStyle = "#664F94"; for (let y = 0; y < 256; y += 64) for (let x = 0; x < 256; x += 64) { g.beginPath(); g.arc(x + (y % 128 ? 32 : 0), y + 32, 6, 0, 7); g.fill(); } }, [5, 3]);
const skyT = cTex(512, 512, (g) => { const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#0B1033"); gr.addColorStop(1, "#28356E"); g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
  g.fillStyle = "#141A3E"; for (let i = 0; i < 9; i++) { const x = i * 60, w = 40 + (i * 37) % 30, h = 90 + (i * 53) % 120; g.fillRect(x, 512 - h, w, h); g.fillStyle = "#FFD98A"; for (let k = 0; k < 6; k++) g.fillRect(x + 6 + (k % 2) * 16, 512 - h + 12 + Math.floor(k / 2) * 24, 8, 10); g.fillStyle = "#141A3E"; } });
const PAL = ["#FF5D73", "#FFD84A", "#5CE1FF", "#B98CFF", "#7CFF6B", "#FF9A3C"];

type Burst = { g: THREE.Group; t0: number; col: string; pos: THREE.Vector3; dirs: THREE.Vector3[] };

export class FireworksWorld extends PawWorld {
  lr = new THREE.Group();
  ownerS!: Char;
  bursts: Burst[] = [];
  flash = new THREE.PointLight("#ffffff", 0, 12, 1.3);
  warm = new THREE.PointLight("#FFB25C", 12, 9, 1.4);
  den = new THREE.Group();
  phone = new THREE.Group();
  rings: THREE.Mesh[] = [];
  earRings: THREE.Mesh[] = [];
  bowl = new THREE.Group();
  constructor(T: Tempos) {
    super(T);
    // esconde o quarto e a floresta do ep1
    this.dog.root.parent!.visible = false;
    this.wolves[0].root.parent!.visible = false;
    this.moon.visible = false; this.fMoon.visible = false;
    this.buildLiving(T);
    this.makeShots3();
  }
  makeShots() { this.shots = []; }

  buildLiving(T: Tempos) {
    const r = this.lr; this.root.add(r);
    r.add(M(new THREE.PlaneGeometry(10, 10).rotateX(-Math.PI / 2), tm(floorT), V(0, 0, 0), false));
    const wm = tm(wallT);
    // parede do fundo com janela (x -0.5..1.7, y 0.8..2.6)
    const wall = (w: number, h: number, x: number, y: number) => r.add(M(new THREE.PlaneGeometry(w, h), wm, V(x, y, -2.3), false));
    wall(2.6, 4.2, -1.8, 2.1); wall(3.6, 4.2, 3.5, 2.1); wall(2.2, 0.8, 0.6, 0.4); wall(2.2, 1.6, 0.6, 3.4);
    const side = M(new THREE.PlaneGeometry(10, 4.2), wm, V(-3.1, 2.1, 0), false); side.rotation.y = Math.PI / 2; r.add(side);
    const fr = toon("#F5EBDD");
    for (const [x, y, w, h] of [[0.6, 2.62, 2.32, 0.1], [0.6, 0.78, 2.32, 0.12], [-0.53, 1.7, 0.1, 1.9], [1.73, 1.7, 0.1, 1.9], [0.6, 1.7, 0.06, 1.8]]) r.add(M(RB(w, h, 0.12, 0.02), fr, V(x, y, -2.25)));
    r.add(M(RB(2.5, 0.08, 0.3, 0.03), fr, V(0.6, 0.72, -2.15)));
    // céu e cidade lá fora + fogos
    const sky = M(new THREE.PlaneGeometry(14, 9), new THREE.MeshBasicMaterial({ map: skyT, toneMapped: false }), V(0.6, 2.0, -7), false); sky.layers.set(NOINK); r.add(sky);
    // cortinas
    for (const s of [-1, 1]) r.add(M(RB(0.45, 2.3, 0.12, 0.05), toon("#E8A33D"), V(0.6 + s * 1.38, 1.7, -2.1)));
    // sofá (de frente para +z), encostado na parede da esquerda/fundo
    const sofa = toon("#2F8F8A"), sofa2 = toon("#3BA7A1");
    r.add(M(RB(2.1, 0.42, 0.9, 0.12), sofa, V(-1.6, 0.25, -1.55)));
    r.add(M(RB(2.1, 0.85, 0.28, 0.12), sofa, V(-1.6, 0.75, -1.95)));
    for (const x of [-2.65, -0.55]) r.add(M(RB(0.26, 0.65, 0.9, 0.1), sofa, V(x, 0.42, -1.55)));
    for (const x of [-2.1, -1.1]) r.add(M(RB(0.92, 0.18, 0.78, 0.08), sofa2, V(x, 0.53, -1.5)));
    r.add(M(RB(0.45, 0.35, 0.14, 0.07), toon("#FFD84A"), V(-2.3, 0.82, -1.78)));
    // abajur de pé
    r.add(M(new THREE.CylinderGeometry(0.025, 0.025, 1.5, 8), toon("#2A2730"), V(-2.75, 0.75, -2.0)));
    r.add(M(new THREE.CylinderGeometry(0.18, 0.28, 0.32, 24, 1, true), glow("#FFD9A0"), V(-2.75, 1.6, -2.0), false));
    this.warm.position.set(-2.6, 1.5, -1.7); this.warm.castShadow = true; this.warm.shadow.bias = -0.003; this.warm.shadow.normalBias = 0.03; r.add(this.warm);
    // tapete
    const rug = M(new THREE.CircleGeometry(1.2, 40).rotateX(-Math.PI / 2), toon("#E9C46A"), V(0.4, 0.012, 0.1), false); rug.scale.set(1.3, 1, 1); r.add(rug);
    const rug2 = M(new THREE.RingGeometry(0.95, 1.05, 40).rotateX(-Math.PI / 2), toon("#E07A5F"), V(0.4, 0.014, 0.1), false); rug2.scale.set(1.3, 1, 1); r.add(rug2);
    // toca: caixa com manta por cima, abertura para +z
    const crate = toon("#8C5A3C");
    this.den.add(M(RB(0.95, 0.06, 0.85, 0.02), crate, V(0, 0.03, 0)));
    for (const x of [-0.46, 0.46]) this.den.add(M(RB(0.05, 0.75, 0.85, 0.02), crate, V(x, 0.4, 0)));
    this.den.add(M(RB(0.95, 0.75, 0.05, 0.02), crate, V(0, 0.4, -0.42)));
    const blanket = M(RB(1.1, 0.08, 1.0, 0.04), toon("#7A5BD6"), V(0, 0.8, 0)); this.den.add(blanket);
    for (const x of [-0.53, 0.53]) { const d = M(RB(0.05, 0.6, 0.95, 0.02), toon("#7A5BD6"), V(x, 0.5, 0)); this.den.add(d); }
    this.den.add(M(RB(0.8, 0.12, 0.7, 0.06), toon("#F2E6D8"), V(0, 0.1, 0.02)));
    this.den.position.set(2.1, 0, -1.2); r.add(this.den);
    // potinho de petisco
    this.bowl.add(M(new THREE.CylinderGeometry(0.16, 0.12, 0.08, 24), toon("#FF6B5E"), V(0, 0.04, 0)));
    for (let i = 0; i < 5; i++) this.bowl.add(M(new THREE.SphereGeometry(0.035, 8, 6), toon("#C98A4B"), V(-0.06 + (i % 3) * 0.05, 0.09, -0.03 + (i % 2) * 0.05)));
    r.add(this.bowl);
    // celular com ondas de som
    this.phone.add(M(RB(0.09, 0.17, 0.015, 0.01), toon("#1E1E24"), V(0, 0, 0)));
    const scr = M(new THREE.PlaneGeometry(0.075, 0.15), glow("#7FB8FF"), V(0, 0, 0.009), false); scr.layers.set(NOINK); this.phone.add(scr);
    for (let i = 0; i < 3; i++) { const rg = M(new THREE.TorusGeometry(0.1, 0.008, 6, 32), glow("#B6F23C"), V(0, 0, 0.02), false); rg.layers.set(NOINK); this.phone.add(rg); this.rings.push(rg); }
    // ondas no ouvido (cena "ears")
    for (let i = 0; i < 4; i++) { const rg = M(new THREE.TorusGeometry(0.2, 0.012, 6, 40), glow("#FFD84A"), V(0, 0, 0), false); rg.layers.set(NOINK); r.add(rg); this.earRings.push(rg); }
    // dona
    this.ownerS = new Char({ shirt: "#E25D6A", skin: "#F3C9A3", hat: "bun", hair: "#3B2416" });
    r.add(this.ownerS.root);
    // cachorro passa para a sala
    r.add(this.dog.root);
    // luz: lua azul fria pela janela + clarão dos fogos
    const moon = new THREE.DirectionalLight("#AFC2FF", 1.3); moon.position.set(1.5, 5, -6); moon.target.position.set(0, 0, 0); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048);
    const sc = moon.shadow.camera as THREE.OrthographicCamera; sc.left = -5; sc.right = 5; sc.top = 5; sc.bottom = -5; sc.far = 20; moon.shadow.normalBias = 0.02;
    r.add(moon, moon.target);
    this.flash.position.set(0.6, 1.8, -1.6); r.add(this.flash);
    // fogos: explosões lá fora (gerados pelos tempos)
    const fr0 = (k: string) => T.frases.find((f) => f.k === k)!;
    const times: number[] = [];
    if (fr0("good") && fr0("night")) {
      for (let t = 0.15; t < fr0("good").t0 - 0.3; t += 0.9) times.push(t);
      for (let t = fr0("night").t0; t < T.total; t += 0.75) times.push(t);
    }
    let seed = 11; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    times.forEach((t0, i) => {
      const g = new THREE.Group(); const col = PAL[i % PAL.length];
      const pos = V(-0.6 + rnd() * 2.6, 1.7 + rnd() * 1.6, -5.0);
      const dirs: THREE.Vector3[] = [];
      const mat = glow(col);
      for (let k = 0; k < 36; k++) { const d = V(rnd() - 0.5, rnd() - 0.5, (rnd() - 0.5) * 0.3).normalize(); dirs.push(d); const m = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 5), mat); m.layers.set(NOINK); g.add(m); }
      g.position.copy(pos); r.add(g);
      this.bursts.push({ g, t0: t0 + rnd() * 0.3, col, pos, dirs });
    });
  }

  makeShots3() {
    const d = () => this.dog.head.getWorldPosition(new THREE.Vector3());
    const o = () => this.ownerS.head.getWorldPosition(new THREE.Vector3());
    const S = (k: string, c0: THREE.Vector3, c1: THREE.Vector3, l0: THREE.Vector3, l1: THREE.Vector3, fov: number, focus: () => THREE.Vector3, a?: number): Shot => {
      const fr = this.fr(k); return { k, set: "room", a: a ?? fr.t0 - 0.06, b: 0, cam: [c0, c1], look: [l0, l1], fov, focus };
    };
    const DW = V(0.55, 0.5, -0.75); // cachorro perto da janela
    const sh: Shot[] = [
      S("hook", V(0.95, 1.25, 2.2), V(0.85, 1.15, 1.95), V(0.55, 1.0, -1.2), V(0.55, 1.0, -1.25), 38, d, 0),
      S("ears", V(1.75, 1.15, 0.95), V(1.6, 1.1, 0.8), DW, DW, 40, d),
      S("hear", V(-0.55, 1.2, 0.95), V(-0.4, 1.15, 0.8), DW, DW, 40, d),
      S("signs", V(1.8, 1.5, 2.4), V(1.9, 1.45, 2.2), V(0.3, 0.5, -0.7), V(0.8, 0.5, -0.4), 46, d),
      S("study", V(2.2, 1.9, 2.6), V(1.6, 1.7, 2.8), V(0.2, 0.9, -1.0), V(0.2, 0.9, -1.0), 46, d),
      S("half", V(1.6, 1.7, 2.8), V(1.2, 1.6, 2.9), V(0.2, 0.9, -1.0), V(0.2, 0.9, -1.0), 46, d),
      S("good", V(0.6, 1.4, 2.6), V(0.3, 1.3, 2.3), V(-1.0, 0.8, -1.0), V(-0.9, 0.8, -1.0), 42, o),
      S("play", V(0.9, 1.05, 1.0), V(0.7, 1.0, 0.85), V(-0.4, 0.45, -0.6), V(-0.4, 0.45, -0.6), 38, d),
      S("louder", V(-1.0, 1.4, 1.5), V(-0.6, 1.35, 1.6), V(-0.5, 0.5, -0.6), V(-0.5, 0.5, -0.6), 40, d),
      S("den", V(2.9, 1.6, 1.6), V(2.8, 1.5, 1.4), V(2.1, 0.45, -1.1), V(2.1, 0.45, -1.1), 40, d),
      S("night", V(0.6, 1.4, 1.4), V(0.75, 1.35, 1.2), V(2.0, 0.5, -1.1), V(2.0, 0.5, -1.1), 42, d),
      S("worse", V(1.1, 1.1, 0.95), V(1.2, 1.05, 0.8), V(2.05, 0.45, -1.05), V(2.05, 0.45, -1.05), 36, d),
      S("couch", V(-0.6, 1.3, 1.6), V(-1.1, 1.5, 2.3), V(-1.5, 0.85, -1.5), V(-1.3, 1.1, -1.8), 40, d),
      S("cta", V(-0.7, 1.3, 1.2), V(-0.65, 1.32, 1.35), V(-1.2, 0.82, -1.5), V(-1.2, 0.82, -1.5), 36, d),
    ];
    for (let i = 0; i < sh.length; i++) sh[i].b = i + 1 < sh.length ? sh[i + 1].a : this.T.total + 1;
    this.shots = sh;
  }

  update(f: number, cam: THREE.PerspectiveCamera) {
    const scary0 = (tt: number) => tt < this.fr("study").t0;
    const t = f / 30, s = this.shotAt(t), u = (t - s.a) / Math.max(0.1, s.b - s.a), k = sm(u);
    cam.position.lerpVectors(s.cam[0], s.cam[1], k);
    // fogos: explosão, clarão e tremida
    let fl = 0, flc = "#ffffff";
    for (const b of this.bursts) {
      const a = t - b.t0;
      b.g.visible = a > 0 && a < 1.6;
      if (!b.g.visible) continue;
      const rr = eo(a / 0.9) * 1.3;
      b.g.children.forEach((m, i) => { m.position.copy(b.dirs[i]).multiplyScalar(rr); m.position.y -= a * a * 0.25; m.scale.setScalar(Math.max(0.05, 1 - a / 1.6)); });
      const kf = Math.max(0, 1 - a / 0.35); if (kf > fl) { fl = kf; flc = b.col; }
    }
    this.flash.intensity = fl * (scary0(t) ? 14 : 6); this.flash.color.set(flc);
    const scary = ["hook", "ears", "hear", "signs"].includes(s.k);
    const shk = scary ? fl * 0.03 : 0;
    cam.position.x += Math.sin(t * 90) * shk; cam.position.y += Math.cos(t * 77) * shk;
    cam.lookAt(new THREE.Vector3().lerpVectors(s.look[0], s.look[1], k));
    cam.fov = s.fov; cam.updateProjectionMatrix();
    const fr = (key: string) => this.fr(key);
    const inK = (key: string) => s.k === key;
    const loc = (key: string) => (t - fr(key).t0) / Math.max(0.1, fr(key).t1 - fr(key).t0);
    const wd = (key: string, re: RegExp) => this.T.palavras.find((w) => w.k === key && re.test(w.w))!.t0;
    // ---- cachorro
    const D = this.dog;
    const p: Parameters<Dog["pose"]>[0] = { t, lie: 0.3, headUp: 1, wag: 0.2, ears: 0, eyes: 1, turn: 0 };
    let pos = V(0.55, 0, -0.85), ry = 0, jit = 0;
    if (scary || inK("study") || inK("half")) { p.guilt = 1; p.lie = 0.55; p.wag = 0; p.pant = 0.6; jit = 0.012 + fl * 0.02; }
    if (inK("hook")) { p.turn = -0.25 * Math.sin(t * 1.5); }
    if (inK("ears")) { p.ears = 0; }
    if (inK("signs")) {
      const tShake = wd("signs", /shakes/), tHide = wd("signs", /hides/), tPant = wd("signs", /pants/), tRun = wd("signs", /run/);
      if (t >= tHide) { const c = sm((t - tHide) / 0.5); pos = V(0.55, 0, -0.85).lerp(V(-0.3, 0, -0.95), c); p.walk = c < 1 ? t * 2 : undefined; p.lie = c < 1 ? 0.2 : 0.8; ry = -1.2 * Math.sin(c * Math.PI); }
      if (t >= tPant) { p.pant = 1; pos = V(-0.3, 0, -0.95); p.walk = undefined; p.lie = 0.7; ry = 0.3; }
      if (t >= tRun) { const c = sm((t - tRun) / 0.7); pos = V(-0.3, 0, -0.95).lerp(V(2.6, 0, 0.6), c); p.walk = t * 2.6; p.lie = 0; ry = Math.atan2(2.9, 1.55); }
      void tShake;
    }
    if (inK("study") || inK("half")) { pos = V(0.2, 0, -1.0); p.lie = 0.8; }
    if (inK("good")) { pos = V(0.3, 0, -0.4); p.guilt = 0.4 * (1 - loc("good")); p.lie = 0.3; ry = -0.6; p.wag = 0.4; }
    if (inK("play") || inK("louder")) { pos = V(-0.55, 0, -0.45); ry = Math.PI; p.lie = 0.1; p.headUp = 0.05 + 0.25 * Math.abs(Math.sin(t * 5)); p.wag = 0.8; p.guilt = 0; p.ears = inK("louder") ? 0.2 * Math.max(0, Math.sin(t * 3)) : 0; ry = 0.4; }
    if (inK("den")) { const c = sm(loc("den") * 1.6 - 0.1); pos = V(1.2, 0, -0.2).lerp(V(2.1, 0, -1.15), c); p.walk = c > 0 && c < 1 ? t * 1.6 : undefined; ry = c < 1 ? Math.atan2(0.9, -0.95) : 0; p.lie = c >= 1 ? 0.9 : 0; p.wag = 0.5; }
    if (inK("night") || inK("worse")) { pos = V(2.1, 0, -1.15); p.lie = 0.9; p.guilt = 0.35 - 0.3 * loc("worse"); p.eyes = 1; p.wag = 0.2; p.turn = -0.3; }
    if (inK("couch") || inK("cta")) { pos = V(-1.1, 0.45, -1.45); p.lie = 0.85; p.wag = 0.6; p.turn = inK("cta") ? 0.35 : 0.2; p.tilt = inK("cta") ? 0.2 : 0; p.eyes = 1; }
    D.root.position.copy(pos); D.root.position.x += Math.sin(t * 55) * jit; D.root.position.z += Math.cos(t * 47) * jit;
    D.root.rotation.y = ry;
    D.pose(p);
    // ondas no ouvido
    const er = inK("ears") || inK("hear");
    const hp = D.head.getWorldPosition(new THREE.Vector3());
    this.earRings.forEach((rg, i) => { rg.visible = er; if (!er) return; const ph = ((t * 1.2 + i / 4) % 1); rg.position.copy(hp).add(V(0.0, 0.15, 0)); rg.scale.setScalar(0.35 + ph * 0.9); (rg.material as THREE.MeshBasicMaterial).opacity = 1 - ph; (rg.material as THREE.MeshBasicMaterial).transparent = true; rg.lookAt(cam.position); });
    // ---- dona
    const O = this.ownerS; O.root.visible = !scary && !inK("study") && !inK("half");
    let op = V(-1.2, 0, -1.25), oy = 0.0, sit = true, fwdR = 0.4, fwdL = 0, elbowR = 1.1, face: "smile" | "grin" | "talk" | "neutral" = "smile", lean = 0.1, mouth = 0;
    if (inK("good")) { face = "grin"; }
    if (inK("play") || inK("louder")) { op = V(-1.0, 0, -1.25); oy = 0.5; fwdR = 0.9; elbowR = 0.9; lean = 0.35; }
    if (inK("den")) { op = V(-0.9, 0, -1.25); oy = 0.7; }
    if (inK("night") || inK("worse")) { op = V(1.35, 0, -0.65); oy = 2.3; sit = false; lean = 0.55; fwdR = 1.1; elbowR = 0.2; fwdL = 0.5; face = "talk"; mouth = 0.3 + 0.3 * Math.sin(t * 9); }
    if (inK("couch") || inK("cta")) { op = V(-1.75, 0, -1.3); oy = 0.25; fwdR = 0.9; elbowR = 0.5; face = "grin"; }
    O.root.position.copy(op); O.root.rotation.y = oy;
    O.pose({ t, face, fwdR, fwdL, elbowR, lean, mouth, nod: 0.1 });
    if (sit) { // sentada no sofá: coxa para frente, joelho dobrado
      O.hips.position.y -= 0.18;
      O.legL.root.rotation.x = O.legR.root.rotation.x = -1.45; O.legL.mid.rotation.x = O.legR.mid.rotation.x = 1.45;
    } else { // ajoelhada perto da toca
      O.hips.position.y -= 0.32;
      O.legL.root.rotation.x = O.legR.root.rotation.x = -0.4; O.legL.mid.rotation.x = O.legR.mid.rotation.x = 1.6;
    }
    // celular na mão no treino
    const tr = inK("play") || inK("louder");
    this.phone.visible = tr;
    if (tr && this.phone.parent !== O.hold) { O.hold.add(this.phone); this.phone.position.set(0, -0.06, 0.05); this.phone.rotation.set(-1.2, 0, 0); }
    const vol = inK("louder") ? 0.35 + 0.65 * loc("louder") : 0.25;
    this.rings.forEach((rg, i) => { const ph = (t * 1.5 + i / 3) % 1; rg.scale.setScalar(0.3 + ph * (0.4 + 0.8 * vol)); rg.visible = tr && ph < 0.9; });
    this.bowl.visible = tr; this.bowl.position.set(-0.55, 0, -0.08);
    // luz
    this.hemi.intensity = 1.25; this.lamp.visible = false;
    this.warm.intensity = inK("couch") || inK("cta") ? 15 : 12;
    return s;
  }
}
