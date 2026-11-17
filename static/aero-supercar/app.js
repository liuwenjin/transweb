/* ============================================================
   AERONOVA NX-01 — parametric hypercar
   Procedural bodywork is generated from spline-lofted profiles.
   ============================================================ */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const viewport = { width: window.innerWidth, height: window.innerHeight };
const state = {
  autoRotate: !prefersReducedMotion,
  xray: false,
  wingUp: true,
  paintTarget: new THREE.Color('#8d98a7'),
  draggingUntil: 0,
};

const dom = {
  loader: $('#loader'),
  loaderBar: $('#loaderBar'),
  loaderPercent: $('#loaderPercent'),
  fallback: $('#fallback'),
  paintName: $('#paintName'),
  rotationBar: $('#rotationBar'),
  rotationValue: $('#rotationValue'),
  viewSolid: $('#viewSolid'),
  viewXray: $('#viewXray'),
  turntable: $('#turntableToggle'),
  wing: $('#wingToggle'),
  hotspots: $('#hotspots'),
};

/* ------------------------------------------------------------------ */
/* Boot                                                                */
/* ------------------------------------------------------------------ */

function supportsWebGL() {
  try {
    const probe = document.createElement('canvas');
    return Boolean(window.WebGL2RenderingContext && probe.getContext('webgl2'));
  } catch (error) {
    return false;
  }
}

if (!supportsWebGL()) {
  dom.loader?.classList.add('is-done');
  if (dom.fallback) dom.fallback.hidden = false;
  throw new Error('WebGL 2 is not available in this browser.');
}

const canvas = $('#scene');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    stencil: false,
    powerPreference: 'high-performance',
  });
} catch (error) {
  dom.loader?.classList.add('is-done');
  if (dom.fallback) dom.fallback.hidden = false;
  throw error;
}

const pixelRatio = Math.min(window.devicePixelRatio || 1, viewport.width < 760 ? 1.45 : 1.85);
renderer.setPixelRatio(pixelRatio);
renderer.setSize(viewport.width, viewport.height);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x040608);
scene.fog = new THREE.FogExp2(0x040608, 0.024);

const camera = new THREE.PerspectiveCamera(viewport.width < 700 ? 44 : 33, viewport.width / viewport.height, 0.1, 120);

function getCameraTier(width, height) {
  if (width < 700) return 'mobile';
  if (width < 1360) return 'tablet';
  if (width < 1600 || height < 960) return 'mid';
  return 'desktop';
}

function getHomeView() {
  if (viewport.height < 560 && viewport.width >= 540 && viewport.width < 900) {
    return {
      position: new THREE.Vector3(5.4, 2.15, 6.0),
      target: new THREE.Vector3(0.4, 0.48, -0.35),
      fov: 40,
    };
  }
  if (viewport.width < 700) {
    return {
      position: new THREE.Vector3(9.0, 4.05, 10.35),
      target: new THREE.Vector3(-0.18, 0.16, 0),
      fov: 44,
    };
  }
  if (viewport.width < 1360) {
    return {
      position: new THREE.Vector3(7.5, 2.9, 8.3),
      target: new THREE.Vector3(0.45, 0.6, -0.35),
      fov: 36,
    };
  }
  if (viewport.width < 1600 || viewport.height < 960) {
    return {
      position: new THREE.Vector3(6.7, 2.6, 7.5),
      target: new THREE.Vector3(0.5, 0.63, -0.28),
      fov: 35,
    };
  }
  return {
    position: new THREE.Vector3(6.1, 2.35, 6.9),
    target: new THREE.Vector3(-0.35, 0.65, 0.3),
    fov: 33,
  };
}

let homeView = getHomeView();
let lastCameraTier = getCameraTier(viewport.width, viewport.height);
camera.position.copy(homeView.position);
camera.fov = homeView.fov;
camera.updateProjectionMatrix();

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(homeView.target);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.enablePan = false;
controls.minDistance = 5.4;
controls.maxDistance = 17;
controls.minPolarAngle = 0.42;
controls.maxPolarAngle = 1.52;
controls.zoomSpeed = 0.72;
controls.rotateSpeed = 0.58;
controls.update();

/* ------------------------------------------------------------------ */
/* Environment & lighting                                             */
/* ------------------------------------------------------------------ */

const pmrem = new THREE.PMREMGenerator(renderer);
pmrem.compileCubemapShader();
const environmentScene = new RoomEnvironment();
const envRT = pmrem.fromScene(environmentScene, 0.045);
scene.environment = envRT.texture;

scene.add(new THREE.HemisphereLight(0x7fb8d9, 0x040506, 0.34));

const keyLight = new THREE.SpotLight(0xe6f7ff, 240, 34, 0.58, 0.86, 1.55);
keyLight.position.set(4.8, 9.6, 5.8);
keyLight.target.position.set(0, 0.55, 0);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1536, 1536);
keyLight.shadow.camera.near = 2;
keyLight.shadow.camera.far = 28;
keyLight.shadow.bias = -0.00018;
keyLight.shadow.normalBias = 0.018;
scene.add(keyLight, keyLight.target);

const topLight = new THREE.DirectionalLight(0xb9ddff, 0.8);
topLight.position.set(-5.5, 8.5, 3.6);
topLight.castShadow = true;
topLight.shadow.mapSize.set(1024, 1024);
topLight.shadow.camera.top = 7;
topLight.shadow.camera.bottom = -7;
topLight.shadow.camera.left = -7;
topLight.shadow.camera.right = 7;
topLight.shadow.camera.near = 0.5;
topLight.shadow.camera.far = 24;
topLight.shadow.bias = -0.0002;
topLight.shadow.normalBias = 0.02;
scene.add(topLight);

const rimLight = new THREE.SpotLight(0xff5426, 20, 22, 0.7, 1, 1.8);
rimLight.position.set(-6.3, 3.4, -5.2);
rimLight.target.position.set(-0.7, 0.55, 0);
scene.add(rimLight, rimLight.target);

const coolRim = new THREE.SpotLight(0x45dfff, 48, 24, 0.55, 1, 1.8);
coolRim.position.set(5.8, 2.2, -5.6);
coolRim.target.position.set(0.7, 0.55, 0);
scene.add(coolRim, coolRim.target);

const frontFill = new THREE.PointLight(0x74e9ff, 5, 9, 2);
frontFill.position.set(2.8, 1.1, 2.8);
scene.add(frontFill);

const rearFill = new THREE.PointLight(0xff6b2b, 3, 8, 2);
rearFill.position.set(-2.8, 1.4, -2.2);
scene.add(rearFill);

/* ------------------------------------------------------------------ */
/* Post processing                                                    */
/* ------------------------------------------------------------------ */

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(viewport.width, viewport.height),
  viewport.width < 760 ? 0.24 : 0.32,
  0.3,
  1.6
);
const outputPass = new OutputPass();
composer.addPass(renderPass);
composer.addPass(bloomPass);
composer.addPass(outputPass);
if (typeof composer.setPixelRatio === 'function') composer.setPixelRatio(pixelRatio);

/* ------------------------------------------------------------------ */
/* Procedural carbon fibre texture                                    */
/* ------------------------------------------------------------------ */

function createCarbonTexture() {
  const size = 256;
  const weave = 32;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');

  ctx.fillStyle = '#07090b';
  ctx.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y += weave) {
    for (let x = 0; x < size; x += weave) {
      const horizontal = ((x / weave + y / weave) | 0) % 2 === 0;
      const g = ctx.createLinearGradient(
        x,
        y,
        horizontal ? x : x + weave,
        horizontal ? y + weave : y
      );
      if (horizontal) {
        g.addColorStop(0, '#171b1f');
        g.addColorStop(0.36, '#2b3137');
        g.addColorStop(0.52, '#15191d');
        g.addColorStop(1, '#080a0c');
      } else {
        g.addColorStop(0, '#0b0d10');
        g.addColorStop(0.4, '#22272c');
        g.addColorStop(0.56, '#101317');
        g.addColorStop(1, '#06080a');
      }
      ctx.fillStyle = g;
      ctx.fillRect(x + 1, y + 1, weave - 2, weave - 2);

      ctx.strokeStyle = horizontal ? 'rgba(196, 220, 232, 0.055)' : 'rgba(196, 220, 232, 0.03)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (horizontal) {
        ctx.moveTo(x + 2, y + 3);
        ctx.lineTo(x + weave - 3, y + weave - 3);
      } else {
        ctx.moveTo(x + weave - 3, y + 3);
        ctx.lineTo(x + 2, y + weave - 3);
      }
      ctx.stroke();
    }
  }

  // micro fibre speckle
  const image = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < image.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 8;
    image.data[i] += n;
    image.data[i + 1] += n;
    image.data[i + 2] += n;
  }
  ctx.putImageData(image, 0, 0);

  const texture = new THREE.CanvasTexture(c);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(7, 2.4);
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const carbonTexture = createCarbonTexture();

