// Shared art direction for both album scenes. Based on the daylight Walker example.
import { el, pen, blot, paint, inkDefs, PEN, INK_DAY } from './vendor/ink.js';

export const albumInk = Object.freeze({
  ink: INK_DAY, paper: '#fdfcf8', collar: '#a95d46',
  outline: PEN, detail: PEN * .53, legWidth: 4.2, armWidth: 3.6,
});

let nextScene = 0;
export function albumScene(container, label) {
  const svg = el('svg', { viewBox: '0 0 320 140', role: 'group', 'aria-label': label }, container);
  svg.style.color = albumInk.ink;
  svg.style.setProperty('--scene-paper', albumInk.paper);
  const { filter } = inkDefs(svg, 'album-ink-' + ++nextScene);
  return { svg, drawing: el('g', { filter }, svg) };
}

export function stroke(parent, d, width = albumInk.outline, opacity = 1) {
  const p = pen(parent, width);
  p.setAttribute('d', d);
  if (opacity !== 1) p.setAttribute('opacity', opacity);
  return p;
}
export function paperShape(parent, d, width = albumInk.outline) {
  const p = paint(parent, albumInk.paper, width);
  p.setAttribute('d', d);
  return p;
}

// One model of her jaw-length, side-parted bob, in profile facing camera-right.
// The same open neckline and flat terracotta collar identify her in either scene.
export function motherPortrait(parent) {
  const g = el('g', {}, parent);
  paperShape(g, 'M-2.2 3.5 Q-1.7 6.5 -3.7 9.1 Q.2 12.1 4.5 9.1 Q2 7.5 2.2 4', 1.05);
  paperShape(g, 'M-4.1 -3.9 Q-1.1 -8.4 3.1 -5.8 Q5 -4.5 4.5 -1.8 L5.5 .1 L4.5 1 Q4.2 5.2 1.6 5.7 Q-2.3 5.6 -4.2 1.6 Z', 1.16);
  blot(g).setAttribute('d','M4.5 -2.7 Q2.7 -4.4 1.7 -5 Q-.2 -1.5 -2.4 -.6 Q-3.8 1.6 -2.5 3.4 Q-.9 5.7 -1.3 7 Q-4.6 7.3 -5.8 4.5 Q-7.4 1.1 -6.6 -3.2 Q-6.1 -7.5 -2.1 -8.2 Q2.9 -9.4 4.7 -5.1 Q5.1 -3.5 4.5 -2.7Z');
  const part = stroke(g, 'M-4.9 -3.1 Q-3.9 -6.4 -.9 -6.7', .6);
  part.setAttribute('stroke', albumInk.paper);
  const collar = paint(g, albumInk.collar, .75);
  collar.setAttribute('d', 'M-3.8 8.3 Q.3 10.6 3.7 8.1 L4.8 9.4 Q.7 13 -4.9 9.7 Z');
  return (x, y, angle = 0, direction = 1, scale = 1) => {
    g.setAttribute('transform', `translate(${x} ${y}) rotate(${angle}) scale(${direction * scale} ${scale})`);
  };
}
