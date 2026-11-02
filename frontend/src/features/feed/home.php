<?php declare(strict_types=1); ?>

<header class="page-header home-page-header">
  <div>
    <span class="eyebrow"><?= date('d/m/Y') ?> · comunidade online</span>
  </div>

</header>

<div class="page-content home-page">
  <section class="composer card">
    <div data-composer-avatar><?= avatar_html($account) ?></div>

    <div class="composer__body">
      <form data-post-form>
        <label class="form-label" for="new-post">
          <span class="muted">Compartilhe algo com a comunidade</span>
          <textarea
            class="composer-input"
            id="new-post"
            rows="2"
            placeholder="O que está passando pela sua cabeça?"
          ></textarea>
        </label>

        <label class="form-label">Tópico<select class="input" name="topic"><option value="">Geral</option><?php foreach (["Tecnologia","Design","Ciência","Matemática","Projetos","Carreira"] as $topic): ?><option><?= e($topic) ?></option><?php endforeach; ?></select></label><div data-attachments></div><div class="composer__actions">
          <button
            class="btn btn-ghost"
            type="button"
            data-media
          >
            <?= icon('image') ?> mídia
          </button>
          <button
            class="btn btn-ghost"
            type="button"
            data-poll
          >
            <?= icon('spark') ?> enquete
          </button>
          <button class="btn btn-primary" type="submit">Publicar</button>
        </div>
      </form>
    </div>
  </section>

  <div class="feed-heading">
    <div>
      <span class="eyebrow">Agora na comunidade</span>
      <h2>Conversas recentes</h2>
    </div>
    <span class="feed-heading__line"></span>
  </div>

  <div class="list home-feed">
    <?php $peopleById = array_column($people, null, 'id'); ?>
    <?php foreach ($feed as $post): ?>
      <article class="card post" data-filter-item>
        <div class="post__head">
          <?= avatar_html($post['author'] === $account['id'] ? $account : ($peopleById[$post['author']] ?? $post)) ?>
          <div class="post__meta">
            <strong><?= e($post['name']) ?></strong>
            <span>@<?= e($post['username']) ?> · <?= e($post['time']) ?></span>
          </div>
          <button
            class="btn btn-ghost"
            type="button"
            data-post-menu
            aria-label="Mais opções"
          >
            •••
          </button>
        </div>

        <p class="post__body"><?= e($post['body']) ?></p>

        <div class="post__footer">
          <button class="btn btn-ghost" type="button" data-like aria-pressed="false">
            ♡ <span data-count><?= (int) $post['likes'] ?></span>
          </button>
          <button
            class="btn btn-ghost"
            type="button"
            data-comments
          >
            <?= icon('message') ?> <?= (int) $post['comments'] ?>
          </button>
          <button class="btn btn-ghost" type="button" data-save="<?= e($post['username'] . '-' . md5($post['body'])) ?>" aria-label="Salvar publicação">
            <?= icon('bookmark') ?>
          </button>
          <span class="post__stats"><?= e($post['time']) ?></span>
        </div>
      </article>
    <?php endforeach; ?>
  </div>
</div>
