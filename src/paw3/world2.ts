// Pawslated v3 ep2 — "That guilty face isn't guilt" (27/11/2026). Mesmo quarto do ep1, cama arrumada.
// Fato: Horowitz (2009), Behavioural Processes 81: 447–452 (Barnard College): a "cara de culpa" aparece quando o dono
// bronca, não quando o cão desobedeceu; as caras mais culpadas foram de cães inocentes que levaram bronca.
import * as THREE from "three";
import { Char, toon } from "./chars";
import { Dog, WOLF } from "./dog";
import { PawWorld, Tempos, Shot, V, sm, eo, L, FX, M, RB } from "./world";

export class GuiltWorld extends PawWorld {
  ownerS!: Char;
  sci!: Char;
  slipper!: THREE.Group;
  treat!: THREE.Group;
  plate!: THREE.Mesh;
  big!: Dog;
  small!: Dog;
  constructor(T: Tempos) {
    super(T);
    // cama arrumada: some a dona dormindo
    this.ownerG.visible = false; this.bump.visible = false;
    const room = this.dog.root.parent!;
    // dona em pé
    this.ownerS = new Char({ shirt: "#E9A23B", skin: "#F3C9A3", hat: "bun", hair: "#3B2416", pants: "#3C4A7A" });
    room.add(this.ownerS.root);
    // pesquisadora (genérica)
    this.sci = new Char({ shirt: "#F4F4F2", skin: "#C98E6A", hat: "hair", hair: "#2A2A2E", tie: "#5B8DEF" });
    room.add(this.sci.root);
    // chinelo mordido
    this.slipper = new THREE.Group();
    this.slipper.add(M(RB(0.34, 0.07, 0.14, 0.035), toon("#F28DB2"), V(0, 0.035, 0)));
    this.slipper.add(M(RB(0.16, 0.06, 0.15, 0.03), toon("#FFB6CF"), V(0.06, 0.09, 0)));
    for (let i = 0; i < 5; i++) { const f = M(new THREE.SphereGeometry(0.025, 8, 6), toon("#FFFFFF"), V(-0.17 + (i % 2) * 0.03, 0.05 + (i % 3) * 0.02, -0.05 + i * 0.025)); this.slipper.add(f); }
    for (let i = 0; i < 4; i++) { const f = M(new THREE.SphereGeometry(0.02, 8, 6), toon("#FFFFFF"), V(-0.35 - i * 0.12, 0.02, 0.1 + (i % 2) * 0.12)); this.slipper.add(f); }
    room.add(this.slipper);
    // petisco no pratinho
    this.plate = M(new THREE.CylinderGeometry(0.16, 0.13, 0.03, 28), toon("#F3F1EA"), V(0, 0, 0));
    this.treat = new THREE.Group();
    this.treat.add(M(new THREE.CapsuleGeometry(0.025, 0.12, 4, 10), toon("#C98A4B"), V(0, 0, 0)));
    for (const x of [-0.075, 0.075]) for (const z of [-0.025, 0.025]) this.treat.add(M(new THREE.SphereGeometry(0.03, 10, 8), toon("#C98A4B"), V(x, 0, z)));
    this.treat.children[0].rotation.z = Math.PI / 2;
    room.add(this.plate, this.treat);
    // floresta: lobo grande e lobo pequeno (sinal de calma)
    this.big = new Dog({ ...WOLF, scale: 1.25 }); this.small = new Dog({ ...WOLF, fur: "#A7AFBB", scale: 0.9 });
    this.big.root.position.set(0.55, 0, 0); this.big.root.rotation.y = -Math.PI / 2;
    this.small.root.position.set(-0.55, 0, 0.1); this.small.root.rotation.y = Math.PI / 2;
    this.wolves[0].root.parent!.add(this.big.root, this.small.root);
    for (const w of this.wolves) w.root.visible = false;
    this.lone.root.visible = false; this.eyes.visible = false;
    // cachorro no tapete, de frente para a câmera
    this.dog.root.position.set(2.0, 0, 1.3); this.dog.root.rotation.y = 0;
    this.tripod.position.set(3.0, 0, 2.5); this.tripod.lookAt(2.0, 0, 1.3); this.tripod.rotateY(Math.PI);
    this.makeShots2();
  }
  makeShots() { this.shots = []; }
  makeShots2() {
    const d = () => this.dog.head.getWorldPosition(new THREE.Vector3());
    const o = () => this.ownerS.head.getWorldPosition(new THREE.Vector3());
    const S = (k: string, set: "room" | "forest", c0: THREE.Vector3, c1: THREE.Vector3, l0: THREE.Vector3, l1: THREE.Vector3, fov: number, focus: () => THREE.Vector3, a?: number): Shot => {
      const fr = this.fr(k); return { k, set, a: a ?? fr.t0 - 0.06, b: 0, cam: [c0, c1], look: [l0, l1], fov, focus };
    };
    const DF = V(2.0, 0.55, 1.6);
    const sh: Shot[] = [
      S("hook", "room", V(2.05, 0.92, 3.75), V(2.0, 0.86, 3.5), DF, DF, 30, d, 0),
      S("home", "room", V(1.5, 1.7, 3.1), V(1.65, 1.55, 2.85), V(2.9, 1.0, -0.4), V(2.7, 0.9, 0.0), 44, o),
      S("face", "room", V(2.45, 0.9, 3.5), V(2.3, 0.86, 3.35), DF, DF, 32, d),
      S("knows", "room", V(1.2, 1.7, 3.4), V(1.35, 1.65, 3.2), V(2.4, 0.9, 0.9), V(2.4, 0.9, 0.9), 44, d),
      S("test", "room", V(0.5, 1.8, 3.6), V(0.8, 1.65, 3.35), V(2.4, 0.8, 1.3), V(2.4, 0.8, 1.3), 44, d),
      S("rule", "room", V(1.1, 1.35, 3.2), V(1.25, 1.3, 3.0), V(2.4, 0.7, 1.2), V(2.6, 0.8, 0.8), 42, d),
      S("swap", "room", V(2.1, 1.05, 3.6), V(2.6, 1.25, 3.7), V(2.0, 0.4, 1.7), V(2.2, 0.6, 1.6), 34, d),
      S("lie", "room", V(1.5, 1.55, 2.7), V(1.6, 1.5, 2.5), V(3.0, 1.3, 0.1), V(3.0, 1.3, 0.1), 40, o),
      S("result", "room", V(1.55, 0.75, 2.75), V(1.65, 0.7, 2.6), V(2.6, 1.05, 0.45), V(2.6, 1.0, 0.5), 40, d),
      S("signal", "forest", V(FX + 2.6, 1.6, 4.6), V(FX + 2.0, 1.4, 4.0), V(FX, 0.5, 0), V(FX, 0.5, 0), 34, () => this.small.head.getWorldPosition(new THREE.Vector3())),
      S("reading", "room", V(2.02, 0.58, 1.45), V(2.03, 0.6, 1.42), V(2.75, 1.45, 0.25), V(2.75, 1.5, 0.25), 44, o),
      S("tip", "room", V(1.2, 1.3, 3.3), V(1.35, 1.25, 3.05), V(2.35, 0.8, 1.2), V(2.35, 0.9, 1.1), 42, o),
      S("cta", "room", V(2.0, 0.86, 3.5), V(2.05, 0.92, 3.75), DF, DF, 30, d),
    ];
    for (let i = 0; i < sh.length; i++) sh[i].b = i + 1 < sh.length ? sh[i + 1].a : this.T.total + 1;
    this.shots = sh;
  }

