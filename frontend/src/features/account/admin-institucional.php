<?php declare(strict_types=1);
if (($account['role'] ?? '') !== 'admin') {  echo '<section class="empty-state"><h1>Acesso restrito</h1><p>Esta área é exclusiva de administradores.</p></section>'; return; }
?>
<header class="page-header"><div><span class="eyebrow">Controle da comunidade</span><h1>Administração</h1><p class="page-header__lead">Gerencie contas, publicações, tópicos e denúncias.</p></div><a href="?page=moderacao" class="btn btn-secondary">Painel de denúncias</a></header>
<div class="page-content admin-page" data-admin>
 <form class="card admin-filters" data-admin-filter><label class="form-label">Gerenciar<select name="kind" class="input"><option value="users">Usuários</option><option value="posts">Publicações</option><option value="subjects">Tópicos</option></select></label><label class="form-label">Buscar<input name="q" class="input" maxlength="120" placeholder="Nome, e-mail ou conteúdo"></label><button class="btn btn-primary">Buscar</button></form>
 <form class="card admin-entry" data-admin-create hidden><label class="form-label">Novo tópico<input class="input" name="name" maxlength="100" required></label><button class="btn btn-primary">Criar tópico</button><p role="status" data-result></p></form>
 <p data-admin-status role="status">Carregando…</p><div class="list" data-admin-list></div>
 <div class="admin-pagination"><button type="button" class="btn btn-secondary" data-admin-prev>Anterior</button><span data-admin-page></span><button type="button" class="btn btn-secondary" data-admin-next>Próxima</button></div>
</div>
