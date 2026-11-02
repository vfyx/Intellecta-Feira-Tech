<?php declare(strict_types=1); ?>

<header class="page-header account-page-header account-page-header--center">
  <div>
    <h1>Sua conta</h1>
    <span class="account-username">@<?= e($account['username']) ?></span>
  </div>
</header>

<div class="page-content account-settings-content">
  <section class="account-overview card">
    <?= avatar_html($account, 'avatar--large') ?>
    <div><span class="eyebrow">Conta ativa</span><h2><?= e($account['name']) ?></h2><p>@<?= e($account['username']) ?> · <?= e($account['email']) ?></p></div>
    <span class="account-online"><i></i> online</span>
  </section>
  <nav class="account-settings-list" aria-label="Configurações da conta">
    <a class="account-settings-card" href="?page=informacoes-conta">
      <div class="account-settings-card__title"><?= icon('user') ?><strong>Informações da conta</strong></div>
      <p>Veja as informações da sua conta, como telefone e endereço de e-mail.</p>
    </a>
    <a class="account-settings-card" href="?page=configuracao-senha">
      <div class="account-settings-card__title"><?= icon('lock') ?><strong>Alterar sua senha</strong></div>
      <p>Altere a senha a qualquer momento.</p>
    </a>
    <button class="account-settings-card account-settings-card--button" type="button" data-delete-account>
      <div class="account-settings-card__title"><?= icon('shield') ?><strong>Excluir sua conta</strong></div>
      <p>Descubra como excluir sua conta.</p>
    </button>
  </nav>
  <button class="account-logout" type="button" data-logout>Sair da conta</button>
</div>
