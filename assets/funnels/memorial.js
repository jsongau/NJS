/* /funnels/memorial: funnel build template behaviour (concept brand, demo only: nothing is sent). */
(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var body=document.getElementById('fm');
var COPY={
  plan:{eyebrow:'Planning ahead · Free guide',
    h:{a:'<span class="ph">Plan it once,</span> <span class="ph">so your family</span> <span class="ph"><em>never has</em></span> <span class="ph"><em>to guess.</em></span>',b:'<span class="ph">Your wishes,</span> <span class="ph">written down.</span> <span class="ph"><em>Your family, spared</em></span> <span class="ph"><em>the hard calls.</em></span>'},
    sub:'A free planning guide with every price listed, and a calm call with a planner only when you want one.',
    trust:[['tag','Every price online'],['person','A named planner, not a call center'],['calm','No pressure, ever']],
    chKick:'Free guide · about a minute',chTitle:'Get the planning guide',art:'A light left on for the people who come next',
    howKick:'How planning works',howH:'<span class="ph">Three quiet steps,</span> <span class="ph">at your own pace.</span>',
    how:[['Read the guide','Every choice explained in plain words, with the full price list.'],['Talk if you want to','Book a call with a planner, or never. Both are fine.'],['Write it down','Your wishes on file, shared with the family members you choose.']],
    doneH:function(n){return 'Your guide is on its way, '+n+'.'},doneP:'Check your inbox in the next minute. It includes the full price list.'},
  need:{eyebrow:'Help now · Day or night',
    h:{a:'<span class="ph">We\'re here.</span> <span class="ph">Call now, or leave</span> <span class="ph">your number.</span>',b:'<span class="ph">A director can talk</span> <span class="ph">with you right now.</span>'},
    sub:'We\'ll take it one step at a time. Nothing needs to be decided tonight.',
    trust:[['phone','A person answers, day or night'],['tag','Prices given in writing'],['calm','Nothing to sign tonight']],
    chKick:'Talk to a director',chTitle:'We\'ll call you back',art:'Someone is awake and ready to help',
    howKick:'What happens next',howH:'<span class="ph">You call,</span> <span class="ph">and we take it from there.</span>',
    how:[['We talk','A director listens, answers your questions and explains the next few hours.'],['We bring them into our care','At a time that is right for your family.'],['We meet when you\'re ready','Choices and prices, in person, in writing.']],
    doneH:function(n){return 'Thank you, '+n+'. A director is calling you now.'},doneP:'Keep your phone close. If you would rather call, the number is (555) 010-0144.'},
  care:{eyebrow:'Senior living · Book a tour',
    h:{a:'<span class="ph">Find the right care</span> <span class="ph">for Mom or Dad,</span> <span class="ph"><em>and see it in person.</em></span>',b:'<span class="ph">Not sure what level</span> <span class="ph">of care they need?</span> <span class="ph"><em>Start here.</em></span>'},
    sub:'A two-minute care-fit check, then a tour at a time that suits you. No forms to sign.',
    trust:[['home','Independent, assisted and memory care'],['person','Tours led by a care guide'],['calm','No deposit to visit']],
    chKick:'Care-fit check · two minutes',chTitle:'Find the right fit',art:'Mornings that feel like home',
    howKick:'How choosing care works',howH:'<span class="ph">From not sure</span> <span class="ph">to a visit, in a week.</span>',
    how:[['Check the fit','Tell us where they need a hand; we suggest a level of care.'],['Visit in person','Tour with a care guide, meet the staff, stay for a meal.'],['Assessment','A nurse visits to confirm the care plan before any move.']],
    doneH:function(n){return 'Almost done, '+n+'. Pick a tour time.'},doneP:'We sent the care-fit summary to your email.'}
};
var ICON={tag:'i-tag',person:'i-person',calm:'i-calm',phone:'i-phone',home:'i-home'};
var state={aud:'plan',ab:'a',vet:false,cm:false,data:{}};
function useIco(id){return '<svg aria-hidden="true"><use href="#'+id+'"/></svg>'}

function render(){
  var c=COPY[state.aud];
  body.dataset.aud=state.aud;
  $('#eyebrow').textContent=c.eyebrow;
  $('#headline').innerHTML=c.h[state.ab];
  $('#sub').textContent=c.sub;
  $('#trust').innerHTML=c.trust.map(function(t){return '<span>'+useIco(ICON[t[0]])+t[1]+'</span>'}).join('')+(state.vet?'<span>'+useIco('i-flag')+'VA benefits help</span>':'');
  $('#chKick').textContent=c.chKick; $('#chTitle').textContent=c.chTitle; $('#artCap').textContent=c.art;
  $('#howKick').textContent=c.howKick; $('#howH').innerHTML=c.howH;
  $('#how').innerHTML=c.how.map(function(x){return '<li><b>'+x[0]+'</b><p>'+x[1]+'</p></li>'}).join('');
  $$('.fm-flow').forEach(function(f){f.hidden=f.dataset.flow!==state.aud});
  $$('.fm-cta-t').forEach(function(s){s.textContent=s.getAttribute('data-ab-'+state.ab)});
  $$('[data-aud-btn]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.audBtn===state.aud))});
  $$('.fm-vet-q').forEach(function(q){q.hidden=!state.vet});
  if(state.cm) showNote(currentKey());
  markKit();kitVet();
}

/* controls */
$$('[data-aud-btn]').forEach(function(b){b.addEventListener('click',function(){state.aud=b.dataset.audBtn;if(body.classList.contains('fm-done'))restart(true);render();track('door',state.aud)})});
$$('[data-theme-btn]').forEach(function(b){b.addEventListener('click',function(){body.dataset.theme=b.dataset.themeBtn;$$('[data-theme-btn]').forEach(function(x){x.setAttribute('aria-pressed',String(x===b))})})});
function sw(id,fn){var el=$(id);el.addEventListener('click',function(){var on=el.getAttribute('aria-checked')!=='true';el.setAttribute('aria-checked',String(on));fn(on)})}
sw('#vetSw',function(on){state.vet=on;body.classList.toggle('fm-veteran',on);render();if(state.cm&&on)showNote('vet')});
sw('#abSw',function(on){state.ab=on?'b':'a';$('#abv').textContent=on?'B':'A';render();if(state.cm)showNote('ab')});
sw('#cmSw',function(on){state.cm=on;body.classList.toggle('fm-commentary',on);if(on){showNote('hero')}else{hideNote()}});

/* concept menu */
var toggleCm=function(){var m=$('#cm'),o=!m.classList.contains('fm-open');m.classList.toggle('fm-open',o);$('.fm-cm-btn').setAttribute('aria-expanded',String(o))};
var closeCm=function(){$('#cm').classList.remove('fm-open');$('.fm-cm-btn').setAttribute('aria-expanded','false')};
document.addEventListener('click',function(e){if(!e.target.closest('#cm'))closeCm()});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){closeCm();if(state.cm)hideNote()}});

