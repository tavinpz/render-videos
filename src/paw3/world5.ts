// Pawslated v3 ep5 — "Why your dog follows you to the bathroom" (27/11/2026).
// Corredor + banheiro (porta com fresta de luz) e sala de teste (x + 1000).
// Fato: Topál, Miklósi, Csányi & Dóka (1998), J. Comp. Psychol. 112(3):219–229 — Strange Situation Test de Ainsworth
// aplicado a cães: cães adultos mostram padrões de apego ao dono, análogos à relação criança-pai/mãe.
import * as THREE from "three";
import { Char, toon } from "./chars";
import { Dog } from "./dog";
import { NOINK } from "./ink";
import { PawWorld, Tempos, Shot, V, sm, eo, M, RB, glow, blob, FX } from "./world";

const cTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, rep?: [number, number]) => {
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h; draw(cv.getContext("2d")!);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); }
  return t;
};
const GRAD = (toon("#fff") as THREE.MeshToonMaterial).gradientMap;
const tm = (map: THREE.Texture) => new THREE.MeshToonMaterial({ map, color: "#fff", gradientMap: GRAD });
const wood = cTex(512, 512, (g) => { g.fillStyle = "#C4895A"; g.fillRect(0, 0, 512, 512); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#B77D50" : "#CF9563"; g.fillRect(0, i * 64, 512, 62); g.fillStyle = "rgba(70,35,15,.3)"; g.fillRect(0, i * 64 + 62, 512, 2); } }, [4, 4]);
const hallWall = cTex(256, 256, (g) => { g.fillStyle = "#F0C27B"; g.fillRect(0, 0, 256, 256); g.fillStyle = "#E9B66C"; for (let x = 0; x < 256; x += 48) g.fillRect(x, 0, 20, 256); }, [5, 2]);
const tiles = cTex(256, 256, (g) => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? "#2EC4B6" : "#F7FFF7"; g.fillRect(x * 32, y * 32, 32, 32); } }, [4, 4]);
const bathWall = cTex(256, 256, (g) => { g.fillStyle = "#BDE0FE"; g.fillRect(0, 0, 256, 256); g.strokeStyle = "#A2D2FF"; g.lineWidth = 4; for (let i = 0; i <= 256; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(256, i); g.stroke(); } }, [4, 3]);
const labFloor = cTex(256, 256, (g) => { g.fillStyle = "#D9DCE3"; g.fillRect(0, 0, 256, 256); g.strokeStyle = "#C5C9D3"; g.lineWidth = 3; for (let i = 0; i <= 256; i += 64) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(256, i); g.stroke(); } }, [5, 5]);

export class BathWorld extends PawWorld {
  set = new THREE.Group();
  lab = new THREE.Group();
  O!: Char;
  doorB = new THREE.Group();
  doorL = new THREE.Group();
  gap = new THREE.Mesh();
  ball = new THREE.Mesh();
  rim = new THREE.DirectionalLight("#A8D8FF", 1.5);
  warm = new THREE.PointLight("#FFC47A", 12, 10, 1.3);
  bathL = new THREE.PointLight("#FFF4D6", 8, 6, 1.4);
  labL = new THREE.DirectionalLight("#FFFFFF", 2.0);
  constructor(T: Tempos) {
    super(T);
    this.dog.root.parent!.visible = false; this.wolves[0].root.parent!.visible = false;
    this.moon.visible = false; this.fMoon.visible = false; this.lamp.visible = false;
    this.build();
    this.makeShots5();
  }
  makeShots() { this.shots = []; }

