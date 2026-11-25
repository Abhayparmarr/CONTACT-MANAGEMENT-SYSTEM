const KEY = "contacthub_contacts_v1";
let contacts = JSON.parse(localStorage.getItem(KEY) || "[]");
let currentView = "all", currentCategory = "All", currentLayout = "grid";
const $ = id => document.getElementById(id);
const modal = $("contactDialog"), form = $("contactForm");
const categories = ["Work","Family","Friends","Other"];
const palette = ["","tone-1","tone-2","tone-3","tone-4"];
const escapeHTML = s => String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const initials = name => String(name || "?").trim().split(/\s+/).slice(0,2).map(x=>x[0]||"").join("").toUpperCase();
const save = () => localStorage.setItem(KEY,JSON.stringify(contacts));
function toast(message){$("toastText").textContent=message;$("toast").classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>$("toast").classList.remove("show"),2300);}
function dateLabel(timestamp){if(!timestamp)return "Added earlier";return new Date(timestamp).toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"});}
function safeIcons(){if(window.lucide)lucide.createIcons();}
function normalise(c){return {...c,id:c.id||crypto.randomUUID(),company:c.company||"",category:categories.includes(c.category)?c.category:"Other",favorite:!!c.favorite,created:c.created||Date.now()};}
contacts=contacts.map(normalise);save();

function currentList(){
  const q=$("searchInput").value.trim().toLowerCase();
  let list=contacts.filter(c=>[c.name,c.phone,c.email,c.address,c.notes,c.company,c.category].join(" ").toLowerCase().includes(q));
  if(currentView==="favorites")list=list.filter(c=>c.favorite);
  if(currentView==="recent")list=list.filter(c=>Date.now()-c.created<30*86400000);
  if(currentCategory!=="All")list=list.filter(c=>c.category===currentCategory);
  const sort=$("sortSelect").value;
  if(sort==="name")list.sort((a,b)=>a.name.localeCompare(b.name));
  if(sort==="newest")list.sort((a,b)=>b.created-a.created);
  if(sort==="oldest")list.sort((a,b)=>a.created-b.created);
  return list;
}
function render(){
  const list=currentList();
  $("totalCount").textContent=contacts.length;
  $("emailCount").textContent=contacts.filter(c=>c.email).length;
  $("phoneCount").textContent=contacts.filter(c=>c.phone).length;
  $("favoriteCount").textContent=contacts.filter(c=>c.favorite).length;
  $("sideTotal").textContent=contacts.length;
  $("resultCount").textContent=list.length;
  $("contactGrid").classList.toggle("list-view",currentLayout==="list");
  $("contactGrid").innerHTML=list.map(c=>{
    const tone=palette[Math.abs(String(c.name).length)%palette.length];
    return `<article class="contact-card">
      <div class="card-top"><div class="contact-avatar ${tone}">${escapeHTML(initials(c.name))}</div><div class="card-person"><h3>${escapeHTML(c.name)}</h3><p>${escapeHTML(c.company||c.category+" contact")}</p></div>
      <button class="favorite-btn ${c.favorite?"is-fav":""}" title="${c.favorite?"Remove from favourites":"Add to favourites"}" onclick="toggleFavorite('${c.id}')"><i data-lucide="star"></i></button></div>
      <div class="card-info"><div><i data-lucide="phone"></i><span>${escapeHTML(c.phone||"No phone number")}</span></div><div><i data-lucide="mail"></i><span>${escapeHTML(c.email||"No email address")}</span></div><div><i data-lucide="map-pin"></i><span>${escapeHTML(c.address||"No address added")}</span></div></div>
      <div class="card-bottom"><span class="category-badge"><i></i>${escapeHTML(c.category)}</span><div class="card-actions"><button title="View details" onclick="viewContact('${c.id}')"><i data-lucide="eye"></i></button><button title="Edit contact" onclick="editContact('${c.id}')"><i data-lucide="pencil"></i></button><button title="Delete contact" onclick="deleteContact('${c.id}')"><i data-lucide="trash-2"></i></button></div></div>
    </article>`;
  }).join("");
  $("emptyState").hidden=list.length!==0;
  $("contactGrid").hidden=list.length===0;
  safeIcons();
}
function openModal(contact=null){
  form.reset();$("contactId").value=contact?.id||"";
  $("modalTitle").textContent=contact?"Edit contact":"Add a contact";
  $("name").value=contact?.name||"";$("phone").value=contact?.phone||"";
  $("email").value=contact?.email||"";$("company").value=contact?.company||"";
  $("address").value=contact?.address||"";$("notes").value=contact?.notes||"";
  $("category").value=contact?.category||"Work";
  modal.showModal();$("name").focus();
}
function closeModal(){modal.close();}
form.addEventListener("submit",e=>{
  e.preventDefault();
  const id=$("contactId").value;
  const data={name:$("name").value.trim(),phone:$("phone").value.trim(),email:$("email").value.trim(),company:$("company").value.trim(),category:$("category").value,address:$("address").value.trim(),notes:$("notes").value.trim()};
  if(!data.name||!data.phone)return;
  const duplicate=contacts.find(c=>c.id!==id&&((data.phone&&c.phone.replace(/\D/g,"")===data.phone.replace(/\D/g,""))||(data.email&&c.email.toLowerCase()===data.email.toLowerCase())));
  if(duplicate){toast("A contact with this phone or email already exists.");return;}
  if(id){contacts=contacts.map(c=>c.id===id?{...c,...data}:c);toast("Contact updated successfully");}
  else{contacts.unshift({...data,id:crypto.randomUUID(),created:Date.now(),favorite:false});toast("New contact added");}
  save();render();closeModal();
});
window.editContact=id=>{const c=contacts.find(x=>x.id===id);if(c)openModal(c);};
window.deleteContact=id=>{const c=contacts.find(x=>x.id===id);if(c&&confirm(`Delete ${c.name} from your contacts?`)){contacts=contacts.filter(x=>x.id!==id);save();render();toast("Contact deleted");}};
window.toggleFavorite=id=>{const c=contacts.find(x=>x.id===id);if(c){c.favorite=!c.favorite;save();render();toast(c.favorite?"Added to favourites":"Removed from favourites");}};
window.viewContact=id=>{
  const c=contacts.find(x=>x.id===id);if(!c)return;
  $("detailContent").innerHTML=`<div class="modal-head"><div><div class="modal-eyebrow">CONTACT PROFILE</div><p>All the details in one place.</p></div><button class="close-btn" onclick="$('detailDialog').close()"><i data-lucide="x"></i></button></div>
  <div class="detail-hero"><div class="contact-avatar">${escapeHTML(initials(c.name))}</div><div><h2>${escapeHTML(c.name)}</h2><p>${escapeHTML(c.company||c.category+" contact")} · Added ${dateLabel(c.created)}</p></div></div>
  <div class="detail-line"><i data-lucide="phone"></i><div><small>PHONE</small>${escapeHTML(c.phone||"Not provided")}</div></div>
  <div class="detail-line"><i data-lucide="mail"></i><div><small>EMAIL</small>${escapeHTML(c.email||"Not provided")}</div></div>
  <div class="detail-line"><i data-lucide="map-pin"></i><div><small>ADDRESS</small>${escapeHTML(c.address||"Not provided")}</div></div>
  <div class="detail-line"><i data-lucide="tag"></i><div><small>CATEGORY</small>${escapeHTML(c.category)}</div></div>
  <div class="detail-notes">${escapeHTML(c.notes||"No notes have been added for this contact.")}</div>
  <div class="detail-actions"><button class="soft-btn" onclick="editContact('${c.id}');$('detailDialog').close()">Edit contact</button><button class="primary-btn" onclick="window.location.href='mailto:${encodeURIComponent(c.email||"")}'"><i data-lucide="mail"></i> Email</button></div>`;
  $("detailDialog").showModal();safeIcons();
};
function setView(view){
  currentView=view;currentCategory="All";
  document.querySelectorAll(".nav-item[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  document.querySelectorAll(".category-item").forEach(b=>b.classList.remove("active"));
  const titles={all:"All contacts",favorites:"Favourites",recent:"Recently added"};
  $("crumbTitle").textContent=titles[view];$("pageTitle").innerHTML=titles[view]+'<span class="title-period">.</span>';
  document.querySelectorAll(".filter-chip").forEach(b=>b.classList.toggle("active",b.dataset.filter==="All"));
  render();
}
document.querySelectorAll(".nav-item[data-view]").forEach(b=>b.addEventListener("click",()=>setView(b.dataset.view)));
document.querySelectorAll(".category-item").forEach(b=>b.addEventListener("click",()=>{
  currentView="all";currentCategory=b.dataset.category;
  document.querySelectorAll(".nav-item[data-view]").forEach(x=>x.classList.remove("active"));
  document.querySelectorAll(".category-item").forEach(x=>x.classList.toggle("active",x===b));
  $("crumbTitle").textContent=currentCategory;$("pageTitle").innerHTML=escapeHTML(currentCategory)+'<span class="title-period">.</span>';render();
}));
document.querySelectorAll(".filter-chip").forEach(b=>b.addEventListener("click",()=>{
  currentView="all";currentCategory=b.dataset.filter;
  document.querySelectorAll(".nav-item[data-view],.category-item").forEach(x=>x.classList.remove("active"));
  document.querySelectorAll(".filter-chip").forEach(x=>x.classList.toggle("active",x===b));
  $("crumbTitle").textContent=currentCategory==="All"?"All contacts":currentCategory;$("pageTitle").innerHTML=(currentCategory==="All"?"All contacts":escapeHTML(currentCategory))+'<span class="title-period">.</span>';render();
}));
$("addContactBtn").onclick=()=>openModal();$("emptyAddBtn").onclick=()=>openModal();$("closeModal").onclick=closeModal;$("cancelBtn").onclick=closeModal;
$("searchInput").addEventListener("input",render);$("sortSelect").addEventListener("change",render);
document.querySelectorAll(".view-btn").forEach(b=>b.addEventListener("click",()=>{currentLayout=b.dataset.layout;document.querySelectorAll(".view-btn").forEach(x=>x.classList.toggle("active",x===b));render();}));
$("themeBtn").onclick=()=>{document.body.classList.toggle("dark");localStorage.setItem("contacthub_dark",document.body.classList.contains("dark"));$("themeBtn").innerHTML=document.body.classList.contains("dark")?'<i data-lucide="sun"></i>':'<i data-lucide="moon"></i>';safeIcons();};
if(localStorage.getItem("contacthub_dark")==="true"){document.body.classList.add("dark");$("themeBtn").innerHTML='<i data-lucide="sun"></i>';}
function download(filename,content,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url);}
$("exportBtn").onclick=()=>{
  const cols=["name","phone","email","company","category","address","notes","favorite","created"];
  const csv=[cols.join(","),...contacts.map(c=>cols.map(k=>`"${String(c[k]??"").replace(/"/g,'""')}"`).join(","))].join("\n");
  download("contacthub-contacts.csv",csv,"text/csv;charset=utf-8");toast("CSV export downloaded");
};
$("backupBtn").onclick=()=>{download("contacthub-backup.json",JSON.stringify({app:"ContactHub",version:2,exportedAt:new Date().toISOString(),contacts},null,2),"application/json");toast("Backup file downloaded");};
$("importBtn").onclick=()=>$("importFile").click();
$("importFile").addEventListener("change",async e=>{
  const file=e.target.files[0];if(!file)return;
  try{
    const text=await file.text();let incoming;
    if(file.name.toLowerCase().endsWith(".csv")){
      const lines=text.split(/\r?\n/).filter(Boolean),headers=parseCSVLine(lines.shift()).map(x=>x.toLowerCase());
      incoming=lines.map(line=>{const vals=parseCSVLine(line),obj={};headers.forEach((h,i)=>obj[h]=vals[i]||"");return obj;});
    }else{const parsed=JSON.parse(text);incoming=Array.isArray(parsed)?parsed:parsed.contacts;}
    if(!Array.isArray(incoming))throw new Error("No contacts found");
    let added=0;
    incoming.forEach(raw=>{if(!raw.name||!raw.phone)return;const phone=String(raw.phone).replace(/\D/g,"");if(contacts.some(c=>String(c.phone).replace(/\D/g,"")===phone&&phone))return;contacts.push(normalise({...raw,phone:String(raw.phone),created:Number(raw.created)||Date.now()}));added++;});
    save();render();toast(`${added} contact${added===1?"":"s"} imported`);
  }catch(err){toast("Could not read that file. Check its format.");}
  e.target.value="";
});
function parseCSVLine(line){const result=[];let value="",quoted=false;for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"'&&line[i+1]==='"'&&quoted){value+='"';i++;}else if(ch==='"')quoted=!quoted;else if(ch===","&&!quoted){result.push(value);value="";}else value+=ch;}result.push(value);return result;}
$("addCategoryBtn").onclick=()=>{const name=prompt("Category filters are built in: Work, Family, Friends and Other. You can assign one when adding a contact.");if(name)toast("Choose a built-in category in the contact form.");};
$("settingsBtn").onclick=()=>toast("Use the moon/sun button to change appearance. Your data is stored in this browser.");
function openCommand(){ $("commandInput").value="";renderCommand("");$("commandDialog").showModal();$("commandInput").focus();}
function renderCommand(q){const matches=contacts.filter(c=>[c.name,c.email,c.phone,c.company].join(" ").toLowerCase().includes(q.toLowerCase())).slice(0,7);$("commandResults").innerHTML=matches.length?matches.map(c=>`<button class="command-result" onclick="viewContact('${c.id}');$('commandDialog').close()"><span class="contact-avatar">${escapeHTML(initials(c.name))}</span><span><strong>${escapeHTML(c.name)}</strong><small>${escapeHTML(c.email||c.phone||c.company||c.category)}</small></span></button>`).join(""):'<div class="command-empty">No matching contacts found.</div>';safeIcons();}
$("shortcutBtn").onclick=openCommand;$("commandInput").addEventListener("input",e=>renderCommand(e.target.value));
document.addEventListener("keydown",e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();openCommand();}
  if(e.key==="/"&&!["INPUT","TEXTAREA"].includes(document.activeElement.tagName)){e.preventDefault();$("searchInput").focus();}
  if(e.key==="Escape"&&modal.open)modal.close();
});
if(window.lucide)lucide.createIcons();render();