// Magical 3D sunlit flower garden + rainbow + interactive dry-to-lush soil for Tall Tale 3D.
import * as THREE from 'three';
import { T, mat, clouds, sunlight, tree, hills, fence, canvasTex } from './world.js';

const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

function drySoilTex() {
  return canvasTex('drySoil', 512, 512, (g, w, h) => {
    g.fillStyle = '#C99B66'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1200; i++) {
      g.fillStyle = i % 2 ? '#BA8B56' : '#D6AA76'; g.globalAlpha = 0.45;
      g.beginPath(); g.arc(rnd(i * 2.1) * w, rnd(i * 3.7) * h, 2 + rnd(i * 5) * 4, 0, 7); g.fill();
    }
    // Crisp cracked dry-earth lines
    g.globalAlpha = 0.72; g.strokeStyle = '#6E4C29'; g.lineWidth = 6; g.lineCap = 'round';
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + 0.2;
      const r1 = 42 + rnd(i * 3) * 35, r2 = 165 + rnd(i * 7) * 75;
      const cx = w / 2, cy = h / 2;
      g.beginPath();
      g.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      g.quadraticCurveTo(
        cx + Math.cos(a + 0.16) * (r1 + r2) * 0.5,
        cy + Math.sin(a + 0.16) * (r1 + r2) * 0.5,
        cx + Math.cos(a - 0.08) * r2,
        cy + Math.sin(a - 0.08) * r2,
      );
      g.stroke();
    }
    g.globalAlpha = 1;
  });
}

function wetSoilTex() {
  return canvasTex('wetSoil', 512, 512, (g, w, h) => {
    g.fillStyle = '#6A4223'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1200; i++) {
      g.fillStyle = i % 3 ? '#5A3519' : '#7D512E'; g.globalAlpha = 0.5;
      g.beginPath(); g.arc(rnd(i * 4.1) * w, rnd(i * 1.9) * h, 2 + rnd(i * 6) * 4, 0, 7); g.fill();
    }
    g.globalAlpha = 0.55; g.fillStyle = '#9FE8FF';
    for (let i = 0; i < 35; i++) {
      g.beginPath(); g.arc(90 + rnd(i * 9) * (w - 180), 90 + rnd(i * 13) * (h - 180), 3 + rnd(i) * 3, 0, 7); g.fill();
    }
    g.globalAlpha = 1;
  });
}

function makeFlower(petalCol = '#FF6B9D', scale = 1) {
  const g = new THREE.Group();
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.036, 0.42, 8), mat({ color: '#45A838' }));
  stem.position.y = 0.21; stem.castShadow = true; g.add(stem);
  const head = new THREE.Group(); head.position.y = 0.43;
  const pMat = mat({ color: petalCol, roughness: 0.5 });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const pet = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), pMat);
    pet.scale.set(1.0, 0.45, 1.35);
    pet.position.set(Math.cos(a) * 0.1, 0, Math.sin(a) * 0.1);
    pet.rotation.y = -a;
    head.add(pet);
  }
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 8), mat({ color: '#FFD93D', roughness: 0.4 }));
  core.position.y = 0.02; head.add(core);
  head.rotation.x = 0.25;
  g.add(head);
  g.scale.setScalar(scale);
  return g;
}

function makeButterfly(col = '#FF85B3') {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.014, 0.06, 4, 6), mat({ color: '#33243B' }));
  body.rotation.x = Math.PI / 2; g.add(body);
  const wMat = new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide });
  const wL = new THREE.Mesh(new THREE.CircleGeometry(0.065, 10), wMat);
  wL.position.set(-0.045, 0, 0); wL.rotation.x = -Math.PI / 2; wL.scale.set(1.1, 1.35, 1);
  const wR = wL.clone(); wR.position.set(0.045, 0, 0);
  g.add(wL, wR);
  g.userData = { wL, wR };
  return g;
}

