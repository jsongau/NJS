/* Tap feedback on phones. Android: the Vibration API. iOS 18+: tapping a hidden switch input gives a system haptic.
   Touch screens only, off with reduced motion, and never blocks the tap itself. */
(function(){
  var touch=matchMedia('(pointer: coarse)').matches, reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function iosTick(){try{var l=document.createElement('label');l.setAttribute('aria-hidden','true');l.style.display='none';var i=document.createElement('input');i.type='checkbox';i.setAttribute('switch','');l.appendChild(i);document.head.appendChild(l);l.click();document.head.removeChild(l)}catch(e){}}
  var PATTERN={tap:8,pick:[10,30,14],done:[14,40,22,40,30],warn:[30,60,30]};
  window.fmHaptic=function(kind){
    if(!touch||reduce)return;
    if(navigator.vibrate){navigator.vibrate(PATTERN[kind]||8)}else{iosTick();if(kind==='done'||kind==='pick')setTimeout(iosTick,90)}
  };
  var SEL='button,[role="switch"],[role="tab"],.fm-cta,.fm-ao-c,.fm-kit-idx a';
  document.addEventListener('click',function(e){
    var el=e.target.closest&&e.target.closest(SEL);if(!el||!el.closest('.fm-root, .fm-mbar'))return;
    if(el.matches('[type="submit"]'))return; /* the form decides: done or warn */
    var kind=el.matches('[aria-pressed],[role="switch"],.fm-ao-c')?'pick':'tap';
    window.fmHaptic(kind);
  },true);
})();
