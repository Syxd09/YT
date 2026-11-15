// Cartoon animal cut-outs (Rabbit & Turtle) matching Tall Tale's Toon recipe: thick #1F1C33 ink outlines,
// expressive acting faces, real cast shadows + blob shadows, and camera-facing .face(cam).
import * as THREE from 'three';
import { INK, shadeOf } from './toon.js';

const LW = 9;
const R2D = Math.PI / 180;

let blobT = null;
function blobTex() {
  if (blobT) return blobT;
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(30,20,40,0.75)'); gr.addColorStop(0.6, 'rgba(30,20,40,0.25)'); gr.addColorStop(1, 'rgba(30,20,40,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); blobT = new THREE.CanvasTexture(c); return blobT;
}

function drawEye(g, x, y, S, side, bgCol) {
  const [lx, ly] = S.look || [0, 0];
  const m = S.mood || 'neutral';
  const bl = S.blink || 0;
  g.fillStyle = INK; g.strokeStyle = INK;
  if (m === 'happy' || m === 'laugh') {
    g.lineWidth = 10; g.beginPath(); g.arc(x, y + 8, 18, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); return;
  }
  if (m === 'dizzy') {
    g.lineWidth = 6; g.beginPath();
    for (let a = 0; a < 12; a += 0.3) { const rr = a * 1.5; g.lineTo(x + Math.cos(a * side) * rr, y + Math.sin(a * side) * rr); }
    g.stroke(); return;
  }
  if (m === 'shock') {
    g.fillStyle = '#FFFFFF'; g.lineWidth = 6; g.beginPath(); g.ellipse(x, y, 24, 28, 0, 0, 7); g.fill(); g.stroke();
    g.fillStyle = INK; g.beginPath(); g.arc(x + lx * 7, y + ly * 7, 7, 0, 7); g.fill(); return;
  }
  if (bl > 0.6 || m === 'sleep') {
    g.lineWidth = 8; g.beginPath(); g.moveTo(x - 16, y + 4); g.quadraticCurveTo(x, y + 12, x + 16, y + 4); g.stroke(); return;
  }
  // bright eye white + big pupil so animals pop clearly against fur/green skin
  g.fillStyle = '#FFFFFF'; g.lineWidth = 5; g.beginPath(); g.ellipse(x, y, 20, 22, 0, 0, 7); g.fill(); g.stroke();
  const px = x + lx * 7, py = y + ly * 6;
  g.fillStyle = INK; g.beginPath(); g.ellipse(px, py, 10, 13 * (1 - bl * 0.5), 0, 0, 7); g.fill();
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(px - 3, py - 4, 3.5, 0, 7); g.fill();
  if (m === 'smug' || m === 'tired' || m === 'sly' || m === 'proud') {
    g.fillStyle = bgCol; g.fillRect(x - 24, y - 28, 48, 22 + (m === 'tired' ? 8 : 0));
    g.lineWidth = 7; g.beginPath(); g.moveTo(x - 20, y - 6 + (m === 'tired' ? 8 : 0)); g.lineTo(x + 20, y - 6 + (m === 'tired' ? 8 : 0)); g.stroke();
  }
}

