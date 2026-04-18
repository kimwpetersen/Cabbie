const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/GameLoop-pSWw7mFp.js","assets/constants-DxJ0Jcen.js"])))=>i.map(i=>d[i]);
import{A as e,E as t,O as n,f as r,h as i,l as a,m as o,p as s}from"./constants-DxJ0Jcen.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var c=`modulepreload`,l=function(e){return`/Cabbie/`+e},u={},d=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}r=o(t.map(t=>{if(t=l(t,n),t in u)return;u[t]=!0;let r=t.endsWith(`.css`),i=r?`[rel="stylesheet"]`:``;if(n)for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}else if(document.querySelector(`link[href="${t}"]${i}`))return;let o=document.createElement(`link`);if(o.rel=r?`stylesheet`:c,r||(o.as=`script`),o.crossOrigin=``,o.href=t,a&&o.setAttribute(`nonce`,a),document.head.appendChild(o),r)return new Promise((e,n)=>{o.addEventListener(`load`,e),o.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},f=`dev`,p=null,m=null;async function h(){return p||m||(m=(async()=>{let e;switch(f){case`crazygames`:e=await d(()=>import(`./crazygames-CWyUjqj0.js`),[]);break;case`newgrounds`:e=await d(()=>import(`./newgrounds-BWWvQjQ7.js`),[]);break;case`itch`:e=await d(()=>import(`./itch-BN6dx_js.js`),[]);break;default:e=await d(()=>import(`./dev-ChFifDlf.js`),[]);break}return await e.init(),p=e,e})(),m)}var g={portal:f,async init(){await h()},async preRoll(){return(await h()).preRoll()},async interstitial(e){return(await h()).interstitial(e)},async rewarded(e){return(await h()).rewarded(e)},async trackEvent(e,t){return(await h()).trackEvent(e,t)},async cloudSaveSupported(){return(await h()).cloudSaveSupported()},async cloudSaveWrite(e){return(await h()).cloudSaveWrite(e)},async cloudSaveRead(){return(await h()).cloudSaveRead()}},_=`cabbie.save`,v=1,y={},b={_stubState:null,flush(){let e=this.collectState(),t={v,ts:Date.now(),state:e};try{localStorage.setItem(_,JSON.stringify(t))}catch(e){console.warn(`SaveSystem flush failed:`,e)}},load(){try{let e=localStorage.getItem(_);if(!e)return null;let t=JSON.parse(e);return this.migrate(t)}catch{return null}},migrate(e){let t=e.state,n=e.v??0;for(;n<v;){let e=y[n];if(!e)break;t=e(t),n+=1}return n===v?t:null},collectState(){return this._stubState===null?{}:this._stubState},clear(){try{localStorage.removeItem(_)}catch{}}},x,S,C,w=null;async function T(){s.load();let e=(()=>{try{return localStorage.getItem(`cabbie.lang`)}catch{return null}})(),t=navigator.language||`en`,n=t.split(`-`)[0],r=`en`;e&&a.includes(e)?r=e:a.includes(t)?r=t:a.includes(n)&&(r=n),o.setLanguage(r),g.init().catch(e=>console.warn(`Portal init failed:`,e)),g.trackEvent(`session:start`,{portal:g.portal,lang:r}),E(),O(),window.addEventListener(`resize`,D)}function E(){x=new e({canvas:document.getElementById(`game-canvas`),antialias:!0}),x.setPixelRatio(Math.min(window.devicePixelRatio,2)),x.setSize(window.innerWidth,window.innerHeight),x.setClearColor(657940,1),S=new n,C=new t(75,window.innerWidth/window.innerHeight,.1,1e3),C.position.set(0,10,20),C.lookAt(0,0,0)}function D(){if(!x||!C)return;let e=window.innerWidth,t=window.innerHeight;x.setSize(e,t),C.aspect=e/t,C.updateProjectionMatrix()}function O(){let e=document.getElementById(`hud-root`),t=b.load()!==null;e.innerHTML=`
    <div id="title-screen" style="
      position: absolute; inset: 0;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      background: ${r.surface}; color: #fff;
      font-family: ${r.typography.hud};
      padding: 2rem;
    ">
      <div style="
        font-family: ${r.typography.transition};
        font-size: calc(3.5rem * ${s.textScale});
        font-weight: 700; letter-spacing: -0.02em; margin-bottom: 0.5rem;
      ">
        ${o.t(`start.title`)}<span style="color: ${r.accent}">.</span>
      </div>
      <div style="
        font-size: calc(0.875rem * ${s.textScale});
        color: rgba(255,255,255,0.6); margin-bottom: 2rem;
        text-align: center; max-width: 30ch;
      ">${o.t(`start.subtitle`)}</div>
      <button id="drive-btn" class="tap-target" style="
        background: ${r.accent}; color: ${r.surface};
        border: none; padding: 14px 32px;
        font-size: calc(0.875rem * ${s.textScale});
        font-weight: 600; font-family: ${r.typography.hud};
        letter-spacing: 0.1em; border-radius: 8px; cursor: pointer;
        transition: transform ${r.uiDuration}ms ${r.uiEaseCurve};
      ">▶ ${t?o.t(`menu.continue`):o.t(`start.button`)}</button>
      <div style="
        margin-top: 1.5rem;
        font-size: calc(0.75rem * ${s.textScale});
        color: rgba(255,255,255,0.3); letter-spacing: 0.05em;
      ">${o.t(`start.hint`)}</div>
      <div style="
        position: fixed; bottom: 1rem; right: 1rem;
        font-size: 0.7rem; color: rgba(255,255,255,0.25);
        font-family: ${r.typography.hud};
      ">v0.2 · M1</div>
    </div>
  `;let n=document.getElementById(`drive-btn`);n&&n.addEventListener(`click`,()=>{i.emit(`app:driveClicked`),k()})}async function k(){let e=document.getElementById(`title-screen`);e&&e.remove();let{GameLoop:t}=await d(async()=>{let{GameLoop:e}=await import(`./GameLoop-pSWw7mFp.js`);return{GameLoop:e}},__vite__mapDeps([0,1]));w=new t({scene:S,camera:C,renderer:x}),w.start()}document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,T):T();