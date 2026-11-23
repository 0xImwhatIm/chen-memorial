import { el, pen } from './vendor/ink.js';

const button = document.getElementById('lotus');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const petals = [
  'M50 58 C39 49 38 35 50 14 C62 35 61 49 50 58Z',
  'M50 58 C34 55 23 44 26 25 C34 29 41 34 45 42',
  'M50 58 C66 55 77 44 74 25 C66 29 59 34 55 42',
  'M50 58 C31 62 16 56 10 39 C16 41 23 40 29 45',
  'M50 58 C69 62 84 56 90 39 C84 41 77 40 71 45',
  'M50 58 C37 69 22 66 15 58 C20 58 24 57 28 58',
  'M50 58 C63 69 78 66 85 58 C80 58 76 57 72 58',
];
let currentBloom;

button?.addEventListener('lotus-offered', () => {
  if (motion.matches) return;
  currentBloom?.remove();
  const bloom = el('svg', {
    class: 'lotus-pop',
    viewBox: '0 0 100 76',
    'aria-hidden': 'true',
    focusable: 'false',
  });
  petals.forEach((contour, index) => {
    const stroke = pen(bloom, index === 0 ? 1.55 : 1.3);
    stroke.setAttribute('d', contour);
    stroke.setAttribute('pathLength', 1);
    stroke.style.animationDelay = `${index * 95}ms`;
  });
  currentBloom = bloom;
  // The petals have their own animation events; remove the bloom only after it fades.
  function removeBloom(event) {
    if (event.target !== bloom) return;
    bloom.remove();
    if (currentBloom === bloom) currentBloom = null;
  }
  bloom.addEventListener('animationend', removeBloom);
  bloom.addEventListener('animationcancel', removeBloom);
  button.after(bloom);
});
