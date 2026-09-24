import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const routesDir = path.resolve(process.cwd(), '../BE/src/routes');
    const files = fs.readdirSync(routesDir).filter((f) => f.endsWith('.routes.js'));

    // Read routes/index.js to get mount prefixes
    const indexContent = fs.readFileSync(path.join(routesDir, 'index.js'), 'utf8');
    const mountMap = {};
    const mountRegex = /router\.use\(['"]([^'"]+)['"],\s*(\w+)\)/g;
    let m;
    while ((m = mountRegex.exec(indexContent)) !== null) {
      mountMap[m[2]] = m[1];
    }

    // Also match the require statements
    const reqRegex = /const\s+(\w+)\s*=\s*require\(['"]\.\/([^'"]+)['"]\)/g;
    const fileToVar = {};
    while ((m = reqRegex.exec(indexContent)) !== null) {

      fileToVar[m[2].replace('.js', '')] = m[1];
    }

    const allEndpoints = [];

    files.forEach((file) => {
      const baseName = file.replace('.js', '');
      const varName = fileToVar[baseName] || fileToVar[`${baseName}.routes`] || baseName;
      const prefix = mountMap[varName] || `/${baseName.replace('.routes', '')}`;

      const content = fs.readFileSync(path.join(routesDir, file), 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, idx) => {
        const routeMatch = line.match(/router\.(get|post|put|patch|delete)\(\s*['"]([^'"]*)['"]/i);
        if (routeMatch) {
          const method = routeMatch[1].toUpperCase();
          const subPath = routeMatch[2];
          const fullPath = (prefix + (subPath.startsWith('/') ? subPath : subPath ? `/${subPath}` : '')).replace(/\/+/g, '/');
          allEndpoints.push({
            file,
            line: idx + 1,
            method,
            subPath,
            prefix,
            fullPath: `/api/v1${fullPath}`,
            isProtected: line.includes('protect'),
            rawLine: line.trim(),
          });
        }
      });
    });


    return NextResponse.json({
      totalEndpoints: allEndpoints.length,
      endpoints: allEndpoints,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
