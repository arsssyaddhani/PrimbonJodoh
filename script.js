/* ============================================================
   PRIMBON JODOH WETON — script.js
   Kalkulasi Weton, Neptu & Integrasi AI Claude
   ============================================================ */

'use strict';

/* ===== TABEL DATA PRIMBON ===== */

const HARI = {
    nama:   ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
    neptu:  [5, 4, 3, 7, 8, 6, 9],
    watak:  [
        'dermawan, mandiri, dan berwibawa',
        'sabar, teliti, dan penuh dedikasi',
        'pemberani, tegas, dan penuh semangat',
        'bijaksana, kreatif, dan pandai berbicara',
        'jujur, bertanggung jawab, dan setia',
        'religius, lembut hati, dan penuh kasih sayang',
        'teguh pendirian, pekerja keras, dan setia'
    ]
};

const PASARAN = {
    nama:   ['Legi', 'Pahing', 'Pon', 'Wage', 'Kliwon'],
    neptu:  [5, 9, 7, 4, 8],
    watak:  [
        'disukai banyak orang dan memiliki daya tarik alami',
        'berpendirian teguh dan tidak mudah goyah',
        'berjiwa pemimpin dan suka menolong sesama',
        'mandiri, hemat, dan penuh perhitungan',
        'peka secara spiritual dan memiliki intuisi yang kuat'
    ]
};

/*
 * PETUNGAN PITU (Mod 7) — Kecocokan Umum
 * total % 7 → index 0..6
 * index 0 = sisa 0 = Sujanan
 */
const PITU = [
    {
        name:   'Sujanan',
        label:  'Rawan Perselisihan',
        desc:   'Hubungan ini membutuhkan kepercayaan dan komunikasi ekstra. Waspadai godaan dari pihak ketiga, dan jaga kesetiaan dengan sepenuh hati.',
        stars:  1,
        emoji:  '⚡',
        state:  'state-bad'
    },
    {
        name:   'Pegat',
        label:  'Penuh Tantangan',
        desc:   'Banyak ujian dalam rumah tangga. Butuh komitmen kuat dan kesabaran agar tetap bersama. Namun cinta sejati mampu mengatasi segalanya.',
        stars:  1,
        emoji:  '🌧️',
        state:  'state-bad'
    },
    {
        name:   'Ratu',
        label:  'Berjodoh & Dihormati',
        desc:   'Pasangan yang ideal dan diakui masyarakat. Kalian bagaikan raja dan ratu yang saling melengkapi dengan sempurna.',
        stars:  5,
        emoji:  '👑',
        state:  'state-great'
    },
    {
        name:   'Jodoh',
        label:  'Saling Cocok & Serasi',
        desc:   'Kecocokan yang alami. Kalian saling menerima dengan tulus, lahir dan batin. Hubungan yang harmonis dan penuh pengertian.',
        stars:  4,
        emoji:  '💚',
        state:  'state-good'
    },
    {
        name:   'Topo',
        label:  'Cobaan Berujung Bahagia',
        desc:   'Perjalanan awal mungkin penuh cobaan, namun kesabaran dan keteguhan hati akan membuahkan kebahagiaan abadi di kemudian hari.',
        stars:  3,
        emoji:  '🌱',
        state:  'state-medium'
    },
    {
        name:   'Tinari',
        label:  'Beruntung & Banyak Rezeki',
        desc:   'Rezeki mengalir deras dalam kehidupan bersama kalian. Keberuntungan senantiasa menaungi setiap langkah cinta kalian.',
        stars:  4,
        emoji:  '🌟',
        state:  'state-good'
    },
    {
        name:   'Padu',
        label:  'Hangat Namun Perlu Sabar',
        desc:   'Sering terjadi perbedaan pendapat, namun ikatan cinta kalian terlalu kuat untuk diputus. Komunikasi adalah kunci harmoni.',
        stars:  2,
        emoji:  '🔥',
        state:  'state-medium'
    }
];

/*
 * PETUNGAN WOLU (Mod 8) — Arah Pernikahan
 * total % 8 → index 0..7
 * index 0 = sisa 0 = Pesthi (terverifikasi dari referensi primbon.id)
 */
