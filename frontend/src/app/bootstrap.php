<?php

declare(strict_types=1);

require_once __DIR__ . '/../utils/helpers.php';
require_once __DIR__ . '/../components/shell/site.php';

return [
    'routes' => require __DIR__ . '/../config/routes.php',
    'data' => require __DIR__ . '/../data/data.php',
];
