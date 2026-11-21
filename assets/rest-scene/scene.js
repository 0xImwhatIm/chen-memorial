import { el, pen, limb, shoe, blot, place, joint } from './vendor/ink.js';
import { gait } from './vendor/gait.js';
import { ease, minJerk } from './vendor/motion.js';

import { albumInk, albumScene, motherPortrait, paperShape, stroke } from './album-ink.js';

const ground = 130;
const scale = 1.12;
const walk = gait({ period: 1.18, stride: 24, lift: 3.1 });
// The final foot placement is under the knees, a little inside the seat front.
const arrivalX = 222;
const seatHipX = 253.4;
const cushionTop = 100.65;
const maxCushionDip = 2.25;
const entranceX = 17;
const braking = .54;
const walkTime = (arrivalX - entranceX) / (walk.speed * scale) + braking / 2;
const turnTime = .7;
export const seatStart = walkTime + turnTime;
export const seatTime = 3.1;
const brushPause = 1.55;
export const duration = walkTime + turnTime + seatTime;
const clamp = t => Math.max(0, Math.min(1, t));

export function brushDuringWalk(clickedAt) {
  if (clickedAt < 0 || clickedAt >= walkTime) return null;
  const ramp = Math.min(.38, walkTime - clickedAt);
  const pauseStart = clickedAt + ramp;
  return { clickedAt, ramp, pauseStart, pauseEnd: pauseStart + brushPause, delay: brushPause + ramp };
}

function approachTime(time, brush) {
  if (!brush || time < brush.clickedAt) return time;
  const { clickedAt, ramp, pauseStart, pauseEnd, delay } = brush;
  if (time < pauseStart) {
    const u = (time - clickedAt) / ramp;
    return time - ramp * u * u / 2;
  }
  const stoppedAt = clickedAt + ramp / 2;
  if (time < pauseEnd) return stoppedAt;
  if (time < pauseEnd + ramp) {
    const u = (time - pauseEnd) / ramp;
    return stoppedAt + ramp * u * u / 2;
  }
  return time - delay;
}

const mix = (a, b, t) => a + (b - a) * t;
const rounded = (value) => value.toFixed(2);

export function restPoseAt(time, brush) {
  const elapsed = approachTime(time, brush);
  const gestureTime = brush ? time - brush.pauseStart : -1;
  const moving = Math.min(elapsed, walkTime);
  const liftHand = minJerk(clamp(gestureTime / .44)) *
    (1 - minJerk(clamp((gestureTime - 1.0) / .44)));
  const sweep = minJerk(clamp((gestureTime - .43) / .49));
  const slowdown = Math.max(0, (moving - walkTime + braking) / braking);
  const travelled = moving - braking * slowdown * slowdown / 2;
  const pace = 1 - slowdown;
  const steps = walk.pose(travelled / walk.period, pace);
  const turn = ease(Math.min(1, Math.max(0, (elapsed - walkTime) / turnTime)));
  const u = clamp((elapsed - seatStart) / seatTime);
  const beat = (begin, end) => minJerk(clamp((u - begin) / (end - begin)));
  const flex = beat(0, .35);
  const descent = beat(.075, .83);
  const settle = beat(.51, .98);
  const hipTravel = (seatHipX - arrivalX) * (.94 * descent + .06 * settle);
  const hips = [40, steps.hip[1] + 2.25 * flex + 13.95 * descent + 1.37 * settle];
  const x = entranceX + travelled * walk.speed * scale + hipTravel;
  const width = 1 - .18 * Math.sin(Math.PI * turn);
  const feet = steps.feet.map(foot => {
    if (u === 0) return foot;
    // Facing left after turning: cancel the pelvis travel exactly at each sole.
    const ankle = [foot.ankle[0] + hipTravel / scale, foot.ankle[1]];
    return { ...foot, ankle, knee: joint(hips, ankle, walk.thigh, walk.shin, 1) };
  });
  // Release the forward hinge during descent. The rib cage and pelvis reach
  // the seat together; only a small settling movement is left after contact.
  const hinge = beat(0, .29) * (1 - beat(.18, .77));
  const backSupport = beat(.35, .94);
  const lumbarAngle = 11 * hinge - 12 * backSupport;
  const ribAngle = 15 * hinge - 9 * backSupport;
  const shoulderAngle = 13 * hinge - 7 * backSupport;
  const headAngle = 3 * hinge + 1.8 * backSupport;
  const from = ([x, y], length, angle) => {
    const r = angle * Math.PI / 180;
    return [x + length * Math.sin(r), y - length * Math.cos(r)];
  };
  const waist = from(hips, 10, lumbarAngle);
  const ribs = from(waist, 12, ribAngle);
  const shoulder = from(ribs, 11, shoulderAngle);
  const head = from(shoulder, 10.5, headAngle);
  const contactY = ground + (hips[1] + 4.8 - 120) * scale;
  const cushionDip = Math.min(maxCushionDip, Math.max(0, contactY - cushionTop));
  return {
    x, width, direction: turn < .5 ? 1 : -1, walking: elapsed < walkTime && !brush,
    hip: hips, waist, ribs, shoulder, head, headAngle,
    feet, leading: steps.front, pace, liftHand, sweep,
    drape: beat(.10, .72), gather: beat(.23, .76), cushionDip, seatPhase: u,
  };
}

