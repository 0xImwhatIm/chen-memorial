// lib/style.ts
var LINE_ART = Object.freeze({
  pen: 1.35,
  paper: "#fdfdfc",
  ink: "#1c1c1c",
  page: "#ebe8e2",
  cardPaper: "#fdfcf8",
  aspect: 2,
  radius: 16,
  filter: Object.freeze({ frequency: 0.6, displacement: 0.45, blur: 0.12, seed: 7 })
});
var PARK_PALETTE = Object.freeze({
  ink: "#30362f",
  paper: LINE_ART.cardPaper,
  shirt: "#b3c3bb",
  shorts: "#64717a",
  lead: "#987248",
  dogBlack: "#30312e",
  dogTan: "#b47c47",
  foliage: "#e2e8d6"
});

// lib/ink.ts
var NS = "http://www.w3.org/2000/svg";
var INK = "currentColor";
var PAPER = LINE_ART.paper;
var INK_DAY = LINE_ART.ink;
var PEN = LINE_ART.pen;
function el(tag, attrs = {}, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, String(attrs[k]));
  if (attrs.fill === PAPER) n.classList.add("pp");
  if (parent) parent.appendChild(n);
  return n;
}
var f = (n) => n.toFixed(2);
var pt = (p) => `${f(p[0])} ${f(p[1])}`;
var pen = (parent, w = PEN) => el("path", { fill: "none", stroke: INK, "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round" }, parent);
var paint = (parent, colour, w = PEN) => el("path", { fill: colour, stroke: INK, "stroke-width": w, "stroke-linejoin": "round", "stroke-linecap": "round" }, parent);
function limb(parent, width, w = PEN) {
  const g = el("g", {}, parent);
  const fill = el("path", { fill: PAPER }, g);
  const a = pen(g, w), b = pen(g, w);
  const half = (width - w) / 2;
  return {
    g,
    draw(joints, endGap = [0.4, 0.9]) {
      const s = joints[0], e = joints[joints.length - 1];
      let c = [(s[0] + e[0]) / 2, (s[1] + e[1]) / 2];
      if (joints.length === 3) {
        const m = joints[1];
        c = [m[0] + 0.55 * (m[0] - c[0]), m[1] + 0.55 * (m[1] - c[1])];
      }
      const P = [];
      for (let i = 0; i <= 16; i++) {
        const t = i / 16, u = 1 - t;
        P.push([u * u * s[0] + 2 * u * t * c[0] + t * t * e[0], u * u * s[1] + 2 * u * t * c[1] + t * t * e[1]]);
      }
      const side = (sgn) => P.map((p, i) => {
        const q = P[Math.min(P.length - 1, i + 1)], o = P[Math.max(0, i - 1)];
        const dx = q[0] - o[0], dy = q[1] - o[1], l = Math.hypot(dx, dy) || 1;
        return [p[0] - dy / l * half * sgn, p[1] + dx / l * half * sgn];
      });
      const L = side(1), R = side(-1);
      fill.setAttribute("d", "M" + L.map(pt).join("L") + "L" + R.slice().reverse().map(pt).join("L") + "Z");
      const cut = (arr, gap) => arr.slice(0, arr.length - Math.round(gap * 2));
      a.setAttribute("d", "M" + cut(L, endGap[0]).map(pt).join("L"));
      b.setAttribute("d", "M" + cut(R, endGap[1]).map(pt).join("L"));
    }
  };
}
function solid(l, colour = INK) {
  const n = l.g.querySelector("path");
  if (n) {
    n.classList.remove("pp");
    n.setAttribute("fill", colour);
  }
  return l;
}
function curve(keys, period) {
  return (x) => {
    x = (x % period + period) % period;
    const n = keys.length;
    let i = n - 1;
    for (let j = 0; j < n; j++) if (keys[j][0] <= x) i = j;
    const k = (j) => {
      const w = Math.floor(j / n);
      const e = keys[(j % n + n) % n];
      return [e[0] + w * period, e[1]];
    };
    const p0 = k(i - 1), p1 = k(i), p2 = k(i + 1), p3 = k(i + 2);
    const span = p2[0] - p1[0];
    const u = (x - p1[0]) / span;
    const m1 = (p2[1] - p0[1]) / (p2[0] - p0[0]) * span;
    const m2 = (p3[1] - p1[1]) / (p3[0] - p1[0]) * span;
    const u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * p1[1] + (u3 - 2 * u2 + u) * m1 + (-2 * u3 + 3 * u2) * p2[1] + (u3 - u2) * m2;
  };
}
function inkDefs(svg, id = "ink") {
  if (!svg.style.color) svg.style.color = INK_DAY;
  const defs = el("defs", {}, svg);
  const flt = el("filter", { id: `${id}-edge`, x: "-2%", y: "-2%", width: "104%", height: "104%" }, defs);
  el("feTurbulence", { type: "fractalNoise", baseFrequency: LINE_ART.filter.frequency, numOctaves: 1, seed: LINE_ART.filter.seed, result: "n" }, flt);
  el("feDisplacementMap", { in: "SourceGraphic", in2: "n", scale: LINE_ART.filter.displacement, xChannelSelector: "R", yChannelSelector: "G", result: "d" }, flt);
  el("feGaussianBlur", { in: "d", stdDeviation: LINE_ART.filter.blur }, flt);
  const stripes = el("pattern", { id: `${id}-stripes`, width: 4, height: 2.2, patternUnits: "userSpaceOnUse", patternTransform: "rotate(-12)" }, defs);
  el("rect", { width: 4, height: 2.2, fill: PAPER }, stripes);
  el("rect", { width: 4, height: 1, fill: INK }, stripes);
  return { defs, filter: `url(#${id}-edge)`, stripes: `url(#${id}-stripes)` };
}

