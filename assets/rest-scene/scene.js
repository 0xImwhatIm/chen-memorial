import { el, pen, paint, limb, shoe, blot, place } from './vendor/ink.js';
import { gait } from './vendor/gait.js';
import { ease, minJerk } from './vendor/motion.js';

const ground = 130;
const scale = 1.12;
const walk = gait({ period: 1.18, stride: 24, lift: 3.1 });
const arrivalX = 208;
const entranceX = 17;
const braking = .54;
const walkTime = (arrivalX - entranceX) / (walk.speed * scale) + braking / 2;
const turnTime = .7;
const seatTime = 1.4;
export const duration = walkTime + turnTime + seatTime;

const mix = (a, b, t) => a + (b - a) * t;
const rounded = (value) => value.toFixed(2);

export function restPoseAt(time) {
  const moving = Math.min(time, walkTime);
  const slowdown = Math.max(0, (moving - walkTime + braking) / braking);
  const travelled = moving - braking * slowdown * slowdown / 2;
  const pace = 1 - slowdown;
  const steps = walk.pose(travelled / walk.period, pace);
  const turn = ease(Math.min(1, Math.max(0, (time - walkTime) / turnTime)));
  const sitting = minJerk(Math.min(1, Math.max(0, (time - walkTime - turnTime) / seatTime)));
  const direction = turn < .5 ? 1 : -1;
  return {
    x: entranceX + travelled * walk.speed * scale + 36 * sitting,
    width: 1 - .18 * Math.sin(Math.PI * turn),
    direction, sitting, pace,
    hip: [40, steps.hip[1] + 25 * sitting],
    feet: steps.feet.map((foot, i) => ({
      ankle: [foot.ankle[0] + (36 / scale) * sitting, foot.ankle[1]],
      knee: [mix(foot.knee[0], i ? 66 : 70, sitting), mix(foot.knee[1], i ? 102 : 104, sitting)],
      pitch: foot.pitch,
    })),
    leading: steps.front,
  };
}

function drawWindow(scene) {
  const window = el('g', { 'aria-hidden': 'true' }, scene);
  const frame = pen(window, .92);
  frame.setAttribute('opacity', '.35');
  frame.setAttribute('d', 'M192 110 V10 H309 V110 Z M196 106 V14 H305 V106 Z M250 14 V106 M254 14 V106 M188 110 H313');
  const view = pen(window, .73);
  view.setAttribute('opacity', '.28');
  view.setAttribute('d',
    'M211 32 Q216 28 221 32 Q226 28 231 32 M268 28 Q279 19 292 27 ' +
    'M299 39 Q290 48 287 64 M298 42 Q292 39 285 40 M294 47 Q296 40 295 36 M291 53 Q285 48 280 49');
}

function drawChair(scene) {
  const frame = pen(scene, 1.55);
  frame.setAttribute('d',
    'M211 105 Q223 103 233 101 Q246 97 255 89 C264 76 264 56 276 45 C290 34 304 42 302 55 Q299 77 283 99 Q273 112 258 118 M209 108 Q220 107 231 106 Q251 103 259 91 C268 77 270 56 280 47 C288 40 297 44 297 52 Q293 77 279 96 Q270 108 255 114 ' +
    'M211 106 Q210 118 206 128 M216 107 Q215 117 211 128 M264 115 Q268 121 271 129 M270 112 Q274 120 278 129 M211 122 Q241 119 269 122');
  const weave = pen(scene, .63);
  weave.setAttribute('opacity', '.46');
  weave.setAttribute('d',
    'M275 54 Q284 53 295 54 M272 60 Q283 58 294 60 M270 66 Q281 64 292 65 M268 72 Q278 69 289 71 M266 78 Q276 75 286 77 M263 84 Q273 81 283 83 M260 90 Q270 87 280 88 M254 95 Q265 93 277 93 ' +
    'M280 48 Q276 77 261 95 M285 46 Q281 76 268 95 M291 46 Q285 76 273 96 M295 49 Q290 73 277 94 M243 110 Q250 108 257 105 M246 113 Q253 111 263 107');
  const arm = pen(scene, 1.52);
  arm.setAttribute('d',
    'M220 128 Q224 108 224 99 C223 91 218 91 214 96 Q212 98 212 103 M225 99 Q235 89 250 91 Q263 93 269 86 Q273 83 278 80 M227 102 Q236 93 250 94 Q263 95 273 86 M261 94 Q261 109 256 117');
  return arm;
}

