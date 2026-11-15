// THE RABBIT AND THE TURTLE: narrated by Grandpa to children (Tall Tale 3D).
// Pure function of time t using cut(i) = L(i) - 0.06 and Wd(word, line).
import * as THREE from 'three';
import { ctx, W, H, clamp, lerp, seg, eo, eio, eob } from './core/lib.js';
import { L, Wd, T as TM } from './core/timing.js';
import { camera } from './core/engine.js';
import * as WD from './core/world.js';
import * as PR from './core/props.js';
import { Toon, PROPS, INK } from './core/toon.js';
import { Critter } from './core/critters.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const mix = (a, b, k) => a.clone().lerp(b, k);
const talk = (t, on = 1) => (on ? 0.25 + 0.75 * Math.abs(Math.sin(t * 13)) * (0.6 + 0.4 * Math.sin(t * 5.3)) : 0);
const blink = (t, off = 0) => (((t + off) % 3.4) < 0.12 ? 1 : 0);
const project = (p, cam) => { const v = p.clone().project(cam); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H]; };
const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

const LOOK = {
  grandpa: {
    body: '#8C6239', pattern: 'vest', patCol: '#5A3A22', neck: 'bowtie', neckCol: '#D8343F',
    hair: 'grandpa', hairCol: '#E2E4EA', mustacheCol: '#E2E4EA', extra: ['mustache', 'glasses', 'blush'],
  },
  girl: { body: '#E58A9A', hat: 'bow', hatCol: '#D8343F', hairCol: '#6B4A3A', kid: true, neck: 'collar', extra: ['freckles'] },
  boy: { body: '#5C8FD6', hat: 'cap', hatCol: '#3E5FA8', kid: true, pattern: 'overalls', patCol: '#3E5FA8', extra: ['blush'] },
};

const SPECTATOR_LOOKS = [
  { body: '#E8734A', hat: 'cap', hatCol: '#6E8A4F' },
  { body: '#F2B8C6', hat: 'flower', pattern: 'apron' },
  { body: '#9BC46A', hat: 'boater', hatCol: '#E8C77A', extra: ['mustache'] },
  { body: '#8C6FC9', hat: 'bowler', hatCol: '#3B3346' },
  { body: '#F2C230', hat: 'beanie', hatCol: '#D8343F', kid: true, pattern: 'overalls' },
  { body: '#4FB3A9', hat: 'none', neck: 'bowtie', neckCol: '#D8343F' },
  { body: '#D8584A', hat: 'bow', hatCol: '#3C6FB6', kid: true, extra: ['freckles'] },
];

function drawZzz(x, y, lt) {
  ctx.save();
  for (let i = 0; i < 3; i++) {
    const p = ((lt * 0.65 + i * 0.33) % 1);
    const zx = x + Math.sin(p * 5 + i) * 24 + i * 20;
    const zy = y - p * 150;
    const sc = (0.65 + p * 0.5) * Math.sin(Math.min(1, p * 4) * Math.PI * 0.5) * (1 - Math.max(0, (p - 0.75) * 4));
    if (sc <= 0.02) continue;
    ctx.save(); ctx.translate(zx, zy); ctx.scale(sc, sc);
    ctx.font = '900 70px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round'; ctx.lineWidth = 14; ctx.strokeStyle = INK; ctx.strokeText('Z', 0, 0);
    ctx.fillStyle = '#FFE57A'; ctx.fillText('Z', 0, 0);
    ctx.restore();
  }
  ctx.restore();
}

