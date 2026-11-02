<?php declare(strict_types=1); ?>

<header class="page-header account-page-header"><div><span class="eyebrow">Proteção da conta</span><h1>Segurança</h1></div></header>
<div class="page-content settings-page">
  <section class="security-status card"><span class="security-status__icon"><?= icon('shield') ?></span><div><span class="eyebrow">Tudo certo</span><h2>Sua conta está protegida.</h2><p class="muted">Ative uma camada extra sempre que quiser.</p></div></section>
  <section class="settings-links card">
    <a href="?page=alterar-senha"><span><strong>Alterar senha</strong><small>Atualize sua senha de acesso.</small></span><?= icon('chevron') ?></a>
    <label class="setting-row"><span><strong>Chave adicional de acesso</strong><small>Exige uma chave pessoal além da senha (sem SMS ou e-mail).</small></span><input type="checkbox" data-toggle-setting="two-factor"></label>
    <label class="setting-row"><span><strong>Alertas de acesso</strong><small>Registre novos acessos na tela de notificações.</small></span><input type="checkbox" data-toggle-setting="login-alerts" checked></label>
  </section>
</div>