/* ------------------------------------------------------------------ */
/* Materials                                                          */
/* ------------------------------------------------------------------ */

const mats = {
  paint: new THREE.MeshPhysicalMaterial({
    color: 0x8d98a7,
    metalness: 0.9,
    roughness: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0.055,
    envMapIntensity: 1.05,
    iridescence: 0.08,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [100, 420],
  }),
  carbon: new THREE.MeshPhysicalMaterial({
    map: carbonTexture,
    color: 0xffffff,
    metalness: 0.48,
    roughness: 0.27,
    clearcoat: 0.96,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.16,
    side: THREE.DoubleSide,
  }),
  carbonDark: new THREE.MeshStandardMaterial({
    color: 0x090c0f,
    metalness: 0.55,
    roughness: 0.4,
    envMapIntensity: 0.85,
    side: THREE.DoubleSide,
  }),
  glass: new THREE.MeshPhysicalMaterial({
    color: 0x050d13,
    metalness: 0.55,
    roughness: 0.13,
    clearcoat: 0.85,
    clearcoatRoughness: 0.06,
    envMapIntensity: 0.95,
    transparent: true,
    opacity: 0.965,
    side: THREE.DoubleSide,
  }),
  rubber: new THREE.MeshStandardMaterial({
    color: 0x050607,
    metalness: 0.02,
    roughness: 0.88,
    envMapIntensity: 0.25,
  }),
  rim: new THREE.MeshStandardMaterial({
    color: 0x353d45,
    metalness: 1,
    roughness: 0.23,
    envMapIntensity: 1.35,
  }),
  rimDark: new THREE.MeshStandardMaterial({
    color: 0x111519,
    metalness: 0.95,
    roughness: 0.3,
    envMapIntensity: 1.1,
  }),
  chrome: new THREE.MeshStandardMaterial({
    color: 0xcfdae2,
    metalness: 1,
    roughness: 0.14,
    envMapIntensity: 1.7,
  }),
  blackTrim: new THREE.MeshPhysicalMaterial({
    color: 0x050708,
    metalness: 0.42,
    roughness: 0.36,
    clearcoat: 0.6,
    clearcoatRoughness: 0.15,
    envMapIntensity: 1.05,
  }),
  headlight: new THREE.MeshBasicMaterial({
    color: new THREE.Color('#c8f8ff').multiplyScalar(2.2),
    toneMapped: false,
  }),
  tailLight: new THREE.MeshBasicMaterial({
    color: new THREE.Color('#ff2836').multiplyScalar(1.9),
    toneMapped: false,
  }),
  cyanGlow: new THREE.MeshBasicMaterial({
    color: new THREE.Color('#62efff').multiplyScalar(2.7),
    toneMapped: false,
  }),
  cyanSoft: new THREE.MeshBasicMaterial({
    color: 0x48d9ee,
    transparent: true,
    opacity: 0.34,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  }),
  caliper: new THREE.MeshStandardMaterial({
    color: 0x090b0d,
    metalness: 0.65,
    roughness: 0.28,
    emissive: 0x1ac7e8,
    emissiveIntensity: 0.8,
  }),
  interior: new THREE.MeshStandardMaterial({
    color: 0x030405,
    metalness: 0.1,
    roughness: 0.92,
    envMapIntensity: 0.12,
  }),
  xraySolid: new THREE.MeshBasicMaterial({
    color: 0x2dd8f0,
    transparent: true,
    opacity: 0.28,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  }),
  xrayLine: new THREE.LineBasicMaterial({
    color: 0x5fe9ff,
    transparent: true,
    opacity: 0.36,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  }),
  xrayLineBright: new THREE.LineBasicMaterial({
    color: 0xb9f8ff,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  }),
};

/* ------------------------------------------------------------------ */
/* Geometry helpers                                                   */
/* ------------------------------------------------------------------ */

function addMesh(geometry, material, parent, options = {}) {
  const object = new THREE.Mesh(geometry, material);
  object.castShadow = options.castShadow !== false;
  object.receiveShadow = options.receiveShadow === true;
  parent.add(object);
  return object;
}

function addRod(a, b, radius, material, parent, radialSegments = 8) {
  const dir = b.clone().sub(a);
  const length = dir.length();
  const geometry = new THREE.CylinderGeometry(radius, radius, length, radialSegments, 1, false);
  const rod = addMesh(geometry, material, parent);
  rod.position.copy(a).add(b).multiplyScalar(0.5);
  rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return rod;
}

function sampleProfile(points, t) {
  if (t <= points[0][0]) return points[0][1];
  const last = points[points.length - 1];
  if (t >= last[0]) return last[1];
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    if (t >= a[0] && t <= b[0]) {
      const u = (t - a[0]) / (b[0] - a[0] || 1);
      const smooth = u * u * (3 - 2 * u);
      return a[1] + (b[1] - a[1]) * smooth;
    }
  }
  return last[1];
}

function createRoundedRectShape(width, height, radius) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

/* ------------------------------------------------------------------ */
/* Parametric body profiles                                           */
/* ------------------------------------------------------------------ */

const BODY_START = -2.43;
const BODY_END = 2.55;
const BODY_LENGTH = BODY_END - BODY_START;

const widthProfile = [
  [0, 0.56],
  [0.028, 0.72],
  [0.065, 0.9],
  [0.11, 1.015],
  [0.175, 1.09],
  [0.235, 1.07],
  [0.3, 1.0],
  [0.38, 0.925],
  [0.48, 0.865],
  [0.57, 0.88],
  [0.65, 0.955],
  [0.72, 1.045],
  [0.79, 1.095],
  [0.84, 1.055],
  [0.89, 0.945],
  [0.94, 0.76],
  [0.975, 0.5],
  [1, 0.075],
];

const topProfile = [
  [0, 0.79],
  [0.035, 0.85],
  [0.08, 0.875],
  [0.175, 0.885],
  [0.27, 0.885],
  [0.37, 0.872],
  [0.47, 0.86],
  [0.56, 0.85],
  [0.65, 0.828],
  [0.72, 0.795],
  [0.79, 0.765],
  [0.84, 0.7],
  [0.89, 0.61],
  [0.94, 0.505],
  [0.975, 0.43],
  [1, 0.37],
];

const bottomProfile = [
  [0, 0.245],
  [0.055, 0.175],
  [0.13, 0.15],
  [0.25, 0.145],
  [0.7, 0.142],
  [0.8, 0.15],
  [0.89, 0.175],
  [0.96, 0.225],
  [1, 0.29],
];

function bodyX(t) {
  return BODY_START + BODY_LENGTH * t;
}

function wheelHaunch(t) {
  const rear = 0.245 * Math.exp(-Math.pow((t - 0.177) / 0.098, 2));
  const front = 0.225 * Math.exp(-Math.pow((t - 0.79) / 0.095, 2));
  return rear + front;
}

function hoodRidge(t) {
  return 0.03 * Math.exp(-Math.pow((t - 0.66) / 0.17, 2)) + 0.012 * Math.exp(-Math.pow((t - 0.38) / 0.22, 2));
}

function bodySectionPoint(t, theta) {
  const width = sampleProfile(widthProfile, t);
  const top = sampleProfile(topProfile, t);
  const bottom = sampleProfile(bottomProfile, t);
  const yMid = bottom + (top - bottom) * 0.47;

  const sin = Math.sin(theta);
  const cos = Math.cos(theta);
  const sAbs = Math.abs(sin);

  const zExponent = cos >= 0 ? 0.7 : 1.1;
  const z = width * 1.035 * Math.sign(sin) * Math.pow(sAbs, zExponent);

  let y;
  if (cos >= 0) {
    y = yMid + (top - yMid) * Math.pow(cos, 0.44);
    const haunch = wheelHaunch(t);
    y += haunch * Math.pow(sAbs, 1.35) * Math.pow(cos, 0.3);
    y += 0.01 * Math.exp(-Math.pow((sAbs - 0.84) / 0.055, 2)) * Math.pow(cos, 0.4);
    y += hoodRidge(t) * Math.exp(-Math.pow(z / Math.max(width * 0.22, 0.001), 2));
  } else {
    y = yMid - (yMid - bottom) * Math.pow(-cos, 1.08);
    // Slight tumblehome under the sills.
    y += 0.014 * Math.pow(sAbs, 2.2) * Math.pow(-cos, 0.5);
  }

  return { z, y, width, top, bottom, yMid };
}