/* choices */
$$('[data-group]').forEach(function(g){
  var multi=g.hasAttribute('data-multi');
  $$('.fm-chip-btn',g).forEach(function(b){b.addEventListener('click',function(){
    if(multi){
      if(b.dataset.v==='none'){$$('.fm-chip-btn',g).forEach(function(x){x.setAttribute('aria-pressed',String(x===b))})}
      else{$('[data-v="none"]',g).setAttribute('aria-pressed','false');b.setAttribute('aria-pressed',String(b.getAttribute('aria-pressed')!=='true'))}
      if(g.dataset.group==='help')careFit(g);
    }else{$$('.fm-chip-btn',g).forEach(function(x){x.setAttribute('aria-pressed',String(x===b))})}
    g.classList.remove('fm-bad');
  })});
});
function picked(form,group){var g=$('[data-group="'+group+'"]',form);if(!g)return null;var v=$$('.fm-chip-btn[aria-pressed="true"]',g).map(function(b){return b.dataset.v});return g.hasAttribute('data-multi')?v:(v[0]||null)}
function careFit(g){
  var v=$$('.fm-chip-btn[aria-pressed="true"]',g).map(function(b){return b.dataset.v});var fit=$('#fit');
  if(!v.length){fit.classList.remove('fm-on');return}
  var name,why;
  if(v.indexOf('memory')>-1){name='Memory care';why='A secure neighborhood with staff trained in dementia care, and days built around routine.'}
  else if(v.indexOf('bathing')>-1||v.indexOf('meds')>-1||v.indexOf('walking')>-1){name='Assisted living';why='Their own apartment, with help for '+v.filter(function(x){return x!=='none'}).map(function(x){return {meals:'meals',meds:'medications',bathing:'bathing and dressing',walking:'getting around'}[x]}).join(', ')+' when they need it.'}
  else{name='Independent living';why='Their own place, with meals, activities and neighbors, and help close by if it is ever needed.'}
  $('#fitName').textContent=name;$('#fitWhy').textContent=why;fit.classList.add('fm-on');state.data.fit=name;
}

/* validation */
var emailOk=function(v){return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())};
function need(input,ok){var f=input.closest('.fm-field');var good=ok(input.value);f.classList.toggle('fm-bad',!good);if(!good)input.focus();return good}
function needPick(form,group){var g=$('[data-group="'+group+'"]',form);var good=!!picked(form,group);g.classList.toggle('fm-bad',!good);return good}

/* multi-step flows */
$$('.fm-flow').forEach(function(form){
  var steps=$$('.fm-fs',form);if(!steps.length)return;
  function go(n){steps.forEach(function(s){s.classList.toggle('fm-on',+s.dataset.s===n)});$$('.fm-steps i',form).forEach(function(i,k){i.classList.toggle('fm-on',k<n)});var sn=$('.fm-sn',form);if(sn)sn.textContent=n;form.dataset.at=n;var first=$('.fm-fs.on input,.fm-fs.on .fm-chip-btn',form);if(first&&n>1)first.focus({preventScroll:true});track('step',form.dataset.flow+':'+n);if(state.cm)showNote(currentKey())}
  form.dataset.at=1;
  $$('[data-next]',form).forEach(function(b){b.addEventListener('click',function(){
    var at=+form.dataset.at,ok=true;
    if(form.id==='f-plan'){if(at===1)ok=need($('#p-email'),emailOk);if(at===2)ok=need($('#p-name'),function(v){return v.trim().length>0})&&needPick(form,'for')}
    if(form.id==='f-care'){if(at===1)ok=needPick(form,'who')}
    if(ok)go(at+1);
  })});
  $$('[data-back]',form).forEach(function(b){b.addEventListener('click',function(){go(Math.max(1,+form.dataset.at-1))})});
  form._go=go;
});
$('#p-email').addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();$('#f-plan [data-next]').click()}});

/* submit -> confirmation (demo only: nothing leaves the page) */
$('#f-plan').addEventListener('submit',function(e){e.preventDefault();finish($('#p-name').value.trim()||'friend',{email:$('#p-email').value.trim(),sms:$('#p-sms').checked})});
$('#f-need').addEventListener('submit',function(e){e.preventDefault();var f=e.target;if(!need($('#n-name'),function(v){return v.trim().length>0}))return;if(!need($('#n-phone'),function(v){return v.replace(/\D/g,'').length>=10}))return;finish($('#n-name').value.trim().split(' ')[0],{where:picked(f,'where')})});
$('#f-care').addEventListener('submit',function(e){e.preventDefault();if(!need($('#c-name'),function(v){return v.trim().length>0}))return;if(!need($('#c-email'),emailOk))return;finish($('#c-name').value.trim(),{sms:$('#c-sms').checked})});

