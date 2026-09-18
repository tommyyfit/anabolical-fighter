(()=>{
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

  // The web atlas contains the actual sprite sheets at 384px width. The original
  // browser port expected 256px frame cells because the old loader first enlarged
  // those sheets to 1024px. Intercept only those sprite-sheet source rectangles and
  // map them directly to the real 96px cells. This removes an unnecessary
  // 384 -> 1024 -> screen resampling pass which was the main source of soft sprites.
  const nativeDrawImage=CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage=function(img,...a){
    if(a.length===8 && img && ((img.naturalWidth===384&&img.naturalHeight===384)||(img.naturalWidth===384&&img.naturalHeight===192))){
      const [sx,sy,sw,sh,dx,dy,dw,dh]=a;
      if(sw===256&&sh===256){
        const k=96/256;
        return nativeDrawImage.call(this,img,sx*k,sy*k,sw*k,sh*k,dx,dy,dw,dh);
      }
    }
    return nativeDrawImage.call(this,img,...a);
  };

  (async()=>{
    try{
      setStatus('Loading V7 desktop artwork…');
      const parts=[...Array.from({length:18},(_,i)=>`c${String(i).padStart(2,'0')}`),'c18a','c18b','c19','c20','c21','c22'];
      const texts=await Promise.all(parts.map(n=>fetch(`v7art/${n}.b64?v=8`,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(`${n}: HTTP ${r.status}`);return r.text()})));
      const chunks=texts.map((t,i)=>{try{return b64ToBytes(t)}catch(e){throw new Error(`${parts[i]}: ${e.message}`)}});
      const total=chunks.reduce((n,c)=>n+c.length,0);
      if(total<50000)throw new Error(`V7 atlas payload too small (${total} bytes)`);
      const bytes=new Uint8Array(total);let off=0;for(const c of chunks){bytes.set(c,off);off+=c.length}
      const atlasUrl=URL.createObjectURL(new Blob([bytes],{type:'image/avif'}));
      try{
        const atlas=new Image();atlas.decoding='async';atlas.src=atlasUrl;await atlas.decode();
        if(atlas.naturalWidth<900||atlas.naturalHeight<1800)throw new Error(`Unexpected V7 atlas size ${atlas.naturalWidth}x${atlas.naturalHeight}`);
        const A=window.AF_ASSETS={};
        const U=window.AF_ASSET_URLS={};
        const M=window.AF_ART_META||{};
        for(const [key,m] of Object.entries(M)){
          const raw=document.createElement('canvas');raw.width=m.w;raw.height=m.h;
          const rc=raw.getContext('2d',{alpha:true,willReadFrequently:false});
          rc.imageSmoothingEnabled=false;
          rc.drawImage(atlas,m.x,m.y,m.w,m.h,0,0,m.w,m.h);
          const png=raw.toDataURL('image/png');
          U[key]=png;
          // Do not enlarge the hero/enemy sheets anymore. Keep their real atlas
          // resolution and let the drawImage mapping above select the correct cells.
          A[key]=raw.toDataURL('image/webp',1).split(',')[1];
        }
        if(Object.keys(A).length<45)throw new Error(`Only ${Object.keys(A).length} V7 assets extracted`);
        console.info(`V7 direct-resolution atlas: ${atlas.naturalWidth}x${atlas.naturalHeight}, ${Object.keys(A).length} assets`);
      }finally{URL.revokeObjectURL(atlasUrl)}
      bind();
      setStatus('Starting Iron Circuit…');
      for(const src of ['game-data-1.js?v=8','game-data-2.js?v=8','game-data-3.js?v=8','game-loader.js?v=8'])await load(src);
      requestAnimationFrame(()=>{
        const c=document.getElementById('game');
        if(c){c.style.imageRendering='auto';c.style.transform='none';}
      });
      console.info('Anabolical Fighter: V7 sharp render pipeline active.');
    }catch(e){
      console.error('Anabolical Fighter V7 boot failed',e);
      setStatus(`V7 LOAD ERROR: ${e.message}`);
      const l=document.getElementById('loading');if(l)l.classList.add('active');
    }
  })();
})();