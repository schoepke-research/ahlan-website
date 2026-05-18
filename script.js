// Nav: transparent over hero, cream on scroll
const nav = document.getElementById('nav');
const hero = document.getElementById('hero');

function updateNav() {
  if (window.scrollY > hero.offsetHeight * 0.6) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

// Form utility
function setFormState(form, msgEl, state, text) {
  const btn = form.querySelector('.form-btn');
  const btnText = form.querySelector('.btn-text');

  msgEl.textContent = '';
  msgEl.className = 'form-message';

  if (state === 'loading') {
    btnText.textContent = 'Sending…';
    btn.disabled = true;
  } else if (state === 'success') {
    btnText.textContent = btn.dataset.label || 'Send';
    btn.disabled = false;
    msgEl.textContent = text;
    msgEl.classList.add('success');
    form.reset();
  } else if (state === 'error') {
    btnText.textContent = btn.dataset.label || 'Send';
    btn.disabled = false;
    msgEl.textContent = text;
    msgEl.classList.add('error');
  }
}

// Newsletter form
const newsletterForm = document.getElementById('newsletter-form');
const newsletterMsg  = document.getElementById('newsletter-msg');

newsletterForm.querySelector('.form-btn').dataset.label = 'Subscribe';
newsletterForm.querySelector('.btn-text').textContent   = 'Subscribe';

newsletterForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = newsletterForm.email.value.trim();
  if (!email) return;

  setFormState(newsletterForm, newsletterMsg, 'loading');

  try {
    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    if (res.ok) {
      setFormState(newsletterForm, newsletterMsg, 'success', 'You’re subscribed.');
    } else {
      setFormState(newsletterForm, newsletterMsg, 'error', 'Something went wrong. Please try again.');
    }
  } catch {
    setFormState(newsletterForm, newsletterMsg, 'error', 'Something went wrong. Please try again.');
  }
});

// Contact form
const contactForm = document.getElementById('contact-form');
const contactMsg  = document.getElementById('contact-msg');

contactForm.querySelector('.form-btn').dataset.label = 'Send';
contactForm.querySelector('.btn-text').textContent   = 'Send';

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name    = contactForm.name.value.trim();
  const email   = contactForm.email.value.trim();
  const message = contactForm.message.value.trim();
  if (!name || !email || !message) return;

  setFormState(contactForm, contactMsg, 'loading');

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });

    if (res.ok) {
      setFormState(contactForm, contactMsg, 'success', 'Your message has been sent.');
    } else {
      setFormState(contactForm, contactMsg, 'error', 'Something went wrong. Please try again.');
    }
  } catch {
    setFormState(contactForm, contactMsg, 'error', 'Something went wrong. Please try again.');
  }
});
