/*
 * Fills the designs from content.js.
 *   data-t="packages.growth.price"     -> text
 *   data-list="packages.growth.short"  -> one <li> per item
 *   data-if="contactLine"              -> element is removed when the value is empty or false
 *   data-modules                       -> the optional-modules list (data-notes="short" uses the short notes)
 * It also numbers the story cards (01 / 08) so cards can be added or removed freely.
 */
(function () {
  const data = window.FORGE;
  const get = (path) => path.split('.').reduce((value, key) => (value == null ? value : value[key]), data);

  document.querySelectorAll('[data-if]').forEach((el) => {
    if (!get(el.dataset.if)) el.remove();
  });
  document.querySelectorAll('[data-t]').forEach((el) => {
    const value = get(el.dataset.t);
    if (value != null) el.textContent = value;
  });
  document.querySelectorAll('[data-list]').forEach((el) => {
    el.replaceChildren(
      ...(get(el.dataset.list) || []).map((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        return li;
      }),
    );
  });
  document.querySelectorAll('[data-modules]').forEach((el) => {
    const only = el.dataset.modules ? el.dataset.modules.split(',') : null;
    el.replaceChildren(
      ...data.modules
        .filter((m) => !only || only.includes(m.status))
        .map((m) => {
          const row = document.createElement('div');
          row.className = 'module';
          const chip = document.createElement('span');
          chip.className = 'chip chip-' + m.status.toLowerCase().replace(/\s+/g, '-');
          chip.textContent = m.status;
          const text = document.createElement('div');
          const name = document.createElement('p');
          name.className = 'module-name';
          name.textContent = m.name;
          const note = document.createElement('p');
          note.className = 'module-note';
          note.textContent = el.dataset.notes === 'short' ? m.short || m.note : m.note;
          text.append(name, note);
          row.append(text, chip);
          return row;
        }),
    );
  });

  const cards = document.querySelectorAll('.card');
  cards.forEach((card, i) => {
    const pager = card.querySelector('.pager');
    if (pager) pager.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(cards.length).padStart(2, '0');
  });
})();
