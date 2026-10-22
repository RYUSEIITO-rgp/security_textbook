/* 人型キャラクターのモデルとアニメーション */
"use strict";

/* ============================================================
   ヒューマノイド
   ============================================================ */
function makeHumanoid(cols, isPlayer) {
  var g = new THREE.Group();
  var skin = mat(cols.skin || 0xd9a07a, 0.7, 0);
  var top = mat(isPlayer ? 0x192333 : (cols.top || 0x2fe6ff), 0.9, 0);
  var bottom = mat(cols.bottom || 0x222831, 0.8, 0.1);
  var hair = mat(cols.hair || 0x16120e, 0.8, 0);

  // hips
  var hips = new THREE.Group();
  hips.position.y = 0.95;
  g.add(hips);
  var pelvis = box(0.52, 0.3, 0.3, bottom);
  pelvis.position.y = 0;
  hips.add(pelvis);
  // torso
  var torso = box(0.58, 0.66, 0.32, top);
  torso.position.y = 0.48;
  hips.add(torso);
  var neck = box(0.16, 0.12, 0.16, skin);
  neck.position.y = 0.86;
  hips.add(neck);
  // head
  var head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 16, 16), skin);
  head.position.y = 1.03;
  hips.add(head);
  var hairm = new THREE.Mesh(new THREE.SphereGeometry(0.205, 16, 16, 0, TAU, 0, Math.PI * 0.62), hair);
  hairm.position.y = 1.06;
  hips.add(hairm);
  if (isPlayer) {
    // A deep hood conceals the face; long sleeves and a kangaroo pocket retain the hoodie silhouette.
    hairm.visible = false;
    // Unlit darkness stays opaque even under the daylight and the AIA light.
    var faceShadow = new THREE.MeshBasicMaterial({color:0x03060a});
    head.material = faceShadow;
    head.name = 'shadowedFace';
    head.scale.set(.96, 1.15, .72);
    head.position.z = .055;
    neck.material = faceShadow;
    var hoodInterior = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 16), faceShadow);
    hoodInterior.scale.set(.20, .26, .055);
    hoodInterior.position.set(0, 1.04, .16);
    hips.add(hoodInterior);
    var cloth = mat(0x1d293c, .97, 0);
    cloth.side = THREE.DoubleSide;
    var hood = new THREE.Mesh(new THREE.SphereGeometry(.34, 24, 20,
      Math.PI / 2 + .64, TAU - 1.28, 0, Math.PI * .88), cloth);
    hood.name = 'hood';
    hood.position.set(0, 1.05, -.025);
    hood.castShadow = true;
    hips.add(hood);
    var rim = new THREE.Mesh(new THREE.TorusGeometry(.24, .045, 8, 28), cloth);
    rim.scale.set(.84, 1.12, 1);
    rim.position.set(0, 1.04, .17);
    hips.add(rim);
    [-1, 1].forEach(function(side) {
      var cord = box(.017, .23, .018, mat(0xc2cbd5, .9));
      cord.position.set(side * .09, .69, .19);
      hips.add(cord);
    });
    var pocket = box(.34, .16, .035, cloth);
    pocket.position.set(0, .3, .185);
    hips.add(pocket);
  }
  // arms
  function arm(side) {
    var a = new THREE.Group();
    a.position.set(side * 0.37, 0.78, 0);
    hips.add(a);
    var up = box(0.14, 0.5, 0.14, top);
    up.position.y = -0.22;
    a.add(up);
    var low = box(0.12, 0.4, 0.12, isPlayer ? top : skin);
    low.position.y = -0.6;
    a.add(low);
    return a;
  }
  // legs
  function leg(side) {
    var l = new THREE.Group();
    l.position.set(side * 0.15, 0, 0);
    hips.add(l);
    var up = box(0.2, 0.5, 0.2, bottom);
    up.position.y = -0.25;
    l.add(up);
    var low = box(0.17, 0.45, 0.17, bottom);
    low.position.y = -0.72;
    l.add(low);
    var foot = box(0.2, 0.12, 0.34, mat(0x0e0f12, 0.6, 0.1));
    foot.position.set(0, -0.98, 0.08);
    l.add(foot);
    return l;
  }
  var armL = arm(-1),
    armR = arm(1),
    legL = leg(-1),
    legR = leg(1);
  g.traverse(function(o) {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  g.userData = {
    armL: armL,
    armR: armR,
    legL: legL,
    legR: legR,
    hips: hips
  };
  return g;
}

function animHuman(g, speed, t) {
  var d = g.userData;
  if (!d) return;
  var amp = clamp(speed * 0.14, 0, 1);
  var s = Math.sin(t * 10) * amp;
  d.legL.rotation.x = s;
  d.legR.rotation.x = -s;
  d.armL.rotation.x = -s * 0.8;
  d.armR.rotation.x = s * 0.8;
  d.hips.position.y = 0.95 + Math.abs(Math.sin(t * 10)) * amp * 0.05;
}
