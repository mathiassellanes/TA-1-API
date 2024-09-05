const cards = {
  'Backlog': [],
  'To Do': [],
  'In Progress': [],
  'Blocked': [],
  'Done': [],
}

const cardsPriorityTranslation = {
  'High': 'Alta',
  'Medium': 'Media',
  'Low': 'Baja',
}

const columns = Object.keys(cards).map((columnKey) => {
  return document.getElementById(columnKey);
});

const backgroundColors = ['has-background-dark',
  'has-background-info',
  'has-background-warning',
  'has-background-danger',
  'has-background-success'
]

const fontColors = ["has-text-white",
  "has-text-white",
  "has-text-white",
  "has-text-white",
  "has-text-white"
]

function openModal($el) {
  $el.classList.add('is-active');
}

function closeModal($el) {
  $el.classList.remove('is-active');
}

function closeAllModals() {
  (document.querySelectorAll('.modal') || []).forEach(($modal) => {
    closeModal($modal);
  });
}

const $target = document.querySelector(".js-modal-trigger");
const $target2 = document.querySelector(".js-modal-trigger-mobile");

const $modal = document.querySelector('#addcard');

$target.addEventListener('click', () => {
  openModal($modal);
});

$target2.addEventListener('click', () => {
  openModal($modal);
});

document.addEventListener('keydown', (event) => {
  if (event.key === "Escape") {
    closeAllModals();
  }
});

function createCard({ title, description, assignedTo, priority, status, endDate, index }) {
  const id = crypto.randomUUID();

  const column = Object.keys(cards).indexOf(status) + 1;

  const card = { id, title, description, assignedTo, priority, status, endDate, index };

  const responseCard = post(card);

  cards[status].push(responseCard);

  updateCards(column, cards[status]);
}

function updateCards(columnIndex, cards) {
  const col = columns[columnIndex - 1];
  const previousCards = col.querySelectorAll(".draggable");
  previousCards.forEach(element => element.remove());

  cards.forEach((card) => {
    const cardTemplate = document.querySelector("#card");

    const h = cardTemplate.content.querySelector("h5");
    const p = cardTemplate.content.querySelector("p");
    const editIcon = cardTemplate.content.querySelector("figure");
    const prioritySpan = cardTemplate.content.querySelector(".priority");
    const deadlineSpan = cardTemplate.content.querySelector(".deadline");

    const translatedPriority = card.priority;

    h.textContent = card.title;
    p.textContent = card.description;

    // Configurar el texto y el ícono de prioridad
    prioritySpan.innerHTML = `
      Prioridad: ${cardsPriorityTranslation[translatedPriority]}
      <img src="assets/Icon-Flag.png" alt="Priority flag icon">`;

    // Configurar el texto y el ícono de fecha límite
    deadlineSpan.innerHTML = `
      Fecha: ${card.endDate}
      <img src="assets/Icon-Calendar.png" alt="Calendar icon">`;

    const clone = document.importNode(cardTemplate.content, true);

    const div = clone.querySelector("div");
    const h5 = div.querySelector("h5");
    const paragraph = div.querySelector("p");

    div.classList.add(backgroundColors[columnIndex - 1]);
    h5.classList.add(fontColors[columnIndex - 1]);
    paragraph.classList.add(fontColors[columnIndex - 1]);

    div.draggable = true;
    div.id = card.id;

    editIcon.id = "edit" + card.id;

    col.appendChild(clone);
  });

  reAddEvents();
}

const handleCardSave = () => {
  const title = document.getElementById("title");
  const description = document.getElementById("description");
  const assigned = document.getElementById("assigned");
  const priority = document.getElementById("priority");
  const state = document.getElementById("state");
  const deadline = document.getElementById("deadline");

  const esValidoTitle = validarTitleModal(title.value);
  const esValidoDescription = validarDescriptionModal(description.value);
  const esValidoDeadLine = validarDeadLineModal(deadline.value);

  if (!esValidoTitle || !esValidoDescription || !esValidoDeadLine) {
    return;
  }

  createCard({
    title: title.value,
    description: description.value,
    assignedTo: assigned.value,
    priority: priority.value,
    status: state.value,
    endDate: deadline.value,
    index: cards[state.value].length + 1,
  });

  title.value = "";
  description.value = "";
  assigned.value = "";
  priority.value = "High";
  state.value = "Backlog";
  deadline.value = "";

  closeAllModals();
}

const handleCardCancel = () => {
  closeAllModals();
}

const errorTitle = document.getElementById("errorTitle");
const errorDescription = document.getElementById("errorDescription");
const errorDeadLine = document.getElementById("errorDeadLine");

async function moveCard(cardId, targetColumnId, targetCardId, isAfter) {
  const card = Object.values(cards).flat().find(card => card.id === cardId);

  const cardToReplace = Object.values(cards).flat().find(card => card.id === targetCardId);

  const previousColumnId = card?.status;

  const previousColumn = cards[previousColumnId];

  card.status = targetColumnId;

  previousColumn.splice(previousColumn.indexOf(card), 1);

  const targetColumn = cards[targetColumnId];

  const targetCardIndex = targetColumn.indexOf(cardToReplace);

  if (isAfter) {
    targetColumn.splice(targetCardIndex + 1, 0, card);
  } else {
    targetColumn.splice(targetCardIndex, 0, card);
  }

  const response = await put(cardId, {
    ...card,
  })

  if (!response) {
    return;
  }

  const newIndexes = [
    ...previousColumn.map((card, index) => ({ id: card.id, index: index + 1 })),
    ...targetColumn.map((card, index) => ({ id: card.id, index: index + 1 })),
  ];

  const updateIndexesResponse = await updateIndexes(newIndexes);

  console.log(updateIndexesResponse);

  updateCards(Object.keys(cards).indexOf(previousColumnId) + 1, previousColumn);
  updateCards(Object.keys(cards).indexOf(targetColumnId) + 1, targetColumn);
}

function validarTitleModal(title) {
  if (title.trim() === "") {
    errorTitle.textContent = "Debe escribir el nombre de la tarea.";
    return false;
  } else {
    errorTitle.textContent = "";
    return true;
  }
}

function validarDescriptionModal(description) {
  if (description.trim() === "") {
    errorDescription.textContent = "Debe escribir una breve descripcion de la tarea.";
    return false;
  } else {
    errorDescription.textContent = "";
    return true;
  }
}

function validarDeadLineModal(deadLine) {
  if (deadLine === "") {
    errorDeadLine.textContent = "Debe seleccionar una fecha.";
    return false;
  } else {
    errorDeadLine.textContent = "";
    return true;
  }
}

const handleGetCards = async () => {
  const cardsResponse = await getCards();

  const formattedCards = cardsResponse.reduce((acc, card) => {
    acc[card.status].push(card);

    return acc;
  }, {
    'Backlog': [],
    'To Do': [],
    'In Progress': [],
    'Blocked': [],
    'Done': [],
  })

  Object.keys(formattedCards).forEach((columnKey, index) => {
    cards[columnKey] = formattedCards[columnKey].sort((a, b) => a.index - b.index);

    updateCards(index + 1, cards[columnKey].sort((a, b) => a.index - b.index));
  });
};

handleGetCards();