const WOLU = [
    { name: 'Pesthi', desc: 'Rukun, tentram, dan damai. Hanya kematian yang mampu memisahkan cinta kalian.' },
    { name: 'Sri',    desc: 'Penuh keberuntungan dan limpahan rezeki. Kehidupan bersama akan selalu diberkahi.' },
    { name: 'Lungguh',desc: 'Tentram dan terpandang di masyarakat. Hidup terhormat dan dihormati banyak orang.' },
    { name: 'Gedhong',desc: 'Kaya raya dan hidup berkecukupan. Pintu rezeki terbuka lebar bagi pasangan ini.' },
    { name: 'Lara',   desc: 'Perlu menjaga kesehatan bersama. Rajin berdoa dan saling merawat agar selalu sehat.' },
    { name: 'Pati',   desc: 'Cobaan berat dalam perjalanan hidup. Perkuat iman dan doa bersama untuk melewatinya.' },
    { name: 'Mujur',  desc: 'Beruntung dalam segala hal. Usaha dan cita-cita bersama akan mudah tercapai.' },
    { name: 'Seneng', desc: 'Penuh kebahagiaan dan keceriaan. Segala keinginan dan impian bersama akan terwujud.' }
];

/* ===== KALKULASI KALENDER JAWA ===== */

/**
 * Hitung weton dan neptu dari tanggal Masehi.
 * Referensi terverifikasi:
 *   - 4 Januari 2022  → Selasa Kliwon  (Neptu 3+8=11) ✓
 *   - 2 April 2021    → Jumat Pon      (Neptu 6+7=13) ✓
 *
 * daysDiff dari 1 Jan 2000 (Sabtu Legi) menghasilkan:
 *   pasaranIndex = daysDiff % 5
 *   mapping: 0=Legi, 1=Pahing, 2=Pon, 3=Wage, 4=Kliwon
 */
function hitungWeton(tahun, bulan, hari) {
    const tgl     = new Date(tahun, bulan - 1, hari);
    const refTgl  = new Date(2000, 0, 1);              // 1 Jan 2000
    const selisih = Math.round((tgl - refTgl) / 864e5); // hari

    const iHari     = tgl.getDay();                           // 0=Min..6=Sab
    const iPasaran  = ((selisih % 5) + 5) % 5;               // 0=Legi..4=Kliwon

    const namaHari    = HARI.nama[iHari];
    const namaPasaran = PASARAN.nama[iPasaran];
    const nHari       = HARI.neptu[iHari];
    const nPasaran    = PASARAN.neptu[iPasaran];

    return {
        hari:     namaHari,
        pasaran:  namaPasaran,
        weton:    `${namaHari} ${namaPasaran}`,
        neptu:    nHari + nPasaran,
        neptuHari:    nHari,
        neptuPasaran: nPasaran,
        watak:    `${HARI.watak[iHari]}, ${PASARAN.watak[iPasaran]}`
    };
}

/* ===== HELPER UI ===== */

function buatBintang(jumlah) {
    const isi   = '<span style="color:var(--gold)">★</span>'.repeat(jumlah);
    const kosong = '<span style="color:var(--text-3)">☆</span>'.repeat(5 - jumlah);
    return isi + kosong;
}

function set(id, nilai) {
    const el = document.getElementById(id);
    if (el) el.textContent = nilai;
}

function setHTML(id, nilai) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = nilai;
}

/* ===== FUNGSI UTAMA: HITUNG KECOCOKAN ===== */

// Simpan data untuk fitur berbagi
let dataHasil = {};

function hitungKecocokan() {
    const inputTgl1 = document.getElementById('tgl1').value;
    const inputTgl2 = document.getElementById('tgl2').value;

    if (!inputTgl1 || !inputTgl2) {
        showAlert('Harap isi tanggal lahir kedua pasangan terlebih dahulu! 📅');
        return;
    }

    const [t1, b1, h1] = inputTgl1.split('-').map(Number);
    const [t2, b2, h2] = inputTgl2.split('-').map(Number);

    const nama1 = document.getElementById('nama1').value.trim() || 'Kamu';
    const nama2 = document.getElementById('nama2').value.trim() || 'Dia';

    const weton1    = hitungWeton(t1, b1, h1);
    const weton2    = hitungWeton(t2, b2, h2);
    const totalNeptu = weton1.neptu + weton2.neptu;

    const pitu = PITU[totalNeptu % 7];
    const wolu = WOLU[totalNeptu % 8];

    dataHasil = { nama1, nama2, weton1, weton2, totalNeptu, pitu, wolu };

    tampilkanHasil(nama1, nama2, weton1, weton2, totalNeptu, pitu, wolu);

    // Sembunyikan form, tampilkan hasil
    document.getElementById('formSection').style.display = 'none';
    document.getElementById('resultsSection').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Panggil AI
    panggilAI(nama1, nama2, weton1, weton2, totalNeptu, pitu, wolu);
}

