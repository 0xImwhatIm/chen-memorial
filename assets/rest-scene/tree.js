import { el, pen, paint, limb } from './vendor/ink.js';

import { minJerk } from './vendor/motion.js';

export const duration = 7.2;
export const waveDuration = 2.4;

export function drawTreeScene(container, onWave) {
  const svg = el('svg', { viewBox: '0 0 320 140', role: 'group',
    'aria-label': '午後的大樹下，媽媽和小嬰兒坐在矮牆上，輕輕搖晃。'
  }, container);
  const line = (where, d, width = 1.1, opacity = 1) => {
    const path = pen(where, width);
    path.setAttribute('d', d);
    path.setAttribute('opacity', opacity);
    return path;
  };
  const fill = (where, d, color) => {
    const path = paint(where, color, .92);
    path.setAttribute('d', d);
  };

  line(svg, 'M21 126 Q93 125 157 126 T295 126', .72, .35);
  // Paired contours give the trunk and the main fork believable width.
  line(svg, 'M68 103 Q82 100 85 88 C89 73 86 62 78 52 Q66 39 51 35 M99 103 Q93 100 97 86 C99 72 102 60 114 51 Q131 38 151 35 M90 69 Q88 55 78 47 Q69 39 63 35 M97 66 Q100 52 111 43 Q116 38 120 34', 1.22, .68);
  line(svg, 'M85 97 Q92 86 91 76 M94 96 Q96 92 97 88 M78 51 Q74 47 70 45', .64, .43);
  const leaves = el('g', {}, svg);
  line(leaves, 'M27 26 Q26 17 39 15 Q43 9 59 11 Q68 3 86 8 Q99 1 115 7 Q130 3 148 10 Q164 6 179 14 Q197 11 208 21 Q227 21 233 30 M25 30 Q28 36 44 36 Q55 41 67 36 Q82 43 95 36 M102 35 Q114 39 126 35 Q139 40 151 35 Q169 43 180 37 M187 36 Q200 43 215 37 Q228 38 233 33', .98, .62);
  line(leaves, 'M42 25 q8 -5 18 -3 M74 24 q7 -6 13 -3 M104 18 q10 -5 21 -2 M146 26 q7 -5 18 -3 M184 26 q6 -4 15 0', .64, .37);

  line(svg, 'M61 105 Q160 103 257 105 L256 113 Q159 111 62 113 Z M75 113 V125 M246 113 V125', .97, .62);

  const child = el('g', {}, svg);
  const farArm = limb(child, 2.8, .82);
  fill(child, 'M116 89 Q117 83 123 82 Q130 81 134 88 L136 99 Q130 104 120 102 Q115 98 116 89 Z', 'var(--scene-paper)');
  fill(child, 'M127 96 Q134 92 141 97 L149 100 Q152 103 148 104 L141 103 Q134 104 128 101', 'var(--scene-paper)');
  fill(child, 'M120 73 C120 68 123 65 128 65 C133 65 136 69 136 74 C136 79 133 83 128 83 C123 83 120 79 120 73 Z', 'var(--scene-paper)');
  fill(child, 'M120 73 C119 68 123 64 128 64 C132 64 135 67 135 70 Q132 68 130 69 Q127 71 123 70 L122 74 Z', 'var(--hair)');
  const eyes = line(child, 'M125.1 74.4 h.4 M131.3 74.3 h.4', .72);
  const smile = line(child, 'M127.3 78.4 q1.6 1.5 3.2 -.2', .72);
  const restingArm = line(child, 'M121 90 Q127 94 132 92 L139 88 q3 -.3 3 2 Q136 97 128 97', .78);
  const nearArm = limb(child, 3.2, .85);

  const mother = el('g', {}, svg);
  fill(mother, 'M165 65 Q170 57 181 61 Q191 65 193 75 Q192 88 194 96 Q193 104 184 106 L169 106 Q162 103 154 104 Q148 102 151 97 Q157 92 170 89 Q166 82 164 74 Z', 'var(--dress)');
  fill(mother, 'M160 47 Q163 41 169 42 Q176 44 176 51 L176 58 L181 62 Q175 65 169 62 L168 57 Q162 59 160 53 L158 51 Z', 'var(--scene-paper)');
  fill(mother, 'M159 48 Q156 41 162 38 Q172 33 178 41 Q181 46 180 54 Q184 55 185 59 Q183 64 177 60 Q173 57 174 53 Q170 49 166 42 Q163 47 159 48 Z', 'var(--hair)');
  fill(mother, 'M171 71 Q173 68 176 70 Q178 75 175 81 Q167 90 155 94 L151 96 Q148 95 150 92 Q160 88 166 81 Z', 'var(--scene-paper)');
  line(mother, 'M162 49 l1 .2 M161 53 q2 .8 3 -.2 M177 72 q5 5 7 14 M170 97 q7 -4 14 -3 M186 85 l2 -1 M183 90 l1.7 -.8 M169 101 l2 -1 M186 99 l2 -1', .8, .78);

  const hit = el('rect', {
    x: 109, y: 56, width: 43, height: 50, rx: 6, fill: 'transparent',
    class: 'baby-hit', role: 'button', tabindex: '0', 'aria-label': '讓嬰兒舉手揮動',
  }, svg);
  hit.addEventListener('click', onWave);
  hit.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onWave();
    }
  });

  const progress = value => minJerk(Math.max(0, Math.min(1, value)));
  const armPoint = (from, to, raise) => from.map((value, i) => value + (to[i] - value) * raise);
  return (time, waveTime = waveDuration) => {
    const raise = progress(waveTime / .43) * (1 - progress((waveTime - 1.86) / .54));
    const wave = Math.sin(waveTime * Math.PI * 4.5) * raise;
    const armOpacity = Math.min(1, raise * 5);
    restingArm.setAttribute('opacity', 1 - armOpacity);
    farArm.g.setAttribute('opacity', armOpacity);
    nearArm.g.setAttribute('opacity', armOpacity);
    farArm.draw([[132, 88], armPoint([135, 91], [142, 81], raise), armPoint([138, 90], [145 + wave * 2.8, 70], raise)], [.2, .45]);
    nearArm.draw([[121, 89], armPoint([126, 93], [114, 82], raise), armPoint([139, 89], [110 - wave * 3.2, 69], raise)], [.2, .45]);
    eyes.setAttribute('d', raise > .48 ? 'M124.8 74.5 q.6 -1 1.3 -.2 M131 74.4 q.5 -1 1.2 -.2' : 'M125.1 74.4 h.4 M131.3 74.3 h.4');
    smile.setAttribute('d', raise > .48 ? 'M126.5 77.8 Q128.7 79 131.1 77.4 Q129.7 82 126.5 77.8 Z' : 'M127.3 78.4 q1.6 1.5 3.2 -.2');
    const phase = time / duration * Math.PI * 4;
    const sway = Math.sin(phase);
    mother.setAttribute('transform', `rotate(${sway * 2.5} 181 103)`);
    child.setAttribute('transform', `rotate(${-sway * 3.5} 127 102)`);
    leaves.setAttribute('transform', `rotate(${sway * .85} 123 38)`);
  };
}
