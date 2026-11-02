<?php declare(strict_types=1); ?>

<header class="page-header account-page-header">
  <div><span class="eyebrow">Privacidade e identidade</span><h1>Info da conta</h1></div>
  <a class="btn btn-secondary" href="?page=sua-conta">Voltar</a>
</header>

<div class="page-content account-settings-content">
  <section class="account-info-hero card">
    <?= avatar_html($account, 'avatar--large') ?>
    <h2><?= e($account['name']) ?></h2>
    <p>@<?= e($account['username']) ?></p>
  </section>
  <section class="account-info-meta card" aria-label="Metadados da conta">
    <div><span class="account-meta-icon"><?= icon('calendar') ?></span><span><strong>Entrou em <?= e(date('d/m/Y', strtotime($account['created']))) ?></strong><small>Membro da comunidade Intellecta</small></span></div>
    <div><span class="account-meta-icon"><?= icon('pin') ?></span><span><strong>Localização <?= e($account['country']) ?></strong><small>País informado na sua conta</small></span></div>
    <div><span class="account-meta-icon"><?= icon('mail') ?></span><span><strong><?= e($account['email']) ?></strong><small>E-mail de acesso</small></span></div>
  </section>
</div>
