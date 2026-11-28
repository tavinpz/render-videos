// mm007 · "Nessa cidade, cada 'já vou' que a criança fala deixa a mãe um metro mais alta."
import type { Ep } from "../motor/spec";
import tempos from "./e07_tempos.json";
import { face, wide, HEAD } from "./h";

const H = HEAD;
const SOFA = { x: 1.2, z: 2.95, y: 0.3 };
const HS = 0.6 + SOFA.y; // cabeça do Davi sentado
export const E07: Ep = {
  id: "e07", tempos,
  shots: [
    // 0 · gancho: Davi jogando no sofá, com cara de "já vou"
    { at: 0, set: "sala", cam: face(SOFA.x, SOFA.z, HS, { az: -10 }),
      acts: [{ who: "davi", ...SOFA, mode: "sit", ex: "sly", look: -1 }], props: [{ k: "controle", x: SOFA.x, y: 0.5, z: SOFA.z - 0.25, s: 1.0 }] },
    // 1 · a regra: na rua, a mãe cresce um metro
    { at: [0, 0.42, 1], set: "rua", cam: wide(-5.2, 1.6, 6, { d: 7.5, fov: 40, h: 1.2, az: 25 }), kick: [[0, 0.8, 1]],
      acts: [{ who: "mae", x: -5.2, z: 6, ex: [[0, "neutral"], [[0, 0.78, 1], "shock"]], s: [[[0, 0.78, 1], 1], [[0, 0.79, 1], 1.6]] }],
      fx: [{ k: "puff", x: -5.2, y: 0.4, z: 5.8, w: 1.6, at: [0, 0.79, 1] }] },
    // 2 · "Davi, vem jantar!"
    { at: 1, set: "cozinha", cam: face(-1.6, 2.4, H.mae, { az: 15 }), kick: [1],
      acts: [{ who: "mae", x: -1.6, z: 2.4, ex: "yell", arms: "hips" }] },
    // 3 · "Já vou!" sem tirar o olho do jogo
    { at: 2, set: "sala", cam: wide(SOFA.x, 0.9, SOFA.z, { d: 4.2, fov: 32, h: 1.0, az: -20 }),
      acts: [{ who: "davi", ...SOFA, mode: "sit", ex: "grin", look: -1 }], props: [{ k: "controle", x: SOFA.x, y: 0.5, z: SOFA.z - 0.25, s: 1.0 }] },
    // 4 · "Um metro." a mãe cresce na cozinha
    { at: 3, set: "cozinha", cam: wide(-1.0, 1.6, 2.2, { d: 7.2, fov: 34, h: 1.0, az: 10 }), kick: [3], flash: true,
      acts: [{ who: "mae", x: -1.6, z: 2.4, ex: "shock", s: [[3, 1], [[3, 0.05], 1.6]] }],
      fx: [{ k: "puff", x: -1.6, y: 0.3, z: 2.2, w: 1.6, at: 3 }] },
    // 5 · "Davi, o banho!" (já maior que a porta)
    { at: 4, set: "sala", cam: face(-3.0, 2.0, H.mae * 1.6, { az: 20, d: 3.8 }), kick: [4],
      acts: [{ who: "mae", x: -3.0, z: 2.0, ex: "yell", s: 1.6, arms: "point" }] },
    // 6 · "Já tô indo!"
    { at: 5, set: "sala", cam: face(SOFA.x, SOFA.z, HS, { az: 25 }),
      acts: [{ who: "davi", ...SOFA, mode: "sit", ex: "smile", look: -1 }] },
    // 7 · "'Já tô indo' vale três." a cabeça bate no topo da parede
    { at: 6, set: "sala", cam: wide(-1.4, 2.8, 2.0, { d: 12.5, fov: 40, h: 1.0, az: 10 }), kick: [[6, 0.15]], flash: true,
      acts: [{ who: "mae", x: -3.0, z: 2.0, ex: "shock", s: [[6, 1.6], [[6, 0.15], 2.8]] }, { who: "davi", ...SOFA, mode: "sit", ex: "smile", look: -1 }],
      fx: [{ k: "puff", x: -3.0, y: 0.4, z: 1.8, w: 2.2, at: [6, 0.15] }] },
    // 8 · "Mas o Davi tava na última fase do jogo."
    { at: 7, set: "sala", light: "golden", cam: face(SOFA.x, SOFA.z, HS, { az: -5, hf: 0.5, push: 0.85 }), tint: "#2a1d4a",
      acts: [{ who: "davi", ...SOFA, mode: "sit", ex: "stern", look: -1, shake: 0.6 }], props: [{ k: "controle", x: SOFA.x, y: 0.5, z: SOFA.z - 0.25, s: 1.0 }] },
    // 9 · "Já vou! Já vou! Já vou!"
    { at: 8, set: "sala", light: "golden", cam: face(SOFA.x, SOFA.z, HS, { az: 15 }), kick: [8, [8, 0.33, 1], [8, 0.66, 1]],
      acts: [{ who: "davi", ...SOFA, mode: "sit", ex: "yell", hop: 0.05 }] },
    // 10 · cada "já vou" estica a mãe: passa da parede
    { at: [8, 0.5, 1], set: "sala", cam: wide(-1.5, 3.5, 2.0, { d: 11, fov: 44, h: 0.8, az: 14 }), kick: [[8, 0.66, 1]],
      acts: [{ who: "mae", x: -3.0, z: 2.0, ex: "yell", s: [[[8, 0.5, 1], 2.8], [[8, 0.66, 1], 4.2]] }] },
    // 11 · "A mãe passou do teto. Depois do telhado." (de fora: maior que as casas)
    { at: 9, set: "rua", cam: { p: [0.5, 1.2, -6], l: [-2.0, 7.5, 12], fov: 46, p2: [0.5, 1.0, -9], dur: 3 }, kick: [[9, 0.5, 1]],
      acts: [{ who: "mae", x: -2.5, z: 12, ex: "yell", s: [[9, 4.5], [[9, 0.5, 1], 7.5]] }],
      fx: [{ k: "burst", x: -2.5, y: 9, z: 11.5, w: 6, at: [9, 0.5, 1] }] },
    // 12 · "O ônibus desviou dela."
    { at: 10, set: "rua", cam: { p: [5.5, 3.0, -7], l: [-0.5, 5.0, 14], fov: 46 },
      acts: [{ who: "mae", x: -1.2, z: 16, ex: "neutral", s: 8 }],
      props: [{ k: "onibus", x: 2.0, z: 9, drift: [0.6, 0, 3.5], yaw: 0.25 }] },
    // 13 · "O avião pediu licença."
    { at: [10, 0.5, 1], set: "rua", cam: { p: [2.5, 2.0, 2], l: [-1.2, 12, 16], fov: 50 },
      acts: [{ who: "mae", x: -1.2, z: 16, ex: "shock", s: 8, look: 1 }],
      props: [{ k: "aviao", x: 14, y: 15, z: 20, s: 0.45, yaw: Math.PI / 2, roll: 0.35, drift: [-10, 0, 0] }] },
    // 14 · o jornal
    { at: 11, set: "estudio", cam: face(0, 1.0, H.pai, { az: 0, hf: 0.3 }),
      acts: [{ who: "apresentador", x: 0, z: 1.0, ex: "shock" }] },
    // 15 · "…procura filho no bairro." (vista do alto)
    { at: [11, 0.55, 1], set: "rua", cam: { p: [12, 30, -30], l: [0, 20, 20], fov: 48, p2: [10, 34, -36], dur: 3 },
      acts: [{ who: "mae", x: 0, z: 20, ex: "stern", s: 14, look: -1 }] },
    // 16 · "Davi Lucas!" (o grito gigante)
    { at: 12, set: "rua", cam: { p: [0, 2, -4], l: [0, 19.5, 20], fov: 30 }, kick: [12], flash: true,
      acts: [{ who: "mae", x: 0, z: 20, ex: "yell", s: 14, arms: "hips" }] },
    // 17 · "Ele largou o controle, correu…"
    { at: 13, set: "sala", cam: wide(1.0, 0.8, 2.6, { d: 5.5, fov: 34, h: 1.0, az: -10 }),
      acts: [{ who: "davi", x: 2.2, z: 2.4, ex: "shock", walk: [-1, -0.2, 1.3] }],
      props: [{ k: "controle", x: 1.6, y: 0.0, z: 2.9, spin: 6, s: 1.2 }], fx: [{ k: "puff", x: 1.4, y: 0.3, z: 2.6, w: 1.0, at: 13 }] },
    // 18 · "…e sentou na mesa."
    { at: [13, 0.6, 1], set: "cozinha", cam: { p: [-3.9, 1.2, 0.4], l: [-0.6, 0.75, 0.7], fov: 36 },
      acts: [{ who: "davi", x: -0.9, z: 0.6, y: 0.22, mode: "sit", ex: "nervous" }], props: [{ k: "prato", x: -0.2, y: 0.82, z: 0.6 }, { k: "banquinho", x: -0.9, z: 0.6 }] },
    // 19 · "A mãe voltou ao normal. A janta tava fria."
    { at: 14, set: "cozinha", cam: { p: [-4.0, 1.35, 0.2], l: [0.2, 1.0, 0.9], fov: 40 },
      acts: [{ who: "mae", x: 1.6, z: 1.4, ex: [[14, "sly"], [[14, 0.5, 1], "stern"]], arms: "hips", s: [[14, 1.6], [[14, 0.05], 1]] }, { who: "davi", x: -0.9, z: 0.6, y: 0.22, mode: "sit", ex: "sad" }],
      props: [{ k: "prato", x: -0.2, y: 0.82, z: 0.6 }, { k: "banquinho", x: -0.9, z: 0.6 }], fx: [{ k: "puff", x: 1.6, y: 0.5, z: 1.2, w: 1.4, at: 14 }] },
    // 20 · "Aí o celular do pai tocou. Era a vó."
    { at: 15, set: "sala", cam: face(2.6, 1.6, H.pai, { az: -15, hf: 0.38 }),
      acts: [{ who: "pai", x: 2.6, z: 1.6, ex: [[15, "neutral"], [[15, 0.55, 1], "nervous"]] }], props: [{ k: "celular", x: 2.3, y: 1.42, z: 1.5, pitch: -1.3, s: 1.0 }] },
    // 21 · "Já vou, mãe."
    { at: 16, set: "sala", cam: face(2.6, 1.6, H.pai, { az: 15 }),
      acts: [{ who: "pai", x: 2.6, z: 1.6, ex: "sly" }], props: [{ k: "celular", x: 2.3, y: 1.42, z: 1.5, pitch: -1.3, s: 1.0 }] },
    // 22 · "E atrás da montanha… apareceu a vó."
    { at: 17, set: "rua", cam: { p: [-0.5, 1.5, 0], l: [0, 28, 120], fov: 46, p2: [-0.5, 1.3, -3], dur: 3.5 }, kick: [[17, 0.55, 1]],
      acts: [{ who: "mae", x: -1.4, z: 6, ex: "shock", look: 1 }, { who: "davi", x: 0.4, z: 5.5, ex: "shock" }, { who: "pai", x: 1.6, z: 6.5, ex: "shock" },
        { who: "vo", x: 0, z: 190, y: 0, ex: "sly", s: 48, arms: "hips", rise: [[17, 0.4, 1], -70, 18] }],
      props: [{ k: "montanha", x: 0, z: 165 }], fogK: 3, dof: 0, leg: 1120 },
    // 23 · CTA e loop: volta para o Davi no sofá
    { at: 18, set: "sala", cam: face(SOFA.x, SOFA.z, HS, { az: -10 , hf: 0.3, fr: 0.72 }), leg: 420,
      acts: [{ who: "davi", ...SOFA, mode: "sit", ex: "sly", look: -1 }], props: [{ k: "controle", x: SOFA.x, y: 0.5, z: SOFA.z - 0.25, s: 1.0 }] },
  ],
};
