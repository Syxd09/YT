// 3D Anatomy & Sets for "Why Do Your Fingers Wrinkle in Water?" (Deep Dive 3D)
// 1. bathScene(E)     : warm sunlit bathroom vanity + basin with rippling water (for Hero Human shots)
// 2. fingerMacro(E)   : sculpted 3D human hand with morphing wrinkle ridges, wet sphere grip & cyan X-ray internals
// 3. cutawayStage(E)  : longitudinal 3D anatomical fingertip cutaway (epidermis, cyan pulp, nerve pulses, narrowing vessels)
// 4. gripCompare(E)   : side-by-side 3D macro contact comparison (smooth vs wrinkled wet-object drainage)
import * as THREE from 'three';
import { rbox, ellipsoid, capsule, smin, sphere, mesh, rgb } from './sdf.js';
import { lightRig } from './engine.js';
import { xrayMaterial } from './sets.js';

const std = (color, rough = 0.65, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, ...extra });
const phys = (color, rough = 0.5, extra = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: rough, ...extra });

// Dynamic fingertip ridge-displacement helper: modifies vertex height & subtle trough crease shading cleanly
function buildMorphPadGeo(rx = 0.036, len = 0.14, ridgeFreq = 52) {
  const segU = 48, segV = 84;
  const geo = new THREE.SphereGeometry(1, segV, segU);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i) * rx;
    let y = pos.getY(i) * (len * 0.52);
    let z = pos.getZ(i) * (rx * 0.92);
    if (y > 0) {
      const taper = 1 - Math.pow(y / (len * 0.52), 2.4) * 0.14;
      x *= taper; z *= taper;
    }
    if (z > 0) z *= 0.88;
    pos.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  geo.userData.basePos = pos.array.slice();
  geo.userData.baseNorm = geo.attributes.normal.array.slice();
  geo.userData.ridgeFreq = ridgeFreq;
  const cols = new Float32Array(pos.count * 3);
  geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  return geo;
}

const SKIN_CREAST_LIN = rgb('#E3A988');
const SKIN_VALLEY_LIN = rgb('#A86850');

function applyPadWrinkle(geo, w = 0, rxScale = 1) {
  const pos = geo.attributes.position;
  const col = geo.attributes.color;
  const base = geo.userData.basePos;
  const norm = geo.userData.baseNorm;
  const freq = geo.userData.ridgeFreq || 620;
  for (let i = 0; i < pos.count; i++) {
    const bx = base[i * 3], by = base[i * 3 + 1], bz = base[i * 3 + 2];
    const nx = norm[i * 3], ny = norm[i * 3 + 1], nz = norm[i * 3 + 2];
    const padMask = Math.max(0, Math.min(1, (bz / rxScale) / 0.011));
    const seamFade = Math.max(0, Math.min(1, (by / rxScale + 0.018) / 0.024));
    const mask = padMask * seamFade;
    const raw = Math.sin((bx / rxScale) * freq + Math.sin((by / rxScale) * 58) * 1.15);
    const trough = Math.pow(0.5 - 0.5 * raw, 1.4);
    const disp = (-0.0005 - 0.0024 * trough) * rxScale * w * mask;
    pos.setXYZ(i, bx + nx * disp, by + ny * disp, bz + nz * disp);
    const k = trough * w * mask;
    col.setXYZ(
      i,
      SKIN_CREAST_LIN[0] + (SKIN_VALLEY_LIN[0] - SKIN_CREAST_LIN[0]) * k,
      SKIN_CREAST_LIN[1] + (SKIN_VALLEY_LIN[1] - SKIN_CREAST_LIN[1]) * k,
      SKIN_CREAST_LIN[2] + (SKIN_VALLEY_LIN[2] - SKIN_CREAST_LIN[2]) * k,
    );
  }
  pos.needsUpdate = true;
  col.needsUpdate = true;
  geo.computeVertexNormals();
}

