/* Лаунчер «Лагуна». Навмисно ES5: браузер VIDAA — Chromium 84, але без ризику. */
(function () {
  'use strict';

  var C = window.LAUNCHER_CONFIG || { tiles: [], wallpapers: [], weather: null };
  function $(id) { return document.getElementById(id); }
  function store(key, val) {
    try {
      if (val === undefined) { return localStorage.getItem(key); }
      localStorage.setItem(key, val);
    } catch (e) {}
    return null;
  }

  /* ---------- масштаб сцени 1280x720 під реальний viewport ---------- */
  var stage = $('stage');
  function fit() {
    var w = window.innerWidth || 1280, h = window.innerHeight || 720;
    var s = Math.min(w / 1280, h / 720);
    var x = Math.round((w - 1280 * s) / 2), y = Math.round((h - 720 * s) / 2);
    stage.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')';
  }
  fit();
  window.addEventListener('resize', fit);

  /* ---------- годинник і дата ---------- */
  var DAYS = ['неділя', 'понеділок', 'вівторок', 'середа', 'четвер', 'п’ятниця', 'субота'];
  var MONTHS = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня',
                'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];
  var lastMinute = -1;
  function two(n) { return n < 10 ? '0' + n : '' + n; }
  function tick() {
    var d = new Date();
    if (d.getMinutes() === lastMinute) { return; }
    lastMinute = d.getMinutes();
    $('clock').textContent = two(d.getHours()) + ':' + two(d.getMinutes());
    $('date').textContent = DAYS[d.getDay()] + ', ' + d.getDate() + ' ' + MONTHS[d.getMonth()];
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- плитки ---------- */
  var dock = $('dock');
  var cells = [];
  var tiles = C.tiles || [];
  var n = tiles.length;
  var rows = Math.max(1, Math.ceil(n / 9));
  var perRow = Math.max(1, Math.ceil(n / rows));
  var focus = 0;

  function makeTile(t, i) {
    var a = document.createElement('a');
    a.className = 'cell st-' + (t.status || 'ok');
    a.href = t.url;
    a.style.width = (100 / perRow) + '%';

    var tile = document.createElement('div');
    tile.className = 'tile';

    var ico = document.createElement('span');
    ico.className = 'ico';
    ico.style.background = t.color || '#5B6B73';
    var icon = t.icon || t.name.charAt(0);
    if (icon.indexOf('.') > -1 || icon.indexOf('/') > -1) {
      var img = document.createElement('img');
      img.src = icon;
      img.alt = '';
      ico.appendChild(img);
    } else {
      ico.textContent = icon;
    }

    var name = document.createElement('span');
    name.className = 'name';
    name.textContent = t.name;

    tile.appendChild(ico);
    tile.appendChild(name);
    if (t.status === 'check' || t.status === 'no') {
      var b = document.createElement('span');
      b.className = 'badge';
      tile.appendChild(b);
    }
    a.appendChild(tile);

    /* режим курсора (браузер ТВ): наведення = фокус, клік відкриває посилання сам */
    a.addEventListener('mouseenter', function () { setFocus(i); });
    a.addEventListener('click', function () { store('lg_focus', '' + i); });
    return a;
  }

  function setFocus(i) {
    if (i < 0 || i >= n) { return; }
    if (cells[focus]) { cells[focus].className = cells[focus].className.replace(' is-focus', ''); }
    focus = i;
    cells[focus].className += ' is-focus';
  }

  var i;
  for (i = 0; i < n; i++) {
    cells[i] = makeTile(tiles[i], i);
    dock.appendChild(cells[i]);
  }
  if (n) {
    var saved = parseInt(store('lg_focus'), 10);
    setFocus(saved >= 0 && saved < n ? saved : 0);
  }

  function openFocused() {
    if (!n) { return; }
    store('lg_focus', '' + focus);
    window.location.href = tiles[focus].url;
  }

  /* ---------- пульт ---------- */
  document.addEventListener('keydown', function (e) {
    var k = e.keyCode;
    var handled = true;
    if (k === 37) { if (focus % perRow > 0) { setFocus(focus - 1); } }
    else if (k === 39) { if (focus % perRow < perRow - 1 && focus + 1 < n) { setFocus(focus + 1); } }
    else if (k === 38) { if (focus - perRow >= 0) { setFocus(focus - perRow); } }
    else if (k === 40) { setFocus(Math.min(focus + perRow, n - 1)); }
    else if (k === 13) { openFocused(); }
    else if (k === 403) { window.location.reload(); }      /* червона */
    else if (k === 404) { nextWallpaper(); }               /* зелена */
    else { handled = false; }                              /* Back не чіпаємо */
    if (handled) { e.preventDefault(); }
  });

  /* ---------- шпалери ---------- */
  var wps = C.wallpapers || [];
  var layers = [$('wpA'), $('wpB')];
  var front = 0;
  var wpIndex = parseInt(store('lg_wp'), 10);
  if (!(wpIndex >= 0)) { wpIndex = -1; }
  var wpBusy = false;

  function nextWallpaper() {
    if (!wps.length || wpBusy) { return; }
    wpBusy = true;
    wpIndex = (wpIndex + 1) % wps.length;
    store('lg_wp', '' + wpIndex);
    var src = wps[wpIndex];
    var img = new Image();
    img.onload = function () {
      var back = layers[1 - front];
      back.style.backgroundImage = 'url(' + src + ')';
      back.className = 'wp on';
      layers[front].className = 'wp';
      front = 1 - front;
      wpBusy = false;
    };
    img.onerror = function () { wpBusy = false; };
    img.src = src;
  }
  nextWallpaper();
  if (wps.length > 1) {
    setInterval(nextWallpaper, Math.max(20, C.wallpaperSeconds || 90) * 1000);
  }

  /* ---------- погода (Open-Meteo) ---------- */
  var W = C.weather;
  var SVG_OPEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">';
  var CLOUD = '<path d="M7 15h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6 6.5 4.25 4.25 0 0 0 7 15z"/>';
  var ICONS = {
    sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>',
    partly: '<circle cx="8" cy="8" r="3"/><path d="M8 2.2v1.3M2.2 8h1.3M3.9 3.9l.9.9M12.1 3.9l-.9.9"/><path d="M9.5 19h8a3.5 3.5 0 0 0 .4-6.97A5 5 0 0 0 8.6 11.6 3.75 3.75 0 0 0 9.5 19z"/>',
    cloud: '<path d="M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6 9.5 4.25 4.25 0 0 0 7 18z"/>',
    fog: CLOUD + '<path d="M5 18.5h14M7 21.5h10"/>',
    rain: CLOUD + '<path d="M8.5 18l-1 3M12.5 18l-1 3M16.5 18l-1 3"/>',
    snow: CLOUD + '<path d="M8 19.5h.01M12 19.5h.01M16 19.5h.01M10 22h.01M14 22h.01"/>',
    storm: CLOUD + '<path d="M12.5 16.5l-2 3h3l-2 3"/>'
  };
  function describe(code, isDay) {
    if (code === 0) { return [isDay ? 'sun' : 'moon', 'Ясно']; }
    if (code === 1) { return [isDay ? 'sun' : 'moon', 'Переважно ясно']; }
    if (code === 2) { return [isDay ? 'partly' : 'cloud', 'Мінлива хмарність']; }
    if (code === 3) { return ['cloud', 'Хмарно']; }
    if (code === 45 || code === 48) { return ['fog', 'Туман']; }
    if (code >= 51 && code <= 57) { return ['rain', 'Мряка']; }
    if (code >= 61 && code <= 67) { return ['rain', 'Дощ']; }
    if (code >= 71 && code <= 77) { return ['snow', 'Сніг']; }
    if (code >= 80 && code <= 82) { return ['rain', 'Злива']; }
    if (code === 85 || code === 86) { return ['snow', 'Снігопад']; }
    if (code >= 95) { return ['storm', 'Гроза']; }
    return ['cloud', ''];
  }
  function deg(v) {
    var r = Math.round(v);
    return (r < 0 ? '−' + Math.abs(r) : '' + r) + '°';
  }
  function renderWeather(d) {
    if (!d || !d.current) { return; }
    var info = describe(d.current.weather_code, d.current.is_day !== 0);
    $('wIcon').innerHTML = SVG_OPEN + ICONS[info[0]] + '</svg>';
    $('wTemp').textContent = deg(d.current.temperature_2m);
    $('wDesc').textContent = info[1];
    var meta = W.city || '';
    if (d.daily && d.daily.temperature_2m_max) {
      meta += ' · ↑' + deg(d.daily.temperature_2m_max[0]) + ' ↓' + deg(d.daily.temperature_2m_min[0]);
    }
    $('wMeta').textContent = meta;
    $('weather').className = 'weather';
  }
  function loadWeather() {
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + W.latitude +
      '&longitude=' + W.longitude +
      '&current=temperature_2m,weather_code,is_day' +
      '&daily=temperature_2m_max,temperature_2m_min&forecast_days=1&timezone=auto';
    var x = new XMLHttpRequest();
    x.open('GET', url, true);
    x.timeout = 15000;
    x.onload = function () {
      if (x.status !== 200) { return; }
      try {
        var d = JSON.parse(x.responseText);
        renderWeather(d);
        store('lg_weather', x.responseText);
      } catch (e) {}
    };
    x.send();
  }
  if (W) {
    try { renderWeather(JSON.parse(store('lg_weather'))); } catch (e) {}
    loadWeather();
    setInterval(loadWeather, Math.max(10, W.refreshMinutes || 30) * 60000);
  }
})();