function buildBodyGeometry(stations = 132, ring = 76) {
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= stations; i += 1) {
    const t = i / stations;
    const x = bodyX(t);
    for (let j = 0; j < ring; j += 1) {
      const theta = (j / ring) * Math.PI * 2;
      const point = bodySectionPoint(t, theta);
      positions.push(x, point.y, point.z);
      uvs.push(t, j / ring);
    }
  }

  const rowLength = ring;
  for (let i = 0; i < stations; i += 1) {
    for (let j = 0; j < ring; j += 1) {
      const nextJ = (j + 1) % ring;
      const a = i * rowLength + j;
      const b = (i + 1) * rowLength + j;
      const c = i * rowLength + nextJ;
      const d = (i + 1) * rowLength + nextJ;
      indices.push(a, c, b, b, c, d);
    }
  }

  // Close the nose and tail with flat-ish fans.
  function cap(rowIndex, frontFacing) {
    const base = rowIndex * rowLength;
    const t = rowIndex / stations;
    const section = bodySectionPoint(t, 0);
    const centerIndex = positions.length / 3;
    positions.push(bodyX(t), section.yMid, 0);
    uvs.push(0.5, 0.5);
    for (let j = 0; j < ring; j += 1) {
      const nextJ = (j + 1) % ring;
      if (frontFacing) {
        indices.push(centerIndex, base + nextJ, base + j);
      } else {
        indices.push(centerIndex, base + j, base + nextJ);
      }
    }
  }
  cap(0, false);
  cap(stations, true);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

