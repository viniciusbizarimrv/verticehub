
/* ==========================================
   VERTICE HUB
   Gestão Comercial Imobiliária
========================================== */

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

let leads = carregarLeads();
let etapaArrastada = null;

// ELEMENTOS PRINCIPAIS
const kanbanBoard = document.getElementById("kanban-board");
const leadModal = document.getElementById("lead-modal");
const leadForm = document.getElementById("lead-form");

// ==========================================
// ARMAZENAMENTO
// ==========================================

function carregarLeads() {
  try {
    const dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    return dados.map(lead => ({
      ...lead,
      nome: lead.nome || lead.name || "",
      telefone: lead.telefone || lead.phone || "",
      email: lead.email || "",
      interesse: lead.interesse || lead.produto || lead.interest || "",
      origem: lead.origem || lead.origin || "",
      regiao: lead.regiao || lead.region || "",
      renda: lead.renda || lead.income || "",
      etapa: ETAPAS.includes(lead.etapa) ? lead.etapa : ETAPAS[0],
      observacoes: lead.observacoes || lead.notes || "",
      criadoEm: lead.criadoEm || new Date().toISOString()
    }));
  } catch (erro) {
    console.error("Erro ao carregar leads:", erro);
    return [];
  }
}

function salvarLeads() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    atualizarSistema();
  } catch (erro) {
    alert("Não foi possível salvar os dados neste navegador.");
    console.error(erro);
  }
}

// ==========================================
// NAVEGAÇÃO
// ==========================================

function mudarTela(tela) {
  document.querySelectorAll(".page-view").forEach(secao => {
    secao.classList.add("hidden");
  });

  const pagina = document.getElementById(`${tela}-view`);

  if (!pagina) return;

  pagina.classList.remove("hidden");

  document.querySelectorAll(".nav-item").forEach(botao => {
    botao.classList.toggle(
      "active",
      botao.dataset.view === tela
    );
  });

  const titulos = {
    dashboard: "Dashboard",
    kanban: "Funil de vendas",
    lista: "Lista de leads"
  };

  document.getElementById("page-title").textContent =
    titulos[tela] || "Dashboard";
}

document.querySelectorAll(".nav-item").forEach(botao => {
  botao.addEventListener("click", () => {
    mudarTela(botao.dataset.view);
  });
});

document.querySelectorAll("[data-go-view]").forEach(botao => {
  botao.addEventListener("click", () => {
    mudarTela(botao.dataset.goView);
  });
});

// ==========================================
// MODAL
// ==========================================

function abrirModal(id = null) {
  leadForm.reset();

  document.getElementById("lead-id").value = "";

  if (id) {
    const lead = leads.find(item => String(item.id) === String(id));

    if (!lead) return;

    document.getElementById("modal-title").textContent = "Editar lead";

    document.getElementById("lead-id").value = lead.id;
    document.getElementById("lead-name").value = lead.nome;
    document.getElementById("lead-phone").value = lead.telefone;
    document.getElementById("lead-email").value = lead.email;
    document.getElementById("lead-interest").value = lead.interesse;
    document.getElementById("lead-origin").value = lead.origem;
    document.getElementById("lead-region").value = lead.regiao;
    document.getElementById("lead-income").value = lead.renda;
    document.getElementById("lead-stage").value = lead.etapa;
    document.getElementById("lead-notes").value = lead.observacoes;
  } else {
    document.getElementById("modal-title").textContent = "Novo lead";
    document.getElementById("lead-stage").value = ETAPAS[0];
  }

  leadModal.classList.remove("hidden");
}

function fecharModal() {
  leadModal.classList.add("hidden");
  leadForm.reset();
}

document.getElementById("new-lead-dashboard")
  .addEventListener("click", () => abrirModal());

document.getElementById("new-lead-kanban")
  .addEventListener("click", () => abrirModal());

document.getElementById("new-lead-list")
  .addEventListener("click", () => abrirModal());

document.getElementById("close-modal")
  .addEventListener("click", fecharModal);

document.getElementById("cancel-modal")
  .addEventListener("click", fecharModal);

leadModal.addEventListener("click", event => {
  if (event.target === leadModal) fecharModal();
});

// ==========================================
// CADASTRO E EDIÇÃO DE LEADS
// ==========================================

