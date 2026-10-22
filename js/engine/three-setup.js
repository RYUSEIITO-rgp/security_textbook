/* three.js の初期化、マテリアル・看板の生成 */
"use strict";

/* ============================================================
   three.js 基本
   ============================================================ */
var renderer, scene, camera, clock;
var W = window.innerWidth,
  H = window.innerHeight;

function initThree() {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance"
  });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  $('#app').appendChild(renderer.domElement);

  scene = new THREE.Scene();
  var bg = new THREE.Color(0xb9ddf2);
  scene.background = bg;
  scene.fog = new THREE.FogExp2(0xc5e0ef, 0.004);

  camera = new THREE.PerspectiveCamera(58, W / H, 0.1, 400);
  clock = new THREE.Clock();

  // lights
  var amb = new THREE.AmbientLight(0xe3f2ff, .8);
  scene.add(amb);
  var hemi = new THREE.HemisphereLight(0xe7f5ff, 0x859c77, 2.6);
  scene.add(hemi);
  var moon = new THREE.DirectionalLight(0xfff2d4, 3.1);
  moon.position.set(-40, 70, 30);
  moon.castShadow = true;
  moon.shadow.mapSize.set(2048, 2048);
  var d = 70;
  moon.shadow.camera.left = -d;
  moon.shadow.camera.right = d;
  moon.shadow.camera.top = d;
  moon.shadow.camera.bottom = -d;
  moon.shadow.camera.near = 1;
  moon.shadow.camera.far = 220;
  moon.shadow.bias = -0.0004;
  scene.add(moon);
  // subtle magenta rim fill
  var rim = new THREE.DirectionalLight(0xdbeeff, .3);
  rim.position.set(50, 20, -30);
  scene.add(rim);

  window.addEventListener('resize', onResize);
}

function onResize() {
  W = window.innerWidth;
  H = window.innerHeight;
  renderer.setSize(W, H);
  camera.aspect = W / H;
  camera.updateProjectionMatrix();
}

/* ---- マテリアル生成 ---- */
function mat(color, rough, metal, emissive, emI) {
  var m = new THREE.MeshStandardMaterial({
    color: color,
    roughness: rough == null ? .85 : rough,
    metalness: metal == null ? 0 : metal
  });
  if (emissive != null) {
    m.emissive = new THREE.Color(emissive);
    m.emissiveIntensity = emI == null ? 1 : emI;
  }
  return m;
}

function box(w, h, d, material) {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
}

/* ---- サイン看板（canvasテクスチャ発光板） ---- */
function makeSign(text, hex, w, h) {
  var cv = document.createElement('canvas');
  cv.width = 512;
  cv.height = 160;
  var c = cv.getContext('2d');
  c.fillStyle = 'rgba(2,6,12,0.0)';
  c.fillRect(0, 0, 512, 160);
  var fontSize = 92;
  c.font = '700 ' + fontSize + 'px sans-serif';
  while (fontSize > 32 && c.measureText(text).width > 460) {
    fontSize -= 2;
    c.font = '700 ' + fontSize + 'px sans-serif';
  }
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.shadowColor = hex;
  c.shadowBlur = 36;
  c.fillStyle = hex;
  c.fillText(text, 256, 84);
  c.shadowBlur = 14;
  c.fillStyle = '#ffffff';
  c.fillText(text, 256, 84);
  var tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  var m = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true
  });
  var mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  return mesh;
}
