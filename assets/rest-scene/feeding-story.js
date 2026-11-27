import { el, inkDefs, limb, paint, pen, solid } from './vendor/ink.js';

export function mountFeedingStory(link) {
  const figure = document.createElement('figure');
  figure.className = 'rest-scene feeding-story';
  const svg = el('svg', {
    viewBox: '0 0 310 204',
    role: 'img',
    'aria-label': '媽媽坐在藤椅上，抱著孩子餵奶。',
  }, figure);
  svg.style.color = 'var(--muted)';
  const { filter } = inkDefs(svg, 'feeding-ink');
  const scene = el('g', { filter }, svg);
  const paper = 'var(--scene-paper)';
  const skin = 'color-mix(in srgb, var(--bg) 73%, #c68f77)';
  const shirt = 'color-mix(in srgb, var(--bg) 82%, #d6c19a)';
  const hair = 'color-mix(in srgb, var(--bg) 22%, #59443c)';
  const rattan = 'color-mix(in srgb, var(--bg) 66%, #ab765d)';

  function outline(parent, d, color, width = 1.15) {
    paint(parent, color, width).setAttribute('d', d);
  }
  function line(parent, d, width = .85, opacity = 1) {
    const path = pen(parent, width);
    path.setAttribute('d', d);
    path.setAttribute('opacity', opacity);
  }

  // The curved chair behind the two figures follows the original photograph.
  outline(scene, 'M57 192 70 93Q78 38 120 34L164 35Q198 38 210 91L224 189Z', rattan, 1.5);
  outline(scene, 'M68 188 80 94Q88 49 121 44L162 45Q188 48 200 92L213 188Z', paper);
  line(scene, 'M62 190 74 94Q84 44 119 39M163 40Q195 42 205 91L220 187', .85, .65);
  line(scene, 'M13 191Q64 190 95 192M212 192Q255 190 295 192', .75, .48);

  const family = el('g', {}, scene);
  family.style.transformOrigin = '146px 177px';
  outline(family, 'M77 183Q78 156 83 129Q87 111 109 106L138 101Q169 103 182 112Q203 128 205 151L199 189Q142 191 77 183Z', shirt);
  line(family, 'M98 117Q97 129 101 144M178 116Q182 128 181 139M126 124Q141 128 152 120M140 129l1.5 10', .72, .72);

  outline(family, 'M102 64Q103 43 119 37Q140 28 159 38Q179 47 176 69L172 91Q163 107 103 102Q97 89 102 64Z', hair, 1.3);
  outline(family, 'M106 71Q101 62 107 60Q112 58 114 67Q121 53 138 45Q150 50 156 62Q161 67 161 75Q160 92 148 98L149 105Q156 112 163 113Q147 124 128 113L121 105 120 92Q110 86 108 75Z', skin);
  line(family, 'M122 71q4-3 9-1m12-1q4-2 8 1m-25 4h1m20-1h1m-10 1-1 7 3 1m-11 6q7 3 12-1', .85);

  outline(family, 'M123 174Q141 155 166 155Q187 153 208 149Q233 152 242 174L243 187Q195 193 116 189Z', 'var(--dress)');
  outline(family, 'M180 145Q174 141 179 136L183 133Q187 121 197 118Q216 112 229 123Q245 137 235 155Q229 163 216 166Q193 167 185 154Z', skin);
  line(family, 'M192 135q5-2 9 1m-8 15q3 3 7 0m24 0q8-3 6 4m-19-32q7 0 12 4', .76);
  const supportingArm = solid(limb(family, 13, 1.1), skin);
  supportingArm.draw([[195, 165], [190, 179], [173, 186]], [.2, .4]);
  const feedingArm = solid(limb(family, 14, 1.1), skin);
  feedingArm.draw([[89, 148], [106, 171], [151, 147]], [.25, .55]);

  outline(family, 'M143 137Q143 131 149 130L169 133Q173 135 173 139L173 147Q173 151 168 152L148 150Q142 149 142 144Z', shirt);
  outline(family, 'M172 137l7 1q3 3 0 7l-7 2Z', paper);
  line(family, 'M148 136l7 1m-7 4 6 1m-6 4 7 1', .62, .65);
  outline(family, 'M136 153Q142 148 147 148l8 1q6 0 7-3 4 0 3 4-2 5-14 7l-6 4', skin, .95);

  link.after(figure);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let sway;
  const stop = () => { if (motion.matches) sway?.cancel(); };
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    if (motion.matches || !family.animate) return;
    sway = family.animate(
      [0, -.9, .65, -.45, 0].map(angle => ({ transform: `rotate(${angle}deg)` })),
      { duration: 4600, easing: 'ease-in-out' },
    );
  }) : null;
  observer?.observe(figure);
  motion.addEventListener('change', stop);
  return () => {
    observer?.disconnect();
    motion.removeEventListener('change', stop);
    sway?.cancel();
    figure.remove();
  };
}
