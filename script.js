
(() => {
  "use strict";

  const ETAPAS = [
    "Novo lead",
    "1ª Tentativa de contato",
    "2ª Tentativa de contato",
    "3ª Tentativa de contato",
    "Lead Frio",
    "Qualificação",
    "Reunião agendada",
    "Envio de documentos",
    "Negociação",
    "Venda concluída"
  ];

  const STORAGE_KEY = "vertice_leads";

  const $ = (seletor, raiz = document) => raiz.querySelector(seletor);
  const $$ = (seletor, raiz = document) => [...raiz.querySelectorAll(seletor)];

  const escapar = (valor) =>
    String(valor ?? "").replace(/[&<>"']/g, caractere => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[caractere]);

  function carregarLeads() {
    try {
      const dados = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(dados) ? dados : [];
    } catch {
      return [];
    }
  }

  let leads = carregarLeads();
  let leadEditando = null;

  const formulario = $("#lead-form");
  const modal = $("#lead-modal");
  const botaoSalvar = formulario?.querySelector('[type="submit"]');

  function salvarLeads() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    atualizarCRM();
  }

  function gerarId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function formatarTelefone(telefone) {
    const numero = String(telefone || "").replace(/\D/g, "");
    if (!numero) return "";
    return numero.startsWith("55") ? numero : `55${numero}`;
  }

  function linkWhatsApp(telefone) {
    const numero = formatarTelefone(telefone);
    if (!numero || numero.length < 12 || numero.length > 13) {
      return escapar(telefone || "Sem telefone");
    }

    return `<a class="telefone-whatsapp" href="https://wa.me/${numero}" target="_blank" rel="noopener noreferrer" title="Conversar pelo WhatsApp">${escapar(telefone)}</a>`;
  }

  function valor(id) {
    return $(`#${id}`)?.value?.trim() || "";
  }

  function definirValor(id, conteudo) {
    const campo = $(`#${id}`);
    if (campo) campo.value = conteudo || "";
  }

  function abrirModal(lead = null) {
    if (!formulario || !modal) return;

    formulario.reset();
    leadEditando = lead?.id || null;

    definirValor("lead-name", lead?.nome);
    definirValor("lead-phone", lead?.telefone);
    definirValor("lead-email", lead?.email);
    definirValor("lead-interest", lead?.interesse);
    definirValor("lead-origin", lead?.origem);
    definirValor("lead-region", lead?.regiao);
    definirValor("lead-income", lead?.renda);
    definirValor("lead-stage", lead?.etapa || ETAPAS[0]);
    definirValor("lead-notes", lead?.observacoes);

    const titulo = modal.querySelector("h2, h3, .modal-title");
    if (titulo) titulo.textContent = lead ? "Editar lead" : "Novo lead";

    const botaoExcluir = $("#excluir-lead-modal");
    if (botaoExcluir) botaoExcluir.hidden = !lead;

    modal.classList.add("active");
    modal.style.display = "flex";
  }

  function fecharModal() {
    if (!modal) return;
    modal.classList.remove("active");
    modal.style.display = "none";
    leadEditando = null;
  }

  function criarBotaoExcluir() {
    if (!formulario || $("#excluir-lead-modal")) return;

    const botao = document.createElement("button");
    botao.type = "button";
    botao.id = "excluir-lead-modal";
    botao.textContent = "Excluir lead";
    botao.className = "btn-danger";
    botao.hidden = true;

    botao.addEventListener("click", excluirLeadAtual);
    formulario.appendChild(botao);
  }

  function excluirLeadAtual() {
    if (!leadEditando) return;

    const lead = leads.find(item => item.id === leadEditando);
    if (!lead) return;

    if (!confirm(`Deseja realmente excluir o lead ${lead.nome}?`)) return;

    leads = leads.filter(item => item.id !== leadEditando);
    fecharModal();
    salvarLeads();
  }

  function obterDadosFormulario() {
    return {
      nome: valor("lead-name"),
      telefone: valor("lead-phone"),
      email: valor("lead-email"),
      interesse: valor("lead-interest"),
      origem: valor("lead-origin"),
      regiao: valor("lead-region"),
      renda: valor("lead-income"),
      etapa: valor("lead-stage") || ETAPAS[0],
      observacoes: valor("lead-notes")
    };
  }

  function salvarLead(evento) {
    evento.preventDefault();

    const dados = obterDadosFormulario();

    if (!dados.nome) {
      alert("Informe o nome do lead.");
      $("#lead-name")?.focus();
      return;
    }

    if (!dados.telefone) {
      alert("Informe o telefone do lead.");
      $("#lead-phone")?.focus();
      return;
    }

    if (leadEditando) {
      const indice = leads.findIndex(item => item.id === leadEditando);
      if (indice !== -1) {
        leads[indice] = {
          ...leads[indice],
          ...dados,
          atualizadoEm: new Date().toISOString()
        };
      }
    } else {
      leads.push({
        id: gerarId(),
        ...dados,
        criadoEm: new Date().toISOString()
      });
    }

    fecharModal();
    salvarLeads();
  }

  function criarCard(lead) {
    return `
      <article class="lead-card" draggable="true" data-lead-id="${escapar(lead.id)}">
        <div class="lead-card-header">
          <strong>${escapar(lead.nome)}</strong>
        </div>
        <p class="lead-phone">${linkWhatsApp(lead.telefone)}</p>
        <p>${escapar(lead.interesse || "Interesse não informado")}</p>
        <p>${escapar(lead.regiao || "")}</p>
        <div class="lead-card-actions">
          <button type="button" class="btn-edit" data-action="editar" data-id="${escapar(lead.id)}">Editar</button>
        </div>
      </article>
    `;
  }

  function renderizarKanban() {
    $$(".kanban-column").forEach(coluna => {
      const etapa = coluna.dataset.stage;
      const conteudo = $(".column-content", coluna);
      const contador = $(".column-count", coluna);

      if (!conteudo || !etapa) return;

      const leadsDaEtapa = leads.filter(lead => lead.etapa === etapa);

      conteudo.innerHTML = leadsDaEtapa.map(criarCard).join("");

      if (contador) contador.textContent = leadsDaEtapa.length;
    });

    const total = $(".kanban-total");
    if (total) total.textContent = leads.length;
  }

  function renderizarLista() {
    const tabela = $("#all-leads");
    if (!tabela) return;

    const busca = ($("#list-search")?.value || "").toLowerCase();
    const filtroEtapa = $("#list-stage-filter")?.value || "";

    const filtrados = leads.filter(lead => {
      const texto = `${lead.nome} ${lead.telefone} ${lead.email} ${lead.interesse}`.toLowerCase();
      return texto.includes(busca) && (!filtroEtapa || lead.etapa === filtroEtapa);
    });

    const linhas = filtrados.map(lead => `
      <tr>
        <td>${escapar(lead.nome)}</td>
        <td>${linkWhatsApp(lead.telefone)}</td>
        <td>${escapar(lead.email)}</td>
        <td>${escapar(lead.interesse)}</td>
        <td>${escapar(lead.etapa)}</td>
        <td><button type="button" class="btn-edit" data-action="editar" data-id="${escapar(lead.id)}">Editar</button></td>
      </tr>
    `).join("");

    tabela.innerHTML = linhas || `<tr><td colspan="6">Nenhum lead encontrado.</td></tr>`;
  }

  function renderizarDashboard() {
    const total = leads.length;
    const vendas = leads.filter(lead => lead.etapa === "Venda concluída").length;
    const reunioes = leads.filter(lead => lead.etapa === "Reunião agendada").length;
    const ativos = total - vendas;

    if ($("#total-leads")) $("#total-leads").textContent = total;
    if ($("#active-leads")) $("#active-leads").textContent = ativos;
    if ($("#meetings-count")) $("#meetings-count").textContent = reunioes;
    if ($("#sales-count")) $("#sales-count").textContent = vendas;

    const recentes = [...leads]
      .sort((a, b) => new Date(b.criadoEm || 0) - new Date(a.criadoEm || 0))
      .slice(0, 5);

    const areaRecentes = $("#recent-leads");
    if (areaRecentes) {
      areaRecentes.innerHTML = recentes.length
        ? recentes.map(lead => `
          <div class="recent-lead">
            <strong>${escapar(lead.nome)}</strong>
            <span>${linkWhatsApp(lead.telefone)}</span>
            <small>${escapar(lead.etapa)}</small>
          </div>
        `).join("")
        : "<p>Nenhum lead cadastrado ainda.</p>";
    }

    const pipeline = $("#dashboard-pipeline");
    if (pipeline) {
      pipeline.innerHTML = ETAPAS.map(etapa => {
        const quantidade = leads.filter(lead => lead.etapa === etapa).length;
        return `
          <div class="pipeline-item">
            <span>${escapar(etapa)}</span>
            <strong>${quantidade}</strong>
          </div>
        `;
      }).join("");
    }
  }

  function atualizarCRM() {
    renderizarKanban();
    renderizarLista();
    renderizarDashboard();
  }

  function configurarEventos() {
    if (formulario) {
      formulario.addEventListener("submit", salvarLead);
    }

    criarBotaoExcluir();

    ["new-lead-dashboard", "new-lead-kanban", "new-lead-list"].forEach(id => {
      $(`#${id}`)?.addEventListener("click", () => abrirModal());
    });

    ["close-modal", "cancel-modal"].forEach(id => {
      $(`#${id}`)?.addEventListener("click", fecharModal);
    });

    modal?.addEventListener("click", evento => {
      if (evento.target === modal) fecharModal();
    });

    document.addEventListener("click", evento => {
      const botao = evento.target.closest('[data-action="editar"]');
      if (!botao) return;

      const lead = leads.find(item => item.id === botao.dataset.id);
      if (lead) abrirModal(lead);
    });

    $("#kanban-search")?.addEventListener("input", evento => {
      const busca = evento.target.value.toLowerCase();

      $$(".lead-card").forEach(card => {
        card.hidden = !card.textContent.toLowerCase().includes(busca);
      });
    });

    $("#list-search")?.addEventListener("input", renderizarLista);
    $("#list-stage-filter")?.addEventListener("change", renderizarLista);

    $$(".nav-item").forEach(item => {
      item.addEventListener("click", () => {
        const destino = item.dataset.view;
        if (!destino) return;

        $$(".nav-item").forEach(nav => nav.classList.remove("active"));
        item.classList.add("active");

        const titulo = $("#page-title");
        if (titulo) {
          titulo.textContent = item.textContent.trim();
        }

        const secoes = $$("[data-page], .page-view");
        secoes.forEach(secao => {
          const nome = secao.dataset.page || secao.id.replace("-view", "");
          secao.hidden = nome !== destino;
          secao.classList.toggle("active", nome === destino);
        });
      });
    });

    $$("[data-go-view]").forEach(botao => {
      botao.addEventListener("click", () => {
        const destino = botao.dataset.goView;
        const item = $(`.nav-item[data-view="${destino}"]`);
        item?.click();
      });
    });

    $$(".kanban-column").forEach(coluna => {
      const area = $(".column-content", coluna);
      if (!area) return;

      area.addEventListener("dragover", evento => evento.preventDefault());

      area.addEventListener("drop", evento => {
        evento.preventDefault();
        const id = evento.dataTransfer.getData("text/plain");
        const lead = leads.find(item => item.id === id);
        if (!lead) return;

        lead.etapa = coluna.dataset.stage;
        salvarLeads();
      });
    });

    document.addEventListener("dragstart", evento => {
      const card = evento.target.closest(".lead-card");
      if (!card) return;

      evento.dataTransfer.setData("text/plain", card.dataset.leadId);
      evento.dataTransfer.effectAllowed = "move";
    });
  }

  configurarEventos();
  atualizarCRM();
})();
