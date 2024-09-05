let dragSrcEl = null;

function dragStart(e) {
  this.style.opacity = '0.4';
  dragSrcEl = this;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
}

function dragEnter(e) {
  this.classList.add('over');
}

function dragLeave(e) {
  e.stopPropagation();
  this.style.borderBottom = "";
  this.style.borderTop = "";
  this.classList.remove('over');
}

function dragEnd(e) {
  const listItems = document.querySelectorAll('.draggable');
  listItems.forEach(function (item) {
    item.style.borderBottom = "";
    item.style.borderTop = "";
    item.classList.remove('over');
  });
  this.style.opacity = '1';
}


function dragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';

  const bounding = this.getBoundingClientRect();
  const offset = e.clientY - bounding.top;

  if (offset > bounding.height / 2) {
    this.style.borderBottom = "2px solid #000";
    this.style.borderTop = "";
  } else {
    this.style.borderTop = "2px solid #000";
    this.style.borderBottom = "";
  }

  document.querySelectorAll('.column').forEach(function (column) {
    column.style.borderTop = "";
    column.style.borderBottom = "";
  });

  return false;
}

function dragDrop(e) {
  e.preventDefault();
  e.stopPropagation();

  const bounding = this.getBoundingClientRect();
  const offset = e.clientY - bounding.top;

  this.style.borderBottom = "";
  this.style.borderTop = "";

  const draggedCard = dragSrcEl;
  const targetCard = this;

  const isAfter = offset > bounding.height / 2;

  if (isAfter) {
    targetCard.insertAdjacentElement('afterend', draggedCard);
  } else {
    targetCard.insertAdjacentElement('beforebegin', draggedCard);
  }

  this.classList.remove('over');

  const targetColumnId = this.closest('.column').id;

  moveCard(draggedCard.id, targetColumnId, targetCard.id, isAfter);
}

function addEventsDragAndDrop(el) {
  el.addEventListener('dragstart', dragStart, false);
  el.addEventListener('dragenter', dragEnter, false);
  el.addEventListener('dragover', dragOver, false);
  el.addEventListener('dragleave', dragLeave, false);
  el.addEventListener('drop', dragDrop, false);
  el.addEventListener('dragend', dragEnd, false);
}

const columnsSelection = document.querySelectorAll('.column');

const reAddEvents = () => {
  const listItens = document.querySelectorAll('.draggable');

  listItens.forEach(function (item) {
    addEventsDragAndDrop(item);
  });

  const currentEditIcons = document.querySelectorAll('.edit-icon');

  currentEditIcons.forEach(function(icon) {
    icon.addEventListener('click',()=> {
      clickCard(icon.parentElement)
    });
  });
}

reAddEvents();

columnsSelection.forEach(function (column) {
  column.addEventListener('dragover', dragOver, false);
  column.addEventListener('drop', function (e) {
    e.preventDefault();

    moveCard(dragSrcEl.id, column.id);

    dragSrcEl.style.opacity = '1';
  }, false);
});