// ═════════════════════════ 1. BATHROOM BASIN SCENE (Hero Human) ═════════════════════════
export function bathScene(E) {
  const scene = new THREE.Scene();
  scene.environment = E.envMap; scene.environmentIntensity = 0.35;
  scene.background = new THREE.Color('#EAE0D0');
  scene.fog = new THREE.Fog('#EAE0D0', 6, 18);

  // Tiled floor & warm beige bathroom walls
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), std('#D9CCB8', 0.55));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(10, 4, 0.2), std('#F2E7D6', 0.9));
  backWall.position.set(0, 2, -2.1); backWall.receiveShadow = true; scene.add(backWall);

  // Soft sunlit bathroom frosted window
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.4), new THREE.MeshBasicMaterial({ color: new THREE.Color('#E3F2FF').multiplyScalar(1.35) }));
  win.position.set(-0.9, 1.95, -1.98); scene.add(win);
  const frame = std('#FFFFFF', 0.4);
  for (const [w, h, x, y] of [[1.6, 0.07, -0.9, 2.66], [1.6, 0.07, -0.9, 1.24], [0.07, 1.46, -1.68, 1.95], [0.07, 1.46, -0.12, 1.95]]) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.09), frame);
    m.position.set(x, y, -1.95); scene.add(m);
  }

  // Bathroom vanity & deep illuminated water basin in front of Hero (Hero at z=-0.55, Basin center z=0.02)
  const wood = std('#A57B56', 0.6);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.85, 0.65), wood);
  cab.position.set(0.1, 0.425, 0.02); cab.castShadow = cab.receiveShadow = true; scene.add(cab);

  const counter = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.06, 0.72), phys('#F4F0E8', 0.25, { clearcoat: 0.6 }));
  counter.position.set(0.1, 0.88, 0.02); counter.receiveShadow = true; scene.add(counter);

  // Glass water bowl resting on counter so viewer clearly sees hand submerged inside!
  const bowlOuter = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.22, 0.19, 36, 1, true),
    phys('#D8F2FF', 0.08, { transmission: 0.65, transparent: true, opacity: 0.45, side: THREE.DoubleSide }),
  );
  bowlOuter.position.set(0.26, 1.0, 0.05); scene.add(bowlOuter);
  const bowlRim = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.012, 12, 36), phys('#FFFFFF', 0.15, { clearcoat: 1 }));
  bowlRim.rotation.x = Math.PI / 2; bowlRim.position.set(0.26, 1.095, 0.05); scene.add(bowlRim);

  const waterGeo = new THREE.CircleGeometry(0.265, 36);
  const waterMat = phys('#5CC8F0', 0.08, { transparent: true, opacity: 0.62, clearcoat: 1 });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2; water.position.set(0.26, 1.055, 0.05); scene.add(water);

  // Subtle mirror panel behind vanity
  const mirror = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.9, 0.04), phys('#DCE8F2', 0.12, { metalness: 0.35, clearcoat: 1 }));
  mirror.position.set(0.55, 1.75, -1.96); scene.add(mirror);

  const L = lightRig(scene, { key: '#FFE0B8', keyI: 3.9, keyPos: [-1.8, 3.2, 2.2], target: [0.15, 1.15, -0.2], rimCol: '#CFE4FF', rimI: 1.4, hemiI: 0.85, shadowBox: 2.8 });
  const fill = new THREE.DirectionalLight('#FFF3E4', 1.25); fill.position.set(1.8, 2.4, 3.2); scene.add(fill);

  const update = (t) => {
    water.position.y = 1.055 + Math.sin(t * 2.8) * 0.0025;
  };
  return { scene, water, lights: L, update };
}

