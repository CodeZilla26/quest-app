import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const SECRETS_FILE = path.join(DATA_DIR, 'secrets.json');

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function readSecrets() {
  try {
    const raw = await fs.readFile(SECRETS_FILE, 'utf8');
    const data = JSON.parse(raw || '{}');
    return Array.isArray(data.items) ? data.items : [];
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    await ensureDataDir();
    const items = await readSecrets();
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error reading secrets:', error);
    return NextResponse.json({ error: 'Error reading secrets' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await ensureDataDir();
    const body = await request.json();

    if (!body || typeof body !== 'object' || !Array.isArray(body.items)) {
      return NextResponse.json({ error: 'Invalid secrets payload' }, { status: 400 });
    }

    const payload = { items: body.items };
    await fs.writeFile(SECRETS_FILE, JSON.stringify(payload, null, 2), 'utf8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving secrets:', error);
    return NextResponse.json({ error: 'Error saving secrets' }, { status: 500 });
  }
}
