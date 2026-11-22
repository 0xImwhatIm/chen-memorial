import { el, paint, limb, shoe, place } from './vendor/ink.js';
import { gait } from './vendor/gait.js';
import { smooth, lerp, clamp } from './vendor/motion.js';
import { stroke } from './album-ink.js?v=5';

const gardenPaper = 'var(--scene-paper)';
const tint = (pigment, amount) => `color-mix(in srgb, var(--scene-paper), ${pigment} ${amount}%)`;
const foliage = tint('var(--muted)', 15);
const petals = tint('#d697a9', 19);
const sweater = tint('#b34461', 63);
const slacks = tint('var(--muted)', 26);
const walk = gait({ period: 1.1, stride: 21, lift: 3.6 });
const startX = 291, endX = 177, ground = 132;
const braking = .6;
export const walkEnd = (startX - endX) / walk.speed + braking / 2;
export const arrival = walkEnd + 1.75;
export const flightDuration = 5.8;
export const selfieDuration = 3.65;

function shape(group, d, color, width = .85) {
  const path = paint(group, color, width);
  path.setAttribute('d', d);
  return path;
}

function position(group, x, y, angle = 0, scale = 1) {
  group.setAttribute('transform', `translate(${x} ${y}) rotate(${angle}) scale(${scale})`);
}

function drawGarden(svg) {
  const bed = el('g', {}, svg);
  const branchInk = el('g', { opacity: .74 }, bed);
  for (const d of [
    'M80 128 C79 113 77 100 61 88 S39 71 39 64 M69 97 Q68 85 66 79 M52 83 Q39 84 31 80',
    'M82 128 Q87 113 88 91 T82 63 M88 96 Q101 85 106 76 M83 116 Q105 103 119 96',
    'M79 126 Q68 114 51 110 Q36 108 24 101 M56 112 Q47 102 44 95 M68 119 Q64 109 65 103',
    'M85 127 Q109 113 119 91 Q127 77 140 65 M118 92 Q116 80 119 71 M129 77 Q139 77 147 74',
    'M90 126 Q113 117 131 115 Q142 113 149 108',
    'M39 125 Q48 113 45 100 Q42 85 25 82 M46 107 Q58 98 56 91',
    'M55 125 Q64 111 58 89 Q53 70 54 57 M58 88 Q46 78 44 72',
    'M110 127 Q104 111 105 92 Q109 70 101 57 M106 85 Q96 75 96 69',
    'M113 125 Q129 111 133 90 Q139 87 145 87'
  ]) stroke(branchInk, d, 1.08);

  function leaf(x, y, rotation, size) {
    const g = el('g', {}, bed);
    position(g, x, y, rotation, size);
    shape(g, 'M0 0 Q2 -5 13 -8 Q10 -1 0 0Z', foliage, .67);
    stroke(g, 'M1 -.4 Q6 -3.4 10 -5.5', .47, .57);
  }
  for (const [x,y,r,s] of [
    [41,72,-95,.84],[45,78,33,.86],[54,83,-95,.8],[61,89,-48,.74],[65,93,164,.8],
    [67,83,-77,.62],[78,107,-104,1],[85,98,36,.84],[85,79,-109,.75],[81,70,-50,.68],
    [91,90,15,.73],[97,85,-49,.86],[111,102,21,.95],[122,88,24,.8],[117,82,-107,.84],
    [130,76,-48,.63],[138,71,27,.72],[141,75,42,.72],[126,82,65,.75],
    [69,118,170,.86],[53,109,141,.86],[45,106,-89,.77],[35,106,145,.79],[32,104,-91,.7],
    [98,121,19,1],[108,119,-36,.88],[129,114,35,.77],[137,113,-40,.81],
    [57,114,135,.8],[79,116,-104,.8],[111,101,-107,.7],[104,108,15,.71],
    [42,119,143,.9],[45,112,-108,.84],[42,92,148,.84],[35,87,-100,.78],
    [57,88,-105,.84],[54,71,14,.72],[53,65,-98,.66],[61,107,25,.83],
    [107,122,-79,.82],[106,107,-113,.77],[105,94,32,.75],[103,67,31,.7],
    [130,106,26,.88],[132,98,-90,.75],[122,117,13,.75],[145,88,24,.8]
  ]) leaf(x,y,r,s);

  // Lobed, funnel-shaped corollas, with a dark throat and a few arching stamens.
  function bloom(x, y, angle, size, side) {
    const g = el('g', {}, bed);
    position(g, x, y, angle, size);
    if (side) {
      shape(g, 'M-2 4 Q-6 1 -7 -4 Q-6 -7 -3 -5 Q-3 -10 0 -8 Q3 -11 4 -7 Q8 -9 8 -5 Q9 -2 5 0 Q1 3 -2 4Z', petals, .75);
      stroke(g, 'M-2 3 Q.5 -1 3 -3 M-1 3 Q-3 -.5 -3 -3', .52);
      return;
    }
    shape(g, 'M0 0 C-4 -.5 -9 -3 -8 -6 Q-7 -9 -4 -7 Q-4 -12 0 -11 Q4 -11 4 -6 Q9 -9 11 -5 Q12 -1 5 1 Q9 6 6 8 Q3 10 0 4 Q-3 9 -6 7 Q-9 5 -6 2 Q-9 1 -7 -1 Q-4 -2 0 0Z', gardenPaper, .8);
    shape(g, 'M-.8 .4 Q-3 -4 -1 -7 Q1 -4 2 .5 Q1 2 -.8 .4Z', petals, .45);
    stroke(g, 'M.4 2 Q2.8 .9 5 -2 M.5 2 Q-.5 -.8 -2 -3 M1 2 Q2 4 4 4.8', .55, .84);
    for (const [cx,cy] of [[5,-2],[-2,-3],[4,4.8]]) el('circle', {cx,cy,r:.62,fill:'currentColor'},g);
  }
  for (const flower of [
    [24,82,-58,.58,1],[32,84,-19,.65,0],[53,58,-14,.7,0],[60,58,25,.58,1],
    [54,90,-12,.67,0],[97,56,-22,.72,0],[104,58,22,.60,1],[99,70,16,.56,1],
    [135,91,-12,.68,0],[143,87,26,.55,1],[27,98,-58,.62,1],[43,94,-76,.72,0],[61,102,18,.74,1],[67,80,-14,.73,0],
    [34,65,-51,.67,1],[43,64,9,.80,0],[79,63,-32,.78,1],[88,62,7,.82,0],
    [108,75,18,.77,0],[119,70,-24,.62,1],[119,96,25,.89,0],
    [144,106,34,.80,1],[138,63,-24,.94,0],[150,65,33,.74,1]
  ]) bloom(...flower);
  return bed;
}

