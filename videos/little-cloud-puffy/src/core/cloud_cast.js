// Expressive thick-ink 2D cartoon characters for "The Little Cloud Who Couldn't Rain":
// CloudActor ('puffy' | 'big'), SunflowerActor (Sunny), plus glossy raindrop & sparkle helpers.
import * as THREE from 'three';
import { INK, shadeOf } from './toon.js';
import { clamp, lerp } from './lib.js';

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

// Reusable scratch buffer for seamless thick-inked multi-lobe cloud bodies (zero internal seam lines)
let puffScratch = null, puffScratchCtx = null;
function getPuffScratch() {
  if (!puffScratch) {
    puffScratch = document.createElement('canvas');
    puffScratch.width = 512; puffScratch.height = 512;
    puffScratchCtx = puffScratch.getContext('2d');
  }
  return [puffScratch, puffScratchCtx];
}

// ---------- Cloud Character (Puffy & Big Clouds) ----------
const PUFFY_LOBES = [
  [0, -48, 72],
  [-68, -26, 56], [68, -26, 56],
  [-116, 18, 48], [116, 18, 48],
  [-64, 42, 48], [0, 46, 52], [64, 42, 48],
];
const BIG_LOBES = [
  [-24, -52, 74], [36, -48, 70],
  [-92, -22, 60], [98, -20, 58],
  [-142, 20, 48], [142, 20, 48],
  [-84, 44, 50], [0, 48, 56], [84, 44, 50],
];

function drawCloudEyes(g, cx, cy, S, isBig) {
  const [lx, ly] = S.look || [0, 0];
  const m = S.mood || 'neutral';
  const bl = S.blink || 0;
  const ex = isBig ? 46 : 42, ey = cy - (isBig ? 4 : 6);
  const er = isBig ? 18 : 22;

  [-1, 1].forEach((side) => {
    const x = cx + side * ex, y = ey;
    g.strokeStyle = INK; g.lineWidth = 7; g.lineCap = 'round';
    if (m === 'strain') {
      // Tightly squeezed '> <' eyes
      g.beginPath();
      g.moveTo(x - side * 14, y - 10);
      g.lineTo(x + side * 12, y);
      g.lineTo(x - side * 14, y + 10);
      g.stroke();
      return;
    }
    if (m === 'laugh' || m === 'happy' || bl > 0.6) {
      g.beginPath();
      g.arc(x, y + (bl > 0.6 ? 4 : 8), er * 0.85, Math.PI * 1.12, Math.PI * 1.88);
      g.stroke();
      return;
    }

    const ryScale = m === 'shock' ? 1.24 : 1.12;
    const rxScale = m === 'shock' ? 1.16 : 1.0;
    g.fillStyle = '#FFFFFF'; g.lineWidth = 5;
    g.beginPath(); g.ellipse(x, y, er * rxScale, er * ryScale, 0, 0, 7); g.fill(); g.stroke();

    // Big sky-blue iris + dark pupil + sparkling dual highlights
    const px = x + lx * 5.5, py = y + ly * 5.5;
    g.fillStyle = isBig ? '#4B90D6' : '#2694FF';
    g.beginPath(); g.ellipse(px, py, er * 0.66, er * 0.74, 0, 0, 7); g.fill();
    g.fillStyle = INK;
    g.beginPath(); g.ellipse(px, py + 1, er * 0.36, er * 0.42, 0, 0, 7); g.fill();
    g.fillStyle = '#FFFFFF';
    g.beginPath(); g.arc(px - 4.5, py - 5.5, 4.5, 0, 7); g.fill();
    g.beginPath(); g.arc(px + 4, py + 4, 2.2, 0, 7); g.fill();

    // Soft upper lid for sad/disappointed beats
    if (m === 'sad' || m === 'worried') {
      g.fillStyle = '#F7FBFF';
      g.beginPath();
      g.ellipse(x, y - er * 0.6, er + 3, er * 0.55, side * -0.22, 0, 7);
      g.fill();
    }
  });

  // Expressive eyebrows
  const browMap = {
    neutral: [3, 0], happy: [7, 0], laugh: [9, 0], shock: [14, 0],
    worried: [6, -12], sad: [5, -14], strain: [-8, 12], inhale: [8, 2],
  };
  const [lift, tilt] = browMap[m] || [3, 0];
  g.strokeStyle = INK; g.lineWidth = 7;
  [-1, 1].forEach((side) => {
    const x = cx + side * ex, y = ey - er - 9 - lift;
    g.beginPath();
    g.moveTo(x - side * 14, y + tilt * 0.5);
    g.quadraticCurveTo(x, y - 4, x + side * 14, y - tilt * 0.5);
    g.stroke();
  });

  // Rosy cheeks
  g.fillStyle = m === 'strain' || m === 'inhale' ? 'rgba(255,112,144,0.62)' : 'rgba(255,135,165,0.48)';
  const cheekScale = m === 'inhale' ? 1.3 : 1.0;
  [-1, 1].forEach((side) => {
    g.beginPath();
    g.ellipse(cx + side * (ex + 20), ey + 26, 16 * cheekScale, 10 * cheekScale, 0, 0, 7);
    g.fill();
  });

  // Cute expressive mouth
  const my = ey + 34, talk = S.talk || 0;
  g.strokeStyle = INK; g.lineWidth = 6.5; g.lineCap = 'round';
  if (m === 'shock') {
    g.fillStyle = '#E85E7A';
    g.beginPath(); g.ellipse(cx, my + 2, 11, 14, 0, 0, 7); g.fill(); g.stroke();
  } else if (m === 'inhale') {
    g.fillStyle = '#E85E7A';
    g.beginPath(); g.ellipse(cx, my + 2, 9, 10, 0, 0, 7); g.fill(); g.stroke();
  } else if (m === 'laugh') {
    g.fillStyle = '#F25C78';
    g.beginPath(); g.moveTo(cx - 24, my - 4); g.quadraticCurveTo(cx, my, cx + 24, my - 4);
    g.quadraticCurveTo(cx + 19, my + 30, cx, my + 30); g.quadraticCurveTo(cx - 19, my + 30, cx - 24, my - 4);
    g.closePath(); g.fill(); g.stroke();
  } else if (m === 'strain') {
    g.beginPath();
    g.moveTo(cx - 18, my + 4);
    g.quadraticCurveTo(cx - 8, my - 2, cx, my + 4);
    g.quadraticCurveTo(cx + 8, my + 10, cx + 18, my + 4);
    g.stroke();
  } else if (m === 'sad' || m === 'worried') {
    g.beginPath(); g.moveTo(cx - 16, my + 10); g.quadraticCurveTo(cx, my - 3, cx + 16, my + 10); g.stroke();
  } else if (talk > 0.08) {
    g.fillStyle = '#E85E7A';
    g.beginPath(); g.ellipse(cx, my + 3, 12 + talk * 4, 5 + talk * 9, 0, 0, 7); g.fill(); g.stroke();
  } else {
    g.beginPath(); g.moveTo(cx - 18, my - 2); g.quadraticCurveTo(cx, my + 15, cx + 18, my - 2); g.stroke();
  }
}

