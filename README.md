# Sophia Festa

Protótipo visual (somente front end) do site de **locação de casa por diária** Sophia Festa — só o espaço, sem serviço de festa.

- `index.html` — landing page (diárias, o que está incluso, opcionais, regras, orçamento com estimativa e envio por WhatsApp)
- `agenda.html` — área da equipe para a agenda da casa (login de demonstração; dados salvos só no navegador, chave `sophia.bookings.v2`)
- `contrato.html` — termo de locação com aceite eletrônico simples (CPF, assinatura digitada, comprovante com código, impressão/PDF e WhatsApp)
- `img/` — fotos reais da casa em WebP (800 e 1448 px) com JPEG de fallback; galeria com lightbox, hero e seções. Originais guardados fora do repositório
- `js/brand.js` — logo oficial redesenhada em SVG (Sophia Festa) e borboleta
- `js/config.js` — fonte única de preços, feriados, regras, itens inclusos e número de WhatsApp (`window.SOPHIA`)

Diárias: seg–qui R$ 750 · sexta/véspera de feriado R$ 1.000 · sáb, dom, feriados e datas comemorativas R$ 1.500 (8 h incluídas; hora extra 10%; limpeza R$ 150). Datas comemorativas incluem Dia dos Namorados, São João e Halloween. Cashback: 10% da diária (+ horas extras), sem a taxa de limpeza, no próximo evento.

Abra `index.html` no navegador — não precisa de build nem servidor. Veja `PROJECT_STATE.md` para decisões e pendências.
