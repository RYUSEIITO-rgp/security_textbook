/* 小物ユーティリティ（$、clamp、lerp など） */
"use strict";

/* ============================================================
   小物ユーティリティ
   ============================================================ */
var $ = function(s) {
  return document.querySelector(s);
};
var clamp = function(v, a, b) {
  return v < a ? a : (v > b ? b : v);
};
var lerp = function(a, b, t) {
  return a + (b - a) * t;
};
var TAU = Math.PI * 2;
