/* ボタンの割り当てと起動（最後に読み込む） */
"use strict";

$('#startBtn').onclick = function() {
  audio();
  startGame();
};
$('#prompt').onclick = function() { if (isTouchUI() && !inputLocked) confirmAction(); };
$('#replayBtn').onclick = function() {
  location.reload();
};

if (!window.THREE) {
  document.getElementById('loader').innerHTML =
    '<div class="l-in"><div class="lt">3Dエンジンの読み込みに失敗しました。再読み込みしてください。</div></div>';
} else {
  try {
    boot()
  } catch (e) {
    console.error(e);
    $('#loader').innerHTML =
      '<div class="l-in"><div class="lt">3D画面を起動できません。ブラウザーのハードウェアアクセラレーションを確認してください。</div></div>';
  }
}