// ═════════════════════════ 2. MACRO 3D HAND & X-RAY RIG ═════════════════════════
export function fingerMacro(E) {
  const scene = new THREE.Scene();
  scene.environment = E.envMap; scene.environmentIntensity = 0.25;
  const WATER_BG = new THREE.Color('#0C344C');
  const XRAY_BG = new THREE.Color('#061426');
  scene.background = WATER_BG.clone();
  const fog = new THREE.FogExp2('#0C344C', 0.55);
  scene.fog = fog;

  const waterKey = new THREE.DirectionalLight('#D6F4FF', 2.4); waterKey.position.set(1.4, 0.85, 0.45); scene.add(waterKey);
  const warmRim = new THREE.DirectionalLight('#FFE0C2', 1.45); warmRim.position.set(-1.1, 0.35, 0.65); scene.add(warmRim);
  const hemi = new THREE.HemisphereLight('#7AD8FF', '#091E2D', 0.9); scene.add(hemi);

  const skinMat = phys('#E3A988', 0.48, { clearcoat: 0.42, clearcoatRoughness: 0.25, sheen: 0.38, sheenColor: new THREE.Color('#ffd6c2') });
  const padMat = phys('#FFFFFF', 0.46, { vertexColors: true, clearcoat: 0.45, clearcoatRoughness: 0.25, sheen: 0.38, sheenColor: new THREE.Color('#ffd6c2') });
  const nailMat = phys('#F7DDD2', 0.2, { clearcoat: 0.9 });
  const xrayMat = xrayMaterial('#4FD1E8', 0.92);

  const handGroup = new THREE.Group();
  scene.add(handGroup);

  // Palm sculpted smoothly with SDF
  const palmGeo = mesh((p) => {
    let d = ellipsoid(p, [0, -0.05, 0], [0.072, 0.088, 0.028]);
    d = smin(d, capsule(p, [0, -0.13, 0], [0, -0.26, -0.005], 0.044, 0.048), 0.03);
    return d;
  }, [[-0.1, -0.28, -0.06], [0.1, 0.06, 0.06]], 0.004);
  const palmMesh = new THREE.Mesh(palmGeo, skinMat);
  handGroup.add(palmMesh);

  // 4 fingers + thumb with individual animated wrinkle tip pads + nails + articulated joints
  const fingerSpecs = [
    { name: 'pinky',  x: -0.052, y: 0.025, len1: 0.058, len2: 0.046, r: 0.0145, rz: 0.10 },
    { name: 'ring',   x: -0.018, y: 0.038, len1: 0.072, len2: 0.055, r: 0.0165, rz: 0.03 },
    { name: 'middle', x:  0.018, y: 0.044, len1: 0.078, len2: 0.060, r: 0.0175, rz: -0.02 },
    { name: 'index',  x:  0.054, y: 0.034, len1: 0.070, len2: 0.054, r: 0.0170, rz: -0.08 },
  ];

  const skinMeshes = [palmMesh];
  const nailMeshes = [];
  const tipPads = [];
  const fingerPivots = [];
  const xrayInternals = new THREE.Group();
  handGroup.add(xrayInternals);

  const nerveMat = new THREE.MeshBasicMaterial({ color: '#78F6FF' });
  const vesselMat = phys('#D8243A', 0.35, { emissive: '#941224', emissiveIntensity: 0.65 });
  const pulseOrbs = [];

  fingerSpecs.forEach((f, idx) => {
    const baseG = new THREE.Group();
    baseG.position.set(f.x, f.y, 0); baseG.rotation.z = f.rz;
    handGroup.add(baseG);
    fingerPivots.push(baseG);

    // Proximal & middle phalanx
    const prox = new THREE.Mesh(new THREE.CapsuleGeometry(f.r, f.len1, 10, 20), skinMat);
    prox.position.y = f.len1 * 0.5; baseG.add(prox); skinMeshes.push(prox);

    const midG = new THREE.Group(); midG.position.y = f.len1; baseG.add(midG);
    const tipPadGeo = buildMorphPadGeo(f.r * 0.99, f.len2 * 1.32, 620 + idx * 45);
    const tipPad = new THREE.Mesh(tipPadGeo, padMat);
    tipPad.position.y = f.len2 * 0.44;
    midG.add(tipPad);
    tipPads.push({ mesh: tipPad, geo: tipPadGeo });

    // Clean dorsal fingernail on back (-z) side of distal phalanx
    const nail = new THREE.Mesh(new THREE.SphereGeometry(f.r * 0.72, 16, 12), nailMat);
    nail.scale.set(0.95, 1.35, 0.25);
    nail.position.set(0, f.len2 * 0.65, -f.r * 0.76);
    midG.add(nail);
    nailMeshes.push(nail);

    // Cyan X-ray digital nerves + arteriole loop running into each finger tip
    const curveN = new THREE.CatmullRomCurve3([
      new THREE.Vector3(f.x * 0.45, -0.18, 0.0),
      new THREE.Vector3(f.x, f.y, 0.0),
      new THREE.Vector3(f.x - Math.sin(f.rz) * (f.len1 + f.len2 * 0.65), f.y + Math.cos(f.rz) * (f.len1 + f.len2 * 0.65), 0.004),
    ]);
    const nerveTube = new THREE.Mesh(new THREE.TubeGeometry(curveN, 24, 0.0024, 8, false), nerveMat);
    xrayInternals.add(nerveTube);

    const vPts = [
      new THREE.Vector3(f.x * 0.5 + 0.005, -0.18, 0.002),
      new THREE.Vector3(f.x + 0.004, f.y + f.len1 * 0.5, 0.004),
      new THREE.Vector3(f.x - Math.sin(f.rz) * (f.len1 + f.len2 * 0.72), f.y + Math.cos(f.rz) * (f.len1 + f.len2 * 0.72), 0.006),
      new THREE.Vector3(f.x - 0.005, f.y + f.len1 * 0.5, 0.004),
    ];
    const vTube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(vPts), 24, 0.0032, 8, false), vesselMat);
    xrayInternals.add(vTube);

    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.0058, 12, 10), new THREE.MeshBasicMaterial({ color: '#9AF6FF' }));
    xrayInternals.add(orb);
    pulseOrbs.push({ orb, curve: curveN, phase: idx * 0.22 });
  });

  // Sculpted Thumb
  const thumbG = new THREE.Group();
  thumbG.position.set(0.068, -0.055, 0.012); thumbG.rotation.set(0.15, -0.25, -0.58);
  handGroup.add(thumbG);
  const thumbGeo = buildMorphPadGeo(0.019, 0.095, 580);
  const thumbMesh = new THREE.Mesh(thumbGeo, padMat);
  thumbMesh.position.y = 0.042;
  thumbG.add(thumbMesh);
  tipPads.push({ mesh: thumbMesh, geo: thumbGeo });

  // Wet glass marble sphere for the S15 underwater grip beat (translucent sky glass sized nicely to palm/tips!)
  const wetOrb = new THREE.Mesh(
    new THREE.SphereGeometry(0.038, 32, 24),
    phys('#6AD2F5', 0.08, { clearcoat: 1, transparent: true, opacity: 0.62 }),
  );
  wetOrb.position.set(0.025, 0.132, 0.055);
  wetOrb.visible = false;
  handGroup.add(wetOrb);

  // Subtle floating underwater micro-bubbles
  const NB = 85;
  const bub = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.005, 10, 8),
    phys('#D8F6FF', 0.1, { transparent: true, opacity: 0.6 }),
    NB,
  );
  const bSeeds = Array.from({ length: NB }, (_, i) => [
    Math.sin(i * 19.3) * 0.35,
    (Math.cos(i * 31.7) * 0.5) - 0.1,
    Math.sin(i * 11.1) * 0.25 - 0.08,
    0.5 + (i % 4) * 0.4,
  ]);
  scene.add(bub);
  const m4 = new THREE.Matrix4(), v3 = new THREE.Vector3(), q = new THREE.Quaternion(), sv = new THREE.Vector3();

  let lastWrinkle = -1;
  const setState = ({ wrinkle = 0, xray = 0, pulseT = 0, grip = false, gripCurl = 0, t = 0 } = {}) => {
    const rw = Math.round(wrinkle * 40) / 40;
    if (rw !== lastWrinkle) {
      lastWrinkle = rw;
      tipPads.forEach((p) => applyPadWrinkle(p.geo, rw, 1));
    }
    const isX = xray > 0.5;
    skinMeshes.forEach((m) => { m.material = isX ? xrayMat : skinMat; });
    tipPads.forEach((p) => { p.mesh.material = isX ? xrayMat : padMat; });
    nailMeshes.forEach((m) => { m.material = isX ? xrayMat : nailMat; });
    xrayInternals.visible = isX;

    scene.background.copy(WATER_BG).lerp(XRAY_BG, xray);
    fog.color.copy(scene.background);
    fog.density = isX ? 0.18 : 0.45;
    bub.visible = !isX;

    // Gentle finger curl when gripping wet orb
    wetOrb.visible = grip;
    fingerPivots.forEach((g, idx) => {
      g.rotation.x = gripCurl * (0.45 + idx * 0.05);
    });
    thumbG.rotation.x = 0.15 + gripCurl * 0.42;

    if (isX) {
      pulseOrbs.forEach(({ orb, curve, phase }) => {
        const u = (pulseT + phase) % 1;
        orb.position.copy(curve.getPointAt(u));
      });
    }
    if (!isX) {
      bSeeds.forEach(([bx, by, bz, sz], i) => {
        v3.set(bx + Math.sin(t * 2 + i) * 0.008, ((by + t * 0.12 + 0.4) % 0.8) - 0.35, bz);
        sv.setScalar(sz);
        m4.compose(v3, q, sv);
        bub.setMatrixAt(i, m4);
      });
      bub.instanceMatrix.needsUpdate = true;
    }
  };

  return { scene, handGroup, wetOrb, setState };
}

