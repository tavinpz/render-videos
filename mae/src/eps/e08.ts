// mm008 · "Nessa cidade, todo choro que a criança engole vira chuva."
import type { Ep, ActSpec } from "../motor/spec";
import tempos from "./e08_tempos.json";
import { face, wide, HEAD } from "./h";

const H = HEAD;
/** a turma inteira na escola, em fileiras */
const turma = (ex: ActSpec["ex"]): ActSpec[] => {
  const out: ActSpec[] = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) out.push({ who: "kid", v: r * 5 + c, x: -3.6 + c * 1.8 + (r % 2) * 0.5, z: 2.6 - r * 1.5, ex, shake: 0.4 });
  return out;
};
export const E08: Ep = {
  id: "e08", tempos,
  shots: [
    // 0 · gancho: Davi segurando o choro (rosto grande)
    { at: 0, set: "posto", cam: face(-0.4, 1.2, H.davi, { az: -8 }),
      acts: [{ who: "davi", x: -0.4, z: 1.2, ex: [[0, "pained"], [[0, 0.4, 1], "sad"]], shake: 0.5 }] },
    // 1 · "…vira chuva."
    { at: [0, 0.55, 1], set: "rua", light: "storm", rain: 0.7, tint: "#24324a", cam: wide(0, 3, 10, { d: 14, fov: 44, h: 1.6, p2d: 12, dur: 2.5 }), flash: true },
    // 2 · "Engole o choro!"
    { at: 1, set: "posto", cam: face(1.0, 1.6, H.mae, { az: 15 }), kick: [1],
      acts: [{ who: "mae", x: 1.0, z: 1.6, ex: "yell", arms: "point", facing: -1 }] },
    // 3 · "Choro de vacina engolido…"
    { at: 2, set: "posto", cam: wide(-0.6, 0.9, 1.6, { d: 5.4, fov: 32, h: 1.2, az: -10 }),
      props: [{ k: "placaVacina", x: -0.4, y: 2.6, z: 3.9 }],
      acts: [{ who: "davi", x: -1.2, z: 1.4, y: 0.3, mode: "sit", ex: "pained", shake: 0.6 }, { who: "enfermeira", x: 0.2, z: 1.8, ex: "smile", arms: "point", facing: -1 }] },
    // 4 · "…garoa."
    { at: [2, 0.62, 1], set: "rua", light: "storm", rain: 0.18, cam: wide(5.2, 1.2, 8, { d: 6.5, fov: 36, h: 1.4, az: -20 }),
      acts: [{ who: "pai", x: 5.2, z: 8, ex: "nervous", look: 1, arms: "cover" }] },
    // 5 · "Nota vermelha engolida…"
    { at: 3, set: "escola", cam: { p: [-1.2, 1.9, -0.6], l: [-1.4, 0.75, 1.4], fov: 30, p2: [-1.2, 1.7, -0.2], dur: 1.2 },
      props: [{ k: "prova", x: -1.4, y: 0.72, z: 1.3, s: 1.3, yaw: Math.PI }],
      acts: [{ who: "davi", x: -1.4, z: 1.95, ex: "pained", shake: 0.8 }] },
    // 6 · "…temporal."
    { at: [3, 0.62, 1], set: "rua", light: "storm", rain: 0.85, tint: "#1b2a4a", cam: wide(0, 2.5, 14, { d: 12, fov: 42, h: 1.3, az: 15 }), flash: true, kick: true },
    // 7 · "Joelho ralado na bicicleta…"
    { at: 4, set: "rua", cam: wide(-1.0, 0.6, 4, { d: 5.2, fov: 32, h: 1.0, az: 25 }), kick: [4],
      props: [{ k: "bicicleta", x: -0.2, y: 0.05, z: 4.3, roll: 1.45, yaw: 0.4 }],
      acts: [{ who: "davi", x: -1.3, z: 3.8, ex: "pained", shake: 0.7 }], fx: [{ k: "stars", x: -1.3, y: 1.0, z: 3.7, w: 0.9, at: 4 }] },
    // 8 · "…granizo."
    { at: [4, 0.66, 1], set: "quintal", light: "storm", rain: 0.6, hail: true, tint: "#24324a", cam: wide(0.8, 1.0, 3.2, { d: 6, fov: 36, h: 1.4, az: -10 }), kick: true,
      acts: [{ who: "pai", x: -0.6, z: 3.4, ex: "shock", arms: "cover", walk: [1, 0, 1.6] }] },
    // 9 · "Um dia, a escola inteira tomou vacina na mesma hora."
    { at: 5, set: "escola", cam: wide(0, 1.0, 1.4, { d: 9.5, fov: 36, h: 2.4, p2d: 8, dur: 3 }),
      acts: [...turma("nervous"), { who: "enfermeira", x: 3.6, z: 3.6, ex: "smile", arms: "point", facing: -1 }] },
    // 10 · "Trezentas crianças engolindo o choro ao mesmo tempo."
    { at: 6, set: "escola", cam: wide(-0.4, 0.9, 1.6, { d: 5.4, fov: 34, h: 1.0, az: 8 }), kick: [[6, 0.6, 1]],
      acts: turma([[6, "pained"], [[6, 0.6, 1], "sad"]]) },
    // 11 · "A cidade alagou. Os carros boiaram."
    { at: 7, set: "rua", light: "storm", rain: 0.9, tint: "#1b2a4a", flood: [0.1, 0.9], cam: wide(0, 1.2, 10, { d: 12, fov: 42, h: 2.2, az: 10, p2d: 10 }),
      props: [{ k: "carro", x: 1.4, y: 0.6, z: 14, yaw: 0.6, drift: [0, 0, 0.6] }, { k: "carro", x: -2.0, y: 0.6, z: 22, yaw: -0.4 }] },
    // 12 · "O homem do tempo desistiu."
    { at: [7, 0.68, 1], set: "estudio", cam: face(0, 1.0, H.pai, { az: -6, hf: 0.32 }), rain: 0.35,
      acts: [{ who: "apresentador", x: 0, z: 1.0, ex: "dazed", arms: "up" }] },
    // 13 · "Os cientistas investigaram."
    { at: 8, set: "posto", cam: wide(0, 1.1, 1.9, { d: 9, fov: 36, h: 1.5, az: 6 }),
      acts: [{ who: "cientista", v: 0, x: -1.3, z: 1.8, ex: "stern" }, { who: "cientista", v: 1, x: 0.1, z: 2.2, ex: "nervous", look: -1 }, { who: "cientista", v: 2, x: 1.4, z: 1.7, ex: "whistle" }],
      props: [{ k: "lupa", x: -0.95, y: 1.0, z: 1.6, s: 1.3, roll: 0.5 }] },
    // 14 · "A resposta era uma frase só." (todos olham para a câmera)
    { at: [8, 0.55, 1], set: "posto", cam: face(0.1, 2.2, H.pai, { az: 0, hf: 0.36 }), kick: [[8, 0.55, 1]],
      acts: [{ who: "cientista", v: 1, x: 0.1, z: 2.2, ex: "shock" }] },
    // 15 · "Engole o choro!"
    { at: 9, set: "posto", cam: face(1.0, 1.6, H.mae, { az: -12, push: 0.8 }), kick: [9], flash: true,
      acts: [{ who: "mae", x: 1.0, z: 1.6, ex: "yell", arms: "point", facing: -1 }] },
    // 16 · "Aí chegou o Dia das Mães. O Davi deu um desenho feito à mão."
    { at: 10, set: "sala", light: "golden", cam: wide(0.95, 1.0, 1.8, { d: 7, fov: 32, h: 1.2, az: -8, p2d: 6, dur: 3 }),
      acts: [{ who: "mae", x: 1.35, z: 2.0, ex: "smile", facing: -1 }, { who: "davi", x: 0.55, z: 1.6, ex: "grin", arms: "up" }],
      props: [{ k: "desenho", x: 0.55, y: 1.3, z: 1.45, s: 0.8, from: [10, 0.5, 1] }] },
    // 17 · "Fui eu que fiz, mãe."
    { at: 11, set: "sala", light: "golden", cam: face(0.4, 1.6, H.davi, { az: -15 }),
      acts: [{ who: "davi", x: 0.4, z: 1.6, ex: "smile_closed", arms: "up" }], props: [{ k: "desenho", x: 0.4, y: 1.25, z: 1.35, s: 0.8 }] },
    // 18 · "Ai, filho… eu não vou chorar."
    { at: 12, set: "sala", light: "golden", cam: face(1.35, 2.0, H.mae, { az: 12 }),
      acts: [{ who: "mae", x: 1.35, z: 2.0, ex: [[12, "relief"], [[12, 0.45, 1], "sad"]], arms: "cover", facing: -1 }] },
    // 19 · "Ela engoliu o choro."
    { at: 13, set: "sala", light: "golden", cam: face(1.35, 2.0, H.mae, { az: -5, hf: 0.5, push: 0.85 }), kick: [[13, 0.5, 1]],
      acts: [{ who: "mae", x: 1.35, z: 2.0, ex: "pained", shake: 0.6, facing: -1 }] },
    // 20 · "E pela primeira vez… saiu um arco-íris."
    { at: 14, set: "rua", light: "golden", rainbow: true, cam: { p: [0, 1.0, -1], l: [0, 3.2, 12], fov: 46, p2: [0, 0.9, -3], dur: 3 },
      acts: [{ who: "mae", x: 0.3, z: 5.2, ex: "laugh", arms: "hug" }, { who: "davi", x: -0.3, z: 5.0, ex: "laugh", arms: "hug" }],
      fx: [{ k: "stars", x: 0, y: 2.2, z: 5.0, w: 1.6, at: [14, 0.5, 1], dur: 0.8 }] },
    // 21 · CTA e loop: o Davi de novo no posto
    { at: 15, set: "posto", cam: face(-0.4, 1.2, H.davi, { az: -8 , hf: 0.3, fr: 0.72 }), leg: 420,
      acts: [{ who: "davi", x: -0.4, z: 1.2, ex: "pained", shake: 0.5 }] },
  ],
};
