import * as THREE from 'three';

export function createSky(textures) {
  const root = new THREE.Group();
  const uniforms = {
    topColor: { value: new THREE.Color('#102448') },
    horizonColor: { value: new THREE.Color('#3a5a88') },
    bottomColor: { value: new THREE.Color('#1a2438') },
  };
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(80, 32, 16),
    new THREE.ShaderMaterial({
      uniforms,
      side: THREE.BackSide,
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 horizonColor;
        uniform vec3 bottomColor;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition).y;
          vec3 col = mix(horizonColor, topColor, smoothstep(0.02, 0.7, h));
          col = mix(bottomColor, col, smoothstep(-0.2, 0.1, h));
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    })
  );
  root.add(sky);

  const stars = [];
  const scatterStars = (count, radius, size, opacity) => {
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(0.08 + Math.random() * 0.9);
      starPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = radius * Math.abs(Math.cos(phi));
      starPos[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const points = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({
        color: 0xf4f7ff,
        size,
        sizeAttenuation: true,
        transparent: true,
        opacity,
        depthWrite: false,
      })
    );
    points.userData.nightOpacity = opacity;
    stars.push(points);
    root.add(points);
  };
  scatterStars(900, 62, 0.22, 0.95);
  scatterStars(160, 60, 0.48, 1);

  const cloudMat = new THREE.MeshBasicMaterial({
    map: textures.cloud,
    transparent: true,
    depthWrite: false,
    opacity: 0.12,
    color: 0x8aa0c0,
  });
  const clouds = [];
  for (let i = 0; i < 5; i += 1) {
    const cloud = new THREE.Mesh(new THREE.PlaneGeometry(12 + Math.random() * 8, 5), cloudMat);
    cloud.position.set(-18 + i * 9, 16 + Math.random() * 4, -30 - Math.random() * 6);
    clouds.push(cloud);
    root.add(cloud);
  }

  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(1.45, 24, 24),
    new THREE.MeshBasicMaterial({ color: 0xfff6e4 })
  );
  moon.position.set(-16, 22, -8);
  root.add(moon);
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(2.6, 24, 24),
    new THREE.MeshBasicMaterial({
      color: 0xdce8ff,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
    })
  );
  halo.position.copy(moon.position);
  root.add(halo);

  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(2.35, 24, 24),
    new THREE.MeshBasicMaterial({ color: 0xffe08a })
  );
  sun.position.set(16, 21, 9);
  sun.visible = false;
  root.add(sun);
  const sunHalo = new THREE.Mesh(
    new THREE.SphereGeometry(4.4, 24, 24),
    new THREE.MeshBasicMaterial({
      color: 0xffc56a,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    })
  );
  sunHalo.position.copy(sun.position);
  sunHalo.visible = false;
  root.add(sunHalo);

  return { root, sky, uniforms, stars, clouds, cloudMat, moon, halo, sun, sunHalo };
}
