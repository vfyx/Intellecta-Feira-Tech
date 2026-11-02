<?php declare(strict_types=1); ?>

<header class="page-header account-page-header account-page-header--center">
  <div>
    <h1>Alteração de senha</h1>
    <span class="account-username">@<?= e($account['username']) ?></span>
  </div>
</header>

<div class="page-content account-settings-content">
  <a class="account-password-link" href="?page=alterar-senha">
    <span>Alterar senha</span><?= icon('chevron') ?>
  </a>
</div>
