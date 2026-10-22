/* 目的地までの経路探索と誘導ドット */
"use strict";

/* The town and route share one collision map. */
var guideTarget = null,
  guideId = '',
  guideNext = null,
  guidePath = [],
  guideDots = [],
  guideClock = 0,
  guideMarkers = [];
var navW = 89,
  navH = 71,
  navStep = .5;

function navPos(i) {
  return {
    x: -19 + (i % navW) * navStep,
    z: -17 + Math.floor(i / navW) * navStep
  };
}

function walkable(x, z) {
  return x >= -19 && x <= 25 && z >= -17 && z <= 18 && !colliders.some(c => x > c.x0 - PR && x < c.x1 +
    PR && z > c.z0 - PR && z < c.z1 + PR);
}

function routeField(target) {
  const next = new Int32Array(navW * navH);
  next.fill(-1);
  const queue = [],
    free = new Uint8Array(next.length);
  for (let i = 0; i < next.length; i++) {
    const p = navPos(i);
    free[i] = walkable(p.x, p.z) ? 1 : 0;
    if (free[i] && Math.hypot(p.x - target.pos.x, p.z - target.pos.z) < Math.min(1.4, target.r - .2)) {
      next[i] = i;
      queue.push(i)
    }
  }
  for (let k = 0; k < queue.length; k++) {
    const i = queue[k],
      x = i % navW,
      y = Math.floor(i / navW);
    for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1]
      ]) {
      const xx = x + dx,
        yy = y + dy;
      if (xx < 0 || xx >= navW || yy < 0 || yy >= navH) continue;
      const n = yy * navW + xx;
      if (next[n] === -1 && free[n]) {
        next[n] = i;
        queue.push(n)
      }
    }
  }
  return next;
}

function nextDestination() {
  if (!credentialLead) return find('s2_memo');
  if (!employeeLead) return find('s1_laptop');
  return find('home_pc');
}

function initGuidance() {
  const labels = {
    's1_laptop': '担当者の手掛かり',
    's2_memo': '机のメモ',
    's3_admin': '03 管理者端末',
    's4_partner': '04 取引先環境',
    's4_dev': 'DEV 開発区画',
    's4_alt': 'FILE SHARE',
    'home_pc': '自宅 / ハッカーPC'
  };
  interacts.forEach(it => {
    const ring = new THREE.Mesh(new THREE.RingGeometry(.55, .65, 32), new THREE.MeshBasicMaterial({
      color: it.hidden ? 0x4dffb0 : 0xf6ba55,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: .8
    }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(it.pos.x, .18, it.pos.z);
    scene.add(ring);
    const cv = document.createElement('canvas');
    cv.width = 512;
    cv.height = 100;
    const c = cv.getContext('2d');
    c.font = 'bold 38px sans-serif';
    c.textAlign = 'center';
    c.fillStyle = '#113b5b';
    c.fillText(labels[it.id], 256, 60);
    const tag = new THREE.Sprite(new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(cv),
      transparent: true,
      depthTest: false,
      depthWrite: false
    }));
    tag.position.set(it.pos.x, 2.6, it.pos.z);
    tag.scale.set(3.2, .625, 1);
    scene.add(tag);
    guideMarkers.push({
      it,
      ring,
      tag
    });
  });
}

function guidancePath() {
  if (!player || !guideNext) return [];
  let best = -1,
    dist = Infinity;
  const gx = Math.round((player.position.x + 19) * 2),
    gy = Math.round((player.position.z + 17) * 2);
  for (let yy = gy - 2; yy <= gy + 2; yy++)
    for (let xx = gx - 2; xx <= gx + 2; xx++) {
      if (xx < 0 || yy < 0 || xx >= navW || yy >= navH) continue;
      const i = yy * navW + xx;
      if (guideNext[i] < 0) continue;
      const p = navPos(i),
        d = Math.hypot(player.position.x - p.x, player.position.z - p.z);
      let clear = true;
      for (let k = 1; k <= 5; k++)
        if (!walkable(player.position.x + (p.x - player.position.x) * k / 5, player.position.z + (p.z -
            player.position.z) * k / 5)) clear = false;
      if (clear && d < dist) {
        dist = d;
        best = i
      }
    }
  const path = [];
  if (best < 0) return path;
  for (let k = 0, i = best; k < 1000; k++) {
    path.push(navPos(i));
    const n = guideNext[i];
    if (n === i || n < 0) break;
    i = n
  }
  return path;
}

function updateNextAction() {
  let text = 'カフェへ向かおう';
  const inCafe = player && player.position.x >= -14.7 && player.position.x <= -3.5 && player.position.z >=
    -6.3 && player.position.z <= 3.5;
  if (gameState === 'chase') text = '20秒間、警察から逃げよう';
  else if (gameState === 'climax') text = 'Enterで次へ進もう';
  else if (remoteMode === 'select') text = '接続先を選ぼう';
  else if (remoteMode) text = '接続結果を確認しよう';
  else if (seatedAtCafe) text = '社員の反応を確かめよう';
  else if (!credentialLead) text = inCafe ? '机のメモを拾おう' : 'カフェへ向かおう';
  else if (!employeeLead) text = '共用Wi-fiの席に座ろう';
  else text = player && player.position.x > 15.4 && player.position.z > 4.8 ? '自宅PCを操作しよう' : '自宅へ向かおう';
  $('#nextAction').textContent = text;
  $('#collectedInfo').textContent = [credentialLead ? '回収済：社員ポータルのID・パスワード' : '', employeeLead ?
    '確認済：偽画面はパスキー認証で拒否' : ''
  ].filter(Boolean).join('\n');
}

function updateGuidance(dt) {
  updateNextAction();
  guideDots.forEach(m => m.visible = false);
  const active = gameState === 'explore';
  const playing = ['explore', 'chase', 'climax'].includes(gameState);
  $('#hud-top').style.display = playing ? 'flex' : 'none';
  $('#hud-right').style.display = playing ? 'flex' : 'none';
  guideMarkers.forEach(m => {
    const physical = active && !remoteMode && !m.it.hidden && !m.it.remote && !m.it.clueTaken && !(m
      .it.id === 's1_laptop' && !credentialLead);
    m.ring.visible = physical;
    m.tag.visible = false;
    m.ring.material.opacity = m.it.done ? .25 : .8
  });
  if (!active || remoteMode) return;
  const target = nextDestination();
  if (!target) {
    guidePath = [];
    return;
  }
  document.querySelectorAll('.obj').forEach(o => o.classList.toggle('active', o.dataset.k === target
    .marker?.slice(0, 2)));
  guideTarget = target;
  if (guideId !== target.id) {
    guideId = target.id;
    guideNext = routeField(target);
    guideClock = 1;
  }
  guideClock += dt;
  if (guideClock > .3) {
    guideClock = 0;
    guidePath = guidancePath()
  }
  for (let k = 0; k < guidePath.length && k < 240; k += 3) {
    const j = k / 3;
    if (!guideDots[j]) {
      guideDots[j] = new THREE.Mesh(new THREE.BoxGeometry(.23, .04, .23), new THREE.MeshBasicMaterial({
        color: 0x146fce
      }));
      guideDots[j].rotation.y = Math.PI / 4;
      scene.add(guideDots[j])
    }
    const m = guideDots[j],
      p = guidePath[k];
    m.position.set(p.x, .18, p.z);
    m.visible = true;
  }
}
