let currentCard;

function findCardById(cards, id) {
  for (const state in cards) {
    if (cards[state].length > 0) {
      const card = cards[state].find(card => card.id === id);

      if (card) {
        return card;
      }
    }
  }

  return null;
}


function clickCard(card) {
  const modal = document.getElementById("edit-card");
  modal.classList.add("is-active");

  const title = document.getElementById("edit-title");
  const description = document.getElementById("edit-description");
  const assigned = document.getElementById("edit-assigned");
  const priority = document.getElementById("edit-priority");
  const state = document.getElementById("edit-state");
  const deadline = document.getElementById("edit-deadline");

  currentCard = findCardById(cards, card.id);

  console.log(currentCard);

  title.value = currentCard.title;
  description.value = currentCard.description;
  assigned.value = currentCard.assignedTo;
  priority.value = currentCard.priority;
  state.value = currentCard.status;
  deadline.value = currentCard.endDate;
}

async function handleCardSaveEdit() {
  const title = document.getElementById("edit-title");
  const description = document.getElementById("edit-description");
  const assigned = document.getElementById("edit-assigned");
  const priority = document.getElementById("edit-priority");
  const state = document.getElementById("edit-state");
  const deadline = document.getElementById("edit-deadline");

  const esValidoTitle = validarTitleModal(title.value);
  const esValidoDescription = validarDescriptionModal(description.value);
  const esValidoDeadLine = validarDeadLineModal(deadline.value);

  if (!esValidoTitle || !esValidoDescription || !esValidoDeadLine) {
    return;
  }

  const previousCard = { ...currentCard };

  currentCard.title = title.value;
  currentCard.description = description.value;
  currentCard.assignedTo = assigned.value;
  currentCard.priority = priority.value;
  currentCard.status = state.value;
  currentCard.endDate = deadline.value;

  console.log(currentCard);

  if (previousCard.status !== currentCard.status) {
    cards[state.value].unshift(currentCard);
    cards[previousCard.status] = cards[previousCard.status].filter(card => card.id !== previousCard.id);
  } else {
    cards[state.value] = cards[state.value].map(card => card.id === currentCard.id ? currentCard : card);
  }

  const response = await put(currentCard.id, {
    ...currentCard,
  })

  if (!response) {
    return;
  }

  const newIndexes = [
    ...cards[previousCard.status].map((card, index) => ({ id: card.id, index: index + 1 })),
    ...cards[state.value].map((card, index) => ({ id: card.id, index: index + 1 })),
  ];

  await updateIndexes(newIndexes);

  if (previousCard.status !== currentCard.status) {
    updateCards(Object.keys(cards).indexOf(previousCard.status) + 1, cards[previousCard.status]);
    updateCards(Object.keys(cards).indexOf(state.value) + 1, cards[state.value]);
  } else {
    updateCards(Object.keys(cards).indexOf(state.value) + 1, cards[state.value]);
  }

  title.value = "";
  description.value = "";
  assigned.value = "";
  priority.value = "High";
  state.value = "Backlog";
  deadline.value = "";

  closeAllModals();
}

const handleCardDelete = async () => {
  cards[currentCard.status] = cards[currentCard.status].filter(card => card.id !== currentCard.id);

  await remove(currentCard.id);

  updateCards(Object.keys(cards).indexOf(currentCard.status) + 1, cards[currentCard.status]);

  closeAllModals();
}
