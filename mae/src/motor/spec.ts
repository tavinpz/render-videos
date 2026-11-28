// Formato de um episódio: planos amarrados às falas (índice da fala no roteiro + deslocamento em s).
import type { Expr } from "./toon";
import type { SetName } from "./sets";
import type { V3 } from "./base";

/** instante: índice da fala (começo dela) ou [fala, segundos depois do começo] */
export type At = number | [number, number] | [number, number, 1]; // [fala, fração da fala, 1]
export type Who = "mae" | "maeMeme" | "davi" | "daviAdulto" | "pai" | "paiSunga" | "vo" | "kid" | "apresentador" | "cientista" | "enfermeira" | "amigo" | "medico" | "bombeiro";
export type ActSpec = {
  who: Who; x: number; z: number; y?: number; v?: number;           // v = variação de roupa (kid/amigo)
  s?: number | [At, number][];                                       // escala (mãe gigante) com chaves
  ex?: Expr | [At, Expr][];                                          // expressão com chaves (cai 2 quadros antes)
  mode?: "stand" | "sit" | "stroll" | "march";
  arms?: "up" | "hips" | "point" | "hug" | "cover" | [At, "up" | "hips" | "point" | "hug" | "cover" | "none"][];
  wave?: boolean; look?: number; facing?: -1 | 0 | 1;
  walk?: [number, number, number];                                   // direção x, z e velocidade (m/s) desde o começo do plano
  hop?: number;                                                      // pulinho (m)
  shake?: number;                                                    // tremida de raiva/medo
  from?: At; to?: At;                                                // só aparece nesse intervalo
  side?: boolean;                                                    // força vista de lado
  rise?: [At, number, number];
  prop?: "chinelo" | [At, "chinelo" | "none"][];                      // objeto na mão                                       // sobe de y0 até y1 a partir de um instante
};
export type PropSpec = { k: string; x: number; y?: number; z: number; s?: number; yaw?: number; roll?: number; pitch?: number;
  from?: At; to?: At; rise?: [At, number, number]; spin?: number; drift?: [number, number, number] };
export type CamSpec = { p: V3; l: V3; fov?: number; p2?: V3; l2?: V3; fov2?: number; roll?: number; dur?: number; creep?: number };
export type FxSpec = { k: "burst" | "stars" | "puff" | "ring" | "note" | "cloud"; x: number; y: number; z: number; w: number; at: At; dur?: number };
export type Light = "day" | "golden" | "storm" | "night" | "warm";
export type ShotSpec = {
  at: At; set: SetName; light?: Light; cam: CamSpec; acts?: ActSpec[]; props?: PropSpec[]; fx?: FxSpec[];
  kick?: boolean | At[]; dof?: number; rain?: number; hail?: boolean; flood?: number | [number, number]; rainbow?: boolean; flash?: boolean;
  fogK?: number; // multiplica a distância da névoa (para ver gigantes longe)
  leg?: number; // centro da legenda em y (px de 1920); padrão 480
  tint?: string; // cor de sobreposição suave (ex.: "#1b2a4a" para clima de tempestade)
};
export type Tempos = { total: number; falas: { i: number; q: string; a: number; b: number; txt: string }[] };
export type Ep = { id: string; tempos: Tempos; shots: ShotSpec[] };
