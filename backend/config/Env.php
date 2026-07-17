<?php
/**
 * Env.php
 * ------------------------------------------------------------
 * 职责：极简 .env 加载器，不依赖第三方 composer 包。
 * 把 .env 里的 KEY=VALUE 读进 PHP 的环境变量，
 * 供 db.php / GeminiService.php 用 env() 取值。
 *
 * .env 文件不要提交到 git，记得在 .gitignore 里加一条 ".env"
 * ------------------------------------------------------------
 */

/**
 * 加载 .env 文件到 getenv() / $_ENV
 * @param string $path .env 文件路径，默认项目根目录
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
        // 跳过注释行
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }
        if (!str_contains($line, '=')) {
            continue;
        }
        [$key, $value] = array_map('trim', explode('=', $line, 2)); //explode ->['KEY', 'AIza==='] , array_map() -> ['  DB_HOST ', ' 127.0.0.1  '] to ['DB_HOST', '127.0.0.1']
        // 去掉可能包裹的引号（/，“）
        $value = trim($value, "\"'");
        putenv("{$key}={$value}");
        $_ENV[$key] = $value;
    }

    $loaded = true;
}

/**
 * 读取环境变量，带默认值
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