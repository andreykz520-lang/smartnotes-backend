/**
 * Main JavaScript for Furniture Salon Landing Page
 * Salon «Пинскдрев» на ул. Благодатная, 80 (Белгород)
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initCategoryFilters();
  initPhoneMasking();
});

/* ==========================================================================
   Navigation & Mobile Menu
   ========================================================================== */
function initNavigation() {
  const toggle = document.getElementById('mobileToggle');
  const nav = document.getElementById('mainNav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });

    // Close mobile nav when clicking a link
    nav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
      });
    });
  }
}

/* ==========================================================================
   Category Filter Tabs
   ========================================================================== */
function initCategoryFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.catalog-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      cards.forEach(card => {
        const categories = card.getAttribute('data-category') || '';
        if (filter === 'all' || categories.includes(filter)) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.35s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   Interactive Quiz Logic
   ========================================================================== */
let currentQuizStep = 1;

window.nextQuizStep = function(step) {
  const steps = document.querySelectorAll('.quiz-step');
  steps.forEach(s => s.classList.remove('active'));

  const targetStep = document.querySelector(`.quiz-step[data-step="${step}"]`);
  if (targetStep) {
    targetStep.classList.add('active');
    currentQuizStep = step;
    updateQuizProgress(step);
  }
};

window.prevQuizStep = function(step) {
  window.nextQuizStep(step);
};

function updateQuizProgress(step) {
  const progressFill = document.getElementById('quizProgress');
  if (progressFill) {
    const percent = Math.round((step / 3) * 100);
    progressFill.style.width = `${percent}%`;
  }
}

window.submitQuiz = async function(event) {
  event.preventDefault();

  const selectedFurniture = document.querySelector('input[name="furniture_type"]:checked')?.value || 'Не выбрано';
  const selectedStyle = document.querySelector('input[name="style_type"]:checked')?.value || 'Не выбрано';
  const contactMethod = document.querySelector('input[name="contact_method"]:checked')?.value || 'Телефонный звонок';
  const name = document.getElementById('quizName')?.value || '';
  const phone = document.getElementById('quizPhone')?.value || '';

  const submitBtn = event.target.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn ? submitBtn.textContent : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка заявки...';
  }

  try {
    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        phone,
        category: selectedFurniture,
        comment: `Стиль: ${selectedStyle}, Связь: ${contactMethod}`,
        source: 'quiz'
      })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok && data.error) {
      alert(data.error || 'Ошибка отправки заявки. Попробуйте еще раз или позвоните нам.');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
      return;
    }

    // Hide steps and show success
    document.querySelectorAll('.quiz-step').forEach(s => s.style.display = 'none');
    const successBox = document.getElementById('quizSuccess');
    if (successBox) {
      successBox.style.display = 'block';
    }
    const progressFill = document.getElementById('quizProgress');
    if (progressFill) {
      progressFill.style.width = '100%';
    }
  } catch (err) {
    console.error('Lead error:', err);
    // Show success anyway if server is unreachable but form filled
    document.querySelectorAll('.quiz-step').forEach(s => s.style.display = 'none');
    const successBox = document.getElementById('quizSuccess');
    if (successBox) {
      successBox.style.display = 'block';
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  }
};

window.resetQuiz = function() {
  document.getElementById('quizForm')?.reset();
  const successBox = document.getElementById('quizSuccess');
  if (successBox) {
    successBox.style.display = 'none';
  }
  document.querySelectorAll('.quiz-step').forEach(s => {
    s.style.display = '';
    s.classList.remove('active');
  });
  window.nextQuizStep(1);
};

/* ==========================================================================
   Modal Dialog Logic
   ========================================================================== */
window.openModal = function(subject = 'Заказ консультации') {
  const modal = document.getElementById('leadModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalSubject = document.getElementById('modalSubject');
  const modalForm = document.getElementById('modalForm');
  const modalSuccess = document.getElementById('modalSuccess');

  if (modalTitle) modalTitle.textContent = subject;
  if (modalSubject) modalSubject.value = subject;
  if (modalForm) modalForm.style.display = 'block';
  if (modalSuccess) modalSuccess.style.display = 'none';

  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
};

window.closeModal = function() {
  const modal = document.getElementById('leadModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
};

window.closeModalOnBackdrop = function(event) {
  if (event.target.id === 'leadModal') {
    closeModal();
  }
};

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
  }
});

window.submitModalLead = async function(event) {
  event.preventDefault();

  const name = document.getElementById('leadName')?.value || '';
  const phone = document.getElementById('leadPhone')?.value || '';
  const comment = document.getElementById('leadComment')?.value || '';
  const subject = document.getElementById('modalSubject')?.value || 'Заявка с сайта';

  const submitBtn = event.target.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn ? submitBtn.textContent : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка заявки...';
  }

  try {
    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        phone,
        comment,
        category: subject,
        source: 'modal'
      })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok && data.error) {
      alert(data.error || 'Ошибка отправки заявки. Попробуйте еще раз или позвоните нам.');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
      return;
    }

    const form = document.getElementById('modalForm');
    const successState = document.getElementById('modalSuccess');
    if (form) form.style.display = 'none';
    if (successState) successState.style.display = 'block';
  } catch (err) {
    console.error('Lead error:', err);
    const form = document.getElementById('modalForm');
    const successState = document.getElementById('modalSuccess');
    if (form) form.style.display = 'none';
    if (successState) successState.style.display = 'block';
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  }
};

/* ==========================================================================
   Phone Input Masking Helper
   ========================================================================== */
function initPhoneMasking() {
  const phoneInputs = document.querySelectorAll('input[type="tel"]');

  phoneInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.startsWith('7') || value.startsWith('8')) {
        value = value.substring(1);
      }
      
      let formatted = '+7 ';
      if (value.length > 0) {
        formatted += '(' + value.substring(0, 3);
      }
      if (value.length >= 4) {
        formatted += ') ' + value.substring(3, 6);
      }
      if (value.length >= 7) {
        formatted += '-' + value.substring(6, 8);
      }
      if (value.length >= 9) {
        formatted += '-' + value.substring(8, 10);
      }
      e.target.value = formatted;
    });

    input.addEventListener('focus', (e) => {
      if (!e.target.value) {
        e.target.value = '+7 ';
      }
    });

    input.addEventListener('blur', (e) => {
      if (e.target.value === '+7 ' || e.target.value === '+7') {
        e.target.value = '';
      }
    });
  });
}

/* ==========================================================================
   Phone Click Analytics Tracker
   ========================================================================== */
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="tel:"]');
  if (link) {
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/click-phone');
      } else {
        fetch('/api/click-phone', { method: 'POST', keepalive: true }).catch(() => {});
      }
    } catch (err) {}
  }
});
