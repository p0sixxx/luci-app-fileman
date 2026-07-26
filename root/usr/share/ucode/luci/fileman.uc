#!/usr/bin/ucode

import { fs } from 'fs';
import { ubus } from 'ubus';

function safe_path(path) {
  return path && path.indexOf('..') === -1 && path.indexOf('\0') === -1;
}

function normalize_path(path) {
  if (!path || path === '')
    return '/';

  if (!path.startsWith('/'))
    path = '/' + path;

  return path.replace(/\/+/g, '/');
}

export function list(path) {
  path = normalize_path(path || '/');
  if (!safe_path(path))
    return { error: 'invalid_path' };

  let entries = [];
  try {
    for (let e in fs.dir(path)) {
      let full = path === '/' ? '/' + e.name : path + '/' + e.name;
      let st = fs.stat(full);
      entries.push({
        name: e.name,
        path: full,
        type: st ? st.type : 'unknown',
        size: st ? st.size : 0,
        mtime: st ? st.mtime : 0
      });
    }
  }
  catch (e) {
    return { error: String(e) };
  }

  return { path: path, entries: entries };
}

export function stat(path) {
  path = normalize_path(path);
  if (!safe_path(path))
    return { error: 'invalid_path' };

  try {
    return { path: path, stat: fs.stat(path) };
  }
  catch (e) {
    return { error: String(e) };
  }
}

export function read(path) {
  path = normalize_path(path);
  if (!safe_path(path))
    return { error: 'invalid_path' };

  try {
    return { path: path, content: fs.readfile(path) };
  }
  catch (e) {
    return { error: String(e) };
  }
}

export function exists(path) {
  path = normalize_path(path);
  if (!safe_path(path))
    return { error: 'invalid_path' };

  return { path: path, exists: fs.access(path) == 0 };
}

export function mkdir(path) {
  path = normalize_path(path);
  if (!safe_path(path))
    return { error: 'invalid_path' };

  try {
    fs.mkdir(path, 493);
    return { ok: true };
  }
  catch (e) {
    return { error: String(e) };
  }
}

export function rm(path) {
  path = normalize_path(path);
  if (!safe_path(path))
    return { error: 'invalid_path' };

  try {
    fs.unlink(path);
    return { ok: true };
  }
  catch (e) {
    return { error: String(e) };
  }
}

export function mv(src, dst) {
  src = normalize_path(src);
  dst = normalize_path(dst);
  if (!safe_path(src) || !safe_path(dst))
    return { error: 'invalid_path' };

  try {
    fs.rename(src, dst);
    return { ok: true };
  }
  catch (e) {
    return { error: String(e) };
  }
}

export function write(path, content) {
  path = normalize_path(path);
  if (!safe_path(path))
    return { error: 'invalid_path' };

  try {
    fs.writefile(path, content || '');
    return { ok: true };
  }
  catch (e) {
    return { error: String(e) };
  }
}