export function magicGarden(E) {
  const scene = new THREE.Scene();

  // Dynamic sky sphere (morning azure -> soft rain-hue / golden sunset rainbow)
  const skyUniforms = {
    top: { value: new THREE.Color('#3899EC') },
    hor: { value: new THREE.Color('#CBEFFF') },
    gnd: { value: new THREE.Color('#66C24A') },
  };
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false, toneMapped: false,
    uniforms: skyUniforms,
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform vec3 top, hor, gnd; varying vec3 vP; void main(){ float y = vP.y; vec3 c = y > 0.0 ? mix(hor, top, pow(clamp(y * 1.5, 0.0, 1.0), 0.72)) : gnd; gl_FragColor = vec4(c, 1.0); }',
  });
  const skyMesh = new THREE.Mesh(new THREE.SphereGeometry(380, 32, 16), skyMat);
  skyMesh.renderOrder = -10; scene.add(skyMesh);

  const sun = sunlight(scene, E, { col: '#FFF5DF', i: 2.55, pos: [6, 14, 8], target: [0, 0.8, -1.5], box: 14, sky: '#D6EEFF', ground: '#6A9E48', hemi: 1.35 });
  clouds(scene, [[-28, 22, -85, 15], [24, 26, -92, 17], [-6, 18, -68, 10], [48, 20, -78, 13]], '#FFFFFF');
  hills(scene, { col: '#69C252', z: -68 });

  // Soft 7-band 3D rainbow arching cleanly over Puffy & Sunny below the KIDOLU end card
  const rainbowGroup = new THREE.Group();
  rainbowGroup.position.set(0, -0.35, -22);
  const rbCols = ['#FF595E', '#FF924C', '#FFCA3A', '#8AC926', '#1982C4', '#4B6EF5', '#9B5DE5'];
  const rbMats = rbCols.map((c, idx) => {
    const m = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
    const arc = new THREE.Mesh(new THREE.TorusGeometry(4.75 - idx * 0.21, 0.14, 8, 56, Math.PI), m);
    rainbowGroup.add(arc);
    return m;
  });
  scene.add(rainbowGroup);

  // Lush meadow grass ground
  const meadowFloor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), mat({ map: T.grass('#6BC84E', [24, 24]) }));
  meadowFloor.rotation.x = -Math.PI / 2; meadowFloor.position.set(0, 0, -4); meadowFloor.receiveShadow = true; scene.add(meadowFloor);

  // Crisp white garden fence along the background edge (z = -7.8)
  const backFence = fence(20, '#FFFDF7');
  backFence.position.set(-10, 0, -7.8); scene.add(backFence);

  // Cozy backdrop trees outside the center stage so Sunny & Puffy have clean sky behind them
  [[-5.6, -7.2, 1.35], [5.8, -7.0, 1.45], [-8.5, -3.5, 1.2], [8.5, -3.0, 1.25]].forEach(([x, z, s], i) => {
    const tr = tree(s, i % 2 ? '#45A339' : '#57BA46', i === 1 ? 'cypress' : 'round');
    tr.position.set(x, 0, z); scene.add(tr);
  });

  // Sunny's central soil patch at (0, 0.015, -1.5) — crossfades smoothly from dry-cracked to rich-wet!
  const soilRim = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 1.02, 0.08, 28), mat({ color: '#9E784B' }));
  soilRim.position.set(0, 0.03, -1.5); soilRim.receiveShadow = true; scene.add(soilRim);
  const dryDisc = new THREE.Mesh(new THREE.CircleGeometry(0.88, 32), mat({ map: drySoilTex(), roughness: 0.95 }));
  dryDisc.rotation.x = -Math.PI / 2; dryDisc.position.set(0, 0.075, -1.5); dryDisc.receiveShadow = true; scene.add(dryDisc);
  const wetMat = new THREE.MeshStandardMaterial({ map: wetSoilTex(), roughness: 0.45, metalness: 0.05, transparent: true, opacity: 0 });
  const wetDisc = new THREE.Mesh(new THREE.CircleGeometry(0.885, 32), wetMat);
  wetDisc.rotation.x = -Math.PI / 2; wetDisc.position.set(0, 0.079, -1.5); wetDisc.receiveShadow = true; scene.add(wetDisc);

  // Little sprout tufts around Sunny's patch that perk up with water
  const sprouts = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.35;
    const sp = new THREE.Group();
    sp.position.set(Math.cos(a) * 0.72, 0.07, -1.5 + Math.sin(a) * 0.72);
    for (let b = -1; b <= 1; b += 2) {
      const blade = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.22, 5), mat({ color: '#58C443' }));
      blade.position.set(b * 0.025, 0.1, 0); blade.rotation.z = -b * 0.32; sp.add(blade);
    }
    sp.scale.setScalar(0.25); scene.add(sp); sprouts.push(sp);
  }

  // Cheerful colourful tulips/daisies framing the left & right meadow beds (never overlapping Sunny at x=0)
  const flowers = [];
  const fCols = ['#FF6B9D', '#FF9F43', '#A678FF', '#FF595E', '#54C6EB', '#FFD93D'];
  for (let i = 0; i < 42; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const fx = side * (1.25 + rnd(i * 2.3) * 4.4);
    const fz = -6.2 + rnd(i * 4.7) * 7.8;
    const fl = makeFlower(fCols[i % fCols.length], 0.8 + rnd(i * 7.1) * 0.55);
    fl.position.set(fx, 0, fz);
    scene.add(fl);
    flowers.push({ mesh: fl, ph: rnd(i * 11) * 6.28 });
  }

  // Animated fluttering butterflies
  const butterflies = [
    { b: makeButterfly('#FF85B3'), bx: -1.7, by: 0.9, bz: -1.2, rx: 0.45, rz: 0.35, sp: 1.4, ph: 0.0 },
    { b: makeButterfly('#FFD43B'), bx: 1.85, by: 1.05, bz: -1.6, rx: 0.5, rz: 0.4, sp: 1.2, ph: 1.9 },
    { b: makeButterfly('#66D9FF'), bx: -2.3, by: 1.25, bz: -3.4, rx: 0.65, rz: 0.45, sp: 1.0, ph: 3.4 },
    { b: makeButterfly('#C48BFF'), bx: 2.35, by: 1.15, bz: -3.2, rx: 0.55, rz: 0.45, sp: 1.3, ph: 5.1 },
  ];
  butterflies.forEach((f) => scene.add(f.b));

  const setMood = ({ wet = 0, rainbow = 0, overcast = 0, golden = 0 } = {}) => {
    wetMat.opacity = Math.max(0, Math.min(1, wet));
    sprouts.forEach((sp, i) => {
      const s = 0.28 + wet * 0.95;
      sp.scale.setScalar(s);
      sp.rotation.z = Math.sin(i * 2.1) * (1 - wet) * 0.25;
    });
    rbMats.forEach((m) => { m.opacity = rainbow * 0.78; });

    // Smooth atmospheric lighting adjustments
    const topC = new THREE.Color('#3899EC')
      .lerp(new THREE.Color('#4B8FD8'), overcast)
      .lerp(new THREE.Color('#429AEF'), golden);
    const horC = new THREE.Color('#CBEFFF')
      .lerp(new THREE.Color('#B4D4EE'), overcast)
      .lerp(new THREE.Color('#FFE8D2'), golden);
    skyUniforms.top.value.copy(topC);
    skyUniforms.hor.value.copy(horC);
    sun.key.color.set('#FFF5DF').lerp(new THREE.Color('#FFB884'), golden * 0.65);
    sun.key.intensity = 2.55 - overcast * 0.35 + golden * 0.15;
  };

  const update = (t) => {
    flowers.forEach(({ mesh, ph }) => {
      mesh.rotation.z = Math.sin(t * 2.1 + ph) * 0.05;
    });
    butterflies.forEach((f) => {
      const a = t * f.sp + f.ph;
      f.b.position.set(
        f.bx + Math.sin(a) * f.rx,
        f.by + Math.sin(a * 2.1) * 0.18,
        f.bz + Math.cos(a) * f.rz,
      );
      f.b.rotation.y = Math.atan2(Math.cos(a) * f.rx, -Math.sin(a) * f.rz);
      const flap = Math.sin(t * 17 + f.ph) * 0.8;
      f.b.userData.wL.rotation.z = flap;
      f.b.userData.wR.rotation.z = -flap;
    });
  };

  return { scene, sun, setMood, update };
}