function buildBodyWireGeometry() {
  const stations = 46;
  const ring = 38;
  const positions = [];
  const rows = [];

  for (let i = 0; i <= stations; i += 1) {
    const t = i / stations;
    const x = bodyX(t);
    const row = [];
    for (let j = 0; j < ring; j += 1) {
      const theta = (j / ring) * Math.PI * 2;
      const point = bodySectionPoint(t, theta);
      row.push(new THREE.Vector3(x, point.y, point.z));
    }
    rows.push(row);
  }

  for (let i = 0; i < rows.length; i += 1) {
    for (let j = 0; j < ring; j += 1) {
      const nextJ = (j + 1) % ring;
      if (i < rows.length - 1) {
        positions.push(
          rows[i][j].x, rows[i][j].y, rows[i][j].z,
          rows[i + 1][j].x, rows[i + 1][j].y, rows[i + 1][j].z
        );
      }
      if (i % 2 === 0) {
        positions.push(
          rows[i][j].x, rows[i][j].y, rows[i][j].z,
          rows[i][nextJ].x, rows[i][nextJ].y, rows[i][nextJ].z
        );
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

/* ------------------------------------------------------------------ */
/* Canopy                                                             */
/* ------------------------------------------------------------------ */

function canopySection(s, theta) {
  const x = -1.28 + 2.5 * s;
  const envelope = Math.pow(Math.sin(Math.PI * s), 0.36);
  const width = 0.705 * envelope;
  const height = 0.405 * Math.pow(Math.sin(Math.PI * s), 0.5);
  const base = 0.805 + 0.05 * Math.sin(Math.PI * s);
  const phi = theta;
  const z = width * Math.cos(phi);
  const y = base + height * Math.pow(Math.sin(phi), 0.8);
  return { x, z, y, width, height, base };
}

function buildCanopyGeometry(stations = 56, ring = 30) {
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= stations; i += 1) {
    const s = i / stations;
    for (let j = 0; j <= ring; j += 1) {
      const phi = (j / ring) * Math.PI;
      const point = canopySection(s, phi);
      positions.push(point.x, point.y, point.z);
      uvs.push(s, j / ring);
    }
  }

  const rowLength = ring + 1;
  for (let i = 0; i < stations; i += 1) {
    for (let j = 0; j < ring; j += 1) {
      const a = i * rowLength + j;
      const b = (i + 1) * rowLength + j;
      const c = i * rowLength + j + 1;
      const d = (i + 1) * rowLength + j + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function buildCanopyWireGeometry() {
  const stations = 24;
  const ring = 18;
  const positions = [];
  const rows = [];

  for (let i = 0; i <= stations; i += 1) {
    const s = i / stations;
    const row = [];
    for (let j = 0; j <= ring; j += 1) {
      const point = canopySection(s, (j / ring) * Math.PI);
      row.push(new THREE.Vector3(point.x, point.y, point.z));
    }
    rows.push(row);
  }

  for (let i = 0; i < rows.length; i += 1) {
    for (let j = 0; j < ring; j += 1) {
      positions.push(
        rows[i][j].x, rows[i][j].y, rows[i][j].z,
        rows[i][j + 1].x, rows[i][j + 1].y, rows[i][j + 1].z
      );
      if (i < rows.length - 1) {
        positions.push(
          rows[i][j].x, rows[i][j].y, rows[i][j].z,
          rows[i + 1][j].x, rows[i + 1][j].y, rows[i + 1][j].z
        );
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

/* ------------------------------------------------------------------ */
/* Stage & environment meshes                                         */
/* ------------------------------------------------------------------ */

const stage = new THREE.Group();
scene.add(stage);

const platformMat = new THREE.MeshPhysicalMaterial({
  color: 0x070b0f,
  metalness: 0.48,
  roughness: 0.52,
  clearcoat: 0.3,
  clearcoatRoughness: 0.32,
  envMapIntensity: 0.42,
});

const disc = addMesh(new THREE.CylinderGeometry(4.22, 4.32, 0.12, 128), platformMat, stage, {
  castShadow: false,
  receiveShadow: true,
});
disc.position.y = -0.06;

const floor = addMesh(new THREE.CircleGeometry(28, 96), new THREE.MeshStandardMaterial({
  color: 0x030507,
  metalness: 0.4,
  roughness: 0.44,
  envMapIntensity: 0.2,
}), scene, { castShadow: false, receiveShadow: true });
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.085;

const grid = new THREE.GridHelper(52, 104, 0x0a1b23, 0x071116);
grid.position.y = -0.078;
grid.material.transparent = true;
grid.material.opacity = 0.3;
grid.material.depthWrite = false;
scene.add(grid);

const outerRing = new THREE.Mesh(
  new THREE.TorusGeometry(4.33, 0.008, 6, 160),
  new THREE.MeshBasicMaterial({
    color: 0x5fe7ff,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  })
);
outerRing.rotation.x = Math.PI / 2;
outerRing.position.y = 0.012;
scene.add(outerRing);

const platformTicks = new THREE.Group();
stage.add(platformTicks);
for (let i = 0; i < 72; i += 1) {
  const angle = (i / 72) * Math.PI * 2;
  const long = i % 6 === 0;
  const tick = addMesh(
    new THREE.BoxGeometry(long ? 0.2 : 0.09, 0.004, 0.012),
    new THREE.MeshBasicMaterial({
      color: long ? 0x8cf3ff : 0x3d94a8,
      transparent: true,
      opacity: long ? 0.54 : 0.2,
      toneMapped: false,
    }),
    platformTicks,
    { castShadow: false }
  );
  tick.position.set(Math.cos(angle) * 4.04, 0.011, Math.sin(angle) * 4.04);
  tick.rotation.y = -angle;
}

for (let r = 1.72; r <= 3.55; r += 0.61) {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(r, r + 0.004, 128),
    new THREE.MeshBasicMaterial({
      color: 0x56cfe4,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.006;
  stage.add(ring);
}

for (let i = 0; i < 36; i += 1) {
  const angle = (i / 36) * Math.PI * 2;
  const spoke = addMesh(
    new THREE.BoxGeometry(0.006, 0.002, 1.7),
    new THREE.MeshBasicMaterial({
      color: 0x4ac9df,
      transparent: true,
      opacity: 0.09,
      toneMapped: false,
    }),
    stage,
    { castShadow: false }
  );
  spoke.position.set(Math.cos(angle) * 2.75, 0.004, Math.sin(angle) * 2.75);
  spoke.rotation.y = -angle;
}

// A soft contact shadow that travels with the car.
function createContactShadowTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d');
  const gradient = ctx.createRadialGradient(256, 128, 8, 256, 128, 250);
  gradient.addColorStop(0, 'rgba(0,0,0,0.92)');
  gradient.addColorStop(0.28, 'rgba(0,0,0,0.72)');
  gradient.addColorStop(0.62, 'rgba(0,0,0,0.3)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 256);
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const carRoot = new THREE.Group();
stage.add(carRoot);

const contactShadow = new THREE.Mesh(
  new THREE.PlaneGeometry(6.8, 3.1),
  new THREE.MeshBasicMaterial({
    map: createContactShadowTexture(),
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
    toneMapped: false,
  })
);
contactShadow.rotation.x = -Math.PI / 2;
contactShadow.position.y = 0.014;
carRoot.add(contactShadow);

// Atmospheric dust.
const dustCount = viewport.width < 760 ? 150 : 320;
const dustPositions = new Float32Array(dustCount * 3);
for (let i = 0; i < dustCount; i += 1) {
  const radius = 2.2 + Math.random() * 7.5;
  const angle = Math.random() * Math.PI * 2;
  dustPositions[i * 3] = Math.cos(angle) * radius;
  dustPositions[i * 3 + 1] = 0.12 + Math.random() * 3.4;
  dustPositions[i * 3 + 2] = Math.sin(angle) * radius;
}
const dustGeometry = new THREE.BufferGeometry();
dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
const dust = new THREE.Points(
  dustGeometry,
  new THREE.PointsMaterial({
    color: 0x7ad5e8,
    size: 0.019,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  })
);
scene.add(dust);

/* ------------------------------------------------------------------ */
/* Car construction                                                   */
/* ------------------------------------------------------------------ */

const bodyGeometry = buildBodyGeometry();
const body = addMesh(bodyGeometry, mats.paint, carRoot);
body.name = 'NX-01_Body';

const canopy = addMesh(buildCanopyGeometry(), mats.glass, carRoot);
canopy.name = 'NX-01_Canopy';

// Canopy frame / spine.
const canopySpinePoints = [];
for (let i = 0; i <= 28; i += 1) {
  const s = i / 28;
  const point = canopySection(s, Math.PI / 2);
  canopySpinePoints.push(new THREE.Vector3(point.x, point.y + 0.004, 0));
}
const canopySpineCurve = new THREE.CatmullRomCurve3(canopySpinePoints);
addMesh(new THREE.TubeGeometry(canopySpineCurve, 70, 0.008, 5, false), mats.blackTrim, carRoot, {
  castShadow: false,
});

for (const side of [-1, 1]) {
  const pillarPoints = [];
  for (let i = 0; i <= 18; i += 1) {
    const s = 0.08 + (i / 18) * 0.22;
    const point = canopySection(s, Math.PI / 2 - 0.62);
    pillarPoints.push(new THREE.Vector3(point.x, point.y + 0.002, side * point.z));
  }
  const pillarCurve = new THREE.CatmullRomCurve3(pillarPoints);
  addMesh(new THREE.TubeGeometry(pillarCurve, 36, 0.009, 5, false), mats.blackTrim, carRoot, {
    castShadow: false,
  });

  // roof rail along the canopy edge
  const railPoints = [];
  for (let i = 0; i <= 30; i += 1) {
    const s = 0.03 + (i / 30) * 0.94;
    const point = canopySection(s, 0.04);
    railPoints.push(new THREE.Vector3(point.x, point.y + 0.002, side * point.z));
  }
  const railCurve = new THREE.CatmullRomCurve3(railPoints);
  addMesh(new THREE.TubeGeometry(railCurve, 72, 0.0055, 4, false), mats.blackTrim, carRoot, {
    castShadow: false,
  });
}

// Interior silhouettes seen through the smoked canopy.
for (const side of [-1, 1]) {
  const seat = addMesh(new THREE.SphereGeometry(1, 20, 12), mats.interior, carRoot);
  seat.scale.set(0.28, 0.2, 0.24);
  seat.position.set(-0.38, 0.875, side * 0.28);
  seat.rotation.z = -0.18;
  seat.visible = false;
  const headrest = addMesh(new THREE.BoxGeometry(0.16, 0.16, 0.19), mats.blackTrim, carRoot);
  headrest.position.set(-0.62, 0.99, side * 0.28);
  headrest.rotation.z = -0.12;
  headrest.visible = false;
}
const dashboard = addMesh(new THREE.BoxGeometry(0.34, 0.085, 0.94), mats.interior, carRoot);
dashboard.position.set(0.4, 0.84, 0);
dashboard.rotation.z = -0.08;
dashboard.visible = false;

// Low centre console / drive tunnel.
const tunnel = addMesh(new THREE.BoxGeometry(1.25, 0.09, 0.22), mats.blackTrim, carRoot);
tunnel.position.set(-0.1, 0.795, 0);
tunnel.visible = false;

/* ----------------------------- body creases & vents ---------------- */

function surfacePoint(t, theta, side, lift = 0.004) {
  const section = bodySectionPoint(t, theta * side);
  return new THREE.Vector3(bodyX(t), section.y + lift, section.z + side * lift * 0.7);
}

function addSurfaceSeam(points, radius, material) {
  const curve = new THREE.CatmullRomCurve3(points);
  addMesh(new THREE.TubeGeometry(curve, 64, radius, 4, false), material, carRoot, {
    castShadow: false,
  });
}

for (const side of [-1, 1]) {
  // Shoulder crease that runs the full length of the body.
  const shoulderPoints = [];
  for (let i = 0; i <= 46; i += 1) {
    const t = 0.055 + (i / 46) * 0.86;
    shoulderPoints.push(surfacePoint(t, 1.06, side, 0.005));
  }
  addSurfaceSeam(shoulderPoints, 0.0042, mats.blackTrim);

  // Door cut line, echoing the wheelbase.
  const doorPoints = [];
  for (let i = 0; i <= 22; i += 1) {
    const theta = 1.02 + (i / 22) * 1.12;
    doorPoints.push(surfacePoint(0.63, theta, side, 0.006));
  }
  addSurfaceSeam(doorPoints, 0.0036, mats.blackTrim);

  // Hood extractor slots.
  for (let i = 0; i < 3; i += 1) {
    const t = 0.64 + i * 0.037;
    const theta = 0.31;
    const section = bodySectionPoint(t, theta * side);
    const slot = addMesh(new THREE.BoxGeometry(0.31, 0.013, 0.075), mats.carbonDark, carRoot);
    slot.position.set(bodyX(t), section.y + 0.007, section.z + side * 0.004);
    slot.rotation.z = -0.13;
    slot.rotation.x = side * 0.04;
  }

  // Rear deck louvres.
  for (let i = 0; i < 2; i += 1) {
    const t = 0.12 + i * 0.04;
    const section = bodySectionPoint(t, 0.28 * side);
    const louvre = addMesh(new THREE.BoxGeometry(0.27, 0.01, 0.06), mats.carbonDark, carRoot);
    louvre.position.set(bodyX(t), section.y + 0.01, section.z + side * 0.003);
    louvre.rotation.z = 0.12;
  }

  // Side-intake horizontal gills.
  for (let i = 0; i < 3; i += 1) {
    const gill = addMesh(new THREE.BoxGeometry(0.47, 0.014, 0.018), mats.carbon, carRoot);
    gill.position.set(-0.58, 0.53 + i * 0.052, side * 0.973);
    gill.rotation.z = -0.1;
    gill.rotation.y = side * 0.04;
  }

  // Front daytime running light wrap.
  const drlPoints = [
    new THREE.Vector3(2.49, 0.39, side * 0.18),
    new THREE.Vector3(2.44, 0.415, side * 0.36),
    new THREE.Vector3(2.32, 0.455, side * 0.54),
    new THREE.Vector3(2.17, 0.49, side * 0.65),
  ];
  const drlCurve = new THREE.CatmullRomCurve3(drlPoints);
  addMesh(new THREE.TubeGeometry(drlCurve, 28, 0.0075, 4, false), mats.headlight, carRoot, {
    castShadow: false,
  });
}

// Central hood spine, raised just above the surface.
const hoodSpinePoints = [];
for (let i = 0; i <= 26; i += 1) {
  const t = 0.57 + (i / 26) * 0.37;
  const section = bodySectionPoint(t, 0);
  hoodSpinePoints.push(new THREE.Vector3(bodyX(t), section.y + 0.009, 0));
}
addSurfaceSeam(hoodSpinePoints, 0.004, mats.blackTrim);

// Front intake slot.
const noseIntake = addMesh(new THREE.BoxGeometry(0.03, 0.06, 0.55), mats.carbonDark, carRoot);
noseIntake.position.set(2.49, 0.265, 0);
noseIntake.rotation.z = -0.05;

/* ----------------------------- wheel & brake hardware --------------- */

const wheels = [];
const wheelRadius = 0.405;
const wheelWidth = 0.3;
const wheelX = 1.53;
const wheelZ = 1.02;
const wheelY = wheelRadius;

function createSpokeGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0.078, 0.018);
  shape.bezierCurveTo(0.15, 0.06, 0.25, 0.052, 0.315, 0.012);
  shape.lineTo(0.315, -0.022);
  shape.bezierCurveTo(0.23, -0.035, 0.14, -0.028, 0.078, -0.01);
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.018,
    bevelEnabled: true,
    bevelSize: 0.003,
    bevelThickness: 0.003,
    bevelSegments: 1,
    steps: 1,
  });
}

const spokeGeometry = createSpokeGeometry();
spokeGeometry.scale(0.91, 0.91, 1);
const rimFaceGeometry = new THREE.TorusGeometry(0.293, 0.0095, 8, 72);
const rimGlowGeometry = new THREE.TorusGeometry(0.242, 0.009, 7, 72);
const rimHaloGeometry = new THREE.TorusGeometry(0.262, 0.019, 7, 72);
const tireSideGeometry = new THREE.TorusGeometry(wheelRadius - 0.039, 0.039, 10, 64);
const brakeDiscGeometry = new THREE.CircleGeometry(0.228, 48);

function createWheel(side) {
  const steer = new THREE.Group();
  const spin = new THREE.Group();
  steer.add(spin);

  const wheelLight = new THREE.PointLight(0x36dcff, 0.8, 1.25, 2);
  wheelLight.position.set(0, 0.02, side * 0.34);
  steer.add(wheelLight);

  const tire = addMesh(
    new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 64, 1, false),
    mats.rubber,
    spin
  );
  tire.rotation.x = Math.PI / 2;

  for (const face of [-1, 1]) {
    const sidewall = addMesh(tireSideGeometry, mats.rubber, spin);
    sidewall.position.z = face * (wheelWidth / 2 - 0.018);
    sidewall.castShadow = true;
  }

  const barrel = addMesh(
    new THREE.CylinderGeometry(0.303, 0.303, wheelWidth - 0.045, 48, 1, true),
    mats.rimDark,
    spin
  );
  barrel.rotation.x = Math.PI / 2;

  for (const face of [-1, 1]) {
    const faceZ = face * (wheelWidth / 2 + 0.002);

    const lip = addMesh(rimFaceGeometry, mats.chrome, spin);
    lip.position.z = faceZ;

    const glowRing = addMesh(rimGlowGeometry, mats.cyanGlow, spin, { castShadow: false });
    glowRing.position.z = faceZ + face * 0.008;

    const glowHalo = addMesh(rimHaloGeometry, mats.cyanSoft, spin, { castShadow: false });
    glowHalo.position.z = faceZ + face * 0.012;

    for (let i = 0; i < 12; i += 1) {
      const angle = (i / 12) * Math.PI * 2;
      const spoke = addMesh(spokeGeometry, mats.rim, spin);
      spoke.position.z = faceZ;
      spoke.rotation.z = angle + 0.14;
      spoke.rotation.x = face * 0.02;
    }

    const disc = addMesh(brakeDiscGeometry, mats.rimDark, spin, { castShadow: false });
    disc.position.z = face * 0.082;
    disc.rotation.y = face > 0 ? 0 : Math.PI;
    disc.material.side = THREE.DoubleSide;

    const caliper = addMesh(new THREE.BoxGeometry(0.055, 0.16, 0.055), mats.caliper, spin, {
      castShadow: false,
    });
    caliper.position.set(-0.05, 0.21, face * 0.1);
    caliper.rotation.z = -0.18;

    const hub = addMesh(new THREE.CylinderGeometry(0.05, 0.06, 0.034, 28), mats.chrome, spin, {
      castShadow: false,
    });
    hub.rotation.x = Math.PI / 2;
    hub.position.z = faceZ + face * 0.012;

    const hubGlow = addMesh(new THREE.CylinderGeometry(0.02, 0.02, 0.037, 20), mats.cyanGlow, spin, {
      castShadow: false,
    });
    hubGlow.rotation.x = Math.PI / 2;
    hubGlow.position.z = faceZ + face * 0.033;
  }

  return { steer, spin };
}

for (const x of [-wheelX, wheelX]) {
  for (const side of [-1, 1]) {
    const { steer, spin } = createWheel(side);
    steer.position.set(x, wheelY, side * wheelZ);
    steer.rotation.y = x > 0 ? 0.035 : 0;
    carRoot.add(steer);
    wheels.push({
      steer,
      spin,
      front: x > 0,
      side,
      baseYaw: steer.rotation.y,
      speed: 0.18 + Math.random() * 0.04,
    });

    // Wheel arch: a shallow body-colour blister wraps over the tyre,
    // with a carbon lip at its outer edge. This gives the body a proper
    // closed-wheel silhouette without hiding the turbine rim.
    const fenderRadius = wheelRadius + 0.125;
    const fenderDepth = wheelWidth + 0.05;
    const fenderGeometry = new THREE.CylinderGeometry(
      fenderRadius,
      fenderRadius,
      fenderDepth,
      40,
      1,
      true,
      0,
      Math.PI
    );
    fenderGeometry.rotateX(Math.PI / 2);
    fenderGeometry.rotateZ(Math.PI / 2);
    const fender = addMesh(fenderGeometry, mats.paint, carRoot);
    fender.position.set(x, wheelY, side * (wheelZ + 0.015));

    const fenderCap = addMesh(
      new THREE.RingGeometry(wheelRadius + 0.065, fenderRadius, 44, 1, 0, Math.PI),
      mats.paint,
      carRoot
    );
    fenderCap.position.set(x, wheelY + 0.002, side * (wheelZ + 0.015 + fenderDepth / 2 - 0.006));
    fenderCap.rotation.y = side < 0 ? Math.PI : 0;

    const fenderLip = addMesh(
      new THREE.TorusGeometry(fenderRadius, 0.006, 5, 52, Math.PI),
      mats.carbon,
      carRoot,
      { castShadow: false }
    );
    fenderLip.position.set(x, wheelY, side * (wheelZ + 0.015 + fenderDepth / 2 - 0.003));
  }
}

/* ----------------------------- front aero --------------------------- */

const frontSplitter = addMesh(new THREE.BoxGeometry(0.55, 0.032, 1.96), mats.carbon, carRoot);
frontSplitter.position.set(2.52, 0.1, 0);
frontSplitter.rotation.z = -0.018;

// Lower bumper / front intake that ties the splitter into the nose.
const lowerBumper = addMesh(new THREE.BoxGeometry(0.3, 0.2, 1.4), mats.carbonDark, carRoot);
lowerBumper.position.set(2.41, 0.22, 0);
lowerBumper.rotation.z = -0.06;
for (let i = -1; i <= 1; i += 1) {
  const brow = addMesh(new THREE.BoxGeometry(0.012, 0.014, 1.02), mats.chrome, carRoot, {
    castShadow: false,
  });
  brow.position.set(2.563, 0.245 + i * 0.052, 0);
  brow.rotation.z = -0.06;
}

for (const side of [-1, 1]) {
  const canard = addMesh(new THREE.BoxGeometry(0.25, 0.014, 0.22), mats.carbon, carRoot);
  canard.position.set(2.41, 0.17, side * 0.87);
  canard.rotation.y = side * 0.3;
  canard.rotation.z = -0.1;

  const endplate = addMesh(new THREE.BoxGeometry(0.16, 0.09, 0.012), mats.carbonDark, carRoot);
  endplate.position.set(2.49, 0.125, side * 0.965);

  const splitterStrut = addMesh(new THREE.BoxGeometry(0.15, 0.11, 0.012), mats.carbonDark, carRoot);
  splitterStrut.position.set(2.56, 0.155, side * 0.58);
  splitterStrut.rotation.z = -0.1;

  const intake = addMesh(new THREE.BoxGeometry(0.22, 0.13, 0.34), mats.blackTrim, carRoot);
  intake.position.set(2.29, 0.29, side * 0.67);
  intake.rotation.z = -0.08;

  const intakeGlow = addMesh(new THREE.BoxGeometry(0.007, 0.05, 0.27), mats.cyanSoft, carRoot, {
    castShadow: false,
  });
  intakeGlow.position.set(2.405, 0.292, side * 0.67);
  intakeGlow.rotation.z = -0.08;
}

// Headlight blades.
for (const side of [-1, 1]) {
  const mainCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(2.48, 0.485, side * 0.26),
    new THREE.Vector3(2.42, 0.555, side * 0.44),
    new THREE.Vector3(2.27, 0.635, side * 0.65),
    new THREE.Vector3(2.06, 0.665, side * 0.8),
    new THREE.Vector3(1.88, 0.672, side * 0.855),
  ]);
  addMesh(new THREE.TubeGeometry(mainCurve, 48, 0.009, 5, false), mats.headlight, carRoot, {
    castShadow: false,
  });

  const branchCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(2.27, 0.635, side * 0.65),
    new THREE.Vector3(2.21, 0.57, side * 0.82),
    new THREE.Vector3(2.13, 0.51, side * 0.92),
  ]);
  addMesh(new THREE.TubeGeometry(branchCurve, 24, 0.006, 4, false), mats.headlight, carRoot, {
    castShadow: false,
  });
}

// Front lip accent.
const lipAccent = addMesh(new THREE.BoxGeometry(0.012, 0.008, 1.45), mats.cyanSoft, carRoot, {
  castShadow: false,
});
lipAccent.position.set(2.785, 0.092, 0);

/* ----------------------------- side details ------------------------- */

for (const side of [-1, 1]) {
  const sideSkirt = addMesh(new THREE.BoxGeometry(3.45, 0.045, 0.12), mats.carbon, carRoot);
  sideSkirt.position.set(-0.12, 0.125, side * 1.015);
  sideSkirt.rotation.z = -0.01;

  const skirtLight = addMesh(new THREE.BoxGeometry(2.95, 0.005, 0.008), mats.cyanSoft, carRoot, {
    castShadow: false,
  });
  skirtLight.position.set(-0.15, 0.11, side * 1.076);

  const blade = addMesh(new THREE.BoxGeometry(0.95, 0.026, 0.22), mats.carbon, carRoot);
  blade.position.set(-1.13, 0.285, side * 1.075);
  blade.rotation.z = -0.05;
  blade.rotation.x = side * 0.04;

  const intakeShape = new THREE.Shape();
  intakeShape.moveTo(-0.94, 0.35);
  intakeShape.bezierCurveTo(-0.72, 0.68, -0.5, 0.78, -0.18, 0.79);
  intakeShape.bezierCurveTo(-0.3, 0.58, -0.38, 0.41, -0.54, 0.32);
  intakeShape.closePath();
  const intakePanel = addMesh(new THREE.ShapeGeometry(intakeShape, 24), mats.carbonDark, carRoot);
  intakePanel.position.z = side * 0.955;
  intakePanel.material = mats.carbonDark;
  intakePanel.scale.z = side;

  const intakeEdge = addMesh(new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.94, 0.35, side * 0.962),
      new THREE.Vector3(-0.72, 0.68, side * 0.962),
      new THREE.Vector3(-0.39, 0.775, side * 0.962),
    ]),
    24,
    0.007,
    4,
    false
  ), mats.cyanSoft, carRoot, { castShadow: false });
  intakeEdge.castShadow = false;

  // Side accent blade that catches the light.
  const accentCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.88, 0.33, side * 0.93),
    new THREE.Vector3(-1.2, 0.34, side * 0.965),
    new THREE.Vector3(-0.3, 0.37, side * 0.94),
    new THREE.Vector3(0.7, 0.4, side * 0.91),
    new THREE.Vector3(1.6, 0.43, side * 0.85),
  ]);
  addMesh(new THREE.TubeGeometry(accentCurve, 52, 0.0045, 4, false), mats.cyanSoft, carRoot, {
    castShadow: false,
  });
}