// lib/motion.ts
var clamp = (x, a, b) => Math.max(a, Math.min(b, x));
var smooth = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};
var ease = (t) => smooth(0, 1, t);

// lib/reaction.ts
function createReaction(timing) {
  const { enter, hold, exit } = timing;
  if (![enter, hold, exit].every((n) => Number.isFinite(n) && n >= 0) || enter + hold + exit <= 0)
    throw new RangeError("Reaction durations must be finite, nonnegative, and have a positive total.");
  const duration = enter + hold + exit;
  let elapsed = -1;
  const state = () => {
    if (elapsed < 0) return { phase: "idle", amount: 0, elapsed: 0, busy: false };
    if (elapsed < enter) return { phase: "enter", amount: ease(elapsed / enter), elapsed, busy: true };
    if (elapsed < enter + hold) return { phase: "hold", amount: 1, elapsed, busy: true };
    return { phase: "exit", amount: 1 - ease((elapsed - enter - hold) / exit), elapsed, busy: true };
  };
  return {
    duration,
    state,
    trigger() {
      if (elapsed >= 0) return false;
      elapsed = 0;
      return true;
    },
    step(dt) {
      if (!Number.isFinite(dt) || dt < 0) throw new RangeError("dt must be finite and nonnegative.");
      if (elapsed >= 0) {
        elapsed += dt;
        if (elapsed + 1e-9 >= duration) elapsed = -1;
      }
      return state();
    },
    cancel() {
      elapsed = -1;
    }
  };
}
function bindReaction(target, reaction, options) {
  const attributeNames = ["role", "tabindex", "aria-label", "aria-disabled", "data-reaction"];
  const previousAttributes = attributeNames.map((name) => [name, target.getAttribute(name)]);
  const previousCursor = target.style.cursor;
  const hadClass = target.classList.contains("reaction-target");
  target.setAttribute("role", "button");
  target.setAttribute("tabindex", "0");
  target.setAttribute("aria-label", options.label);
  target.classList.add("reaction-target");
  target.style.cursor = "pointer";
  const title = el("title", {}, target);
  title.textContent = options.label;
  const hit = el("rect", { ...options.hitBox, rx: 5, fill: "transparent", "pointer-events": "all", "data-hit-area": "" }, target);
  const focus = el("rect", { ...options.hitBox, rx: 5, fill: "none", stroke: "currentColor", "stroke-width": 1.2, "stroke-dasharray": "4 4", "pointer-events": "none", class: "reaction-focus" }, target);
  const sync = () => {
    const state = reaction.state();
    target.setAttribute("data-reaction", state.phase);
    target.setAttribute("aria-disabled", String(state.busy));
  };
  const activate = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (reaction.trigger()) {
      sync();
      options.wake?.();
    }
  };
  const pointer = (event) => {
    if (event.isPrimary && event.button === 0) activate(event);
  };
  const key = (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    event.stopPropagation();
    if (!event.repeat) activate(event);
  };
  const click = (event) => {
    if (event.detail === 0) activate(event);
  };
  target.addEventListener("pointerdown", pointer);
  target.addEventListener("keydown", key);
  target.addEventListener("click", click);
  sync();
  return { sync, hit, dispose() {
    target.removeEventListener("pointerdown", pointer);
    target.removeEventListener("keydown", key);
    target.removeEventListener("click", click);
    hit.remove();
    focus.remove();
    title.remove();
    for (const [name, value] of previousAttributes) {
      if (value === null) target.removeAttribute(name);
      else target.setAttribute(name, value);
    }
    if (!hadClass) target.classList.remove("reaction-target");
    target.style.cursor = previousCursor;
  } };
}

