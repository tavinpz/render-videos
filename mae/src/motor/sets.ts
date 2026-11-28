// Cenários do Mãe Mandou: cada um num ponto do mundo (SETS[nome].o), longe dos outros para a névoa separar.
// Interiores: 3 paredes (fundo, esquerda, direita), frente aberta para a câmera, sem teto. Tudo 3D com contorno do ink.
import * as THREE from "three";
import { Batch, boxGeo, V, lam, house } from "./build";
import { ctex, rep, grassHD, roofHD } from "./paint";
import { D0, V3, hh } from "./base";

export type SetName = "cozinha" | "sala" | "quarto" | "mercado" | "escola" | "estudio" | "rua" | "quintal" | "posto";
export const SETS: Record<SetName, { o: V3; ext: boolean }> = {
  cozinha: { o: [0, 0, 0], ext: false },
  sala: { o: [200, 0, 0], ext: false },
  quarto: { o: [400, 0, 0], ext: false },
  mercado: { o: [600, 0, 0], ext: false },
  escola: { o: [800, 0, 0], ext: false },
  estudio: { o: [1000, 0, 0], ext: false },
  posto: { o: [1200, 0, 0], ext: false },
  rua: { o: [0, 0, -700], ext: true },
  quintal: { o: [700, 0, -700], ext: true },
};

const at = (x: number, y: number, z: number) => new THREE.Matrix4().makeTranslation(x, y, z);
const cyl = (r0: number, r1: number, h: number, n = 32) => new THREE.CylinderGeometry(r1, r0, h, n).translate(0, h / 2, 0);
const quadUp = (x0: number, x1: number, z0: number, z1: number, u: number, v: number, y = D0) => {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute([x0, y, z1, x1, y, z1, x1, y, z0, x0, y, z1, x1, y, z0, x0, y, z0], 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, u, 0, u, v, 0, 0, u, v, 0, v], 2));
  return g;
};

