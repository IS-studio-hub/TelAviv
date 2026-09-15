import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { mesh } from './materials.js';

function texturedPlane(map, w, h, x, y, z, parent, extra = {}) {
  const mat = new THREE.MeshStandardMaterial({
    map,
    transparent: true,
    roughness: 0.55,
    metalness: 0.05,
    ...extra,
  });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  plane.position.set(x, y, z);
  plane.castShadow = true;
  parent.add(plane);
  return plane;
}

function makeHit(w, h, d, x, y, z, id, parent) {
  const hit = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hit.position.set(x, y, z);
  hit.userData.hotspot = id;
  parent.add(hit);
  return hit;
}

export function createSignpost(materials, textures) {
  const root = new THREE.Group();
  root.position.set(-6.4, 0, 4.6);
  const hotspots = [];

  const pole = mesh(new THREE.CylinderGeometry(0.07, 0.09, 7.4, 10), materials.metal, 0, 3.7, 0, root);
  pole.material = new THREE.MeshStandardMaterial({ color: 0x3d5c52, roughness: 0.5, metalness: 0.25 });

  texturedPlane(textures.palmLogo, 1.55, 1.9, 0.05, 6.55, 0.12, root);
  const projects = texturedPlane(textures.arrows.projects, 2.15, 0.72, 0.85, 5.35, 0.14, root);
  const about = texturedPlane(textures.arrows.about, 2.05, 0.68, 0.75, 4.52, 0.16, root);
  const articles = texturedPlane(textures.arrows.articles, 1.95, 0.64, -0.7, 3.72, 0.18, root);
  const contact = texturedPlane(textures.arrows.contact, 1.85, 0.6, 0.65, 2.95, 0.2, root);
  texturedPlane(textures.brighter, 1.15, 1.7, -0.95, 4.55, 0.05, root);
  texturedPlane(textures.goodIdeas, 1.2, 1.55, 0.1, 1.55, 0.22, root);

  hotspots.push(
    makeHit(2.3, 0.8, 0.5, 0.85, 5.35, 0.2, 'projects', root),
    makeHit(2.2, 0.76, 0.5, 0.75, 4.52, 0.2, 'about', root),
    makeHit(2.1, 0.72, 0.5, -0.7, 3.72, 0.2, 'articles', root),
    makeHit(2.0, 0.68, 0.5, 0.65, 2.95, 0.2, 'contact', root)
  );

  [projects, about, articles, contact].forEach((sign, i) => {
    sign.userData.hotspot = ['projects', 'about', 'articles', 'contact'][i];
  });

  return { root, hotspots };
}

export function createPalm(materials, textures, height = 9) {
  const root = new THREE.Group();
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0xc4a06a, roughness: 0.88 });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.3, height, 8), trunkMat);
  trunk.position.y = height / 2;
  trunk.castShadow = true;
  root.add(trunk);

  const crown = new THREE.Group();
  crown.position.y = height - 0.15;
  root.add(crown);

  const heart = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 10, 10),
    new THREE.MeshStandardMaterial({ color: 0x1f5a32, roughness: 0.8 })
  );
  crown.add(heart);

  const dark = new THREE.MeshStandardMaterial({ color: 0x2a6b3c, roughness: 0.72, side: THREE.DoubleSide });
  const light = new THREE.MeshStandardMaterial({ color: 0x3f8a4c, roughness: 0.68, side: THREE.DoubleSide });

  for (let i = 0; i < 12; i += 1) {
    const pivot = new THREE.Group();
    pivot.rotation.y = (i / 12) * Math.PI * 2 + 0.2;
    pivot.rotation.z = 0.85 + (i % 4) * 0.08;
    crown.add(pivot);
    const frond = new THREE.Mesh(new THREE.ConeGeometry(0.55, 3.8, 5), i % 2 ? dark : light);
    frond.position.y = -1.55;
    frond.castShadow = true;
    pivot.add(frond);
  }
  for (let i = 0; i < 7; i += 1) {
    const pivot = new THREE.Group();
    pivot.rotation.y = (i / 7) * Math.PI * 2;
    pivot.rotation.z = 0.35;
    crown.add(pivot);
    const frond = new THREE.Mesh(new THREE.ConeGeometry(0.35, 2.4, 5), light);
    frond.position.y = -0.9;
    pivot.add(frond);
  }

  root.userData.sway = Math.random() * Math.PI * 2;
  return root;
}