  update(f: number, cam: THREE.PerspectiveCamera) {
    const t = f / 30, s = this.shotAt(t), u = (t - s.a) / Math.max(0.1, s.b - s.a), k = sm(u);
    cam.position.lerpVectors(s.cam[0], s.cam[1], k);
    const shk = Math.max(0, 1 - (t - s.a) / 0.25) * (["knows", "result"].includes(s.k) ? 0.025 : 0);
    cam.position.x += Math.sin(t * 90) * shk; cam.position.y += Math.cos(t * 77) * shk;
    cam.lookAt(new THREE.Vector3().lerpVectors(s.look[0], s.look[1], k));
    cam.fov = s.fov; cam.updateProjectionMatrix();
    const fr = (key: string) => this.fr(key);
    const inK = (key: string) => s.k === key;
    const loc = (key: string) => (t - fr(key).t0) / Math.max(0.1, fr(key).t1 - fr(key).t0);
    // ---- chinelo, petisco, tripé
    const exp = ["test", "rule", "swap", "lie"].includes(s.k);
    this.slipper.visible = !exp;
    this.slipper.position.set(2.12, 0.0, 1.95); this.slipper.rotation.set(0, 0.6, 0);
    this.plate.visible = this.treat.visible = ["rule", "swap", "lie"].includes(s.k);
    this.plate.position.set(2.0, 0.015, 1.95);
    this.treat.position.set(2.0, 0.07, 1.95); this.treat.rotation.set(0, 0.4, 0);
    this.tripod.visible = ["test", "rule", "swap", "lie"].includes(s.k);
    this.rec.visible = Math.floor(t * 2) % 2 === 0;
    // ---- cachorro
    const p: Parameters<Dog["pose"]>[0] = { t, lie: 0.4, sit: 0, headUp: 1, wag: 0.25, ears: 0, eyes: 1, turn: 0 };
    if (inK("hook")) { p.guilt = 1; p.lie = 0.7; p.wag = 0; }
    if (inK("home")) { p.guilt = sm((t - fr("home").t0 - 0.8) / 0.6); p.lie = 0.6; p.turn = 0.6 * (1 - p.guilt!); p.wag = 0.4 * (1 - p.guilt!); }
    if (inK("face")) { const w = this.T.palavras.filter((x) => x.k === "face"); p.lie = 0.7; p.wag = 0;
      p.guilt = 0.4 + 0.2 * (t > w[2].t0 ? 1 : 0) + 0.2 * (t > w[4].t0 ? 1 : 0) + 0.2 * (t > w[5].t0 ? 1 : 0); }
    if (inK("knows")) { p.guilt = 1; p.lie = 0.85; p.wag = 0; }
    if (inK("test")) { p.sit = 1; p.lie = 0; p.wag = 0.3; p.turn = -0.3; }
    if (inK("rule")) { p.sit = 1; p.lie = 0; p.turn = 0.5 * sm(loc("rule") * 2 - 0.6); p.ears = 0.3; p.wag = 0.2; }
    if (inK("swap")) { const a = loc("swap"); p.sit = a < 0.45 ? 0 : 1; p.lie = a < 0.45 ? 0.2 : 0; p.headUp = a < 0.45 ? 0.1 + 0.9 * Math.abs(Math.sin(a * 30)) * 0 : 1; p.wag = 0.6; p.turn = a < 0.45 ? 0 : 0.6; }
    if (inK("lie")) { p.sit = 1; p.lie = 0; p.wag = 0.5; p.turn = 0.4; }
    if (inK("result")) { p.guilt = sm((t - fr("result").t0) / 0.6); p.lie = 0.8; p.wag = 0; p.turn = 0.25; }
    if (inK("reading")) { p.sit = 1; p.lie = 0; p.guilt = 1 - sm(loc("reading") * 1.6 - 0.4); p.turn = 0.4; p.wag = sm(loc("reading") * 2 - 1); }
    if (inK("tip")) { p.sit = 1; p.lie = 0; p.wag = 1; p.turn = 0.5; p.ears = 0.3; }
    if (inK("cta")) { p.lie = 0.3; p.wag = 1; p.tilt = 0.25; }
    // no "swap" o cachorro abaixa a cabeça até o petisco (primeira metade) e o petisco some
    if (inK("swap")) { const a = loc("swap"); if (a < 0.45) { p.headUp = 0.0; this.treat.visible = a < 0.3; } else { this.treat.visible = a < 0.6 || a > 2; } }
    this.dog.pose(p);
    // ---- dona
    const O = this.ownerS; const door = V(3.25, 0, -0.75), spot = V(2.75, 0, 0.25);
    let pos = spot.clone(), walk: number | undefined, vis = true, face: "smile" | "shock" | "neutral" | "talk" | "grin" = "neutral", fwdR = 0, armR = 0.18, elbowR = 0.25, lean = 0, mouth = 0, nod = 0;
    if (inK("hook") || inK("face") || inK("test") || inK("swap") || inK("signal") || inK("cta")) vis = false;
    if (inK("home")) { const c = sm(loc("home") * 1.6); pos = door.clone().lerp(spot, c); walk = c < 1 ? t * 1.6 : undefined; face = c > 0.8 ? "shock" : "smile"; }
    if (inK("knows")) { face = "talk"; mouth = 0.5 + 0.5 * Math.sin(t * 18); fwdR = 1.3; elbowR = 0.1; nod = 0.25; }
    if (inK("rule")) { const a = loc("rule"); if (a < 0.55) { pos = V(2.45, 0, 1.0); lean = 0.35; fwdR = 1.0; armR = 0.1; face = "talk"; mouth = 0.5 + 0.5 * Math.sin(t * 16); } else { const c = sm((a - 0.55) / 0.45); pos = V(2.45, 0, 1.0).lerp(door, c); walk = t * 1.6; } }
    if (inK("lie")) { pos = V(3.0, 0, -0.35); face = "shock"; }
    if (inK("result")) { face = "talk"; mouth = 0.5 + 0.5 * Math.sin(t * 20); fwdR = 1.35; elbowR = 0.05; nod = 0.3; }
    if (inK("reading")) { const c = sm(loc("reading") * 1.5 - 0.3); face = c > 0.5 ? "smile" : "neutral"; nod = 0.35; }
    if (inK("tip")) { const a = loc("tip"); pos = V(2.4, 0, 1.55); lean = a < 0.5 ? 0.55 * sm(a * 3) : 0.55 * (1 - sm((a - 0.5) * 3)); fwdR = 0.9 * (a < 0.6 ? sm(a * 3) : 1); face = "grin"; }
    O.root.visible = vis; O.root.position.copy(pos);
    const tgt = this.dog.root.position;
    O.root.rotation.y = walk !== undefined && inK("rule") ? Math.atan2(door.x - pos.x, door.z - pos.z) : Math.atan2(tgt.x - pos.x, tgt.z - pos.z);
    O.pose({ t, walk, face, fwdR, armR, elbowR, lean, mouth, nod, blink: Math.floor(t * 0.7 % 3.1 * 10) === 0 ? 1 : 0 });
    // chinelo na mão no "tip"
    if (inK("tip") && loc("tip") > 0.35) { O.hold.add(this.slipper); this.slipper.position.set(0, -0.06, 0.05); this.slipper.rotation.set(0.3, 0, 1.4); }
    else if (this.slipper.parent !== this.dog.root.parent) { this.dog.root.parent!.add(this.slipper); this.slipper.position.set(2.12, 0.0, 1.95); this.slipper.rotation.set(0, 0.6, 0); }
    // ---- pesquisadora
    const Sc = this.sci; Sc.root.visible = ["test", "swap", "lie"].includes(s.k);
    let sp = V(3.05, 0, 1.95), sf: "smile" | "talk" | "neutral" = "smile", sfwd = 0, slean = 0, smouth = 0;
    if (inK("test")) { sp = V(3.0, 0, 1.8); sfwd = 0.7; }
    if (inK("swap")) { const a = loc("swap"); sp = V(2.6, 0, 2.2); if (a > 0.45) { slean = 0.6 * sm((a - 0.45) * 5) * (1 - sm((a - 0.75) * 5)); sfwd = 1.0 * sm((a - 0.45) * 5); } }
    if (inK("lie")) { sp = V(3.15, 0, 0.45); sf = "talk"; smouth = 0.5 + 0.5 * Math.sin(t * 17); }
    Sc.root.position.copy(sp);
    Sc.root.rotation.y = inK("lie") ? Math.atan2(3.0 - sp.x, -0.35 - sp.z) : Math.atan2(2.0 - sp.x, 1.9 - sp.z);
    Sc.pose({ t, face: sf, fwdR: sfwd, lean: slean, mouth: smouth });
    // ---- floresta: o pequeno abaixa a cabeça e lambe o focinho para o grande
    const a = inK("signal") ? loc("signal") : 0;
    this.big.pose({ t, lie: 0, headUp: 1, ears: 0.8, wag: 0.1, worried: 0 });
    this.small.pose({ t, lie: 0.2 + 0.4 * sm(a * 3), guilt: sm(a * 3), wag: 0.3, headUp: 1 });
    // luzes
    const forest = s.set === "forest";
    this.moon.visible = !forest; this.lamp.visible = !forest; this.fMoon.visible = forest;
    this.hemi.intensity = forest ? 1.0 : 1.45;
    this.lamp.intensity = 14;
    void eo; void L;
    return s;
  }
}
