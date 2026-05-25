// ── DATA ──
let currentUser = {
    name: 'Kuya Mario', initials: 'KM', role: 'Registered Farmer',
    phone: '+63 917 555 1234', email: 'kuya.mario@email.com', location: 'Pagadian City'
};

const listings = [
    { id:1, title:"Vegetable Farm with Greenhouse", type:"rent", price:"P48,000/year", priceNum:48000, location:"Dumingag", date:"Jan 20, 2025", views:189, img:"vegetable-farm-green", desc:"Well-maintained vegetable farm with modern greenhouse structure. Complete drip irrigation system, seedling nursery, and packing shed. Currently producing lettuce, tomatoes, and peppers.", details:{Area:"1.5 hectares",Soil:"Loam",Water:"Drip Irrigation",Category:"Farm"}, tags:["Greenhouse","Irrigated"], seller:{name:"Rosalinda Mendoza",verified:true,phone:"+63 935 111 2345",avatar:"seller-rosa"} },
    { id:2, title:"8-Hectare Upland Multi-Crop Land", type:"sale", price:"P3,200,000", priceNum:3200000, location:"San Miguel", date:"Jan 18, 2025", views:427, img:"upland-mountain-farm", desc:"Rolling upland suitable for multi-crop farming. Currently planted with cassava and sweet potato. Has natural water source and perimeter fencing. Road accessible year-round.", details:{Area:"8 hectares",Soil:"Clay Loam",Water:"Spring-fed",Category:"Land"}, tags:["Multi-Crop","Fenced"], seller:{name:"Arturo Bacsarpa",verified:true,phone:"+63 945 222 3456",avatar:"seller-arturo"} },
    { id:3, title:"Massey Ferguson 375 – 75 HP", type:"sale", price:"P720,000", priceNum:720000, location:"Mahayag", date:"Jan 17, 2025", views:356, img:"massey-ferguson-tractor", desc:"Massey Ferguson 375 tractor, 75 HP diesel engine. Good running condition, recently serviced. Includes canopy, drawbar, and PTO shaft. Ideal for plowing, harrowing, and hauling.", details:{HP:"75 HP",Condition:"Good",Fuel:"Diesel",Category:"Equipment"}, tags:["Tractor","75 HP"], seller:{name:"Ricardo Gomez",verified:true,phone:"+63 922 333 4567",avatar:"seller-ricardo"} },
    { id:4, title:"Corn Farm — 3 Hectares Fenced", type:"sale", price:"P850,000", priceNum:850000, location:"Tukuran", date:"Jan 15, 2025", views:312, img:"corn-farm-field", desc:"Fully fenced corn farm with sandy clay loam soil. Equipped with deep well and water pump. Post-harvest facility nearby. Two cropping seasons per year.", details:{Area:"3 hectares",Soil:"Sandy Clay Loam",Water:"Deep Well + Pump",Category:"Land"}, tags:["Fenced","With Pump"], seller:{name:"Arturo Bacsarpa",verified:true,phone:"+63 945 222 3456",avatar:"seller-arturo"} },
    { id:5, title:"Rice Thresher — One Season", type:"sale", price:"P42,000", priceNum:42000, location:"Margsatubig", date:"Jan 14, 2025", views:198, img:"rice-thresher-machine", desc:"Rice thresher used for one season only. Engine in excellent condition. High threshing efficiency with minimal grain damage. Portable design, easy to transport.", details:{Condition:"Like New",Usage:"One Season",Fuel:"Gasoline",Category:"Equipment"}, tags:["Thresher","Like New"], seller:{name:"Emilio Reyes",verified:false,phone:"+63 917 444 5678",avatar:"seller-emilio"} },
    { id:6, title:"Hand Tractor + Trailer — Exchange", type:"exchange", price:"Exchange Deal", priceNum:0, location:"Molave", date:"Jan 12, 2025", views:267, img:"hand-tractor-trailer", desc:"China Bravo hand tractor with custom-built trailer. Good running condition. Owner wants to exchange for livestock (carabao, cow, or goats) of equivalent value.", details:{Brand:"China Bravo",Condition:"Good",Includes:"Trailer",Category:"Equipment"}, tags:["Exchange","With Trailer"], seller:{name:"Jose Amaca",verified:true,phone:"+63 945 456 7890",avatar:"seller-jose"} },
    { id:7, title:"5 Hectare Coconut Land", type:"rent", price:"P25,000/year", priceNum:25000, location:"Aurora", date:"Jan 15, 2025", views:342, img:"coconut-plantation-row", desc:"Mature coconut plantation with 400+ bearing trees. Average yield of 5,000 nuts per quarter. Flat terrain with good drainage. Accessible via barangay road.", details:{Area:"5 hectares",Soil:"Sandy Loam",Water:"Rainfed",Category:"Land"}, tags:["Coconut","400+ Trees"], seller:{name:"Concepcion Dalagan",verified:true,phone:"+63 935 345 6789",avatar:"seller-conce"} },
    { id:8, title:"Rice Paddy Land — Irrigated", type:"sale", price:"P1,500,000", priceNum:1500000, location:"Lanao del Norte", date:"Jan 10, 2025", views:224, img:"rice-paddy-irrigated", desc:"Irrigated rice paddy with reliable water supply from communal irrigation system. Two to three cropping seasons possible. Flat terrain, alluvial soil, near farm-to-market road.", details:{Area:"2.5 hectares",Soil:"Alluvial",Water:"Irrigated",Category:"Land"}, tags:["Irrigated","Rice"], seller:{name:"Mariano Lavi",verified:true,phone:"+63 926 555 6789",avatar:"seller-mariano"} },
    { id:9, title:"Diesel Water Pump Set", type:"sale", price:"P15,000", priceNum:15000, location:"Tudela", date:"Jan 8, 2025", views:156, img:"diesel-water-pump", desc:"Robin diesel water pump set, 3 HP. Complete with hoses and connectors. Used for two seasons, well-maintained. Perfect for irrigation or dewatering.", details:{HP:"3 HP",Condition:"Good",Fuel:"Diesel",Category:"Equipment"}, tags:["Pump","Diesel"], seller:{name:"Danilo Capitan",verified:false,phone:"+63 919 666 7890",avatar:"seller-danilo"} },
    { id:10, title:"Banana Plantation — 2 Hectares", type:"rent", price:"P35,000/year", priceNum:35000, location:"Molave", date:"Jan 6, 2025", views:203, img:"banana-plantation-green", desc:"Productive banana plantation with Cavendish variety. Currently bearing fruit, ready for harvest. Includes post-harvest packing area. Flat land with good drainage.", details:{Area:"2 hectares",Variety:"Cavendish",Water:"Rainfed",Category:"Farm"}, tags:["Banana","Bearing"], seller:{name:"Lorna Fuentes",verified:true,phone:"+63 938 777 8901",avatar:"seller-lorna"} },
    { id:11, title:"Kubota M7040 — 70 HP Tractor", type:"sale", price:"P450,000", priceNum:450000, location:"Ozamiz", date:"Jan 4, 2025", views:289, img:"kubota-tractor-red", desc:"Kubota M7040 compact tractor, 70 HP. 4WD with power steering. Includes front loader attachment. Low hours, regularly serviced. Excellent for various farm operations.", details:{HP:"70 HP",Condition:"Good",Drive:"4WD",Category:"Equipment"}, tags:["Kubota","4WD"], seller:{name:"Fernando Villanueva",verified:true,phone:"+63 927 888 9012",avatar:"seller-fernando"} },
    { id:12, title:"Organic Farm Land — 4 Hectares", type:"sale", price:"P2,100,000", priceNum:2100000, location:"Don Victoriano", date:"Jan 2, 2025", views:176, img:"organic-farm-land", desc:"Certified organic farm land with diverse crops. Rich volcanic soil, elevated location with cool climate. Existing fruit trees and vegetable beds. Ideal for organic farming business.", details:{Area:"4 hectares",Soil:"Volcanic",Certification:"Organic",Category:"Land"}, tags:["Organic","Volcanic Soil"], seller:{name:"Grace Almonte",verified:true,phone:"+63 936 999 0123",avatar:"seller-grace"} }
];

