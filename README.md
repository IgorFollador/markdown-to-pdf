# Markdown to PDF

Conversor gratuito de Markdown para PDF com editor, preview ao vivo e exportação 100% no navegador.

## Tecnologias

- React 19 + TypeScript + Vite
- markdown-it + GFM (tabelas, task lists, strikethrough)
- highlight.js (syntax highlighting)
- html2pdf.js (exportação client-side)
- Tailwind CSS

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

Abre em `http://localhost:5173`.

## Build

```bash
npm run build
```

Gera os arquivos em `dist/`.

## Preview local

**Não abra `dist/index.html` diretamente no navegador** (`file://` causa erros de CORS). Use:

```bash
npm run preview
```

## Deploy no GitHub Pages

1. Crie o repositório no GitHub e faça push da branch `main`
2. Em **Settings → Pages**, configure a fonte como branch `gh-pages` (criada automaticamente pelo workflow)
3. O workflow em `.github/workflows/deploy.yml` publica a cada push em `main`

### Domínio customizado

O arquivo `public/CNAME` define `md.waykey.com.br`. Ajuste para seu domínio.

**DNS:**

| Tipo  | Nome | Valor                        |
| ----- | ---- | ---------------------------- |
| CNAME | md   | `waykey-technology.github.io` |

No GitHub: **Settings → Pages → Custom domain** → ative **Enforce HTTPS**.

## Privacidade

Todo o processamento (renderização e PDF) acontece localmente no seu navegador. Nenhum arquivo é enviado a servidores.

## Limitações

- PDF gerado via html2pdf.js — adequado para documentos comuns, não é renderização print-grade (Puppeteer)
- Imagens externas no PDF dependem de CORS do host de origem
- LaTeX/math não suportado no MVP
