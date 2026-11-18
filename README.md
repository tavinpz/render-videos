# render-videos

Motor de render (Remotion, composição Arte) dos canais Last State Standing, Ten Thousand Runs e Quanto Você Dura?.
Cada vídeo fica em `public/l/<id>/` (`data.json` + `mix.m4a`). Para renderizar: crie/edite `fila/<id>.txt` com o número de partes
(ex.: `20`) e faça push, ou rode o workflow **render** em Actions. O vídeo final sai como artefato `video-<id>`.