let myListings = [
    { id:101, title:'Corn Farm — 1 Hectare', price:'P280,000', status:'active', type:'sale', img:'corn-farm-field' },
    { id:102, title:'Mini Cultivator', price:'P18,000', status:'pending', type:'sale', img:'diesel-water-pump' }
];

let payments = [
    { type:'income', icon:'💰', title:'Rental Payment — Coconut Land', date:'Jan 20, 2025', amount:'+P25,000' },
    { type:'expense', icon:'📤', title:'Listing Fee — Corn Farm', date:'Jan 18, 2025', amount:'-P150' },
    { type:'income', icon:'💰', title:'Sale — Mini Plow Equipment', date:'Jan 10, 2025', amount:'+P8,500' },
    { type:'expense', icon:'📤', title:'Listing Fee — Carabao', date:'Jan 8, 2025', amount:'-P150' },
    { type:'income', icon:'💰', title:'Rental Payment — Rice Field', date:'Dec 30, 2024', amount:'+P12,000' }
];

let messages = [
    { id:1, name:'Jose Amaca', init:'JA', preview:'Is the tractor still available?', time:'5m', unread:true, thread:[
        {from:'them', text:'Hi! Is the tractor still available?', time:'10:32 AM'},
        {from:'me', text:'Yes it is! Are you interested in exchanging?', time:'10:34 AM'},
        {from:'them', text:'Yes, I have two goats I can offer.', time:'10:36 AM'}
    ]},
    { id:2, name:'Rosa Mendez', init:'RM', preview:'When can I visit the farm?', time:'1h', unread:true, thread:[
        {from:'them', text:'Good day! When can I visit the farm?', time:'9:15 AM'},
        {from:'me', text:'You can visit this Saturday morning.', time:'9:20 AM'}
    ]},
    { id:3, name:'Arturo Bacsarpa', init:'AB', preview:'Thank you for your interest!', time:'2h', unread:false, thread:[
        {from:'them', text:'Thank you for your interest in my corn farm!', time:'8:00 AM'}
    ]}
];