// lib/scene.ts
function runScene(draw) {
  const q = new URLSearchParams(location.search);
  const debug = q.has("debug"), frozen = !debug && q.has("t");
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  let reducedMotion = q.get("motion") === "reduce" || preference.matches;
  const STEP = 1 / 60;
  let time = 0, remainder = 0, raf = 0, previous = null, disposed = false;
  let active = draw({ t: time, dt: 0, reducedMotion });
  const advance = (seconds = 1) => {
    if (!Number.isFinite(seconds) || seconds < 0) throw new RangeError("Step must be finite and nonnegative.");
    remainder += seconds;
    while (remainder + 1e-9 >= STEP) {
      remainder = Math.max(0, remainder - STEP);
      time += STEP;
      active = draw({ t: time, dt: STEP, reducedMotion });
    }
    return time;
  };
  const tick = (now) => {
    raf = 0;
    advance(previous === null ? STEP : Math.max(0, Math.min(0.05, (now - previous) / 1e3)));
    previous = now;
    if (!reducedMotion || active) raf = requestAnimationFrame(tick);
    else previous = null;
  };
  const wake = () => {
    if (disposed || frozen) return;
    active = draw({ t: time, dt: 0, reducedMotion });
    if (!debug && !raf) {
      previous = null;
      raf = requestAnimationFrame(tick);
    }
  };
  const changed = () => {
    reducedMotion = q.get("motion") === "reduce" || preference.matches;
    wake();
  };
  preference.addEventListener("change", changed);
  if (debug) window.__step = advance;
  else if (frozen) advance(Number(q.get("t")));
  else if (!reducedMotion || active) raf = requestAnimationFrame(tick);
  return { wake, dispose() {
    disposed = true;
    cancelAnimationFrame(raf);
    preference.removeEventListener("change", changed);
    if (debug && window.__step === advance) delete window.__step;
  } };
}

