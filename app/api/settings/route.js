import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

async function ensureDataDir() {
  const dir = path.dirname(SETTINGS_FILE);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

const DEFAULT_SETTINGS = {
  libraryFilter: { type: 'all', status: 'all', query: '' },
  theme: 'default',
};

export async function GET() {
  try {
    await ensureDataDir();
    try {
      const raw = await fs.readFile(SETTINGS_FILE, 'utf8');
      const data = JSON.parse(raw || '{}');
      return NextResponse.json({
        libraryFilter: data.libraryFilter || DEFAULT_SETTINGS.libraryFilter,
        theme: data.theme || DEFAULT_SETTINGS.theme,
      });
    } catch {
      return NextResponse.json(DEFAULT_SETTINGS);
    }
  } catch (error) {
    console.error('Error reading settings data:', error);
    return NextResponse.json(
      { error: 'Error reading settings data' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await ensureDataDir();
    const body = await request.json();

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid settings payload' },
        { status: 400 }
      );
    }

    const settings = {
      libraryFilter: body.libraryFilter || DEFAULT_SETTINGS.libraryFilter,
      theme: body.theme || DEFAULT_SETTINGS.theme,
    };

    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving settings data:', error);
    return NextResponse.json(
      { error: 'Error saving settings data' },
      { status: 500 }
    );
  }
}
