/* 効果音（失敗しても無視） */
"use strict";

/* ---- SFX (任意・失敗しても無視) ---- */
var AC = null;

function audio() {
  if (!AC) {
    try {
      AC = new(window.AudioContext || window.webkitAudioContext)();
    } catch (e) {}
  }
  if (AC && AC.state === 'suspended') {
    AC.resume();
  }
  return AC;
}

function beep(freq, dur, type, vol) {
  var a = audio();
  if (!a) return;
  try {
    var o = a.createOscillator(),
      g = a.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq;
    g.gain.value = 0;
    o.connect(g);
    g.connect(a.destination);
    var t = a.currentTime;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol || .12, t + .01);
    g.gain.exponentialRampToValueAtTime(.0001, t + (dur || .12));
    o.start(t);
    o.stop(t + (dur || .12) + .02);
  } catch (e) {}
}

function sfxOK() {
  beep(660, .08, 'square', .1);
  setTimeout(function() {
    beep(990, .1, 'square', .1);
  }, 70);
}

function sfxDeny() {
  beep(180, .18, 'sawtooth', .14);
  setTimeout(function() {
    beep(120, .22, 'sawtooth', .12);
  }, 90);
}

function sfxBlip() {
  beep(520, .05, 'triangle', .07);
}