function drawAnimalFace(g, S, hx, hy, skinCol, isRabbit) {
  const m = S.mood || 'neutral', ex = isRabbit ? 40 : 38, ey = hy + 2;
  const brow = { neutral: [4, 0], smug: [-8, 10], happy: [8, 0], laugh: [10, 0], shock: [22, 0], worried: [10, -16], angry: [-10, 20], sad: [8, -16], sly: [-6, 12], proud: [6, 4], tired: [-2, 0], sleep: [-2, 0], dizzy: [14, 0] }[m] || [4, 0];
  g.strokeStyle = INK; g.lineWidth = 10;
  [-1, 1].forEach((s) => {
    let lift = brow[0], tilt = brow[1] * s;
    if ((m === 'smug' || m === 'sly') && s > 0) { lift = 14; tilt = -4; }
    const y = ey - 36 - lift;
    g.beginPath(); g.moveTo(hx + s * (ex - 20), y + tilt * 0.5); g.quadraticCurveTo(hx + s * ex, y - 6, hx + s * (ex + 20), y - tilt * 0.5); g.stroke();
  });
  drawEye(g, hx - ex, ey, S, -1, skinCol);
  drawEye(g, hx + ex, ey, S, 1, skinCol);

  // blush cheeks
  if (m === 'laugh' || m === 'proud' || m === 'happy') {
    g.fillStyle = 'rgba(240,120,130,0.38)';
    [-1, 1].forEach((s) => { g.beginPath(); g.ellipse(hx + s * (ex + 22), ey + 28, 18, 10, 0, 0, 7); g.fill(); });
  }

  // cute bunny nose & whiskers
  if (isRabbit) {
    g.fillStyle = '#F28CA0'; g.strokeStyle = INK; g.lineWidth = 5;
    g.beginPath(); g.moveTo(hx - 14, ey + 24); g.lineTo(hx + 14, ey + 24); g.lineTo(hx, ey + 40); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = INK; g.lineWidth = 4;
    [-1, 1].forEach((s) => {
      g.beginPath(); g.moveTo(hx + s * 50, ey + 30); g.lineTo(hx + s * 96, ey + 22); g.stroke();
      g.beginPath(); g.moveTo(hx + s * 50, ey + 40); g.lineTo(hx + s * 94, ey + 46); g.stroke();
    });
  }

  // mouth
  const my = ey + (isRabbit ? 56 : 48), t = S.talk || 0;
  g.strokeStyle = INK; g.lineWidth = 7;
  if (m === 'shock') {
    g.fillStyle = '#3A1A2A'; g.beginPath(); g.ellipse(hx, my + 8, 16, 20, 0, 0, 7); g.fill(); g.stroke();
  } else if (m === 'sleep') {
    g.fillStyle = '#3A1A2A'; g.beginPath(); g.ellipse(hx, my + 6, 12, 10 + Math.sin(S.snoozePhase || 0) * 4, 0, 0, 7); g.fill(); g.stroke();
  } else if (m === 'laugh') {
    g.fillStyle = '#3A1A2A'; g.beginPath(); g.moveTo(hx - 34, my - 4); g.quadraticCurveTo(hx, my, hx + 34, my - 4);
    g.quadraticCurveTo(hx + 28, my + 42, hx, my + 42); g.quadraticCurveTo(hx - 28, my + 42, hx - 34, my - 4); g.closePath();
    g.fill(); g.stroke();
    if (isRabbit) { g.fillStyle = '#FFFFFF'; g.fillRect(hx - 12, my - 4, 24, 13); g.strokeRect(hx - 12, my - 4, 24, 13); }
  } else if (t > 0.05) {
    g.fillStyle = '#3A1A2A'; g.beginPath(); g.ellipse(hx, my + 6, 14 + t * 8, 6 + t * 14, 0, 0, 7); g.fill(); g.stroke();
  } else if (m === 'happy' || m === 'proud') {
    g.beginPath(); g.moveTo(hx - 26, my); g.quadraticCurveTo(hx, my + 24, hx + 26, my); g.stroke();
    if (isRabbit) { g.fillStyle = '#FFFFFF'; g.fillRect(hx - 10, my + 8, 20, 11); g.strokeRect(hx - 10, my + 8, 20, 11); }
  } else if (m === 'smug' || m === 'sly') {
    g.beginPath(); g.moveTo(hx - 20, my + 4); g.quadraticCurveTo(hx + 6, my + 16, hx + 24, my - 4); g.stroke();
  } else if (m === 'tired' || m === 'dizzy') {
    g.beginPath(); g.moveTo(hx - 16, my + 6); g.lineTo(hx + 16, my + 6); g.stroke();
  } else {
    g.beginPath(); g.moveTo(hx - 18, my + 2); g.quadraticCurveTo(hx, my + 14, hx + 18, my + 2); g.stroke();
  }

  if (S.sweat || m === 'worried') {
    g.fillStyle = '#8FD3F4'; g.strokeStyle = INK; g.lineWidth = 4;
    const sx = hx + 92, sy = hy - 54;
    g.beginPath(); g.moveTo(sx, sy - 22); g.quadraticCurveTo(sx + 16, sy, sx, sy + 10); g.quadraticCurveTo(sx - 16, sy, sx, sy - 22); g.fill(); g.stroke();
  }
}