let favorites = new Set();
let currentChatId = null;
let editingListingId = null;
let _confirmCb = null;

// ── TOAST ──
function toast(msg, type = 's') {
    const box = document.getElementById('toastBox');
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    const icons = { s: 'fa-check-circle', i: 'fa-info-circle', w: 'fa-exclamation-triangle' };
    t.innerHTML = `<i class="fas ${icons[type] || 'fa-info-circle'}"></i>${msg}`;
    box.appendChild(t);
    setTimeout(() => { if (t.parentNode) t.remove(); }, 3200);
}

// ── CONFIRM / SUCCESS ──
function showConfirm(title, sub, icon, btnClass, cb) {
    _confirmCb = cb;
    document.getElementById('confirmIcon').textContent = icon;
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmSub').innerHTML = sub;
    const btn = document.getElementById('confirmOkBtn');
    btn.className = btnClass === 'red'
        ? 'flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition'
        : 'flex-1 py-2.5 bg-agri-500 text-white rounded-xl text-sm font-semibold hover:bg-agri-600 transition';
    document.getElementById('confirmOverlay').classList.add('show');
    document.body.style.overflow = 'hidden';
}
function confirmOk() { closeConfirm('confirmOverlay'); if (_confirmCb) _confirmCb(); _confirmCb = null; }
function confirmCancel() { closeConfirm('confirmOverlay'); }
function showSuccess(title, sub) {
    document.getElementById('successTitle').textContent = title;
    document.getElementById('successSub').textContent = sub;
    document.getElementById('successOverlay').classList.add('show');
    document.body.style.overflow = 'hidden';
}
function closeConfirm(id) { document.getElementById(id).classList.remove('show'); document.body.style.overflow = ''; }

// ── RENDER CARDS ──
function renderCards(data) {
    const grid = document.getElementById('listingsGrid');
    const noRes = document.getElementById('noResults');
    const countEl = document.getElementById('listingCountText');
    if (!data.length) {
        grid.innerHTML = '';
        noRes.classList.remove('hidden');
        countEl.textContent = 'No listings found';
        return;
    }
    noRes.classList.add('hidden');
    countEl.textContent = `Browse ${data.length} listing${data.length !== 1 ? 's' : ''} from verified sellers across the region`;
    grid.innerHTML = data.map((item, i) => {
        const bc = item.type === 'sale' ? 'badge-sale' : item.type === 'rent' ? 'badge-rent' : 'badge-exchange';
        const bt = item.type === 'sale' ? 'For Sale' : item.type === 'rent' ? 'For Rent' : 'Exchange';
        const liked = favorites.has(item.id);
        return `<div class="card fade-up" style="animation-delay:${i * 60}ms">
            <div class="card-img">
                <img src="https://picsum.photos/seed/${item.img}/400/280.jpg" alt="${item.title}" loading="lazy">
                <span class="badge ${bc}">${bt}</span>
                <button class="fav-btn ${liked ? 'liked' : ''}" onclick="event.stopPropagation();toggleFav(${item.id},this)"><i class="${liked ? 'fas' : 'far'} fa-heart text-sm ${liked ? 'text-red-500' : 'text-gray-500'}"></i></button>
                <div class="view-btn" onclick="event.stopPropagation();openDetail(${item.id})"><i class="fas fa-eye mr-1"></i>View Details</div>
            </div>
            <div class="p-4" onclick="openDetail(${item.id})">
                <h3 class="font-semibold text-gray-900 text-sm mb-1.5 leading-snug" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${item.title}</h3>
                <p class="${item.type === 'exchange' ? 'text-orange-500' : 'text-agri-600'} font-bold text-sm mb-2">${item.price}</p>
                <div class="flex items-center gap-3 text-xs text-gray-400 mb-3">
                    <span><i class="fas fa-map-marker-alt text-agri-400 mr-1"></i>${item.location}</span>
                    <span><i class="far fa-eye text-agri-400 mr-1"></i>${item.views}</span>
                </div>
                <div class="flex flex-wrap gap-1.5 mb-3">${item.tags.map(t => `<span class="stat-pill">${t}</span>`).join('')}</div>
                <div class="flex items-center gap-2 pt-3 border-t border-gray-50">
                    <img src="https://picsum.photos/seed/${item.seller.avatar}/28/28.jpg" class="w-6 h-6 rounded-full object-cover">
                    <span class="text-xs text-gray-600 truncate flex-1">${item.seller.name}</span>
                    ${item.seller.verified ? '<span class="text-[9px] bg-agri-500 text-white px-1.5 py-0.5 rounded-full font-semibold">Verified</span>' : ''}
                </div>
            </div>
        </div>`;
    }).join('');
}

