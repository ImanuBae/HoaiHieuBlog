// File: hero-art.js - Hiệu ứng particles toàn trang web

let particles = [];
const numParticles = 100;

// Lớp Particle (Hạt)
class Particle {
  constructor() {
    // Vị trí ngẫu nhiên ban đầu
    this.x = random(width);
    this.y = random(height);
    // Vận tốc ngẫu nhiên
    this.vx = random(-0.8, 0.8);
    this.vy = random(-0.8, 0.8);
    // Kích thước lớn hơn để dễ nhìn
    this.size = random(5, 8);
    // Màu đỏ cam theo theme website - TĂNG ALPHA
    this.color = color(231, 76, 60, 180);
  }

  // Cập nhật vị trí
  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Đảo chiều nếu chạm cạnh
    if (this.x < 0 || this.x > width) {
      this.vx *= -1;
    }
    if (this.y < 0 || this.y > height) {
      this.vy *= -1;
    }
  }

  // Vẽ hạt
  show() {
    noStroke();
    fill(this.color);
    circle(this.x, this.y, this.size);
  }

  // Vẽ đường nối tới chuột
  connectMouse() {
    let d = dist(this.x, this.y, mouseX, mouseY);
    
    // Nếu chuột đủ gần (dưới 200px)
    if (d < 200) {
      let alpha = map(d, 0, 200, 200, 0);
      stroke(231, 76, 60, alpha);
      strokeWeight(2.5);
      line(this.x, this.y, mouseX, mouseY);
    }
  }

  // Kết nối với các hạt khác gần đó
  connectParticles(particles) {
    particles.forEach(other => {
      let d = dist(this.x, this.y, other.x, other.y);
      
      // Nếu 2 hạt gần nhau (dưới 120px)
      if (d < 120 && d > 0) {
        let alpha = map(d, 0, 120, 100, 0);
        stroke(231, 76, 60, alpha);
        strokeWeight(1.5);
        line(this.x, this.y, other.x, other.y);
      }
    });
  }
}

// === HÀM CỦA P5.JS ===

// Chạy 1 lần khi tải trang
function setup() {
  // Tạo canvas toàn màn hình
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('global-canvas');
  
  // Đặt canvas ở position fixed
  canvas.style('position', 'fixed');
  canvas.style('top', '0');
  canvas.style('left', '0');
  canvas.style('z-index', '-1');
  canvas.style('pointer-events', 'none');
  
  // Giảm số hạt trên mobile để tối ưu
  const count = windowWidth < 768 ? 40 : numParticles;
  
  // Tạo các hạt
  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }
  
  // Giảm FPS trên mobile để tiết kiệm pin
  if (windowWidth < 768) {
    frameRate(30);
  } else {
    frameRate(60);
  }
  
  console.log('✅ Particles initialized:', particles.length);
}

// Chạy liên tục (60 lần/giây)
function draw() {
  // Nền TRONG SUỐT để nhìn thấy nội dung
  clear();
  
  // Cập nhật và vẽ từng hạt
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    
    // Vẽ kết nối với hạt khác (chỉ kiểm tra hạt sau để tránh vẽ 2 lần)
    for (let j = i + 1; j < particles.length; j++) {
      let other = particles[j];
      let d = dist(p.x, p.y, other.x, other.y);
      
      if (d < 120) {
        let alpha = map(d, 0, 120, 100, 0);
        stroke(231, 76, 60, alpha);
        strokeWeight(1.5);
        line(p.x, p.y, other.x, other.y);
      }
    }
    
    p.update();
    p.show();
    p.connectMouse();
  }
}

// Hàm này sẽ được gọi mỗi khi thay đổi kích thước cửa sổ
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  // Cập nhật lại số lượng hạt
  const targetCount = windowWidth < 768 ? 40 : numParticles;
  
  if (particles.length > targetCount) {
    particles = particles.slice(0, targetCount);
  } else {
    while (particles.length < targetCount) {
      particles.push(new Particle());
    }
  }
  
  console.log('🔄 Resized - Particles:', particles.length);
}