export function drawCloud(g, look = {}, st = {}) {
  const L = { kind: 'puffy', fillTop: '#FFFFFF', fillBot: '#D6ECFF', glowCol: '#FFF099', ...look };
  const S = {
    mood: 'neutral', look: [0, 0], blink: 0, talk: 0,
    bob: 0, lean: 0, sx: 1, sy: 1, glow: 0, sweat: 0, tears: 0,
    armL: [18, 12], armR: [18, 12], crownDrop: 0, ...st,
  };
  const isBig = L.kind === 'big';
  const lobes = isBig ? BIG_LOBES : PUFFY_LOBES;
  const cx = 256, cy = 620 + (S.bob || 0);

  g.save();
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.translate(cx, cy);
  g.rotate((S.lean || 0) * R2D);
  g.scale(S.sx || 1, S.sy || 1);

  // Crisp golden rim highlight during magical power (keeps quad crisp with zero translucent fog disc)
  if (S.glow > 0.05) {
    g.fillStyle = `rgba(255, 224, 90, ${0.85 * S.glow})`;
    lobes.forEach(([x, y, r]) => {
      g.beginPath(); g.arc(x, y, r + 18, 0, 7); g.fill();
    });
  }

  // Cute tiny fluffy stub arms behind/at sides
  const drawArm = (side, [ang, elb]) => {
    const ax = side * (isBig ? 148 : 132), ay = 16;
    const rad = (ang + elb * 0.4) * R2D;
    const tx = ax + side * Math.cos(rad) * 34, ty = ay - Math.sin(rad) * 34;
    g.fillStyle = L.fillTop; g.strokeStyle = INK; g.lineWidth = LW + 1;
    g.beginPath(); g.ellipse(tx, ty, 24, 17, side * -rad, 0, 7); g.fill(); g.stroke();
  };
  drawArm(-1, S.armL);
  drawArm(1, S.armR);

  // Seamless bold outer INK silhouette drawn behind cached shaded cloud body
  g.fillStyle = INK;
  lobes.forEach(([x, y, r]) => {
    g.beginPath(); g.arc(x, y, r + 12, 0, 7); g.fill();
  });

  // Paint seamless interior fluff + soft cel-shading onto scratch canvas
  const [sc, sg] = getPuffScratch();
  sg.clearRect(0, 0, 512, 512);
  sg.save();
  sg.translate(256, 256);
  sg.fillStyle = L.fillTop;
  lobes.forEach(([x, y, r]) => {
    sg.beginPath(); sg.arc(x, y, r, 0, 7); sg.fill();
  });
  sg.globalCompositeOperation = 'source-atop';
  const grad = sg.createLinearGradient(0, -125, 0, 110);
  grad.addColorStop(0, L.fillTop);
  grad.addColorStop(0.62, L.fillTop);
  grad.addColorStop(1, L.fillBot);
  sg.fillStyle = grad;
  sg.fillRect(-256, -256, 512, 512);
  // Subtle warm top sheen arc
  sg.fillStyle = 'rgba(255,255,255,0.75)';
  sg.beginPath(); sg.ellipse(-28, -90, 44, 18, -0.18, 0, 7); sg.fill();
  sg.restore();
  g.drawImage(sc, -256, -256);

  // Expressive face centered gently
  drawCloudEyes(g, 0, 6, S, isBig);

  // Optional sweat drop when trying hard
  if (S.sweat > 0) {
    g.fillStyle = '#7CE0FF'; g.strokeStyle = INK; g.lineWidth = 4;
    const sx = 96, sy = -68;
    g.beginPath(); g.moveTo(sx, sy - 20); g.quadraticCurveTo(sx + 15, sy, sx, sy + 10);
    g.quadraticCurveTo(sx - 15, sy, sx, sy - 20); g.fill(); g.stroke();
  }
  if (S.tears > 0) {
    g.fillStyle = '#7CE0FF';
    [-1, 1].forEach((side) => {
      g.beginPath(); g.ellipse(side * 42, 26, 6, 11, 0, 0, 7); g.fill();
    });
  }

  // Comical tiny droplet perched on Puffy's crown for the Scene 1 hook!
  if (S.crownDrop > 0.02) {
    const dy = -124 - (1 - S.crownDrop) * 20;
    g.save(); g.translate(10, dy); g.scale(S.crownDrop, S.crownDrop);
    g.fillStyle = '#58D5FF'; g.strokeStyle = INK; g.lineWidth = 5;
    g.beginPath(); g.moveTo(0, -24); g.quadraticCurveTo(18, 2, 0, 18); g.quadraticCurveTo(-18, 2, 0, -24);
    g.fill(); g.stroke();
    g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(-4, 2, 4, 0, 7); g.fill();
    g.restore();
  }

  g.restore();
}

