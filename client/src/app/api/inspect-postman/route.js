import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const postmanPath = path.resolve(process.cwd(), '../postman_collection.json');
    const content = fs.readFileSync(postmanPath, 'utf8');
    const data = JSON.parse(content);
    
    const folders = (data.item || []).map((f) => ({
      name: f.name,
      requestsCount: (f.item || []).length,
      requests: (f.item || []).map((r) => `${r.request?.method} ${r.request?.url?.raw || ''}`),
    }));

    return NextResponse.json({
      collectionName: data.info?.name,
      totalFolders: folders.length,
      folders,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
