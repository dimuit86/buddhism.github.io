
// assets/js/site.js
const ConfigURL = '/site-config.json';

async function loadConfig(){
  const r = await fetch(ConfigURL);
  return r.json();
}

async function loadContent(lang){
  const r = await fetch(`/content/${lang}/content.json`);
  if(!r.ok){
    const cfg = await loadConfig();
    return fetch(`/content/${cfg.defaultLang}/content.json`).then(x => x.json());
  }
  return r.json();
}

async function initSite(){
  const cfg = await loadConfig();
  const langs = cfg.availableLangs;
  const defaultLang = cfg.defaultLang || 'en';
  const urlLang = new URLSearchParams(location.search).get('lang');
  const lang = langs.includes(urlLang) ? urlLang : (localStorage.getItem('site-lang') || defaultLang);

  const langSelect = document.getElementById('lang-select');
  if(langSelect){
    langs.forEach(l => {
      const opt = document.createElement('option');
      opt.value = l; opt.textContent = l.toUpperCase();
      if(l === lang) opt.selected = true;
      langSelect.appendChild(opt);
    });
    langSelect.addEventListener('change', async (e) => {
      const to = e.target.value;
      localStorage.setItem('site-lang', to);
      await renderAll(to);
    });
  }

  await renderAll(lang);
}

async function renderAll(lang){
  const content = await loadContent(lang);
  const cfg = await loadConfig();
  document.querySelectorAll('.site-name').forEach(el => el.textContent = cfg.siteName);
  document.querySelectorAll('.site-tagline').forEach(el => el.textContent = cfg.tagline);
  document.querySelectorAll('.hero-img').forEach(el => {
    el.style.backgroundImage = `url(${content.site?.heroImage || cfg.heroImage || '/assets/images/hero.jpg'})`
  });

  const newsContainer = document.getElementById('news-list');
  if(newsContainer){
    newsContainer.innerHTML = '';
    (content.news || []).slice(0,5).forEach(item => {
      const node = document.createElement('article');
      node.className = 'flex gap-4 border-b pb-4 mb-4';
      node.innerHTML = `
        <img class="w-28 h-20 object-cover rounded" src="${item.image || '/assets/images/news-placeholder.jpg'}" alt="${item.title}">
        <div>
          <h4 class="font-semibold">${item.title}</h4>
          <p class="text-sm text-gray-600 mt-1">${item.excerpt || ''}</p>
          <a href="/news.html?id=${item.id}" class="text-sm text-indigo-600 mt-2 inline-block">Read more →</a>
        </div>
      `;
      newsContainer.appendChild(node);
    });
  }

  // render lists on other pages
  const sermonsList = document.getElementById('sermons-list');
  if(sermonsList){
    sermonsList.innerHTML = '';
    (content.sermons||[]).forEach(s=>{
      const n = document.createElement('div');
      n.className = 'mb-4';
      n.innerHTML = `<h3 class="font-semibold">${s.title}</h3><p class="text-sm text-gray-600">${s.excerpt||''}</p><a href="${s.audio||'#'}" class="text-sm text-indigo-600">Listen</a>`;
      sermonsList.appendChild(n);
    });
  }

  const about = document.getElementById('about-content');
  if(about){
    about.innerHTML = `<p class="text-gray-700">${content.site?.mission || ''}</p>`;
  }

  const donate = document.getElementById('donate-info');
  if(donate){
    donate.innerHTML = `<p>${cfg.donation.bank}<br/>${cfg.donation.account}</p><img src="${cfg.donation.qrImage}" alt="QR" class="w-48 mt-3">`;
  }

  const contact = document.getElementById('contact-info');
  if(contact){
    contact.innerHTML = `<p>Phone: <a href='tel:${cfg.contact.phone}'>${cfg.contact.phone}</a><br/>Email: <a href='mailto:${cfg.contact.email}'>${cfg.contact.email}</a><br/>Address: ${cfg.contact.address}</p>`;
  }

  const blogList = document.getElementById('blog-list');
  if(blogList){
    blogList.innerHTML = '<p>Use the CMS to add blog posts (stored in content/*).</p>';
  }

  const activities = document.getElementById('activities-list');
  if(activities){
    activities.innerHTML = '<p>Use the CMS to add activities and events.</p>';
  }

  const newsCollection = document.getElementById('news-collection');
  if(newsCollection){
    newsCollection.innerHTML = '';
    (content.news||[]).forEach(n=>{
      const el = document.createElement('article');
      el.className = 'mb-6 border-b pb-4';
      el.innerHTML = `<h2 class="text-xl font-semibold">${n.title}</h2><p class="text-sm text-gray-500">${n.date}</p><p class="mt-2">${n.excerpt}</p><a href="/news.html?id=${n.id}" class="text-indigo-600">Read more</a>`;
      newsCollection.appendChild(el);
    });
  }
}

window.addEventListener('DOMContentLoaded', initSite);
