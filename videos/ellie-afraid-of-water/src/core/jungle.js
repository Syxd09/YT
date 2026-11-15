// Lush 3D jungle riverbank & sparkling water for Tall Tale 3D.
// River spans z = -6.0 .. -1.8 across x = -22 .. +22, with dry grassy bank at z = -1.8 .. +6
// and lush far jungle bank + overhanging tree branch at z = -6.0 .. -16.
import * as THREE from 'three';
import { T, mat, sky, clouds, sunlight, tree, hills, canvasTex } from './world.js';

const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

function waterTex() {
  return canvasTex('riverwater', 512, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#2C9CE8'); gr.addColorStop(0.5, '#42B7F5'); gr.addColorStop(1, '#2B94DE');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 42; i++) {
      const x = rnd(i * 3.1) * w, y = rnd(i * 7.3) * h, len = 45 + rnd(i * 2) * 80;
      g.strokeStyle = i % 3 === 0 ? 'rgba(255,255,255,0.45)' : 'rgba(180,235,255,0.35)';
      g.lineWidth = 4 + (i % 3) * 2; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + len * 0.5, y - 8, x + len, y); g.stroke();
    }
  }, [6, 2]);
}

function fern(s = 1, col = '#4DA63E') {
  const g = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    const blade = new THREE.Mesh(new THREE.ConeGeometry(0.18 * s, 0.9 * s, 5), mat({ color: i % 2 ? col : '#62BD4E' }));
    blade.position.set(Math.cos(a) * 0.28 * s, 0.32 * s, Math.sin(a) * 0.28 * s);
    blade.rotation.z = -Math.cos(a) * 0.72;
    blade.rotation.x = Math.sin(a) * 0.72;
    blade.castShadow = true;
    g.add(blade);
  }
  return g;
}

function rock(s = 1, col = '#8F969E') {
  const m = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35 * s, 1), mat({ color: col, roughness: 0.9 }));
  m.scale.set(1.2, 0.75, 1.0); m.castShadow = m.receiveShadow = true; return m;
}

