import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// A mesma fonte alimenta o JSON público e o catálogo inicial embutido no bundle.
// O módulo virtual evita duplicar arquivos ou importar assets de public/ como código.
export default defineConfig({
  plugins: [
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
  ],
});
