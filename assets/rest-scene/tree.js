import { el, limb, pen, blot } from './vendor/ink.js';
import { minJerk } from './vendor/motion.js';
import { albumInk, albumScene, motherPortrait, stroke, paperShape } from './album-ink.js';

export const duration = 7.2;
export const waveDuration = 2.4;

function drawTree(paper) {
  // Open contours let the paper show between boughs, like sunlight passing through.
  const crown = el('g', {}, paper);
  stroke(crown, 'M12 47 Q15 40 22 39 M18 37 Q17 28 28 26 Q29 18 42 18 M40 16 Q49 8 61 12 Q70 5 82 9 M85 8 Q95 4 104 8 M108 7 Q120 3 133 9 Q146 3 160 12 M165 13 Q173 8 187 13 Q196 11 207 18 M207 17 Q215 14 224 21 Q235 20 242 28 M249 28 Q258 31 259 38 M259 40 Q251 47 239 44 M233 44 Q224 49 216 45 M209 43 Q199 47 190 43 M180 47 Q171 48 167 45 M59 48 Q50 52 44 47 M41 46 Q31 50 25 45 M20 46 l-5 2', 1.04, .81);
  stroke(crown, 'M35 31 q4 -4 9 -3 m-4 4 q5 -2 8 -1 M61 24 q5 -5 11 -4 M69 26 q4 -3 9 -2 M101 17 q5 -2 9 0 M141 24 q3 -4 9 -3 M154 22 q5 -3 9 0 M201 28 q4 -3 9 -2 m-4 4 q5 -1 9 0 M231 35 q3 -2 7 0', albumInk.detail,.81);
  // Broad trunk and the low fork are taken from the original family photograph.
  paperShape(paper,'M75 106 C86 100 92 96 93 85 C94 68 90 56 83 46 Q76 35 58 25 Q55 23 52 21 Q66 24 78 32 Q85 37 91 40 C87 32 82 25 81 15 Q89 30 98 37 Q102 41 105 46 Q107 34 104 22 L99 11 Q106 17 109 24 Q112 28 113 32 Q119 21 127 15 L135 11 Q123 24 120 37 L118 45 C128 41 137 30 147 24 Q158 16 170 16 Q153 24 145 32 Q136 43 130 50 C148 44 162 40 174 32 Q183 26 197 26 C182 31 176 40 163 44 Q152 49 139 53 Q122 60 120 71 C116 83 118 95 122 101 L131 105', 1.2);
  stroke(paper,'M101 94 C104 83 99 68 102 60 M108 74 Q106 62 110 52 M115 62 Q117 55 124 51 M92 50 Q89 46 85 43 M109 101 q4 -3 5 -9 M97 101 l2 -5', albumInk.detail,.77);
  // Fine terminal twigs continue beyond each split and break up the canopy edge.
  stroke(crown,'M52 21 Q47 18 41 18 M57 23.4 q-4 -6.4 -9.5 -8 M81 15 Q77 11.5 75.5 8 M99 11 l-4 -2.8 M135 11 q4.2 -4 8.6 -4.3 M170 16 q3.5 -2.8 9.5 -3.6 M171.5 31.8 q4 -7.4 8.7 -9 M196 26 q7.2 -3.2 13.2 -2.5', .74,.83);
  stroke(crown,'M27 41 q4 -3.6 8.4 -2.1 m-4.1 3.7 q3.6 -1.9 7.2 -1.1 M77 14.9 q4 -4 8.8 -3 M134.1 15.5 q3 -2.4 6.7 -1.8 M176.5 22 q4.3 -2.2 8 -.8 M218 35 q4.8 -3.1 8.5 -1.1', .67,.76);
  return crown;
}

function drawMother(paper) {
  const g = el('g',{},paper);
  // Only the one visible lower leg emerges from the dress.
  const shin = limb(g, 4.0, 1.17);
  shin.draw([[152.5,99],[158.3,111.4],[163,122]], [.25,.65]);
  paperShape(g,'M160.4 120.2 q3.2 .9 4.7 -.7 l1.4 2.4 q-.1 1.5 -3 2 l-7.7 .8 q-2.2 -.5 -1.1 -1.7 l4.9 -1.7Z', .90);
  paperShape(g,'M168 57.6 Q172 55.5 176.9 57 Q185.4 59 186.6 68.5 Q187 77.5 189.6 83.1 Q193.3 94.2 188.1 101.1 Q185.5 104.9 177.4 104.9 L160.5 103.8 Q156.8 102.2 148.1 104.2 Q145.7 100 146.4 96.8 Q147.2 92.8 152.1 90.9 L167.6 85.2 Q166.5 80.2 165.1 75.1 Q163.5 69 163.9 64.5 Q164.2 60.2 168 57.6 Z');
  stroke(g,'M167.5 84.3 q4.9 2.4 11.9 .8 M184.8 90 q-1.5 3.6 -6.6 4.6 M165.2 90.4 Q158.1 93.8 151.7 95.3 M147.9 101.4 q3.9 -1.3 6.5 -.7',albumInk.detail);
  // Same profile and collar as the woman at the window, turned toward her child.
  motherPortrait(g)(170.4,49.3,-11,-1,.85);
  const arm = limb(g,albumInk.armWidth,1.22);
  arm.draw([[173.7,67.4],[169,80.5],[152.6,91.7]],[.15,.65]);
  stroke(g,'M167.1 61 Q173.1 58.7 176.9 66.7 l-4 2.4 M152.2 91.1 l-2.2 1.1', .91);
  return g;
}