// ---------------- texturas pintadas ----------------
const wallTex = (col: string) => ctex("wall" + col, 512, 512, (g, r) => {
  g.fillStyle = col; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${r() < 0.5 ? "255,255,255" : "0,0,0"},0.025)`; g.fillRect(r() * 512, r() * 512, 6 + r() * 18, 6 + r() * 18); }
});
const tiles = (a: string, b: string, n = 8) => ctex("tiles" + a + b, 512, 512, (g) => {
  const s = 512 / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? a : b; g.fillRect(i * s, j * s, s, s); }
  g.strokeStyle = "rgba(60,50,60,0.35)"; g.lineWidth = 3;
  for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, 512); g.stroke(); g.beginPath(); g.moveTo(0, i * s); g.lineTo(512, i * s); g.stroke(); }
});
const planks = (col: string) => ctex("pl" + col, 512, 512, (g, r) => {
  g.fillStyle = col; g.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 64) {
    g.fillStyle = "rgba(60,35,20,0.5)"; g.fillRect(0, y, 512, 4);
    const off = (y / 64) % 2 ? 0 : 160; for (let x = off; x < 512; x += 320) g.fillRect(x, y, 4, 64);
    for (let k = 0; k < 6; k++) { g.fillStyle = `rgba(80,45,25,${0.06 + r() * 0.06})`; g.fillRect(r() * 512, y + 8 + r() * 48, 40 + r() * 120, 3); }
  }
});
const asphalt = () => ctex("asfalto", 512, 512, (g, r) => {
  g.fillStyle = "#5b5f6b"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(${r() < 0.5 ? "255,255,255" : "0,0,0"},0.06)`; g.fillRect(r() * 512, r() * 512, 3, 3); }
});
const lane = () => ctex("faixa", 64, 512, (g) => { g.fillStyle = "#5b5f6b"; g.fillRect(0, 0, 64, 512); g.fillStyle = "#f3d35a"; g.fillRect(20, 40, 24, 200); g.fillRect(20, 300, 24, 200); });
export const textTex = (key: string, w: number, h: number, bg: string, fg: string, txt: string, size: number) => ctex("tx" + key, w, h, (g) => {
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.fillStyle = fg; g.font = `900 ${size}px sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, w / 2, h / 2 + size * 0.05);
});
const board = () => ctex("lousa", 1024, 512, (g, r) => {
  g.fillStyle = "#2f5d46"; g.fillRect(0, 0, 1024, 512);
  g.strokeStyle = "rgba(255,255,255,0.75)"; g.lineWidth = 6; g.font = "700 64px sans-serif"; g.fillStyle = "rgba(255,255,255,0.8)";
  g.fillText("2 + 2 = 4", 80, 140); g.fillText("A B C", 80, 260); g.fillText("Lição de casa", 480, 400);
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(255,255,255,${0.04 + r() * 0.05})`; g.fillRect(r() * 1024, r() * 512, 80 + r() * 200, 20); }
});
const cityWall = () => ctex("telaJornal", 1024, 512, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#1c3f8f"); gr.addColorStop(1, "#4f8fe0"); g.fillStyle = gr; g.fillRect(0, 0, 1024, 512);
  g.fillStyle = "rgba(255,255,255,0.25)";
  for (let i = 0; i < 18; i++) { const w = 30 + ((i * 37) % 50), h = 80 + ((i * 53) % 220); g.fillRect(i * 58, 512 - h, w, h); }
});
const products = () => ctex("produtos", 512, 512, (g, r) => {
  const cols = ["#e2453c", "#f3d35a", "#3f6fb5", "#2f8a4f", "#f08a2c", "#ffffff", "#7b5ac9", "#e86e9a"];
  g.fillStyle = "#e9e4da"; g.fillRect(0, 0, 512, 512);
  for (let row = 0; row < 4; row++) for (let x = 4; x < 508;) {
    const w = 26 + Math.floor(r() * 34), h = 70 + Math.floor(r() * 46), c = cols[Math.floor(r() * cols.length)];
    g.fillStyle = c; g.fillRect(x, row * 128 + 124 - h, w, h);
    g.fillStyle = "rgba(255,255,255,0.55)"; g.fillRect(x + 4, row * 128 + 124 - h + 14, w - 8, 12);
    g.strokeStyle = "#2a2030"; g.lineWidth = 3; g.strokeRect(x, row * 128 + 124 - h, w, h);
    x += w + 4;
  }
  g.fillStyle = "#8b8f99"; for (let row = 0; row < 4; row++) g.fillRect(0, row * 128 + 122, 512, 6);
});
const windowTex = () => ctex("janela", 256, 256, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, "#7fb2ea"); gr.addColorStop(1, "#cfe6fb"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  g.fillStyle = "rgba(255,255,255,0.9)"; g.beginPath(); g.ellipse(70, 80, 40, 18, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(180, 60, 30, 13, 0, 0, 7); g.fill();
  g.fillStyle = "#6aab4f"; g.fillRect(0, 200, 256, 56);
});

// ---------------- peças de interior ----------------
type M = Record<string, THREE.Material>;
const mats = (): M => ({
  white: lam("mm_white", () => ({ color: "#f2efe8" })),
  wood: lam("mm_wood", () => ({ color: "#b07a4c" })),
  woodD: lam("mm_woodD", () => ({ color: "#7a4f33" })),
  metal: lam("mm_metal", () => ({ color: "#aab0ba" })),
  dark: lam("mm_dark", () => ({ color: "#3a3440" })),
  red: lam("mm_red", () => ({ color: "#d9453c" })),
  blue: lam("mm_blue", () => ({ color: "#3f6fb5" })),
  green: lam("mm_green", () => ({ color: "#3f9a5a" })),
  yellow: lam("mm_yellow", () => ({ color: "#f2c84b" })),
  orange: lam("mm_orange", () => ({ color: "#f08a2c" })),
  cream: lam("mm_cream", () => ({ color: "#efe2c4" })),
  pink: lam("mm_pink", () => ({ color: "#e8889f" })),
  glass: new THREE.MeshBasicMaterial({ map: windowTex() }),
  leafA: lam("leafA", () => ({ color: "#62ae4c" })),
  leafB: lam("leafB", () => ({ color: "#4f9a43" })),
  bark: lam("bark", () => ({ color: "#8a5a3c" })),
});