function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function slotsHtml(kind){
  var out=[],d=new Date(),n=0;
  while(out.length<6&&n<14){d.setDate(d.getDate()+1);n++;var wd=d.getDay();if(wd===0)continue;var day=d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});var times=kind==='tour'?['10:00 AM','2:00 PM']:['9:30 AM','4:00 PM'];out.push([day,times[out.length%2]])}
  return '<div class="fm-slots" role="group" aria-label="Times">'+out.map(function(s,i){return '<button type="button" class="fm-slot" aria-pressed="false" data-slot="'+esc(s[0]+' at '+s[1])+'">'+s[0]+'<small>'+s[1]+'</small></button>'}).join('')+'</div><div class="fm-booked" aria-live="polite"></div>';
}
function finish(name,extra){
  var c=COPY[state.aud];state.data=Object.assign(state.data,extra||{});
  $('#doneH').textContent=c.doneH(name);$('#doneP').textContent=c.doneP;
  var next='';
  if(state.aud==='plan'){
    next='<div class="fm-box" data-note="book"><h2>Talk it through, if you\'d like</h2><p>A 20-minute call with a planner. Optional, and easy to move.</p>'+slotsHtml('call')+'<button type="button" class="fm-why" data-why="book">Why offer a call now?</button></div>'+
    '<div class="fm-box" data-note="timeline"><h2>What you\'ll get from us</h2><p>Nothing more than this, and you can stop it any time.</p><ol class="fm-tl"><li><b>NOW</b>The guide and price list</li><li><b>DAY 2</b>Questions families ask us</li><li><b>DAY 5</b>A call offer, if you haven\'t booked</li><li><b>DAY 14</b>A worksheet to share with family</li><li><b>DAY 30</b>A note from your planner</li></ol></div>'+
    '<div class="fm-box" data-note="family" style="grid-column:1/-1"><h2>Bring your family in</h2><p>Planning goes better when the people who will carry it out have seen it. Send them the same guide.</p><div class="fm-share"><input class="fm-inp" readonly value="lanternhill.example/guide?from='+esc(name.toLowerCase())+'" aria-label="Link to share"><button type="button" id="copyBtn">Copy link</button></div><button type="button" class="fm-why" data-why="family">Why no reward for sharing?</button></div>';
  }else if(state.aud==='need'){
    var w=state.data.where;
    next='<div class="fm-box" data-note="hour"><h2>While you wait</h2><p>A few things that help in the first hour.</p><ul class="fm-check">'+
      (w==='home'?'<li>If the death was unexpected, call 911 first.</li><li>If your loved one was in hospice care, call the hospice nurse; they will guide the next step.</li>':'<li>The hospital or care home staff will keep your loved one in their care until we arrive.</li>')+
      '<li>You do not need to choose anything before we talk.</li><li>If you can, find any written wishes or a pre-paid plan.</li>'+(state.vet?'<li>If they served, look for discharge papers (DD-214); we can request them if not.</li>':'')+'</ul></div>'+
      '<div class="fm-box" data-note="needpipe"><h2>What we just did</h2><ol class="fm-tl"><li><b>0:00</b>Paged the on-call director with your name and number</li><li><b>0:10</b>A backup director is alerted if no call is logged</li><li><b>LATER</b>Prices in writing at your meeting, never by pressure</li></ol><button type="button" class="fm-why" data-why="needpipe">What is happening in the CRM?</button></div>';
  }else{
    next='<div class="fm-box" data-note="tour"><h2>Pick a tour time</h2><p>'+esc(state.data.fit?'Suggested start: '+state.data.fit+'. ':'')+'About an hour, with lunch if you\'d like.</p>'+slotsHtml('tour')+'</div>'+
    '<div class="fm-box"><h2>Before you visit</h2><ul class="fm-check"><li>A list of their current medications</li><li>Questions about cost and what is included</li><li>Bring them, if they are up for it</li></ul></div>';
  }
  $('#next').innerHTML=next;
  body.classList.add('fm-done');window.scrollTo({top:0,behavior:'auto'});$('#done').focus({preventScroll:true});
  $$('#next .fm-slot').forEach(function(b){b.addEventListener('click',function(){$$('#next .fm-slot').forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});var bk=b.closest('.fm-box').querySelector('.fm-booked');bk.textContent='Booked for '+b.dataset.slot+'. A confirmation is on its way. (Demo: nothing was booked.)';bk.classList.add('fm-on');track('booked',state.aud)})});
  var cb=$('#copyBtn');if(cb)cb.addEventListener('click',function(){var i=cb.previousElementSibling;i.select();try{navigator.clipboard.writeText(i.value)}catch(e){}cb.textContent='Copied'});
  bindWhy();track('submitted',state.aud);if(state.cm)showNote(currentKey());
}
var restart=function(keep){body.classList.remove('fm-done');$$('form').forEach(function(f){f.reset();if(f._go)f._go(1);$$('.fm-chip-btn',f).forEach(function(b){b.setAttribute('aria-pressed','false')});$$('.fm-field',f).forEach(function(x){x.classList.remove('fm-bad')})});$('#fit').classList.remove('fm-on');state.data={};if(!keep)window.scrollTo({top:0,behavior:'smooth'})};

/* tabs (roving tabindex, arrow keys) */
var tabs=$$('.fm-tab');
function selTab(t){tabs.forEach(function(x){var on=x===t;x.setAttribute('aria-selected',String(on));x.tabIndex=on?0:-1;var p=$('#'+x.getAttribute('aria-controls'));p.classList.toggle('fm-on',on);p.setAttribute('aria-hidden',String(!on))});if(state.cm)showNote('btf-'+t.id.slice(2))}
tabs.forEach(function(t,i){t.addEventListener('click',function(){selTab(t)});t.addEventListener('keydown',function(e){var k=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(k){e.preventDefault();var n=tabs[(i+k+tabs.length)%tabs.length];n.focus();selTab(n)}})});

