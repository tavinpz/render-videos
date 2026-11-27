// Cachorro 3D toon do Pawslated v3 (27/11/2026): corpo de cápsula, cabeça redonda, focinho creme, olhos 3D grandes
// com brilho, orelhas caídas, rabo que abana, coleira. Sombreado em degraus (toon) + contorno do InkPass.
import * as THREE from "three";
import { toon } from "./chars";
import { NOINK } from "./ink";

export type DogLook = { fur: string; furDk: string; cream: string; collar?: string; scale?: number };
export const BISCUIT: DogLook = { fur: "#D9913E", furDk: "#A8642A", cream: "#FBE7C6", collar: "#7BD34A" };
export const WOLF: DogLook = { fur: "#8F98A6", furDk: "#5E6672", cream: "#E6E9EE" };

export type DogPose = {
  t: number;
  lie?: number;       // 0 = em pé, 1 = deitado (esfinge)
  sit?: number;       // 0..1 sentado
  headUp?: number;    // 0 = cabeça apoiada nas patas, 1 = cabeça levantada
  turn?: number;      // gira a cabeça (rad, + esquerda do cachorro)
  tilt?: number;      // inclina a cabeça de lado
  wag?: number;       // 0..1 força do abano
  ears?: number;      // 0 caídas, 1 em pé (alerta)
  eyes?: number;      // 1 abertos, 0 fechados
  worried?: number;   // sobrancelha de preocupação
  breath?: number;    // amplitude da respiração
  walk?: number;      // fase da caminhada (ciclos); undefined = parado
  curl?: number;      // 0..1 enroladinho (dormindo de lado)
};

const cap = (r: number, l: number) => new THREE.CapsuleGeometry(r, l, 6, 16);
const sph = (r: number) => new THREE.SphereGeometry(r, 32, 20);

