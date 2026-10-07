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
- `contrato.html` + `js/contrato.js` — termo de locação gerado a partir de SOPHIA, com aceite eletrônico simples (sem back end): CPF validado, assinatura digitada igual ao nome, comprovante com código de aceite, impressão/PDF e envio por WhatsApp. Aceita `?date=YYYY-MM-DD&type=...` para pré-preencher.
- `js/config.js` — FONTE ÚNICA (`window.SOPHIA`): WhatsApp, diárias, horas incluídas, hora extra, taxa de limpeza, cashback, feriados/datas comemorativas, opcionais, tipos de evento, itens inclusos, regras e as funções `isHoliday`, `dayRate`, `quote`, `cashbackBase`. Landing e agenda dependem dele.
- `img/` — 9 fotos reais do cliente (JPEG 1448x1086): fachada (hero), fachada com carros, recuo, piscina com telão, área externa, salão com mesas, churrasqueira/cozinha, salão para decoração e área de jogos. Usadas na galeria (lightbox em `magic.js`) e em figuras nas seções incluso, opcionais e regras. Caminhos relativos, sem barra inicial (site em subpasta no GitHub Pages).
- `css/style.css` — identidade visual compartilhada; `css/agenda.css` — painel
- `js/brand.js` — logo SVG e borboleta reutilizável; `js/magic.js` — estrelas, borboletas, brilho do cursor, nav (aria/Esc), reveal, toast
- `js/agenda.js` — lógica da agenda

## Preços (em config.js)
- Segunda a quinta: R$ 750,00
- Sexta e véspera de feriado: R$ 1.000,00
- Sábado, domingo, feriado e data comemorativa: R$ 1.500,00 (prioridade sobre as demais)
- Datas comemorativas de R$ 1.500 (2026 e 2027) incluem Dia dos Namorados (12/06), São João (24/06) e Halloween (31/10), além de Dia das Mães, Dia dos Pais, Dia das Crianças, Natal e Réveillon
- 8 horas incluídas; hora adicional = 10% da diária (sujeita a disponibilidade)
- Taxa de limpeza R$ 150,00 à parte
- Cashback (decisão do cliente): 10% sobre diária + horas adicionais, SEM taxa de limpeza e sem opcionais; vira desconto no próximo evento. `SOPHIA.cashbackBase({date, extraHours})` devolve a base. Validade/cumulatividade ainda a definir
- Opcionais (telão, rede de futevôlei, piscina aquecida): valor sob consulta, não entram no total

## Decisões importantes
- Estética: fundo preto, azul, detalhes metálicos; efeitos discretos; respeita prefers-reduced-motion.
- Formulário envia o pedido via wa.me (sem back end). Validação: data ≥ hoje e ≤ 2027-12-31, horas extras 0–8, telefone ≥ 10 dígitos, aceite das regras.
- Lista de feriados cobre só 2026–2027 (`HOLIDAYS_MAX`); estender ao ultrapassar.
- Nome grafado "Sophia"; confirmar com o cliente se é "Sofia".

## Bugs conhecidos
Nenhum bug confirmado. As entregas (landing, correções e contrato.html) foram validadas pela Lupa em Chrome headless. Não houve teste em celular real nem na tela de impressão real.

## Aceite do termo
- O código de aceite (SF-XXXX-XXXX, alfabeto sem I/O/0/1) é só uma referência: inclui o horário na derivação e NÃO é verificável nem recalculável.
- A agenda guarda o status do termo nos campos `term` ("Assinado"/"Não assinado") e `termCode` (código informado pela equipe).
- Cláusulas de danos, pagamento/sinal, confirmação, cancelamento e dados da locadora estão como A DEFINIR no termo (não inventar até o cliente informar).

## Regras do projeto
Não adicionar back end até aprovação da ideia. Fotos reais em img/ (usadas como estão, sem conversão/otimização). Não acrescentar itens inclusos ou ao termo por causa do que aparece nas fotos.

## Pendências
- Número real do WhatsApp (hoje placeholder 5500000000000)
- Dados do termo marcados "A DEFINIR" em contrato.html: dados da locadora, endereço do imóvel, forma de pagamento/sinal, política de cancelamento, procedimento de danos, regras do cashback, foro
- Logo oficial (adiado por decisão do cliente; o logo atual é provisório)
- Medidas (piscina, área externa), endereço e mapa — marcados "a confirmar" no site
- Confirmar com a dona se ping-pong e espaço infantil (visíveis na foto da área de jogos) entram nos itens inclusos — hoje a legenda é só "Área de jogos"
- Otimizar fotos (WebP/redimensionar) quando houver ferramenta
- Valores dos opcionais
- Lista definitiva de datas comemorativas (aguardando o cliente; Namorados, São João e Halloween já incluídos)
- Contrato com assinatura qualificada (hoje só aceite eletrônico simples), se o cliente exigir
- Hospedagem/deploy (Vercel ou Hostinger) e, depois, back end (autenticação e banco) para a agenda