// Camera mirrors.
for (const side of [-1, 1]) {
  const stalk = addMesh(new THREE.CylinderGeometry(0.011, 0.016, 0.18, 6), mats.blackTrim, carRoot);
  stalk.position.set(0.83, 0.91, side * 0.86);
  stalk.rotation.z = -0.48;
  stalk.rotation.x = side * 0.12;

  const pod = addMesh(new THREE.SphereGeometry(1, 18, 12), mats.carbon, carRoot);
  pod.scale.set(0.13, 0.052, 0.084);
  pod.position.set(0.79, 0.975, side * 0.9);
  pod.rotation.z = -0.08;

  const podLight = addMesh(new THREE.BoxGeometry(0.008, 0.008, 0.05), mats.cyanGlow, carRoot, {
    castShadow: false,
  });
  podLight.position.set(0.84, 0.972, side * 0.965);
}

/* ----------------------------- rear aero ---------------------------- */

// Tail fascia plate.
const tailPlate = addMesh(new THREE.BoxGeometry(0.035, 0.44, 1.33), mats.blackTrim, carRoot);
tailPlate.position.set(-2.435, 0.54, 0);
tailPlate.rotation.z = 0.01;

// Full-width rear light bar + vertical light blades.
const tailBar = addMesh(new THREE.BoxGeometry(0.02, 0.035, 1.38), mats.tailLight, carRoot, {
  castShadow: false,
});
tailBar.position.set(-2.459, 0.68, 0);

