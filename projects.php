<?php
declare(strict_types=1);

/** Índice somente de leitura das pastas públicas ao lado da Home. PHP 7.4+. */
function ergasterio_category(string $name): string {
    $text = strtolower($name);
    if (preg_match('/cell|celul|anatom|biolog|science/', $text)) return 'Ciência';
    if (preg_match('/motor|engine|jetstream|turbina|mecanis|moinho|relogio|porsche/', $text)) return 'Engenharia';
    if (preg_match('/sonic|game|jogo/', $text)) return 'Jogos';
    if (preg_match('/art|music|bach|design|andante|nuvens|correria/', $text)) return 'Arte & criação';
    if (preg_match('/socied|mercado|educa|ergasterio|humanitas/', $text)) return 'Sociedade';
    return 'Tecnologia';
}

function ergasterio_inside(string $path, string $root): bool {
    return $path === $root || strpos($path, $root . DIRECTORY_SEPARATOR) === 0;
}

function ergasterio_entry(string $folder, ?string $requested = null): ?string {
    $root = realpath($folder);
    if ($root === false) return null;
    $candidates = $requested !== null ? [$requested] : ['index.html', 'index.htm', 'index.php', 'app.html', 'demo.html', 'main.html'];
    foreach ($candidates as $entry) {
        if (!is_string($entry) || $entry === '' || strpos($entry, "\0") !== false || preg_match('/(^[\\\\\/]|(^|[\\\\\/])\.\.([\\\\\/]|$)|[?#:])/', $entry)) continue;
        if (!preg_match('/\.(html?|php)$/i', $entry)) continue;
        $resolved = realpath($folder . DIRECTORY_SEPARATOR . $entry);
        if ($resolved !== false && ergasterio_inside($resolved, $root) && is_file($resolved) && is_readable($resolved) && !is_link($folder . DIRECTORY_SEPARATOR . $entry)) return str_replace('\\', '/', $entry);
    }
    return null;
}

function ergasterio_scan(string $directory, array $config): array {
    $root = realpath($directory);
    if ($root === false || !is_readable($root)) throw new RuntimeException('catalog_unavailable');
    $owner = isset($config['owner']) && preg_match('/^[A-Za-z0-9-]+$/', (string)$config['owner']) ? $config['owner'] : 'aquinomartins';
    $excluded = array_map('strtolower', array_merge(['assets','config','public','scripts','src','tests','server','vendor','node_modules','dist','dist-hosting','artifacts','data','api','auth','admin','uploads','storage','cache','logs','cgi-bin','app','lib','database','routes','includes','templates','resources','build','coverage','test-results','playwright-report','private','secrets'], is_array($config['excludedFolders'] ?? null) ? $config['excludedFolders'] : []));
    $known = is_array($config['folders'] ?? null) ? $config['folders'] : [];
    $projects = [];
    $iterator = new DirectoryIterator($root);
    foreach ($iterator as $item) {
        $name = $item->getFilename();
        if ($item->isDot() || !$item->isDir() || $item->isLink() || $name[0] === '.' || $name[0] === '_' || in_array(strtolower($name), $excluded, true) || preg_match('/^ergasteriohome(?:-|$)|backup|(?:^|[-_])old(?:$|[-_])/i', $name)) continue;
        $path = $item->getRealPath();
        if ($path === false || !ergasterio_inside($path, $root) || !is_readable($path)) continue;
        $meta = is_array($known[$name] ?? null) ? $known[$name] : [];
        $manifest = $path . DIRECTORY_SEPARATOR . 'ergasterio.project.json';
        if (is_file($manifest) && !is_link($manifest) && is_readable($manifest) && filesize($manifest) <= 32768) {
            $decoded = json_decode((string)file_get_contents($manifest), true);
            if (is_array($decoded)) $meta = array_replace($meta, $decoded);
        }
        if (($meta['public'] ?? true) === false) continue;
        $entry = ergasterio_entry($path, isset($meta['entry']) && is_string($meta['entry']) ? $meta['entry'] : null);
        if ($entry === null && !isset($known[$name]) && ($meta['public'] ?? false) !== true) continue;
        $repo = isset($meta['repository']) && is_string($meta['repository']) ? $meta['repository'] : null;
        if ($repo !== null && !preg_match('/^[A-Za-z0-9_.-]+$/', $repo)) $repo = null;
        $category = isset($meta['category']) && in_array($meta['category'], ['Ciência','Arte & criação','Engenharia','Jogos','Tecnologia','Sociedade'], true) ? $meta['category'] : ergasterio_category($name);
        $projects[] = [
            'folder' => $name,
            'name' => is_string($meta['name'] ?? null) ? ergasterio_cut($meta['name'], 120) : ucwords(str_replace(['_', '-'], ' ', $name)),
            'description' => is_string($meta['description'] ?? null) ? ergasterio_cut($meta['description'], 500) : 'Uma nova experiência do laboratório para explorar e descobrir.',
            'category' => $category,
            'icon' => is_string($meta['icon'] ?? null) ? ergasterio_cut($meta['icon'], 32) : 'code',
            'repository' => $repo,
            'entry' => $entry,
            'published' => $entry !== null && ($meta['preparing'] ?? false) !== true,
            'featured' => ($meta['featured'] ?? false) === true,
            'updatedAt' => gmdate('c', $entry !== null ? (int)filemtime($path . DIRECTORY_SEPARATOR . $entry) : $item->getMTime()),
        ];
    }
    usort($projects, static function (array $a, array $b): int { return strnatcasecmp($a['name'], $b['name']); });
    return ['schemaVersion' => 1, 'owner' => $owner, 'scannedAt' => gmdate('c'), 'projects' => $projects];
}

function ergasterio_cut(string $text, int $limit): string {
    return function_exists('mb_substr') ? mb_substr($text, 0, $limit, 'UTF-8') : preg_replace('/^(.{0,' . $limit . '}).*$/us', '$1', $text);
}

if (!defined('ERGASTERIO_INDEX_LIBRARY')) {
    ini_set('display_errors', '0');
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    header('X-Robots-Tag: noindex');
    try {
        $configFile = __DIR__ . '/ergasterio-projects.json';
        $config = is_file($configFile) ? json_decode((string)file_get_contents($configFile), true) : [];
        if (!is_array($config)) throw new RuntimeException('invalid_config');
        echo json_encode(ergasterio_scan(__DIR__, $config), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    } catch (Throwable $error) {
        http_response_code(503);
        echo '{"error":"catalog_unavailable","projects":[]}';
    }
}
