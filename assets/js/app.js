
(() => {
  const DATA = window.PERLIVIO_DATA || {collections:[],stones:[]};
  const stones = DATA.stones || [];
  const collections = DATA.collections || [];
  const stoneMap = Object.fromEntries(stones.map(s => [s.slug, s]));
  const collectionMap = Object.fromEntries(collections.map(c => [c.slug, c]));
  const qs = (sel, root=document) => root.querySelector(sel);
  const qsa = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const SITE_ROOT = window.PERLIVIO_ROOT_URL || new URL("../../", document.currentScript.src).href;
  const siteUrl = (path) => new URL(String(path).replace(/^\//, ""), SITE_ROOT).href;

  function getCart(){
    try {
      const cart=JSON.parse(localStorage.getItem("perlivio:cart") || "[]");
      return Array.isArray(cart) ? cart.filter(item=>item && typeof item==="object").map(item=>{
        const count=Math.min(18,Math.max(14,Number(item.count)||16));
        const paths=Array.isArray(item.paths) ? item.paths.filter(slug=>stoneMap[slug]).slice(0,count-1) : [];
        return {
          ...item,
          count,
          paths,
          collectionName:item.collectionName || collectionMap[item.collection]?.name || "Essentiel",
          socleName:item.socleName || stoneMap[item.socle]?.name || "Agate blanche",
          socle2Name:item.socle2Name || stoneMap[item.socle2]?.name || "",
          originName:item.originName || stoneMap[item.origin]?.name || "Agate blanche",
          pathNames:paths.map(slug=>stoneMap[slug]?.name || slug)
        };
      }) : [];
    }
    catch { return []; }
  }
  function saveCart(cart){
    localStorage.setItem("perlivio:cart", JSON.stringify(cart));
    updateCartCount();
  }
  function updateCartCount(){
    const count = getCart().length;
    qsa("[data-cart-count]").forEach(el => el.textContent = String(count));
  }

  // Navigation
  const toggle = qs("[data-menu-toggle]");
  const mobile = qs("[data-mobile-nav]");
  if(toggle && mobile){
    const setMenu=(open)=>{
      mobile.classList.toggle("open",open);
      toggle.textContent = open ? "×" : "☰";
      toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
      toggle.setAttribute("aria-expanded",String(open));
    };
    toggle.setAttribute("aria-expanded", "false");
    toggle.addEventListener("click", () => setMenu(!mobile.classList.contains("open")));
    qsa("a",mobile).forEach(link=>link.addEventListener("click",()=>setMenu(false)));
    document.addEventListener("keydown",event=>{if(event.key==="Escape") setMenu(false);});
  }

  function beadCountForWrist(wrist){
    return wrist === "14–15 cm" ? 14 : wrist === "18–19 cm" ? 17 : wrist === "20–21 cm" ? 18 : 16;
  }

  function compositionFromConfig({count=16,socle="agate-blanche",socle2="",mode="single",origin="agate-blanche",paths=[]}){
    const list = Array.from({length: count}, (_,i) => mode === "alternate" && socle2 && i % 2 ? socle2 : socle);
    const originIndex = Math.max(2, Math.floor(count * .18));
    list[originIndex] = origin;
    const pathIndexes=[];
    paths.slice(0,Math.min(paths.length,count-1)).forEach((slug,i) => {
      const idx=(originIndex + 1 + i) % count;
      list[idx]=slug; pathIndexes.push(idx);
    });
    return {list,originIndex,pathIndexes};
  }

  function renderBracelet(el, cfg={}){
    const collection = cfg.collection || el.dataset.collection || "essentiel";
    const wrist = cfg.wrist || el.dataset.wrist || "16–17 cm";
    const count = Math.min(18,Math.max(14,Number(cfg.count || el.dataset.count || beadCountForWrist(wrist))));
    const socle = cfg.socle || el.dataset.socle || "agate-blanche";
    const socle2 = cfg.socle2 || el.dataset.socle2 || "";
    const mode = cfg.socleMode || cfg.mode || el.dataset.socleMode || "single";
    const origin = cfg.origin || el.dataset.origin || "agate-blanche";
    const paths = Array.isArray(cfg.paths) ? cfg.paths : ((el.dataset.paths || "").split(",").filter(Boolean));
    const comp = compositionFromConfig({count,socle,socle2,mode,origin,paths});
    const stage = document.createElement("div");
    stage.className = `bracelet-stage collection-${collection}`;
    // Geometry is derived from the physical count: 8 mm beads should read as a continuous strand, not isolated marbles.
    const radius = count >= 18 ? 34.2 : count === 17 ? 33.9 : count === 16 ? 33.6 : 33.1;
    const beadSize = count >= 18 ? 12.5 : count === 17 ? 13.1 : count === 16 ? 13.8 : count === 15 ? 14.4 : 15;
    // A wider opening at the bottom leaves room for the real, low-profile opening mechanism.
    const gapCenter = 90, gapSpan = 46, start = gapCenter + gapSpan/2, span = 360-gapSpan;
    const spacerSlotsByCollection={metal:[2,7,12],inox:[3,8,13],argent:[1,6,11,15]};
    const spacerSlots=spacerSlotsByCollection[collection] || [];
    comp.list.forEach((slug,index) => {
      const s = stoneMap[slug] || stones[0];
      const angle = (start + (span/(Math.max(comp.list.length-1,1))) * index) * Math.PI/180;
      const x = 50 + Math.cos(angle) * radius;
      const y = 50 + Math.sin(angle) * radius;
      const bead=document.createElement("img");
      bead.src=s.image; bead.alt=""; bead.loading="lazy"; bead.decoding="async";
      bead.className="bracelet-bead";
      if(index===comp.originIndex) bead.classList.add("origin-bead");
      if(comp.pathIndexes.includes(index)) bead.classList.add("path-bead");
      bead.dataset.position=String(index);
      // Keep semantic roles visually subtle: no permanent circles or halos.
      bead.style.left=`${x}%`; bead.style.top=`${y}%`; bead.style.width=`${beadSize}%`;
      stage.appendChild(bead);

      // Decorative intercalaires are deliberately sparse: stones remain the visual priority.
      if(spacerSlots.includes(index) && index < comp.list.length-1){
        const nextAngle = (start + (span/(Math.max(comp.list.length-1,1))) * (index+.5)) * Math.PI/180;
        const spacer=document.createElement("span");
        spacer.setAttribute("aria-hidden","true"); spacer.className=`bracelet-spacer spacer-${collection}`;
        spacer.style.left=`${50+Math.cos(nextAngle)*radius}%`; spacer.style.top=`${50+Math.sin(nextAngle)*radius}%`;
        spacer.style.transform=`translate(-50%,-50%) rotate(${nextAngle*180/Math.PI+90}deg)`;
        stage.appendChild(spacer);
      }
    });
    const clasp=document.createElement('img');
    clasp.setAttribute('aria-hidden','true');
    clasp.className='bracelet-clasp';
    clasp.alt=''; clasp.decoding='async'; clasp.src=siteUrl('assets/media/clasp-cutout.webp');
    stage.appendChild(clasp);
    el.innerHTML="";
    el.appendChild(stage);
  }

  qsa("[data-bracelet]").forEach(el => renderBracelet(el));
  qsa("img").forEach(img=>{img.decoding="async";});

  // Stones catalog
  const stoneSearch=qs("[data-stone-search]");
  const filterBtns=qsa("[data-stone-filter]");
  let activeFamily="Toutes";
  function applyStoneFilter(){
    const text=(stoneSearch?.value || "").trim().toLowerCase();
    qsa("[data-stone-card]").forEach(card => {
      const family=card.dataset.family;
      const name=card.dataset.name || "";
      card.hidden = (activeFamily !== "Toutes" && family !== activeFamily) || (text && !name.includes(text));
    });
  }
  stoneSearch?.addEventListener("input",applyStoneFilter);
  filterBtns.forEach(btn => btn.addEventListener("click",() => {
    activeFamily=btn.dataset.stoneFilter || "Toutes";
    filterBtns.forEach(b=>b.classList.toggle("active",b===btn));
    applyStoneFilter();
  }));
  filterBtns[0]?.classList.add("active");

  // Composer
  const composer=qs("[data-composer]");
  if(composer){
    const params=new URLSearchParams(location.search);
    const requestedCollection=params.get("collection");
    const requestedPath=params.get("path");
    const initialCollection=collectionMap[requestedCollection] || collectionMap.essentiel || collections[0];
    const secondarySocle={essentiel:"howlite",metal:"oeil-de-tigre",inox:"howlite",argent:"amethyste",signature:"onyx-noir"};
    const defaultOriginFor=(collection)=>collection?.slug==="signature" ? collection.socle : collection?.origin;
    const state={
      step:1,
      collection:initialCollection?.slug || "essentiel",
      wrist:"16–17 cm",
      count:16,
      socle:initialCollection?.socle || "agate-blanche",
      socle2:secondarySocle[initialCollection?.slug] || "howlite",
      socleMode:"single",
      origin:defaultOriginFor(initialCollection) || "agate-blanche",
      journey: requestedPath && stoneMap[requestedPath] ? "started" : "simple",
      paths: requestedPath && stoneMap[requestedPath] ? [requestedPath] : []
    };
    const mount=qs("[data-bracelet]",composer);
    const steps=qsa("[data-step]",composer);
    const next=qs("[data-next]",composer), prev=qs("[data-prev]",composer);
    const previewCard=qs("[data-preview-card]",composer);
    const previewToggle=qs("[data-preview-toggle]",composer);
    const pathPicker=qs("[data-path-picker]",composer);
    const pathSearch=qs("[data-path-search]",composer);
    const stepTitles=["Gamme","Poignet","Perles Socles","Perle Origine","Votre histoire","Composition","Votre bracelet"];

    previewToggle?.addEventListener("click",()=>{
      const expanded=previewCard.classList.toggle("expanded");
      previewToggle.setAttribute("aria-expanded",String(expanded));
    });

    function pathCapacity(){ return Math.max(0,state.count-1); }
    function quantityOf(slug){ return state.paths.reduce((n,s)=>n+(s===slug?1:0),0); }
    function buildStonePicker(root){
      if(!root) return;
      root.innerHTML=stones.map(s=>`<button class="bead-choice" type="button" data-stone="${s.slug}" aria-label="Choisir ${s.name}"><img src="${s.image}" alt="" loading="lazy" decoding="async"><span>${s.name}</span></button>`).join("");
    }
    buildStonePicker(qs("[data-socle-picker]",composer));
    buildStonePicker(qs("[data-socle2-picker]",composer));
    buildStonePicker(qs("[data-origin-picker]",composer));
    function journeyCopy(){
      if(state.journey==="free") return "Mode libre : ajoutez autant de répétitions que vous le souhaitez et réordonnez vos Perles de Chemin. La Perle Origine reste votre repère de départ, toutes les autres places peuvent évoluer.";
      if(state.journey==="started") return "Votre histoire a déjà commencé : ajoutez toutes les étapes que vous souhaitez, sans plafond commercial artificiel.";
      return "Commencer simplement est le parcours recommandé : quelques Perles de Chemin suffisent pour démarrer, mais vous restez libre d’en ajouter davantage.";
    }
    function buildPathPicker(){
      if(!pathPicker) return;
      pathPicker.innerHTML=stones.map(s=>`<article class="path-quantity-card" data-path-card="${s.slug}" data-name="${s.name.toLowerCase()}"><img src="${s.image}" alt="${s.name}" loading="lazy" decoding="async"><div class="path-card-copy"><strong>${s.name}</strong><small>${s.family || "Pierre Perlivio"}</small></div><div class="qty-controls"><button type="button" data-path-minus="${s.slug}" aria-label="Retirer une ${s.name}">−</button><output data-path-qty="${s.slug}">0</output><button type="button" data-path-plus="${s.slug}" aria-label="Ajouter une ${s.name}">+</button></div></article>`).join("");
      qsa("[data-path-plus]",pathPicker).forEach(b=>b.addEventListener("click",()=>{
        if(state.paths.length>=pathCapacity()) return;
        state.paths.push(b.dataset.pathPlus); refresh();
      }));
      qsa("[data-path-minus]",pathPicker).forEach(b=>b.addEventListener("click",()=>{
        const slug=b.dataset.pathMinus;
        const idx=state.paths.lastIndexOf(slug);
        if(idx!==-1) state.paths.splice(idx,1);
        refresh();
      }));
    }
    function scrollToStep(){
      const active=qs(`[data-step="${state.step}"]`,composer);
      if(!active) return;
      const mobile=matchMedia("(max-width:760px)").matches;
      const offset=mobile ? 108 : 135;
      window.scrollTo({top:Math.max(0,active.getBoundingClientRect().top+window.scrollY-offset),behavior:"smooth"});
    }
    function markPressed(selector,isActive){
      qsa(selector,composer).forEach(button=>{
        const active=Boolean(isActive(button));
        button.classList.toggle("active",active);
        button.setAttribute("aria-pressed",String(active));
      });
    }
    function refresh(){
      const signatureMode=state.collection==="signature";
      if(signatureMode) state.origin=state.socle;
      if(state.paths.length>pathCapacity()) state.paths=state.paths.slice(0,pathCapacity());
      steps.forEach(s => s.classList.toggle("active",Number(s.dataset.step)===state.step));
      qs("[data-step-current]",composer).textContent=String(state.step);
      const stepTitle=qs("[data-step-title]",composer); if(stepTitle) stepTitle.textContent=stepTitles[state.step-1];
      const stepBar=qs("[data-step-bar]",composer); if(stepBar) stepBar.style.width=`${(state.step/7)*100}%`;
      prev.style.visibility=state.step===1 ? "hidden" : "visible";
      next.style.display=state.step===7 ? "none" : "";
      qs("[data-summary-collection]",composer).textContent=collectionMap[state.collection]?.name || state.collection;
      qs("[data-summary-wrist]",composer).textContent=state.wrist;
      qs("[data-summary-count]",composer).textContent=String(state.count);
      qs("[data-summary-reserve]",composer).textContent=String(state.paths.length);
      renderBracelet(mount,state);
      markPressed("[data-collection-choice]",b=>b.dataset.collectionChoice===state.collection);
      markPressed("[data-wrist]",b=>b.dataset.wrist===state.wrist);
      markPressed("[data-socle-mode]",b=>b.dataset.socleMode===state.socleMode);
      const sec=qs("[data-secondary-socle]",composer); if(sec) sec.hidden=state.socleMode!=="alternate";
      markPressed("[data-socle-picker] [data-stone]",b=>b.dataset.stone===state.socle);
      markPressed("[data-socle2-picker] [data-stone]",b=>b.dataset.stone===state.socle2);
      markPressed("[data-origin-picker] [data-stone]",b=>b.dataset.stone===state.origin);
      qsa("[data-origin-picker] [data-stone]",composer).forEach(button=>button.disabled=signatureMode);
      const originGuidance=qs("[data-origin-guidance]",composer);
      if(originGuidance) originGuidance.textContent=signatureMode
        ? "Signature commence volontairement monochrome : la Perle Origine reprend la pierre Socle, avec le même diamètre de 8 mm."
        : "Une suggestion cohérente avec votre gamme est proposée par défaut. La Perle Origine garde le même diamètre de 8 mm que les autres.";
      markPressed("[data-journey]",b=>b.dataset.journey===state.journey);
      const journeyNote=qs("[data-journey-note]",composer); if(journeyNote) journeyNote.textContent=journeyCopy();

      const capacity=pathCapacity(), used=state.paths.length, remaining=Math.max(0,capacity-used);
      const countEl=qs("[data-path-count]",composer); if(countEl) countEl.textContent=`${used} Perle${used>1?"s":""} de Chemin sélectionnée${used>1?"s":""}`;
      const remainingEl=qs("[data-path-remaining]",composer); if(remainingEl) remainingEl.textContent=`${remaining} place${remaining>1?"s":""} encore disponible${remaining>1?"s":""}`;
      const meter=qs("[data-path-meter]",composer); if(meter) meter.style.width=`${capacity ? used/capacity*100 : 0}%`;
      qsa("[data-path-qty]",composer).forEach(o=>o.textContent=String(quantityOf(o.dataset.pathQty)));
      qsa("[data-path-plus]",composer).forEach(b=>b.disabled=used>=capacity);
      qsa("[data-path-minus]",composer).forEach(b=>b.disabled=quantityOf(b.dataset.pathMinus)===0);

      const selected=qs("[data-selected-paths]",composer);
      if(selected){
        const counts={}; state.paths.forEach(s=>counts[s]=(counts[s]||0)+1);
        selected.innerHTML=used ? Object.entries(counts).map(([slug,n])=>`<span><b>${n}</b>${stoneMap[slug]?.name || slug}</span>`).join("") : "<em>Aucune Perle de Chemin sélectionnée. Le bracelet reste entièrement composé de vos Socles et de votre Origine.</em>";
      }
      const orderEl=qs('[data-path-order]',composer);
      if(orderEl){
        orderEl.innerHTML = used ? `<div class="path-order-head"><strong>Ordre sur le bracelet</strong><span>Glissez sur ordinateur ou utilisez les flèches.</span></div>` + state.paths.map((slug,index)=>`<div class="path-order-item" draggable="true" data-order-index="${index}"><span class="drag-handle" aria-hidden="true">⋮⋮</span><img src="${stoneMap[slug]?.image || ''}" alt="" decoding="async"><div class="path-order-copy"><strong>${stoneMap[slug]?.name || slug}</strong><small>Position ${index+1}</small></div><div class="path-order-actions"><button type="button" data-order-left="${index}" ${index===0?'disabled':''} aria-label="Déplacer vers la gauche">←</button><button type="button" data-order-right="${index}" ${index===state.paths.length-1?'disabled':''} aria-label="Déplacer vers la droite">→</button><button type="button" data-order-remove="${index}" aria-label="Retirer">×</button></div></div>`).join('') : '';
        qsa('[data-order-left]',orderEl).forEach(btn=>btn.addEventListener('click',()=>{const i=Number(btn.dataset.orderLeft); if(i>0){[state.paths[i-1],state.paths[i]]=[state.paths[i],state.paths[i-1]]; refresh();}}));
        qsa('[data-order-right]',orderEl).forEach(btn=>btn.addEventListener('click',()=>{const i=Number(btn.dataset.orderRight); if(i<state.paths.length-1){[state.paths[i],state.paths[i+1]]=[state.paths[i+1],state.paths[i]]; refresh();}}));
        qsa('[data-order-remove]',orderEl).forEach(btn=>btn.addEventListener('click',()=>{const i=Number(btn.dataset.orderRemove); state.paths.splice(i,1); refresh();}));
        let dragIndex=null;
        qsa('[data-order-index]',orderEl).forEach(item=>{
          item.addEventListener('dragstart',e=>{dragIndex=Number(item.dataset.orderIndex); item.classList.add('dragging'); e.dataTransfer?.setData('text/plain',String(dragIndex));});
          item.addEventListener('dragend',()=>{dragIndex=null; item.classList.remove('dragging'); qsa('[data-order-index]',orderEl).forEach(x=>x.classList.remove('drag-over'));});
          item.addEventListener('dragover',e=>{e.preventDefault(); item.classList.add('drag-over');});
          item.addEventListener('dragleave',()=>item.classList.remove('drag-over'));
          item.addEventListener('drop',e=>{e.preventDefault(); const to=Number(item.dataset.orderIndex); const from=dragIndex ?? Number(e.dataTransfer?.getData('text/plain')); if(Number.isInteger(from) && from!==to && from>=0 && from<state.paths.length){const [moved]=state.paths.splice(from,1); state.paths.splice(to,0,moved); refresh();}});
        });
      }
      const reserve=qs("[data-reserve-explain]",composer);
      if(reserve) reserve.textContent=used ? `${used} Perle${used>1?"s":""} Socle${used>1?"s":""} remplacée${used>1?"s":""} ${used>1?"rejoindront":"rejoindra"} votre Réserve. Vous pourrez les réutiliser plus tard.` : "Aucune Socle n’est remplacée pour l’instant : votre Réserve commence vide.";

      const recap=qs("[data-composer-recap]",composer);
      if(recap){
        const socles = state.socleMode==="alternate" ? `${stoneMap[state.socle].name} + ${stoneMap[state.socle2].name} alternées` : stoneMap[state.socle].name;
        const counts={}; state.paths.forEach(s=>counts[s]=(counts[s]||0)+1);
        const pathSummary=Object.entries(counts).map(([slug,n])=>`${stoneMap[slug].name} × ${n}`).join(" · ");
        recap.innerHTML=`
          <div><span>Gamme</span><b>Perlivio ${collectionMap[state.collection].name}</b></div>
          <div><span>Poignet</span><b>${state.wrist}</b></div>
          <div><span>Composition estimée</span><b>${state.count} perles de 8 mm (estimation de montage)</b></div>
          <div><span>Perles Socles</span><b>${socles}</b></div>
          <div><span>Perle Origine</span><b>${stoneMap[state.origin].name}</b></div>
          <div><span>Perles de Chemin</span><b>${pathSummary || "Aucune au départ"}</b></div>
          <div><span>Socles présentes</span><b>${Math.max(0,state.count-1-used)}</b></div>
          <div><span>Socles en Réserve</span><b>${used}</b></div>`;
      }
    }

    buildPathPicker();
    pathSearch?.addEventListener("input",()=>{
      const value=pathSearch.value.trim().toLowerCase();
      qsa("[data-path-card]",composer).forEach(card=>card.hidden=!!value && !(card.dataset.name||"").includes(value));
    });
    qsa("[data-collection-choice]",composer).forEach(b=>b.addEventListener("click",()=>{
      state.collection=b.dataset.collectionChoice;
      const selected=collectionMap[state.collection];
      state.socle=selected?.socle || state.socle;
      state.socle2=secondarySocle[state.collection] || state.socle2;
      state.origin=defaultOriginFor(selected) || state.origin;
      refresh();
    }));
    qsa("[data-wrist]",composer).forEach(b=>b.addEventListener("click",()=>{state.wrist=b.dataset.wrist;state.count=Math.min(18,Number(b.dataset.count));state.paths=state.paths.slice(0,state.count-1);refresh();}));
    qsa("[data-socle-mode]",composer).forEach(b=>b.addEventListener("click",()=>{state.socleMode=b.dataset.socleMode;refresh();}));
    qsa("[data-socle-picker] [data-stone]",composer).forEach(b=>b.addEventListener("click",()=>{state.socle=b.dataset.stone;if(state.collection==="signature")state.origin=state.socle;refresh();}));
    qsa("[data-socle2-picker] [data-stone]",composer).forEach(b=>b.addEventListener("click",()=>{state.socle2=b.dataset.stone;refresh();}));
    qsa("[data-origin-picker] [data-stone]",composer).forEach(b=>b.addEventListener("click",()=>{state.origin=b.dataset.stone;refresh();}));
    qsa("[data-journey]",composer).forEach(b=>b.addEventListener("click",()=>{state.journey=b.dataset.journey;refresh();}));
    next.addEventListener("click",()=>{if(state.step<7){previewCard?.classList.remove("expanded");previewToggle?.setAttribute("aria-expanded","false");state.step++;refresh();scrollToStep();}});
    prev.addEventListener("click",()=>{if(state.step>1){previewCard?.classList.remove("expanded");previewToggle?.setAttribute("aria-expanded","false");state.step--;refresh();scrollToStep();}});
    qs("[data-add-config]",composer)?.addEventListener("click",()=>{
      const item={id:Date.now(),createdAt:new Date().toISOString(),...state,collectionName:collectionMap[state.collection].name,socleName:stoneMap[state.socle].name,socle2Name:stoneMap[state.socle2]?.name || "",originName:stoneMap[state.origin].name,pathNames:state.paths.map(s=>stoneMap[s].name)};
      const cart=getCart();cart.push(item);saveCart(cart);
      qs("[data-save-status]",composer).innerHTML=`Composition enregistrée. <a href="${siteUrl('panier/index.html')}">Voir mon panier →</a>`;
    });
    refresh();
  }

  // Cart page
  const cartPage=qs("[data-cart-page]");
  if(cartPage){
    function renderCart(){
      const cart=getCart();
      if(!cart.length){cartPage.innerHTML=`<div class="empty-cart"><h2>Votre panier est encore vide.</h2><p>Commencez par composer votre bracelet.</p><a class="btn primary" href="${siteUrl('composer/index.html')}">Composer mon bracelet</a></div>`;return;}
      cartPage.innerHTML=cart.map(item=>`
        <article class="cart-item">
          <div class="cart-bracelet"><div data-cart-bracelet="${item.id}"></div></div>
          <div><p class="kicker">Perlivio ${item.collectionName}</p><h2>${item.socleMode==="alternate" ? item.socleName+" + "+item.socle2Name : item.socleName}</h2>
            <dl><div><dt>Poignet</dt><dd>${item.wrist}</dd></div><div><dt>Pierres</dt><dd>${item.count}</dd></div><div><dt>Origine</dt><dd>${item.originName}</dd></div><div><dt>Chemin</dt><dd>${item.pathNames.length ? item.pathNames.join(" · ") : "Aucune au départ"}</dd></div><div><dt>Réserve</dt><dd>${item.paths.length} Socle(s) remplacée(s)</dd></div></dl>
            <button class="text-link danger" type="button" data-remove-cart="${item.id}">Retirer</button>
          </div>
        </article>`).join("");
      cart.forEach(item=>{
        const el=qs(`[data-cart-bracelet="${item.id}"]`,cartPage);
        renderBracelet(el,item);
      });
      qsa("[data-remove-cart]",cartPage).forEach(b=>b.addEventListener("click",()=>{saveCart(getCart().filter(i=>String(i.id)!==b.dataset.removeCart));renderCart();}));
    }
    renderCart();
  }

  updateCartCount();
})();
