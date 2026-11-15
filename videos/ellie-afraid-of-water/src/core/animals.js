// Expressive thick-ink 2D cartoon animal cut-outs for Tall Tale 3D:
// Elephant (Ellie), BabyBird, Monkey, Frog, and Turtle.
import * as THREE from 'three';
import { INK, shadeOf } from './toon.js';
import { lerp } from './lib.js';

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

function drawEye(g, x, y, S, side, skinCol, eyeR = 20) {
  const [lx, ly] = S.look || [0, 0];
  const m = S.mood || 'neutral';
  const bl = S.blink || 0;
  g.fillStyle = INK; g.strokeStyle = INK;
  if (m === 'happy' || m === 'laugh') {
    g.lineWidth = 9; g.beginPath(); g.arc(x, y + 8, eyeR * 0.85, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); return;
  }
  if (m === 'shock') {
    g.fillStyle = '#FFFFFF'; g.lineWidth = 6; g.beginPath(); g.ellipse(x, y, eyeR * 1.25, eyeR * 1.45, 0, 0, 7); g.fill(); g.stroke();
    g.fillStyle = INK; g.beginPath(); g.arc(x + lx * 7, y + ly * 7, 7, 0, 7); g.fill(); return;
  }
  if (bl > 0.6) {
    g.lineWidth = 8; g.beginPath(); g.moveTo(x - eyeR * 0.8, y + 3); g.quadraticCurveTo(x, y + 10, x + eyeR * 0.8, y + 3); g.stroke(); return;
  }
  g.fillStyle = '#FFFFFF'; g.lineWidth = 5; g.beginPath(); g.ellipse(x, y, eyeR, eyeR * 1.12, 0, 0, 7); g.fill(); g.stroke();
  const px = x + lx * 7, py = y + ly * 6;
  g.fillStyle = INK; g.beginPath(); g.ellipse(px, py, eyeR * 0.48, eyeR * 0.62 * (1 - bl * 0.5), 0, 0, 7); g.fill();
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(px - 3, py - 4, 3.5, 0, 7); g.fill();
  if (m === 'proud' || m === 'smug') {
    g.fillStyle = skinCol; g.fillRect(x - eyeR - 4, y - eyeR - 6, eyeR * 2 + 8, eyeR * 0.9);
    g.lineWidth = 6; g.beginPath(); g.moveTo(x - eyeR + 2, y - 3); g.lineTo(x + eyeR - 2, y - 3); g.stroke();
  }
}

