#!/usr/bin/env node
/* Writes the current numbers straight into index.html so the page is right
   the moment it opens, before any script or data file has loaded.
   Reads only the committed data/companies.json. Never fails a deploy. */
const fs = require('fs'), path = require('path');
try {
  const root = path.join(__dirname, '..');
  const file = path.join(root, 'index.html');
  const data = JSON.parse(fs.readFileSync(path.join(root, 'data/companies.json'), 'utf8'));
  let html = fs.readFileSync(file, 'utf8');

  // same founder count as app.js
  const set = new Set();
  data.forEach(c => (c.founders || '').split(/,|\band\b|&/).forEach(f => {
    f = f.trim(); if (f.length > 2) set.add(f.toLowerCase());
  }));

  const put = (id, val) => {
    const re = new RegExp('(<[a-z0-9]+[^>]*\\bid="' + id + '"[^>]*>)([^<]*)(<)', 'i');
    if (!re.test(html)) { console.warn('[bake] #' + id + ' not found, skipped'); return; }
    html = html.replace(re, (m, a, old, z) => a + val + z);
  };
  put('stat-startups', data.length);
  put('stat-founders', set.size);
  html = html.replace(/(<[a-z0-9]+[^>]*\bid="radar-sub"[^>]*>[^<]*?)\d+( and counting)/i, '$1' + data.length + '$2');

  fs.writeFileSync(file, html);
  console.log('[bake] index.html: ' + data.length + ' startups, ' + set.size + ' founders');
} catch (e) {
  console.warn('[bake] skipped: ' + e.message);
}
