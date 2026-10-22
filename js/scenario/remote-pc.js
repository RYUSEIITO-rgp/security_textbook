/* 自宅PCから会社システムへの接続（架空） */
"use strict";

/* Remote interactions are fictional game events; no external systems are contacted. */
var employeeLead = false,
  credentialLead = false,
  remoteMode = '',
  remoteIndex = 0,
  remoteOptions = [],
  remoteLine = null,
  remoteLineParts = [],
  remoteExitSelected = false;
var homePCPos = new THREE.Vector3(19.4, 0, 8.9);
var systemTargets = {
  s1_laptop: new THREE.Vector3(5.4, 1.8, .3),
  s2_memo: new THREE.Vector3(11.4, 1.8, .3),
  s3_admin: new THREE.Vector3(5.6, 1.8, -4.5),
  s4_partner: new THREE.Vector3(9.8, 1.8, -9.1),
  s4_dev: new THREE.Vector3(12.6, 1.8, -11.2),
  s4_alt: new THREE.Vector3(3.9, 1.8, -11.2)
};

function buildHackerHome() {
  const home = new THREE.Group();
  home.name = '自宅 / Hacker home';
  scene.add(home);

  function part(w, h, d, col, x, y, z) {
    const m = box(w, h, d, mat(col, .7));
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    home.add(m);
    return m
  }
  part(8, .16, 8, 0x273043, 19.4, .08, 8.8);
  for (const c of [
      [15.4, 8.8, .22, 8],
      [23.4, 8.8, .22, 8],
      [19.4, 4.8, 8, .22],
      [16.6, 12.8, 2.4, .22],
      [22.2, 12.8, 2.4, .22]
    ]) {
    part(c[2], 1.3, c[3], 0x4a5571, c[0], .65, c[1]);
    addCollider(c[0] - c[2] / 2, c[1] - c[3] / 2, c[0] + c[2] / 2, c[1] + c[3] / 2)
  }
  part(7.8, .13, .15, 0x66c5d6, 19.4, 2.95, 4.9);
  part(4.0, .16, 1.25, 0x111d2c, 19.4, 1.0, 7.4);
  addCollider(17.4, 6.775, 21.4, 8.025);
  [-1.65, 1.65].forEach(dx => part(.12, 1, .9, 0x253649, 19.4 + dx, .5, 7.4));
  for (let i = -1; i <= 1; i++) {
    const screen = part(1.1, .73, .08, 0x07101c, 19.4 + i * 1.2, 1.65, 7.05);
    screen.rotation.y = -i * .13;
    const cv = document.createElement('canvas');
    cv.width = 384;
    cv.height = 240;
    const q = cv.getContext('2d');
    q.fillStyle = '#06101c';
    q.fillRect(0, 0, 384, 240);
    q.fillStyle = i === 0 ? '#63f2d3' : '#55b9f6';
    q.font = '15px monospace';
    q.fillRect(20, 20, 200, 5);
    for (let k = 0; k < 9; k++) q.fillRect(20, 60 + k * 18, 120 + (k * 31) % 190, 3);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.02, .65), new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(cv)
    }));
    glow.position.set(19.4 + i * 1.2, 1.65, 7.105);
    glow.rotation.y = -i * .13;
    home.add(glow);
  }
  part(1.4, .035, .38, 0x303c60, 19.4, 1.1, 7.75);
  for (let i = 0; i < 12; i++) part(.075, .02, .25, i % 2 ? 0x4a8fae : 0x775aa1, 18.8 + i * .105, 1.13,
    7.75);
  const rack = part(.75, 1.6, .9, 0x142031, 22.1, .8, 6.6);
  for (let y = .3; y < 1.5; y += .3) {
    const led = box(.5, .04, .03, new THREE.MeshBasicMaterial({
      color: 0xa273ed
    }));
    led.position.set(22.1, y, 7.07);
    home.add(led)
  }
  part(.85, .12, .8, 0x171e31, 19.4, .5, 9.1);
  part(.85, .85, .12, 0x222c45, 19.4, .9, 9.45);
  const l = new THREE.PointLight(0x65badb, 8, 8, 2);
  l.position.set(19.4, 3.5, 7.5);
  scene.add(l);
  addEntranceGate('自宅', 19.4, 12.8, 3.2, 0x8058b0);
  registerInteract('home_pc', homePCPos, 1.7, '自宅のPCを操作', openRemoteMenu, {
    marker: 'home',
    repeat: true
  });
}

