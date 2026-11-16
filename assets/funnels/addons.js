/* GoHighLevel add-ons picker: tap to add, filter dims (never hides) so nothing jumps, copy the list. */
(function(){
  var grid=document.getElementById('aoGrid');if(!grid)return;
  var I={
    card:'<rect x="4" y="9" width="32" height="22" rx="4"/><path d="M4 16h32"/><path class="fm-ao-m" d="M10 25h8"/>',
    star:'<path class="fm-ao-m" d="M20 6l4 8.6 9.4.9-7 6.3 2 9.2L20 26.2 11.6 31l2-9.2-7-6.3 9.4-.9z"/>',
    pin:'<path d="M20 35s-11-10-11-18a11 11 0 0 1 22 0c0 8-11 18-11 18z"/><circle class="fm-ao-m" cx="20" cy="17" r="4"/>',
    phone:'<path d="M12 5h6l2 8-4 2a18 18 0 0 0 9 9l2-4 8 2v6c0 2-2 4-4 4C18 32 8 22 8 9c0-2 2-4 4-4z"/><path class="fm-ao-m" d="M26 6a9 9 0 0 1 8 8"/>',
    chat:'<path d="M6 9h28v18H16l-7 6v-6H6z"/><path class="fm-ao-m" d="M12 16h16M12 21h10"/>',
    mail:'<rect x="5" y="9" width="30" height="22" rx="3"/><path class="fm-ao-m" d="M6 11l14 11 14-11"/>',
    mega:'<path d="M6 16v8h6l14 8V8L12 16z"/><path class="fm-ao-m" d="M30 14a8 8 0 0 1 0 12"/>',
    search:'<circle cx="17" cy="17" r="10"/><path class="fm-ao-m" d="M25 25l9 9"/>',
    film:'<rect x="6" y="6" width="28" height="28" rx="5"/><path class="fm-ao-m" d="M17 14l10 6-10 6z"/>',
    cal:'<rect x="5" y="8" width="30" height="26" rx="4"/><path d="M5 15h30M12 4v8M28 4v8"/><path class="fm-ao-m" d="M14 24l4 4 8-8"/>',
    video:'<rect x="4" y="11" width="22" height="18" rx="4"/><path class="fm-ao-m" d="M26 18l10-6v16l-10-6z"/>',
    book:'<path d="M6 8h11a4 4 0 0 1 4 4v22a3 3 0 0 0-3-3H6zM34 8H24a4 4 0 0 0-3 4"/><path class="fm-ao-m" d="M26 18h6M26 23h6"/>',
    bolt:'<path class="fm-ao-m" d="M22 4L8 23h11l-2 13 15-20H21z"/>',
    bell:'<path d="M10 28V18a10 10 0 0 1 20 0v10l3 3H7z"/><path class="fm-ao-m" d="M17 34a3 3 0 0 0 6 0"/>',
    spark:'<path class="fm-ao-m" d="M20 5l3 9 9 3-9 3-3 9-3-9-9-3 9-3z"/><path d="M31 27l1.5 4 4 1.5-4 1.5L31 38l-1.5-4-4-1.5 4-1.5z"/>',
    bot:'<rect x="8" y="12" width="24" height="20" rx="6"/><path d="M20 6v6"/><circle class="fm-ao-m" cx="15" cy="21" r="2"/><circle class="fm-ao-m" cx="25" cy="21" r="2"/><path d="M15 27h10"/>',
    globe:'<circle cx="20" cy="20" r="14"/><path d="M6 20h28"/><path class="fm-ao-m" d="M20 6c5 5 5 23 0 28M20 6c-5 5-5 23 0 28"/>',
    bag:'<path d="M8 13h24l-2 21H10z"/><path class="fm-ao-m" d="M15 13a5 5 0 0 1 10 0"/>'
  };
  /* id, name, category, how it joins (in = built in, link = connects, prem = premium action), icon, use for a funeral home or care community */
  var A=[
    ['stripe','Stripe','pay','link','card','Deposits and monthly payment plans on a pre-need contract, tracked on the opportunity.'],
    ['paypal','PayPal and Square','pay','link','card','A second way to pay for families who don\'t want to enter a card.'],
    ['gbp','Google Business Profile','rep','link','pin','Reviews, the Maps listing and messages from Maps, answered from one inbox.'],
    ['reviews','Review requests','rep','in','star','The same review link to every family at day 45, so the ask is fair and Google allows it.'],
    ['yext','Yext listings','rep','link','search','One fix for the home\'s name, hours and phone across listing sites.'],
    ['lcphone','LC Phone','msg','in','phone','Calls and texts on the CRM\'s own numbers, recorded, with missed-call text back.'],
    ['lcemail','LC Email','msg','in','mail','Sends the planning guide and every follow-up from the business domain.'],
    ['whatsapp','WhatsApp','msg','link','chat','For families who live on WhatsApp, often relatives overseas.'],
    ['meta','Facebook and Instagram','ads','link','mega','Lead ads, Conversions API events and the social planner in one place.'],
    ['gads','Google Ads','ads','link','search','Search ads for "funeral home near me", reported to booked calls.'],
    ['tiktok','TikTok','ads','link','film','Short planning-ahead videos scheduled from the social planner.'],
    ['gcal','Google Calendar','cal','link','cal','Planners\' real availability, so the booking page never double-books.'],
    ['zoom','Zoom','cal','link','video','Video arrangement meetings for family who live out of state.'],
    ['zapier','Zapier','ai','link','bolt','Connects case software or a form on another site that has no native app.'],
    ['slack','Slack','ai','prem','bell','Posts to the on-call director\'s channel the moment a callback lands.'],
    ['convai','Conversation AI','ai','in','bot','Answers after-hours questions on prices and hours, then hands off to a person.'],
    ['openai','OpenAI in workflows','ai','prem','spark','Drafts follow-ups and sorts replies. A person sends anything sensitive.'],
    ['qbo','QuickBooks and Xero','ops','link','book','Paid invoices land in the books without anyone retyping them.'],
    ['wp','WordPress','ops','link','globe','Keep the current WordPress site and still send every form to the CRM.'],
    ['shopify','Shopify','ops','link','bag','Urns and keepsakes sold online, with buyers added to the CRM.']
  ];
  var START=['stripe','gbp','reviews','lcphone','meta','gcal'];
  var TAG={in:'Built in',link:'Connects',prem:'Premium'};
  grid.innerHTML=A.map(function(a){return '<li><button type="button" class="fm-ao-c" data-id="'+a[0]+'" data-cat="'+a[2]+'" aria-pressed="false">'+
    '<span class="fm-ao-ic"><svg viewBox="0 0 40 40" aria-hidden="true">'+I[a[4]]+'</svg></span>'+
    '<span class="fm-ao-tx"><b>'+a[1]+'</b><small>'+a[5]+'</small></span>'+
    '<span class="fm-ao-tag fm-ao-'+a[3]+'">'+TAG[a[3]]+'</span>'+
    '<span class="fm-ao-ck" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M5 10.5l3.4 3.2L15 7"/></svg></span></button></li>'}).join('');
  var picked=[];
  var count=document.getElementById('aoCount'),list=document.getElementById('aoList'),copy=document.getElementById('aoCopy');
  function name(id){for(var i=0;i<A.length;i++)if(A[i][0]===id)return A[i][1]}
  function sync(){
    [].forEach.call(grid.querySelectorAll('.fm-ao-c'),function(b){b.setAttribute('aria-pressed',String(picked.indexOf(b.dataset.id)>-1))});
    count.textContent=picked.length+(picked.length===1?' add-on picked':' add-ons picked');
    list.textContent=picked.length?picked.map(name).join(', '):'Tap a card to add it to your setup.';
    copy.disabled=!picked.length;copy.textContent='Copy my list';
  }
  grid.addEventListener('click',function(e){var b=e.target.closest('.fm-ao-c');if(!b)return;var id=b.dataset.id,i=picked.indexOf(id);if(i>-1)picked.splice(i,1);else picked.push(id);sync()});
  document.getElementById('aoPack').addEventListener('click',function(){START.forEach(function(id){if(picked.indexOf(id)<0)picked.push(id)});sync();if(window.fmHaptic)window.fmHaptic('done')});
  copy.addEventListener('click',function(){
    var txt='GoHighLevel add-ons I want: '+picked.map(name).join(', ');
    var ok=function(){copy.textContent='Copied'};
    if(navigator.clipboard)navigator.clipboard.writeText(txt).then(ok,function(){copy.textContent='Copy failed'});
  });
  var f=document.querySelector('.fm-ao-f');
  f.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
    [].forEach.call(f.querySelectorAll('button'),function(x){x.setAttribute('aria-pressed',String(x===b))});
    var c=b.dataset.f;grid.classList.toggle('fm-ao-filt',c!=='all');
    [].forEach.call(grid.querySelectorAll('.fm-ao-c'),function(x){x.classList.toggle('fm-ao-hit',c==='all'||x.dataset.cat===c)});
  });
  sync();
})();
