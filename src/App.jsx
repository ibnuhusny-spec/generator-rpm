import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, RefreshCcw, Sparkles, Loader2, Moon, Sun, History, 
  Printer, FileDown, Edit, X, Trash2, Table, FileSignature, Key, 
  AlertTriangle, Cpu, Activity, Terminal, Menu, Check, Info, HelpCircle,
  Cloud, RefreshCw, Database, Settings, ClipboardCheck
} from 'lucide-react';

// --- UTILITIES AMAN ---
const safeStorage = {
  getItem: (key) => {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  },
  setItem: (key, value) => {
    try { localStorage.setItem(key, value); } catch (e) { }
  },
  removeItem: (key) => {
    try { localStorage.removeItem(key); } catch (e) {}
  }
};

// --- DATA ---
const JENJANG_OPTIONS = [
  { value: 'SD Umum', label: 'SD Umum' },
  { value: 'SDIT', label: 'SDIT (Sekolah Dasar Islam Terpadu)' },
  { value: 'MI', label: 'MI (Madrasah Ibtidaiyah)' },
  { value: 'SMP Umum', label: 'SMP Umum' },
  { value: 'SMPIT', label: 'SMPIT (Sekolah Menengah Pertama Islam Terpadu)' },
  { value: 'MTs', label: 'MTs (Madrasah Tsanawiyah)' },
  { value: 'SMA Umum', label: 'SMA Umum' },
  { value: 'SMAIT', label: 'SMAIT (Sekolah Menengah Atas Islam Terpadu)' },
  { value: 'MA', label: 'MA (Madrasah Aliyah)' },
  { value: 'SMK', label: 'SMK (Sekolah Menengah Kejuruan)' }
];

const KELAS_SD = ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'];
const KELAS_SMP = ['Kelas 7', 'Kelas 8', 'Kelas 9'];
const KELAS_SMA = ['Kelas 10', 'Kelas 11', 'Kelas 12'];

const KELAS_BY_JENJANG = {
  'SD Umum': KELAS_SD, 'SDIT': KELAS_SD, 'MI': KELAS_SD,
  'SMP Umum': KELAS_SMP, 'SMPIT': KELAS_SMP, 'MTs': KELAS_SMP,
  'SMA Umum': KELAS_SMA, 'SMAIT': KELAS_SMA, 'MA': KELAS_SMA,
  'SMK': KELAS_SMA
};

const PEDAGOGI_OPTIONS = [
  'Inkuiri-Discovery Learning', 'Project Based Learning (PjBL)', 'Problem Based Learning (PBL)',
  'Game Based Learning', 'Station Learning', 'Flipped Classroom', 'Cooperative Learning',
  'Differentiated Instruction', 'Culturally Responsive Teaching', 'Social Emotional Learning', 'Ceramah Interaktif'
];

const PEDAGOGI_INFO = {
  'Inkuiri-Discovery Learning': 'Siswa mencari dan menemukan jawaban secara mandiri melalui observasi/eksperimen.',
  'Project Based Learning (PjBL)': 'Menghasilkan produk nyata (karya, maket, video) melalui tugas berbasis proyek.',
  'Problem Based Learning (PBL)': 'Memecahkan masalah dunia nyata untuk melatih berpikir kritis dan solusi kreatif.',
  'Game Based Learning': 'Menggunakan elemen permainan agar proses belajar menjadi interaktif dan menyenangkan.',
  'Station Learning': 'Siswa berpindah antar pos/stasiun di kelas yang memiliki aktivitas berbeda-beda.',
  'Flipped Classroom': 'Materi dipelajari di rumah, sedangkan waktu kelas fokus untuk diskusi dan praktik.',
  'Cooperative Learning': 'Belajar berkelompok secara terstruktur untuk mencapai tujuan bersama.',
  'Differentiated Instruction': 'Menyesuaikan metode dan materi berdasarkan gaya belajar unik tiap siswa.',
  'Culturally Responsive Teaching': 'Mengaitkan materi pelajaran dengan latar belakang budaya siswa.',
  'Social Emotional Learning': 'Fokus pada keterampilan mengelola emosi, empati, dan keputusan bertanggung jawab.',
  'Ceramah Interaktif': 'Penyampaian materi satu arah namun tetap melibatkan tanya jawab dengan siswa.'
};

const DIMENSI_OPTIONS = ['Keimanan & Ketakwaan', 'Kewargaan', 'Penalaran Kritis', 'Kreativitas', 'Kolaborasi', 'Kemandirian', 'Kesehatan', 'Komunikasi'];

const DIMENSI_INFO = {
  'Keimanan & Ketakwaan': 'Berakhlak mulia terhadap Tuhan, sesama, alam, dan negara.',
  'Kewargaan': 'Mengenal budaya, menghargai keberagaman, dan cinta tanah air.',
  'Penalaran Kritis': 'Mampu memproses informasi, menganalisis, dan mengevaluasi.',
  'Kreativitas': 'Mampu memodifikasi dan menghasilkan karya orisinal yang bermakna.',
  'Kolaborasi': 'Kemampuan bekerja sama, peduli, dan berbagi dengan orang lain.',
  'Kemandirian': 'Sadar atas diri sendiri, situasi, dan mampu meregulasi diri.',
  'Kesehatan': 'Kesadaran menjaga kesehatan fisik dan mental secara mandiri.',
  'Komunikasi': 'Kemampuan berinteraksi dan bertukar ide secara efektif.'
};

const GRADIENT_THEMES = [
  { id: 'royal', class: 'from-indigo-600 via-purple-600 to-violet-800' },
  { id: 'ocean', class: 'from-blue-600 via-cyan-600 to-teal-700' },
  { id: 'nature', class: 'from-emerald-600 via-green-600 to-lime-700' },
  { id: 'sunset', class: 'from-orange-500 via-red-500 to-rose-700' },
  { id: 'berry', class: 'from-pink-600 via-rose-600 to-purple-700' }
];

const AI_MODELS = [
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Standar)' },
  { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash (Exp)' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Cerdas)' },
  { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro (Legacy)' },
  { id: 'custom', name: 'Gunakan Model Custom...' }
];

