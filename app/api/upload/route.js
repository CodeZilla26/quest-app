import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const coversDir = path.join(process.cwd(), 'public', 'covers');
    await fs.mkdir(coversDir, { recursive: true });

    const ext = (file.name && path.extname(file.name)) || '.png';
    const name = `cover_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    const targetPath = path.join(coversDir, name);
    await fs.writeFile(targetPath, buffer);

    const coverPath = `/covers/${name}`;
    return NextResponse.json({ success: true, coverPath });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}
