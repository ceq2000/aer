const S = window.SITE;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const icon = (d) => `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
const slug = (n) => n.toLowerCase().replace(/\W+/g, "-");
document.getElementById("app").innerHTML = `
<header><b class="logo">${esc(S.brand)}<i>2.0</i></b><nav>${S.nav.map(n => `<a href="#${slug(n)}">${esc(n)}</a>`).join("")}</nav><a class="btn sm" href="${S.calendly}">Book a call</a></header>
<main id="main">
<section class="hero" id="home"><div class="orb o1"></div><div class="orb o2"></div>
<span class="pill">AI · Cloud · Automation</span><h1>${esc(S.hero)}</h1><p class="lead">${esc(S.pitch)}</p><a class="btn" href="${S.calendly}">${esc(S.heroCta)}</a>
<div class="flow" aria-hidden="true"><span>Data</span><i></i><span class="hot">AI</span><i></i><span>Action</span></div></section>
<section class="stats">${S.metrics.map(m => `<div><strong>${esc(m.n)}</strong><span>${esc(m.l)}</span></div>`).join("")}</section>
<section id="services"><h2>What we build</h2><div class="grid5">${S.services.map(([t,d,i]) => `<article class="card">${icon(i)}<h3>${esc(t)}</h3><p>${esc(d)}</p></article>`).join("")}</div></section>
<section id="success-stories"><h2>Selected work</h2><div class="grid3">${S.works.map(([t,d,s]) => `<article class="work"><div class="thumb"></div><h3>${esc(t)}</h3><small>${esc(s)}</small></article>`).join("")}</div></section>
<section class="cta"><h2>Let's automate something.</h2><a class="btn" href="${S.calendly}">Schedule a call</a></section>
<section id="contact"><h2>Say hello</h2><form onsubmit="event.preventDefault();this.reset();alert('Demo form: nothing sent.')"><input required placeholder="Name"><input required type="email" placeholder="Email"><textarea required placeholder="How can we help?"></textarea><button class="btn">Send</button></form></section>
</main>
<footer><b>${esc(S.brand)}</b> ${esc(S.company)} · ${esc(S.email)} · ${esc(S.phone)}<br><small>Privacy Policy</small></footer>`;
