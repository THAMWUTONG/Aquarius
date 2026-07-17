<?php
/**
 * Env.php
 * "Configuration File Reader".
 * Read (database password, API Key) in .env. 
 * To use them (database passwords, API keys), simply call env().
 * 
 * @param string $path 
 */

function loadEnv(string $path = __DIR__ . '/.env'): void
{
    static $loaded = false;
    if ($loaded || !file_exists($path)) {
        return;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }
        if (!str_contains($line, '=')) {
            continue;
        }
        [$key, $value] = array_map('trim', explode('=', $line, 2)); //explode ->['KEY', 'AIza==='] , array_map() -> ['  DB_HOST ', ' 127.0.0.1  '] to ['DB_HOST', '127.0.0.1']
        $value = trim($value, "\"'");
        putenv("{$key}={$value}");
        $_ENV[$key] = $value;
    }

    $loaded = true;
}

/**
 * @param string $key
 * @param mixed $default
 * @return mixed
 */
function env(string $key, $default = null)
{
    loadEnv();
    $value = getenv($key);
    return $value !== false ? $value : $default;
}