function drawFigure(scene) {
  const person = el('g', {}, scene);
  const farArm = limb(person, 4.15, 1.13);
  const legs = [limb(person, 5, 1.13), limb(person, 5, 1.13)];
  const shoes = [blot(person), blot(person)];
  const dress = paint(person, 'var(--dress)', 1.28);
  const seams = pen(person, .66);
  const neck = pen(person, 1.05);
  const face = paint(person, 'var(--scene-paper)', 1.05);
  const hair = paint(person, 'var(--hair)', 1.1);
  const hairline = pen(person, .64);
  hairline.setAttribute('stroke', 'var(--hair-glint)');
  const nearArm = limb(person, 4.55, 1.13);
  const cuff = pen(person, .72);
  return function render(time) {
    const pose = restPoseAt(time);
    const { x, direction, sitting: seat, width } = pose;
    place(person, x, ground, direction, scale);
    if (width !== 1) {
      person.setAttribute('transform', `translate(${rounded(x)} ${ground}) scale(${rounded(direction * scale * width)} ${scale}) translate(-40 -120)`);
    }
    const [hx, hy] = pose.hip;
    const shoulders = [hx - 12 * seat, hy - 34 + 3 * seat];
    const [sx, sy] = shoulders;
    const waistX = mix(sx, hx, .68);
    const waistY = hy - 9;
    const hemX = Math.max(49, ...pose.feet.map((foot) => foot.knee[0] + 3)) + 2 * seat;
    const hemY = Math.min(108, hy + 24 - seat * 11);
    const backHemX = 29 + 8 * seat;
    for (const [index, foot] of pose.feet.entries()) {
      legs[index].draw([pose.hip, foot.knee, foot.ankle], [.2, .35]);
      shoe(shoes[index], foot.ankle, foot.pitch);
    }
    person.insertBefore(legs[pose.leading].g, dress);
    person.insertBefore(shoes[pose.leading], dress);
    dress.setAttribute('d',
      `M${sx-8} ${sy+1} Q${sx-4} ${sy-3} ${sx} ${sy-1} Q${sx+6} ${sy-3} ${sx+9} ${sy+1}
       Q${sx+12} ${sy+4} ${sx+12} ${sy+9} L${sx+7} ${sy+12}
       Q${waistX+7} ${waistY-7} ${waistX+6} ${waistY} Q${hx+11} ${hy+3} ${hemX} ${hemY-2}
       Q${hemX-6} ${hemY+3} ${backHemX} ${hemY} Q${hx-13} ${hy+9} ${waistX-5} ${waistY}
       Q${waistX-8} ${waistY-12} ${sx-7} ${sy+11} L${sx-11} ${sy+9} Q${sx-11} ${sy+4} ${sx-8} ${sy+1} Z`);
    seams.setAttribute('d',
      `M${sx-3} ${sy+1} Q${sx} ${sy+8} ${sx+5} ${sy+1}
       M${waistX-4} ${waistY} Q${waistX+1} ${waistY+2} ${waistX+6} ${waistY}
       M${waistX-2} ${waistY+3} Q${hx-5} ${hy+5} ${backHemX+7} ${hemY-1}
       M${waistX+4} ${waistY+3} Q${hx+7} ${hy+8} ${hemX-7} ${hemY-1}
       M${sx+2} ${sy+9} Q${sx+4} ${sy+14} ${waistX+2} ${waistY-3}`);
    const headX = sx + 1 - 2 * seat, headY = sy - 12;
    neck.setAttribute('d', `M${headX-2} ${headY+7} Q${headX-2} ${headY+10} ${sx-4} ${sy} M${headX+4} ${headY+7} L${sx+4} ${sy+1}`);
    face.setAttribute('d',
      `M${headX-5} ${headY-5} Q${headX+1} ${headY-11} ${headX+5} ${headY-5}
       Q${headX+6} ${headY-2} ${headX+7} ${headY} L${headX+6} ${headY+1.5}
       Q${headX+6} ${headY+8} ${headX+3} ${headY+8} Q${headX-4} ${headY+6} ${headX-5} ${headY-5} Z`);
    hair.setAttribute('d',
      `M${headX+6} ${headY-4} C${headX+6} ${headY-9} ${headX} ${headY-11} ${headX-4} ${headY-9}
       C${headX-10} ${headY-7} ${headX-9} ${headY} ${headX-8} ${headY+4}
       Q${headX-6} ${headY+9} ${headX-2} ${headY+7} Q${headX-5} ${headY+3} ${headX-3} ${headY+1}
       Q${headX+1} ${headY-1} ${headX+2} ${headY-6} Q${headX+4} ${headY-6} ${headX+6} ${headY-4} Z`);
    hairline.setAttribute('d', `M${headX+1} ${headY-8} Q${headX-5} ${headY-9} ${headX-7} ${headY-2}`);
    const swing = (pose.feet[0].ankle[0] - 40) * pose.pace;
    const farShoulder = [sx-4, sy+6];
    farArm.draw([farShoulder, [mix(sx-5+swing*.32, sx+5, seat), mix(sy+21, hy-10, seat)], [mix(sx-2+swing*.57, hx+12, seat), mix(sy+33, hy, seat)]], [.25, .5]);
    const armStart = [sx+8, sy+8];
    const elbow = [mix(sx+8-swing*.36, sx+9, seat), mix(sy+22, hy-8, seat)];
    const hand = [mix(sx+11-swing*.64, hx+12, seat), mix(sy+35, hy-2, seat)];
    nearArm.draw([armStart, elbow, hand], [.2, .5]);
    cuff.setAttribute('d', `M${armStart[0]-2.5} ${armStart[1]+2} Q${armStart[0]+.4} ${armStart[1]+3.5} ${armStart[0]+2.5} ${armStart[1]+1.5}`);
  };
}

export function drawWindowScene(container) {
  const svg = el('svg', {
    viewBox: '0 0 320 140', role: 'img',
    'aria-label': '線稿中的短髮女士穿著洋裝，走到窗邊的藤製躺椅坐下。',
  }, container);
  const scene = el('g', {}, svg);
  drawWindow(scene);
  const floor = pen(scene, .82);
  floor.setAttribute('opacity', '.42');
  floor.setAttribute('d', 'M6 130 Q72 129 133 130 T259 130 Q286 129 309 130');
  const chairArm = drawChair(scene);
  const render = drawFigure(scene);
  scene.appendChild(chairArm);

  return render;
}