function drawBrowsAndMouth(g, S, hx, hy, ex, ey, my, hasMouth = true) {
  const m = S.mood || 'neutral';
  const brow = {
    neutral: [4, 0], smug: [-6, 10], happy: [8, 0], laugh: [10, 0], shock: [22, 0],
    worried: [10, -16], sad: [8, -16], determined: [-8, 18], proud: [6, 4],
  }[m] || [4, 0];
  g.strokeStyle = INK; g.lineWidth = 9;
  [-1, 1].forEach((s) => {
    const lift = brow[0], tilt = brow[1] * s, y = ey - 36 - lift;
    g.beginPath(); g.moveTo(hx + s * (ex - 18), y + tilt * 0.5); g.quadraticCurveTo(hx + s * ex, y - 5, hx + s * (ex + 18), y - tilt * 0.5); g.stroke();
  });
  if (m === 'laugh' || m === 'happy' || m === 'proud') {
    g.fillStyle = 'rgba(244,120,140,0.38)';
    [-1, 1].forEach((s) => { g.beginPath(); g.ellipse(hx + s * (ex + 22), ey + 28, 17, 10, 0, 0, 7); g.fill(); });
  }
  if (hasMouth) {
    const t = S.talk || 0;
    g.strokeStyle = INK; g.lineWidth = 7;
    if (m === 'shock') {
      g.fillStyle = '#3A1A2A'; g.beginPath(); g.ellipse(hx, my + 6, 15, 19, 0, 0, 7); g.fill(); g.stroke();
    } else if (m === 'laugh') {
      g.fillStyle = '#3A1A2A'; g.beginPath(); g.moveTo(hx - 30, my - 4); g.quadraticCurveTo(hx, my, hx + 30, my - 4);
      g.quadraticCurveTo(hx + 24, my + 38, hx, my + 38); g.quadraticCurveTo(hx - 24, my + 38, hx - 30, my - 4); g.closePath(); g.fill(); g.stroke();
    } else if (t > 0.05) {
      g.fillStyle = '#3A1A2A'; g.beginPath(); g.ellipse(hx, my + 4, 14 + t * 6, 6 + t * 12, 0, 0, 7); g.fill(); g.stroke();
    } else if (m === 'happy' || m === 'proud') {
      g.beginPath(); g.moveTo(hx - 24, my); g.quadraticCurveTo(hx, my + 22, hx + 24, my); g.stroke();
    } else if (m === 'worried' || m === 'sad') {
      g.beginPath(); g.moveTo(hx - 20, my + 12); g.quadraticCurveTo(hx, my - 4, hx + 20, my + 12); g.stroke();
    } else if (m === 'determined') {
      g.beginPath(); g.moveTo(hx - 18, my + 4); g.lineTo(hx + 18, my + 4); g.stroke();
    } else {
      g.beginPath(); g.moveTo(hx - 16, my + 2); g.quadraticCurveTo(hx, my + 12, hx + 16, my + 2); g.stroke();
    }
  }
  if (S.sweat || m === 'worried') {
    g.fillStyle = '#8FD3F4'; g.strokeStyle = INK; g.lineWidth = 4;
    const sx = hx + 96, sy = hy - 54;
    g.beginPath(); g.moveTo(sx, sy - 22); g.quadraticCurveTo(sx + 16, sy, sx, sy + 10); g.quadraticCurveTo(sx - 16, sy, sx, sy - 22); g.fill(); g.stroke();
  }
  if (S.tears || m === 'sad') {
    g.fillStyle = '#8FD3F4'; [-1, 1].forEach((s) => { g.beginPath(); g.ellipse(hx + s * (ex + 8), ey + 34, 6, 12, 0, 0, 7); g.fill(); });
  }
}

