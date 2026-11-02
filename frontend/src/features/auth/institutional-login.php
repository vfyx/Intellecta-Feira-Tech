<?php declare(strict_types=1); ?>

<div class="auth-page">
  <section class="auth-visual">
    <?php render_logo('?page=institutional-login'); ?>
    <div class="auth-visual__copy">
      <span class="eyebrow">Acesso protegido</span>
      <h1>Espaço<br><span>institucional</span>.</h1>
      <p>Professores, moderadores e administração acessam áreas autorizadas por seu papel.</p>
    </div>
  </section>
  <section class="auth-form-wrap">
    <div class="auth-card card">
      <span class="eyebrow">Professores e administração</span>
      <h2>Acesso institucional</h2>
      <p>Use suas credenciais autorizadas.</p>
      <form class="form-stack" data-auth-form="institutional-login">
        <label class="form-label">E-mail<input class="input" name="email" type="email" autocomplete="username" required></label>
        <label class="form-label">Senha<input class="input" name="password" type="password" autocomplete="current-password" required></label>
        <button class="btn btn-primary" type="submit">Entrar</button>
      </form>
      <p class="auth-foot"><a href="?page=login">Voltar ao login de alunos</a></p>
    </div>
  </section>
</div>
