/* /funnels/memorial/behind: the behind-the-funnel tabs (map, Meta ads, CRM, automations, reporting).
   A #map / #ads style hash in the URL opens that tab; arrow keys move between tabs. */
(function(){
  var tabs=[].slice.call(document.querySelectorAll('.fm-tab'));if(!tabs.length)return;
  function sel(t,focus){tabs.forEach(function(x){var on=x===t;x.setAttribute('aria-selected',String(on));x.tabIndex=on?0:-1;var p=document.getElementById(x.getAttribute('aria-controls'));p.classList.toggle('fm-on',on);p.setAttribute('aria-hidden',String(!on))});if(focus)t.focus()}
  tabs.forEach(function(t,i){
    t.addEventListener('click',function(){sel(t);if(window.fmHaptic)window.fmHaptic('tap')});
    t.addEventListener('keydown',function(e){var k=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(k){e.preventDefault();sel(tabs[(i+k+tabs.length)%tabs.length],true)}});
  });
  var h=location.hash.replace('#','');var t=document.getElementById('t-'+h);if(t&&tabs.indexOf(t)>-1){sel(t);var b=document.getElementById('behind');if(b)b.scrollIntoView()}
})();
