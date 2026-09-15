import * as THREE from 'three';
import gsap from 'gsap';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { createTextures } from './textures.js';
import { loadStreet } from './scene/props.js';
import { createSky } from './scene/city.js';

const DEFAULT_VIEWS = {
  street: {
    position: { x: -1.8, y: 7.3, z: 26.2 },
    target: { x: -0.35, y: 5.35, z: 1.6 },
  },
};

const DAY = {
  exposure: 1.18,
  fog: new THREE.Color(0xb9d6ef),
  fogNear: 42,
  fogFar: 120,
  hemiSky: new THREE.Color(0xfff1d6),
  hemiGround: new THREE.Color(0x8a9488),
  hemi: 0.92,
  key: new THREE.Color(0xffe4b8),
  keyIntensity: 1.38,
  keyPos: new THREE.Vector3(14, 22, 10),
  fill: new THREE.Color(0xffd9a0),
  fillIntensity: 6,
  ambient: new THREE.Color(0xfff4e4),
  ambientIntensity: 0.48,
  bloom: 0.12,
  bloomRadius: 0.4,
  bloomThresh: 0.86,
  reflector: new THREE.Color(0x9eb4c8),
  wet: new THREE.Color(0xd6cbb4),
  wetOpacity: 0.22,
  skyTop: new THREE.Color('#6eb6ff'),
  skyHorizon: new THREE.Color('#f4c98a'),
  skyBottom: new THREE.Color('#c9dce8'),
  cloud: new THREE.Color(0xffffff),
  cloudOpacity: 0.55,
};

const NIGHT = {
  exposure: 1.08,
  fog: new THREE.Color(0x1a3050),
  fogNear: 30,
  fogFar: 90,
  hemiSky: new THREE.Color(0x6b8ec8),
  hemiGround: new THREE.Color(0x1a1420),
  hemi: 0.62,
  key: new THREE.Color(0xe7eefc),
  keyIntensity: 0.95,
  keyPos: new THREE.Vector3(-12, 22, -8),
  fill: new THREE.Color(0xc5d6f5),
  fillIntensity: 14,
  ambient: new THREE.Color(0x243552),
  ambientIntensity: 0.32,
  bloom: 0.46,
  bloomRadius: 0.55,
  bloomThresh: 0.48,
  reflector: new THREE.Color(0x2a3344),
  wet: new THREE.Color(0x2a3038),
  wetOpacity: 0.38,
  skyTop: new THREE.Color('#102448'),
  skyHorizon: new THREE.Color('#3a5a88'),
  skyBottom: new THREE.Color('#1a2438'),
  cloud: new THREE.Color(0x8aa0c0),
  cloudOpacity: 0.12,
};

function mix(a, b, t) {
  return a + (b - a) * t;
}

