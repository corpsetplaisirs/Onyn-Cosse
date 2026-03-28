document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('navLogo').src=LOGO_SRC;
  document.getElementById('heroLogo').src=LOGO_SRC;
  document.getElementById('aboutPhoto').src=LOGO_SRC;
});

// NAV
function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  document.querySelectorAll('.nav-link').forEach(l=>l.classList.remove('active-nav'));
  const el=document.getElementById('nav-'+id);
  if(el)el.classList.add('active-nav');
  window.scrollTo(0,0);
}

// DEROULEMENT
function showDeroul(id,btn){
  document.querySelectorAll('.deroul-panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.deroul-tab').forEach(b=>b.classList.remove('active'));
  document.getElementById('dp-'+id).classList.add('active');
  btn.classList.add('active');
}

// BOOKING
const B={type:'',dur:'',price:'',dateObj:null,dateStr:'',slot:'',yr:0,mo:0};
const offDays=[0];
const slotSets={wd:['9h00','9h50','10h40','11h30','14h00','14h50','15h40','16h30','17h20','18h10'],sa:['9h00','9h50','10h40','11h30']};
const bookedDays=new Set();
const today=new Date();
[3,7,11].forEach(d=>{const f=new Date(today);f.setDate(today.getDate()+d);if(f.getDay()!==0)bookedDays.add(fmt(f));});
function fmt(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}

