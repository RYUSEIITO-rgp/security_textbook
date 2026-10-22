/* プレイヤー、カメラ、キーボード・スティック入力 */
"use strict";

/* ============================================================
   プレイヤー / カメラ / 入力
   ============================================================ */
var DEFAULT_AVATAR = {
  id: 1,
  name: 'CIPHER',
  accent: '#2fe6ff',
  top: 0x2fe6ff,
  bottom: 0x101a22,
  skin: 0xd9a07a,
  hair: 0x15120e
};
var player, aiDrone, aiLight;
var playerPos = new THREE.Vector3(0, 0, 9.1);
var camYaw = Math.PI,
  camDist = 9,
  camHeight = 7,
  camPitch = 0.42;
var curYaw = Math.PI;
var keys = {};
var inputLocked = true;
var moveSpeedBase = 5.2,
  moveSpeed = 5.2;
var npcs = [];

function spawnPlayer(av) {
  player = makeHumanoid({
    top: av.top,
    bottom: av.bottom,
    skin: av.skin,
    hair: av.hair
  }, true);
  player.position.copy(playerPos);
  scene.add(player);
  // AI drone
  aiDrone = new THREE.Group();
  var core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 0), mat(0x071a24, 0.3, 0.4, 0x2fe6ff,
    1.4));
  aiDrone.add(core);
  var ring = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.03, 8, 28), mat(0x071a24, 0.3, 0.4, 0x2fe6ff,
    1.0));
  ring.rotation.x = Math.PI / 2;
  aiDrone.add(ring);
  var ring2 = ring.clone();
  ring2.rotation.x = 0;
  aiDrone.add(ring2);
  aiDrone.userData = {
    ring: ring,
    ring2: ring2
  };
  aiDrone.position.set(playerPos.x + 1, 2.4, playerPos.z);
  scene.add(aiDrone);
  aiLight = new THREE.PointLight(0x2fe6ff, 0.7, 8, 2);
  scene.add(aiLight);
  // snap camera behind player immediately
  camera.position.set(player.position.x - Math.sin(curYaw) * camDist, player.position.y + camHeight,
    player.position.z - Math.cos(curYaw) * camDist);
  camera.lookAt(player.position.x, player.position.y + 1.3, player.position.z);
}

/* ---- 入力 ---- */
var dialogueIndex = 0,
  dialogueButtons = [],
  finishTyping = null,
  climaxStep = 0;

function highlightDialogue() {
  document.querySelectorAll('#dbtns button').forEach(function(b, i) {
    b.classList.toggle('keySelected', i === dialogueIndex)
  });
}

