# Hospedagem — site na Vercel (ou Cloudflare Pages) + vídeos no Backblaze B2

```
visitante ──► seudominio.com ──────► Vercel               (HTML/CSS/JS, pasta site/)
          └─► media.seudominio.com ─► Cloudflare cache ─► Backblaze B2 (vídeos)
```

- **Site** (poucos KB): pode continuar na **Vercel**, onde já está. O `vercel.json` na raiz manda a Vercel publicar só a pasta `site/`, com os redirects dos links antigos. Cada `git push` na `main` publica sozinho.
  O repositório também funciona no **Cloudflare Pages** (`wrangler.toml`, `site/_headers`, `site/_redirects`) se um dia quiser juntar tudo num lugar só.
- **Vídeos** ficam no B2. A Cloudflare fica na frente como cache; o tráfego B2 → Cloudflare não é cobrado (Bandwidth Alliance). Você paga só o armazenamento: ~US$ 6/TB/mês, e os primeiros 10 GB são grátis. Um portfólio de 13 vídeos ocupa ~1–2 GB.
- Para o cache da Cloudflare funcionar, o **DNS do domínio precisa estar na Cloudflare**. O site continua na Vercel normalmente; só os registros dele ficam com a nuvem cinza (sem proxy).
- Por que não os vídeos na Vercel: o plano Hobby tem limite de 100 GB de tráfego/mês e vídeo consome isso rápido.
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
4. **Antes de trocar os nameservers**, confira em *DNS → Records* se a Cloudflare importou os registros que apontam para a Vercel. Eles devem ficar assim, com a **nuvem cinza (DNS only)**:

   | Tipo | Nome | Conteúdo |
   |---|---|---|
   | A | `@` | o IP que a Vercel mostrar (hoje `76.76.21.21`) |
   | CNAME | `www` | o alvo que a Vercel mostrar (ex.: `cname.vercel-dns.com`) |

   Os valores exatos aparecem na Vercel em *Project → Settings → Domains*. Nuvem laranja na frente da Vercel atrapalha o SSL e o cache dela.
5. Copie o **Zone ID** (página do domínio → Overview, coluna da direita) para `CF_ZONE_ID` no `.env`.
6. Em `.env`, defina `MEDIA_HOST=media.seudominio.com`.

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

## 5. Site

### Na Vercel (onde já está)

Nada a configurar: o `vercel.json` já diz para publicar a pasta `site/`, sem build. Depois do merge na `main`, a Vercel publica sozinha.

Se a Vercel mostrar 404 depois do deploy, abra *Project → Settings → Build and Deployment* e confira:
**Framework Preset** = Other · **Root Directory** = vazio (raiz do repo) · **Build Command** e **Output Directory** sem override.

Domínio próprio: *Project → Settings → Domains → Add* → `seudominio.com` e `www.seudominio.com`, e crie na Cloudflare os registros que ela pedir (nuvem cinza).

### Ou no Cloudflare Pages

1. *Workers & Pages → Create → Pages → Connect to Git* → repositório `Kel-so/PureRed`.
2. **Production branch:** `main` · **Build command:** (vazio) · **Build output directory:** `site`.
3. *Custom domains* → `seudominio.com` (e `www`). Depois remova o domínio da Vercel.

`site/_redirects` e `site/_headers` fazem no Pages o mesmo que o `vercel.json` faz na Vercel.

### Sem domínio ainda?

Dá para começar servindo direto do B2, sem Cloudflare: `scripts/set-media-host.sh f004.backblazeb2.com/file/purered-media` (use o seu `B2_DOWNLOAD_HOST`). Funciona, mas sem cache e com tráfego grátis só até 3× o que está armazenado por mês. Com o domínio na Cloudflare, rode o passo 3 e `scripts/set-media-host.sh` de novo.

## Custos esperados

| Item | Custo |
|---|---|
| Vercel Hobby ou Cloudflare Pages (site) | US$ 0 |
| Cloudflare (DNS, cache, Email Routing) | US$ 0 |
| B2 — até 10 GB | US$ 0 |
| B2 — acima de 10 GB | US$ 6 por TB/mês |
| Tráfego de vídeo B2 → Cloudflare | US$ 0 |
| Domínio `.com` | ~US$ 10/ano |
