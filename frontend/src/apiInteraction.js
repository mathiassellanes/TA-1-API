const API_URL = 'http://localhost:3000/api/tasks';

const getCards = async () => {
  const response = await fetch(API_URL);

  return response.json();
}

const post = async (data) => {
  const response = await fetch(`${API_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return response.json();
}

const put = async (id, data) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return response.json();
}

const remove = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });

  return response;
}

const updateIndexes = async (cards) => {
  const response = await fetch(`${API_URL}/updateIndexes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cards),
  });

  return response.json();
}
