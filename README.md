# 🔴 PureRed - Brutalist Video & Events Portfolio

Bem-vindo ao **PureRed**, um portfólio audiovisual de alto impacto projetado para editores de vídeo, criadores de conteúdo e produtores de eventos que desejam uma presença digital marcante, agressiva e extremamente moderna.

Este site foi concebido sob a estética **Brutalista/Moderna** (inspirada na linguagem visual de eSports como LOUD, direção criativa editorial e alto contraste industrial), utilizando uma paleta baseada em **Preto Obsidiana Profundo**, **Branco Stark** e realces vibrantes de **Pure Red (#FF003C)**.

---

## 🔥 Funcionalidades Principais

*   **Design Brutalista Responsivo:** Tipografia arrojada (`Syne` e `Space Grotesk`), botões 3D com sombras de bloco sólidas, grids assimétricos e micro-animações fluidas que causam impacto imediato.
*   **Player Lightbox Universal:** Um visualizador modal inteligente utilizando a tag nativa `<dialog>` que reproduz vídeos instantaneamente ao clicar em qualquer cartão. Compatível com:
    *   **Links Diretos (.mp4, .webm, .ogg):** Perfeito para vídeos hospedados no próprio repositório GitHub (ex: `videos/seu-video.mp4`).
    *   **Embeds do YouTube:** Suporta links normais de compartilhamento e links curtos (`youtu.be`).
    *   **Embeds do Vimeo:** Carregamento rápido e responsivo.
*   **Controle Inteligente de Áudio:** O player fecha ao clicar fora do modal ou pressionar `ESC`, parando automaticamente a reprodução do vídeo e do som para evitar ruídos de fundo.
*   **Painel Administrativo Completo (`admin.html`):** Uma área administrativa privada protegida por senha local (`purered2026`) que permite gerenciar todo o portfólio.
    *   **Operações CRUD Completas:** Adicione novos projetos, edite títulos, capas, URLs de vídeo, datas, clientes, tags ou exclua projetos.
    *   **Estatísticas em Tempo Real:** Painel integrado com contadores automáticos de projetos por categoria.
    *   **Sincronização Serverless (Custo Zero):** Exporta um arquivo `projects.json` atualizado para você substituir no seu repositório, mantendo seu site 100% estático, seguro e sem custos com bancos de dados complexos na nuvem!

---

## 🛠️ Tecnologias Utilizadas

1.  **HTML5 Semântico:** Estrutura limpa e robusta, otimizada para SEO e acessibilidade.
2.  **CSS3 Moderno (Vanilla CSS):** Sem frameworks inchados como Tailwind. Usa variáveis CSS customizadas, flexbox/grid responsivos, scrollbars personalizadas, efeitos de backdrop blur e animações nativas.
3.  **JavaScript Moderno (ES6):** Manipulação dinâmica de DOM para filtros rápidos de categoria, gestão de estado persistente via `localStorage` e lógica do player lightbox.

---

## ⚡ Como Rodar e Testar Localmente

1.  Clone este repositório no seu computador:
    ```bash
    git clone https://github.com/Kel-so/PureRed.git
    cd PureRed
    ```
2.  Inicie um servidor local rápido (necessário para o carregamento do arquivo `projects.json` devido a políticas de segurança CORS do navegador):
    *   **Com Python (Recomendado):**
        ```bash
        python3 -m http.server 8000
        ```
        E acesse `http://localhost:8000` no seu navegador.
    *   **Com Node.js (se tiver o Live Server ou similar):**
        Abra com a extensão Live Server do VS Code ou instale um servidor rápido:
        ```bash
        npx -y serve
        ```

---

## 📥 Como Atualizar o Seu Site Público (Em 1 Minuto!)

O **PureRed** utiliza uma arquitetura híbrida de banco de dados offline perfeita para o **GitHub Pages**:

1.  Acesse o painel administrativo localmente em `http://localhost:8000/admin.html` e insira a senha `purered2026`.
2.  Insira seus novos vídeos, ajuste títulos, clientes, capas ou exclua itens antigos. As alterações refletem **instantaneamente** na sua tela!
3.  No final da página, clique no botão vermelho **"Exportar Banco de Dados (JSON)"** para baixar o arquivo `projects.json` atualizado.
4.  Substitua o arquivo `projects.json` da pasta do seu projeto por este arquivo baixado.
5.  Faça o push das alterações para o GitHub:
    ```bash
    git add projects.json
    git commit -m "atualizacao de portfolio de videos"
    git push
    ```
6.  Em poucos segundos, o GitHub Pages atualizará o seu site público automaticamente!

---

## 🔒 Segurança do Painel Administrativo

O painel administrativo é protegido por uma senha local em `admin.js` (`purered2026`). Caso queira alterar a senha de acesso, abra o arquivo `admin.js` e altere a constante no topo do arquivo:
```javascript
const PASSCODE = 'sua-nova-senha-aqui';
```

---
*Projetado com orgulho e energia brutalista por **Kel-so** &copy; 2026.*
