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