// ═════════════════════════ 3. 3D FINGERTIP ANATOMICAL CUTAWAY ═════════════════════════
export function cutawayStage(E) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#061426');
  scene.fog = new THREE.FogExp2('#061426', 0.14);

  scene.add(new THREE.HemisphereLight('#88E2FF', '#050C18', 0.95));
  const key = new THREE.DirectionalLight('#E8F8FF', 2.4); key.position.set(1.5, 2.5, 2.2); scene.add(key);
  const rim = new THREE.DirectionalLight('#4FD1E8', 2.2); rim.position.set(-1.5, 0.5, -1.5); scene.add(rim);

  const stage = new THREE.Group();
  scene.add(stage);

  // Cutaway base cradle (translucent cyan glass contour framing cross section cleanly)
  const shellGeo = new THREE.CylinderGeometry(0.42, 0.46, 1.35, 32, 1, false, Math.PI * 0.95, Math.PI * 1.1);
  shellGeo.rotateZ(Math.PI / 2);
  const shell = new THREE.Mesh(shellGeo, xrayMaterial('#4FD1E8', 0.95));
  shell.position.set(0, -0.02, -0.02);
  stage.add(shell);

  // Distal phalanx bone visible deep at bottom edge of cross-section
  const boneMat = std('#E6F7FF', 0.4, { emissive: '#6ED4EB', emissiveIntensity: 0.25 });
  const bone = new THREE.Mesh(new THREE.CapsuleGeometry(0.095, 0.88, 12, 24), boneMat);
  bone.rotation.z = Math.PI / 2;
  bone.position.set(-0.08, -0.24, -0.02);
  stage.add(bone);

  // Subcutaneous pulp matrix (soft translucent cyan/warm gel cushioning beneath skin — compresses as vessels narrow!)
  const pulp = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.24, 0.92, 16, 28),
    phys('#36C2E8', 0.35, { transparent: true, opacity: 0.34, emissive: '#1D7896', emissiveIntensity: 0.45 }),
  );
  pulp.rotation.z = Math.PI / 2;
  pulp.position.set(0, 0.03, 0.02);
  stage.add(pulp);

  // Dynamic Epidermis Roof Grid: smooth real-skin shaded outer arch along top of cross-section, folds inward into wrinkles!
  const epSegX = 72, epSegZ = 36;
  const epGeo = new THREE.PlaneGeometry(1.36, 0.68, epSegX, epSegZ);
  epGeo.rotateX(-Math.PI / 2);
  const epPos = epGeo.attributes.position;
  for (let i = 0; i < epPos.count; i++) {
    const x = epPos.getX(i);
    const z = epPos.getZ(i);
    // Curve slightly across Z and taper softly toward the fingertip (+X)
    const domeZ = -Math.pow(z / 0.35, 2) * 0.14;
    const tipCurve = x > 0.3 ? -Math.pow((x - 0.3) / 0.38, 2) * 0.16 : 0;
    epPos.setY(i, 0.28 + domeZ + tipCurve);
  }
  epGeo.computeVertexNormals();
  epGeo.userData.baseY = Array.from({ length: epPos.count }, (_, i) => epPos.getY(i));
  const epMat = phys('#E3A988', 0.45, { sheen: 0.4, sheenColor: new THREE.Color('#ffd6c2'), side: THREE.DoubleSide });
  const epXrayMat = xrayMaterial('#5CE2FA', 1.15);
  const epMesh = new THREE.Mesh(epGeo, epMat);
  stage.add(epMesh);

  // Branching Blood Vessels (main arteriole trunk + 6 upright capillary loops whose cross-section narrows dramatically!)
  const vMat = phys('#D8243A', 0.25, { clearcoat: 1, emissive: '#8E1020', emissiveIntensity: 0.6 });
  const vessels = [];
  const trunkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.68, -0.08, 0.05),
    new THREE.Vector3(-0.22, -0.05, 0.07),
    new THREE.Vector3(0.24, -0.04, 0.06),
    new THREE.Vector3(0.56, -0.08, 0.02),
  ]);
  const trunkGroup = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.TubeGeometry(trunkCurve, 40, 0.042, 16, false), vMat);
  trunkGroup.add(trunk); stage.add(trunkGroup); vessels.push({ mesh: trunkGroup, axis: 'y' });

  [-0.45, -0.25, -0.05, 0.15, 0.35].forEach((vx, idx) => {
    const loopC = new THREE.CatmullRomCurve3([
      new THREE.Vector3(vx - 0.05, -0.05, 0.06),
      new THREE.Vector3(vx - 0.03, 0.14 + (idx % 2) * 0.03, 0.09),
      new THREE.Vector3(vx + 0.04, 0.14 + (idx % 2) * 0.03, 0.09),
      new THREE.Vector3(vx + 0.06, -0.05, 0.06),
    ]);
    const cap = new THREE.Mesh(new THREE.TubeGeometry(loopC, 28, 0.025, 12, false), vMat);
    const cg = new THREE.Group(); cg.position.set(vx, 0.05, 0.07);
    cap.position.set(-vx, -0.05, -0.07);
    cg.add(cap); stage.add(cg);
    vessels.push({ mesh: cg, isLoop: true });
  });

  // Sympathetic cyan nerve filament & electric firing signal spheres
  const nerveCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.72, -0.18, 0.11),
    new THREE.Vector3(-0.30, -0.14, 0.12),
    new THREE.Vector3(0.08, -0.08, 0.12),
    new THREE.Vector3(0.45, -0.07, 0.09),
  ]);
  const nerve = new THREE.Mesh(new THREE.TubeGeometry(nerveCurve, 40, 0.015, 12, false), new THREE.MeshBasicMaterial({ color: '#5AE8FF' }));
  stage.add(nerve);
  const sigBeads = Array.from({ length: 4 }, (_, i) => {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.024, 16, 12), new THREE.MeshBasicMaterial({ color: '#9AF6FF' }));
    stage.add(b);
    return { b, off: i * 0.25 };
  });

  // Streaming RBC cells along main trunk inside cutaway
  const rbcGeo = new THREE.SphereGeometry(0.016, 12, 10);
  rbcGeo.scale(1.0, 0.45, 1.0);
  const rbcInst = new THREE.InstancedMesh(rbcGeo, std('#FF3648', 0.3, { emissive: '#AA1220', emissiveIntensity: 0.4 }), 28);
  stage.add(rbcInst);
  const m4 = new THREE.Matrix4(), v3 = new THREE.Vector3(), q = new THREE.Quaternion(), sv = new THREE.Vector3();

  let lastW = -1;
  const setState = ({ constrict = 0, wrinkle = 0, signalOn = 1, skinXray = 0, t = 0 } = {}) => {
    const rw = Math.round(wrinkle * 40) / 40;
    if (rw !== lastW) {
      lastW = rw;
      const baseY = epGeo.userData.baseY;
      for (let i = 0; i < epPos.count; i++) {
        const x = epPos.getX(i), z = epPos.getZ(i);
        // Smooth inward drop + sinusoidal longitudinal skin folds matching finger wrinkling!
        const centerFade = Math.exp(-Math.pow(z / 0.24, 2)) * Math.exp(-Math.pow(x / 0.52, 2));
        const fold = Math.sin(x * 26 + 0.5 * Math.sin(z * 14));
        const dy = (-0.068 * rw + 0.042 * fold * rw) * centerFade;
        epPos.setY(i, baseY[i] + dy);
      }
      epPos.needsUpdate = true;
      epGeo.computeVertexNormals();
    }
    epMesh.material = skinXray > 0.5 ? epXrayMat : epMat;

    // Subcutaneous pulp loses volume cleanly as constrict rises 0 -> 1
    pulp.scale.set(1, 1, 1 - 0.34 * constrict);
    pulp.position.y = 0.03 - 0.045 * constrict;

    // Vessels visibly narrow down (radial constrict 1.0 -> 0.38)
    const rScale = 1 - 0.62 * constrict;
    vessels.forEach((v) => {
      if (v.isLoop) v.mesh.scale.set(rScale, 1 - 0.28 * constrict, rScale);
      else v.mesh.scale.set(1, rScale, rScale);
    });

    // Nerve pulses streak along nerve filament
    sigBeads.forEach(({ b, off }) => {
      b.visible = signalOn > 0.1;
      if (!b.visible) return;
      const u = (t * 0.85 + off) % 1;
      b.position.copy(nerveCurve.getPointAt(u));
    });

    // Blood cells flow slower & pack tighter as vessel narrows
    for (let i = 0; i < 28; i++) {
      const u = (t * (0.38 - constrict * 0.18) + i / 28) % 1;
      v3.copy(trunkCurve.getPointAt(u));
      v3.y += Math.sin(i * 4.1) * 0.014 * rScale;
      v3.z += Math.cos(i * 2.7) * 0.014 * rScale;
      sv.setScalar(0.9 - constrict * 0.25);
      m4.compose(v3, q, sv);
      rbcInst.setMatrixAt(i, m4);
    }
    rbcInst.instanceMatrix.needsUpdate = true;
  };

  return { scene, stage, setState };
}

