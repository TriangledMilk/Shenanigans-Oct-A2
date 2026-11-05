const form = document.querySelector('#coin-form');
const formStatus = document.querySelector('#form-status');
const coinStatus = document.querySelector('#coin-status');
const coinItems = document.querySelector('#coin-items');
const template = document.querySelector('#coin-item-template');
const submitButton = form.querySelector('button[type="submit"]');
const fields = [...form.querySelectorAll('input, textarea, select')];

function validateField(field) {
  if (field.type === 'text' || field.tagName === 'TEXTAREA') {
    field.setCustomValidity(field.validity.valueMissing || field.value.trim() ? '' : 'Enter a value that is not just whitespace.');
  }
  const valid = field.checkValidity();
  document.getElementById(`${field.id}-error`).textContent = valid ? '' : field.validationMessage;
  if (valid) field.removeAttribute('aria-invalid');
  else field.setAttribute('aria-invalid', 'true');
  return valid;
}

for (const field of fields) {
  field.addEventListener('input', () => validateField(field));
  field.addEventListener('blur', () => validateField(field));
}

async function loadItems() {
  coinStatus.textContent = 'Loading coins…';
  try {
    const response = await fetch('/api/coin-items');
    if (!response.ok) throw new Error('Unable to load coins. Please try again later.');
    const items = await response.json();
    const fragment = document.createDocumentFragment();
    for (const item of items) {
      const node = template.content.cloneNode(true);
      node.querySelector('.coin-name').textContent = item.name;
      node.querySelector('.coin-type').textContent = item.circulation_or_bullion;
      node.querySelector('.coin-specs').textContent =
        `Ag: ${item.Ag} · ${item.weight_g} g · ${item.weight_toz} troy oz · ${item.ASW_toz} ASW troy oz · Number: ${item.number}`;
      node.querySelector('.coin-run').textContent = `Production run: ${item.production_run}`;
      node.querySelector('.coin-description').textContent = item.description;
      const deleteButton = node.querySelector('.delete-button');
      deleteButton.addEventListener('click', async () => {
        if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;
        deleteButton.disabled = true;
        try {
          const deleteResponse = await fetch(`/api/coin-items/${item._id}`, { method: 'DELETE' });
          if (!deleteResponse.ok) throw new Error('Unable to delete the coin. Please try again later.');
          if (!await loadItems()) formStatus.textContent = 'Coin deleted, but the collection could not be refreshed.';
        } catch (error) {
          formStatus.textContent = error.message || 'Unable to delete the coin. Please try again.';
        } finally {
          deleteButton.disabled = false;
        }
      });
      fragment.append(node);
    }
    coinItems.replaceChildren(fragment);
    coinStatus.textContent = items.length ? '' : 'No coins yet. Add the first one above.';
    return true;
  } catch {
    coinStatus.textContent = 'Unable to load coins. Please refresh the page to try again.';
    return false;
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  formStatus.textContent = '';
  const validity = fields.map(validateField);
  if (validity.includes(false)) {
    fields[validity.indexOf(false)].focus();
    return;
  }

  const data = Object.fromEntries(new FormData(form));
  for (const field of form.querySelectorAll('input[type="number"]')) {
    data[field.name] = Number(data[field.name]);
  }
  submitButton.disabled = true;
  formStatus.textContent = 'Saving coin…';
  try {
    const response = await fetch('/api/coin-items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || 'Unable to save the coin. Please try again.');
    }
    form.reset();
    formStatus.textContent = 'Coin saved.';
    if (!await loadItems()) formStatus.textContent = 'Coin saved, but the collection could not be refreshed.';
  } catch (error) {
    formStatus.textContent = error.message || 'Unable to save the coin. Please try again.';
  } finally {
    submitButton.disabled = false;
  }
});
loadItems();
