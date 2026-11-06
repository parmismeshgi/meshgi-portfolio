(() => {
  const mode = document.body.dataset.playMode;
  const root = document.getElementById('app');
  const modal = document.getElementById('demo-modal');
  let dialogTrigger = null;
  const money = value => '$' + value.toFixed(2);
  const safe = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const state = { filter:'All', query:'', view:'List', selected:null, order:false, seat:2, showSeats:false,
    tabs:[
      {id:1,name:'Patio 04',guest:'Jordan Lee',status:'Open',total:42.5,area:'Patio',owner:'Alex'},
      {id:2,name:'Bar 12',guest:'Sam Rivera',status:'Open',total:28,area:'Bar',owner:'Morgan'},
      {id:3,name:'Table 07',guest:'Taylor Chen',status:'Needs payment',total:63.75,area:'Dining',owner:'Alex'},
      {id:4,name:'Bar 09',guest:'Casey Park',status:'Paid',total:19.25,area:'Bar',owner:'Morgan'}],
    tables:[
      {id:'T4',status:'In progress',type:'Dine-in',seats:4,opened:'7:05 PM',total:87,owner:'Alex'},
      {id:'T2',status:'Open',type:'Dine-in',seats:2,opened:'7:14 PM',total:0,owner:'Morgan'},
      {id:'T8',status:'Needs payment',type:'Dine-in',seats:3,opened:'6:48 PM',total:44,owner:'Jordan'},
      {id:'B3',status:'Open',type:'Bar',seats:1,opened:'7:21 PM',total:18,owner:'Alex'}],
    tableItems:{
      T4:{1:[],2:[{name:'Margherita Pizza',price:11}],3:[],4:[]},
      T2:{1:[],2:[]},
      T8:{1:[],2:[],3:[]},
      B3:{1:[]}
    },
    items:null
  };
  const menu=[{name:'Margherita Pizza',price:11},{name:'Mojito',price:9},{name:'Caesar Salad',price:13},{name:'Iced Coffee',price:5},{name:'Pasta',price:17},{name:'Sparkling Water',price:4}];
  function notice(message){const box=root.querySelector('#demo-notice');box.textContent=message;box.hidden=false;clearTimeout(notice.timer);notice.timer=setTimeout(()=>{const current=root.querySelector('#demo-notice');if(current)current.hidden=true},5000);}
  function dialog(title,copy,input,confirm,onConfirm){
    dialogTrigger=document.activeElement;
    modal.hidden=false;
    modal.innerHTML=`<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><h3 id="dialog-title">${safe(title)}</h3><p>${safe(copy)}</p>${input?`<input id="dialog-input" aria-label="${safe(input)}" placeholder="${safe(input)}" maxlength="32">`:''}<div class="dialog-actions"><button class="btn" data-close>Cancel</button><button class="btn primary" data-confirm>${safe(confirm)}</button></div></div>`;
    const field=modal.querySelector('input');
    (field||modal.querySelector('[data-close]')).focus();
    modal.querySelector('[data-close]').onclick=closeDialog;
    modal.querySelector('[data-confirm]').onclick=()=>{const value=field?field.value.trim():null; if(field&&!value){field.focus();return}closeDialog();onConfirm(value);if(!dialogTrigger?.isConnected)root.querySelector('.pos-main button')?.focus()};
    modal.onclick=e=>{if(e.target===modal)closeDialog()};
  }
  function closeDialog(){modal.hidden=true;modal.innerHTML='';if(dialogTrigger?.isConnected)dialogTrigger.focus()}
  document.addEventListener('keydown',e=>{
    if(modal.hidden)return;
    if(e.key==='Escape'){e.preventDefault();closeDialog()}
    if(e.key==='Tab'){
      const focusable=[...modal.querySelectorAll('button:not([hidden]), input')];
      if(!focusable.length)return;
      const first=focusable[0],last=focusable.at(-1);
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    }
  });
  function rail(){return `<aside class="pos-rail" aria-label="Product areas"><span class="rail-icon active">${mode==='tabs'?'Tabs':'Tables'}</span><span class="rail-icon">Orders</span><span class="rail-icon">Pay</span></aside>`}
  function shell(content){root.innerHTML=`<div class="pos-top"><strong class="pos-brand">SERVICE WORKSPACE</strong><span>Sample shift · 7:23 PM</span></div><div class="pos-layout">${rail()}<main class="pos-main"><div id="demo-notice" class="notice" hidden role="status"></div>${content}</main></div>`;}
  function statusPill(status){return `<span class="pill ${status==='Needs payment'?'warn':status==='Paid'?'done':''}">${safe(status)}</span>`}
  function tabDetail(tab){return `<aside class="detail" aria-label="Tab quick view"><h3>${safe(tab.name)}</h3><p class="sub">${safe(tab.guest)} · ${safe(tab.area)}</p><dl><dt>Status</dt><dd>${statusPill(tab.status)}</dd><dt>Owner</dt><dd>${safe(tab.owner)}</dd><dt>Current total</dt><dd>${money(tab.total)}</dd></dl><button class="btn" data-action="rename">Rename tab</button><button class="btn ${tab.status==='Paid'?'':'primary'}" data-action="pay" ${tab.status==='Paid'?'disabled':''}>${tab.status==='Paid'?'Paid':'Mark paid'}</button></aside>`}
  function renderTabs(){
    const rows=state.tabs.filter(tab=>(state.filter==='All'||tab.status===state.filter)&&`${tab.name} ${tab.guest} ${tab.area}`.toLowerCase().includes(state.query.toLowerCase()));
    const selected=state.tabs.find(tab=>tab.id===state.selected);
    const content=`<div class="pos-heading"><div><h2>Bar Tabs</h2><p>Find a tab, check its state, and take the next action.</p></div><button class="btn primary" data-action="new-tab">+ New tab</button></div><div class="filters"><input id="demo-search" type="search" value="${safe(state.query)}" placeholder="Search tabs or guests" aria-label="Search tabs or guests"><div class="segment" aria-label="Filter tabs">${['All','Open','Needs payment','Paid'].map(value=>`<button data-filter="${value}" class="${state.filter===value?'active':''}">${value}</button>`).join('')}</div><div class="segment" aria-label="View type"><button data-view="List" class="${state.view==='List'?'active':''}">List</button><button data-view="Cards" class="${state.view==='Cards'?'active':''}">Cards</button></div></div><div class="workspace ${selected?'':'no-detail'}">${state.view==='List'?`<section class="table-list"><div class="list-head">${rows.length} tabs in view</div>${rows.length?rows.map(tab=>`<button class="row ${state.selected===tab.id?'selected':''}" data-tab="${tab.id}"><span><strong>${safe(tab.name)}</strong><small>${safe(tab.guest)}</small></span><span>${statusPill(tab.status)}</span><span><small>${safe(tab.area)}</small></span><b>${money(tab.total)}</b></button>`).join(''):'<p class="empty">No tabs match your search.</p>'}</section>`:`<section class="cards" aria-label="Tabs">${rows.length?rows.map(tab=>`<button class="card ${state.selected===tab.id?'selected':''}" data-tab="${tab.id}"><strong>${safe(tab.name)}</strong>${statusPill(tab.status)}<p>${safe(tab.guest)} · ${safe(tab.area)}</p><b>${money(tab.total)}</b></button>`).join(''):'<p class="empty">No tabs match your search.</p>'}</section>`}${selected?tabDetail(selected):''}</div>`;
    shell(content);bindCommon();
    root.querySelectorAll('[data-tab]').forEach(button=>button.onclick=()=>{state.selected=Number(button.dataset.tab);renderTabs()});
    root.querySelector('[data-action="new-tab"]').onclick=()=>dialog('New tab','Give this sample tab a name.','Tab name','Create tab',name=>{const tab={id:Date.now(),name,guest:'Walk-in guest',status:'Open',total:0,area:'Bar',owner:'You'};state.tabs.unshift(tab);state.selected=tab.id;state.filter='All';state.query='';renderTabs();notice('New tab created.')});
    root.querySelector('[data-action="rename"]')?.addEventListener('click',()=>dialog('Rename tab','Choose a name that staff can find quickly.','New name','Save name',name=>{selected.name=name;renderTabs();notice('Tab name updated.')}));
    root.querySelector('[data-action="pay"]')?.addEventListener('click',()=>dialog('Mark tab paid',`Confirm payment for ${selected.name}.`,null,'Mark paid',()=>{selected.status='Paid';renderTabs();notice('Tab marked paid.')}));
  }
  function tableDetail(table){
    const seats=state.tableItems[table.id];
    const seatCards=Object.entries(seats).map(([seat,items])=>`<button data-seat-preview="${seat}">Seat ${seat}<small>${items.length} ${items.length===1?'item':'items'}</small></button>`).join('');
    return `<aside class="detail" aria-label="Table quick view"><h3>${safe(table.id)}</h3><p class="sub">${safe(table.status)} · ${safe(table.type)}</p><dl><dt>Opened</dt><dd>${safe(table.opened)}</dd><dt>Seats</dt><dd>${table.seats}</dd><dt>Owner</dt><dd>${safe(table.owner)}</dd><dt>Total</dt><dd>${money(table.total)}</dd></dl><button class="btn" data-action="seats">${state.showSeats?'Hide':'Show'} seats</button>${state.showSeats?`<div class="seat-list quick-seats">${seatCards}</div>`:''}<button class="btn primary" data-action="open-order">Open table</button></aside>`
  }
  function renderTables(){
    const rows=state.tables.filter(table=>`${table.id} ${table.status} ${table.owner}`.toLowerCase().includes(state.query.toLowerCase()));
    const selected=state.tables.find(table=>table.id===state.selected);
    const content=`<div class="pos-heading"><div><h2>Table Service</h2><p>Find a table, review seats, and continue the order.</p></div><span class="pill">List view</span></div><div class="filters"><input id="demo-search" type="search" value="${safe(state.query)}" placeholder="Search tables" aria-label="Search tables"><div class="segment" aria-label="Table filters"><button class="active">All tables</button></div></div><div class="workspace ${selected?'':'no-detail'}"><section class="table-list"><div class="list-head">${rows.length} tables in view · Select T4 to open Quick View</div>${rows.length?rows.map(table=>`<button class="row ${selected?.id===table.id?'selected':''}" data-table="${safe(table.id)}"><span><strong>${safe(table.id)}</strong><small>${table.seats} ${table.seats===1?'seat':'seats'} · ${safe(table.opened)}</small></span><span>${statusPill(table.status)}</span><span><small>${safe(table.owner)}</small></span><b>${money(table.total)}</b></button>`).join(''):'<p class="empty">No tables match your search.</p>'}</section>${selected?tableDetail(selected):''}</div>`;
    shell(content);bindCommon();
    root.querySelectorAll('[data-table]').forEach(button=>button.onclick=()=>{state.selected=button.dataset.table;state.showSeats=false;renderTables()});
    root.querySelector('[data-action="seats"]')?.addEventListener('click',()=>{state.showSeats=!state.showSeats;renderTables()});
    root.querySelectorAll('[data-seat-preview]').forEach(button=>button.onclick=()=>{state.items=state.tableItems[selected.id];state.seat=Number(button.dataset.seatPreview);state.order=true;renderOrder()});
    root.querySelector('[data-action="open-order"]')?.addEventListener('click',()=>{state.items=state.tableItems[selected.id];state.seat=selected.id==='T4'?2:1;state.order=true;renderOrder()});
  }
  function renderOrder(){
    const items=state.items[state.seat]||[];
    const total=items.reduce((sum,item)=>sum+item.price,0);
    const content=`<div class="pos-heading"><div><h2>${safe(state.selected)} · Ordering</h2><p>Select a seat, add an item, or test the removal guard.</p></div><button class="btn" data-action="back">← Back to tables</button></div><div class="order-layout"><section class="order-panel"><h3>Seats</h3><div class="seat-list">${Object.keys(state.items).map(Number).map(seat=>`<button data-seat="${seat}" class="${state.seat===seat?'active':''}">Seat ${seat}<small>${state.items[seat]?.length||0} ${(state.items[seat]?.length||0)===1?'item':'items'}</small></button>`).join('')}</div><div class="order-buttons"><button class="btn" data-action="add-seat">+ Add seat</button><button class="btn danger" data-action="remove-seat">Remove seat</button></div></section><section class="order-panel"><h3>Seat ${state.seat} · Order</h3>${items.length?`<ul class="item-list">${items.map((item,index)=>`<li><span>${safe(item.name)}<br><span class="muted">${money(item.price)}</span></span><button data-void="${index}" aria-label="Void ${safe(item.name)}">Void</button></li>`).join('')}</ul>`:'<p class="muted">No items on this seat.</p>'}<div class="order-total"><span>Seat total</span><span>${money(total)}</span></div></section><section class="menu-panel"><h3>Add an item</h3><div class="menu-grid">${menu.map((item,index)=>`<button data-item="${index}">${safe(item.name)}<span>${money(item.price)}</span></button>`).join('')}</div></section></div>`;
    shell(content);
    root.querySelector('[data-action="back"]').onclick=()=>{state.order=false;renderTables()};
    root.querySelectorAll('[data-seat]').forEach(button=>button.onclick=()=>{state.seat=Number(button.dataset.seat);renderOrder()});
    root.querySelectorAll('[data-item]').forEach(button=>button.onclick=()=>{const item=menu[Number(button.dataset.item)];state.items[state.seat].push(item);state.tables.find(table=>table.id===state.selected).total+=item.price;renderOrder();notice('Item added to Seat '+state.seat+'.')});
    root.querySelectorAll('[data-void]').forEach(button=>button.onclick=()=>dialog('Void item','Remove this item from Seat '+state.seat+'?',null,'Void item',()=>{const [item]=state.items[state.seat].splice(Number(button.dataset.void),1);state.tables.find(table=>table.id===state.selected).total-=item.price;renderOrder();notice('Item voided.')}));
    root.querySelector('[data-action="add-seat"]').onclick=()=>{const next=Math.max(...Object.keys(state.items).map(Number))+1;state.items[next]=[];state.tables.find(table=>table.id===state.selected).seats++;state.seat=next;renderOrder();notice('Seat '+next+' added.')};
    root.querySelector('[data-action="remove-seat"]').onclick=()=>{if(state.items[state.seat].length){dialog('Seat '+state.seat+' has items','Void the items on this seat first. Then remove the seat.',null,'OK',()=>{});modal.querySelector('[data-close]').hidden=true;modal.querySelector('[data-confirm]').focus();return}if(Object.keys(state.items).length===1){notice('Keep at least one seat on the table.');return}delete state.items[state.seat];state.tables.find(table=>table.id===state.selected).seats--;state.seat=Number(Object.keys(state.items)[0]);renderOrder();notice('Empty seat removed.')};
  }
  function bindCommon(){
    root.querySelector('#demo-search')?.addEventListener('input',e=>{const start=e.target.selectionStart;state.query=e.target.value;mode==='tabs'?renderTabs():renderTables();const field=root.querySelector('#demo-search');field.focus();field.setSelectionRange(start,start)});
    root.querySelectorAll('[data-filter]').forEach(button=>button.onclick=()=>{state.filter=button.dataset.filter;renderTabs()});
    root.querySelectorAll('[data-view]').forEach(button=>button.onclick=()=>{state.view=button.dataset.view;renderTabs()});
  }
  if(mode==='tabs')renderTabs();
  else{
    const step=new URLSearchParams(location.search).get('step');
    if(['quick-view','seats','seat','item','guard'].includes(step)){state.selected='T4';state.showSeats=step==='seats'}
    if(['seat','item','guard'].includes(step)){state.items=state.tableItems.T4;state.order=true;state.seat=step==='seat'?4:2;renderOrder()}
    else renderTables();
    if(step==='guard'){dialog('Seat 2 has items','Void the items on this seat first. Then remove the seat.',null,'OK',()=>{});modal.querySelector('[data-close]').hidden=true;modal.querySelector('[data-confirm]').focus()}
  }
})();