function selectType(el,name,dur,price){
  document.querySelectorAll('.type-btn').forEach(b=>b.classList.remove('selected'));
  el.classList.add('selected');
  B.type=name;B.dur=dur;B.price=price;
  setTimeout(()=>goBookStep(2),300);
}
function goToRdv(name,dur,price){
  showPage('rdv');
  document.getElementById('bookingCard').style.display='block';
  document.getElementById('bookingSuccess').style.display='none';
  B.type=name;B.dur=dur;B.price=price;B.dateObj=null;B.dateStr='';B.slot='';
  document.querySelectorAll('.type-btn').forEach(b=>b.classList.remove('selected'));
  const map={'Consultation individuelle':'tbtn-ind','Thérapie de couple':'tbtn-cpl','Consultation en ligne':'tbtn-onl','Consultation individuelle (tarif solidaire)':'tbtn-sol'};
  const btn=document.getElementById(map[name]);
  if(btn)btn.classList.add('selected');
  goBookStep(2);
}
function goBookStep(n){
  [1,2,3,4].forEach(i=>{
    document.getElementById('bpanel'+i).classList.toggle('active',i===n);
    const t=document.getElementById('stab'+i);
    t.classList.remove('active','done');
    if(i===n)t.classList.add('active');
    else if(i<n)t.classList.add('done');
  });
  if(n===2)renderCal();
  if(n===4)fillRecap();
}
const MONTHS=['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DNAMES=['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
function copyIBAN(){
  navigator.clipboard.writeText('FR76144450040004054090748 53'.replace(/\s/g,'')).then(()=>{
    const btn=document.querySelector('.copy-btn');
    btn.textContent='Copié !';
    setTimeout(()=>btn.textContent='Copier',2000);
  });
}
function initCal(){B.yr=today.getFullYear();B.mo=today.getMonth();}
function changeMonth(d){B.mo+=d;if(B.mo>11){B.mo=0;B.yr++;}if(B.mo<0){B.mo=11;B.yr--;}renderCal();}
function renderCal(){
  const y=B.yr,m=B.mo;
  document.getElementById('calTitle').textContent=MONTHS[m]+' '+y;
  const grid=document.getElementById('calGrid');
  grid.innerHTML='';
  DNAMES.forEach(d=>{const e=document.createElement('div');e.className='cal-dname';e.textContent=d;grid.appendChild(e);});
  let sd=new Date(y,m,1).getDay();
  sd=(sd===0)?6:sd-1;
  for(let i=0;i<sd;i++){const e=document.createElement('button');e.className='cal-day empty';e.disabled=true;grid.appendChild(e);}
  const dim=new Date(y,m+1,0).getDate();
  for(let d=1;d<=dim;d++){
    const date=new Date(y,m,d);
    const dow=date.getDay();
    const ds=fmt(date);
    const isPast=date<new Date(today.getFullYear(),today.getMonth(),today.getDate());
    const isOff=offDays.includes(dow)||bookedDays.has(ds);
    const btn=document.createElement('button');
    btn.textContent=d;btn.className='cal-day';
    if(isPast)btn.classList.add('past');
    else if(isOff)btn.classList.add('off');
    else btn.classList.add('open');
    if(ds===fmt(today))btn.classList.add('today');
    if(ds===B.dateStr)btn.classList.add('sel');
    if(!isPast&&!isOff)btn.onclick=()=>selectDate(date,ds,dow);
    else btn.disabled=true;
    grid.appendChild(btn);
  }
  if(!B.dateStr||!B.dateStr.startsWith(y+'-'+String(m+1).padStart(2,'0'))){
    document.getElementById('slotsWrap').style.display='none';
  }
}
function selectDate(date,ds,dow){
  B.dateObj=date;B.dateStr=ds;B.slot='';
  renderCal();
  const isSat=(dow===6);
  const slots=isSat?slotSets.sa:slotSets.wd;
  const wrap=document.getElementById('slotsWrap');
  wrap.style.display='block';
  const df=date.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});
  document.getElementById('slotsLabel').textContent='Créneaux – '+df.charAt(0).toUpperCase()+df.slice(1);
  const grid=document.getElementById('slotsGrid');
  grid.innerHTML='';
  const taken=new Set(['10h40','14h50']);
  slots.forEach(s=>{
    const btn=document.createElement('button');
    btn.className='slot-btn';btn.textContent=s;
    if(taken.has(s)){btn.disabled=true;btn.style.opacity='.3';btn.style.cursor='not-allowed';}
    else btn.onclick=()=>selectSlot(s,btn);
    grid.appendChild(btn);
  });
}
function selectSlot(s,btn){
  document.querySelectorAll('.slot-btn').forEach(b=>b.classList.remove('sel'));
  btn.classList.add('sel');B.slot=s;
  setTimeout(()=>goBookStep(3),300);
}
function fillRecap(){
  const p=document.getElementById('bPrenom').value;
  const n=document.getElementById('bNom').value;
  const e=document.getElementById('bEmail').value;
  if(!p||!n||!e){alert('Merci de renseigner prénom, nom et email.');goBookStep(3);return;}
  const df=B.dateObj?B.dateObj.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}):'—';
  document.getElementById('rType').textContent=B.type;
  document.getElementById('rDate').textContent=df.charAt(0).toUpperCase()+df.slice(1);
  document.getElementById('rHeure').textContent=B.slot;
  document.getElementById('rDuree').textContent=B.dur;
  document.getElementById('rNom').textContent=p+' '+n;
  document.getElementById('rEmail').textContent=e;
  document.getElementById('rPrice').textContent=B.price+' €';
}
function confirmBooking(){
  const df=B.dateObj?B.dateObj.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'}):'';
  document.getElementById('successDetail');
  document.getElementById('bookingCard').style.display='none';
  document.getElementById('bookingSuccess').style.display='block';
  const det=B.type+' · '+df+' à '+B.slot;
  document.getElementById('successDetail').textContent=det;
  B.dateObj=null;B.dateStr='';B.slot='';
}
function sendContact(){
  const p=document.getElementById('cfPrenom').value;
  const n=document.getElementById('cfNom').value;
  const e=document.getElementById('cfEmail').value;
  if(!p||!n||!e){alert('Merci de renseigner prénom, nom et email.');return;}
  document.getElementById('cfForm').style.display='none';
  document.getElementById('cfSuccess').style.display='block';
}
initCal();