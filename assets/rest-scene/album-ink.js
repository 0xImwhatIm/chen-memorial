import { pen, paint, PEN } from './vendor/ink.js';

export const albumInk = Object.freeze({
  outline: PEN, detail: PEN * .53, legWidth: 4.2, armWidth: 3.6,
});

export function stroke(parent, d, width = albumInk.outline, opacity = 1) {
  const path = pen(parent, width);
  path.setAttribute('d', d);
  if (opacity !== 1) path.setAttribute('opacity', opacity);
  return path;
}

export function paperShape(parent, d, width = albumInk.outline) {
  const path = paint(parent, 'var(--scene-paper)', width);
  path.setAttribute('d', d);
  return path;
}
