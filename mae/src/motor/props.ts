// Objetos 3D de verdade (com volume, contorno do ink e sombra). Cada tipo vira um Group criado uma vez por vaga.
import * as THREE from "three";
import { Batch, boxGeo, V, lam } from "./build";
import { ctex } from "./paint";
import { textTex } from "./sets";

const at = (x: number, y: number, z: number) => new THREE.Matrix4().makeTranslation(x, y, z);
const cyl = (r0: number, r1: number, h: number, n = 32) => new THREE.CylinderGeometry(r1, r0, h, n).translate(0, h / 2, 0);
const L = (c: string) => lam("pp" + c, () => ({ color: c }));

const controleDesenhado = () => ctex("ctrlDesenho", 512, 512, (g) => {
  g.fillStyle = "#caa173"; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = "#1d1a2a"; g.lineWidth = 10; g.lineCap = "round";
  g.beginPath(); g.roundRect(70, 170, 372, 180, 80); g.stroke();
  g.beginPath(); g.moveTo(150, 230); g.lineTo(150, 300); g.moveTo(115, 265); g.lineTo(185, 265); g.stroke();
  for (const [x, y] of [[350, 230], [390, 265], [350, 300], [310, 265]]) { g.beginPath(); g.arc(x, y, 16, 0, 7); g.stroke(); }
  g.font = "700 52px sans-serif"; g.fillStyle = "#1d1a2a"; g.fillText("VIDEOGAME", 110, 120);
});
const desenhoTex = () => ctex("desenhoMae", 512, 384, (g) => {
  g.fillStyle = "#ffffff"; g.fillRect(0, 0, 512, 384);
  g.lineWidth = 9; g.lineCap = "round";
  g.strokeStyle = "#e2453c"; g.beginPath(); g.arc(170, 120, 48, 0, 7); g.stroke(); g.beginPath(); g.moveTo(170, 168); g.lineTo(170, 290); g.moveTo(110, 210); g.lineTo(230, 210); g.moveTo(170, 290); g.lineTo(130, 350); g.moveTo(170, 290); g.lineTo(210, 350); g.stroke();
  g.strokeStyle = "#3f9a5a"; g.beginPath(); g.arc(340, 170, 36, 0, 7); g.stroke(); g.beginPath(); g.moveTo(340, 206); g.lineTo(340, 300); g.moveTo(290, 240); g.lineTo(390, 240); g.moveTo(340, 300); g.lineTo(310, 350); g.moveTo(340, 300); g.lineTo(370, 350); g.stroke();
  g.fillStyle = "#e8507a"; g.beginPath(); g.moveTo(256, 90); g.bezierCurveTo(226, 50, 180, 70, 206, 110); g.lineTo(256, 160); g.lineTo(306, 110); g.bezierCurveTo(332, 70, 286, 50, 256, 90); g.fill();
  g.fillStyle = "#f3b81f"; g.beginPath(); g.arc(450, 60, 34, 0, 7); g.fill();
  g.font = "700 40px sans-serif"; g.fillStyle = "#3f6fb5"; g.fillText("MÃE", 40, 50);
});
const provaTex = () => ctex("prova", 384, 512, (g) => {
  g.fillStyle = "#ffffff"; g.fillRect(0, 0, 384, 512);
  g.fillStyle = "#9aa3b5"; for (let y = 120; y < 480; y += 40) g.fillRect(30, y, 320, 4);
  g.font = "800 44px sans-serif"; g.fillStyle = "#1d1a2a"; g.fillText("PROVA", 30, 70);
  g.strokeStyle = "#e0262a"; g.lineWidth = 10; g.beginPath(); g.arc(270, 260, 90, 0, 7); g.stroke();
  g.font = "900 110px sans-serif"; g.fillStyle = "#e0262a"; g.fillText("2,0", 190, 300);
});

type Maker = () => THREE.Group;
const grp = (fill: (b: Batch) => void): THREE.Group => { const g = new THREE.Group(), b = new Batch(); fill(b); b.build(g); return g; };

