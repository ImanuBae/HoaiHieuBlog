// File: gallery.js


const galleryItems = [
    {
        id: 1,
        title: "Environmental Portrait",
        description: "<b>Genre:</b> Environmental Portrait.<br><b>Techniques:</b> Natural, soft light (golden hour or shade). Shallow depth of field (bokeh) from a wide aperture.<br><b>Composition:</b> Subject on left third-line, with leading lines from the road and fence.",
        image: "image/img12.jpg"
    },
    {
        id: 2,
        title: "Environmental Portrait",
        description: "<b>Genre:</b> Environmental Portrait.<br><b>Techniques:</b> Natural, soft light with shallow depth of field. Shot from a slight low-angle.<br><b>Composition:</b> Subject on left third-line. Diagonals from the pose and fence add dynamism.",
        image: "image/img13.jpg"
    },
    {
        id: 3,
        title: "Strobist Portrait",
        description: "<b>Genre:</b> Strobist Portrait (Flash + Ambient).<br><b>Techniques:</b> Balances off-camera flash on the subject with the ambient twilight exposure of the sky.<br><b>Composition:</b> Subject on right third-line, using negative space for balance.",
        image: "image/img14.jpg"
    },
    {
        id: 4,
        title: "Portrait", 
        description: "<b>Genre:</b> Portrait Photography.<br><b>Techniques:</b> Natural daylight (possibly in shade). Post-processed with a 'bloom' effect and added color.<br><b>Composition:</b> Subject on left third-line, high-angle shot.",
        image: "image/img16.jpg" 
    },
    {
        id: 5,
        title: "Seascape", 
        description: "<b>Genre:</b> Seascape Photography.<br><b>Techniques:</b> Shot during 'blue hour' after sunset. Well-balanced exposure between the sky and water.<br><b>Composition:</b> Horizon on the bottom third, boats act as a focal point.",
        image: "image/img18.jpg"
    },
    {
    id: 6,
        title: "Landscape (Frame in Frame)", 
        description: "<b>Genre:</b> Landscape Photography.<br><b>Techniques:</b> 'Frame within a Frame' composition, shooting the sunset through a window. Creates a high-contrast silhouette.<br><b>Composition:</b> Sun placed near the top-right third.",
        image: "image/img19.jpg"
    
    },
    {
    id: 7,
        title: "Silhouette (Pattern)", 
        description: "<b>Genre:</b> Landscape / Architectural.<br><b>Techniques:</b> Strong silhouette shot from a dark interior. Exposed for the bright sky outside.<br><b>Composition:</b> Uses the repeating pattern of the windows for rhythm.",
        image: "image/img20.jpg"
    
    }
];

// Khởi chạy ứng dụng
document.addEventListener('DOMContentLoaded', () => {
    renderGalleryItems();
    initializeGalleryCardAnimations() // Dùng lại hiệu ứng từ blog
});

// ===== HIỂN THỊ TÁC PHẨM =====
function renderGalleryItems() {
    const container = document.getElementById('gallery-container');
    if (!container) return;
    container.innerHTML = '';

    galleryItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'gallery-card';
        card.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <div class="gallery-info">
                <h3>${item.title}</h3>
                <p>${item.description}</p>
            </div>
        `;
        
        card.addEventListener('click', () => {
            showGalleryModal(item);
        });
        
        container.appendChild(card);
    });
}

// ===== HIỂN THỊ MODAL (POP-UP) =====
function showGalleryModal(item) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    // HTML cho modal, đơn giản hơn modal blog
    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close">&times;</span>
            <div class="modal-body">
                <img src="${item.image}" alt="${item.title}" style="width: 100%; border-radius: 8px; margin-bottom: 1rem;">
                <h3 style="margin-top: 0;">${item.title}</h3>
                <p>${item.description}</p>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Chức năng đóng modal
    const closeModal = () => {
        modal.remove();
        document.body.style.overflow = 'auto';
    };

    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    }, { once: true });
}

// ===== HIỆU ỨNG THẺ KHI CUỘN (Sao chép từ blog.js) =====
function initializeGalleryCardAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.gallery-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}