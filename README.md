# 🔴 PureRed — Portfólio de Kelson Budin

Portfólio audiovisual de **Kelson Budin** (PureRed): edição de vídeo de alta energia, motion design e banners esportivos. Site estático bilíngue (PT/EN), com estética dark + vermelho `#FF003C` no estilo dos vídeos.

## Estrutura

| Arquivo | O que é |
|---|---|
| `index.html` | Site em Português |
| `index-en.html` | Site em Inglês |
| `valores.html` / `pricing.html` | Tabela fixa de valores (PT / EN) |
| `projetos-especiais.html` / `special-projects.html` | Quiz de orçamento "Projetos Especiais" (PT / EN) |
| `quiz.js` | Lógica do quiz — trilhas, textos e prazos ficam aqui |
| `pricing.json` | **Valores dos serviços** (R$ e US$) — alimenta a tabela de valores e o quiz; editável pelo admin |
| `projects.json` | **Banco de dados único** dos projetos (títulos, descrições e tags em PT e EN no mesmo arquivo) |
| `app.js` / `style.css` | Lógica e visual do site |
| `admin.html` / `admin.js` / `admin.css` | Painel admin para gerenciar os projetos |
| `assets/previews/` | Vídeos curtos em loop que tocam nos cards |
| `assets/banners/full/` e `assets/banners/thumbs/` | Banners (imagem cheia + miniatura) |

### Quiz "Projetos Especiais"

- **Trilha Edição** usa os valores da tabela (`SERVICES` no topo do `quiz.js`) e calcula estimativa por quantidade; prazos também são editáveis lá (`days`).
- **Trilhas Filmmaker e Branding** não mostram valor fixo — terminam em "orçamento personalizado" com resumo enviado pro seu WhatsApp.
- Toda tela final gera um link do WhatsApp com o resumo do diagnóstico preenchido.
- **Para mudar preços**: use a seção "💰 Valores dos Serviços" no admin, baixe o `pricing.json` e substitua no projeto — tabela e quiz atualizam sozinhos nas duas línguas. (Os números no HTML e no `quiz.js` são só fallback.)

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
- **Views** — campo opcional nos vídeos; aparece como badge no card (ex: 1250000 → "1,2 mi"). Todos os vídeos verticais são agrupados automaticamente na seção **Reels & Shorts** do site.
- **Arrastar** as linhas para reordenar como aparecem no site.
- **Buscar** por título, cliente ou categoria.

### Publicar as alterações

**Modo direto (recomendado):** configure uma vez um token do GitHub no botão **⚙** do painel (fine-grained, só o repo PureRed, permissão Contents: Read and write — o token fica salvo apenas no seu navegador). Depois, com alterações pendentes, clique em **🚀 Publicar no site**: o painel commita o `projects.json`/`pricing.json` direto no repositório e o GitHub Pages atualiza em ~1 minuto. Funciona inclusive acessando o admin pelo site publicado, sem precisar do projeto no computador.

**Modo manual (sem token):**

1. Baixe o arquivo alterado (**⬇ projects.json** / **⬇ pricing.json**).
2. Substitua na pasta do projeto.
3. `git add -A && git commit -m "atualiza portfolio" && git push`

Quando o arquivo publicado ficar igual ao rascunho, a barra volta a mostrar "Tudo sincronizado".

### Adicionar um banner novo

1. Coloque a imagem em `assets/banners/full/` (e opcionalmente uma miniatura menor em `assets/banners/thumbs/`).
2. No admin, crie um projeto do tipo **🖼 Banner / Imagem** apontando para esse caminho.

### Adicionar um preview em loop (vídeo no card)

Exporte um mp4 curto (5–8s, sem áudio, ~720p), salve em `assets/previews/` e informe o caminho no campo "Preview em loop".

---
*Design e edição por **Kelson Budin** © 2026.*
