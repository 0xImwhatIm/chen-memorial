import { drawWindowScene, duration as windowDuration } from './scene.js';
import { drawTreeScene, duration as treeDuration } from './tree.js';

const animations = new Map([
  ['1977-2', { draw: drawWindowScene, duration: windowDuration }],
  ['1978-1f94890846b8-1', { draw: drawTreeScene, duration: treeDuration }],
]);

function mount(link, { draw, duration }) {
  const figure = document.createElement('figure');
  figure.className = 'rest-scene';
  const art = document.createElement('div');
  const replay = document.createElement('button');
  replay.type = 'button';
  replay.textContent = '重播動畫';
  figure.append(art, replay);
  link.after(figure);
  const render = draw(art);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let frame;
  let observer;

  function settle() {
    cancelAnimationFrame(frame);
    render(duration);
    replay.hidden = motion.matches;
  }

  function play() {
    observer?.disconnect();
    cancelAnimationFrame(frame);
    if (motion.matches) return settle();
    const started = performance.now();
    render(0);
    function step(now) {
      const elapsed = (now - started) / 1000;
      if (elapsed >= duration) return settle();
      render(elapsed);
      frame = requestAnimationFrame(step);
    }
    frame = requestAnimationFrame(step);
  }

  function configureMotion() {
    observer?.disconnect();
    settle();
    if (!motion.matches && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) play();
      }, { threshold: .55 });
      observer.observe(figure);
    }
  }

  replay.addEventListener('click', play);
  motion.addEventListener('change', configureMotion);
  configureMotion();
  return () => {
    observer?.disconnect();
    cancelAnimationFrame(frame);
    motion.removeEventListener('change', configureMotion);
    figure.remove();
  };
}

export function bindStoryAnimation(link) {
  let currentId;
  let unmount;
  const sync = () => {
    const photoId = link.dataset.slide;
    if (photoId === currentId) return;
    unmount?.();
    currentId = photoId;
    const animation = animations.get(photoId);
    unmount = animation ? mount(link, animation) : undefined;
  };
  const observer = new MutationObserver(sync);
  observer.observe(link, { attributes: true, attributeFilter: ['data-slide'] });
  sync();
}

for (const link of document.querySelectorAll('#story-chapters .chapter-link')) {
  bindStoryAnimation(link);
}
