
/* ==========================================
   VERTICE HUB - SISTEMA DE GESTÃO COMERCIAL
========================================== */

const etapas = [
  "Novo Lead",
  "1ª Tentativa de Contato",
  "2ª Tentativa de Contato",
  "3ª Tentativa de Contato",
  "Contato Realizado",
  "Qualificação",
  "Reunião Agendada",
  "Reunião Realizada",
  "Em Negociação",
  "Venda Realizada",
  "Perdido"
];

let leads = JSON.parse(localStorage.getItem("vertice_leads")) || [];
let editandoId = null;

const board = document.getElementById("board");
const form = document.getElementById("leadForm");
const modal = document.getElementById("leadModal");
const search = document.getElementById("search");

function salvar() {
  localStorage.setItem("vertice_leads", JSON.stringify(leads));
  renderizar();
}

function abrirModal(id = null) {
  if (!form || !modal) return;

  form.reset();
  editandoId = id;

  if (id) {
    const lead = leads.find(item => item.id === id);
    if (!lead) return;

    document.getElementById("nome").value = lead.nome || "";
    document.getElementById("telefone").value = lead.telefone || "";
    document.getElementById("email").value = lead.email || "";
    document.getElementById("regiao").value = lead.regiao || "";
    document.getElementById("produto").value = lead.produto || "";
    document.getElementById("renda").value = lead.renda || "";
    document.getElementById("entrada").value = lead.entrada || "";
    document.getElementById("origem").value = lead.origem || "";
    document.getElementById("etapa").value = lead.etapa || etapas[0];
  } else {
    document.getElementById("etapa").value = etapas[0];
  }

  modal.classList.add("open");
}

function fecharModal() {
  if (!modal) return;
  modal.classList.remove("open");
  editandoId = null;
}

if (form) {
  form.addEventListener("submit", function(event) {
    event.preventDefault();

    const dados = {
      nome: document.getElementById("nome").value.trim(),
      telefone: document.getElementById("telefone").value.trim(),
      email: document.getElementById("email").value.trim(),
      regiao: document.getElementById("regiao").value.trim(),
      produto: document.getElementById("produto").value,
      renda: document.getElementById("renda").value,
      entrada: document.getElementById("entrada").value,
      origem: document.getElementById("origem").value,
      etapa: document.getElementById("etapa").value
    };

    if (!dados.nome || !dados.telefone) {
      alert("Informe pelo menos o nome e telefone.");
      return;
    }

    if (editandoId) {
      const indice = leads.findIndex(item => item.id === editandoId);

      if (indice !== -1) {
        leads[indice] = { ...leads[indice], ...dados };
      }
    } else {
      leads.push({
        id: Date.now().toString(),
        ...dados,
        criadoEm: new Date().toISOString()
      });
    }

    fecharModal();
    salvar();
  });
}

function excluirLead(id) {
  if (!confirm("Deseja realmente excluir este lead?")) return;

  leads = leads.filter(item => item.id !== id);
  salvar();
}

function editarLead(id) {
  abrirModal(id);
}

function mudarEtapa(id, novaEtapa) {
  const lead = leads.find(item => item.id === id);

  if (!lead || !etapas.includes(novaEtapa)) return;

  lead.etapa = novaEtapa;
  salvar();
}

function criarCard(lead) {
  const card = document.createElement("article");
  card.className = "lead-card";
  card.draggable = true;
  card.dataset.id = lead.id;

  const titulo = document.createElement("h4");
  titulo.textContent = lead.nome;
  card.appendChild(titulo);

  const detalhes = [
    `Telefone: ${lead.telefone || "-"}`,
    `Região: ${lead.regiao || "-"}`,
    `Interesse: ${lead.produto || "-"}`,
    `Origem: ${lead.origem || "-"}`
  ];

  detalhes.forEach(texto => {
    const p = document.createElement("p");
    p.textContent = texto;
    card.appendChild(p);
  });

  const actions = document.createElement("div");
  actions.className = "actions";

  const editar = document.createElement("button");
  editar.textContent = "Editar";
  editar.addEventListener("click", () => editarLead(lead.id));

  const excluir = document.createElement("button");
  excluir.textContent = "Excluir";
  excluir.addEventListener("click", () => excluirLead(lead.id));

  actions.append(editar, excluir);
  card.appendChild(actions);

  card.addEventListener("dragstart", event => {
    card.classList.add("dragging");
    event.dataTransfer.setData("text/plain", lead.id);
  });

  card.addEventListener("dragend", () => {
    card.classList.remove("dragging");
  });

  return card;
}

function renderizar() {
  if (!board) return;

  board.innerHTML = "";

  const termo = search ? search.value.toLowerCase() : "";

  etapas.forEach(etapa => {
    const coluna = document.createElement("section");
    coluna.className = "column";

    const header = document.createElement("div");
    header.className = "column-header";

    const titulo = document.createElement("strong");
    titulo.textContent = etapa;

    const total = leads.filter(lead => lead.etapa === etapa).length;

    const contador = document.createElement("span");
    contador.textContent = total;

    header.append(titulo, contador);

    const corpo = document.createElement("div");
    corpo.className = "column-body";
    corpo.dataset.etapa = etapa;

    leads
      .filter(lead => lead.etapa === etapa)
      .filter(lead => {
        const conteudo =
          `${lead.nome} ${lead.telefone} ${lead.regiao}`.toLowerCase();

        return conteudo.includes(termo);
      })
      .forEach(lead => corpo.appendChild(criarCard(lead)));

    corpo.addEventListener("dragover", event => {
      event.preventDefault();
      corpo.classList.add("drag-over");
    });

    corpo.addEventListener("dragleave", () => {
      corpo.classList.remove("drag-over");
    });

    corpo.addEventListener("drop", event => {
      event.preventDefault();
      corpo.classList.remove("drag-over");

      const id = event.dataTransfer.getData("text/plain");
      mudarEtapa(id, etapa);
    });

    coluna.append(header, corpo);
    board.appendChild(coluna);
  });

  atualizarIndicadores();
}

function atualizarIndicadores() {
  const total = leads.length;

  const vendas = leads.filter(
    l => l.etapa === "Venda Realizada"
  ).length;

  const negociacao = leads.filter(
    l => l.etapa === "Em Negociação"
  ).length;

  const perdidos = leads.filter(
    l => l.etapa === "Perdido"
  ).length;

  const elTotal = document.getElementById("totalLeads");
  const elVendas = document.getElementById("totalVendas");
  const elNegociacao = document.getElementById("totalNegociacao");
  const elPerdidos = document.getElementById("totalPerdidos");

  if (elTotal) elTotal.textContent = total;
  if (elVendas) elVendas.textContent = vendas;
  if (elNegociacao) elNegociacao.textContent = negociacao;
  if (elPerdidos) elPerdidos.textContent = perdidos;
}

if (search) {
  search.addEventListener("input", renderizar);
}

renderizar();
