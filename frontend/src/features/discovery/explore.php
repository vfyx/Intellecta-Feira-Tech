<?php declare(strict_types=1); ?>

<header class="page-header">
  <div>
    <span class="eyebrow">Descubra novas conexões</span>
    <h1>Explorar</h1>
  </div>
  <span class="page-count"><?= count($people) ?> pessoas</span>
</header>

<div class="page-content explore-page">
  <section class="explore-intro">
    <div>
      <span class="eyebrow">Comunidade em movimento</span>
      <h2>Encontre quem<br><em>pensa como você.</em></h2>
    </div>
    <p>
      Ideias ficam melhores quando circulam. Descubra estudantes, interesses e
      novas conversas.
    </p>
  </section>

  <label class="form-label search-label" for="people-search">
    <span class="muted">Encontre pessoas e ideias</span>
    <div class="search-field">
      <span><?= icon('search') ?></span>
      <input
        class="input"
        id="people-search"
        data-filter
        placeholder="Pesquisar por nome ou interesse"
      >
    </div>
  </label>

  <div class="list people-list explore-people-list">
    <?php foreach ($people as $person): ?>
      <article class="card person" data-filter-item>
        <div class="avatar"><?= e(initials($person['name'])) ?></div>
        <div class="person__copy">
          <strong><?= e($person['name']) ?></strong>
          <span>@<?= e($person['username']) ?></span>
          <p><?= e($person['bio']) ?></p>
        </div>
        <a class="btn btn-secondary" href="?page=public-profile&amp;user=<?= e($person['username']) ?>">
          Ver perfil <?= icon('send') ?>
        </a>
      </article>
    <?php endforeach; ?>
  </div>
</div>