/** sala vazia: piso, 3 paredes com rodapé, janela na parede do fundo. Frente (z negativo) aberta. */
const room = (b: Batch, m: M, o: THREE.Vector3, w: number, d: number, h: number, floor: THREE.Material, wall: THREE.Material, win = true, winX = 0) => {
  const x0 = o.x - w / 2, x1 = o.x + w / 2, z0 = o.z - d / 2, z1 = o.z + d / 2;
  b.add(quadUp(x0 - 6, x1 + 6, z0 - 14, z1, (w + 12) / 2, (d + 14) / 2), floor);
  b.add(boxGeo(V(x0, 0, z1), V(x1, h, z1 + 0.25), 2), wall);
  b.add(boxGeo(V(x0 - 0.25, 0, z0 - 2), V(x0, h, z1 + 0.25), 2), wall);
  b.add(boxGeo(V(x1, 0, z0 - 2), V(x1 + 0.25, h, z1 + 0.25), 2), wall);
  // rodapé
  b.add(boxGeo(V(x0, 0, z1 - 0.06), V(x1, 0.16, z1)), m.white);
  b.add(boxGeo(V(x0, 0, z0 - 2), V(x0 + 0.06, 0.16, z1)), m.white);
  b.add(boxGeo(V(x1 - 0.06, 0, z0 - 2), V(x1, 0.16, z1)), m.white);
  if (win) {
    const cx = o.x + winX;
    b.add(boxGeo(V(cx - 1.3, 1.2, z1 - 0.06), V(cx + 1.3, 2.9, z1 - 0.02)), m.glass);
    b.add(boxGeo(V(cx - 1.45, 1.1, z1 - 0.12), V(cx + 1.45, 1.2, z1)), m.white);
    b.add(boxGeo(V(cx - 1.45, 2.9, z1 - 0.12), V(cx + 1.45, 3.0, z1)), m.white);
    b.add(boxGeo(V(cx - 1.45, 1.1, z1 - 0.12), V(cx - 1.3, 3.0, z1)), m.white);
    b.add(boxGeo(V(cx + 1.3, 1.1, z1 - 0.12), V(cx + 1.45, 3.0, z1)), m.white);
    b.add(boxGeo(V(cx - 0.04, 1.2, z1 - 0.1), V(cx + 0.04, 2.9, z1 - 0.02)), m.white);
  }
};
const table = (b: Batch, m: M, x: number, z: number, w = 1.8, d = 1.1) => {
  b.add(boxGeo(V(x - w / 2, 0.74, z - d / 2), V(x + w / 2, 0.82, z + d / 2)), m.wood);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) b.add(boxGeo(V(x + sx * (w / 2 - 0.1) - 0.04, 0, z + sz * (d / 2 - 0.1) - 0.04), V(x + sx * (w / 2 - 0.1) + 0.04, 0.74, z + sz * (d / 2 - 0.1) + 0.04)), m.woodD);
};
const chair = (b: Batch, m: M, x: number, z: number, back: 1 | -1) => {
  b.add(boxGeo(V(x - 0.22, 0.45, z - 0.22), V(x + 0.22, 0.5, z + 0.22)), m.wood);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) b.add(boxGeo(V(x + sx * 0.18 - 0.025, 0, z + sz * 0.18 - 0.025), V(x + sx * 0.18 + 0.025, 0.45, z + sz * 0.18 + 0.025)), m.woodD);
  b.add(boxGeo(V(x - 0.22, 0.5, z + back * 0.2 - 0.03), V(x + 0.22, 1.0, z + back * 0.2 + 0.03)), m.wood);
};
const tree = (b: Batch, m: M, x: number, z: number, s: number, seed: number) => {
  b.add(cyl(0.3 * s, 0.22 * s, 3.0 * s, 8), m.bark, at(x, 0, z));
  b.add(new THREE.IcosahedronGeometry(2.0 * s, 1), seed % 2 ? m.leafA : m.leafB, at(x, 4.2 * s, z));
  b.add(new THREE.IcosahedronGeometry(1.4 * s, 1), seed % 3 ? m.leafB : m.leafA, at(x + 0.8 * s, 5.2 * s, z - 0.4 * s));
};