// ---------- Sunny the Little Sunflower ----------
export function drawSunflower(g, look = {}, st = {}) {
  const S = {
    bloom: 0.25, mood: 'sad', look: [0, 0], blink: 0, talk: 0,
    sway: 0, lean: 0, bob: 0, sweat: 0, dew: 0, ...st,
  };
  const b = clamp(S.bloom);
  const bx = 256, by = 990;
  // Flower head position lifts taller and straighter as bloom rises from 0 (drooped) -> 1 (tall radiant)
  const hx = bx + lerp(54, 0, b) + (S.sway || 0) * 18;
  const hy = lerp(695, 455, b) + (S.bob || 0);
  const tilt = lerp(0.46, 0.04, b) + (S.sway || 0) * 0.08 + (S.lean || 0) * R2D;

  g.save();
  g.lineCap = 'round'; g.lineJoin = 'round';

  // Curved green stem anchored solidly in soil at (256, 990)
  const midX = lerp(bx - 16, bx + 12, b) + (S.sway || 0) * 10;
  const midY = (by + hy) * 0.5 + lerp(28, 0, b);
  g.strokeStyle = INK; g.lineWidth = 30;
  g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(midX, midY, hx, hy); g.stroke();
  g.strokeStyle = lerpColor('#5B9138', '#4BC23A', b); g.lineWidth = 16;
  g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(midX, midY, hx, hy); g.stroke();

  // Stem leaves (limp downward when thirsty -> perky raised leaves when bloomed)
  const drawLeaf = (tStem, side) => {
    const lx = (1 - tStem) * (1 - tStem) * bx + 2 * (1 - tStem) * tStem * midX + tStem * tStem * hx;
    const ly = (1 - tStem) * (1 - tStem) * by + 2 * (1 - tStem) * tStem * midY + tStem * tStem * hy;
    const ang = side * lerp(2.25, 0.65, b) + (S.sway || 0) * 0.1;
    const len = lerp(74, 96, b);
    g.save(); g.translate(lx, ly); g.rotate(ang);
    g.fillStyle = lerpColor('#6FA142', '#52CA3F', b); g.strokeStyle = INK; g.lineWidth = 8;
    g.beginPath();
    g.moveTo(0, 0);
    g.quadraticCurveTo(side * len * 0.55, -len * 0.45, side * len, 0);
    g.quadraticCurveTo(side * len * 0.55, len * 0.45, 0, 0);
    g.fill(); g.stroke();
    // Leaf midrib vein
    g.strokeStyle = '#337E28'; g.lineWidth = 4;
    g.beginPath(); g.moveTo(8 * side, 0); g.lineTo(len * 0.72 * side, 0); g.stroke();
    g.restore();
  };
  drawLeaf(0.45, -1);
  drawLeaf(0.58, 1);

  // Flower head assembly at (hx, hy)
  g.save();
  g.translate(hx, hy);
  g.rotate(tilt);

  // 14 golden petals (drooping & muted when b=0, spread plush radiant yellow-orange when b=1)
  const petalCount = 14;
  const pLen = lerp(96, 128, b);
  const pWid = lerp(22, 34, b);
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < petalCount; i++) {
      if (i % 2 !== pass) continue;
      const baseA = (i / petalCount) * Math.PI * 2;
      // Pull petals heavily downward (+PI/2) when wilted!
      const droopShift = (1 - b) * Math.cos(baseA) * 0.68;
      const a = baseA + droopShift;
      g.save();
      g.rotate(a);
      const col = i % 2 === 0
        ? lerpColor('#D9AD38', '#FFE033', b)
        : lerpColor('#C49228', '#FFA826', b);
      g.fillStyle = col; g.strokeStyle = INK; g.lineWidth = 7;
      g.beginPath();
      g.ellipse(pLen * 0.72, 0, pLen * 0.48, pWid, 0, 0, 7);
      g.fill(); g.stroke();
      g.restore();
    }
  }

  // Sunflower center disc
  const cr = lerp(84, 96, b);
  const faceFill = lerpColor('#7D5533', '#8D5224', b);
  g.fillStyle = faceFill; g.strokeStyle = INK; g.lineWidth = LW;
  g.beginPath(); g.arc(0, 0, cr, 0, 7); g.fill(); g.stroke();

  // Warm rim glow & subtle seed ring around edge
  g.fillStyle = lerpColor('#946840', '#AD6A30', b);
  g.beginPath(); g.arc(-10, -10, cr * 0.82, 0, 7); g.fill();
  g.fillStyle = 'rgba(72, 36, 12, 0.38)';
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    g.beginPath(); g.arc(Math.cos(a) * (cr - 14), Math.sin(a) * (cr - 14), 4.5, 0, 7); g.fill();
  }

  // Cute Sunny face!
  const [lx, ly] = S.look || [0, 0];
  const m = S.mood || 'neutral';
  const bl = S.blink || 0;
  const ex = 30, ey = -10;
  [-1, 1].forEach((side) => {
    const x = side * ex, y = ey;
    g.strokeStyle = '#2B1608'; g.lineWidth = 7;
    if (m === 'laugh' || m === 'happy' || bl > 0.6) {
      g.beginPath(); g.arc(x, y + 6, 14, Math.PI * 1.12, Math.PI * 1.88); g.stroke();
    } else {
      g.fillStyle = '#FFFFFF'; g.lineWidth = 4.5;
      g.beginPath(); g.ellipse(x, y, 16, 18, 0, 0, 7); g.fill(); g.stroke();
      const px = x + lx * 4, py = y + ly * 4;
      g.fillStyle = INK; g.beginPath(); g.ellipse(px, py + 1, 8, 9.5, 0, 0, 7); g.fill();
      g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(px - 2.5, py - 3, 3.2, 0, 7); g.fill();
      if (m === 'sad' || m === 'thirsty') {
        g.fillStyle = faceFill;
        g.beginPath(); g.ellipse(x, y - 12, 18, 9, side * -0.2, 0, 7); g.fill();
      }
    }
  });

  // Brows
  g.strokeStyle = '#2B1608'; g.lineWidth = 6;
  [-1, 1].forEach((side) => {
    const lift = m === 'amazed' ? -10 : m === 'happy' || m === 'laugh' ? -6 : -2;
    const tiltB = (m === 'sad' || m === 'thirsty') ? side * -9 : 0;
    g.beginPath();
    g.moveTo(side * (ex - 11), ey - 20 + lift + tiltB * 0.5);
    g.lineTo(side * (ex + 11), ey - 20 + lift - tiltB * 0.5);
    g.stroke();
  });

  // Rosy cheeks
  g.fillStyle = `rgba(255, 130, 125, ${0.25 + b * 0.4})`;
  [-1, 1].forEach((side) => {
    g.beginPath(); g.ellipse(side * 46, ey + 20, 13, 8, 0, 0, 7); g.fill();
  });

  // Mouth
  const my = ey + 28;
  g.strokeStyle = '#2B1608'; g.lineWidth = 6;
  if (m === 'amazed') {
    g.fillStyle = '#FF6F7D'; g.beginPath(); g.ellipse(0, my + 2, 10, 12, 0, 0, 7); g.fill(); g.stroke();
  } else if (m === 'laugh') {
    g.fillStyle = '#FF6F7D';
    g.beginPath(); g.moveTo(-20, my - 2); g.quadraticCurveTo(0, my, 20, my - 2);
    g.quadraticCurveTo(15, my + 24, 0, my + 24); g.quadraticCurveTo(-15, my + 24, -20, my - 2);
    g.closePath(); g.fill(); g.stroke();
  } else if (m === 'happy') {
    g.beginPath(); g.moveTo(-18, my - 2); g.quadraticCurveTo(0, my + 16, 18, my - 2); g.stroke();
  } else {
    g.beginPath(); g.moveTo(-14, my + 8); g.quadraticCurveTo(0, my - 3, 14, my + 8); g.stroke();
  }

  // Sweat drop when hot & thirsty
  if (S.sweat > 0) {
    g.fillStyle = '#7CE0FF'; g.strokeStyle = INK; g.lineWidth = 4;
    const sx = -cr + 10, sy = -36;
    g.beginPath(); g.moveTo(sx, sy - 16); g.quadraticCurveTo(sx + 11, sy, sx, sy + 8);
    g.quadraticCurveTo(sx - 11, sy, sx, sy - 16); g.fill(); g.stroke();
  }

  g.restore();
  g.restore();
}