function tampilkanHasil(nama1, nama2, weton1, weton2, totalNeptu, pitu, wolu) {
    // Nama pasangan
    set('rNama1', nama1);
    set('rNama2', nama2);
    set('rWetonNama1', nama1);
    set('rWetonNama2', nama2);

    // Hasil utama
    const wrap = document.getElementById('resultBadgeWrap');
    wrap.className = `result-badge-wrap ${pitu.state}`;
    set('rEmoji', pitu.emoji);
    set('rNamaHasil', pitu.name);
    setHTML('rBintang', buatBintang(pitu.stars));
    set('rLabel', pitu.label);
    set('rDesc', pitu.desc);
    set('rNeptuTotal', `${totalNeptu} (${weton1.neptu} + ${weton2.neptu})`);

    // Weton Pasangan 1
    set('rWeton1', weton1.weton);
    set('rNeptu1', `Neptu ${weton1.neptu}  (${weton1.neptuHari}+${weton1.neptuPasaran})`);
    set('rWatak1', `Watak: ${weton1.watak}`);

    // Weton Pasangan 2
    set('rWeton2', weton2.weton);
    set('rNeptu2', `Neptu ${weton2.neptu}  (${weton2.neptuHari}+${weton2.neptuPasaran})`);
    set('rWatak2', `Watak: ${weton2.watak}`);

    // Petungan
    set('rPitu', pitu.name);
    set('rPituDesc', pitu.desc);
    set('rWolu', wolu.name);
    set('rWoluDesc', wolu.desc);

    // Reset AI
    document.getElementById('aiLoading').style.display = 'block';
    document.getElementById('aiText').classList.add('hidden');
    document.getElementById('aiText').innerHTML = '';
}

/* ===== PANGGIL CLAUDE AI ===== */

async function panggilAI(nama1, nama2, weton1, weton2, totalNeptu, pitu, wolu) {
    const prompt = `Anda adalah seorang "Maestro Primbon & Numerolog Cinta", seorang ahli yang bijak, puitis, dan romantis dalam tradisi Jawa. Analisis kecocokan pasangan berikut berdasarkan hitungan Primbon Jawa.

DATA PASANGAN:
- Nama Pasangan 1: ${nama1} | Weton: ${weton1.weton} | Neptu: ${weton1.neptu} (${weton1.neptuHari}+${weton1.neptuPasaran})
- Nama Pasangan 2: ${nama2} | Weton: ${weton2.weton} | Neptu: ${weton2.neptu} (${weton2.neptuHari}+${weton2.neptuPasaran})
- Total Neptu Gabungan: ${totalNeptu}
- Petungan Pitu (Mod 7): **${pitu.name}** — ${pitu.label}
- Petungan Wolu (Mod 8): **${wolu.name}** — ${wolu.desc}
- Watak ${nama1}: ${weton1.watak}
- Watak ${nama2}: ${weton2.watak}

Buatkan analisis cinta yang INDAH, PUITIS, dan MENDALAM dengan format berikut (gunakan simbol emoji di awal setiap judul):

**✨ [Judul Unik & Romantis untuk Pasangan Ini]**

**📖 Kisah Takdir Mereka**
[2-3 paragraf narasi puitis tentang energi dan kecocokan mereka]

**💙 Energi ${nama1} (${weton1.weton})**
[Deskripsi karakter puitis 2-3 kalimat, gunakan analogi alam]

**💗 Energi ${nama2} (${weton2.weton})**
[Deskripsi karakter puitis 2-3 kalimat, gunakan analogi alam]

**🔮 Takdir Bersama: ${pitu.name}**
[Penjelasan mendalam dan romantis, 3-4 kalimat]

**🏡 Arah Rumah Tangga: ${wolu.name}**
[Interpretasi puitis tentang petungan wolu, 2-3 kalimat]

**🌟 Pesan untuk ${nama1} & ${nama2}**
[Satu paragraf nasihat bijak dan penuh harapan, sentuh aspek emosional]

**💌 Mantra Cinta**
[3-4 baris puisi cantik yang mengandung nama mereka, cocok dijadikan caption Instagram/WA]

INSTRUKSI PENTING:
- Bahasa Indonesia yang puitis, hangat, dan mengayomi
- Gunakan analogi alam yang indah (langit, bintang, laut, bunga, musim)
- Hindari prediksi kematian atau hal sangat negatif yang menakutkan
- Maksimal 600 kata
- Jangan tambah kalimat penutup seperti "Semoga membantu" dll`;

    try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1000,
                messages: [{ role: 'user', content: prompt }]
            })
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const teks = data.content?.[0]?.text || '';

        if (!teks) throw new Error('Respons kosong');

        document.getElementById('aiLoading').style.display = 'none';
        const elText = document.getElementById('aiText');
        elText.innerHTML = formatMarkdown(teks);
        elText.classList.remove('hidden');

    } catch (err) {
        console.error('AI Error:', err);
        document.getElementById('aiLoading').style.display = 'none';
        const elText = document.getElementById('aiText');
        elText.innerHTML = `<p style="color:var(--text-2); text-align:center; padding:1rem;">
            ⚠️ Maestro Primbon AI sedang sibuk. Silakan coba lagi sebentar.<br>
            <small>(Hasil perhitungan weton di atas tetap valid dan akurat)</small>
        </p>`;
        elText.classList.remove('hidden');
    }
}

