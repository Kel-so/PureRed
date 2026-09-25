# PureRed — portfólio de Kelson Budin

Portfólio de **editor de vídeo**. O site existe para uma coisa: quem chega por um cold email assiste ao trabalho em 30 segundos e marca uma call.

- Uma página, EN por padrão, PT com `?lang=pt` (ou automático para navegador em português).
- Design editorial/brutalista: tinta preta sobre branco, com o reflexo iridescente de fundo de CD.
- Todo vídeo roda em loop mudo quando entra na tela (inclusive no celular) e abre com som no player.
- Um CTA: **Book a call** (Cal.com/Calendly quando configurado, senão e-mail pré-preenchido). WhatsApp só aparece na versão PT.

## Estrutura

```
site/                  ← tudo que é publicado (Cloudflare Pages, output dir = site)
  index.html
  assets/site.css, site.js
  data/site.json       contato, link de agendamento, clientes, depoimentos, pacotes
  data/work.json       seções e vídeos
  media/               placeholders temporários (saem daqui quando o B2 estiver no ar)
  _headers, _redirects
scripts/
  encode.sh            vídeo final → full.mp4 + loop.mp4 + poster.jpg (com hash no nome)
  upload.sh            envia para o Backblaze B2
  b2-setup.sh          cria bucket e chave de upload (uma vez)
  cloudflare-setup.sh  DNS + regras de rewrite/cache/headers para media.seudominio.com (uma vez)
  set-media-host.sh    aponta o site para o B2
docs/
  SHOTLIST.md          quais vídeos mandar: quantos de cada, formato, duração, o que mostrar
  HOSTING.md           passo a passo Cloudflare + B2
```

## Editar o conteúdo

**Vídeos** — `site/data/work.json`. Cada item:

```json
{
  "id": "podcast-ep42-clip3",
  "section": "clips",                    // clips | before-after | longform | brand | rhythm
  "title": { "en": "…", "pt": "…" },
  "client": "The X Podcast",
  "year": 2026,
  "format": "9:16",                      // 9:16 | 16:9 | 1:1
  "duration": "0:48",
  "role": { "en": "Cut, captions, sound", "pt": "Corte, legenda, som" },
  "metrics": [{ "value": "120K", "label": { "en": "views", "pt": "views" } }],
  "media": { "loop": "work/…/loop.x.mp4", "poster": "work/…/poster.x.jpg", "full": "work/…/full.x.mp4" },
  "youtube": "https://youtu.be/…"        // usado no player se não houver "full"; senão vira link "vídeo completo"
}
```

- A ordem no arquivo é a ordem no site. Seção sem item não aparece.
- Item de `before-after` leva também `"before": { "loop", "poster", "full" }` (o bruto).
- O vídeo do topo é `reel` no mesmo arquivo.

**Contato, pacotes, depoimentos** — `site/data/site.json`. `booking`, `price`, `clients` e `testimonials` vazios simplesmente não aparecem.

Não há mais painel admin: o conteúdo é esse JSON, versionado no git.

## Rodar localmente

```bash
python3 -m http.server 8000 --directory site
```

## O que mudou em relação ao site anterior

**Reaproveitado:** os 3 cortes de podcast (com views), Skoria, Drift, Futsal, LDJR e Valorant — como placeholders até chegarem os vídeos da [coletânea](docs/SHOTLIST.md); o processo em 4 etapas; resposta em 24h; bilinguismo; fuso UTC−3 (agora no topo, como "±1h do horário comercial da costa leste").

**Removido:** admin público (e a senha que estava neste README), tabela de preços por vídeo em BRL/USD, quiz de orçamento, páginas de nicho, banners/fotografia, motion de sites, Same Day Edit como destaque, listas de ferramentas/especialidades, WhatsApp como canal principal na versão EN.
