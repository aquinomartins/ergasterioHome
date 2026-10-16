import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

// Simula hospedagem estática: somente o index.html da raiz fica disponível.
// Nenhum Vite, pasta assets ou arquivo de apoio é servido.
createServer(async (request, response) => {
  const path = new URL(request.url, 'http://localhost').pathname;
  if (path !== '/' && path !== '/index.html') {
    response.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
    return;
  }
  const html = await readFile(new URL('../index.html', import.meta.url));
  response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(html);
}).listen(5182, '127.0.0.1');