export function createBike(materials) {
  const root = new THREE.Group();
  const paint = new THREE.MeshStandardMaterial({ color: 0x6aa0b5, roughness: 0.4, metalness: 0.3 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x1e1e1e, roughness: 0.9 });

  const wheelGeo = new THREE.TorusGeometry(0.38, 0.04, 8, 18);
  const w1 = new THREE.Mesh(wheelGeo, rubber);
  const w2 = w1.clone();
  w1.position.set(-0.55, 0.38, 0);
  w2.position.set(0.55, 0.38, 0);
  w1.castShadow = w2.castShadow = true;
  root.add(w1, w2);

  const bar = (len, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, len, 6), paint);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    m.castShadow = true;
    root.add(m);
  };
  bar(1.05, 0, 0.55, 0, 0, 0, Math.PI / 2);
  bar(0.7, -0.28, 0.72, 0, 0, 0, 0.7);
  bar(0.62, 0.22, 0.78, 0, 0, 0, -0.55);
  bar(0.35, 0.48, 1.05, 0, 0, 0, Math.PI / 2);
  return root;
}

function prepareGltf(model) {
  model.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = true;
    child.receiveShadow = true;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      if (!material) return;
      material.envMapIntensity = 1.1;
      if (material.map) material.map.colorSpace = THREE.SRGBColorSpace;
    });
  });
}

function collectPoints(root, maxSamples = 80000) {
  const v = new THREE.Vector3();
  const pts = [];
  root.updateMatrixWorld(true);
  root.traverse((child) => {
    if (!child.isMesh) return;
    const attr = child.geometry?.attributes?.position;
    if (!attr) return;
    child.updateWorldMatrix(true, false);
    const step = Math.max(1, Math.floor(attr.count / maxSamples));
    for (let i = 0; i < attr.count; i += step) {
      v.fromBufferAttribute(attr, i).applyMatrix4(child.matrixWorld);
      pts.push(v.x, v.y, v.z);
    }
  });
  return pts;
}

function pinBase(model) {
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const cut = box.min.y + size.y * 0.07;
  const pts = collectPoints(model, 40000);
  let sx = 0;
  let sz = 0;
  let n = 0;
  for (let i = 0; i < pts.length; i += 3) {
    if (pts[i + 1] > cut) continue;
    sx += pts[i];
    sz += pts[i + 2];
    n += 1;
  }
  if (!n) return;
  model.position.x -= sx / n;
  model.position.z -= sz / n;
}

function findLampBowl(root) {
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const pts = collectPoints(root, 60000);
  const yBase = box.min.y + size.y * 0.08;
  let px = 0;
  let pz = 0;
  let pn = 0;
  for (let i = 0; i < pts.length; i += 3) {
    if (pts[i + 1] > yBase) continue;
    px += pts[i];
    pz += pts[i + 2];
    pn += 1;
  }
  if (!pn) {
    return new THREE.Vector3(box.max.x - 0.45, box.min.y + size.y * 0.78, box.getCenter(new THREE.Vector3()).z);
  }
  px /= pn;
  pz /= pn;

  const yArm = box.min.y + size.y * 0.72;
  const sides = {
    xPos: { minY: Infinity, maxY: -Infinity, maxD: 0, xs: 0, ys: 0, zs: 0, n: 0 },
    xNeg: { minY: Infinity, maxY: -Infinity, maxD: 0, xs: 0, ys: 0, zs: 0, n: 0 },
  };

  for (let i = 0; i < pts.length; i += 3) {
    if (pts[i + 1] < yArm) continue;
    const dx = pts[i] - px;
    const side = dx >= 0 ? sides.xPos : sides.xNeg;
    const d = Math.hypot(dx, pts[i + 2] - pz);
    side.maxD = Math.max(side.maxD, d);
    side.minY = Math.min(side.minY, pts[i + 1]);
    side.maxY = Math.max(side.maxY, pts[i + 1]);
  }

  const bowlSide =
    (sides.xNeg.maxD > 0.15 ? sides.xNeg.minY : Infinity) <=
    (sides.xPos.maxD > 0.15 ? sides.xPos.minY : Infinity)
      ? sides.xNeg
      : sides.xPos;
  const sign = bowlSide === sides.xPos ? 1 : -1;
  const farCut = bowlSide.maxD * 0.82;
  let xs = 0;
  let ys = 0;
  let zs = 0;
  let n = 0;
  let minTipY = Infinity;
  for (let i = 0; i < pts.length; i += 3) {
    if (pts[i + 1] < yArm) continue;
    if (Math.sign(pts[i] - px) !== sign && Math.abs(pts[i] - px) > 0.05) continue;
    const d = Math.hypot(pts[i] - px, pts[i + 2] - pz);
    if (d < farCut) continue;
    minTipY = Math.min(minTipY, pts[i + 1]);
    xs += pts[i];
    ys += pts[i + 1];
    zs += pts[i + 2];
    n += 1;
  }

  if (!n) {
    return new THREE.Vector3(px + sign * bowlSide.maxD * 0.82, box.min.y + size.y * 0.8, pz);
  }
  return new THREE.Vector3(xs / n, minTipY + 0.08, zs / n);
}

