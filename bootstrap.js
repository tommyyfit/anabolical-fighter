(()=>{
  const VERSION='11';
  const load=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error(`Failed to load ${src}`));document.body.appendChild(s)});
  const setStatus=t=>{const el=document.getElementById('loadingText');if(el)el.textContent=t};
  const bind=()=>{
    const U=window.AF_ASSET_URLS||{};
    const data=k=>U[k]||'';
    document.querySelectorAll('[data-af-key]').forEach(el=>{const u=data(el.dataset.afKey);if(u)el.src=u});
    const st=document.documentElement.style;
    [['--panel','UI/panel.webp'],['--menu-art','Branding/menu.webp'],['--btn','UI/button.webp'],['--btn2','UI/button_secondary.webp'],['--btnh','UI/button_hover.webp'],['--footer','UI/footer.webp']].forEach(([v,k])=>{const u=data(k);if(u)st.setProperty(v,`url("${u}")`)});
  };
  const b64ToBytes=b64=>{const clean=b64.replace(/\s+/g,'');if(!clean||clean.length%4!==0)throw new Error(`Invalid base64 chunk (${clean.length})`);const bin=atob(clean);const out=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);return out};
  const UI_URL_KEYS=new Set(['Branding/menu.webp','Branding/logo.webp','UI/panel.webp','UI/button.webp','UI/button_secondary.webp','UI/button_hover.webp','UI/footer.webp','UI/health_icon.webp','UI/skull_icon.webp','UI/xp_icon.webp']);
  (async()=>{
    try{
      setStatus('Loading V7 desktop artwork in high quality…');
      const parts=[...Array.from({length:18},(_,i)=>`c${String(i).padStart(2,'0')}`),'c18a','c18b','c19','c20','c21','c22'];
      const texts=await Promise.all(parts.map(n=>fetch(`v7art/${n}.b64?v=${VERSION}`,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(`${n}: HTTP ${r.status}`);return r.text()})));
      const chunks=texts.map((t,i)=>{try{return b64ToBytes(t)}catch(e){throw new Error(`${parts[i]}: ${e.message}`)}});
      const total=chunks.reduce((n,c)=>n+c.length,0);
      if(total<50000)throw new Error(`V7 atlas payload too small (${total} bytes)`);
      const bytes=new Uint8Array(total);let off=0;for(const c of chunks){bytes.set(c,off);off+=c.length}
      const atlasUrl=URL.createObjectURL(new Blob([bytes],{type:'image/avif'}));
      try{
        const atlas=new Image();atlas.decoding='async';atlas.src=atlasUrl;await atlas.decode();
        const A=window.AF_ASSETS={};
        const U=window.AF_ASSET_URLS={};
        const M=window.AF_ART_META||{};
        const N=window.AF_NATIVE_SIZES||{};
        for(const [key,m] of Object.entries(M)){
          const [ow,oh]=N[key]||[m.w,m.h];
          const c=document.createElement('canvas');c.width=ow;c.height=oh;
          const x=c.getContext('2d',{alpha:true});
          x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';
          x.drawImage(atlas,m.x,m.y,m.w,m.h,0,0,ow,oh);
          const webp=c.toDataURL('image/webp',1);
          A[key]=webp.split(',')[1];
          if(UI_URL_KEYS.has(key)) U[key]=c.toDataURL('image/png');
        }
        if(Object.keys(A).length<45)throw new Error(`Only ${Object.keys(A).length} V7 assets extracted`);
        console.info(`V7 HQ fast pipeline: atlas ${atlas.naturalWidth}x${atlas.naturalHeight}; ${Object.keys(A).length} assets restored to desktop dimensions.`);
      }finally{URL.revokeObjectURL(atlasUrl)}
      bind();
      setStatus('Starting Iron Circuit…');
      for(const src of [`game-data-1.js?v=${VERSION}`,`game-data-2.js?v=${VERSION}`,`game-data-3.js?v=${VERSION}`,`game-loader.js?v=${VERSION}`])await load(src);
      requestAnimationFrame(()=>{const c=document.getElementById('game');if(c){c.style.imageRendering='auto';c.style.transform='none';}});
      console.info('Anabolical Fighter: V7 HQ fast render pipeline active.');
    }catch(e){
      console.error('Anabolical Fighter V7 boot failed',e);
      setStatus(`V7 LOAD ERROR: ${e.message}`);
      const l=document.getElementById('loading');if(l)l.classList.add('active');
    }
  })();
})();
