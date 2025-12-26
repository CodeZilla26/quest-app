import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const LIBRARY_FILE = path.join(DATA_DIR, 'library.json');
const QUESTS_FILE = path.join(DATA_DIR, 'quests.json');

// Archivos físicos separados por tipo
const TYPE_FILES = {
  comic: path.join(DATA_DIR, 'comics.json'),
  movie: path.join(DATA_DIR, 'movies.json'),
  series: path.join(DATA_DIR, 'series.json'),
  game: path.join(DATA_DIR, 'games.json'),
};

function normalizeType(type) {
  const t = String(type || '').trim().toLowerCase();
  if (!t) return '';
  if (t === 'comics' || t === 'comic') return 'comic';
  if (t === 'movies' || t === 'movie' || t === 'pelicula' || t === 'películas' || t === 'peliculas') return 'movie';
  if (t === 'serie' || t === 'series') return 'series';
  if (t === 'games' || t === 'game' || t === 'juego' || t === 'juegos') return 'game';
  return t;
}

function dedupeById(items) {
  const map = new Map();
  for (const it of items || []) {
    if (!it) continue;
    const id = it.id != null ? String(it.id) : '';
    if (!id) continue;
    map.set(id, it);
  }
  return Array.from(map.values());
}

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function readTypeFile(type) {
  const file = TYPE_FILES[type];
  if (!file) return [];
  try {
    const raw = await fs.readFile(file, 'utf8');
    const data = JSON.parse(raw || '{}');
    const items = Array.isArray(data.items) ? data.items : [];
    return items;
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    await ensureDataDir();

    // 1) Intentar leer primero los archivos por tipo y agregarlos
    const types = Object.keys(TYPE_FILES);
    const perType = await Promise.all(types.map((t) => readTypeFile(t)));
    const aggregated = perType.flat();

    // 1.5) Siempre intentar mezclar con library.json como respaldo, para evitar pérdidas
    let backup = [];
    try {
      const raw = await fs.readFile(LIBRARY_FILE, 'utf8');
      const data = JSON.parse(raw || '{}');
      backup = Array.isArray(data.library) ? data.library : [];
    } catch {
      backup = [];
    }

    if (aggregated.length > 0 || backup.length > 0) {
      const merged = dedupeById([...(aggregated || []), ...(backup || [])]);
      return NextResponse.json({ library: merged });
    }

    // 2) Si aún no existen archivos por tipo, mantener compat con library.json
    try {
      const raw = await fs.readFile(LIBRARY_FILE, 'utf8');
      const data = JSON.parse(raw || '{}');
      const lib = Array.isArray(data.library) ? data.library : [];
      if (lib.length > 0) {
        return NextResponse.json({ library: lib });
      }
    } catch {
      // Ignorar y probar quests.json como fuente legacy
    }

    // 3) Fallback final: quests.json (legacy)
    try {
      const rawQuests = await fs.readFile(QUESTS_FILE, 'utf8');
      const questsData = JSON.parse(rawQuests || '{}');
      const lib = Array.isArray(questsData.library) ? questsData.library : [];
      return NextResponse.json({ library: lib });
    } catch {
      // Si tampoco existe quests.json o falla el parseo, devolver vacío
      return NextResponse.json({ library: [] });
    }
  } catch (error) {
    console.error('Error reading library data:', error);
    return NextResponse.json(
      { error: 'Error reading library data' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await ensureDataDir();
    const body = await request.json();

    if (!body || typeof body !== 'object' || !Array.isArray(body.library)) {
      return NextResponse.json(
        { error: 'Invalid library payload' },
        { status: 400 }
      );
    }

    const library = body.library;

    // Agrupar por tipo conocido
    const byType = {
      comic: [],
      movie: [],
      series: [],
      game: [],
    };

    for (const item of library) {
      const t = normalizeType(item && item.type);
      if (t && byType[t]) byType[t].push({ ...item, type: t });
    }

    // Escribir archivos por tipo (formato { items: [...] })
    await Promise.all(
      Object.entries(TYPE_FILES).map(async ([type, file]) => {
        const items = byType[type] || [];
        const payload = { items };
        await fs.writeFile(file, JSON.stringify(payload, null, 2), 'utf8');
      })
    );

    // Mantener también library.json como respaldo unificado
    const payload = { library };
    await fs.writeFile(LIBRARY_FILE, JSON.stringify(payload, null, 2), 'utf8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving library data:', error);
    return NextResponse.json(
      { error: 'Error saving library data' },
      { status: 500 }
    );
  }
}