// ── FILTERS ──
function applyFilters() {
    const typeVal = document.getElementById('typeSelect').value;
    const catVal = document.getElementById('categorySelect').value;
    const q = document.getElementById('searchInput').value.trim().toLowerCase();
    let f = [...listings];
    if (typeVal !== 'all') f = f.filter(l => l.type === typeVal);
    if (catVal !== 'all') f = f.filter(l => (l.details.Category || '').toLowerCase() === catVal);
    if (q) f = f.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q) ||
        l.price.toLowerCase().includes(q) ||
        l.tags.some(t => t.toLowerCase().includes(q)) ||
        l.seller.name.toLowerCase().includes(q)
    );
    renderCards(f);
}
function doSearch() { applyFilters(); }
function resetFilters() {
    document.getElementById('typeSelect').value = 'all';
    document.getElementById('categorySelect').value = 'all';
    document.getElementById('searchInput').value = '';
    renderCards(listings);
}

// ── FAVORITES ──
function toggleFav(id, btn) {
    if (favorites.has(id)) {
        favorites.delete(id);
        btn.classList.remove('liked');
        btn.querySelector('i').className = 'far fa-heart text-sm text-gray-500';
        toast('Removed from favorites', 'i');
    } else {
        favorites.add(id);
        btn.classList.add('liked');
        btn.querySelector('i').className = 'fas fa-heart text-sm text-red-500';
        toast('Added to favorites!', 's');
    }
}

// ── DETAIL MODAL ──
function openDetail(id) {
    const item = listings.find(l => l.id === id); if (!item) return;
    const bc = item.type === 'sale' ? 'badge-sale' : item.type === 'rent' ? 'badge-rent' : 'badge-exchange';
    const bt = item.type === 'sale' ? 'For Sale' : item.type === 'rent' ? 'For Rent' : 'Exchange';
    document.getElementById('modalContent').innerHTML = `
        <div class="relative">
            <img src="https://picsum.photos/seed/${item.img}/600/340.jpg" class="w-full h-56 sm:h-64 object-cover">
            <span class="badge ${bc}" style="top:14px;left:14px">${bt}</span>
            <button onclick="closeModal('detailModal')" class="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:bg-white transition"><i class="fas fa-times text-gray-600 text-sm"></i></button>
        </div>
        <div class="p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-1">${item.title}</h2>
            <div class="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
                <span><i class="fas fa-map-marker-alt text-agri-500 mr-1"></i>${item.location}</span>
                <span><i class="far fa-calendar text-agri-500 mr-1"></i>${item.date}</span>
                <span><i class="far fa-eye text-agri-500 mr-1"></i>${item.views} views</span>
            </div>
            <p class="${item.type === 'exchange' ? 'text-orange-500' : 'text-agri-600'} text-2xl font-bold mb-4">${item.price}</p>
            <p class="text-sm text-gray-600 leading-relaxed mb-5">${item.desc}</p>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
                ${Object.entries(item.details).map(([k, v]) => `<div class="bg-agri-50 rounded-lg p-3 text-center border border-agri-100"><p class="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">${k}</p><p class="text-sm font-semibold text-gray-900">${v}</p></div>`).join('')}
            </div>
            <div class="flex flex-wrap gap-2 mb-5">${item.tags.map(t => `<span class="stat-pill">${t}</span>`).join('')}</div>
            <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-5">
                <img src="https://picsum.photos/seed/${item.seller.avatar}/48/48.jpg" class="w-12 h-12 rounded-full object-cover border-2 border-agri-200">
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2"><span class="font-semibold text-gray-900 text-sm">${item.seller.name}</span>${item.seller.verified ? '<span class="text-[9px] bg-agri-500 text-white px-1.5 py-0.5 rounded-full font-semibold">Verified</span>' : ''}</div>
                    <p class="text-xs text-gray-500"><i class="fas fa-phone mr-1"></i>${item.seller.phone}</p>
                </div>
                <button onclick="openMessageSeller(${item.id})" class="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-xs font-medium"><i class="fas fa-comment mr-1"></i>Chat</button>
            </div>
            <div class="flex gap-3">
                <button onclick="openContact(${item.id})" class="flex-1 py-3 border-2 border-agri-500 text-agri-600 rounded-xl font-semibold text-sm hover:bg-agri-50 transition flex items-center justify-center gap-2"><i class="fas fa-phone-alt"></i>Contact</button>
                ${item.type === 'rent' ? `<button onclick="openRent(${item.id})" class="flex-1 py-3 bg-agri-500 text-white rounded-xl font-semibold text-sm hover:bg-agri-600 transition flex items-center justify-center gap-2"><i class="fas fa-key"></i>Rent Now</button>` : ''}
                ${item.type === 'sale' ? `<button onclick="openBuy(${item.id})" class="flex-1 py-3 bg-agri-500 text-white rounded-xl font-semibold text-sm hover:bg-agri-600 transition flex items-center justify-center gap-2"><i class="fas fa-shopping-cart"></i>Buy Now</button>` : ''}
                ${item.type === 'exchange' ? `<button onclick="openExchange(${item.id})" class="flex-1 py-3 bg-orange-500 text-white rounded-xl font-semibold text-sm hover:bg-orange-600 transition flex items-center justify-center gap-2"><i class="fas fa-exchange-alt"></i>Propose Exchange</button>` : ''}
            </div>
        </div>`;
    openModal('detailModal');
}

