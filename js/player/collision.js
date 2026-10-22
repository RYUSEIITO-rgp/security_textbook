/* 壁との衝突処理 */
"use strict";

/* ============================================================
   コリジョン解決
   ============================================================ */
var PR = 0.38;

function resolveCollisions(pos) {
  for (var i = 0; i < colliders.length; i++) {
    var c = colliders[i];
    var cx = clamp(pos.x, c.x0, c.x1),
      cz = clamp(pos.z, c.z0, c.z1);
    var dx = pos.x - cx,
      dz = pos.z - cz,
      d2 = dx * dx + dz * dz;
    if (d2 < PR * PR) {
      if (d2 > 1e-6) {
        var d = Math.sqrt(d2);
        pos.x = cx + dx / d * PR;
        pos.z = cz + dz / d * PR;
      } else {
        // inside: push to nearest face
        var left = pos.x - c.x0,
          right = c.x1 - pos.x,
          bot = pos.z - c.z0,
          topp = c.z1 - pos.z;
        var m = Math.min(left, right, bot, topp);
        if (m === left) pos.x = c.x0 - PR;
        else if (m === right) pos.x = c.x1 + PR;
        else if (m === bot) pos.z = c.z0 - PR;
        else pos.z = c.z1 + PR;
      }
    }
  }
  pos.x = clamp(pos.x, -19, 25);
  pos.z = clamp(pos.z, -17, 18);
}
