(async()=>{try{
  const PARTS=['h00','h01','h02-0','h02-1','h02-2','h03-0','h03-1','h03-2','h04-0','h04-1','h04-2','h05','h06','h07','h08'];
  const texts=await Promise.all(PARTS.map(n=>fetch(`art/${n}.txt`,{cache:'force-cache'}).then(r=>{if(!r.ok)throw new Error(`art/${n}.txt ${r.status}`);return r.text()})));
  const hex=texts.join('').trim();
  if(hex.length%2)throw new Error('Artwork hex length is invalid');
  const bytes=new Uint8Array(hex.length/2);for(let i=0,j=0;i<hex.length;i+=2,j++)bytes[j]=parseInt(hex.slice(i,i+2),16);
  const atlasUrl=URL.createObjectURL(new Blob([bytes],{type:'image/avif'}));
  const atlas=new Image();atlas.decoding='async';atlas.src=atlasUrl;await atlas.decode();
  const A=window.AF_ASSETS=window.AF_ASSETS||{},M=window.AF_ART_META;
  const nativeSheets={'Player/hero.webp':[1024,1024],'Enemies/basic.webp':[1024,512],'Enemies/fast.webp':[1024,512],'Enemies/tank.webp':[1024,512]};
  for(const [key,m] of Object.entries(M)){
    const [ow,oh]=nativeSheets[key]||[m.w,m.h],c=document.createElement('canvas');c.width=ow;c.height=oh;
    const x=c.getContext('2d');x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.drawImage(atlas,m.x,m.y,m.w,m.h,0,0,ow,oh);
    A[key]=c.toDataURL('image/webp',.94).split(',')[1];
  }
  URL.revokeObjectURL(atlasUrl);
  const data=p=>A[p]?`data:image/webp;base64,${A[p]}`:'';
  document.querySelectorAll('[data-af-key]').forEach(el=>{el.src=data(el.dataset.afKey)});
  const st=document.documentElement.style;
  st.setProperty('--panel',`url("${data('UI/panel.webp')}")`);st.setProperty('--menu-art',`url("${data('Branding/menu.webp')}")`);
  st.setProperty('--btn',`url("${data('UI/button.webp')}")`);st.setProperty('--btn2',`url("${data('UI/button_secondary.webp')}")`);st.setProperty('--btnh',`url("${data('UI/button_hover.webp')}")`);st.setProperty('--footer',`url("${data('UI/footer.webp')}")`);
  const load=src=>new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error(`Failed ${src}`));document.body.appendChild(s)});
  for(const src of ['game-data-1.js','game-data-2.js','game-data-3.js','game-loader.js'])await load(src);
}catch(e){console.error('Anabolical Fighter boot failed',e);const t=document.getElementById('loadingText');if(t)t.textContent='LOAD ERROR — REFRESH PAGE';}})();