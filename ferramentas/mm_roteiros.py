# Mãe Mandou: roteiros dos episódios mm006-mm008 (premissa mágica, 28/11/2026).
# q: n narrador, m mãe, c Davi (criança), v pai. ex = emoção (0,5 padrão), p = pausa depois da fala (s).
# Gera public/mm/<ep>/roteiro.json e public/mm/voz1/roteiro.json (todas as falas juntas, para 1 rodada de voz).
import json, os

EPS = {
 'e06': [  # Tem em casa
  ('n', 'Nessa cidade, tudo que a mãe diz que tem em casa… aparece em casa.', 0.55),
  ('c', 'Mãe, compra hambúrguer?', 0.6),
  ('m', 'Tem hambúrguer em casa.', 0.5),
  ('n', 'E tinha. Pão de forma, ovo frito e meia salsicha.', 0.5),
  ('c', 'Mãe, eu quero o boneco do super-herói!', 0.65),
  ('m', 'Tem boneco em casa.', 0.5),
  ('n', 'Uma meia velha com dois botões. O nome dele é Clebinho.', 0.5),
  ('c', 'Mãe, todo mundo tem videogame!', 0.7),
  ('m', 'Tem videogame em casa.', 0.55),
  ('n', 'Uma caixa de papelão com o controle desenhado de caneta.', 0.5),
  ('n', 'Chegaram as férias. Os amigos foram pra praia.', 0.5),
  ('c', 'Mãe! Eu quero ir pra praia!', 0.8),
  ('m', 'Tem praia em casa.', 0.55),
  ('n', 'Piscina de plástico, areia da obra do vizinho… e o pai de sunga no quintal.', 0.55),
  ('v', 'Olha a onda!', 0.75),
  ('n', 'Um dia, o Davi ficou bravo de verdade.', 0.5),
  ('c', 'Eu quero uma mãe mais legal!', 0.85),
  ('m', 'Tem em casa.', 0.45),
  ('n', 'E tinha. A mesma que fritou o ovo, costurou o Clebinho e encheu a piscina de balde.', 0.5),
  ('n', 'Comenta o que a sua mãe disse que tinha em casa.', 0.55),
 ],
 'e07': [  # Já vou
  ('n', 'Nessa cidade, cada "já vou" que a criança fala deixa a mãe um metro mais alta.', 0.55),
  ('m', 'Davi, vem jantar!', 0.7),
  ('c', 'Já vou!', 0.55),
  ('n', 'Um metro.', 0.5),
  ('m', 'Davi, o banho!', 0.7),
  ('c', 'Já tô indo!', 0.55),
  ('n', '"Já tô indo" vale três.', 0.5),
  ('n', 'Mas o Davi tava na última fase do jogo.', 0.5),
  ('c', 'Já vou! Já vou! Já vou!', 0.7),
  ('n', 'A mãe passou do teto. Depois do telhado.', 0.55),
  ('n', 'O ônibus desviou dela. O avião pediu licença.', 0.55),
  ('n', 'No jornal: mulher de quarenta metros procura filho no bairro.', 0.55),
  ('m', 'Davi Lucas!', 0.9),
  ('n', 'Ele largou o controle, correu e sentou na mesa.', 0.55),
  ('n', 'A mãe voltou ao normal. A janta tava fria.', 0.5),
  ('n', 'Aí o celular do pai tocou. Era a vó.', 0.5),
  ('v', 'Já vou, mãe.', 0.5),
  ('n', 'E atrás da montanha… apareceu a vó.', 0.6),
  ('n', 'Comenta quantos "já vou" você fala por dia.', 0.55),
 ],
 'e08': [  # Engole o choro
  ('n', 'Nessa cidade, todo choro que a criança engole vira chuva.', 0.55),
  ('m', 'Engole o choro!', 0.75),
  ('n', 'Choro de vacina engolido: garoa.', 0.5),
  ('n', 'Nota vermelha engolida: temporal.', 0.55),
  ('n', 'Joelho ralado na bicicleta: granizo.', 0.55),
  ('n', 'Um dia, a escola inteira tomou vacina na mesma hora.', 0.5),
  ('n', 'Trezentas crianças engolindo o choro ao mesmo tempo.', 0.55),
  ('n', 'A cidade alagou. Os carros boiaram. O homem do tempo desistiu.', 0.6),
  ('n', 'Os cientistas investigaram. A resposta era uma frase só.', 0.5),
  ('m', 'Engole o choro!', 0.8),
  ('n', 'Aí chegou o Dia das Mães. O Davi deu um desenho feito à mão.', 0.5),
  ('c', 'Fui eu que fiz, mãe.', 0.55),
  ('m', 'Ai, filho… eu não vou chorar.', 0.65),
  ('n', 'Ela engoliu o choro.', 0.5),
  ('n', 'E pela primeira vez… saiu um arco-íris.', 0.6),
  ('n', 'Comenta CHUVA se a sua mãe também falava isso.', 0.55),
 ],
}

junto = []
for ep, falas in EPS.items():
    os.makedirs(f'public/mm/{ep}', exist_ok=True)
    fs = [{'c': f'{ep}_{i:02d}', 'q': q, 'txt': t, 'ex': ex} for i, (q, t, ex) in enumerate(falas)]
    json.dump({'falas': fs}, open(f'public/mm/{ep}/roteiro.json', 'w'), ensure_ascii=False, indent=1)
    junto += fs
    pal = sum(len(t.split()) for _, t, _ in falas); print(ep, len(falas), 'falas', pal, 'palavras', f'~{pal/3.6:.0f} s')
os.makedirs('public/mm/voz1', exist_ok=True)
json.dump({'falas': junto}, open('public/mm/voz1/roteiro.json', 'w'), ensure_ascii=False, indent=1)
