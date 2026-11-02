<?php
declare(strict_types=1);

// Public portfolio: no database driver, API client, authentication or persistence.
function backend_state(): array
{
    return require __DIR__ . '/../data/data.php';
}

function backend_start(): void
{
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: no-referrer');
    header("Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'none'; form-action 'none'; frame-ancestors 'none'; base-uri 'self'");
    // Never parse credentials or forward requests to the private service.
    if (isset($_GET['api']) || ($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
        http_response_code(403);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => 'Demonstração somente para leitura. Nenhum dado é enviado ou salvo.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
