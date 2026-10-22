/* シナリオ S1〜S4（研修内容の本体） */
"use strict";

/* ============================================================
   シナリオ フロー
   ============================================================ */
function markDone(key, interactId) {
  var o = document.querySelector('.obj[data-k="' + key + '"]');
  if (o) {
    o.classList.add('done');
    o.classList.remove('active');
  }
  if (interactId) {
    var it = find(interactId);
    if (it) it.done = true;
  }
  sfxOK();
}

function find(id) {
  for (var i = 0; i < interacts.length; i++)
    if (interacts[i].id === id) return interacts[i];
  return null;
}

/* ---- S1: フィッシング耐性MFA ---- */
function flowS1(it) {
  say('AIA', 'カフェで分かった利用サービスを狙おう。社員を偽のクラウド画面に誘導して、認証を試してみる。', [nextBtn(s1b, '侵入を試す')]);
}

function s1b() {
  say('SYSTEM', '社員が偽のログイン画面を開いた。', [nextBtn(s1c)], 'cloud');
}

function s1c() {
  say('SYSTEM', '社員がIDを入力。続いて、パスキーで認証…', [nextBtn(s1d)], 'passkey');
}

function s1d() {
  sfxDeny();
  say('DENY', '偽サイトではパスキーを利用できないためだ…', [nextBtn(s1e)], 'phishingDenied');
}

function s1e() {
  explain('フィッシング耐性MFA', '誘導は成功した。でも今のはフィッシング耐性MFAだな。パスキーは正規のサイトでしか使えないから、偽画面では認証できなかったんだ。', [{
    label: '自宅へ向かう',
    primary: true,
    onClick: function() {
      employeeLead = true;
      find('s1_laptop').clueTaken = true;
      seatedAtCafe = false;
      markDone('s1', 's1_laptop');
      activeRouteId = '';
      closeDialogue();
      updateNextAction();
    }
  }]);
}

/* ---- S2: 端末状態の確認 ---- */
function flowS2(it) {
  say('AIA', 'カフェで拾ったIDとパスワードが使えそうだ。社員のログイン画面を開いて、自宅PCからログインしてみよう。', [nextBtn(s2b, 'ログインする')]);
}

function s2a() {
  say('AIA', '拾ったID・PWで、自分の端末からログインしよう。', [nextBtn(s2b)]);
}

function s2b() {
  say('SYSTEM', 'ID／パスワードを入力… 資格情報の照合は成功。ただし、ログインには続きがある…', [nextBtn(s2c)], 'login');
}

function s2c() {
  sfxDeny();
  say('DENY', 'ID・PWは一致したが、この端末が会社の利用条件を満たさないためだ…', [nextBtn(s2d)], 'deviceDenied');
}

function s2d() {
  explain('端末状態の確認', '今のは端末状態の確認だな。ID・PWが正しくても、会社の管理条件を満たさない端末は弾かれるんだ。', [{
    label: 'PCの接続先に戻る',
    primary: true,
    onClick: function() {
      markDone('s2', 's2_memo');
      closeDialogue();
    }
  }]);
}

/* ---- S3: 特権ID管理・JIT ---- */
function flowS3(it) {
  say('AIA', 'システム担当者の管理画面に侵入できそうだ…新製品のデータを取り出してみよう。', [nextBtn(s3a, 'データを取り出す')]);
}

function s3a() {
  say('SYSTEM', '新製品のデータを取り出そうとしている…', [nextBtn(s3b)], 'admin');
}

function s3b() {
  sfxDeny();
  say('DENY', 'データを取り出すための権限が、今は使えないためだ…', [nextBtn(s3d)], 'jitDenied');
}

function s3c() {
  say('SYSTEM', '必要な権限を使うには、会社の担当者による確認が必要だ。ここからは先へ進めない。', [nextBtn(s3d)], 'jitDenied');
}

function s3d() {
  explain('特権ID管理・JIT', '今のはJITだな。大事な操作ができる権限は、作業中だけ使える仕組みだ。点検の時間は終わっていて、今はデータを取り出せないんだ。', [{
    label: 'PCの接続先に戻る',
    primary: true,
    onClick: function() {
      markDone('s3', 's3_admin');
      closeDialogue();
    }
  }]);
}

/* ---- S4: マイクロセグメンテーション + Deception ---- */
var partnerSeen = false,
  microExperienced = false,
  altServer = null,
  srvLight = null;

