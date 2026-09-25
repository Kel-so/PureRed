# Coletânea — o que mandar para o portfólio

O site mostra **13 vídeos**, cada um com uma função. Não é "tudo que eu já fiz": é o mínimo que prova, para quem te acha num cold email, que você resolve o problema dele.

Separe os melhores de cada linha abaixo e me mande (ou rode `scripts/encode.sh` você mesmo). Enquanto um slot não tiver vídeo novo, o site usa o placeholder indicado (trabalho seu que já estava no site) ou esconde a seção.

| # | Slot | Qtd | Formato | Duração | Seção do site | Placeholder hoje |
|---|---|---|---|---|---|---|
| 1 | Showreel | **1** | 16:9 | 60–90 s | Topo (hero) | Montagem muda de 12 s gerada dos previews |
| 2 | Cortes de podcast | **4** | 9:16 | 30–60 s | Podcast clips | 3 cortes (4,7K / 3,2K / 1,8K views) |
| 3 | Bruto vs. editado | **1** | 16:9 ou 9:16 | 15–30 s | Raw vs. edit | — (seção escondida) |
| 4 | YouTube longo | **2** | 16:9 | trecho de 60–90 s + link do vídeo inteiro | Long-form YouTube | — (seção escondida) |
| 5 | Marca & social | **2** | 9:16 | 15–45 s | Brand & social | Skoria, Drift |
| 6 | Edição no ritmo | **3** | 16:9 | 30–90 s | Music-driven edits | Futsal, LDJR, Valorant |

## O que cada slot precisa mostrar

### 1 · Showreel (1)
- Abre com o melhor corte de podcast/talking head nos primeiros 3 s — é o nicho de entrada.
- Mistura: 50% podcast/criador, 30% marca, 20% ritmo (esporte/games/evento).
- Sem logo animado de 5 s no começo, sem cartela "SHOWREEL 2026". O site já diz o que é.
- Áudio bom: a pessoa clica em "Play with sound".
- Os 6 s mais fortes viram o loop mudo do topo (`--at` no encode).

### 2 · Cortes de podcast (4) — o slot mais importante
- 4 cortes de **episódios/convidados diferentes**, não 4 do mesmo.
- Pelo menos 2 em inglês ou com legenda em inglês, se tiver.
- Para cada um, anote o **número real**: views, retenção média (%), ou crescimento do canal. É isso que aparece no card. Sem número, o card fica só com o título.
- Gancho nos primeiros 2 s, legenda dinâmica, reenquadramento, sound design.

### 3 · Bruto vs. editado (1) — a prova que nenhuma frase substitui
- Um trecho de 15–30 s: **o bruto** (câmera aberta, sem corte, sem legenda, sem cor) e **o seu final** do mesmo trecho.
- Os dois arquivos precisam ter **o mesmo início e a mesma duração** (exporte os dois da mesma timeline, alinhados no mesmo timecode).
- O site mostra os dois sobrepostos com uma linha que o visitante arrasta.
- Encode: `scripts/encode.sh bruto.mp4 raw-vs-edit --as before` e `scripts/encode.sh final.mp4 raw-vs-edit`.

### 4 · YouTube longo (2)
- Episódio completo ou vídeo de 8–40 min que você editou. No site entra um trecho de 60–90 s (o player) + o link do vídeo inteiro no YouTube (campo `youtube`).
- Mostre b-roll, grafismo, capítulos, ritmo de fala limpo.
- Se tiver: tempo médio de exibição ou % de retenção.

### 5 · Marca & social (2)
- Peças para marca feitas **a partir de material do cliente** (não precisa ter captado).
- Anote o cliente e o resultado se souber (views, uso em anúncio, etc.).

### 6 · Edição no ritmo (3)
- Esporte, games, evento/aftermovie — o que tiver o melhor sync com a música.
- O primeiro da lista aparece grande; escolha o mais forte.
- **Same Day Edit** pode entrar aqui como um dos 3, mas não no topo: cliente remoto não compra algo que exige você no evento.

## Também preciso de (fora os vídeos)

- **Números** de cada vídeo (views, retenção, seguidores ganhos). Mesmo pequenos, números reais convertem mais que adjetivo.
- **2 ou 3 depoimentos** curtos (1–2 frases) com nome e função/canal da pessoa. Vai em `testimonials` no `site/data/site.json`; a seção só aparece quando tiver pelo menos um.
- **Nomes de clientes/canais** que podem aparecer (`clients` no mesmo arquivo).
- **Link de agendamento** (Cal.com ou Calendly, 15 min) → campo `booking`. Enquanto estiver vazio, "Book a call" abre um e-mail já preenchido.
- **E-mail no domínio** (ex.: `kelson@seudominio.com`) → campo `email`. Com o domínio na Cloudflare, o Email Routing encaminha de graça para o Gmail.
- **Preços dos pacotes** (em USD) → campo `price` em cada item de `rates`. Vazio = "Priced on the call".

## Como exportar (antes do encode)

- Master em H.264 ou ProRes, resolução nativa (1080×1920 ou 1920×1080), áudio estéreo 48 kHz.
- Sem barras pretas: o site corta em 9:16 e 16:9 exatos.
- Nome do arquivo não importa; o `id` você define no encode (`podcast-ep42-clip3`, `brand-skoria-drop`...).