function lerpColor(hexA, hexB, k) {
  const pa = parseInt(hexA.slice(1), 16), pb = parseInt(hexB.slice(1), 16);
  const r = Math.round(lerp((pa >> 16) & 255, (pb >> 16) & 255, k));
  const gg = Math.round(lerp((pa >> 8) & 255, (pb >> 8) & 255, k));
  const bl = Math.round(lerp(pa & 255, pb & 255, k));
  return '#' + ((1 << 24) + (r << 16) + (gg << 8) + bl).toString(16).slice(1);
}

// ---------- Shared 3D Billboard Cut-Out Wrapper ----------
export class GardenActor {
  constructor(kind, look = {}, { height = 1.2, res = 2, castShadow = true, groundBlob = false } = {}) {
    this.kind = kind; this.look = look; this.res = res;
    this.canvas = document.createElement('canvas');
    this.canvas.width = 512 * res; this.canvas.height = 1024 * res;
    this.g = this.canvas.getContext('2d');
    this.tex = new THREE.CanvasTexture(this.canvas);
    this.tex.colorSpace = THREE.SRGBColorSpace; this.tex.anisotropy = 4;
    const H = height / 0.96, Wd = H / 2;
    const geo = new THREE.PlaneGeometry(Wd, H);
    geo.translate(0, H / 2 - H * (24 / 1024), 0);
    this.mat = new THREE.MeshBasicMaterial({ map: this.tex, transparent: true, alphaTest: 0.04, side: THREE.DoubleSide, toneMapped: false });
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.castShadow = castShadow;
    this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: this.tex, alphaTest: 0.5 });
    this.group = new THREE.Group();
    this.pivot = new THREE.Group();
    this.pivot.add(this.mesh);
    this.group.add(this.pivot);
    if (groundBlob) {
      this.blob = new THREE.Mesh(
        new THREE.PlaneGeometry(Wd * 0.85, Wd * 0.32),
        new THREE.MeshBasicMaterial({ map: blobTex(), transparent: true, depthWrite: false, opacity: 0.48 }),
      );
      this.blob.rotation.x = -Math.PI / 2; this.blob.position.y = 0.02;
      this.group.add(this.blob);
    }
    this.key = ''; this.set({});
  }
  set(st = {}) {
    const key = JSON.stringify(st, (k, v) => (typeof v === 'number' ? Math.round(v * 100) / 100 : v));
    if (key === this.key) return this;
    this.key = key;
    const g = this.g;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, this.canvas.width, this.canvas.height);
    g.scale(this.res, this.res);
    if (this.kind === 'sunflower') drawSunflower(g, this.look, st);
    else drawCloud(g, this.look, st);
    this.tex.needsUpdate = true;
    return this;
  }
  face(cam) {
    const p = new THREE.Vector3();
    this.group.getWorldPosition(p);
    this.pivot.rotation.y = Math.atan2(cam.position.x - p.x, cam.position.z - p.z) - this.group.rotation.y;
    return this;
  }
  at(x, y, z) { this.group.position.set(x, y, z); return this; }
}

