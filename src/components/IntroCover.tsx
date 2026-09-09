// Runs as the document is parsed, before the header or page can paint.
const bootstrap = `(()=>{try{
  const root=document.documentElement;
  if(!/^\\/(ro|en)\\/?$/.test(location.pathname)||location.hash||matchMedia('(prefers-reduced-motion: reduce)').matches||sessionStorage.getItem('vd-barrisol-intro-seen')==='1')return;
  root.dataset.vdIntro='pending';
  const dismiss=()=>{if(root.dataset.vdIntro==='pending')root.dataset.vdIntro='dismissed';};
  const escape=e=>{if(e.key==='Escape')dismiss();};
  document.addEventListener('keydown',escape);
  setTimeout(()=>{dismiss();document.removeEventListener('keydown',escape);},5000);
}catch{}})();`;

export function IntroCover() {
  return (
    <>
      <style>{`
      #intro-cover{display:none}
      html[data-vd-intro="pending"]{overflow:hidden}
      html[data-vd-intro="pending"] #intro-cover{display:block;position:fixed;inset:0;background:#353535;z-index:10001;pointer-events:none}
      html[data-vd-intro="pending"] body > :not(#intro-cover):not(.site-membrane){visibility:hidden}
      @media(prefers-reduced-motion:reduce){html[data-vd-intro="pending"] #intro-cover{display:none}html[data-vd-intro="pending"] body > :not(#intro-cover){visibility:visible}}
    `}</style>
      <script dangerouslySetInnerHTML={{ __html: bootstrap }} />
      <div id="intro-cover" aria-hidden="true" />
    </>
  );
}
