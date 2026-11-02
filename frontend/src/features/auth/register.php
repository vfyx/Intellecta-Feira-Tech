<?php declare(strict_types=1); ?>

<div class="auth-page">
  <section class="auth-visual">
    <?php render_logo('?page=login'); ?>

    <div class="auth-visual__copy">
      <span class="eyebrow">Um novo começo</span>
      <h1>Faça parte<br>da <span>conversa.</span></h1>
      <p>Crie um lugar para suas melhores perguntas, ideias e conexões.</p>
    </div>

    <small class="muted">Privacidade primeiro. Sempre.</small>
  </section>

  <section class="auth-form-wrap">
    <div class="auth-card card">
      <span class="eyebrow">Junte-se a nós</span>
      <h2>Crie sua conta</h2>
      <p>Leva menos de um minuto para começar.</p>

      <form class="form-stack" data-auth-form="register">
        <label class="form-label" for="register-name">
          Nome completo
          <input class="input" id="register-name" name="name" autocomplete="name" placeholder="Como podemos chamar você?" required>
        </label>
        <label class="form-label" for="register-user">
          Nome de usuário
          <input class="input" id="register-user" name="username" autocomplete="username" placeholder="@seunome" required>
        </label>
        <label class="form-label" for="register-email">
          E-mail
          <input class="input" id="register-email" name="email" type="email" autocomplete="email" placeholder="demo@example.com" required>
        </label>
        <label class="form-label" for="register-password">
          Senha
          <input class="input" id="register-password" name="password" type="password" autocomplete="new-password" minlength="8" placeholder="Mínimo de 8 caracteres" required>
        </label>
        <label class="form-label" for="register-confirmation">
          Confirme a senha
          <input class="input" id="register-confirmation" name="password_confirmation" type="password" autocomplete="new-password" minlength="8" required>
        </label>
        <label class="form-row">
          <span>
            <input type="checkbox" name="terms" required>
            Aceito os
            <a href="?page=termos" target="_blank" rel="noopener">Termos de Uso</a>.
          </span>
        </label>
        <button class="btn btn-primary" type="submit">
          Criar minha conta <span aria-hidden="true">→</span>
        </button>
      </form>
      <p class="auth-foot">Já tem uma conta? <a href="?page=login">Entrar</a></p>
    </div>
  </section>
</div>
