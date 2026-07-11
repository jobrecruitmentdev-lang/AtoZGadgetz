/**
 * Sort Dropdown Handler Module
 */

export function initSort(selectId, onSortChange) {
  const select = document.getElementById(selectId);
  if (!select) return null;

  select.addEventListener('change', () => {
    onSortChange(select.value);
  });

  return {
    setValue(value) {
      if (select.querySelector(`option[value="${value}"]`)) {
        select.value = value;
      }
    },
    getValue() {
      return select.value;
    }
  };
}
