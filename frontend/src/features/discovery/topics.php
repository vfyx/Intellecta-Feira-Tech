<?php declare(strict_types=1); ?>

<header class="page-header">
  <div><span class="eyebrow">Curadoria da comunidade</span><h1>Tópicos</h1></div>
  <span class="page-count">para você</span>
</header>

<div class="page-content">
  <section class="topic-hero card">
    <span class="eyebrow">Aprenda em movimento</span>
    <h2>O que está despertando curiosidade?</h2>
    <p>Explore conversas por assunto e encontre pessoas com interesses próximos dos seus.</p>
  </section>
  <div class="topic-grid">
    <?php foreach ([
      ['Tecnologia', '1.248 publicações', 'spark'],
      ['Design', '862 publicações', 'image'],
      ['Ciência', '734 publicações', 'spark'],
      ['Matemática', '521 publicações', 'plus'],
      ['Projetos', '408 publicações', 'edit'],
      ['Carreira', '316 publicações', 'user'],
    ] as [$name, $count, $topicIcon]): ?>
      <a class="topic-card card" href="?page=home&amp;topic=<?= urlencode($name) ?>">
        <span class="topic-card__icon"><?= icon($topicIcon) ?></span>
        <strong>#<?= e($name) ?></strong>
        <span><?= count(array_filter($feed, fn($post) => $post['topic'] === $name)) ?> publicações</span>
      </a>
    <?php endforeach; ?>
  </div>
</div>