/* ---------- Nathan's commentary ---------- */
var NOTES={
  hero:['Three doors, one page','Families arrive in three very different states: calmly planning, in crisis, or worried about a parent. One generic headline fails all three, so the visitor picks a door and the whole page (headline, form, steps, follow-up) changes with it. In the ads, each ad set links straight to its door.'],
  ab:['The A/B test','Variant A leads with relief for the family; B leads with the person\'s own wishes. The test runs per door, on booked calls and tours, not on clicks or form starts, and needs a few hundred leads per arm before anyone calls a winner.'],
  trust:['Trust before the ask','Three promises that answer the three fears: hidden prices, a pushy salesperson, and being rushed. Each one must be true for the client before it goes on the page.'],
  vet:['Veteran mode','Veteran families qualify for VA burial benefits many don\'t know about. The toggle adds the benefits note, a "did they serve?" question and a DD-214 reminder, and tags the CRM contact so a director who knows the paperwork takes the call.'],
  card:['A sticky intake card','The form stays in view while people read. Each door gets its own length: three short steps for planning, one screen for help now, a care-fit check before contact details for senior care.'],
  email:['Email first, one field','The first step asks for one thing. Name and preferences come after the visitor has started, which is when completion is highest. If they leave after step one, the guide still goes out, and the CRM knows exactly where they stopped.'],
  consent:['Unticked, on purpose','Texting needs the person\'s express written consent, so the box starts unticked and is never required to get the guide. The CRM stores the consent with a timestamp, and a reply of STOP ends texting at once.'],
  need:['No funnel for grief','A family in crisis gets a phone number first and a three-field callback. No email gate, no countdown, no upsell. The CRM pages the on-call director instantly and escalates after ten minutes. Speed and kindness here are the whole marketing.'],
  call:['The call button is the hero','On phones this is a tap to call. Most at-need families call rather than fill a form, so the number is the biggest thing on the card.'],
  fit:['Care-fit before contact','Asking where Mom needs a hand earns the right to ask for an email, and the answer is useful: it suggests a level of care, sends the right brochure, and routes the lead to the right care guide.'],
  how:['What happens next, said plainly','Fear of the unknown is the biggest reason people stall. Three steps per door, written for that door.'],
  prices:['Prices on a lead page','In California, a funeral home website must post its price list goods and services from the homepage. It also converts: families who have seen prices are calling to choose, not to shop.'],
  book:['The call offer on the thank-you page','The moment after a sign-up is when intent is highest. Offering an optional call here books more conversations than any later email, and nobody is pushed: skipping it is one click.'],
  timeline:['Show the follow-up','Telling people exactly what will arrive, and that they can stop it, lowers unsubscribes and spam complaints. It is the same five-touch sequence the CRM runs.'],
  family:['Referrals without rewards','Bribing sharing feels wrong in this category. Instead the family link is framed as part of good planning: the people who will carry it out should see it. Shared links carry a referral tag, so the CRM still counts every family introduction.'],
  hour:['Useful, not salesy','The confirmation gives real first-hour guidance for where their loved one is. This is the screen families remember.'],
  needpipe:['Behind the callback','The submission becomes an at-need opportunity, pages the director by text and app, starts a ten-minute escalation timer, and suppresses this family from every marketing list for twelve months.'],
  tour:['Optimised to tours','The care door is measured on tours booked, because a tour is the step that predicts a move-in. Slots come from the community\'s calendar, and a reminder goes out the day before.'],
  kit:['A toolkit, not a brochure','Ten tools, each answering a question families really ask. Every interaction is an event: which tools a visitor used tells the CRM what they care about (price, insurance, veterans, estate) before anyone calls them. The "for you" marks change with the door, so each ad set can deep-link to the tool that fits.'],
  cost:['The cost builder','Price is the first question and the reason most people never call. Showing national medians line by line, and letting people remove what they would not want, builds trust and qualifies the lead: someone who unticks the casket and vault is a cremation lead.'],
  time:['Honest urgency','No countdown clocks. The reason to plan now is real (prices rise), so the page shows it with the visitor\'s own assumption and says plainly that a locked price only counts if the contract guarantees it. The monthly figure answers "can I afford this?", the question behind a pay-over-time plan.'],
  pay:['The ways-to-pay matcher','Pre-need insurance, final expense, trusts, savings: most families cannot tell them apart. Ranking them by what the visitor cares about is useful on its own, and the choices tell the planner which product conversation to have.'],
  cover:['Coverage estimator','The insurance-funded path needs a number. Sample rates are labeled as samples, sourced and dated, with the two-year waiting period stated, because an insurance page that hides it loses trust and breaks rules.'],
  benefits:['Benefits finder','Veteran families leave real money and honors on the table. Two taps show what may apply, and answering "served" tags the contact for a planner who knows VA paperwork.'],
  estate:['The estate check','The natural next product after a funeral plan. Three in four adults have no will. The probate calculator turns an abstract task into a dollar figure from the statute, which is what gets people to book.'],
  wishes:['The wishes builder','The engagement hook, like the quiz in a consumer funnel. People finish it because it is about them, it produces something worth keeping, and in a live funnel "save it" is where the email is asked for. Every answer maps to a CRM field the planner sees before the call.'],
  trend:['Lead with cremation','More than six in ten deaths now end in cremation, rising toward eight in ten. The plans, ad creative and price list should be built around that, not treat cremation as the cheap option.'],
  days:['The first 30 days','Content for the worst week. It answers the questions families search for, earns links and search traffic, and is the page they remember when it is time to plan their own.'],
  carecost:['Care costs','For the senior care door. Families want the number before the tour, and hiding it only sends them to a directory site that shows it.'],
  'btf-map':['The funnel map','Three entry sources feed three doors, three pipelines and three outcomes, and all of them end in reviews and family referrals. Ads only ever point at the planning and care doors.'],
  'btf-ads':['Meta ad sets','Broad targeting by location and age, website conversion goals so every lead sees the price list, and a 30-day retargeting set that excludes anyone at-need or already booked.'],
  'btf-crm':['GoHighLevel pipelines','One opportunity per family, every page answer mapped to a custom field, and stages that match how the business really works, so the pipeline view doubles as the team\'s to-do list.'],
  'btf-auto':['Automations with exits','Every sequence stops on a booking, a reply, an opt-out or a death in the family. The at-need workflow sends no marketing at all.'],
  'btf-rep':['Reporting','Cost is tracked to booked calls and tours, not clicks. The owner gets one page on Monday with one recommended change.']
};
var ORDER=['hero','trust','card','email','consent','vet','ab','how','kit','cost','time','pay','cover','benefits','estate','wishes','trend','days','carecost','prices','btf-map','btf-ads','btf-crm','btf-auto','btf-rep'];
var curKey='hero',spotEl=null;
function currentKey(){
  if(body.classList.contains('fm-done')) return state.aud==='plan'?'book':state.aud==='need'?'hour':'tour';
  if(state.aud==='need') return 'need';
  var f=$('#f-'+state.aud),at=f?+f.dataset.at:1;
  if(state.aud==='care') return at===2?'fit':'card';
  return at===1?'email':at===3?'consent':'card';
}
function showNote(k){
  var n=NOTES[k];if(!n)return;curKey=k;
  $('#nbody').innerHTML='<h3>'+n[0]+'</h3><p>'+n[1]+'</p>';
  $('#nbub').classList.add('fm-show');
  if(spotEl)spotEl.classList.remove('fm-spot');
  spotEl=$('[data-note="'+k+'"]')||(k.indexOf('btf')===0?$('#behind .fm-panes'):null);
  if(spotEl)spotEl.classList.add('fm-spot');
}
function hideNote(){$('#nbub').classList.remove('fm-show');if(spotEl){spotEl.classList.remove('fm-spot');spotEl=null}}
$('#nchip').addEventListener('click',function(){$('#nbub').classList.contains('fm-show')?hideNote():showNote(curKey)});
$('#nx').addEventListener('click',hideNote);
function step(d){var i=ORDER.indexOf(curKey);var k=ORDER[(i<0?0:i+d+ORDER.length)%ORDER.length];showNote(k);var el=$('[data-note="'+k+'"]')||(k.indexOf('btf')===0?$('#behind'):null);if(k.indexOf('btf')===0){var t=$('#t-'+k.slice(4));if(t)selTab(t)}if(el)el.scrollIntoView({behavior:'smooth',block:'center'})}
$('#nprev').addEventListener('click',function(){step(-1)});$('#nnext').addEventListener('click',function(){step(1)});
function bindWhy(){$$('.fm-why').forEach(function(b){if(b._b)return;b._b=1;b.addEventListener('click',function(){showNote(b.dataset.why)})})}
bindWhy();

