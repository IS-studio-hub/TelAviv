import * as THREE from 'three';

export function createMaterials(textures) {
  const stucco = new THREE.MeshStandardMaterial({
    map: textures.stucco,
    color: 0xf3d7a8,
    roughness: 0.9,
    metalness: 0.02,
  });

  const stuccoDeep = new THREE.MeshStandardMaterial({
    color: 0xe2c08a,
    roughness: 0.92,
    metalness: 0.02,
  });

  const wood = new THREE.MeshStandardMaterial({
    color: 0x8d5a32,
    roughness: 0.72,
    metalness: 0.04,
  });

  const metal = new THREE.MeshStandardMaterial({
    color: 0x2f463c,
    roughness: 0.45,
    metalness: 0.35,
  });

  const glassWarm = new THREE.MeshStandardMaterial({
    map: textures.windowWarm,
    color: 0xffffff,
    emissive: 0xf0b35a,
    emissiveIntensity: 0.85,
    roughness: 0.25,
    metalness: 0.1,
  });

  const glassCool = new THREE.MeshStandardMaterial({
    map: textures.windowCool,
    color: 0x8aa0b0,
    roughness: 0.2,
    metalness: 0.15,
    emissive: 0x243040,
    emissiveIntensity: 0.15,
  });

  const foliage = new THREE.MeshStandardMaterial({
    color: 0x2f6b3f,
    roughness: 0.8,
  });

  const bloom = new THREE.MeshStandardMaterial({
    color: 0xc4476a,
    roughness: 0.7,
  });

  const bloomHot = new THREE.MeshStandardMaterial({
    color: 0xe56b3c,
    roughness: 0.7,
  });

  return {
    stucco,
    stuccoDeep,
    wood,
    metal,
    glassWarm,
    glassCool,
    foliage,
    bloom,
    bloomHot,
    white: new THREE.MeshStandardMaterial({ color: 0xf4efe6, roughness: 0.55 }),
    asphalt: new THREE.MeshStandardMaterial({
      color: 0x6b5344,
      roughness: 0.35,
      metalness: 0.15,
      map: textures.cobble,
    }),
  };
}

export function mesh(geometry, material, x, y, z, parent, shadows = true) {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(x, y, z);
  if (shadows) {
    object.castShadow = true;
    object.receiveShadow = true;
  }
  parent.add(object);
  return object;
}