var blockedRoutes = new Set(),
  activeRouteId = '',
  fakeWifiDevice = null;

function collectEmployeeLead() {
  seatedAtCafe = true;
  activeRouteId = 's1_laptop';
  player.position.set(-11.9, 0, -1.9);
  player.rotation.y = Math.PI;
  say('AIA', '（株）KAKUの社員が店内の共用Wi-Fiで仕事をしている。偽の再接続案内を流して、偽サイトにログインさせよう。', [nextBtn(cafeNotice,
    '偽の再接続案内を流す')]);
}

function cafeNotice() {
  if (fakeWifiDevice) fakeWifiDevice.visible = true;
  say('SYSTEM', '「接続を続けるには、会社のクラウドに再ログインしてください」という偽の案内を表示した。', [nextBtn(s1b, '社員の様子を見る')], 'notice');
}

function collectCredentials() {
  say('YOU', 'メモには、社員ポータルのIDとパスワードが書かれている…', [{
    label: 'メモを回収する',
    primary: true,
    onClick: function() {
      credentialLead = true;
      find('s2_memo').clueTaken = true;
      updateNextAction();
      say('AIA', '後でこの情報を使ってログインしてみよう。次は共用Wi-Fiの席を調べよう。', [{label:'Wi-Fiの席へ向かう', primary:true, close:true}]);
    }
  }]);
}

function getRemoteOptions() {
  const list = [{
    id: 's2_memo',
    name: '社員のログイン画面',
    sub: 'ID・PWによるアクセス',
    locked: !credentialLead,
    status: '公開ログイン画面 / 社内情報には未接続',
    condition: credentialLead ? 'メモのID・PWを使う。ただし、端末を含む利用条件の確認はこれからだ。' : 'カフェでID・PWのメモを探そう。',
    run: flowS2
  }, {
    id: 's3_admin',
    name: 'システム管理画面',
    sub: '特権操作を試す',
    status: '点検担当者のパソコンから操作する',
    condition: '点検担当者がログインしたままのパソコンを、こちらから動かせる。大事な操作までできるか試す。',
    run: flowS3
  }, {
    id: 's4_partner',
    name: '取引先との共有フォルダ',
    sub: '新製品情報を探す',
    status: '取引先の人のパソコンから資料を見る',
    condition: '取引先の人がログインしたままのパソコンを使う。まずは、会社から共有された資料を探す。',
    run: flowS4Partner
  }];
  if (!employeeLead) list.forEach(function(o) {
    o.locked = true;
    o.condition = 'まずカフェで情報を集めよう。メモと共用Wi-Fiの席を調べてみてくれ。';
  });
  if (microExperienced) {
    list[2].id = 's4_alt';
    list[2].run = flowS4Alt;
  } else if (partnerSeen) {
    list[2].id = 's4_dev';
    list[2].run = flowS4Dev;
  }
  return list;
}

function openRemoteMenu() {
  if (gameState !== 'explore') return;
  remoteMode = 'select';
  inputLocked = true;
  keys = {};
  $('#remotePanel').hidden = false;
  resetTouchMovement();
  syncTouchUI();
  remoteOptions = getRemoteOptions();
  remoteIndex = remoteIndex >= remoteOptions.length ? 0 : clamp(remoteIndex, 0, remoteOptions.length - 1);
  renderRemoteChoices();
}

