/* 街並み・建物・コライダー（当たり判定） */
"use strict";

/* ============================================================
   コライダー / ワールド
   ============================================================ */
var colliders = []; // {x0,z0,x1,z1}
function addCollider(x0, z0, x1, z1) {
  colliders.push({
    x0: Math.min(x0, x1),
    z0: Math.min(z0, z1),
    x1: Math.max(x0, x1),
    z1: Math.max(z0, z1)
  });
}

function wall(x0, z0, x1, z1, h, material, noCol) {
  var cx = (x0 + x1) / 2,
    cz = (z0 + z1) / 2;
  var w = Math.max(Math.abs(x1 - x0), 0.4),
    d = Math.max(Math.abs(z1 - z0), 0.4);
  var m = box(w, h, d, material);
  m.position.set(cx, h / 2, cz);
  m.castShadow = true;
  m.receiveShadow = true;
  scene.add(m);
  if (!noCol) addCollider(x0, z0, x1, z1);
  return m;
}

var neonLights = [];

function neonPlane(text, hex, w, h, x, y, z, ry) {
  var s = makeSign(text, hex, w, h);
  s.position.set(x, y, z);
  if (ry) s.rotation.y = ry;
  scene.add(s);
  // backing glow
  var g = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.05, h * 1.1),
    new THREE.MeshBasicMaterial({
      color: hex,
      transparent: true,
      opacity: .12
    }));
  g.position.set(x, y, z + (ry ? 0 : -0.02));
  if (ry) g.rotation.y = ry;
  scene.add(g);
  return s;
}

