/* 種明かし画面、AIヒント、画面遷移 */
"use strict";

/* ============================================================
   種明かし
   ============================================================ */
function showDebrief(escaped) {
  gameState = 'end';
  keys = {};
  $('#debriefTitle').textContent = escaped ? '逃げ切った。あなたは監視されていた' : '捕まった。あなたは監視されていた';
  const items = [
    ['s1_laptop', 'フィッシング耐性MFA', '偽サイトではパスキー認証が成立しない。'],
    ['s2_memo', '端末状態の確認', '正しいID・PWでも、端末の条件で拒否。'],
    ['s3_admin', 'JIT', '特権は必要な時間だけ有効化。'],
    ['s4_alt', '区画の制御 × Deception', '横移動を防ぎ、別の入口に囮を置く。']
  ];
  let html =
    '<div class="reveal-card"><div class="h">入手した資料は、囮だった</div><p>共有フォルダも開発仕様書もDeception。フォルダへの接触や操作は全て監視されていた。</p><div class="note">※警察の追跡はあくまで演出</div></div><div class="reveal-card"><div class="h">今回の記録</div>';
  items.forEach((l, i) => {
    const done = find(l[0]).done;
    html += '<div class="lesson"><div class="ic">' + (i + 1) + '</div><div><div class="lt">' + l[1] +
      (done ? '' : '（未体験）') + '</div><div class="ld">' + l[2] + '</div></div></div>'
  });
  $('#debrief-body').innerHTML = html + '</div>';
  showScreen('s-debrief');
}
/* ============================================================
   AIエージェント ヒント
   ============================================================ */
var aiHintState = 0;

function aiHint(text) {
  say('AIA', text, [{
    label: 'OK',
    primary: true,
    close: true
  }]);
}

/* ============================================================
   画面遷移
   ============================================================ */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(function(s) {
    s.classList.remove('show');
  });
  if (id) $('#' + id).classList.add('show');
  fitPanels();
}

function hideScreens() {
  document.querySelectorAll('.screen').forEach(function(s) {
    s.classList.remove('show');
  });
}

var chosenAvatar = DEFAULT_AVATAR;
