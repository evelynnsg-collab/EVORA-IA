# EVORA — versão pronta para Vercel

Esta versão contém `index.html` (com a imagem da EVORA de armadura vermelha incorporada) e duas rotas serverless opcionais (`/api/status` e `/api/chat`).

## Como publicar

1. Acesse https://vercel.com/new e importe o código deste projeto em um repositório GitHub.
2. Framework Preset: **Other**; Root Directory: a pasta contendo `index.html`.
3. Publique. Você receberá um endereço `*.vercel.app`.
4. Para ativar a conversa livre via IA, abra **Project Settings → Environment Variables** e cadastre `GEMINI_API_KEY` como chave privada nos ambientes desejados. Faça novo deployment após configurar. Opcional: `GEMINI_MODEL` (padrão `gemini-2.5-flash`). Não coloque chaves no HTML ou no GitHub.

## O que funciona

- Visual da EVORA com armadura vermelha, mensagens, microfone e voz pelo navegador (Chrome/Edge recomendados).
- Sem GEMINI_API_KEY: modo demonstração; as respostas livres de IA ficam indisponíveis.
- Com GEMINI_API_KEY válida: chamadas de chat passam pela função no servidor. O tráfego dos visitantes usa a sua cota da API; considere limitação de acesso/rate limiting antes de divulgar amplamente.
- Microfone depende de autorização do navegador. Personagem é uma imagem estática, não há animação do rosto nem controle do computador.

## Publicar no Windows com dois cliques

Extraia o ZIP local e dê dois cliques em **PUBLICAR_NA_VERCEL.bat**. Você precisa ter o Node.js instalado e concluir o login da Vercel quando for solicitado.