/* ================= planning toolkit ================= */
var usd=function(n){return '$'+Math.round(n).toLocaleString('en-US')};
var NS='http://www.w3.org/2000/svg';
function count(el,to,fmt){fmt=fmt||usd;var from=+(el.dataset.v||0),t0=performance.now(),d=reduceMotion?0:500;el.dataset.v=to;(function f(t){var k=d?Math.min(1,(t-t0)/d):1;k=1-Math.pow(1-k,3);el.textContent=fmt(from+(to-from)*k);if(k<1)requestAnimationFrame(f)})(t0)}
var reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
function pressGroup(g,multi,cb){$$('button',g).forEach(function(b){b.addEventListener('click',function(){if(multi){b.setAttribute('aria-pressed',String(b.getAttribute('aria-pressed')!=='true'))}else{$$('button',g).forEach(function(x){x.setAttribute('aria-pressed',String(x===b))})}cb(b)})})}

/* toolkit index: mark tools for the current door */
function markKit(){$$('.fm-kit-idx a').forEach(function(a){a.classList.toggle('fm-mine',(a.dataset.for||'').split(' ').indexOf(state.aud)>-1)})}

/* 1. cost builder */
var ITEMS=[['Basic services fee',2459,'#1C1F22'],['Transfer to the funeral home',395,'#2A2D31'],['Embalming',845,'#3A3E43'],['Other preparation',295,'#55595F'],['Viewing: facilities and staff',475,'#6A6F75'],['Ceremony: facilities and staff',550,'#8A8F95'],['Hearse',375,'#C2185B'],['Service car or van',175,'#E0609B'],['Printed materials',195,'#FF4F9A'],['Metal casket',2500,'#FFB8D6'],['Burial vault',1695,'#FFD3E6']];
var costTotal=9995;
(function(){
  var ul=$('#costItems');
  ul.innerHTML=ITEMS.map(function(it,i){return '<li><label><input type="checkbox" checked data-i="'+i+'"><i style="background:'+it[2]+'"></i>'+it[0]+'<em>'+usd(it[1])+'</em></label></li>'}).join('');
  var svg=$('#costStack'),max=10500,W=600;
  var segs=ITEMS.map(function(it){var r=document.createElementNS(NS,'rect');r.setAttribute('class','fm-cseg');r.setAttribute('y','34');r.setAttribute('height','30');r.setAttribute('rx','3');r.setAttribute('fill',it[2]);svg.appendChild(r);return r});
  [[6280,'Median with cremation'],[8300,'Median with burial'],[9995,'Burial with vault']].forEach(function(m,i){var x=m[0]/max*W;var l=document.createElementNS(NS,'g');l.innerHTML='<path d="M'+x+' 26V'+(80+i*16)+'" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 3" opacity=".5"/><text x="'+(x-6)+'" y="'+(92+i*16)+'" text-anchor="end" font-size="12" fill="var(--muted)">'+m[1]+' <tspan font-weight="700" fill="currentColor">'+usd(m[0])+'</tspan></text>';svg.appendChild(l)});
  var you=document.createElementNS(NS,'g');you.innerHTML='<path id="youTick" d="M0 18V30" stroke="var(--brass)" stroke-width="3" stroke-linecap="round"/><text id="youTxt" x="0" y="13" text-anchor="middle" font-size="12.5" font-weight="800" fill="var(--brass)">You</text>';svg.appendChild(you);
  function draw(){var x=0;$$('input',ul).forEach(function(c,i){var w=c.checked?ITEMS[i][1]/max*W:0;segs[i].setAttribute('x',x);segs[i].setAttribute('width',w);x+=w});costTotal=$$('input',ul).reduce(function(s,c,i){return s+(c.checked?ITEMS[i][1]:0)},0);count($('#costTotal'),costTotal);$('#youTick').setAttribute('d','M'+x+' 18V30');$('#youTxt').setAttribute('x',Math.max(14,Math.min(586,x)));drawTime();drawCover();track('tool','cost')}
  ul.addEventListener('change',draw);draw();
})();