// ── CONTACT ──
function openContact(id) {
    const item = listings.find(l => l.id === id); if (!item) return;
    document.getElementById('contactSellerInfo').innerHTML = `
        <img src="https://picsum.photos/seed/${item.seller.avatar}/40/40.jpg" class="w-10 h-10 rounded-full object-cover">
        <div>
            <p class="font-semibold text-sm text-gray-900">${item.seller.name} ${item.seller.verified ? '<span class="text-[9px] bg-agri-500 text-white px-1.5 py-0.5 rounded-full font-semibold ml-1">Verified</span>' : ''}</p>
            <p class="text-xs text-gray-500">${item.seller.phone}</p>
        </div>`;
    closeModal('detailModal');
    setTimeout(() => openModal('contactModal'), 200);
}
function doCall() { closeModal('contactModal'); toast('Connecting call to seller...', 'i'); }
function doSMS() { closeModal('contactModal'); toast('Opening message composer...', 'i'); }

// ── BUY ──
function openBuy(id) {
    const item = listings.find(l => l.id === id); if (!item) return;
    closeModal('detailModal');
    showConfirm('Confirm Purchase', `Send a purchase request for <strong>${item.title}</strong> at <strong>${item.price}</strong>?`, '🛒', 'green',
        () => showSuccess('Purchase Request Sent!', 'The seller will contact you shortly.')
    );
}

// ── RENT ──
function openRent(id) {
    const item = listings.find(l => l.id === id); if (!item) return;
    document.getElementById('rentItemInfo').innerHTML = `
        <img src="https://picsum.photos/seed/${item.img}/48/48.jpg" class="w-10 h-10 rounded-lg object-cover">
        <div><p class="font-semibold text-sm text-gray-900">${item.title}</p><p class="text-agri-600 font-bold text-sm">${item.price}</p></div>`;
    closeModal('detailModal');
    setTimeout(() => openModal('rentModal'), 200);
}
function submitRent(e) { e.preventDefault(); closeModal('rentModal'); showSuccess('Rental Request Sent!', 'The seller will confirm your rental soon.'); e.target.reset(); }

// ── EXCHANGE ──
function openExchange(id) {
    const item = listings.find(l => l.id === id); if (!item) return;
    document.getElementById('exchangeItemInfo').innerHTML = `
        <img src="https://picsum.photos/seed/${item.img}/48/48.jpg" class="w-10 h-10 rounded-lg object-cover">
        <div><p class="font-semibold text-sm text-gray-900">${item.title}</p><p class="text-orange-500 font-bold text-sm">${item.price}</p></div>`;
    closeModal('detailModal');
    setTimeout(() => openModal('exchangeModal'), 200);
}
function submitExchange(e) { e.preventDefault(); closeModal('exchangeModal'); showSuccess('Exchange Proposed!', 'The seller will review your proposal and reply.'); e.target.reset(); }

// ── MESSAGES ──
function openMessages() { renderMessageList(); openModal('messagesModal'); }
function renderMessageList() {
    document.getElementById('msgThreadView').style.display = 'none';
    document.getElementById('msgListView').style.display = 'block';
    document.getElementById('msgPanelTitle').textContent = 'Messages';
    document.getElementById('msgList').innerHTML = messages.map(m => `
        <button type="button" onclick="openChat(${m.id})" class="w-full text-left p-4 bg-gray-50 rounded-3xl border border-gray-100 transition hover:bg-gray-100">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full bg-agri-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">${m.init}</div>
                    <div><div class="font-semibold text-gray-900 text-sm">${m.name}</div><div class="text-xs text-gray-500">${m.preview}</div></div>
                </div>
                <div class="flex flex-col items-end gap-1">
                    <span class="text-xs text-gray-400">${m.time}</span>
                    ${m.unread ? '<span class="w-2 h-2 bg-agri-500 rounded-full"></span>' : ''}
                </div>
            </div>
        </button>`).join('');
    updateMsgBadge();
}
function openChat(id) {
    currentChatId = id;
    const m = messages.find(x => x.id === id); if (!m) return;
    m.unread = false;
    updateMsgBadge();
    document.getElementById('msgListView').style.display = 'none';
    document.getElementById('msgThreadView').style.display = 'block';
    document.getElementById('msgPanelTitle').textContent = m.name;
    document.getElementById('msgThread').innerHTML = m.thread.map(b => `
        <div class="${b.from === 'me' ? 'text-right' : 'text-left'}">
            <div class="inline-block px-4 py-2.5 rounded-3xl ${b.from === 'me' ? 'bg-agri-500 text-white' : 'bg-gray-100 text-gray-800'} max-w-[80%] text-sm">${b.text}</div>
            <div class="text-[10px] text-gray-400 mt-1">${b.time}</div>
        </div>`).join('');
    const t = document.getElementById('msgThread');
    t.scrollTop = t.scrollHeight;
}
function sendChatMessage() {
    const inp = document.getElementById('chatInput');
    const text = inp.value.trim(); if (!text) return;
    const m = messages.find(x => x.id === currentChatId); if (!m) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    m.thread.push({ from: 'me', text, time });
    m.preview = text; m.time = 'now';
    inp.value = '';
    openChat(currentChatId);
    toast('Message sent', 's');
}
function msgBackToList() { renderMessageList(); }
function openMessageSeller(idOrSeller) {
    let seller;
    if (typeof idOrSeller === 'number') {
        const item = listings.find(l => l.id === idOrSeller); if (!item) return;
        seller = { name: item.seller.name, init: item.seller.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() };
    } else { seller = idOrSeller; }
    let thread = messages.find(m => m.name === seller.name);
    if (!thread) {
        thread = { id: Date.now(), name: seller.name, init: seller.init, preview: '', time: 'now', unread: false, thread: [] };
        messages.unshift(thread);
    }
    closeModal('detailModal');
    openModal('messagesModal');
    setTimeout(() => openChat(thread.id), 100);
}
function updateMsgBadge() {
    const unread = messages.filter(m => m.unread).length;
    const dot = document.getElementById('msgDot');
    if (dot) dot.style.display = unread ? 'block' : 'none';
}

