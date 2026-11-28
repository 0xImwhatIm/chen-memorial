// Uses JDhruv14/line-art-animation under the MIT license. See vendor/LICENSE.txt.

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
var blot = (parent) => el("path", { fill: INK }, parent);
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
var minJerk = (s) => s * s * s * (10 - 15 * s + 6 * s * s);
function seeded(seed = 11) {
  let s = seed;
  return (a = 0, b = 1) => {
    s = s * 16807 % 2147483647;
    return a + (s - 1) / 2147483646 * (b - a);
  };
}
var wobble = (t, k = 1) => Math.sin(t * 1.3 * k) * 0.6 + Math.sin(t * 2.7 * k + 1.7) * 0.3 + Math.sin(t * 5.1 * k + 4.1) * 0.1;
function spring(stiffness = 40, damping = 6, x = 0) {
  return {
    x,
    v: 0,
    step(target, dt) {
      this.v += (stiffness * (target - this.x) - damping * this.v) * dt;
      this.x += this.v * dt;
      return this.x;
    },
    kick(v) {
      this.v += v;
    }
  };
}

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

// examples/riverside/scene.ts
function mountRiversideScene(stage, pause) {
  const svg = el("svg", {
    viewBox: "0 0 660 450",
    role: "group",
    "aria-labelledby": "river-title river-description"
  }, stage);
  el("title", { id: "river-title" }, svg).textContent = "\u6A39\u852D\u4E0B\u7684\u6B04\u6746";
  el("desc", { id: "river-description" }, svg).textContent = "\u5ABD\u5ABD\u5750\u5728\u6CB3\u5CB8\u7684\u9577\u6905\u4E0A\uFF0C\u5FAE\u98A8\u5439\u52D5\u5979\u7684\u982D\u9AEE\u3001\u88D9\u64FA\u8207\u677E\u679D\u3002\u9EDE\u677E\u6A39\u5F8C\uFF0C\u5C0F\u677E\u9F20\u62B1\u8457\u677E\u679C\u63A2\u51FA\u4F86\uFF0C\u5ABD\u5ABD\u770B\u898B\u7260\u4FBF\u5FAE\u7B11\u3002\u591C\u9593\u7684\u6CB3\u9762\u6620\u8457\u6708\u5149\u3002";
  const { defs, filter } = inkDefs(svg, "riverside");
  svg.style.removeProperty("color");
  function fill(parent, d, colour, width = 1.15) {
    const path = paint(parent, colour, width);
    path.setAttribute("d", d);
    return path;
  }
  function line(parent, d, width = 0.85, opacity = 1) {
    const path = pen(parent, width);
    path.setAttribute("d", d);
    path.setAttribute("opacity", f(opacity));
    return path;
  }
  const moonX = 74;
  const twilight = el("linearGradient", { id: "riverside-night-sky", x2: 0, y2: 1 }, defs);
  el("stop", { offset: 0, "stop-color": "#242937" }, twilight);
  el("stop", { offset: 1, "stop-color": "#3a4a55" }, twilight);
  const halo = el("radialGradient", { id: "riverside-moon-halo" }, defs);
  el("stop", { offset: 0, "stop-color": "#f4e4be", "stop-opacity": 0.32 }, halo);
  el("stop", { offset: 0.42, "stop-color": "#ebdfc4", "stop-opacity": 0.14 }, halo);
  el("stop", { offset: 1, "stop-color": "#c6d4e1", "stop-opacity": 0 }, halo);
  const nightSky = el("g", { class: "riverside-night", "data-riverside-night-sky": "", "aria-hidden": "true" }, svg);
  el("rect", { width: 660, height: 178, fill: "url(#riverside-night-sky)" }, nightSky);
  el("circle", { cx: moonX, cy: 86, r: 68, fill: "url(#riverside-moon-halo)" }, nightSky);
  el("circle", { cx: moonX, cy: 86, r: 16.5, fill: "#f5e5bf", "data-riverside-moon": "" }, nightSky);
  el("path", {
    d: "M67 76q-3 1-4 4q2 3 5 2q3-2 5-2q1-5-6-4Z M76 89q-2 1-2 5q4 4 8 1q1-4-6-6Z",
    fill: "#b8a786",
    opacity: 0.25
  }, nightSky);
  const waterline = "M0 158Q97 168 185 156T361 153Q504 154 660 169V357H0Z";
  fill(svg, waterline, "var(--water)", 0);
  const clip = el("clipPath", { id: "river-water-clip" }, defs);
  el("path", { d: waterline }, clip);
  const current = el("g", { "clip-path": "url(#river-water-clip)", "aria-hidden": "true" }, svg);
  const random = seeded(294);
  const streamLength = 710;
  const currentLayers = Array.from({ length: 4 }, (_, depth) => {
    const layer = el("g", { "data-current-layer": depth }, current);
    const rows = Array.from({ length: 4 }, (_2, index) => {
      const y = 171 + depth * 36 + index * (5.1 + depth * 0.7) + random(-2, 2);
      return Array.from({ length: 9 }, (_3, i) => {
        const x = i * 79 + random(-23, 26);
        const w = random(13, 45) + depth * 6;
        const ripple = random(0.8, 2.2);
        return `M${f(x)} ${f(y)}q${f(w * 0.39)} ${f(ripple)} ${f(w * 0.71)} .1t${f(w * 0.29)} -.15`;
      }).join(" ");
    });
    for (const offset of [-streamLength, 0, streamLength]) {
      const band = el("g", { transform: `translate(${offset} 0)` }, layer);
      for (const d of rows) {
        line(band, d, 0.8 + depth * 0.13, 0.18 + depth * 0.053).setAttribute("stroke", "var(--water-line)");
      }
    }
    return layer;
  });
  const reflection = el("g", {
    class: "riverside-night",
    "clip-path": "url(#river-water-clip)",
    "data-riverside-moonlight": "",
    "aria-hidden": "true"
  }, svg);
  el("ellipse", { cx: moonX, cy: 249, rx: 52, ry: 88, fill: "url(#riverside-moon-halo)", opacity: 0.62 }, reflection);
  const reflectionRandom = seeded(781);
  const moonLanes = Array.from({ length: 3 }, (_, lane) => {
    const group = el("g", { "data-riverside-moon-lane": lane }, reflection);
    for (let row = 0; row < 7; row++) {
      const depth = (row * 3 + lane) / 20;
      const y = 174 + depth * 153 + reflectionRandom(-2, 2);
      const center = moonX + reflectionRandom(-10, 10) * (1 + depth * 1.8);
      const length = reflectionRandom(7, 20) + depth * reflectionRandom(12, 38);
      const gap = reflectionRandom(3, 7);
      const stroke = line(
        group,
        `M${f(center - length * 0.55)} ${f(y)}q${f(length * 0.19)} 1.1 ${f(length * 0.53)} 0m${f(gap)} 0q${f(length * 0.13)} -.7 ${f(length * 0.31)} .15`,
        reflectionRandom(0.85, 1.65),
        reflectionRandom(0.34, 0.68)
      );
      stroke.setAttribute("stroke", row % 4 === 2 ? "#b6cfcd" : "#e9dbb5");
    }
    return group;
  });
  const bank = el("g", { "aria-hidden": "true" }, svg);
  fill(bank, "M0 151Q33 142 67 146Q98 133 132 138Q173 124 216 140Q257 134 289 143Q325 129 362 142Q408 139 435 147Q470 144 499 154Q556 147 590 156Q624 148 660 161V175Q566 165 503 169Q404 154 348 160Q262 151 171 162Q74 173 0 160Z", "var(--far-bank)", 0.55).setAttribute("stroke", "var(--water-line)");
  line(bank, "M0 167Q53 170 126 164M235 160q64-5 111 .3m113 4q35 3 99 6m34 5 68 4", 0.67, 0.28);
  fill(bank, "M0 333Q84 322 154 329Q212 324 253 339Q336 353 393 336Q482 308 549 326Q605 328 660 347V450H0Z", "var(--ground)", 0.9);
  line(bank, "M2 340q70-8 122-4m151 13q73 8 112-1m105-18q74-8 166 24", 0.85, 0.55);
  for (const d of ["M42 392q17-7 37-5", "M272 364q15-4 29 1", "M292 393q24-10 49-5", "M509 403q19-5 49-4", "M562 385q19 2 36 6", "M297 432q20-4 34-1"]) {
    line(bank, d, 0.75, 0.54);
  }
  const foreground = el("g", { filter, "aria-hidden": "true" }, svg);
  const seat = el("g", {}, foreground);
  fill(seat, "M24 333Q88 330 246 333L269 341L267 351Q161 346 28 351Z", "var(--rail)", 1.4);
  fill(seat, "M47 351L59 351L58 405L44 404Z M228 349L242 350L245 390L234 391Z", "var(--bark)", 1);
  line(seat, "M29 340Q133 337 263 343M55 357 52 397M238 356l3 29", 0.8, 0.66);
  const pine = el("g", { "aria-hidden": "true" }, foreground);
  fill(pine, "M462 354Q442 339 447 321Q439 284 418 252Q397 221 391 182Q379 156 371 136Q361 125 364 107Q367 83 354 61L372 53Q390 74 386 98Q392 121 406 143Q420 165 423 195Q429 222 444 247Q463 276 475 313Q483 336 495 348Q483 356 462 354Z", "var(--bark)", 1.8);
  for (const d of ["M469 346q-10-29-16-48t-30-64q-18-28-21-61", "M478 334q-13-45-24-54", "M447 264q-14-22-19-34", "M410 184q-3-21-13-38m-7-12q-12-19-15-41", "M370 86q1-14-8-25"]) {
    line(pine, d, 1, 0.48);
  }
  const branchRandom = seeded(173);
  const twigProfiles = [
    { x: 373, y: 89, angle: -164, length: 268, scale: 1.25, phase: 0.53 },
    { x: 370, y: 67, angle: -133, length: 139, scale: 1.13, phase: 0.7 },
    { x: 371, y: 66, angle: -89, length: 90, scale: 0.86, phase: 0.82 },
    { x: 376, y: 91, angle: -9, length: 264, scale: 1.18, phase: 1.52 },
    { x: 382, y: 110, angle: -169, length: 207, scale: 1.1, phase: 1.1 },
    { x: 395, y: 152, angle: -168, length: 230, scale: 1.31, phase: 0.4 },
    { x: 382, y: 102, angle: -34, length: 166, scale: 1.12, phase: 1.23 },
    { x: 394, y: 134, angle: -16, length: 221, scale: 1.15, phase: 0.95 },
    { x: 414, y: 177, angle: -34, length: 130, scale: 1.03, phase: 1.8 }
  ];
  const tuftSilhouette = "M-36 5Q-42 1 -35-6Q-39-12 -29-15Q-32-21 -20-23Q-23-30 -10-29Q-6-37 5-32Q13-37 21-29Q33-30 34-23Q44-19 42-14Q54-10 48-4Q56 1 44 5Q46 10 33 12Q27 19 14 13Q6 19-5 14Q-17 19-22 12Q-35 13-36 5Z";
  function drawNeedleTuft(parent, color) {
    const shape = fill(parent, tuftSilhouette, color, 0.5);
    shape.setAttribute("stroke-opacity", ".36");
    const needles = [];
    for (const [x, y, direction] of [[-24, 1, -2.18], [-10, 0, -1.85], [5, 4, -1.56], [19, 2, -1.19], [32, 3, -0.86]]) {
      for (let needle = 0; needle < 13; needle++) {
        const theta = direction + (needle - 6) * 0.154 + branchRandom(-0.1, 0.1);
        const length = branchRandom(12, 28);
        const dx = Math.cos(theta) * length, dy = Math.sin(theta) * length;
        needles.push(`M${f(x + branchRandom(-2, 2))} ${f(y + branchRandom(-3, 3))}q${f(dx * 0.48 + 1)} ${f(dy * 0.61)} ${f(dx)} ${f(dy)}`);
      }
    }
    line(parent, needles.join(" "), 0.51, 0.44);
    line(parent, "M-31 6Q-24 2-18 1M-6 5q6-4 10-3M15 8q7-4 13-5m6 7 8-6", 0.68, 0.34);
  }
  const pineCrowns = twigProfiles.map(({ x, y, angle, length, scale, phase }, branchIndex) => {
    const branch = el("g", { "data-pine-branch": branchIndex }, pine);
    fill(branch, `M-8 4Q${f(length * 0.35)} -7 ${f(length * 0.64)} -18Q${f(length * 0.79)} -25 ${length} -22Q${f(length * 0.67)} -13 ${f(length * 0.57)} -10Q${f(length * 0.25)} 3 -8 8Z`, "var(--bark)", 1);
    const side = angle < -90 ? -1 : 1;
    for (const [i, fraction] of [0.36, 0.49, 0.64, 0.77, 0.89, 1].entries()) {
      const px = length * fraction;
      const py = -23 * fraction + (i % 2 === 0 ? -6 : 12) + branchRandom(-3, 3);
      line(branch, `M${f(px - 20)} ${f(-17 * fraction)}q13 ${f(py * 0.22)} 20 ${f(py + 17 * fraction)}`, 0.86, 0.65);
      const tilt = -angle + side * branchRandom(-18, 17);
      const size = scale * branchRandom(0.84, 1.1);
      const tuft = el("g", {
        "data-pine-tuft": "",
        transform: `translate(${f(px)} ${f(py)}) rotate(${f(tilt)}) scale(${f(size * side)} ${f(size)})`
      }, branch);
      const color = i % 3 === 1 ? "var(--pine-shade)" : i % 3 === 2 ? "var(--pine-light)" : "var(--pine)";
      drawNeedleTuft(tuft, color);
    }
    return { branch, x, y, angle, phase, bend: spring(12, 4.2) };
  });
  const mother = el("g", { transform: "translate(174 285) scale(1.36)", "aria-hidden": "true" }, foreground);
  const legs = [solid(limb(mother, 11, 1.02), "var(--skin)"), solid(limb(mother, 12, 1.05), "var(--skin)")];
  legs[0].draw([[16, 44], [27, 67], [8, 100]], [0.2, 0.55]);
  legs[1].draw([[10, 44], [12, 70], [-6, 102]], [0.25, 0.58]);
  fill(mother, "M7 96q5 2 6 6l-9 9q-9 3-15-1q0-3 6-5Z", "var(--skirt)", 0.92);
  fill(mother, "M-7 99q4 1 6 5l-9 10q-8 3-14 0q-1-3 5-6Z", "var(--paper)", 0.96);
  line(mother, "M-18 110q4 1 8-2m12-2q4-1 7-4", 0.64, 0.7);
  const skirt = fill(mother, "", "var(--skirt)", 1.2);
  const hem = line(mother, "", 0.76, 0.67);
  const hairTips = fill(mother, "", "var(--hair)", 1.15);
  fill(mother, "M-5-54Q2-49 11-53L12-41L23-33Q15-24 4-24Q-8-30-13-36Q-5-41-5-54Z", "var(--skin)", 0.98);
  fill(mother, "M-13-38Q-28-37-32-26Q-36-17-30-2L-22 4L-20 15Q-9 21 14 19L20 5Q26-1 27-15Q26-29 14-37L3-29Z", "var(--rose)", 1.22);
  fill(mother, "M-13-38L3-29L-3-18L-15-30Z M14-37L3-29L10-22L20-32Z", "var(--rose-light)", 0.84);
  line(mother, "M2-28Q4-9 5 13M-27-3l6-4m42-5 4 1M-14 13q10 5 26 2", 0.74, 0.7);
  for (const y of [-16, -6, 5]) el("circle", { cx: 5.8, cy: y, r: 0.86, fill: "currentColor", opacity: 0.74 }, mother);
  const profile = el("g", { transform: "rotate(5 4 -47)" }, mother);
  fill(profile, "M-26-70Q-27-85-17-91Q-4-99 10-87Q18-84 17-75Q15-71 14-68L10-57Q5-43-10-43Q-21-44-24-54Q-22-60-26-70Z", "var(--hair)", 1.25);
  fill(profile, "M-11-72Q-3-79 3-87Q13-84 15-77Q17-73 16-67L22-61Q23-59 17-57L17-53Q15-48 9-46Q0-44-7-52L-12-60Q-16-57-19-64Q-21-71-15-71Z", "var(--skin)", 1.02);
  line(profile, "M-21-71Q-14-87-1-90M-20-78q6-9 13-12m17 22q3-1 5 1m-29 3q1-3 3-1", 0.66, 0.91);
  const motherEye = line(profile, "", 0.7, 0.95);
  const motherMouth = fill(profile, "", "var(--hair)", 0.86);
  motherMouth.setAttribute("data-mother-mouth", "");
  const smileCheek = line(profile, "M5.2-53.2q-.5 .6-.65 1.6", 0.57, 0);
  const hands = el("g", {}, mother);
  const farArm = solid(limb(hands, 7, 0.94), "var(--skin)");
  farArm.draw([[20, -8], [20, 17], [9, 42]], [0.25, 0.5]);
  const nearArm = solid(limb(hands, 8, 1), "var(--skin)");
  nearArm.draw([[-28, -6], [-23, 16], [2, 41]], [0.2, 0.45]);
  fill(hands, "M1 39q7-1 10 3l5 5q1 3-2 2l-5-3 2 5q-2 2-4 0l-5-5q-2-2-1-7Z", "var(--skin)", 0.78);
  line(hands, "M5 43l4 3m-3-.4 4 3", 0.57);
  const squirrel = el("g", { "data-squirrel": "", visibility: "hidden", "aria-hidden": "true" }, foreground);
  const tail = el("g", { "data-squirrel-tail": "" }, squirrel);
  fill(tail, "M8-10Q25-20 22-31Q20-44 29-54Q37-64 49-58Q52-56 52-53Q59-49 56-45Q57-38 50-36Q57-25 50-16Q43-7 31-9Q24-9 15-3Z", "var(--fur)", 1.14);
  line(tail, "M15-9q18-9 18-22t13-20m-9 38q17-8 8-21m-16 2q0-15 8-20m7 7 3-4", 0.8, 0.69);
  fill(squirrel, "M-17-7Q-22-14-15-27Q-11-36-2-34Q8-34 11-25Q20-24 20-13Q20-6 14-2Q6 2-2-1Z", "var(--fur)", 1.22);
  fill(squirrel, "M-15-23Q-7-28-1-22Q4-12 0-5Q-7-1-14-6Q-18-15-15-23Z", "var(--belly)", 0.65);
  const paws = el("g", {}, squirrel);
  const leftFoot = solid(limb(paws, 4.4, 0.86), "var(--fur)");
  const rightFoot = solid(limb(paws, 4.9, 0.91), "var(--fur)");
  const squirrelHead = el("g", { "data-squirrel-head": "" }, squirrel);
  fill(squirrelHead, "M-22-36Q-30-39-27-46Q-26-52-20-44Q-16-51-13-50Q-8-47-12-40Q-3-36-5-29Q-9-22-18-24Q-25-24-30-29Q-33-31-30-33Z", "var(--fur)", 1);
  line(squirrelHead, "M-24-43l2 4m5-5-1 4m-10 9q1.5 2 5 2m7.1 1 3-1", 0.63);
  const eye = blot(squirrelHead);
  eye.setAttribute("d", "M-22.8-35.7q1.5-1.9 2.9-.2q.7 1.7-1.2 2.3q-1.9 0-1.7-2.1Z");
  const cone = el("g", { transform: "translate(-17 -17) rotate(18)", "data-pine-cone": "" }, squirrel);
  fill(cone, "M0-9Q4-7 6 0Q6 7 0 9Q-5 9-6 4Q-7-2-2-8Z", "var(--cone)", 0.96);
  line(cone, "M-.5-9l1-4m-4 6q3 2 6 0m-7 3q2.5 3 5 1m-4 4q3 3 6 0m-4.5 4q3 2 5 .4", 0.72);
  const holdingPaw = solid(limb(squirrel, 3.8, 0.86), "var(--fur)");
  holdingPaw.draw([[-6, -22], [-10, -14], [-17, -13]], [0.15, 0.5]);
  const bush = el("g", { "aria-hidden": "true" }, foreground);
  fill(bush, "M480 360q-1-12 10-17q-7-14 5-21q0-10 13-14q0-11 15-11q10-8 22-1q12-9 23-2q14-8 25 3q11 0 16 10q19 0 20 12q20 2 22 12l9 8v52q-103-12-162-17q-12-4-18-14Z", "var(--shrub)", 1);
  for (let i = 0; i < 37; i++) {
    const x = random(494, 650), y = random(322, 373);
    const side = i % 2 === 0 ? 1 : -1;
    const dx = side * random(3, 10), dy = random(4, 11);
    line(bush, `M${f(x)} ${f(y)}q${f(dx * 1.1)} 1 ${f(dx)} ${f(-dy)}q${f(-dx * 0.9)} .1 ${f(-dx)} ${f(dy)}`, 0.7, 0.53);
  }
  const rail = el("g", { "aria-hidden": "true" }, foreground);
  fill(rail, "M11 395L26 394L26 450H10Z M344 410L359 410L361 450H345Z M614 418L628 418L629 450H613Z", "var(--bark)", 1.25);
  fill(rail, "M0 390Q168 396 299 402Q462 409 660 420V433Q469 426 286 417Q135 411 0 406Z", "var(--rail)", 1.35);
  line(rail, "M1 394Q163 400 298 406Q453 411 658 424M25 401l-1 10m327 4v10m272 3v11", 0.8, 0.66);
  const reaction = createReaction({ enter: 0.88, hold: 2.25, exit: 0.82 });
  const treeTarget = el("g", {}, svg);
  const input = bindReaction(treeTarget, reaction, {
    label: "\u9EDE\u677E\u6A39\uFF0C\u770B\u5C0F\u677E\u9F20\u62B1\u8457\u677E\u679C\u63A2\u982D",
    hitBox: { x: 365, y: 111, width: 136, height: 250 },
    wake: () => clock.wake()
  });
  let ambient = 0;
  let paused = false;
  let inView = true;
  let lastAmbientPaint;
  let lastStage = "idle";
  let lastSmile = "";
  const hairDrag = spring(16, 4.3);
  const clothDrag = spring(11, 3.8);
  const clock = runScene(({ dt, reducedMotion }) => {
    if (pause.hidden !== reducedMotion) pause.hidden = reducedMotion;
    const running = inView && !paused && !reducedMotion && !document.hidden;
    if (running) ambient += dt;
    const ambientPaint = reducedMotion ? -1 : ambient;
    if (lastAmbientPaint !== ambientPaint) {
      lastAmbientPaint = ambientPaint;
      const breeze = running ? 0.95 + 0.85 * wobble(ambient, 0.9) : 0;
      const hair = reducedMotion ? 0 : running ? hairDrag.step(breeze, dt) : hairDrag.x;
      const cloth = reducedMotion ? 0 : running ? clothDrag.step(breeze, dt) : clothDrag.x;
      currentLayers.forEach((layer, depth) => {
        const x = reducedMotion ? 0 : ambient * (12.5 + depth * 7.1) % streamLength;
        layer.setAttribute("transform", `translate(${f(x)} 0)`);
      });
      moonLanes.forEach((lane, index) => {
        const drift = reducedMotion ? 0 : ambient;
        const x = 4.5 * Math.sin(drift * (1.4 + index * 0.21) + index);
        lane.setAttribute("transform", `translate(${f(x)} 0)`);
        lane.setAttribute("opacity", f(0.8 + 0.17 * Math.sin(drift * 1.7 + index)));
      });
      for (const { branch, x, y, angle, phase, bend } of pineCrowns) {
        const swing = running ? bend.step(wobble(ambient + phase, 0.73) * 5.6 + breeze, dt) : bend.x;
        branch.setAttribute("transform", `translate(${x} ${y}) rotate(${f(angle + (reducedMotion ? 0 : swing))})`);
      }
      hairTips.setAttribute("d", `M-23-77q-6 7-6 15Q${f(-29 - hair * 4)} -54 -29-44
        Q${f(-25 - hair * 10)} ${f(-38 - hair * 4)} ${f(-39 - hair * 7)} ${f(-35 - hair * 4)}
        Q${f(-34 - hair * 6)} -30 -22-36Q-10-39-10-52L-10-69Z`);
      skirt.setAttribute("d", `M-20 12Q-4 17 14 13Q23 25 27 35Q36 42 39 52
        Q23 56 11 49Q${f(-3 - cloth * 3)} ${f(57 - cloth * 1.5)} ${f(-11 - cloth * 8)} ${f(53 - cloth * 2)}
        Q${f(-28 - cloth * 5)} ${f(59 - cloth * 3)} ${f(-42 - cloth * 6)} ${f(50 - cloth * 4)}Q-31 38-24 32Z`);
      hem.setAttribute("d", `M-17 19q-5 16 ${f(-14 - cloth * 3)} ${f(27 - cloth * 2)}m33-24q3 11 12 17m-27-8q-1 7-4 12`);
    }
    const state = reaction.step(dt);
    if (lastStage !== state.phase) {
      input.sync();
      lastStage = state.phase;
      squirrel.setAttribute("visibility", state.busy ? "visible" : "hidden");
    }
    const expression = f(smooth(0.99, 1.38, state.elapsed) * (1 - smooth(3.18, 3.88, state.elapsed)));
    if (lastSmile !== expression) {
      lastSmile = expression;
      const smile = Number(expression);
      const lipFront = `${f(14.8 - 0.5 * smile)} ${f(-51.3 - 2 * smile)}`;
      const lipCorner = `${f(10.7 - 4.2 * smile)} ${f(-51 - 1.3 * smile)}`;
      const lipMid = f(12.8 - 2.2 * smile);
      motherMouth.setAttribute("d", `M${lipFront}Q${lipMid} ${f(-50 + 0.4 * smile)} ${lipCorner}
        Q${lipMid} ${f(-50 + 5.4 * smile)} ${lipFront}Z`);
      motherEye.setAttribute("d", `M10.5-64.2q1.1 ${f(-1.5 * smile)} 2.5 .2`);
      smileCheek.setAttribute("opacity", f(smile * 0.72));
    }
    if (state.busy) {
      const amount = reducedMotion ? 1 : minJerk(state.amount);
      const travelling = state.phase === "enter" || state.phase === "exit";
      const stride = travelling && !reducedMotion ? state.elapsed * 4.9 * Math.PI * 2 : 0;
      const hop = travelling && !reducedMotion ? Math.max(0, Math.sin(stride)) * 5.5 : 0;
      const stretch = travelling ? Math.sin(stride) : 0;
      const direction = !reducedMotion && state.phase === "exit" ? 1 - Math.min(1, (state.elapsed - 3.13) / 0.16) * 2 : 1;
      const x = 520 - amount * 106;
      const y = 357 + (1 - amount) * 8 - hop;
      squirrel.setAttribute("transform", `translate(${f(x)} ${f(y)}) scale(${f(direction * 0.91)} .91)`);
      squirrelHead.setAttribute("transform", `rotate(${f(reducedMotion ? 0 : travelling ? stretch * 2 : wobble(state.elapsed, 1.5) * 3)} -13 -31)`);
      tail.setAttribute("transform", `rotate(${f(reducedMotion ? 0 : travelling ? stretch * 7 : wobble(state.elapsed, 1.15) * 4)} 14 -8)`);
      leftFoot.draw([[3, -9], [2 - stretch * 2, -4], [-4 - stretch * 4, 1]], [0.25, 0.46]);
      rightFoot.draw([[12, -10], [10 + stretch * 2, -4], [5 + stretch * 4, 1]], [0.22, 0.49]);
    }
    return state.busy;
  });
  const observer = "IntersectionObserver" in window ? new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (inView) clock.wake();
  }) : null;
  observer?.observe(stage);
  function togglePause() {
    paused = !paused;
    pause.textContent = paused ? "\u64AD\u653E\u52D5\u614B" : "\u66AB\u505C\u52D5\u614B";
    clock.wake();
  }
  pause.addEventListener("click", togglePause);
  return () => {
    observer?.disconnect();
    pause.removeEventListener("click", togglePause);
    clock.dispose();
    input.dispose();
    svg.remove();
  };
}

// examples/riverside/story.ts
function mountRiversideStory(link) {
  const figure = document.createElement("figure");
  figure.className = "rest-scene riverside-story";
  const art = document.createElement("div");
  art.className = "rest-scene-art";
  const pause = document.createElement("button");
  pause.type = "button";
  pause.textContent = "\u66AB\u505C\u52D5\u614B";
  const hint = document.createElement("span");
  hint.className = "rest-scene-hint";
  hint.textContent = "\u9EDE\u4E00\u4E0B\u677E\u6A39\uFF0C\u770B\u770B\u5ABD\u5ABD\u548C\u5C0F\u677E\u9F20\u7684\u53CD\u61C9\u3002";
  figure.append(art, pause, hint);
  link.after(figure);
  const unmount = mountRiversideScene(art, pause);
  return () => {
    unmount();
    figure.remove();
  };
}
export {
  mountRiversideStory
};