/* 2. price over time */
function drawTime(){
  var y=+$('#yrs').value,r=+$('#rise').value/100,base=costTotal||1;
  $('#yrsV').textContent=y;$('#yrsV2').textContent=y;$('#riseV').textContent=$('#rise').value+'%';$('#timeBase').textContent=usd(base);
  var fut=base*Math.pow(1+r,y);count($('#future'),fut);
  var W=600,H=220,pad=34,maxV=Math.max(base*1.6,fut*1.18),pts=[];
  for(var i=0;i<=y;i++){var v=base*Math.pow(1+r,i);pts.push([pad+(i/30)*(W-pad-10),H-26-(v/maxV)*(H-50)])}
  var d='M'+pts.map(function(p){return p[0].toFixed(1)+' '+p[1].toFixed(1)}).join(' L');
  var last=pts[pts.length-1],flatY=H-26-(base/maxV)*(H-50);
  $('#timeChart').innerHTML='<line x1="'+pad+'" y1="'+(H-26)+'" x2="'+(W-10)+'" y2="'+(H-26)+'" stroke="var(--line-hi)"/>'+
    [0,10,20,30].map(function(t){var x=pad+(t/30)*(W-pad-10);return '<text x="'+x+'" y="'+(H-8)+'" font-size="11" text-anchor="'+(t===30?'end':t?'middle':'start')+'" fill="var(--muted)">'+(t?'+'+t+' yrs':'today')+'</text>'}).join('')+
    '<line x1="'+pad+'" y1="'+flatY+'" x2="'+last[0]+'" y2="'+flatY+'" stroke="var(--green-2)" stroke-width="2.5" stroke-dasharray="6 6"/><text x="'+(pad+6)+'" y="'+(flatY+18)+'" font-size="12" font-weight="700" fill="var(--green-2)">Planned today, if the price is guaranteed</text>'+
    '<path d="'+d+' L'+last[0]+' '+(H-26)+' L'+pad+' '+(H-26)+'Z" fill="var(--brass)" opacity=".12"/><path class="fm-ln" d="'+d+'" fill="none" stroke="var(--brass)" stroke-width="3" stroke-linecap="round"/>'+
    '<circle cx="'+last[0]+'" cy="'+last[1]+'" r="6" fill="var(--brass)"/><text x="'+Math.min(last[0],W-70)+'" y="'+(last[1]-12)+'" font-size="13" font-weight="800" text-anchor="middle" fill="currentColor">'+usd(fut)+'</text>';
  var py=+($('#planYrs [aria-pressed="true"]')||{dataset:{y:3}}).dataset.y;count($('#monthly'),base/(py*12),function(n){return usd(n)+'/mo'});
}
['#yrs','#rise'].forEach(function(s){$(s).addEventListener('input',function(){drawTime();track('tool','time')})});
pressGroup($('#planYrs'),false,function(){drawTime()});

/* 3. ways to pay */
var OPTS=[
  {n:'Pre-need insurance',d:'Pays the provider in your plan. Usually locks the price; paid in full or over time.',a:{lock:2,flex:0,nohealth:1,monthly:2,anywhere:1}},
  {n:'Final expense life insurance',d:'Cash to a beneficiary for any bill. No price lock; many have a two-year waiting period.',a:{lock:0,flex:2,nohealth:1,monthly:2,anywhere:2}},
  {n:'Pre-need trust',d:'Money held in trust for the contract. In California, cancel for a refund with interest, less up to 10% kept from interest.',a:{lock:1,flex:0,nohealth:2,monthly:1,anywhere:1}},
  {n:'Payable-on-death savings',d:'Your own account, paid to a named person. Flexible, but the price is not guaranteed.',a:{lock:0,flex:2,nohealth:2,monthly:2,anywhere:2}},
  {n:'Pay at the time',d:'The family pays from savings or the estate, at that day\'s prices.',a:{lock:0,flex:2,nohealth:2,monthly:0,anywhere:2}}
];
function rankPay(){
  var ks=$$('#wants [aria-pressed="true"]').map(function(b){return b.dataset.k});var mx=Math.max(1,ks.length*2);
  var ul=$('#opts');if(!ul.children.length){ul.innerHTML=OPTS.map(function(o,i){return '<li class="fm-opt-row" data-i="'+i+'"><div><b>'+o.n+'</b><small>'+o.d+'</small></div><div><div class="fm-meter"><i></i></div><div class="fm-sc"></div></div></li>'}).join('')}
  var rows=$$('.fm-opt-row',ul),before={};rows.forEach(function(r){before[r.dataset.i]=r.getBoundingClientRect().top});
  var sc=OPTS.map(function(o,i){return {i:i,s:ks.reduce(function(t,k){return t+o.a[k]},0)}}).sort(function(a,b){return b.s-a.s||a.i-b.i});
  sc.forEach(function(x,pos){var el=ul.querySelector('[data-i="'+x.i+'"]');ul.appendChild(el);el.classList.toggle('fm-top',pos===0&&x.s>0);$('i',el).style.width=(x.s/mx*100)+'%';$('.fm-sc',el).textContent=ks.length?x.s+' of '+mx:''});
  if(!reduceMotion)$$('.fm-opt-row',ul).forEach(function(el){var d=before[el.dataset.i]-el.getBoundingClientRect().top;if(!d)return;el.style.transition='none';el.style.transform='translateY('+d+'px)';requestAnimationFrame(function(){requestAnimationFrame(function(){el.style.transition='';el.style.transform=''})})});
  track('tool','pay');
}
pressGroup($('#wants'),true,rankPay);

