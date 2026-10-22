/* ゲーム開始とメインループ */
"use strict";

/* ============================================================
   起動シーケンス
   ============================================================ */
function startGame() {
  if (gameState !== 'boot') return;
  $('#startBtn').disabled = true;
  hideScreens();
  spawnPlayer(chosenAvatar);
  // accent compass & drone to avatar
  gameState = 'explore';
  inputLocked = false;
  startTutorial();
}

/* ============================================================
   メインループ
   ============================================================ */
var walkPhase = 0;

function animate() {
  requestAnimationFrame(animate);
  var dt = Math.min(clock.getDelta(), 0.05);
  var t = clock.elapsedTime;

  // camera yaw smoothing
  curYaw = lerp(curYaw, camYaw, 0.18);

  if (player && (gameState === 'explore' || gameState === 'chase' || gameState === 'climax')) {
    var mv = inputLocked ? {
      f: 0,
      s: 0
    } : getMoveInput();
    var mag = Math.hypot(mv.f, mv.s);
    var sp = 0;
    if (mag > 0.01) {
      // camera-relative
      var fwd = new THREE.Vector3(Math.sin(curYaw), 0, Math.cos(curYaw));
      var right = new THREE.Vector3(Math.sin(curYaw - Math.PI / 2), 0, Math.cos(curYaw - Math.PI / 2));
      var dir = new THREE.Vector3();
      dir.addScaledVector(fwd, mv.f).addScaledVector(right, mv.s);
      if (dir.lengthSq() > 0) {
        dir.normalize();
        var step = moveSpeed * dt * Math.min(mag, 1);
        var np = player.position.clone();
        np.x += dir.x * step;
        np.z += dir.z * step;
        resolveCollisions(np);
        player.position.copy(np);
        // face
        var targetFace = Math.atan2(dir.x, dir.z);
        var cur = player.rotation.y;
        var diff = ((targetFace - cur + Math.PI) % (TAU)) - Math.PI;
        player.rotation.y = cur + diff * 0.25;
        sp = moveSpeed * Math.min(mag, 1);
      }
    }
    playerPos.copy(player.position);
    walkPhase += sp * dt;
    animHuman(player, sp, walkPhase + t * 0.0);
    if (seatedAtCafe) {
      player.userData.hips.position.y = .65;
      player.userData.legL.rotation.x = -1.2;
      player.userData.legR.rotation.x = -1.2;
    }
  }

  // camera follow
  if (player && remoteMode) {
    camera.position.lerp(new THREE.Vector3(9, 26, 27), .10);
    camera.lookAt(10, 0, -1);
  } else if (player) {
    var cx = player.position.x - Math.sin(curYaw) * camDist;
    var cz = player.position.z - Math.cos(curYaw) * camDist;
    var cy = player.position.y + camHeight;
    camera.position.x = lerp(camera.position.x, cx, 0.12);
    camera.position.y = lerp(camera.position.y, cy, 0.12);
    camera.position.z = lerp(camera.position.z, cz, 0.12);
    camera.lookAt(player.position.x, player.position.y + 1.3, player.position.z);
  }

  // AI drone follow + bob
  if (aiDrone && player) {
    var off = new THREE.Vector3(Math.sin(curYaw + 1.1) * 1.3, 0, Math.cos(curYaw + 1.1) * 1.3);
    var tx = player.position.x + off.x,
      tz = player.position.z + off.z;
    var ty = 2.3;
    aiDrone.position.x = lerp(aiDrone.position.x, tx, 0.08);
    aiDrone.position.z = lerp(aiDrone.position.z, tz, 0.08);
    aiDrone.position.y = ty;
    aiDrone.rotation.y += dt * 1.2;
    if (aiDrone.userData.ring) aiDrone.userData.ring.rotation.z += dt * 2;
    if (aiDrone.userData.ring2) aiDrone.userData.ring2.rotation.y += dt * 1.6;
    aiLight.position.copy(aiDrone.position);
  }

  // NPC idle breathe
  for (var i = 0; i < npcs.length; i++) {
    var n = npcs[i];
    if (n.grp.userData.hips) n.grp.userData.hips.position.y = 0.95 + Math.sin(t * 1.5 + n.phase) * 0.015;
  }

  // alt server reveal grow
  if (altReveal > 0 && altReveal < 1 && altServer) {
    altReveal = Math.min(1, altReveal + dt * 2);
    var s = altReveal;
    altServer.scale.set(s, s, s);
    if (srvLight) srvLight.intensity = s * 1.2;
  }

  // chase update
  if (gameState === 'chase') updateChase(dt, t);

  updateInteractPrompt();
  updateGuidance(dt);
  drawMinimap();
  positionSpeech();

  renderer.render(scene, camera);
}
