<?php declare(strict_types=1); $selectedUsername = (is_string($_GET['user'] ?? null) ? $_GET['user'] : ''); $person = null; foreach ($people as $candidate) { if ($candidate['username'] === $selectedUsername) { $person = $candidate; break; } } if (!$person) {  echo '<section class="empty-state"><h2>Perfil indisponível</h2><a href="?page=explore">Voltar a explorar</a></section>'; return; } ?>

<header class="page-header">
  <div><span class="eyebrow">Perfil da comunidade</span><h1>Perfil público</h1></div>
  <a class="btn btn-secondary" href="?page=explore">Voltar a explorar</a>
</header>

<div class="page-content">
  <section class="profile-card public-profile-card card" aria-labelledby="public-profile-name">
    <div class="profile-card__cover"<?= !empty($person['banner']) ? ' style="background-image:url(' . e($person['banner']) . ')"' : '' ?>>
      <?php if (empty($person['banner'])): ?><span class="profile-card__cover-label">INTELLECTA</span><span class="profile-card__cover-mark">✦</span><?php endif; ?>
    </div>
    <div class="profile-card__content">
      <div class="profile-card__top">
        <div class="profile-avatar-wrap"><?= avatar_html($person, 'avatar--large profile-avatar') ?></div>
    <div class="public-profile-actions">
      <div class="public-profile-menu-wrap">
        <button class="profile-action-icon" type="button" data-profile-menu aria-expanded="false" aria-haspopup="true" aria-label="Mais opções">•••</button>
        <div class="profile-action-menu" data-profile-menu-panel hidden>
          <a href="#" data-public-info><?= icon('info') ?> Informações da conta</a>
          <button type="button" data-profile-share><?= icon('send') ?> Compartilhar @<?= e($person['username']) ?></button>
          <button type="button" data-profile-block><?= icon('lock') ?> Bloquear @<?= e($person['username']) ?></button>
          <button type="button" data-profile-report><?= icon('flag') ?> Denunciar @<?= e($person['username']) ?></button>
        </div>
      </div>
      <a class="profile-action-icon" href="?page=chat&user=<?= e($person['username']) ?>" aria-label="Conversar com <?= e($person['name']) ?>"><?= icon('message') ?></a>
      <button class="profile-action-icon" type="button" data-profile-notify aria-label="Ativar notificações do perfil"><?= icon('bell') ?></button>
      <button class="btn btn-primary profile-follow" type="button" data-follow>Seguir</button>
    </div>
      </div>
      <div class="profile-card__identity public-profile-copy">
        <div><span class="eyebrow">Membro desde <?= e(date('Y',strtotime($person['created']))) ?></span>
        <h2 id="public-profile-name"><?= e($person['name']) ?><?php if (!empty($person['verified'])): ?> <span class="profile-verified" title="Professor verificado" aria-label="Professor verificado"><?= icon('check') ?></span><?php endif; ?></h2>
        <p class="profile-handle">@<?= e($person['username']) ?> <?= founder_badge_html($person) ?></p>
        <p><?= e($person['bio']) ?></p>
        <?php if (!empty($person['schoolYear']) || !empty($person['course'])): ?><p><?= e(trim(($person['schoolYear'] ?? '') . ' · ' . ($person['course'] ?? ''), ' ·')) ?></p><?php endif; ?>
      </div></div>
      <div class="profile-metrics" aria-label="Resumo do perfil">
        <div><strong><?= count(array_filter($feed, fn($p) => $p['author'] === $person['id'])) ?></strong><span>publicações</span></div>
        <div><strong><?= (int) ($person['followers'] ?? 0) ?></strong><span>seguidores</span></div>
        <div><strong><?= (int) ($person['following'] ?? 0) ?></strong><span>seguindo</span></div>
      </div>
    </div>
  </section>

  <section class="section-heading"><h2>Publicações recentes</h2><span class="eyebrow">comunidade</span></section>
  <div data-public-posts><?php foreach (array_filter($feed, fn($p) => $p['author'] === $person['id']) as $post): ?>
    <article class="post card profile-public-post"><div class="post__head"><?= avatar_html($person) ?><div class="post__meta"><strong><?= e($person['name']) ?></strong><span>@<?= e($person['username']) ?> · <?= e($post['time']) ?></span></div></div><p class="post__body"><?= e($post['body']) ?></p></article>
  <?php endforeach; ?></div>
</div>