function renderRemoteChoices() {
  const wrap = $('#remoteChoices');
  wrap.innerHTML = '';
  remoteOptions.forEach((o, i) => {
    const failed = blockedRoutes.has(o.id) || (o.id.startsWith('s4_') && blockedRoutes.has(
      's4_partner'));
    const button = document.createElement('button');
    button.className = 'remoteChoice' + (i === remoteIndex ? ' selected' : '') + (failed ? ' failed' :
      '');
    const text = document.createElement('span');
    text.textContent = o.name;
    button.appendChild(text);
    if (failed) {
      const mark = document.createElement('span');
      mark.className = 'failedCross';
      mark.textContent = '×';
      mark.setAttribute('aria-label', 'この経路での試行は拒否済み');
      button.appendChild(mark);
    }
    if (failed && o.id === 's4_alt') {
      const note = document.createElement('small');
      note.className = 'routeRetry';
      note.textContent = '先へは進めなかった。別の入口を探す';
      button.appendChild(note);
    }
    button.onclick = function() {
      if (remoteIndex !== i) {
        remoteIndex = i;
        renderRemoteChoices();
      } else runRemoteChoice();
    };
    wrap.appendChild(button);
  });
  fitPanels();
  $('#remoteExit').classList.toggle('selected', remoteIndex === remoteOptions.length);
  if (remoteIndex === remoteOptions.length) {
    clearRemoteLine();
    return;
  }
  drawRemoteLine(remoteOptions[remoteIndex]);
}

function selectRemote(delta) {
  remoteIndex = (remoteIndex + delta + remoteOptions.length + 1) % (remoteOptions.length + 1);
  renderRemoteChoices();
}

function runRemoteChoice() {
  if (remoteIndex === remoteOptions.length) {
    leaveRemotePC();
    return;
  }
  const o = remoteOptions[remoteIndex];
  if (o.locked) {
    remoteMode = 'action';
    $('#remotePanel').hidden = true;
    say('AIA', o.condition, [{
      label: '接続先に戻る',
      primary: true,
      close: true
    }]);
    return;
  }
  remoteMode = 'action';
  activeRouteId = o.id;
  $('#remotePanel').hidden = true;
  drawRemoteLine(o, true);
  o.run(find(o.id));
}

function leaveRemotePC() {
  remoteMode = '';
  activeRouteId = '';
  inputLocked = false;
  keys = {};
  $('#remotePanel').hidden = true;
  syncTouchUI();
  clearRemoteLine();
}

function clearRemoteLine() {
  if (remoteLine) {
    scene.remove(remoteLine);
    remoteLine.traverse(o => {
      o.geometry?.dispose();
      if (o.material) {
        const a = Array.isArray(o.material) ? o.material : [o.material];
        a.forEach(m => {
          m.map?.dispose();
          m.dispose()
        })
      }
    });
    remoteLine = null
  }
  remoteLineParts = [];
}

function setRouteColor(col) {
  remoteLineParts.forEach(m => m.material.color.set(col));
}

function drawRemoteLine(option, attempted = false) {
  clearRemoteLine();
  const start = new THREE.Vector3(19.4, 1.9, 7.1),
    end = systemTargets[option.id].clone(),
    mid = start.clone().add(end).multiplyScalar(.5);
  mid.y = 8;
  const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
  remoteLine = new THREE.Group();
  remoteLine.name = '接続経路';
  remoteLine.userData = {
    source: start.clone(),
    target: end.clone(),
    id: option.id,
    attempted
  };
  scene.add(remoteLine);
  const color = option.locked ? 0x8299ac : 0x32bce7;
  for (let i = 0; i < 48; i += 2) {
    const a = curve.getPointAt(i / 48),
      b = curve.getPointAt((i + 1) / 48),
      d = b.clone().sub(a);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, d.length(), 6), new THREE
      .MeshBasicMaterial({
        color,
        depthTest: false,
        transparent: true,
        opacity: .85
      }));
    m.position.copy(a).add(b).multiplyScalar(.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    m.renderOrder = 3;
    remoteLine.add(m);
    remoteLineParts.push(m)
  }
  const dir = curve.getTangentAt(1);
  const arrow = new THREE.Mesh(new THREE.ConeGeometry(.2, .55, 10), new THREE.MeshBasicMaterial({
    color,
    depthTest: false
  }));
  arrow.position.copy(end).addScaledVector(dir, -.2);
  arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  remoteLine.add(arrow);
  remoteLineParts.push(arrow);
  const halo = new THREE.Mesh(new THREE.RingGeometry(.75, .87, 40), new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
    depthTest: false
  }));
  halo.rotation.x = -Math.PI / 2;
  halo.position.copy(end);
  remoteLine.add(halo);
  remoteLineParts.push(halo);

}
$('#remoteExit').onclick = leaveRemotePC;
