const translations = {
  en: {
    "nav_start": "Start a Project",
    "hero_title": "Brands that<br /><em>Live</em> &amp;<br />Breathe.",
    "hero_desc": "I craft visual identities that speak before a word is said — logos, brand systems, and design languages built to last.",
    "btn_view": "View My Work",
    "btn_start": "Start a Project",
    "about_label": "About Me",
    "about_bio": "I'm a <strong>Brand Designer</strong> obsessed with the craft of identity. Every mark I create starts with a question: what should people <strong>feel</strong> the moment they see this brand? Then I design backwards from that feeling.<br><br>Based in Giza, Egypt — I translate ideas into <strong>visual systems</strong> that are sharp, meaningful, and built to last.",
    "stat_years": "Years Experience",
    "stat_brands": "Brands Crafted",
    "stat_clients": "Happy Clients",
    "services_label": "Services",
    "service_1_title": "Logo Design",
    "service_1_desc": "Creating memorable, scalable, and timeless marks that represent the core of your business.",
    "service_2_title": "Visual Identity",
    "service_2_desc": "Developing complete design systems including color palettes, typography, and graphic elements.",
    "service_3_title": "Brand Guidelines",
    "service_3_desc": "Comprehensive rulebooks ensuring your brand is applied consistently across all touchpoints.",
    "portfolio_label": "Selected Works",
    "contact_label": "Ready to start?",
    "contact_desc": "Let's build something great together. Fill out the form or reach me directly.",
    "form_name": "Your Name",
    "form_email": "Your Email",
    "form_service": "Select a Service",
    "form_message": "Tell me about your project...",
    "btn_submit": "Send Message",
    "footer_rights": "© 2026 Khaled Shaaban. All rights reserved.",
    "footer_loc": "Brand Designer — Giza, Egypt"
  },
  ar: {
    "nav_start": "ابدأ مشروعك",
    "hero_title": "علامات تجارية<br /><em>تنبض</em><br />بالحياة.",
    "hero_desc": "أبتكر هويات بصرية تتحدث عن نفسها قبل النطق بكلمة — شعارات، أنظمة تصميم، ولغات بصرية مبنية لتدوم.",
    "btn_view": "شاهد أعمالي",
    "btn_start": "ابدأ مشروعك",
    "about_label": "عني",
    "about_bio": "أنا <strong>مصمم هويات بصرية</strong> مهووس بالتفاصيل. كل شعار أصممه يبدأ بسؤال: ماذا يجب أن <strong>يشعر</strong> الناس عند رؤية هذه العلامة؟ ثم أصمم بناءً على هذا الشعور.<br><br>مستقر في الجيزة، مصر — أترجم الأفكار إلى <strong>أنظمة بصرية</strong> حادة، ذات معنى، ومبنية لتبقى.",
    "stat_years": "سنوات خبرة",
    "stat_brands": "علامات تم بناؤها",
    "stat_clients": "عملاء سعداء",
    "services_label": "خدماتي",
    "service_1_title": "تصميم الشعار",
    "service_1_desc": "ابتكار شعارات لا تُنسى، قابلة للتوسع، وتمثل جوهر عملك.",
    "service_2_title": "الهوية البصرية",
    "service_2_desc": "تطوير أنظمة تصميم متكاملة تشمل الألوان، الخطوط، والعناصر الجرافيكية.",
    "service_3_title": "دليل العلامة التجارية",
    "service_3_desc": "كتيب إرشادات شامل يضمن تطبيق هويتك بشكل متناسق في كل مكان.",
    "portfolio_label": "أعمال مختارة",
    "contact_label": "جاهز لنبدأ؟",
    "contact_desc": "دعنا نبني شيئاً عظيماً معاً. املأ النموذج أو تواصل معي مباشرة.",
    "form_name": "اسمك",
    "form_email": "بريدك الإلكتروني",
    "form_service": "اختر الخدمة",
    "form_message": "حدثني عن مشروعك...",
    "btn_submit": "إرسال الرسالة",
    "footer_rights": "© 2026 خالد شعبان. جميع الحقوق محفوظة.",
    "footer_loc": "مصمم هويات بصرية — الجيزة، مصر"
  }
};

let currentLang = localStorage.getItem('lang') || 'en';

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  
  if (lang === 'ar') {
    document.documentElement.dir = 'rtl';
    document.body.classList.add('ar-lang');
    document.body.classList.remove('en-lang');
  } else {
    document.documentElement.dir = 'ltr';
    document.body.classList.add('en-lang');
    document.body.classList.remove('ar-lang');
  }

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key]) {
      if(el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = translations[lang][key];
      } else {
        el.innerHTML = translations[lang][key];
      }
    }
  });

  // Update button text
  const langToggle = document.getElementById('langToggle');
  if (langToggle) {
    langToggle.textContent = lang === 'ar' ? 'EN' : 'عربي';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setLang(currentLang);
  const langToggle = document.getElementById('langToggle');
  if (langToggle) {
    langToggle.addEventListener('click', (e) => {
      e.preventDefault();
      setLang(currentLang === 'en' ? 'ar' : 'en');
    });
  }
});
