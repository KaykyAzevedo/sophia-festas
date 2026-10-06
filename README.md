# Sophia Festas

Protótipo visual (somente front end) do site de **locação de casa por diária** Sophia Festas — só o espaço, sem serviço de festa.

- `index.html` — landing page (diárias, o que está incluso, opcionais, regras, orçamento com estimativa e envio por WhatsApp)
- `agenda.html` — área da equipe para a agenda da casa (login de demonstração; dados salvos só no navegador, chave `sophia.bookings.v2`)
- `js/config.js` — fonte única de preços, feriados, regras, itens inclusos e número de WhatsApp (`window.SOPHIA`)

Diárias: seg–qui R$ 750 · sexta/véspera de feriado R$ 1.000 · sáb, dom, feriados e datas comemorativas R$ 1.500 (8 h incluídas; hora extra 10%; limpeza R$ 150).

Abra `index.html` no navegador — não precisa de build nem servidor. Veja `PROJECT_STATE.md` para decisões e pendências.