export function drawElephant(g, look = {}, st = {}) {
  const L = { skin: '#7DB5EB', belly: '#C7E3FA', earIn: '#F5B2C4', ...look };
  const S = { mood: 'neutral', look: [0, 0], blink: 0, talk: 0, legs: 'stand', phase: 0, lean: 0, bob: 0, earFlap: 0, trunk: 0, ...st };
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  if (S.flip) { g.translate(512, 0); g.scale(-1, 1); }
  g.translate(256, 1000); g.rotate((S.lean || 0) * R2D); g.translate(-256, -1000);

  const by = (S.bob || 0) + (S.legs === 'jump' ? -50 : 0);
  const bx = 256, top = 515 + by, bot = 855 + by, hipY = bot - 35;

  // cute little curved elephant tail on left
  g.strokeStyle = INK; g.lineWidth = 11;
  g.beginPath(); g.moveTo(bx - 108, bot - 90); g.quadraticCurveTo(bx - 160, bot - 130, bx - 150, bot - 70); g.stroke();
  g.fillStyle = L.skin; g.lineWidth = 5; g.beginPath(); g.ellipse(bx - 150, bot - 66, 14, 18, 0.3, 0, 7); g.fill(); g.stroke();

  // 4 chunky baby elephant legs (two pairs)
  [-1, 1].forEach((side) => {
    const sx = bx + side * 66;
    const amp = S.legs === 'run' ? 0.9 : S.legs === 'walk' ? 0.55 : 0;
    const a = amp ? Math.sin(S.phase + (side > 0 ? Math.PI : 0)) * amp : 0;
    const lift = amp ? Math.max(0, -Math.cos(S.phase + (side > 0 ? Math.PI : 0))) * (S.legs === 'run' ? 60 : 28) : 0;
    const shiv = S.legs === 'shiver' ? Math.sin(S.phase * 3 + side) * 6 : 0;
    const fx = sx + a * 34 + shiv, fy = 988 - lift;
    g.fillStyle = L.skin; g.strokeStyle = INK; g.lineWidth = LW;
    g.beginPath(); g.roundRect(fx - 26, hipY - 10, 52, fy - hipY + 14, 22); g.fill(); g.stroke();
    // cute toenails
    g.fillStyle = '#F7F4E8';
    [-12, 0, 12].forEach((dx) => { g.beginPath(); g.arc(fx + dx, fy - 4, 5.5, 0, Math.PI, true); g.fill(); });
  });

  // plump elephant body
  const body = new Path2D();
  body.ellipse(bx, (top + bot) / 2, 126, 145, 0, 0, 7);
  g.fillStyle = L.skin; g.fill(body);
  g.save(); g.clip(body);
  g.fillStyle = L.belly; g.beginPath(); g.ellipse(bx, (top + bot) / 2 + 25, 76, 98, 0, 0, 7); g.fill();
  g.fillStyle = shadeOf(L.skin, 0.85); g.globalAlpha = 0.55; g.beginPath(); g.ellipse(bx + 115, (top + bot) / 2 + 10, 62, 145, 0, 0, 7); g.fill();
  g.globalAlpha = 1; g.restore();
  g.strokeStyle = INK; g.lineWidth = LW; g.stroke(body);

  // big floppy elephant ears behind head
  const hx = 256, hy = 456 + by * 0.98, hr = 126;
  const flap = (S.mood === 'shock' ? 0.35 : 0) + (S.earFlap || 0);
  [-1, 1].forEach((side) => {
    g.save();
    g.translate(hx + side * 88, hy - 18);
    g.rotate(side * (0.18 + flap));
    g.fillStyle = L.skin; g.strokeStyle = INK; g.lineWidth = LW;
    g.beginPath(); g.ellipse(side * 58, 18, 74, 108, side * 0.25, 0, 7); g.fill(); g.stroke();
    g.fillStyle = L.earIn;
    g.beginPath(); g.ellipse(side * 56, 22, 46, 74, side * 0.25, 0, 7); g.fill();
    g.restore();
  });

  // round baby elephant head
  const head = new Path2D(); head.ellipse(hx, hy, hr, hr * 0.92, 0, 0, 7);
  g.fillStyle = L.skin; g.fill(head);
  g.save(); g.clip(head);
  g.fillStyle = shadeOf(L.skin, 0.88); g.beginPath(); g.arc(hx + 48, hy + 40, hr, 0, 7); g.rect(hx - 400, hy - 400, 800, 800); g.fill('evenodd');
  g.restore();
  g.strokeStyle = INK; g.lineWidth = LW + 1; g.stroke(head);

  // eyes & brows
  const ex = 48, ey = hy - 8;
  drawEye(g, hx - ex, ey, S, -1, L.skin, 21);
  drawEye(g, hx + ex, ey, S, 1, L.skin, 21);
  drawBrowsAndMouth(g, S, hx, hy, ex, ey, hy + 46, true);

  // animated curved elephant trunk! (S.trunk: -0.6 droop/shy .. 0 relaxed .. 1 raised cheer .. 2 reach forward)
  const tr = S.trunk || 0;
  g.save();
  g.strokeStyle = INK; g.lineWidth = 42; g.lineCap = 'round';
  const tx0 = hx, ty0 = hy + 34;
  let tx1 = hx + 26, ty1 = hy + 115, tx2 = hx + 72, ty2 = hy + 110;
  if (tr < 0) {
    tx1 = hx + 14; ty1 = hy + 118; tx2 = hx + 30; ty2 = hy + 150;
  } else if (tr > 1.2) { // reaching smoothly outward/down to scoop bird
    const r = Math.min(1, tr - 1.0);
    tx1 = lerp(hx + 34, hx + 125, r); ty1 = lerp(hy + 100, hy + 130, r);
    tx2 = lerp(hx + 80, hx + 175, r); ty2 = lerp(hy + 80, hy + 72, r);
  } else if (tr > 0.2) { // joyful raised trumpet curl!
    tx1 = hx + 46; ty1 = lerp(hy + 110, hy + 30, Math.min(1, tr));
    tx2 = hx + 96; ty2 = lerp(hy + 95, hy - 45, Math.min(1, tr));
  }
  g.beginPath(); g.moveTo(tx0, ty0); g.quadraticCurveTo(tx1, ty1, tx2, ty2); g.stroke();
  g.strokeStyle = L.skin; g.lineWidth = 26;
  g.beginPath(); g.moveTo(tx0, ty0); g.quadraticCurveTo(tx1, ty1, tx2, ty2); g.stroke();
  // cute pink trunk tip
  g.fillStyle = L.earIn; g.strokeStyle = INK; g.lineWidth = 6;
  g.beginPath(); g.arc(tx2, ty2, 13, 0, 7); g.fill(); g.stroke();
  g.restore();

  g.restore();
}