leadForm.addEventListener("submit", event => {
  event.preventDefault();

  const id = document.getElementById("lead-id").value;

  const dados = {
    nome: document.getElementById("lead-name").value.trim(),
    telefone: document.getElementById("lead-phone").value.trim(),
    email: document.getElementById("lead-email").value.trim(),
    interesse: document.getElementById("lead-interest").value,
    origem: document.getElementById("lead-origin").value,
    regiao: document.getElementById("lead-region").value.trim(),
    renda: document.getElementById("lead-income").value,
    etapa: document.getElementById("lead-stage").value,
    observacoes: document.getElementById("lead-notes").value.trim()
  };

  if (!dados.nome || !dados.telefone) {
    alert("Preencha o nome e o telefone do cliente.");
    return;
  }

  if (id) {
    const indice = leads.findIndex(
      lead => String(lead.id) === String(id)
    );

    if (indice !== -1) {
      leads[indice] = {
        ...leads[indice],
        ...dados
      };
    }
  } else {
    leads.push({
      id: Date.now().toString(),
      ...dados,
      criadoEm: new Date().toISOString()
    });
  }

  fecharModal();
  salvarLeads();
});

// ==========================================
// EXCLUSÃO
// ==========================================

function excluirLead(id) {
  const lead = leads.find(
    item => String(item.id) === String(id)
  );

  if (!lead) return;

  if (!confirm(`Deseja realmente excluir o lead ${lead.nome}?`)) {
    return;
  }

  leads = leads.filter(
    item => String(item.id) !== String(id)
  );

  salvarLeads();
}

// ==========================================
// MOVIMENTAÇÃO NO KANBAN
// ==========================================

function mudarEtapa(id, novaEtapa) {
  if (!ETAPAS.includes(novaEtapa)) return;

  const lead = leads.find(
    item => String(item.id) === String(id)
  );

  if (!lead) return;

  lead.etapa = novaEtapa;

  salvarLeads();
}

// ==========================================
// CRIAÇÃO DOS CARTÕES
// ==========================================

function criarCard(lead) {
  const card = document.createElement("article");

  card.className = "lead-card";
  card.draggable = true;
  card.dataset.id = lead.id;

  const nome = document.createElement("h4");
  nome.textContent = lead.nome;

  const telefone = document.createElement("p");
  telefone.textContent = `Telefone: ${lead.telefone}`;

  const interesse = document.createElement("p");
  interesse.textContent = `Interesse: ${lead.interesse || "Não informado"}`;

  const regiao = document.createElement("p");
  regiao.textContent = `Região: ${lead.regiao || "Não informada"}`;

  const origem = document.createElement("p");
  origem.textContent = `Origem: ${lead.origem || "Não informada"}`;

  const acoes = document.createElement("div");
  acoes.className = "actions";

  const editar = document.createElement("button");
  editar.type = "button";
  editar.textContent = "Editar";
  editar.addEventListener("click", () => abrirModal(lead.id));

  const excluir = document.createElement("button");
  excluir.type = "button";
  excluir.textContent = "Excluir";
  excluir.addEventListener("click", () => excluirLead(lead.id));

  acoes.append(editar, excluir);

  card.append(
    nome,
    telefone,
    interesse,
    regiao,
    origem,
    acoes
  );

  card.addEventListener("dragstart", event => {
    etapaArrastada = lead.id;

    card.classList.add("dragging");

    event.dataTransfer.setData(
      "text/plain",
      String(lead.id)
    );
  });

  card.addEventListener("dragend", () => {
    card.classList.remove("dragging");
    etapaArrastada = null;
  });

  return card;
}

// ==========================================
// KANBAN
// ==========================================

function renderizarKanban() {
  const pesquisa = document
    .getElementById("kanban-search")
    .value.toLowerCase();

  let totalVisivel = 0;

  document.querySelectorAll(".kanban-column").forEach(coluna => {
    const etapa = coluna.dataset.stage;
    const area = coluna.querySelector(".column-content");
    const contador = coluna.querySelector(".column-count");

    area.innerHTML = "";

    const leadsDaEtapa = leads.filter(lead => {
      const correspondeEtapa = lead.etapa === etapa;

      const texto = (
        lead.nome + " " +
        lead.telefone + " " +
        lead.email + " " +
        lead.regiao
      ).toLowerCase();

      return correspondeEtapa && texto.includes(pesquisa);
    });

    leadsDaEtapa.forEach(lead => {
      area.appendChild(criarCard(lead));
    });

    contador.textContent = leadsDaEtapa.length;
    totalVisivel += leadsDaEtapa.length;
  });

  document.getElementById("kanban-total").textContent =
    `${totalVisivel} leads`;

  configurarArrastar();
}

function configurarArrastar() {
  document.querySelectorAll(".column-content").forEach(area => {
    area.addEventListener("dragover", event => {
      event.preventDefault();
      area.classList.add("drag-over");
    });

    area.addEventListener("dragleave", () => {
      area.classList.remove("drag-over");
    });

    area.addEventListener("drop", event => {
      event.preventDefault();

      area.classList.remove("drag-over");

      const id = event.dataTransfer.getData("text/plain");

      if (id) {
        mudarEtapa(id, area.dataset.dropzone);
      }
    });
  });
}

document.getElementById("kanban-search")
  .addEventListener("input", renderizarKanban);

// ==========================================
// DASHBOARD
// ==========================================

