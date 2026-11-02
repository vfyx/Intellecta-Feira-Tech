<?php
declare(strict_types=1);
require_once __DIR__ . '/../src/app/backend.php';
backend_start();
$app = require __DIR__ . '/../src/app/bootstrap.php';
$page = is_string($_GET['page'] ?? null) ? $_GET['page'] : $app['routes']['default'];
try {
    $data = backend_state();
} catch (DomainException $exception) {
    http_response_code(503);
    echo '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Intellecta</title>';
    echo '<h1>Intellecta</h1><p>O servidor está indisponível no momento.</p><p><a href="?page=';
    echo rawurlencode($page) . '">Tentar novamente</a></p></html>';
    exit;
}
if (!$data && !in_array($page, ['login', 'register', 'institutional-login', 'termos', 'privacidade-legal', 'ajuda'], true)) {
    header('Location: ?page=login');
    exit;
}
if (in_array($page, ['moderacao', 'admin-institucional'], true)) http_response_code(403);
if (!isset($app['routes']['views'][$page])) http_response_code(404);
if ($page === 'public-profile') {
    $selected = is_string($_GET['user'] ?? null) ? $_GET['user'] : '';
    if (!in_array($selected, array_column($data['people'] ?? [], 'username'), true)) {
        http_response_code(404);
    }
}
$GLOBALS['clientState'] = [
    'csrf' => '', 'demo' => true, 'page' => $page, 'data' => $data,
    'icons' => ['bookmark' => icon('bookmark'), 'message' => icon('message')],
];
$data ??= ['people' => [], 'feed' => [], 'notifications' => [], 'messages' => [], 'account' => ['name' => 'Visitante', 'username' => 'visitante']];
render_site($page, $data['people'], $data['feed'], $data['notifications'], $data['messages'], $data['account']);
