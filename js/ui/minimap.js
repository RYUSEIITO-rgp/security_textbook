/* ミニマップ */
"use strict";

/* ============================================================
   ミニマップ
   ============================================================ */
var mapcv, mapctx;
// world x:[-95,95] z:[-8,62] -> map
function W2M(x, z) {
  return {
    x: (x + 20) / 46 * 300,
    y: (z + 18) / 37 * 300
  };
}

function drawMinimap() {
  if (!mapctx) {
    mapcv = $('#mapcv');
    mapctx = mapcv.getContext('2d');
  }
  const c = mapctx;
  c.clearRect(0, 0, 300, 300);
  c.fillStyle = '#0b1723';
  c.fillRect(0, 0, 300, 300);

  function rect(x, z, w, d, col) {
    const p = W2M(x, z);
    c.fillStyle = col;
    c.fillRect(p.x, p.y, w / 46 * 300, d / 37 * 300)
  }
  rect(-3.5, -18, 7, 37, '#253642');
  rect(-20, 3.85, 40, 4.9, '#253642');
  rect(-14.7, -6.3, 11.2, 9.8, '#5a5140');
  rect(2.45, -13.3, 11.9, 16.8, '#294a60');
  rect(15.4, 4.8, 8, 8, '#44315b');
  c.fillStyle = '#b4cddd';
  c.font = '11px sans-serif';
  c.fillText('CAFE', 52, 83);
  c.fillText('会社', 160, 26);
  c.fillText('自宅', 244, 226);
  if (gameState === 'explore' && !remoteMode && guidePath.length) {
    c.strokeStyle = '#65b9ff';
    c.lineWidth = 2;
    c.beginPath();
    guidePath.forEach((p, i) => {
      const q = W2M(p.x, p.z);
      i ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y)
    });
    c.stroke()
  }
  interacts.forEach(function(it) {
    if (it.hidden || it.remote || it.clueTaken || it.done) return;
    const p = W2M(it.pos.x, it.pos.z);
    c.fillStyle = it.id === 's4_alt' ? '#4dffb0' : '#ffc24b';
    c.beginPath();
    c.arc(p.x, p.y, 4, 0, TAU);
    c.fill();
    if (it === guideTarget) {
      c.strokeStyle = 'white';
      c.beginPath();
      c.arc(p.x, p.y, 8, 0, TAU);
      c.stroke()
    }
  });
  if (gameState === 'chase') police.forEach(p => {
    const q = W2M(p.grp.position.x, p.grp.position.z);
    c.fillStyle = '#ff5160';
    c.beginPath();
    c.arc(q.x, q.y, 4, 0, TAU);
    c.fill()
  });
  if (player) {
    const p = W2M(player.position.x, player.position.z);
    c.fillStyle = chosenAvatar.accent;
    c.beginPath();
    c.arc(p.x, p.y, 5, 0, TAU);
    c.fill();
    c.strokeStyle = 'white';
    c.stroke();
  }
}
