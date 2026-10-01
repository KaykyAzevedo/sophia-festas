# PROJECT_STATE — Sophia Festas

## Arquitetura
Protótipo estático (somente front end) para apresentar a ideia ao cliente. Sem back end; dados da agenda ficam no localStorage do navegador.

## Stack
HTML + CSS + JavaScript puro. Fontes Google (Great Vibes, Cinzel, Cormorant Garamond, Montserrat). Sem build.

## Estrutura
- `index.html` — landing page (hero, essência/simbolismo, espaços, pacotes, galeria, depoimentos, contato/orçamento)
- `agenda.html` — área da equipe (login demo → calendário, lista de reservas, modal criar/editar/excluir)
- `css/style.css` — identidade visual compartilhada; `css/agenda.css` — painel
- `js/brand.js` — logo SVG (borboleta pousada no S) e borboleta reutilizável; nome da marca em `BRAND_NAME`
- `js/magic.js` — estrelas, poeira de brilho, borboletinhas voando, brilho do cursor, nav, reveal, toast
- `js/agenda.js` — lógica da agenda (seed de exemplo, conflito de horário por espaço)

## Decisões importantes
- Estética: fundo preto, azul, detalhes metálicos (gradientes prata), efeitos discretos; respeita prefers-reduced-motion.
- Simbolismo: borboleta = transformação (etapas Sonho → Casulo → Voo; pacotes Casulo/Asas/Voo Mágico).
- Nome grafado "Sophia" (pasta do projeto); confirmar com cliente se é "Sofia".

## Funcionalidades concluídas
Landing completa e responsiva; agenda com login fictício, calendário mensal, próximos eventos, tabela com filtros, CRUD local e aviso de conflito.

## Trabalho atual
Nenhum — aguardando feedback do cliente.

## Bugs conhecidos
Nenhum conhecido.

## Regras do projeto
Não adicionar back end até aprovação da ideia. Fotos são placeholders (gradientes) — trocar por fotos reais.

## Próximos passos
Confirmar nome/logo oficial, fotos reais, contatos reais; depois definir back end (autenticação e banco) para a agenda.
