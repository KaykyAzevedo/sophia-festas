/* =========================================================
   Sophia Festa — configuração central (locação da casa por diária)
   Compartilhado entre a landing e a agenda. Sem back end.
   ========================================================= */
(function () {
  const pad = (n) => String(n).padStart(2, "0");

  function parse(dateStr) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr || "");
    if (!m) return null;
    const d = new Date(+m[1], +m[2] - 1, +m[3]);
    // confere de volta: 2026-02-31 viraria 03-03 sem erro
    if (isNaN(d) || d.getFullYear() !== +m[1] || d.getMonth() !== +m[2] - 1 || d.getDate() !== +m[3]) return null;
    return d;
  }
  function fmt(d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  const S = {
    // PLACEHOLDER: número de teste. Trocar pelo WhatsApp real (DDI+DDD+número, só dígitos).
    WHATSAPP: "5500000000000",

    RATES: { weekday: 750, friday: 1000, weekend: 1500 },
    HOURS_INCLUDED: 8,
    EXTRA_HOUR_PCT: 0.10,   // hora adicional = 10% da diária
    CLEANING_FEE: 150,      // cobrada à parte
    CASHBACK_PCT: 0.10,     // desconto no próximo evento

    // Feriados nacionais e datas comemorativas (2026 e 2027) — tratadas como "weekend".
    // ATENÇÃO: a lista só cobre até 2027-12-31; precisa ser estendida (e HOLIDAYS_MAX atualizado) para datas posteriores.
    HOLIDAYS_MAX: "2027-12-31",
    HOLIDAYS: [
      // 2026
      "2026-01-01", // Confraternização Universal
      "2026-02-16", "2026-02-17", // Carnaval
      "2026-04-03", // Sexta-feira Santa
      "2026-04-05", // Páscoa
      "2026-04-21", // Tiradentes
      "2026-05-01", // Dia do Trabalho
      "2026-05-10", // Dia das Mães
      "2026-06-04", // Corpus Christi
      "2026-06-12", // Dia dos Namorados
      "2026-06-24", // São João
      "2026-08-09", // Dia dos Pais
      "2026-09-07", // Independência
      "2026-10-12", // N. Sra. Aparecida / Dia das Crianças
      "2026-10-31", // Halloween
      "2026-11-02", // Finados
      "2026-11-15", // Proclamação da República
      "2026-11-20", // Consciência Negra
      "2026-12-24", // Véspera de Natal
      "2026-12-25", // Natal
      "2026-12-31", // Réveillon
      // 2027
      "2027-01-01",
      "2027-02-08", "2027-02-09", // Carnaval
      "2027-03-26", // Sexta-feira Santa
      "2027-03-28", // Páscoa
      "2027-04-21",
      "2027-05-01",
      "2027-05-09", // Dia das Mães
      "2027-05-27", // Corpus Christi
      "2027-06-12", // Dia dos Namorados
      "2027-06-24", // São João
      "2027-08-08", // Dia dos Pais
      "2027-09-07",
      "2027-10-12", // N. Sra. Aparecida / Dia das Crianças
      "2027-10-31", // Halloween
      "2027-11-02",
      "2027-11-15",
      "2027-11-20",
      "2027-12-24",
      "2027-12-25",
      "2027-12-31",
    ],

    OPTIONALS: [
      { id: "telao", label: "Telão", price: null },
      { id: "rede-futevolei", label: "Rede de futevôlei", price: null },
      { id: "piscina-aquecida", label: "Piscina aquecida", price: null },
    ],

    EVENT_TYPES: [
      "Dia de futebol com os amigos", "Noite de cinema", "Noivado", "Festa comemorativa",
      "Festa de empresa", "Halloween", "Natal", "Festa junina", "Evento familiar",
      "Evento escolar", "Evento de igreja", "Confraternização", "Outro",
    ],

    INCLUDED: [
      "Monitoramento por câmeras", "Piscina grande", "Área para decoração de festa", "Churrasqueira",
      "Totó (pebolim)", "Sinuca", "Frigobar", "Geladeira", "Televisão", "Wi-Fi", "Sistema de som JBL",
      "10 jogos de mesa com 4 cadeiras cada", "Fogão industrial de 6 bocas", "2 banheiros (feminino e masculino)",
    ],

    RULES: [
      "Não alugamos como sublocação.",
      "Não aceitamos eventos que cobram dos convidados.",
      "Proibido entrar dentro da casa, com exceção de aniversário, combinando com o anfitrião.",
      "Proibida a entrada de carros, que ficam em um recuo bem em frente ao local.",
    ],

    isHoliday(dateStr) {
      if (!parse(dateStr)) return false;
      return S.HOLIDAYS.indexOf(dateStr) !== -1;
    },

    // seg–qui = weekday; sexta ou véspera de feriado = friday;
    // sáb, dom, feriado ou data comemorativa = weekend (prioridade)
    dayRate(dateStr) {
      const d = parse(dateStr);
      if (!d) return { rate: S.RATES.weekday, tier: "weekday" }; // data inválida: sem exceção
      const dow = d.getDay();
      let tier = "weekday";
      if (dow === 5) tier = "friday";
      const next = new Date(d); next.setDate(next.getDate() + 1);
      if (S.isHoliday(fmt(next))) tier = "friday";
      if (dow === 0 || dow === 6 || S.isHoliday(fmt(d))) tier = "weekend";
      return { rate: S.RATES[tier], tier };
    },

    // base do cashback: diária + horas adicionais (sem taxa de limpeza e sem opcionais)
    cashbackBase({ date, extraHours } = {}) {
      const q = S.quote({ date, extraHours });
      return q.rate + q.extra;
    },

    // opcionais não entram no total (valor sob consulta)
    quote({ date, extraHours, optionals } = {}) {
      const { rate } = S.dayRate(date); // data inválida cai em weekday (dayRate)
      const h = Math.max(0, Math.floor(Number(extraHours) || 0));
      const extra = h * rate * S.EXTRA_HOUR_PCT;
      const cleaning = S.CLEANING_FEE;
      return { rate, extra, cleaning, total: rate + extra + cleaning };
    },
  };

  window.SOPHIA = S;
})();
