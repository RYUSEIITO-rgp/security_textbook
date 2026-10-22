/* 操作チュートリアル */
"use strict";

var tutorialActive = false, tutorialIndex = 0;
const tutorialSteps = [
  ['objwrap', '次のアクション', '左上には、次にすることを表示する。集めた情報もここに残る。'],
  ['minimap', '街の地図', '右上で自分の位置と行き先を確認しよう。'],
  ['movement', '移動する', '十字キーで移動。地面の青い点をたどると、次の目的地に着く。'],
  ['interaction', '調べる・次へ', '近づくと操作の案内が出る。Enterで調べたり、説明を進めたりできる。'],
  ['companion', '相棒AI「AIA」', '近くに浮かぶAIが、手掛かりや防御の仕組みを教えてくれる。']
];
function startTutorial() {
  tutorialActive = true; tutorialIndex = 0; inputLocked = true;
  resetTouchMovement(); $('#tutorial').hidden = false; syncTouchUI(); renderTutorial();
}
function renderTutorial() {
  const step = tutorialSteps[tutorialIndex], touch = isTouchUI();
  $('#tutorialCount').textContent = (tutorialIndex + 1) + ' / ' + tutorialSteps.length;
  $('#tutorialTitle').textContent = step[1];
  let text = step[2];
  if (touch && step[0] === 'movement') text = '左下のスティックで移動。地面の青い点をたどって進もう。';
  if (touch && step[0] === 'interaction') text = '右下の「調べる」をタップ。説明は画面内のボタンをタップして進めよう。';
  $('#tutorialText').textContent = text;
  $('#tutorialNext').textContent = (tutorialIndex === tutorialSteps.length - 1 ? 'はじめる' : '次へ') + (touch ? '　タップ' : '　↵ Enter');
  $('#prompt').classList.toggle('show', step[0] === 'interaction' && !touch);
  requestAnimationFrame(positionTutorial);
}
function positionTutorial() {
  if (!tutorialActive) return;
  const kind = tutorialSteps[tutorialIndex][0];
  let target = kind === 'movement' ? (isTouchUI() ? $('#joy') : null) : kind === 'interaction' ? (isTouchUI() ? $('#tact') : null) : kind === 'companion' ? null : $('#' + kind);
  let rect = target?.getBoundingClientRect();
  if (kind === 'companion' && aiDrone) {
    camera.updateMatrixWorld();
    const v = aiDrone.position.clone().project(camera);
    rect = {left:clamp((v.x*.5+.5)*W-42,14,W-98),top:clamp((-v.y*.5+.5)*H-42,14,H-98),width:84,height:84};
  }
  if (!rect || !rect.width) rect = {left:W*.32,top:H*.5,width:W*.36,height:H*.18};
  const f = $('#tutorialFocus');
  f.style.left = (rect.left - 6) + 'px'; f.style.top = (rect.top - 6) + 'px';
  f.style.width = (rect.width + 12) + 'px'; f.style.height = (rect.height + 12) + 'px';
  const card = $('#tutorialCard'), ch = card.offsetHeight || 210, cw = Math.min(360, W - 28);
  card.style.width = cw + 'px';
  card.style.left = clamp(W/2-cw/2,14,W-cw-14) + 'px';
  const below = rect.top + rect.height + 20;
  card.style.top = (below + ch < H - 16 ? below : Math.max(14,rect.top - ch - 20)) + 'px';
}
function nextTutorial() {
  tutorialIndex++;
  if (tutorialIndex < tutorialSteps.length) { renderTutorial(); return; }
  tutorialActive = false; $('#tutorial').hidden = true; $('#prompt').classList.remove('show'); syncTouchUI();
  say('AIA', '相棒のAIAだ。まずはカフェで手掛かりを集めよう', [{label:'探索を開始',primary:true,close:true}]);
}
$('#tutorialNext').onclick = nextTutorial;
$('#cinematicNext').onclick = function() { if (gameState === 'climax') advanceClimax(); };
$('#bannerNext').onclick = function() { if (gameState === 'climax') advanceClimax(); };
window.addEventListener('resize', function() { syncTouchUI(); positionTutorial(); speechAnchor = null; });