export function drawRabbit(g, look = {}, st = {}) {
  const L = { fur: '#FAF6EE', earInner: '#F4A6B8', vest: '#D8343F', band: '#D8343F', ...look };
  const S = { mood: 'neutral', look: [0, 0], blink: 0, talk: 0, armL: [14, 12], armR: [14, 12], legs: 'stand', phase: 0, lean: 0, bob: 0, ...st };
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  if (S.flip) { g.translate(512, 0); g.scale(-1, 1); }
  g.translate(256, 1000); g.rotate((S.lean || 0) * R2D); g.translate(-256, -1000);

  const sit = S.legs === 'sit';
  const by = (sit ? 160 : 0) + (S.bob || 0) + (S.legs === 'jump' ? -55 : 0);
  const bx = 256, top = 460 + by, bot = 735 + by * 0.98, bw = 84, hipY = bot - 20;

  // fluffy cotton tail peeking behind
  g.fillStyle = '#FFFFFF'; g.strokeStyle = INK; g.lineWidth = LW;
  g.beginPath(); g.arc(bx - 88, hipY - 10, 32, 0, 7); g.fill(); g.stroke();

  // legs
  g.strokeStyle = INK; g.lineWidth = 15;
  [-1, 1].forEach((side) => {
    const sx = bx + side * 40;
    if (sit) {
      g.beginPath(); g.moveTo(sx, hipY); g.lineTo(sx + side * 44, hipY + 50); g.lineTo(sx + side * 56, 985); g.stroke();
      g.fillStyle = L.fur; g.lineWidth = 7; g.beginPath(); g.ellipse(sx + side * 66, 982, 34, 16, 0, 0, 7); g.fill(); g.stroke();
      g.lineWidth = 15;
      return;
    }
    const amp = S.legs === 'run' ? 1.1 : S.legs === 'walk' ? 0.55 : 0;
    const a = amp ? Math.sin(S.phase + (side > 0 ? Math.PI : 0)) * amp : 0;
    const lift = amp ? Math.max(0, -Math.cos(S.phase + (side > 0 ? Math.PI : 0))) * (S.legs === 'run' ? 80 : 32) : 0;
    const kx = sx + a * 26 + side * 6, ky = hipY + 130 - lift * 0.6, fx = sx + a * 42 + side * 8, fy = 990 - lift;
    g.beginPath(); g.moveTo(sx, hipY); g.quadraticCurveTo(kx, ky, fx, fy); g.stroke();
    g.fillStyle = L.fur; g.lineWidth = 7; g.beginPath(); g.ellipse(fx + side * 14, fy, 32, 14, 0, 0, 7); g.fill(); g.stroke();
    g.lineWidth = 15;
  });

  // body
  const body = new Path2D();
  body.moveTo(bx - 56, top + 10);
  body.bezierCurveTo(bx - 82, top + 40, bx - bw - 8, bot - 110, bx - bw, bot - 45);
  body.bezierCurveTo(bx - bw + 6, bot + 8, bx + bw - 6, bot + 8, bx + bw, bot - 45);
  body.bezierCurveTo(bx + bw + 8, bot - 110, bx + 82, top + 40, bx + 56, top + 10);
  body.closePath();
  g.fillStyle = L.fur; g.fill(body);
  g.save(); g.clip(body);
  // sporty racing jersey stripe
  g.fillStyle = L.vest; g.fillRect(bx - 110, top + 50, 220, 140);
  g.fillStyle = '#F6D54A'; g.fillRect(bx - 110, top + 110, 220, 22);
  g.fillStyle = shadeOf(L.fur, 0.86); g.globalAlpha = 0.5;
  g.beginPath(); g.ellipse(bx + bw + 34, (top + bot) / 2, 62, 200, 0, 0, 7); g.fill();
  g.globalAlpha = 1; g.restore();
  g.strokeStyle = INK; g.lineWidth = LW; g.stroke(body);

  // arms
  const arm = (side, [a, e]) => {
    const sx = bx + side * 64, sy = top + 42, u = 100, lo = 96;
    const a1 = a * R2D, a2 = (a + e) * R2D;
    const ex = sx + side * Math.sin(a1) * u, ey = sy + Math.cos(a1) * u;
    const hx = ex + side * Math.sin(a2) * lo, hy = ey + Math.cos(a2) * lo;
    g.strokeStyle = INK; g.lineWidth = 13; g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(ex, ey, hx, hy); g.stroke();
    g.fillStyle = L.fur; g.lineWidth = 6; g.beginPath(); g.arc(hx, hy, 15, 0, 7); g.fill(); g.stroke();
  };
  arm(-1, S.armL); arm(1, S.armR);

  // ears (behind head)
  const hx = 256, hy = 330 + by * 0.99, hr = 114;
  const droop = S.mood === 'tired' || S.mood === 'sleep' ? 0.55 : S.mood === 'shock' ? -0.08 : S.legs === 'run' ? -0.35 : 0.14;
  [-1, 1].forEach((side) => {
    g.save();
    g.translate(hx + side * 48, hy - hr + 24);
    g.rotate(side * droop + (S.legs === 'run' ? -0.25 : 0));
    g.fillStyle = L.fur; g.strokeStyle = INK; g.lineWidth = LW;
    g.beginPath(); g.ellipse(0, -108, 28, 114, 0, 0, 7); g.fill(); g.stroke();
    g.fillStyle = L.earInner; g.beginPath(); g.ellipse(0, -102, 14, 84, 0, 0, 7); g.fill();
    g.restore();
  });

  // head
  const head = new Path2D(); head.ellipse(hx, hy, hr, hr * 0.94, 0, 0, 7);
  g.fillStyle = L.fur; g.fill(head);
  g.save(); g.clip(head);
  g.fillStyle = shadeOf(L.fur, 0.9); g.beginPath(); g.arc(hx + 44, hy + 36, hr, 0, 7); g.rect(hx - 350, hy - 350, 700, 700); g.fill('evenodd');
  g.restore();
  g.strokeStyle = INK; g.lineWidth = LW + 1; g.stroke(head);

  // sporty headband
  g.fillStyle = L.band; g.strokeStyle = INK; g.lineWidth = 6;
  g.beginPath(); g.roundRect(hx - hr + 10, hy - hr + 14, (hr - 10) * 2, 26, 12); g.fill(); g.stroke();

  drawAnimalFace(g, S, hx, hy, L.fur, true);
  g.restore();
}

