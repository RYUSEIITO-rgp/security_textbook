/* 起動処理 */
"use strict";

/* ============================================================
   初期化
   ============================================================ */
function boot() {
  initThree();
  // Fixed camera: arrows and Enter are sufficient.
  bindJoy();
  buildWorld();

  // touch controls for touch devices
  if ('ontouchstart' in window) {
    $('#touch').classList.add('on');
    document.body.classList.add('touchDevice');
    $('#pk').textContent = 'タップ';
    $('#ptxt').textContent = '調べる';
  }
  // hide loader, show avatar
  setTimeout(function() {
    $('#loader').classList.add('hide');
    showScreen('s-brief');
  }, 400);
  clock.start();
  animate();
}
