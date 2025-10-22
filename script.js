// Khởi chạy ứng dụng
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    initializeSmoothScroll();
    initializeFormHandlers();
    initializeCardAnimations();
}

// ===== CUỘN MƯỢT =====
function initializeSmoothScroll() {
    document.querySelectorAll('.nav-menu a, .hero .btn-primary').forEach(anchor => {
        // Chỉ thêm sự kiện cho các link cuộn (bắt đầu bằng #)
        if (anchor.getAttribute('href').startsWith('#')) {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                document.querySelector(targetId)?.scrollIntoView({
                    behavior: 'smooth'
                });
            });
        }
    });
}

// ===== HIỆU ỨNG THẺ KHI CUỘN =====
function initializeCardAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.blog-card, .skill-card').forEach(el => {
        observer.observe(el);
    });
}

// ===== XỬ LÝ FORM LIÊN HỆ =====
function initializeFormHandlers() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Cảm ơn bạn đã liên hệ! Tôi sẽ phản hồi sớm nhất có thể.');
            contactForm.reset();
        });
    }
}