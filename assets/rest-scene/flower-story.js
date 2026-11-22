import { drawFlowers, walkEnd, arrival, flightDuration, selfieDuration } from './flowers.js';
import { smooth, lerp } from './vendor/motion.js';

export function mountFlowerStory(link) {
  const figure = document.createElement('figure');
  figure.className = 'rest-scene';
  const art = document.createElement('div');
  art.className = 'rest-scene-art';
  const replay = document.createElement('button');
  replay.type = 'button';
  replay.textContent = '重播動畫';
  const hint = document.createElement('span');
  hint.className = 'rest-scene-hint';
  hint.textContent = '點媽媽自拍，點花叢和她一起看蝴蝶。';
  figure.append(art,replay,hint);
  link.after(figure);

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let still = motion.matches;
  let visible = !('IntersectionObserver' in window);
  let frame = null, previous = null, queuedSelfie = false;
  let action = '', elapsed = 0, clock = 0;
  const pose = {};

  function reset() {
    action = '';
    queuedSelfie = false;
    elapsed = clock = 0;
    Object.assign(pose,{approach:still ? arrival : 0, pace:still ? 0 : 1, lean:still ? 1 : 0,
      look:0,reach:0,pocket:0,phoneSize:0,shutter:0,flightTime:-1});
  }
  function react(next) {
    if (next === 'selfie' && action === 'flight' && !still) {
      queuedSelfie = true;
      return;
    }
    action = next;
    elapsed = 0;
    if (next === 'flight') queuedSelfie = false;
    if (still) paint(0);
    schedule();
  }
  const render = drawFlowers(art,() => react('selfie'),() => react('flight'));

  function paint(dt) {
    elapsed += dt;
    clock += dt;
    if (!still && action && elapsed >= (action === 'flight' ? flightDuration : selfieDuration)) {
      action = queuedSelfie ? 'selfie' : '';
      queuedSelfie = false;
      elapsed = 0;
    }
    const k = still ? 1 : 1-Math.exp(-dt*7);
    const blend = (key,target) => { pose[key] = lerp(pose[key],target,k); };
    blend('pace',action || still ? 0 : 1);
    pose.approach = Math.min(arrival+2,pose.approach + dt*pose.pace);
    const smell = smooth(walkEnd+.12,arrival,pose.approach);
    blend('lean',action ? 0 : smell*(.98+.02*Math.sin(clock*2)));
    const t = still ? 1.85 : elapsed;
    const selfie = action === 'selfie';
    const takeOut = selfie ? smooth(.12,.57,t)*(1-smooth(3.05,3.62,t)) : 0;
    blend('pocket',takeOut);
    blend('reach',selfie ? smooth(.55,1.39,t)*(1-smooth(2.32,3.1,t)) : 0);
    blend('phoneSize',selfie ? smooth(.39,.62,t)*(1-smooth(3.05,3.31,t)) : 0);
    blend('look',action === 'flight' ? .8+.2*Math.sin(t*1.5) : .17*pose.reach);
    pose.shutter = selfie && !still ? smooth(1.77,1.88,t)*(1-smooth(1.96,2.15,t)) : 0;
    pose.flightTime = action === 'flight' ? t : -1;
    render({...pose,still,clock});
  }
  function step(now) {
    frame = null;
    const dt = previous === null ? 0 : Math.min(.5,(now-previous)/1000);
    previous = now;
    paint(dt);
    if (action || pose.approach < arrival+2 || Math.abs(pose.lean-.98)>.025) schedule();
    else previous = null;
  }
  function schedule() {
    if (frame === null && visible && !document.hidden && !still) frame = requestAnimationFrame(step);
  }
  function sync() {
    if (visible && !document.hidden) schedule();
    else {
      cancelAnimationFrame(frame);
      frame = previous = null;
    }
  }
  function onPreferenceChange() {
    still = motion.matches;
    previous = null;
    reset();
    paint(0);
    sync();
  }
  replay.addEventListener('click',() => {
    still = false;
    previous = null;
    reset();
    paint(0);
    schedule();
  });
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }) : null;
  reset();
  paint(0);
  observer?.observe(figure);
  motion.addEventListener('change',onPreferenceChange);
  document.addEventListener('visibilitychange',sync);
  sync();
  return () => {
    cancelAnimationFrame(frame);
    observer?.disconnect();
    motion.removeEventListener('change',onPreferenceChange);
    document.removeEventListener('visibilitychange',sync);
    figure.remove();
  };
}