export const PROPS: Record<string, Maker> = {
  // pão de forma, ovo frito e meia salsicha num prato
  hamburguerTriste: () => grp((b) => {
    b.add(cyl(0.2, 0.2, 0.02, 32), L("#f4f1ea"));
    b.add(boxGeo(V(-0.1, 0.02, -0.1), V(0.1, 0.05, 0.1)), L("#e9c48a"));
    b.add(cyl(0.085, 0.085, 0.012, 24), L("#ffffff"), at(0, 0.05, 0));
    b.add(cyl(0.035, 0.035, 0.02, 16), L("#f3b81f"), at(0.01, 0.055, 0.01));
    b.add(new THREE.CapsuleGeometry(0.018, 0.06, 4, 8).rotateZ(Math.PI / 2), L("#c9573e"), at(0.02, 0.075, -0.04));
    b.add(boxGeo(V(-0.1, 0.08, -0.1), V(0.1, 0.11, 0.1)), L("#e9c48a"));
  }),
  hamburguerBom: () => grp((b) => {
    b.add(cyl(0.12, 0.12, 0.04, 32), L("#d9933f"));
    b.add(cyl(0.13, 0.13, 0.03, 32), L("#5a3322"), at(0, 0.04, 0));
    b.add(cyl(0.135, 0.135, 0.012, 32), L("#6bbf4a"), at(0, 0.07, 0));
    b.add(new THREE.SphereGeometry(0.125, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), L("#d9933f"), at(0, 0.082, 0));
  }),
  // a meia-boneco com dois botões
  clebinho: () => grp((b) => {
    // meia em pé com o pé virado para a câmera: cano listrado, calcanhar, dois botões e boca costurada
    b.add(cyl(0.085, 0.08, 0.26, 20), L("#d9dce4"), at(0, 0.0, 0));
    for (const y of [0.04, 0.12, 0.2]) b.add(cyl(0.087, 0.087, 0.03, 20), L("#e2453c"), at(0, y, 0));
    b.add(new THREE.CapsuleGeometry(0.08, 0.12, 6, 16).rotateX(Math.PI / 2), L("#d9dce4"), at(0, 0.3, -0.07));
    for (const s of [-1, 1]) { b.add(cyl(0.028, 0.028, 0.012, 16).rotateX(Math.PI / 2), L("#1d1a2a"), at(s * 0.035, 0.34, -0.155)); }
    b.add(boxGeo(V(-0.035, 0.285, -0.165), V(0.035, 0.295, -0.15)), L("#c0302c"));
  }),
  caixaVG: () => grp((b) => {
    b.add(boxGeo(V(-0.45, 0, -0.3), V(0.45, 0.4, 0.3)), L("#caa173"));
    b.add(boxGeo(V(-0.45, 0.4, -0.3), V(0.45, 0.405, 0.3)), lam("ppCtrl", () => ({ map: controleDesenhado() })));
    b.add(boxGeo(V(-0.45, 0.05, -0.305), V(0.45, 0.35, -0.3)), lam("ppCtrlF", () => ({ map: controleDesenhado() })));
  }),
  controle: () => grp((b) => {
    b.add(boxGeo(V(-0.1, 0, -0.04), V(0.1, 0.03, 0.04)), L("#2b2d36"));
    for (const s of [-1, 1]) b.add(cyl(0.045, 0.045, 0.03, 16), L("#2b2d36"), at(s * 0.1, 0, 0));
    b.add(cyl(0.012, 0.012, 0.01, 8), L("#e2453c"), at(0.09, 0.03, 0));
  }),
  piscina: () => grp((b) => {
    b.add(new THREE.TorusGeometry(1.4, 0.22, 12, 48).rotateX(Math.PI / 2), L("#3fa0e0"), at(0, 0.22, 0));
    b.add(new THREE.TorusGeometry(1.4, 0.2, 12, 48).rotateX(Math.PI / 2), L("#f3d35a"), at(0, 0.6, 0));
    b.add(cyl(1.42, 1.42, 0.5, 48), L("#8fd3f5"), at(0, 0.0, 0));
  }),
  areia: () => grp((b) => { b.add(new THREE.ConeGeometry(1.1, 0.8, 24).translate(0, 0.4, 0), L("#e3c27a")); b.add(new THREE.SphereGeometry(0.12, 8, 6), L("#d9b56a"), at(0.6, 0.05, 0.3)); }),
  balde: () => grp((b) => { b.add(new THREE.CylinderGeometry(0.17, 0.13, 0.3, 20, 1, true).translate(0, 0.15, 0), L("#e2453c")); b.add(cyl(0.13, 0.13, 0.01, 20), L("#e2453c")); }),
  guardasol: () => grp((b) => { b.add(cyl(0.03, 0.03, 2.2, 8), L("#f4f1ea")); b.add(new THREE.ConeGeometry(1.3, 0.5, 12, 1, true).translate(0, 2.2, 0), L("#e2453c")); }),
  prato: () => grp((b) => { b.add(cyl(0.18, 0.18, 0.02, 24), L("#f4f1ea")); b.add(new THREE.SphereGeometry(0.1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), L("#c98a3a"), at(0, 0.02, 0)); }),
  carro: () => grp((b) => {
    b.add(boxGeo(V(-0.9, 0.3, -2.0), V(0.9, 1.0, 2.0)), L("#3f6fb5"));
    b.add(boxGeo(V(-0.8, 1.0, -1.0), V(0.8, 1.6, 0.9)), L("#3f6fb5"));
    b.add(boxGeo(V(-0.81, 1.08, -0.9), V(0.81, 1.5, 0.8)), L("#bfe0f2"));
    for (const [x, z] of [[-0.9, -1.3], [0.9, -1.3], [-0.9, 1.3], [0.9, 1.3]]) b.add(cyl(0.34, 0.34, 0.22, 20).rotateZ(Math.PI / 2), L("#2b2d36"), at(x, 0.34, z));
    b.add(boxGeo(V(-1.0, 1.62, -1.4), V(1.0, 1.7, 1.4)), L("#f3d35a")); // prancha no teto
  }),
  onibus: () => grp((b) => {
    b.add(boxGeo(V(-1.25, 0.4, -5.5), V(1.25, 3.2, 5.5)), L("#f2c84b"));
    b.add(boxGeo(V(-1.26, 1.7, -5.2), V(1.26, 2.7, 5.0)), L("#bfe0f2"));
    b.add(boxGeo(V(-1.26, 0.9, -5.5), V(1.26, 1.2, 5.5)), L("#2f8a4f"));
    for (const [x, z] of [[-1.2, -3.8], [1.2, -3.8], [-1.2, 3.8], [1.2, 3.8]]) b.add(cyl(0.5, 0.5, 0.3, 20).rotateZ(Math.PI / 2), L("#2b2d36"), at(x, 0.5, z));
  }),
  aviao: () => grp((b) => {
    b.add(new THREE.CapsuleGeometry(1.4, 12, 8, 20).rotateX(Math.PI / 2), L("#f4f1ea"));
    b.add(boxGeo(V(-9, -0.2, -1.5), V(9, 0.2, 1.5)), L("#d9dde4"));
    b.add(boxGeo(V(-3, -0.15, 5.4), V(3, 0.15, 6.6)), L("#d9dde4"));
    b.add(boxGeo(V(-0.15, 0, 5.2), V(0.15, 3.2, 6.8)), L("#e2453c"));
    for (let i = -4; i <= 4; i++) b.add(cyl(0.18, 0.18, 0.05, 12).rotateZ(Math.PI / 2), L("#3f6fb5"), at(1.38, 0.5, i * 1.2));
  }),
  prova: () => grp((b) => { b.add(boxGeo(V(-0.21, 0, -0.28), V(0.21, 0.004, 0.28)), lam("ppProva", () => ({ map: provaTex() }))); }),
  desenho: () => grp((b) => { b.add(boxGeo(V(-0.3, -0.22, 0), V(0.3, 0.22, 0.006)), lam("ppDesenho", () => ({ map: desenhoTex() }))); }),
  bicicleta: () => grp((b) => {
    for (const z of [-0.55, 0.55]) b.add(new THREE.TorusGeometry(0.33, 0.035, 8, 32).rotateY(Math.PI / 2), L("#2b2d36"), at(0, 0.35, z));
    b.add(boxGeo(V(-0.03, 0.35, -0.55), V(0.03, 0.4, 0.55)), L("#e2453c"));
    b.add(boxGeo(V(-0.03, 0.4, -0.1), V(0.03, 0.9, -0.05)), L("#e2453c"));
    b.add(boxGeo(V(-0.25, 0.95, 0.45), V(0.25, 0.99, 0.5)), L("#2b2d36"));
    b.add(boxGeo(V(-0.03, 0.4, 0.45), V(0.03, 0.97, 0.5)), L("#e2453c"));
  }),
  celular: () => grp((b) => { b.add(boxGeo(V(-0.04, 0, -0.08), V(0.04, 0.012, 0.08)), L("#1d1a2a")); }),
  mesaJanta: () => grp((b) => {
    b.add(boxGeo(V(-0.9, 0.74, -0.55), V(0.9, 0.82, 0.55)), L("#b07a4c"));
    for (const [x, z] of [[-0.8, -0.45], [0.8, -0.45], [-0.8, 0.45], [0.8, 0.45]]) b.add(boxGeo(V(x - 0.04, 0, z - 0.04), V(x + 0.04, 0.74, z + 0.04)), L("#7a4f33"));
    for (const x of [-0.45, 0.45]) { b.add(cyl(0.16, 0.16, 0.02, 24), L("#f4f1ea"), at(x, 0.82, 0)); b.add(new THREE.SphereGeometry(0.09, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), L("#e9e2d3"), at(x, 0.84, 0)); }
  }),
  banquinho: () => grp((b) => { b.add(cyl(0.2, 0.2, 0.05, 20), L("#b07a4c"), at(0, 0.3, 0)); for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; b.add(cyl(0.025, 0.025, 0.3, 8), L("#7a4f33"), at(Math.cos(a) * 0.14, 0, Math.sin(a) * 0.14)); } }),
  montanha: () => grp((b) => { b.add(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), L("#5f9a4a"), new THREE.Matrix4().makeScale(90, 40, 40)); b.add(new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), L("#6aa24e"), new THREE.Matrix4().makeTranslation(-70, 0, -10).multiply(new THREE.Matrix4().makeScale(60, 32, 30))); }),
  maca: () => grp((b) => { b.add(boxGeo(V(-1, 0, -0.35), V(1, 0.75, 0.35)), L("#f4f1ea")); }),
  placaVacina: () => grp((b) => { b.add(boxGeo(V(-0.8, 0, -0.03), V(0.8, 0.45, 0.03)), lam("ppVac", () => ({ map: textTex("vacina", 512, 144, "#2f8a4f", "#ffffff", "VACINAÇÃO", 84) }))); }),
  microfone: () => grp((b) => { b.add(cyl(0.02, 0.02, 0.3, 8), L("#2b2d36")); b.add(new THREE.SphereGeometry(0.05, 12, 8), L("#3a3440"), at(0, 0.32, 0)); }),
  lupa: () => grp((b) => { b.add(new THREE.TorusGeometry(0.12, 0.02, 8, 24), L("#2b2d36"), at(0, 0.3, 0)); b.add(cyl(0.02, 0.02, 0.2, 8), L("#7a4f33")); }),
};

/** vagas de props por tipo: a mesma peça pode aparecer mais de uma vez no plano */
export class PropRack {
  private slots = new Map<string, THREE.Group[]>();
  constructor(private root: THREE.Object3D) {}
  begin() { for (const l of this.slots.values()) for (const g of l) g.visible = false; this.used.clear(); }
  private used = new Map<string, number>();
  place(k: string, x: number, y: number, z: number, s = 1, yaw = 0, roll = 0, pitch = 0) {
    const make = PROPS[k]; if (!make) return;
    const i = this.used.get(k) ?? 0; this.used.set(k, i + 1);
    let l = this.slots.get(k); if (!l) { l = []; this.slots.set(k, l); }
    while (l.length <= i) { const g = make(); g.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true; } }); this.root.add(g); l.push(g); }
    const g = l[i]; g.visible = true; g.position.set(x, y, z); g.rotation.set(pitch, yaw, roll, "YXZ"); g.scale.setScalar(s);
  }
}
