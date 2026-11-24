import { el } from './vendor/ink.js';

export function mountTatamiStory(link) {
  const figure = document.createElement('figure');
  figure.className = 'rest-scene tatami-story tatami-playing';
  const svg = el('svg', {
    viewBox: '0 0 320 152',
    role: 'group',
    'aria-label': '媽媽抱著弟弟輕晃，哥哥笑咪咪，小玲趴在榻榻米上玩玩具車。',
  }, figure);
  svg.innerHTML = `
    <g fill="none" stroke="currentColor" stroke-width="1.05" stroke-linecap="round" stroke-linejoin="round">
      <path class="tatami-mat" d="M14 116L58 84H269L306 119L279 144H37Z"/>
      <path opacity=".38" d="M24 117L62 89H266L296 119L276 139H41Z M82 89L64 139 M255 89L274 139 M25 117H296"/>
      <path opacity=".22" d="M46 128h14m18 6h13m9-5h16m11 8h9m80-11h11m32 8h8m8-10h12M70 98h10m161 5h12"/>

      <g class="tatami-rock">
        <path class="tatami-knit" d="M42 55Q34 56 29 66L20 92Q16 110 38 116L95 113L120 101Q110 69 89 58Z"/>
        <path class="tatami-hair" d="M37 65Q26 56 29 33Q32 16 54 15Q75 14 84 32Q89 43 83 52L68 67Q50 77 37 65Z"/>
        <path class="tatami-paper" d="M57 32Q65 32 72 24Q76 33 82 35L83 42L88 46L84 49Q81 60 72 64Q65 66 57 60Q48 54 47 44Q54 40 57 32Z"/>
        <path d="M65 43q3 2 6-1 M76 40q2 1 4-1 M70 52q4 4 8-1"/>
        <path class="tatami-paper" d="M79 81Q84 67 97 67L116 72Q126 76 131 97L119 106L132 110Q135 116 126 118L99 115Q91 123 83 118Q80 115 85 110Q74 101 79 81Z"/>
        <path class="tatami-paper" d="M88 58Q88 44 101 43Q115 43 120 56L121 65Q117 75 106 77Q93 75 90 66Q85 66 86 61Q86 59 88 58Z"/>
        <path d="M96 46q5-4 9-1 M99 61q2 1 4 0 M111 61q2 1 4-1 M107 68q2 1 4-1 M114 87q7 5 11 15 M94 110q6-4 12-1"/>
        <path class="tatami-knit" d="M38 78Q31 91 37 103Q41 112 57 111L93 101L90 91L61 97L50 94"/>
        <path class="tatami-paper" d="M90 92Q94 86 104 86Q109 87 106 91L111 91Q114 93 110 96L106 99L94 102Z"/>
      </g>

      <g class="tatami-brother figure-hit" role="button" tabindex="0" aria-label="點哥哥，眼睛變成鹹蛋超人般的大眼睛">
        <rect class="tatami-hit" x="135" y="27" width="67" height="93" rx="13"/>
        <path class="tatami-paper" d="M151 71Q139 76 138 89L136 106Q143 116 160 113L195 111Q201 107 194 102L185 79Q174 69 151 71Z"/>
        <path d="M150 86q-5 10 0 17 M151 103q8 2 17 0 M183 86l4 17"/>
        <path class="tatami-hair" d="M142 53Q136 39 151 31Q160 26 172 29Q189 30 194 44Q199 52 193 65L146 67Z"/>
        <path class="tatami-paper" d="M149 51Q157 44 178 45Q184 47 187 54L188 64Q183 76 169 78Q153 76 148 64Z"/>
        <path class="tatami-smile-eyes" d="M153 58q4-5 9 0 M174 58q4-5 9 0"/>
        <path d="M163 66q6 7 13-1"/>
        <g class="tatami-wide-eyes">
          <ellipse cx="157.5" cy="56" rx="7" ry="5.1" transform="rotate(15 157.5 56)"/>
          <ellipse cx="178.5" cy="56" rx="7" ry="5.1" transform="rotate(-15 178.5 56)"/>
          <path d="M147 46l-3-3m22 2l2-4m20 5l4-3"/>
        </g>
      </g>

      <g class="tatami-girl figure-hit" role="button" tabindex="0" aria-label="點小玲，讓玩具車滑向媽媽">
        <rect class="tatami-hit" x="192" y="59" width="103" height="68" rx="13"/>
        <path class="tatami-paper" d="M220 94Q229 79 246 82Q268 83 278 98L294 109Q299 116 289 120L263 118L230 122L218 116Z"/>
        <path class="tatami-hair" d="M201 85Q195 69 210 63Q224 57 235 66Q247 76 238 91L226 101L207 98Z"/>
        <path class="tatami-paper" d="M204 88Q214 90 223 82Q231 83 235 89Q232 102 223 105Q210 105 204 96Z"/>
        <path d="M209 95q3 2 6 0 M216 101q2 1 4-1"/>
        <path class="tatami-paper tatami-hand" d="M235 98Q230 103 226 109L211 114Q205 115 205 119Q207 123 217 121L233 118Q242 114 246 106"/>
        <path d="M274 103q-1 7 6 10"/>
      </g>

      <g class="tatami-car" aria-hidden="true">
       <g transform="translate(425 0) scale(-1 1)">
        <path class="tatami-yellow" d="M197 124l3-5 5-2h10l5 5 6 2q3 1 3 4v3h-33v-4Z"/>
        <path d="M206 119h8l3 4h-13Z"/>
        <circle class="tatami-hair" cx="202" cy="131" r="3.3"/>
        <circle class="tatami-hair" cx="223" cy="131" r="3.3"/>
       </g>
      </g>
    </g>`;
  const hint = document.createElement('figcaption');
  hint.className = 'rest-scene-hint';
  hint.textContent = '點哥哥看他睜大眼睛，點小玲讓玩具車滑向媽媽。';
  figure.append(hint);
  link.after(figure);

  const brother = svg.querySelector('.tatami-brother');
  const girl = svg.querySelector('.tatami-girl');
  const car = svg.querySelector('.tatami-car');
  let eyesTimer;
  let drive;

  function interact(target, callback) {
    target.addEventListener('click', callback);
    target.addEventListener('keydown', event => {
      if (!['Enter', ' '].includes(event.key)) return;
      event.preventDefault();
      if (!event.repeat) callback();
    });
  }
  interact(brother, () => {
    brother.classList.add('tatami-surprised');
    clearTimeout(eyesTimer);
    eyesTimer = setTimeout(() => brother.classList.remove('tatami-surprised'), 1700);
  });
  interact(girl, () => {
    const wasPlaying = figure.classList.contains('tatami-playing');
    const releasePosition = wasPlaying ? getComputedStyle(car).transform : 'none';
    drive?.cancel();
    figure.classList.remove('tatami-playing');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !car.animate) {
      car.style.transform = 'translate(-69px, -3px)';
      return;
    }
    car.style.transform = '';
    drive = car.animate([
      { transform: releasePosition },
      { transform: 'translate(-69px, -3px)' },
    ], { duration: 2800, easing: 'cubic-bezier(.17,.56,.39,1)', fill: 'forwards' });
  });

  return () => {
    clearTimeout(eyesTimer);
    drive?.cancel();
    figure.remove();
  };
}