// ═════════════════════════ 4. WET-GRIP COMPARISON STAGE ═════════════════════════
export function gripCompare(E) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#091E30');
  scene.fog = new THREE.FogExp2('#091E30', 0.14);
  scene.add(new THREE.HemisphereLight('#9CE4FF', '#081826', 0.95));
  const key = new THREE.DirectionalLight('#FFF0DE', 2.4); key.position.set(1.2, 2.0, 1.8); scene.add(key);
  const sideKey = new THREE.DirectionalLight('#FFE4CC', 1.2); sideKey.position.set(-1.4, 0.8, 1.0); scene.add(sideKey);

  const padMat = phys('#FFFFFF', 0.45, { vertexColors: true, clearcoat: 0.48, sheen: 0.35, sheenColor: new THREE.Color('#ffd6c2') });
  const glassMat = phys('#88D4F5', 0.08, { clearcoat: 1, transparent: true, opacity: 0.62 });
  const waterMat = phys('#4FD1E8', 0.1, { transparent: true, opacity: 0.78, emissive: '#2299BA', emissiveIntensity: 0.35 });

  // Wet curved glass domes on left (-0.145) and right (+0.145) — fits 100% inside 9:16 center!
  [-0.145, 0.145].forEach((x) => {
    const glass = new THREE.Mesh(new THREE.SphereGeometry(0.115, 32, 24), glassMat);
    glass.scale.set(1.15, 0.6, 1.15);
    glass.position.set(x, -0.055, 0);
    scene.add(glass);
  });

  // Left: Smooth fingertip hovering with trapped liquid slip film cushion
  const padLGeo = buildMorphPadGeo(0.056, 0.19, 600);
  applyPadWrinkle(padLGeo, 0.0, 3.2);
  const padL = new THREE.Mesh(padLGeo, padMat);
  padL.rotation.set(0.68, 0, -0.1);
  padL.position.set(-0.145, 0.095, 0.015);
  scene.add(padL);

  const trappedFilm = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.085, 0.016, 28), waterMat);
  trappedFilm.position.set(-0.145, 0.022, 0.015);
  scene.add(trappedFilm);

  // Right: Wrinkled fingertip making direct ridge contact while cyan drainage beads channel outward
  const padRGeo = buildMorphPadGeo(0.056, 0.19, 640);
  applyPadWrinkle(padRGeo, 1.0, 3.2);
  const padR = new THREE.Mesh(padRGeo, padMat);
  padR.rotation.set(0.68, 0, 0.1);
  padR.position.set(0.145, 0.085, 0.015);
  scene.add(padR);

  // Animated water beads channeling outward along the wrinkled grooves on the right pad
  const drops = Array.from({ length: 14 }, (_, i) => {
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.0085, 12, 10), new THREE.MeshBasicMaterial({ color: '#78EEFF' }));
    scene.add(d);
    return { d, side: i % 2 === 0 ? 1 : -1, off: (i / 14), laneZ: ((i % 4) - 1.5) * 0.022 };
  });

  const update = (t) => {
    padL.position.x = -0.145 + Math.sin(t * 2.8) * 0.014;
    trappedFilm.scale.setScalar(1 + Math.sin(t * 3.2) * 0.05);
    drops.forEach(({ d, side, off, laneZ }) => {
      const p = (t * 0.85 + off) % 1;
      d.position.set(0.145 + side * (0.02 + p * 0.095), 0.024 - p * 0.032, 0.01 + laneZ);
      d.scale.setScalar(Math.sin(p * Math.PI) * 1.15);
    });
  };

  return { scene, update };
}