// ---------- Glossy 2D Raindrop, Splash & Magic Sparkle Overlays ----------
export function drawTeardrop(ctx, x, y, size = 18, alpha = 0.92, col = '#5CD8FF') {
  if (alpha <= 0.02) return;
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.fillStyle = col; ctx.strokeStyle = INK; ctx.lineWidth = Math.max(3, size * 0.22);
  ctx.beginPath();
  ctx.moveTo(0, -size * 1.15);
  ctx.quadraticCurveTo(size * 0.82, 0, 0, size * 0.85);
  ctx.quadraticCurveTo(-size * 0.82, 0, 0, -size * 1.15);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath(); ctx.ellipse(-size * 0.2, size * 0.12, size * 0.16, size * 0.28, -0.2, 0, 7); ctx.fill();
  ctx.restore();
}

export function drawRainShower(ctx, cx, topY, botY, spreadW, t, count = 18, speed = 1.6, alpha = 0.9, size = 16) {
  if (alpha <= 0.02) return;
  const span = Math.max(80, botY - topY);
  ctx.save();
  for (let i = 0; i < count; i++) {
    const seed = (i * 0.6180339887) % 1;
    const lane = ((i % 7) / 6 - 0.5) * spreadW + Math.sin(i * 4.3) * 18;
    const prog = (t * speed + seed) % 1;
    const x = cx + lane;
    const y = topY + prog * span;
    const fade = Math.sin(prog * Math.PI);
    drawTeardrop(ctx, x, y, size * (0.78 + (i % 3) * 0.14), alpha * clamp(fade * 1.8), i % 2 ? '#5CD8FF' : '#9CEBFF');
    if (prog > 0.88) {
      const sp = (prog - 0.88) / 0.12;
      ctx.globalAlpha = (1 - sp) * alpha * 0.75;
      ctx.strokeStyle = '#E8FAFF'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.ellipse(x, botY, 10 + sp * 22, 4 + sp * 8, 0, 0, 7); ctx.stroke();
    }
  }
  ctx.restore();
}

