// Pawslated v3 ep4 — "Your Christmas tree looks like a giant toy" (27/11/2026). Sala do ep3 com árvore de Natal.
// Fatos: Cornell Riney Canine Health Center (tinsel/enfeites → obstrução; chocolate: metilxantinas, o amargo é pior);
// ASPCA / VCA (água da árvore cria bactéria e pode ter fertilizante); AVMA (enfeite quebra e é engolido; amarrar a árvore).
import * as THREE from "three";
import { toon } from "./chars";
import { Dog } from "./dog";
import { NOINK } from "./ink";
import { Tempos, Shot, V, sm, eo, M, RB, glow, blob } from "./world";
import { FireworksWorld } from "./world3";

const ORN = ["#E63946", "#F4D35E", "#4EA8DE", "#E76FA8", "#F4A261"];
export class TreeWorld extends FireworksWorld {
  tree = new THREE.Group();
  bulbs: THREE.Mesh[] = [];
  ornLow: THREE.Group[] = [];
  tinsel: THREE.Mesh[] = [];
  strand = new THREE.Mesh();
  waterBubbles: THREE.Mesh[] = [];
  skirt = new THREE.Mesh();
  rope = new THREE.Mesh();
  table = new THREE.Group();
  choc = new THREE.Group();
  cabinet = new THREE.Group();
  shards: THREE.Mesh[] = [];
  glassOrn = new THREE.Mesh();
  snow: THREE.Mesh[] = [];
  gift = new THREE.Group();
  lid = new THREE.Mesh();
  rim = new THREE.DirectionalLight("#9FD0FF", 1.6);
  constructor(T: Tempos) {
    super(T);
    for (const b of this.bursts) b.g.visible = false;
    this.bursts = [];
    this.den.visible = false;
    this.buildTree();
    this.makeShots4();
  }
  makeShots3() { /* substituído */ }

