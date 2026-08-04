// ==================== PARTICLE SYSTEM ====================
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.5 + 0.1;
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.reset();
        }
    }
    
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 169, 97, ${this.opacity})`;
        ctx.fill();
    }
}

for (let i = 0; i < 50; i++) {
    particles.push(new Particle());
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateParticles);
}
animateParticles();

// ==================== TOUCH GLOW ====================
const touchGlow = document.getElementById('touchGlow');

document.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    touchGlow.style.left = touch.clientX + 'px';
    touchGlow.style.top = touch.clientY + 'px';
    touchGlow.classList.add('active');
});

document.addEventListener('touchend', () => {
    setTimeout(() => touchGlow.classList.remove('active'), 300);
});

document.addEventListener('mousemove', (e) => {
    touchGlow.style.left = e.clientX + 'px';
    touchGlow.style.top = e.clientY + 'px';
    touchGlow.classList.add('active');
});

// ==================== CLOCK ====================
const hariIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const bulanIndo = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function updateClock() {
    const now = new Date();
    const jam = String(now.getHours()).padStart(2, '0');
    const menit = String(now.getMinutes()).padStart(2, '0');
    const detik = String(now.getSeconds()).padStart(2, '0');
    const hari = hariIndo[now.getDay()];
    const tanggal = now.getDate();
    const bulan = bulanIndo[now.getMonth()];
    const tahun = now.getFullYear();
    
    // Lock screen
    const lockTime = document.getElementById('lockTime');
    const lockSeconds = document.getElementById('lockSeconds');
    const lockDate = document.getElementById('lockDate');
    if (lockTime) lockTime.textContent = `${jam}:${menit}`;
    if (lockSeconds) lockSeconds.textContent = `:${detik}`;
    if (lockDate) lockDate.textContent = `${hari}, ${tanggal} ${bulan}`;
    
    // Status bar
    const statusTime = document.getElementById('statusTime');
    if (statusTime) statusTime.textContent = `${jam}:${menit}`;
    
    // Widget
    const widgetTime = document.getElementById('widgetTime');
    const widgetDate = document.getElementById('widgetDate');
    if (widgetTime) widgetTime.textContent = `${jam}:${menit}`;
    if (widgetDate) widgetDate.textContent = `${hari}, ${tanggal} ${bulan} ${tahun}`;
}

updateClock();
setInterval(updateClock, 1000);

// ==================== COUNTER ANIMATION ====================
function animateCounter(element, target, duration = 1500) {
    if (!element) return;
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target;
        }
    }
    
    requestAnimationFrame(update);
}

// ==================== LOAD DATA DARI SUPABASE ====================
async function loadStats() {
    try {
        // Cek apakah Supabase tersedia
        if (typeof supabase === 'undefined') {
            // Fallback data
            animateCounter(document.getElementById('widgetOnline'), 12);
            animateCounter(document.getElementById('widgetPending'), 55);
            animateCounter(document.getElementById('widgetDone'), 7);
            animateCounter(document.getElementById('statPelanggan'), 62);
            animateCounter(document.getElementById('statHariIni'), 3);
            animateCounter(document.getElementById('widgetOnlineHome'), 12);
            animateCounter(document.getElementById('widgetPendingHome'), 55);
            return;
        }
        
        // Load dari Supabase jika config.js ada
        if (typeof SUPABASE_URL !== 'undefined') {
            const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            const { data } = await supabaseClient.from('pelanggan').select('status');
            
            if (data) {
                const online = data.filter(p => p.status === 'Sudah Diambil').length;
                const pending = data.filter(p => p.status === 'Belum Diambil').length;
                const total = data.length;
                
                animateCounter(document.getElementById('widgetOnline'), online);
                animateCounter(document.getElementById('widgetPending'), pending);
                animateCounter(document.getElementById('widgetDone'), online);
                animateCounter(document.getElementById('statPelanggan'), total);
                animateCounter(document.getElementById('statHariIni'), pending);
                animateCounter(document.getElementById('widgetOnlineHome'), online);
                animateCounter(document.getElementById('widgetPendingHome'), pending);
            }
        }
    } catch (err) {
        console.log('Stats load error:', err);
    }
}

loadStats();

// ==================== UNLOCK ====================
const lockScreen = document.getElementById('lockScreen');
const homeScreen = document.getElementById('homeScreen');
const unlockOverlay = document.getElementById('unlockOverlay');
const unlockHint = document.getElementById('unlockHint');

function unlock() {
    // Animasi overlay
    unlockOverlay.classList.add('active');
    
    setTimeout(() => {
        lockScreen.classList.add('unlocked');
        homeScreen.classList.add('active');
        
        setTimeout(() => {
            unlockOverlay.classList.remove('active');
        }, 500);
    }, 300);
}

if (unlockHint) {
    unlockHint.addEventListener('click', unlock);
    unlockHint.addEventListener('touchstart', (e) => {
        e.preventDefault();
        unlock();
    });
}

// Juga unlock saat tap di mana saja di lock screen
if (lockScreen) {
    lockScreen.addEventListener('click', (e) => {
        if (e.target === lockScreen || e.target.closest('.lock-content')) {
            unlock();
        }
    });
}

// ==================== DOCK FUNCTIONS ====================
function openSearch() {
    alert('🔍 Search - Coming Soon!');
}

function showNotification() {
    alert('🔔 Notifikasi\n\n• 3 tugas pending hari ini\n• 1 pelanggan isolir >30 hari\n• Update sistem tersedia');
}

function openSettings() {
    alert('⚙️ Settings - Coming Soon!');
}

// ==================== APP ICON RIPPLE ====================
document.querySelectorAll('.app-icon').forEach(icon => {
    icon.addEventListener('click', function(e) {
        // Tambah efek ripple
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.5);
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;
        
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
});

// Tambah keyframe ripple
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ==================== PREVENT ZOOM ====================
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('dblclick', (e) => e.preventDefault());
