import { el, pen, paint } from './vendor/ink.js';

export const duration = 7.2;

export function drawTreeScene(container) {
  const svg = el('svg', { viewBox: '0 0 320 140', role: 'img',
    'aria-label': '午後的大樹下，媽媽和小嬰兒坐在矮牆上，輕輕搖晃。'
  }, container);
  const line = (where, d, width = 1.1, opacity = 1) => {
    const path = pen(where, width);
    path.setAttribute('d', d);
    path.setAttribute('opacity', opacity);
    return path;
  };
  const fill = (where, d, color) => {
    const path = paint(where, color, 1.05);
    path.setAttribute('d', d);
  };

  line(svg, 'M17 126 Q79 125 134 126 M200 126 Q256 125 302 126', .75, .36);
  line(svg, 'M101 102 C103 78 96 60 81 46 Q53 22 39 14 M113 79 Q107 57 97 45 T78 9 M122 69 Q117 41 113 18 M127 76 Q134 38 156 8 M131 95 C145 65 174 47 206 29 Q222 21 240 14 M143 63 Q162 43 168 19 M142 102 Q148 81 160 70', 1.7, .60);
  line(svg, 'M108 99 Q116 85 107 68 M118 94 Q122 85 117 75 M130 88 Q130 79 136 68 M87 47 Q77 36 61 30', .69, .35);
  const leaves = el('g', {}, svg);
  line(leaves, 'M20 26 Q27 16 42 19 Q44 10 59 10 Q69 4 81 11 M55 28 Q74 24 87 35 M86 12 Q98 3 113 10 M139 14 Q147 7 157 11 Q171 3 182 13 M174 19 Q188 11 205 17 Q218 6 233 13 Q248 8 262 20 M211 32 Q222 27 234 31 Q246 26 259 33', 1.05, .53);
  line(leaves, 'M33 35 q6 -5 13 -3 M66 40 q8 0 13 5 M181 28 q6 -6 14 -5 M237 41 q7 -5 15 -3', .74, .36);

  line(svg, 'M61 105 Q160 103 257 105 L256 113 Q159 111 62 113 Z M75 113 V125 M246 113 V125 M82 119 H106 M221 119 H243', 1.3, .64);

  const child = el('g', {}, svg);
  fill(child, 'M116 89 Q117 83 123 82 Q130 81 134 88 L136 99 Q130 104 120 102 Q115 98 116 89 Z', 'var(--scene-paper)');
  fill(child, 'M127 96 Q134 92 141 97 L149 100 Q152 103 148 104 L141 103 Q134 104 128 101', 'var(--scene-paper)');
  fill(child, 'M120 73 Q121 66 128 66 Q136 67 136 74 Q135 82 129 84 Q123 83 120 79 Z', 'var(--scene-paper)');
  fill(child, 'M120 75 Q118 68 124 66 Q129 63 135 68 L136 72 Q132 68 128 71 Q124 72 123 76 Z', 'var(--hair)');
  line(child, 'M129 75 l.6 .2 M131 79 q2 1 3 -1 M121 90 Q127 95 132 92 L139 88 q3 -.3 3 2 Q136 97 128 97', .83);

  const mother = el('g', {}, svg);
  fill(mother, 'M173 99 Q179 99 184 104 Q184 112 194 119 L198 120 Q201 124 197 126 L188 126 Q180 121 175 115 Q169 108 173 99 Z', 'var(--scene-paper)');
  fill(mother, 'M165 65 Q170 57 181 61 Q191 65 193 75 Q192 88 194 96 Q193 104 184 106 L169 106 Q162 103 154 104 Q148 102 151 97 Q157 92 170 89 Q166 82 164 74 Z', 'var(--dress)');
  fill(mother, 'M160 47 Q163 41 169 42 Q176 44 176 51 L176 58 L181 62 Q175 65 169 62 L168 57 Q162 59 160 53 L158 51 Z', 'var(--scene-paper)');
  fill(mother, 'M159 48 Q156 41 162 38 Q172 33 178 41 Q181 46 180 54 Q184 55 185 59 Q183 64 177 60 Q173 57 174 53 Q170 49 166 42 Q163 47 159 48 Z', 'var(--hair)');
  fill(mother, 'M171 71 Q173 68 176 70 Q178 75 175 81 Q167 90 155 94 L151 96 Q148 95 150 92 Q160 88 166 81 Z', 'var(--scene-paper)');
  line(mother, 'M162 49 l1 .2 M161 53 q2 .8 3 -.2 M177 72 q5 5 7 14 M170 97 q7 -4 14 -3 M186 85 l2 -1 M183 90 l1.7 -.8 M169 101 l2 -1 M186 99 l2 -1', .8, .78);

  return time => {
    const phase = time / duration * Math.PI * 4;
    const sway = Math.sin(phase);
    mother.setAttribute('transform', `rotate(${sway * 3} 181 103)`);
    child.setAttribute('transform', `rotate(${-sway * 4.5} 127 102)`);
    leaves.setAttribute('transform', `rotate(${sway * 1.35} 123 68)`);
  };
}