for (let i = -3; i <= 3; i += 1) {
  const bar = addMesh(new THREE.BoxGeometry(0.018, 0.1, 0.022), mats.tailLight, carRoot, {
    castShadow: false,
  });
  bar.position.set(-2.458, 0.635, i * 0.185);
}

for (const side of [-1, 1]) {
  const rearIntake = addMesh(new THREE.BoxGeometry(0.22, 0.18, 0.28), mats.blackTrim, carRoot);
  rearIntake.position.set(-2.27, 0.39, side * 0.55);

  const rearLightBlade = addMesh(new THREE.BoxGeometry(0.012, 0.013, 0.32), mats.tailLight, carRoot, {
    castShadow: false,
  });
  rearLightBlade.position.set(-2.38, 0.56, side * 0.58);
  rearLightBlade.rotation.x = 0.08;
}

// Diffuser.
const diffuser = addMesh(new THREE.BoxGeometry(0.8, 0.035, 1.55), mats.carbon, carRoot);
diffuser.position.set(-2.25, 0.12, 0);
diffuser.rotation.z = 0.15;

for (let i = -2; i <= 2; i += 1) {
  const fin = addMesh(new THREE.BoxGeometry(0.62, 0.16, 0.014), mats.carbon, carRoot);
  fin.position.set(-2.28, 0.19, i * 0.3);
  fin.rotation.z = 0.14;
}

// Carbon ducktail lip.
const ducktail = addMesh(new THREE.BoxGeometry(0.52, 0.025, 1.5), mats.carbon, carRoot);
ducktail.position.set(-2.3, 0.82, 0);
ducktail.rotation.z = -0.16;

// Active rear wing assembly.
const wingRoot = new THREE.Group();
wingRoot.position.set(-2.3, 1.12, 0);
carRoot.add(wingRoot);

const airfoil = new THREE.Shape();
airfoil.moveTo(-0.36, -0.012);
airfoil.bezierCurveTo(-0.32, 0.062, -0.12, 0.082, 0.12, 0.066);
airfoil.bezierCurveTo(0.3, 0.054, 0.37, 0.028, 0.38, 0.002);
airfoil.lineTo(0.3, -0.014);
airfoil.bezierCurveTo(0.08, 0.002, -0.2, 0.01, -0.36, -0.012);
airfoil.closePath();

const wingGeometry = new THREE.ExtrudeGeometry(airfoil, {
  depth: 1.82,
  bevelEnabled: true,
  bevelSize: 0.007,
  bevelThickness: 0.007,
  bevelSegments: 1,
  steps: 1,
  curveSegments: 20,
});
wingGeometry.translate(0, 0, -0.91);
const wing = addMesh(wingGeometry, mats.carbon, wingRoot);

const endplateShape = new THREE.Shape();
endplateShape.moveTo(-0.43, -0.07);
endplateShape.lineTo(0.4, -0.04);
endplateShape.quadraticCurveTo(0.47, 0.06, 0.37, 0.16);
endplateShape.lineTo(-0.32, 0.22);
endplateShape.quadraticCurveTo(-0.47, 0.09, -0.43, -0.07);
endplateShape.closePath();

