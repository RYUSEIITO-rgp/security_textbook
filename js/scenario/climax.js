/* ミッション完了 → ブラックアウト → 鬼ごっこ */
"use strict";

/* ============================================================
   ミッション完了 → ブラックアウト → 鬼ごっこ
   ============================================================ */
var gameState = 'boot'; // boot, explore, climax, chase, end
function triggerMissionComplete() {
  leaveRemotePC();
  gameState = 'climax';
  inputLocked = true;
  keys = {};
  climaxStep = 0;
  $('#prompt').classList.remove('show');
  resetTouchMovement();
  $('#banner').classList.add('show');
  $('#banner').classList.add('in');
  $('#bannersmall').textContent = '資料取得完了';
  syncTouchUI();
  sfxOK();
}

function advanceClimax() {
  if (climaxStep === 0) {
    $('#banner').classList.remove('show', 'in');
    startBlackout();
    return;
  }
  if (climaxStep === 1) {
    climaxStep = 2;
    $('#blackmsg').textContent = '罠だった。';
    sfxDeny();
    return;
  }
  if (climaxStep === 2) {
    climaxStep = 3;
    $('#blackmsg').textContent = isTouchUI() ? '警察が来た。左のスティックで20秒逃げ切れ。' : '警察が来た。十字キーで20秒逃げ切れ。';
    return;
  }
  if (climaxStep === 3) {
    climaxStep = 4;
    beginChase();
  }
}

function startBlackout() {
  climaxStep = 1;
  $('#blackout').classList.add('show', 'msgon');
  $('#blackmsg').textContent = '……何かがおかしい。';
  beep(140, .4, 'sawtooth', .1);
}
/* ---- 鬼ごっこ ---- */
var police = [],
  chaseTime = 20.0,
  chaseActive = false,
  caught = false,
  chaseStart = 0,
  chasePause = 0,
  chaseHidden = null;
document.addEventListener('visibilitychange', function() {
  keys = {};
  if (!chaseActive) return;
  if (document.hidden) {
    chaseHidden = performance.now()
  } else if (chaseHidden !== null) {
    chasePause += performance.now() - chaseHidden;
    chaseHidden = null
  }
});

function beginChase() {
  gameState = 'chase';
  syncTouchUI();
  chaseActive = true;
  caught = false;
  chaseTime = 20;
  chaseStart = performance.now();
  chasePause = 0;
  chaseHidden = null;
  // teleport player to street
  player.position.set(0, 0, 9.1);
  playerPos.copy(player.position);
  camYaw = Math.PI;
  curYaw = Math.PI;
  moveSpeed = moveSpeedBase; // dash during chase
  // spawn police near company entrance
  var spawnPts = [
    [0, 4.55],
    [-3.5, 4.2],
    [3.5, 4.2]
  ];
  for (var i = 0; i < spawnPts.length; i++) {
    var pol = makeHumanoid({
      top: 0x12305a,
      bottom: 0x0a1420,
      skin: 0xcf9a70,
      hair: 0x120c08
    }, false);
    // light bar
    var barL = box(0.2, 0.14, 0.2, mat(0x200000, 0.3, 0, 0xff2020, 1.6));
    barL.position.set(-0.14, 2.2, 0);
    pol.add(barL);
    var barR = box(0.2, 0.14, 0.2, mat(0x000020, 0.3, 0, 0x2060ff, 1.6));
    barR.position.set(0.14, 2.2, 0);
    pol.add(barR);
    pol.position.set(spawnPts[i][0], 0, spawnPts[i][1]);
    scene.add(pol);
    police.push({
      grp: pol,
      barL: barL,
      barR: barR,
      speed: 3.0 + i * 0.12,
      phase: i
    });
  }
  // reveal chase ui, fade out blackout
  $('#chasebar').classList.add('show');

  var bo = $('#blackout');
  bo.classList.remove('msgon');
  // quick white flash into chase
  flashWhite();
  setTimeout(function() {
    bo.classList.remove('show');
    inputLocked = false;
  }, 300);
  // siren loop
  sirenOn = true;
  sirenLoop();
}
var sirenOn = false;

function sirenLoop() {
  if (!sirenOn) return;
  beep(760, .25, 'sine', .05);
  setTimeout(function() {
    beep(560, .25, 'sine', .05);
  }, 260);
  setTimeout(sirenLoop, 560);
}

function updateChase(dt, t) {
  if (!chaseActive) return;
  if (document.hidden) return;
  chaseTime = 20 - (performance.now() - chaseStart - chasePause) / 1000;
  var frac = clamp(chaseTime / 20, 0, 1);
  $('#ctime').textContent = Math.max(chaseTime, 0).toFixed(1);
  $('#chasefill').style.width = (frac * 100) + '%';
  if (chaseTime <= 0) {
    endChase(true);
    return;
  }
  // police seek
  for (var i = 0; i < police.length; i++) {
    var p = police[i];
    var dx = player.position.x - p.grp.position.x,
      dz = player.position.z - p.grp.position.z;
    var d = Math.hypot(dx, dz);
    if (d > 0.01) {
      var nx = dx / d,
        nz = dz / d;
      var np = p.grp.position.clone();
      np.x += nx * p.speed * dt;
      np.z += nz * p.speed * dt;
      resolveCollisions(np);
      p.grp.position.copy(np);
      p.grp.rotation.y = Math.atan2(nx, nz);
      animHuman(p.grp, p.speed, t + p.phase);
    }
    // flashing bar
    var fl = (Math.sin(t * 14 + p.phase) > 0);
    p.barL.material.emissiveIntensity = fl ? 2.0 : 0.2;
    p.barR.material.emissiveIntensity = fl ? 0.2 : 2.0;
    if (d < .85 && chaseTime < 18.4 && !caught) {
      caught = true;
      endChase(false);
      return;
    }
  }
  if (chaseTime <= 0 && !caught) {
    endChase(true);
  }
}

function endChase(escaped) {
  chaseActive = false;
  sirenOn = false;
  inputLocked = true;
  moveSpeed = moveSpeedBase;
  $('#chasebar').classList.remove('show');
  flashWhite();
  if (escaped) {
    beep(523, .1, 'square', .1);
    setTimeout(function() {
      beep(784, .12, 'square', .1);
    }, 110);
    setTimeout(function() {
      beep(1046, .18, 'square', .1);
    }, 230);
  } else {
    sfxDeny();
  }
  setTimeout(function() {
    showDebrief(escaped);
  }, 650);
}

function flashWhite() {
  var f = $('#flash');
  f.style.transition = 'none';
  f.style.opacity = '0.85';
  requestAnimationFrame(function() {
    f.style.transition = 'opacity .5s';
    f.style.opacity = '0';
  });
}