// examples/feeding/feeding-audio.ts
function createFeedingSound() {
  let context;
  let output;
  let enabled = false;
  function play(tone) {
    if (!enabled || context?.state !== "running" || !output) return;
    const now = context.currentTime + 8e-3;
    const end = now + tone.duration;
    const voice = context.createOscillator();
    const envelope = context.createGain();
    if (tone.color === "hum" || tone.color === "laugh") {
      const harmonics = tone.color === "hum" ? [0, 1, 0.36, 0.13, 0.04, 0.025] : [0, 1, 0.47, 0.24, 0.11, 0.08, 0.03];
      voice.setPeriodicWave(context.createPeriodicWave(
        new Float32Array(harmonics.length),
        Float32Array.from(harmonics)
      ));
    } else {
      voice.type = tone.color === "burp" ? "triangle" : "sine";
    }
    voice.frequency.setValueAtTime(tone.from, now);
    voice.frequency.exponentialRampToValueAtTime(tone.peak, now + tone.duration * 0.28);
    voice.frequency.exponentialRampToValueAtTime(tone.to, end);
    const soft = tone.color === "hum";
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(tone.volume, now + (soft ? 0.085 : 0.018));
    envelope.gain.exponentialRampToValueAtTime(1e-4, end);
    voice.connect(envelope).connect(output);
    if (tone.color === "burp") {
      const flutter = context.createOscillator();
      const depth = context.createGain();
      flutter.frequency.value = 29;
      depth.gain.setValueAtTime(6, now);
      depth.gain.linearRampToValueAtTime(0, end);
      flutter.connect(depth).connect(voice.frequency);
      flutter.start(now);
      flutter.stop(end);
    }
    voice.start(now);
    voice.stop(end);
  }
  return {
    get enabled() {
      return enabled;
    },
    async toggle() {
      if (enabled && context && output) {
        enabled = false;
        output.gain.setTargetAtTime(0, context.currentTime, 0.025);
        return false;
      }
      if (!context) {
        context = new AudioContext();
        output = context.createGain();
        output.gain.value = 0;
        output.connect(context.destination);
      }
      await context.resume();
      if (context.state !== "running" || !output) return false;
      enabled = true;
      output.gain.setTargetAtTime(0.68, context.currentTime, 0.04);
      return true;
    },
    hum(frequency, duration) {
      play({
        from: frequency * 0.992,
        peak: frequency * 1.007,
        to: frequency * 0.983,
        duration,
        volume: 0.092,
        color: "hum"
      });
    },
    gulp(pitch) {
      play({ from: pitch, peak: pitch * 1.12, to: pitch * 0.43, duration: 0.145, volume: 0.055, color: "gulp" });
    },
    burp() {
      play({ from: 168, peak: 190, to: 79, duration: 0.3, volume: 0.095, color: "burp" });
    },
    laugh(pitch) {
      play({ from: pitch * 0.89, peak: pitch, to: pitch * 0.76, duration: 0.185, volume: 0.088, color: "laugh" });
    },
    dispose() {
      enabled = false;
      if (context && context.state !== "closed") void context.close();
    }
  };
}

