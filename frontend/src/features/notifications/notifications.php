<?php declare(strict_types=1); ?>

<header class="page-header">
  <div>
    <span class="eyebrow">Acompanhe o que importa</span>
    <h1>Notificações</h1>
  </div>
  <button
    class="btn btn-ghost"
    type="button"
    data-mark-read
  >
    Marcar como lidas
  </button>
</header>

<div class="page-content notifications-page">
  <section class="notification-summary">
    <span class="notification-summary__icon"><?= icon('bell') ?></span>
    <div>
      <strong>Você está em dia.</strong>
      <span>3 novidades aguardam sua atenção.</span>
    </div>
  </section>

  <div class="notification-heading">
    <span class="eyebrow">Últimas movimentações</span>
    <h2>O que aconteceu enquanto você estava fora</h2>
  </div>

  <section class="card list notification-list">
    <?php foreach ($notifications as $item): ?>
      <article class="person notification-item" data-filter-item>
        <div class="avatar"><?= e(initials($item['actor'])) ?></div>
        <div class="person__copy">
          <strong><?= e($item['actor']) ?></strong>
          <span class="notification-type"><?= e($item['type']) ?></span>
          <span><?= e($item['time']) ?> · agora</span>
        </div>
        <span class="notification-dot" aria-label="Nova notificação"></span>
      </article>
    <?php endforeach; ?>
  </section>
</div>