for (const side of [-1, 1]) {
  const endplateGeometry = new THREE.ExtrudeGeometry(endplateShape, {
    depth: 0.018,
    bevelEnabled: true,
    bevelSize: 0.004,
    bevelThickness: 0.004,
    bevelSegments: 1,
    steps: 1,
    curveSegments: 16,
  });
  const endplate = addMesh(endplateGeometry, mats.carbon, wingRoot);
  endplate.position.set(0, 0, side * 0.932 - 0.009);

  const endplateGlow = addMesh(new THREE.BoxGeometry(0.52, 0.004, 0.004), mats.cyanSoft, wingRoot, {
    castShadow: false,
  });
  endplateGlow.position.set(0.02, 0.188, side * 0.94);
}

const wingGlow = addMesh(new THREE.BoxGeometry(0.008, 0.006, 1.76), mats.cyanGlow, wingRoot, {
  castShadow: false,
});
wingGlow.position.set(0.372, 0.008, 0);

for (const side of [-1, 1]) {
  const mountCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.9, 0.79, side * 0.56),
    new THREE.Vector3(-2.05, 0.94, side * 0.6),
    new THREE.Vector3(-2.22, 1.06, side * 0.62),
    new THREE.Vector3(-2.28, 1.1, side * 0.62),
  ]);
  addMesh(new THREE.TubeGeometry(mountCurve, 32, 0.027, 8, false), mats.carbon, carRoot);
}

// underbody tray
const underTray = addMesh(new THREE.BoxGeometry(4.3, 0.035, 1.5), mats.carbonDark, carRoot);
underTray.position.set(-0.05, 0.125, 0);

/* ----------------------------- internal xray chassis ---------------- */

const internals = new THREE.Group();
internals.visible = false;
carRoot.add(internals);

const railGeometry = new THREE.BoxGeometry(3.8, 0.045, 0.055);
for (const side of [-1, 1]) {
  const rail = addMesh(railGeometry, mats.xraySolid, internals, { castShadow: false });
  rail.position.set(-0.1, 0.27, side * 0.38);
}

for (let i = 0; i < 7; i += 1) {
  const x = -1.65 + i * 0.55;
  const cross = addMesh(new THREE.BoxGeometry(0.035, 0.035, 0.82), mats.xraySolid, internals, {
    castShadow: false,
  });
  cross.position.set(x, 0.275, 0);
}

const battery = addMesh(new THREE.BoxGeometry(1.72, 0.14, 1.15), mats.xraySolid, internals, {
  castShadow: false,
});
battery.position.set(-0.04, 0.255, 0);

for (const side of [-1, 1]) {
  const motor = addMesh(new THREE.CylinderGeometry(0.16, 0.16, 0.34, 20), mats.xraySolid, internals, {
    castShadow: false,
  });
  motor.rotation.z = Math.PI / 2;
  motor.position.set(-1.93, 0.35, side * 0.3);

  const suspensionPoints = [
    [new THREE.Vector3(-1.53, 0.3, side * 0.4), new THREE.Vector3(-1.53, 0.46, side * 0.94)],
    [new THREE.Vector3(-1.53, 0.58, side * 0.4), new THREE.Vector3(-1.53, 0.5, side * 0.94)],
    [new THREE.Vector3(1.53, 0.3, side * 0.4), new THREE.Vector3(1.53, 0.46, side * 0.94)],
    [new THREE.Vector3(1.53, 0.58, side * 0.4), new THREE.Vector3(1.53, 0.5, side * 0.94)],
  ];
  suspensionPoints.forEach(([a, b]) => addRod(a, b, 0.012, mats.xraySolid, internals, 5));

  const upright = addMesh(new THREE.BoxGeometry(0.08, 0.34, 0.07), mats.xraySolid, internals, {
    castShadow: false,
  });
  upright.position.set(1.53, 0.46, side * 0.94);
}

const scanRing = new THREE.Mesh(
  new THREE.TorusGeometry(2.5, 0.008, 5, 96),
  new THREE.MeshBasicMaterial({
    color: 0x62ecff,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  })
);
scanRing.rotation.x = Math.PI / 2;
scanRing.position.y = 0.4;
scanRing.visible = false;
carRoot.add(scanRing);

/* ----------------------------- xray wireframe ----------------------- */

const wireGroup = new THREE.Group();
wireGroup.visible = false;
carRoot.add(wireGroup);

const bodyWire = new THREE.LineSegments(buildBodyWireGeometry(), mats.xrayLine);
wireGroup.add(bodyWire);

const bodyWireAccent = new THREE.LineSegments(buildBodyWireGeometry(), mats.xrayLineBright);
bodyWireAccent.material = mats.xrayLineBright.clone();
bodyWireAccent.material.opacity = 0.16;
bodyWireAccent.scale.set(1.002, 1.002, 1.002);
wireGroup.add(bodyWireAccent);

const canopyWire = new THREE.LineSegments(buildCanopyWireGeometry(), mats.xrayLine);
wireGroup.add(canopyWire);

// Mechanical / exterior parts get clean edge overlays.
const partWire = new THREE.Group();
wireGroup.add(partWire);
[frontSplitter, ducktail, diffuser].forEach((target) => {
  if (!target) return;
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(target.geometry, 24), mats.xrayLine);
  edges.position.copy(target.position);
  edges.rotation.copy(target.rotation);
  edges.scale.copy(target.scale);
  partWire.add(edges);
});

// The wing lives under the animated wing root, so its wireframe must too.
const wingEdge = new THREE.LineSegments(new THREE.EdgesGeometry(wingGeometry, 20), mats.xrayLineBright);
wingEdge.visible = false;
wingRoot.add(wingEdge);

/* ------------------------------------------------------------------ */
/* UI state                                                           */
/* ------------------------------------------------------------------ */

const ghostMaterials = [
  { material: mats.paint, opacity: 0.085, transparent: true },
  { material: mats.carbon, opacity: 0.14, transparent: true },
  { material: mats.carbonDark, opacity: 0.12, transparent: true },
  { material: mats.glass, opacity: 0.07, transparent: true },
  { material: mats.blackTrim, opacity: 0.12, transparent: true },
];

function setXray(enabled) {
  state.xray = enabled;
  document.body.classList.toggle('xray-mode', enabled);
  wireGroup.visible = enabled;
  wingEdge.visible = enabled;
  internals.visible = enabled;
  scanRing.visible = enabled;

  ghostMaterials.forEach(({ material, opacity, transparent }) => {
    material.transparent = enabled ? transparent : material === mats.glass;
    material.opacity = enabled ? opacity : (material === mats.glass ? 0.965 : 1);
    material.depthWrite = !enabled;
    material.needsUpdate = true;
  });

  if (body.material === mats.paint) {
    body.castShadow = !enabled;
  }

  dom.viewSolid.classList.toggle('is-active', !enabled);
  dom.viewXray.classList.toggle('is-active', enabled);
  dom.viewSolid.setAttribute('aria-pressed', String(!enabled));
  dom.viewXray.setAttribute('aria-pressed', String(enabled));
}

function setAutoRotate(enabled) {
  state.autoRotate = enabled;
  dom.turntable.setAttribute('aria-pressed', String(enabled));
}

function setWingDeployed(enabled) {
  state.wingUp = enabled;
  dom.wing.setAttribute('aria-pressed', String(enabled));
}

function applyPaint(color, name, button) {
  state.paintTarget.set(color);
  dom.paintName.textContent = name;
  $$('.swatch').forEach((swatch) => {
    const active = swatch === button;
    swatch.classList.toggle('is-active', active);
    swatch.setAttribute('aria-pressed', String(active));
  });
}

$$('.swatch').forEach((button) => {
  button.addEventListener('click', () => {
    applyPaint(button.dataset.color, button.dataset.name, button);
  });
});

dom.viewSolid.addEventListener('click', () => setXray(false));
dom.viewXray.addEventListener('click', () => setXray(true));
dom.turntable.addEventListener('click', () => setAutoRotate(!state.autoRotate));
dom.wing.addEventListener('click', () => setWingDeployed(!state.wingUp));

let cameraReturn = null;

function resetView() {
  const home = getHomeView();
  cameraReturn = {
    from: camera.position.clone(),
    to: home.position,
    fromTarget: controls.target.clone(),
    toTarget: home.target,
    start: performance.now(),
    duration: 950,
  };
}

$$('[data-reset]').forEach((element) => {
  element.addEventListener('click', (event) => {
    if (element.tagName === 'A') event.preventDefault();
    resetView();
  });
});

