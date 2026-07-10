# 🔴 PureRed — Portfólio de Kelson Budin

Portfólio audiovisual de **Kelson Budin** (PureRed): edição de vídeo de alta energia, motion design e banners esportivos. Site estático bilíngue (PT/EN), com estética dark + vermelho `#FF003C` no estilo dos vídeos.

## Estrutura

| Arquivo | O que é |
|---|---|
| `index.html` | Site em Português |
| `index-en.html` | Site em Inglês |
| `valores.html` / `pricing.html` | Tabela fixa de valores (PT / EN) |
| `projetos-especiais.html` / `special-projects.html` | Quiz de orçamento "Projetos Especiais" (PT / EN) |
| `quiz.js` | Lógica do quiz — trilhas, textos e **valores** (só os da tabela) ficam aqui |
| `projects.json` | **Banco de dados único** dos projetos (títulos, descrições e tags em PT e EN no mesmo arquivo) |
| `app.js` / `style.css` | Lógica e visual do site |
| `admin.html` / `admin.js` / `admin.css` | Painel admin para gerenciar os projetos |
| `assets/previews/` | Vídeos curtos em loop que tocam nos cards |
| `assets/banners/full/` e `assets/banners/thumbs/` | Banners (imagem cheia + miniatura) |

### Quiz "Projetos Especiais"

- **Trilha Edição** usa os valores da tabela (`SERVICES` no topo do `quiz.js`) e calcula estimativa por quantidade; prazos também são editáveis lá (`days`).
- **Trilhas Filmmaker e Branding** não mostram valor fixo — terminam em "orçamento personalizado" com resumo enviado pro seu WhatsApp.
- Toda tela final gera um link do WhatsApp com o resumo do diagnóstico preenchido.
- Para mudar preços: edite `valores.html`/`pricing.html` (texto) **e** `quiz.js` (constante `SERVICES`/`VFX_HOUR`).

## Seções do site

Hero com destaque → Áreas de Foco (Gaming & eSports, Eventos & Aftermovies, Social & Podcast, Motion & Design) → Melhores Trabalhos → Trabalhos por Categoria → Sobre (Kelson Budin) → Processo → Contato (WhatsApp/E-mail).

## Rodar localmente

```bash
cd PureRed
python3 -m http.server 8000
```

Acesse `http://localhost:8000` (o servidor é necessário para carregar o `projects.json`).

## Painel Admin

Acesse `/admin.html` e entre com a senha **`mGxppt54`** (definida em `admin.js`, constante `PASSCODE` — é só uma trava simples de edição, sem dados sensíveis).

No painel você pode:

- **➕ Adicionar projeto** — vídeo (YouTube/Shorts/Vimeo/.mp4) ou banner (imagem), com campos PT e EN lado a lado (se deixar o inglês vazio, ele usa o português).
- **✎ Editar / 🗑 Excluir / ★ Destacar** cada projeto direto na lista.
- **Arrastar** as linhas para reordenar como aparecem no site.
- **Buscar** por título, cliente ou categoria.

### Publicar as alterações (1 minuto)

As mudanças ficam salvas no navegador (a barra amarela mostra "Alterações não publicadas"). Para publicar:

1. Clique em **⬇ Baixar projects.json**.
2. Substitua o `projects.json` da pasta do projeto pelo arquivo baixado.
3. `git add projects.json && git commit -m "atualiza portfolio" && git push`

O GitHub Pages atualiza o site em segundos. Quando o arquivo publicado ficar igual ao rascunho, a barra volta a mostrar "Tudo sincronizado".

### Adicionar um banner novo

1. Coloque a imagem em `assets/banners/full/` (e opcionalmente uma miniatura menor em `assets/banners/thumbs/`).
2. No admin, crie um projeto do tipo **🖼 Banner / Imagem** apontando para esse caminho.

### Adicionar um preview em loop (vídeo no card)

Exporte um mp4 curto (5–8s, sem áudio, ~720p), salve em `assets/previews/` e informe o caminho no campo "Preview em loop".

---
*Design e edição por **Kelson Budin** © 2026.*