  build() {
    const r = this.set; this.root.add(r);
    // corredor (x 0..4.2) e banheiro (x -2.6..0)
    r.add(M(new THREE.PlaneGeometry(4.4, 6).rotateX(-Math.PI / 2), tm(wood), V(2.2, 0, 0), false));
    r.add(M(new THREE.PlaneGeometry(2.8, 6).rotateX(-Math.PI / 2), tm(tiles), V(-1.4, 0.001, 0), false));
    const hw = tm(hallWall);
    r.add(M(new THREE.PlaneGeometry(4.4, 3), hw, V(2.2, 1.5, -2.0), false));
    // parede do banheiro (x = 0) com vão da porta em z -0.5..0.5
    const pw = (z: number, w: number) => { const m = M(new THREE.PlaneGeometry(w, 3), hw, V(0, 1.5, z), false); m.rotation.y = Math.PI / 2; r.add(m); const b = M(new THREE.PlaneGeometry(w, 3), tm(bathWall), V(-0.01, 1.5, z), false); b.rotation.y = -Math.PI / 2; r.add(b); };
    pw(-1.25, 1.5); pw(1.75, 2.5);
    { const m = M(new THREE.PlaneGeometry(1.0, 0.9), hw, V(0, 2.55, 0), false); m.rotation.y = Math.PI / 2; r.add(m); }
    const fr = toon("#FFFFFF");
    r.add(M(RB(0.14, 2.2, 0.08, 0.02), fr, V(0.02, 1.1, -0.52))); r.add(M(RB(0.14, 2.2, 0.08, 0.02), fr, V(0.02, 1.1, 0.52))); r.add(M(RB(0.14, 0.1, 1.12, 0.02), fr, V(0.02, 2.15, 0)));
    // porta do banheiro (dobradiça em z = -0.5, abre para dentro do banheiro)
    this.doorB.add(M(RB(0.06, 2.08, 0.98, 0.02), toon("#FFFFFF"), V(0, 1.06, 0.49)));
    for (const y of [0.6, 1.5]) this.doorB.add(M(RB(0.075, 0.6, 0.7, 0.03), toon("#F1F1F1"), V(0, y, 0.49)));
    this.doorB.add(M(new THREE.SphereGeometry(0.045, 10, 8), toon("#E0B341"), V(0.06, 1.0, 0.85)));
    this.doorB.position.set(0, 0, -0.49); r.add(this.doorB);
    // fresta de luz debaixo da porta
    this.gap = M(new THREE.PlaneGeometry(0.35, 0.95), new THREE.MeshBasicMaterial({ color: "#FFD27A", transparent: true, opacity: 0.85, toneMapped: false }), V(0.18, 0.012, 0), false); this.gap.rotation.set(-Math.PI / 2, 0, 0); this.gap.layers.set(NOINK); r.add(this.gap);
    // banheiro: pia + espelho, vaso, banheira, toalha
    r.add(M(RB(0.7, 0.85, 0.5, 0.04), toon("#FFFFFF"), V(-1.6, 0.42, -1.7)));
    r.add(M(RB(0.6, 0.08, 0.42, 0.04), toon("#E8F4F8"), V(-1.6, 0.86, -1.65)));
    const mir = M(RB(0.6, 0.75, 0.04, 0.05), glow("#CFEFFF"), V(-1.6, 1.6, -1.98), false); mir.layers.set(NOINK); r.add(mir);
    r.add(M(RB(0.66, 0.8, 0.05, 0.05), toon("#2EC4B6"), V(-1.6, 1.6, -1.995)));
    r.add(M(RB(0.4, 0.42, 0.55, 0.12), toon("#FFFFFF"), V(-2.3, 0.21, 0.2)));
    r.add(M(RB(0.42, 0.06, 0.5, 0.05), toon("#F3F3F3"), V(-2.3, 0.45, 0.2)));
    r.add(M(RB(0.18, 0.5, 0.5, 0.05), toon("#FFFFFF"), V(-2.5, 0.65, 0.2)));
    r.add(M(RB(1.6, 0.55, 0.8, 0.15), toon("#FFFFFF"), V(-1.6, 0.27, 1.6)));
    r.add(M(RB(0.4, 0.7, 0.06, 0.03), toon("#FF6B6B"), V(-0.9, 1.3, -1.96)));
    this.bathL.position.set(-1.3, 2.4, -0.4); r.add(this.bathL);
    // corredor: tapete, quadros, planta, porta da rua
    const rug = M(RB(0.9, 0.02, 3.2, 0.01), toon("#5E60CE"), V(1.5, 0.01, 0.3)); r.add(rug);
    for (const [x, c] of [[1.4, "#FFADAD"], [2.4, "#A0C4FF"]] as [number, string][]) { r.add(M(RB(0.5, 0.6, 0.04, 0.02), toon("#3D2C2E"), V(x, 1.7, -1.97))); r.add(M(RB(0.4, 0.5, 0.02, 0.02), toon(c), V(x, 1.7, -1.94))); }
    r.add(M(new THREE.CylinderGeometry(0.16, 0.12, 0.3, 16), toon("#E76F51"), V(3.7, 0.15, -1.6))); for (let i = 0; i < 5; i++) { const l = M(new THREE.SphereGeometry(0.16, 12, 8), toon("#2A9D8F"), V(3.7 + Math.cos(i) * 0.12, 0.45 + i * 0.07, -1.6 + Math.sin(i) * 0.12)); l.scale.set(0.6, 1.4, 0.6); r.add(l); }
    this.doorL.add(M(RB(1.0, 2.1, 0.08, 0.03), toon("#7B4B2A"), V(0, 1.05, 0))); this.doorL.add(M(new THREE.SphereGeometry(0.05, 10, 8), toon("#E0B341"), V(0.35, 1.0, 0.06)));
    this.doorL.position.set(2.9, 0, -1.95); r.add(this.doorL);
    this.warm.position.set(2.0, 2.6, 0.2); this.warm.castShadow = true; this.warm.shadow.bias = -0.003; this.warm.shadow.normalBias = 0.03; r.add(this.warm);
    // sala de teste (x + 1000)
    const L = this.lab; L.position.x = FX; this.root.add(L);
    L.add(M(new THREE.PlaneGeometry(8, 8).rotateX(-Math.PI / 2), tm(labFloor), V(0, 0, 0), false));
    L.add(M(new THREE.PlaneGeometry(8, 3), toon("#F2F4F8"), V(0, 1.5, -2.5), false));
    { const sw = M(new THREE.PlaneGeometry(8, 3), toon("#E9EDF3"), V(-2.6, 1.5, 0), false); sw.rotation.y = Math.PI / 2; L.add(sw); }
    L.add(M(RB(1.0, 2.1, 0.08, 0.03), toon("#9AA5B1"), V(1.2, 1.05, -2.45)));
    for (const [x, z] of [[-1.0, -1.2], [0.4, -1.4]]) { const ch = new THREE.Group(); ch.add(M(RB(0.5, 0.06, 0.5, 0.03), toon("#4361EE"), V(0, 0.45, 0))); ch.add(M(RB(0.5, 0.55, 0.06, 0.03), toon("#4361EE"), V(0, 0.75, -0.22))); for (const [a, b] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) ch.add(M(new THREE.CylinderGeometry(0.02, 0.02, 0.45, 6), toon("#2B2D42"), V(a, 0.22, b))); ch.position.set(x, 0, z); L.add(ch); }
    this.ball = M(new THREE.SphereGeometry(0.1, 16, 12), toon("#F4D35E"), V(0, 0.1, 0)); L.add(this.ball);
    L.add(M(RB(0.5, 0.35, 0.06, 0.03), toon("#2B2D42"), V(-1.8, 2.2, -2.45)));
    const cam = M(new THREE.SphereGeometry(0.04, 8, 6), glow("#FF3B3B"), V(-1.65, 2.25, -2.4), false); cam.layers.set(NOINK); L.add(cam);
    this.labL.position.set(FX + 2, 6, 3); this.labL.target.position.set(FX, 0, -1); this.labL.castShadow = true; this.labL.shadow.mapSize.set(2048, 2048);
    const sc = this.labL.shadow.camera as THREE.OrthographicCamera; sc.left = -5; sc.right = 5; sc.top = 5; sc.bottom = -5; sc.far = 20; this.labL.shadow.normalBias = 0.02;
    this.root.add(this.labL, this.labL.target);
    // personagens
    this.O = new Char({ shirt: "#4CC9F0", skin: "#E8B08F", hat: "curly", hair: "#2B1B12" });
    this.root.add(this.O.root, this.dog.root);
    this.dog.root.add(blob(0.8, 1.1)); this.O.root.add(blob(0.7, 0.7));
    this.rim.position.set(0, 3, -4); this.root.add(this.rim, this.rim.target);
  }

