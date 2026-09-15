import * as THREE from 'three';
import { mesh } from './materials.js';

function addWindow(parent, materials, x, y, z, w, h, lit = true, rotY = 0) {
  const frame = mesh(
    new THREE.BoxGeometry(w + 0.12, h + 0.12, 0.1),
    materials.stuccoDeep,
    x,
    y,
    z,
    parent
  );
  frame.rotation.y = rotY;
  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, 0.06),
    lit ? materials.glassWarm : materials.glassCool
  );
  glass.position.set(0, 0, 0.04);
  frame.add(glass);
  return frame;
}

function addRoundBalcony(parent, materials, x, y, z, radius) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  parent.add(group);

  const deck = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, 0.28, 28, 1, false, Math.PI * 0.12, Math.PI * 0.76),
    materials.stucco
  );
  deck.castShadow = true;
  deck.receiveShadow = true;
  group.add(deck);

  const wall = new THREE.Mesh(
    new THREE.CylinderGeometry(radius + 0.06, radius + 0.06, 0.72, 28, 1, true, Math.PI * 0.12, Math.PI * 0.76),
    materials.stucco
  );
  wall.position.y = 0.42;
  wall.castShadow = true;
  group.add(wall);

  const cap = new THREE.Mesh(
    new THREE.TorusGeometry(radius + 0.05, 0.045, 8, 28, Math.PI * 0.76),
    materials.stuccoDeep
  );
  cap.rotation.set(Math.PI / 2, 0, Math.PI * 0.12);
  cap.position.y = 0.78;
  group.add(cap);

  return group;
}

function tuft(parent, materials, x, y, z, scale = 1) {
  const cluster = new THREE.Group();
  cluster.position.set(x, y, z);
  parent.add(cluster);
  for (let i = 0; i < 7; i += 1) {
    const blossom = Math.random() > 0.35;
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry((0.12 + Math.random() * 0.1) * scale, 8, 8),
      blossom ? (Math.random() > 0.5 ? materials.bloom : materials.bloomHot) : materials.foliage
    );
    ball.position.set(
      (Math.random() - 0.5) * 0.55 * scale,
      Math.random() * 0.4 * scale,
      (Math.random() - 0.5) * 0.35 * scale
    );
    ball.castShadow = true;
    cluster.add(ball);
  }
  return cluster;
}