function addLampLight(root, worldPosition, aimWorld) {
  root.updateMatrixWorld(true);
  const lamp = new THREE.Group();
  lamp.position.copy(root.worldToLocal(worldPosition.clone()));

  const fill = new THREE.PointLight(0xffc57a, 28, 16, 1.45);
  fill.userData.kind = 'streetlamp';
  fill.userData.nightIntensity = 28;
  lamp.add(fill);

  const beam = new THREE.SpotLight(0xffe0a8, 52, 18, Math.PI / 3.3, 0.7, 1.2);
  beam.userData.kind = 'streetlamp';
  beam.userData.nightIntensity = 52;
  beam.position.set(0, -0.05, 0);
  lamp.add(beam);
  lamp.add(beam.target);
  root.add(lamp);

  root.updateMatrixWorld(true);
  const aim = aimWorld ?? new THREE.Vector3(0.2, 0.25, 3.1);
  beam.target.position.copy(lamp.worldToLocal(aim.clone()));
  return lamp;
}

function sitOnGround(model) {
  model.updateMatrixWorld(true);
  const fitted = new THREE.Box3().setFromObject(model);
  const center = fitted.getCenter(new THREE.Vector3());
  model.position.x -= center.x;
  model.position.z -= center.z;
  model.position.y -= fitted.min.y;
}

function modelUrl(file) {
  return `${import.meta.env.BASE_URL}models/${file}`;
}

function loadGltf(url, onProgress) {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => resolve(gltf.scene),
      (event) => {
        if (event.total) onProgress?.(event.loaded / event.total);
      },
      reject
    );
  });
}

function sidewalkHeight(surface, x, z) {
  const raycaster = new THREE.Raycaster();
  const down = new THREE.Vector3(0, -1, 0);
  const probes = [z + 0.35, z + 0.15, z, z - 0.1];
  for (const zz of probes) {
    raycaster.set(new THREE.Vector3(x, 10, zz), down);
    const hits = raycaster.intersectObject(surface, true);
    for (const hit of hits) {
      if (hit.point.y < 0.85) return hit.point.y;
    }
  }
  return 0.12;
}

function wrap(model) {
  const root = new THREE.Group();
  root.add(model);
  return root;
}

async function loadFitted(url, { height, longest } = {}, onProgress) {
  const model = await loadGltf(url, onProgress);
  model.updateMatrixWorld(true);
  const size = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
  if (height) model.scale.setScalar(height / Math.max(size.y, 0.001));
  else if (longest) {
    model.scale.setScalar(longest / Math.max(size.x, size.z, 0.001));
  }
  sitOnGround(model);
  prepareGltf(model);
  return model;
}

export async function loadCar(onProgress) {
  const model = await loadFitted(modelUrl('car.glb'), { longest: 4.6 }, onProgress);
  return wrap(model);
}