export function drawMagicSparkles(ctx, cx, cy, radius, lt, count = 12, loop = true) {
  ctx.save();
  const cols = ['#FFE047', '#7CE6FF', '#FF85B3', '#FFFFFF'];
  for (let i = 0; i < count; i++) {
    const ph = (i / count);
    const p = loop ? (lt * 0.9 + ph) % 1 : clamp(lt / 1.4);
    const ang = ph * Math.PI * 2 + lt * 0.8;
    const dist = radius * (0.4 + 0.6 * Math.sin(p * Math.PI * 0.85));
    const sx = cx + Math.cos(ang) * dist;
    const sy = cy + Math.sin(ang) * dist * 0.78 - p * 35;
    const sr = (12 + (i % 3) * 5) * Math.sin(p * Math.PI);
    if (sr <= 1) continue;
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(p * 2 + i);
    ctx.fillStyle = cols[i % cols.length]; ctx.strokeStyle = INK; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -sr); ctx.quadraticCurveTo(sr * 0.22, -sr * 0.22, sr, 0);
    ctx.quadraticCurveTo(sr * 0.22, sr * 0.22, 0, sr);
    ctx.quadraticCurveTo(-sr * 0.22, sr * 0.22, -sr, 0);
    ctx.quadraticCurveTo(-sr * 0.22, -sr * 0.22, 0, -sr);
    ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

