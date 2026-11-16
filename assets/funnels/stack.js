/* The stack, wired: steps one lead through Meta ads, the page, Zapier, GoHighLevel and back to Meta. */
(function(){
  var root=document.getElementById('stack');if(!root)return;
  var nodes=[].slice.call(root.querySelectorAll('.fm-sk-n'));
  var logs=[].slice.call(root.querySelectorAll('.fm-sk-log li'));
  var chips=[].slice.call(root.querySelectorAll('[data-sk]'));
  var play=document.getElementById('skPlay');
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cur=-1,timer=null,playing=!reduce,visible=false,held=false;
  function show(i){
    cur=i;
    nodes.forEach(function(n,k){n.classList.toggle('fm-on',k===i);n.classList.toggle('fm-past',k<i);n.classList.remove('fm-go');
      n.querySelector('.fm-sk-st em').textContent=k<i?'Done':(k===i?'Running':'Waiting')});
    if(i>0){var prev=nodes[i-1];void prev.offsetWidth;prev.classList.add('fm-go')}
    logs.forEach(function(l){l.classList.toggle('fm-on',+l.dataset.i<=i)});
    chips.forEach(function(c){c.setAttribute('aria-pressed',String(+c.dataset.sk===i))});
  }
  function tick(){show(cur>=nodes.length-1?0:cur+1);schedule()}
  function schedule(){clearTimeout(timer);if(playing&&visible&&!held)timer=setTimeout(tick,cur===nodes.length-1?4200:2600)}
  function setPlay(p){playing=p;play.setAttribute('aria-pressed',String(p));play.querySelector('span').textContent=p?'Pause':'Play';schedule()}
  play.addEventListener('click',function(){setPlay(!playing)});
  chips.forEach(function(c){c.addEventListener('click',function(){setPlay(false);show(+c.dataset.sk)})});
  /* auto-play yields to the visitor: hover or focus inside the rail pauses it */
  var rail=root.querySelector('.fm-sk-rail');
  ['mouseenter','focusin'].forEach(function(e){rail.addEventListener(e,function(){held=true;clearTimeout(timer)})});
  ['mouseleave','focusout'].forEach(function(e){rail.addEventListener(e,function(){held=false;schedule()})});
  if(reduce){show(nodes.length-1);setPlay(false);return}
  show(0);
  if('IntersectionObserver' in window){new IntersectionObserver(function(es){visible=es[0].isIntersecting;if(visible)schedule();else clearTimeout(timer)},{threshold:.25}).observe(rail)}else{visible=true;schedule()}
})();
