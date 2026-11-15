// WHY DO YOUR FINGERS WRINKLE IN WATER? — Deep Dive 3D
// Visual-first macro anatomy & scientific explainer (`cut(i)` + `Wd(word, line)`).
import * as THREE from 'three';
import { ctx, W, H, clamp, lerp, seg, eo, eio, eob } from './core/lib.js';
import { L, Wd, T } from './core/timing.js';
import { camera } from './core/engine.js';
import { Human } from './core/human.js';
import { label, pill } from './core/look2d.js';
import * as ANAT from './core/anatomy.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const lerpV = (a, b, k) => a.clone().lerp(b, k);
const screen = (p, cam) => { const v = p.clone().project(cam); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H]; };

export function buildShots(E) {
  const S = [], CUES = [], add = (o) => (S.push(o), o), cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.08);
  const cam = camera(34);

  const BLOOK = { fov: 34, aperture: 0.0018, maxblur: 0.006, bloom: 0.08, bloomThreshold: 0.92 };
  const MLOOK = { fov: 32, aperture: 0.0012, maxblur: 0.0045, bloom: 0.08, bloomThreshold: 0.90 };
  const XLOOK = { fov: 32, aperture: 0.0006, maxblur: 0.003, bloom: 0.16, bloomThreshold: 0.85, vignette: 0.42 };

  // Build all 4 continuous 3D stages once
  const B = ANAT.bathScene(E);
  const hero = new Human({ skin: '#E3A988', shirt: '#4278B8', pants: '#2D374E', hair: '#3B271A', iris: '#463226' });
  hero.group.position.set(0.10, 0, -0.48);
  B.scene.add(hero.group);

  const FM = ANAT.fingerMacro(E);
  const CA = ANAT.cutawayStage(E);
  const GC = ANAT.gripCompare(E);

  const renderSet = (scene, look, focusTarget) => {
    const fov = look.fov || 34;
    if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); }
    cam.lookAt(focusTarget);
    E.render(scene, cam, { ...look, focus: cam.position.distanceTo(focusTarget) });
  };

  // ── 1 · 0.0–1.32s (L0 pt1): HOOK — extreme macro underwater hand ────────
  {
    const st = cut(0), end = Wd('soaking', 0) - 0.08;
    add({ id: 'S01', at: st, note: 'macro underwater push-in on human fingertips starting to wrinkle', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      FM.handGroup.rotation.set(0.22, -0.22 + k * 0.15, 0.04);
      FM.setState({ wrinkle: 0.15 + 0.35 * k, xray: 0, grip: false, t });
      cam.position.copy(lerpV(V3(0.08, 0.13, 0.30), V3(0.03, 0.145, 0.22), k));
      renderSet(FM.scene, MLOOK, V3(0.015, 0.138, 0.0));
      blit();
    } });
    cue(st, 'bubbles', { dur: 2.5, gain: 0.65 });
  }

  // ── 2 · 1.32–2.66s (L0 pt2): macro sweep across wrinkling fingertips ────
  {
    const st = Wd('soaking', 0) - 0.08;
    add({ id: 'S02', at: st, note: 'closer orbit across forming fingertip wrinkle ridges underwater', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      FM.handGroup.rotation.set(0.18 - k * 0.10, 0.05 + k * 0.25, 0.03);
      FM.setState({ wrinkle: 0.5 + 0.45 * k, xray: 0, grip: false, t });
      cam.position.copy(lerpV(V3(0.04, 0.16, 0.20), V3(-0.04, 0.168, 0.168), k));
      renderSet(FM.scene, MLOOK, V3(0.015, 0.150, 0.0));
      blit();
    } });
  }

  // ── 3 · 2.66–4.54s (L1 pt1): SNAP to glowing cyan X-ray hand! ───────────
  {
    const st = cut(1);
    add({ id: 'S03', at: st, note: 'glowing cyan X-ray hand showing firing sympathetic nerve branches', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      FM.handGroup.rotation.set(0.08, 0.18 - k * 0.28, 0.02);
      FM.setState({ wrinkle: 0.7, xray: 1, pulseT: t * 0.9, grip: false, t });
      cam.position.copy(lerpV(V3(0.02, 0.06, 0.34), V3(-0.02, 0.07, 0.28), k));
      renderSet(FM.scene, XLOOK, V3(0.01, 0.04, 0.0));
      blit();
      const [lx, ly] = screen(V3(0.018, 0.06, 0.01), cam);
      label('NERVOUS SYSTEM', 540, 420, lx, ly, eob(seg(lt, 0.15, 0.45)));
    } });
    cue(st, 'whoosh'); cue(st + 0.06, 'sparkle', { dur: 1.2, gain: 0.65 });
  }

  // ── 4 · 4.54–5.78s (L1 pt2): tight push on single X-ray fingertip pulse ─
  {
    const st = Wd('changing', 1) - 0.08;
    add({ id: 'S04', at: st, note: 'macro push right onto X-ray index & middle fingertip capillaries', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      FM.handGroup.rotation.set(0.06, -0.05, 0.0);
      FM.setState({ wrinkle: 0.85, xray: 1, pulseT: t * 1.15, grip: false, t });
      cam.position.copy(lerpV(V3(-0.02, 0.11, 0.22), V3(0.02, 0.13, 0.15), k));
      renderSet(FM.scene, XLOOK, V3(0.025, 0.125, 0.0));
      blit();
    } });
    cue(st, 'pop', { gain: 0.55 });
  }

  // ── 5 · 5.78–8.73s (L2): Hero human dipping hand in glass water basin ───
  {
    const st = cut(2);
    add({ id: 'S05', at: st, note: 'warm sunlit bathroom: human immerses right hand inside glass water bowl + timer', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      B.update(t);
      hero.pose({ spine: [8, -4, 0], head: [14, -6 + k * 4, 0], shR: [44, 0, -2], elR: 8, shL: [4, 0, 8], elL: 16, look: [6, 8], lid: 0.05 });
      cam.position.copy(lerpV(V3(0.76, 1.54, 1.72), V3(0.58, 1.46, 1.38), k));
      renderSet(B.scene, BLOOK, V3(0.18, 1.32, -0.25));
      blit();
      const mins = Math.min(5, Math.floor(k * 5.4));
      const secs = Math.floor((k * 5.4 - mins) * 60) % 60;
      pill(`${mins}:${String(secs).padStart(2, '0')} MIN`, 225, 215, eob(seg(lt, 0.1, 0.35)), '#FFD43B', 'rgba(12,14,20,0.82)', 50);
    } });
    cue(st, 'whoosh'); cue(st + 0.15, 'plop', { gain: 0.65 });
  }

  // ── 6 · 8.73–10.88s (L3 pt1): underwater view switching to X-ray trigger ─
  {
    const st = cut(3);
    add({ id: 'S06', at: st, note: 'underwater hand transitions into glowing cyan nervous system impulse view', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      const xr = seg(lt, 0.6, 1.1);
      FM.handGroup.rotation.set(0.14, -0.12 + k * 0.2, 0.03);
      FM.setState({ wrinkle: 0.45, xray: xr > 0.5 ? 1 : 0, pulseT: t * 1.1, grip: false, t });
      cam.position.copy(lerpV(V3(-0.06, 0.04, 0.34), V3(0.02, 0.08, 0.28), k));
      renderSet(FM.scene, xr > 0.5 ? XLOOK : MLOOK, V3(0.015, 0.075, 0.0));
      blit();
      if (xr > 0.5) {
        const [lx, ly] = screen(V3(0.018, 0.08, 0.01), cam);
        label('NERVE SIGNAL', 340, 470, lx, ly, eob(seg(lt, 0.85, 1.2)));
      }
    } });
    cue(st + 0.7, 'sparkle', { dur: 0.9, gain: 0.6 });
  }

  // ── 7 · 10.88–11.97s (L3 pt2): signal enters 3D fingertip cutaway! ──────
  {
    const st = Wd('electrical', 3) - 0.08;
    add({ id: 'S07', at: st, note: 'dive into 3D fingertip cutaway as glowing neural pulses stream along nerve trunk', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      CA.setState({ constrict: 0.0, wrinkle: 0.0, signalOn: 1, skinXray: 0.35, t });
      cam.position.copy(lerpV(V3(-0.45, 0.06, 1.55), V3(-0.1, 0.08, 1.32), k));
      renderSet(CA.scene, XLOOK, V3(0.0, -0.02, 0.05));
      blit();
    } });
    cue(st, 'whoosh');
  }

  // ── 8 · 11.97–14.67s (L4): skin layers & blood vessels beneath fingertip ─
  {
    const st = cut(4);
    add({ id: 'S08', at: st, note: 'anatomical cutaway glide showing epidermis above dilated crimson blood vessels', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      CA.setState({ constrict: 0.0, wrinkle: 0.0, signalOn: 1, skinXray: 0, t });
      cam.position.copy(lerpV(V3(-0.1, 0.08, 1.32), V3(0.18, 0.14, 1.18), k));
      renderSet(CA.scene, XLOOK, V3(0.02, 0.03, 0.05));
      blit();
      const [ex, ey] = screen(V3(0.06, 0.25, 0.04), cam);
      const [vx, vy] = screen(V3(0.15, 0.08, 0.08), cam);
      label('EPIDERMIS', 310, 440, ex, ey, eob(seg(lt, 0.2, 0.45)));
      label('BLOOD VESSELS', 730, 1140, vx, vy, eob(seg(lt, 0.45, 0.7)));
    } });
    cue(st + 0.2, 'pop', { gain: 0.45 });
  }

  // ── 9 · 14.67–16.70s (L5 pt1): vessels actively constrict narrow! ───────
  {
    const st = cut(5), wn = Wd('narrow', 5);
    add({ id: 'S09', at: st, note: 'macro close-up: blood vessel capillaries visibly narrow sharply under cyan pulse', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      const con = eio(clamp((t - wn + 0.25) / 1.15));
      CA.setState({ constrict: con * 0.75, wrinkle: con * 0.22, signalOn: 1, skinXray: 0, t });
      cam.position.copy(lerpV(V3(0.18, 0.14, 1.18), V3(0.05, 0.05, 0.96), k));
      renderSet(CA.scene, XLOOK, V3(0.02, 0.03, 0.07));
      blit();
      pill('VASOCONSTRICTION', 540, 320, eob(seg(lt, 0.3, 0.6)), '#4FD1E8', 'rgba(12,14,20,0.85)', 54);
    } });
    cue(wn - 0.1, 'heartbeat', { gain: 0.7 });
  }

  // ── 10 · 16.70–18.34s (L5 pt2): vessels shrink thin & slow RBC flow ──────
  {
    const st = Wd('tiny', 5) - 0.08;
    add({ id: 'S10', at: st, note: 'tight view on narrowed capillaries & slowing blood flow inside fingertip', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      CA.setState({ constrict: lerp(0.75, 0.95, k), wrinkle: lerp(0.22, 0.45, k), signalOn: 1, skinXray: 0, t });
      cam.position.copy(lerpV(V3(0.05, 0.05, 0.96), V3(-0.08, 0.10, 0.92), k));
      renderSet(CA.scene, XLOOK, V3(0.0, 0.04, 0.06));
      blit();
    } });
  }

  // ── 11 · 18.34–21.28s (L6): pulp loses volume beneath the skin ──────────
  {
    const st = cut(6);
    add({ id: 'S11', at: st, note: 'subcutaneous tissue compresses downward as fluid volume drops beneath surface', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      CA.setState({ constrict: 1.0, wrinkle: lerp(0.45, 0.72, k), signalOn: 0.4, skinXray: 0, t });
      cam.position.copy(lerpV(V3(-0.08, 0.12, 0.94), V3(0.04, 0.24, 1.02), k));
      renderSet(CA.scene, XLOOK, V3(0.0, 0.12, 0.02));
      blit();
      const [px, py] = screen(V3(0.0, 0.06, 0.1), cam);
      label('VOLUME DROPS ↓', 540, 320, px, py, eob(seg(lt, 0.2, 0.5)));
    } });
    cue(st, 'whoosh'); cue(st + 0.15, 'thud', { gain: 0.5 });
  }

  // ── 12 · 21.28–23.28s (L7 pt1): outer skin pulls inward forming wrinkles ─
  {
    const st = cut(7);
    add({ id: 'S12', at: st, note: 'top angle on outer epidermis skin folding downward into crisp parallel wrinkles', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      CA.setState({ constrict: 1.0, wrinkle: lerp(0.72, 1.0, k), signalOn: 0, skinXray: 0, t });
      cam.position.copy(lerpV(V3(0.04, 0.34, 1.02), V3(-0.08, 0.42, 0.88), k));
      renderSet(CA.scene, XLOOK, V3(0.0, 0.20, 0.0));
      blit();
    } });
    cue(st, 'slide', { dur: 1.1, gain: 0.45 });
  }

  // ── 13 · 23.28–24.56s (L7 pt2): emerge back to real wrinkled fingertips ─
  {
    const st = Wd('forming', 7) - 0.12;
    add({ id: 'S13', at: st, note: 'transition out from cutaway back to glistening wrinkled fingertips underwater', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      FM.handGroup.rotation.set(0.16, 0.22 - k * 0.28, 0.03);
      FM.setState({ wrinkle: 1.0, xray: 0, grip: false, t });
      cam.position.copy(lerpV(V3(-0.02, 0.162, 0.165), V3(0.04, 0.155, 0.215), k));
      renderSet(FM.scene, MLOOK, V3(0.015, 0.148, 0.0));
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.1, 'pop', { gain: 0.55 });
  }

  // ── 14 · 24.56–28.56s (L8): side-by-side wet-grip channel comparison ─────
  {
    const st = cut(8);
    add({ id: 'S14', at: st, note: 'scientific comparison: smooth trapped water film vs wrinkled drainage grooves', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      GC.update(t);
      cam.position.copy(lerpV(V3(0.0, 0.28, 1.48), V3(0.0, 0.24, 1.25), k));
      renderSet(GC.scene, { ...XLOOK, fov: 38 }, V3(0.0, 0.02, 0.0));
      blit();
      const [lx, ly] = screen(V3(-0.145, 0.12, 0.0), cam);
      const [rx, ry] = screen(V3(0.145, 0.11, 0.0), cam);
      label('SMOOTH', 290, 520, lx, ly, eob(seg(lt, 0.15, 0.4)));
      label('CHANNELS', 790, 520, rx, ry, eob(seg(lt, 0.35, 0.6)));
      pill('WET-GRIP HYPOTHESIS', 540, 300, eob(seg(lt, 0.1, 0.35)), '#FFD43B', 'rgba(12,14,20,0.85)', 52);
    } });
    cue(st, 'whoosh');
  }

  // ── 15 · 28.56–31.99s (L9): wrinkled fingers gripping wet glass orb ─────
  {
    const st = cut(9);
    add({ id: 'S15', at: st, note: 'macro hand curling wrinkled fingertips gently around a smooth wet glass sphere', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      FM.handGroup.rotation.set(0.16, -0.45 + k * 0.22, 0.02);
      FM.setState({ wrinkle: 1.0, xray: 0, grip: true, gripCurl: 0.48 + 0.32 * Math.sin(clamp(lt / d) * Math.PI * 0.6), t });
      cam.position.copy(lerpV(V3(0.16, 0.14, 0.44), V3(0.10, 0.14, 0.38), k));
      renderSet(FM.scene, MLOOK, V3(0.0, 0.115, 0.03));
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.2, 'bubbles', { dur: 1.8, gain: 0.45 });
  }

  // ── 16 · 31.99–35.76s (L10): return to comparison — researchers debate ─
  {
    const st = cut(10);
    add({ id: 'S16', at: st, note: 'closer sweep across wet-object comparison noting ongoing scientific debate', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      GC.update(t);
      cam.position.copy(lerpV(V3(-0.08, 0.22, 1.24), V3(0.08, 0.24, 1.24), k));
      renderSet(GC.scene, { ...XLOOK, fov: 38 }, V3(0.0, 0.02, 0.0));
      blit();
      pill('STILL DEBATED ?', 540, 300, eob(seg(lt, 0.2, 0.5)), '#C9D6DD', 'rgba(12,14,20,0.85)', 54);
    } });
    cue(st, 'whoosh');
  }

  // ── 17 · 35.76–38.48s (L11): Hero human lifts hand to examine fingertips ──
  {
    const st = cut(11);
    add({ id: 'S17', at: st, note: 'same 3D human character in warm sunlight lifts wet fingertips and inspects them', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      B.update(t);
      hero.pose({ spine: [2, -2, 0], head: [12, -14, 0], shR: [52, -16, -4], elR: 78, shL: [4, 0, 8], elL: 16, look: [-10, 12], lid: -0.1 });
      cam.position.copy(lerpV(V3(-0.42, 1.54, 1.22), V3(-0.56, 1.58, 1.54), k));
      renderSet(B.scene, BLOOK, lerpV(V3(0.18, 1.38, -0.25), V3(0.12, 1.36, -0.35), k));
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.15, 'pop', { gain: 0.45 });
  }

  // ── 18 · 38.48–41.89s (L12): final dramatic macro close-up of wrinkled tips
  {
    const st = cut(12);
    add({ id: 'S18', at: st, note: 'hero macro final push-in onto sculpted wrinkled fingertips in glowing illumination', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      FM.handGroup.rotation.set(0.16, 0.22 - k * 0.30, 0.03);
      FM.setState({ wrinkle: 1.0, xray: 0, grip: false, t });
      cam.position.copy(lerpV(V3(-0.04, 0.16, 0.22), V3(0.03, 0.158, 0.168), k));
      renderSet(FM.scene, MLOOK, V3(0.015, 0.148, 0.0));
      blit();
    } });
    cue(st, 'sparkle', { dur: 1.4, gain: 0.55 });
  }

  return { shots: S, cues: CUES };
}