  makeShots5() {
    const d = () => this.dog.head.getWorldPosition(new THREE.Vector3());
    const o = () => this.O.head.getWorldPosition(new THREE.Vector3());
    const wt = (k: string, re: RegExp) => this.T.palavras.find((w) => w.k === k && re.test(w.w))!.t0;
    const S = (k: string, set: "room" | "forest", c0: THREE.Vector3, c1: THREE.Vector3, l0: THREE.Vector3, l1: THREE.Vector3, fov: number, focus: () => THREE.Vector3, a?: number, roll = 0): Shot => {
      const fr = this.fr(k); return { k, set, a: a ?? fr.t0 - 0.06, b: 0, cam: [c0, c1], look: [l0, l1], fov, focus, roll };
    };
    const DD = V(0.75, 0.5, 0.0); // cachorro diante da porta
    const sh: Shot[] = [
      S("hook", "room", V(1.45, 0.65, 1.75), V(1.32, 0.6, 1.55), V(0.65, 0.75, 0.0), V(0.65, 0.78, 0.0), 48, d, 0, 0.04),
      S("door", "room", V(2.9, 1.5, 2.2), V(2.7, 1.45, 2.0), V(0.4, 1.0, 0.0), V(0.4, 0.9, 0.0), 50, d),
      { ...S("door", "room", V(1.3, 0.65, 2.9), V(1.2, 0.6, 2.7), V(0.45, 0.28, 0.0), V(0.42, 0.26, 0.0), 46, () => V(0.2, 0.12, 0)), a: wt("door", /Nose/) - 0.06 },
      S("vanish", "room", V(0.75, 0.32, 0.25), V(0.6, 0.3, 0.2), V(0.0, 0.35, 0.0), V(0.0, 0.42, 0.0), 72, () => V(0, 1, 0)),
      { ...S("vanish", "room", V(-0.5, 2.6, 1.0), V(-0.6, 2.55, 0.8), V(-1.4, 0.8, -1.2), V(-1.4, 0.8, -1.3), 52, o), a: wt("vanish", /tiny/) - 0.06 },
      S("test", "forest", V(FX + 1.8, 1.9, 2.8), V(FX + 1.4, 1.8, 2.6), V(FX - 0.3, 0.5, -1.0), V(FX - 0.3, 0.5, -1.1), 50, d),
      S("left", "forest", V(FX - 1.0, 1.4, 1.8), V(FX - 0.6, 1.35, 1.6), V(FX + 1.1, 0.8, -2.1), V(FX + 1.1, 0.7, -2.1), 50, d),
      S("back", "forest", V(FX + 2.3, 1.2, 0.4), V(FX + 2.2, 1.15, 0.2), V(FX + 1.0, 0.8, -1.8), V(FX + 0.9, 0.7, -1.6), 50, d, undefined, -0.04),
      S("bond", "room", V(2.45, 1.15, 1.85), V(2.3, 1.1, 1.65), V(1.5, 0.65, 0.2), V(1.5, 0.7, 0.2), 48, d),
      S("plus", "room", V(2.9, 0.95, 1.95), V(2.8, 0.92, 1.85), V(1.75, 0.55, 0.3), V(1.75, 0.55, 0.3), 40, d, undefined, 0.08),
      S("good", "room", V(2.7, 1.5, 1.9), V(2.5, 1.45, 1.7), V(0.6, 0.9, 0.1), V(0.7, 0.85, 0.1), 50, o),
      S("learn", "room", V(3.9, 0.9, 2.3), V(3.7, 0.95, 1.9), V(1.5, 0.7, 0.2), V(2.5, 0.7, -0.2), 52, d),
      S("worry", "room", V(1.9, 1.6, 0.4), V(2.0, 1.5, 0.2), V(2.9, 0.6, -1.6), V(2.9, 0.6, -1.6), 50, d, undefined, 0.07),
      S("shadow", "room", V(4.6, 0.4, 2.2), V(4.4, 0.38, 1.9), V(2.0, 0.9, 0.2), V(1.6, 0.9, 0.0), 52, d, undefined, -0.05),
      S("cta", "room", V(1.32, 0.6, 1.55), V(1.45, 0.65, 1.75), V(0.65, 0.78, 0.0), V(0.65, 0.75, 0.0), 48, d, undefined, 0.04),
    ];
    sh.sort((x, y) => x.a - y.a);
    for (let i = 0; i < sh.length; i++) sh[i].b = i + 1 < sh.length ? sh[i + 1].a : this.T.total + 1;
    this.shots = sh;
    void DD;
  }