function drawDust(x, y, lt, dir = -1) {
  ctx.save();
  for (let i = 0; i < 6; i++) {
    const p = ((lt * 1.9 + i * 0.17) % 1);
    const dx = x + dir * (40 + p * 220) + Math.sin(i * 3) * 20;
    const dy = y - p * 45 - Math.abs(Math.sin(i * 2.1)) * 35;
    const r = (24 + (i % 3) * 14) * (1 - p * 0.4);
    ctx.globalAlpha = (1 - p) * 0.78;
    ctx.fillStyle = '#F5E8CE'; ctx.strokeStyle = INK; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(dx, dy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

function drawCountdown(word, x, y, p, col = '#FFE57A') {
  if (p <= 0 || p >= 1) return;
  const sc = p < 0.22 ? eob(p / 0.22) * 1.15 : lerp(1.15, 0.96, (p - 0.22) / 0.78);
  const alpha = p > 0.78 ? 1 - (p - 0.78) / 0.22 : 1;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.font = '900 148px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round'; ctx.lineWidth = 24; ctx.strokeStyle = INK; ctx.strokeText(word, 0, 0);
  ctx.fillStyle = col; ctx.fillText(word, 0, 0);
  ctx.restore();
}

function drawConfetti(x, y, lt) {
  ctx.save();
  const cols = ['#F2D23A', '#D8343F', '#5C8FD6', '#74B858', '#F29BB5'];
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2 + 0.2;
    const sp = 160 + (i % 4) * 95;
    const p = clamp(lt / 1.5);
    const px = x + Math.cos(a) * sp * eo(p);
    const py = y + Math.sin(a) * sp * eo(p) * 0.7 + p * p * 180 - 90 * eo(p);
    ctx.save(); ctx.translate(px, py); ctx.rotate(p * 8 + i);
    ctx.globalAlpha = clamp((1 - p) * 1.6);
    ctx.fillStyle = cols[i % cols.length]; ctx.strokeStyle = INK; ctx.lineWidth = 4;
    ctx.fillRect(-14, -9, 28, 18); ctx.strokeRect(-14, -9, 28, 18);
    ctx.restore();
  }
  ctx.restore();
}

export function buildShots(E) {
  const S = [], CUES = [], add = (o) => (S.push(o), o), cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.06);
  const cam = camera(42);
  const LOOKS = {
    room: { fov: 48, bloom: 0.22, aperture: 0.001, maxblur: 0.006 },
    sunsetRoom: { fov: 48, bloom: 0.28, aperture: 0.001, maxblur: 0.006, warm: 0.08 },
    field: { fov: 44, bloom: 0.18, aperture: 0.001, maxblur: 0.006 },
  };
  const shoot = (scene, actors, from, to, at, at2, k, look, focus) => {
    const fov = look.fov || 44;
    if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); }
    cam.position.copy(mix(from, to, k));
    const lookTarget = at2 ? mix(at, at2, k) : at;
    cam.lookAt(lookTarget);
    actors.forEach((p) => p.face(cam));
    E.render(scene, cam, { ...look, focus: focus ?? cam.position.distanceTo(lookTarget) });
  };

  // ── SET 1: SUNNY MEADOW RACE TRACK (MD) ──────────────────────────────────
  // Keep flowers/tufts off the dirt race track and widen the flat grass circle so START (-9.2) to FINISH (+9.2) stay flat!
  const MD = WD.meadow(E, { fenceOn: false, flowers: false, treesOn: true });
  MD.scene.traverse((o) => {
    if (o.isMesh && o.geometry?.parameters?.width === 200) {
      const p = o.geometry.attributes.position;
      for (let i = 0; i < p.count; i++) {
        if (Math.abs(p.getX(i)) < 22 && Math.abs(p.getY(i)) < 16) p.setZ(i, 0.48);
      }
      o.geometry.computeVertexNormals();
    }
  });
  MD.sun.key.position.set(8, 15, 9); MD.sun.key.target.position.set(0, 0, -4);
  Object.assign(MD.sun.key.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16 });
  MD.sun.key.shadow.camera.updateProjectionMatrix();

  const flatGrass = new THREE.Mesh(new THREE.CircleGeometry(18, 48), WD.mat({ map: WD.T.grass('#6DBB4A', [9, 9]) }));
  flatGrass.rotation.x = -Math.PI / 2; flatGrass.position.set(0, 0.002, -4); flatGrass.receiveShadow = true; MD.scene.add(flatGrass);

  // scatter wildflowers & grass tufts ONLY outside the dirt track strip (|z + 4| > 1.8)
  {
    const fl = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.05, 0), new THREE.MeshStandardMaterial({ roughness: 0.6 }), 1400);
    const tufts = new THREE.InstancedMesh(new THREE.ConeGeometry(0.025, 0.16, 3), WD.mat({ color: '#5DA83E' }), 3200);
    const m4 = new THREE.Matrix4();
    let fi = 0, ti = 0;
    for (let i = 0; i < 2200 && fi < 1400; i++) {
      const x = (rnd(i * 1.3) - 0.5) * 30, z = (rnd(i * 2.7) - 0.5) * 24 - 4;
      if (Math.abs(z + 4) < 1.85) continue;
      m4.makeTranslation(x, 0.07, z); fl.setMatrixAt(fi, m4);
      fl.setColorAt(fi, new THREE.Color(['#F2D23A', '#F29BB5', '#FFFFFF', '#B98ACF', '#F28C4A'][fi % 5]));
      fi++;
    }
    fl.count = fi; MD.scene.add(fl);
    for (let i = 0; i < 5000 && ti < 3200; i++) {
      const x = (rnd(i * 3.1) - 0.5) * 30, z = (rnd(i * 4.3) - 0.5) * 22 - 4;
      if (Math.abs(z + 4) < 1.75) continue;
      m4.makeTranslation(x, 0.07, z); tufts.setMatrixAt(ti++, m4);
    }
    tufts.count = ti; MD.scene.add(tufts);
  }

  // clean dirt race track running x = -13..+13 at z = -4
  const track = new THREE.Mesh(
    new THREE.BoxGeometry(26, 0.03, 3.1),
    WD.mat({ map: WD.T.dirt('#C98A52', [1, 9], true) }),
  );
  track.position.set(0, 0.018, -4); track.receiveShadow = true; MD.scene.add(track);
  [-5.5, -2.5].forEach((z) => {
    const line = new THREE.Mesh(new THREE.PlaneGeometry(26, 0.09), new THREE.MeshBasicMaterial({ color: '#F7F3E6' }));
    line.rotation.x = -Math.PI / 2; line.position.set(0, 0.036, z); MD.scene.add(line);
  });

  const startArch = PR.raceArch('START', { bg: '#2E4E3F', fg: '#F2D37A' });
  startArch.position.set(-9.4, 0, -4); MD.scene.add(startArch);

  const finishArch = PR.raceArch('FINISH', { bg: '#B5372E', fg: '#FFF4E0', ribbon: true });
  finishArch.position.set(9.4, 0, -4); MD.scene.add(finishArch);

  const oak = PR.shadyTree();
  oak.position.set(0.8, 0, -6.1); MD.scene.add(oak);

  const fence1 = WD.fence(24); fence1.position.set(-12, 0, -6.9); MD.scene.add(fence1);
  const crowd = SPECTATOR_LOOKS.map((lk, i) => {
    const sp = new Toon(lk, { height: lk.kid ? 1.4 : 1.72, res: 1 });
    sp.at(-8.4 + i * 2.9, 0, -7.5 - (i % 2) * 0.35);
    MD.scene.add(sp.group);
    return sp;
  });

  const rabbit = new Critter('rabbit', {}, { height: 1.48 });
  const turtle = new Critter('turtle', {}, { height: 0.96 });
  MD.scene.add(rabbit.group, turtle.group);
  const mdActors = [...crowd, rabbit, turtle];

  const winCam = new THREE.PerspectiveCamera(42, 4 / 3, 0.1, 800);
  winCam.position.set(-10.5, 1.8, 0.5); winCam.lookAt(0, 1.5, -5);
  mdActors.forEach((a) => a.face(winCam));
  const meadowTex = WD.snapshot(E, MD.scene, winCam);
  meadowTex.wrapS = THREE.RepeatWrapping;

  // ── SET 2: GRANDPA'S COZY STORYBOOK ROOM (RM) ────────────────────────────
  const RM = WD.interior(E, {
    w: 7.4, depth: 6.4, h: 4.1,
    wall: '#B86B43', motif: '#C97B52', floor: '#8A5430', ceiling: '#4A3224',
    view: meadowTex, counterOn: false, litter: false, signText: null, picture: true,
  });
  const chair = PR.armchair({ col: '#8A3E36', wood: '#6B3E26' });
  chair.position.set(0.0, 0, -3.72); RM.scene.add(chair);
  const rug = PR.rug({ w: 3.2, d: 2.3 }); rug.position.set(0.0, 0.01, -2.05); RM.scene.add(rug);

  const grandpa = new Toon({ ...LOOK.grandpa, extra: [...LOOK.grandpa.extra] }, { height: 1.76 });
  const rmGirl = new Toon({ ...LOOK.girl, extra: [...LOOK.girl.extra] }, { height: 1.38 });
  const rmBoy = new Toon({ ...LOOK.boy, extra: [...LOOK.boy.extra] }, { height: 1.38 });
  grandpa.at(0.0, 0.22, -3.14);
  rmGirl.at(-0.54, 0.02, -2.2);
  rmBoy.at(0.54, 0.02, -2.24);
  RM.scene.add(grandpa.group, rmGirl.group, rmBoy.group);
  const rmActors = [grandpa, rmGirl, rmBoy];

  const poseCrowd = (t, mood = 'happy', excite = 1) => crowd.forEach((p, i) => {
    const wave = Math.sin(t * (5 + (i % 3)) + i) * 28 * excite;
    p.set({
      mood: i % 2 === 0 ? mood : 'happy',
      armL: [110 + wave, -20], armR: [110 - wave, -20],
      legs: excite > 0.6 && i % 2 === 0 ? 'jump' : 'stand',
      bob: Math.abs(Math.sin(t * 7 + i)) * 10 * excite,
      blink: blink(t, i * 0.7),
    });
  });

  // ── 1 · L0: "Gather round, kids, and let me tell you" (Cozy Room) ───────
  {
    const st = cut(0);
    add({ id: 'S01', at: st, note: 'cozy room: Grandpa sits in armchair with TALES book, kids sit on rug', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      grandpa.set({ mood: 'happy', legs: 'sit', talk: talk(t), armL: [46, -32], armR: [72, -46], holdR: PROPS.book('TALES', 1), v: 'open', look: [0, 0.25], blink: blink(t) });
      rmGirl.set({ mood: 'happy', legs: 'sit', look: [0.6, -0.4], armL: [26, -34], armR: [26, -34], blink: blink(t, 1.1) });
      rmBoy.set({ mood: 'laugh', legs: 'sit', look: [-0.6, -0.4], armL: [42, -20], armR: [35, -30], blink: blink(t, 2.0) });
      shoot(RM.scene, rmActors, V3(0.08, 1.5, 1.75), V3(0.0, 1.42, 1.15), V3(0.0, 0.86, -2.85), null, k, LOOKS.room);
      blit();
    } });
    cue(st + 0.15, 'pop', { gain: 0.45 });
  }

  // ── 2 · L1: "about the fastest rabbit in the whole forest." (Meadow) ────
  {
    const st = cut(1);
    add({ id: 'S02', at: st, note: 'sunny meadow: Rabbit bounces & flexes smugly ahead of START arch', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      finishArch.setBreak?.(0); poseCrowd(t, 'neutral', 0.25);
      rabbit.at(-7.4, 0.036, -3.55); turtle.at(-8.5, 0.036, -4.35);
      const bounce = Math.abs(Math.sin(t * 7)) * 18;
      rabbit.set({ mood: 'smug', armL: [115, -45], armR: [115, -45], bob: -bounce, look: [0.2, 0], blink: blink(t) });
      turtle.set({ mood: 'neutral', armL: [14, 10], armR: [14, 10], look: [0.6, -0.2], blink: blink(t, 1.5) });
      shoot(MD.scene, mdActors, V3(-5.2, 1.4, 0.4), V3(-6.0, 1.32, -0.2), V3(-7.7, 0.78, -3.8), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.35, 'boing', { gain: 0.55 });
  }

  // ── 3 · L2: "He loved bragging to the little turtle," ───────────────────
  {
    const st = cut(2), wt = Wd('turtle', 2);
    add({ id: 'S03', at: st, note: 'Rabbit laughs pointing at tiny steady Turtle (clear of arch posts)', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      poseCrowd(t, 'neutral', 0.2);
      rabbit.at(-7.3, 0.036, -3.7); turtle.at(-8.4, 0.036, -3.9);
      rabbit.set({ mood: 'laugh', armL: [85, -35], armR: [24, 10], flip: true, look: [0.8, 0.4], bob: Math.sin(t * 14) * 5 });
      turtle.set({ mood: t > wt ? 'proud' : 'neutral', armL: [14, 8], armR: [14, 8], look: [0.8, -0.3], blink: blink(t, 0.5) });
      shoot(MD.scene, mdActors, V3(-7.2, 1.15, -0.1), V3(-7.8, 1.0, -0.9), V3(-7.8, 0.68, -3.8), V3(-8.3, 0.55, -3.9), k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(wt, 'pop', { gain: 0.45 });
  }

  // ── 4 · L3: "until one sunny morning, the turtle challenged him to a race."
  {
    const st = cut(3), wc = Wd('challenged', 3);
    add({ id: 'S04', at: st, note: 'Turtle raises arm boldly on challenged; Rabbit smirks slyly', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      poseCrowd(t, 'happy', 0.45);
      rabbit.at(-7.2, 0.036, -3.75); turtle.at(-8.4, 0.036, -3.9);
      const ch = eo(clamp((t - wc + 0.1) / 0.25));
      turtle.set({ mood: ch > 0.3 ? 'proud' : 'happy', armR: [lerp(15, 130, ch), -15], armL: [20, 10], look: [0.8, -0.2] });
      rabbit.set({ mood: ch > 0.5 ? 'sly' : 'smug', armL: [50, -50], armR: [50, -50], flip: true, lean: -4, blink: blink(t) });
      shoot(MD.scene, mdActors, V3(-7.6, 1.18, 0.0), V3(-7.3, 1.15, -0.5), V3(-7.8, 0.65, -3.8), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(wc, 'ding', { gain: 0.65 });
  }

  // ── 5 · L4: "All the forest neighbors lined up to watch," ──────────────
  {
    const st = cut(4);
    add({ id: 'S05', at: st, note: 'cheering crowd along the wooden meadow fence', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      poseCrowd(t, 'laugh', 0.9);
      rabbit.at(-9.2, 0.036, -3.5); turtle.at(-9.2, 0.036, -4.45);
      rabbit.set({ mood: 'smug', armL: [110, -20], armR: [110, -20] });
      turtle.set({ mood: 'happy', armL: [30, -20], armR: [30, -20] });
      shoot(MD.scene, mdActors, V3(-6.2, 1.5, -2.1), V3(-0.6, 1.5, -2.3), V3(-6.4, 1.1, -7.4), V3(-1.8, 1.1, -7.4), k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(st + 0.25, 'chirp', { dur: 1.5, gain: 0.7 });
  }

  // ── 6 · L5: "and at three, two, one, they were off!" ───────────────────
  {
    const st = cut(5), w3 = Wd('three', 5), w2 = Wd('two', 5), w1 = Wd('one', 5), woff = Wd('off', 5);
    add({ id: 'S06', at: st, note: 'START arch: 3, 2, 1 countdown cleanly above arch then Rabbit blasts off!', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      poseCrowd(t, 'happy', 0.85);
      const go = clamp((t - woff) / Math.max(0.25, (st + d) - woff));
      const rx = -9.2 + eo(go) * 5.8;
      const tx = -9.2 + go * 0.45;
      rabbit.at(rx, 0.036, -3.45); turtle.at(tx, 0.036, -4.45);
      rabbit.set({
        mood: t < woff ? 'sly' : 'laugh',
        legs: t < woff ? 'stand' : 'run',
        phase: t * 22, lean: t < woff ? 12 : 18,
        armL: t < woff ? [35, -35] : [110, -30], armR: t < woff ? [35, -35] : [110, -30],
      });
      turtle.set({ mood: 'happy', legs: t < woff ? 'stand' : 'walk', phase: t * 6, armL: [25, -15], armR: [25, -15] });
      shoot(MD.scene, mdActors, V3(-5.1, 1.55, 1.45), V3(-4.5, 1.48, 0.9), V3(-8.5, 1.05, -4.0), V3(-7.3, 1.0, -4.0), k, { ...LOOKS.field, fov: 46 });
      blit();
      drawCountdown('3', 540, 290, clamp((t - w3 + 0.04) / 0.46), '#FFE57A');
      drawCountdown('2', 540, 290, clamp((t - w2 + 0.04) / 0.34), '#FFE57A');
      drawCountdown('1', 540, 290, clamp((t - w1 + 0.04) / 0.32), '#FFE57A');
      drawCountdown('GO!', 540, 290, clamp((t - woff + 0.02) / 0.65), '#74E87A');
      if (t > woff) {
        const [dx, dy] = project(V3(rx - 0.35, 0.14, -3.45), cam);
        drawDust(dx, dy, t - woff, -1);
      }
    } });
    cue(st, 'whoosh'); cue(w3, 'tock'); cue(w2, 'tock'); cue(w1, 'tock'); cue(woff, 'ding', { gain: 0.85 }); cue(woff + 0.02, 'zip');
  }

  // ── 7 · L6: "The rabbit zoomed miles ahead in seconds," ─────────────────
  {
    const st = cut(6);
    add({ id: 'S07', at: st, note: 'fast tracking shot: Rabbit centered-right with dust trail behind him', draw(lt, d, t, blit) {
      const k = clamp(lt / d);
      poseCrowd(t, 'shock', 0.7);
      const rx = lerp(-5.0, 0.6, eo(k)), tx = lerp(-8.8, -7.8, k);
      rabbit.at(rx, 0.036, -3.65); turtle.at(tx, 0.036, -4.4);
      rabbit.set({ mood: 'laugh', legs: 'run', phase: t * 26, lean: 16, armL: [110, -40], armR: [110, -40] });
      turtle.set({ mood: 'neutral', legs: 'walk', phase: t * 6 });
      shoot(MD.scene, mdActors, V3(rx + 2.2, 1.3, 0.55), V3(rx + 1.9, 1.22, 0.15), V3(rx - 0.25, 0.72, -3.7), null, k, LOOKS.field);
      blit();
      const [dx, dy] = project(V3(rx - 0.3, 0.16, -3.65), cam);
      drawDust(dx, dy, lt, -1);
    } });
    cue(st, 'whoosh'); cue(st + 0.15, 'slide', { dur: 1.4, gain: 0.7 });
  }

  // ── 8 · L7: "then looked back and saw nobody behind him." ───────────────
  {
    const st = cut(7), wb = Wd('back', 7);
    add({ id: 'S08', at: st, note: 'Rabbit stands right-of-center looking back down empty dirt path', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      poseCrowd(t, 'neutral', 0.25);
      rabbit.at(0.6, 0.036, -3.6); turtle.at(-7.4, 0.036, -4.4);
      const peek = t > wb;
      rabbit.set({ mood: peek ? 'sly' : 'smug', flip: peek, armL: peek ? [130, -85] : [35, -30], armR: [25, 10], look: peek ? [0.7, 0] : [0, 0] });
      turtle.set({ mood: 'neutral', legs: 'walk', phase: t * 6 });
      shoot(MD.scene, mdActors, V3(2.4, 1.4, 0.35), V3(2.7, 1.32, -0.2), V3(-0.3, 0.75, -3.7), V3(-0.9, 0.75, -3.8), k, { ...LOOKS.field, fov: 48 });
      blit();
    } });
    cue(st, 'whoosh'); cue(wb, 'boing', { gain: 0.55 });
  }

  // ── 9 · L8: "With plenty of time to spare, he sat under a shady tree" ────
  {
    const st = cut(8), wsat = Wd('sat', 8);
    add({ id: 'S09', at: st, note: 'Rabbit plops down lazily against the shady oak tree', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      poseCrowd(t, 'neutral', 0.2);
      const sit = t > wsat;
      rabbit.at(0.9, 0.036, -4.95); turtle.at(-6.6, 0.036, -4.2);
      rabbit.set({ mood: sit ? 'tired' : 'smug', legs: sit ? 'sit' : 'stand', armL: sit ? [28, -20] : [45, -40], armR: sit ? [28, -20] : [45, -40], lean: sit ? -6 : 0, bob: sit ? 22 : 0 });
      turtle.set({ mood: 'neutral', legs: 'walk', phase: t * 6 });
      shoot(MD.scene, mdActors, V3(1.2, 1.85, -1.0), V3(1.15, 1.05, -1.9), V3(0.9, 0.72, -5.1), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh'); cue(wsat, 'plop', { gain: 0.7 });
  }

  // ── 10 · L9: "and closed his eyes for just a quick nap." ───────────────
  {
    const st = cut(9), wn = Wd('eyes', 9);
    add({ id: 'S10', at: st, note: 'close-up under oak: Rabbit eyes droop shut, golden Zzzs float up', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      poseCrowd(t, 'neutral', 0.1);
      const asleep = t > wn;
      rabbit.at(0.9, 0.036, -4.95); turtle.at(-5.2, 0.036, -4.1);
      rabbit.set({ mood: asleep ? 'sleep' : 'tired', legs: 'sit', snoozePhase: t * 3.5, armL: [24, -18], armR: [24, -18], lean: -8, bob: 22 });
      turtle.set({ mood: 'happy', legs: 'walk', phase: t * 6 });
      shoot(MD.scene, mdActors, V3(1.15, 1.08, -1.8), V3(1.05, 0.96, -2.4), V3(0.9, 0.65, -4.95), null, k, LOOKS.field);
      blit();
      if (asleep) {
        const [zx, zy] = project(V3(0.92, 0.92, -4.95), cam);
        drawZzz(zx, zy, t - wn);
      }
    } });
    cue(st, 'whoosh'); cue(wn, 'inhale', { dur: 1.2, gain: 0.65 });
  }

  // ── 11 · L10: "Meanwhile, the little turtle just kept walking," ─────────
  {
    const st = cut(10);
    add({ id: 'S11', at: st, note: 'low grass-level tracking shot: Turtle plods steadily above captions', draw(lt, d, t, blit) {
      const k = clamp(lt / d);
      poseCrowd(t, 'happy', 0.5);
      const tx = lerp(-4.4, -0.8, k);
      turtle.at(tx, 0.036, -3.7); rabbit.at(0.9, 0.036, -4.95);
      turtle.set({ mood: 'happy', legs: 'walk', phase: t * 8, armL: [35, -25], armR: [35, -25], look: [0.5, 0] });
      rabbit.set({ mood: 'sleep', legs: 'sit', snoozePhase: t * 3.5, lean: -8, bob: 22 });
      shoot(MD.scene, mdActors, V3(tx + 1.4, 0.78, -0.7), V3(tx + 1.2, 0.72, -1.0), V3(tx, 0.42, -3.7), null, k, LOOKS.field);
      blit();
    } });
    cue(st, 'whoosh');
    for (let i = 0; i < 4; i++) cue(st + 0.35 + i * 0.6, 'tock', { gain: 0.55 });
  }

  // ── 12 · L11: "step after steady step, right past the sleeping rabbit." ─
  {
    const st = cut(11), wp = Wd('past', 11);
    add({ id: 'S12', at: st, note: 'Turtle plods calmly right past snoring Rabbit under the shady oak', draw(lt, d, t, blit) {
      const k = clamp(lt / d);
      poseCrowd(t, 'shock', 0.65);
      const tx = lerp(-0.6, 3.9, k);
      turtle.at(tx, 0.036, -3.45); rabbit.at(0.9, 0.036, -4.95);
      turtle.set({ mood: t > wp ? 'smug' : 'happy', legs: 'walk', phase: t * 8, armL: [30, -20], armR: [30, -20], look: [0.5, -0.1] });
      rabbit.set({ mood: 'sleep', legs: 'sit', snoozePhase: t * 3.5, lean: -8, bob: 22 });
      shoot(MD.scene, mdActors, V3(0.8, 1.35, 1.15), V3(2.1, 1.28, 0.95), V3(1.1, 0.68, -4.2), null, k, { ...LOOKS.field, fov: 46 });
      blit();
      const [zx, zy] = project(V3(0.95, 0.94, -4.95), cam);
      drawZzz(zx, zy, lt);
    } });
    cue(st, 'whoosh'); cue(wp, 'pop', { gain: 0.5 });
    for (let i = 0; i < 4; i++) cue(st + 0.3 + i * 0.65, 'tock', { gain: 0.5 });
  }

  // ── 13 · L12: "By the time the rabbit woke up in shock," ───────────────
  {
    const st = cut(12), ws = Wd('shock', 12), ww = Wd('woke', 12);
    add({ id: 'S13', at: st, note: 'Rabbit wakes up in shock with headroom, sweat drop, leaps to chase!', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      poseCrowd(t, 'shock', 0.9);
      const awake = t > ww - 0.05;
      const run = clamp((t - ws) / Math.max(0.25, (st + d) - ws));
      const rx = 0.9 + eo(run) * 4.4;
      rabbit.at(rx, 0.036, -3.8); turtle.at(7.2 + run * 1.4, 0.036, -4.2);
      rabbit.set({
        mood: awake ? 'shock' : 'sleep',
        legs: run > 0.08 ? 'run' : awake ? 'jump' : 'sit',
        phase: t * 28, sweat: awake ? 1 : 0, lean: run > 0.08 ? 18 : 0,
        armL: [130, -20], armR: [130, -20],
      });
      turtle.set({ mood: 'happy', legs: 'walk', phase: t * 8 });
      shoot(MD.scene, mdActors, V3(1.6, 1.15, -0.35), V3(rx + 1.0, 1.2, 0.05), V3(rx, 0.72, -3.9), null, k, LOOKS.field);
      blit();
      if (run > 0.05) {
        const [dx, dy] = project(V3(rx - 0.3, 0.16, -3.8), cam);
        drawDust(dx, dy, t - ws, -1);
      }
    } });
    cue(st, 'whoosh'); cue(ww, 'boing', { gain: 0.85 }); cue(ws + 0.05, 'zip');
  }

  // ── 14 · L13: "the turtle was already crossing the finish line!" ────────
  {
    const st = cut(13), wc = Wd('crossing', 13);
    add({ id: 'S14', at: st, note: 'FINISH arch on flat dirt track: Turtle breaks tape cleanly, Rabbit skids in!', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      poseCrowd(t, 'laugh', 1.0);
      const cross = clamp((t - wc + 0.15) / 0.7);
      const tx = lerp(8.5, 10.0, eo(cross));
      const rx = lerp(5.2, 8.2, eo(clamp(lt / (d * 0.85))));
      finishArch.setBreak?.(eo(clamp((tx - 9.3) / 0.55)));
      turtle.at(tx, 0.036, -3.7); rabbit.at(rx, 0.036, -4.3);
      turtle.set({
        mood: tx > 9.3 ? 'laugh' : 'happy',
        legs: tx > 9.45 ? 'jump' : 'walk',
        phase: t * 8, armL: [140, -15], armR: [140, -15],
      });
      rabbit.set({ mood: tx > 9.4 ? 'dizzy' : 'shock', legs: rx < 8.1 ? 'run' : 'stand', phase: t * 24, sweat: 1, armL: [40, -60], armR: [40, -60] });
      shoot(MD.scene, mdActors, V3(13.0, 1.48, -0.7), V3(12.4, 1.42, -1.15), V3(8.9, 0.95, -4.0), V3(9.2, 0.95, -4.0), k, { ...LOOKS.field, fov: 46 });
      blit();
      if (tx > 9.35) {
        const [cx, cy] = project(V3(9.6, 1.05, -3.7), cam);
        drawConfetti(cx, cy, t - wc);
      }
    } });
    cue(st, 'whoosh'); cue(wc + 0.1, 'ding', { gain: 0.9 }); cue(wc + 0.15, 'pop', { gain: 0.85 }); cue(wc + 0.3, 'sparkle', { dur: 1.4, gain: 0.7 });
  }

  // ── 15 · L14: "So remember, kids, slow and steady" (Sunset Cozy Room) ───
  {
    const st = cut(14), ws = Wd('steady', 14);
    add({ id: 'S15', at: st, note: 'warm sunset room: Grandpa beams & closes TALES book, kids smile', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      const shut = t > ws;
      grandpa.set({ mood: 'happy', legs: 'sit', talk: talk(t), armL: [44, -28], armR: [68, -42], holdR: PROPS.book('TALES', shut ? 0 : 1), v: shut ? 'shut' : 'open', look: [0, 0.15], blink: blink(t) });
      rmGirl.set({ mood: 'happy', legs: 'sit', look: [0.6, -0.3], armL: [36, -40], armR: [36, -40], blink: blink(t, 0.8) });
      rmBoy.set({ mood: 'happy', legs: 'sit', look: [-0.6, -0.3], armL: [42, -30], armR: [42, -30], blink: blink(t, 1.7) });
      shoot(RM.scene, rmActors, V3(0.0, 1.42, 1.15), V3(-0.05, 1.38, 0.75), V3(0.0, 0.92, -2.95), null, k, LOOKS.sunsetRoom);
      blit();
    } });
    cue(st, 'whoosh'); cue(ws, 'thud', { gain: 0.55 });
  }

  // ── 16 · L15: "beats fast and careless every single time." ───────────────
  {
    const st = cut(15), wtime = Wd('time', 15);
    add({ id: 'S16', at: st, note: 'pull-back in warm room: Grandpa waves & smiles, both kids jump & cheer!', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d));
      const clap = Math.sin(t * 14) * 28;
      grandpa.set({ mood: 'happy', legs: 'sit', talk: talk(t, t < wtime + 0.3), armL: [125 + clap * 0.4, -20], armR: [62, -38], holdR: PROPS.book('TALES', 0), v: 'shut', look: [0, 0], blink: blink(t) });
      rmGirl.set({ mood: 'laugh', legs: 'jump', bob: Math.abs(Math.sin(t * 8)) * 12, armL: [110 + clap * 0.6, -25], armR: [110 - clap * 0.6, -25] });
      rmBoy.set({ mood: 'laugh', legs: 'jump', bob: Math.abs(Math.sin(t * 8 + 1.2)) * 12, armL: [75 - clap * 0.4, -35], armR: [110 + clap * 0.6, -25] });
      shoot(RM.scene, rmActors, V3(-0.04, 1.38, 0.8), V3(0.0, 1.52, 1.9), V3(0.0, 0.9, -2.9), null, k, LOOKS.sunsetRoom);
      blit();
    } });
    cue(st + 0.2, 'pop', { gain: 0.55 }); cue(wtime, 'ding', { gain: 0.7 });
  }

  return { shots: S, cues: CUES };
}