// ── NOTIFICATIONS ──
function showNotifications() {
    const dot = document.getElementById('notifDot');
    if (dot) dot.style.display = 'none';
    openModal('notificationsModal');
}
function openNotificationDetail(type) {
    if (type === 'inquiry') { closeModal('notificationsModal'); openModal('messagesModal'); setTimeout(() => openChat(1), 100); return; }
    closeModal('notificationsModal');
    if (type === 'approved') { toast('Your pumpkin harvester listing is live in the marketplace.', 's'); }
    else if (type === 'payment') { openPayments(); }
}

// ── PROFILE ──
function openProfile() {
    document.getElementById('profileAvatarDisplay').textContent = currentUser.initials;
    document.getElementById('profileNameDisplay').textContent = currentUser.name;
    document.getElementById('profilePhoneDisplay').textContent = currentUser.phone;
    openModal('profileModal');
}

// ── POST LISTING ──
function openPostListing() {
    closeModal('profileModal');
    document.getElementById('pageModalTitle').textContent = 'Post Listing';
    document.getElementById('pageModalBody').innerHTML = `
        <div class="space-y-4">
            <div class="flex gap-2 flex-wrap" id="postTypePills">
                <button type="button" class="type-pill active" onclick="selectType(this)">For Sale</button>
                <button type="button" class="type-pill" onclick="selectType(this)">For Rent</button>
                <button type="button" class="type-pill" onclick="selectType(this)">Exchange</button>
            </div>
            <div><label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input id="postTitle" type="text" placeholder="e.g. 3-Hectare Rice Farm" class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-agri-500"></div>
            <div><label class="block text-sm font-medium text-gray-700 mb-1">Price / Terms</label>
                <input id="postPrice" type="text" placeholder="e.g. P500,000 or P20,000/year" class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-agri-500"></div>
            <div><label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input id="postLocation" type="text" placeholder="e.g. Pagadian City" class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-agri-500"></div>
            <div><label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select id="postCategory" class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-agri-500">
                    <option value="Land">Land</option><option value="Equipment">Equipment</option><option value="Farm">Farm</option>
                </select></div>
            <div><label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea id="postDesc" rows="3" placeholder="Describe your listing..." class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-agri-500 resize-none"></textarea></div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Photos</label>
                <label class="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-agri-400 transition">
                    <i class="fas fa-camera text-gray-400"></i>
                    <span id="postImgText" class="text-sm text-gray-500">Tap to add photos</span>
                    <input type="file" accept="image/*" multiple class="hidden" onchange="handlePhotoUpload(this)">
                </label>
                <div id="postImgPreview" class="flex gap-2 flex-wrap mt-2"></div>
            </div>
            <button type="button" onclick="submitListing()" class="w-full py-3 bg-agri-500 text-white rounded-xl font-semibold text-sm hover:bg-agri-600 transition"><i class="fas fa-plus mr-2"></i>Post Listing</button>
        </div>`;
    openModal('pageModal');
}
function selectType(el) {
    document.querySelectorAll('.type-pill').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
}
function handlePhotoUpload(input) {
    const preview = document.getElementById('postImgPreview'); if (!preview) return;
    preview.innerHTML = '';
    Array.from(input.files).forEach(file => {
        const url = URL.createObjectURL(file);
        const img = document.createElement('img');
        img.src = url; img.className = 'img-preview-thumb';
        preview.appendChild(img);
    });
    const txt = document.getElementById('postImgText');
    if (txt) txt.textContent = input.files.length + ' photo(s) selected';
}
function submitListing() {
    const title = (document.getElementById('postTitle') || {}).value?.trim();
    const price = (document.getElementById('postPrice') || {}).value?.trim();
    const location = (document.getElementById('postLocation') || {}).value?.trim();
    const desc = (document.getElementById('postDesc') || {}).value?.trim();
    const category = (document.getElementById('postCategory') || {}).value || 'Land';
    const typeEl = document.querySelector('.type-pill.active');
    const typeLabel = typeEl ? typeEl.textContent.trim() : 'For Sale';
    if (!title) { toast('Please enter a title', 'w'); return; }
    if (!price) { toast('Please enter a price or terms', 'w'); return; }
    if (!location) { toast('Please enter a location', 'w'); return; }
    const typeMap = { 'For Sale': 'sale', 'For Rent': 'rent', 'Exchange': 'exchange' };
    const imgMap = { 'Land': 'organic-farm-land', 'Equipment': 'diesel-water-pump', 'Farm': 'vegetable-farm-green' };
    const newId = Date.now();
    const newItem = {
        id: newId, title, price, priceNum: 0, type: typeMap[typeLabel] || 'sale',
        location, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        views: 0, img: imgMap[category] || 'organic-farm-land',
        desc: desc || 'No description provided.',
        details: { Category: category }, tags: [category],
        seller: { name: currentUser.name, verified: true, phone: currentUser.phone, avatar: 'seller-new' }
    };
    listings.unshift(newItem);
    myListings.unshift({ id: newId, title, price, status: 'pending', type: typeMap[typeLabel] || 'sale', img: imgMap[category] || 'organic-farm-land' });
    closeModal('pageModal');
    renderCards(listings);
    showSuccess('Listing Submitted! 🎉', `"${title}" is now pending review and will be live shortly.`);
}