function buildWorld() {
  const worldGroup = new THREE.Group();
  scene.add(worldGroup);
  const cityColliders = [],
    points = [],
    markers = [];

  function box(w, h, d, color, x, y, z, parent = worldGroup, rough = .8) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({
      color,
      roughness: rough
    }));
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m
  }

  function cylinder(rt, rb, h, color, x, y, z, parent = worldGroup, sides = 12) {
    let m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, sides), new THREE.MeshStandardMaterial({
      color,
      roughness: .8
    }));
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m
  }

  function sphere(r, color, x, y, z, parent = worldGroup) {
    let m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), new THREE.MeshStandardMaterial({
      color,
      roughness: .7
    }));
    m.position.set(x, y, z);
    m.castShadow = true;
    parent.add(m);
    return m
  }

  function glowBox(w, h, d, color, x, y, z, parent = worldGroup) {
    let m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({
      color
    }));
    m.position.set(x, y, z);
    parent.add(m);
    return m
  }

  function collider(x, z, w, d) {
    cityColliders.push({
      x,
      z,
      w,
      d
    })
  }

  function wall(x, z, w, d, height = 1.35, color = 0x8ca7b5) {
    box(w, height, d, color, x, height / 2, z);
    collider(x, z, w, d)
  }

  function label(text, x, y, z, color = '#c8ebef', size = 1.6, width = 512) {
    const c = document.createElement('canvas');
    c.width = width;
    c.height = 128;
    let q = c.getContext('2d');
    q.font = 'bold 47px sans-serif';
    q.textAlign = 'center';
    q.textBaseline = 'middle';
    q.shadowColor = color;
    q.shadowBlur = 10;
    q.fillStyle = color;
    q.fillText(text, width / 2, 66);
    const mat = new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(c),
      transparent: true,
      depthWrite: false
    });
    let spr = new THREE.Sprite(mat);
    spr.position.set(x, y, z);
    spr.scale.set(size * 4, size, 1);
    worldGroup.add(spr);
    return spr
  }

  function windowPane(x, y, z, w, h, color = 0x83aab7) {
    return glowBox(w, h, .04, color, x, y, z)
  }

  function character(color, variant = 0, isPolice = false) {
    const g = new THREE.Group();
    const torso = box(.62, .84, .4, isPolice ? 0x224578 : 0x18242c, 0, 1.17, 0, g);
    const head = sphere(.255, isPolice ? 0xe8bc96 : 0x273843, 0, 1.91, 0, g);
    if (!isPolice && variant === 0) {
      sphere(.325, 0x182a33, 0, 1.95, .03, g);
      box(.34, .13, .04, 0x0a1119, 0, 1.94, -.285, g);
      glowBox(.25, .035, .015, color, 0, 1.96, -.31, g)
    } else {
      box(.48, .13, .42, isPolice ? 0x152d55 : color, 0, 2.15, 0, g);
      box(.28, .08, .045, 0x0b1722, 0, 1.95, -.255, g)
    }
    if (variant === 1 && !isPolice) {
      box(.77, .72, .46, 0x293048, 0, .73, .03, g)
    }
    glowBox(.07, .63, .025, color, -.21, 1.2, -.215, g);
    glowBox(.07, .12, .03, color, .19, 1.43, -.22, g);
    const legs = [box(.23, .69, .25, 0x101d27, -.18, .4, 0, g), box(.23, .69, .25, 0x101d27, .18, .4, 0,
      g)];
    const arms = [box(.17, .76, .22, isPolice ? 0x224578 : 0x1b303b, -.43, 1.12, 0, g), box(.17, .76, .22,
      isPolice ? 0x224578 : 0x1b303b, .43, 1.12, 0, g)];
    box(.25, .14, .4, 0x090f15, -.18, .1, -.06, g);
    box(.25, .14, .4, 0x090f15, .18, .1, -.06, g);
    if (isPolice) {
      glowBox(.12, .1, .03, 0xffcc6d, .17, 1.37, -.215, g);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(.47, .035, 6, 24), new THREE.MeshBasicMaterial({
        color: 0xff667b
      }));
      ring.rotation.x = Math.PI / 2;
      ring.position.y = .04;
      g.add(ring)
    }
    g.userData = {
      legs,
      arms
    };
    return g
  }

  function animateCharacter(g, speed, t) {
    g.userData.legs.forEach((l, i) => l.rotation.x = Math.sin(t * 9 + i * Math.PI) * Math.min(speed,
      .55));
    g.userData.arms.forEach((l, i) => l.rotation.x = Math.sin(t * 9 + i * Math.PI + Math.PI) * Math.min(
      speed, .45))
  }

  function desk(x, z, rot = 0, hasPC = true) {
    const d = new THREE.Group();
    d.position.set(x, 0, z);
    d.rotation.y = rot;
    worldGroup.add(d);
    box(1.65, .12, .9, 0x665b48, 0, .87, 0, d);
    for (let a of [-.65, .65])
      for (let b of [-.3, .3]) box(.08, .85, .08, 0x26333a, a, .42, b, d);
    if (hasPC) {
      box(.65, .42, .07, 0x263d49, 0, 1.17, -.15, d);
      glowBox(.56, .32, .015, 0x3e8896, 0, 1.17, -.195, d);
      box(.12, .22, .09, 0x293b47, 0, .94, -.13, d);
      box(.55, .035, .2, 0x22353d, 0, .95, .2, d)
    }
    collider(x, z, 1.8, 1.0);
    return d
  }

  function chair(x, z, rot = 0) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = rot;
    worldGroup.add(g);
    box(.7, .12, .65, 0x293f47, 0, .48, 0, g);
    box(.7, .65, .1, 0x344c55, 0, .8, .28, g);
    for (let a of [-.26, .26])
      for (let b of [-.25, .25]) box(.07, .46, .07, 0x223039, a, .23, b, g)
  }

  function lamp(x, z, color = 0xa0d9e0) {
    cylinder(.06, .1, 4, 0x273c47, x, 2, z);
    box(.9, .12, .36, 0x3d535d, x + .35, 4, z);
    glowBox(.65, .035, .3, color, x + .35, 3.92, z);
    let l = new THREE.PointLight(color, 13, 10, 2);
    l.position.set(x + .35, 3.7, z);
    worldGroup.add(l)
  }

  function plant(x, z) {
    cylinder(.3, .23, .45, 0x394650, x, .23, z);
    for (let i = 0; i < 4; i++) sphere(.32, 0x28534c, x + Math.sin(i * 2) * .2, .7 + i * .16, z + Math
      .cos(i * 2) * .2);
    collider(x, z, .7, .7)
  }

  function beacon(p) {
    const g = new THREE.Group();
    g.position.set(p.x, .06, p.z);
    const ring = new THREE.Mesh(new THREE.RingGeometry(.65, .73, 40), new THREE.MeshBasicMaterial({
      color: p.color,
      transparent: true,
      opacity: .7,
      side: THREE.DoubleSide
    }));
    ring.rotation.x = -Math.PI / 2;
    g.add(ring);
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, 1.5, 8), new THREE
      .MeshBasicMaterial({
        color: p.color,
        transparent: true,
        opacity: .4
      }));
    pillar.position.y = .75;
    g.add(pillar);
    worldGroup.add(g);
    p.beacon = g;
    p.label = label(p.num + ' ' + ({
      mfa: '窓際の社員',
      device: '机のメモ',
      jit: '管理者の端末',
      segment: '協業エリア'
    })[p.id], p.x, 2.65, p.z, '#123f62', .65);
    p.label.material.depthTest = false;
    markers.push(p)
  }

  function buildCity() {
    box(100, .3, 90, 0xb7c8c5, 0, -.22, 0);
    box(10, .03, 65, 0x6c7d85, 0, -.04, 0);
    box(64, .03, 7, 0x6c7d85, 0, -.03, 9);
    for (let z = -26; z < 30; z += 4) glowBox(.11, .02, 1.9, 0x657171, 0, .012, z);
    for (let x = -28; x < 29; x += 4) glowBox(1.9, .02, .1, 0x596b6b, x, .014, 9);
    for (let x = -4.5; x < 4.6; x += 1.15) box(.65, .02, 2.2, 0x9db6b9, x, .025, 5.2);
    // Cafe interior, visible from the street, with an open door.
    box(16, .12, 14, 0xc6b48d, -13, .03, -2);
    wall(-21, -2, .3, 14);
    wall(-5, -2, .3, 14);
    wall(-13, -9, 16, .3, 1.7);
    wall(-18, 5, 6, .3, .9);
    wall(-7, 5, 4, .3, .9);
    box(16, .28, .45, 0x9f8862, -13, 3.0, -9);
    glowBox(16, .06, .06, 0xd8ae6d, -13, 2.78, -8.7);

    for (let x of [-19, -15, -11, -7]) windowPane(x, 1.8, -8.8, 2.5, 1.2, 0x556a70);
    const cafeLight = new THREE.PointLight(0xffc88a, 30, 22, 2);
    cafeLight.position.set(-13, 5, -1);
    worldGroup.add(cafeLight);
    for (const [x, z] of [
        [-17, -4],
        [-9, 0],
        [-18, 1],
        [-8, -5]
      ]) {
      desk(x, z, 0, !(x === -9));
      chair(x, z + 1)
    }
    const emp = makeHumanoid({
      skin: 0xd9a07a,
      top: 0x2f6f8f,
      bottom: 0x222831,
      hair: 0x16120e
    }, false);
    emp.position.set(-8, .04, -3.9);
    emp.rotation.y = Math.PI;
    emp.scale.setScalar(.8);
    emp.visible = true;
    worldGroup.add(emp);
    const memo = box(.48, .015, .3, 0xe9d8a0, -8.8, .95, .18);
    memo.rotation.y = .3;
    box(4, .9, .8, 0x493d32, -18, .5, -7.7);
    plant(-6.2, 3.7);

    // Company: entrance on south, fourth scenario in the deep north wing.
    box(17, .15, 24, 0xa8c2cd, 12, .04, -7);
    wall(3.5, -7, .3, 24, 1.6);
    wall(20.5, -7, .3, 24, 1.6);
    wall(12, -19, 17, .3, 2.5);
    wall(6.5, 5, 6, .3, 1.3);
    wall(17.5, 5, 6, .3, 1.3);
    for (let x of [5, 9, 13, 17, 19]) {
      box(.18, 4, .18, 0x4a6979, x, 2, -19);
      windowPane(x + 1.5, 2, -18.8, 2.6, 2.4, 0x254b66)
    }
    box(17, .3, .4, 0x243f54, 12, 4.5, -19);

    const offLight = new THREE.PointLight(0x93c9ff, 36, 27, 2);
    offLight.position.set(12, 6, -7);
    worldGroup.add(offLight);
    // Interior partition, with broad doorway for collision-safe passage.
    wall(6.5, -7.5, 6, .22, 1.2, 0x3f5868);
    wall(17.7, -7.5, 5.5, .22, 1.2, 0x3f5868);
    glowBox(4.3, .06, .06, 0x6abbe4, 12, .2, -7.5);

    desk(7, -3);
    chair(7, -1.9);
    box(.45, .025, .3, 0x9eaaa6, 8, .95, -2.7);
    desk(17, -3);
    chair(17, -1.9);
    desk(14, -14);
    chair(14, -12.9);
    desk(8, -14);
    chair(8, -12.9);
    box(2, .9, 1, 0x29475a, 18, .5, -16);
    plant(4.7, 3.7);
    plant(19.2, 3.7);

    // Street furniture and collision obstacles create escape routes.
    for (const [x, z] of [
        [-3, 15],
        [3, 19],
        [-3, -13],
        [3, -22],
        [-23, 10],
        [24, 9],
        [-12, 14],
        [15, 14]
      ]) lamp(x, z);
    for (const [x, z] of [
        [-13, 17],
        [12, 18],
        [-23, -13],
        [24, -13],
        [-7, 21],
        [6, 23]
      ]) {
      box(2.4, .65, 1.2, 0x344e56, x, .32, z);
      collider(x, z, 2.6, 1.4);
      sphere(.65, 0x2f5951, x, .9, z)
    }
    for (let i = 0; i < 8; i++) {
      const x = i < 8 ? -29 - (i % 3) * 3 : 29 + (i % 3) * 3;
      const z = -26 + (i % 8) * 8;
      const h = 6 + (i * 7 % 13);
      box(5, h, 5, 0x91a6b3, x, h / 2, z);
      for (let yy = 2; yy < h; yy += 2.1)
        for (let xx = -1.4; xx < 2; xx += 1.4)
          if ((i + Math.round(yy) + Math.round(xx)) % 3 !== 0) windowPane(x + xx, yy, z + 2.53, .55, .8,
            i % 2 ? 0x31586e : 0x6d674c)
    }
    for (let i = 0; i < 9; i++) {
      const x = -28 + i * 7;
      const h = 9 + (i * 5 % 15);
      box(6, h, 5, 0xa0b4bf, x, h / 2, -29);
      for (let y = 3; y < h; y += 2.3)
        for (let xx = -1.8; xx < 2; xx += 1.8) windowPane(x + xx, y, -26.45, .7, .9, i % 3 === 0 ?
          0x9b8863 : 0x3c708b)
    }
    // Parked vehicles leave the central street passable.
    for (const [x, z, c] of [
        [-25, 17, 0x355768],
        [25, 0, 0x526371],
        [23, 20, 0x294355]
      ]) {
      box(2.2, .7, 4, c, x, .65, z);
      box(1.9, .6, 2, 0x182e3a, x, 1.2, z - .1);
      glowBox(.4, .15, .05, 0xffd599, x - .7, .7, z - 2.05);
      glowBox(.4, .15, .05, 0xffd599, x + .7, .7, z - 2.05);
      collider(x, z, 2.5, 4.3)
    }
    points.forEach(beacon);
  }

  buildCity();
  worldGroup.scale.set(.7, 1, .7);
  cityColliders.forEach(o => addCollider((o.x - o.w / 2) * .7, (o.z - o.d / 2) * .7, (o.x + o.w / 2) * .7,
    (o.z + o.d / 2) * .7));
  registerInteract('s1_laptop', new THREE.Vector3(-11.2, 0, -2.8), 1.9, 'Wi-Fiの案内を調べる',
    collectEmployeeLead, {
      marker: 's1'
    });
  registerInteract('s2_memo', new THREE.Vector3(-5.6, 0, 0), 1.9, '机のメモを拾う', collectCredentials, {
    marker: 's2'
  });
  registerInteract('s3_admin', new THREE.Vector3(5.6, 0, -2.1), 1.9, '管理者端末を操作', flowS3, {
    marker: 's3'
  });
  registerInteract('s4_partner', new THREE.Vector3(9.8, 0, -9.1), 1.9, '取引先環境を調べる', flowS4Partner, {
    marker: 's4'
  });
  registerInteract('s4_dev', new THREE.Vector3(12.6, 0, -11.2), 2.0, '開発区画へ接続を試す', flowS4Dev, {
    marker: 's4b'
  });
  // A gate represents a logical network boundary, not a traversable physical doorway.
  const gate = new THREE.Group();
  const pm = new THREE.MeshStandardMaterial({
    color: 0x35566b,
    roughness: .65
  });
  [
    [-.7, 1.15],
    [.7, 1.15]
  ].forEach(v => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(.12, 2.3, .16), pm);
    m.position.set(v[0], v[1], 0);
    gate.add(m)
  });
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(1.5, .14, .16), pm);
  lintel.position.y = 2.3;
  gate.add(lintel);
  gate.position.set(12.6, 0, -11.2);
  scene.add(gate);
  altServer = new THREE.Group();
  const rack = new THREE.Mesh(new THREE.BoxGeometry(.85, 1.9, .7), new THREE.MeshStandardMaterial({
    color: 0x284958,
    roughness: .6
  }));
  rack.position.y = .95;
  altServer.add(rack);
  for (let y = .3; y < 1.8; y += .3) {
    const led = new THREE.Mesh(new THREE.BoxGeometry(.65, .04, .03), new THREE.MeshBasicMaterial({
      color: 0x4dffb0
    }));
    led.position.set(0, y, .36);
    altServer.add(led)
  }
  altServer.position.set(3.9, 0, -11.2);
  altServer.visible = false;
  scene.add(altServer);
  srvLight = new THREE.PointLight(0x4dffb0, 0, 5, 2);
  srvLight.position.set(3.9, 2, -11.2);
  scene.add(srvLight);
  registerInteract('s4_alt', new THREE.Vector3(3.9, 0, -11.2), 1.8, '別の資料共有サイトへ接続', flowS4Alt, {
    marker: 's4c',
    hidden: true
  });
  ['s3_admin', 's4_partner', 's4_dev', 's4_alt'].forEach(id => find(id).remote = true);
  // The office is a visual representation of remote systems, not an explorable infiltration route.
  addCollider(2.4, -13.5, 14.5, 3.65);
  buildHackerHome();
  addEntranceGate('Cafe', -8.4, 3.5, 4.0, 0xe39542);
  addEntranceGate('会社  OFFICE', 8.4, 3.5, 3.3, 0x2779bd);
  const wifiCanvas = document.createElement('canvas');
  wifiCanvas.width = 128;
  wifiCanvas.height = 128;
  const wc = wifiCanvas.getContext('2d');
  wc.fillStyle = '#f2e7cd';
  wc.fillRect(0, 0, 128, 128);
  wc.strokeStyle = '#245d79';
  wc.lineWidth = 7;
  for (const rr of [18, 36, 54]) {
    wc.beginPath();
    wc.arc(64, 88, rr, Math.PI * 1.2, Math.PI * 1.8);
    wc.stroke();
  }
  wc.fillStyle = '#245d79';
  wc.beginPath();
  wc.arc(64, 94, 6, 0, Math.PI * 2);
  wc.fill();
  const wifiSign = new THREE.Mesh(new THREE.PlaneGeometry(.65, .65), new THREE.MeshBasicMaterial({
    map: new THREE.CanvasTexture(wifiCanvas)
  }));
  wifiSign.position.set(-11.9, 1.25, -2.55);
  wifiSign.rotation.x = -.25;
  scene.add(wifiSign);
  fakeWifiDevice = new THREE.Group();
  const wifiBody = new THREE.Mesh(new THREE.BoxGeometry(.45, .09, .30), new THREE.MeshStandardMaterial({
    color: 0x152a3d,
    roughness: .7
  }));
  fakeWifiDevice.add(wifiBody);
  const wifiLed = new THREE.Mesh(new THREE.BoxGeometry(.16, .025, .025), new THREE.MeshBasicMaterial({
    color: 0x5ae6f0
  }));
  wifiLed.position.set(0, .05, .14);
  fakeWifiDevice.add(wifiLed);
  fakeWifiDevice.position.set(-12.3, 1.08, -2.6);
  fakeWifiDevice.visible = false;
  scene.add(fakeWifiDevice);
  initGuidance();
}

