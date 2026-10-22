/* タッチ端末の判定と表示切替 */
"use strict";

function isTouchUI() { return 'ontouchstart' in window || window.matchMedia?.('(pointer: coarse)').matches; }
function resetTouchMovement() {
  joyId = null; joyActive = false; joyX = joyY = 0; keys = {};
  $('#joynub').style.left = '50%'; $('#joynub').style.top = '50%';
}
function syncTouchUI() {
  const touch = isTouchUI();
  document.body.classList.toggle('touchDevice', !!touch);
  document.body.classList.toggle('remoteSelecting', remoteMode === 'select' && !$('#remotePanel').hidden);
  document.body.classList.toggle('dialogueOpen', $('#dialogue').classList.contains('show'));
  document.body.classList.toggle('cinematicOpen', gameState === 'climax');
  document.body.classList.toggle('tutorialOpen', !!tutorialActive);
}
