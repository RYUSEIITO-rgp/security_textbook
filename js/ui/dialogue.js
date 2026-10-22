/* 会話ウィンドウ、話者、画面イメージ */
"use strict";

/* ============================================================
   ダイアログ システム
   ============================================================ */
var speakerMap = {
  AIA: 'spk-aia',
  SYSTEM: 'spk-sys',
  YOU: 'spk-you',
  DENY: 'spk-deny',
  EXPLAIN: 'spk-aia'
};
var speakerName = {
  AIA: 'AIA ／ 相棒AI',
  SYSTEM: 'SYSTEM',
  YOU: 'YOU',
  DENY: 'アクセス失敗',
  EXPLAIN: 'AIA ／ なぜ防げたのか'
};

function screenPreview(kind) {
  const field = (label, value) => '<div class="mockField"><small>' + label + '</small><div>' + value +
    '</div></div>';
  const row = (name, meta, focus) => '<div class="mockRow' + (focus ? ' mockFocus' : '') + '"><span>' +
    name + '</span><small>' + meta + '</small></div>';
  const action = text => '<div class="mockAction">' + text + '</div>';
  const warning = text => '<div class="mockWarning">× ' + text + '</div>';
  let title = '',
    address = '',
    content = '';
  if (kind === 'notice') {
    title = 'Wi-Fi 再接続のご案内';
    address = 'reconnect.example ／ 偽の案内';
    content = '<h3>接続を続けるには</h3><p>会社のクラウドに再ログインしてください。</p>' + action('会社のクラウドへ進む');
  } else if (kind === 'cloud' || kind === 'passkey' || kind === 'phishingDenied') {
    title = 'KAKU CLOUD';
    address = 'cloud-reconnect.example ／ 偽サイト';
    content = '<h3>会社アカウントでログイン</h3>' + field('社員ID', 'employee@kaku.example') + (kind === 'cloud' ?
      action('パスキーでログイン') : kind === 'passkey' ? '<div class="mockStatus">パスキーの確認を要求中…</div>' : warning(
        'このサイトではパスキーを使えません'));
  } else if (kind === 'login' || kind === 'deviceDenied') {
    title = 'KAKU 社員ポータル';
    address = 'portal.kaku.example';
    content = '<div class="mockColumns">' + field('社員ID', 'employee@kaku.example') + field('パスワード',
      '••••••••••') + '</div><div class="mockStatus">✓ ID・パスワードは一致</div>' + (kind === 'login' ? action(
      '端末を確認しています…') : warning('会社の利用条件を満たさない端末です'));
  } else if (kind === 'admin' || kind === 'jitDenied') {
    title = 'KAKU システム管理';
    address = 'admin.kaku.example ／ 点検担当者としてログイン中';
    content = row('製品データの保管庫', '保存済み', false) + row('新製品データ', '取り出しを要求', true) + row('重要操作の権限', '点検時間は終了',
      false) + (kind === 'admin' ? action('データの取り出しを実行中…') : warning('現在、データを取り出す権限がありません'));
  } else if (kind === 'partner') {
    title = '取引先との共有フォルダ';
    address = 'share.kaku.example ／ 取引先としてログイン中';
    content = '<div class="mockPath">共有フォルダ / 取引先向け</div>' + row('▤ 製品カタログ.pdf', '公開資料', false) + row(
      '▤ 打合せ議事録.pdf', '共有資料', false) + '<div class="mockStatus">「新製品」で検索：該当する資料なし</div>';
  } else if (kind === 'development' || kind === 'segmentDenied') {
    title = '開発チームの保存場所';
    address = '共有フォルダ → 開発チーム';
    content = '<div class="mockZones"><span>取引先との<br>共有フォルダ</span><b>' + (kind === 'segmentDenied' ? '×' :
      '→') + '</b><span>開発チームの<br>保存場所</span></div>' + (kind === 'development' ?
      '<div class="mockStatus">接続を確認中…</div>' : warning('この場所からは接続できません'));
  } else if (kind === 'product') {
    title = '資料共有フォルダ';
    address = '別の入口から接続中';
    content = '<div class="mockPath">共有フォルダ / 開発資料</div>' + row('▤ 新製品_開発仕様書.pdf', '社外秘', true) + row(
      '▤ 製品リリース計画.pdf', '社外秘', false) + '<div class="mockStatus">新製品の仕様・開発スケジュールを発見</div>';
  }
  return '<div class="mockBrowser"><div class="mockChrome"><i></i><i></i><i></i><span>画面イメージ</span></div><div class="mockAddress">' +
    address + '</div><div class="mockBody"><div class="mockBrand">' + title + '</div>' + content +
    '</div></div>';
}

function fitPanels() {
  requestAnimationFrame(function() {
    const specs = [
      ['dialogue', window.innerHeight - (isTouchUI() && $('#dialogue').classList.contains('aiSpeech') ? 125 : 28)],
      ['remotePanel', window.innerHeight - 170],
      ['s-briefContent', window.innerHeight - 32],
      ['s-debriefContent', window.innerHeight - 32]
    ];
    specs.forEach(function(spec) {
      const node = document.getElementById(spec[0]);
      if (!node || !node.offsetHeight) return;
      node.style.setProperty('--fit-scale', '1');
      const scale = Math.min(1, Math.max(1, spec[1]) / node.offsetHeight,
        (window.innerWidth - 28) / node.offsetWidth);
      node.style.setProperty('--fit-scale', String(scale));
    });
  });
}
window.addEventListener('resize', fitPanels);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitPanels);