export function jungleRiver(E) {
  const scene = new THREE.Scene();
  sky(scene, { top: '#3594E8', horizon: '#C8ECFC', ground: '#5EA846' });
  const sun = sunlight(scene, E, { col: '#FFF2D6', i: 2.6, pos: [7, 15, 9], target: [0, 0, -2.5], box: 16, sky: '#CFE9FF', ground: '#6A9446', hemi: 1.3 });
  clouds(scene, [[-26, 22, -85, 14], [22, 28, -95, 17], [52, 19, -75, 11], [-4, 17, -62, 9]], '#FFFFFF');
  hills(scene, { col: '#5FB84A', z: -65 });

  // Dry lush foreground riverbank (z = -2.0 to +16)
  const nearBank = new THREE.Mesh(new THREE.BoxGeometry(50, 0.4, 18), mat({ map: T.grass('#68BE48', [14, 6]) }));
  nearBank.position.set(0, -0.2, 7.0); nearBank.receiveShadow = true; scene.add(nearBank);
  const sandEdge = new THREE.Mesh(new THREE.BoxGeometry(50, 0.36, 1.4), mat({ map: T.dirt('#E3C58E', [12, 1], false) }));
  sandEdge.position.set(0, -0.21, -2.1); sandEdge.receiveShadow = true; scene.add(sandEdge);

  // Far riverbank (z = -6.0 to -30)
  const farBank = new THREE.Mesh(new THREE.BoxGeometry(50, 0.4, 24), mat({ map: T.grass('#58AC3F', [14, 8]) }));
  farBank.position.set(0, -0.2, -18.0); farBank.receiveShadow = true; scene.add(farBank);
  const farSand = new THREE.Mesh(new THREE.BoxGeometry(50, 0.36, 1.2), mat({ map: T.dirt('#DFC089', [12, 1], false) }));
  farSand.position.set(0, -0.21, -5.9); farSand.receiveShadow = true; scene.add(farSand);

  // River bed + animated sparkling blue water (top surface at y = -0.07)
  const bed = new THREE.Mesh(new THREE.PlaneGeometry(50, 5.2), mat({ color: '#1B6DA8' }));
  bed.rotation.x = -Math.PI / 2; bed.position.set(0, -0.35, -4.0); scene.add(bed);
  const wTex = waterTex();
  const waterMat = new THREE.MeshStandardMaterial({ map: wTex, roughness: 0.22, metalness: 0.08, transparent: true, opacity: 0.92 });
  const water = new THREE.Mesh(new THREE.PlaneGeometry(50, 4.4), waterMat);
  water.rotation.x = -Math.PI / 2; water.position.set(0, -0.07, -4.0); water.receiveShadow = true; scene.add(water);

  // Gentle white foam strips along both edges
  [-2.05, -5.85].forEach((z) => {
    const foam = new THREE.Mesh(new THREE.PlaneGeometry(50, 0.16), new THREE.MeshBasicMaterial({ color: '#E8F8FF', transparent: true, opacity: 0.65 }));
    foam.rotation.x = -Math.PI / 2; foam.position.set(0, -0.06, z); scene.add(foam);
  });

  // Small puddle on the near dry grass (for the 0-4s & 4-12s fear beats)
  const puddle = new THREE.Mesh(new THREE.CircleGeometry(0.42, 24), new THREE.MeshStandardMaterial({ color: '#45B8F5', roughness: 0.15, metalness: 0.1 }));
  puddle.rotation.x = -Math.PI / 2; puddle.position.set(-2.5, 0.01, 0.55); puddle.receiveShadow = true; scene.add(puddle);

  // Overhanging jungle tree on the far-left bank with a horizontal branch sweeping right over the river (for BabyBird!)
  const bigTree = tree(1.5, '#3E9435', 'round');
  bigTree.position.set(-0.4, 0, -6.8); scene.add(bigTree);
  const branchGroup = new THREE.Group();
  branchGroup.position.set(-0.4, 2.25, -6.5);
  const limb = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.17, 3.3, 10), mat({ color: '#7A5234' }));
  limb.rotation.z = -Math.PI / 2 + 0.15; limb.rotation.y = -0.62;
  limb.position.set(1.15, -0.18, 1.35); limb.castShadow = true; branchGroup.add(limb);
  const twigLeaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 1), mat({ color: '#4EA43D' }));
  twigLeaf.position.set(0.35, 0.18, 0.45); twigLeaf.castShadow = true; branchGroup.add(twigLeaf);
  const tipLeaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 1), mat({ color: '#5EC04A' }));
  tipLeaf.position.set(2.15, -0.25, 2.35); tipLeaf.castShadow = true; branchGroup.add(tipLeaf);
  scene.add(branchGroup);

  // Surrounding jungle trees, rocks, ferns, and wildflowers (never blocking river camera lane or inside river z = -6..-1.8)
  [[-6.5, -8.5, 1.3], [3.2, -9.2, 1.5], [6.4, -8.5, 1.4], [8.8, -7.6, 1.2], [-9.0, 2.2, 1.2], [7.5, 2.5, 1.3]].forEach(([x, z, s], i) => {
    const t = tree(s, i % 2 ? '#3F9637' : '#52AB42', i % 3 === 0 ? 'cypress' : 'round');
    t.position.set(x, 0, z); scene.add(t);
  });
  [[-4.8, -0.8, 1.1], [-3.3, -1.5, 0.9], [3.1, -1.2, 1.1], [5.0, -1.0, 1.2], [-3.8, -6.7, 1.3], [3.5, -6.5, 1.2]].forEach(([x, z, s], i) => {
    const f = fern(s, i % 2 ? '#429B37' : '#58B647'); f.position.set(x, 0, z); scene.add(f);
  });
  [[-3.6, -2.0, 0.9], [-2.2, -2.1, 0.65], [3.2, -5.6, 1.1], [-0.4, -5.5, 0.8]].forEach(([x, z, s]) => {
    const rk = rock(s); rk.position.set(x, 0.12 * s, z); scene.add(rk);
  });

  // Tall grass cluster where Ellie hides at x = -4.2, z = 0.2 (parted slightly in middle so Ellie's face peeks cleanly)
  const hideGrass = new THREE.Group(); hideGrass.position.set(-4.2, 0, 0.2);
  for (let i = 0; i < 14; i++) {
    const blade = new THREE.Mesh(new THREE.ConeGeometry(0.095, 0.68 + (i % 3) * 0.2, 4), mat({ color: i % 2 ? '#4DA83B' : '#65BF4C' }));
    const ox = (rnd(i * 3) - 0.5) * 1.5;
    blade.position.set(Math.abs(ox) < 0.22 ? ox + Math.sign(ox || 1) * 0.26 : ox, 0.34, (rnd(i * 7) - 0.5) * 0.5 + 0.35);
    blade.rotation.z = (rnd(i * 5) - 0.5) * 0.35; blade.castShadow = true; hideGrass.add(blade);
  }
  scene.add(hideGrass);

  // Colorful jungle flowers & grass tufts on the banks
  const fl = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.06, 0), new THREE.MeshStandardMaterial({ roughness: 0.6 }), 900);
  const m4 = new THREE.Matrix4(); let fi = 0;
  for (let i = 0; i < 1500 && fi < 900; i++) {
    const x = (rnd(i * 1.7) - 0.5) * 26, z = (rnd(i * 2.9) - 0.5) * 18 - 2;
    if (z > -6.1 && z < -1.6) continue;
    m4.makeTranslation(x, 0.06, z); fl.setMatrixAt(fi, m4);
    fl.setColorAt(fi, new THREE.Color(['#FFD43B', '#FF6B8B', '#FFFFFF', '#B98ACF', '#FF8E3C'][fi % 5]));
    fi++;
  }
  fl.count = fi; scene.add(fl);

  // Animated water ripple ring + splash droplets
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.28, 32), new THREE.MeshBasicMaterial({ color: '#FFFFFF', side: THREE.DoubleSide, transparent: true, opacity: 0 }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = -0.05; scene.add(ring);
  const ring2 = ring.clone(); scene.add(ring2);

  // Warm golden sunset light adjuster for ending
  const setSunset = (k) => {
    sun.key.color.set('#FFF2D6').lerp(new THREE.Color('#FFB87A'), k);
    sun.key.intensity = 2.6 - 0.3 * k;
  };
  const setRipple = (x, z, age) => {
    const show = (r, a) => {
      if (a <= 0 || a >= 1) { r.material.opacity = 0; return; }
      r.position.set(x, -0.045, z); r.scale.setScalar(1 + a * 4.5); r.material.opacity = (1 - a) * 0.75;
    };
    show(ring, age % 1); show(ring2, (age + 0.45) % 1);
  };
  const update = (t) => { wTex.offset.x = (t * 0.08) % 1; wTex.offset.y = Math.sin(t * 0.9) * 0.02; };

  return { scene, sun, branchGroup, puddle, update, setRipple, setSunset };
}

