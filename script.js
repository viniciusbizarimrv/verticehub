
(() => {
  "use strict";

  const STORAGE_KEY = "vertice_leads";

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

  const $ = (seletor, elemento = document) =>
    elemento.querySelector(seletor);

  const $$ = (seletor, elemento = document) =>
    [...elemento.querySelectorAll(seletor)];

  let leads = carregarLeads();
  let leadEditando = null;

  function carregarLeads() {
    try {
      const dados = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(dados) ? dados : [];
    } catch (erro) {
      console.error("Erro ao carregar leads:", erro);
      return [];
    }
  }

  function salvarLeads() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
      atualizarCRM();
    } catch (erro) {
      console.error("Erro ao salvar leads:", erro);
      alert("Não foi possível salvar os dados neste navegador.");
    }
  }

  function escapar(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caractere => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[caractere]);
  }

  function gerarId() {
    return Date.now().toString(36) +
      Math.random().toString(36).slice(2, 9);
  }

  function formatarTelefoneWhatsApp(telefone) {
    let numero = String(telefone || "").replace(/\D/g, "");

    if (!numero) return "";

    // Números brasileiros com DDD recebem o código do país.
    if (numero.length === 10 || numero.length === 11) {
      numero = "55" + numero;
    }

    return numero;
  }

  function criarLinkWhatsApp(telefone) {
    const numero = formatarTelefoneWhatsApp(telefone);

    if (!numero || numero.length < 12 || numero.length > 13) {
      return escapar(telefone || "Não informado");
    }

    return `
      <a
        href="https://wa.me/${numero}"
        target="_blank"
        rel="noopener noreferrer"
        class="telefone-whatsapp"
        title="Abrir conversa no WhatsApp"
      >${escapar(telefone)}</a>
    `;
  }

  function obterCampo(id) {
    return $(`#${id}`);
  }

  function obterValor(id) {
    return obterCampo(id)?.value.trim() || "";
  }

  function definirValor(id, valor) {
    const campo = obterCampo(id);
    if (campo) campo.value = valor ?? "";
  }

  // NAVEGAÇÃO

  function abrirPagina(nomePagina) {
    const paginas = {
      dashboard: "dashboard-view",
      kanban: "kanban-view",
      lista: "lista-view"
    };

    const idDestino = paginas[nomePagina];
    if (!idDestino) return;

    Object.values(paginas).forEach(id => {
      const pagina = $(`#${id}`);
      if (!pagina) return;

      pagina.classList.toggle("hidden", id !== idDestino);
    });

    $$(".nav-item").forEach(botao => {
      botao.classList.toggle(
        "active",
        botao.dataset.view === nomePagina
      );
    });

    const titulos = {
      dashboard: "Dashboard",
      kanban: "Funil de vendas",
      lista: "Lista de leads"
    };

    const titulo = $("#page-title");
    if (titulo) titulo.textContent = titulos[nomePagina];
  }

  // MODAL

  function abrirModal(lead = null) {
    const modal = $("#lead-modal");
    const formulario = $("#lead-form");

    if (!modal || !formulario) return;

    formulario.reset();

    leadEditando = lead ? lead.id : null;

    definirValor("lead-id", lead?.id || "");
    definirValor("lead-name", lead?.nome || "");
    definirValor("lead-phone", lead?.telefone || "");
    definirValor("lead-email", lead?.email || "");
    definirValor("lead-interest", lead?.interesse || "");
    definirValor("lead-origin", lead?.origem || "");
    definirValor("lead-region", lead?.regiao || "");
    definirValor("lead-income", lead?.renda || "");
    definirValor("lead-stage", lead?.etapa || ETAPAS[0]);
    definirValor("lead-notes", lead?.observacoes || "");

    const titulo = $("#modal-title");
    if (titulo) {
      titulo.textContent = lead ? "Editar lead" : "Novo lead";
    }

    const botaoExcluir = $("#excluir-lead-modal");
    if (botaoExcluir) {
      botaoExcluir.hidden = !lead;
    }

    modal.classList.remove("hidden");

    obterCampo("lead-name")?.focus();
  }

  function fecharModal() {
    const modal = $("#lead-modal");
    if (!modal) return;

    modal.classList.add("hidden");
    leadEditando = null;
  }

  function criarBotaoExcluir() {
    const formulario = $("#lead-form");
    if (!formulario || $("#excluir-lead-modal")) return;

    const rodape = $(".modal-footer", formulario);
    if (!rodape) return;

    const botao = document.createElement("button");

    botao.type = "button";
    botao.id = "excluir-lead-modal";
    botao.className = "btn-secondary";
    botao.textContent = "Excluir lead";
    botao.hidden = true;

    botao.style.color = "#dc2626";
    botao.style.borderColor = "#dc2626";

    const botaoCancelar = $("#cancel-modal");

    if (botaoCancelar) {
      rodape.insertBefore(botao, botaoCancelar);
    } else {
      rodape.appendChild(botao);
    }

    botao.addEventListener("click", excluirLeadAtual);
  }

  function excluirLeadAtual() {
    if (!leadEditando) return;

    const lead = leads.find(item => item.id === leadEditando);
    if (!lead) return;

    const confirmou = confirm(
      `Deseja realmente excluir o lead ${lead.nome}?`
    );

    if (!confirmou) return;

    leads = leads.filter(item => item.id !== leadEditando);

    fecharModal();
    salvarLeads();
  }

  // CADASTRO E EDIÇÃO

  function obterDadosFormulario() {
    return {
      nome: obterValor("lead-name"),
      telefone: obterValor("lead-phone"),
      email: obterValor("lead-email"),
      interesse: obterValor("lead-interest"),
      origem: obterValor("lead-origin"),
      regiao: obterValor("lead-region"),
      renda: obterValor("lead-income"),
      etapa: obterValor("lead-stage") || ETAPAS[0],
      observacoes: obterValor("lead-notes")
    };
  }

  function salvarLead(evento) {
    evento.preventDefault();

    const dados = obterDadosFormulario();

    if (!dados.nome || !dados.telefone) {
      alert("Preencha o nome e o telefone do lead.");
      return;
    }

    if (leadEditando) {
      const indice = leads.findIndex(
        lead => lead.id === leadEditando
      );

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

  // FORMATAÇÃO DE DATAS

  function formatarData(data) {
    if (!data) return "-";

    const dataValida = new Date(data);

    if (Number.isNaN(dataValida.getTime())) return "-";

    return dataValida.toLocaleDateString("pt-BR");
  }

  // FUNIL DE VENDAS / KANBAN

  function criarCardLead(lead) {
    return `
      <article
        class="lead-card"
        draggable="true"
        data-lead-id="${escapar(lead.id)}"
      >
        <div class="lead-card-header">
          <strong>${escapar(lead.nome)}</strong>
        </div>

        <p>${criarLinkWhatsApp(lead.telefone)}</p>

        <p>${escapar(lead.interesse || "Interesse não informado")}</p>

        ${lead.regiao
          ? `<p>${escapar(lead.regiao)}</p>`
          : ""}

        <div class="lead-card-actions">
          <button
            type="button"
            class="btn-secondary"
            data-editar-lead="${escapar(lead.id)}"
          >Editar</button>
        </div>
      </article>
    `;
  }

  function renderizarKanban() {
    $$(".kanban-column").forEach(coluna => {
      const etapa = coluna.dataset.stage;
      const conteudo = $(".column-content", coluna);
      const contador = $(".column-count", coluna);

      if (!conteudo) return;

      const leadsDaEtapa = leads.filter(
        lead => lead.etapa === etapa
      );

      conteudo.innerHTML = leadsDaEtapa
        .map(criarCardLead)
        .join("");

      if (contador) {
        contador.textContent = leadsDaEtapa.length;
      }
    });

    const total = $("#kanban-total");

    if (total) {
      total.textContent =
        `${leads.length} ${leads.length === 1 ? "lead" : "leads"}`;
    }

    aplicarBuscaKanban();
  }

  function aplicarBuscaKanban() {
    const busca = ($("#kanban-search")?.value || "")
      .trim()
      .toLowerCase();

    $$(".lead-card").forEach(card => {
      card.hidden = !card.textContent.toLowerCase().includes(busca);
    });
  }

  // LISTA DE LEADS

  function atualizarFiltroEtapas() {
    const filtro = $("#list-stage-filter");
    if (!filtro) return;

    const valorAtual = filtro.value;

    filtro.innerHTML = `
      <option value="">Todas as etapas</option>
      ${ETAPAS.map(etapa => `
        <option value="${escapar(etapa)}">${escapar(etapa)}</option>
      `).join("")}
    `;

    filtro.value = valorAtual;
  }

  function renderizarLista() {
    const tabela = $("#all-leads");
    if (!tabela) return;

    const busca = ($("#list-search")?.value || "")
      .trim()
      .toLowerCase();

    const etapaSelecionada = $("#list-stage-filter")?.value || "";

    const filtrados = leads.filter(lead => {
      const texto = [
        lead.nome,
        lead.telefone,
        lead.email,
        lead.interesse,
        lead.regiao
      ].join(" ").toLowerCase();

      return texto.includes(busca) &&
        (!etapaSelecionada || lead.etapa === etapaSelecionada);
    });

    if (!filtrados.length) {
      tabela.innerHTML = `
        <tr>
          <td colspan="6">Nenhum lead encontrado.</td>
        </tr>
      `;
      return;
    }

    tabela.innerHTML = filtrados.map(lead => `
      <tr>
        <td>${escapar(lead.nome)}</td>
        <td>${criarLinkWhatsApp(lead.telefone)}</td>
        <td>${escapar(lead.email || "-")}</td>
        <td>${escapar(lead.interesse || "-")}</td>
        <td>${escapar(lead.etapa)}</td>
        <td>
          <button
            type="button"
            class="btn-secondary"
            data-editar-lead="${escapar(lead.id)}"
          >Editar</button>
        </td>
      </tr>
    `).join("");
  }

  // DASHBOARD

  function renderizarDashboard() {
    const total = leads.length;

    const vendas = leads.filter(
      lead => lead.etapa === "Venda concluída"
    ).length;

    const reunioes = leads.filter(
      lead => lead.etapa === "Reunião agendada"
    ).length;

    const ativos = total - vendas;

    if ($("#total-leads")) {
      $("#total-leads").textContent = total;
    }

    if ($("#active-leads")) {
      $("#active-leads").textContent = ativos;
    }

    if ($("#meetings-count")) {
      $("#meetings-count").textContent = reunioes;
    }

    if ($("#sales-count")) {
      $("#sales-count").textContent = vendas;
    }

    const pipeline = $("#dashboard-pipeline");

    if (pipeline) {
      pipeline.innerHTML = ETAPAS.map(etapa => {
        const quantidade = leads.filter(
          lead => lead.etapa === etapa
        ).length;

        return `
          <div class="pipeline-item">
            <span>${escapar(etapa)}</span>
            <strong>${quantidade}</strong>
          </div>
        `;
      }).join("");
    }

    const recentes = $("#recent-leads");

    if (recentes) {
      const ultimosLeads = [...leads]
        .sort((a, b) => {
          const dataA = new Date(a.criadoEm || 0).getTime();
          const dataB = new Date(b.criadoEm || 0).getTime();
          return dataB - dataA;
        })
        .slice(0, 5);

      recentes.innerHTML = ultimosLeads.length
        ? ultimosLeads.map(lead => `
          <tr>
            <td>${escapar(lead.nome)}</td>
            <td>${criarLinkWhatsApp(lead.telefone)}</td>
            <td>${escapar(lead.interesse || "-")}</td>
            <td>${escapar(lead.etapa)}</td>
            <td>${formatarData(lead.criadoEm)}</td>
          </tr>
        `).join("")
        : `
          <tr>
            <td colspan="5">Nenhum lead cadastrado.</td>
          </tr>
        `;
    }
  }

  function atualizarCRM() {
    atualizarFiltroEtapas();
    renderizarDashboard();
    renderizarKanban();
    renderizarLista();
  }

  // MOVIMENTAÇÃO DOS CARDS

  function configurarArrastarSoltar() {
    const quadro = $("#kanban-board");
    if (!quadro) return;

    quadro.addEventListener("dragstart", evento => {
      const card = evento.target.closest(".lead-card");
      if (!card) return;

      evento.dataTransfer.setData(
        "text/plain",
        card.dataset.leadId
      );

      evento.dataTransfer.effectAllowed = "move";
    });

    quadro.addEventListener("dragover", evento => {
      const zona = evento.target.closest(".column-content");
      if (!zona) return;

      evento.preventDefault();
      evento.dataTransfer.dropEffect = "move";
    });

    quadro.addEventListener("drop", evento => {
      const zona = evento.target.closest(".column-content");
      if (!zona) return;

      evento.preventDefault();

      const id = evento.dataTransfer.getData("text/plain");
      const novaEtapa = zona.dataset.dropzone;

      const lead = leads.find(item => item.id === id);

      if (!lead || !novaEtapa) return;

      lead.etapa = novaEtapa;
      lead.atualizadoEm = new Date().toISOString();

      salvarLeads();
    });
  }

  // EVENTOS

  function configurarEventos() {
    // Menu lateral
    $$(".nav-item").forEach(botao => {
      botao.addEventListener("click", () => {
        abrirPagina(botao.dataset.view);
      });
    });

    // Botões que levam a outras páginas
    $$("[data-go-view]").forEach(botao => {
      botao.addEventListener("click", () => {
        abrirPagina(botao.dataset.goView);
      });
    });

    // Abrir cadastro
    [
      "new-lead-dashboard",
      "new-lead-kanban",
      "new-lead-list"
    ].forEach(id => {
      $(`#${id}`)?.addEventListener("click", () => {
        abrirModal();
      });
    });

    // Fechar modal
    $("#close-modal")?.addEventListener("click", fecharModal);
    $("#cancel-modal")?.addEventListener("click", fecharModal);

    $("#lead-modal")?.addEventListener("click", evento => {
      if (evento.target.id === "lead-modal") {
        fecharModal();
      }
    });

    // Salvar cadastro ou edição
    $("#lead-form")?.addEventListener("submit", salvarLead);

    // Editar lead, tanto na lista quanto no Kanban
    document.addEventListener("click", evento => {
      const botao = evento.target.closest("[data-editar-lead]");
      if (!botao) return;

      const id = botao.dataset.editarLead;
      const lead = leads.find(item => item.id === id);

      if (lead) abrirModal(lead);
    });

    // Pesquisa no Kanban
    $("#kanban-search")?.addEventListener("input", aplicarBuscaKanban);

    // Pesquisa e filtro na lista
    $("#list-search")?.addEventListener("input", renderizarLista);

    $("#list-stage-filter")?.addEventListener(
      "change",
      renderizarLista
    );

    // Fechar modal com ESC
    document.addEventListener("keydown", evento => {
      if (evento.key === "Escape") {
        fecharModal();
      }
    });

    configurarArrastarSoltar();
  }

  // INICIALIZAÇÃO

  function iniciarCRM() {
    criarBotaoExcluir();
    configurarEventos();
    abrirPagina("dashboard");
    atualizarCRM();

    console.log("VERTICE HUB iniciado com sucesso.");
  }

  iniciarCRM();

})();
