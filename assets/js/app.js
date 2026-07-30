// Cek Auth di setiap halaman kecuali login
if (!window.location.pathname.includes('login.html')) {
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (!session) window.location.href = 'login.html';
  });
}

// Register Service Worker untuk PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

// === FUNGSI REALTIME NOTIFIKASI ===
function setupRealtimeNotifications() {
  supabase.channel('custom-all-channel')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pelanggan' }, payload => {
      if (payload.new.status === 'Sudah Diambil') {
        Swal.fire({
          toast: true, position: 'top-end', icon: 'success',
          title: `✅ Perangkat berhasil diambil!\nNama: ${payload.new.nama_pelanggan}\nWilayah: ${payload.new.wilayah}\nTeknisi: ${payload.new.teknisi}`,
          showConfirmButton: false, timer: 5000, background: '#16A34A', color: '#fff'
        });
      }
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'aktivitas' }, payload => {
      // Opsional: Update UI riwayat realtime
    })
    .subscribe();
}
setupRealtimeNotifications();

// === FUNGSI DASHBOARD ===
async function initDashboard() {
  const { data: pelanggan } = await supabase.from('pelanggan').select('*');
  if (!pelanggan) return;

  document.getElementById('totalData').innerText = pelanggan.length;
  document.getElementById('totalDiambil').innerText = pelanggan.filter(p => p.status === 'Sudah Diambil').length;

  const wilayahList = ['Sukamelang', 'Cibarola', 'Panglejar', 'Perum / Flamboyan'];
  const container = document.getElementById('wilayahCards');
  const chartData = { labels: [], diambil: [], belum: [] };

  container.innerHTML = '';
  wilayahList.forEach(w => {
    const dataW = pelanggan.filter(p => p.wilayah === w);
    const diambil = dataW.filter(p => p.status === 'Sudah Diambil').length;
    const belum = dataW.filter(p => p.status !== 'Sudah Diambil').length;

    chartData.labels.push(w);
    chartData.diambil.push(diambil);
    chartData.belum.push(belum);

    container.innerHTML += `
      <div class="glass-card" onclick="window.location.href='admin.html?wilayah=${w}'" style="cursor: pointer;">
        <h4 style="margin-bottom: 12px;">${w}</h4>
        <div style="display: flex; justify-content: space-between; font-size: 14px;">
          <span>Total: <b>${dataW.length}</b></span>
          <span style="color: #FCA5A5;">Belum: <b>${belum}</b></span>
          <span style="color: #86EFAC;">Diambil: <b>${diambil}</b></span>
        </div>
      </div>
    `;
  });

  // Chart.js
  new Chart(document.getElementById('wilayahChart'), {
    type: 'bar',
    data: {
      labels: chartData.labels,
      datasets: [
        { label: 'Sudah Diambil', data: chartData.diambil, backgroundColor: '#16A34A', borderRadius: 8 },
        { label: 'Belum Diambil', data: chartData.belum, backgroundColor: '#DC2626', borderRadius: 8 }
      ]
    },
    options: { responsive: true, plugins: { legend: { labels: { color: 'white' } } }, scales: { y: { ticks: { color: 'white' } }, x: { ticks: { color: 'white' } } } }
  });
}

// === FUNGSI FORMAT WHATSAPP ===
function formatWA(nomor) {
  let clean = nomor.replace(/\D/g, '');
  if (clean.startsWith('0')) clean = '62' + clean.substring(1);
  return `https://wa.me/${clean}`;
}

// === FUNGSI GOOGLE MAPS PICKER (Untuk Admin) ===
function initMapPicker() {
  const map = new google.maps.Map(document.getElementById("map-picker"), {
    zoom: 15, center: { lat: -6.9175, lng: 107.6191 }, // Default Bandung
  });
  const marker = new google.maps.Marker({ position: map.getCenter(), map, draggable: true });
  const geocoder = new google.maps.Geocoder();

  map.addListener("click", (e) => {
    marker.setPosition(e.latLng);
    updateAddress(e.latLng);
  });
  marker.addListener("dragend", () => {
    updateAddress(marker.getPosition());
  });

  function updateAddress(latLng) {
    document.getElementById('latitude').value = latLng.lat();
    document.getElementById('longitude').value = latLng.lng();
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === "OK" && results[0]) {
        document.getElementById('alamat').value = results[0].formatted_address;
      }
    });
  }
}

// === FUNGSI TEKNISI: SELESAI ===
async function completeTask(pelangganId, teknisiNama) {
  const { value: formValues } = await Swal.fire({
    title: 'Konfirmasi Penyelesaian',
    html: `
      <input id="swal-tanggal" class="swal2-input" type="date" value="${new Date().toISOString().split('T')[0]}" placeholder="Tanggal Penarikan">
      <textarea id="swal-catatan" class="swal2-textarea" placeholder="Catatan Opsional"></textarea>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: '✅ YA, Sudah Diambil',
    cancelButtonText: 'Batal',
    preConfirm: () => {
      return {
        tanggal: document.getElementById('swal-tanggal').value,
        catatan: document.getElementById('swal-catatan').value
      }
    }
  });

  if (formValues) {
    const { error } = await supabase.from('pelanggan').update({
      status: 'Sudah Diambil',
      tanggal_penarikan: formValues.tanggal,
      teknisi: teknisiNama,
      catatan: formValues.catatan
    }).eq('id', pelangganId);

    if (!error) {
      Swal.fire('Berhasil!', 'Perangkat telah ditandai sebagai diambil.', 'success');
      setTimeout(() => window.location.reload(), 1500);
    } else {
      Swal.fire('Error', error.message, 'error');
    }
  }
}