/* 4. coverage */
var RATES={m:{50:[40,60,79],60:[57,85,113],70:[87,130,172],80:[157,235,313]},f:{50:[30,45,60],60:[43,64,84],70:[64,95,127],80:[127,190,253]}};
function drawCover(){
  if(typeof RATES==='undefined'||!RATES)return;
  var bills=+$('#bills').value,saved=+$('#saved').value,ss=$('[data-b="ss"]').getAttribute('aria-pressed')==='true'?255:0,va=$('[data-b="va"]').getAttribute('aria-pressed')==='true'?2004:0;
  $('#billsV').textContent=usd(bills);$('#savedV').textContent=usd(saved);
  var need=Math.max(0,Math.ceil((costTotal+bills-saved-ss-va)/1000)*1000);
  count($('#covNum'),need);$('#covArc').setAttribute('stroke-dashoffset',(439.8*(1-Math.min(1,need/25000))).toFixed(1));
  var tier=need<=10000?0:need<=15000?1:2,amt=[10000,15000,20000][tier],r=RATES[$('#sex').value][$('#age').value][tier];
  $('#prem').innerHTML=need>25000?'<b>Above 25,000</b><br><span class="fm-cap2">Most final expense policies stop around 25,000. A licensed agent would look at other options.</span>':need===0?'<b>No gap</b><br><span class="fm-cap2">Savings and benefits cover this plan. A pre-need contract could still lock the price.</span>':'<span class="fm-cap2">Sample for a '+usd(amt).replace('$','')+'-dollar guaranteed-issue policy</span><br><b>about '+usd(r)+' a month</b> <span class="fm-cap2">· not a quote</span>';
}
['#bills','#saved'].forEach(function(s){$(s).addEventListener('input',drawCover)});['#age','#sex'].forEach(function(s){$(s).addEventListener('change',drawCover)});
$$('.fm-chk .fm-chip-btn').forEach(function(b){b.addEventListener('click',function(){b.setAttribute('aria-pressed',String(b.getAttribute('aria-pressed')!=='true'));drawCover();track('tool','cover')})});

/* 5. benefits */
function drawBen(){
  var vet=$('[data-q="vet"]').getAttribute('aria-pressed')==='true',sp=$('[data-q="spouse"]').getAttribute('aria-pressed')==='true',L=[],cash=0;
  if(vet){L.push(['i-flag','Burial in a VA national cemetery','Grave site where space is available, opening and closing, perpetual care','No cost']);L.push(['i-shield','Headstone, marker or medallion','Also for private cemeteries','Free']);L.push(['i-flag','Burial flag and Presidential Memorial Certificate','Honoring their service','Free']);L.push(['i-coins','VA burial and plot allowance','Non-service-connected death on or after Oct 1, 2025','$2,004']);cash+=2004}
  if(sp){L.push(['i-coins','Social Security lump-sum payment','To a spouse who lived with them','$255']);cash+=255}
  if(!vet&&!sp){L.push(['i-heart','Fewer automatic benefits','A child who receives benefits on their record may still get the Social Security payment. A plan matters more here.','Varies'])}
  $('#benList').innerHTML=L.map(function(x){return '<li><svg aria-hidden="true"><use href="#'+x[0]+'"/></svg><div><b>'+x[1]+'</b><span>'+x[2]+'</span></div><em>'+x[3]+'</em></li>'}).join('');
  $('#benTotal').textContent=usd(cash)+' in cash benefits';track('tool','benefits');
}
pressGroup($('#benQ'),true,drawBen);

/* 6. estate */
function fee(v){var t=[[100000,.04],[100000,.03],[800000,.02],[9000000,.01],[15000000,.005]],f=0,left=v;for(var i=0;i<t.length&&left>0;i++){var p=Math.min(left,t[i][0]);f+=p*t[i][1];left-=p}return f}
function drawEst(){
  var n=$$('#estList input:checked').length;$('#estNum').textContent=n+'/7';$('#estArc').setAttribute('stroke-dashoffset',(439.8*(1-n/7)).toFixed(1));
  var v=+$('#estate').value,f=fee(v),small=v<=208850;$('#estateV').textContent=usd(v);
  var trust=$$('#estList input')[1].checked;
  $('#attV').textContent=small?'none':usd(f);$('#exeV').textContent=small?'none':usd(f);
  var w=small?0:Math.min(50,f/40000*50);$('#pAtt').style.width=w+'%';$('#pExe').style.width=w+'%';
  $('#pMsg').innerHTML=small?'Under 208,850 dollars, heirs may use the small estate affidavit instead of probate.':trust?'Assets in a funded living trust usually skip probate, so these fees may not apply to them.':'Without a trust, probate in California could cost about <b>'+usd(f*2)+'</b> in statutory attorney and executor fees, plus court costs.';
  track('tool','estate');
}
$('#estList').addEventListener('change',drawEst);$('#estate').addEventListener('input',drawEst);

/* 7. wishes */
function drawWish(){
  var g=function(k){return $$('[data-w="'+k+'"] [aria-pressed="true"]').map(function(b){return b.dataset.v})};
  var set=function(id,v,ph){var el=$(id);el.textContent=v||ph;el.classList.toggle('fm-empty',!v)};
  var nm=$('#wName').value.trim();$('#kName').textContent=nm?nm+'\'s wishes':'My wishes';
  set('#kDisp',g('disp').join(', '),'Not chosen yet');set('#kSvc',g('svc').join(', '),'Not chosen yet');set('#kFeel',g('feel').join(', '),'Not chosen yet');
  set('#kSong',$('#wSong').value.trim(),'Nothing chosen');set('#kWho',$('#wWho').value.trim(),'Someone I trust');
}
$$('[data-w]').forEach(function(g){pressGroup(g,g.hasAttribute('data-multi'),function(){drawWish();track('tool','wishes')})});
['#wName','#wSong','#wWho'].forEach(function(s){$(s).addEventListener('input',drawWish)});
$('#kDate').textContent=new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
$('#kPrint').addEventListener('click',function(){window.print()});
$('#kCopy').addEventListener('click',function(){var t=$('#kName').textContent+'\n'+$$('#keep dl div').map(function(d){return $('dt',d).textContent+': '+$('dd',d).textContent}).join('\n');try{navigator.clipboard.writeText(t)}catch(e){}this.textContent='Copied'});

