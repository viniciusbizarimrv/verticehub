
/* ========================================
   VERTICE HUB - GESTÃO COMERCIAL IMOBILIÁRIA
   Identidade visual: Azul, Branco e Preto
======================================== */

:root {
  --blue: #1769e0;
  --blue-dark: #104da8;
  --blue-light: #eaf2ff;
  --black: #111827;
  --dark: #1f2937;
  --white: #ffffff;
  --gray: #64748b;
  --gray-light: #f1f5f9;
  --border: #e2e8f0;
  --green: #16a34a;
  --red: #dc2626;
  --radius: 12px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: Inter, Arial, sans-serif;
  background: #f5f7fb;
  color: var(--black);
  font-size: 14px;
}

/* BARRA SUPERIOR */

.topbar {
  background: var(--black);
  color: var(--white);
  min-height: 76px;
  padding: 16px 5%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  width: 43px;
  height: 43px;
  background: var(--blue);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 800;
  color: white;
}

.brand h1 {
  font-size: 19px;
  letter-spacing: 1px;
}

.brand small {
  display: block;
  color: #aebed3;
  font-size: 10px;
  margin-top: 4px;
  letter-spacing: 1.3px;
}

.status {
  color: #86efac;
  font-size: 12px;
}

/* CONTEÚDO */

.container {
  max-width: 1600px;
  margin: auto;
  padding: 30px 4%;
}

.heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 25px;
}

.heading h2 {
  font-size: 25px;
  font-weight: 750;
}

.heading p {
  color: var(--gray);
  margin-top: 6px;
}

/* BOTÕES */

button {
  font-family: inherit;
  cursor: pointer;
  transition: .2s ease;
}

.primary {
  border: none;
  border-radius: 9px;
  background: var(--blue);
  color: white;
  padding: 12px 19px;
  font-weight: 650;
  font-size: 13px;
}

.primary:hover {
  background: var(--blue-dark);
  transform: translateY(-1px);
}

/* INDICADORES */

.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 25px;
}

.stat {
  background: white;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 21px;
  box-shadow: 0 3px 12px rgba(15, 23, 42, .03);
}

.stat span {
  display: block;
  color: var(--gray);
  font-size: 12px;
  margin-bottom: 12px;
}

.stat strong {
  font-size: 27px;
  font-weight: 750;
  color: var(--black);
}

/* BARRA DE FERRAMENTAS */

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

#search {
  width: 320px;
  max-width: 100%;
  padding: 12px 15px;
  border: 1px solid var(--border);
  border-radius: 9px;
  outline: none;
  background: white;
  font-size: 13px;
}

#search:focus {
  border-color: var(--blue);
  box-shadow: 0 0 0 3px rgba(23, 105, 224, .10);
}

/* KANBAN */

.board {
  display: grid;
  grid-auto-columns: minmax(250px, 1fr);
  grid-auto-flow: column;
  gap: 15px;
  overflow-x: auto;
  padding-bottom: 18px;
  align-items: start;
}

.column {
  background: #edf1f7;
  border-radius: 11px;
  padding: 12px;
  min-height: 350px;
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  padding: 5px 3px;
  font-weight: 700;
  font-size: 12px;
}

.column-header span {
  background: white;
  color: var(--gray);
  border-radius: 20px;
  padding: 4px 8px;
}

.column-body {
  min-height: 280px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lead-card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 9px;
  padding: 14px;
  cursor: grab;
  box-shadow: 0 2px 5px rgba(0, 0, 0, .03);
}

.lead-card:hover {
  border-color: #a9c8f8;
  box-shadow: 0 4px 12px rgba(23, 105, 224, .08);
}

.lead-card h4 {
  font-size: 13px;
  margin-bottom: 9px;
}

.lead-card p {
  font-size: 11px;
  color: var(--gray);
  margin: 5px 0;
  overflow-wrap: anywhere;
}

.lead-card.dragging {
  opacity: .4;
}

.column-body.drag-over {
  background: var(--blue-light);
  border: 2px dashed var(--blue);
  border-radius: 9px;
}

.actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.actions button {
  border: 1px solid var(--border);
  background: white;
  padding: 6px 9px;
  border-radius: 6px;
  font-size: 11px;
}

.actions button:hover {
  background: var(--blue-light);
  color: var(--blue);
}

/* VISUALIZAÇÃO EM LISTA */

.list-view {
  display: none;
  background: white;
  border: 1px solid var(--border);
  border-radius: 11px;
  overflow-x: auto;
}

.list-view table {
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
}

.list-view th,
.list-view td {
  text-align: left;
  padding: 14px;
  border-bottom: 1px solid var(--border);
  font-size: 12px;
}

.list-view th {
  background: #f8fafc;
  color: var(--gray);
  font-weight: 700;
}

/* MODAL E FORMULÁRIO */

.modal {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(15, 23, 42, .65);
  padding: 20px;
  align-items: center;
  justify-content: center;
}

.modal.open {
  display: flex;
}

.modal-content {
  width: 100%;
  max-width: 540px;
  max-height: 90vh;
  overflow-y: auto;
  background: white;
  border-radius: 14px;
  padding: 26px;
  box-shadow: 0 15px 50px rgba(0, 0, 0, .2);
}

.modal-content h2 {
  font-size: 20px;
  margin-bottom: 20px;
}

#leadForm {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

#leadForm label {
  display: flex;
  flex-direction: column;
  gap: 7px;
  font-size: 12px;
  font-weight: 650;
}

#leadForm input,
#leadForm select {
  width: 100%;
  padding: 11px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-family: inherit;
  font-size: 13px;
  outline: none;
  background: white;
}

#leadForm input:focus,
#leadForm select:focus {
  border-color: var(--blue);
}

#leadForm button {
  grid-column: 1 / -1;
}

#leadForm button[type="button"] {
  background: var(--gray-light);
  color: var(--dark);
  border: 1px solid var(--border);
  padding: 11px;
  border-radius: 8px;
}

@media (max-width: 800px) {
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .container {
    padding: 22px 15px;
  }

  .board {
    grid-auto-columns: minmax(260px, 85vw);
  }
}

@media (max-width: 500px) {
  .topbar {
    padding: 14px;
  }

  .heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .heading h2 {
    font-size: 21px;
  }

  .stats {
    gap: 9px;
  }

  .stat {
    padding: 14px;
  }

  .stat strong {
    font-size: 22px;
  }

  #leadForm {
    grid-template-columns: 1fr;
  }

  .modal-content {
    padding: 19px;
  }
}
