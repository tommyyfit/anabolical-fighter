(()=>{
  const load=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error(`Failed to load ${src}`));document.body.appendChild(s)});
  const setStatus=t=>{const el=document.getElementById('loadingText');if(el)el.textContent=t};
  const bind=()=>{
    const A=window.AF_ASSETS||{};
    const data=k=>A[k]?`data:image/webp;base64,${A[k]}`:'';
    document.querySelectorAll('[data-af-key]').forEach(el=>{const u=data(el.dataset.afKey);if(u)el.src=u});
    const st=document.documentElement.style;
    [['--panel','UI/panel.webp'],['--menu-art','Branding/menu.webp'],['--btn','UI/button.webp'],['--btn2','UI/button_secondary.webp'],['--btnh','UI/button_hover.webp'],['--footer','UI/footer.webp']].forEach(([v,k])=>{const u=data(k);if(u)st.setProperty(v,`url("${u}")`)});
  };
  const b64ToBytes=b64=>{const bin=atob(b64);const out=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);return out};

  (async()=>{
    try{
      setStatus('Loading original V7 desktop artwork…');
      const parts=[...Array.from({length:18},(_,i)=>`c${String(i).padStart(2,'0')}`),'c18a','c18b','c19','c20','c21','c22'];
      const texts=await Promise.all(parts.map(n=>fetch(`v7art/${n}.b64?v=5`,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(`${n}: HTTP ${r.status}`);return r.text()})));
      const b64=texts.join('').replace(/\s+/g,'');
      if(!b64||b64.length%4!==0)throw new Error(`V7 atlas base64 invalid (${b64.length})`);
      const bytes=b64ToBytes(b64);
      const atlasUrl=URL.createObjectURL(new Blob([bytes],{type:'image/avif'}));
      try{
        const atlas=new Image();
        atlas.decoding='async';
        atlas.src=atlasUrl;
        await atlas.decode();
        if(atlas.naturalWidth<900||atlas.naturalHeight<1800)throw new Error(`Unexpected V7 atlas size ${atlas.naturalWidth}x${atlas.naturalHeight}`);
        const A=window.AF_ASSETS={};
        const M=window.AF_ART_META||{};
        const nativeSheets={'Player/hero.webp':[1024,1024],'Enemies/basic.webp':[1024,512],'Enemies/fast.webp':[1024,512],'Enemies/tank.webp':[1024,512]};
        for(const [key,m] of Object.entries(M)){
          const [ow,oh]=nativeSheets[key]||[m.w,m.h];
          const c=document.createElement('canvas');c.width=ow;c.height=oh;
          const x=c.getContext('2d',{alpha:true});x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';
          x.drawImage(atlas,m.x,m.y,m.w,m.h,0,0,ow,oh);
          A[key]=c.toDataURL('image/webp',0.96).split(',')[1];
        }
        if(Object.keys(A).length<45)throw new Error(`Only ${Object.keys(A).length} V7 assets extracted`);
      }finally{URL.revokeObjectURL(atlasUrl)}

      bind();
      setStatus('Starting Iron Circuit…');
      for(const src of ['game-data-1.js?v=5','game-data-2.js?v=5','game-data-3.js?v=5','game-loader.js?v=5'])await load(src);
      console.info('Anabolical Fighter: original V7 desktop artwork loaded.');
    }catch(e){
      console.error('Anabolical Fighter V7 boot failed',e);
      setStatus('V7 ARTWORK LOAD ERROR — PRESS CTRL+F5');
      const l=document.getElementById('loading');if(l)l.classList.add('active');
    }
  })();
})();