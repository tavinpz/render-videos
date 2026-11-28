// mm006 · "Nessa cidade, tudo que a mãe diz que tem em casa… aparece em casa."
import type { Ep } from "../motor/spec";
import tempos from "./e06_tempos.json";
import { face, wide, HEAD } from "./h";

const H = HEAD;
export const E06: Ep = {
  id: "e06", tempos,
  shots: [
    // 0 · gancho: close da mãe no mercado (1º quadro = rosto grande), dedo para cima
    { at: 0, set: "mercado", cam: face(0, 1, H.mae, { fov: 17, az: -8 }), kick: [[0, 0.9, 1]],
      acts: [{ who: "mae", x: 0, z: 1, ex: [[0, "sly"], [[0, 0.55, 1], "grin"]], arms: "point", facing: -1 }] },
    // 1 · "aparece em casa": a coisa surge na mesa da cozinha
    { at: [0, 0.72, 1], set: "cozinha", cam: wide(0.4, 0.95, 0.6, { d: 3.6, fov: 30, h: 1.7, az: 15 }), flash: true,
      props: [{ k: "prato", x: 0.1, y: 0.82, z: 0.6 }, { k: "hamburguerBom", x: 0.7, y: 0.82, z: 0.55, rise: [[0, 0.75, 1], 0.6, 0] }],
      fx: [{ k: "puff", x: 0.7, y: 1.05, z: 0.55, w: 0.9, at: [0, 0.75, 1], dur: 0.5 }, { k: "stars", x: 0.7, y: 1.2, z: 0.5, w: 1.1, at: [0, 0.85, 1] }] },
    // 2 · Davi pede no corredor do mercado
    { at: 1, set: "mercado", cam: wide(0.05, 0.95, 1, { d: 6.5, fov: 32, h: 1.3, az: 6, p2d: 5.6 }),
      acts: [{ who: "davi", x: -0.4, z: 0.6, ex: "grin", arms: "point", hop: 0.08 }, { who: "mae", x: 0.5, z: 1.3, ex: "neutral", facing: -1 }] },
    // 3 · "Tem hambúrguer em casa."
    { at: 2, set: "mercado", cam: face(0.5, 1.3, H.mae, { az: 18, roll: 0.03 }), kick: [2],
      acts: [{ who: "mae", x: 0.5, z: 1.3, ex: "sly", facing: -1 }] },
    // 4 · "E tinha." o prato triste na mesa, Davi atrás
    { at: 3, set: "cozinha", cam: { p: [0.4, 2.5, -1.5], l: [0.4, 0.86, 0.55], fov: 20, fov2: 16, dur: 1.8 }, kick: [3],
      props: [{ k: "hamburguerTriste", x: 0.4, y: 0.82, z: 0.55, s: 1.4 }],
      acts: [{ who: "davi", x: -0.85, z: 0.9, ex: [[3, "shock"], [[3, 0.5, 1], "sad"]] }],
      fx: [{ k: "puff", x: 0.4, y: 1.0, z: 0.5, w: 0.8, at: 3 }] },
    // 5 · close do Davi decepcionado
    { at: [3, 0.62, 1], set: "cozinha", cam: face(-0.85, 0.9, H.davi, { az: -25, d: 2.6 }),
      acts: [{ who: "davi", x: -0.85, z: 0.9, ex: "sad", look: 1 }], props: [{ k: "hamburguerTriste", x: 0.4, y: 0.82, z: 0.55, s: 1.4 }] },
    // 6 · "quero o boneco do super-herói!" pulando no corredor
    { at: 4, set: "mercado", cam: wide(0.5, 0.95, -1.6, { d: 6, fov: 32, h: 1.1, az: -12 }),
      acts: [{ who: "davi", x: 0, z: -2, ex: "laugh", arms: "up", hop: 0.22 }, { who: "mae", x: 1.0, z: -1.2, ex: "stern", facing: -1, arms: "hips" }] },
    // 7 · "Tem boneco em casa."
    { at: 5, set: "mercado", cam: face(1.0, -1.2, H.mae, { az: -18, roll: -0.03 }), kick: [5],
      acts: [{ who: "mae", x: 1.0, z: -1.2, ex: "sly", facing: -1, arms: "hips" }] },
    // 8 · a meia com dois botões na cama
    { at: 6, set: "quarto", cam: { p: [2.0, 1.4, 0.3], l: [2.3, 0.8, 2.9], fov: 22, fov2: 17, dur: 1.6 }, flash: true,
      props: [{ k: "clebinho", x: 2.3, y: 0.68, z: 2.9, s: 0.6 }], fx: [{ k: "stars", x: 2.3, y: 1.35, z: 2.8, w: 0.8, at: 6 }] },
    // 9 · "O nome dele é Clebinho." Davi e o Clebinho
    { at: [6, 0.55, 1], set: "quarto", cam: wide(1.7, 0.85, 2.0, { d: 4.8, fov: 32, h: 1.2, az: -14 }),
      props: [{ k: "clebinho", x: 2.15, y: 0.68, z: 2.5, s: 0.6 }],
      acts: [{ who: "davi", x: 1.3, z: 1.6, ex: [[6, "dazed"], [[6, 0.8, 1], "nervous"]], look: 1 }] },
    // 10 · "todo mundo tem videogame!" bravo na sala
    { at: 7, set: "sala", cam: wide(0.9, 0.95, 1.6, { d: 6.4, fov: 32, h: 1.2, az: 12, p2d: 5.4 }),
      acts: [{ who: "davi", x: 0.5, z: 1.2, ex: "angry", arms: "hips", shake: 1 }, { who: "mae", x: 1.4, z: 2.0, ex: "neutral", facing: -1 }] },
    // 11 · "Tem videogame em casa."
    { at: 8, set: "sala", cam: face(1.4, 2.0, H.mae, { az: -20, roll: 0.03 }), kick: [8],
      acts: [{ who: "mae", x: 1.4, z: 2.0, ex: "sly", facing: -1 }] },
    // 12 · a caixa de papelão com controle desenhado
    { at: 9, set: "sala", cam: { p: [0.4, 1.7, -2.6], l: [1.5, 0.45, 1.8], fov: 34, p2: [0.6, 1.5, -2.0], dur: 2.4 }, flash: true,
      props: [{ k: "caixaVG", x: 1.2, z: 1.6, yaw: 0.15 }],
      acts: [{ who: "davi", x: 1.9, z: 2.2, ex: [[9, "dazed"], [[9, 0.6, 1], "sad"]], mode: "sit", from: [9, 0.35, 1] }] },
    // 13 · férias: os amigos indo pra praia de carro com prancha
    { at: 10, set: "rua", light: "day", cam: { p: [-1.6, 1.3, -1.5], l: [2.2, 1.1, 8], fov: 52, p2: [-1.2, 1.3, -0.6], dur: 2.5 },
      props: [{ k: "carro", x: 1.9, z: 9, drift: [0, 0, 5], yaw: 0 }],
      acts: [{ who: "amigo", v: 0, x: 4.6, z: 6.5, wave: true, walk: [0, 1, 1.3], ex: "laugh" }, { who: "amigo", v: 1, x: 5.3, z: 5.8, walk: [0, 1, 1.3], ex: "grin" },
        { who: "davi", x: -0.6, z: 2.6, ex: "sad", look: 1 }] },
    // 14 · "Mãe! Eu quero ir pra praia!"
    { at: 11, set: "rua", cam: face(-0.6, 2.6, H.davi, { az: 30, d: 2.6 }), kick: [11],
      acts: [{ who: "davi", x: -0.6, z: 2.6, ex: "yell", arms: "up", hop: 0.12 }] },
    // 15 · "Tem praia em casa."
    { at: 12, set: "rua", cam: face(-5.2, 8, H.mae, { fov: 18, az: 20 }), kick: [12],
      acts: [{ who: "mae", x: -5.2, z: 8, ex: "sly", arms: "point", facing: 1 }] },
    // 16 · o quintal virou praia
    { at: 13, set: "quintal", cam: wide(0, 0.6, 2.0, { d: 13, fov: 38, h: 3.8, az: -12, p2d: 11, dur: 2.5 }), flash: true,
      props: [{ k: "piscina", x: 0, z: 1.5 }, { k: "areia", x: -3.2, z: 2.2 }, { k: "balde", x: -2.2, z: 1.0 }, { k: "guardasol", x: 3.4, z: 2.6 }],
      fx: [{ k: "stars", x: -3.2, y: 1.2, z: 2.2, w: 1.4, at: [13, 0.35, 1] }] },
    // 17 · "…e o pai de sunga no quintal."
    { at: [13, 0.74, 1], set: "quintal", cam: face(0.3, 1.6, H.pai - 0.35, { fov: 22, az: -15, d: 3.0 }),
      props: [{ k: "piscina", x: 0, z: 1.5 }, { k: "guardasol", x: 3.4, z: 2.6 }],
      acts: [{ who: "paiSunga", x: 0.3, z: 1.6, y: -0.35, ex: "grin", wave: true }] },
    // 18 · "Olha a onda!"
    { at: 14, set: "quintal", cam: wide(-0.45, 0.8, 0.9, { d: 8, fov: 34, h: 1.8, az: 0 }), kick: [14],
      props: [{ k: "piscina", x: 0, z: 1.5 }, { k: "areia", x: -3.2, z: 2.2 }, { k: "guardasol", x: 3.4, z: 2.6 }],
      acts: [{ who: "paiSunga", x: 0.3, z: 1.6, y: -0.35, ex: "laugh", arms: "up", hop: 0.1 }, { who: "davi", x: -1.2, z: 0.2, ex: "stern", arms: "hips" }],
      fx: [{ k: "burst", x: 0.3, y: 0.8, z: 1.3, w: 2.2, at: 14, dur: 0.5 }] },
    // 19 · "Um dia, o Davi ficou bravo de verdade."
    { at: 15, set: "sala", light: "golden", cam: wide(0.8, 0.8, 1.4, { d: 3.4, fov: 30, h: 0.9, az: -10, p2d: 2.6 }), tint: "#5a2030",
      acts: [{ who: "davi", x: 0.8, z: 1.4, ex: "angry", arms: "hips", shake: 2 }] },
    // 20 · "Eu quero uma mãe mais legal!"
    { at: 16, set: "sala", light: "golden", cam: face(0.8, 1.4, H.davi, { fov: 17, az: 0, d: 2.3 }), kick: [16], flash: true,
      acts: [{ who: "davi", x: 0.8, z: 1.4, ex: "yell", arms: "up", shake: 1.5 }] },
    // 21 · "Tem em casa." (sem maldade: sorriso)
    { at: 17, set: "sala", light: "golden", cam: face(2.0, 2.2, H.mae, { fov: 18, az: -12, push: 0.85 }),
      acts: [{ who: "mae", x: 2.0, z: 2.2, ex: "smile_closed", arms: "hug", facing: -1 }] },
    // 22 · "E tinha. A mesma que fritou o ovo…"
    { at: 18, set: "cozinha", cam: wide(-2.0, 1.1, 2.9, { d: 3.6, fov: 30, h: 1.5, az: 25 }),
      acts: [{ who: "mae", x: -2.0, z: 2.9, ex: "smile_closed", facing: 1 }], props: [{ k: "hamburguerTriste", x: 0.4, y: 0.82, z: 0.55, s: 1.4 }] },
    // 23 · "…costurou o Clebinho…"
    { at: [18, 0.4, 1], set: "quarto", cam: wide(1.65, 0.9, 2.4, { d: 4.8, fov: 30, h: 1.3, az: -8 }),
      acts: [{ who: "mae", x: 1.3, z: 2.3, ex: "smile_closed", facing: 1 }], props: [{ k: "clebinho", x: 2.0, y: 0.68, z: 2.6, s: 0.6 }] },
    // 24 · "…e encheu a piscina de balde."
    { at: [18, 0.7, 1], set: "quintal", cam: wide(-1.0, 0.9, 1.0, { d: 6.5, fov: 32, h: 1.6, az: 8 }),
      props: [{ k: "piscina", x: 0, z: 1.5 }, { k: "balde", x: -1.2, y: 0.9, z: 0.6, roll: 1.2 }],
      acts: [{ who: "mae", x: -1.5, z: 0.6, ex: "grin", arms: "up" }] },
    // 25 · abraço
    { at: [18, 0.88, 1], set: "quintal", light: "golden", cam: wide(0, 1.0, 0.5, { d: 4.4, fov: 30, h: 1.2, p2d: 5.6, dur: 2.5 }),
      acts: [{ who: "mae", x: 0.25, z: 0.6, ex: "laugh", arms: "hug" }, { who: "davi", x: -0.3, z: 0.4, ex: "laugh", arms: "hug" }],
      fx: [{ k: "stars", x: 0, y: 1.9, z: 0.5, w: 1.3, at: [18, 0.9, 1], dur: 0.8 }] },
    // 26 · CTA + loop: volta para a mãe no mercado (o 1º quadro)
    { at: 19, set: "mercado", cam: face(0, 1, H.mae, { az: -8, hf: 0.3, fr: 0.72 }), leg: 420,
      acts: [{ who: "mae", x: 0, z: 1, ex: "sly", arms: "point", facing: -1 }] },
  ],
};
