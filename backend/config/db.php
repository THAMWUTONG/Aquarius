<?php
/**
 * db.php
 * ------------------------------------------------------------
 * 职责：提供一个共用的数据库连接（PDO）。
 * require_once 这个文件，
 * 不要各自再写一份连接逻辑，避免连接方式不一致。
 *
 * 用法：
 *   require_once __DIR__ . '/db.php';
 *   $pdo = getDbConnection();
 * ------------------------------------------------------------
 */

require_once __DIR__ . '/Env.php';

/**
 * 获取数据库连接（PDO 单例）
 * @return PDO
 * @throws PDOException 当连接失败时抛出
 */
function getDbConnection(): PDO
{
    static $pdo = null;

    if ($pdo !== null) {
        return $pdo;
    }

    $host = env('DB_HOST', '127.0.0.1');
    $port = env('DB_PORT', '3306');
    $dbname = env('DB_NAME', 'aquarius'); //只要改 数据库名字
    $user = env('DB_USER', 'root');
    $pass = env('DB_PASS', '');
    $charset = 'utf8mb4';

    $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset={$charset}";

    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, // 出错直接抛异常，方便上层 catch
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false, // 使用真正的 prepared statement，防注入
    ];

    $pdo = new PDO($dsn, $user, $pass, $options);

    return $pdo;
}