function drawMother(svg) {
  const actor = el('g', {}, svg);
  const legs = [0,1].map(() => ({
    leg: paint(actor,slacks,.84), foot: paint(actor,'var(--hair)',.85)
  }));
  const torso = el('g', {}, actor);
  const farArm = limb(torso, 3.9, .76);
  shape(torso, 'M-5 -32 Q-1 -34 5 -31 Q8 -29 8 -22 Q7 -12 9 -1 Q6 2 0 2 L-9 1 Q-8 -6 -9 -16 Q-11 -25 -8 -29Z', sweater);
  stroke(torso, 'M-7 -4 Q-4 -1 0 -2 M4 -17 Q3 -12 5 -8 M-8 .2 Q0 2 7 .2', .65,.73);
  const head = el('g', {}, torso);
  // Back curls, narrow ivory headband and the round sunglasses in the 1994 photograph.
  shape(head, 'M-7 -5 C-12 -5 -12 0 -10 2 C-13 4 -10 8 -8 8 Q-9 12 -5 11 Q-2 14 1 9 Q5 7 3 2Z','var(--hair)',.86);
  shape(head, 'M-5 -5 Q-4 -12 3 -11 Q9 -10 9 -4 L9 -2 L11 1 Q11 2 8.6 2 Q8.2 7 4 7.8 L3 12 L-3 10 L-2 5 Q-6 3 -5 -5Z',gardenPaper);
  shape(head, 'M-7 1 C-12 -5 -9 -12 -3 -14 Q3 -16 7 -12 Q9 -11 9 -8 Q4 -8 1 -11 Q-1 -7 -4 -5 L-4 .4Z','var(--hair)');
  shape(head, 'M-8 -6 Q-6 -12 1 -14 Q3 -14.3 4 -13.6 Q-2 -13 -6.7 -5.6Z',gardenPaper,.55);
  shape(head, 'M.4 -4.2 Q2 -7.2 5.6 -6 Q8 -5 6.8 -2 Q5.8 .6 3 .1 Q.5 -.5 .4 -4.2Z','var(--hair)',.68);
  shape(head, 'M7 -5.2 Q9 -6.4 10 -5.3 Q11 -3.5 9.1 -1.9 Q7.8 -1.2 7.4 -2.7Z','var(--hair)',.58);
  stroke(head, 'M-4.7 -5.1 L.7 -4 M6.5 -4.3 Q7 -5 7.8 -4.3 M5.5 4.4 Q7.2 5.1 8.5 3.9',.68);
  shape(torso, 'M-5 -33 L-2 -26.6 L.6 -30.5 L4.5 -26 L7 -31.6 L2 -34 L.2 -32Z',gardenPaper,.64);
  const nearArm = limb(torso, 4.1, .82);
  shape(torso, 'M-7 -29 Q-3 -32 .3 -28 Q2 -24 1 -21 L-4.5 -19 Q-8 -23 -7 -29Z',sweater,.8);
  const phone = el('g', {}, torso);
  el('rect',{x:-2.45,y:-6,width:5,height:9,rx:.9,fill:'var(--hair)',stroke:'currentColor','stroke-width':.65},phone);
  el('circle',{cx:.95,cy:-4.6,r:.52,fill:gardenPaper},phone);
  stroke(phone, 'M-1.6 1.5 h2', .44).setAttribute('stroke', gardenPaper);
  const fingers = paint(torso,gardenPaper,.63);
  const glint = stroke(torso,'',.64);
  const hit = el('path',{d:'M27 74 Q23 61 25 44 Q23 30 27 19 Q32 9 45 12 Q57 13 60 28 Q65 43 64 56 L59 73 L55 117 Q45 124 24 119Z',fill:'transparent',class:'figure-hit',tabindex:0,role:'button','aria-label':'點媽媽，讓她拿手機自拍'},actor);
  return {actor,legs,torso,head,farArm,nearArm,phone,fingers,glint,hit};
}

