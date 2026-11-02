<?php declare(strict_types=1);
if (!in_array($account['role'] ?? '', ['moderador','admin'], true)) {  echo '<section class="empty-state"><h1>Acesso restrito</h1><p>Esta área é exclusiva da moderação.</p></section>'; return; }
?>
<header class="page-header"><div><span class="eyebrow">Moderação</span><h1>Denúncias</h1><p class="page-header__lead">Analise o relato e registre a decisão.</p></div></header>
<div class="page-content moderation-page" data-moderation>
 <form class="card moderation-filters" data-moderation-filter>
  <label class="form-label">Tipo<select class="input" name="type"><option value="post">Publicações</option><option value="perfil">Perfis</option></select></label>
  <label class="form-label">Status<select class="input" name="status"><option value="nova">Novas</option><option value="em_analise">Em análise</option><option value="resolvida">Resolvidas</option><option value="arquivada">Arquivadas</option><option value="">Todas</option></select></label>
  <button class="btn btn-primary" type="submit">Atualizar</button>
 </form>
 <p data-moderation-status role="status">Carregando denúncias…</p>
 <div data-moderation-list class="list"></div>
 <div class="moderation-pagination"><button class="btn btn-secondary" data-moderation-prev type="button">Anterior</button><span data-moderation-page></span><button class="btn btn-secondary" data-moderation-next type="button">Próxima</button></div>
</div>
