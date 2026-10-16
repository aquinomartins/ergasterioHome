import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { zipSync, unzipSync } from 'fflate';

const source = new URL('../dist-hosting/', import.meta.url);
const targetDir = new URL('../artifacts/', import.meta.url);
const target = new URL('ergasterio-superdominios.zip', targetDir);
const html = await readFile(new URL('index.html', source), 'utf8');
if (/<script\b[^>]*\bsrc\s*=/i.test(html) || /<link\b[^>]*rel=["']stylesheet/i.test(html)) {
  throw new Error('O build ainda depende de JS/CSS externos. Execute npm run build:hosting.');
}
const files = {};
async function collect(dir, prefix = '') {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const path = `${prefix}${item.name}`;
    const url = new URL(item.name + (item.isDirectory() ? '/' : ''), dir);
    if (item.isDirectory()) {
      files[`${path}/`] = [new Uint8Array(), { os: 3, attrs: 0o40755 << 16 }];
      await collect(url, `${path}/`);
    } else if (item.isFile()) {
      files[path] = [await readFile(url), { os: 3, attrs: 0o100644 << 16 }];
    }
  }
}
await collect(source);
const archive = zipSync(files, { level: 6 });
const contents = unzipSync(archive);
if (!contents['index.html'] || !contents['data/repositories.json']) {
  throw new Error('Pacote de publicação incompleto.');
}
await mkdir(targetDir, { recursive: true });
await writeFile(target, archive);
await writeFile(new URL('../index.html', import.meta.url), html);
console.log(`Pacote de publicação: ${fileURLToPath(target)} (${archive.length} bytes)`);
console.log('index.html da raiz atualizado e pronto para envio direto à hospedagem.');
console.log('JavaScript, estilos e fontes incorporados ao index.html; permissões ZIP: 0644/0755.');