function drawButterflies(svg) {
  return ['#c69356','#af829e','#839fa3'].map((pigment,i) => {
    const insect = el('g', {opacity:0,'pointer-events':'none'},svg);
    const wings = el('g',{},insect);
    for (const direction of [-1,1]) {
      const half = el('g',{transform:`scale(${direction} 1)`},wings);
      shape(half,'M0 -.2 Q2 -4.7 6 -5.8 Q8 -5.6 6.7 -2.4 Q6 -.5 3.4 .3 Q6 1.3 4.6 3.4 Q3.6 4.7 2.3 3.7 L2 5.2 L1.4 3.6 Q.3 2.5 0 -.2Z',tint(pigment,59),.61);
      stroke(half,'M.7 -.4 Q3 -1.3 5.4 -3.7 M1.2 .7 l2.2 1.3',.41,.8);
    }
    stroke(insect,'M0 -1.8 Q-.5 .4 .1 2.9 M0 -1.4 l-1.2 -1.3 M0 -1.4 l1.1 -1.4',.69);
    return {insect,wings,scale:[.96,.75,.65][i]};
  });
}

const flights = [
  [[140,62],[169,37],[128,10],[97,22]],
  [[109,75],[73,40],[144,22],[157,10]],
  [[80,64],[64,35],[51,19],[24,29]]
];
function flightPoint(i, t) {
  const [a,b,c,d] = flights[i], u = 1-t, wave = Math.sin(t*Math.PI);
  const point = a.map((v,k) => u*u*u*v + 3*u*u*t*b[k] + 3*u*t*t*c[k] + t*t*t*d[k]);
  return [point[0]+5*wave*Math.sin(t*12+i),point[1]+6*wave*Math.cos(t*11+i)];
}

function activate(hit, call, pointerArea = hit) {
  pointerArea.addEventListener('click',call);
  hit.addEventListener('keydown',e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!e.repeat) call();
    }
  });
}