  update(f: number, cam: THREE.PerspectiveCamera) {
    const t = f / 30, s = this.shotAt(t), u = (t - s.a) / Math.max(0.1, s.b - s.a), k = sm(u);
    cam.position.lerpVectors(s.cam[0], s.cam[1], k);
    const lk = new THREE.Vector3().lerpVectors(s.look[0], s.look[1], k);
    cam.lookAt(lk); if (s.roll) cam.rotateZ(s.roll);
    cam.fov = s.fov; cam.updateProjectionMatrix();
    const back = lk.clone().sub(cam.position).setY(0).normalize();
    this.rim.position.copy(lk).addScaledVector(back, 3).add(V(0, 2.2, 0)); this.rim.target.position.copy(lk);
    const fr = (key: string) => this.fr(key);
    const inK = (key: string) => s.k === key;
    const loc = (key: string) => (t - fr(key).t0) / Math.max(0.1, fr(key).t1 - fr(key).t0);
    const wd = (key: string, re: RegExp) => this.T.palavras.find((w) => w.k === key && re.test(w.w))!.t0;
    const lab = s.set === "forest";
    // porta do banheiro: aberta no começo do "door", fecha em "close"; abre de novo no "good"
    const tClose = wd("door", /close/);
    let open = 0;
    if (inK("door")) open = 1 - sm((t - tClose) / 0.4);
    if (inK("good")) open = sm(loc("good") * 3);
    if (["learn", "shadow"].includes(s.k)) open = 1;
    this.doorB.rotation.y = -open * 1.3;
    this.gap.visible = open < 0.1;
    // ---- cachorro
    const D = this.dog;
    const p: Parameters<Dog["pose"]>[0] = { t, sit: 1, lie: 0, headUp: 1, wag: 0.4, ears: 0.2, eyes: 1, turn: 0 };
    let pos = V(0.8, 0, 0.05), ry = -Math.PI / 2, walk: number | undefined, hop = 0;
    if (inK("hook")) { ry = 0.25; p.turn = loc("hook") > 0.6 ? -1.4 * sm((loc("hook") - 0.6) * 4) : 0; p.tilt = 0.2; p.wag = 0.6; }
    if (inK("door")) { const nose = t >= wd("door", /Nose/); if (nose) { pos = V(0.42, 0, 0.0); p.sit = 0; p.lie = 0.7; p.headUp = 0.2; p.ears = 0.4; p.wag = 0.3; } else { p.ears = 0.5; } }
    if (inK("vanish")) { pos = V(0.6, 0, 0.0); p.sit = 0; p.lie = 0.6; p.worried = 0.7; p.wag = 0; }
    if (inK("cta")) { ry = 0.25; p.tilt = 0.25; p.wag = 1; }
    // laboratório
    if (lab) {
      ry = 0;
      if (inK("test")) { pos = V(FX - 0.2 + Math.sin(t * 2) * 0.3, 0, -0.6); p.sit = 0; walk = t * 1.8; ry = Math.cos(t * 2) > 0 ? Math.PI / 2 : -Math.PI / 2; p.wag = 0.8; }
      if (inK("left")) { const c = sm((t - fr("left").t0 - 0.8) / 1.0); pos = V(FX - 0.2, 0, -0.6).lerp(V(FX + 1.15, 0, -1.75), c); walk = c > 0 && c < 1 ? t * 2 : undefined; ry = c < 1 ? Math.atan2(1.35, -1.15) : Math.PI; p.sit = c >= 1 ? 1 : 0; p.worried = c; p.wag = 0; }
      if (inK("back")) { const c = loc("back"); pos = V(FX + 1.1, 0, -1.6); ry = Math.PI; p.sit = c > 0.55 ? 0 : 0; p.lie = c > 0.6 ? 0.8 : 0; hop = c < 0.55 ? Math.abs(Math.sin(t * 9)) * 0.12 : 0; p.wag = 1; p.worried = 0; }
    }
    if (inK("bond")) { pos = V(1.7, 0, 0.2); ry = -Math.PI / 2; p.wag = 1; p.turn = 0.2; p.eyes = 0.3; }
    if (inK("plus")) { pos = V(1.75, 0, 0.3); ry = 0; p.tilt = -0.3; p.wag = 0.8; }
    if (inK("good")) { pos = V(0.85, 0, 0.1); ry = -Math.PI / 2; p.wag = 1; p.ears = 0.3; p.eyes = 0.6 + 0.4 * Math.sin(t * 2); }
    if (inK("learn") || inK("shadow")) { const c = (t - fr(inK("learn") ? "learn" : "shadow").t0) / 2.6; pos = V(0.9, 0, 0.3).lerp(V(3.0, 0, 0.0), Math.min(1, c)); walk = c < 1 ? t * 2 : undefined; ry = Math.PI / 2 - 0.15; p.sit = 0; p.wag = 0.9; }
    if (inK("worry")) { const c = loc("worry"); pos = V(2.6 + Math.sin(c * 9) * 0.35, 0, -1.2); walk = t * 1.6; ry = Math.cos(c * 9) > 0 ? Math.PI / 2 : -Math.PI / 2; p.sit = 0; p.pant = 1; p.worried = 1; p.wag = 0; p.ears = 0.6; }
    D.root.visible = !(inK("vanish") && t < wd("vanish", /tiny/));
    D.root.position.copy(pos); D.root.position.y += hop; D.root.rotation.y = ry; p.walk = walk; D.pose(p);
    // ---- dona
    const O = this.O;
    let op = V(-1.0, 0, 0.0), oy = -Math.PI / 2, ow: number | undefined, face: "smile" | "grin" | "talk" | "neutral" | "laugh" = "smile", fwdR = 0, fwdL = 0, elbowR = 0.25, lean = 0, vis = true, kneel = false, sitC = false;
    if (inK("hook")) vis = false;
    if (inK("door")) { const c = sm((t - fr("door").t0) / Math.max(0.1, tClose - fr("door").t0)); op = V(1.4, 0, 0.6).lerp(V(-0.9, 0, 0.0), c); ow = c < 1 ? t * 1.7 : undefined; oy = Math.atan2(-2.3, -0.6); vis = c < 0.95; }
    if (inK("vanish")) { op = V(-1.6, 0, -1.15); oy = Math.PI; face = "neutral"; fwdR = 0.8; elbowR = 1.6; vis = t >= wd("vanish", /tiny/); }
    if (lab) {
      if (inK("test")) { op = V(FX - 1.0, 0, -1.2); oy = 0.3; sitC = true; }
      if (inK("left")) { const c = sm(loc("left") * 2.2); op = V(FX - 0.6, 0, -1.0).lerp(V(FX + 1.2, 0, -2.6), c); ow = c < 1 ? t * 1.8 : undefined; oy = Math.atan2(1.8, -1.6); vis = c < 0.98; }
      if (inK("back")) { const c = sm(loc("back") * 2); op = V(FX + 1.2, 0, -2.5).lerp(V(FX + 1.1, 0, -2.05), c); oy = 0; face = "laugh"; fwdR = 0.9 * c; fwdL = 0.9 * c; lean = 0.25 * c; }
    }
    if (inK("bond")) { op = V(1.15, 0, 0.2); oy = Math.PI / 2; kneel = true; fwdR = 1.3; fwdL = 1.3; elbowR = 0.9; lean = 0.3; face = "laugh"; }
    if (inK("plus")) vis = false;
    if (inK("good")) { const c = sm(loc("good") * 3); op = V(-0.6, 0, 0.0).lerp(V(0.35, 0, 0.1), c); ow = c < 1 ? t * 1.7 : undefined; oy = Math.PI / 2; face = "talk"; fwdR = c >= 1 ? 1.0 : 0; elbowR = 0.6; lean = c >= 1 ? 0.35 : 0; }
    if (inK("learn") || inK("shadow")) { const c = (t - fr(inK("learn") ? "learn" : "shadow").t0) / 2.6; op = V(1.6, 0, 0.3).lerp(V(3.7, 0, 0.0), Math.min(1, c)); ow = c < 1 ? t * 1.8 : undefined; oy = Math.PI / 2 - 0.15; face = "grin"; }
    if (inK("worry") || inK("cta")) vis = false;
    O.root.visible = vis; O.root.position.copy(op); O.root.rotation.y = oy;
    O.pose({ t, walk: ow, face, fwdR, fwdL, elbowR, lean, mouth: face === "talk" ? 0.4 + 0.4 * Math.sin(t * 14) : 0 });
    if (sitC) { O.hips.position.y -= 0.16; O.legL.root.rotation.x = O.legR.root.rotation.x = -1.45; O.legL.mid.rotation.x = O.legR.mid.rotation.x = 1.45; }
    if (kneel) { O.hips.position.y -= 0.34; O.legL.root.rotation.x = O.legR.root.rotation.x = -0.3; O.legL.mid.rotation.x = O.legR.mid.rotation.x = 1.6; }
    // bola no laboratório
    this.ball.position.set(-0.2 + Math.sin(t * 2 + 0.6) * 0.5, 0.1 + Math.abs(Math.sin(t * 4)) * 0.15, -0.3);
    // luz: no "worry" fica tudo frio e escuro (sozinho)
    const alone = inK("worry");
    this.hemi.intensity = lab ? 1.4 : alone ? 0.55 : 1.25;
    this.hemi.color.set(alone ? "#6C7BD8" : "#B9C6FF");
    this.warm.intensity = alone ? 2 : 13; this.warm.color.set(alone ? "#7A8BFF" : "#FFC47A");
    this.bathL.intensity = 8; this.labL.visible = lab;
    void eo;
    return s;
  }
}