export function drawTreeScene(container, onWave) {
  const {svg, drawing} = albumScene(container,'大樹底下，媽媽和嬰兒在樹蔭裡輕晃。點嬰兒，他會舉手揮動。');
  const crown=drawTree(drawing);
  stroke(drawing,'M17 126 Q68 125.2 110 126 M124 126 q52 .6 91 0 M226 126 l63 -.4',.78,.56);
  paperShape(drawing,'M56 104.8 Q119 103 187 104.1 L254 104.7 L253 111 Q171 109.7 57 111.4Z',1.08);
  stroke(drawing,'M67 112 l-.2 11.5 5 .1 .3 -11.6 M235 111.1 l.5 12.6 4.8 .1 -.1 -12.4 M61 107.5 Q107 106.7 134 106.6', .82,.86);
  const child = el('g',{},drawing);
  const farArm = limb(child,2.45,.93);
  paperShape(child,'M118.6 89.5 Q120.1 83.6 125.4 82.8 Q131.2 81.9 134 88.2 L136.1 98.5 Q133.4 102.9 126.1 103.9 Q117.6 104.3 117.5 98.3 Z',1.12);
  paperShape(child,'M124.4 97.7 Q128.9 98.6 131.8 96.8 Q135.2 93.7 138.6 96 Q141.7 99.5 146.1 100.4 Q148.6 100 150.2 101.4 Q150.1 103.3 146.4 103.4 Q141.5 103.1 137.6 100.7 Q135.1 103.4 130.4 103.5',1.01);
  // Clean cheek contour. A slight chin lift and the open smile carry the response.
  const face = el('g',{},child);
  paperShape(face,'M120.8 75.6 C120.4 70.7 123 67 127.7 66.8 C132.5 66.7 135.2 69.9 135.6 74 Q137.1 75.5 136.3 76.6 L135.6 77.1 Q135.2 82.2 130.9 83.3 Q125.9 84.2 123.1 80.6 Q120.5 79 120.8 75.6Z',1.1);
  blot(face).setAttribute('d','M120.7 75.6 Q119.5 70.8 123.5 67.5 Q127.1 64.6 131.6 66.5 Q134.2 67.5 135.1 70.2 Q132.8 68.9 130.4 69.2 Q127.4 71 124.9 70.2 Q124.4 73.3 123 73.5 L122 76Z');
  const mouth = pen(face,.77);
  const nearArm=limb(child,2.85,1.02);
  const mother=drawMother(drawing);
  const hit=el('rect',{x:106,y:57,width:45,height:48,rx:8,fill:'transparent',class:'baby-hit',role:'button',tabindex:'0','aria-label':'讓嬰兒舉手揮動'},svg);
  hit.addEventListener('click',onWave);
  hit.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onWave();}});
  const progress=t=>minJerk(Math.max(0,Math.min(1,t)));
  return (time,waveTime) => {
    const t=waveTime??waveDuration;
    const raise=progress(t/.46)*(1-progress((t-1.84)/.56));
    const wiggle=Math.sin((t-.32)*Math.PI*3.7)*raise;
    const pair=(a,b,u)=>a.map((v,i)=>v+(b[i]-v)*u);
    farArm.draw([[131.3,87.7],pair([135.7,92],[137,81.4],raise),pair([141.5,89.8],[139.3+wiggle*2.3,74.7],raise)],[.2,.5]);
    nearArm.draw([[121.5,88.2],pair([125.8,94.1],[116.5,82],raise),pair([134.1,91.6],[115.7-wiggle*2.8,74.2],raise)],[.2,.55]);
    mouth.setAttribute('d',`M130.8 78.9 q1.5 ${.8+2*raise} 3.1 -.3`);
    face.setAttribute('transform',`rotate(${-4*raise} 128 82)`);
    const s=Math.sin(time/duration*Math.PI*4);
    mother.setAttribute('transform',`rotate(${s*1.7} 181 104)`);
    child.setAttribute('transform',`rotate(${-s*2.9+wiggle*1.9} 127 103)`);
    crown.setAttribute('transform',`rotate(${s*.45} 111 45)`);
  };
}