export function drawBird(g, look = {}, st = {}) {
  const L = { body: '#FFD84D', wing: '#F5B82E', beak: '#FF8522', ...look };
  const S = { mood: 'neutral', look: [0, 0], blink: 0, talk: 0, flap: 0, bob: 0, lean: 0, ...st };
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  if (S.flip) { g.translate(512, 0); g.scale(-1, 1); }
  g.translate(256, 1000); g.rotate((S.lean || 0) * R2D); g.translate(-256, -1000);
  const by = S.bob || 0, cx = 256, cy = 620 + by;

  // cute little orange legs
  g.strokeStyle = '#E86A14'; g.lineWidth = 14;
  [-36, 36].forEach((dx) => {
    g.beginPath(); g.moveTo(cx + dx, cy + 165); g.lineTo(cx + dx, 985); g.stroke();
    g.beginPath(); g.moveTo(cx + dx - 22, 985); g.lineTo(cx + dx + 26, 985); g.stroke();
  });

  // flapping wings
  const fl = S.flap || 0;
  [-1, 1].forEach((side) => {
    g.save(); g.translate(cx + side * 140, cy + 20); g.rotate(side * (-0.35 - fl * 0.9));
    g.fillStyle = L.wing; g.strokeStyle = INK; g.lineWidth = LW;
    g.beginPath(); g.ellipse(side * 44, 0, 62, 34, 0, 0, 7); g.fill(); g.stroke();
    g.restore();
  });

  // plump round chick body/head
  const body = new Path2D(); body.ellipse(cx, cy, 165, 175, 0, 0, 7);
  g.fillStyle = L.body; g.fill(body);
  g.save(); g.clip(body);
  g.fillStyle = '#FFF4B8'; g.beginPath(); g.ellipse(cx, cy + 70, 95, 85, 0, 0, 7); g.fill();
  g.fillStyle = shadeOf(L.body, 0.88); g.globalAlpha = 0.55; g.beginPath(); g.arc(cx + 80, cy + 50, 170, 0, 7); g.fill();
  g.globalAlpha = 1; g.restore();
  g.strokeStyle = INK; g.lineWidth = LW; g.stroke(body);

  // little feather tuft on top
  g.fillStyle = L.body; g.strokeStyle = INK; g.lineWidth = LW;
  g.beginPath(); g.moveTo(cx - 18, cy - 170); g.quadraticCurveTo(cx - 6, cy - 235, cx + 12, cy - 172); g.quadraticCurveTo(cx + 34, cy - 222, cx + 26, cy - 168); g.fill(); g.stroke();

  const ex = 56, ey = cy - 32;
  drawEye(g, cx - ex, ey, S, -1, L.body, 26);
  drawEye(g, cx + ex, ey, S, 1, L.body, 26);
  drawBrowsAndMouth(g, S, cx, cy, ex, ey, cy + 60, false);

  // orange beak
  g.fillStyle = L.beak; g.strokeStyle = INK; g.lineWidth = 7;
  const open = S.mood === 'shock' || S.mood === 'laugh' ? 14 : (S.talk || 0) * 14;
  g.beginPath(); g.moveTo(cx - 28, cy + 12); g.lineTo(cx + 28, cy + 12); g.lineTo(cx, cy + 44 + open); g.closePath(); g.fill(); g.stroke();
  g.restore();
}

