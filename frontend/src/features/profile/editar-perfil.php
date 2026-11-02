<?php

declare(strict_types=1);
?>

<header class="page-header account-page-header">
  <div>
    <span class="eyebrow">Perfil</span>
    <h1>Editar perfil</h1>
  </div>
</header>

<div class="page-content account-profile-layout">
  <section class="account-profile-card" aria-labelledby="profile-edit-title">
    <div class="account-profile-identity">
      <div class="account-avatar-wrap">
        <button class="profile-avatar-picker" type="button" data-avatar-picker aria-label="Selecionar foto de perfil">
          <?php if (!empty($account['avatar'])): ?>
            <img class="avatar avatar--large avatar-image" src="<?= e($account['avatar']) ?>" alt="Foto de perfil de <?= e($account['name']) ?>">
          <?php else: ?>
            <span class="avatar avatar--large"><?= e(initials($account['name'])) ?></span>
          <?php endif; ?>
          <span class="profile-avatar-picker__label">Alterar foto</span>
        </button>
      </div>
      <div>
        <div class="account-name-line">
          <h2 id="profile-edit-title"><?= e($account['name']) ?></h2>
        </div>
        <div class="account-handle">@<?= e($account['username']) ?></div>
        <span class="account-class"><?= e(trim(($account['schoolYear'] ?? '') . ' · ' . ($account['course'] ?? ''), ' ·')) ?></span>
      </div>
    </div>

    <div class="account-divider"></div>
    <form class="account-form" method="post" action="?page=editar-perfil" data-profile-form>
      <input type="file" accept="image/png,image/jpeg,image/gif,image/webp" data-avatar-input hidden>
      <input type="file" accept="image/png,image/jpeg,image/gif,image/webp" data-banner-input hidden>
      <label class="form-label">Nome<input class="input" name="name" value="<?= e($account['name']) ?>" required maxlength="100"></label>
      <label class="form-label">Usuário<input class="input" name="username" value="<?= e($account['username']) ?>" required pattern="[a-z0-9_]{3,30}"></label>
      <label class="form-label" for="bio">Bio</label>
      <div class="account-field account-field--textarea">
        <textarea class="input" id="bio" name="bio" rows="3" placeholder="Descrição"><?= e($account['bio']) ?></textarea>
        <?= icon('edit') ?>
      </div>

      <label class="form-label" for="birthdate">Data de nascimento</label>
      <input class="input" id="birthdate" type="date" name="birthdate" value="<?= e($account['birthdate']) ?>" data-profile-field>

      <label class="form-label" for="gender">Gênero</label>
      <select class="input" id="gender" name="gender" data-profile-field>
        <option value="">Selecione seu gênero</option>
        <option value="feminino">Feminino</option>
        <option value="masculino">Masculino</option>
        <option value="outro">Outro</option>
      </select>
      <label class="form-label" for="course">Curso</label>
      <select class="input" id="course" name="curso">
        <option value="">Selecione seu curso</option>
        <?php foreach (['Informática', 'Administração', 'Meio Ambiente'] as $course): ?>
          <option value="<?= e($course) ?>" <?= ($account['course'] ?? '') === $course ? 'selected' : '' ?>><?= e($course) ?></option>
        <?php endforeach; ?>
      </select>
      <label class="form-label" for="school-year">Ano escolar</label>
      <select class="input" id="school-year" name="ano_escolar">
        <option value="">Selecione seu ano</option>
        <?php foreach (['1º ano', '2º ano', '3º ano'] as $year): ?>
          <option value="<?= e($year) ?>" <?= ($account['schoolYear'] ?? '') === $year ? 'selected' : '' ?>><?= e($year) ?></option>
        <?php endforeach; ?>
      </select>
      <div class="profile-banner-editor">
        <span class="form-label">Personalizar banner</span>
        <?php if (!empty($account['banner'])): ?>
          <img class="profile-banner-preview" data-banner-preview src="<?= e($account['banner']) ?>" alt="Prévia do banner atual">
        <?php else: ?>
          <div class="profile-banner-preview" data-banner-preview aria-label="Banner padrão"></div>
        <?php endif; ?>
        <div class="account-form-actions">
          <button class="btn btn-secondary" type="button" data-banner-picker>Selecionar banner</button>
          <?php if (!empty($account['banner'])): ?><button class="btn btn-ghost" type="button" data-banner-remove>Remover banner</button><?php endif; ?>
        </div>
      </div>
      <div class="account-form-actions"><a class="btn btn-ghost" href="?page=profile">Cancelar</a><button class="btn btn-primary account-confirm" type="submit">Salvar alterações</button></div>
    </form>
  </section>
</div>