export class Experience {
  constructor(canvas, { onProgress, onHover, onSelect } = {}) {
    this.canvas = canvas;
    this.onHover = onHover;
    this.onSelect = onSelect;
    this.onProgressHook = onProgress;
    this.clock = new THREE.Clock();
    this.hotspots = [];
    this.palms = [];
    this.streetlamps = [];
    this.views = { ...DEFAULT_VIEWS };
    this.view = 'street';
    this.targetNightness = 1;
    this.currentNightness = 1;
    this.cycleReady = false;
    this.pointer = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.size = { width: window.innerWidth, height: window.innerHeight };
    this.press = null;

    onProgress?.(0.12);
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.size.width, this.size.height);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x1a3050, 30, 90);

    this.camera = new THREE.PerspectiveCamera(46, this.size.width / this.size.height, 0.1, 200);
    this.camera.position.set(6, 14, 28);

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.target.set(0, 3.2, 0);
    this.controls.minDistance = 8;
    this.controls.maxDistance = 32;
    this.controls.minPolarAngle = 0.85;
    this.controls.maxPolarAngle = 1.42;
    this.controls.minAzimuthAngle = -0.7;
    this.controls.maxAzimuthAngle = 0.85;
    this.controls.enabled = false;

    onProgress?.(0.28);
    const textures = createTextures();
    this.ready = this.buildWorld(textures)
      .then(() => {
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        this.bloom = new UnrealBloomPass(
          new THREE.Vector2(this.size.width, this.size.height),
          0.46,
          0.55,
          0.48
        );
        this.composer.addPass(this.bloom);
        this.composer.addPass(new OutputPass());

        this.bind();
        onProgress?.(1);
        this.tick();
      })
      .catch((error) => {
        console.error('Failed to build the scene', error);
        onProgress?.(1);
      });
  }

  async buildWorld(textures) {
    this.sky = createSky(textures);
    this.scene.add(this.sky.root);

    this.hemi = new THREE.HemisphereLight(0x6b8ec8, 0x1a1420, 0.62);
    this.scene.add(this.hemi);
    this.key = new THREE.DirectionalLight(0xe7eefc, 0.95);
    this.key.position.copy(NIGHT.keyPos);
    this.key.castShadow = true;
    this.key.shadow.mapSize.set(1024, 1024);
    this.key.shadow.camera.near = 1;
    this.key.shadow.camera.far = 70;
    this.key.shadow.camera.left = -22;
    this.key.shadow.camera.right = 22;
    this.key.shadow.camera.top = 22;
    this.key.shadow.camera.bottom = -14;
    this.key.shadow.bias = -0.0002;
    this.scene.add(this.key);
    this.fill = new THREE.PointLight(0xc5d6f5, 14, 90, 1.15);
    this.fill.position.set(-16, 22, -8);
    this.scene.add(this.fill);
    this.ambient = new THREE.AmbientLight(0x243552, 0.32);
    this.scene.add(this.ambient);

    this.reflector = new Reflector(new THREE.CircleGeometry(48, 64), {
      clipBias: 0.003,
      textureWidth: 1024,
      textureHeight: 1024,
      color: 0x2a3344,
    });
    this.reflector.rotateX(-Math.PI / 2);
    this.reflector.position.y = 0;
    this.scene.add(this.reflector);

    this.wet = new THREE.Mesh(
      new THREE.CircleGeometry(48, 64),
      new THREE.MeshStandardMaterial({
        color: 0x2a3038,
        transparent: true,
        opacity: 0.38,
        roughness: 0.18,
        metalness: 0.32,
      })
    );
    this.wet.rotation.x = -Math.PI / 2;
    this.wet.position.y = 0.02;
    this.wet.receiveShadow = true;
    this.scene.add(this.wet);

    const street = await loadStreet((ratio) => this.onProgressHook?.(0.3 + ratio * 0.68));
    this.scene.add(street.root);
    this.hotspots.push(...street.hotspots);
    if (street.cameras) this.views = { ...this.views, ...street.cameras };
    if (street.palm) this.palms.push(street.palm);
    street.root.traverse((obj) => {
      if (obj.userData.kind === 'streetlamp') this.streetlamps.push(obj);
    });
    this.cycleReady = true;
    this.applyCycle(this.currentNightness);
  }

  setCycle(nightness) {
    this.targetNightness = THREE.MathUtils.clamp(nightness, 0, 1);
    if (this.cycleReady && Math.abs(this.currentNightness - this.targetNightness) > 0.92) {
      this.currentNightness = this.targetNightness;
      this.applyCycle(this.currentNightness);
    }
  }

  applyCycle(n) {
    const d = 1 - n;
    this.renderer.toneMappingExposure = mix(DAY.exposure, NIGHT.exposure, n);
    this.scene.fog.color.copy(DAY.fog).lerp(NIGHT.fog, n);
    this.scene.fog.near = mix(DAY.fogNear, NIGHT.fogNear, n);
    this.scene.fog.far = mix(DAY.fogFar, NIGHT.fogFar, n);

    this.hemi.color.copy(DAY.hemiSky).lerp(NIGHT.hemiSky, n);
    this.hemi.groundColor.copy(DAY.hemiGround).lerp(NIGHT.hemiGround, n);
    this.hemi.intensity = mix(DAY.hemi, NIGHT.hemi, n);

    this.key.color.copy(DAY.key).lerp(NIGHT.key, n);
    this.key.intensity = mix(DAY.keyIntensity, NIGHT.keyIntensity, n);
    this.key.position.lerpVectors(DAY.keyPos, NIGHT.keyPos, n);

    this.fill.color.copy(DAY.fill).lerp(NIGHT.fill, n);
    this.fill.intensity = mix(DAY.fillIntensity, NIGHT.fillIntensity, n);
    this.fill.position.copy(this.key.position);

    this.ambient.color.copy(DAY.ambient).lerp(NIGHT.ambient, n);
    this.ambient.intensity = mix(DAY.ambientIntensity, NIGHT.ambientIntensity, n);

    if (this.bloom) {
      this.bloom.strength = mix(DAY.bloom, NIGHT.bloom, n);
      this.bloom.radius = mix(DAY.bloomRadius, NIGHT.bloomRadius, n);
      this.bloom.threshold = mix(DAY.bloomThresh, NIGHT.bloomThresh, n);
    }

    this.reflector.material.uniforms.color.value.copy(DAY.reflector).lerp(NIGHT.reflector, n);
    this.wet.material.color.copy(DAY.wet).lerp(NIGHT.wet, n);
    this.wet.material.opacity = mix(DAY.wetOpacity, NIGHT.wetOpacity, n);

    this.sky.uniforms.topColor.value.copy(DAY.skyTop).lerp(NIGHT.skyTop, n);
    this.sky.uniforms.horizonColor.value.copy(DAY.skyHorizon).lerp(NIGHT.skyHorizon, n);
    this.sky.uniforms.bottomColor.value.copy(DAY.skyBottom).lerp(NIGHT.skyBottom, n);
    this.sky.cloudMat.color.copy(DAY.cloud).lerp(NIGHT.cloud, n);
    this.sky.cloudMat.opacity = mix(DAY.cloudOpacity, NIGHT.cloudOpacity, n);

    this.sky.stars.forEach((star) => {
      star.material.opacity = star.userData.nightOpacity * n;
      star.visible = n > 0.08;
    });
    this.sky.moon.visible = n > 0.28;
    this.sky.halo.visible = n > 0.28;
    this.sky.halo.material.opacity = 0.18 * n;
    this.sky.sun.visible = d > 0.22;
    this.sky.sunHalo.visible = d > 0.22;
    this.sky.sunHalo.material.opacity = 0.22 * d;

    this.streetlamps.forEach((light) => {
      light.intensity = mix(0.04, light.userData.nightIntensity ?? light.intensity, n);
    });
  }

  bind() {
    window.addEventListener('resize', () => this.resize());
    this.canvas.addEventListener('pointermove', (event) => this.onPointerMove(event));
    this.canvas.addEventListener('pointerdown', (event) => this.onPointerDown(event));
    this.canvas.addEventListener('pointerup', (event) => this.onPointerUp(event));
    this.canvas.addEventListener('pointercancel', (event) => this.onPointerUp(event, true));
  }

  resize() {
    this.size.width = window.innerWidth;
    this.size.height = window.innerHeight;
    this.camera.aspect = this.size.width / this.size.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.size.width, this.size.height);
    this.composer.setSize(this.size.width, this.size.height);
  }

  onPointerDown(event) {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    this.press = { x: event.clientX, y: event.clientY, dragged: false, id: event.pointerId };
    this.canvas.setPointerCapture(event.pointerId);
  }

  hotspotId(object) {
    let node = object;
    while (node) {
      if (node.userData?.hotspot) return node.userData.hotspot;
      node = node.parent;
    }
    return null;
  }

  pickHotspot(event) {
    this.pointer.x = (event.clientX / this.size.width) * 2 - 1;
    this.pointer.y = -(event.clientY / this.size.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.hotspots, true);
    for (const hit of hits) {
      const id = this.hotspotId(hit.object);
      if (id) return id;
    }
    return null;
  }

  onPointerMove(event) {
    if (this.press && !this.press.dragged) {
      const dx = event.clientX - this.press.x;
      const dy = event.clientY - this.press.y;
      if (dx * dx + dy * dy > 256) {
        this.press.dragged = true;
        document.body.classList.add('is-dragging');
      }
    }
    if (this.press?.dragged) {
      document.body.classList.toggle('is-hovering', false);
      this.onHover?.(null);
      return;
    }
    const id = this.pickHotspot(event);
    document.body.classList.toggle('is-hovering', Boolean(id));
    this.onHover?.(id, event.clientX, event.clientY);
  }

  onPointerUp(event, cancelled = false) {
    const press = this.press;
    this.press = null;
    document.body.classList.remove('is-dragging');
    document.body.classList.remove('is-hovering');
    this.onHover?.(null);
    if (press) {
      try {
        if (this.canvas.hasPointerCapture(press.id)) {
          this.canvas.releasePointerCapture(press.id);
        }
      } catch {
        /* already released */
      }
    }
    if (cancelled || !press || press.dragged) return;

    const id = this.pickHotspot(event);
    if (id) this.onSelect?.(id);
  }

  async intro() {
    this.controls.enabled = false;
    await this.flyTo('street', 2.6);
    this.controls.enabled = true;
  }

  flyTo(name, duration = 1.6) {
    const view = this.views[name] ?? this.views.street;
    this.view = name;
    this.controls.enableRotate = false;
    this.controls.enableZoom = false;
    return new Promise((resolve) => {
      gsap.to(this.camera.position, {
        duration,
        ease: 'power2.inOut',
        ...view.position,
      });
      gsap.to(this.controls.target, {
        duration,
        ease: 'power2.inOut',
        ...view.target,
        onComplete: () => {
          this.controls.enableRotate = name === 'street';
          this.controls.enableZoom = name === 'street';
          resolve();
        },
      });
    });
  }

  tick() {
    const elapsed = this.clock.getElapsedTime();
    this.palms.forEach((palm, i) => {
      palm.rotation.z = Math.sin(elapsed * 0.6 + palm.userData.sway) * 0.03;
      palm.rotation.x = Math.cos(elapsed * 0.4 + i) * 0.015;
    });
    if (this.cycleReady) {
      const next = mix(this.currentNightness, this.targetNightness, 0.045);
      if (Math.abs(next - this.currentNightness) > 0.0008) {
        this.currentNightness = next;
        this.applyCycle(this.currentNightness);
      }
    }
    this.controls.update();
    this.composer.render();
    this.frame = requestAnimationFrame(() => this.tick());
  }
}