export function drawMonkey(g, look = {}, st = {}) {
  const L = { fur: '#B87442', face: '#F2D2A9', ...look };
  const S = { mood: 'neutral', look: [0, 0], blink: 0, talk: 0, armL: [18, 12], armR: [18, 12], legs: 'stand', phase: 0, lean: 0, bob: 0, ...st };
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  if (S.flip) { g.translate(512, 0); g.scale(-1, 1); }
  g.translate(256, 1000); g.rotate((S.lean || 0) * R2D); g.translate(-256, -1000);
  const by = (S.bob || 0) + (S.legs === 'jump' ? -55 : 0);
  const bx = 256, top = 460 + by, bot = 735 + by, hipY = bot - 20;

  // curly monkey tail
  g.strokeStyle = INK; g.lineWidth = 14;
  g.beginPath(); g.moveTo(bx - 70, hipY - 12); g.bezierCurveTo(bx - 180, hipY - 40, bx - 190, hipY - 170, bx - 120, hipY - 160); g.stroke();
  g.strokeStyle = L.fur; g.lineWidth = 7;
  g.beginPath(); g.moveTo(bx - 70, hipY - 12); g.bezierCurveTo(bx - 180, hipY - 40, bx - 190, hipY - 170, bx - 120, hipY - 160); g.stroke();

  // legs
  g.strokeStyle = INK; g.lineWidth = 16;
  [-1, 1].forEach((side) => {
    const sx = bx + side * 42, amp = S.legs === 'walk' ? 0.6 : 0;
    const a = amp ? Math.sin(S.phase + (side > 0 ? Math.PI : 0)) * amp : 0;
    const lift = amp ? Math.max(0, -Math.cos(S.phase + (side > 0 ? Math.PI : 0))) * 30 : 0;
    const fx = sx + a * 30, fy = 990 - lift;
    g.beginPath(); g.moveTo(sx, hipY); g.lineTo(fx, fy); g.stroke();
    g.fillStyle = L.face; g.lineWidth = 6; g.beginPath(); g.ellipse(fx + side * 8, fy, 24, 12, 0, 0, 7); g.fill(); g.stroke();
    g.lineWidth = 16;
  });

  // body
  const body = new Path2D(); body.ellipse(bx, (top + bot) / 2, 86, 136, 0, 0, 7);
  g.fillStyle = L.fur; g.fill(body); g.strokeStyle = INK; g.lineWidth = LW; g.stroke(body);
  g.fillStyle = L.face; g.beginPath(); g.ellipse(bx, (top + bot) / 2 + 12, 54, 92, 0, 0, 7); g.fill();

  // arms
  [-1, 1].forEach((side) => {
    const [a, e] = side < 0 ? S.armL : S.armR;
    const sx = bx + side * 66, sy = top + 40, a1 = a * R2D, a2 = (a + e) * R2D;
    const ex = sx + side * Math.sin(a1) * 98, ey = sy + Math.cos(a1) * 98;
    const hx = ex + side * Math.sin(a2) * 94, hy = ey + Math.cos(a2) * 94;
    g.strokeStyle = INK; g.lineWidth = 14; g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(ex, ey, hx, hy); g.stroke();
    g.fillStyle = L.face; g.lineWidth = 6; g.beginPath(); g.arc(hx, hy, 15, 0, 7); g.fill(); g.stroke();
  });

  // head + big round monkey ears
  const hx = 256, hy = 334 + by, hr = 112;
  [-1, 1].forEach((s) => {
    g.fillStyle = L.fur; g.strokeStyle = INK; g.lineWidth = LW; g.beginPath(); g.arc(hx + s * (hr + 6), hy, 36, 0, 7); g.fill(); g.stroke();
    g.fillStyle = L.face; g.beginPath(); g.arc(hx + s * (hr + 6), hy, 22, 0, 7); g.fill();
  });
  const head = new Path2D(); head.ellipse(hx, hy, hr, hr * 0.94, 0, 0, 7);
  g.fillStyle = L.fur; g.fill(head); g.strokeStyle = INK; g.lineWidth = LW + 1; g.stroke(head);
  g.fillStyle = L.face; g.beginPath(); g.ellipse(hx, hy + 28, 76, 56, 0, 0, 7); g.fill();
  g.beginPath(); g.arc(hx - 36, hy - 14, 34, 0, 7); g.arc(hx + 36, hy - 14, 34, 0, 7); g.fill();

  drawEye(g, hx - 36, hy - 12, S, -1, L.face, 19);
  drawEye(g, hx + 36, hy - 12, S, 1, L.face, 19);
  drawBrowsAndMouth(g, S, hx, hy, 36, hy - 12, hy + 46, true);
  g.restore();
}

