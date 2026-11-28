// v2 · Roteiro 1 · "Nessa cidade, toda mãe nasce com 47 anos e um chinelo na mão."
// Falas (public/mm/r1/roteiro.json): 0 narr gancho · 1 médico "É uma menina!" · 2 mãe "Quem deixou essa porta aberta?!"
// 3 mãe resmungando (por baixo do narrador) · 4 narr controle da TV · 5 mãe ar-condicionado · 6 médico "Puta que pa—" (beep)
// 7 mãe "Puta que o quê?" · 8 médico "Que paz" · 9 narr cientistas/bombeiros · 10 narr "acertou os três" · 11 bombeiro
// 12 narr 47 anos do Davi · 13 Davi adulto "porta aberta, porra" · 14 narr CTA
import type { Ep } from "../motor/spec";
import tempos from "./e09_tempos.json";
import { face, wide } from "./h";

// a mãe recém-nascida fica no colo do médico: erguida 0,55 m
const UP = 0.55, MH = 1.42 + UP;
export const E09: Ep = {
  id: "e09", tempos,
  shots: [
    // 0 · gancho: rosto da mãe-bebê (coque, bobes, chinelo erguido), câmera recua e revela o médico segurando
    { at: 0, set: "maternidade", light: "warm", dof: 10,
      cam: { ...face(0.15, 1.5, MH, { az: -6, hf: 0.42 }), p2: [0.6, 1.55, -4.6], l2: [0.15, 1.35, 1.5], fov2: 34, dur: 3.2 },
      acts: [{ who: "maeMeme", x: 0.15, z: 1.5, y: UP, ex: [[0, "stern"], [[0, 0.75, 1], "angry"]], prop: "chinelo", facing: 1 },
        { who: "medico", x: -0.35, z: 1.75, ex: "grin", arms: "up" }, { who: "enfermeira", x: 1.4, z: 2.4, ex: "smile" }] },
    // 1 · "É uma menina!"
    { at: 1, set: "maternidade", light: "warm", cam: face(-0.35, 1.75, 1.44, { az: 22, hf: 0.36, dy: -0.5 }),
      acts: [{ who: "medico", x: -0.35, z: 1.75, ex: "laugh", arms: "up" }] },
    // 2 · "Quem deixou essa porta aberta?!"
    { at: 2, set: "maternidade", light: "warm", cam: face(0.15, 1.5, MH, { az: -14, hf: 0.44, push: 0.82 }), kick: [2, [2, 0.55, 1]], flash: true,
      acts: [{ who: "maeMeme", x: 0.15, z: 1.5, y: UP, ex: "yell", prop: "chinelo", shake: 0.6 }] },
    // 3 · médico e enfermeira assustados
    { at: [2, 0.62, 1], set: "maternidade", light: "warm", cam: wide(0.5, 1.2, 1.9, { d: 6.5, fov: 30, h: 1.1, az: 18 }),
      acts: [{ who: "medico", x: -0.35, z: 1.75, ex: "shock", arms: "up" }, { who: "maeMeme", x: 0.15, z: 1.5, y: UP, ex: "yell", prop: "chinelo" },
        { who: "enfermeira", x: 1.4, z: 2.4, ex: "shock", arms: "cover" }] },
    // 4 · "Com dez minutos de vida, ela já tinha escondido o controle da TV do hospital…" (ela resmunga por baixo)
    { at: 4, set: "maternidade", light: "warm", cam: { p: [-1.2, 1.7, -2.6], l: [-3.6, 1.6, 2.4], fov: 34, p2: [-1.8, 1.6, -2.0], l2: [-4.0, 1.9, 2.6], dur: 3.5 },
      acts: [{ who: "maeMeme", x: -3.3, z: 2.0, ex: "sly", look: -1, arms: [[4, "cover"], [[4, 0.5, 1], "hips"]] }],
      props: [{ k: "controle", x: -3.05, y: 1.05, z: 1.9, s: 1.3, spin: 3 }] },
    // 5 · "Esse ar-condicionado tá ligado pra quê? É tu que paga a luz?" (contra-plongée apontando)
    { at: 5, set: "maternidade", light: "warm", cam: { p: [1.2, 0.9, -1.6], l: [1.6, 2.4, 3.6], fov: 38, p2: [1.0, 0.8, -1.3], dur: 2 },
      acts: [{ who: "maeMeme", x: 1.5, z: 1.4, ex: "angry", arms: "point", facing: 1 }], kick: [[5, 0.5, 1]] },
    // 6 · "Puta que pa—" (cochicho do médico pra enfermeira)
    { at: 6, set: "maternidade", light: "warm", cam: wide(-0.6, 1.35, 1.8, { d: 3.4, fov: 26, h: 1.4, az: -40 }),
      acts: [{ who: "medico", x: -0.9, z: 1.8, ex: "nervous", look: 1 }, { who: "enfermeira", x: -0.15, z: 1.9, ex: "nervous", look: -1 }] },
    // 7 · "Puta que o quê?" (silêncio, ela vira devagar; câmera entra lenta)
    { at: [7, -0.55], set: "maternidade", light: "warm", dof: 14, tint: "#2a1d3a",
      cam: { ...face(1.0, 1.6, 1.42, { az: 8, hf: 0.38 }), fov2: 16, dur: 1.8 },
      acts: [{ who: "maeMeme", x: 1.0, z: 1.6, ex: [[[7, -0.55], "neutral"], [7, "stern"], [[7, 0.6, 1], "angry"]], prop: "chinelo", look: -1 }], kick: [[7, 0.85, 1]] },
    // 8 · "…que paz, né. Que paz." (médico suando)
    { at: 8, set: "maternidade", light: "warm", cam: face(-0.9, 1.8, 1.44, { az: -10, hf: 0.42, push: 0.9 }),
      acts: [{ who: "medico", x: -0.9, z: 1.8, ex: [[8, "nervous"], [[8, 0.55, 1], "smile"]], shake: 0.4 }] },
    // 9 · "Os cientistas tentaram tirar o chinelo dela." (raio-X com o chinelo dentro da mão)
    { at: 9, set: "raiox", light: "night", dof: 6, cam: { p: [0, 1.7, -3.2], l: [0, 2.0, 3.4], fov: 40, p2: [0, 1.8, -2.2], dur: 2.5 },
      acts: [{ who: "cientista", v: 0, x: -0.55, z: 0.4, ex: "shock", look: 1 }, { who: "cientista", v: 1, x: 0.6, z: 0.2, ex: "dazed", look: -1 }] },
    // 10 · "Chamaram três bombeiros." (puxando o braço dela, cabo de guerra)
    { at: [9, 0.6, 1], set: "maternidade", light: "warm", cam: wide(-0.2, 1.1, 1.2, { d: 8, fov: 34, h: 1.2, az: 6 }),
      acts: [{ who: "maeMeme", x: 1.3, z: 1.4, ex: "angry", prop: "chinelo" },
        { who: "bombeiro", v: 0, x: 0.3, z: 1.2, ex: "pained", side: true }, { who: "bombeiro", v: 1, x: -0.5, z: 1.1, ex: "pained", side: true }, { who: "bombeiro", v: 2, x: -1.3, z: 1.0, ex: "pained", side: true }] },
    // 11 · "Ela acertou os três." (close nela, três estalos)
    { at: 10, set: "maternidade", light: "warm", cam: face(1.3, 1.4, 1.42, { az: 12, hf: 0.42 }), kick: [[10, 0.95, 1], [10, 1.25, 1], [10, 1.55, 1]],
      acts: [{ who: "maeMeme", x: 1.3, z: 1.4, ex: [[10, "stern"], [[10, 0.9, 1], "yell"]], prop: "chinelo", shake: 0.5 }],
      fx: [{ k: "burst", x: 1.0, y: 1.9, z: 1.2, w: 1.0, at: [10, 0.95, 1] }, { k: "burst", x: 1.6, y: 1.6, z: 1.2, w: 1.0, at: [10, 1.25, 1] }, { k: "burst", x: 1.2, y: 2.1, z: 1.2, w: 1.0, at: [10, 1.55, 1] }] },
    // 12 · "Ô desgraça, acertou de longe!" (bombeiros no chão)
    { at: 11, set: "maternidade", light: "warm", cam: { p: [-0.2, 2.6, -2.4], l: [-0.2, 0.4, 1.5], fov: 34, p2: [-0.2, 2.4, -1.9], dur: 2 },
      acts: [{ who: "bombeiro", v: 0, x: -0.2, z: 1.2, ex: "cry", mode: "fall" as never }, { who: "bombeiro", v: 1, x: -1.1, z: 1.6, ex: "dazed", mode: "fall" as never },
        { who: "bombeiro", v: 2, x: 0.7, z: 1.9, ex: "pained", mode: "fall" as never }], fx: [{ k: "stars", x: -0.2, y: 0.9, z: 1.1, w: 0.9, at: 11, dur: 1.5 }] },
    // 13 · "E aí… no aniversário de 47 anos do Davi…" (quarto, noite, ele dormindo sentado)
    { at: 12, set: "quarto", light: "night", dof: 8, tint: "#0d1530", cam: { p: [2.0, 1.4, -1.6], l: [2.2, 0.85, 2.6], fov: 34, p2: [2.1, 1.25, -0.4], fov2: 26, dur: 4 },
      acts: [{ who: "daviAdulto", x: 2.2, z: 2.6, y: 0.35, mode: "sit", ex: "dazed" }] },
    // 14 · o chinelo aparece na mão dele (brilho + coral)
    { at: [12, 0.82, 1], set: "quarto", light: "warm", flash: true, cam: face(2.2, 2.6, 0.95, { az: -8, hf: 0.34, dy: 0.25 }),
      acts: [{ who: "daviAdulto", x: 2.2, z: 2.6, y: 0.35, mode: "sit", ex: "shock", prop: "chinelo" }],
      fx: [{ k: "stars", x: 2.0, y: 1.7, z: 2.4, w: 1.4, at: [12, 0.82, 1], dur: 1.2 }] },
    // 15 · "QUEM DEIXOU ESSA PORTA ABERTA, PORRA?!"
    { at: 13, set: "quarto", light: "warm", cam: face(2.2, 2.6, 0.95, { az: 12, hf: 0.38, push: 0.85, dy: 0.25 }), kick: [13, [13, 0.6, 1]],
      acts: [{ who: "daviAdulto", x: 2.2, z: 2.6, y: 0.35, mode: "sit", ex: "yell", prop: "chinelo", shake: 0.7 }] },
    // 16 · CTA e loop: volta para a mãe-bebê na maternidade
    { at: 14, set: "maternidade", light: "warm", cam: face(0.15, 1.5, MH, { az: -6, hf: 0.3, fr: 0.72 }), leg: 420,
      acts: [{ who: "maeMeme", x: 0.15, z: 1.5, y: UP, ex: "stern", prop: "chinelo", facing: 1 }, { who: "medico", x: -0.35, z: 1.75, ex: "grin", arms: "up" }] },
  ],
};