function say(speaker, text, buttons, preview) {
  inputLocked = true;
  keys = {};
  speechAnchor = null;
  if (typeTimer) clearInterval(typeTimer);
  typeTimer = null;
  finishTyping = null;
  if (speaker === 'DENY') {
    setRouteColor(0xff6778);
    if (activeRouteId) {
      blockedRoutes.add(activeRouteId);
      if (activeRouteId.startsWith('s4_')) blockedRoutes.add('s4_partner');
    }
  }
  resetTouchMovement();
  $('#prompt').classList.remove('show');
  const bubble = speaker === 'AIA' || speaker === 'EXPLAIN';
  const d = $('#dialogue');
  d.className = 'panel ' + (bubble ? 'aiSpeech' : 'centerPopup ' + (speaker === 'DENY' ? 'failure' :
    'actionPopup'));
  d.style.left = '';
  d.style.top = '';
  d.style.width = '';
  $('#dialogueShade').classList.toggle('show', !bubble);
  $('#speechTail').classList.toggle('show', bubble);
  $('#aiaSpeaker').hidden = !bubble || !isTouchUI();
  syncTouchUI();
  $('#dspk').className = 'spk ' + (speakerMap[speaker] || 'spk-aia');
  $('#dspkname').textContent = bubble ? 'AIA ／ 相棒AI' : (speakerName[speaker] || speaker);
  $('#dialogueTitle').textContent = speaker === 'DENY' ? '×　アクセスはブロックされた。' : '';
  $('#screenPreview').hidden = !preview;
  $('#screenPreview').innerHTML = preview ? screenPreview(preview) : '';
  $('#dtxt').textContent = text;
  $('#dtxt').onclick = null;
  dialogueIndex = 0;
  dialogueButtons = buttons || [{
    label: '閉じる',
    close: true
  }];
  const wrap = $('#dbtns');
  wrap.innerHTML = '';
  dialogueButtons.forEach(b => {
    const button = document.createElement('button');
    button.className = 'btn' + (b.primary ? ' primary' : '');
    button.textContent = b.label + (isTouchUI() ? '　タップ' : '　↵ Enter');
    button.onclick = function() {
      sfxBlip();
      if (b.onClick) b.onClick();
      if (b.close) closeDialogue();
    };
    wrap.appendChild(button);
  });
  d.classList.add('show');
  syncTouchUI();
  highlightDialogue();
  positionSpeech();
  fitPanels();
}
var speechAnchor = null,
  seatedAtCafe = false;
var typeTimer = null,
  explanationTitle = '働いた防御';

function explain(title, text, buttons) {
  explanationTitle = title;
  say('EXPLAIN', text, buttons);
}

function positionSpeech() {
  const d = $('#dialogue');
  if (!d.classList.contains('show') || !d.classList.contains('aiSpeech') || !aiDrone || !player) return;
  camera.updateMatrixWorld();
  const v = aiDrone.position.clone().project(camera);
  const ax = (v.x * .5 + .5) * W,
    ay = (-v.y * .5 + .5) * H;
  if (!speechAnchor || speechAnchor.W !== W || speechAnchor.H !== H) {
    const width = Math.min(330, W - 28),
      height = d.offsetHeight || 200;
    speechAnchor = {
      x: clamp(ax + 28, 14, Math.max(14, W - width - 14)),
      y: clamp(ay - height * .7, 14, Math.max(14, H - height - 14)),
      width,
      W,
      H
    };
  }
  const a = speechAnchor,
    height = d.offsetHeight || 200;
  d.style.width = a.width + 'px';
  d.style.left = a.x + 'px';
  d.style.top = a.y + 'px';
  if (isTouchUI()) {
    // Lock the bubble and the AIA portrait together, so the tail always has a visible speaker.
    const scale = Number(d.style.getPropertyValue('--fit-scale')) || 1;
    const bh = height * scale;
    const x = clamp((W - a.width) / 2, 14, W - a.width - 14);
    const y = clamp(H * .52 - bh / 2, 18, Math.max(18, H - bh - 110));
    d.style.left = x + 'px';
    d.style.top = y + 'px';
    const tipX = x + 48, tipY = y + bh + 22;
    $('#aiaSpeaker').style.left = (tipX - 28) + 'px';
    $('#aiaSpeaker').style.top = tipY + 'px';
    $('#speechTail').setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    $('#tailPolygon').setAttribute('points', (tipX - 12) + ',' + (y + bh - 1) + ' ' +
      tipX + ',' + tipY + ' ' + (tipX + 12) + ',' + (y + bh - 1));
    $('#speechTail').classList.add('show');
  } else {
    const edge = ax < a.x + a.width / 2 ? a.x + 1 : a.x + a.width - 1,
      base = clamp(ay, a.y + 24, a.y + height - 24);
    $('#speechTail').setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    $('#tailPolygon').setAttribute('points', edge + ',' + (base - 10) + ' ' + ax + ',' + ay + ' ' + edge + ',' + (base + 10));
    $('#speechTail').classList.toggle('show', v.z >= -1 && v.z <= 1);
  }
}

function closeDialogue() {
  if (typeTimer) {
    clearInterval(typeTimer);
    typeTimer = null;
  }
  $('#dialogue').classList.remove('show');
  $('#dialogueShade').classList.remove('show');
  $('#speechTail').classList.remove('show');
  $('#aiaSpeaker').hidden = true;
  syncTouchUI();
  finishTyping = null;
  keys = {};
  if (gameState === 'explore') {
    if (remoteMode) openRemoteMenu();
    else inputLocked = false;
  }
}

function nextBtn(fn, label) {
  return {
    label: label || '▶ 次へ',
    primary: true,
    onClick: fn
  };
}
