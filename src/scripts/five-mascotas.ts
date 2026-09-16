export {};
const search=document.querySelector<HTMLInputElement>('#five-search')!;
const cards=[...document.querySelectorAll<HTMLElement>('[data-product]')];
let category='Todos';
const department=document.querySelector<HTMLSelectElement>('#five-department')!;
const offers=document.querySelector<HTMLInputElement>('#five-offers')!;
const normalize=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function filter(){
 let count=0;
 cards.forEach(card=>{
  card.hidden=!(normalize(card.dataset.search!).includes(normalize(search.value.slice(0,100).trim()))&&(category==='Todos'||card.dataset.pet!.split(' ').includes(category))&&(department.value==='Todos'||card.dataset.type===department.value)&&(!offers.checked||card.dataset.offer==='true'));
  if(!card.hidden)count++;
 });
 document.querySelector<HTMLElement>('#five-empty')!.hidden=count>0;
 document.querySelector('#five-results')!.textContent=`${count} ${count===1?'producto':'productos'}`;
 document.querySelector<HTMLElement>('#five-pharmacy-note')!.hidden=department.value!=='Farmacia';
 document.querySelectorAll<HTMLElement>('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===category)));
}
function reset(){category='Todos';search.value='';department.value='Todos';offers.checked=false;filter();}
search.addEventListener('input',filter);department.addEventListener('change',filter);offers.addEventListener('change',filter);
document.querySelector('.five-search')!.addEventListener('submit',e=>{e.preventDefault();filter();document.querySelector('#productos')!.scrollIntoView();});
document.querySelectorAll<HTMLElement>('[data-filter],[data-category-link]').forEach(b=>b.addEventListener('click',()=>{
 category=b.dataset.filter||b.dataset.categoryLink||'Todos';
 if(b.dataset.categoryLink){search.value='';department.value='Todos';offers.checked=false;}
 filter();
}));
document.querySelectorAll<HTMLElement>('[data-department-link]').forEach(link=>link.addEventListener('click',()=>{
 const value=link.dataset.departmentLink!;
 category='Todos';search.value='';offers.checked=value==='Ofertas';department.value=value==='Ofertas'?'Todos':value;filter();
}));
document.querySelector('#five-clear')!.addEventListener('click',reset);
document.querySelector('#five-reset')!.addEventListener('click',reset);
const cart=new Map<string,{name:string;price:number;quantity:number}>();
const money=(n:number)=>new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(n);
const dialog=document.querySelector<HTMLDialogElement>('.five-cart-dialog')!;
const opener=document.querySelector<HTMLButtonElement>('[data-basket]')!;
function render(){let total=0,count=0;const list=document.querySelector('#five-cart-items')!;list.replaceChildren();cart.forEach((item,id)=>{count+=item.quantity;total+=item.quantity*item.price;const row=document.createElement('li');const text=document.createElement('span');text.textContent=`${item.quantity} × ${item.name} · ${money(item.price*item.quantity)}`;const remove=document.createElement('button');remove.textContent='Quitar';remove.setAttribute('aria-label',`Quitar ${item.name}`);remove.addEventListener('click',()=>{cart.delete(id);render();});row.append(text,remove);list.append(row);});if(!count){const li=document.createElement('li');li.textContent='Tu carrito está esperando a su favorito.';list.append(li);}document.querySelector('#five-cart-count')!.textContent=String(count);document.querySelector('#five-total')!.textContent=money(total);}
document.querySelectorAll<HTMLButtonElement>('[data-add]').forEach(button=>button.addEventListener('click',()=>{const id=button.dataset.add!;const item=cart.get(id)||{name:button.dataset.name!,price:Number(button.dataset.price),quantity:0};if(item.quantity>=10){document.querySelector('#five-status')!.textContent='Máximo de 10 unidades por producto en esta muestra.';return;}item.quantity++;cart.set(id,item);render();document.querySelector('#five-status')!.textContent=`${item.name} agregado al carrito de muestra`;button.textContent='✓ Agregado';}));
opener.addEventListener('click',()=>{render();dialog.showModal();});
document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>dialog.close()));
dialog.addEventListener('close',()=>opener.focus());