/* ===== FORMAT MARKDOWN SEDERHANA ===== */

function formatMarkdown(teks) {
    return teks
        // Heading bold **text** → <h3>
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Italic *text* → <em>
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Baris baru ganda → paragraf baru
        .split('\n\n')
        .map(blok => {
            blok = blok.trim();
            if (!blok) return '';
            // Jika baris dimulai dengan emoji + bold, jadikan heading
            if (/^[✨📖💙💗🔮🏡🌟💌].*<strong>/.test(blok)) {
                return `<h3>${blok}</h3>`;
            }
            return `<p>${blok.replace(/\n/g, '<br>')}</p>`;
        })
        .join('');
}

/* ===== HITUNG LAGI ===== */

function hitungLagi() {
    document.getElementById('resultsSection').classList.add('hidden');
    document.getElementById('formSection').style.display = 'block';
    // Reset form
    ['nama1','nama2','tgl1','tgl2'].forEach(id => {
        document.getElementById(id).value = '';
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ===== BAGIKAN KE WHATSAPP ===== */

function bagikanWA() {
    const { nama1, nama2, pitu, wolu, totalNeptu } = dataHasil;

    const pesan = [
        `🔮 *Hasil Ramalan Jodoh Weton*`,
        ``,
        `💑 *${nama1} & ${nama2}*`,
        `⭐ ${pitu.name} — ${pitu.label}`,
        `🏡 Arah Rumah Tangga: ${wolu.name}`,
        `📊 Total Neptu: ${totalNeptu}`,
        ``,
        pitu.desc,
        ``,
        `✨ Cek kecocokan kamu juga di:`,
        `👉 PrimbonJodohWeton.com`
    ].join('\n');

    window.open(`https://wa.me/?text=${encodeURIComponent(pesan)}`, '_blank');
}


/* ===== ANIMASI COUNTER PENGUNJUNG ===== */

function animasiCounter() {
    const el = document.getElementById('counterDisplay');
    if (!el) return;

    const target = 13042 + Math.floor(Math.random() * 50);
    let current  = target - 200;

    const timer = setInterval(() => {
        current += Math.ceil((target - current) * 0.15);
        el.textContent = current.toLocaleString('id-ID');
        if (current >= target) {
            el.textContent = target.toLocaleString('id-ID');
            clearInterval(timer);
        }
    }, 40);
}

/* ===== ALERT KUSTOM ===== */

function showAlert(pesan) {
    // Buat elemen alert sederhana yang sesuai tema
    const existing = document.getElementById('customAlert');
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.id = 'customAlert';
    el.style.cssText = `
        position: fixed; top: 1.5rem; left: 50%; transform: translateX(-50%);
        background: #1c1732; border: 1px solid var(--gold);
        color: var(--text-1); padding: 0.9rem 1.5rem; border-radius: 12px;
        font-family: var(--ff-body); font-size: 0.9rem; z-index: 9999;
        box-shadow: 0 8px 30px rgba(0,0,0,0.6); max-width: 90vw; text-align: center;
        animation: fadeUp 0.3s ease-out;
    `;
    el.textContent = pesan;
    document.body.appendChild(el);

    setTimeout(() => el.remove(), 3500);
}

/* ===== INIT ===== */

document.addEventListener('DOMContentLoaded', () => {
    animasiCounter();

    // Enter key di form → hitung
    ['nama1','nama2','tgl1','tgl2'].forEach(id => {
        document.getElementById(id)?.addEventListener('keydown', e => {
            if (e.key === 'Enter') hitungKecocokan();
        });
    });

    // Batasi tanggal ke hari ini (tidak boleh masa depan)
    const hariIni = new Date().toISOString().split('T')[0];
    ['tgl1','tgl2'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.max = hariIni;
    });
});
// 1. Fungsi Pembantu: Menghasilkan teks yang sama untuk semua platform
function getShareText() {
    // Pastikan dataHasil tersedia. Jika tidak, ini akan error.
    const { nama1, nama2, pitu, wolu, totalNeptu } = dataHasil;

    return [
        `🔮 *Hasil Ramalan Jodoh Weton*`,
        ``,
        `💑 *${nama1} & ${nama2}*`,
        `⭐ ${pitu.name} — ${pitu.label}`,
        `🏡 Arah Rumah Tangga: ${wolu.name}`,
        `📊 Total Neptu: ${totalNeptu}`,
        ``,
        pitu.desc,
        ``,
        `✨ Cek kecocokan kamu juga di:`,
        `👉 ${window.location.href}` // Lebih baik pakai URL dinamis saat ini
    ].join('\n');
}

// 2. Fungsi Toggle Dropdown
function toggleShareDropdown() {
    document.getElementById("shareDropdown").classList.toggle("show");
}

// Tutup dropdown jika user klik di luar area tombol
window.onclick = function(event) {
    if (!event.target.matches('.btn-share-main')) {
        var dropdowns = document.getElementsByClassName("share-dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

// 3. Fungsi Utama Routing Share
function shareTo(platform) {
    const text = getShareText();
    const encodedText = encodeURIComponent(text);
    const currentUrl = encodeURIComponent(window.location.href);

    switch(platform) {
        case 'whatsapp':
            window.open(`https://wa.me/?text=${encodedText}`, '_blank');
            break;
        case 'x':
            window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, '_blank');
            break;
        case 'facebook':
            // FB lebih mengutamakan URL, teks quote sering diabaikan tergantung scraper FB
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${currentUrl}&quote=${encodedText}`, '_blank');
            break;
        case 'threads':
            window.open(`https://www.threads.net/intent/post?text=${encodedText}`, '_blank');
            break;
        case 'instagram':
        case 'tiktok':
            // Fallback Wajib: Salin ke Clipboard karena tidak ada Web Intent API
            navigator.clipboard.writeText(text).then(() => {
                alert(`✅ Teks berhasil disalin!\n\nSilakan buka aplikasi ${platform === 'instagram' ? 'Instagram' : 'TikTok'} dan tempel (paste) teks ini secara manual di caption/story.`);
            }).catch(err => {
                alert(`❌ Gagal menyalin teks otomatis. Mohon salin manual.`);
                console.error('Clipboard error:', err);
            });
            break;
        default:
            console.warn('Platform tidak dikenali');
    }
    
    // Opsional: Tutup dropdown setelah memilih
    toggleShareDropdown();
}
function shareTo(platform) {
    const text = getShareText();
    const encodedText = encodeURIComponent(text);
    const currentUrl = encodeURIComponent(window.location.href);

    // Fungsi bantu untuk copy teks yang pasti jalan di HTTP maupun HTTPS
    function copyToClipboardFallback(txt) {
        // Coba cara modern dulu
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(txt);
        } else {
            // Fallback untuk HTTP / browser lama: buat textarea tersembunyi
            return new Promise((resolve, reject) => {
                const textArea = document.createElement("textarea");
                textArea.value = txt;
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    resolve();
                } catch (err) {
                    document.body.removeChild(textArea);
                    reject(err);
                }
            });
        }
    }

    switch(platform) {
        case 'whatsapp':
            window.open(`https://wa.me/?text=${encodedText}`, '_blank');
            break;
        case 'x':
            window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, '_blank');
            break;
        case 'facebook':
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${currentUrl}&quote=${encodedText}`, '_blank');
            break;
        case 'threads':
            window.open(`https://www.threads.net/intent/post?text=${encodedText}`, '_blank');
            break;
        case 'instagram':
        case 'tiktok':
            const appName = platform === 'instagram' ? 'Instagram' : 'TikTok';
            
            copyToClipboardFallback(text).then(() => {
                alert(`✅ SUKSES!\n\nTeks ramalan sudah disalin ke clipboard.\n\nSilakan buka aplikasi ${appName}, buat postingan/story baru, lalu "Tempel" (Paste) secara manual di kolom caption.`);
            }).catch(() => {
                alert(`⚠️ Gagal menyalin otomatis.\n\nSilakan blok dan salin (copy) teks ramalan di layar ini secara manual, lalu tempel di ${appName}.`);
            });
            break;
        default:
            console.warn('Platform tidak dikenali');
    }
    
    // Tutup dropdown setelah aksi
    const dropdown = document.getElementById("shareDropdown");
    if (dropdown) dropdown.classList.remove("show");
}