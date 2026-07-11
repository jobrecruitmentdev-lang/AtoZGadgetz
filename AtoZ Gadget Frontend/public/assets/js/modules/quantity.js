/**
 * Quantity Stepper Module
 * 
 * Reusable quantity input stepper for PDP buy-box and cart inline editing.
 * Supports min/max bounds and dispatches a custom event on change.
 */

/**
 * @param {string}   wrapperId  - ID of the container element
 * @param {Object}   options    - { initial, min, max, onChange }
 */
export function initQuantityStepper(wrapperId, options = {}) {
  const wrapper = document.getElementById(wrapperId);
  if (!wrapper) return;

  const {
    initial  = 1,
    min      = 1,
    max      = 99,
    onChange = null
  } = options;

  const minusBtn = wrapper.querySelector('[data-action="qty-minus"]');
  const plusBtn  = wrapper.querySelector('[data-action="qty-plus"]');
  const display  = wrapper.querySelector('[data-qty-display]');

  if (!minusBtn || !plusBtn || !display) return;

  let currentQty = Math.max(min, Math.min(max, parseInt(initial, 10) || 1));
  display.innerText = currentQty;

  function setQty(newVal) {
    if (isNaN(newVal)) return;
    currentQty = Math.max(min, Math.min(max, newVal));
    display.innerText = currentQty;

    minusBtn.disabled = currentQty <= min;
    plusBtn.disabled  = currentQty >= max;

    if (onChange) onChange(currentQty);

    wrapper.dispatchEvent(new CustomEvent('qty:changed', {
      bubbles: true,
      detail: { quantity: currentQty }
    }));
  }

  minusBtn.addEventListener('click', () => setQty(currentQty - 1));
  plusBtn.addEventListener('click',  () => setQty(currentQty + 1));

  // Initialize disabled states
  minusBtn.disabled = currentQty <= min;
  plusBtn.disabled  = currentQty >= max;

  return {
    get value()  { return currentQty; },
    set value(v) { setQty(v); }
  };
}

/**
 * Bind all `.qty-stepper` elements in a given container.
 * Each stepper must contain [data-action="qty-minus"], [data-action="qty-plus"],
 * and [data-qty-display], plus data-item-id, data-qty on the wrapper.
 * 
 * @param {Function} onUpdate - Async function({ itemId, quantity })
 */
export function bindCartSteppers(onUpdate) {
  document.querySelectorAll('.qty-stepper').forEach(wrapper => {
    const itemId  = wrapper.dataset.itemId;
    if (!itemId) return;

    initQuantityStepper(null, {
      initial:  parseInt(wrapper.dataset.qty, 10) || 1,
      min:      1,
      max:      99,
      onChange: async (qty) => {
        if (onUpdate) await onUpdate({ itemId, quantity: qty });
      }
    });
  });
}
