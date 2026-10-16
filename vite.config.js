import { defineConfig } from 'vite';
import { readFileSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { viteSingleFile } from 'vite-plugin-singlefile';

const entry = fileURLToPath(new URL('./index.html', import.meta.url));
const template = fileURLToPath(new URL('./development.html', import.meta.url));

// A mesma fonte alimenta o JSON público e o catálogo inicial embutido no bundle.
// O módulo virtual evita duplicar arquivos ou importar assets de public/ como código.
export default defineConfig(({ mode, command }) => ({
  plugins: [
    {
      name: 'ergasterio-development-template',
      transformIndexHtml: {
        order: 'pre',
        handler(html, context) {
          if (context.filename !== entry) return html;
          let source = readFileSync(template, 'utf8');
          if (mode === 'hosting') {
            const icon = readFileSync(new URL('./public/favicon.svg', import.meta.url)).toString(
              'base64',
            );
            source = source
              .replace('href="/favicon.svg"', `href="data:image/svg+xml;base64,${icon}"`)
              .replace(
                '</head>',
                '<meta name="ergasterio-publicacao" content="pronto-para-hospedagem" /></head>',
              );
          }
          return source;
        },
      },
      configureServer(server) {
        server.watcher.add(template);
        server.watcher.on('change', (path) => {
          if (path === template) server.ws.send({ type: 'full-reload' });
        });
      },
      buildStart() {
        this.addWatchFile(template);
      },
    },
    {
      name: 'ergasterio-catalog-snapshot',
      resolveId(id) {
        if (id === 'virtual:catalog') return '\0ergasterio-catalog';
      },
      load(id) {
        if (id !== '\0ergasterio-catalog') return;
        const path = fileURLToPath(new URL('./public/data/repositories.json', import.meta.url));
        this.addWatchFile(path);
        return `export default ${readFileSync(path, 'utf8')}`;
      },
    },
    {
      name: 'ergasterio-server-index',
      closeBundle() {
        if (command !== 'build') return;
        const output = mode === 'hosting' ? 'dist-hosting' : 'dist';
        for (const name of ['projects.php', 'ergasterio-projects.json']) {
          copyFileSync(
            new URL(`./${name}`, import.meta.url),
            new URL(`./${output}/${name}`, import.meta.url),
          );
        }
      },
    },
    ...(mode === 'hosting' ? [viteSingleFile({ removeViteModuleLoader: true })] : []),
  ],
  build: {
    outDir: mode === 'hosting' ? 'dist-hosting' : 'dist',
  },
}));
