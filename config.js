/*
  НАЛАШТУВАННЯ ЛАУНЧЕРА — редагуй тільки цей файл.

  Як додати свою плитку: скопіюй один рядок у списку tiles і зміни значення.
    name   — підпис під плиткою
    url    — адреса, яка відкриється
    icon   — 1–2 літери АБО шлях до картинки (наприклад 'icons/youtube.png')
    color  — колір кружечка іконки (HEX)
    status — 'ok'    працює на ТВ
             'check' ще не перевірено на ТВ (жовта крапка)
             'no'    не працює на ТВ (плитка напівпрозора)
*/
window.LAUNCHER_CONFIG = {

  tiles: [
    { name: 'YouTube',      url: 'https://www.youtube.com/tv', icon: 'YT', color: '#FF0033', status: 'check' },
    { name: 'Netflix',      url: 'https://www.netflix.com/',   icon: 'N',  color: '#E50914', status: 'check' },
    { name: 'Megogo',       url: 'https://megogo.net/ua',      icon: 'M',  color: '#1FA8E0', status: 'check' },
    { name: 'Sweet.tv',     url: 'https://sweet.tv/',          icon: 'S',  color: '#F26B21', status: 'check' },
    { name: 'Київстар ТБ',  url: 'https://tv.kyivstar.ua/',    icon: 'K',  color: '#0095DA', status: 'check' },
    { name: 'Twitch',       url: 'https://www.twitch.tv/',     icon: 'T',  color: '#9146FF', status: 'check' },
    { name: 'Google',       url: 'https://www.google.com/',    icon: 'G',  color: '#4285F4', status: 'check' },
    /* ZONA: впиши адресу сайту, яким користуєшся, і прибери // на початку рядка */
    // { name: 'ZONA',      url: 'https://АДРЕСА/',            icon: 'Z',  color: '#2E7D32', status: 'check' },
    { name: 'Діагностика',  url: 'https://dobranskujdima1997-hue.github.io/hisenseTV/diag.html', icon: 'D', color: '#5B6B73', status: 'ok' }
  ],

  /* Погода (Open-Meteo, без ключа) */
  weather: {
    city: 'Чернівці',
    latitude: 48.29,
    longitude: 25.94,
    refreshMinutes: 30
  },

  /* Шпалери: файли з папки wallpapers. Додай свої (1920x1080, WebP або JPEG, до ~400 КБ). */
  wallpapers: [
    'wallpapers/sea1.webp',
    'wallpapers/sea3.webp',
    'wallpapers/sea4.webp',
    'wallpapers/sea5.webp',
    'wallpapers/sea6.webp',
    'wallpapers/sea7.webp'
  ],
  wallpaperSeconds: 90
};