export class Dog {
  root = new THREE.Group();
  body = new THREE.Group();
  headPivot = new THREE.Group();
  head = new THREE.Group();
  tail = new THREE.Group();
  legs: THREE.Group[] = [];
  earL = new THREE.Group(); earR = new THREE.Group();
  eyeL = new THREE.Group(); eyeR = new THREE.Group();
  lidL: THREE.Mesh; lidR: THREE.Mesh;
  browL: THREE.Mesh; browR: THREE.Mesh;
  look: DogLook;
  constructor(look: DogLook) {
    this.look = look;
    const fur = toon(look.fur), dk = toon(look.furDk), cr = toon(look.cream);
    const add = (m: THREE.Mesh, p: THREE.Object3D) => { m.castShadow = true; m.receiveShadow = true; p.add(m); return m; };
    // corpo (eixo z = frente)
    const torso = add(new THREE.Mesh(cap(0.2, 0.42), fur), this.body); torso.rotation.x = Math.PI / 2; torso.scale.set(1.05, 1, 0.95);
    const chest = add(new THREE.Mesh(sph(0.17), cr), this.body); chest.position.set(0, -0.03, 0.27); chest.scale.set(1, 1.05, 0.7);
    const back = add(new THREE.Mesh(sph(0.13), dk), this.body); back.position.set(0, 0.14, -0.05); back.scale.set(1.2, 0.45, 2.1);
    this.body.position.y = 0.36;
    this.root.add(this.body);
    // pernas (pivô no ombro/quadril)
    for (const [x, z] of [[-0.12, 0.24], [0.12, 0.24], [-0.12, -0.24], [0.12, -0.24]]) {
      const g = new THREE.Group(); g.position.set(x, -0.05, z);
      const leg = add(new THREE.Mesh(cap(0.065, 0.2), fur), g); leg.position.y = -0.14;
      const paw = add(new THREE.Mesh(sph(0.075), cr), g); paw.position.set(0, -0.27, 0.03); paw.scale.set(1, 0.6, 1.25);
      this.body.add(g); this.legs.push(g);
    }
    // rabo
    const tl = add(new THREE.Mesh(cap(0.06, 0.14), fur), this.tail); tl.position.y = 0.1;
    const tip = add(new THREE.Mesh(sph(0.062), cr), this.tail); tip.position.y = 0.2;
    this.tail.position.set(0, 0.1, -0.4); this.tail.rotation.x = -0.8;
    this.body.add(this.tail);
    // coleira
    if (look.collar) {
      const c = add(new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.032, 10, 28), toon(look.collar)), this.headPivot);
      c.rotation.x = Math.PI / 2 - 0.4; c.position.set(0, -0.04, 0.02);
      const tag = add(new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.015, 18), toon("#F2C230")), this.headPivot);
      tag.rotation.x = Math.PI / 2 - 0.1; tag.position.set(0, -0.12, 0.13);
    }
    // cabeça
    const sk = add(new THREE.Mesh(sph(0.24), fur), this.head); sk.scale.set(1.05, 0.95, 0.95);
    const muz = add(new THREE.Mesh(sph(0.13), cr), this.head); muz.position.set(0, -0.07, 0.19); muz.scale.set(1.15, 0.8, 0.95);
    const nose = add(new THREE.Mesh(sph(0.05), toon("#2A1A14")), this.head); nose.position.set(0, -0.02, 0.31); nose.scale.set(1.3, 0.85, 0.8);
    const cheekL = add(new THREE.Mesh(sph(0.03), toon("#F29C8C")), this.head); cheekL.position.set(-0.15, -0.06, 0.17);
    const cheekR = add(new THREE.Mesh(sph(0.03), toon("#F29C8C")), this.head); cheekR.position.set(0.15, -0.06, 0.17);
    cheekL.layers.set(NOINK); cheekR.layers.set(NOINK);
    // olhos grandes (branco + íris + brilho) e pálpebra
    const white = new THREE.MeshBasicMaterial({ color: "#ffffff" });
    const iris = new THREE.MeshBasicMaterial({ color: "#2B1A12" });
    const mk = (g: THREE.Group, s: number) => {
      const w = new THREE.Mesh(sph(0.068), white); w.scale.set(1, 1.12, 0.6); g.add(w);
      const ir = new THREE.Mesh(sph(0.048), iris); ir.position.set(0, -0.004, 0.03); ir.scale.set(1, 1.1, 0.5); g.add(ir);
      const hl = new THREE.Mesh(sph(0.016), white); hl.position.set(0.015 * s, 0.022, 0.055); hl.layers.set(NOINK); g.add(hl);
      g.position.set(0.1 * s, 0.05, 0.19); g.rotation.y = 0.28 * s;
      this.head.add(g);
    };
    mk(this.eyeL, -1); mk(this.eyeR, 1);
    const lidGeo = new THREE.SphereGeometry(0.072, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    this.lidL = add(new THREE.Mesh(lidGeo, fur), this.eyeL); this.lidR = add(new THREE.Mesh(lidGeo, fur), this.eyeR);
    for (const l of [this.lidL, this.lidR]) { l.scale.set(1.05, 1.15, 0.7); l.rotation.x = -1.4; }
    const bro = () => { const b = new THREE.Mesh(cap(0.014, 0.06), toon("#4A2A16")); b.rotation.z = Math.PI / 2; return b; };
    this.browL = bro(); this.browR = bro();
    this.browL.position.set(-0.1, 0.15, 0.2); this.browR.position.set(0.1, 0.15, 0.2);
    this.head.add(this.browL, this.browR);
    // orelhas caídas
    for (const [g, s] of [[this.earL, -1], [this.earR, 1]] as [THREE.Group, number][]) {
      const e = add(new THREE.Mesh(sph(0.11), dk), g); e.scale.set(0.55, 1.25, 0.3); e.position.y = -0.11;
      g.position.set(0.19 * s, 0.13, -0.02); g.rotation.z = 0.25 * s;
      this.head.add(g);
    }
    this.head.position.set(0, 0.1, 0.05);
    this.headPivot.add(this.head);
    this.headPivot.position.set(0, 0.16, 0.36);
    this.body.add(this.headPivot);
    this.root.scale.setScalar(look.scale ?? 1);
  }

  pose(p: DogPose) {
    const t = p.t, lie = p.lie ?? 0, sit = p.sit ?? 0, curl = p.curl ?? 0;
    const br = Math.sin(t * 2.2) * (p.breath ?? 1);
    // altura e inclinação do corpo
    this.body.position.y = 0.36 - lie * 0.2 - sit * 0.02 + br * 0.004;
    this.body.rotation.x = -sit * 0.55;
    this.body.rotation.z = curl * 0.9;
    this.body.scale.set(1 + br * 0.015, 1 + br * 0.02, 1);
    // pernas: em pé, deitado (dobradas pra frente), sentado
    const w = p.walk;
    this.legs.forEach((g, i) => {
      const front = i < 2, side = i % 2 ? 1 : -1;
      let rx = 0;
      if (w !== undefined) rx = Math.sin((w + (front ? 0 : 0.5) + (side > 0 ? 0.25 : 0)) * Math.PI * 2) * 0.5;
      rx = rx * (1 - lie) + lie * (front ? -1.45 : -1.25) + sit * (front ? 0.5 : -1.2);
      g.rotation.x = rx;
      g.position.y = -0.05 + lie * 0.06;
      g.position.z = (front ? 0.24 : -0.24) + (front ? 0 : lie * 0.12);
      g.position.x = (side * 0.12) * (1 + (front ? 0 : lie * 0.35));
      g.scale.y = 1 - lie * (front ? 0.3 : 0.45);
    });
    // cabeça
    const up = p.headUp ?? 1;
    this.headPivot.rotation.x = (1 - up) * 0.32 + sit * 0.5 - lie * 0.1 * up;
    this.headPivot.rotation.z = (1 - up) * 0.3;
    this.headPivot.position.y = 0.16 - (1 - up) * 0.15 * lie;
    this.headPivot.rotation.y = p.turn ?? 0;
    this.head.rotation.z = (p.tilt ?? 0) + Math.sin(t * 1.6) * 0.03;
    this.head.rotation.x = Math.sin(t * 1.1) * 0.02;
    // orelhas
    const ea = p.ears ?? 0;
    this.earL.rotation.z = -0.25 - ea * 0.9 + Math.sin(t * 3) * 0.04;
    this.earR.rotation.z = 0.25 + ea * 0.9 - Math.sin(t * 3 + 1) * 0.04;
    this.earL.rotation.x = this.earR.rotation.x = -ea * 0.4;
    // olhos (pálpebra desce) + piscada automática
    const bl = ((t * 0.7) % 3.1) < 0.09 ? 0 : 1;
    const open = Math.min(p.eyes ?? 1, bl);
    for (const l of [this.lidL, this.lidR]) { l.rotation.x = -1.4 - open * 1.6; l.visible = open < 0.98; }
    const wr = p.worried ?? 0;
    this.browL.rotation.z = Math.PI / 2 + wr * 0.45; this.browR.rotation.z = Math.PI / 2 - wr * 0.45;
    this.browL.position.y = this.browR.position.y = 0.15 + wr * 0.015;
    // rabo
    const wag = p.wag ?? 0.2;
    this.tail.rotation.z = Math.sin(t * 14) * 0.6 * wag + lie * 0.7;
    this.tail.rotation.x = -0.7 - lie * 0.55 + wag * 0.2;
  }
}