// examples/feeding/feeding.ts
var cycle = 5.6;
var rock = curve([[0, 0], [1.55, -2.1], [3.1, 0], [4.55, 2.05]], cycle);
var hum = [
  { at: 0.06, pitch: 261.63, length: 0.66 },
  { at: 0.78, pitch: 293.66, length: 0.48 },
  { at: 1.37, pitch: 329.63, length: 0.72 },
  { at: 2.21, pitch: 293.66, length: 0.63 },
  { at: 3.11, pitch: 261.63, length: 0.55 },
  { at: 3.85, pitch: 246.94, length: 0.55 },
  { at: 4.54, pitch: 261.63, length: 0.77 }
];
var gulps = [1.14, 2.78, 4.1, 5.04];
var chuckles = [{ at: 1.1, pitch: 459 }, { at: 1.34, pitch: 429 }, { at: 1.59, pitch: 395 }];
var burpAt = 0.57;
var pulse = (t, start, attack, length) => smooth(start, start + attack, t) * (1 - smooth(start + attack, start + length, t));
function crossed(before, after, mark) {
  return after < before ? mark > before || mark <= after : mark > before && mark <= after;
}
function mountFeedingStory(link) {
  const figure = document.createElement("figure");
  figure.className = "rest-scene feeding-story";
  const svg = el("svg", {
    viewBox: "0 0 310 204",
    role: "group",
    "aria-label": "\u5ABD\u5ABD\u5750\u5728\u85E4\u6905\u4E0A\u8F15\u8F15\u6416\u6643\uFF0C\u62B1\u8457\u5B69\u5B50\u9935\u5976\u3002"
  }, figure);
  svg.style.color = "var(--muted)";
  const { filter } = inkDefs(svg, "feeding-ink");
  const scene = el("g", { filter }, svg);
  const paper = "var(--scene-paper)";
  const skin = "color-mix(in srgb, var(--bg) 73%, #c68f77)";
  const shirt = "color-mix(in srgb, var(--bg) 82%, #d6c19a)";
  const hair = "color-mix(in srgb, var(--bg) 22%, #59443c)";
  const rattan = "color-mix(in srgb, var(--bg) 66%, #ab765d)";
  function outline(parent, d, color, width = 1.15) {
    paint(parent, color, width).setAttribute("d", d);
  }
  function line(parent, d, width = 0.85, opacity = 1) {
    const path = pen(parent, width);
    path.setAttribute("d", d);
    path.setAttribute("opacity", String(opacity));
    return path;
  }
  outline(scene, "M57 192 70 93Q78 38 120 34L164 35Q198 38 210 91L224 189Z", rattan, 1.5);
  outline(scene, "M68 188 80 94Q88 49 121 44L162 45Q188 48 200 92L213 188Z", paper);
  line(scene, "M62 190 74 94Q84 44 119 39M163 40Q195 42 205 91L220 187", 0.85, 0.65);
  line(scene, "M13 191Q64 190 95 192M212 192Q255 190 295 192", 0.75, 0.48);
  const family = el("g", { class: "feeding-family" }, scene);
  outline(family, "M77 183Q78 156 83 129Q87 111 109 106L138 101Q169 103 182 112Q203 128 205 151L199 189Q142 191 77 183Z", shirt);
  line(family, "M98 117Q97 129 101 144M178 116Q182 128 181 139M140 129l1.5 10", 0.72, 0.72);
  const backHair = el("g", { class: "feeding-back-hair" }, family);
  outline(backHair, "M102 64Q103 43 119 37Q140 28 159 38Q179 47 176 69Q178 94 167 103Q161 107 152 102Q139 94 126 101Q116 106 105 101Q97 92 102 64Z", hair, 1.3);
  const neck = paint(family, skin, 0.98);
  neck.setAttribute("class", "feeding-neck");
  const head = el("g", { class: "feeding-head" }, family);
  outline(head, "M106 71Q101 62 107 60Q112 58 114 67Q121 53 138 45Q150 50 156 62Q161 67 161 75Q160 92 148 98Q135 105 120 92Q110 86 108 75Z", skin);
  line(head, "M122 71q4-3 9-1m12-1q4-2 8 1m-10 6-1 7 3 1", 0.85);
  const eyes = line(head, "M126 75h1m20-1h1", 0.92);
  const loweredEyes = line(head, "M125 75q2.7 2.1 5.3 .5m15-1q2.4 2 5 .3", 0.92, 0);
  const humMouth = el("ellipse", {
    cx: 138.1,
    cy: 90,
    rx: 2.7,
    ry: 0.65,
    fill: "none",
    stroke: "currentColor",
    "stroke-width": 0.88
  }, head);
  const widerSmile = line(head, "M130 89q8 6 16-1", 1.05, 0);
  outline(family, "M123 174Q141 155 166 155Q187 153 208 149Q233 152 242 174L243 187Q195 193 116 189Z", "var(--dress)");
  const babyHead = el("g", { class: "feeding-baby-head" }, family);
  outline(babyHead, "M180 145Q174 141 179 136L183 133Q187 121 197 118Q216 112 229 123Q245 137 235 155Q229 163 216 166Q193 167 185 154Z", skin);
  const babyEyes = line(babyHead, "M192 135q5-2 9 1", 0.9);
  const smilingEyes = line(babyHead, "M192 136q4-5 9-1m7 1q3-3 6-1", 0.91, 0);
  line(babyHead, "M224 150q8-3 6 4m-19-32q7 0 12 4", 0.76);
  const babyMouth = el("ellipse", {
    cx: 182.8,
    cy: 143.5,
    rx: 2.6,
    ry: 1.5,
    fill: "none",
    stroke: "currentColor",
    "stroke-width": 0.85
  }, babyHead);
  const babyLaugh = paint(babyHead, "var(--dress)", 0.94);
  babyLaugh.setAttribute("d", "M182.8 145q6 1.3 12.3-3.7q-.8 8.1-6.4 9.2q-4.1.9-5.9-5.5Z");
  babyLaugh.setAttribute("opacity", "0");
  const supportingArm = solid(limb(family, 13, 1.1), skin);
  supportingArm.draw([[195, 165], [190, 179], [173, 186]], [0.2, 0.4]);
  const feedingArm = solid(limb(family, 14, 1.1), skin);
  const bottle = el("g", { class: "feeding-bottle" }, family);
  outline(bottle, "M143 137Q143 131 149 130L169 133Q173 135 173 139L173 147Q173 151 168 152L148 150Q142 149 142 144Z", shirt);
  outline(bottle, "M172 137l7 1q3 3 0 7l-7 2Z", paper);
  line(bottle, "M148 136l7 1m-7 4 6 1m-6 4 7 1", 0.62, 0.65);
  outline(bottle, "M136 153Q142 148 147 148l8 1q6 0 7-3 4 0 3 4-2 5-14 7l-6 4", skin, 0.95);
  const hint = document.createElement("span");
  hint.className = "rest-scene-hint";
  hint.textContent = "\u9EDE\u4E00\u4E0B\u5BF6\u5BF6\uFF0C\u770B\u770B\u4ED6\u7684\u53CD\u61C9\u3002";
  const pause = document.createElement("button");
  pause.type = "button";
  pause.textContent = "\u66AB\u505C\u6416\u6643";
  const audio = document.createElement("button");
  audio.type = "button";
  audio.textContent = "\u958B\u555F\u97F3\u6548";
  figure.append(pause, audio, hint);
  link.after(figure);
  const sound = createFeedingSound();
  const reaction = createReaction({ enter: 0.4, hold: 2.04, exit: 0.64 });
  const target = el("g", { class: "feeding-baby-hit" }, svg);
  const input = bindReaction(target, reaction, {
    label: "\u9EDE\u5BF6\u5BF6\uFF0C\u8B93\u4ED6\u6253\u55DD\u548C\u7B11",
    hitBox: { x: 176, y: 114, width: 67, height: 74 },
    wake: () => clock.wake()
  });
  let inView = !("IntersectionObserver" in window);
  let paused = false;
  let busyPhase = "idle";
  let idleTime = 0;
  let previousReactionTime = 0;
  let previousPose = "";
  let previousBottle = "";
  let disposed = false;
  const clock = runScene(({ dt, reducedMotion }) => {
    const state = reaction.step(dt);
    if (busyPhase !== state.phase) {
      input.sync();
      busyPhase = state.phase;
    }
    if (pause.hidden !== reducedMotion) pause.hidden = reducedMotion;
    const visible = inView && !document.hidden;
    const playing = visible && !paused && !state.busy;
    const before = idleTime;
    if (playing && (!reducedMotion || sound.enabled)) idleTime = (idleTime + dt) % cycle;
    if (playing && sound.enabled) {
      for (const note of hum) {
        if (crossed(before, idleTime, note.at)) sound.hum(note.pitch, note.length);
      }
      for (const [index, at] of gulps.entries()) {
        if (crossed(before, idleTime, at)) sound.gulp(270 - index % 2 * 34);
      }
    }
    const t = state.elapsed;
    if (state.busy && visible && sound.enabled) {
      if (crossed(previousReactionTime, t, burpAt)) sound.burp();
      for (const cue of chuckles) {
        if (crossed(previousReactionTime, t, cue.at)) sound.laugh(cue.pitch);
      }
    }
    previousReactionTime = state.busy ? t : 0;
    const sip = state.busy || reducedMotion ? 0 : Math.max(...gulps.map((at) => pulse(idleTime, at - 0.025, 0.075, 0.25)));
    const humming = state.busy || reducedMotion ? 0 : Math.max(...hum.map((note) => pulse(idleTime, note.at, 0.15, note.length)));
    const burp = pulse(t, burpAt - 0.045, 0.09, 0.34);
    const laugh = smooth(0.99, 1.19, t) * (1 - smooth(1.82, 2.17, t));
    const chuckle = Math.max(...chuckles.map((cue) => pulse(t, cue.at - 0.035, 0.07, 0.22)));
    const smileAmount = smooth(1.47, 1.88, t) * (1 - smooth(2.48, 3.02, t));
    const away = reducedMotion ? Number(state.phase === "hold") : state.amount;
    const pose = [reducedMotion ? 0 : rock(idleTime), sip, humming, burp, laugh, chuckle, smileAmount, away];
    const poseKey = `${reducedMotion} ${pose.map(f).join(" ")}`;
    if (previousPose !== poseKey) {
      previousPose = poseKey;
      family.setAttribute("transform", `rotate(${f(pose[0])} 146 177)`);
      const nod = reducedMotion ? 0 : smileAmount;
      const headPose = `rotate(${f(nod * 10)} 141 98)`;
      backHair.setAttribute("transform", headPose);
      neck.setAttribute("d", `M${f(121 + nod * 1.7)} ${f(87 - nod * 3.5)}
        Q${f(123 + nod * 1.7)} 101 115 108 Q126 121 138 122 Q152 122 163 110
        Q150 107 ${f(150 + nod * 2.4)} ${f(89 + nod * 1.5)} Z`);
      head.setAttribute("transform", headPose);
      babyHead.setAttribute("transform", reducedMotion ? "" : `translate(0 ${f(-burp * 2.2 - chuckle * 1.2)}) rotate(${f(burp * 6.7 + chuckle * 2.6 - sip)} 220 159)`);
      eyes.setAttribute("opacity", f(1 - smileAmount));
      loweredEyes.setAttribute("opacity", f(smileAmount));
      humMouth.setAttribute("ry", f(0.65 + humming * 0.68));
      humMouth.setAttribute("opacity", f(1 - smileAmount));
      widerSmile.setAttribute("opacity", f(smileAmount));
      babyEyes.setAttribute("opacity", f(1 - laugh));
      smilingEyes.setAttribute("opacity", f(laugh));
      babyMouth.setAttribute("rx", f(2.6 + burp * 1.9 - sip * 0.75));
      babyMouth.setAttribute("ry", f(1.5 + burp * 2.8 - sip * 0.5));
      babyMouth.setAttribute("opacity", f(1 - laugh));
      babyLaugh.setAttribute("opacity", f(laugh));
      babyLaugh.setAttribute("transform", `translate(0 ${f(reducedMotion ? 0 : chuckle * 0.68)})`);
    }
    const bottlePose = `${f(away)} ${f(sip)}`;
    if (previousBottle !== bottlePose) {
      previousBottle = bottlePose;
      const x = -17 * away, y = 6.2 * away - 0.42 * sip;
      bottle.setAttribute("transform", `translate(${f(x)} ${f(y)}) rotate(${f(away * 9 - sip * 1.15)} 151 147)`);
      feedingArm.draw([[89, 148], [106 - 4 * away, 171 + away * 2], [151 + x, 147 + y]], [0.25, 0.55]);
    }
    return state.busy || sound.enabled && playing;
  });
  const observer = "IntersectionObserver" in window ? new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    clock.wake();
  }) : null;
  observer?.observe(figure);
  document.addEventListener("visibilitychange", clock.wake);
  pause.addEventListener("click", () => {
    paused = !paused;
    pause.textContent = paused ? "\u64AD\u653E\u6416\u6643" : "\u66AB\u505C\u6416\u6643";
    clock.wake();
  });
  audio.addEventListener("click", async () => {
    audio.disabled = true;
    try {
      const enabled = await sound.toggle();
      if (disposed) return;
      audio.textContent = enabled ? "\u95DC\u9589\u97F3\u6548" : "\u958B\u555F\u97F3\u6548";
      clock.wake();
    } catch {
      if (!disposed) audio.textContent = "\u91CD\u8A66\u958B\u555F\u97F3\u6548";
    } finally {
      audio.disabled = false;
    }
  });
  return () => {
    disposed = true;
    observer?.disconnect();
    document.removeEventListener("visibilitychange", clock.wake);
    clock.dispose();
    input.dispose();
    sound.dispose();
    figure.remove();
  };
}
export {
  mountFeedingStory
};