function addEntranceGate(text, x, z, w, color) {
  const g = new THREE.Group();
  g.name = text;
  g.position.set(x, 0, z);
  scene.add(g);
  const m = new THREE.MeshStandardMaterial({
    color,
    roughness: .55
  });
  [-1, 1].forEach(sign => {
    const post = box(.23, 3.05, .27, m);
    post.position.set(sign * w / 2, 1.525, 0);
    post.castShadow = true;
    g.add(post);
    addCollider(x + sign * w / 2 - .115, z - .135, x + sign * w / 2 + .115, z + .135)
  });
  const beam = box(w + .23, .48, .3, m);
  beam.position.y = 3.0;
  beam.castShadow = true;
  g.add(beam);
  const board = box(w - .15, .4, .035, mat(0x17334a, .8));
  board.position.set(0, 3.0, .17);
  g.add(board);
  const sign = makeSign(text, '#ffffff', w - .25, .43);
  sign.position.set(0, 3.0, .195);
  g.add(sign);
  const threshold = new THREE.Mesh(new THREE.PlaneGeometry(w - .3, .65), new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: .38,
    side: THREE.DoubleSide
  }));
  threshold.rotation.x = -Math.PI / 2;
  threshold.position.y = .15;
  g.add(threshold);
  if (text.includes('会社')) {
    const name = makeSign('株式会社KAKU', '#174e78', 5, .6);
    name.position.set(0, 3.8, 0);
    g.add(name);
  }
}