export function drawFrog(g, look = {}, st = {}) {
  const L = { skin: '#6EC954', belly: '#E3F5B8', ...look };
  const S = { mood: 'neutral', look: [0, 0], blink: 0, talk: 0, armL: [24, 10], armR: [24, 10], legs: 'stand', bob: 0, ...st };
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  const by = (S.bob || 0) + (S.legs === 'jump' ? -70 : 0);
  const cx = 256, cy = 720 + by;

  // frog hind legs
  g.strokeStyle = INK; g.lineWidth = 18;
  [-1, 1].forEach((s) => {
    g.beginPath(); g.moveTo(cx + s * 80, cy + 75); g.quadraticCurveTo(cx + s * 150, cy + 120, cx + s * 110, 985); g.stroke();
    g.fillStyle = L.skin; g.lineWidth = 6; g.beginPath(); g.ellipse(cx + s * 124, 982, 34, 14, 0, 0, 7); g.fill(); g.stroke();
    g.lineWidth = 18;
  });

  // plump frog body
  const body = new Path2D(); body.ellipse(cx, cy, 134, 130, 0, 0, 7);
  g.fillStyle = L.skin; g.fill(body); g.strokeStyle = INK; g.lineWidth = LW; g.stroke(body);
  g.fillStyle = L.belly; g.beginPath(); g.ellipse(cx, cy + 30, 88, 76, 0, 0, 7); g.fill();

  // arms
  [-1, 1].forEach((side) => {
    const [a, e] = side < 0 ? S.armL : S.armR, sx = cx + side * 95, sy = cy - 10;
    const a1 = a * R2D, a2 = (a + e) * R2D;
    const ex = sx + side * Math.sin(a1) * 65, ey = sy + Math.cos(a1) * 65;
    const hx = ex + side * Math.sin(a2) * 60, hy = ey + Math.cos(a2) * 60;
    g.strokeStyle = INK; g.lineWidth = 14; g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(ex, ey, hx, hy); g.stroke();
    g.fillStyle = L.skin; g.lineWidth = 6; g.beginPath(); g.arc(hx, hy, 14, 0, 7); g.fill(); g.stroke();
  });

  // cute popped frog eye domes at top
  [-58, 58].forEach((dx) => {
    g.fillStyle = L.skin; g.strokeStyle = INK; g.lineWidth = LW;
    g.beginPath(); g.arc(cx + dx, cy - 122, 46, 0, 7); g.fill(); g.stroke();
  });
  drawEye(g, cx - 58, cy - 122, S, -1, L.skin, 24);
  drawEye(g, cx + 58, cy - 122, S, 1, L.skin, 24);
  drawBrowsAndMouth(g, S, cx, cy - 40, 58, cy - 122, cy - 28, true);
  g.restore();
}