function drawWindow(scene) {
  const window = el('g', { 'aria-hidden': 'true' }, scene);
  const frame = pen(window, 1.03);
  frame.setAttribute('opacity', '.55');
  frame.setAttribute('d', 'M192 110 V10 H309 V110 Z M196 106 V14 H305 V106 Z M250 14 V106 M254 14 V106 M188 110 H313');
  const view = pen(window, .73);
  view.setAttribute('opacity', '.55');
  view.setAttribute('d',
    'M211 32 Q216 28 221 32 Q226 28 231 32 M268 28 Q279 19 292 27 ' +
    'M299 39 Q290 48 287 64 M298 42 Q292 39 285 40 M294 47 Q296 40 295 36 M291 53 Q285 48 280 49');
}

function drawChair(scene) {
  // Each side is one bent front leg/arm, joined to its back upright. Drawing
  // the far side first and the near side last keeps the arm out of the cushion.
  function bentArm(parent) {
    paperShape(parent,
      'M219.58 129 C220.23 119.3 221.05 108.5 221.7 98.5 ' +
      'C222.19 91.3 223.74 86.8 228.47 86.7 C235.96 86.4 243.05 87.5 249.41 85.9 ' +
      'Q256.83 84.1 263.92 79.3 L265.0 81.4 Q257.07 86.6 249.82 88.2 ' +
      'C242.4 90.0 236.13 88.6 228.87 89.0 C225.45 89.1 224.39 92.8 223.98 98.8 ' +
      'Q222.92 113.7 221.7 129.1 Z', 1.05);
    stroke(parent, 'M260.5 81.5 l1.1 2.1 M261.72 80.9 l1.1 2.1', .53);
  }
  const farSide = el('g', { transform: 'translate(9 -4)' }, scene);
  bentArm(farSide);
  paperShape(farSide, 'M258.13 101.8 L260.41 102.1 Q262.13 115.6 267.6 128.6 L265.0 129 Q259.44 115.9 258.13 101.8 Z', .94);
  stroke(farSide, 'M222.6 119.7 Q242 121 262.86 119.7', .86);
  // Solid upholstery and the cane back mask the window mullions behind them.
  paperShape(scene, 'M257.89 102.9 Q260.66 94.1 262.94 80.0 C264.4 69.4 265.6 57.4 271.7 48.3 ' +
    'C278.2 38.4 290.0 36.5 296.9 41.1 C302.0 44.6 302.7 51.1 300.6 58.3 ' +
    'Q294.5 80.4 276.0 98.7 Q269.1 105.9 259.6 107.0 Z', 1.25);
  stroke(scene, 'M259.93 100.7 Q262.45 89.7 265.0 77.8 C266.8 66.8 268.0 56.8 273.9 49.3 ' +
    'C279.2 42.2 288.8 40.1 294.5 43.8 Q300.2 47.4 297.9 56.7 Q292.1 78.9 273.3 97.3', .92);
  stroke(scene, 'M276.2 48 Q284.1 45.2 294.1 46.6 M272.9 53.2 Q284.0 49.4 297.2 51.3 ' +
    'M270.5 59 Q283.1 54.0 296.1 56.7 M268.9 65.0 Q281.7 59.5 294.0 62.5 ' +
    'M267.6 71.0 Q279.7 65.6 290.7 69 M266.2 77.2 Q276.7 73.0 286.4 75.7 ' +
    'M264.7 83.2 Q274.6 80.1 282.1 82 M263.27 89.1 Q270.8 86.6 277.1 88.1 ' +
    'M281.8 44.4 Q276.6 65.9 264.8 90.7 M287.9 43.4 Q282.4 66.1 269.4 90.1 M293.3 45 Q287.8 67.0 274.1 89.4', .59, .66);
  // Near rear leg and a stretcher between the two near legs.
  paperShape(scene, 'M258.05 102.3 L260.41 102.5 C261.23 112.8 265.2 122.4 268.8 129 L266.0 129.1 C262.13 121.1 259.19 112 258.05 102.3 Z', 1.02);
  paperShape(scene, 'M221.46 119.2 Q240.61 119.9 263.27 118.4 L263.84 120.2 Q241.26 121.9 221.29 121.2 Z', .82);
  // Seat rail: the pad sits on this frame, between the two sides of the chair.
  paperShape(scene, 'M221.38 105.9 L259.68 105.7 L268.8 101.4 L268.8 104.1 L260.17 108.2 Q239.47 108.9 221.38 108.3 Z', 1.06);
  const pad = paperShape(scene, '', 1.04);
  const piping = pen(scene, .64);
  const corner = pen(scene, .60);
  let previousDip;
  function cushion(dip) {
    if (dip === previousDip) return;
    previousDip = dip;
    // The welt at the seat front remains firm. The crown under the sitter
    // compresses while the rear seam stays stitched to the side panel.
    pad.setAttribute('d',
      `M219.58 101.8 Q219.58 100.4 221.29 99.6 L226.67 96.2 Q228.06 95.5 230.91 95.7
       C242 95.9 254.71 ${96.5 + .35*dip} 265.5 96.7 Q268.8 96.7 268.6 99.0
       L268.4 101.4 Q268.3 102.6 265.7 103.7 L260.01 106.1 Q258.87 106.7 255.36 106.8
       Q237.92 107.6 221.86 106.8 Q219.26 106.6 219.34 104.0 Z`);
    piping.setAttribute('d',
      `M219.99 101.6 Q221.13 102.6 224.23 102.4 C235.64 102.1 246.72 ${cushionTop+.38*dip} 255.69 ${cushionTop+dip}
       Q258.54 ${cushionTop+dip+.2} 260.74 ${100.2+.76*dip} L266.2 98.2`);
    corner.setAttribute('d', `M259.84 ${100.7+.77*dip} Q260.58 103.7 259.6 105.4 M221.38 102.7 q-.6 1.5 -.1 2.6`);
  }
  const nearSide = el('g', {}, scene);
  bentArm(nearSide);
  // The near back stile and arm meet at the lashings, above the cushion.
  paperShape(nearSide,'M257.4 105.8 Q259.35 99.5 260.82 91.9 Q262.21 84.7 263.19 79.6 L265.3 79.7 Q264.1 87.6 262.78 92.8 Q261.39 100.7 259.52 106.1 Z', .91);
  stroke(nearSide,'M262.61 81.7 l2.6 .5 M262.29 83.0 l2.7 .5 M221.62 107.0 l2.1 .2 M221.46 108.4 l2.1 .2', .52);
  return { nearSide, cushion };
}