function addHit(parent, size, worldPos, id) {
  const hit = new THREE.Mesh(
    new THREE.BoxGeometry(size.x, size.y, size.z),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  parent.updateMatrixWorld(true);
  hit.position.copy(parent.worldToLocal(worldPos.clone()));
  hit.userData.hotspot = id;
  parent.add(hit);
  return hit;
}

function cameraFor(target, { back = 6, height = 2.4, side = 0.6 } = {}) {
  return {
    position: {
      x: target.x + side,
      y: target.y + height,
      z: target.z + back,
    },
    target: {
      x: target.x,
      y: target.y,
      z: target.z,
    },
  };
}

export async function loadStreet(onProgress) {
  const loaded = { apartment: 0, palm: 0, bike: 0, wayfinder: 0, lamp: 0, car: 0, dumpster: 0 };
  const weights = { apartment: 0.32, palm: 0.26, bike: 0.11, wayfinder: 0.07, lamp: 0.06, car: 0.11, dumpster: 0.07 };
  const report = () => {
    const total = Object.entries(weights).reduce((sum, [key, weight]) => sum + loaded[key] * weight, 0);
    onProgress?.(total);
  };

  const [apartmentMesh, palmMesh, bikeMesh, wayfinderMesh, lampMesh, car, dumpsterMesh] = await Promise.all([
    loadFitted(modelUrl('apartment.glb'), { height: 12.4 }, (ratio) => {
      loaded.apartment = ratio;
      report();
    }),
    loadFitted(modelUrl('palm.glb'), { height: 15.4 }, (ratio) => {
      loaded.palm = ratio;
      report();
    }),
    loadFitted(modelUrl('bike.glb'), { longest: 2.15 }, (ratio) => {
      loaded.bike = ratio;
      report();
    }),
    loadFitted(modelUrl('wayfinder.glb'), { height: 8.6 }, (ratio) => {
      loaded.wayfinder = ratio;
      report();
    }),
    loadFitted(modelUrl('lamp.glb'), { height: 11.3 }, (ratio) => {
      loaded.lamp = ratio;
      report();
    }),
    loadCar((ratio) => {
      loaded.car = ratio;
      report();
    }),
    loadFitted(modelUrl('dumpster.glb'), { height: 2.35 }, (ratio) => {
      loaded.dumpster = ratio;
      report();
    }),
  ]);

  pinBase(palmMesh);
  pinBase(wayfinderMesh);
  pinBase(lampMesh);
  pinBase(dumpsterMesh);

  const apartment = wrap(apartmentMesh);
  const palm = wrap(palmMesh);
  const bike = wrap(bikeMesh);
  const wayfinder = wrap(wayfinderMesh);
  const lamp = wrap(lampMesh);
  const dumpster = wrap(dumpsterMesh);
  palm.userData.sway = Math.random() * Math.PI * 2;

  apartment.updateMatrixWorld(true);
  const raw = new THREE.Box3().setFromObject(apartment);
  apartment.position.z += 4.4 - raw.max.z;
  apartment.updateMatrixWorld(true);
  const apt = new THREE.Box3().setFromObject(apartment);
  const dim = apt.getSize(new THREE.Vector3());

  palm.position.set(apt.min.x - 1.55, 0, -0.2);
  wayfinder.position.set(apt.min.x + 0.15, 0, apt.max.z + 0.35);
  lamp.rotation.y = -Math.PI / 2 + THREE.MathUtils.degToRad(25);
  lamp.position.set(apt.max.x - 0.38, 0, apt.max.z - 0.4);
  bike.rotation.set(0, 0.08, 0);
  bike.position.set(apt.min.x + dim.x * 0.7, 0, apt.max.z - 3.22);
  bike.updateMatrixWorld(true);
  const bikeBox = new THREE.Box3().setFromObject(bike);
  const walkY = sidewalkHeight(apartment, bike.position.x, bike.position.z);
  bike.position.y += walkY - bikeBox.min.y + 0.02;
  car.rotation.y = -0.12;
  car.position.set(apt.max.x + 3.6, 0.02, apt.max.z + 1.6);
  dumpster.rotation.y = Math.PI / 2;
  dumpster.position.set(apt.max.x + 1.05, 0, apt.max.z - 2.7);

  const root = new THREE.Group();
  root.name = 'street';
  root.add(apartment, palm, wayfinder, lamp, bike, dumpster, car);

  lamp.updateMatrixWorld(true);
  addLampLight(
    lamp,
    findLampBowl(lamp),
    new THREE.Vector3(apt.min.x + dim.x * 0.45, 0.35, apt.max.z - 0.4)
  );

  const doorWorld = new THREE.Vector3(apt.min.x + dim.x * 0.48, 1.55, apt.max.z - dim.z * 0.18);
  const doorHit = addHit(apartment, { x: 1.8, y: 2.6, z: 1.2 }, doorWorld, 'door');

  const roofWorld = new THREE.Vector3(
    apt.min.x + dim.x * 0.5,
    apt.max.y - 0.12,
    apt.min.z + dim.z * 0.4
  );
  const roofHit = addHit(apartment, { x: 5.4, y: 0.9, z: 4.8 }, roofWorld, 'roof');

  bike.updateMatrixWorld(true);
  const bikeBounds = new THREE.Box3().setFromObject(bike);
  const bikeCenter = bikeBounds.getCenter(new THREE.Vector3());
  const bikeSize = bikeBounds.getSize(new THREE.Vector3());
  const bikeHit = addHit(
    bike,
    { x: bikeSize.x + 0.5, y: bikeSize.y + 0.5, z: bikeSize.z + 0.5 },
    bikeCenter,
    'bike'
  );

  car.updateMatrixWorld(true);
  const carBounds = new THREE.Box3().setFromObject(car);
  const carCenter = carBounds.getCenter(new THREE.Vector3());
  const carSize = carBounds.getSize(new THREE.Vector3());
  const carHit = addHit(
    car,
    { x: carSize.x + 0.6, y: carSize.y + 0.5, z: carSize.z + 0.6 },
    carCenter,
    'car'
  );

  return {
    root,
    palm,
    size: dim,
    hotspots: [roofHit, doorHit, bikeHit, carHit],
    cameras: {
      street: {
        position: { x: -1.8, y: 7.3, z: 26.2 },
        target: { x: -0.35, y: 5.35, z: 1.6 },
      },
      roof: cameraFor(roofWorld, { back: 7.4, height: 4.4, side: 1.8 }),
      door: cameraFor(doorWorld, { back: 5.6, height: 0.7, side: 0.25 }),
      bike: cameraFor(bikeCenter, { back: 4.2, height: 1.55, side: 1.5 }),
      car: cameraFor(carCenter, { back: 5.4, height: 1.9, side: 2.4 }),
    },
  };
}

export function createLamp(materials, textures) {
  const root = new THREE.Group();
  const green = new THREE.MeshStandardMaterial({ color: 0x35584c, roughness: 0.48, metalness: 0.25 });
  mesh(new THREE.CylinderGeometry(0.08, 0.12, 4.6, 10), green, 0, 2.3, 0, root);
  const arm = mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.4, 8), green, 0.55, 4.55, 0, root);
  arm.rotation.z = Math.PI / 2.4;
  const shade = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 12, 8, 0, Math.PI * 2, 0, Math.PI / 1.6),
    new THREE.MeshStandardMaterial({ color: 0xf0e6c8, emissive: 0xffd89a, emissiveIntensity: 0.8 })
  );
  shade.position.set(1.05, 4.35, 0);
  shade.rotation.z = 0.35;
  root.add(shade);

  const bulb = new THREE.PointLight(0xffd9a0, 6, 8, 2);
  bulb.position.copy(shade.position);
  root.add(bulb);

  const sign = texturedPlane(textures.dizengoff, 1.35, 0.7, 0.15, 3.55, 0.12, root);
  sign.material.side = THREE.DoubleSide;
  return root;
}

export function createCurb(textures) {
  const mat = new THREE.MeshStandardMaterial({
    map: textures.curb,
    roughness: 0.7,
    metalness: 0.05,
  });
  const strip = new THREE.Mesh(new THREE.BoxGeometry(22, 0.08, 0.22), mat);
  strip.position.set(0.2, 0.05, 4.38);
  strip.receiveShadow = true;
  return strip;
}

function texturedPlaneLocal(map, w, h, x, y, z, parent) {
  return texturedPlane(map, w, h, x, y, z, parent);
}

export { texturedPlaneLocal as texturedPlane };
