<?php

require_once __DIR__ . '/Env.php';

/**
 * connect to Database
 * @return PDO
 * @throws PDOException 
 */
function getDbConnection(): PDO
{
    static $pdo = null;

    if ($pdo !== null) {
        return $pdo;
    }

    $host = env('DB_HOST', '127.0.0.1');
    $port = env('DB_PORT', '3306');
    $dbname = env('DB_NAME', 'aquarius'); 
    $user = env('DB_USER', 'root');
    $pass = env('DB_PASS', '');
    $charset = 'utf8mb4';

    $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset={$charset}";

    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, // 出错直接抛异常，方便上层 catch
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false, 
    ];

    $pdo = new PDO($dsn, $user, $pass, $options);

    return $pdo;
}
