<?php
declare(strict_types=1);
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/');
if (str_starts_with($path, '/assets/')) {
    $file=realpath(__DIR__.$path);$root=realpath(__DIR__.'/assets');
    if ($file && str_starts_with($file,$root.DIRECTORY_SEPARATOR) && is_file($file)) {
        $ext=pathinfo($file,PATHINFO_EXTENSION);
        $types=['css'=>'text/css','js'=>'text/javascript','svg'=>'image/svg+xml','jpeg'=>'image/jpeg','png'=>'image/png'];
        if(isset($types[$ext])){header('Content-Type: '.$types[$ext]);readfile($file);return;}
    }
    http_response_code(404);exit;
}
if (!in_array($path,['/','/index.php','/public/','/public/index.php'],true)){http_response_code(404);exit('Não encontrado.');}
require __DIR__.'/public/index.php';