/* 8. trend */
(function(){
  var svg=$('#trendSvg'),D={2025:[63.4,31.6],2045:[82.3,null]};
  svg.innerHTML='<line x1="40" y1="250" x2="580" y2="250" stroke="var(--line-hi)"/>'+[0,25,50,75,100].map(function(p){var y=250-p*2.1;return '<text x="30" y="'+(y+4)+'" text-anchor="end" font-size="11" fill="var(--muted)">'+p+'%</text><line x1="40" y1="'+y+'" x2="580" y2="'+y+'" stroke="var(--line)" stroke-dasharray="2 6"/>'}).join('')+
    '<rect class="fm-bar" id="tbC" x="110" width="150" rx="10" fill="var(--brass)"/><rect class="fm-bar" id="tbB" x="340" width="150" rx="10" fill="var(--green-2)"/>'+
    '<text id="tlC" x="185" text-anchor="middle" font-family="Geist, ui-sans-serif, system-ui, sans-serif" font-size="30" font-weight="600" fill="currentColor"></text><text id="tlB" x="415" text-anchor="middle" font-family="Geist, ui-sans-serif, system-ui, sans-serif" font-size="30" font-weight="600" fill="currentColor"></text>'+
    '<text x="185" y="276" text-anchor="middle" font-size="14" font-weight="700" fill="currentColor">Cremation</text><text x="415" y="276" text-anchor="middle" font-size="14" font-weight="700" fill="currentColor">Burial</text>';
  function set(y){var v=D[y];[['C',v[0]],['B',v[1]]].forEach(function(p){var h=(p[1]||0)*2.1;var r=$('#tb'+p[0]);r.setAttribute('y',250-h);r.setAttribute('height',h);var t=$('#tl'+p[0]);t.setAttribute('y',250-h-10);t.textContent=p[1]==null?'':p[1]+'%';});$('#tbB').style.opacity=v[1]==null?.15:1;
    var note=$('#trendNote');if(!note){note=document.createElementNS(NS,'text');note.id='trendNote';note.setAttribute('x','415');note.setAttribute('y','230');note.setAttribute('text-anchor','middle');note.setAttribute('font-size','12');note.setAttribute('fill','var(--muted)');svg.appendChild(note)}note.textContent=v[1]==null?'No burial projection published':'';}
  set(2025);pressGroup($('#trendYr'),false,function(b){set(b.dataset.y);track('tool','trend')});
})();

/* 9. days */
pressGroup($('.fm-days-tabs'),false,function(b){$$('.fm-days-tabs button').forEach(function(x){x.setAttribute('aria-selected',String(x===b))});$$('.fm-days-pane').forEach(function(p){p.classList.toggle('fm-on',p.dataset.d===b.dataset.d)});track('tool','days')});

/* 10. care costs */
(function(){
  var C=[['Adult day care',26000],['Assisted living',70800],['Homemaker services',75504],['Home health aide',77792],['Nursing home, shared room',111325],['Nursing home, private room',127750]];
  var svg=$('#ccSvg');svg.innerHTML=C.map(function(c,i){var y=14+i*52;return '<text x="0" y="'+(y+14)+'" font-size="14" font-weight="700" fill="currentColor">'+c[0]+'</text><rect x="0" y="'+(y+22)+'" width="600" height="16" rx="8" fill="var(--line)"/><rect class="fm-b" data-i="'+i+'" x="0" y="'+(y+22)+'" height="16" rx="8" width="0" fill="'+(i>3?'var(--green-2)':'var(--brass)')+'"/><text class="fm-v" data-i="'+i+'" x="600" y="'+(y+14)+'" text-anchor="end" font-size="14" font-family="ui-monospace,Menlo,monospace" fill="var(--muted)"></text>'}).join('');
  function set(p){C.forEach(function(c,i){var v=p==='m'?c[1]/12:c[1];$('rect.fm-b[data-i="'+i+'"]',svg).setAttribute('width',(c[1]/127750*600).toFixed(1));$('text.fm-v[data-i="'+i+'"]',svg).textContent=usd(v)+(p==='m'?'/mo':'/yr')})}
  set('m');pressGroup($('#ccPer'),false,function(b){set(b.dataset.p);track('tool','care')});
})();

/* veteran mode reaches the toolkit */
function kitVet(){$$('.fm-vet-only').forEach(function(b){b.hidden=!state.vet});var q=$('[data-q="vet"]');if(state.vet&&q.getAttribute('aria-pressed')!=='true'){q.setAttribute('aria-pressed','true');drawBen()}}
drawCover();rankPay();drawBen();drawEst();drawWish();markKit();

/* events: one per step, here only logged to the console (demo) */
function track(ev,v){try{if(window.console&&console.debug)console.debug('[funnel]',ev,v||'')}catch(e){}}

$('.fm-cm-btn').addEventListener('click',toggleCm);$$('.fm-cm-panel a').forEach(function(a){a.addEventListener('click',closeCm)});$$('.fm-brand,.fm-restart').forEach(function(b){b.addEventListener('click',function(){restart()})});
/* deep links: ?door=need&vet=1&ab=b&notes=1 */
try{var q=new URLSearchParams(location.search);if(COPY[q.get('door')])state.aud=q.get('door');if(q.get('ab')==='b'){$('#abSw').click()}if(q.get('vet')==='1'){$('#vetSw').click()}if(q.get('notes')==='1'){$('#cmSw').click()}if(q.get('look')==='evening'){$('[data-theme-btn="evening"]').click()}}catch(e){}
render();
})();
