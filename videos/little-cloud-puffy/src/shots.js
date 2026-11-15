// THE LITTLE CLOUD WHO COULDN'T RAIN — KIDOLU (Tall Tale 3D)
// Continuous camera-driven 3D+2D cartoon story: cut(i) = L(i) - 0.06 and Wd(word, line).
import * as THREE from 'three';
import { ctx, W, H, clamp, lerp, seg, eo, eio, eob } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import { camera } from './core/engine.js';
import { magicGarden } from './core/garden.js';
import { GardenActor, drawTeardrop, drawRainShower, drawMagicSparkles } from './core/cloud_cast.js';
import { drawEndCard } from './core/kidolu.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const mix = (a, b, k) => a.clone().lerp(b, k);
const blink = (t, off = 0) => (((t + off) % 3.1) < 0.13 ? 1 : 0);
const talk = (t, on = 1) => (on ? 0.18 + 0.65 * Math.abs(Math.sin(t * 13)) : 0);
const project = (p, cam) => { const v = p.clone().project(cam); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H]; };

export function buildShots(E) {
  const S = [], CUES = [], add = (o) => (S.push(o), o), cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.06);
  const cam = camera(45);

  const LOOK = { fov: 45, bloom: 0.04, bloomThreshold: 0.99, aperture: 0.00045, maxblur: 0.0025 };
  const MAGIC_LOOK = { fov: 46, bloom: 0.05, bloomThreshold: 0.99, aperture: 0.00045, maxblur: 0.0025, warm: 0.04 };

  const G = magicGarden(E);
  const puffy = new GardenActor('puffy', { kind: 'puffy', fillTop: '#F7FBFF', fillBot: '#D0E8FF' }, { height: 1.45, groundBlob: false });
  const big1 = new GardenActor('big', { kind: 'big', fillTop: '#F2F9FF', fillBot: '#BFE0FA' }, { height: 2.15, groundBlob: false });
  const big2 = new GardenActor('big', { kind: 'big', fillTop: '#F2F9FF', fillBot: '#BFE0FA' }, { height: 2.05, groundBlob: false });
  const sunny = new GardenActor('sunflower', {}, { height: 1.25, groundBlob: true });
  G.scene.add(puffy.group, big1.group, big2.group, sunny.group);
  const actors = [puffy, big1, big2, sunny];

  const shoot = (t, from, to, at, at2, k, look = LOOK) => {
    G.update(t);
    const fov = look.fov || 45;
    if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); }
    cam.position.copy(mix(from, to, k));
    const lookAt = at2 ? mix(at, at2, k) : at;
    cam.lookAt(lookAt);
    actors.forEach((a) => a.face(cam));
    E.render(G.scene, cam, { ...look, focus: cam.position.distanceTo(lookAt) });
  };

  // World offsets relative to cloud/sunflower group origins (for exact 2D drop & face projections)
  // Puffy height=1.45 -> cloud center is group.y + 0.56, crown is +0.76, bottom is +0.42
  const resetStage = () => {
    G.setMood({ wet: 0, rainbow: 0, overcast: 0, golden: 0 });
    sunny.at(0, 0.05, -1.5);
    big1.group.visible = false;
    big2.group.visible = false;
    puffy.group.visible = true;
  };

  // ── 1 · 0.0–1.56s (L0): HOOK — Puffy floats over colourful magical garden ─
  {
    const st = cut(0);
    add({ id: 'S01', at: st, note: 'HOOK: cute tiny Puffy floats smoothly over the colourful sunlit flower garden', draw(lt, d, t, blit) {
      resetStage();
      const k = eio(clamp(lt / d));
      const py = 1.45 + Math.sin(t * 2.8) * 0.06;
      puffy.at(0, py, -1.5);
      sunny.at(0, 0.05, -1.5);
      puffy.set({ mood: 'neutral', talk: talk(t, lt > 0.25), blink: blink(t), sx: 1.0, sy: 1.0, armL: [30, 12], armR: [30, 12] });
      sunny.set({ bloom: 0.14, mood: 'sad', look: [0, -0.4], sway: Math.sin(t * 1.6) * 0.15 });
      shoot(t, V3(0.45, 2.15, 2.15), V3(0.0, 2.02, 1.35), V3(0, 1.88, -1.5), V3(0, 1.98, -1.5), k);
      blit();
    } });
    cue(st + 0.1, 'sparkle', { dur: 0.9, gain: 0.45 });
  }

  // ── 2 · 1.56–3.10s (L1): "that couldn't make rain?" — single drop plops onto head ─
  {
    const st = cut(1), wrain = Wd('rain', 1);
    add({ id: 'S02', at: st, note: 'Puffy strains to rain; one comical single droplet pops up and lands on Puffy head!', draw(lt, d, t, blit) {
      resetStage();
      const k = eio(clamp(lt / d));
      const squeeze = t < wrain;
      const dropAge = t - wrain;
      const landed = dropAge > 0.35;
      const py = 1.45 + (landed ? -Math.max(0, Math.sin((dropAge - 0.35) * 14)) * 0.06 : Math.sin(t * 3) * 0.04);
      puffy.at(0, py, -1.5);
      sunny.at(0, 0.05, -1.5);
      puffy.set({
        mood: landed ? 'shock' : squeeze ? 'strain' : 'neutral',
        look: [0, landed ? -0.8 : 0],
        sx: squeeze ? 1.08 : landed ? 1.05 : 1.0,
        sy: squeeze ? 0.92 : landed ? 0.95 : 1.0,
        armL: squeeze ? [-25, -20] : [80, 10],
        armR: squeeze ? [-25, -20] : [80, 10],
        crownDrop: landed ? clamp((dropAge - 0.35) * 4) : 0,
        blink: blink(t, 1.4),
      });
      sunny.set({ bloom: 0.14, mood: 'sad', look: [0, -0.5] });
      shoot(t, V3(0.0, 2.02, 1.35), V3(-0.2, 2.06, 1.05), V3(0, 2.02, -1.5), null, k);
      blit();
      if (dropAge >= 0 && dropAge <= 0.36) {
        const arc = clamp(dropAge / 0.35);
        const dropYWorld = py + 0.78 + Math.sin(arc * Math.PI) * 0.42;
        const [dx, dy] = project(V3(0.03, dropYWorld, -1.48), cam);
        drawTeardrop(ctx, dx, dy, 22, 0.95, '#5CD8FF');
      }
    } });
    cue(wrain, 'pop', { gain: 0.7 });
    cue(wrain + 0.35, 'plop', { gain: 0.85 });
    cue(wrain + 0.38, 'boing', { gain: 0.65 });
  }

  // ── 3 · 3.10–5.42s (L2): "Puffy was the smallest cloud in the sky." ─────
  {
    const st = cut(2);
    add({ id: 'S03', at: st, note: 'wide sky view: tiny Puffy floats between two tall friendly Big Clouds', draw(lt, d, t, blit) {
      resetStage();
      big1.group.visible = big2.group.visible = true;
      const k = eio(clamp(lt / d));
      puffy.at(0, 1.15 + Math.sin(t * 2.5) * 0.05, -1.8);
      big1.at(-1.02, 1.85 + Math.sin(t * 1.8) * 0.06, -3.6);
      big2.at(1.02, 1.92 + Math.cos(t * 1.9) * 0.06, -3.7);
      sunny.at(0, 0.05, -1.5);
      puffy.set({ mood: 'worried', look: [-0.4, 0], blink: blink(t), armL: [10, 10], armR: [10, 10] });
      big1.set({ mood: 'happy', look: [0.5, 0.3], armL: [60, 10], armR: [60, 10] });
      big2.set({ mood: 'happy', look: [-0.5, 0.3], armL: [60, 10], armR: [60, 10] });
      sunny.set({ bloom: 0.14, mood: 'sad' });
      shoot(t, V3(-0.2, 2.02, 1.15), V3(0.0, 2.42, 3.85), V3(0, 2.05, -2.5), V3(0, 2.45, -3.4), k, { ...LOOK, fov: 48 });
      blit();
    } });
    cue(st, 'whoosh');
  }

  // ── 4 · 5.42–8.07s (L3): "While big clouds poured happy silver showers," ──
  {
    const st = cut(3);
    add({ id: 'S04', at: st, note: 'pan past cheerful Big Clouds pouring shimmering silver-blue rain curtains', draw(lt, d, t, blit) {
      resetStage();
      G.setMood({ wet: 0.1, overcast: 0.35 });
      big1.group.visible = big2.group.visible = true;
      const k = eio(clamp(lt / d));
      puffy.at(0, 1.12, -1.8);
      big1.at(-0.98, 1.88 + Math.sin(t * 2.4) * 0.05, -3.5);
      big2.at(0.98, 1.94 + Math.cos(t * 2.2) * 0.05, -3.6);
      sunny.at(0, 0.05, -1.5);
      puffy.set({ mood: 'sad', look: [k > 0.5 ? 0.7 : -0.7, -0.2], armL: [-10, 8], armR: [-10, 8] });
      big1.set({ mood: 'laugh', armL: [110, 15], armR: [110, 15], blink: blink(t, 0.5) });
      big2.set({ mood: 'laugh', armL: [110, 15], armR: [110, 15], blink: blink(t, 1.1) });
      sunny.set({ bloom: 0.14, mood: 'sad' });
      shoot(t, V3(-0.75, 2.42, 3.75), V3(0.75, 2.45, 3.85), V3(-0.25, 2.48, -3.4), V3(0.25, 2.52, -3.4), k, { ...LOOK, fov: 48 });
      blit();
      const [x1t, y1t] = project(V3(-0.98, 2.42, -3.5), cam);
      const [x1b, y1b] = project(V3(-0.98, 0.65, -3.5), cam);
      const [x2t, y2t] = project(V3(0.98, 2.48, -3.6), cam);
      const [x2b, y2b] = project(V3(0.98, 0.65, -3.6), cam);
      drawRainShower(ctx, x1t, y1t, y1b, 210, t, 18, 1.85, 0.88, 15);
      drawRainShower(ctx, x2t, y2t, y2b, 210, t + 0.4, 18, 1.85, 0.88, 15);
    } });
    cue(st, 'whoosh');
    cue(st + 0.15, 'bubbles', { dur: 2.2, gain: 0.65 });
  }

  // ── 5 · 8.07–10.08s (L4): "no matter how hard Puffy tried," ─────────────
  {
    const st = cut(4), wtried = Wd('tried', 4);
    add({ id: 'S05', at: st, note: 'tight close-up on Puffy puffing cheeks and straining hard to rain', draw(lt, d, t, blit) {
      resetStage();
      big1.group.visible = big2.group.visible = true;
      const k = eio(clamp(lt / d));
      const pulse = Math.sin(t * 22);
      puffy.at(pulse * 0.025, 1.48 + Math.abs(pulse) * 0.03, -1.5);
      big1.at(-2.2, 2.0, -3.8); big2.at(2.2, 2.0, -3.8);
      sunny.at(0, 0.05, -1.5);
      puffy.set({
        mood: 'strain',
        sx: 1.12 + pulse * 0.04,
        sy: 0.88 - pulse * 0.04,
        sweat: 1,
        armL: [-30, -35],
        armR: [-30, -35],
      });
      big1.set({ mood: 'happy' }); big2.set({ mood: 'happy' });
      shoot(t, V3(0.0, 2.08, 1.35), V3(0.0, 2.04, 0.88), V3(0, 2.02, -1.5), null, k);
      blit();
    } });
    cue(st, 'whoosh');
    cue(wtried - 0.15, 'tock', { gain: 0.4 });
  }

  // ── 6 · 10.08–12.06s (L5): "it couldn't make a single raindrop!" ──────────
  {
    const st = cut(5), ws = Wd('single', 5);
    add({ id: 'S06', at: st, note: 'one tiny fizzled drop pops away; Puffy droops disappointed with sad blue eyes', draw(lt, d, t, blit) {
      resetStage();
      const k = eio(clamp(lt / d)), fizz = t - ws;
      puffy.at(0, lerp(1.5, 1.34, clamp(fizz * 1.4)), -1.5);
      sunny.at(0, 0.05, -1.5);
      puffy.set({
        mood: fizz > 0 ? 'sad' : 'worried',
        look: [0, 0.5],
        tears: fizz > 0.35 ? 1 : 0,
        armL: [-20, -25],
        armR: [-20, -25],
        blink: blink(t),
      });
      shoot(t, V3(0.0, 2.04, 0.88), V3(0.25, 1.98, 1.38), V3(0, 1.92, -1.5), null, k);
      blit();
      if (fizz > -0.25 && fizz < 0.25) {
        const [fx, fy] = project(V3(0, 1.68, -1.48), cam);
        drawTeardrop(ctx, fx, fy, 13, clamp(1 - Math.abs(fizz) * 4), '#9CEBFF');
      }
    } });
    cue(ws, 'pop', { gain: 0.55 });
  }

  // ── 7 · 12.06–14.97s (L6): "Down below, the lush garden felt warm and dry."
  {
    const st = cut(6);
    add({ id: 'S07', at: st, note: 'continuous downward crane-pan from Puffy in sky over warm garden down to soil patch', draw(lt, d, t, blit) {
      resetStage();
      const k = eio(clamp(lt / d));
      puffy.at(-0.35, 1.65 + Math.sin(t * 2) * 0.04, -1.6);
      sunny.at(0, 0.05, -1.5);
      puffy.set({ mood: 'worried', look: [0.2, 0.65], blink: blink(t) });
      sunny.set({ bloom: 0.14, mood: 'thirsty', sweat: 1, sway: Math.sin(t * 1.4) * 0.06 });
      shoot(t, V3(0.35, 2.15, 1.8), V3(0.65, 1.25, 2.05), V3(-0.1, 1.55, -1.5), V3(0.0, 0.52, -1.5), k);
      blit();
    } });
    cue(st, 'whoosh');
  }

  // ── 8 · 14.97–17.61s (L7): "One day, Puffy spotted a tiny sunflower" ──────
  {
    const st = cut(7), wsp = Wd('spotted', 7);
    add({ id: 'S08', at: st, note: 'Puffy leans forward from upper-left sky noticing Sunny wilted below', draw(lt, d, t, blit) {
      resetStage();
      const k = eio(clamp(lt / d)), saw = t > wsp;
      puffy.at(-0.48, 1.42 + Math.sin(t * 2.4) * 0.04, -1.55);
      sunny.at(0.18, 0.05, -1.5);
      puffy.set({
        mood: saw ? 'shock' : 'worried',
        look: [0.55, 0.65],
        lean: saw ? 8 : 0,
        armL: [25, 10], armR: [55, 20],
        blink: blink(t),
      });
      sunny.set({ bloom: 0.14, mood: 'thirsty', sweat: 1, look: [-0.4, -0.5] });
      shoot(t, V3(0.45, 1.42, 2.2), V3(0.18, 1.28, 1.85), V3(-0.1, 1.05, -1.5), V3(0.08, 0.85, -1.5), k);
      blit();
    } });
    cue(wsp, 'pop', { gain: 0.5 });
  }

  // ── 9 · 17.61–20.52s (L8): "whose yellow petals drooped over cracked dry soil."
  {
    const st = cut(8);
    add({ id: 'S09', at: st, note: 'close low-angle glide around Sunny with wilted petals above parched cracked dirt', draw(lt, d, t, blit) {
      resetStage();
      const k = eio(clamp(lt / d));
      puffy.at(-0.45, 1.55, -1.6);
      sunny.at(0, 0.05, -1.5);
      sunny.set({ bloom: 0.12, mood: 'thirsty', sweat: 1, look: [0, 0.5], sway: Math.sin(t * 1.6) * 0.05 });
      shoot(t, V3(-0.55, 0.68, 0.82), V3(0.48, 0.62, 0.72), V3(0.02, 0.34, -1.5), null, k);
      blit();
    } });
    cue(st, 'whoosh');
  }

  // ── 10 · 20.52–22.61s (L9): "She desperately needed cool water." ────────
  {
    const st = cut(9);
    add({ id: 'S10', at: st, note: 'two-shot: Puffy hovers softly directly above thirsty wilted Sunny', draw(lt, d, t, blit) {
      resetStage();
      const k = eio(clamp(lt / d));
      puffy.at(0, 1.24 + Math.sin(t * 2.5) * 0.04, -1.5);
      sunny.at(0, 0.05, -1.5);
      puffy.set({ mood: 'worried', look: [0, 0.8], armL: [15, -15], armR: [15, -15], blink: blink(t, 0.7) });
      sunny.set({ bloom: 0.12, mood: 'sad', look: [0, -0.8], sweat: 1 });
      shoot(t, V3(0.55, 1.15, 2.25), V3(0.0, 1.25, 2.05), V3(0, 1.0, -1.5), null, k, { ...LOOK, fov: 46 });
      blit();
    } });
    cue(st, 'whoosh');
  }

  // ── 11 · 22.61–23.98s (L10): "Puffy took a deep breath" ──────────────────
  {
    const st = cut(10), wbr = Wd('breath', 10);
    add({ id: 'S11', at: st, note: 'close push-in: Puffy takes a big deep swelling inhale with determined cheeks', draw(lt, d, t, blit) {
      resetStage();
      const k = eio(clamp(lt / d));
      const inh = eo(clamp((t - wbr + 0.25) / 0.7));
      puffy.at(0, 1.48 + inh * 0.05, -1.5);
      sunny.at(0, 0.05, -1.5);
      puffy.set({
        mood: inh > 0.25 ? 'inhale' : 'neutral',
        sx: 1 + inh * 0.13,
        sy: 1 + inh * 0.12,
        armL: [lerp(15, 55, inh), 20],
        armR: [lerp(15, 55, inh), 20],
      });
      shoot(t, V3(0.0, 1.98, 1.5), V3(0.0, 2.04, 0.88), V3(0, 2.04, -1.5), null, k);
      blit();
    } });
    cue(wbr - 0.1, 'inhale', { dur: 0.8, gain: 0.75 });
  }

  // ── 12 · 23.98–26.41s (L11): "and squeezed tightly to try one more time."
  {
    const st = cut(11);
    add({ id: 'S12', at: st, note: 'Puffy closes eyes tightly and squeezes into a glowing determined puff!', draw(lt, d, t, blit) {
      resetStage();
      const k = eio(clamp(lt / d));
      const vib = Math.sin(t * 28) * 0.025;
      puffy.at(vib, 1.5 + Math.abs(vib) * 0.5, -1.5);
      sunny.at(0, 0.05, -1.5);
      puffy.set({
        mood: 'strain',
        sx: 1.15 - vib * 0.5,
        sy: 0.84 + vib * 0.5,
        glow: k * 0.42,
        sweat: 1,
        armL: [-38, -42],
        armR: [-38, -42],
      });
      shoot(t, V3(0.0, 2.04, 0.88), V3(-0.15, 2.06, 0.78), V3(0, 2.04, -1.5), null, k);
      blit();
    } });
    cue(st + 0.3, 'tock', { gain: 0.35 });
  }

  // ── 13 · 26.41–28.96s (L12): "And suddenly... something magical happened!"
  {
    const st = cut(12), wmag = Wd('magical', 12);
    add({ id: 'S13', at: st, note: 'magic glow & twinkling stars burst around Puffy as glowing first droplets emerge!', draw(lt, d, t, blit) {
      resetStage();
      const k = eio(clamp(lt / d));
      const popK = eo(clamp((t - wmag + 0.35) / 0.55));
      puffy.at(0, 1.5 + Math.sin(t * 4) * 0.04, -1.5);
      sunny.at(0, 0.05, -1.5);
      puffy.set({
        mood: popK > 0.2 ? 'shock' : 'strain',
        sx: lerp(1.12, 1.0, popK),
        sy: lerp(0.88, 1.04, popK),
        glow: 0.4 + popK * 0.55,
        armL: [lerp(-30, 85, popK), 15],
        armR: [lerp(-30, 85, popK), 15],
      });
      shoot(t, V3(-0.15, 2.06, 0.78), V3(0.0, 1.98, 1.25), V3(0, 1.96, -1.5), null, k, MAGIC_LOOK);
      blit();
      if (popK > 0.05) {
        const [cx, cy] = project(V3(0, 2.04, -1.48), cam);
        drawMagicSparkles(ctx, cx, cy, 240 * popK, t - wmag + 0.4, 14, true);
        const [bx, by] = project(V3(0, 1.82, -1.48), cam);
        [-110, -40, 35, 105].forEach((ox, idx) => {
          const dropY = by + 30 + ((t - wmag + idx * 0.2) * 260) % 240;
          drawTeardrop(ctx, bx + ox, dropY, 19, clamp(popK * 1.4), '#7CE6FF');
        });
      }
    } });
    cue(wmag - 0.15, 'sparkle', { dur: 1.5, gain: 0.75 });
    cue(wmag + 0.15, 'pop', { gain: 0.6 });
  }

  // ── 14 · 28.96–31.55s (L13): "Tiny glowing drops became a gentle shower!"
  {
    const st = cut(13);
    add({ id: 'S14', at: st, note: 'pull back to two-shot as glowing drops form a sparkling silver-blue shower over Sunny', draw(lt, d, t, blit) {
      resetStage();
      const k = eio(clamp(lt / d));
      G.setMood({ wet: k * 0.35, rainbow: k * 0.25 });
      puffy.at(0, 1.26 + Math.sin(t * 3.5) * 0.04, -1.5);
      sunny.at(0, 0.05, -1.5);
      puffy.set({ mood: 'happy', glow: 0.75 - k * 0.25, armL: [70, 18], armR: [70, 18], blink: blink(t) });
      sunny.set({ bloom: lerp(0.14, 0.30, k), mood: 'amazed', look: [0, -0.8] });
      shoot(t, V3(0.0, 1.55, 1.65), V3(0.0, 1.26, 2.28), V3(0, 1.32, -1.5), V3(0, 1.0, -1.5), k, MAGIC_LOOK);
      blit();
      const [px, py] = project(V3(0, 1.66, -1.48), cam);
      const [, gy] = project(V3(0, 0.15, -1.48), cam);
      drawRainShower(ctx, px, py, gy, 240, t, 20, 1.65, 0.92, 16);
    } });
    cue(st, 'whoosh');
    cue(st + 0.1, 'bubbles', { dur: 2.3, gain: 0.55 });
  }

  // ── 15 · 31.55–34.42s (L14): "Crystal raindrops danced onto the thirsty leaves."
  {
    const st = cut(14);
    add({ id: 'S15', at: st, note: 'raindrops fall directly from happy Puffy onto Sunny leaves and moistening cracked earth', draw(lt, d, t, blit) {
      resetStage();
      const k = eio(clamp(lt / d));
      G.setMood({ wet: lerp(0.35, 0.92, k), rainbow: lerp(0.25, 0.55, k) });
      puffy.at(0, 1.26 + Math.sin(t * 3.5) * 0.03, -1.5);
      sunny.at(0, 0.05, -1.5);
      puffy.set({ mood: 'happy', glow: 0.45, armL: [85, 15], armR: [85, 15] });
      sunny.set({ bloom: lerp(0.30, 0.55, k), mood: 'happy', look: [0, -0.6], sway: Math.sin(t * 4) * 0.14 });
      shoot(t, V3(-0.32, 1.15, 2.02), V3(0.32, 1.05, 1.85), V3(0, 0.85, -1.5), null, k, MAGIC_LOOK);
      blit();
      const [px, py] = project(V3(0, 1.66, -1.48), cam);
      const [, gy] = project(V3(0, 0.08, -1.48), cam);
      drawRainShower(ctx, px, py, gy, 270, t, 24, 1.75, 0.95, 17);
    } });
    cue(st + 0.25, 'plop', { gain: 0.5 });
    cue(st + 0.85, 'plop', { gain: 0.5 });
    cue(st + 1.45, 'sparkle', { dur: 1.0, gain: 0.5 });
  }

  // ── 16 · 34.42–36.98s (L15): "The little sunflower bloomed tall and bright again!"
  {
    const st = cut(15), wbl = Wd('bloomed', 15);
    add({ id: 'S16', at: st, note: 'hero transformation: Sunny uncurls upright and opens bright radiant yellow petals under rainbow!', draw(lt, d, t, blit) {
      resetStage();
      const k = eio(clamp(lt / d));
      const blK = eo(clamp((t - st) / (d * 0.72)));
      G.setMood({ wet: 1, rainbow: lerp(0.55, 0.92, blK), golden: blK * 0.5 });
      puffy.at(-0.48, 0.92 + Math.sin(t * 4) * 0.04, -1.5);
      sunny.at(0.34, 0.05, -1.5);
      puffy.set({ mood: 'laugh', glow: 0.35, armL: [115, 15], armR: [115, 15] });
      sunny.set({
        bloom: lerp(0.55, 1.0, blK),
        mood: t > wbl ? 'laugh' : 'happy',
        sway: Math.sin(t * 3.5) * 0.16,
      });
      shoot(t, V3(0.28, 1.02, 1.95), V3(0.0, 1.18, 2.38), V3(0.12, 0.78, -1.5), V3(0.0, 0.92, -1.5), k, MAGIC_LOOK);
      blit();
      const [sx, sy] = project(V3(0.34, 0.72, -1.48), cam);
      drawMagicSparkles(ctx, sx, sy, 230, t - st, 14, true);
    } });
    cue(wbl, 'ding', { gain: 0.7 });
    cue(wbl + 0.12, 'sparkle', { dur: 1.4, gain: 0.7 });
  }

  // ── 17 · 36.98–40.24s (L16): "Puffy cheered, finally discovering its special power."
  {
    const st = cut(16);
    add({ id: 'S17', at: st, note: 'joyful Puffy bounces beside radiant Sunny below the rainbow arch', draw(lt, d, t, blit) {
      resetStage();
      const k = eio(clamp(lt / d));
      G.setMood({ wet: 1, rainbow: 1.0, golden: 0.45 });
      const jump = Math.abs(Math.sin(t * 7.5)) * 0.16;
      puffy.at(-0.56, 0.52 + jump, -1.45);
      sunny.at(0.56, 0.05, -1.5);
      puffy.set({ mood: 'laugh', glow: 0.45, armL: [125, 18], armR: [125, 18], sx: 1 + jump * 0.18, sy: 1 - jump * 0.12 });
      sunny.set({ bloom: 1.0, mood: 'laugh', sway: Math.sin(t * 4.5) * 0.18 });
      shoot(t, V3(0.0, 1.18, 2.38), V3(0.0, 1.24, 2.85), V3(0, 0.92, -1.5), V3(0, 1.02, -1.5), k, { ...MAGIC_LOOK, fov: 47 });
      blit();
      const [cx, cy] = project(V3(0, 1.15, -1.45), cam);
      drawMagicSparkles(ctx, cx, cy, 320, t - st, 14, true);
    } });
    cue(st, 'whoosh');
    cue(st + 0.25, 'pop', { gain: 0.6 });
    cue(st + 0.4, 'chirp', { dur: 1.3, gain: 0.6 });
  }

  // ── 18 · 40.24–42.32s (L17): "Remember, even the smallest among us" ──────
  {
    const st = cut(17), wsm = Wd('smallest', 17);
    add({ id: 'S18', at: st, note: 'rainbow garden pull-out with Puffy & Sunny + moral banner rising cleanly above', draw(lt, d, t, blit) {
      resetStage();
      const k = eio(clamp(lt / d));
      G.setMood({ wet: 1, rainbow: 1.0, golden: 0.6 });
      puffy.at(-0.58, 0.42 + Math.sin(t * 3.8) * 0.06, -1.45);
      sunny.at(0.58, 0.05, -1.5);
      puffy.set({ mood: 'happy', glow: 0.28, armL: [110, 18], armR: [110, 18], blink: blink(t) });
      sunny.set({ bloom: 1.0, mood: 'happy', sway: Math.sin(t * 3.2) * 0.14, blink: blink(t, 1.1) });
      shoot(t, V3(0.0, 1.24, 2.85), V3(0.0, 1.40, 3.35), V3(0, 1.02, -1.5), V3(0, 1.12, -1.5), k, { ...MAGIC_LOOK, fov: 48 });
      blit();
      drawEndCard(ctx, clamp((t - wsm + 0.2) / 0.4), 0, t);
    } });
    cue(st, 'whoosh');
    cue(wsm, 'ding', { gain: 0.55 });
  }

  // ── 19 · 42.32–47.41s (L18): "can make a BIG difference! Subscribe to Kidolu!"
  {
    const st = cut(18), wsub = Wd('subscribe', 18);
    add({ id: 'S19', at: st, note: 'KIDOLU vector logo + "LIKE, SUBSCRIBE & JOIN OUR LITTLE WORLD!" over rainbow finale', draw(lt, d, t, blit) {
      resetStage();
      const k = eio(clamp(lt / d));
      G.setMood({ wet: 1, rainbow: 1.0, golden: 0.72 });
      const bob = Math.abs(Math.sin(t * 5.2)) * 0.08;
      puffy.at(-0.58, 0.42 + bob, -1.45);
      sunny.at(0.58, 0.05, -1.5);
      const wave = Math.sin(t * 10) * 18;
      puffy.set({ mood: 'laugh', glow: 0.35, armL: [120 + wave, 18], armR: [120 - wave, 18] });
      sunny.set({ bloom: 1.0, mood: 'laugh', sway: Math.sin(t * 4) * 0.16 });
      shoot(t, V3(0.0, 1.40, 3.35), V3(0.0, 1.48, 3.72), V3(0, 1.12, -1.5), V3(0, 1.18, -1.5), k, { ...MAGIC_LOOK, fov: 48 });
      blit();
      drawEndCard(ctx, 1, clamp((t - wsub + 1.15) / 0.45), t);
    } });
    cue(wsub - 1.0, 'pop', { gain: 0.7 });
    cue(wsub, 'sparkle', { dur: 1.6, gain: 0.75 });
  }

  return { shots: S, cues: CUES };
}
