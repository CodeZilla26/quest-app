import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'quests.json');

// Asegurar que el directorio data existe
async function ensureDataDir() {
  const dataDir = path.dirname(DATA_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// GET - Leer datos de quests
export async function GET() {
  try {
    await ensureDataDir();
    
    try {
      const data = await fs.readFile(DATA_FILE, 'utf8');
      return NextResponse.json(JSON.parse(data));
    } catch (error) {
      // Si el archivo no existe, devolver estado inicial
      const initialState = {
        quests: [],
        filter: 'all',
        exp: 0,
      };
      return NextResponse.json(initialState);
    }
  } catch (error) {
    console.error('Error reading quests:', error);
    return NextResponse.json(
      { error: 'Error reading quests data' },
      { status: 500 }
    );
  }
}

// POST - Guardar datos de quests
export async function POST(request) {
  try {
    await ensureDataDir();
    
    const data = await request.json();
    
    // Validar que los datos tienen la estructura esperada
    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }
    
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving quests:', error);
    return NextResponse.json(
      { error: 'Error saving quests data' },
      { status: 500 }
    );
  }
}
