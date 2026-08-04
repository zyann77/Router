document.addEventListener('DOMContentLoaded', () => {
    // 1. Waktu Realtime
    const lockClock = document.getElementById('lock-clock');
    const lockDate = document.getElementById('lock-date');
    const homeClock = document.getElementById('home-clock');
    const homeDate = document.getElementById('home-date');

    const updateTime = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const timeStr = `${hours}:${minutes}`;
        const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' });

        if(lockClock) lockClock.textContent = timeStr;
        if(homeClock) homeClock.textContent = timeStr;
        if(lockDate) lockDate.textContent = dateStr;
        if(homeDate) homeDate.textContent = dateStr;
    };
    setInterval(updateTime, 1000);
    updateTime();

    // 2. Transisi Layar Halus (Unlock)
    const lockScreen = document.getElementById('lock-screen');
    const homeScreen = document.getElementById('home-screen');
    const unlockTrigger = document.getElementById('unlock-trigger');
    let isUnlocked = false;

    const unlockDevice = () => {
        if (isUnlocked) return;
        isUnlocked = true;
        
        // Haptic feedback jika didukung (Android)
        if (navigator.vibrate) navigator.vibrate(50);
        
        lockScreen.classList.add('unlocking');
        homeScreen.classList.remove('hidden');
        
        setTimeout(() => {
            lockScreen.style.display = 'none';
            startCounters(); // Jalankan animasi angka
        }, 800);
    };

    unlockTrigger.addEventListener('click', unlockDevice);
    
    // Swipe to unlock
    let touchStartY = 0;
    document.addEventListener('touchstart', e => touchStartY = e.changedTouches[0].screenY);
    document.addEventListener('touchend', e => {
        if (!isUnlocked && touchStartY - e.changedTouches[0].screenY > 60) {
            unlockDevice();
        }
    });

    // 3. Animasi Angka Premium (Ease Out)
    const startCounters = () => {
        const counters = document.querySelectorAll('.counter');
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            let count = 0;
            const duration = 2000; // 2 detik
            const start = performance.now();

            const updateCount = (currentTime) => {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease out cubic
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
    };

    // 4. Efek 3D Tilt ala Vision Pro (Hanya Desktop)
    const tiltElements = document.querySelectorAll('.tilt-effect');
    tiltElements.forEach(el => {
        el.addEventListener('mousemove', e => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const tiltX = ((y - centerY) / centerY) * -10; // Max tilt 10 deg
            const tiltY = ((x - centerX) / centerX) * 10;
            
            el.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
        });
        
        el.addEventListener('mouseleave', () => {
            el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
            el.style.transition = `transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)`;
        });
        
        el.addEventListener('mouseenter', () => {
            el.style.transition = `none`; // Hapus transisi saat bergerak agar responsif
        });
    });
});
