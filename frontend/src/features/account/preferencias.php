<?php declare(strict_types=1); ?>

<header class="page-header account-page-header"><div><span class="eyebrow">Personalize seu espaço</span><h1>Preferências</h1></div></header>
<div class="page-content settings-page">
  <section class="settings-group card">
    <div class="settings-group__head"><span class="eyebrow">Experiência</span><h2>Como o Intellecta acompanha você</h2></div>
    <?php foreach ([['light-theme', 'Tema claro', 'Use fundos claros. Desative para voltar ao tema escuro.'], ['compact-feed', 'Feed compacto', 'Mostra mais conversas na mesma tela.'], ['motion', 'Movimento sutil', 'Mantém transições e animações da interface.'], ['email-updates', 'Novidades por e-mail', 'Requer serviço de e-mail externo configurado.']] as [$key, $label, $description]): ?>
      <label class="setting-row"><span><strong><?= e($label) ?></strong><small><?= e($description) ?></small></span><input type="checkbox" data-toggle-setting="<?= e($key) ?>"></label>
    <?php endforeach; ?>
  </section>
  <section class="settings-links card">
    <a href="?page=privacidade">Privacidade <span><?= icon('chevron') ?></span></a>
    <a href="?page=seguranca">Segurança <span><?= icon('chevron') ?></span></a>
  </section>
</div>
