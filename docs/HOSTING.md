# Hospedagem — Cloudflare Pages + Backblaze B2

```
visitante ──► seudominio.com ──────► Cloudflare Pages   (HTML/CSS/JS, pasta site/)
          └─► media.seudominio.com ─► Cloudflare cache ─► Backblaze B2 (vídeos)
```

- **Site** (poucos KB) fica no Cloudflare Pages, conectado a este repositório: cada `git push` na `main` publica sozinho. Grátis.
- **Vídeos** ficam no B2. A Cloudflare fica na frente como cache; o tráfego B2 → Cloudflare não é cobrado (Bandwidth Alliance). Você paga só o armazenamento: ~US$ 6/TB/mês, e os primeiros 10 GB são grátis. Um portfólio de 13 vídeos ocupa ~1–2 GB.
- Por que não o vídeo no próprio Pages: o Pages recusa arquivos acima de 25 MB.
- Por que não YouTube no player: sem anúncio, sem "vídeos relacionados" de outros editores no fim, sem a marca do YouTube em cima do seu trabalho. O YouTube continua como link para o vídeo completo.

Tudo abaixo é feito uma vez só. Os passos que dependem de conta/cartão são manuais; o resto está nos scripts.

---

## 0. Pré-requisitos (no seu Mac)

```bash
brew install ffmpeg jq
pip3 install b2          # CLI da Backblaze
cp .env.example .env     # o .env nunca vai pro git
```

## 1. Domínio na Cloudflare (manual)

1. Crie a conta em [dash.cloudflare.com](https://dash.cloudflare.com) (plano Free).
2. **Add a site** → seu domínio. Se ainda não tem domínio, dá pra comprar direto em *Domain Registration* (preço de custo, ~US$ 10/ano para `.com`).
3. Se o domínio é de outro registrador, troque os nameservers para os dois que a Cloudflare mostrar.
4. Copie o **Zone ID** (página do domínio → Overview, coluna da direita) para `CF_ZONE_ID` no `.env`.
5. Em `.env`, defina `MEDIA_HOST=media.seudominio.com`.

**E-mail no domínio (grátis):** *Email → Email Routing* → crie `kelson@seudominio.com` encaminhando para o Gmail. Para responder com esse endereço pelo Gmail: *Configurações → Contas → Enviar e-mail como*. Depois troque `email` em `site/data/site.json`.

## 2. Backblaze B2

1. Crie a conta em [backblaze.com/sign-up/cloud-storage](https://www.backblaze.com/sign-up/cloud-storage). Escolha a região **US West** ou **US East** (mais perto do seu público).
2. Verifique o e-mail — a B2 só deixa criar bucket **público** depois disso.
3. *Application Keys* → **Master Application Key** → gere e coloque em `B2_APPLICATION_KEY_ID` / `B2_APPLICATION_KEY` no `.env`.
4. Rode:

```bash
scripts/b2-setup.sh
```

Ele cria o bucket `purered-media` (público, com CORS e limpeza automática de versões antigas) e uma **chave só de upload**. Troque a master key no `.env` por essa chave nova e coloque o `B2_DOWNLOAD_HOST` que ele imprimir.

## 3. Cloudflare na frente do B2

Crie um token em *My Profile → API Tokens → Create Token → Custom token* com estas permissões, só para o seu domínio:

| Permissão | Nível |
|---|---|
| Zone → DNS | Edit |
| Zone → Transform Rules | Edit |
| Zone → Cache Rules | Edit |

Coloque em `CF_API_TOKEN` e rode:

```bash
scripts/cloudflare-setup.sh
```

Ele cria o `CNAME media → B2` (proxied), a regra que reescreve `/work/...` para `/file/purered-media/work/...`, a regra de cache (30 dias na borda, 1 ano no navegador) e remove os headers `x-bz-*`. Pode rodar de novo sem medo: só mexe nas regras `purered_media_*`.

**SSL:** em *SSL/TLS → Overview*, deixe **Full (strict)**.

## 4. Subir os vídeos

```bash
# 1) os placeholders que hoje estão no repositório
scripts/upload.sh site/media

# 2) conferir
curl -I https://media.seudominio.com/work/reel/loop.mp4     # espere 200 e cf-cache-status

# 3) apontar o site para o B2
scripts/set-media-host.sh
git rm -r site/media && git commit -am "media: serve from B2" && git push
```

Vídeo novo, a partir daí:

```bash
scripts/encode.sh ~/Exports/final.mp4 podcast-ep42-clip3 --at 1.5   # gera full, loop e poster
# cole o trecho impresso em site/data/work.json e preencha título/cliente/números
scripts/upload.sh
git commit -am "work: podcast ep42 clip 3" && git push
```

Os arquivos têm hash no nome (`full.a763b95b.mp4`), então trocar um vídeo nunca mostra a versão velha do cache.

## 5. Site no Cloudflare Pages (manual, 2 min)

1. *Workers & Pages → Create → Pages → Connect to Git* → repositório `Kel-so/PureRed`.
2. **Production branch:** `main` · **Build command:** (vazio) · **Build output directory:** `site`.
3. Depois do primeiro deploy: *Custom domains* → `seudominio.com` (e `www`).

Ou pelo terminal, sem conectar o Git: `npx wrangler pages deploy` (usa o `wrangler.toml`).

`site/_redirects` já manda os links antigos (`index-en.html`, `pricing.html`, páginas de nicho...) para a home, e `site/_headers` define cache e headers de segurança.

## Custos esperados

| Item | Custo |
|---|---|
| Cloudflare (DNS, Pages, cache, Email Routing) | US$ 0 |
| B2 — até 10 GB | US$ 0 |
| B2 — acima de 10 GB | US$ 6 por TB/mês |
| Tráfego de vídeo B2 → Cloudflare | US$ 0 |
| Domínio `.com` | ~US$ 10/ano |