export function drawTurtle(g, look = {}, st = {}) {
  const L = { skin: '#74B858', shell: '#3E7A38', scute: '#E2B33C', cap: '#3C6FB6', ...look };
  const S = { mood: 'neutral', look: [0, 0], blink: 0, talk: 0, armL: [10, 8], armR: [10, 8], legs: 'stand', phase: 0, lean: 0, bob: 0, ...st };
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  g.translate(256, 1000); g.rotate((S.lean || 0) * R2D); g.translate(-256, -1000);
  const by = (S.bob || 0) + (S.legs === 'jump' ? -55 : 0), bx = 256, shY = 740 + by;

  g.strokeStyle = INK; g.lineWidth = 18;
  [-1, 1].forEach((side) => {
    const sx = bx + side * 66, hipY = shY + 86;
    const fx = sx, fy = 990;
    g.beginPath(); g.moveTo(sx, hipY); g.lineTo(fx, fy); g.stroke();
    g.fillStyle = L.skin; g.lineWidth = 7; g.beginPath(); g.ellipse(fx + side * 8, fy, 26, 14, 0, 0, 7); g.fill(); g.stroke();
    g.lineWidth = 18;
  });

  const shell = new Path2D();
  shell.ellipse(bx, shY + 18, 168, 152, 0, Math.PI, 0);
  shell.quadraticCurveTo(bx + 174, shY + 95, bx, shY + 95);
  shell.quadraticCurveTo(bx - 174, shY + 95, bx - 168, shY + 18);
  shell.closePath();
  g.fillStyle = L.shell; g.fill(shell);
  g.save(); g.clip(shell);
  g.fillStyle = L.scute;
  [[-74, -42, 42], [74, -42, 42], [0, -68, 48], [-115, 22, 34], [115, 22, 34]].forEach(([dx, dy, r]) => {
    g.beginPath(); g.arc(bx + dx, shY + dy, r, 0, 7); g.fill();
    g.strokeStyle = shadeOf(L.shell, 0.7); g.lineWidth = 5; g.stroke();
  });
  g.restore();
  g.strokeStyle = INK; g.lineWidth = LW; g.stroke(shell);

  g.fillStyle = '#EEDAA8'; g.strokeStyle = INK; g.lineWidth = LW;
  g.beginPath(); g.roundRect(bx - 88, shY - 30, 176, 128, 44); g.fill(); g.stroke();

  [-1, 1].forEach((side) => {
    const [a, e] = side < 0 ? S.armL : S.armR, sx = bx + side * 88, sy = shY + 10;
    const a1 = a * R2D, a2 = (a + e) * R2D;
    const ex = sx + side * Math.sin(a1) * 66, ey = sy + Math.cos(a1) * 66;
    const hx = ex + side * Math.sin(a2) * 64, hy = ey + Math.cos(a2) * 64;
    g.strokeStyle = INK; g.lineWidth = 14; g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(ex, ey, hx, hy); g.stroke();
    g.fillStyle = L.skin; g.lineWidth = 6; g.beginPath(); g.arc(hx, hy, 15, 0, 7); g.fill(); g.stroke();
  });

  const hx = 256, hy = shY - 120, hr = 112;
  const head = new Path2D(); head.ellipse(hx, hy, hr, hr * 0.92, 0, 0, 7);
  g.fillStyle = L.skin; g.fill(head); g.strokeStyle = INK; g.lineWidth = LW + 1; g.stroke(head);
  g.fillStyle = L.cap; g.strokeStyle = INK; g.lineWidth = LW;
  g.beginPath(); g.ellipse(hx + 6, hy - hr + 28, hr * 0.78, 50, -0.04, Math.PI, 0); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = shadeOf(L.cap, 0.75);
  g.beginPath(); g.ellipse(hx - 18, hy - hr + 34, hr * 0.64, 16, 0.04, 0, Math.PI); g.fill(); g.stroke();

  drawEye(g, hx - 38, hy + 2, S, -1, L.skin, 20);
  drawEye(g, hx + 38, hy + 2, S, 1, L.skin, 20);
  drawBrowsAndMouth(g, S, hx, hy, 38, hy + 2, hy + 50, true);
  g.restore();
}

export class Animal {
  constructor(kind = 'elephant', look = {}, { height = 1.25, res = 2, castShadow = true } = {}) {
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
    if (this.kind === 'elephant') drawElephant(g, this.look, st);
    else if (this.kind === 'bird') drawBird(g, this.look, st);
    else if (this.kind === 'monkey') drawMonkey(g, this.look, st);
    else if (this.kind === 'turtle') drawTurtle(g, this.look, st);
    else drawFrog(g, this.look, st);
    this.tex.needsUpdate = true; return this;
  }
  face(cam) {
    const p = new THREE.Vector3(); this.group.getWorldPosition(p);
    this.pivot.rotation.y = Math.atan2(cam.position.x - p.x, cam.position.z - p.z) - this.group.rotation.y;
    return this;
  }
  at(x, y, z) { this.group.position.set(x, y, z); return this; }
}

