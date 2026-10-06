# PROJECT_STATE — Sophia Festas

## Conceito
Locação de UMA casa por diária (somente o espaço, sem serviço de festa). Não há mais salões nem pacotes.

## Arquitetura
Protótipo estático (somente front end) para apresentar a ideia ao cliente. Sem back end; os dados da agenda ficam no localStorage do navegador (`sophia.bookings.v2`).

## Stack
HTML + CSS + JavaScript puro. Fontes Google (Great Vibes, Cinzel, Cormorant Garamond, Montserrat). Sem build.

## Estrutura
- `index.html` — landing: hero, a casa, diárias, incluso, opcionais, tipos de evento, regras, galeria (placeholders), orçamento com estimativa ao vivo, balão de WhatsApp
- `agenda.html` — área da equipe (login demo → calendário, lista de reservas, CRUD) para a casa única; storage `sophia.bookings.v2`
- `js/config.js` — FONTE ÚNICA (`window.SOPHIA`): WhatsApp, diárias, horas incluídas, hora extra, taxa de limpeza, cashback, feriados/datas comemorativas, opcionais, tipos de evento, itens inclusos, regras e as funções `isHoliday`, `dayRate`, `quote`. Landing e agenda dependem dele.
- `css/style.css` — identidade visual compartilhada; `css/agenda.css` — painel
- `js/brand.js` — logo SVG e borboleta reutilizável; `js/magic.js` — estrelas, borboletas, brilho do cursor, nav (aria/Esc), reveal, toast
- `js/agenda.js` — lógica da agenda

## Preços (em config.js)
- Segunda a quinta: R$ 750,00
- Sexta e véspera de feriado: R$ 1.000,00
- Sábado, domingo, feriado e data comemorativa: R$ 1.500,00 (prioridade sobre as demais)
- 8 horas incluídas; hora adicional = 10% da diária (sujeita a disponibilidade)
- Taxa de limpeza R$ 150,00 à parte; cashback de 10% no próximo evento
- Opcionais (telão, rede de futevôlei, piscina aquecida): valor sob consulta, não entram no total

## Decisões importantes
- Estética: fundo preto, azul, detalhes metálicos; efeitos discretos; respeita prefers-reduced-motion.
- Formulário envia o pedido via wa.me (sem back end). Validação: data ≥ hoje e ≤ 2027-12-31, horas extras 0–8, telefone ≥ 10 dígitos, aceite das regras.
- Lista de feriados cobre só 2026–2027 (`HOLIDAYS_MAX`); estender ao ultrapassar.
- Nome grafado "Sophia"; confirmar com o cliente se é "Sofia".

## Bugs conhecidos
Nenhum conhecido.

## Regras do projeto
Não adicionar back end até aprovação da ideia. Fotos são placeholders (gradientes).

## Pendências
- Número real do WhatsApp (hoje placeholder 5500000000000)
- Logo oficial
- Fotos reais
- Medidas (piscina, área externa) e endereço — marcados "a confirmar" no site
- Valores dos opcionais
- Lista definitiva de datas comemorativas (aguardando o cliente)
- Regra do cashback (validade, cumulatividade, etc.)
- Contrato com assinatura online
- Hospedagem/deploy e, depois, back end (autenticação e banco) para a agenda
