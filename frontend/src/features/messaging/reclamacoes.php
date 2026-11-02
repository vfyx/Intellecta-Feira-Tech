<?php declare(strict_types=1); $isStudent = ($account['role'] ?? '') === 'aluno'; ?>
<header class="page-header"><div><span class="eyebrow">Canal com o professor</span><h1>Reclamações</h1><p class="page-header__lead">Um espaço para relatar situações e solicitar orientação.</p></div><a class="btn btn-secondary" href="?page=chat">Voltar às conversas</a></header>
<div class="page-content complaints-page" data-complaints-app>
  <?php if ($isStudent): ?>
  <section class="card complaint-form-card" aria-labelledby="complaint-heading">
    <span class="eyebrow">Requerimento do aluno</span><h2 id="complaint-heading">Reclamação ao professor</h2>
    <p class="muted">Escolha quem receberá seu relato. Ele será identificado e ficará disponível apenas para você e o professor escolhido.</p>
    <form data-complaint-form>
      <fieldset class="complaint-fields"><legend>1. Identificação</legend>
        <div class="complaint-grid">
          <label class="form-label">Nome do aluno<input class="input" value="<?= e($account['name']) ?>" readonly></label>
          <label class="form-label">RM <span class="muted">(opcional)</span><input class="input" name="rm" maxlength="30" placeholder="Registro de matrícula"></label>
          <label class="form-label">Curso<input class="input" name="course" maxlength="120" required value="<?= e($account['course'] ?? '') ?>" placeholder="Ex.: Informática para Internet"></label>
          <label class="form-label">Série / turma<input class="input" name="class" maxlength="60" required value="<?= e($account['class'] ?: ($account['schoolYear'] ?? '')) ?>" placeholder="Ex.: 2º ano B"></label>
        </div>
      </fieldset>
      <fieldset class="complaint-fields"><legend>2. Destinatário e relato</legend>
        <label class="form-label">Professor<select class="input" name="teacher" required disabled><option value="">Carregando professores…</option></select></label>
        <label class="form-label">Assunto<input class="input" name="subject" maxlength="150" required placeholder="Resuma o motivo da reclamação"></label>
        <label class="form-label">O que aconteceu?<textarea class="input" name="description" rows="6" minlength="10" maxlength="5000" required placeholder="Descreva a situação, quando aconteceu e os detalhes relevantes."></textarea></label>
        <label class="form-label">O que você solicita? <span class="muted">(opcional)</span><textarea class="input" name="request" rows="3" maxlength="2000" placeholder="Explique como gostaria que o professor ajudasse."></textarea></label>
      </fieldset>
      <p class="complaint-feedback" data-complaint-feedback role="status" tabindex="-1"></p>
      <div class="complaint-actions"><span class="muted">Você poderá acompanhar a resposta abaixo.</span><button class="btn btn-primary" type="submit" disabled>Enviar reclamação</button></div>
    </form>
  </section>
  <?php endif; ?>
  <section class="complaint-history" aria-labelledby="complaint-history-title">
    <div class="complaint-history__heading"><h2 id="complaint-history-title"><?= ($account['role'] ?? '') === 'professor' ? 'Reclamações recebidas' : 'Minhas reclamações' ?></h2><button class="btn btn-secondary" type="button" data-complaint-refresh>Atualizar</button></div>
    <p data-complaint-load-status role="status">Carregando reclamações…</p>
    <div data-complaint-list></div>
  </section>
</div>