function atualizarDashboard() {
  const total = leads.length;

  const ativos = leads.filter(lead =>
    !["Venda concluída", "Lead Frio"].includes(lead.etapa)
  ).length;

  const reunioes = leads.filter(lead =>
    lead.etapa === "Reunião agendada"
  ).length;

  const vendas = leads.filter(lead =>
    lead.etapa === "Venda concluída"
  ).length;

  document.getElementById("total-leads").textContent = total;
  document.getElementById("active-leads").textContent = ativos;
  document.getElementById("meetings-count").textContent = reunioes;
  document.getElementById("sales-count").textContent = vendas;

  // RESUMO DO FUNIL

  const resumo = document.getElementById("dashboard-pipeline");
  resumo.innerHTML = "";

  ETAPAS.forEach(etapa => {
    const quantidade = leads.filter(
      lead => lead.etapa === etapa
    ).length;

    const linha = document.createElement("div");
    linha.className = "pipeline-row";

    const nome = document.createElement("span");
    nome.textContent = etapa;

    const numero = document.createElement("strong");
    numero.textContent = quantidade;

    linha.append(nome, numero);
    resumo.appendChild(linha);
  });

  // LEADS RECENTES

  const tabela = document.getElementById("recent-leads");
  tabela.innerHTML = "";

  const recentes = [...leads]
    .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm))
    .slice(0, 5);

  if (recentes.length === 0) {
    tabela.innerHTML =
      '<tr><td colspan="5">Nenhum lead cadastrado.</td></tr>';
    return;
  }

  recentes.forEach(lead => {
    const linha = document.createElement("tr");

    const valores = [
      lead.nome,
      lead.telefone,
      lead.interesse || "-",
      lead.etapa,
      formatarData(lead.criadoEm)
    ];

    valores.forEach(valor => {
      const celula = document.createElement("td");
      celula.textContent = valor;
      linha.appendChild(celula);
    });

    tabela.appendChild(linha);
  });
}

// ==========================================
// LISTA DE LEADS
// ==========================================

function atualizarFiltroEtapas() {
  const filtro = document.getElementById("list-stage-filter");
  const valorAtual = filtro.value;

  filtro.innerHTML = '<option value="">Todas as etapas</option>';

  ETAPAS.forEach(etapa => {
    const opcao = document.createElement("option");
    opcao.value = etapa;
    opcao.textContent = etapa;
    filtro.appendChild(opcao);
  });

  filtro.value = valorAtual;
}

function renderizarLista() {
  const pesquisa = document
    .getElementById("list-search")
    .value.toLowerCase();

  const etapaFiltro = document.getElementById("list-stage-filter").value;

  const tabela = document.getElementById("all-leads");
  tabela.innerHTML = "";

  const filtrados = leads.filter(lead => {
    const texto = (
      lead.nome + " " +
      lead.telefone + " " +
      lead.email
    ).toLowerCase();

    const correspondePesquisa = texto.includes(pesquisa);
    const correspondeEtapa = !etapaFiltro || lead.etapa === etapaFiltro;

    return correspondePesquisa && correspondeEtapa;
  });

  if (filtrados.length === 0) {
    tabela.innerHTML =
      '<tr><td colspan="6">Nenhum lead encontrado.</td></tr>';
    return;
  }

  filtrados.forEach(lead => {
    const linha = document.createElement("tr");

    const valores = [
      lead.nome,
      lead.telefone,
      lead.email || "-",
      lead.interesse || "-",
      lead.etapa
    ];

    valores.forEach(valor => {
      const celula = document.createElement("td");
      celula.textContent = valor;
      linha.appendChild(celula);
    });

    const acoes = document.createElement("td");

    const editar = document.createElement("button");
    editar.type = "button";
    editar.textContent = "Editar";
    editar.addEventListener("click", () => abrirModal(lead.id));

    const excluir = document.createElement("button");
    excluir.type = "button";
    excluir.textContent = "Excluir";
    excluir.addEventListener("click", () => excluirLead(lead.id));

    acoes.append(editar, excluir);
    linha.appendChild(acoes);

    tabela.appendChild(linha);
  });
}

document.getElementById("list-search")
  .addEventListener("input", renderizarLista);

document.getElementById("list-stage-filter")
  .addEventListener("change", renderizarLista);

// ==========================================
// DATA
// ==========================================

function formatarData(data) {
  if (!data) return "-";

  const dataObj = new Date(data);

  if (isNaN(dataObj.getTime())) return "-";

  return dataObj.toLocaleDateString("pt-BR");
}

// ==========================================
// ATUALIZAÇÃO GERAL
// ==========================================

function atualizarSistema() {
  atualizarDashboard();
  renderizarKanban();
  atualizarFiltroEtapas();
  renderizarLista();
}

// INICIALIZAÇÃO

atualizarSistema();
mudarTela("dashboard");