  buildTree() {
    const r = this.lr;
    const tr = this.tree; tr.position.set(2.05, 0, -1.35); r.add(tr);
    tr.add(M(new THREE.CylinderGeometry(0.33, 0.28, 0.22, 24), toon("#B23A3A"), V(0, 0.11, 0)));
    const water = M(new THREE.CircleGeometry(0.29, 24).rotateX(-Math.PI / 2), glow("#5FA8D3"), V(0, 0.225, 0), false); water.layers.set(NOINK); tr.add(water);
    tr.add(M(new THREE.CylinderGeometry(0.06, 0.07, 0.4, 10), toon("#5A3B26"), V(0, 0.35, 0)));
    const greens = [toon("#1E7B4E"), toon("#25935C"), toon("#1A6A43")];
    const H = [[0.85, 1.0, 0.95], [0.68, 0.85, 1.45], [0.5, 0.7, 1.9], [0.3, 0.55, 2.3]];
    H.forEach(([rad, h, y], i) => tr.add(M(new THREE.ConeGeometry(rad, h, 14), greens[i % 3], V(0, y, 0))));
    const star = M(new THREE.OctahedronGeometry(0.12), glow("#FFE066"), V(0, 2.62, 0), false); star.layers.set(NOINK); star.scale.set(1, 1.3, 0.4); tr.add(star);
    // luzes em espiral
    for (let i = 0; i < 42; i++) { const u = i / 42, a = u * Math.PI * 9, y = 0.55 + u * 1.95, rad = 0.82 * (1 - u) + 0.08;
      const b = M(new THREE.SphereGeometry(0.03, 8, 6), glow(["#FFD166", "#FF6B6B", "#7BDFF2", "#B8F2A4"][i % 4]), V(Math.cos(a) * rad, y, Math.sin(a) * rad), false); b.layers.set(NOINK); tr.add(b); this.bulbs.push(b); }
    // bolas altas (fixas) e baixas (sobem no "high")
    for (let i = 0; i < 9; i++) { const u = 0.3 + (i / 9) * 0.6, a = i * 2.1, y = 0.55 + u * 1.9, rad = 0.82 * (1 - u) + 0.14;
      tr.add(M(new THREE.SphereGeometry(0.065, 16, 12), toon(ORN[i % 5]), V(Math.cos(a) * rad, y - 0.05, Math.sin(a) * rad))); }
    for (let i = 0; i < 4; i++) { const g = new THREE.Group(); const a = -0.6 + i * 0.55; g.add(M(new THREE.SphereGeometry(0.075, 16, 12), toon(ORN[(i + 2) % 5]), V(0, 0, 0)));
      const hl = M(new THREE.SphereGeometry(0.02, 8, 6), glow("#ffffff"), V(0.03, 0.03, 0.06), false); hl.layers.set(NOINK); g.add(hl);
      g.position.set(Math.cos(a) * 0.86, 0.62, Math.sin(a) * 0.86 + 0.05); g.userData.y0 = 0.62; g.userData.a = a; tr.add(g); this.ornLow.push(g); }
    // festão (tinsel) em espiral
    for (let k = 0; k < 2; k++) { const pts: THREE.Vector3[] = []; for (let i = 0; i <= 80; i++) { const u = i / 80, a = u * Math.PI * 5 + k * Math.PI, y = 0.5 + u * 1.8 + k * 0.12, rad = 0.86 * (1 - u) + 0.1; pts.push(V(Math.cos(a) * rad, y + Math.sin(i * 1.7) * 0.02, Math.sin(a) * rad)); }
      const m = M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.018, 6, false), toon("#DDE3EA"), V(0, 0, 0)); tr.add(m); this.tinsel.push(m); }
    // fio solto (na boca do cachorro)
    { const pts: THREE.Vector3[] = []; for (let i = 0; i <= 20; i++) pts.push(V(i * 0.03, Math.sin(i * 1.4) * 0.025, Math.cos(i * 1.1) * 0.02)); this.strand = M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.012, 6, false), toon("#DDE3EA"), V(0, 0, 0)); }
    // saia da árvore (cobre a água no "skip")
    this.skirt = M(new THREE.CylinderGeometry(0.42, 0.75, 0.12, 28, 1, true), toon("#C1121F"), V(0, 0.26, 0)); (this.skirt.material as THREE.MeshToonMaterial).side = THREE.DoubleSide; tr.add(this.skirt);
    const sk2 = M(new THREE.RingGeometry(0.06, 0.42, 28).rotateX(-Math.PI / 2), toon("#C1121F"), V(0, 0.32, 0)); this.skirt.add(sk2); sk2.position.set(0, 0.06, 0);
    // corda amarrando a árvore na parede
    { const a = V(0.05, 2.15, 0), b = V(0.45, 2.4, -0.9); const d = b.clone().sub(a); this.rope = M(new THREE.CylinderGeometry(0.008, 0.008, d.length(), 6), toon("#F2E8CF"), a.clone().addScaledVector(d, 0.5)); this.rope.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); tr.add(this.rope); }
    // bolhas verdes (bactéria) na água
    for (let i = 0; i < 10; i++) { const b = M(new THREE.SphereGeometry(0.025 + (i % 3) * 0.01, 8, 6), glow("#8BE04E"), V(0, 0, 0), false); b.layers.set(NOINK); tr.add(b); this.waterBubbles.push(b); }
    // enfeite de vidro que cai e quebra
    this.glassOrn = M(new THREE.SphereGeometry(0.08, 16, 12), toon("#7FD1F7"), V(0, 0, 0)); r.add(this.glassOrn);
    for (let i = 0; i < 10; i++) { const s = M(new THREE.TetrahedronGeometry(0.03), toon("#9EDCF9"), V(0, 0, 0)); r.add(s); this.shards.push(s); }
    // presentes
    const gifts: [number, number, number, string, string][] = [[1.45, -0.85, 0.3, "#E63946", "#F4D35E"], [2.6, -0.8, 0.26, "#4EA8DE", "#FFFFFF"], [1.9, -0.55, 0.22, "#F4D35E", "#E63946"]];
    for (const [x, z, s, c, rb] of gifts) { r.add(M(RB(s, s, s, 0.02), toon(c), V(x, s / 2, z))); r.add(M(B2(s + 0.01, s + 0.01, 0.05), toon(rb), V(x, s / 2, z))); r.add(M(B2(0.05, s + 0.01, s + 0.01), toon(rb), V(x, s / 2, z))); }
    // presente do cachorro (abre no final)
    this.gift.add(M(RB(0.3, 0.22, 0.3, 0.02), toon("#7BD34A"), V(0, 0.11, 0)));
    this.lid = M(RB(0.32, 0.06, 0.32, 0.02), toon("#E63946"), V(0, 0.25, 0)); this.gift.add(this.lid);
    const bone = M(new THREE.CapsuleGeometry(0.03, 0.14, 4, 8), toon("#FBE7C6"), V(0, 0.2, 0)); bone.rotation.z = Math.PI / 2; this.gift.add(bone);
    this.gift.position.set(1.05, 0, -0.35); r.add(this.gift);
    // mesinha de centro com caixa de chocolate
    this.table.add(M(RB(1.0, 0.06, 0.55, 0.02), toon("#8C5A3C"), V(0, 0.4, 0)));
    for (const [x, z] of [[-0.42, -0.2], [0.42, -0.2], [-0.42, 0.2], [0.42, 0.2]]) this.table.add(M(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8), toon("#6B4329"), V(x, 0.2, z)));
    this.table.position.set(-1.0, 0, -0.35); r.add(this.table);
    this.choc.add(M(RB(0.34, 0.07, 0.22, 0.02), toon("#5B2C1A"), V(0, 0.035, 0)));
    this.choc.add(M(B2(0.35, 0.075, 0.04), toon("#F4D35E"), V(0, 0.035, 0)));
    for (let i = 0; i < 3; i++) this.choc.add(M(RB(0.07, 0.03, 0.07, 0.01), toon("#3B1A10"), V(-0.1 + i * 0.1, 0.085, 0.02)));
    r.add(this.choc);
    // armário (chocolate vai para lá)
    this.cabinet.add(M(RB(0.7, 0.85, 0.45, 0.03), toon("#B07A4E"), V(0, 0.425, 0)));
    this.cabinet.add(M(new THREE.SphereGeometry(0.03, 8, 6), toon("#F2C230"), V(0.08, 0.5, 0.24)));
    this.cabinet.position.set(-2.75, 0, 0.35); this.cabinet.rotation.y = Math.PI / 2; r.add(this.cabinet);
    // neve lá fora
    let s0 = 5; const rnd = () => { s0 = (s0 * 16807) % 2147483647; return s0 / 2147483647; };
    for (let i = 0; i < 80; i++) { const m = M(new THREE.SphereGeometry(0.03, 6, 5), glow("#FFFFFF"), V(-0.8 + rnd() * 3.0, rnd() * 4, -3.2 - rnd() * 2), false); m.layers.set(NOINK); m.userData.v = 0.25 + rnd() * 0.3; m.userData.p = rnd() * 6; r.add(m); this.snow.push(m); }
    // sombras de contato e luz de contorno
    this.dog.root.add(blob(0.8, 1.1)); this.ownerS.root.add(blob(0.7, 0.7)); tr.add(blob(2.2, 2.2));
    this.rim.position.set(0, 3, -4); r.add(this.rim, this.rim.target);
  }

  makeShots4() {
    const d = () => this.dog.head.getWorldPosition(new THREE.Vector3());
    const o = () => this.ownerS.head.getWorldPosition(new THREE.Vector3());
    const wt = (k: string, re: RegExp) => this.T.palavras.find((w) => w.k === k && re.test(w.w))!.t0;
    const S = (k: string, c0: THREE.Vector3, c1: THREE.Vector3, l0: THREE.Vector3, l1: THREE.Vector3, fov: number, focus: () => THREE.Vector3, a?: number, roll = 0): Shot => {
      const fr = this.fr(k); return { k, set: "room", a: a ?? fr.t0 - 0.06, b: 0, cam: [c0, c1], look: [l0, l1], fov, focus, roll };
    };
    const TR = V(2.05, 1.3, -1.35);
    const sh: Shot[] = [
      S("hook", V(0.55, 0.45, 1.45), V(0.65, 0.4, 1.25), V(1.6, 1.35, -1.2), V(1.65, 1.45, -1.2), 50, () => TR, 0, 0.06),
      S("shiny", V(1.4, 1.5, 0.3), V(1.45, 1.45, 0.15), V(2.05, 1.35, -1.35), V(2.05, 1.3, -1.35), 48, () => TR),
      { ...S("shiny", V(1.35, 0.95, 0.15), V(1.45, 0.9, 0.0), V(1.95, 0.68, -0.8), V(1.95, 0.65, -0.8), 46, () => V(1.95, 0.62, -0.8)), a: wt("shiny", /Hanging/) - 0.06 },
      { ...S("shiny", V(1.3, 0.75, 0.45), V(1.4, 0.7, 0.3), V(2.05, 0.2, -1.15), V(2.05, 0.2, -1.15), 48, () => V(2.05, 0.2, -1.2)), a: wt("shiny", /water/) - 0.06 },
      S("vets", V(1.25, 3.1, 0.65), V(1.2, 3.0, 0.5), V(1.1, 0.2, -0.75), V(1.1, 0.2, -0.8), 52, d, undefined, -0.1),
      S("tinsel", V(0.35, 0.95, 0.95), V(0.45, 0.9, 0.8), V(1.45, 0.6, -0.9), V(1.45, 0.6, -0.9), 52, d),
      S("water", V(0.95, 0.85, 0.65), V(1.05, 0.8, 0.5), V(1.8, 0.3, -1.25), V(1.8, 0.28, -1.25), 50, d),
      S("choc", V(-0.65, 1.05, 1.45), V(-0.75, 1.0, 1.3), V(-0.8, 0.5, -0.35), V(-0.8, 0.5, -0.35), 46, d, undefined, -0.05),
      S("orn", V(1.35, 0.85, 0.85), V(1.4, 0.8, 0.7), V(1.6, 0.45, -0.75), V(1.6, 0.42, -0.75), 50, () => V(1.7, 0.3, -0.75)),
      S("fix", V(0.6, 1.5, 2.6), V(0.4, 1.45, 2.4), V(0.4, 0.9, -0.6), V(0.4, 0.95, -0.6), 44, o),
      S("skip", V(0.35, 1.5, 1.5), V(0.55, 1.45, 1.3), V(1.7, 1.0, -1.1), V(1.7, 0.9, -1.1), 52, () => TR),
      S("high", V(2.9, 1.6, 1.2), V(2.6, 1.7, 1.5), V(1.4, 0.9, -0.9), V(-0.6, 0.8, -0.2), 46, o),
      S("tie", V(0.9, 2.2, 1.4), V(1.1, 2.15, 1.2), V(2.1, 1.9, -1.5), V(2.15, 2.05, -1.6), 42, () => V(2.2, 2.2, -1.7)),
      S("safe", V(0.15, 1.05, 1.45), V(0.3, 1.0, 1.25), V(0.95, 0.4, -0.2), V(0.95, 0.4, -0.2), 50, d),
      S("cta", V(1.05, 0.95, 1.9), V(1.0, 1.0, 2.1), V(1.0, 0.55, 0.4), V(1.0, 0.55, 0.4), 44, d),
    ];
    sh.sort((x, y) => x.a - y.a);
    for (let i = 0; i < sh.length; i++) sh[i].b = i + 1 < sh.length ? sh[i + 1].a : this.T.total + 1;
    this.shots = sh;
  }

  update(f: number, cam: THREE.PerspectiveCamera) {
    const t = f / 30, s = this.shotAt(t), u = (t - s.a) / Math.max(0.1, s.b - s.a), k = sm(u);
    cam.position.lerpVectors(s.cam[0], s.cam[1], k);
    const lk = new THREE.Vector3().lerpVectors(s.look[0], s.look[1], k);
    cam.lookAt(lk); if (s.roll) cam.rotateZ(s.roll);
    cam.fov = s.fov; cam.updateProjectionMatrix();
    // luz de contorno sempre atrás do assunto (recorta o personagem do fundo)
    const back = lk.clone().sub(cam.position).setY(0).normalize();
    this.rim.position.copy(lk).addScaledVector(back, 3).add(V(0, 2.2, 0)); this.rim.target.position.copy(lk);
    const fr = (key: string) => this.fr(key);
    const inK = (key: string) => s.k === key;
    const loc = (key: string) => (t - fr(key).t0) / Math.max(0.1, fr(key).t1 - fr(key).t0);
    const wd = (key: string, re: RegExp) => this.T.palavras.find((w) => w.k === key && re.test(w.w))!.t0;
    const after = (key: string) => t >= fr(key).t0;
    // luzes piscando, neve
    this.bulbs.forEach((b, i) => { b.scale.setScalar(0.75 + 0.45 * Math.max(0, Math.sin(t * 3 + i * 1.7))); });
    this.snow.forEach((m) => { m.position.y = 4 - ((t * m.userData.v + m.userData.p) % 4); m.position.x += Math.sin(t + m.userData.p) * 0.0008; });
    // conserto: festão some, saia cobre a água, bolas sobem, chocolate vai pro armário, corda aparece
    const kSkipT = sm((t - wd("skip", /tinsel/)) / 0.5), kCover = sm((t - wd("skip", /Cover/)) / 0.5);
    this.tinsel.forEach((m) => { m.scale.setScalar(Math.max(0.001, 1 - kSkipT)); m.visible = kSkipT < 0.99; });
    this.skirt.scale.set(1, Math.max(0.001, kCover), 1); this.skirt.visible = kCover > 0.01;
    const kHigh = sm((t - wd("high", /Hang/)) / 0.8);
    this.ornLow.forEach((g, i) => { const y0 = g.userData.y0 as number, a = g.userData.a as number; const y = y0 + kHigh * (1.35 + i * 0.12); const rad = 0.82 * (1 - (y - 0.55) / 1.95) + 0.16; g.position.set(Math.cos(a) * rad, y, Math.sin(a) * rad); });
    const kLock = sm((t - wd("high", /Lock/)) / 0.7);
    const cp = V(-1.0, 0.43, -0.35).lerp(V(-2.75, 0.5, 0.35), kLock); cp.y += Math.sin(kLock * Math.PI) * 0.4;
    this.choc.position.copy(cp); this.choc.visible = kLock < 0.98; this.choc.rotation.y = kLock * 3;
    this.rope.visible = t >= wd("tie", /tie/) + 0.2;
    // água: bolhas verdes no "water"
    const bw = inK("water");
    this.waterBubbles.forEach((b, i) => { b.visible = bw; const ph = (t * 0.8 + i / 10) % 1; b.position.set(Math.cos(i * 2.3) * 0.18, 0.23 + ph * 0.35, Math.sin(i * 2.3) * 0.18); b.scale.setScalar(1 - ph * 0.6); });
    // enfeite de vidro cai e quebra
    const tOrn = fr("orn").t0 + 0.5, a0 = t - tOrn;
    const gp = V(1.88, 0.75, -0.72);
    this.glassOrn.visible = inK("orn") && a0 < 0.45; this.glassOrn.position.set(gp.x, Math.max(0.08, gp.y - Math.max(0, a0) ** 2 * 4.5), gp.z);
    this.shards.forEach((sm2, i) => { const on = inK("orn") && a0 >= 0.4; sm2.visible = on; if (!on) return; const q = Math.min(1, (a0 - 0.4) / 0.35); const ang = (i / 10) * Math.PI * 2; sm2.position.set(gp.x + Math.cos(ang) * 0.35 * eo(q), 0.03 + Math.sin(q * Math.PI) * 0.12, gp.z + Math.sin(ang) * 0.3 * eo(q)); sm2.rotation.set(i, q * 6, i * 2); });
    // ---- cachorro
    const D = this.dog;
    const p: Parameters<Dog["pose"]>[0] = { t, lie: 0, sit: 1, headUp: 1, wag: 0.6, ears: 0.2, eyes: 1, turn: 0 };
    let pos = V(1.0, 0, -0.85), ry = Math.PI / 2;
    if (inK("hook")) { p.tilt = 0.25 * sm((t - 0.6) / 0.5); p.ears = 0.6; p.wag = 0.9; pos = V(1.0, 0, -0.8); ry = Math.PI / 2; p.turn = 0.3; }
    if (inK("shiny")) { pos = V(1.0, 0, -0.85); p.ears = 0.5; p.wag = 0.8; }
    if (inK("vets")) { pos = V(1.0, 0, -0.8); ry = 0.3; p.worried = 0.6; p.turn = -0.2; p.wag = 0.1; }
    if (inK("tinsel")) { pos = V(1.15, 0, -0.9); ry = Math.PI / 2; p.sit = 0; p.lie = 0.2; p.headUp = 0.6; p.wag = 0.9; }
    if (inK("water")) { pos = V(1.25, 0, -1.3); ry = Math.PI / 2; p.sit = 0; p.headUp = 0.0; p.wag = 0.4; }
    if (inK("choc")) { pos = V(-0.2, 0, -0.35); ry = -Math.PI / 2; p.sit = 0; p.headUp = 1; p.turn = 0; p.wag = 0.7; p.ears = 0.4; }
    if (inK("orn")) { pos = V(1.05, 0, -0.75); ry = Math.PI / 2; const sc = sm((t - tOrn - 0.4) / 0.15); p.ears = sc; p.worried = sc; p.wag = 0.3 * (1 - sc); p.sit = 1 - sc * 0.5; }
    if (after("fix")) { pos = V(0.9, 0, 0.2); ry = 0.4; p.wag = 0.7; p.turn = 0.2; }
    if (inK("safe") || inK("cta")) { pos = inK("safe") ? V(0.55, 0, -0.3) : V(1.0, 0, 0.1); ry = inK("safe") ? Math.PI / 2 : 0; p.sit = 0; p.lie = 0.6; p.wag = 1; p.headUp = inK("safe") ? 0.5 : 1; p.turn = inK("cta") ? -0.45 : 0; p.tilt = inK("cta") ? 0.25 : 0; }
    D.root.position.copy(pos); D.root.rotation.y = ry; D.pose(p);
    // fio de festão na boca
    if (inK("tinsel")) { if (this.strand.parent !== D.head) { D.head.add(this.strand); this.strand.position.set(-0.08, -0.1, 0.3); this.strand.rotation.set(0, 0.5, 0.3); } this.strand.visible = true; } else this.strand.visible = false;
    // presente abrindo (só aparece no final)
    this.gift.visible = inK("safe") || inK("cta");
    const kOpen = sm((t - fr("safe").t0 - 0.9) / 0.6);
    this.lid.position.set(-0.12 * kOpen, 0.25 + 0.15 * Math.sin(kOpen * Math.PI), 0.1 * kOpen); this.lid.rotation.set(-1.2 * kOpen, 0, 0.4 * kOpen);
    // ---- dona
    const O = this.ownerS; O.root.visible = after("fix") && !inK("safe") && !inK("cta");
    let op = V(0.2, 0, 0.05), oy = 0.6, walk: number | undefined, fwdR = 0.2, elbowR = 0.3, fwdL = 0, lean = 0, face: "smile" | "grin" | "talk" = "grin";
    if (inK("fix")) { op = V(-0.6, 0, 0.6).lerp(V(0.3, 0, 0.1), sm(loc("fix") * 1.5)); walk = loc("fix") < 0.66 ? t * 1.7 : undefined; oy = 1.0; }
    if (inK("skip")) { op = V(1.3, 0, -0.55); oy = 0.9; fwdR = 1.4; elbowR = 0.2; fwdL = 1.1; face = "talk"; }
    if (inK("high")) { const a = loc("high"); op = a < 0.5 ? V(1.35, 0, -0.6) : V(1.35, 0, -0.6).lerp(V(-1.9, 0, 0.35), sm((a - 0.5) * 2.2)); walk = a > 0.5 && a < 0.95 ? t * 1.8 : undefined; oy = a < 0.5 ? 0.9 : -1.8; fwdR = a < 0.5 ? 2.4 : 0.8; elbowR = 0.2; }
    if (inK("tie")) { op = V(1.5, 0, -0.85); oy = 0.7; fwdR = 2.6; fwdL = 2.4; elbowR = 0.1; }
    O.root.position.copy(op); O.root.rotation.y = oy;
    O.pose({ t, walk, face, fwdR, fwdL, elbowR, lean, mouth: face === "talk" ? 0.4 + 0.4 * Math.sin(t * 15) : 0 });
    // luz
    this.hemi.intensity = 1.2; this.lamp.visible = false; this.flash.intensity = 0; this.bowl.visible = false; this.phone.visible = false; this.earRings.forEach((r) => (r.visible = false));
    this.warm.intensity = 13;
    return s;
  }
}
const B2 = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
