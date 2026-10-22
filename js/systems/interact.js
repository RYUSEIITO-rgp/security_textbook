/* 「調べる」対象の登録と判定 */
"use strict";

/* ============================================================
   インタラクト登録
   ============================================================ */
var interacts = []; // {id,pos,r,label,fn,done,hidden,marker}
function registerInteract(id, pos, r, label, fn, opt) {
  interacts.push({
    id: id,
    pos: pos,
    r: r,
    label: label,
    fn: fn,
    done: false,
    hidden: opt && opt.hidden,
    marker: opt && opt.marker,
    repeat: opt && opt.repeat
  });
}
var nearInteract = null;

function updateInteractPrompt() {
  if (inputLocked) {
    $('#prompt').classList.remove('show');
    nearInteract = null;
    return;
  }
  var best = null,
    bestD = 999;
  for (var i = 0; i < interacts.length; i++) {
    var it = interacts[i];
    if (it.hidden || it.remote || it.clueTaken || (it.done && !it.repeat) || (it.id === 's1_laptop' && !
        credentialLead)) continue;
    var d = Math.hypot(player.position.x - it.pos.x, player.position.z - it.pos.z);
    if (d < it.r && d < bestD) {
      bestD = d;
      best = it;
    }
  }
  nearInteract = best;
  var p = $('#prompt');
  if (best) {
    $('#ptxt').textContent = best.label;
    p.classList.add('show');
  } else p.classList.remove('show');
}

function tryInteract() {
  if (nearInteract) {
    sfxBlip();
    nearInteract.fn(nearInteract);
  }
}
