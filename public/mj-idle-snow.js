(function () {
  if (window.__mjIdleSnowInitialized) return;
  window.__mjIdleSnowInitialized = true;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var style = document.createElement("style");
  style.textContent = `
    body.mj-snow-idle::after { opacity: .94; animation-duration: 8s; }
    .mj-snowdrift { position:fixed; z-index:1002; left:-3vw; right:-3vw; bottom:0; height:0; opacity:0; pointer-events:none; overflow:hidden; background:linear-gradient(180deg,rgba(255,255,255,.76) 0%,rgba(244,250,255,.96) 28%,rgba(224,239,253,.98) 100%); clip-path:polygon(0 25%,6% 16%,13% 22%,21% 9%,29% 19%,39% 7%,48% 18%,58% 8%,68% 19%,78% 6%,88% 18%,95% 10%,100% 18%,100% 100%,0 100%); filter:drop-shadow(0 -5px 10px rgba(173,207,238,.2)); transition:opacity .55s ease; }
    .mj-snowdrift::before { content:""; position:absolute; inset:0 0 auto; height:24%; background:linear-gradient(180deg,rgba(255,255,255,.95),rgba(255,255,255,0)); border-radius:50% 50% 0 0 / 65% 65% 0 0; }
    .mj-snowdrift::after { content:""; position:absolute; inset:12% 0 0; opacity:.52; background-image:radial-gradient(circle at 12% 25%,white 0 2px,transparent 3px),radial-gradient(circle at 36% 18%,rgba(255,255,255,.9) 0 1.5px,transparent 2.5px),radial-gradient(circle at 63% 30%,white 0 2px,transparent 3px),radial-gradient(circle at 85% 20%,rgba(255,255,255,.9) 0 1.5px,transparent 2.5px); background-size:190px 68px,230px 82px,250px 72px,210px 90px; }
    @media(max-width:700px){ body.mj-snow-idle::after{animation-duration:10s} .mj-snowdrift{clip-path:polygon(0 22%,12% 13%,23% 20%,36% 8%,49% 18%,62% 7%,74% 19%,87% 9%,100% 20%,100% 100%,0 100%)} }
  `;
  document.head.appendChild(style);
  var drift=document.createElement("div"); drift.className="mj-snowdrift"; drift.setAttribute("aria-hidden","true"); document.body.appendChild(drift);
  var idleDelay=45000, buildDuration=150000, maxViewportFill=.42, idleTimer=null, buildTimer=null, idleStarted=0;
  function clearSnow(){ if(idleTimer)window.clearTimeout(idleTimer); if(buildTimer)window.clearInterval(buildTimer); idleTimer=null; buildTimer=null; idleStarted=0; document.body.classList.remove("mj-snow-idle"); drift.style.height="0px"; drift.style.opacity="0"; }
  function beginIdle(){ idleTimer=null; idleStarted=Date.now(); document.body.classList.add("mj-snow-idle"); drift.style.opacity="1"; function growSnow(){ if(!idleStarted)return; var progress=Math.min((Date.now()-idleStarted)/buildDuration,1); drift.style.height=Math.round(window.innerHeight*maxViewportFill*progress)+"px"; if(progress>=1){window.clearInterval(buildTimer);buildTimer=null;} } growSnow(); buildTimer=window.setInterval(growSnow,1000); }
  function registerActivity(){ clearSnow(); idleTimer=window.setTimeout(beginIdle,idleDelay); }
  ["pointerdown","pointermove","touchstart","keydown","scroll","wheel","click","focusin"].forEach(function(e){window.addEventListener(e,registerActivity,{passive:true,capture:true});});
  document.addEventListener("visibilitychange",function(){if(document.hidden)clearSnow();else registerActivity();});
  window.addEventListener("resize",function(){if(idleStarted){var p=Math.min((Date.now()-idleStarted)/buildDuration,1);drift.style.height=Math.round(window.innerHeight*maxViewportFill*p)+"px";}});
  registerActivity();
})();