// ── MY LISTINGS ──
function openMyListings() { closeModal('profileModal'); document.getElementById('pageModalTitle').textContent = 'My Listings'; renderMyListingsContent(); openModal('pageModal'); }
function renderMyListingsContent() {
    const body = document.getElementById('pageModalBody');
    if (!myListings.length) { body.innerHTML = '<p class="text-center text-gray-400 py-8">No listings yet. Tap Post Listing to create one.</p>'; return; }
    body.innerHTML = `
        <div class="space-y-3">
            ${myListings.map(l => `
            <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <img src="https://picsum.photos/seed/${l.img || 'corn-farm-field'}/48/48.jpg" class="w-12 h-12 rounded-xl object-cover flex-shrink-0">
                <div class="flex-1 min-w-0">
                    <div class="font-semibold text-sm text-gray-900 truncate">${l.title}</div>
                    <div class="text-agri-600 text-xs font-bold">${l.price}</div>
                    <span class="text-[10px] px-2 py-0.5 rounded-full font-semibold ${l.status === 'active' ? 'bg-agri-100 text-agri-700' : 'bg-yellow-100 text-yellow-700'}">${l.status === 'active' ? 'Active' : 'Pending'}</span>
                </div>
                <div class="flex gap-2 flex-shrink-0">
                    <button onclick="openEditListing(${l.id})" class="p-2 bg-blue-50 text-blue-600 rounded-lg text-xs hover:bg-blue-100 transition"><i class="fas fa-edit"></i></button>
                    <button onclick="confirmDeleteListing(${l.id})" class="p-2 bg-red-50 text-red-500 rounded-lg text-xs hover:bg-red-100 transition"><i class="fas fa-trash"></i></button>
                </div>
            </div>`).join('')}
        </div>
        <button onclick="openPostListing()" class="mt-4 w-full py-3 bg-agri-500 text-white rounded-xl font-semibold text-sm hover:bg-agri-600 transition"><i class="fas fa-plus mr-2"></i>Post New Listing</button>`;
}
function confirmDeleteListing(id) {
    const l = myListings.find(x => x.id === id); if (!l) return;
    showConfirm('Delete Listing', `Are you sure you want to delete <strong>${l.title}</strong>? This cannot be undone.`, '🗑️', 'red', () => {
        myListings.splice(myListings.findIndex(x => x.id === id), 1);
        const gi = listings.findIndex(x => x.id === id);
        if (gi !== -1) listings.splice(gi, 1);
        renderMyListingsContent();
        renderCards(listings);
        toast('Listing deleted', 'i');
    });
}
function openEditListing(id) {
    const l = myListings.find(x => x.id === id); if (!l) return;
    editingListingId = id;
    document.getElementById('editTitle').value = l.title;
    document.getElementById('editPrice').value = l.price;
    document.getElementById('editStatus').value = l.status;
    document.getElementById('editOverlay').classList.add('show');
    document.body.style.overflow = 'hidden';
}
function saveEditListing() {
    const title = document.getElementById('editTitle').value.trim();
    const price = document.getElementById('editPrice').value.trim();
    const status = document.getElementById('editStatus').value;
    if (!title || !price) { toast('Title and price are required', 'w'); return; }
    const ml = myListings.find(x => x.id === editingListingId);
    const gl = listings.find(x => x.id === editingListingId);
    if (ml) { ml.title = title; ml.price = price; ml.status = status; }
    if (gl) { gl.title = title; gl.price = price; }
    closeConfirm('editOverlay');
    renderMyListingsContent();
    renderCards(listings);
    toast('Listing updated!', 's');
}

