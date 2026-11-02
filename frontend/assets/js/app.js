'use strict';
(() => {
  document.addEventListener('submit', event => { event.preventDefault(); event.stopImmediatePropagation(); alert('Demonstração somente para leitura. Nenhum dado é enviado ou salvo.'); }, true);
  const boot = JSON.parse(document.querySelector('#app-state').textContent);
  let state = boot.data, pendingMedia = [], pendingMediaType = null, pendingPoll = null, pendingAvatar = null, pendingBanner = null, bannerRemove = false, activeChat = null, composerCarousel = null;
  const activeCarousels = [];
  const params = new URLSearchParams(location.search);
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const person = id => state.people.find(p => p.id === id);
  const target = () => state.people.find(p => p.username === params.get('user'));
  let toastTimer;
  function notify(text) { const t = $('#toast'); t.textContent = text; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 4500); }
  function animate(el) { if (el && state?.account.settings.motion !== false && !matchMedia('(prefers-reduced-motion: reduce)').matches) el.animate([{opacity:.4,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:180,easing:'ease-out'}); }
  async function api(action, values = {}) {
    if (action === 'state') return state;
    if (action === 'logout') return {redirect: '?page=home'};
    throw new Error('Demonstração somente para leitura. Nenhum dado é enviado ou salvo.');
  }
  const feedQuery=()=>({view:boot.page,topic:params.get('topic')||undefined,post:params.get('post')||undefined});
  async function refresh() {
    const fresh=await api('state',{...feedQuery(),no_feed:['chat','notifications'].includes(boot.page)?1:0});
    if(['chat','notifications'].includes(boot.page)) fresh.feed=state.feed;
    state=fresh; render();
  }
  let moreBusy=false, feedObserver=null;
  function setupFeedPaging() {
    if(boot.page!=='home'||!$('.home-feed'))return;
    $('[data-more-posts]')?.remove();feedObserver?.disconnect();
    if(!state.feedPage?.more)return;
    const button=document.createElement('button');button.type='button';button.className='btn btn-secondary feed-more';button.dataset.morePosts='';button.textContent='Carregar mais publicações';
    $('.home-feed').after(button);
    button.onclick=async()=>{
      if(moreBusy)return;moreBusy=true;button.disabled=true;button.textContent='Carregando…';
      try {const page=await api('state',{...feedQuery(),cursor:state.feedPage.cursor,feed_only:1});const known=new Set(state.feed.map(p=>p.id));state.feed.push(...page.feed.filter(p=>!known.has(p.id)));state.feedPage=page.feedPage;renderPosts();}
      catch(e){button.textContent='Tentar carregar novamente';notify(e.message);feedObserver?.disconnect();}
      finally{moreBusy=false;button.disabled=false;}
    };
    feedObserver=new IntersectionObserver(entries=>{if(entries[0].isIntersecting&&!moreBusy)button.click();},{rootMargin:'250px'});feedObserver.observe(button);
  }
  async function compressedImage(file) {
    if(file.type==='image/gif') {
      if(file.size>2097152)throw new Error('GIFs devem ter até 2 MB.');
      return await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});
    }
    const bitmap=await createImageBitmap(file);
    try {
      if(bitmap.width*bitmap.height>40000000)throw new Error('A imagem possui dimensões muito grandes.');
      const ratio=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*ratio));canvas.height=Math.max(1,Math.round(bitmap.height*ratio));canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);
      for(const quality of [.84,.7,.55]) {const data=canvas.toDataURL('image/webp',quality);if(data.length<=2796200)return data;}
      throw new Error('Não foi possível reduzir esta imagem para 2 MB.');
    } finally {bitmap.close();}
  }
  let reading=false;
  async function readActiveConversation() {
    const box=$('[data-chat-messages]');
    if(reading||document.hidden||!document.hasFocus()||!activeChat||!box||box.scrollHeight-box.scrollTop-box.clientHeight>60)return;
    const incoming=state.messages.filter(m=>m.from===activeChat&&!m.read);if(!incoming.length)return;
    const contact=activeChat;reading=true;
    try {const result=await api('chat-read',{target:contact,until:incoming.at(-1).id});incoming.forEach(m=>m.read=true);state.unread??={};state.unread[contact]=Math.max(0,Number(state.unread[contact]||0)-result.read);renderChat();updateUnreadBadge();}
    catch(e){notify(e.message);}finally{reading=false;}
  }
  function updateUnreadBadge() {const count=Object.values(state.unread||{}).reduce((sum,n)=>sum+Number(n),0);$$('[data-dm-unread]').forEach(b=>{b.textContent=count||'';b.hidden=!count;});}
  function startLive() { /* Public demo has no live service. */ }
  function dialog(title, content) {
    const d = document.createElement('dialog'); d.className = 'card'; d.style.color='var(--text)'; d.style.width='min(560px, calc(100vw - 2rem))'; d.style.maxHeight='85vh'; d.style.overflow='auto';
    d.innerHTML = `<div class="page-content"><h2>${esc(title)}</h2>${content}<div class="account-form-actions"><button type="button" class="btn btn-secondary" data-close>Fechar</button></div></div>`;
    document.body.append(d); $('[data-close]',d).onclick = () => d.close(); d.addEventListener('close',()=>d.remove(),{once:true}); d.showModal(); animate(d); return d;
  }
  function secretDialog(title, secret, next) {
    const d=dialog(title,`<p>Guarde esta chave em um lugar seguro. Ela só é exibida agora.</p><textarea class="input" readonly aria-label="Chave">${esc(secret)}</textarea><p>Você precisará dela para ${title.includes('recuperação')?'recuperar o acesso sem e-mail':'entrar na conta junto com a senha'}.</p>`);
    if(next)d.addEventListener('close',()=>location.assign(next),{once:true});
  }
  async function finishAuth(result) { if(result.recovery) secretDialog('Chave de recuperação',result.recovery,result.redirect); else location.assign(result.redirect); }
  function recovery() { notify('A recuperação de acesso ainda não está disponível.'); }
  async function share(url) { try { await navigator.clipboard.writeText(url); notify('Link copiado.'); } catch { dialog('Compartilhar',`<label class="form-label">Copie o link<input class="input" readonly value="${esc(url)}"></label>`); } }
  function url(query) { const u=new URL(location.href);u.search=new URLSearchParams(query);u.hash='';return u.href; }
  function bodyHTML(body) {
    let html=esc(body).replace(/\n/g,'<br>');
    for(const p of state.people){const token=`@${p.username}`,safe=token.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');html=html.replace(new RegExp(`(^|[^\\w@])(${safe})(?![\\w])`,'gi'),`$1<a class="mention" href="?page=public-profile&user=${encodeURIComponent(p.username)}">$2</a>`);}
    return html;
  }
  function avatarHTML(user) {
    const name = user?.name || '?';
    return user?.avatar
      ? `<img class="avatar avatar-image" src="${esc(user.avatar)}" alt="Foto de perfil de ${esc(name)}">`
      : `<div class="avatar">${esc(Array.from(name.trim())[0]?.toLocaleUpperCase('pt-BR') || '?')}</div>`;
  }
  let imageCropBusy = false;
  async function chooseProfileImage(input, kind) {
    const file = input.files[0]; input.value = '';
    if (!file || imageCropBusy) return;
    if (!/^image\/(png|jpeg|gif|webp)$/.test(file.type) || file.size > 2097152) { notify('Selecione uma imagem PNG, JPEG, GIF ou WebP de até 2 MB.'); return; }
    imageCropBusy = true;
    const source = URL.createObjectURL(file);
    try {
      const picture = new Image(); picture.src = source; await picture.decode();
      if (!picture.naturalWidth || picture.naturalWidth * picture.naturalHeight > 25000000) throw new Error('Escolha uma imagem de até 25 megapixels.');
      const result = await cropProfileImage(picture, kind, file.type === 'image/gif');
      if (!result) return;
      if (kind === 'banner') {
        pendingBanner = result; bannerRemove = false;
        const preview = Object.assign(document.createElement('img'), {className:'profile-banner-preview',src:result,alt:'Prévia do banner ajustado'});
        preview.setAttribute('data-banner-preview', ''); $('[data-banner-preview]').replaceWith(preview);
      } else {
        pendingAvatar = result;
        $('[data-avatar-picker] .avatar').replaceWith(Object.assign(document.createElement('img'), {className:'avatar avatar--large avatar-image',src:result,alt:'Prévia da foto ajustada'}));
      }
      notify('Enquadramento aplicado. Clique em Salvar alterações para atualizar o perfil.');
    } catch (error) { notify(error.name === 'EncodingError' ? 'Não foi possível abrir essa imagem. Tente outro arquivo.' : error.message); }
    finally { URL.revokeObjectURL(source); imageCropBusy = false; }
  }
  function cropProfileImage(picture, kind, animated) {
    return new Promise(resolve => {
      const banner = kind === 'banner', ratio = banner ? 6 : 1;
      const opener = document.activeElement, modal = document.createElement('dialog');
      modal.className = 'image-crop-dialog'; modal.setAttribute('aria-labelledby', 'crop-title');
      modal.innerHTML = `<header class="image-crop-header"><h2 id="crop-title">Ajustar ${banner ? 'banner' : 'foto de perfil'}</h2><button type="button" data-crop-cancel aria-label="Fechar ajuste">×</button></header><p id="crop-help">Arraste a imagem para escolher a parte que aparece. Use o zoom para aproximar ou afastar.${animated ? ' A imagem animada será salva como uma foto estática.' : ''}</p><div class="image-crop-stage ${banner ? 'image-crop-stage--banner' : ''}"><canvas tabindex="0" aria-label="Enquadramento da imagem. Use as setas do teclado para mover." aria-describedby="crop-help"></canvas></div><label class="image-crop-zoom" for="crop-zoom"><span>Zoom</span><output for="crop-zoom">100%</output><input id="crop-zoom" type="range" min="1" max="4" step="0.01" value="1"></label><p class="image-crop-note">O recorte só será salvo no perfil ao clicar em Salvar alterações.</p><footer class="image-crop-actions"><button class="btn btn-secondary" type="button" data-crop-reset>Centralizar</button><button class="btn btn-secondary" type="button" data-crop-cancel>Cancelar</button><button class="btn btn-primary" type="button" data-crop-apply>Usar enquadramento</button></footer>`;
      const canvas = $('canvas',modal), slider = $('input',modal), ctx = canvas.getContext('2d');
      canvas.width = banner ? 1200 : 512; canvas.height = banner ? 200 : 512;
      let centerX = picture.naturalWidth / 2, centerY = picture.naturalHeight / 2, zoom = 1, drag = null, result = null;
      const baseWidth = Math.min(picture.naturalWidth, picture.naturalHeight * ratio);
      function draw() {
        const width = baseWidth / zoom, height = width / ratio;
        centerX = Math.max(width / 2, Math.min(picture.naturalWidth - width / 2, centerX));
        centerY = Math.max(height / 2, Math.min(picture.naturalHeight - height / 2, centerY));
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(picture,centerX-width/2,centerY-height/2,width,height,0,0,canvas.width,canvas.height);
        $('output',modal).textContent = `${Math.round(zoom*100)}%`;
      }
      canvas.addEventListener('pointerdown', event => { if (event.button !== 0) return; drag = {id:event.pointerId,x:event.clientX,y:event.clientY}; canvas.setPointerCapture(event.pointerId); canvas.focus(); });
      canvas.addEventListener('pointermove', event => {
        if (!drag || drag.id !== event.pointerId) return;
        const rect = canvas.getBoundingClientRect(), scale = baseWidth / zoom / rect.width;
        centerX -= (event.clientX-drag.x)*scale; centerY -= (event.clientY-drag.y)*scale;
        drag.x = event.clientX; drag.y = event.clientY; draw();
      });
      ['pointerup','pointercancel','lostpointercapture'].forEach(type => canvas.addEventListener(type, () => { drag = null; }));
      canvas.addEventListener('keydown', event => {
        const directions = {ArrowLeft:[1,0],ArrowRight:[-1,0],ArrowUp:[0,1],ArrowDown:[0,-1]}, delta = directions[event.key];
        if (!delta) return; event.preventDefault(); const step = baseWidth / zoom * (event.shiftKey ? .1 : .02);
        centerX += delta[0]*step; centerY += delta[1]*step; draw();
      });
      slider.addEventListener('input', () => { zoom = Number(slider.value); draw(); });
      $('[data-crop-reset]',modal).onclick = () => { centerX=picture.naturalWidth/2; centerY=picture.naturalHeight/2; zoom=1; slider.value='1'; draw(); };
      $$('[data-crop-cancel]',modal).forEach(button => button.onclick = () => modal.close());
      $('[data-crop-apply]',modal).onclick = () => { result = canvas.toDataURL('image/png'); modal.close(); };
      const overflow = document.body.style.overflow;
      document.body.append(modal); document.body.style.overflow = 'hidden';
      modal.addEventListener('close', () => { modal.remove(); document.body.style.overflow=overflow; if (opener?.isConnected) opener.focus(); resolve(result); }, {once:true});
      modal.showModal(); draw(); slider.focus(); animate(modal);
    });
  }

  function openReport(profile, post = null) {
    const opener = document.activeElement, modal = document.createElement('dialog');
    modal.className = 'report-dialog';
    modal.setAttribute('aria-labelledby', 'report-title');
    modal.innerHTML = `<header class="report-dialog__header"><div><span class="eyebrow">SEGURANÇA DA COMUNIDADE</span><h2 id="report-title">${post ? 'Denunciar publicação' : 'Denunciar perfil'}</h2></div><button type="button" class="report-dialog__close" data-report-close aria-label="Fechar denúncia">×</button></header><div class="report-dialog__person">${avatarHTML(profile)}<div><strong>${esc(profile.name)}</strong><span>@${esc(profile.username)}</span></div></div>${post ? `<blockquote class="report-dialog__excerpt">${esc(post.body || "Publicação com mídia")}</blockquote>` : ""}<form class="report-dialog__form"><label for="report-reason">O que aconteceu?</label><p id="report-help">Descreva o motivo da denúncia e inclua os detalhes que considerar importantes.</p><textarea class="input" id="report-reason" name="reason" rows="5" maxlength="2000" required aria-describedby="report-help report-count" placeholder="Descreva o motivo da denúncia…"></textarea><span id="report-count">0 / 2000</span><p class="report-dialog__error" role="alert" hidden></p><footer class="report-dialog__actions"><button type="button" class="btn btn-secondary" data-report-close>Cancelar</button><button type="submit" class="btn btn-primary">Enviar denúncia</button></footer></form>`;
    const form = $('form', modal), reason = $('textarea', modal), submit = $('[type="submit"]', modal), error = $('[role="alert"]', modal);
    let busy = false;
    $$('[data-report-close]', modal).forEach(button => button.addEventListener('click', () => modal.close()));
    reason.addEventListener('input', () => { reason.setCustomValidity(''); $('#report-count', modal).textContent = `${reason.value.length} / 2000`; });
    form.addEventListener('submit', async event => {
      event.preventDefault(); event.stopPropagation();
      if (busy) return;
      if (!reason.value.trim()) { reason.setCustomValidity('Descreva o motivo da denúncia.'); reason.reportValidity(); return; }
      busy = true; submit.disabled = true; submit.textContent = 'Enviando…'; error.hidden = true;
      try {
        const result = await api(post ? 'report-post' : 'report', {...(post ? {id: post.id} : {target: profile.id}), reason: reason.value.trim()});
        form.innerHTML = `<div class="report-dialog__success" role="status"><span aria-hidden="true">✓</span><h3>Denúncia enviada</h3><p>${esc(result.message || 'Denúncia registrada.')}</p></div><footer class="report-dialog__actions"><button type="button" class="btn btn-primary" data-report-done>Concluir</button></footer>`;
        $('[data-report-done]', modal).onclick = () => modal.close();
        $('[data-report-done]', modal).focus();
      } catch (err) { error.textContent = err.message; error.hidden = false; }
      finally { busy = false; submit.disabled = false; submit.textContent = 'Enviar denúncia'; }
    });
    const overflow = document.body.style.overflow;
    document.body.append(modal); document.body.style.overflow = 'hidden';
    modal.addEventListener('close', () => { modal.remove(); document.body.style.overflow = overflow; if (opener?.isConnected) opener.focus(); }, {once:true});
    modal.showModal(); reason.focus(); animate(modal);
  }

  function openBlock(profile) {
    const opener = document.activeElement, modal = document.createElement('dialog');
    modal.className = 'report-dialog'; modal.setAttribute('aria-labelledby', 'block-title');
    modal.innerHTML = `<header class="report-dialog__header"><div><span class="eyebrow">PRIVACIDADE</span><h2 id="block-title">Bloquear perfil?</h2></div><button type="button" class="report-dialog__close" data-block-close aria-label="Fechar confirmação">×</button></header><div class="report-dialog__person">${avatarHTML(profile)}<div><strong>${esc(profile.name)}</strong><span>@${esc(profile.username)}</span></div></div><div class="block-dialog__details"><p>Vocês não poderão trocar mensagens nem ver publicações um do outro.</p><p>As conexões de seguir entre vocês serão removidas. Você poderá desbloquear este perfil nas configurações de privacidade.</p></div><p class="report-dialog__error" role="alert" hidden></p><footer class="report-dialog__actions"><button type="button" class="btn btn-secondary" data-block-close>Cancelar</button><button type="button" class="btn block-dialog__confirm" data-block-confirm>Bloquear perfil</button></footer>`;
    let busy = false;
    $$('[data-block-close]', modal).forEach(b => b.onclick = () => { if (!busy) modal.close(); });
    modal.addEventListener('cancel', event => { if (busy) event.preventDefault(); });
    $('[data-block-confirm]', modal).onclick = async () => {
      if (busy) return; busy = true;
      const button = $('[data-block-confirm]', modal), error = $('[role="alert"]', modal);
      $$('button', modal).forEach(b => b.disabled = true); button.textContent = 'Bloqueando…'; error.hidden = true;
      try { await api('block', {target: profile.id}); location.assign('?page=explore'); }
      catch (err) { error.textContent = err.message; error.hidden = false; busy = false; $$('button', modal).forEach(b => b.disabled = false); button.textContent = 'Bloquear perfil'; }
    };
    const overflow = document.body.style.overflow;
    document.body.append(modal); document.body.style.overflow = 'hidden';
    modal.addEventListener('close', () => { modal.remove(); document.body.style.overflow = overflow; if (opener?.isConnected) opener.focus(); }, {once:true});
    modal.showModal(); $('[data-block-close]', modal).focus(); animate(modal);
  }

  let closeDirectMenu = null;
  function openDirectMenu(profile, x, y, opener) {
    closeDirectMenu?.();
    if (!profile) return;
    const menu=document.createElement('div');menu.className='direct-menu';menu.setAttribute('role','menu');menu.setAttribute('aria-label',`Opções de ${profile.name}`);
    menu.innerHTML='<button type="button" role="menuitem" data-direct-action="profile">Entrar no perfil</button><button type="button" role="menuitem" data-direct-action="block">Bloquear perfil</button><button type="button" role="menuitem" data-direct-action="report">Denunciar perfil</button><button type="button" role="menuitem" data-direct-action="close">Fechar mensagem direta</button><button type="button" role="menuitem" data-direct-action="clear">Limpar meu histórico</button>';
    const outside=event=>{if(!menu.contains(event.target))close(false);};
    function close(restore=true) { menu.remove();document.removeEventListener('pointerdown',outside,true);window.removeEventListener('resize',resize);document.removeEventListener('scroll',resize,true);closeDirectMenu=null;if(restore&&opener?.isConnected)opener.focus(); }
    const resize=()=>close(false);closeDirectMenu=close;
    document.body.append(menu);
    const rect=menu.getBoundingClientRect();menu.style.left=`${Math.max(8,Math.min(x,innerWidth-rect.width-8))}px`;menu.style.top=`${Math.max(8,Math.min(y,innerHeight-rect.height-8))}px`;
    document.addEventListener('pointerdown',outside,true);window.addEventListener('resize',resize);document.addEventListener('scroll',resize,true);
    const buttons=$$('button',menu);buttons[0].focus({preventScroll:true});
    menu.addEventListener('keydown',event=>{
      if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();}
      else if(event.key==='Tab')close(false);
      else if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault();const index=buttons.indexOf(document.activeElement);buttons[event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowDown'?1:buttons.length-1))%buttons.length].focus();}
    });
    menu.addEventListener('click',async event=>{
      const button=event.target.closest('[data-direct-action]');if(!button)return;event.stopPropagation();const action=button.dataset.directAction;close();
      if(action==='profile'){location.assign(url({page:'public-profile',user:profile.username}));return;}
      if(action==='block'){openBlock(profile);return;}
      if(action==='report'){openReport(profile);return;}
      if(action==='clear'){activeChat=profile.id;dialog('Limpar meu histórico','<p>Isso oculta as mensagens apenas para sua conta.</p><button type="button" class="btn btn-secondary" data-clear-chat>Limpar meu histórico</button>');return;}
      try {
        await api('close-direct',{target:profile.id});
        state.account.closedDirect=[...new Set([...(state.account.closedDirect||[]),String(profile.id)])];
        if(String(activeChat)===String(profile.id))activeChat=null;
        renderChat();notify('Mensagem direta fechada. O histórico foi preservado.');
      } catch(error) { notify(error.message); }
    });
  }
  document.addEventListener('contextmenu',event=>{
    const row=event.target.closest('[data-conversation]');if(!row)return;
    event.preventDefault();openDirectMenu(person(row.dataset.conversation),event.clientX,event.clientY,row);
  });
  document.addEventListener('keydown',event=>{
    const row=event.target.closest('[data-conversation]');if(!row||!(event.key==='ContextMenu'||(event.shiftKey&&event.key==='F10')))return;
    event.preventDefault();const rect=row.getBoundingClientRect();openDirectMenu(person(row.dataset.conversation),rect.left+16,rect.bottom,row);
  });

  function openConversationPicker() {
    const opener = document.activeElement, modal = document.createElement('dialog');
    modal.className = 'network-dialog conversation-picker';
    modal.setAttribute('aria-labelledby','conversation-picker-title');
    modal.innerHTML = '<header class="network-dialog__header"><h2 id="conversation-picker-title">Nova conversa <span data-contact-count></span></h2><button type="button" class="network-dialog__close" aria-label="Fechar lista">×</button></header><div class="network-dialog__search"><label class="sr-only" for="conversation-picker-search">Buscar nome ou usuário</label><input class="input" id="conversation-picker-search" type="search" placeholder="Buscar nome ou @usuário" autocomplete="off"></div><p class="conversation-picker__hint">Pessoas que você segue ou que seguem você.</p><ul class="network-list" aria-label="Pessoas para conversar"></ul>';
    const search = $('input',modal), list = $('ul',modal);
    const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
    function contacts() {
      const connected = new Set([...(state.account.following || []).map(String),...(state.followers || []).map(p=>String(p.id))]);
      const blocked = new Set((state.account.blocked || []).map(String));
      return state.people.filter(p=>String(p.id)!==String(state.account.id)&&connected.has(String(p.id))&&!blocked.has(String(p.id)));
    }
    function draw() {
      const all=contacts(), query=normalize(search.value.trim().replace(/^@/,''));
      const visible=all.filter(p=>normalize(`${p.name} ${p.username}`).includes(query));
      $('[data-contact-count]',modal).textContent=all.length;
      list.innerHTML=visible.map(p=>`<li class="network-person"><button type="button" class="conversation-picker__person" data-start-conversation="${esc(p.id)}" aria-label="Iniciar conversa com ${esc(p.name)}">${avatarHTML(p)}<span class="network-person__identity"><strong>${esc(p.name)}${p.verified?'<span class="network-person__verified" aria-label="Verificado">✓</span>':''}</strong><span>@${esc(p.username)}</span></span><span class="btn btn-primary conversation-picker__action" aria-hidden="true">Conversar</span></button></li>`).join('') || `<li class="network-list__empty"><strong>${query?'Nenhuma pessoa encontrada':'Nenhuma conexão por enquanto'}</strong><p>${query?'Tente outro nome ou usuário.':'Siga alguém na aba Explorar ou espere que alguém siga você para começar uma nova conversa por aqui.'}</p></li>`;
    }
    $('.network-dialog__close',modal).onclick=()=>modal.close();
    search.addEventListener('input',draw);
    let selected=false;
    modal.addEventListener('click',async event=>{
      const button=event.target.closest('[data-start-conversation]');
      if(!button)return; event.stopPropagation();
      const p=contacts().find(p=>String(p.id)===button.dataset.startConversation);
      if(!p){draw();return;}
      if(button.disabled)return;button.disabled=true;
      try { await api('open-direct',{target:p.id}); } catch(error) { button.disabled=false;$('.conversation-picker__hint',modal).textContent=error.message;return; }
      state.account.closedDirect=(state.account.closedDirect||[]).filter(id=>String(id)!==String(p.id));
      activeChat=p.id;selected=true;modal.close();renderChat();
      const box=$('[data-chat-messages]');if(box)box.scrollTop=box.scrollHeight;
    });
    const overflow=document.body.style.overflow;
    modal.addEventListener('close',()=>{modal.remove();document.body.style.overflow=overflow;if(selected)$('[data-chat-form] input')?.focus();else if(opener?.isConnected)opener.focus();},{once:true});
    document.body.append(modal);document.body.style.overflow='hidden';draw();modal.showModal();search.focus();animate(modal);
  }

  function openNetwork(kind) {
    const following = kind === 'following';
    const opener = document.activeElement;
    const modal = document.createElement('dialog');
    modal.className = 'network-dialog';
    modal.setAttribute('aria-labelledby', 'network-title');
    modal.innerHTML = `<header class="network-dialog__header"><h2 id="network-title">${following ? 'Seguindo' : 'Seguidores'} <span data-network-count></span></h2><button type="button" class="network-dialog__close" aria-label="Fechar lista">×</button></header><div class="network-dialog__search"><label class="sr-only" for="network-search">Pesquisar por nome ou usuário</label><input class="input" id="network-search" type="search" placeholder="Pesquisar por nome ou @usuário" autocomplete="off"></div><p class="network-dialog__status" role="status" aria-live="polite"></p><ul class="network-list" aria-label="${following ? 'Perfis que você segue' : 'Seus seguidores'}"></ul>`;
    const search = $('#network-search', modal), list = $('.network-list', modal), status = $('.network-dialog__status', modal);
    const normalize = text => String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
    const isFollowing = id => state.account.following.some(value => String(value) === String(id));
    function draw() {
      const people = new Map(state.people.map(p => [String(p.id), p]));
      const contacts = following ? state.people.filter(p => isFollowing(p.id)) : (state.followers || []).map(p => ({...p, ...people.get(String(p.id))}));
      const query = normalize(search.value.trim().replace(/^@/, ''));
      const visible = contacts.filter(p => normalize(`${p.name} ${p.username}`).includes(query));
      $('[data-network-count]', modal).textContent = contacts.length;
      list.innerHTML = visible.map(p => {
        const active = isFollowing(p.id), name = esc(p.name), href = `?page=public-profile&user=${encodeURIComponent(p.username)}`;
        return `<li class="network-person"><a class="network-person__profile" href="${href}" aria-label="Ver perfil de ${name}">${avatarHTML(p)}<span class="network-person__identity"><strong>${esc(p.username)}${p.verified ? '<span class="network-person__verified" aria-label="Verificado">✓</span>' : ''}</strong><span>${name}</span></span></a>${String(p.id) === String(state.account.id) ? '' : `<button type="button" class="btn ${active ? 'btn-secondary' : 'btn-primary'} network-person__follow" data-network-follow="${esc(p.id)}" aria-pressed="${active}" aria-label="${active ? 'Deixar de seguir' : 'Seguir'} ${name}">${active ? 'Seguindo' : 'Seguir'}</button>`}</li>`;
      }).join('') || `<li class="network-list__empty"><strong>${query ? 'Nenhum perfil encontrado' : following ? 'Você ainda não segue ninguém' : 'Ainda não há seguidores'}</strong><p>${query ? 'Tente outro nome ou usuário.' : following ? 'Encontre pessoas na aba Explorar.' : 'Quando alguém seguir você, o perfil aparecerá aqui.'}</p></li>`;
    }
    $('.network-dialog__close', modal).addEventListener('click', () => modal.close());
    search.addEventListener('input', draw);
    modal.addEventListener('click', async event => {
      const button = event.target.closest('[data-network-follow]');
      if (!button) {
        if (event.target === modal) { const r = modal.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) modal.close(); }
        return;
      }
      event.stopPropagation();
      if (button.disabled) return;
      button.disabled = true; button.textContent = 'Aguarde…'; status.textContent = '';
      try {
        const id = button.dataset.networkFollow, result = await api('follow', {target: id});
        state.account.following = state.account.following.filter(value => String(value) !== id);
        if (result.active) state.account.following.push(id);
        // Preserve the confirmed result even if a subsequent state refresh fails.
        try { await refresh(); } catch { render(); }
        if (!modal.open) return;
        draw();
        status.textContent = result.active ? 'Você está seguindo este perfil.' : 'Você deixou de seguir este perfil.';
        const replacement = $('[data-network-follow]', modal).find(el => el.dataset.networkFollow === id);
        (replacement || search).focus({preventScroll: true});
      } catch (error) {
        button.disabled = false; button.textContent = isFollowing(button.dataset.networkFollow) ? 'Seguindo' : 'Seguir';
        status.textContent = error.message;
      }
    });
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    modal.addEventListener('close', () => { document.body.style.overflow = previousOverflow; modal.remove(); if (opener?.isConnected) opener.focus({preventScroll: true}); }, {once: true});
    document.body.append(modal); draw(); modal.showModal(); search.focus(); animate(modal);
  }

  function postHTML(p) {
    const a=state.account, saved=a.saved.includes(p.id), reposted=a.reposts.includes(p.id), author=p.author===a.id ? a : person(p.author);
    const badge=author?.verified?'<span class="profile-verified" title="Professor verificado" aria-label="Professor verificado">✓</span>':'';
    let media='';
    if(p.mediaType==='video'){
      media=`<div class="post-video"><video src="${esc(p.media)}" controls playsinline preload="metadata"></video><button type="button" class="btn btn-ghost video-sound" data-video-sound aria-label="Ativar som">🔇</button></div>`;
    }else if(Array.isArray(p.mediaList)&&p.mediaList.length>1){
      const urls=p.mediaList.map(m=>m.url);
      media=`<div class="post-carousel-wrapper" data-carousel-urls="${esc(JSON.stringify(urls))}"></div>`;
    }else if(p.media){
      media=`<img src="${esc(p.media)}" alt="Imagem anexada à publicação" loading="lazy" width="480" style="max-width:100%;height:auto;border-radius:var(--radius-md,14px)">`;
    }
    return `<article class="card post" data-filter-item data-post-id="${esc(p.id)}" id="post-${esc(p.id)}"><div class="post__head">${avatarHTML(author || p)}<div class="post__meta"><a href="?page=public-profile&user=${encodeURIComponent(p.username)}"><strong>${esc(p.name)} ${badge}</strong></a><span>@${esc(p.username)} · ${esc(p.time)}</span></div><button class="btn btn-ghost" type="button" data-post-menu aria-label="Opções da publicação">•••</button></div><p class="post__body">${p.status&&p.status!=='aprovado'?`<small class="muted">${p.status==='pendente'?'Aguardando moderação':'Publicação não aprovada'} · visível apenas para você</small><br>`:''}${bodyHTML(p.body)}</p>${p.topic?`<a class="text-link" href="?page=home&topic=${encodeURIComponent(p.topic)}">#${esc(p.topic)}</a>`:''}${media}${p.poll?`<section class="settings-group"><h3>${esc(p.poll.question)}</h3>${p.poll.options.map((o,i)=>`<button class="btn btn-secondary" type="button" data-vote="${i}" aria-pressed="${p.poll.choice===i}">${p.poll.choice===i?'✓ ':''}${esc(o)} · ${p.poll.counts[i]} voto(s)</button>`).join('')}</section>`:''}<div class="post__footer"><button class="btn btn-ghost ${p.isLiked?'liked':''}" type="button" data-like aria-label="Curtir" aria-pressed="${p.isLiked}">♡ <span data-count>${p.likes}</span></button><button class="btn btn-ghost" type="button" data-comments aria-label="Comentários">${boot.icons.message} ${p.comments}</button><button class="btn btn-ghost ${reposted?'saved':''}" type="button" data-repost aria-label="${reposted?'Desfazer republicação':'Republicar publicação'}" aria-pressed="${reposted}">↗ ${reposted?'Republicado':'Republicar'}</button><button class="btn btn-ghost ${saved?'saved':''}" type="button" data-save aria-label="Salvar publicação" aria-pressed="${saved}">${boot.icons.bookmark}</button><span class="post__stats">${esc(p.time)}</span></div></article>`;
  }
  function empty(text) { return `<section class="empty-state"><p>${esc(text)}</p></section>`; }
  function postsHTML(posts) {return posts.length ? posts.map(postHTML).join('') : empty('Nenhuma publicação por aqui ainda.');}
  function renderPosts() {
    const a=state.account;
    const composerAvatar = $('[data-composer-avatar]');
    if (composerAvatar) composerAvatar.innerHTML = avatarHTML(a);
    if($('.home-feed')) {
      let feed=state.feed.filter(p=>!a.muted.includes(p.id));
      if(params.get('topic'))feed=feed.filter(p=>p.topic===params.get('topic'));
      if(params.get('post'))feed=state.feed.filter(p=>p.id===params.get('post'));
      // Mantém a ordem cronológica enviada pela API (created_at e id decrescentes).
      $('.home-feed').innerHTML=postsHTML(feed);
    }
    if(boot.page==='saved')$('.page-content').innerHTML=`<div class="list">${postsHTML(state.feed.filter(p=>a.saved.includes(p.id)))}</div>`;
    if(boot.page==='profile') {
      const groups={posts:state.feed.filter(p=>p.author===a.id),likes:state.feed.filter(p=>p.isLiked),reposts:state.feed.filter(p=>a.reposts.includes(p.id))};
      for(const [key,posts] of Object.entries(groups)) {const panel=$(`[data-profile-panel="${key}"]`);$('.list',panel).innerHTML=postsHTML(posts);$(`[data-profile-tab="${key}"] b`).textContent=posts.length;}
      $('.profile-metrics a strong').textContent=groups.posts.length;
      $('[data-network="followers"] strong').textContent=person(a.id)?.followers||0;
      $('[data-network="following"] strong').textContent=a.following.length;
      $('.profile-presence').hidden=!a.settings['activity-status'];
    }
    if(boot.page==='public-profile' && target()) {
      const p=target(); $('[data-public-posts]').innerHTML=postsHTML(state.feed.filter(x=>x.author===p.id));
      const metrics=$$('.profile-metrics strong');metrics[0].textContent=state.feed.filter(x=>x.author===p.id).length;metrics[1].textContent=p.followers;metrics[2].textContent=p.following;
      const follow=$('[data-follow]'); follow.textContent=a.following.includes(p.id)?'Seguindo':'Seguir';follow.classList.toggle('is-following',a.following.includes(p.id));follow.setAttribute('aria-pressed',String(a.following.includes(p.id)));follow.disabled=p.id===a.id;
      $('[data-profile-notify]').classList.toggle('is-active',a.notify.includes(p.id));$('[data-profile-notify]').setAttribute('aria-pressed',String(a.notify.includes(p.id)));
    }
    setupFeedPaging();
    activeCarousels.forEach(c=>{try{c.destroy();}catch(e){}});
    activeCarousels.length=0;
    $$('[data-carousel-urls]').forEach(wrap=>{
      try{
        const urls=JSON.parse(wrap.dataset.carouselUrls||'[]');
        if(urls.length>1&&window.DepthCarousel){
          const carousel=new window.DepthCarousel(wrap,{
            items:urls,
            reducedMotion:a.settings.motion===false,
            cardWidth:260,
            cardHeight:330,
            depth:180,
            spread:70,
            tilt:18,
            tiltDirection:'right',
            perspective:1400,
            visibleCards:4,
            falloff:0.2,
            blur:5,
            tint:'#0b0e0a',
            autoplay:false,
            loop:true,
            showControls:true,
            showIndicators:true,
            showBadge:true
          });
          activeCarousels.push(carousel);
        }
      }catch(err){console.error('Falha ao inicializar carrossel:',err);}
    });
  }
  function renderNotifications() {
    const unread=state.notifications.filter(n=>!n.read).length;
    $$('[data-unread-count]').forEach(el=>{el.textContent=unread;el.hidden=!unread;});
    if(!$('.notification-list'))return;
    $('.notification-summary strong').textContent=unread?'Você tem novidades.':'Você está em dia.';
    $('.notification-summary div > span').textContent=`${unread} notificação(ões) não lida(s).`;
    $('.notification-list').innerHTML=state.notifications.map(n=>`<a class="person notification-item" href="${esc(n.url)}" data-filter-item><div class="avatar">${esc(n.actor[0])}</div><div class="person__copy"><strong>${esc(n.actor)}</strong><span>${esc(n.type)}</span><span>${esc(n.time)}</span></div>${!n.read?'<span class="notification-dot" aria-label="Não lida"></span>':''}</a>`).join('')||empty('Nenhuma notificação por enquanto.');
  }
  function renderChat() {
    if(!$('[data-chat-app]'))return;
    // A API entrega as mensagens da mais antiga para a mais recente.
    // Use essa ordem, sem interpretar o horário abreviado exibido na tela.
    const latest = new Map();
    state.messages.forEach((message, index) => {
      const contact = message.from === state.account.id ? message.to : message.from;
      if (!(state.account.chatHidden?.[contact] || []).includes(message.id)) latest.set(contact, {message, index});
    });
    const contacts=state.people.filter(p=>p.id!==state.account.id&&!(state.account.closedDirect||[]).map(String).includes(String(p.id)))
      .sort((a,b)=>(latest.get(b.id)?.index ?? -1)-(latest.get(a.id)?.index ?? -1));
    if(!activeChat)activeChat=contacts.find(p=>p.id===target()?.id)?.id||contacts[0]?.id;
    if(!contacts.some(p=>p.id===activeChat))activeChat=contacts[0]?.id;
    $('.conversation-list__items').innerHTML=contacts.map(p=>{const last=latest.get(p.id)?.message;return `<button type="button" class="conversation ${activeChat===p.id?'active':''}" data-conversation="${esc(p.id)}" data-filter-item>${avatarHTML(p)}<div class="conversation__copy"><div><strong>${esc(p.name)}</strong><time>${esc(last?.time||'')}</time></div><span>${esc(last?.text||(p.demo?'Perfil de exemplo · sem respostas':'Iniciar conversa'))}</span>${Number(state.unread?.[p.id]||0)>0?`<b class="dm-unread" aria-label="${Number(state.unread[p.id])} mensagens não lidas">${Number(state.unread[p.id])}</b>`:''}</div></button>`;}).join('');
    $('[data-conversation-count]').textContent=contacts.length;
    const p=person(activeChat), box=$('[data-chat-messages]');
    $$('[data-chat-profile]').forEach(link => {
      if (p?.username) {
        link.href = url({page:'public-profile', user:p.username});
        link.setAttribute('aria-label', `Ver perfil de ${p.name}`);
        link.removeAttribute('aria-disabled'); link.removeAttribute('tabindex');
      } else {
        link.removeAttribute('href'); link.setAttribute('aria-disabled','true'); link.tabIndex = -1;
      }
    });
    $('[data-chat-name]').textContent=p?.name||'Escolha uma pessoa';const chatAvatar=$('[data-chat-avatar]'), avatarContent=avatarHTML(p);chatAvatar.classList.remove('avatar');if(chatAvatar.innerHTML!==avatarContent)chatAvatar.innerHTML=avatarContent;$('[data-chat-status]').textContent=p?.demo?'Perfil de exemplo':p?.online?'Ativo recentemente':'Status indisponível';$('[data-chat-form] input').disabled=!p;
    const nearBottom=box.scrollHeight-box.scrollTop-box.clientHeight<60;
    const messages=state.messages.filter(m=>(m.from===activeChat||m.to===activeChat)&&!(state.account.chatHidden?.[activeChat]||[]).includes(m.id));
    const html=messages.map(m=>{const mine=m.from===state.account.id;return `<div class="message-row ${mine?'message-row--mine':''}"><div class="message ${mine?'message--mine':''}"><p>${esc(m.text)}</p><small>${esc(m.time)}${mine?` · <span class="message-receipt">${m.read?'Lida ✓✓':'Enviada ✓'}</span>`:''}</small></div></div>`;}).join('')||empty('Envie a primeira mensagem.');
    if(box.innerHTML!==html){box.innerHTML=html;if(nearBottom)box.scrollTop=box.scrollHeight;}
    if(!box.dataset.readBound){box.dataset.readBound='1';box.addEventListener('scroll',readActiveConversation,{passive:true});}
    readActiveConversation();
  }
  function applySettings() {
    const settings=state.account.settings;document.documentElement.dataset.theme=settings['light-theme']?'light':'dark';$$('[data-toggle-setting]').forEach(c=>{c.checked=settings[c.dataset.toggleSetting];});
    // Original CSS files stay unchanged; these runtime overrides implement explicit preferences.
    let style=$('#runtime-preferences');if(!style){style=document.createElement('style');style.id='runtime-preferences';document.head.append(style);}
    style.textContent=(!settings.motion||matchMedia('(prefers-reduced-motion: reduce)').matches?'*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}':'')+(settings['compact-feed']?'.home-feed .post{padding:14px}.home-feed{gap:10px}':'');
  }
  function enhanceTopicSelect(select) {
    if (!select || select.dataset.customTopic) return;
    select.dataset.customTopic = 'true';
    const field = document.createElement('div'); field.className = 'topic-field';
    const label = document.createElement('label'); label.className = 'form-label'; label.htmlFor = 'topic-trigger'; label.textContent = 'Tópico';
    const control = document.createElement('div'); control.className = 'topic-select';
    control.innerHTML = '<button type="button" id="topic-trigger" class="topic-select__trigger" role="combobox" aria-haspopup="listbox" aria-controls="topic-options" aria-expanded="false"><span></span><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button><div id="topic-options" class="topic-select__list" role="listbox" aria-label="Tópico" hidden></div>';
    select.closest('label').replaceWith(field); select.hidden = true;
    field.append(label,select,control);
    const trigger = $('button',control), list = $('[role="listbox"]',control);
    let active = select.selectedIndex, search = '', searchTimer;
    function sync() {
      $('span',trigger).textContent = select.options[select.selectedIndex]?.textContent || 'Geral';
      list.innerHTML = [...select.options].map((option,index)=>`<div class="topic-select__option" id="topic-option-${index}" role="option" aria-selected="${index===select.selectedIndex}" data-topic-index="${index}"><span>${esc(option.textContent)}</span><span class="topic-select__check" aria-hidden="true">✓</span></div>`).join('');
    }
    function highlight() {
      $$('[role="option"]',list).forEach((option,index)=>option.classList.toggle('is-highlighted',index===active));
      trigger.setAttribute('aria-activedescendant',`topic-option-${active}`);
      const option=list.children[active];
      if(option){if(option.offsetTop<list.scrollTop)list.scrollTop=option.offsetTop;else if(option.offsetTop+option.offsetHeight>list.scrollTop+list.clientHeight)list.scrollTop=option.offsetTop+option.offsetHeight-list.clientHeight;}
    }
    function close() { list.hidden=true; trigger.setAttribute('aria-expanded','false'); trigger.removeAttribute('aria-activedescendant'); control.classList.remove('is-open'); }
    function open() {
      sync(); active=select.selectedIndex; list.hidden=false; trigger.setAttribute('aria-expanded','true'); control.classList.add('is-open');
      const rect=trigger.getBoundingClientRect(),below=innerHeight-rect.bottom-16,above=rect.top-16,up=below<180&&above>below;
      control.classList.toggle('opens-up',up); list.style.maxHeight=`${Math.max(80,Math.min(280,up?above:below))}px`; highlight();
    }
    function choose(index) { select.selectedIndex=index; select.dispatchEvent(new Event('change',{bubbles:true})); sync(); close(); trigger.focus(); }
    trigger.addEventListener('click',()=>list.hidden?open():close());
    list.addEventListener('pointerdown',event=>event.preventDefault());
    list.addEventListener('click',event=>{const option=event.target.closest('[data-topic-index]');if(option)choose(Number(option.dataset.topicIndex));});
    trigger.addEventListener('keydown',event=>{
      if(event.key==='Tab'){close();return;}
      if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();return;}
      if(['ArrowDown','ArrowUp','Home','End','Enter',' '].includes(event.key)){
        event.preventDefault();event.stopPropagation();
        if(list.hidden){open();if(event.key==='Home')active=0;else if(event.key==='End')active=select.options.length-1;}
        else if(event.key==='Enter'||event.key===' '){choose(active);return;}
        else if(event.key==='Home')active=0;else if(event.key==='End')active=select.options.length-1;
        else active=Math.max(0,Math.min(select.options.length-1,active+(event.key==='ArrowDown'?1:-1)));
        highlight();return;
      }
      if(event.key.length===1&&!event.ctrlKey&&!event.metaKey&&!event.altKey){
        event.preventDefault();if(list.hidden)open();clearTimeout(searchTimer);search+=event.key;
        const normalize=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
        const index=[...select.options].findIndex(option=>normalize(option.textContent).startsWith(normalize(search)));
        if(index>=0){active=index;highlight();}searchTimer=setTimeout(()=>{search='';},600);
      }
    });
    document.addEventListener('pointerdown',event=>{if(!field.contains(event.target))close();});
    field.addEventListener('focusout',event=>{if(!field.contains(event.relatedTarget))close();});
    window.addEventListener('resize',close);
    select.addEventListener('change',sync);
    select.form.addEventListener('reset',()=>setTimeout(()=>{sync();close();},0));
    sync();
  }

  function render() {if(!state)return;const topics=$('[data-post-form] select[name="topic"]');if(topics && !topics.dataset.loaded && state.subjects){topics.innerHTML=`<option value="">Geral</option>`+state.subjects.map(s=>`<option value="${esc(s.name)}">${esc(s.name)}</option>`).join('');topics.dataset.loaded='true';}enhanceTopicSelect(topics);renderPosts();renderNotifications();renderChat();updateUnreadBadge();applySettings();$$('[data-filter]').filter(x=>x.value).forEach(filter);}
  function filter(input) {const q=input.value.trim().toLocaleLowerCase('pt-BR');let root=input.id==='chat-search'?$('.conversation-list'):input.id==='people-search'?$('.people-list'):$('.main-column');if(!root)return;$$('[data-filter-item]',root).forEach(item=>item.hidden=!!q&&!item.textContent.toLocaleLowerCase('pt-BR').includes(q));}
  async function click(button) {
    if(button.matches('[data-demo-login]'))return finishAuth(await api('demo'));
    if(button.matches('[data-provider]')){dialog(`Entrar com ${button.dataset.provider}`,`<p>Este acesso depende de credenciais OAuth do responsável pela instalação e não está configurado. Você já pode usar sua conta local.</p><a class="btn btn-primary" href="?page=register">Criar conta local</a>`);return;}
    if(button.matches('[data-password-recovery]'))return recovery();
    if(button.matches('[data-close]'))return;
    if(button.matches('[data-password-toggle]')){const input=$('input',button.parentElement);input.type=input.type==='password'?'text':'password';button.setAttribute('aria-label',input.type==='password'?'Mostrar senha':'Ocultar senha');return;}
    if(button.matches('[data-help-contact]'))return dialog('Contato da instalação','<p>Este projeto não possui uma equipe de suporte externa conectada. Procure o responsável pelo servidor ou consulte o README incluído no projeto.</p>');
    if(button.matches('[data-ai-toggle],[data-ai-backdrop]')){const panel=$('#intellia-panel'),open=button.matches('[data-ai-backdrop]')?false:panel.hidden;panel.hidden=!open;panel.setAttribute('aria-hidden',String(!open));$('[data-ai-backdrop]').hidden=!open;$$('[data-ai-toggle]').forEach(b=>b.setAttribute('aria-expanded',String(open)));document.body.classList.toggle('ai-is-open',open);if(open){animate(panel);$('#ai-question').focus();}return;}
    if(!state){notify('Entre na sua conta para usar este recurso.');return;}
    if(button.matches('[data-media],[data-add-more-media]')){
      const input=document.createElement('input');input.type='file';input.multiple=true;input.accept='image/png,image/jpeg,image/gif,image/webp,video/mp4,video/webm,video/ogg';
      input.onchange=async()=>{
        const files=Array.from(input.files||[]);if(!files.length)return;
        const hasVideo=files.some(f=>f.type.startsWith('video/'));
        if(hasVideo){
          if(files.length>1||pendingMedia.length>0){notify('Vídeos devem ser publicados individualmente (sem carrossel).');return;}
          const file=files[0];
          if(file.size>2097152){notify('Selecione um vídeo de até 2 MB.');return;}
          if(!/^(video\/(mp4|webm|ogg))$/.test(file.type)){notify('Formato de vídeo não permitido.');return;}
          const reader=new FileReader();
          reader.onload=()=>{pendingMedia=[{url:reader.result,type:'video',name:file.name}];pendingMediaType='video';attachments();};
          reader.onerror=()=>notify('Não foi possível ler o vídeo.');
          reader.readAsDataURL(file);
          return;
        }
        if(pendingMediaType==='video'){notify('Remova o vídeo antes de adicionar fotos.');return;}
        const remaining=6-pendingMedia.length;
        if(remaining<=0){notify('Você já atingiu o limite de 6 imagens.');return;}
        const toProcess=files.slice(0,remaining);
        if(files.length>remaining){notify(`Limite máximo de 6 fotos. Adicionando as primeiras ${remaining}.`);}
        for(const file of toProcess){
          if(file.size>12582912){notify(`O arquivo "${file.name}" ultrapassa 12 MB.`);continue;}
          if(!/^(image\/(png|jpeg|gif|webp))$/.test(file.type)){notify(`Formato do arquivo "${file.name}" não permitido.`);continue;}
          try{
            const result=await compressedImage(file);
            if(pendingMedia.reduce((sum,m)=>sum+m.url.length,0)+result.length>8400000){notify('As fotos juntas devem ter até 6 MB.');continue;}
            if(pendingMedia.length>=6){notify('Limite de 6 fotos por publicação.');break;}
            pendingMedia.push({url:result,type:'imagem',name:file.name});pendingMediaType='imagem';
          }catch{notify(`Não foi possível ler a imagem "${file.name}".`);}
        }
        attachments();
      };input.click();return;
    }
    if(button.matches('[data-avatar-picker]')){$('[data-avatar-input]').click();return;}
    if(button.matches('[data-remove-media]')){
      const idx=button.dataset.removeIndex;
      if(idx!==undefined&&idx!==null&&idx!==''){
        pendingMedia.splice(Number(idx),1);
        if(pendingMedia.length===0)pendingMediaType=null;
      }else{
        pendingMedia=[];pendingMediaType=null;
      }
      attachments();return;
    }
    if(button.matches('[data-video-sound]')){const video=$('video',button.parentElement);video.muted=!video.muted;button.textContent=video.muted?'🔇':'🔊';button.setAttribute('aria-label',video.muted?'Ativar som':'Silenciar vídeo');return;}
    if(button.matches('[data-banner-picker]')){$('[data-banner-input]').click();return;}
    if(button.matches('[data-banner-remove]')){pendingBanner=null;bannerRemove=true;const preview=$('[data-banner-preview]');const placeholder=Object.assign(document.createElement('div'),{className:'profile-banner-preview'});placeholder.setAttribute('data-banner-preview','');preview.replaceWith(placeholder);return;}
    if(button.matches('[data-remove-poll]')){pendingPoll=null;attachments();return;}
    if(button.matches('[data-poll]')){dialog('Criar enquete','<form class="form-stack" data-poll-form><label class="form-label">Pergunta<input class="input" name="question" maxlength="300" required></label><label class="form-label">Opções (uma por linha, de 2 a 6)<textarea class="input" name="options" rows="6" required></textarea></label><button class="btn btn-primary">Anexar enquete</button></form>');return;}
    const card=button.closest('[data-post-id]'),id=card?.dataset.postId;
    if(card){
      if(button.matches('[data-report-post]')) {
        const post = state.feed.find(p => String(p.id) === String(id));
        if (!post || String(post.author) === String(state.account.id)) throw new Error('Publicação indisponível para denúncia.');
        const author = state.people.find(p => String(p.id) === String(post.author)) || {id:post.author, name:post.name, username:post.username};
        button.closest('dialog')?.close();
        const trigger = document.getElementById(`post-${id}`)?.querySelector('[data-post-menu]');
        trigger?.focus(); openReport(author, post); return;
      }
      if(button.matches('[data-like],[data-save],[data-vote],[data-repost],[data-mute],[data-delete-post]')) {
        const action=button.hasAttribute('data-like')?'like':button.hasAttribute('data-save')?'save':button.hasAttribute('data-vote')?'vote':button.hasAttribute('data-repost')?'repost':button.hasAttribute('data-mute')?'mute':'delete-post';
        if(action==='delete-post'&&!confirm('Excluir esta publicação?'))return;
        const result=await api(action,{id,option:Number(button.dataset.vote)});button.closest('dialog')?.close();await refresh();if(action==='repost')notify(result.active?'Publicação republicada. Veja na aba Republicados do seu perfil.':'Republicação desfeita.');animate($(`[data-post-id="${id}"]`));return;
      }
      if(button.matches('[data-share-post]'))return share(url({page:'home',post:id}));
      if(button.matches('[data-comments]')){const p=state.feed.find(x=>x.id===id);dialog('Comentários',`<div data-comments-list>${p.replies.map(r=>`<article class="post"><strong>${esc(r.name)}</strong><p>${esc(r.body)}</p><small>${esc(r.time)}</small></article>`).join('')||'<p>Seja a primeira pessoa a comentar.</p>'}</div><form class="form-stack" data-comment-form data-id="${esc(id)}"><label class="form-label">Comentário<textarea class="input" name="body" maxlength="2000" required></textarea></label><button class="btn btn-primary">Comentar</button></form>`);return;}
      if(button.matches('[data-post-menu]')){const p=state.feed.find(x=>x.id===id);dialog('Opções da publicação',`<div class="form-stack" data-post-id="${esc(id)}"><button class="btn btn-secondary" data-save>${state.account.saved.includes(id)?'Remover dos salvos':'Salvar'}</button><button class="btn btn-secondary" data-share-post>Copiar link</button><button class="btn btn-secondary" data-repost>${state.account.reposts.includes(id)?'Desfazer republicação':'Republicar no perfil'}</button><button class="btn btn-secondary" data-mute>Ocultar do início</button>${String(p.author)===String(state.account.id)?'<button class="btn btn-secondary" data-delete-post>Excluir publicação</button>':'<button class="btn btn-secondary post-report-action" data-report-post>⚑ Denunciar publicação</button>'}</div>`);return;}
    }
    if(button.matches('[data-profile-tab]')){const selected=button.dataset.profileTab;$$('[data-profile-tab]').forEach(t=>{t.classList.toggle('active',t===button);t.setAttribute('aria-selected',String(t===button));});$$('[data-profile-panel]').forEach(p=>{p.hidden=p.dataset.profilePanel!==selected;p.classList.toggle('active',!p.hidden);if(!p.hidden)animate(p);});return;}
    if(button.matches('[data-network]')){openNetwork(button.dataset.network);return;}
    if(button.matches('[data-profile-menu]')){const panel=$('[data-profile-menu-panel]');panel.hidden=!panel.hidden;button.setAttribute('aria-expanded',String(!panel.hidden));animate(panel);return;}
    if(button.matches('[data-profile-share]'))return share(url({page:'public-profile',user:target()?.username||state.account.username}));
    if(button.matches('[data-public-info]'))return dialog('Informações públicas',`<p>${esc(target()?.name)}</p><p>@${esc(target()?.username)}</p><p>${esc(target()?.bio)}</p><p>Membro desde ${esc(target()?.created?.slice(0,10))}</p>`);
    if(button.matches('[data-follow],[data-profile-block],[data-profile-notify],[data-profile-report]')){
      const action=button.hasAttribute('data-follow')?'follow':button.hasAttribute('data-profile-block')?'block':button.hasAttribute('data-profile-notify')?'notify':'report';
      const p=target();if(!p)throw new Error('Perfil indisponível.');let reason;
      if(action==='report'){openReport(p);return;}
      if(action==='block'){openBlock(p);return;}
      const result=await api(action,{target:p.id,reason});notify(result.message);if(action==='block')location.assign('?page=explore');else await refresh();return;
    }
    if(button.matches('[data-unblock]')){await api('block',{target:button.dataset.unblock});button.closest('p').remove();await refresh();return;}
    if(button.matches('[data-mark-read]')){await api('read');await refresh();notify('Notificações marcadas como lidas.');return;}
    if(button.matches('[data-conversation]')){activeChat=button.dataset.conversation;renderChat();$('[data-chat-messages]').scrollTop=$('[data-chat-messages]').scrollHeight;$('[data-chat-form] input').focus();return;}
    if(button.matches('[data-new-conversation]')){openConversationPicker();return;}
    if(button.matches('[data-open-chat]')){activeChat=button.dataset.openChat;button.closest('dialog').close();renderChat();$('[data-chat-form] input').focus();return;}
    if(button.matches('[data-chat-options]')){const rect=button.getBoundingClientRect();openDirectMenu(person(activeChat),rect.right,rect.bottom,button);return;}
    if(button.matches('[data-clear-chat]')){await api('clear-chat',{target:activeChat});button.closest('dialog').close();await refresh();return;}
    if(button.matches('[data-logout]')){if(confirm('Sair da conta?'))location.assign((await api('logout')).redirect);return;}
    if(button.matches('[data-delete-account]')){if(!confirm('Excluir sua conta, publicações e mensagens? Esta ação não pode ser desfeita.'))return;const password=state.account.demo?'':prompt('Confirme sua senha para excluir a conta:');if(password===null)return;location.assign((await api('delete-account',{current_password:password})).redirect);return;}
    if(button.matches('[data-ai-prompt]')){$('#ai-question').value=button.dataset.aiPrompt;$('[data-ai-form]').requestSubmit();return;}
  }
  function attachments() {
    const box=$('[data-attachments]');if(!box)return;
    if(composerCarousel){composerCarousel.destroy();composerCarousel=null;}
    let content='';
    if(pendingMedia.length===1&&pendingMediaType==='video'){
      content=`<div class="composer-media-manager"><div class="composer-media-manager__header"><span class="composer-media-manager__title">Vídeo anexado</span><button type="button" class="btn btn-ghost" data-remove-media>Remover</button></div><video src="${esc(pendingMedia[0].url)}" controls muted playsinline style="max-width:100%;max-height:240px;border-radius:var(--radius-sm,9px)"></video></div>`;
    }else if(pendingMedia.length===1&&pendingMediaType==='imagem'){
      content=`<div class="composer-media-manager"><div class="composer-media-manager__header"><span class="composer-media-manager__title">1 Foto anexada</span><div style="display:flex;gap:6px"><button type="button" class="btn btn-ghost" data-add-more-media>+ Adicionar mais fotos</button><button type="button" class="btn btn-ghost" data-remove-media>Remover</button></div></div><div class="composer-media-grid"><div class="composer-media-thumb"><img src="${esc(pendingMedia[0].url)}" alt="Foto 1"><button type="button" class="composer-media-thumb__remove" data-remove-media data-remove-index="0" aria-label="Remover foto">✕</button><span class="composer-media-thumb__num">1/6</span></div><button type="button" class="composer-media-add-btn" data-add-more-media aria-label="Adicionar foto"><span>+</span><span>Adicionar</span></button></div><img src="${esc(pendingMedia[0].url)}" style="max-width:100%;max-height:260px;object-fit:cover;border-radius:var(--radius-sm,9px);display:block" alt="Prévia da foto"></div>`;
    }else if(pendingMedia.length>1){
      content=`<div class="composer-media-manager"><div class="composer-media-manager__header"><span class="composer-media-manager__title">Carrossel 3D (${pendingMedia.length} de 6 fotos)</span><div style="display:flex;gap:6px">${pendingMedia.length<6?'<button type="button" class="btn btn-ghost" data-add-more-media>+ Adicionar fotos</button>':''}<button type="button" class="btn btn-ghost" data-remove-media>Remover tudo</button></div></div><div class="composer-media-manager__preview" data-composer-carousel></div><div class="composer-media-grid">${pendingMedia.map((m,i)=>`<div class="composer-media-thumb"><img src="${esc(m.url)}" alt="Foto ${i+1}"><button type="button" class="composer-media-thumb__remove" data-remove-media data-remove-index="${i}" aria-label="Remover foto ${i+1}">✕</button><span class="composer-media-thumb__num">${i+1}</span></div>`).join('')}${pendingMedia.length<6?`<button type="button" class="composer-media-add-btn" data-add-more-media aria-label="Adicionar mais foto"><span>+</span><span>Adicionar</span></button>`:''}</div></div>`;
    }
    if(pendingPoll){content+=`<p style="margin-top:0.5rem">Enquete: ${esc(pendingPoll.question)} <button type="button" class="btn btn-ghost" data-remove-poll>Remover</button></p>`;}
    box.innerHTML=content;animate(box);
    if(pendingMedia.length>1&&window.DepthCarousel){
      const previewEl=$('[data-composer-carousel]',box);
      if(previewEl){
        composerCarousel=new window.DepthCarousel(previewEl,{
          items:pendingMedia.map(m=>m.url),
          reducedMotion:state.account.settings.motion===false,
          cardWidth:230,cardHeight:280,depth:160,spread:60,tilt:18,tiltDirection:'right',
          perspective:1400,visibleCards:4,falloff:0.2,blur:4,tint:'#0b0e0a',
          autoplay:false,loop:true,showControls:true,showIndicators:true,showBadge:true
        });
      }
    }
  }
  document.addEventListener('click',async event=>{
    const button=event.target.closest('button,a[data-password-recovery],a[data-demo-login],a[data-public-info],a[data-help-contact],[data-ai-backdrop]');if(!button)return;
    if(button.type==='submit'&&button.form)return;
    event.preventDefault();if(button.dataset.busy)return;button.dataset.busy='1';
    try{await click(button);}catch(error){notify(error.message);}finally{delete button.dataset.busy;}
  });
  document.addEventListener('submit',async event=>{
    const form=event.target;event.preventDefault();if(form.dataset.busy)return;form.dataset.busy='1';
    const submit=$('[type="submit"],button:not([type])',form);if(submit){submit.disabled=true;submit.classList.add('is-submitting');}
    try{
      const values=Object.fromEntries(new FormData(form));
      if(form.matches('[data-auth-form]'))await finishAuth(await api(form.dataset.authForm,{...values,terms:!!values.terms}));
      else if(form.matches('[data-recover-form]')){const result=await api('recover',values);form.closest('dialog').close();await finishAuth(result);}
      else if(form.matches('[data-profile-form]')){if(pendingAvatar)values.avatar=pendingAvatar;if(pendingBanner)values.banner=pendingBanner;if(bannerRemove)values.banner_remove=true;await api('profile',values);location.assign('?page=profile');}
      else if(form.matches('[data-password-form]')){notify((await api('password',values)).message);form.reset();}
      else if(form.matches('[data-post-form]')){
        const urls=pendingMedia.map(m=>m.url);
        const result=await api('post',{
          body:$('textarea',form).value,
          topic:values.topic,
          media:null,
          medias:urls.length>0?urls:null,
          media_type:pendingMediaType,
          poll:pendingPoll
        });
        form.reset();pendingMedia=[];pendingMediaType=pendingPoll=null;attachments();await refresh();animate($('.home-feed article'));notify(result.message);
      }
      else if(form.matches('[data-poll-form]')){const options=values.options.split('\n').map(x=>x.trim()).filter(Boolean);if(options.length<2||options.length>6||new Set(options).size!==options.length)throw new Error('Informe de 2 a 6 opções diferentes.');pendingPoll={question:values.question,options};form.closest('dialog').close();attachments();}
      else if(form.matches('[data-comment-form]')){await api('comment',{id:form.dataset.id,body:values.body});form.closest('dialog').close();await refresh();notify('Comentário adicionado.');}
      else if(form.matches('[data-chat-form]')){await api('message',{target:activeChat,body:$('input',form).value});form.reset();await refresh();$('[data-chat-messages]').scrollTop=$('[data-chat-messages]').scrollHeight;}
      else if(form.matches('[data-institutional-user]')){await api('institutional-user-update',{id:form.dataset.institutionalUser,role:values.role,verified:!!values.verified});notify('Permissões atualizadas.');}
      else if(form.matches('[data-ai-form]')){
        const input=$('textarea',form),question=input.value.trim();if(!question)return;
        const messages=$('[data-ai-messages]');const add=(text,type)=>{const el=document.createElement('div');el.className=`ai-message ai-message--${type}`;const p=document.createElement('p');p.textContent=text;el.append(p);messages.append(el);messages.scrollTop=messages.scrollHeight;animate(el);};
        add(question,'user');input.disabled=true;$('.ai-card').classList.add('ai-card--thinking');
        try{const answer=await api('assistant',{question});add(answer.answer,'bot');input.value='';}finally{input.disabled=false;$('.ai-card').classList.remove('ai-card--thinking');input.focus();}
      }
    }catch(error){notify(error.message);}
    finally{delete form.dataset.busy;if(submit){submit.disabled=false;submit.classList.remove('is-submitting');}}
  });
  document.addEventListener('input',e=>{const input=e.target;if(input.matches('[data-filter]'))filter(input);if(input.matches('[data-help-search]'))$$('.faq-item').forEach(item=>item.hidden=!item.textContent.toLocaleLowerCase().includes(input.value.toLocaleLowerCase()));if(input.matches('[data-contact-search]'))$$('[data-contact]',input.closest('dialog')).forEach(p=>p.hidden=!p.textContent.toLocaleLowerCase().includes(input.value.toLocaleLowerCase()));});
  document.addEventListener('change',e=>{if(e.target.matches('[data-banner-input]'))chooseProfileImage(e.target,'banner');});
  document.addEventListener('change',async e=>{const input=e.target;if(input.matches('[data-avatar-input]')){chooseProfileImage(input,'avatar');return;}if(!input.matches('[data-toggle-setting]'))return;const value=input.checked;input.disabled=true;try{let password='';if(input.dataset.toggleSetting==='two-factor'&&!value){password=prompt('Senha atual para desativar a chave adicional:');if(password===null){input.checked=!value;return;}}const result=await api('setting',{key:input.dataset.toggleSetting,value,current_password:password});await refresh();if(result.security_key)secretDialog('Chave adicional de acesso',result.security_key);else notify(result.message);}catch(error){input.checked=!value;notify(error.message);}finally{input.disabled=false;}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#intellia-panel')&&!$('#intellia-panel').hidden)$('[data-ai-backdrop]').click();if(e.target.matches('#ai-question')&&e.key==='Enter'&&!e.shiftKey){e.preventDefault();e.target.form.requestSubmit();}if(e.target.matches('[data-profile-tab]')&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();const tabs=$$('[data-profile-tab]'),i=tabs.indexOf(e.target),next=tabs[(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length];next.focus();next.click();}});
  if(state){
    render();if($('#gender'))$('#gender').value=state.account.gender;
    if(boot.page==='privacidade'&&state.account.blocked.length){const section=document.createElement('section');section.className='settings-group card';section.innerHTML='<h2>Perfis bloqueados</h2>'+state.account.blocked.map(id=>`<p>Perfil bloqueado <button class="btn btn-secondary" data-unblock="${esc(id)}">Desbloquear</button></p>`).join('');$('.page-content').append(section);}
    if($('[data-ai-messages]'))$('[data-ai-messages]').innerHTML='<div class="ai-message ai-message--bot"><p>A assistente ainda não está disponível nesta etapa.</p></div>';
    if(boot.page==='chat' && target() && (state.account.closedDirect||[]).includes(target().id)) {
      const requested=target().id;api('open-direct',{target:requested}).then(()=>{activeChat=requested;return refresh();}).catch(error=>notify(error.message));
    }
    updateUnreadBadge();
    if(boot.page==='chat'||boot.page==='notifications')startLive();
  }
})();