export function drawFlowers(container, onSelfie, onFlight) {
  const svg = el('svg',{viewBox:'0 0 320 144',role:'group','aria-label':'媽媽穿著紅上衣走到盛開的花叢旁。可以點媽媽自拍，也可以點花叢讓蝴蝶飛起。'},container);
  stroke(svg,'M12 131.7 Q45 130.9 74 132 T156 132 M166 132.2 Q210 131.4 249 132 T307 132',.68,.37);
  const bed = drawGarden(svg);
  const flowerHit = el('path',{d:'M15 104 Q15 76 25 56 Q36 44 60 62 Q79 40 102 53 L117 61 Q134 42 158 53 Q162 68 154 82 L154 118 Q98 136 40 123Z',fill:'transparent',class:'figure-hit',tabindex:0,role:'button','aria-label':'點花叢，讓蝴蝶飛起'},svg);
  const m = drawMother(svg);
  const butterflies = drawButterflies(svg);
  activate(m.hit,onSelfie,m.actor);
  activate(flowerHit,onFlight);

  return function render({approach,pace,lean,look,reach,pocket,phoneSize,flightTime,still,clock,shutter}) {
    const t = Math.min(approach,walkEnd);
    const brake = clamp((t - walkEnd + braking)/braking,0,1);
    const distanceTime = t - braking*brake*brake/2;
    const steps = walk.pose(distanceTime/walk.period, (1-brake)*pace);
    const walkingSwing = (1-brake)*pace*Math.sin(distanceTime/walk.period*Math.PI*2);
    place(m.actor,startX-distanceTime*walk.speed,ground,-1,1);
    steps.feet.forEach(({ankle,knee,pitch},i) => {
      const [hx,hy] = steps.hip, [kx,ky] = knee, [ax,ay] = ankle;
      m.legs[i].leg.setAttribute('d',
        `M${hx-4.4} ${hy-.7} Q${kx-4.3} ${ky-3} ${kx-3.4} ${ky+2} `+
        `L${ax-2.3} ${ay} Q${ax} ${ay+.8} ${ax+2.6} ${ay} `+
        `L${kx+2.9} ${ky+2} Q${kx+3.9} ${ky-.6} ${hx+4.4} ${hy-.7}Z`);
      shoe(m.legs[i].foot,ankle,pitch);
    });
    const hipY = steps.hip[1]+lean*1.1;
    position(m.torso,40,hipY,lerp(1,34,lean)+walkingSwing*.85);
    position(m.head,1,-39,-11*lean-look*15+3*reach);
    m.farArm.draw([[3,-27],[5+walkingSwing*4,-14],[6+walkingSwing*7+lean*6,-3-lean*3]]);
    const rest = [-2-walkingSwing*6+lean*3,-.4-lean*1.4];
    const wrist = [lerp(lerp(rest[0],-5.2,pocket),24.2,reach),lerp(lerp(rest[1],-2.8,pocket),-34.8,reach)];
    const shoulder = [-3,-25];
    // Keep the elbow on the same side of the forearm arc, including at shoulder height.
    const dx = wrist[0]-shoulder[0], dy = wrist[1]-shoulder[1];
    const length = Math.hypot(dx,dy);
    const bend = Math.sqrt(Math.max(0,15.2**2 - (length/2)**2));
    const elbow = [shoulder[0]+dx/2-dy/length*bend,shoulder[1]+dy/2+dx/length*bend];
    m.nearArm.draw([shoulder,elbow,wrist],[0,0]);
    position(m.phone,wrist[0]+.9,wrist[1]-.7,lerp(12,-8,reach),phoneSize);
    m.fingers.setAttribute('d',`M${wrist[0]-1.65} ${wrist[1]-.8} q1.1 -1.1 2.2 -.6 l1.3 .25 q.9 .7 -.1 1.3 l-1.1 .5 q-1.1 .4 -2 -.15`);
    m.glint.setAttribute('d',`M${wrist[0]+5} ${wrist[1]-8} l2 -1.2 M${wrist[0]+2.9} ${wrist[1]-10} l.6 -1.7`);
    m.glint.setAttribute('opacity',shutter);

    const quiver = flightTime >= 0 && !still ? Math.sin(flightTime*10)*Math.exp(-2.7*flightTime)*1.8 : 0;
    bed.setAttribute('transform',`rotate(${quiver} 83 126)`);
    butterflies.forEach(({insect,wings,scale},i) => {
      if (flightTime < 0) { insect.setAttribute('opacity',0); return; }
      const local = flightTime-i*.29;
      const p = clamp(local/(flightDuration-.65),0,1);
      const [x,y] = flightPoint(i,p);
      const angle = -21 + 35*Math.sin(p*8+i);
      position(insect,x,y,angle,scale);
      wings.setAttribute('transform',`scale(${still ? .88 : .31+.68*Math.abs(Math.cos(clock*10+i))} 1)`);
      insect.setAttribute('opacity',smooth(0,.09,local)*(1-smooth(.82,1,p)));
    });
  };
}
