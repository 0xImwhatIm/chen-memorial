import { mountFeedingStory } from './feeding-story.js?v=2';
import { mountNavonaStory } from './navona-story.js';
import { mountMountainStory } from './mountain-story.js';
import { mountTatamiStory } from './tatami-story.js?v=2';
import { mountVeniceStory } from './venice-story.js';
import { mountFlowerStory } from './flower-story.js';
import { brushDuringWalk, drawWindowScene, duration as windowDuration } from './scene.js?v=5';
import { drawTreeScene, duration as treeDuration, waveDuration } from './tree.js?v=5';

const windowPhoto = '1977-2';
const treePhoto = '1978-1f94890846b8-1';

function mount(link, isTree) {
  const figure = document.createElement('figure');
  figure.className = 'rest-scene';
  const art = document.createElement('div');
  art.className = 'rest-scene-art';
  const control = document.createElement('button');
  control.type = 'button';
  control.textContent = isTree ? '暫停搖晃' : '播放動畫';
  const hint = document.createElement('span');
  hint.className = 'rest-scene-hint';
  hint.textContent = isTree ? '點一下嬰兒，他會揮手。' : '媽媽走路時，點她一下，她會撥頭髮。';
  figure.append(art, control, hint);
  link.after(figure);

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const canObserve = 'IntersectionObserver' in window;
  let inView = !canObserve;
  let frame = null;
  let played = false;
  let started = null;
  let brush;
  let waveStarted = null;
  let paused = motion.matches;
  let sway = 0;
  let lastSwayFrame = null;

  function requestFrame() {
    if (frame === null && !document.hidden) frame = requestAnimationFrame(step);
  }

  function react() {
    if (isTree) {
      waveStarted = performance.now();
      requestFrame();
    } else if (started !== null && !brush) {
      brush = brushDuringWalk((performance.now() - started) / 1000);
    }
  }
  const render = (isTree ? drawTreeScene : drawWindowScene)(art, react);

  function step(now) {
    frame = null;
    if (isTree) {
      const swaying = inView && !paused;
      if (swaying && lastSwayFrame !== null) {
        sway = (sway + Math.max(0, now - lastSwayFrame) / 1000) % treeDuration;
      }
      lastSwayFrame = swaying ? now : null;
      const wave = waveStarted === null ? undefined : Math.max(0, now - waveStarted) / 1000;
      if (wave >= waveDuration) waveStarted = null;
      render(sway, wave);
      if (swaying || waveStarted !== null) requestFrame();
      return;
    }
    if (started === null) return;
    const end = windowDuration + (brush?.delay ?? 0);
    const elapsed = Math.max(0, (now - started) / 1000);
    const playing = elapsed < end;
    render(Math.min(elapsed, end), brush, playing);
    if (playing) requestFrame();
    else started = null;
  }

  function playWindow() {
    played = true;
    started = performance.now();
    brush = undefined;
    control.textContent = '重播動畫';
    render(0, undefined, true);
    requestFrame();
  }

  function syncPlayback() {
    if (isTree) {
      lastSwayFrame = null;
      if (inView && !paused) requestFrame();
    } else if (inView && !played && !motion.matches && !document.hidden) {
      playWindow();
    } else if (started !== null) {
      requestFrame();
    }
  }

  control.addEventListener('click', () => {
    if (!isTree) {
      playWindow();
      return;
    }
    paused = !paused;
    control.textContent = paused ? '播放搖晃' : '暫停搖晃';
    syncPlayback();
  });
  function onMotionChange() {
    if (isTree) {
      paused = motion.matches;
      control.textContent = paused ? '播放搖晃' : '暫停搖晃';
    } else if (motion.matches) {
      started = null;
      render(windowDuration);
    }
    syncPlayback();
  }
  const observer = canObserve ? new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    syncPlayback();
  }) : null;
  render(isTree ? 0 : windowDuration);
  if (isTree && paused) control.textContent = '播放搖晃';
  observer?.observe(figure);
  motion.addEventListener('change', onMotionChange);
  document.addEventListener('visibilitychange', syncPlayback);
  syncPlayback();

  return () => {
    observer?.disconnect();
    cancelAnimationFrame(frame);
    motion.removeEventListener('change', onMotionChange);
    document.removeEventListener('visibilitychange', syncPlayback);
    figure.remove();
  };
}

export function bindStoryAnimation(link) {
  let currentId;
  let unmount;
  function sync() {
    const photoId = link.dataset.slide;
    if (photoId === currentId) return;
    unmount?.();
    currentId = photoId;
    if (photoId === '1977-47993fd58e71-2') {
      unmount = mountFeedingStory(link);
      return;
    }
    if (photoId === '1993-87562d34659e-2') {
      unmount = mountNavonaStory(link);
      return;
    }
    if (photoId === '1985-3') {
      unmount = mountMountainStory(link);
      return;
    }
    if (photoId === '1981-e1e45c6ca0ee-4') {
      unmount = mountTatamiStory(link);
      return;
    }
    if (photoId === '1993-87562d34659e-1') {
      unmount = mountVeniceStory(link);
      return;
    }
    if (photoId === '1994-68cbecbe39ef-1') {
      unmount = mountFlowerStory(link);
      return;
    }
    unmount = photoId === windowPhoto || photoId === treePhoto
      ? mount(link, photoId === treePhoto) : undefined;
  }
  new MutationObserver(sync).observe(link, { attributes: true, attributeFilter: ['data-slide'] });
  sync();
}

for (const link of document.querySelectorAll('#story-chapters .chapter-link')) {
  bindStoryAnimation(link);
}