export function drawTurtle(g, look = {}, st = {}) {
  const L = { skin: '#74B858', shell: '#3E7A38', scute: '#E2B33C', cap: '#3C6FB6', ...look };
  const S = { mood: 'neutral', look: [0, 0], blink: 0, talk: 0, armL: [10, 8], armR: [10, 8], legs: 'stand', phase: 0, lean: 0, bob: 0, ...st };
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  if (S.flip) { g.translate(512, 0); g.scale(-1, 1); }
  g.translate(256, 1000); g.rotate((S.lean || 0) * R2D); g.translate(-256, -1000);

  const by = (S.bob || 0) + (S.legs === 'jump' ? -55 : 0);
  const bx = 256, shY = 740 + by;

  // stubby tortoise legs
  g.strokeStyle = INK; g.lineWidth = 18;
  [-1, 1].forEach((side) => {
    const sx = bx + side * 66, hipY = shY + 86;
    const amp = S.legs === 'walk' || S.legs === 'run' ? 0.6 : 0;
    const a = amp ? Math.sin(S.phase + (side > 0 ? Math.PI : 0)) * amp : 0;
    const lift = amp ? Math.max(0, -Math.cos(S.phase + (side > 0 ? Math.PI : 0))) * 26 : 0;
    const fx = sx + a * 26, fy = 990 - lift;
    g.beginPath(); g.moveTo(sx, hipY); g.lineTo(fx, fy); g.stroke();
    g.fillStyle = L.skin; g.lineWidth = 7; g.beginPath(); g.ellipse(fx + side * 8, fy, 26, 14, 0, 0, 7); g.fill(); g.stroke();
    g.lineWidth = 18;
  });

  // big domed tortoise shell behind torso
  const shell = new Path2D();
  shell.ellipse(bx, shY + 18, 168, 152, 0, Math.PI, 0);
  shell.quadraticCurveTo(bx + 174, shY + 95, bx, shY + 95);
  shell.quadraticCurveTo(bx - 174, shY + 95, bx - 168, shY + 18);
  shell.closePath();
  g.fillStyle = L.shell; g.fill(shell);
  g.save(); g.clip(shell);
  // gold patterned shell scutes + warm highlight
  g.fillStyle = L.scute;
  [[-74, -42, 42], [74, -42, 42], [0, -68, 48], [-115, 22, 34], [115, 22, 34]].forEach(([dx, dy, r]) => {
    g.beginPath(); g.arc(bx + dx, shY + dy, r, 0, 7); g.fill();
    g.strokeStyle = shadeOf(L.shell, 0.7); g.lineWidth = 5; g.stroke();
  });
  g.fillStyle = shadeOf(L.shell, 0.75); g.globalAlpha = 0.5;
  g.beginPath(); g.ellipse(bx + 130, shY, 80, 160, 0, 0, 7); g.fill();
  g.globalAlpha = 1; g.restore();
  g.strokeStyle = INK; g.lineWidth = LW; g.stroke(shell);

  // warm tan belly plastron front
  g.fillStyle = '#EEDAA8'; g.strokeStyle = INK; g.lineWidth = LW;
  g.beginPath(); g.roundRect(bx - 88, shY - 30, 176, 128, 44); g.fill(); g.stroke();
  g.strokeStyle = '#C7AF7A'; g.lineWidth = 5;
  g.beginPath(); g.moveTo(bx, shY - 22); g.lineTo(bx, shY + 92); g.stroke();
  g.beginPath(); g.moveTo(bx - 78, shY + 34); g.lineTo(bx + 78, shY + 34); g.stroke();

  // stubby arms
  const arm = (side, [a, e]) => {
    const sx = bx + side * 88, sy = shY + 10, u = 66, lo = 64;
    const a1 = a * R2D, a2 = (a + e) * R2D;
    const ex = sx + side * Math.sin(a1) * u, ey = sy + Math.cos(a1) * u;
    const hx = ex + side * Math.sin(a2) * lo, hy = ey + Math.cos(a2) * lo;
    g.strokeStyle = INK; g.lineWidth = 14; g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(ex, ey, hx, hy); g.stroke();
    g.fillStyle = L.skin; g.lineWidth = 6; g.beginPath(); g.arc(hx, hy, 15, 0, 7); g.fill(); g.stroke();
  };
  arm(-1, S.armL); arm(1, S.armR);

  // round friendly turtle head poking proudly above shell
  const hx = 256, hy = shY - 120, hr = 112;
  const head = new Path2D(); head.ellipse(hx, hy, hr, hr * 0.92, 0, 0, 7);
  g.fillStyle = L.skin; g.fill(head);
  g.save(); g.clip(head);
  g.fillStyle = shadeOf(L.skin, 0.88); g.beginPath(); g.arc(hx + 44, hy + 38, hr, 0, 7); g.rect(hx - 350, hy - 350, 700, 700); g.fill('evenodd');
  g.restore();
  g.strokeStyle = INK; g.lineWidth = LW + 1; g.stroke(head);

  // cute little blue racing cap
  g.fillStyle = L.cap; g.strokeStyle = INK; g.lineWidth = LW;
  g.beginPath(); g.ellipse(hx + 6, hy - hr + 28, hr * 0.78, 50, -0.04, Math.PI, 0); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = shadeOf(L.cap, 0.75);
  g.beginPath(); g.ellipse(hx - 18, hy - hr + 34, hr * 0.64, 16, 0.04, 0, Math.PI); g.fill(); g.stroke();

  drawAnimalFace(g, S, hx, hy, L.skin, false);
  g.restore();
}

