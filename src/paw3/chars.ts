// Bonecos 3D no padrão dos bonecos da Torre de Pisa (23/11, v3 depois do "ficou robótico"):
// cabeça redonda COR DE PELE com cabelo, corpo de FEIJÃO inteiro na cor da roupa (sem pescoço), braços e pernas de
// palito com COTOVELO e JOELHO (dobram), mãozinha e sapato redondos. Rosto desenhado em canvas na frente da cabeça
// (camada NOINK). Sombreado em degraus + contorno preto do InkPass. Respiração, ginga na caminhada, chapéu que balança.
import * as THREE from "three";
import { NOINK } from "./ink";

const GRAD = (() => {
  const d = new Uint8Array([170, 225, 255]);
  const t = new THREE.DataTexture(d, 3, 1, THREE.RedFormat);
  t.minFilter = THREE.NearestFilter; t.magFilter = THREE.NearestFilter; t.needsUpdate = true;
  return t;
})();
const mats = new Map<string, THREE.MeshToonMaterial>();
export const toon = (c: string) => {
  let m = mats.get(c);
  if (!m) { m = new THREE.MeshToonMaterial({ color: c, gradientMap: GRAD }); mats.set(c, m); }
  return m;
};
export const GRADMAP = GRAD;

export type Face = "smile" | "grin" | "laugh" | "shock" | "proud" | "neutral" | "cheer" | "talk";
const INKC = "#241726";
const faceCache = new Map<string, THREE.CanvasTexture>();
/** rosto no estilo dos bonecos da Pisa: olhos ovais pretos com brilho, sobrancelha grossa, boca expressiva */
export const faceTex = (expr: Face, mustache: boolean, blink: number, mouth = 0) => {
  const key = `${expr}|${mustache ? 1 : 0}|${blink}|${mouth}`;
  const hit = faceCache.get(key);
  if (hit) return hit;
  const cv = document.createElement("canvas");
  cv.width = cv.height = 512;
  const g = cv.getContext("2d")!;
  g.fillStyle = INKC; g.strokeStyle = INKC; g.lineCap = "round"; g.lineJoin = "round"; g.lineWidth = 17;
  const shut = blink >= 1 || expr === "laugh" || expr === "cheer";
  const eye = (x: number, y: number, rx: number, ry: number) => {
    if (shut) { g.beginPath(); g.moveTo(x - rx - 4, y + 6); g.quadraticCurveTo(x, y - ry * 1.0, x + rx + 4, y + 6); g.stroke(); return; }
    const ryy = blink > 0 ? ry * 0.45 : ry;
    g.beginPath(); g.ellipse(x, y, rx, ryy, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#ffffff"; g.beginPath(); g.arc(x + rx * 0.3, y - ryy * 0.35, rx * 0.34, 0, Math.PI * 2); g.fill(); g.fillStyle = INKC;
  };
  const big = expr === "shock";
  const ey = 232;
  if (expr === "proud") {
    for (const x of [190, 322]) { g.beginPath(); g.ellipse(x, ey + 8, 24, 22, 0, 0, Math.PI); g.fill(); g.beginPath(); g.moveTo(x - 30, ey + 2); g.lineTo(x + 30, ey + 2); g.stroke(); }
  } else {
    eye(190, ey, big ? 32 : 24, big ? 46 : 34);
    eye(322, ey, big ? 32 : 24, big ? 46 : 34);
  }
  g.lineWidth = 20;
  const bro = (x1: number, y1: number, x2: number, y2: number) => { g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); };
  if (big) { bro(152, 138, 222, 124); bro(290, 124, 360, 138); }
  else if (expr === "proud") { bro(156, 182, 222, 174); bro(290, 164, 358, 152); }
  else if (expr === "laugh" || expr === "cheer") { bro(156, 162, 222, 150); bro(290, 150, 356, 162); }
  else { bro(156, 172, 222, 166); bro(290, 166, 356, 172); }
  g.lineWidth = 16;
  const my = 352;
  const open = expr === "talk" ? mouth : 0;
  if (expr === "shock") { g.beginPath(); g.ellipse(256, my + 12, 30, 44, 0, 0, Math.PI * 2); g.fill(); }
  else if (expr === "laugh" || expr === "cheer") {
    g.beginPath(); g.moveTo(188, my - 16); g.quadraticCurveTo(256, my + 118, 324, my - 16); g.closePath(); g.fill();
    g.fillStyle = "#e05a62"; g.beginPath(); g.ellipse(256, my + 44, 32, 18, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = INKC;
  } else if (open > 0) {
    g.beginPath(); g.ellipse(256, my + 6, 34, 10 + 30 * open, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#e05a62"; g.beginPath(); g.ellipse(256, my + 10 + 12 * open, 20, 6 + 10 * open, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = INKC;
  } else if (expr === "proud") { g.beginPath(); g.moveTo(212, my + 2); g.quadraticCurveTo(270, my + 34, 316, my - 18); g.stroke(); }
  else if (expr === "neutral") { g.beginPath(); g.moveTo(226, my + 6); g.lineTo(288, my + 6); g.stroke(); }
  else { g.beginPath(); g.moveTo(200, my - 10); g.quadraticCurveTo(256, expr === "grin" ? my + 64 : my + 44, 312, my - 10); g.stroke(); }
  if (mustache) {
    g.beginPath();
    g.moveTo(256, my - 42);
    g.bezierCurveTo(224, my - 66, 180, my - 50, 160, my - 16);
    g.bezierCurveTo(192, my - 26, 226, my - 22, 256, my - 30);
    g.bezierCurveTo(286, my - 22, 320, my - 26, 352, my - 16);
    g.bezierCurveTo(332, my - 50, 288, my - 66, 256, my - 42);
    g.fill();
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  faceCache.set(key, t);
  return t;
};

export type Hat = "none" | "panama" | "cap" | "top" | "bowler" | "bun" | "hair" | "curly";
export type Look = { shirt: string; skin?: string; hat?: Hat; hatCol?: string; hair?: string; mustache?: boolean; tie?: string; skirt?: boolean; scale?: number; pants?: string; collar?: boolean };

const LIMB = "#241726";
// corpo de feijão: mais largo embaixo, ombro arredondado
const BEAN = (() => {
  const pts = [[0.0, 0.0], [0.13, 0.015], [0.2, 0.08], [0.225, 0.2], [0.22, 0.34], [0.2, 0.46], [0.165, 0.56], [0.1, 0.62], [0.0, 0.645]].map(([x, y]) => new THREE.Vector2(x, y));
  const g = new THREE.LatheGeometry(pts, 40);
  g.scale(1, 1, 0.82);
  return g;
})();
const DRESS = (() => {
  const pts = [[0.0, 0.0], [0.33, 0.01], [0.3, 0.2], [0.24, 0.4], [0.19, 0.56], [0.12, 0.64], [0.0, 0.66]].map(([x, y]) => new THREE.Vector2(x, y));
  return new THREE.LatheGeometry(pts, 40);
})();
const seg = (len: number, r: number) => { const g = new THREE.CapsuleGeometry(r, len, 4, 10); g.translate(0, -len / 2, 0); return g; };
const G = {
  head: new THREE.SphereGeometry(0.3, 48, 32),
  upperArm: seg(0.22, 0.026), lowerArm: seg(0.22, 0.026),
  thigh: seg(0.27, 0.03), shin: seg(0.27, 0.03),
  hand: new THREE.SphereGeometry(0.058, 16, 12),
  shoe: new THREE.SphereGeometry(0.085, 18, 12),
  face: new THREE.PlaneGeometry(0.52, 0.52),
};

/** braço ou perna de dois pedaços: pivô no ombro/quadril, joelho/cotovelo no meio */
class Limb {
  root = new THREE.Group(); mid = new THREE.Group(); tip = new THREE.Group();
  constructor(parent: THREE.Object3D, a: THREE.BufferGeometry, b: THREE.BufferGeometry, la: number, lb: number, mat: THREE.Material) {
    const m1 = new THREE.Mesh(a, mat), m2 = new THREE.Mesh(b, mat);
    m1.castShadow = m2.castShadow = true;
    this.root.add(m1); this.mid.position.y = -la; this.root.add(this.mid); this.mid.add(m2);
    this.tip.position.y = -lb; this.mid.add(this.tip);
    parent.add(this.root);
  }
}

export type Pose = {
  t?: number;           // tempo (respiração, balanço)
  walk?: number;        // fase da caminhada (ciclos), undefined = parado
  stride?: number;
  armL?: number; armR?: number;   // abrir o braço pro lado (rad)
  fwdL?: number; fwdR?: number;   // levantar o braço pra frente (rad)
  elbowL?: number; elbowR?: number;
  lean?: number;        // + inclina pra trás
  hop?: number; squash?: number;  // pulinho (m) e amassada (+ achata, - estica)
  tilt?: number; nod?: number;    // cabeça de lado / pra frente
  face?: Face; blink?: number; mouth?: number;
};

export class Char {
  root = new THREE.Group();
  hips = new THREE.Group();   // tudo que sobe e desce (corpo + cabeça + braços)
  body = new THREE.Group();
  head = new THREE.Group();
  hat = new THREE.Group();
  armL: Limb; armR: Limb; legL: Limb; legR: Limb;
  hold = new THREE.Group();
  faceMat: THREE.MeshBasicMaterial;
  look: Look;
  constructor(look: Look) {
    this.look = look;
    const skin = look.skin ?? "#ffe0bf";
    const add = <T extends THREE.Mesh>(m: T, parent: THREE.Object3D) => { m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; };
    // corpo
    if (look.skirt) add(new THREE.Mesh(DRESS, toon(look.shirt)), this.body);
    else add(new THREE.Mesh(BEAN, toon(look.shirt)), this.body);
    if (look.collar) {
      for (const s of [-1, 1]) {
        const c = add(new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.12, 3), toon("#fbf8f0")), this.body);
        c.position.set(0.05 * s, 0.6, 0.12); c.rotation.set(Math.PI, 0, s * 0.5);
      }
    }
    if (look.tie) {
      const tie = add(new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.26, 4), toon(look.tie)), this.body);
      tie.position.set(0, 0.47, 0.17); tie.rotation.x = Math.PI + 0.12;
    }
    this.body.position.y = 0.6;
    this.hips.add(this.body);
    // cabeça (cor de pele) + rosto + cabelo
    const head = add(new THREE.Mesh(G.head, toon(skin)), this.head);
    head.scale.set(1, 0.95, 0.94);
    this.faceMat = new THREE.MeshBasicMaterial({ map: faceTex("smile", !!look.mustache, 0), transparent: true, depthWrite: false });
    const face = new THREE.Mesh(G.face, this.faceMat);
    face.position.set(0, -0.015, 0.286); face.layers.set(NOINK); face.renderOrder = 2;
    this.head.add(face);
    const hair = look.hair ?? "#3a2418";
    const hc = look.hatCol ?? "#2a2730";
    const cap = (col: string, theta: number, tilt = -0.2) => { const m = add(new THREE.Mesh(new THREE.SphereGeometry(0.31, 40, 20, 0, Math.PI * 2, 0, theta), toon(col)), this.head); m.position.y = 0.04; m.rotation.x = tilt; return m; };
    if (look.hat && look.hat !== "none") {
      // quase todo mundo tem cabelo por baixo
      if (look.hat !== "cap") cap(hair, Math.PI * 0.42, -0.28);
    }
    switch (look.hat) {
      case "panama": {
        const crown = add(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.235, 0.2, 32), toon(hc)), this.hat);
        crown.position.y = 0.09;
        const band = add(new THREE.Mesh(new THREE.CylinderGeometry(0.238, 0.24, 0.06, 32), toon("#2b2330")), this.hat);
        band.position.y = 0.03;
        const brim = add(new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.44, 0.028, 40), toon(hc)), this.hat);
        brim.rotation.x = 0.1;
        this.hat.position.y = 0.24;
        break;
      }
      case "top": {
        const crown = add(new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.4, 32), toon(hc)), this.hat); crown.position.y = 0.21;
        add(new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.028, 32), toon(hc)), this.hat);
        this.hat.position.y = 0.23;
        break;
      }
      case "bowler": {
        const crown = add(new THREE.Mesh(new THREE.SphereGeometry(0.235, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), toon(hc)), this.hat);
        crown.position.y = 0.0;
        add(new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.028, 32), toon(hc)), this.hat);
        this.hat.position.y = 0.23;
        break;
      }
      case "cap": {
        cap(hc, Math.PI * 0.44, -0.1);
        const visor = add(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.03, 32, 1, false, -Math.PI / 2, Math.PI), toon("#1d1a22")), this.head);
        visor.position.set(0, 0.11, 0.2); visor.scale.set(1, 1, 0.9);
        break;
      }
      case "bun": {
        cap(hair, Math.PI * 0.47, -0.32);
        const bun = add(new THREE.Mesh(new THREE.SphereGeometry(0.12, 20, 14), toon(hair)), this.head);
        bun.position.set(0, 0.28, -0.17);
        break;
      }
      case "curly": {
        cap(hair, Math.PI * 0.45, -0.25);
        for (let i = 0; i < 9; i++) {
          const a = (i / 9) * Math.PI * 2;
          const b = add(new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), toon(hair)), this.head);
          b.position.set(Math.cos(a) * 0.2, 0.25 + (i % 2) * 0.03, Math.sin(a) * 0.2 - 0.03);
        }
        break;
      }
      case "hair": default: {
        cap(hair, Math.PI * 0.4, -0.22);
        const fringe = add(new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 10), toon(hair)), this.head);
        fringe.position.set(0.1, 0.22, 0.2); fringe.scale.set(1.6, 0.55, 0.8);
      }
    }
    this.head.add(this.hat);
    this.head.position.y = 0.6 + 0.62 + 0.24;
    this.hips.add(this.head);
    // braços (ombro, cotovelo, mão)
    const lm = toon(LIMB);
    this.armL = new Limb(this.hips, G.upperArm, G.lowerArm, 0.22, 0.22, lm);
    this.armR = new Limb(this.hips, G.upperArm, G.lowerArm, 0.22, 0.22, lm);
    for (const [a, s] of [[this.armL, -1], [this.armR, 1]] as [Limb, number][]) {
      a.root.position.set(0.19 * s, 1.1, 0);
      const hand = add(new THREE.Mesh(G.hand, toon(skin)), a.tip);
      hand.position.y = -0.02;
    }
    this.hold.position.y = -0.04;
    this.armR.tip.add(this.hold);
    // pernas (quadril, joelho, sapato)
    this.legL = new Limb(this.hips, G.thigh, G.shin, 0.27, 0.27, lm);
    this.legR = new Limb(this.hips, G.thigh, G.shin, 0.27, 0.27, lm);
    for (const [l, s] of [[this.legL, -1], [this.legR, 1]] as [Limb, number][]) {
      l.root.position.set(0.085 * s, 0.62, 0);
      const shoe = add(new THREE.Mesh(G.shoe, toon("#1d1820")), l.tip);
      shoe.position.set(0, -0.03, 0.05); shoe.scale.set(1, 0.6, 1.55);
    }
    this.root.add(this.hips);
    this.root.scale.setScalar(look.scale ?? 1);
  }

  pose(p: Pose) {
    const t = p.t ?? 0, w = p.walk, st = p.stride ?? 1;
    const ph = w === undefined ? 0 : w * Math.PI * 2;
    const swing = w === undefined ? 0 : Math.sin(ph) * 0.5 * st;
    // pernas: coxa balança, joelho dobra quando a perna vai pra frente
    const knee = (s: number) => (w === undefined ? 0.04 : Math.max(0, Math.sin(ph * 1 + s * Math.PI / 2 + Math.PI / 2)) * 0.75 * st + 0.05);
    this.legL.root.rotation.x = -swing; this.legL.mid.rotation.x = knee(-1);
    this.legR.root.rotation.x = swing; this.legR.mid.rotation.x = knee(1);
    // ginga: sobe e desce 2x por ciclo, balança de lado
    const bob = w === undefined ? Math.sin(t * 2.4) * 0.006 : Math.abs(Math.cos(ph)) * 0.05 * st;
    const hop = p.hop ?? 0;
    this.hips.position.y = bob + hop;
    this.hips.rotation.z = w === undefined ? Math.sin(t * 1.3) * 0.015 : Math.sin(ph) * 0.06 * st;
    this.hips.rotation.y = w === undefined ? 0 : Math.sin(ph) * 0.08 * st;
    if (hop > 0.001) { this.legL.root.rotation.x -= 0.4; this.legR.root.rotation.x -= 0.4; this.legL.mid.rotation.x += 0.8; this.legR.mid.rotation.x += 0.8; }
    // respiração + amassada
    const sq = p.squash ?? 0, br = 1 + Math.sin(t * 2.4) * 0.012;
    this.body.scale.set(1 + sq * 0.5, br * (1 - sq), 1 + sq * 0.5);
    // corpo inclina
    this.hips.rotation.x = -(p.lean ?? 0);
    // braços: balanço da caminhada + gesto; cotovelo sempre um pouco dobrado (nada de braço de robô)
    const aw = swing * 0.9;
    this.armL.root.rotation.set(-(p.fwdL ?? 0) + aw, 0, -(p.armL ?? 0.18));
    this.armR.root.rotation.set(-(p.fwdR ?? 0) - aw, 0, p.armR ?? 0.18);
    this.armL.mid.rotation.x = -(p.elbowL ?? 0.25) - (w === undefined ? 0 : Math.max(0, -Math.sin(ph)) * 0.4);
    this.armR.mid.rotation.x = -(p.elbowR ?? 0.25) - (w === undefined ? 0 : Math.max(0, Math.sin(ph)) * 0.4);
    // cabeça: inclina, acena; chapéu atrasa um pouco o movimento
    this.head.rotation.z = (p.tilt ?? 0) + Math.sin(t * 1.7 + 1) * 0.02;
    this.head.rotation.x = (p.nod ?? 0) + (w === undefined ? 0 : Math.cos(ph * 2) * 0.03);
    this.hat.rotation.x = w === undefined ? 0 : Math.cos(ph * 2 - 0.9) * 0.05;
    this.hat.position.y = this.hat.position.y; // (o chapéu fica preso; só balança)
    this.faceMat.map = faceTex(p.face ?? "smile", !!this.look.mustache, p.blink ?? 0, Math.round((p.mouth ?? 0) * 3) / 3);
  }
}

/** mala velha de couro (pra mão) */
export const suitcase = (col = "#8a5a33") => {
  const g = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.32, 0.15), toon(col));
  box.position.y = -0.2; box.castShadow = true;
  const strap = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.045, 0.16), toon("#4a3020"));
  strap.position.y = -0.14;
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.016, 8, 16, Math.PI), toon("#3a2418"));
  handle.position.y = -0.03;
  g.add(box, strap, handle);
  return g;
};
/** mala de rodinha (figurantes) */
export const roller = (col: string) => {
  const g = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, 0.24), toon(col)); box.position.y = 0.36; box.castShadow = true;
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.5, 0.04), toon("#2a2730")); bar.position.set(0, 0.85, -0.08);
  for (const x of [-0.14, 0.14]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 12), toon("#1d1820")); w.rotation.z = Math.PI / 2; w.position.set(x, 0.05, -0.08); g.add(w); }
  g.add(box, bar);
  return g;
};
