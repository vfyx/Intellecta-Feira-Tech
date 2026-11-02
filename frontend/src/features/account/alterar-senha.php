<?php declare(strict_types=1); $passwordError=""; $passwordSuccess=""; ?>
<header class="page-header account-page-header account-page-header--center">
  <div>
    <h1>Alteração de senha</h1>
    <span class="account-username">@<?= e($account['username']) ?></span>
  </div>
</header>

<div class="page-content password-page-content">
  <section class="password-card" aria-labelledby="password-title">
    <h2 id="password-title" class="sr-only">Alterar senha</h2>
    <?php if ($passwordError !== ''): ?><p class="account-feedback account-feedback--error" role="alert"><?= e($passwordError) ?></p><?php endif; ?>
    <?php if ($passwordSuccess !== ''): ?><p class="account-feedback account-feedback--success" role="status"><?= e($passwordSuccess) ?></p><?php endif; ?>
    <form class="password-form" method="post" action="?page=alterar-senha" data-password-form>
      <label class="password-input">
        <span class="sr-only">Senha atual</span>
        <input class="input" type="password" name="current_password" placeholder="Senha Atual" required>
        <button class="password-toggle" type="button" aria-label="Mostrar senha" data-password-toggle><?= icon('eye') ?></button>
      </label>
      <label class="password-input">
        <span class="sr-only">Nova senha</span>
        <input class="input" type="password" name="new_password" placeholder="Nova Senha" required>
        <button class="password-toggle" type="button" aria-label="Mostrar senha" data-password-toggle><?= icon('eye') ?></button>
      </label>
      <label class="password-input">
        <span class="sr-only">Confirme sua senha</span>
        <input class="input" type="password" name="confirm_password" placeholder="Confirme sua senha" required>
        <button class="password-toggle" type="button" aria-label="Mostrar senha" data-password-toggle><?= icon('eye') ?></button>
      </label>
      <button class="btn btn-secondary password-submit" type="submit">Confirmar</button>
      <button class="password-recovery" type="button" data-password-recovery>Esqueci minha senha</button>
    </form>
  </section>
</div>