$('#resetView').addEventListener('click', resetView);

$('#fullscreen').addEventListener('click', async () => {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (error) {
    // Browsers can deny fullscreen; the page remains fully usable.
  }
});

renderer.domElement.addEventListener('pointerdown', () => {
  state.draggingUntil = performance.now() + 3200;
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && state.xray) setXray(false);
});

setAutoRotate(state.autoRotate);
setWingDeployed(true);

/* ------------------------------------------------------------------ */
/* Hotspots                                                           */
/* ------------------------------------------------------------------ */

const hotspotDefinitions = [
  { id: 'wing', local: new THREE.Vector3(-2.22, 1.46, 0.68) },
  { id: 'wheel', local: new THREE.Vector3(1.53, 0.57, 1.2) },
  { id: 'body', local: new THREE.Vector3(0.55, 0.88, -0.7) },
];

const hotspots = hotspotDefinitions.map((definition) => ({
  ...definition,
  element: $(`[data-hotspot="${definition.id}"]`),
  visible: false,
}));

const projectionVector = new THREE.Vector3();
const cameraSpaceVector = new THREE.Vector3();

function updateHotspots() {
  const allow = !state.xray && viewport.width > 1180;
  if (!allow) {
    hotspots.forEach((hotspot) => {
      hotspot.element.classList.remove('is-visible');
      hotspot.visible = false;
    });
    return;
  }

  hotspots.forEach((hotspot) => {
    projectionVector.copy(hotspot.local);
    stage.localToWorld(projectionVector);
    cameraSpaceVector.copy(projectionVector).applyMatrix4(camera.matrixWorldInverse);

    if (cameraSpaceVector.z > -1) {
      hotspot.element.classList.remove('is-visible');
      hotspot.visible = false;
      return;
    }

    projectionVector.project(camera);
    const x = (projectionVector.x * 0.5 + 0.5) * viewport.width;
    const y = (-projectionVector.y * 0.5 + 0.5) * viewport.height;
    const onScreen = x > 24 && x < viewport.width - 24 && y > 100 && y < viewport.height - 76;

    if (!onScreen || projectionVector.z > 1) {
      hotspot.element.classList.remove('is-visible');
      hotspot.visible = false;
      return;
    }

    hotspot.element.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
    hotspot.element.classList.toggle('is-flipped', x > viewport.width * 0.58);
    hotspot.element.classList.add('is-visible');
    hotspot.visible = true;
  });
}

/* ------------------------------------------------------------------ */
/* Resize                                                             */
/* ------------------------------------------------------------------ */

function resize() {
  viewport.width = window.innerWidth;
  viewport.height = window.innerHeight;
  const nextTier = getCameraTier(viewport.width, viewport.height);
  homeView = getHomeView();
  camera.aspect = viewport.width / viewport.height;
  camera.fov = homeView.fov;
  camera.updateProjectionMatrix();

  if (nextTier !== lastCameraTier) {
    lastCameraTier = nextTier;
    camera.position.copy(homeView.position);
    controls.target.copy(homeView.target);
    cameraReturn = null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, viewport.width < 760 ? 1.45 : 1.85));
  renderer.setSize(viewport.width, viewport.height);
  composer.setSize(viewport.width, viewport.height);
  if (typeof composer.setPixelRatio === 'function') {
    composer.setPixelRatio(Math.min(window.devicePixelRatio || 1, viewport.width < 760 ? 1.45 : 1.85));
  }
}

window.addEventListener('resize', resize);

/* ------------------------------------------------------------------ */
/* Loader                                                             */
/* ------------------------------------------------------------------ */

let progress = 0;
const progressTimer = window.setInterval(() => {
  progress = Math.min(92, progress + Math.random() * 13);
  if (dom.loaderBar) dom.loaderBar.style.width = `${progress.toFixed(0)}%`;
  if (dom.loaderPercent) dom.loaderPercent.textContent = String(Math.round(progress)).padStart(2, '0');
}, 130);

function finishLoader() {
  progress = 100;
  if (dom.loaderBar) dom.loaderBar.style.width = '100%';
  if (dom.loaderPercent) dom.loaderPercent.textContent = '100';
  window.clearInterval(progressTimer);
  window.setTimeout(() => {
    dom.loader?.classList.add('is-done');
    window.setTimeout(() => {
      if (dom.loader) dom.loader.style.display = 'none';
    }, 1000);
  }, 520);
}

/* ------------------------------------------------------------------ */
/* Animation                                                          */
/* ------------------------------------------------------------------ */

const clock = new THREE.Clock();
const initialWingRotation = -0.14;
const retractedWingRotation = 0.1;
const hudLabels = $$('.hud-label');
let elapsed = 0;
let lastHudUpdate = 0;
let firstFrame = true;

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);
  elapsed += delta;

  const now = performance.now();
  const autoAllowed = state.autoRotate && (now > state.draggingUntil || !state.draggingUntil);
  if (autoAllowed) {
    stage.rotation.y += delta * (state.xray ? 0.105 : 0.15);
  }

  // Smoothly return the camera after a reset.
  if (cameraReturn) {
    const t = Math.min(1, (now - cameraReturn.start) / cameraReturn.duration);
    const eased = 1 - Math.pow(1 - t, 3);
    camera.position.lerpVectors(cameraReturn.from, cameraReturn.to, eased);
    controls.target.lerpVectors(cameraReturn.fromTarget, cameraReturn.toTarget, eased);
    if (t >= 1) cameraReturn = null;
  }

  controls.update();

  // Paint colour cross-fade.
  mats.paint.color.lerp(state.paintTarget, 0.09);

  // Wing deploy / retract.
  const wingTarget = state.wingUp ? initialWingRotation : retractedWingRotation;
  wingRoot.rotation.z += (wingTarget - wingRoot.rotation.z) * Math.min(1, delta * 4.2);
  wingRoot.position.y += ((state.wingUp ? 1.12 : 1.18) - wingRoot.position.y) * Math.min(1, delta * 4.2);

  // Turbine wheels keep a slow, elegant rotation.
  wheels.forEach((wheel, index) => {
    wheel.spin.rotation.z += delta * (state.xray ? 0.42 : 0.19) * (wheel.side > 0 ? 1 : -1);
    const sway = Math.sin(elapsed * 0.42 + index * 1.7) * 0.008;
    wheel.steer.rotation.y = wheel.baseYaw + (wheel.front ? sway : 0);
  });

  // Scan ring sweep.
  if (state.xray) {
    scanRing.position.y = 0.18 + (Math.sin(elapsed * 0.75) * 0.5 + 0.5) * 1.45;
    scanRing.material.opacity = 0.12 + Math.sin(elapsed * 1.5) * 0.05;
    bodyWireAccent.material.opacity = 0.13 + Math.sin(elapsed * 2) * 0.035;
    internals.rotation.y = Math.sin(elapsed * 0.25) * 0.008;
  }

  // Camera-space dust drift.
  dust.rotation.y += delta * 0.008;
  dust.position.y = Math.sin(elapsed * 0.16) * 0.06;

  // Redraw the turntable HUD only a few times per second.
  if (now - lastHudUpdate > 80) {
    const degrees = ((stage.rotation.y * 180) / Math.PI) % 360;
    const normalized = (degrees + 360) % 360;
    if (dom.rotationBar) dom.rotationBar.style.width = `${(normalized / 360) * 100}%`;
    if (dom.rotationValue) dom.rotationValue.textContent = `${String(Math.round(normalized)).padStart(3, '0')}°`;

    if (hudLabels.length === 3) {
      hudLabels[0].textContent = `X ${camera.position.x.toFixed(3)}`;
      hudLabels[1].textContent = `Y ${camera.position.y.toFixed(3)}`;
      hudLabels[2].textContent = `Z ${camera.position.z.toFixed(3)}`;
    }
    lastHudUpdate = now;
  }

  updateHotspots();
  composer.render();

  if (firstFrame) {
    firstFrame = false;
    finishLoader();
  }
}

window.__AERONOVA__ = {
  scene,
  camera,
  renderer,
  stage,
  carRoot,
  body,
  wings: wingRoot,
  wheels,
  materials: mats,
  setXray,
  setAutoRotate,
  setWingDeployed,
  applyPaint,
  composer,
  bloomPass,
  controls,
  keyLight,
  topLight,
  rimLight,
  coolRim,
  frontFill,
  rearFill,
};

animate();
