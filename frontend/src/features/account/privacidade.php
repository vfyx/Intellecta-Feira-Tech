<?php declare(strict_types=1); ?>

<header class="page-header account-page-header"><div><span class="eyebrow">Controle seus dados</span><h1>Privacidade</h1></div></header>
<div class="page-content settings-page">
  <section class="settings-group card">
    <div class="settings-group__head"><span class="eyebrow">Visibilidade</span><h2>Você decide o que compartilhar.</h2><p>Estas opções são salvas na sua conta e aplicadas pelo servidor.</p></div>
    <?php foreach ([['profile-public', 'Perfil público', 'Permitir que outras pessoas encontrem seu perfil.'], ['activity-status', 'Status de atividade', 'Mostrar quando você está online.'], ['personalized-feed', 'Feed personalizado', 'Usar seus interesses para organizar descobertas.']] as [$key, $label, $description]): ?>
      <label class="setting-row"><span><strong><?= e($label) ?></strong><small><?= e($description) ?></small></span><input type="checkbox" data-toggle-setting="<?= e($key) ?>" checked></label>
    <?php endforeach; ?>
  </section>
  <a class="text-link" href="?page=privacidade-legal">Leia a política de privacidade completa →</a>
</div>