export function createBuilding(materials, textures) {
  const root = new THREE.Group();
  root.name = 'building';

  mesh(new THREE.BoxGeometry(9.4, 6.6, 7.2), materials.stucco, 0.15, 4.05, -1.1, root);
  const roundBody = new THREE.Mesh(
    new THREE.CylinderGeometry(2.35, 2.35, 6.6, 28, 1, false, Math.PI * 0.08, Math.PI * 0.84),
    materials.stucco
  );
  roundBody.position.set(-2.55, 4.05, 0.85);
  roundBody.castShadow = true;
  roundBody.receiveShadow = true;
  root.add(roundBody);

  const upper = mesh(new THREE.BoxGeometry(6.2, 3.1, 5.6), materials.stucco, -0.35, 8.55, -1.35, root);
  const roundCorner = new THREE.Mesh(
    new THREE.CylinderGeometry(1.7, 1.7, 3.1, 24, 1, false, Math.PI * 0.15, Math.PI * 0.7),
    materials.stucco
  );
  roundCorner.position.set(-2.9, 8.55, 1.15);
  roundCorner.castShadow = true;
  roundCorner.receiveShadow = true;
  root.add(roundCorner);

  const roof = mesh(new THREE.CylinderGeometry(3.4, 3.6, 0.35, 24, 1, false, 0, Math.PI), materials.stuccoDeep, -0.6, 10.2, -1.1, root);
  roof.rotation.y = Math.PI / 2;

  mesh(new THREE.BoxGeometry(1.6, 0.08, 1.1), materials.metal, 1.4, 10.28, -1.8, root);

  addRoundBalcony(root, materials, -2.55, 2.35, 2.35, 1.55);
  addRoundBalcony(root, materials, -2.45, 4.55, 2.25, 1.45);
  addRoundBalcony(root, materials, -2.2, 6.7, 1.85, 1.25);

  addWindow(root, materials, -2.5, 2.7, 2.15, 1.15, 1.15, true);
  addWindow(root, materials, -2.4, 4.9, 2.05, 1.05, 1.05, true);
  addWindow(root, materials, -2.15, 7.05, 1.7, 0.95, 0.95, true);

  addWindow(root, materials, 1.55, 3.15, 2.45, 1.7, 1.35, true);
  addWindow(root, materials, 3.35, 3.15, 2.45, 1.15, 1.35, false);
  addWindow(root, materials, 1.55, 5.35, 2.45, 1.7, 1.25, true);
  addWindow(root, materials, 3.35, 5.35, 2.45, 1.15, 1.25, false);
  addWindow(root, materials, -0.9, 8.55, 1.4, 0.7, 0.85, false);
  addWindow(root, materials, 0.15, 8.55, 1.4, 0.7, 0.85, true);
  addWindow(root, materials, 1.2, 8.55, 1.4, 0.7, 0.85, false);

  addWindow(root, materials, 4.85, 3.3, 0.4, 1.1, 1.4, true, Math.PI / 2);
  addWindow(root, materials, 4.85, 5.5, 0.4, 1.1, 1.2, false, Math.PI / 2);

  const shutterMat = materials.stuccoDeep;
  [-0.95, 0.95].forEach((offset) => {
    mesh(new THREE.BoxGeometry(0.12, 1.35, 0.42), shutterMat, 1.55 + offset, 3.15, 2.62, root);
    mesh(new THREE.BoxGeometry(0.12, 1.25, 0.42), shutterMat, 1.55 + offset, 5.35, 2.62, root);
  });

  const stoop = mesh(new THREE.BoxGeometry(2.3, 0.55, 1.6), materials.stucco, 0.35, 0.9, 2.55, root);
  mesh(new THREE.BoxGeometry(2.0, 0.28, 0.55), materials.stucco, 0.35, 0.52, 3.15, root);
  mesh(new THREE.BoxGeometry(1.7, 0.22, 0.45), materials.stucco, 0.35, 0.28, 3.5, root);

  const door = mesh(new THREE.BoxGeometry(1.15, 2.15, 0.12), materials.wood, 0.35, 2.05, 2.55, root);
  mesh(new THREE.BoxGeometry(1.35, 2.35, 0.08), materials.stuccoDeep, 0.35, 2.08, 2.48, root);
  mesh(new THREE.SphereGeometry(0.05, 8, 8), materials.white, 0.78, 2.0, 2.64, root);

  mesh(new THREE.BoxGeometry(10.4, 1.35, 0.55), materials.stucco, 0.1, 0.68, 3.55, root);
  mesh(new THREE.BoxGeometry(0.55, 1.35, 2.4), materials.stucco, -5.05, 0.68, 2.5, root);
  mesh(new THREE.BoxGeometry(0.55, 1.35, 2.4), materials.stucco, 5.2, 0.68, 2.5, root);

  const plaque = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 1.3),
    new THREE.MeshStandardMaterial({
      map: textures.plaque,
      transparent: true,
      roughness: 0.6,
    })
  );
  plaque.position.set(-2.35, 0.85, 3.84);
  root.add(plaque);

  const number = new THREE.Mesh(
    new THREE.PlaneGeometry(0.7, 0.7),
    new THREE.MeshStandardMaterial({
      map: textures.number,
      transparent: true,
      roughness: 0.5,
    })
  );
  number.position.set(4.55, 1.05, 3.84);
  root.add(number);

  tuft(root, materials, -3.6, 1.25, 3.6, 1.3);
  tuft(root, materials, -2.6, 1.35, 3.7, 1.1);
  tuft(root, materials, -1.6, 1.2, 3.65, 0.9);
  tuft(root, materials, 2.3, 1.2, 3.6, 0.8);
  tuft(root, materials, -3.1, 2.7, 2.6, 0.7);
  tuft(root, materials, -2.2, 4.9, 2.5, 0.65);
  tuft(root, materials, -1.9, 7.05, 2.1, 0.55);
  tuft(root, materials, 3.7, 3.7, 2.55, 0.5);
  tuft(root, materials, 3.6, 5.9, 2.5, 0.45);
  tuft(root, materials, -0.8, 10.2, -0.4, 0.7);
  tuft(root, materials, 1.6, 10.25, -0.2, 0.5);

  const pot = mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.4, 10), materials.stuccoDeep, 3.15, 1.55, 3.35, root);
  tuft(pot, materials, 0, 0.2, 0, 0.55);

  const doorHit = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 2.4, 0.8),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  doorHit.position.set(0.35, 2.1, 2.6);
  doorHit.userData.hotspot = 'about';
  root.add(doorHit);

  return { root, hotspots: [doorHit], update() {} };
}
