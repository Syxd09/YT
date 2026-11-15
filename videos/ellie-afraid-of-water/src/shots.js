// THE LITTLE ELEPHANT WHO WAS AFRAID OF WATER — KIDOLU (Tall Tale 3D)
// Pure function of time t using cut(i) = L(i) - 0.06 and Wd(word, line).
import * as THREE from 'three';
import { ctx, W, H, clamp, lerp, seg, eo, eio, eob } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import { camera } from './core/engine.js';
import { INK } from './core/toon.js';
import { Animal } from './core/animals.js';
import { jungleRiver } from './core/jungle.js';
import { drawEndCard } from './core/kidolu.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const mix = (a, b, k) => a.clone().lerp(b, k);
const blink = (t, off = 0) => (((t + off) % 3.2) < 0.12 ? 1 : 0);
const talk = (t, on = 1) => (on ? 0.2 + 0.7 * Math.abs(Math.sin(t * 13)) : 0);
const project = (p, cam) => { const v = p.clone().project(cam); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H]; };

function drawSplashDrops(x, y, lt, count = 9, col = '#5CE1FF') {
  if (lt <= 0 || lt > 1.0) return;
  const p = clamp(lt / 0.85);
  ctx.save();
  for (let i = 0; i < count; i++) {
    const ang = -Math.PI * 0.15 - (i / Math.max(1, count - 1)) * Math.PI * 0.7;
    const dist = (110 + (i % 3) * 55) * eo(p);
    const dx = x + Math.cos(ang) * dist;
    const dy = y + Math.sin(ang) * dist + p * p * 180;
    const r = (14 - (i % 3) * 3) * (1 - p * 0.45);
    ctx.globalAlpha = clamp((1 - p) * 1.4);
    ctx.fillStyle = col; ctx.strokeStyle = INK; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(dx, dy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

function drawHeart(x, y, s, alpha = 1) {
  if (alpha <= 0.02) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#FF4D6D'; ctx.strokeStyle = INK; ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(0, 26);
  ctx.bezierCurveTo(-48, -6, -44, -46, -18, -46);
  ctx.bezierCurveTo(-4, -46, 0, -32, 0, -24);
  ctx.bezierCurveTo(0, -32, 4, -46, 18, -46);
  ctx.bezierCurveTo(44, -46, 48, -6, 0, 26);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}

function drawConfetti(x, y, lt) {
  ctx.save();
  const cols = ['#FFD43B', '#58D5FF', '#FF6B6B', '#74D660', '#B98ACF'];
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2 + 0.15;
    const sp = 160 + (i % 4) * 90;
    const p = clamp(lt / 1.6);
    const px = x + Math.cos(a) * sp * eo(p);
    const py = y + Math.sin(a) * sp * eo(p) * 0.72 + p * p * 190 - 95 * eo(p);
    ctx.save(); ctx.translate(px, py); ctx.rotate(p * 8 + i);
    ctx.globalAlpha = clamp((1 - p) * 1.6);
    ctx.fillStyle = cols[i % cols.length]; ctx.strokeStyle = INK; ctx.lineWidth = 4;
    ctx.fillRect(-13, -9, 26, 18); ctx.strokeRect(-13, -9, 26, 18);
    ctx.restore();
  }
  ctx.restore();
}

export function buildShots(E) {
  const S = [], CUES = [], add = (o) => (S.push(o), o), cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.06);
  const cam = camera(44);
  const LOOK = { fov: 44, bloom: 0.22, aperture: 0.001, maxblur: 0.006 };
  const SUNSET_LOOK = { fov: 46, bloom: 0.28, aperture: 0.001, maxblur: 0.006, warm: 0.08 };

  const J = jungleRiver(E);
  const ellie = new Animal('elephant', {}, { height: 1.24 });
  const bird = new Animal('bird', {}, { height: 0.46 });
  const monkey = new Animal('monkey', {}, { height: 1.26 });
  const frog = new Animal('frog', {}, { height: 0.76 });
  const turtle = new Animal('turtle', {}, { height: 0.88 });
  J.scene.add(ellie.group, bird.group, monkey.group, frog.group, turtle.group);
  const actors = [ellie, bird, monkey, frog, turtle];

  const shoot = (t, from, to, at, at2, k, look = LOOK) => {
    J.update(t);
    const fov = look.fov || 44;
    if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); }
    cam.position.copy(mix(from, to, k));
    const lookAt = at2 ? mix(at, at2, k) : at;
    cam.lookAt(lookAt);
    actors.forEach((a) => a.face(cam));
    E.render(J.scene, cam, { ...look, focus: cam.position.distanceTo(lookAt) });
  };

  const PERCH = [1.05, 2.26, -4.76];
  const resetStage = () => {
    J.setSunset(0); J.setRipple(0, 0, -1);
    bird.group.visible = true;
    bird.at(...PERCH);
    monkey.at(0.1, -0.16, -3.5); frog.at(1.3, -0.14, -3.1); turtle.at(-1.2, -0.14, -3.9);
  };
  const downstream = () => {
    monkey.at(5.8, -0.16, -4.1); frog.at(6.6, -0.14, -3.8); turtle.at(6.2, -0.15, -4.5);
  };

  // ── 1 · 0–2.0s (L0): HOOK — tiny frog splash terrifies Ellie! ──────────
  {
    const st = cut(0), wsp = Wd('splash', 0);
    add({ id: 'S01', at: st, note: 'HOOK: frog splashes puddle, tiny droplet scares Ellie!', draw(lt, d, t, blit) {
      resetStage();
      const k = eio(clamp(lt / d)), spl = t > wsp;
      ellie.at(-1.75, 0, 0.72); frog.at(-2.55, spl ? Math.max(0, Math.sin((t - wsp) * 10) * 0.25) : 0, 0.55);
      ellie.set({
        mood: spl ? 'shock' : 'neutral',
        look: [-0.6, 0.5],
        earFlap: spl ? 0.25 : 0,
        trunk: spl ? 0.5 : -0.2,
        sweat: spl ? 1 : 0,
        bob: spl ? -Math.max(0, Math.sin((t - wsp) * 14)) * 34 : 0,
        blink: blink(t),
      });
      frog.set({ mood: 'laugh', legs: spl ? 'jump' : 'stand', armL: [110, -20], armR: [110, -20] });
      monkey.set({ mood: 'happy', armL: [80, -30], armR: [80, -30] });
      turtle.set({ mood: 'happy', armL: [20, 10], armR: [20, 10] });
      shoot(t, V3(-1.8, 1.2, 3.45), V3(-1.95, 1.12, 2.95), V3(-2.15, 0.54, 0.65), null, k, { ...LOOK, fov: 46 });
      blit();
      if (spl) {
        const [sx, sy] = project(V3(-2.45, 0.12, 0.55), cam);
        drawSplashDrops(sx, sy, t - wsp, 10);
      }
    } });
    cue(wsp, 'plop', { gain: 0.8 }); cue(wsp + 0.08, 'boing', { gain: 0.7 });
  }

  // ── 2 · 2.0–3.4s (L1): "to send Ellie running!" ────────────────────────
  {
    const st = cut(1);
    add({ id: 'S02', at: st, note: 'Ellie scrambles away in panic behind the jungle grass', draw(lt, d, t, blit) {
      resetStage();
      const k = clamp(lt / d), ex = lerp(-1.8, -4.0, eo(k));
      ellie.at(ex, 0, lerp(0.7, 0.25, k)); frog.at(-2.5, 0, 0.55);
      ellie.set({ mood: 'shock', legs: 'run', phase: t * 24, lean: -14, flip: true, earFlap: 0.25, sweat: 1, trunk: 0.35 });
      frog.set({ mood: 'happy', armL: [60, -30], armR: [60, -30] });
      shoot(t, V3(ex + 0.8, 1.1, 2.8), V3(ex + 0.4, 1.05, 2.5), V3(ex - 0.15, 0.55, 0.45), null, k);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.1, 'zip', { gain: 0.65 });
  }

  // ── 3 · 3.4–6.0s (L2): "Ellie was the tiniest elephant in the jungle," ──
  {
    const st = cut(2);
    add({ id: 'S03', at: st, note: 'warm intro of tiny baby Ellie in sunlit jungle clearing', draw(lt, d, t, blit) {
      resetStage();
      const k = eio(clamp(lt / d));
      ellie.at(-1.8, 0, 1.0);
      ellie.set({ mood: 'happy', trunk: 0.2 + Math.sin(t * 4) * 0.15, earFlap: Math.sin(t * 5) * 0.08, blink: blink(t) });
      monkey.set({ mood: 'happy' }); frog.set({ mood: 'happy' }); turtle.set({ mood: 'happy' });
      shoot(t, V3(-1.35, 1.08, 3.3), V3(-1.65, 1.0, 2.65), V3(-1.8, 0.58, 1.0), null, k);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.3, 'pop', { gain: 0.45 });
  }

  // ── 4 · 6.0–7.6s (L3): "and she hated getting wet." ────────────────────
  {
    const st = cut(3);
    add({ id: 'S04', at: st, note: 'Ellie shivers looking down at the puddle on the grass', draw(lt, d, t, blit) {
      resetStage();
      const k = eio(clamp(lt / d));
      ellie.at(-2.0, 0, 0.72);
      ellie.set({ mood: 'worried', legs: 'shiver', phase: t * 14, look: [-0.7, 0.7], trunk: -0.6, sweat: 1 });
      shoot(t, V3(-1.8, 1.05, 2.65), V3(-2.05, 0.96, 2.25), V3(-2.15, 0.46, 0.65), null, k);
      blit();
    } });
    cue(st, 'whoosh');
  }

  // ── 5 · 7.6–10.0s (L4): "While her friends splashed happily in the river,"
  {
    const st = cut(4);
    add({ id: 'S05', at: st, note: 'wide river pan: Monkey, Frog, and Turtle splash & play in the sparkling river', draw(lt, d, t, blit) {
      resetStage();
      const k = eio(clamp(lt / d));
      ellie.at(-4.1, 0, 0.2);
      monkey.at(0.1, -0.16, -3.5); frog.at(1.3, -0.12 + Math.abs(Math.sin(t * 7)) * 0.16, -3.1); turtle.at(-1.1, -0.15, -3.9);
      monkey.set({ mood: 'laugh', armL: [130 + Math.sin(t * 10) * 30, -25], armR: [130 - Math.sin(t * 10) * 30, -25], bob: Math.sin(t * 8) * 8 });
      frog.set({ mood: 'laugh', legs: 'jump', armL: [120, -20], armR: [120, -20] });
      turtle.set({ mood: 'happy', armL: [90, -20], armR: [90, -20], bob: Math.sin(t * 7) * 6 });
      J.setRipple(1.3, -3.1, (t * 1.4) % 1);
      shoot(t, V3(-1.2, 1.45, 0.8), V3(0.8, 1.38, 0.5), V3(-0.2, 0.45, -3.5), V3(0.4, 0.45, -3.5), k);
      blit();
      const [sx, sy] = project(V3(1.3, 0.05, -3.1), cam);
      drawSplashDrops(sx, sy, (lt % 0.85), 8);
    } });
    cue(st, 'whoosh'); cue(st + 0.15, 'bubbles', { dur: 1.8, gain: 0.65 });
  }

  // ── 6 · 10.0–12.4s (L5): "Ellie watched alone from the dry grass." ────
  {
    const st = cut(5);
    add({ id: 'S06', at: st, note: 'sad lonely Ellie peeks from parted tall grass watching friends far in river', draw(lt, d, t, blit) {
      resetStage();
      const k = eio(clamp(lt / d));
      ellie.at(-4.1, 0, 0.25);
      ellie.set({ mood: 'sad', tears: 1, trunk: -0.5, look: [0.8, -0.1], blink: blink(t) });
      monkey.set({ mood: 'laugh', armL: [120, -20], armR: [120, -20] });
      shoot(t, V3(-4.35, 1.12, 2.75), V3(-4.08, 1.05, 2.42), V3(-3.98, 0.52, 0.15), V3(-3.80, 0.50, -0.15), k);
      blit();
    } });
    cue(st, 'whoosh');
  }

  // ── 7 · 12.4–14.4s (L6): "Suddenly, a little yellow bird" ──────────────
  {
    const st = cut(6);
    add({ id: 'S07', at: st, note: 'close-up on diagonal branch: BabyBird wobbles cheerfully on top of limb', draw(lt, d, t, blit) {
      resetStage(); downstream();
      const k = eio(clamp(lt / d));
      ellie.at(-4.1, 0, 0.25);
      bird.at(...PERCH);
      bird.set({ mood: lt > 1.0 ? 'worried' : 'happy', lean: Math.sin(t * 11) * 14, flap: Math.sin(t * 16) * 0.4, talk: talk(t, lt < 1.0) });
      shoot(t, V3(0.68, 2.52, -2.55), V3(0.95, 2.46, -2.95), V3(1.05, 2.38, -4.76), null, k);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.3, 'chirp', { dur: 1.0, gain: 0.6 });
  }

  // ── 8 · 14.4–16.6s (L7): "slipped off a branch and fell into the water!"
  {
    const st = cut(7), wslip = Wd('slipped', 7), wfell = Wd('fell', 7);
    add({ id: 'S08', at: st, note: 'BabyBird slips forward off branch and splashes into shallow river!', draw(lt, d, t, blit) {
      resetStage(); downstream();
      const k = clamp(lt / d);
      const fall = clamp((t - wslip) / Math.max(0.25, wfell + 0.35 - wslip));
      const hit = fall >= 1;
      const bx = lerp(PERCH[0], 1.48, fall);
      const by = hit ? -0.15 + Math.sin(t * 10) * 0.03 : lerp(PERCH[1], -0.15, fall * fall);
      const bz = lerp(PERCH[2], -3.85, fall);
      ellie.at(-4.1, 0, 0.25);
      bird.at(bx, by, bz);
      bird.set({ mood: 'shock', flap: Math.sin(t * 30), lean: hit ? Math.sin(t * 16) * 10 : -22 * fall });
      if (hit) J.setRipple(1.48, -3.85, (t - wfell) * 1.4);
      shoot(t, V3(0.95, 2.42, -2.35), V3(1.38, 0.98, -1.45), V3(bx, hit ? 0.12 : by + 0.14, bz), null, k);
      blit();
      if (hit) {
        const [sx, sy] = project(V3(1.48, 0.0, -3.85), cam);
        drawSplashDrops(sx, sy, t - wfell, 12);
      }
    } });
    cue(wfell, 'plop', { gain: 0.95 }); cue(wfell + 0.05, 'bubbles', { dur: 1.2, gain: 0.55 });
  }

  // ── 9 · 16.6–18.4s (L8): "He chirped and fluttered in panic," ───────────
  {
    const st = cut(8);
    add({ id: 'S09', at: st, note: 'close-up in river: BabyBird splashes & flaps in panic', draw(lt, d, t, blit) {
      resetStage(); downstream();
      const k = eio(clamp(lt / d));
      ellie.at(-1.2, 0, -0.4);
      bird.at(1.48 + Math.sin(t * 8) * 0.08, -0.15 + Math.sin(t * 14) * 0.04, -3.85);
      bird.set({ mood: 'shock', flap: Math.sin(t * 32), sweat: 1, talk: talk(t) });
      J.setRipple(1.48, -3.85, (lt * 1.6) % 1);
      shoot(t, V3(1.62, 0.65, -2.0), V3(1.52, 0.55, -2.4), V3(1.48, 0.12, -3.85), null, k);
      blit();
      const [sx, sy] = project(V3(1.48, 0.0, -3.85), cam);
      drawSplashDrops(sx, sy, (lt % 0.7), 8);
    } });
    cue(st, 'whoosh'); cue(st + 0.1, 'chirp', { dur: 1.3, gain: 0.85 });
  }

  // ── 10 · 18.4–20.4s (L9): "too small to swim back alone." ───────────────
  {
    const st = cut(9);
    add({ id: 'S10', at: st, note: 'wider view: Bird stranded in river while friends play far downstream, Ellie gasps', draw(lt, d, t, blit) {
      resetStage(); downstream();
      const k = eio(clamp(lt / d));
      ellie.at(-1.3, 0, -0.6); bird.at(1.48, -0.15, -3.85);
      monkey.at(5.8, -0.16, -4.1); frog.at(6.6, -0.14, -3.8); turtle.at(6.2, -0.15, -4.5);
      ellie.set({ mood: 'shock', earFlap: 0.25, look: [0.7, 0.1], sweat: 1 });
      bird.set({ mood: 'worried', flap: Math.sin(t * 24), sweat: 1 });
      J.setRipple(1.6, -3.9, (lt * 1.4) % 1);
      shoot(t, V3(-0.3, 1.45, 2.2), V3(-0.6, 1.3, 1.6), V3(0.4, 0.35, -3.2), V3(1.2, 0.25, -3.8), k);
      blit();
    } });
    cue(st, 'whoosh');
  }

  // ── 11 · 20.4–22.0s (L10): "Ellie's heart pounded fast." ────────────────
  {
    const st = cut(10), wh = Wd('heart', 10);
    add({ id: 'S11', at: st, note: 'tight close-up on scared trembling Ellie with pulsing cartoon heart', draw(lt, d, t, blit) {
      resetStage(); downstream();
      const k = eio(clamp(lt / d));
      ellie.at(-1.3, 0, -0.6); bird.at(1.48, -0.15, -3.85);
      ellie.set({ mood: 'worried', legs: 'shiver', phase: t * 18, sweat: 1, trunk: -0.5, look: [0.5, 0.2] });
      shoot(t, V3(-1.3, 0.95, 1.45), V3(-1.3, 0.88, 1.1), V3(-1.3, 0.56, -0.6), null, k);
      blit();
      const [hx, hy] = project(V3(-1.02, 0.54, -0.6), cam);
      const beat = 0.85 + 0.26 * Math.abs(Math.sin((t - wh) * 10));
      drawHeart(hx, hy, beat, clamp(lt * 5));
    } });
    cue(wh, 'heartbeat'); cue(wh + 0.65, 'heartbeat');
  }

  // ── 12 · 22.0–23.9s (L11): "The river looked cold and scary," ───────────
  {
    const st = cut(11);
    add({ id: 'S12', at: st, note: 'over Ellie shoulder looking at wide scary rippling river and little bird', draw(lt, d, t, blit) {
      resetStage(); downstream();
      const k = eio(clamp(lt / d));
      ellie.at(-0.8, 0, -0.9); bird.at(1.48, -0.15, -3.85);
      ellie.set({ mood: 'worried', sweat: 1, trunk: -0.4, look: [0.7, 0.1] });
      bird.set({ mood: 'worried', flap: Math.sin(t * 22) });
      J.setRipple(1.48, -3.85, (lt * 1.4) % 1);
      shoot(t, V3(-1.35, 1.15, 0.9), V3(-0.9, 1.05, 0.2), V3(0.6, 0.3, -3.4), V3(1.5, 0.15, -3.85), k);
      blit();
    } });
    cue(st, 'whoosh');
  }

  // ── 13 · 23.9–25.7s (L12): "but her new friend needed help." ───────────
  {
    const st = cut(12), whelp = Wd('help', 12);
    add({ id: 'S13', at: st, note: 'Ellie brows lock with brave determination, trunk lifts!', draw(lt, d, t, blit) {
      resetStage(); downstream();
      const k = eio(clamp(lt / d)), brave = t > whelp - 0.35;
      ellie.at(-0.8, 0, -0.9); bird.at(1.48, -0.15, -3.85);
      ellie.set({
        mood: brave ? 'determined' : 'worried',
        trunk: brave ? 0.35 : -0.4,
        earFlap: brave ? 0.12 : 0,
        bob: brave ? -Math.sin(clamp((t - (whelp - 0.35)) * 6) * Math.PI) * 14 : 0,
        look: [0.5, 0.1],
      });
      shoot(t, V3(-0.7, 0.92, 1.25), V3(-0.75, 0.85, 0.85), V3(-0.8, 0.56, -0.9), null, k);
      blit();
    } });
    cue(st + 0.15, 'pop', { gain: 0.55 });
  }

  // ── 14 · 25.7–27.5s (L13): "Taking one deep breath, she stepped in" ─────
  {
    const st = cut(13), wbr = Wd('breath', 13), wst = Wd('stepped', 13);
    add({ id: 'S14', at: st, note: 'Ellie takes a deep breath and bravely steps into the shallow river!', draw(lt, d, t, blit) {
      resetStage(); downstream();
      const k = eio(clamp(lt / d)), step = eo(clamp((t - wst + 0.05) / 0.55));
      const ez = lerp(-1.25, -2.5, step), ey = lerp(0, -0.15, step);
      ellie.at(-0.4, ey, ez); bird.at(1.48, -0.15, -3.85);
      ellie.set({
        mood: step > 0.4 ? 'determined' : 'proud',
        legs: step > 0.05 && step < 0.95 ? 'walk' : 'stand',
        phase: step * Math.PI,
        trunk: step > 0.3 ? 0.4 : 0.1,
        bob: t > wbr && t < wst ? -16 * Math.sin(clamp((t - wbr) / (wst - wbr)) * Math.PI) : 0,
      });
      if (step > 0.5) J.setRipple(-0.4, ez, (t - wst) * 1.4);
      shoot(t, V3(1.1, 0.95, -0.1), V3(1.0, 0.88, -0.5), V3(-0.2, 0.42, ez), null, k);
      blit();
      if (step > 0.55) {
        const [sx, sy] = project(V3(-0.4, 0.0, ez), cam);
        drawSplashDrops(sx, sy, t - wst - 0.15, 9);
      }
    } });
    cue(wbr, 'inhale', { dur: 0.75, gain: 0.75 }); cue(wst + 0.15, 'plop', { gain: 0.7 });
  }

  // ── 15 · 27.5–29.7s (L14): "and waded carefully toward him." ───────────
  {
    const st = cut(14);
    add({ id: 'S15', at: st, note: 'Ellie wades steadily across the sparkling blue river toward BabyBird', draw(lt, d, t, blit) {
      resetStage(); downstream();
      const k = clamp(lt / d), ex = lerp(-0.3, 0.72, k), ez = lerp(-2.6, -3.65, k);
      ellie.at(ex, -0.16, ez); bird.at(1.48, -0.15, -3.85);
      ellie.set({ mood: 'determined', legs: 'walk', phase: t * 8, trunk: 0.4, look: [0.6, 0.2] });
      bird.set({ mood: 'happy', flap: Math.sin(t * 20), look: [-0.6, 0] });
      J.setRipple(ex, ez, (lt * 1.4) % 1);
      shoot(t, V3(0.75, 1.25, 0.15), V3(1.15, 1.12, -0.35), V3(ex + 0.42, 0.38, ez - 0.25), null, k);
      blit();
    } });
    cue(st, 'whoosh');
    for (let i = 0; i < 3; i++) cue(st + 0.3 + i * 0.6, 'tock', { gain: 0.5 });
  }

  // ── 16 · 29.7–33.2s (L15): "With one gentle scoop of her trunk, she lifted him safely,"
  {
    const st = cut(15), wsc = Wd('scoop', 15), wlift = Wd('lifted', 15);
    add({ id: 'S16', at: st, note: 'Ellie reaches out trunk, scoops BabyBird up gently onto her head!', draw(lt, d, t, blit) {
      resetStage(); downstream();
      const k = eio(clamp(lt / d));
      const reach = clamp((t - wsc + 0.1) / 0.75);
      const lift = eo(clamp((t - wlift + 0.1) / 0.85));
      const ex = 0.85, ey = -0.16, ez = -3.75;
      ellie.at(ex, ey, ez);
      const bx = lerp(1.46, ex + 0.02, lift), by = lerp(-0.14, ey + 0.78, lift) + Math.sin(lift * Math.PI) * 0.24;
      bird.at(bx, by, ez + 0.05);
      ellie.set({
        mood: lift > 0.4 ? 'happy' : 'determined',
        trunk: lift > 0.5 ? lerp(2.0, 0.75, (lift - 0.5) * 2) : 1.0 + reach,
        earFlap: lift > 0.6 ? 0.15 : 0,
        look: [lift > 0.5 ? 0 : 0.6, lift > 0.5 ? -0.6 : 0.2],
      });
      bird.set({ mood: lift > 0.3 ? 'laugh' : 'happy', flap: lift < 0.9 ? Math.sin(t * 22) * 0.6 : 0.15 });
      J.setRipple(1.46, -3.82, clamp((t - st) * 0.9));
      shoot(t, V3(1.15, 1.12, -0.35), V3(1.02, 1.12, -0.82), V3(1.12, 0.34, -3.75), V3(0.95, 0.44, -3.75), k);
      blit();
    } });
    cue(st, 'whoosh'); cue(wlift, 'sparkle', { dur: 1.2, gain: 0.7 }); cue(wlift + 0.35, 'ding', { gain: 0.75 });
  }

  // ── 17 · 33.2–35.4s (L16): "and all her jungle friends cheered!" ────────
  {
    const st = cut(16), wch = Wd('cheered', 16);
    add({ id: 'S17', at: st, note: 'Monkey, Frog, and Turtle jump & cheer around Ellie inside frame!', draw(lt, d, t, blit) {
      resetStage();
      const k = eio(clamp(lt / d));
      ellie.at(0.0, 0, -0.8);
      bird.at(0.02, 0.78 + Math.abs(Math.sin(t * 8)) * 0.04, -0.75);
      monkey.at(-0.62, 0, -0.95); frog.at(0.54, 0, -0.9); turtle.at(0.96, 0, -1.25);
      ellie.set({ mood: 'laugh', trunk: 0.9, earFlap: Math.sin(t * 10) * 0.15, bob: -Math.abs(Math.sin(t * 8)) * 18 });
      bird.set({ mood: 'laugh', flap: Math.sin(t * 16) * 0.6 });
      const clap = Math.sin(t * 14) * 28;
      monkey.set({ mood: 'laugh', legs: 'jump', armL: [130 + clap, -20], armR: [130 - clap, -20] });
      frog.set({ mood: 'laugh', legs: 'jump', armL: [120 - clap, -20], armR: [120 + clap, -20] });
      turtle.set({ mood: 'laugh', legs: 'jump', armL: [120, -15], armR: [120, -15] });
      shoot(t, V3(0.14, 1.24, 3.60), V3(0.14, 1.22, 3.35), V3(0.14, 0.62, -0.95), null, k, { ...LOOK, fov: 48 });
      blit();
      if (t > wch - 0.3) {
        const [cx, cy] = project(V3(0.0, 0.85, -0.8), cam);
        drawConfetti(cx, cy, t - (wch - 0.3));
      }
    } });
    cue(st, 'whoosh'); cue(st + 0.15, 'chirp', { dur: 1.4, gain: 0.7 }); cue(wch, 'pop', { gain: 0.75 });
  }

  // ── 18 · 35.4–38.6s (L17): "Ellie smiled, knowing that being brave means trying,"
  {
    const st = cut(17), wbr = Wd('brave', 17);
    add({ id: 'S18', at: st, note: 'golden sunset: smiling Ellie & all 4 friends + "Being brave means trying!"', draw(lt, d, t, blit) {
      resetStage();
      J.setSunset(eio(clamp(lt / 0.8)));
      const k = eio(clamp(lt / d));
      ellie.at(0.0, 0, -0.8);
      bird.at(0.02, 0.78 + Math.sin(t * 7) * 0.03, -0.75);
      monkey.at(-0.62, 0, -0.95); frog.at(0.54, 0, -0.9); turtle.at(0.96, 0, -1.25);
      ellie.set({ mood: 'happy', trunk: 0.75, earFlap: Math.sin(t * 6) * 0.1, talk: talk(t, lt < 1.2), blink: blink(t) });
      bird.set({ mood: 'happy', flap: Math.sin(t * 8) * 0.25, blink: blink(t, 0.9) });
      monkey.set({ mood: 'happy', armL: [110, -25], armR: [110, -25], blink: blink(t, 1.4) });
      frog.set({ mood: 'happy', armL: [100, -25], armR: [100, -25], blink: blink(t, 0.4) });
      turtle.set({ mood: 'happy', armL: [100, -20], armR: [100, -20] });
      shoot(t, V3(0.14, 1.24, 3.35), V3(0.14, 1.30, 3.68), V3(0.14, 0.84, -0.95), V3(0.14, 0.96, -0.95), k, { ...SUNSET_LOOK, fov: 48 });
      blit();
      drawEndCard(ctx, clamp((t - wbr + 0.15) / 0.4), 0, t);
    } });
    cue(st, 'whoosh'); cue(wbr, 'ding', { gain: 0.6 });
  }

  // ── 19 · 38.6–43.4s (L18): "even when you're scared! Subscribe to Kidolu!"
  {
    const st = cut(18), wsub = Wd('Subscribe', 18);
    add({ id: 'S19', at: st, note: 'moral + KIDOLU card above all 5 smiling animals, captions clean below!', draw(lt, d, t, blit) {
      resetStage();
      J.setSunset(1);
      const k = eio(clamp(lt / d));
      const clap = Math.sin(t * 10) * 20;
      ellie.at(0.0, 0, -0.8);
      bird.at(0.02, 0.78 + Math.abs(Math.sin(t * 6)) * 0.04, -0.75);
      monkey.at(-0.62, 0, -0.95); frog.at(0.54, 0, -0.9); turtle.at(0.96, 0, -1.25);
      ellie.set({ mood: 'laugh', trunk: 0.85, earFlap: Math.sin(t * 7) * 0.12, blink: blink(t) });
      bird.set({ mood: 'laugh', flap: Math.sin(t * 14) * 0.4 });
      monkey.set({ mood: 'laugh', armL: [125 + clap, -20], armR: [125 - clap, -20], legs: 'jump' });
      frog.set({ mood: 'laugh', armL: [120 - clap, -20], armR: [120 + clap, -20], legs: 'jump' });
      turtle.set({ mood: 'laugh', armL: [120, -15], armR: [120, -15] });
      shoot(t, V3(0.14, 1.30, 3.68), V3(0.14, 1.36, 4.02), V3(0.14, 0.96, -0.95), V3(0.14, 1.04, -0.95), k, { ...SUNSET_LOOK, fov: 48 });
      blit();
      drawEndCard(ctx, 1, clamp((t - wsub + 0.15) / 0.4), t);
    } });
    cue(wsub, 'pop', { gain: 0.75 }); cue(wsub + 0.15, 'sparkle', { dur: 1.5, gain: 0.7 });
  }

  return { shots: S, cues: CUES };
}
