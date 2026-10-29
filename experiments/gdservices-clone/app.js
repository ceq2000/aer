const S = window.SITE, $ = (h) => h;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
document.getElementById("app").innerHTML = `
<header><b class="logo">${esc(S.brand)}</b><nav>${S.nav.map(n => `<a href="#${n.toLowerCase().replace(/\W+/g,"-")}">${esc(n)}</a>`).join("")}<a href="${S.linkedin}">LinkedIn</a></nav></header>
<main id="main">
<section class="hero" id="home"><h1>${esc(S.hero)}</h1><a class="btn" href="${S.calendly}">${esc(S.heroCta)}</a></section>
<section class="pitch"><h2>${esc(S.pitchTitle)}</h2><p>${esc(S.pitch)}</p>
<div class="metrics">${S.metrics.map(m => `<div><strong>${esc(m.n)}</strong><span>${esc(m.l)}</span></div>`).join("")}</div></section>
<section id="services"><h2>Services</h2><div class="grid4">${S.services.map(([t,d]) => `<article class="card"><div class="ill"></div><h3>${esc(t)}</h3><p>${esc(d)}</p><a href="#services">Read more</a></article>`).join("")}</div></section>
<section id="success-stories"><h2>Featured Works</h2><div class="grid3">${S.works.map(([t,d,s,x]) => `<article class="card"><h3>${esc(t)}</h3><small>${esc(d)} · ${esc(s)}</small><p>${esc(x)}</p><a class="btn sm" href="#success-stories">View Project</a></article>`).join("")}</div></section>
<section class="alt"><h2>Testimonials</h2><div class="grid3">${S.quotes.map(([q,n,r]) => `<blockquote>“${esc(q)}”<footer><b>${esc(n)}</b>, ${esc(r)}</footer></blockquote>`).join("")}</div></section>
<section class="cta"><h2>Book a free 30-minute consulting call</h2><a class="btn" href="${S.calendly}">Schedule a call</a></section>
<section id="contact"><h2>Say Hello</h2><form onsubmit="event.preventDefault();this.reset();alert('Demo form: nothing sent.')"><input required placeholder="Name"><input required type="email" placeholder="Email"><textarea required placeholder="How can we help?"></textarea><button class="btn">Send</button></form></section>
</main>
<footer><b>${esc(S.brand)}</b> ${esc(S.company)}<br>${esc(S.phone)} · ${esc(S.email)}<ul>${S.posts.map(p => `<li>${esc(p)}</li>`).join("")}</ul><small>Privacy Policy · © ${new Date().getFullYear()}</small></footer>`;