function drawFigure(scene, onBrush) {
  const person = el('g', {}, scene);
  const farArm = limb(person, albumInk.armWidth, 1.16);
  const legs = [limb(person, albumInk.legWidth, albumInk.outline), limb(person, albumInk.legWidth, albumInk.outline)];
  const shoes = [blot(person), blot(person)];
  const dress = paperShape(person, '');
  const seams = pen(person, albumInk.detail);
  const portrait = motherPortrait(person);
  const nearArm = limb(person, albumInk.armWidth, albumInk.outline);
  const cuff = pen(person, albumInk.detail);
  const fingers = pen(person, .87);
  // The hit target moves with the figure and is active only during her walk.
  const hit = el('rect', { x: 23, y: 18, width: 42, height: 102, rx: 7,
    fill: 'transparent', class: 'figure-hit', role: 'button',
    'aria-label': '點媽媽撥一下頭髮', tabindex: '-1', visibility: 'hidden'
  }, person);
  hit.addEventListener('click', onBrush);
  hit.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onBrush();
    }
  });
  return function render(pose, playing) {
    const clickable = playing && pose.walking;
    hit.setAttribute('visibility', clickable ? 'visible' : 'hidden');
    hit.setAttribute('tabindex', clickable ? '0' : '-1');
    const { x, direction, drape, width } = pose;
    place(person, x, ground, direction, scale);
    if (width !== 1) {
      person.setAttribute('transform', `translate(${rounded(x)} ${ground}) scale(${rounded(direction * scale * width)} ${scale}) translate(-40 -120)`);
    }
    const [hx, hy] = pose.hip;
    const [sx, sy] = pose.shoulder, [wx, wy] = pose.waist, [rx, ry] = pose.ribs;
    const knee = pose.feet.reduce((a,b) => a.knee[0] > b.knee[0] ? a : b).knee;
    const hemFront = Math.max(50, knee[0]+3);
    const hemY = mix(Math.min(108, hy+24), knee[1]+10, drape);
    const lapY = mix(hy+9, knee[1]-2, drape);
    const rearHem = mix(29, knee[0]-4, drape);
    const hipBottom = hy + mix(9, 4.8, drape);
    for (const [index, foot] of pose.feet.entries()) {
      legs[index].draw([pose.hip, foot.knee, foot.ankle], [.2, .35]);
      shoe(shoes[index], foot.ankle, foot.pitch);
    }
    person.insertBefore(legs[pose.leading].g, dress);
    person.insertBefore(shoes[pose.leading], dress);
    // Follow rib cage, waist and pelvis separately. At contact the lap runs
    // over the thigh, then the fabric falls off the knee in a short free fold.
    dress.setAttribute('d',
      `M${sx-6.5} ${sy+.7} Q${sx-1} ${sy-2.5} ${sx+5.8} ${sy+.3}
       Q${sx+9.1} ${sy+2.5} ${sx+10} ${sy+7.7} L${sx+6.1} ${sy+9.9}
       Q${rx+7.2} ${ry+2} ${wx+5.1+1.1*drape} ${wy}
       C${wx+5.2+1.2*drape} ${wy+4.2} ${hx+6} ${hy-2*drape} ${hx+10-2.3*drape} ${mix(hy+6,hy-1,drape)}
       Q${hemFront-3.8} ${lapY-1.5} ${hemFront} ${mix(hemY-4,lapY+1,drape)}
       Q${hemFront+1.2} ${hemY-4} ${hemFront+.5} ${hemY}
       Q${mix(hx+1,hemFront-3,drape)} ${hemY+2.7} ${rearHem} ${hemY+1}
       C${rearHem+mix(.6,-1.6,drape)} ${mix(hemY-5,lapY+5,drape)} ${mix(hx-9,hx+2,drape)} ${hipBottom+1.4} ${mix(hx-8.3,hx-3.9,drape)} ${hipBottom}
       Q${mix(hx-8.4,hx-9.6,drape)} ${hy+4.2} ${hx-6.9} ${hy-2.3}
       Q${wx-4.4} ${wy+2.4} ${wx-5.5} ${wy-.6}
       Q${rx-8} ${ry+.6} ${sx-7.1} ${sy+8.5} Q${sx-8.1} ${sy+4} ${sx-6.5} ${sy+.7} Z`);
    seams.setAttribute('d',
      `M${wx-4.4} ${wy+.6} Q${wx} ${wy+2} ${wx+4.1} ${wy+.6}
       M${wx+1.2} ${wy+3} Q${hx+1.3} ${hy+4} ${mix(hx-2.2,hemFront-4.2,drape)} ${mix(hemY-3,lapY+2.2,drape)}
       M${hemFront-1.4} ${hemY-1.8} q-1.9 .8 -3.7 .5`);
    const headX = pose.head[0] + 1 - pose.liftHand * 1.65;
    const headY = pose.head[1] - pose.liftHand * 1.1;
    portrait(headX, headY, pose.headAngle);
    const swing = (pose.feet[0].ankle[0] - 40) * pose.pace;
    const armStart = [sx+6.8, sy+7.5];
    const farShoulder = [sx-3.6, sy+5.1];
    const reach = 4 * Math.sin(Math.PI * pose.gather);
    const hand = [mix(sx+10.5-swing*.64, hx+10, pose.gather)+reach,
                  mix(sy+34.5, hy-3.2, pose.gather)];
    // Fold at the elbow so the hand rests on the lap as the chest reclines.
    const elbow = joint(armStart, hand, 14.1, 14.6, -1);
    const farHand = [mix(sx-2+swing*.57, hx+12.6, pose.gather), mix(sy+32, hy-4.6, pose.gather)];
    farArm.draw([farShoulder, joint(farShoulder, farHand, 14, 14, -1), farHand], [.2,.55]);
    const brushElbow = [sx + 21 - pose.sweep * 4, sy - 5];
    const brushHand = [headX + 4.5 - pose.sweep * 8, headY - 4.7];
    const bend = (from, to) => from.map((v, i) => mix(v, to[i], pose.liftHand));
    const wrist = bend(hand, brushHand);
    const mid = bend(elbow, brushElbow);
    nearArm.draw([armStart, mid, wrist], [.2, .5]);
    const dx = wrist[0]-mid[0], dy = wrist[1]-mid[1], length = Math.hypot(dx,dy)||1;
    const ux = dx/length, uy = dy/length;
    fingers.setAttribute('d', `M${wrist[0]-.6*uy} ${wrist[1]+.6*ux} q${2*ux-uy*.3} ${2*uy+ux*.3} ${2.35*ux+uy*.7} ${2.35*uy-ux*.7}`);
    cuff.setAttribute('d', `M${armStart[0]-2.5} ${armStart[1]+2} Q${armStart[0]+.4} ${armStart[1]+3.5} ${armStart[0]+2.5} ${armStart[1]+1.5}`);
  };
}

export function drawWindowScene(container, onBrush) {
  const { drawing: scene } = albumScene(container, '窗邊的媽媽。步行時點媽媽，她會停下來撥髮，再走到藤椅坐下。');
  drawWindow(scene);
  const floor = pen(scene, .82);
  floor.setAttribute('opacity', '.42');
  floor.setAttribute('d', 'M6 130 Q72 129 133 130 T259 130 Q286 129 309 130');
  const chair = drawChair(scene);
  const render = drawFigure(scene, onBrush);
  scene.appendChild(chair.nearSide);
  return (time, brush, playing = false) => {
    const pose = restPoseAt(time, brush);
    chair.cushion(pose.cushionDip);
    render(pose, playing);
  };
}