// ---------------- cenários ----------------
export const buildSets = (root: THREE.Object3D) => {
  const m = mats(), b = new Batch();
  const O = (n: SetName) => V(...SETS[n].o);

  // COZINHA: azulejo, bancada no fundo, geladeira à esquerda, fogão, mesa no meio
  {
    const o = O("cozinha");
    room(b, m, o, 9, 8, 4, lam("mm_pisoCoz", () => ({ map: rep(tiles("#e9e2d3", "#c9b9a0"), 9, 9) })), lam("mm_paredeCoz", () => ({ map: rep(wallTex("#f3dc8c"), 3, 2) })), true, 1.2);
    const zb = o.z + 4;
    b.add(boxGeo(V(o.x - 1, 0, zb - 0.7), V(o.x + 4.4, 0.92, zb)), m.white);
    b.add(boxGeo(V(o.x - 1.05, 0.92, zb - 0.75), V(o.x + 4.45, 0.98, zb)), m.dark);
    b.add(boxGeo(V(o.x - 1, 0.98, zb - 0.02), V(o.x + 4.4, 1.6, zb)), lam("mm_azulejo", () => ({ map: rep(tiles("#ffffff", "#bfe0e6", 6), 6, 1) })));
    for (let i = 0; i < 5; i++) b.add(boxGeo(V(o.x - 0.9 + i * 1.07, 0.15, zb - 0.72), V(o.x - 0.9 + i * 1.07 + 1.0, 0.85, zb - 0.7)), m.cream);
    b.add(boxGeo(V(o.x - 3.9, 0, zb - 0.8), V(o.x - 2.7, 2.2, zb - 0.05)), m.white); // geladeira
    b.add(boxGeo(V(o.x - 3.9, 1.35, zb - 0.83), V(o.x - 2.7, 1.38, zb - 0.8)), m.metal);
    b.add(boxGeo(V(o.x - 2.85, 1.5, zb - 0.9), V(o.x - 2.8, 2.0, zb - 0.83)), m.metal);
    b.add(boxGeo(V(o.x - 2.6, 0, zb - 0.7), V(o.x - 1.6, 0.92, zb)), m.metal); // fogão
    for (const dx of [-2.35, -1.85]) b.add(cyl(0.16, 0.16, 0.03, 16), m.dark, at(o.x + dx, 0.92, zb - 0.35));
    b.add(cyl(0.22, 0.2, 0.3, 24), m.red, at(o.x - 2.35, 0.95, zb - 0.35)); // panela
    table(b, m, o.x + 0.4, o.z + 0.6); chair(b, m, o.x - 0.2, o.z + 1.5, 1); chair(b, m, o.x + 1.0, o.z + 1.5, 1);
  }
  // SALA: sofá, rack com TV, tapete
  {
    const o = O("sala");
    room(b, m, o, 10, 8, 4, lam("mm_pisoSala", () => ({ map: rep(planks("#c99a68"), 4, 4) })), lam("mm_paredeSala", () => ({ map: rep(wallTex("#a9d8b8"), 3, 2) })), true, -2.6);
    const zb = o.z + 4;
    b.add(boxGeo(V(o.x - 0.6, 0, zb - 0.9), V(o.x + 3.6, 0.42, zb - 0.1)), m.red); // sofá
    b.add(boxGeo(V(o.x - 0.6, 0.42, zb - 0.35), V(o.x + 3.6, 1.05, zb - 0.1)), m.red);
    b.add(boxGeo(V(o.x - 0.8, 0, zb - 0.9), V(o.x - 0.55, 0.7, zb - 0.1)), m.red);
    b.add(boxGeo(V(o.x + 3.55, 0, zb - 0.9), V(o.x + 3.8, 0.7, zb - 0.1)), m.red);
    b.add(boxGeo(V(o.x - 4.7, 0, zb - 3.4), V(o.x - 4.25, 0.55, zb - 1.2)), m.woodD); // rack lateral
    b.add(boxGeo(V(o.x - 4.6, 0.55, zb - 2.9), V(o.x - 4.5, 1.45, zb - 1.7)), m.dark); // TV
    b.add(new THREE.CircleGeometry(1.6, 40).rotateX(-Math.PI / 2), m.yellow, at(o.x + 1.2, 0.01, zb - 2.4)); // tapete
  }
  // QUARTO: cama, escrivaninha, estante, pôster
  {
    const o = O("quarto");
    room(b, m, o, 9, 8, 4, lam("mm_pisoQ", () => ({ map: rep(planks("#d8b48a"), 4, 4) })), lam("mm_paredeQ", () => ({ map: rep(wallTex("#9cc6ec"), 3, 2) })), true, -1.8);
    const zb = o.z + 4;
    b.add(boxGeo(V(o.x + 1.2, 0, zb - 2.2), V(o.x + 3.6, 0.5, zb - 0.1)), m.woodD); // cama
    b.add(boxGeo(V(o.x + 1.25, 0.5, zb - 2.15), V(o.x + 3.55, 0.65, zb - 0.15)), m.white);
    b.add(boxGeo(V(o.x + 1.25, 0.65, zb - 1.4), V(o.x + 3.55, 0.7, zb - 0.15)), m.orange);
    b.add(boxGeo(V(o.x + 1.6, 0.65, zb - 0.6), V(o.x + 3.2, 0.85, zb - 0.2)), m.white); // travesseiro
    b.add(boxGeo(V(o.x - 4.2, 0, zb - 0.6), V(o.x - 3.0, 1.9, zb - 0.1)), m.wood); // estante
    for (let i = 0; i < 4; i++) b.add(boxGeo(V(o.x - 4.15, 0.4 + i * 0.45, zb - 0.58), V(o.x - 3.05, 0.44 + i * 0.45, zb - 0.12)), m.woodD);
    b.add(boxGeo(V(o.x + 0.2, 2.0, zb - 0.03), V(o.x + 1.0, 3.1, zb - 0.01)), lam("mm_poster", () => ({ map: textTex("poster", 256, 384, "#f08a2c", "#ffffff", "GOL!", 90) })));
  }
  // MERCADO: corredor com prateleiras dos dois lados, placa de oferta
  {
    const o = O("mercado");
    room(b, m, o, 12, 16, 5, lam("mm_pisoMerc", () => ({ map: rep(tiles("#f4f1ea", "#e4e0d8", 4), 10, 14) })), lam("mm_paredeMerc", () => ({ map: rep(wallTex("#e65b4f"), 3, 2) })), false);
    const prod = lam("mm_prod", () => ({ map: rep(products(), 4, 1) }));
    for (const sx of [-2.4, 2.4]) for (const sz of [-1]) {
      const x0 = o.x + sx - 0.45, x1 = o.x + sx + 0.45;
      b.add(boxGeo(V(x0, 0, o.z - 7 + sz), V(x1, 2.2, o.z + 6.5)), m.white);
      b.add(boxGeo(V(sx < 0 ? x1 : x0 - 0.01, 0.1, o.z - 7.9), V(sx < 0 ? x1 + 0.01 : x0, 2.1, o.z + 6.4)), prod);
    }
    for (const sx of [-5.4, 5.4]) {
      b.add(boxGeo(V(o.x + sx - 0.45, 0, o.z - 7.5), V(o.x + sx + 0.45, 2.4, o.z + 7.5)), m.white);
      b.add(boxGeo(V(sx < 0 ? o.x + sx + 0.45 : o.x + sx - 0.46, 0.1, o.z - 7.4), V(sx < 0 ? o.x + sx + 0.46 : o.x + sx - 0.45, 2.3, o.z + 7.4)), prod);
    }
    b.add(boxGeo(V(o.x - 1.6, 3.4, o.z + 7.6), V(o.x + 1.6, 4.4, o.z + 7.75)), lam("mm_oferta", () => ({ map: textTex("oferta", 512, 160, "#f3d35a", "#c0302c", "OFERTA", 110) })));
    b.add(boxGeo(V(o.x - 6, 3.0, o.z + 7.8), V(o.x + 6, 3.2, o.z + 7.95)), m.yellow);
  }
  // ESCOLA: lousa, carteiras em fileiras
  {
    const o = O("escola");
    room(b, m, o, 11, 10, 4.2, lam("mm_pisoEsc", () => ({ map: rep(tiles("#d9d3c6", "#cfc8b9", 4), 8, 8) })), lam("mm_paredeEsc", () => ({ map: rep(wallTex("#f2e3b8"), 3, 2) })), true, 3.6);
    const zb = o.z + 5;
    b.add(boxGeo(V(o.x - 3.2, 1.0, zb - 0.06), V(o.x + 1.8, 3.0, zb - 0.02)), lam("mm_lousa", () => ({ map: board() })));
    b.add(boxGeo(V(o.x - 3.3, 0.92, zb - 0.16), V(o.x + 1.9, 1.0, zb)), m.woodD);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
      const x = o.x - 3.6 + c * 2.2, z = o.z + 1.4 - r * 1.9;
      b.add(boxGeo(V(x - 0.4, 0.66, z - 0.3), V(x + 0.4, 0.71, z + 0.3)), m.wood);
      b.add(boxGeo(V(x - 0.04, 0, z - 0.04), V(x + 0.04, 0.66, z + 0.04)), m.metal);
    }
  }
  // ESTÚDIO DE JORNAL: bancada, telão azul
  {
    const o = O("estudio");
    room(b, m, o, 10, 8, 4.5, lam("mm_pisoEst", () => ({ color: "#2b3446" })), lam("mm_paredeEst", () => ({ color: "#33415e" })), false);
    const zb = o.z + 4;
    b.add(boxGeo(V(o.x - 3.6, 0.6, zb - 0.06), V(o.x + 3.6, 3.8, zb - 0.02)), new THREE.MeshBasicMaterial({ map: cityWall() }));
    b.add(boxGeo(V(o.x - 1.8, 0, zb - 2.6), V(o.x + 1.8, 1.05, zb - 1.8)), m.white);
    b.add(boxGeo(V(o.x - 1.8, 0.35, zb - 2.62), V(o.x + 1.8, 0.75, zb - 2.6)), lam("mm_jornal", () => ({ map: textTex("jornal", 512, 64, "#c0302c", "#ffffff", "JORNAL DA CIDADE", 42) })));
  }
  // POSTO DE SAÚDE: parede branca e verde, maca, armário
  {
    const o = O("posto");
    room(b, m, o, 9, 8, 4, lam("mm_pisoPosto", () => ({ map: rep(tiles("#e8f0ee", "#d5e4e0", 4), 8, 8) })), lam("mm_paredePosto", () => ({ map: rep(wallTex("#d8efe6"), 3, 2) })), true, 2.2);
    const zb = o.z + 4;
    b.add(boxGeo(V(o.x - 4.5, 0, zb - 0.02), V(o.x + 4.5, 1.1, zb)), m.green);
    b.add(boxGeo(V(o.x - 2.8, 0, zb - 1.0), V(o.x - 0.6, 0.75, zb - 0.3)), m.white); // maca
    b.add(boxGeo(V(o.x - 4.3, 0, zb - 0.5), V(o.x - 3.3, 2.0, zb - 0.05)), m.white);
    b.add(boxGeo(V(o.x - 4.0, 1.4, zb - 0.53), V(o.x - 3.6, 1.6, zb - 0.5)), m.red);
  }
  // RUA: asfalto, calçadas, casas dos dois lados, árvores, morros e montanha ao fundo
  {
    const o = O("rua");
    const grass = lam("grassHD", () => ({ map: grassHD() }));
    b.add(quadUp(o.x - 400, o.x + 400, o.z - 400, o.z + 600, 200, 250, -0.02), grass);
    b.add(quadUp(o.x - 4, o.x + 4, o.z - 120, o.z + 160, 2, 70, 0.0), lam("mm_asfalto", () => ({ map: rep(asphalt(), 2, 60) })));
    b.add(quadUp(o.x - 0.15, o.x + 0.15, o.z - 120, o.z + 160, 1, 70, 0.005), lam("mm_faixa", () => ({ map: rep(lane(), 1, 50) })));
    for (const s of [-1, 1]) b.add(boxGeo(V(o.x + s * 4 - (s > 0 ? 0 : 2.5), 0, o.z - 120), V(o.x + s * 4 + (s > 0 ? 2.5 : 0), 0.15, o.z + 160)), lam("mm_calcada", () => ({ color: "#cfc7b8" })));
    let si = 3;
    for (let z = -100; z < 150; z += 11) {
      house(b, o.x - 11.5, o.z + z, Math.PI / 2, 10, 8, [7, 8.4, 9.8][si % 3], si); si++;
      house(b, o.x + 11.5, o.z + z + 5, -Math.PI / 2, 10, 8, [7, 8.4, 9.8][si % 3], si); si++;
    }
    for (let z = -90; z < 150; z += 13) { tree(b, m, o.x - 6.2, o.z + z, 0.9, si++); tree(b, m, o.x + 6.2, o.z + z + 6, 0.85, si++); }
    const hm = [lam("hillA", () => ({ color: "#78b257" })), lam("hillB", () => ({ color: "#6aa24e" }))];
    ([[-90, 260, 120, 40, 60], [80, 300, 140, 46, 70], [0, 330, 60, 95, 60]] as const)
      .forEach(([x, z, sx, sy, sz], i) => b.add(new THREE.SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), hm[i % 2], new THREE.Matrix4().compose(V(o.x + x, -1, o.z + z), new THREE.Quaternion(), V(sx, sy, sz))));
  }
  // QUINTAL: grama, fundo da casa, muro, varal, árvore
  {
    const o = O("quintal");
    b.add(quadUp(o.x - 200, o.x + 200, o.z - 200, o.z + 200, 100, 100, -0.02), lam("grassHD", () => ({ map: grassHD() })));
    b.add(boxGeo(V(o.x - 8, 0, o.z + 7), V(o.x + 8, 5.2, o.z + 8)), lam("mm_fundoCasa", () => ({ map: rep(wallTex("#f2c9a0"), 4, 2) })));
    b.add(boxGeo(V(o.x - 1.0, 0, o.z + 6.95), V(o.x + 0.2, 2.2, o.z + 7.0)), m.woodD);
    b.add(boxGeo(V(o.x + 2.2, 1.3, o.z + 6.94), V(o.x + 4.2, 2.6, o.z + 7.0)), m.glass);
    b.add(boxGeo(V(o.x - 8.6, 5.2, o.z + 6.4), V(o.x + 8.6, 5.5, o.z + 8.6)), lam("roofRed", () => ({ map: roofHD("#b5543c") })));
    for (const s of [-1, 1]) b.add(boxGeo(V(o.x + s * 8 - 0.15, 0, o.z - 14), V(o.x + s * 8 + 0.15, 2.0, o.z + 7)), lam("mm_muro", () => ({ map: rep(wallTex("#e6e0d2"), 6, 1) })));
    b.add(boxGeo(V(o.x - 6.8, 0, o.z + 3.5), V(o.x - 6.7, 2.0, o.z + 3.6)), m.metal);
    b.add(boxGeo(V(o.x - 3.8, 0, o.z + 3.5), V(o.x - 3.7, 2.0, o.z + 3.6)), m.metal);
    b.add(boxGeo(V(o.x - 6.8, 1.95, o.z + 3.54), V(o.x - 3.7, 1.98, o.z + 3.56)), m.dark);
    ([["#e2453c", -6.3], ["#3f6fb5", -5.4], ["#f3d35a", -4.4]] as const).forEach(([c, x]) => b.add(boxGeo(V(o.x + x, 1.35, o.z + 3.53), V(o.x + x + 0.6, 1.95, o.z + 3.57)), lam("roupa" + c, () => ({ color: c }))));
    tree(b, m, o.x + 6, o.z + 4.5, 1.0, 7);
    for (let i = 0; i < 12; i++) tree(b, m, o.x - 30 + i * 6, o.z + 22 + hh(i) * 8, 1.1 + hh(i, 2) * 0.3, i);
  }
  b.build(root);
};