function confirmAction() {
  if (tutorialActive) { nextTutorial(); return; }
  if ($('#s-brief').classList.contains('show')) {
    $('#startBtn').click();
    return;
  }
  if ($('#s-debrief').classList.contains('show')) {
    $('#replayBtn').click();
    return;
  }
  if (gameState === 'climax') {
    advanceClimax();
    return;
  }
  if ($('#dialogue').classList.contains('show')) {
    if (finishTyping) {
      finishTyping();
      return;
    }
    var b = $('#dbtns').children[dialogueIndex];
    if (b) b.click();
    return;
  }
  if (remoteMode === 'select') {
    runRemoteChoice();
    return;
  }
  if (!inputLocked) tryInteract();
}
window.addEventListener('keydown', function(e) {
  var k = e.key.toLowerCase();
  if (!['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'enter'].includes(k)) return;
  e.preventDefault();
  if (k === 'enter') {
    if (!e.repeat) confirmAction();
    return;
  }
  if ($('#s-debrief').classList.contains('show')) {
    return;
  }
  if ($('#dialogue').classList.contains('show')) {
    if (!e.repeat && dialogueButtons.length) {
      dialogueIndex = (dialogueIndex + (k === 'arrowleft' || k === 'arrowup' ? dialogueButtons
        .length - 1 : 1)) % dialogueButtons.length;
      highlightDialogue()
    }
    return;
  }
  if (remoteMode === 'select') {
    if (!e.repeat) selectRemote((k === 'arrowup' || k === 'arrowleft') ? -1 : 1);
    return;
  }
  keys[k] = true;
});
window.addEventListener('keyup', function(e) {
  keys[e.key.toLowerCase()] = false
});
window.addEventListener('blur', function() {
  keys = {}
});
// mouse drag look
var dragging = false,
  lastX = 0;

function bindLook() {
  var dom = renderer.domElement;
  dom.addEventListener('mousedown', function(e) {
    dragging = true;
    lastX = e.clientX;
  });
  window.addEventListener('mouseup', function() {
    dragging = false;
  });
  window.addEventListener('mousemove', function(e) {
    if (dragging) {
      camYaw -= (e.clientX - lastX) * 0.006;
      lastX = e.clientX;
    }
  });
  // touch camera on right half
  dom.addEventListener('touchstart', function(e) {
    for (var i = 0; i < e.touches.length; i++) {
      var t = e.touches[i];
      if (t.clientX > window.innerWidth * 0.5) {
        camTouchId = t.identifier;
        camLastX = t.clientX;
      }
    }
  }, {
    passive: true
  });
  dom.addEventListener('touchmove', function(e) {
    for (var i = 0; i < e.touches.length; i++) {
      var t = e.touches[i];
      if (t.identifier === camTouchId) {
        camYaw -= (t.clientX - camLastX) * 0.008;
        camLastX = t.clientX;
      }
    }
  }, {
    passive: true
  });
  dom.addEventListener('touchend', function(e) {
    camTouchId = null;
  }, {
    passive: true
  });
}
var camTouchId = null,
  camLastX = 0;

// Q/E rotate alt (E reserved for interact when unlocked; use , . )
// movement vector from keys relative to camera yaw
function getMoveInput() {
  var f = 0,
    s = 0;
  if (keys['arrowup']) f += 1;
  if (keys['arrowdown']) f -= 1;
  if (keys['arrowleft']) s -= 1;
  if (keys['arrowright']) s += 1;
  // joystick
  if (joyActive) {
    f += -joyY;
    s += joyX;
  }
  return {
    f: f,
    s: s
  };
}

/* ---- joystick ---- */
var joyActive = false,
  joyX = 0,
  joyY = 0,
  joyId = null;

function bindJoy() {
  var joy = $('#joy'),
    nub = $('#joynub');

  function at(e, fn) {
    for (var i = 0; i < e.changedTouches.length; i++) fn(e.changedTouches[i]);
  }
  joy.addEventListener('touchstart', function(e) {
    e.preventDefault();
    at(e, function(t) {
      if (joyId === null) {
        joyId = t.identifier;
        joyActive = true;
        move(t);
      }
    });
  }, {
    passive: false
  });
  joy.addEventListener('touchmove', function(e) {
    e.preventDefault();
    at(e, function(t) {
      if (t.identifier === joyId) move(t);
    });
  }, {
    passive: false
  });
  joy.addEventListener('touchcancel', resetTouchMovement);
  joy.addEventListener('touchend', function(e) {
    at(e, function(t) {
      if (t.identifier === joyId) {
        joyId = null;
        joyActive = false;
        joyX = joyY = 0;
        nub.style.left = '50%';
        nub.style.top = '50%';
      }
    });
  });

  function move(t) {
    var r = joy.getBoundingClientRect();
    var dx = t.clientX - (r.left + r.width / 2),
      dy = t.clientY - (r.top + r.height / 2);
    var mag = Math.min(Math.hypot(dx, dy), r.width / 2);
    var ang = Math.atan2(dy, dx);
    var nx = Math.cos(ang) * mag,
      ny = Math.sin(ang) * mag;
    nub.style.left = (50 + nx / (r.width / 2) * 50) + '%';
    nub.style.top = (50 + ny / (r.height / 2) * 50) + '%';
    joyX = nx / (r.width / 2);
    joyY = ny / (r.height / 2);
  }
  $('#tact').addEventListener('touchstart', function(e) {
    e.preventDefault();
    confirmAction();
  }, {
    passive: false
  });
}
