(async()=>{const load=src=>new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error(`Failed ${src}`));document.body.appendChild(s)}),bind=()=>{const A=window.AF_ASSETS||{},data=p=>A[p]?`data:image/webp;base64,${A[p]}`:'';document.querySelectorAll('[data-af-key]').forEach(el=>{const u=data(el.dataset.afKey);if(u)el.src=u});const st=document.documentElement.style;[['--panel','UI/panel.webp'],['--menu-art','Branding/menu.webp'],['--btn','UI/button.webp'],['--btn2','UI/button_secondary.webp'],['--btnh','UI/button_hover.webp'],['--footer','UI/footer.webp']].forEach(([v,k])=>{const u=data(k);if(u)st.setProperty(v,`url("${u}")`)})};
try{
  let artReady=false;
  try{
    const PARTS=['h00','h01','h02-0','h02-1','h02-2','h03-0','h03-1','h03-2','h04-0','h04-1','h04-2','h05','h06','h07','h08'];
    const texts=await Promise.all(PARTS.map(n=>fetch(`art/${n}.txt?v=2`,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(`art/${n}.txt ${r.status}`);return r.text()})));
    const hex=texts.join('').replace(/\s+/g,'');if(!hex||hex.length%2)throw new Error('Artwork hex length is invalid');
    const bytes=new Uint8Array(hex.length/2);for(let i=0,j=0;i<hex.length;i+=2,j++){const v=parseInt(hex.slice(i,i+2),16);if(Number.isNaN(v))throw new Error(`Artwork hex invalid at ${i}`);bytes[j]=v}
    const atlasUrl=URL.createObjectURL(new Blob([bytes],{type:'image/avif'}));
    try{
      const atlas=new Image();atlas.decoding='async';atlas.src=atlasUrl;await atlas.decode();
      const A=window.AF_ASSETS=window.AF_ASSETS||{},M=window.AF_ART_META||{},nativeSheets={'Player/hero.webp':[1024,1024],'Enemies/basic.webp':[1024,512],'Enemies/fast.webp':[1024,512],'Enemies/tank.webp':[1024,512]};
      for(const [key,m] of Object.entries(M)){const [ow,oh]=nativeSheets[key]||[m.w,m.h],c=document.createElement('canvas');c.width=ow;c.height=oh;const x=c.getContext('2d');x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.drawImage(atlas,m.x,m.y,m.w,m.h,0,0,ow,oh);A[key]=c.toDataURL('image/webp',.94).split(',')[1]}
      artReady=Object.keys(A).length>10;
    }finally{URL.revokeObjectURL(atlasUrl)}
  }catch(artError){console.warn('Desktop artwork atlas unavailable — using resilient fallback.',artError)}
  if(!artReady){await load('runtime-assets.js?v=2');const t=document.getElementById('loadingText');if(t)t.textContent='Loading resilient artwork…'}
  bind();
  for(const src of ['game-data-1.js','game-data-2.js','game-data-3.js','game-loader.js'])await load(src);
}catch(e){console.error('Anabolical Fighter boot failed',e);const t=document.getElementById('loadingText');if(t)t.textContent='LOAD ERROR — REFRESH PAGE';}
})();