function flowS4Partner(it) {
  say('AIA', '取引先から共有されたフォルダが閲覧できそうだ…中の資料を漁ってみよう。', [nextBtn(s4p2, '資料を探す')]);
}

function s4p2() {
  say('SYSTEM', '新製品の資料は見つからない。ここには、取引先向けの資料しかないようだ…', [nextBtn(s4p3)], 'partner');
}

function s4p3() {
  partnerSeen = true;
  find('s4_partner').done = true;
  say('AIA', 'ここには欲しい資料が無い。別のフォルダにアクセスしてみよう。', [nextBtn(flowS4Dev, '別のフォルダにアクセスする')]);
}

function flowS4Dev(it) {
  if (!partnerSeen) {
    flowS4Partner(it);
    return;
  }
  activeRouteId = 's4_dev';
  drawRemoteLine({
    id: 's4_dev',
    name: '開発チームの保存場所'
  }, true);
  say('SYSTEM', '開発チームの保存場所につなごうとしている…', [nextBtn(s4d2, '結果を見る')], 'development');
}

function s4d2() {
  sfxDeny();
  say('DENY', '取引先向けの資料の場所から、開発チームの保存場所へはつながらないためだ…', [nextBtn(s4Why)], 'segmentDenied');
}

function s4Why() {
  explain('マイクロセグメンテーション', '今のはマイクロセグメンテーションだな。システムを区切り、アクセス範囲を限定する考え方だ。僕がほかの入口をまとめて試してみようか？', [nextBtn(
    revealAltServer, 'AIAに探してもらう')]);
}

function s4d3() {
  say('AIA', 'この道は行き止まりだな。僕がいろいろな入口をまとめて試して、入れる場所を探そうか？', [nextBtn(revealAltServer, 'AIAに探してもらう')]);
}

function revealAltServer() {
  const token = ++aiSearchSerial;
  remoteMode = 'action';
  keys = {};
  say('SYSTEM', 'AIAが、いろいろな入口を調べている…', []);
  const results = document.createElement('div');
  results.className = 'searchResults';
  $('#dtxt').appendChild(results);
  const entries = [
    ['社員向けのページ', 'ブロックされた', 's2_memo'],
    ['システム管理画面', 'ブロックされた', 's3_admin'],
    ['開発チームの保存場所', 'ブロックされた', 's4_dev'],
    ['別の資料共有サイト', 'つながった', 's4_alt']
  ];
  entries.forEach((entry, i) => setTimeout(function() {
    if (token !== aiSearchSerial || gameState !== 'explore') return;
    drawRemoteLine({
      id: entry[2],
      name: entry[0]
    }, true);
    if (i < 3) setRouteColor(0xff6778);
    const row = document.createElement('div');
    row.className = 'searchResult ' + (i === 3 ? 'found' : 'rejected');
    const name = document.createElement('span');
    name.textContent = entry[0];
    const result = document.createElement('b');
    result.textContent = entry[1];
    row.appendChild(name);
    row.appendChild(result);
    results.appendChild(row);
    fitPanels();
    if (i === 3) setTimeout(function() {
      if (token !== aiSearchSerial || gameState !== 'explore') return;
      microExperienced = true;
      find('s4_dev').done = true;
      find('s4_alt').hidden = false;
      activeRouteId = 's4_alt';
      if (altServer) {
        altServer.visible = true;
        altServer.scale.set(.01, .01, .01);
      }
      if (srvLight) srvLight.intensity = 0;
      altReveal = .001;
      say('AIA', 'ひとつだけ、つながる資料共有サイトを見つけた！ここを調べてみよう。', [nextBtn(s4a2, '資料を探す')]);
    }, 650);
  }, 500 * (i + 1)));
}
var altReveal = 0,
  aiSearchSerial = 0;

function flowS4Alt(it) {
  say('AIA', '別の入口から、資料共有サイトに接続する。', [nextBtn(s4a2)]);
}

function s4a2() {
  say('SYSTEM', '接続成功。ファイル一覧を取得中…「新製品_開発仕様書.pdf」を発見！', [nextBtn(s4a3)], 'product');
}

function s4a3() {
  say('YOU', 'これだ。目的の機密情報。取得する。', [{
    label: '資料を取得する',
    primary: true,
    onClick: function() {
      markDone('s4', 's4_alt');
      closeDialogue();
      triggerMissionComplete();
    }
  }]);
}