export default function RPMGenerator() {
  const APP_NAME_P1 = "RencanaKu";
  const APP_NAME_P2 = "Pro";

  // --- STATE ---
  const [showSplash, setShowSplash] = useState(true);
  const [fadeSplash, setFadeSplash] = useState(false);

  const [formData, setFormData] = useState({
    pemda: '', namaSatuan: '', alamatSekolah: '', tempatTtd: '',
    namaGuru: '', nipGuru: '', namaKepsek: '', nipKepsek: '',
    jenjang: 'SD Umum', kelas: 'Kelas 1', semester: 'Ganjil', mapel: '', cp: '', tp: '', indikator: '', materi: '', catatanKhusus: '',
    jumlahPertemuan: 1, durasi: '2 JP x 35 Menit', metodePerPertemuan: ['Inkuiri-Discovery Learning'], dimensi: [],
    tanggalRPP: new Date().toISOString().split('T')[0]
  });

  const [logoBase64, setLogoBase64] = useState(null); // State khusus untuk gambar di MS Word

  const [isGenerated, setIsGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(''); 
  
  const [userApiKey, setUserApiKey] = useState('');
  const [spreadsheetId, setSpreadsheetId] = useState(''); 
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash');
  const [customModelName, setCustomModelName] = useState('');
  const [dynamicModels, setDynamicModels] = useState(AI_MODELS);
  
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [showApiGuide, setShowApiGuide] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [debugLog, setDebugLog] = useState(null);
  
  const [availableModels, setAvailableModels] = useState([]); 
  const [isCheckingModels, setIsCheckingModels] = useState(false);
  
  const [aiContent, setAiContent] = useState([]); 
  const [rubricContent, setRubricContent] = useState(null);
  const [lkpdContent, setLkpdContent] = useState(null);
  const [instrumenContent, setInstrumenContent] = useState(null); 
  
  const [isEditing, setIsEditing] = useState(false); 
  const [history, setHistory] = useState([]); 
  const [showHistory, setShowHistory] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false); 

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedGradient, setSelectedGradient] = useState(GRADIENT_THEMES[0]);

  const [copied, setCopied] = useState(false);

  const appsScriptCode = `const SHEET_NAME = 'Riwayat';

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const data = JSON.parse(e.postData.contents);
    const newRow = [data.id || new Date().getTime(), data.tanggal || new Date().toLocaleDateString(), data.mapel || '', data.kelas || '', JSON.stringify(data.formData || {}), JSON.stringify(data.aiContent || [])];
    sheet.appendRow(newRow);
    return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.message })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const rows = sheet.getDataRange().getValues();
    if (rows.length <= 1) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    const data = [];
    for (let i = 1; i < rows.length; i++) {
      data.push({ id: rows[i][0], date: rows[i][1], title: rows[i][2] + ' ' + rows[i][3], formData: JSON.parse(rows[i][4] || '{}'), aiContent: JSON.parse(rows[i][5] || '[]') });
    }
    data.reverse();
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.message })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const copyScript = () => {
    const textArea = document.createElement("textarea");
    textArea.value = appsScriptCode;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    } catch (err) {
        console.error('Gagal menyalin', err);
    }
    document.body.removeChild(textArea);
  };

  const outputRef = useRef(null);

  // --- INIT & SPLASH SCREEN ---
  useEffect(() => {
    const fadeTimer = setTimeout(() => { setFadeSplash(true); }, 3000);
    const hideTimer = setTimeout(() => { setShowSplash(false); }, 3500);

    // Muat logo kustom dari penyimpanan lokal jika ada
    const savedLogo = safeStorage.getItem('user_custom_logo');
    if (savedLogo) {
        setLogoBase64(savedLogo);
    } else {
        // Fallback default opsional jika tidak ada logo
        setLogoBase64(null); 
    }

    const storedKey = safeStorage.getItem('user_gemini_api_key');
    // ... (lanjutan kode Anda di bawahnya tidak perlu diubah)
    if (storedKey) setUserApiKey(storedKey);
    else setShowApiKeyInput(true);

    const storedSpreadsheetId = safeStorage.getItem('user_spreadsheet_id');
    if (storedSpreadsheetId) {
        setSpreadsheetId(storedSpreadsheetId);
        loadCloudHistory(storedSpreadsheetId);
    }

    const storedModel = safeStorage.getItem('user_gemini_model');
    if (storedModel) setSelectedModel(storedModel);
    
    const storedCustom = safeStorage.getItem('user_gemini_custom_model');
    if (storedCustom) setCustomModelName(storedCustom);

    const savedHistory = safeStorage.getItem('rpm_history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) setHistory(parsed);
      } catch (e) { safeStorage.removeItem('rpm_history'); }
    }

    const savedFormData = safeStorage.getItem('rpm_form_data');
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData);
        if (!parsed.metodePerPertemuan) parsed.metodePerPertemuan = ['Inkuiri-Discovery Learning'];
        if (!parsed.dimensi) parsed.dimensi = [];
        if (!parsed.indikator) parsed.indikator = ''; 
        if (!parsed.pemda) parsed.pemda = '';
        if (!parsed.alamatSekolah) parsed.alamatSekolah = '';
        if (!parsed.tempatTtd) parsed.tempatTtd = '';
        if (!parsed.semester) parsed.semester = 'Ganjil';
        if (!parsed.tanggalRPP) parsed.tanggalRPP = new Date().toISOString().split('T')[0];
        if (parsed.gunakanLogoQA === undefined) parsed.gunakanLogoQA = false;
        setFormData(prev => ({...prev, ...parsed}));
      } catch (e) { safeStorage.removeItem('rpm_form_data'); }
    }

    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
  }, []);

  useEffect(() => {
    if (history.length > 0) safeStorage.setItem('rpm_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    safeStorage.setItem('rpm_form_data', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    setFormData(prev => {
      const count = Math.max(1, parseInt(prev.jumlahPertemuan) || 1);
      const currentMethods = [...prev.metodePerPertemuan];
      if (currentMethods.length < count) {
        const last = currentMethods[currentMethods.length - 1] || PEDAGOGI_OPTIONS[0];
        while (currentMethods.length < count) currentMethods.push(last);
      } else if (currentMethods.length > count) {
        currentMethods.length = count;
      }
      return { ...prev, metodePerPertemuan: currentMethods };
    });
  }, [formData.jumlahPertemuan]);

  // --- CLOUD DATABASE FUNCTIONS ---
  // --- CLOUD DATABASE FUNCTIONS ---
  // Tanamkan URL Web App Bapak di sini agar guru tidak perlu repot
  const URL_PUSAT = "https://script.google.com/macros/s/AKfycbzQxgxqcGQMruz9fSQOj_yfbHc9O8JgNxcQRWbOgxJqy8FUkmH9dJ-Qri_lrr0l63k6/exec"; 

  const loadCloudHistory = async (idOverride = null) => {
    const id = idOverride || spreadsheetId || safeStorage.getItem('user_spreadsheet_id');
    if (!id) return;
    
    setIsSyncing(true);
    try {
        // Mengirim ID guru ke server Bapak untuk meminta data riwayat
        const res = await fetch(`${URL_PUSAT}?id=${id}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
            setHistory(data);
            safeStorage.setItem('rpm_history', JSON.stringify(data));
        }
    } catch (e) {
        console.error("Gagal memuat dari cloud:", e);
    } finally {
        setIsSyncing(false);
    }
  };

  const saveToCloud = async (record) => {
      const id = spreadsheetId || safeStorage.getItem('user_spreadsheet_id');
      if (!id) return;
      
      // Sisipkan ID guru ke dalam paket data RPP
      const dataYangDikirim = { ...record, spreadsheetId: id };
      
      try {
          await fetch(URL_PUSAT, {
              method: 'POST',
              mode: 'no-cors',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              body: JSON.stringify(dataYangDikirim)
          });
      } catch (e) {
          console.error("Gagal menyimpan ke cloud:", e);
      }
  };

  // --- HANDLERS ---
  const saveSettings = () => {
    const k = userApiKey.trim();
    const sid = spreadsheetId.trim(); // <-- Sekarang kita menyimpan ID, bukan URL
    setUserApiKey(k);
    setSpreadsheetId(sid);
    safeStorage.setItem('user_gemini_api_key', k);
    safeStorage.setItem('user_spreadsheet_id', sid);
    
    if(sid) {
        loadCloudHistory(sid); 
    }
    alert("Semua Pengaturan & Kunci API berhasil tersimpan!");
    setShowApiKeyInput(false);
  };

  const handleModelChange = (e) => {
    const val = e.target.value;
    setSelectedModel(val);
    safeStorage.setItem('user_gemini_model', val);
  };
  
  const handleCustomModelChange = (e) => {
    const val = e.target.value;
    setCustomModelName(val);
    safeStorage.setItem('user_gemini_custom_model', val);
  }

  const selectFoundModel = (modelName) => {
      const cleanName = modelName.replace('models/', '');
      const isStandardModel = dynamicModels.some(m => m.id === cleanName);

      if (isStandardModel) {
          setSelectedModel(cleanName);
          safeStorage.setItem('user_gemini_model', cleanName);
      } else {
          setSelectedModel('custom');
          setCustomModelName(cleanName);
          safeStorage.setItem('user_gemini_model', 'custom');
          safeStorage.setItem('user_gemini_custom_model', cleanName);
      }
  };

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleMethodChange = (i, v) => setFormData(prev => { const m = [...prev.metodePerPertemuan]; m[i] = v; return { ...prev, metodePerPertemuan: m }; });
  const handleCheckboxChange = (v) => setFormData(prev => { const c = prev.dimensi; return { ...prev, dimensi: c.includes(v) ? c.filter(i => i !== v) : [...c, v] }; });
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi ukuran opsional (contoh: maks 2MB)
      if (file.size > 2000000) return alert("Ukuran logo terlalu besar. Maksimal 2MB.");
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoBase64(reader.result);
        safeStorage.setItem('user_custom_logo', reader.result); // Simpan permanen di perangkat guru
      };
      reader.readAsDataURL(file);
    }
  };

  const hapusLogo = () => {
    setLogoBase64(null);
    safeStorage.removeItem('user_custom_logo');
  };
  const handleJenjangChange = (e) => {
    const newJenjang = e.target.value;
    setFormData(prev => ({ 
        ...prev, 
        jenjang: newJenjang, 
        kelas: KELAS_BY_JENJANG[newJenjang][0] 
    }));
  };

  const clearForm = () => {
    if(window.confirm("Apakah Anda yakin ingin menghapus semua isian form?")) {
        setFormData({
            pemda: '', namaSatuan: '', alamatSekolah: '', tempatTtd: '',
            namaGuru: '', nipGuru: '', namaKepsek: '', nipKepsek: '',
            jenjang: 'SD Umum', kelas: 'Kelas 1', semester: 'Ganjil', mapel: '', cp: '', tp: '', indikator: '', materi: '', catatanKhusus: '',
            jumlahPertemuan: 1, durasi: '2 JP x 35 Menit', metodePerPertemuan: ['Inkuiri-Discovery Learning'], dimensi: [],
            tanggalRPP: new Date().toISOString().split('T')[0]
        });
        safeStorage.removeItem('rpm_form_data');
    }
  };

  // --- API ---
  const getActiveModelName = () => {
      return selectedModel === 'custom' ? customModelName : selectedModel;
  }

  const checkAvailableModels = async () => {
      if (!userApiKey) return alert("Masukkan API Key dulu.");
      setIsCheckingModels(true);
      setErrorMsg(null);
      setAvailableModels([]); 
      
      try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${userApiKey}`);
          const data = await res.json();
          
          if (!res.ok) throw new Error(data.error?.message || "Gagal mengambil daftar model");
          
          if (data && data.models && Array.isArray(data.models)) {
              const validModels = data.models.filter(m => 
                  m && m.name && m.supportedGenerationMethods && 
                  m.supportedGenerationMethods.includes("generateContent")
              );
              setAvailableModels(validModels);

              const newDropdownOptions = validModels.map(m => {
                  const cleanName = m.name.replace('models/', '');
                  return { id: cleanName, name: cleanName };
              });
              
              const combined = [...AI_MODELS];
              newDropdownOptions.forEach(newMod => {
                  if (!combined.some(existing => existing.id === newMod.id)) {
                      combined.splice(combined.length - 1, 0, newMod);
                  }
              });
              setDynamicModels(combined);

          } else {
              throw new Error("Format data dari Google tidak sesuai atau kosong.");
          }
      } catch (e) {
          setErrorMsg(`Gagal Cek Model: ${e.message}`);
          setAvailableModels([]); 
      } finally {
          setIsCheckingModels(false);
      }
  }

  const testConnection = async () => {
    setErrorMsg(null);
    setDebugLog(null);
    if (!userApiKey) return alert("Masukkan API Key dulu.");
    
    const modelToUse = getActiveModelName();
    const btn = document.getElementById('btn-test');
    if(btn) btn.innerHTML = "Menghubungi...";
    
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${userApiKey}`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ contents: [{ parts: [{ text: "Hello" }] }] })
        });
        const data = await res.json();
        
        if (!res.ok) {
            setDebugLog(JSON.stringify(data, null, 2)); 
            throw new Error(`Gagal: ${data.error?.message || res.statusText}`);
        }
        
        alert(`SUKSES! Terhubung ke model: ${modelToUse}`);
    } catch (e) {
        setErrorMsg(`Koneksi Gagal: ${e.message}`);
    } finally {
        if(btn) btn.innerHTML = "Tes Koneksi AI";
    }
  };

  const callAI = async (prompt) => {
    setErrorMsg(null);
    setDebugLog(null);
    if (!userApiKey) { 
      setErrorMsg("API Key wajib diisi."); 
      setShowApiKeyInput(true); 
      window.scrollTo(0,0); 
      return null; 
    }
    
    const modelToUse = getActiveModelName();

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${userApiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await res.json();
      
      if (!res.ok) {
          setDebugLog(JSON.stringify(data, null, 2));
          throw new Error(data.error?.message || `Gagal menghubungi model ${modelToUse}`);
      }
      
      return data.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (e) { setErrorMsg(e.message); return null; }
  };

  const cleanAIResponse = (text) => {
    if (!text) return "";
    let cleaned = text.replace(/^(Tentu|Berikut|Baik|Ini|Silakan|Di bawah|Sebagai|Halo).*?(:|\n)/i, '');
    cleaned = cleaned.replace(/(Catatan|Note|Penting|Harap|Perlu diingat).*?$/is, '');
    return cleaned.trim();
  }

  const cleanHtmlContent = (text) => {
    if (!text) return "";
    let cleaned = text.replace(/```html/g, '').replace(/```/g, ''); 
    cleaned = cleaned.replace(/\*\*/g, '').replace(/##/g, '').replace(/__/g, '');
    return cleaned.trim();
  }

  // --- GENERATE FUNCTIONS ---
  const generateSimple = async (type, prompt, label) => {
    if (type === 'cp' && !formData.mapel) return alert("Isi Mapel dulu");
    if ((type === 'tp' || type === 'indikator') && !formData.cp) return alert("Isi CP dulu");
    if (type === 'indikator' && !formData.tp) return alert("Isi TP dulu");
    if ((type === 'rubric' || type === 'lkpd' || type === 'instrumen') && !formData.tp) return alert("Isi TP dulu");

    setLoadingStatus(label);
    
    const isIslamic = ['SDIT', 'MI', 'SMPIT', 'MTs', 'SMAIT', 'MA'].includes(formData.jenjang);
    const isVocational = formData.jenjang === 'SMK';
    let tambahanKonteks = "";
    if (isIslamic) tambahanKonteks = " PASTIKAN menyisipkan nilai-nilai keislaman, akhlak, atau hikmah spiritual yang relevan.";
    if (isVocational) tambahanKonteks = " PASTIKAN berfokus pada ranah vokasional, praktik industri, atau kesiapan kerja.";

    const catatanGuru = formData.catatanKhusus ? ` CATATAN GURU: ${formData.catatanKhusus}.` : "";

    let strictPrompt = prompt;
    if (type === 'cp' || type === 'tp' || type === 'indikator') {
        strictPrompt += `. INSTRUKSI KHUSUS: HANYA berikan daftarnya saja. Gunakan poin nomor urut biasa (1, 2, 3). Jangan pakai kata pengantar atau penjelasan akhir. Gunakan acuan materi dan mapel yang diberikan secara ketat.${tambahanKonteks}${catatanGuru}`;
    } else if (type === 'rubric') {
        strictPrompt += `. INSTRUKSI KHUSUS: Buatkan DALAM FORMAT HTML TABLE (<table>) yang lengkap dengan border. Langsung kode HTML saja. Jadikan Tujuan Pembelajaran (TP) yang saya berikan sebagai ACUAN UTAMA.
        STRUKTUR TABEL WAJIB:
        1. Bagi 3 aspek: Kognitif (Pemahaman), Psikomotorik (Keterampilan Praktik), dan Afektif (Sikap/Profil Pelajar).
        2. Gunakan indikator yang terukur.
        3. Tambahkan tabel khusus untuk Tindak Lanjut (Remedial & Pengayaan).${tambahanKonteks}${catatanGuru}`;
    } else if (type === 'instrumen') {
        strictPrompt = `Buatkan Dokumen Instrumen Penilaian LENGKAP untuk materi: ${formData.materi}, Kelas: ${formData.kelas}. 
        Tujuan Pembelajaran: ${formData.tp}
        ${catatanGuru}
        
        INSTRUKSI OUTPUT (WAJIB HTML MURNI tanpa markdown):
        Jadikan Tujuan Pembelajaran di atas sebagai acuan MUTLAK dalam membuat soal.
        Gunakan tag HTML <h4> untuk judul-judul bagian agar ukuran teksnya tidak terlalu besar (Jangan gunakan <h1> atau <h2>).
        Buatkan 3 Bagian Utama yang menarik dan rapi menggunakan tag HTML (<h4>, <table>, <ul>, dll):
        1. Kisi-kisi Soal (Bentuk Tabel yang memuat Indikator Soal, Bentuk Soal, dan Bobot).
        2. Lembar Soal Evaluasi (Berisi minimal 5 soal pilihan ganda dan 3 soal isian/essay yang berbobot/HOTS).
        3. Kunci Jawaban & Pedoman Penskoran (Berisi jawaban dan tabel cara menghitung nilai akhir).${tambahanKonteks}`;
    } else if (type === 'lkpd') {
        const isFaseA = formData.kelas === 'Kelas 1' || formData.kelas === 'Kelas 2';
        const intruksiFaseA = isFaseA ? "KARENA INI UNTUK KELAS 1/2 (FASE A), BUAT DESAIN YANG SANGAT RAMAH ANAK. Gunakan banyak EMOJI HTML (🌟, 🍎, 🚗, 🐶, 🖍️, dll) sebagai pengganti gambar ilustrasi di berbagai bagian. Gunakan kalimat instruksi yang sangat pendek, sederhana, dan hindari kata rumit. Berikan ruang lebar untuk menggambar atau menebalkan huruf." : "";

        strictPrompt = `Buatkan Dokumen Lembar Kerja Peserta Didik (LKPD) yang LENGKAP, KREATIF, dan SIAP CETAK untuk materi: ${formData.materi}, Kelas: ${formData.kelas} (${formData.jenjang}).
        
        Data Tujuan Pembelajaran (TP): ${formData.tp}
        ${catatanGuru}
        
        Instruksi Output:
        1. Format WAJIB: HTML Murni (tanpa Markdown). Gunakan atribut style seperlunya agar terlihat rapi (jangan panggil CSS eksternal).
        2. Gaya Bahasa: Menarik untuk siswa. ${intruksiFaseA} ${tambahanKonteks}
        3. Struktur Wajib:
           - Judul Kegiatan (Tag <h3>, Center)
           - Identitas Siswa (Kotak atau baris titik-titik Nama, Kelas)
           - Pojok Eksplorasi (Kotak putus-putus untuk QR Code)
           ${isIslamic ? '- Mufradat/Kata Hikmah Hari Ini' : ''}
           - Pemanasan/Gamifikasi (Teka-teki ringan/permainan awal)
           - Langkah Kegiatan / Petunjuk Belajar
           - Lembar Jawab/Diskusi: Sediakan soal-soal latihan (3-5 soal) dan area kosong dengan garis titik-titik <hr> untuk siswa menulis jawaban.
           - Jurnal Refleksi Anak (Sediakan opsi centang seperti [ Senang 😊 ] [ Biasa 😐 ] [ Sedih 😢 ]).`;
    }

    const res = await callAI(strictPrompt);
    setLoadingStatus('');
    
    if (res) {
      const cleanedRes = cleanAIResponse(res);

      if (type === 'cp') setFormData(p => ({ ...p, cp: cleanedRes }));
      else if (type === 'tp') setFormData(p => ({ ...p, tp: cleanedRes }));
      else if (type === 'indikator') setFormData(p => ({ ...p, indikator: cleanedRes }));
      else if (type === 'rubric') setRubricContent(cleanHtmlContent(cleanedRes));
      else if (type === 'instrumen') setInstrumenContent(cleanHtmlContent(cleanedRes));
      else if (type === 'lkpd') setLkpdContent(cleanHtmlContent(cleanedRes));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const isIslamic = ['SDIT', 'MI', 'SMPIT', 'MTs', 'SMAIT', 'MA'].includes(formData.jenjang);
    const isVocational = formData.jenjang === 'SMK';
    let instruksiJenjang = isIslamic ? "Integrasikan nilai spiritual/islami secara natural. " : isVocational ? "Fokuskan pada hard skills dunia kerja. " : "";
    const catatanGuru = formData.catatanKhusus ? `CATATAN GURU: ${formData.catatanKhusus}.` : "";

    const prompt = `Buatkan RPM ${formData.jumlahPertemuan} pertemuan. Format WAJIB: JSON Array. 
    Data Utama: ${JSON.stringify({...formData, catatanKhusus: undefined})}. Metode: ${formData.metodePerPertemuan.join(', ')}. ${instruksiJenjang} ${catatanGuru} 
    
    INSTRUKSI SANGAT PENTING:
    1. ACUAN MUTLAK: Anda WAJIB menggunakan Capaian Pembelajaran (CP), Tujuan Pembelajaran (TP), dan Indikator dari Data Utama di atas, terlepas dari apakah bentuknya paragraf biasa atau poin-poin!
    2. Untuk bagian pengalaman belajar (memahami/Pendahuluan, mengaplikasi/Inti, dan refleksi/Penutup), JANGAN GUNAKAN PARAGRAF ATAU NARASI PANJANG!
    3. WAJIB TULIS DALAM BENTUK DAFTAR ANGKA BERURUTAN KE BAWAH (Contoh: "1. Guru mengucapkan salam...", "2. Siswa dibagi menjadi kelompok...", "3. ...").
    4. Untuk kegiatan Pendahuluan/Memahami, langkah nomor 1 WAJIB berupa salam, doa, dan apersepsi.
    
    Struktur JSON: [{"siswa":"","lintasDisiplin":"","topik":"","kemitraan":"","lingkungan":"","digital":"","pengalaman":{"memahami":"(Tulis list 1, 2, 3...)","mengaplikasi":"(Tulis list 1, 2, 3...)","refleksi":"(Tulis list 1, 2, 3...)"},"asesmen":{"awal":"","proses":"","akhir":""}}]`;
    
    const res = await callAI(prompt);
    if (res) {
      try {
        let jsonStr = res.replace(/```json/g,'').replace(/```/g,'').trim();
        const firstBracket = jsonStr.indexOf('[');
        const lastBracket = jsonStr.lastIndexOf(']');
        if(firstBracket !== -1 && lastBracket !== -1) {
            jsonStr = jsonStr.substring(firstBracket, lastBracket + 1);
        }
        
        let json = JSON.parse(jsonStr);
        if (!Array.isArray(json)) json = [json];
        const count = Math.max(1, parseInt(formData.jumlahPertemuan) || 1);
        while (json.length < count) json.push(JSON.parse(JSON.stringify(json[json.length - 1])));
        
        setAiContent(json.slice(0, count));
        setRubricContent(null);
        setLkpdContent(null);
        setInstrumenContent(null);
        setIsGenerated(true);
        setIsEditing(false);

        // Siapkan Data untuk Disimpan
        const recordID = Date.now();
        const recordDate = new Date().toLocaleDateString();
        const newRecord = { 
            id: recordID, 
            date: recordDate, 
            title: `${formData.mapel} ${formData.kelas}`, 
            mapel: formData.mapel,
            kelas: formData.kelas,
            tanggal: recordDate,
            formData: {...formData}, 
            aiContent: json 
        };

        // Simpan ke State Lokal & Cloud
        setHistory(p => [newRecord, ...p]);
        saveToCloud(newRecord);

      } catch (e) { setErrorMsg("Format AI tidak valid. Klik tombol Generate RPM sekali lagi."); }
    }
    setIsLoading(false);
  };

  // --- EDIT CELL ---
  const updateContent = (i, path, val) => {
    setAiContent(prev => {
      const arr = [...prev];
      const d = { ...arr[i] };
      if (path.includes('.')) {
        const [a, b] = split('.');
        d[a] = { ...d[a], [b]: val };
      } else { d[path] = val; }
      arr[i] = d;
      return arr;
    });
  };

  const EditCell = ({ val, idx, path, multi }) => {
    if (!isEditing) {
      // Ubah karakter baris baru (\n) menjadi tag <br/> agar MS Word merendernya ke bawah
      const formattedVal = val ? val.toString().replace(/\n/g, '<br/>') : '';
      return <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formattedVal }} />;
    }
    return multi 
      ? <textarea className="w-full p-1 border bg-yellow-50 text-sm font-sans" rows={6} value={val||''} onChange={e => updateContent(idx, path, e.target.value)} />
      : <input className="w-full p-1 border bg-yellow-50 text-sm font-sans" value={val||''} onChange={e => updateContent(idx, path, e.target.value)} />;
  };

  const formatRender = (text) => {
    if (!text) return '-';
    let clean = text.replace(/[*`_]/g, '').replace(/#/g, ''); 
    
    if (clean.includes('\n')) {
        const lines = clean.split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length > 0) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {lines.map((l, i) => (
                        // Ubah <span> menjadi <div> agar terbaca sebagai baris baru di MS Word
                        <div key={i}>{l}</div>
                    ))}
                </div>
            );
        }
    }
    return clean;
  };

  // --- EXPORT ---
  const handlePrint = () => {
    if (!outputRef.current) return;
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>RPM ${formData.mapel}</title><style>
      @page { size: A4; margin: 2cm; }
      body { font-family: 'Times New Roman', serif; color: #000; line-height: 1.4; font-size: 11pt; }
      .kop-surat { text-align: center; margin-bottom: 20px; border-bottom: 3px double black; padding-bottom: 10px; }
      .kop-surat h3 { margin: 0; font-size: 14pt; text-transform: uppercase; }
      .kop-surat h4 { margin: 0; font-size: 12pt; text-transform: uppercase; font-weight: normal; }
      .kop-surat p { margin: 0; font-size: 10pt; font-style: italic; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
      table, th, td { border: 1px solid #000; }
      td, th { padding: 8px 10px; vertical-align: top; text-align: left; }
      .header-section { background-color: #f0f0f0; font-weight: bold; text-align: center; }
      .sub-header { font-weight: bold; background-color: #fafafa; }
      .no-border, .no-border td, .no-border th { border: none !important; }
      .page-break { page-break-before: always; }
      .signature-section { margin-top: 50px; page-break-inside: avoid; }
      .signature-section td { text-align: center; border: none !important; }
      ul, ol { margin: 0; padding-left: 20px; }
      .custom-html-content table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      .custom-html-content th, .custom-html-content td { border: 1px solid black; padding: 5px; text-align: left; }
      .custom-html-content h1, .custom-html-content h2, .custom-html-content h3 { font-weight: bold; font-size: 13pt; margin-top: 15px; margin-bottom: 10px; }
      .custom-html-content h4, .custom-html-content h5 { font-weight: bold; font-size: 11pt; margin-top: 10px; margin-bottom: 5px; }
      .custom-html-content ul, .custom-html-content ol { padding-left: 20px; margin-bottom: 10px; }
      .custom-html-content .lkpd-section { margin-bottom: 20px; }
    </style></head><body>${outputRef.current.innerHTML}<script>window.onload=function(){window.print();window.close()}</script></body></html>`);
    w.document.close();
  };

  const handleWord = () => {
    const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'><head><meta charset='utf-8'><title>Doc</title>
    <style>
      body { font-family: 'Times New Roman', serif; font-size: 11pt; }
      table { border-collapse: collapse; width: 100%; }
      td, th { border: 1px solid black; padding: 5px; vertical-align: top; }
      .header-section { background-color: #f0f0f0; font-weight: bold; }
      .no-border td, .no-border th { border: none !important; }
      .custom-html-content h1, .custom-html-content h2, .custom-html-content h3 { font-size: 13pt; font-weight: bold; }
      .custom-html-content h4, .custom-html-content h5 { font-size: 11pt; font-weight: bold; }
    </style></head><body>${outputRef.current.innerHTML}</body></html>`;
    const url = URL.createObjectURL(new Blob(['\ufeff', html], { type: 'application/msword' }));
    const a = document.createElement('a'); a.href = url; a.download = `RPM_${formData.mapel}.doc`; a.click();
  };

  // --- STYLES ---
  const cssInput = `mt-1 block w-full rounded-md shadow-sm border p-2 ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'}`;
  const cssLabel = `block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`;

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 bg-gradient-to-br ${selectedGradient.class} flex flex-col`}>
      
      {/* 🌟 SPLASH SCREEN 🌟 */}
      {showSplash && (
        <div 
          className={`fixed top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-teal-600 to-emerald-900 transition-opacity duration-700 ${fadeSplash ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          style={{ zIndex: 9999 }}
        >
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-32 h-32 flex items-center justify-center bg-white/10 rounded-full shadow-2xl backdrop-blur-md border border-white/20 mb-2">
                    <img 
                        src="/logo.png" 
                        alt="Logo" 
                        className="absolute inset-0 w-full h-full object-contain p-3 drop-shadow-xl z-10" 
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <BookOpen size={56} className="text-white opacity-50" />
                </div>
                
                <div className="text-center text-white">
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-xl font-sans mb-2">
                        <span className="text-white">{APP_NAME_P1}</span> <span className="text-amber-300">{APP_NAME_P2}</span>
                    </h1>
                    <p className="text-sm md:text-base font-semibold text-emerald-100 tracking-wider">Asisten Cerdas Perencanaan Pembelajaran</p>
                </div>
                
                <div className="mt-8 flex gap-3">
                    <div className="w-3 h-3 bg-amber-300 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-amber-300 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                    <div className="w-3 h-3 bg-amber-300 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
            </div>
        </div>
      )}

      <header className={`p-4 shadow-lg backdrop-blur-md no-print ${isDarkMode ? 'bg-gray-900/90 text-white' : 'bg-white/90 text-gray-800'}`}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex items-center justify-center bg-indigo-50 rounded-lg shadow-sm border border-indigo-100 overflow-hidden shrink-0">
                <img 
                    src="/logo.png" 
                    alt="Logo" 
                    className="absolute inset-0 w-full h-full object-contain p-1 z-10" 
                    onError={(e) => { e.target.style.display = 'none'; }}
                />
                <BookOpen className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
                <h1 className="text-xl font-bold font-sans">
                    <span>{APP_NAME_P1}</span> <span className="text-yellow-500">{APP_NAME_P2}</span> <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded ml-1">v8.0 Max</span>
                </h1>
                <p className="text-xs opacity-70">Deep Learning Plan • Dev: Ibnu Husny</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowApiKeyInput(!showApiKeyInput)} className={`p-2 rounded-full ${userApiKey ? 'text-green-500' : 'text-red-500'}`} title="Pengaturan AI & Cloud"><Settings /></button>
            <button type="button" onClick={() => setShowHistory(true)} className="p-2 rounded-full relative">
                <History />
                {history.length > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>}
            </button>
            <div className="flex gap-1 hidden md:flex">{GRADIENT_THEMES.map(t => <button key={t.id} type="button" onClick={() => setSelectedGradient(t)} className={`w-5 h-5 rounded-full bg-gradient-to-br ${t.class} border-2 ${selectedGradient.id === t.id ? 'border-white' : 'border-transparent'}`} />)}</div>
            <button type="button" onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full">{isDarkMode ? <Sun /> : <Moon />}</button>
          </div>
        </div>
      </header>

      {/* MODAL PANDUAN PENGATURAN */}
      {showApiGuide && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowApiGuide(false)}></div>
            <div className={`relative w-full max-w-2xl rounded-xl shadow-2xl p-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} flex flex-col max-h-[90vh]`}>
                <div className="flex justify-between items-center mb-4 border-b pb-2 shrink-0">
                    <h3 className="font-bold text-lg flex items-center gap-2"><HelpCircle className="text-indigo-500"/> Panduan Pengaturan API & Cloud</h3>
                    <button type="button" onClick={() => setShowApiGuide(false)} className="text-gray-500 hover:text-red-500"><X/></button>
                </div>
                <div className="space-y-4 text-sm overflow-y-auto pr-2 flex-1">
                    <p>Aplikasi ini membutuhkan API Key gratis dari Google Gemini dan URL Spreadsheet (Opsional) jika ingin menyimpan data di cloud.</p>
                    
                    <h4 className="font-bold border-b pb-1 mt-4">1. Cara Mendapatkan API Key (Wajib)</h4>
                    <ol className="list-decimal pl-5 space-y-1">
                        <li>Buka <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-indigo-500 font-bold underline">Google AI Studio</a> dan login dengan Gmail.</li>
                        <li>Klik <strong>"Create API key"</strong>, lalu salin kodenya.</li>
                        <li>Tempelkan kodenya di menu pengaturan aplikasi ini.</li>
                    </ol>

                    <h4 className="font-bold border-b pb-1 mt-4">2. Cara Setup Database Cloud (Opsional)</h4>
                    <ol className="list-decimal pl-5 space-y-1">
                        <li>Buat Spreadsheet kosong di Google Drive. Beri nama Sheet pertama: <strong>Riwayat</strong></li>
                        <li>Tulis Header di baris 1 (A-F): <code>id, tanggal, mapel, kelas, formData, aiContent</code></li>
                        <li>Klik <strong>Ekstensi &gt; Apps Script</strong>, hapus semua kode bawaan, lalu tempelkan (paste) kode di bawah ini:</li>
                    </ol>

                    <div className="relative mt-2">
                        <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto font-mono border border-gray-700 max-h-40">
                            <code>{appsScriptCode}</code>
                        </pre>
                        <button type="button" onClick={copyScript} className="absolute top-2 right-2 bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded text-[10px] flex items-center gap-1 backdrop-blur-sm transition-colors">
                            {copied ? <><Check size={12}/> Tersalin</> : 'Copy Code'}
                        </button>
                    </div>

                    <ol className="list-decimal pl-5 space-y-1 mt-3" start="4">
                        <li>Klik <strong>Terapkan (Deploy) &gt; Deployment Baru</strong>.</li>
                        <li>Pada bagian jenis, pilih <strong>Aplikasi Web</strong> (Web App).</li>
                        <li>Pada bagian <em>Akses (Who has access)</em>, WAJIB pilih: <strong>Siapa Saja (Anyone)</strong>. Klik Terapkan.</li>
                        <li>Salin URL Web App yang muncul dan tempelkan di menu pengaturan aplikasi ini.</li>
                    </ol>
                    
                    <div className="bg-yellow-50 text-yellow-800 p-3 rounded border border-yellow-200 mt-4 shrink-0">
                        <Info size={16} className="inline mb-1 mr-1"/>
                        <span className="text-xs">Data rahasia Anda (Key & URL) hanya tersimpan lokal di peramban (browser) yang Anda gunakan saat ini.</span>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* INPUT PENGATURAN API & SPREADSHEET */}
      {showApiKeyInput && <div className="max-w-6xl mx-auto mt-4 px-4 no-print animate-fade-in">
        <div className="bg-white p-4 rounded shadow-lg border-l-4 border-indigo-500 flex flex-col gap-4 relative">
          <div className="absolute top-4 right-4 flex gap-3 items-center">
              <button type="button" onClick={() => setShowApiGuide(true)} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full flex items-center gap-1 hover:bg-indigo-200">
                <HelpCircle size={12}/> Butuh Panduan?
              </button>
              <button type="button" onClick={() => setShowApiKeyInput(false)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Tutup Pengaturan">
                <X size={18}/>
              </button>
          </div>
          
          <div className="flex-1 text-gray-800 pr-40">
            <h3 className="font-bold flex items-center gap-2"><Key size={16}/> API Key Google Gemini</h3>
            <p className="text-xs text-gray-500">Masukkan kunci API untuk mengaktifkan kecerdasan buatan.</p>
          </div>
          
          <div className="space-y-3 w-full">
            <input type="password" placeholder="Paste Key Gemini (AIza...)" value={userApiKey} onChange={e=>setUserApiKey(e.target.value)} className="w-full border p-2 rounded text-gray-800"/>
            
            <div className="flex flex-col md:flex-row gap-2">
                <div className="flex items-center gap-2 border p-2 rounded bg-gray-50 flex-1">
                    <Cpu size={16} className="text-gray-500"/>
                    <select value={selectedModel} onChange={handleModelChange} className="bg-transparent text-sm text-gray-700 outline-none w-full">
                        {dynamicModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                </div>

                {selectedModel === 'custom' && (
                    <input type="text" placeholder="Nama model (gemini-1.5-flash)" value={customModelName} onChange={handleCustomModelChange} className="border p-2 rounded flex-1 text-sm bg-yellow-50" />
                )}
            </div>

            <hr className="my-2 border-gray-200"/>

<div className="flex-1 text-gray-800">
    <h3 className="font-bold flex items-center gap-2"><Database size={16}/> Spreadsheet ID (Opsional)</h3>
    <p className="text-xs text-gray-500">Masukkan ID Spreadsheet Anda untuk menyimpan bank RPP secara otomatis.</p>
</div>
<input type="text" placeholder="Paste ID Spreadsheet di sini..." value={spreadsheetId} onChange={e=>setSpreadsheetId(e.target.value)} className="w-full border p-2 rounded text-gray-800 text-sm"/>

<div className="flex gap-2 flex-wrap mt-4">
    <button type="button" onClick={saveSettings} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded flex-1 font-bold">Simpan Pengaturan</button>
    <button type="button" id="btn-test" onClick={testConnection} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded flex items-center gap-1"><Activity size={14}/> Tes Koneksi AI</button>
    <button type="button" onClick={checkAvailableModels} disabled={isCheckingModels} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded flex items-center gap-1">
        {isCheckingModels ? <Loader2 className="animate-spin" size={14}/> : <Menu size={14}/>} Cek Daftar Model
    </button>
</div>

            {Array.isArray(availableModels) && availableModels.length > 0 && (
                <div className="mt-2 bg-emerald-50 border border-emerald-200 p-3 rounded text-sm text-gray-800">
                    <h4 className="font-bold flex items-center gap-2 mb-2 text-emerald-700"><Check size={14}/> Model yang Diizinkan untuk Key ini:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                        {availableModels.map((m, index) => {
                            const cleanName = m.name ? m.name.replace('models/', '') : 'Model Tanpa Nama';
                            const isActive = getActiveModelName() === cleanName;

                            return (
                                <div key={m.name || index} className={`flex justify-between items-center p-2 border rounded shadow-sm transition-colors ${isActive ? 'bg-emerald-50 border-emerald-500' : 'bg-white'}`}>
                                    <span className={`font-mono text-xs ${isActive ? 'font-bold text-emerald-800' : 'text-gray-700'}`}>{cleanName}</span>
                                    <button 
                                        type="button"
                                        onClick={() => selectFoundModel(m.name)} 
                                        className={`text-xs px-3 py-1 rounded transition-colors ${isActive ? 'bg-emerald-600 text-white font-bold' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                                    >
                                        {isActive ? '✓ Terpilih' : 'Pilih'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>}
      
      {/* ERROR & DEBUG LOG */}
      {errorMsg && (
        <div className="max-w-6xl mx-auto mt-4 px-4 no-print">
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded flex flex-col gap-2">
                <div className="flex items-center gap-2 font-bold"><AlertTriangle size={16}/> {errorMsg} <button type="button" className="ml-auto" onClick={()=>{setErrorMsg(null); setDebugLog(null);}}><X size={16}/></button></div>
                {debugLog && (
                    <div className="mt-2 bg-black text-green-400 p-2 rounded text-xs font-mono overflow-auto max-h-40">
                        <div className="flex items-center gap-2 border-b border-gray-700 pb-1 mb-1"><Terminal size={12}/> Respon Asli dari Google:</div>
                        <pre>{debugLog}</pre>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* HISTORY WITH CLOUD SYNC */}
      {showHistory && (
          <div className="fixed inset-0 z-50 flex justify-end">
              <div className="absolute inset-0 bg-black/50" onClick={()=>setShowHistory(false)}></div>
              <div className={`relative w-80 h-full shadow-xl flex flex-col ${isDarkMode?'bg-gray-900 text-white':'bg-white text-gray-800'}`}>
                  <div className="p-4 border-b flex justify-between items-center">
                      <h2 className="font-bold flex items-center gap-2">
                          <Cloud className="text-blue-500" size={18}/> Riwayat Cloud
                      </h2>
                      <div className="flex gap-3 items-center">
                          <button type="button" onClick={() => loadCloudHistory()} className={`text-blue-500 hover:text-blue-700 ${isSyncing ? 'animate-spin' : ''}`} title="Sinkronisasi Ulang">
                              <RefreshCw size={16}/>
                          </button>
                          <button type="button" onClick={()=>setShowHistory(false)} className="text-gray-500 hover:text-red-500"><X size={18}/></button>
                      </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                      {history.length === 0 ? (
                          <div className="text-center text-sm text-gray-500 mt-10">Belum ada riwayat RPP yang tersimpan.</div>
                      ) : (
                          history.map(h => (
                              <div key={h.id} className="p-3 border rounded cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/50 transition-colors" 
                                  onClick={()=>{
                                      setFormData(h.formData); 
                                      setAiContent(h.aiContent); 
                                      setRubricContent(null); 
                                      setLkpdContent(null); 
                                      setInstrumenContent(null);
                                      setIsGenerated(true); 
                                      setShowHistory(false);
                                  }}>
                                  <div className="font-bold text-sm text-indigo-700">{h.title}</div>
                                  <div className="text-xs opacity-60 mt-1 flex items-center gap-1"><Cloud size={10}/> {h.date}</div>
                                  <button type="button" onClick={(e)=>{
                                      e.stopPropagation();
                                      if(window.confirm('Hapus dari riwayat lokal? (Data di Google Sheets tidak terhapus)')) {
                                          setHistory(x=>x.filter(i=>i.id!==h.id))
                                      }
                                  }} className="text-red-500 text-[10px] mt-2 px-2 py-1 bg-red-50 rounded">Hapus Lokal</button>
                              </div>
                          ))
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* CUSTOM CSS UNTUK PREVIEW */}
      <style>{`
        .custom-html-content table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .custom-html-content th, .custom-html-content td { border: 1px solid black; padding: 5px; text-align: left; }
        .custom-html-content h1, .custom-html-content h2, .custom-html-content h3 { font-size: 1.15rem; font-weight: bold; margin-top: 1.2rem; margin-bottom: 0.5rem; }
        .custom-html-content h4, .custom-html-content h5 { font-size: 1rem; font-weight: bold; margin-top: 1rem; margin-bottom: 0.5rem; }
        .custom-html-content ul, .custom-html-content ol { padding-left: 20px; margin-bottom: 10px; list-style-type: disc; }
      `}</style>

      <main className="max-w-6xl mx-auto mt-6 px-4 pb-20 flex-grow">
        {!isGenerated ? (
          <form onSubmit={handleSubmit} className={`rounded-xl shadow-2xl p-6 md:p-8 border relative ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-800'}`}>
            <div className="flex justify-between items-center mb-6 border-b pb-2">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    📝 Data Perencanaan 
                    <span 
                        className="text-[10px] font-normal bg-green-100 text-green-700 px-2 py-0.5 rounded ml-2 flex items-center gap-1 cursor-help" 
                        title="Jika URL Spreadsheet diatur, RPP otomatis tersimpan ke Cloud saat di-Generate."
                    >
                        <Cloud size={10}/> Auto-Sync Cloud
                    </span>
                </h2>
                <button type="button" onClick={clearForm} className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded flex items-center gap-1"><Trash2 size={12}/> Bersihkan Form</button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div><label className={cssLabel}>Pemerintah Daerah (Kop)</label><input name="pemda" value={formData.pemda} onChange={handleChange} className={cssInput} placeholder="Cth: Pemerintah Kabupaten Maros" /></div>
              <div><label className={cssLabel}>Satuan Pendidikan</label><input name="namaSatuan" value={formData.namaSatuan} onChange={handleChange} className={cssInput} required /></div>
              
              <div className="md:col-span-2"><label className={cssLabel}>Alamat Sekolah</label><input name="alamatSekolah" value={formData.alamatSekolah} onChange={handleChange} className={cssInput} placeholder="Cth: Jl. Pendidikan No. 1, Kec. Mandai..." /></div>
              
              <div><label className={cssLabel}>Nama Kepala Sekolah</label><input name="namaKepsek" value={formData.namaKepsek} onChange={handleChange} className={cssInput} required /></div>
              <div><label className={cssLabel}>NIP Kepsek</label><input name="nipKepsek" value={formData.nipKepsek} onChange={handleChange} className={cssInput} /></div>
              
              <div><label className={cssLabel}>Nama Guru</label><input name="namaGuru" value={formData.namaGuru} onChange={handleChange} className={cssInput} required /></div>
              <div><label className={cssLabel}>NIP Guru</label><input name="nipGuru" value={formData.nipGuru} onChange={handleChange} className={cssInput} /></div>
              
              <div><label className={cssLabel}>Kota/Kab Tempat TTD</label><input name="tempatTtd" value={formData.tempatTtd} onChange={handleChange} className={cssInput} placeholder="Cth: Maros" required /></div>
              <div><label className={cssLabel}>Tanggal RPP</label><input type="date" name="tanggalRPP" value={formData.tanggalRPP} onChange={handleChange} className={cssInput} required /></div>

              <div className="md:col-span-2 mt-2">
                  <label className={cssLabel}>Logo Sekolah (Opsional)</label>
                  <div className={`flex items-center gap-4 p-3 border rounded-md transition-colors ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                      {logoBase64 ? (
                          <div className="relative shrink-0">
                              <img src={logoBase64} alt="Logo" className="w-16 h-16 object-contain border bg-white p-1 rounded" />
                              <button type="button" onClick={hapusLogo} className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-colors" title="Hapus Logo">
                                  <X size={12}/>
                              </button>
                          </div>
                      ) : (
                          <div className={`w-16 h-16 border-2 border-dashed flex items-center justify-center rounded text-xs text-center shrink-0 ${isDarkMode ? 'border-gray-500 text-gray-400 bg-gray-800' : 'border-gray-300 text-gray-400 bg-white'}`}>
                              Tanpa Logo
                          </div>
                      )}
                      <div className="flex-1">
                          <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleLogoUpload} 
                              className={`text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold cursor-pointer w-full
                                  ${isDarkMode ? 'text-gray-300 file:bg-gray-600 file:text-white hover:file:bg-gray-500' : 'text-gray-500 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100'}`}
                          />
                          <p className={`text-[10px] mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Format JPG/PNG (Maks 2MB). Logo akan tersimpan otomatis di perangkat ini untuk penggunaan selanjutnya.
                          </p>
                      </div>
                  </div>
              </div>
              </div>
            <div className="grid md:grid-cols-4 gap-4 mb-4 mt-6">
              <div><label className={cssLabel}>Jenjang</label><select name="jenjang" value={formData.jenjang} onChange={handleJenjangChange} className={cssInput}>{JENJANG_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
              <div><label className={cssLabel}>Kelas</label><select name="kelas" value={formData.kelas} onChange={handleChange} className={cssInput}>{KELAS_BY_JENJANG[formData.jenjang].map(k => <option key={k} value={k}>{k}</option>)}</select></div>
              <div><label className={cssLabel}>Semester</label><select name="semester" value={formData.semester} onChange={handleChange} className={cssInput}><option value="Ganjil">Ganjil</option><option value="Genap">Genap</option></select></div>
              <div><label className={cssLabel}>Mapel</label><input name="mapel" value={formData.mapel} onChange={handleChange} className={cssInput} required /></div>
            </div>
            <div className="space-y-4 mb-4">
              <div><label className={cssLabel}>Capaian Pembelajaran <button type="button" onClick={() => generateSimple('cp', `Carikan CP Kurikulum Merdeka ${formData.mapel} ${formData.jenjang} ${formData.kelas}`, 'CP')} disabled={loadingStatus} className="text-xs bg-indigo-100 text-indigo-700 px-2 rounded ml-2">{loadingStatus === 'CP' ? <Loader2 className="inline h-3 w-3 animate-spin"/> : '✨ Cari CP'}</button></label><textarea name="cp" value={formData.cp} onChange={handleChange} rows={2} className={cssInput} /></div>
              <div><label className={cssLabel}>Materi</label><textarea name="materi" value={formData.materi} onChange={handleChange} rows={2} className={cssInput} /></div>
              <div><label className={cssLabel}>Tujuan Pembelajaran <button type="button" onClick={() => generateSimple('tp', `Buat TP dari CP ${formData.cp} materi ${formData.materi}`, 'TP')} disabled={loadingStatus} className="text-xs bg-indigo-100 text-indigo-700 px-2 rounded ml-2">{loadingStatus === 'TP' ? <Loader2 className="inline h-3 w-3 animate-spin"/> : '✨ Buat TP'}</button></label><textarea name="tp" value={formData.tp} onChange={handleChange} rows={2} className={cssInput} /></div>
              
              <div><label className={cssLabel}>Indikator Pembelajaran (IKTP/KD) <button type="button" onClick={() => generateSimple('indikator', `Buat minimal 3 Indikator Ketercapaian Tujuan Pembelajaran (IKTP) dari TP: ${formData.tp}, materi: ${formData.materi}`, 'Indikator')} disabled={loadingStatus} className="text-xs bg-indigo-100 text-indigo-700 px-2 rounded ml-2">{loadingStatus === 'Indikator' ? <Loader2 className="inline h-3 w-3 animate-spin"/> : '✨ Buat Indikator'}</button></label><textarea name="indikator" value={formData.indikator} onChange={handleChange} rows={2} className={cssInput} placeholder="Siswa mampu menyebutkan..., Siswa mampu mempraktikkan..." /></div>
            </div>
            
            <div className="bg-indigo-50 p-4 rounded mb-4 border border-indigo-100 text-gray-800">
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div><label className="text-sm font-medium">Jml Pertemuan</label><input type="number" name="jumlahPertemuan" min="1" max="20" value={formData.jumlahPertemuan} onChange={handleChange} className="w-full p-2 border rounded" /></div>
                <div><label className="text-sm font-medium">Alokasi Waktu (JP)</label><input name="durasi" value={formData.durasi} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Contoh: 2 JP x 35 Menit" /></div>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {formData.metodePerPertemuan.map((m, i) => (
                  <div key={i} className="flex flex-col bg-white p-2 rounded shadow-sm border border-gray-200">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase mb-1 tracking-wider">
                      Pertemuan {i + 1}
                    </span>
                    <select 
                      value={m} 
                      onChange={e => handleMethodChange(i, e.target.value)} 
                      className="p-1.5 border border-gray-300 rounded text-sm w-full outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-gray-50 mb-1"
                    >
                      {PEDAGOGI_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <span className="text-[10px] text-gray-500 leading-tight">
                      <span className="font-bold text-amber-500">💡 Info:</span> {PEDAGOGI_INFO[m] || 'Pilih metode.'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4">
                <span className={cssLabel}>Dimensi Profil Pelajar Pancasila</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {DIMENSI_OPTIONS.map(d => (
                        <div key={d} className="relative group">
                            <label className={`flex items-center p-2 border rounded text-xs cursor-pointer h-full transition-colors ${formData.dimensi.includes(d) ? 'bg-indigo-100 border-indigo-500' : 'hover:bg-gray-50'}`}>
                                <input type="checkbox" checked={formData.dimensi.includes(d)} onChange={() => handleCheckboxChange(d)} className="mr-2" />
                                {d}
                            </label>
                            <div className="absolute z-10 bottom-full mb-1 left-1/2 -translate-x-1/2 w-48 bg-gray-800 text-white text-[10px] p-2 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-lg pointer-events-none">
                                {DIMENSI_INFO[d]}
                                <svg className="absolute text-gray-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255" xmlSpace="preserve"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mb-6">
                <label className={cssLabel}>Catatan Tambahan / Instruksi Khusus (Opsional)</label>
                <textarea 
                    name="catatanKhusus" 
                    value={formData.catatanKhusus} 
                    onChange={handleChange} 
                    placeholder="Contoh: 'Siswa kelas saya sangat aktif bergerak, perbanyak aktivitas fisik', atau 'Buatkan game berburu kata terkait materi ini', dll."
                    rows={2} 
                    className={cssInput} 
                />
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2">{isLoading ? <Loader2 className="animate-spin" /> : <Sparkles />} Generate RPM</button>
          </form>
        ) : (
          <div className="animate-slide-up">
            <div className={`flex flex-wrap gap-2 justify-between items-center mb-4 p-3 rounded shadow border no-print ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white text-gray-800'}`}>
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsGenerated(false)} className="px-3 py-1.5 border rounded text-sm hover:bg-gray-100 hover:text-black flex gap-1 items-center"><RefreshCcw size={14} /> Kembali ke Form</button>
                <button type="button" onClick={() => setIsEditing(!isEditing)} className={`px-3 py-1.5 border rounded text-sm flex gap-1 items-center ${isEditing ? 'bg-yellow-100 text-yellow-800' : 'hover:bg-gray-100 hover:text-black'}`}><Edit size={14} /> {isEditing ? 'Selesai Edit' : 'Edit Hasil'}</button>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button type="button" onClick={() => generateSimple('rubric', `Buat rubrik TP ${formData.tp}`, 'Rubric')} disabled={loadingStatus === 'Rubric'} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm flex gap-1 items-center transition-colors">{loadingStatus === 'Rubric' ? <Loader2 className="animate-spin" size={14} /> : <Table size={14} />} Rubrik</button>
                <button type="button" onClick={() => generateSimple('instrumen', `Buat instrumen TP ${formData.tp}`, 'Instrumen')} disabled={loadingStatus === 'Instrumen'} className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm flex gap-1 items-center transition-colors">{loadingStatus === 'Instrumen' ? <Loader2 className="animate-spin" size={14} /> : <ClipboardCheck size={14} />} Instrumen</button>
                <button type="button" onClick={() => generateSimple('lkpd', `Buat LKPD ${formData.materi} ${formData.jenjang}`, 'LKPD')} disabled={loadingStatus === 'LKPD'} className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded text-sm flex gap-1 items-center transition-colors">{loadingStatus === 'LKPD' ? <Loader2 className="animate-spin" size={14} /> : <FileSignature size={14} />} LKPD</button>
                <button type="button" onClick={handleWord} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm flex gap-1 items-center transition-colors"><FileDown size={14} /> Word</button>
                <button type="button" onClick={handlePrint} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm flex gap-1 items-center transition-colors"><Printer size={14} /> PDF/Cetak</button>
              </div>
            </div>

            <div className="bg-gray-500/10 p-4 rounded overflow-auto shadow-inner">
              <div id="printable-area" className="bg-white shadow-xl p-8 mx-auto text-black font-serif leading-relaxed" style={{ maxWidth: '21cm', minHeight: '29.7cm' }}>
                <div ref={outputRef}>
                  {aiContent.map((rpm, i) => (
                    <div key={i} className={i > 0 ? "page-break" : ""} style={{ marginBottom: '40px', pageBreakBefore: i > 0 ? 'always' : 'auto' }}>
                      
                      {/* HEADER / KOP SURAT Tahan Banting MS Word */}
                      <table className="kop-surat no-border" style={{ width: '100%', marginBottom: '20px', borderBottom: '3px double black', paddingBottom: '10px', borderCollapse: 'collapse', border: 'none' }}>
                          <tbody>
                              <tr>
                                  <td style={{ width: '15%', verticalAlign: 'middle', textAlign: 'center', border: 'none' }}>
                                    {logoBase64 ? (
                                        <img 
                                            src={logoBase64} 
                                            alt="Logo Sekolah" 
                                            width="110" 
                                            style={{ width: '110px', height: '110px', objectFit: 'contain', margin: '0 auto' }} 
                                        />
                                    ) : (
                                        <div style={{ width: '110px', height: '110px', margin: '0 auto', border: '1px dashed gray', padding: '40px 0', boxSizing: 'border-box', fontSize: '10px', color: 'gray', textAlign: 'center', lineHeight: '1.2' }}>
                                            LOGO<br/>SEKOLAH
                                        </div>
                                    )}
                                  </td>
                                  <td style={{ width: '70%', verticalAlign: 'middle', textAlign: 'center', border: 'none' }}>
                                      <h4 style={{ margin: 0, fontSize: '12pt', fontWeight: 'normal', textTransform: 'uppercase' }}>{formData.pemda || 'PEMERINTAH KABUPATEN/KOTA'}</h4>
                                      <h3 style={{ margin: 0, fontSize: '14pt', fontWeight: 'bold', textTransform: 'uppercase' }}>DINAS PENDIDIKAN DAN KEBUDAYAAN</h3>
                                      <h3 style={{ margin: 0, fontSize: '16pt', fontWeight: 'bold', textTransform: 'uppercase' }}>{formData.namaSatuan}</h3>
                                      <p style={{ margin: 0, fontSize: '10pt', fontStyle: 'italic' }}>Alamat: {formData.alamatSekolah || 'Jl. Pendidikan No. 1 (Contoh Alamat Sekolah)'}</p>
                                  </td>
                                  <td style={{ width: '15%', border: 'none' }}></td>
                              </tr>
                          </tbody>
                      </table>

                      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                          <h2 style={{ fontSize: '14pt', fontWeight: 'bold', textDecoration: 'underline', margin: '0 0 5px 0' }}>MODUL AJAR / RPP</h2>
                          <p style={{ margin: 0 }}>Tahun Pelajaran {new Date().getFullYear()}/{new Date().getFullYear() + 1}</p>
                      </div>

                      {/* INFORMASI UMUM (Tabel Identitas) */}
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', border: '1px solid black' }}>
                          <tbody>
                              <tr>
                                  <td style={{ width: '25%', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Nama Penyusun</td>
                                  <td style={{ width: '25%' }}>{formData.namaGuru}</td>
                                  <td style={{ width: '25%', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Mata Pelajaran</td>
                                  <td style={{ width: '25%' }}>{formData.mapel}</td>
                              </tr>
                              <tr>
                                  <td style={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Satuan Pendidikan</td>
                                  <td>{formData.namaSatuan}</td>
                                  <td style={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Jenjang/Kls/Smt</td>
                                  <td>{formData.jenjang} / {formData.kelas} / {formData.semester}</td>
                              </tr>
                              <tr>
                                  <td style={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Alokasi Waktu (JP)</td>
                                  <td>{formData.durasi} (Pert. {i + 1})</td>
                                  <td style={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Materi Pokok</td>
                                  <td>{formData.materi}</td>
                              </tr>
                          </tbody>
                      </table>

                      {/* KOMPONEN INTI */}
                      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black' }}>
                          <tbody>
                              {/* A. TUJUAN PEMBELAJARAN */}
                              <tr style={{ backgroundColor: '#e5e7eb' }}>
                                  <td colSpan="2" style={{ fontWeight: 'bold', border: '1px solid black', padding: '8px' }}>A. TUJUAN PEMBELAJARAN</td>
                              </tr>
                              <tr>
                                  <td style={{ width: '30%', verticalAlign: 'top', padding: '8px', border: '1px solid black' }}>Capaian Pembelajaran</td>
                                  <td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}>{formatRender(formData.cp)}</td>
                              </tr>
                              <tr>
                                  <td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}>Tujuan Pembelajaran</td>
                                  <td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}>{formatRender(formData.tp)}</td>
                              </tr>
                              {/* BARIS INDIKATOR */}
                              {formData.indikator && (
                                  <tr>
                                      <td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}>Indikator (IKTP)</td>
                                      <td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}>{formatRender(formData.indikator)}</td>
                                  </tr>
                              )}
                              <tr>
                                  <td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}>Dimensi Profil Lulusan</td>
                                  <td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}>{formData.dimensi.join(', ')}</td>
                              </tr>
                              <tr>
                                  <td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}>Target Peserta Didik</td>
                                  <td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}><EditCell val={rpm.siswa} idx={i} path="siswa" multi /></td>
                              </tr>

                              {/* B. KEGIATAN PEMBELAJARAN */}
                              <tr style={{ backgroundColor: '#e5e7eb' }}>
                                  <td colSpan="2" style={{ fontWeight: 'bold', border: '1px solid black', padding: '8px' }}>
                                      B. KEGIATAN PEMBELAJARAN <br/>
                                      <span style={{ fontWeight: 'normal', fontSize: '10pt' }}>Model: {formData.metodePerPertemuan[i]}</span>
                                  </td>
                              </tr>
                              <tr>
                                  <td style={{ fontWeight: 'bold', verticalAlign: 'top', padding: '8px', border: '1px solid black' }}>1. Kegiatan Pendahuluan<br/><span style={{fontWeight:'normal', fontSize:'9pt'}}>(Memahami/Apersepsi)</span></td>
                                  <td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}><EditCell val={rpm.pengalaman?.memahami} idx={i} path="pengalaman.memahami" multi /></td>
                              </tr>
                              <tr>
                                  <td style={{ fontWeight: 'bold', verticalAlign: 'top', padding: '8px', border: '1px solid black' }}>2. Kegiatan Inti<br/><span style={{fontWeight:'normal', fontSize:'9pt'}}>(Mengaplikasi/Eksplorasi)</span></td>
                                  <td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}><EditCell val={rpm.pengalaman?.mengaplikasi} idx={i} path="pengalaman.mengaplikasi" multi /></td>
                              </tr>
                              <tr>
                                  <td style={{ fontWeight: 'bold', verticalAlign: 'top', padding: '8px', border: '1px solid black' }}>3. Kegiatan Penutup<br/><span style={{fontWeight:'normal', fontSize:'9pt'}}>(Refleksi)</span></td>
                                  <td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}><EditCell val={rpm.pengalaman?.refleksi} idx={i} path="pengalaman.refleksi" multi /></td>
                              </tr>

                              {/* C. ASESMEN */}
                              <tr style={{ backgroundColor: '#e5e7eb' }}>
                                  <td colSpan="2" style={{ fontWeight: 'bold', border: '1px solid black', padding: '8px' }}>C. ASESMEN / PENILAIAN</td>
                              </tr>
                              <tr>
                                  <td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}>Asesmen Diagnostik (Awal)</td>
                                  <td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}><EditCell val={rpm.asesmen?.awal} idx={i} path="asesmen.awal" multi /></td>
                              </tr>
                              <tr>
                                  <td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}>Asesmen Formatif (Proses)</td>
                                  <td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}><EditCell val={rpm.asesmen?.proses} idx={i} path="asesmen.proses" multi /></td>
                              </tr>
                              <tr>
                                  <td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}>Asesmen Sumatif (Akhir)</td>
                                  <td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}><EditCell val={rpm.asesmen?.akhir} idx={i} path="asesmen.akhir" multi /></td>
                              </tr>

                              {/* D. MEDIA & SUMBER BELAJAR */}
                              <tr style={{ backgroundColor: '#e5e7eb' }}>
                                  <td colSpan="2" style={{ fontWeight: 'bold', border: '1px solid black', padding: '8px' }}>D. MEDIA & SUMBER BELAJAR</td>
                              </tr>
                              <tr>
                                  <td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}>Media & Alat</td>
                                  <td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}><EditCell val={rpm.digital} idx={i} path="digital" multi /></td>
                              </tr>
                              <tr>
                                  <td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}>Sumber Belajar/Mitra</td>
                                  <td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}><EditCell val={rpm.kemitraan} idx={i} path="kemitraan" multi /></td>
                              </tr>
                          </tbody>
                      </table>

                      {/* SIGNATURE SECTION */}
                      <table className="signature-section no-border" style={{ width: '100%', marginTop: '50px', border: 'none' }}>
                          <tbody>
                              <tr>
                                  <td style={{ textAlign: 'center', width: '50%', verticalAlign: 'top', border: 'none' }}>
                                      <p style={{ margin: 0 }}>Mengetahui,</p>
                                      <p style={{ margin: 0 }}>Kepala Sekolah</p>
                                      <br /><br /><br /><br />
                                      <p style={{ fontWeight: 'bold', textDecoration: 'underline', margin: 0 }}>{formData.namaKepsek}</p>
                                      <p style={{ margin: 0 }}>NIP. {formData.nipKepsek || '-'}</p>
                                  </td>
                                  <td style={{ textAlign: 'center', width: '50%', verticalAlign: 'top', border: 'none' }}>
                                      <p style={{ margin: 0 }}>{formData.tempatTtd || formData.namaSatuan}, {new Date(formData.tanggalRPP).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                      <p style={{ margin: 0 }}>Guru Mata Pelajaran</p>
                                      <br /><br /><br /><br />
                                      <p style={{ fontWeight: 'bold', textDecoration: 'underline', margin: 0 }}>{formData.namaGuru}</p>
                                      <p style={{ margin: 0 }}>NIP. {formData.nipGuru || '-'}</p>
                                  </td>
                              </tr>
                          </tbody>
                      </table>

                    </div>
                  ))}
                  
                  {/* LAMPIRAN-LAMPIRAN */}
                  {rubricContent && <div className="mt-8 page-break custom-html-content"><h3 className="font-bold text-center border-b border-black pb-2 mb-4">LAMPIRAN 1: RUBRIK PENILAIAN</h3><div dangerouslySetInnerHTML={{ __html: rubricContent }} /></div>}
                  {instrumenContent && <div className="mt-8 page-break custom-html-content"><h3 className="font-bold text-center border-b border-black pb-2 mb-4">LAMPIRAN 2: INSTRUMEN EVALUASI</h3><div dangerouslySetInnerHTML={{ __html: instrumenContent }} /></div>}
                  {lkpdContent && <div className="mt-8 page-break custom-html-content"><h3 className="font-bold text-center border-b border-black pb-2 mb-4">LAMPIRAN 3: LEMBAR KERJA PESERTA DIDIK (LKPD)</h3><div dangerouslySetInnerHTML={{ __html: lkpdContent }} /></div>}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <footer className={`text-center py-6 text-sm font-medium no-print ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {APP_NAME_P1} {APP_NAME_P2} © {new Date().getFullYear()} • Dev: Ibnu Husny
      </footer>
    </div>
  );
}
