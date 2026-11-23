import { el } from './vendor/ink.js';
import { lerp, seeded, smooth, wobble } from './vendor/motion.js';

let sceneNumber = 0;

export function mountVeniceStory(link) {
  const prefix = `venice-${++sceneNumber}-`;
  const figure = document.createElement('figure');
  figure.className = 'rest-scene venice-story';
  const control = document.createElement('button');
  control.type = 'button';
  const hint = document.createElement('span');
  hint.className = 'rest-scene-hint';
  hint.textContent = '點媽媽，看看她和船夫揮手。';
  const scene = el('svg', {
    viewBox: '0 0 1104 534',
    role: 'group',
    'aria-label': '媽媽站在威尼斯橋上，貢多拉緩緩划向遠橋。',
  }, figure);
  figure.append(control, hint);
  link.after(figure);

  const col = name => 'var(--venice-'+name+')';
  const path = (g,d,fill='none',line='ink',sw=1,more={}) => el('path',{
    d,fill:fill==='none'?'none':col(fill),stroke:line==='none'?'none':col(line),'stroke-width':sw,
    'stroke-linecap':'round','stroke-linejoin':'round',...more},g);
  const line = (g,d,w=1,opacity=1) => path(g,d,'none','ink',w,{opacity});
  const group = (g,attrs={}) => el('g',attrs,g);
  const defs = el('defs',{},scene);
  function clip(name,d) {return el('path',{d},el('clipPath',{id: prefix + name},defs));}
  function coords(g,x,y,angle=0,scale=1){g.setAttribute('transform',`translate(${x} ${y}) rotate(${angle}) scale(${scale})`)}
  path(scene,'M0 365 L142 335 L448 297 L595 250 L662 239 L686 236 Q704 233 723 236 L748 243 L801 264 L897 324 L1014 378 L1104 416 V534 H0Z','water','none');
  const ripples = group(scene);
  for(const [x,y,len] of [[783,300,12],[696,310,24],[584,334,36],[746,317,42],[868,342,25],[900,354,29],[681,366,14],[606,375,45],[723,395,47],[979,380,36],[995,412,61],[643,320,12],[720,259,9],[677,277,15],[747,283,10]]) {
    path(ripples,`M${x} ${y}q${len*.4} 1.7 ${len} -.3`,'none','ripple',.7,{opacity:.42});
  }

  // Each façade has its own cornice and windows in the perspective of the canal.
  function facade(ax,ay,aby,bx,by,bby,count,tone,seed) {
    const g=group(scene);const noise=seeded(seed);
    const at=(u,v)=>[lerp(ax,bx,u),lerp(lerp(ay,by,u),lerp(aby,bby,u),v)];
    const pts=(...p)=>p.map(v=>v.map(k=>k.toFixed(2)).join(' ')).join(' L');
    const trace=(...v)=>'M'+pts(...v.map(([u,h])=>at(u,h)));
    path(g,trace([0,0],[1,0],[1,1],[0,1])+'Z',tone,'ink',1);
    line(g,trace([0,.047],[1,.047]),.68,.85);
    line(g,trace([0,.114],[1,.114]),.59,.54);
    line(g,trace([0,.966],[1,.966]),.64,.65);
    for(let row=0;row<3;row++) {
      for(let i=0;i<count;i++) {
        const u=(i+.5)/count, half=(row===2?.19:.165)/count;
        const top=[.34,.615,.866][row]+noise(-.01,.009),bottom=top+[.142,.177,.145][row];
        const end=Math.min(.989,bottom);const sill=row<2;
        path(g,trace([u-half,top],[u+half,top],[u+half,end],[u-half,end])+'Z',i%3===0?'glass':'shade','ink',.66);
        line(g,trace([u-.09/count,top+.004],[u-.09/count,end]),.5,.7);
        if(sill)line(g,trace([u-half-.018/count,end+.012],[u+half+.045/count,end+.012]),.59,.78);
        if(row===1&&i%3===0)path(g,trace([u-half-.035/count,end+.016],[u+half+.045/count,end+.016],[u+half+.045/count,end+.043],[u-half-.035/count,end+.043])+'Z','trim','ink',.55);
      }
    }
    for(let i=0;i<count*2;i++){const u=noise(.02,.97),v=noise(.25,.94);line(g,trace([u,v],[Math.min(.998,u+noise(.006,.031)),v]),.53,.26)}
  }
  facade(0,4,371,142,46,339,2,'house-a',16);
  facade(141,43,345,448,105,304,5,'house-b',22);
  facade(446,100,307,595,171,259,5,'house-a',48);
  facade(593,166,260,661,213,244,4,'house-a',74);
  facade(1104,10,423,1014,49,384,2,'house-a',29);
  facade(1014,48,385,897,108,332,3,'house-a',59);
  facade(897,108,332,801,157,271,3,'house-b',67);
  facade(801,157,272,748,209,247,3,'house-a',94);

  const tower=group(scene,{opacity:.96});
  path(tower,'M727 248 V138 H760 V249Z','house-a','ink',.85);
  path(tower,'M727 136 H760 L763 138 H724Z M732 136 V111 H753 V136Z','house-a','ink',.9);
  path(tower,'M730 111 Q730 105 735 102 Q739 98 742 91 Q745 99 750 102 Q755 104 755 111Z','house-a','ink',.9);
  line(tower,'M743 91 V84 M739 86 H747 M728 150 H759 M728 195 H759',.78);
  for(const x of [731,745])path(tower,`M${x} 177 v-10 q3 -9 7 -1 v11Z`,'hat','ink',.55);
  el('circle',{cx:744,cy:188,r:4.5,fill:'none',stroke:col('ink'),'stroke-width':.7},tower);
  path(scene,'M640 251 Q694 206 762 248 L759 255 Q699 225 644 259Z','bridge','ink',1);
  for(let i=0;i<=6;i++){const x=648+i*17,u=(x-640)/122;const y=251+(248-251)*u-46*u*(1-u)*2;line(scene,`M${x} ${y+1}v4.2`,.63,.8)}
  const boatLayer = group(scene);

  // The curved stone rail is in front of the canal and its boat.
  const crest=x=>332-6*Math.sin(x/1104*Math.PI*2)+157*smooth(.27,1.21,x/1104);
  const curve=(offset)=>Array.from({length:65},(_,i)=>{const x=i*1104/64;return `${i?'L':'M'}${x} ${(crest(x)+offset).toFixed(2)}`}).join(' ');
  path(scene,curve(85)+' L1104 534 H0Z','bridge','ink',1.02);
  for(const [v,w] of [[3,1.05],[10,.76],[18,1.0]])line(scene,curve(v),w,.96);
  for(let i=0;i<29;i++){
   const x=11+i*39.8,y=crest(x),slope=(crest(x+2)-y)/2;
   const p=group(scene,{transform:`matrix(1 ${slope} 0 1 ${x} ${y+18})`});
   path(p,'M-9 0 H9 Q8 5 5 8 L4 11 Q4 14 6 16 L5 57 Q5 61 8 63 L8 67 H-8 L-8 63 Q-5 61 -5 57 L-6 16 Q-4 13 -4 11 L-5 8 Q-8 5 -9 0Z','bridge','ink',.85);
  }
  path(scene,curve(1)+' '+curve(8).replace(/^M/,'L').split('L').slice(1).reverse().map(p=>'L'+p).join(' ')+'Z','bridge','ink',.86);
  line(scene,'M0 448 Q264 422 433 450 T768 534 M0 494 Q305 437 556 533 M47 532 Q260 485 426 505',.65,.31);
  line(scene,'M78 454 l17 -17 M146 496 l23 -22 M224 461 l14 -21 M275 502 l14 -27 M451 485 l12 19 M536 458 l8 19',.66,.33);

  const boat=group(boatLayer);
  const wake=group(boat);
  for(const [x,y,length] of [[-64,8,153],[-43,14,128],[3,18,93],[45,22,73]]){
   path(wake,`M${x} ${y} q${length*.55} 9 ${length} -.4`,'none','ripple',.83,{opacity:.7});
  }
  const hull=group(boat);
  path(hull,'M-99 -33 C-86 -14 -52 -9 -12 -6 C23 -4 60 -4 82 -19 Q89 -24 91 -29 C86 -6 55 8 15 10 C-36 13 -82 -.5 -99 -33Z','hull','boat-line',1.65);
  path(hull,'M-87 -22 Q-55 -7 -10 -4 Q45 1 79 -15 Q60 -2 26 2 Q-37 7 -73 -9Z','hull','boat-trim',.84);
  path(hull,'M-57 -13 Q-63 -22 -56 -23 Q-49 -24 -45 -19 Q-31 -8 -11 -7 L-13 -1 Q-37 -1 -53 -8Z','seat','boat-line',.76);
  path(hull,'M-100 -32 Q-104 -41 -102 -47 L-93 -40 M-102 -42 L-91 -37 M-101 -38 L-92 -34 M-99 -33 L-92 -31','none','boat-line',1.28);
  line(hull,'M76 -16 Q86 -20 89 -30',1.06);
  const boatman=group(boat);
  path(boatman,'M38 -44 Q38 -53 42 -57 L49 -56 Q54 -51 53 -44 L51 -33 L52 -29 L40 -29 Q36 -34 38 -44Z','shirt','boat-line',.96);
  for(let y=-52;y< -31;y+=3.6){const w=y< -47?4:6;path(boatman,`M${45-w} ${y}q${w} 2 ${w*2} 1`,'none','stripe',1.55)}
  path(boatman,'M40 -30 L46 -30 L46 -19 L44 -5 L40 -4 L41 -21Z M46 -30 L51 -30 L52 -20 L57 -6 L53 -4 L47 -18Z','sailor','boat-line',.91);
  path(boatman,'M40 -5 q3 -1 5 -.4 l-.5 2.5 h-6Z M53 -5 h4 l2.7 1.8 -6 .6Z','hull','boat-line',.65);
  path(boatman,'M40 -65 Q42 -70 47 -67 Q51 -66 50 -62 L49 -58 Q47 -55 44 -57 L42 -55 L41 -58 Q38 -59 39 -63Z','skin','boat-line',.78);
  path(boatman,'M38 -66 Q42 -71 48 -68 L50 -66 Q46 -63 39 -64Z','hair','boat-line',.66);
  path(boatman,'M34 -65 Q39 -67 48 -67 L54 -67 Q54 -65 44 -64 Q36 -63 34 -65Z M38 -67 L39 -72 Q43 -73 48 -71 L49 -67Z','hat','boat-line',.84);
  path(boatman,'M39 -68 Q44 -67 48 -68','none','band',1.4);
  const pole=group(boat);
  path(pole,'M-2 -4 L1 -5 L46 53 Q49 56 49 59 Q47 61 45 58 L41 54Z','hat','boat-line',.75);
  const rowArm=path(boatman,'','none','boat-line',2.9);
  const saluteArm=path(boatman,'','none','boat-line',2.7);
  const boatHand=el('ellipse',{cx:0,cy:0,rx:1.9,ry:2.45,fill:col('skin'),stroke:col('boat-line'),'stroke-width':.66},boatman);
  const drip=path(boat,'','none','ripple',.8);

  const woman=group(scene,{class:'figure-hit',role:'button',tabindex:0,'aria-label':'讓媽媽和貢多拉船夫打招呼',transform:'translate(389 494)'});
  el('rect',{x:-65,y:-276,width:132,height:281,rx:30,fill:'transparent'},woman);
  line(woman,'M-43 4 Q-2 7 45 3',1,.32);
  const person=group(woman);
  // Weight rests on the far leg; keep both soles fixed while the fabric moves.
  path(person,'M-19 -69 Q-12 -71 -7 -65 Q-6 -51 -9 -40 Q-13 -26 -15 -8 L-16 -4 L-22 -4 Q-22 -14 -21 -24 Q-20 -36 -22 -45Z','skin','dress-line',1.45);
  path(person,'M3 -69 Q10 -71 13 -65 Q13 -52 11 -43 Q11 -30 18 -9 L18 -5 L12 -4 Q7 -20 2 -31 Q-2 -46 -2 -55Z','skin','dress-line',1.48);
  path(person,'M-22 -7 Q-18 -5 -16 -7 Q-14 -4 -10 -3 Q-7 -2 -8 0 Q-16 1 -24 -.3 Q-24 -4 -22 -7Z M12 -6 Q16 -5 18 -7 Q20 -5 25 -3 Q28 -2 27 .1 Q19 1 11 -.1Z','shoe','dress-line',1.12);
  const skirt=path(person,'','dress','dress-line',1.95);
  const skirtMask=clip('skirt-cut','');
  const print=group(person,{'clip-path':`url(#${prefix}skirt-cut)`});
  const blooms=group(print);
  function flower(g,x,y,size,r,kind){
    const b=group(g,{transform:`translate(${x} ${y}) rotate(${r}) scale(${size})`});
    for(let i=0;i<5;i++)el('ellipse',{cx:.25,cy:-2.1,rx:1.16,ry:1.85,transform:`rotate(${i*72})`,fill:col(kind)},b);
    el('circle',{r:.75,fill:col('hat')},b);
    path(b,'M3 3 Q5 1 6.5 1.7 Q5.5 4.2 3 3Z','leaf','none');
  }
  const random=seeded(1993);
  for(let j=0;j<7;j++){for(let i=0;i<5;i++){flower(blooms,-53+i*18+random(-5,5),-133+j*15+random(-4,4),random(.64,1.07),random(-35,45),(i+j)%4?'petal':'rose')}}
  const folds=[0,1,2].map(()=>path(person,'','none','dress-line',1,{opacity:.57}));
  const bodice=path(person,'M-9 -198 Q-16 -198 -22 -191 Q-26 -185 -27 -176 L-18 -171 Q-17 -156 -19 -144 Q-18 -137 -15 -133 Q-4 -130 11 -135 L13 -143 Q8 -155 14 -165 Q22 -169 19 -179 Q17 -192 7 -196 L3 -199Z','dress','dress-line',1.85);
  clip('bodice-cut',bodice.getAttribute('d'));
  const bodicePrint=group(person,{'clip-path':`url(#${prefix}bodice-cut)`});
  for(const [x,y,z] of [[-20,-188,.72],[6,-187,.86],[-2,-171,.85],[-18,-160,.78],[12,-154,.75],[-9,-144,.85]])flower(bodicePrint,x,y,z,15,y%2?'petal':'rose');
  path(person,'M-17 -140 Q-6 -138 11 -142 L11 -138 Q-6 -134 -17 -136Z','band','dress-line',.78);
  const head=group(person);
  path(head,'M-20 -233 Q-19 -246 -7 -248 Q8 -249 14 -238 Q18 -230 11 -218 Q5 -211 1 -202 L-7 -201 Q-13 -197 -17 -201 Q-23 -199 -26 -205 Q-30 -210 -24 -217 Q-30 -226 -22 -230Z','hair','dress-line',1.55);
  path(head,'M-11 -232 Q-9 -241 -.3 -240 Q9 -240 12 -230 Q13 -225 17 -221 Q17 -220 13 -219 Q13 -212 8 -210 L5 -209 L6 -199 Q7 -196 10 -194 Q9 -189 4 -188 Q-2 -190 -9 -195 L-7 -202 L-8 -211 Q-13 -214 -13 -219 Q-18 -218 -17 -225 Q-15 -227 -12 -224Z','skin','dress-line',1.38);
  path(head,'M-11 -231 Q-5 -241 3 -238 Q7 -234 13 -233 L10 -239 Q-4 -249 -15 -237 L-18 -222 L-14 -220Z','hair','dress-line',1.13);
  path(head,'M-9 -229 Q-3 -232 2 -230 Q5 -227 2 -224 Q-.5 -221 -5 -223 Q-8 -224 -9 -229Z M5 -230 Q9 -232 12 -230 Q14 -229 12 -226 Q10 -223 7.5 -224 Q5 -225 5 -230Z','hair','dress-line',1.05);
  line(head,'M2 -229 Q4 -230 5 -229 M-9 -228 L-14 -230 M7 -214 Q10 -213 12 -215',.93);
  const hat=group(head);
  const brim=path(hat,'','hat','dress-line',1.68);
  path(hat,'M-23 -240 Q-23 -249 -17 -258 Q-11 -268 -.5 -268 Q13 -269 18 -253 L20 -241 Q4 -235 -23 -240Z','hat','dress-line',1.45);
  path(hat,'M-23 -244 Q-3 -240 18 -249 L20 -243 Q.5 -236 -23 -239Z','band','dress-line',.82);
  path(hat,'M-17 -250 Q-12 -256 -9 -258 M-12 -250 Q-9 -253 -7 -254','none','dress-line',.65,{opacity:.46});
  const ribbon=path(hat,'','band','dress-line',.84);
  const brimStitch=path(hat,'','none','dress-line',.71,{opacity:.62});
  const backArm=path(person,'M-22 -181 Q-29 -167 -29 -157 Q-28 -151 -20 -147 L-2 -140 Q3 -138 5 -141 Q5 -143 1 -145 L-14 -151 Q-20 -154 -21 -157 Q-22 -165 -15 -176Z','skin','dress-line',1.47);
  path(person,'M-4 -142 L3 -155 L17 -152 L11 -137Z','trim','dress-line',1.0);
  line(person,'M4 -151 l9 2 M2 -148 l8 2',.64,.6);
  const upper=path(person,'','skin','dress-line',1.42);
  const palm=group(person);
  path(palm,'M-2.8 1.8 Q-4 -.4 -4.2 -3.2 L-5 -6 Q-5.1 -7 -4.2 -7.2 L-2.6 -5.2 L-3 -10 Q-2.9 -11 -2.1 -10.7 L-.9 -6.9 L-.6 -11.5 Q-.4 -12.3 .4 -11.9 L.8 -7.3 L1.6 -10.5 Q2 -11.2 2.6 -10.6 L2.3 -6.1 L3.6 -8.5 Q4.1 -9 4.7 -8.4 L3.3 -3.6 Q3 -1.4 2.5 1.8Z','skin','dress-line',.94);
  path(person,'M6 -192 Q13 -193 18 -185 L21 -177 L14 -173 Q8 -178 7 -183Z','dress','dress-line',1.33);
  flower(person,14,-183,.62,28,'petal');

  const ribbonWind=t=>wobble(t,.94)+.20*Math.sin(2.53*t+.8);
  const voyage=40;
  function draw(t,waveTime,holdPose=false){
    const wind=ribbonWind(t);
    const hemWind=ribbonWind(t-.52);
    const hem=6.6*hemWind+1.3*Math.sin(3*t+.5);
    const left=-53+hem,right=27+hem*.60,bottom=-45+hemWind*2;
    const dressPath=`M-17 -138 Q-7 -134 11 -139 C13 -114 ${right-5} -76 ${right} ${bottom-5} Q${right-5} ${bottom+1} ${right-12} ${bottom-1} Q4 ${bottom+8} -6 ${bottom+3} Q-13 ${bottom+1} -20 ${bottom+5} Q-28 ${bottom+9} -36 ${bottom+5} Q${left+6} ${bottom+4} ${left} ${bottom-.6} C${left+12} -69 -25 -110 -17 -138Z`;
    skirt.setAttribute('d',dressPath);skirtMask.setAttribute('d',dressPath);
    const shear=(hem-4)/100;
    blooms.setAttribute('transform',`matrix(1 0 ${shear} 1 ${shear*138} 0)`);
    folds[0].setAttribute('d',`M-10 -125 Q-15 -94 ${-33+hem*.82} ${bottom+.9}`);
    folds[1].setAttribute('d',`M1 -127 Q1 -102 ${-12+hem*.67} ${bottom-1.6}`);
    folds[2].setAttribute('d',`M8 -122 Q9 -98 ${14+hem*.62} ${bottom-4.6}`);
    const h=2.9*ribbonWind(t+.18);
    hat.setAttribute('transform',`rotate(${1.7*wind} 0 -238)`);
    brim.setAttribute('d',`M-23 -242 Q-36 -239 ${-43-wind} ${-232+h} Q-46 ${-228+h} -32 ${-229+h*.78} Q-11 -232 16 -238 Q33 -240 38 ${-243-h*.65} Q39 ${-247-h*.53} 30 -247 Q9 -246 -23 -242Z`);
    brimStitch.setAttribute('d',`M-37 ${-232+h*.8} Q-27 ${-231+h*.50} -12 -235 M22 -241 Q32 -242 35 ${-245-h*.6}`);
    const ribbonTip=6.4*ribbonWind(t-.30);
    ribbon.setAttribute('d',`M-21 -241 Q-31 ${-239+ribbonTip*.32} -38 ${-235+ribbonTip*.7} Q-47 ${-230+ribbonTip} -53 ${-232+ribbonTip} Q-47 ${-227+ribbonTip} -38 ${-231+ribbonTip*.8} Q-28 -236 -19 -238Z`);

    // A greeting travels from the near bridge to the man at the stern a beat later.
    const greeting=(start,end)=>waveTime<0?0:smooth(start,start+.56,waveTime)*(1-smooth(end,end+.56,waveTime));
    const raise=holdPose?1:greeting(0,2.4);
    const reply=holdPose?1:greeting(.87,3.12);
    const oscillation=holdPose?0:Math.sin((waveTime-.48)*Math.PI*2*1.38);
    head.setAttribute('transform',`rotate(${1.4*raise} -4 -197)`);
    const sx=14,sy=-181;
    const rad=Math.PI/180;
    const shoulderAngle=lerp(29,80,raise)*rad;
    const forearmAngle=(lerp(-62,-197,raise)+4*oscillation*raise)*rad;
    const ex=sx+24.2*Math.sin(shoulderAngle),ey=sy+24.2*Math.cos(shoulderAngle);
    const wx=ex+24*Math.sin(forearmAngle),wy=ey+24*Math.cos(forearmAngle);
    // Sleeve to wrist, with a small inside elbow and a taper at the wrist.
    const nx=-(ey-sy)/Math.hypot(ex-sx,ey-sy),ny=(ex-sx)/Math.hypot(ex-sx,ey-sy);
    const fx=-(wy-ey)/Math.hypot(wx-ex,wy-ey),fy=(wx-ex)/Math.hypot(wx-ex,wy-ey);
    upper.setAttribute('d',`M${sx+nx*4.2} ${sy+ny*4.2} Q${(sx+ex)/2+nx*4} ${(sy+ey)/2+ny*4} ${ex+(nx+fx)*1.7} ${ey+(ny+fy)*1.7} Q${(ex+wx)/2+fx*3.3} ${(ey+wy)/2+fy*3.3} ${wx+fx*2.3} ${wy+fy*2.3} L${wx-fx*2.3} ${wy-fy*2.3} Q${(ex+wx)/2-fx*3.4} ${(ey+wy)/2-fy*3.4} ${ex-(nx+fx)*2.2} ${ey-(ny+fy)*2.2} Q${(sx+ex)/2-nx*4.3} ${(sy+ey)/2-ny*4.3} ${sx-nx*4.2} ${sy-ny*4.2}Z`);
    coords(palm,wx,wy,lerp(-70,12+oscillation*15,raise),.91);
    const p=(t%voyage)/voyage;
    const depth=1-(1-p)/(1+.48*p);
    const scale=lerp(1.04,.095,depth);
    const phase=t*1.82;
    const bx=lerp(875,702,depth)+19*Math.sin(Math.PI*depth);
    const by=lerp(401,244,depth)+.9*Math.sin(phase-.22)*scale;
    boat.setAttribute('transform',`translate(${bx} ${by}) rotate(${4+depth*7+.42*Math.sin(phase)}) scale(${scale*(1-depth*.19)} ${scale})`);
    // Dissolve only beyond the far arch, then re-enter on a new downstream pass.
    const entry=t<voyage?1:smooth(0,.057,p);
    boat.setAttribute('opacity',entry*(1-smooth(.91,.99,p)));
    const rowing=Math.sin(phase), bladeAngle=lerp(-12,15,(rowing+1)/2);
    const grip=[48+2.6*rowing,-39-1.65*Math.cos(phase)];
    coords(pole,grip[0],grip[1],bladeAngle);
    rowArm.setAttribute('d',`M49 -51 Q55 -48 ${grip[0]} ${grip[1]}`);
    const saluteX=lerp(grip[0]-4,28+2*oscillation,reply),saluteY=lerp(grip[1]-3,-66,reply);
    saluteArm.setAttribute('d',`M41 -51 Q${lerp(35,32,reply)} ${lerp(-42,-49,reply)} ${saluteX} ${saluteY}`);
    coords(boatHand,saluteX,saluteY,-20*reply);
    const a=bladeAngle*Math.PI/180, px=grip[0]+46*Math.cos(a)-57*Math.sin(a), py=grip[1]+46*Math.sin(a)+57*Math.cos(a);
    drip.setAttribute('d',`M${px-7} ${py+2}q5 3 13 -.3 m-14 3.6 q6 2.4 14 -.4`);
    drip.setAttribute('opacity',smooth(.08,.77,Math.cos(phase-.52))*.78);
    wake.setAttribute('opacity',.65+.15*Math.sin(phase));
  }

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let running = !motion.matches;
  let visible = !('IntersectionObserver' in window);
  let time = 0;
  let wave = -1;
  let stationaryGreeting = false;
  let frame = null;
  let previous = null;

  function updateControl() {
    control.textContent = running ? '暫停動畫' : '播放動畫';
  }
  function schedule() {
    if (running && visible && !document.hidden && frame === null) {
      frame = requestAnimationFrame(step);
    }
  }
  function step(now) {
    frame = null;
    const delta = previous === null ? 0 : (now - previous) / 1000;
    previous = now;
    time += delta;
    if (wave >= 0) {
      wave += delta;
      if (wave >= 3.8) wave = -1;
    }
    draw(time, wave);
    schedule();
  }
  function sync() {
    if (running && visible && !document.hidden) {
      schedule();
    } else {
      cancelAnimationFrame(frame);
      frame = previous = null;
    }
  }
  function setRunning(next) {
    running = next;
    if (running && stationaryGreeting) {
      stationaryGreeting = false;
      wave = 0;
      draw(time, wave);
    }
    updateControl();
    sync();
  }
  function greet() {
    if (running) {
      wave = 0;
    } else {
      stationaryGreeting = !stationaryGreeting;
      wave = -1;
    }
    draw(time, wave, stationaryGreeting);
  }
  function onMotionChange(event) {
    setRunning(!event.matches);
  }
  woman.addEventListener('click', greet);
  woman.addEventListener('keydown', event => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (!event.repeat) greet();
    }
  });
  control.addEventListener('click', () => setRunning(!running));
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }) : null;
  observer?.observe(figure);
  motion.addEventListener('change', onMotionChange);
  document.addEventListener('visibilitychange', sync);
  updateControl();
  draw(time, wave);
  schedule();

  return () => {
    cancelAnimationFrame(frame);
    observer?.disconnect();
    motion.removeEventListener('change', onMotionChange);
    document.removeEventListener('visibilitychange', sync);
    figure.remove();
  };
}