export class Critter {
  constructor(kind = 'rabbit', look = {}, { height = kind === 'rabbit' ? 1.45 : 0.95, res = 2, castShadow = true } = {}) {
    this.kind = kind; this.look = look; this.res = res;
    this.canvas = document.createElement('canvas'); this.canvas.width = 512 * res; this.canvas.height = 1024 * res;
    this.g = this.canvas.getContext('2d');
    this.tex = new THREE.CanvasTexture(this.canvas); this.tex.colorSpace = THREE.SRGBColorSpace; this.tex.anisotropy = 4;
    const H = height / 0.96, Wd = H / 2;
    const geo = new THREE.PlaneGeometry(Wd, H); geo.translate(0, H / 2 - H * (24 / 1024), 0);
    this.mat = new THREE.MeshBasicMaterial({ map: this.tex, transparent: true, alphaTest: 0.04, side: THREE.DoubleSide, toneMapped: false });
    this.mesh = new THREE.Mesh(geo, this.mat); this.mesh.castShadow = castShadow;
    this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: this.tex, alphaTest: 0.5 });
    this.blob = new THREE.Mesh(new THREE.PlaneGeometry(Wd * 0.95, Wd * 0.36), new THREE.MeshBasicMaterial({ map: blobTex(), transparent: true, depthWrite: false, opacity: 0.55 }));
    this.blob.rotation.x = -Math.PI / 2; this.blob.position.y = 0.01;
    this.group = new THREE.Group(); this.pivot = new THREE.Group(); this.pivot.add(this.mesh); this.group.add(this.pivot, this.blob);
    this.key = ''; this.H = H; this.set({});
  }
  set(st = {}) {
    const key = JSON.stringify(st, (k, v) => (typeof v === 'number' ? Math.round(v * 100) / 100 : v));
    if (key === this.key) return this;
    this.key = key; this.st = st;
    const g = this.g; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, this.canvas.width, this.canvas.height);
    g.scale(this.res, this.res);
    if (this.kind === 'rabbit') drawRabbit(g, this.look, st);
    else drawTurtle(g, this.look, st);
    this.tex.needsUpdate = true; return this;
  }
  face(cam) {
    const p = new THREE.Vector3(); this.group.getWorldPosition(p);
    this.pivot.rotation.y = Math.atan2(cam.position.x - p.x, cam.position.z - p.z) - this.group.rotation.y;
    return this;
  }
  at(x, y, z) { this.group.position.set(x, y, z); return this; }
}

