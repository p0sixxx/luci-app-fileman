#!/usr/bin/ucode

import { fs } from 'fs';

function safe_path(path) {
  return path && path.indexOf('..') === -1 && path.indexOf('\0') === -1;
}

function normalize_path(path) {
  if (!path || path === '')
    return '/';

  if (!path.startsWith('/'))
    path = '/' + path;

  while (path.indexOf('//') !== -1)
    path = path.replace('//', '/');

  return path;
}

function join_path(base, name) {
  base = normalize_path(base || '/');
  if (base !== '/' && base.endsWith('/'))
    base = base.slice(0, -1);

  return normalize_path(base + '/' + name);
}

function parent_path(path) {
  path = normalize_path(path);
  if (path === '/')
    return '/';

  let idx = path.lastIndexOf('/');
  return idx <= 0 ? '/' : path.slice(0, idx);
}

function is_file(path) {
  let st = fs.stat(path);
  return st && st.type !== 'directory';
}

export function list(path) {
  path = normalize_path(path || '/');
  if (!safe_path(path))
    return { error: 'invalid_path' };

  let entries = [];
  try {
    for (let e in fs.dir(path)) {
      let full = join_path(path, e.name);
      let st = fs.stat(full);
      entries.push({
        name: e.name,
        path: full,
        type: st ? st.type : 'unknown',
        size: st ? st.size : 0,
        mtime: st ? st.mtime : 0,
        mode: st ? st.mode : 0
      });
    }
  }
  catch (e) {
    return { error: String(e) };
  }

  entries.sort((a, b) => {
    if (a.type === 'directory' && b.type !== 'directory')
      return -1;
    if (a.type !== 'directory' && b.type === 'directory')
      return 1;
    return a.name.localeCompare(b.name);
  });

  return { path: path, parent: parent_path(path), entries: entries };
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
    let st = fs.stat(path);
    if (st && st.type === 'directory') {
      for (let e in fs.dir(path))
        rm(join_path(path, e.name));
      fs.rmdir(path);
    }
    else {
      fs.unlink(path);
    }
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

export function copy(src, dst) {
  src = normalize_path(src);
  dst = normalize_path(dst);
  if (!safe_path(src) || !safe_path(dst))
    return { error: 'invalid_path' };

  try {
    let st = fs.stat(src);
    if (!st)
      return { error: 'source_not_found' };

    if (st.type === 'directory') {
      fs.mkdir(dst, 493);
      for (let e in fs.dir(src))
        copy(join_path(src, e.name), join_path(dst, e.name));
    }
    else {
      fs.copy(src, dst);
    }
    return { ok: true };
  }
  catch (e) {
    return { error: String(e) };
  }
}

export function touch(path) {
  path = normalize_path(path);
  if (!safe_path(path))
    return { error: 'invalid_path' };

  try {
    if (!exists(path).exists)
      fs.writefile(path, '');
    return { ok: true };
  }
  catch (e) {
    return { error: String(e) };
  }
}

export function download(path) {
  path = normalize_path(path);
  if (!safe_path(path))
    return { error: 'invalid_path' };

  try {
    if (!is_file(path))
      return { error: 'not_a_file' };
    return { path: path, content: fs.readfile(path) };
  }
  catch (e) {
    return { error: String(e) };
  }
}
