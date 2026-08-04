document.addEventListener('DOMContentLoaded', () => {
    // 1. Waktu Realtime (Agar jam tidak 00:00)
    const lockClock = document.getElementById('lock-clock');
    const lockDate = document.getElementById('lock-date');
    const homeClock = document.getElementById('home-clock');
    const homeDate = document.getElementById('home-date');

    const updateTime = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const timeStr = `${hours}:${minutes}`;
        
        // Format tanggal: "Senin, 1 Jan"
        const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' });

        if(lockClock) lockClock.textContent = timeStr;
        if(homeClock) homeClock.textContent = timeStr;
        if(lockDate) lockDate.textContent = dateStr;
        if(homeDate) homeDate.textContent = dateStr;
    };
    
    // Update jam setiap 1 detik
    setInterval(updateTime, 1000);
    updateTime();

    // 2. Transisi Layar Halus (Unlock / Buka Kunci)
    const lockScreen = document.getElementById('lock-screen');
    const homeScreen = document.getElementById('home-screen');
    const unlockTrigger = document.getElementById('unlock-trigger');
    
    // Cek apakah user sudah membuka kunci sebelumnya (agar tidak perlu swipe terus saat refresh)
    let isUnlocked = sessionStorage.getItem('isUnlocked') === 'true'; 

    const unlockDevice = () => {
        if (isUnlocked && lockScreen.style.display === 'none') return;
        
        // Haptic feedback (getaran halus) jika HP mendukung
        if (navigator.vibrate) navigator.vibrate(50);
        
        // Jalankan animasi transisi
        lockScreen.classList.add('unlocking');
        homeScreen.classList.remove('hidden');
        
        // Hapus layar kunci setelah animasi selesai (0.8 detik)
        setTimeout(() => {
            lockScreen.style.display = 'none';
            isUnlocked = true;
            sessionStorage.setItem('isUnlocked', 'true'); 
            startCounters(); // Mulai animasi angka di dashboard
        }, 800);
    };

    // Jika statusnya sudah terbuka, langsung tampilkan menu utama
    if (isUnlocked) {
        if(lockScreen) lockScreen.style.display = 'none';
        if(homeScreen) homeScreen.classList.remove('hidden');
        startCounters();
    }

    // Cara 1: Buka kunci dengan klik tulisan "Swipe up to open"
    if (unlockTrigger) {
        unlockTrigger.addEventListener('click', unlockDevice);
    }
    
    // Cara 2: Buka kunci dengan di-swipe ke atas (Layar Sentuh / HP)
    let touchStartY = 0;
    document.addEventListener('touchstart', e => {
        if(!isUnlocked) touchStartY = e.changedTouches[0].screenY;
    });
    document.addEventListener('touchend', e => {
        if (!isUnlocked && touchStartY - e.changedTouches[0].screenY > 60) {
            unlockDevice();
        }
    });
    
    // Cara 3: Buka kunci dengan scroll mouse ke bawah (Laptop/PC)
    document.addEventListener('wheel', e => {
        if (!isUnlocked && e.deltaY > 20) {
            unlockDevice();
        }
    });

    // 3. Animasi Angka Bergerak di Dashboard (Ease Out)
    function startCounters() {
        const counters = document.querySelectorAll('.counter');
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            let count = 0;
            const duration = 2000; // Berjalan selama 2 detik
            const start = performance.now();

            const updateCount = (currentTime) => {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                
                // Efek animasi perlambatan di akhir (Ease out cubic)
                const easeOut = 1 - Math.pow(1 - progress, 3);
                
                count = Math.floor(easeOut * target);
                counter.innerText = count.toLocaleString('id-ID');

                if (progress < 1) {
                    requestAnimationFrame(updateCount);
                } else {
                    counter.innerText = target.toLocaleString('id-ID');
                }
            };
            requestAnimationFrame(updateCount);
        });
    }

    // 4. Efek 3D Tilt ala Vision Pro (Hanya berjalan di perangkat dengan Mouse/Kursor)
    if (window.matchMedia("(pointer: fine)").matches) {
        const tiltElements = document.querySelectorAll('.tilt-effect');
        tiltElements.forEach(el => {
            el.addEventListener('mousemove', e => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                // Kalkulasi kemiringan maksimal 10 derajat
                const tiltX = ((y - centerY) / centerY) * -10; 
                const tiltY = ((x - centerX) / centerX) * 10;
                
                el.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
            });
            
            el.addEventListener('mouseleave', () => {
                el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
                el.style.transition = `transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)`;
            });
            
            el.addEventListener('mouseenter', () => {
                el.style.transition = `none`; 
            });
        });
    }
});