// ── PAYMENTS ──
function openPayments() {
    closeModal('profileModal');
    closeModal('notificationsModal');
    document.getElementById('pageModalTitle').textContent = 'Payments';
    const income = payments.filter(p => p.type === 'income').reduce((s, p) => s + parseInt(p.amount.replace(/[^0-9]/g, '')), 0);
    const expense = payments.filter(p => p.type === 'expense').reduce((s, p) => s + parseInt(p.amount.replace(/[^0-9]/g, '')), 0);
    document.getElementById('pageModalBody').innerHTML = `
        <div class="grid grid-cols-2 gap-3 mb-5">
            <div class="bg-agri-50 rounded-2xl p-4 border border-agri-100 text-center">
                <p class="text-xs text-gray-500 mb-1">Total Income</p>
                <p class="text-lg font-bold text-agri-600">P${income.toLocaleString()}</p>
            </div>
            <div class="bg-red-50 rounded-2xl p-4 border border-red-100 text-center">
                <p class="text-xs text-gray-500 mb-1">Total Expense</p>
                <p class="text-lg font-bold text-red-500">P${expense.toLocaleString()}</p>
            </div>
        </div>
        <div class="space-y-3">
            ${payments.map(p => `
            <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl ${p.type === 'income' ? 'bg-agri-100' : 'bg-red-100'}">${p.icon}</div>
                <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-gray-900 truncate">${p.title}</div>
                    <div class="text-xs text-gray-400">${p.date}</div>
                </div>
                <div class="font-bold text-sm ${p.type === 'income' ? 'text-agri-600' : 'text-red-500'} flex-shrink-0">${p.amount}</div>
            </div>`).join('')}
        </div>`;
    openModal('pageModal');
}

// ── PROFILE INFO ──
function openProfileInfo() {
    closeModal('profileModal');
    document.getElementById('pageModalTitle').textContent = 'Profile Info';
    document.getElementById('pageModalBody').innerHTML = `
        <div class="flex flex-col items-center mb-5">
            <div class="w-16 h-16 rounded-full bg-agri-500 text-white flex items-center justify-center text-2xl font-bold mb-2">${currentUser.initials}</div>
        </div>
        <div class="space-y-3">
            <div><label class="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Full Name</label>
                <input id="piName" type="text" value="${currentUser.name}" class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-agri-500"></div>
            <div><label class="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Phone</label>
                <input id="piPhone" type="tel" value="${currentUser.phone}" class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-agri-500"></div>
            <div><label class="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Email</label>
                <input id="piEmail" type="email" value="${currentUser.email}" class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-agri-500"></div>
            <div><label class="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Location</label>
                <input id="piLocation" type="text" value="${currentUser.location}" class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-agri-500"></div>
            <button type="button" onclick="saveProfileInfo()" class="w-full py-3 bg-agri-500 text-white rounded-xl font-semibold text-sm hover:bg-agri-600 transition mt-2"><i class="fas fa-save mr-2"></i>Save Changes</button>
        </div>`;
    openModal('pageModal');
}
function saveProfileInfo() {
    const name = document.getElementById('piName').value.trim();
    const phone = document.getElementById('piPhone').value.trim();
    const email = document.getElementById('piEmail').value.trim();
    const location = document.getElementById('piLocation').value.trim();
    if (!name) { toast('Name is required', 'w'); return; }
    if (!phone) { toast('Phone is required', 'w'); return; }
    currentUser.name = name; currentUser.phone = phone;
    currentUser.email = email; currentUser.location = location;
    currentUser.initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    closeModal('pageModal');
    toast('Profile updated!', 's');
}

// ── LOGOUT ──
function doLogout() {
    closeModal('profileModal');
    showConfirm('Log Out', 'Are you sure you want to log out?', '🚪', 'red', () => {
        toast('Logged out successfully', 'w');
    });
}

// ── NAV / MISC ──
function goHome() {
    document.querySelectorAll('.modal-bg.show').forEach(m => { m.classList.remove('show'); });
    document.body.style.overflow = '';
    resetFilters();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast('Back to home', 'i');
}

// ── MODAL HELPERS ──
function openModal(id) { document.getElementById(id).classList.add('show'); document.body.style.overflow = 'hidden'; }
function closeModal(id) { document.getElementById(id).classList.remove('show'); document.body.style.overflow = ''; }

// Close modal on background click
document.querySelectorAll('.modal-bg').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) { m.classList.remove('show'); document.body.style.overflow = ''; } });
});
document.querySelectorAll('.confirm-overlay').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) { m.classList.remove('show'); document.body.style.overflow = ''; } });
});
document.querySelectorAll('.edit-overlay').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) { m.classList.remove('show'); document.body.style.overflow = ''; } });
});

// Escape key closes all
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-bg.show, .confirm-overlay.show, .edit-overlay.show').forEach(m => { m.classList.remove('show'); });
        document.body.style.overflow = '';
    }
});

// Chat input Enter key
document.getElementById('chatInput').addEventListener('keydown', e => { if (e.key === 'Enter') sendChatMessage(); });

// ── INIT ──
renderCards(listings);
updateMsgBadge();