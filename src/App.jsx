import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, RefreshCcw, Sparkles, Wand2, Loader2, Moon, Sun, History, 
  Printer, FileDown, Edit, X, Trash2, Table, FileSignature, Key, 
  AlertTriangle, Layers, Cpu, Activity, Terminal, Menu, Check
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
  { value: 'SD', label: 'SD (Sekolah Dasar)' },
  { value: 'SMP', label: 'SMP (Sekolah Menengah Pertama)' },
  { value: 'SMA', label: 'SMA (Sekolah Menengah Atas)' }
];

const KELAS_BY_JENJANG = {
  'SD': ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'],
  'SMP': ['Kelas 7', 'Kelas 8', 'Kelas 9'],
  'SMA': ['Kelas 10', 'Kelas 11', 'Kelas 12']
};

const PEDAGOGI_OPTIONS = [
  'Inkuiri-Discovery Learning', 'Project Based Learning (PjBL)', 'Problem Based Learning (PBL)',
  'Game Based Learning', 'Station Learning', 'Flipped Classroom', 'Cooperative Learning',
  'Differentiated Instruction', 'Culturally Responsive Teaching', 'Social Emotional Learning', 'Ceramah Interaktif'
];

const DIMENSI_OPTIONS = ['Keimanan & Ketakwaan', 'Kewargaan', 'Penalaran Kritis', 'Kreativitas', 'Kolaborasi', 'Kemandirian', 'Kesehatan', 'Komunikasi'];

const GRADIENT_THEMES = [
  { id: 'royal', class: 'from-indigo-600 via-purple-600 to-violet-800' },
  { id: 'ocean', class: 'from-blue-600 via-cyan-600 to-teal-700' },
  { id: 'nature', class: 'from-emerald-600 via-green-600 to-lime-700' },
  { id: 'sunset', class: 'from-orange-500 via-red-500 to-rose-700' },
  { id: 'berry', class: 'from-pink-600 via-rose-600 to-purple-700' }
];

// Opsi Model AI Standar
const AI_MODELS = [
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Standar)' },
  { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash (Exp)' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Cerdas)' },
  { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro (Legacy)' },
  { id: 'custom', name: 'Gunakan Model Custom...' }
];

export default function RPMGenerator() {
  // --- STATE ---
  const [formData, setFormData] = useState({
    namaSatuan: '', namaGuru: '', nipGuru: '', namaKepsek: '', nipKepsek: '',
    jenjang: 'SD', kelas: 'Kelas 1', mapel: '', cp: '', tp: '', materi: '',
    jumlahPertemuan: 1, durasi: '2 x 35 Menit', metodePerPertemuan: ['Inkuiri-Discovery Learning'], dimensi: []
  });

  const [isGenerated, setIsGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(''); 
  
  const [userApiKey, setUserApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash');
  const [customModelName, setCustomModelName] = useState('');
  
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [debugLog, setDebugLog] = useState(null);
  
  // State baru untuk Daftar Model
  const [availableModels, setAvailableModels] = useState([]); // Default array kosong biar aman
  const [isCheckingModels, setIsCheckingModels] = useState(false);
  
  const [aiContent, setAiContent] = useState([]); 
  const [rubricContent, setRubricContent] = useState(null);
  const [lkpdContent, setLkpdContent] = useState(null);
  
  const [isEditing, setIsEditing] = useState(false); 
  const [history, setHistory] = useState([]); 
  const [showHistory, setShowHistory] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedGradient, setSelectedGradient] = useState(GRADIENT_THEMES[0]);

  const outputRef = useRef(null);

  // --- INIT ---
  useEffect(() => {
    const storedKey = safeStorage.getItem('user_gemini_api_key');
    if (storedKey) setUserApiKey(storedKey);
    else setShowApiKeyInput(true);

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
  }, []);

  useEffect(() => {
    if (history.length > 0) safeStorage.setItem('rpm_history', JSON.stringify(history));
  }, [history]);

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

  // --- HANDLERS ---
  const saveKey = (k) => {
    const v = k.trim();
    setUserApiKey(v);
    safeStorage.setItem('user_gemini_api_key', v);
    alert("API Key tersimpan!");
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
      // Bersihkan prefix 'models/' jika ada
      const cleanName = modelName.replace('models/', '');
      setSelectedModel('custom');
      setCustomModelName(cleanName);
      safeStorage.setItem('user_gemini_model', 'custom');
      safeStorage.setItem('user_gemini_custom_model', cleanName);
  }

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleMethodChange = (i, v) => setFormData(prev => { const m = [...prev.metodePerPertemuan]; m[i] = v; return { ...prev, metodePerPertemuan: m }; });
  const handleCheckboxChange = (v) => setFormData(prev => { const c = prev.dimensi; return { ...prev, dimensi: c.includes(v) ? c.filter(i => i !== v) : [...c, v] }; });
  const handleJenjangChange = (e) => setFormData(prev => ({ ...prev, jenjang: e.target.value, kelas: KELAS_BY_JENJANG[e.target.value][0] }));

  // --- API ---
  const getActiveModelName = () => {
      return selectedModel === 'custom' ? customModelName : selectedModel;
  }

  // Fungsi Baru: Cek Model apa saja yang tersedia untuk Key ini (VERSI ANTI CRASH)
  const checkAvailableModels = async () => {
      if (!userApiKey) return alert("Masukkan API Key dulu.");
      setIsCheckingModels(true);
      setErrorMsg(null);
      setAvailableModels([]); // Reset ke array kosong
      
      try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${userApiKey}`);
          const data = await res.json();
          
          if (!res.ok) throw new Error(data.error?.message || "Gagal mengambil daftar model");
          
          if (data && data.models && Array.isArray(data.models)) {
              // Filter lebih ketat: pastikan 'name' ada agar tidak crash
              const validModels = data.models.filter(m => 
                  m && // Pastikan m tidak null
                  m.name && // Cek nama ada
                  m.supportedGenerationMethods && 
                  m.supportedGenerationMethods.includes("generateContent")
              );
              setAvailableModels(validModels);
          } else {
              throw new Error("Format data dari Google tidak sesuai atau kosong.");
          }
      } catch (e) {
          setErrorMsg(`Gagal Cek Model: ${e.message}`);
          setAvailableModels([]); // Pastikan tetap array jika error
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
        if(btn) btn.innerHTML = "Tes Koneksi";
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

  // --- CLEANER FUNCTION (Pembersih Respon AI) ---
  const cleanAIResponse = (text) => {
    if (!text) return "";
    let cleaned = text.replace(/^(Tentu|Berikut|Baik|Ini|Silakan|Di bawah|Sebagai|Halo).*?(:|\n)/i, '');
    cleaned = cleaned.replace(/(Catatan|Note|Penting|Harap|Perlu diingat).*?$/is, '');
    return cleaned.trim();
  }

  // --- HTML CLEANER (Hapus Simbol Markdown dari HTML) ---
  const cleanHtmlContent = (text) => {
    if (!text) return "";
    let cleaned = text.replace(/```html/g, '').replace(/```/g, ''); 
    cleaned = cleaned.replace(/\*\*/g, '').replace(/##/g, '').replace(/__/g, '');
    return cleaned.trim();
  }

  // --- GENERATE FUNCTIONS ---
  const generateSimple = async (type, prompt, label) => {
    if (type === 'cp' && !formData.mapel) return alert("Isi Mapel dulu");
    if (type === 'tp' && !formData.cp) return alert("Isi CP dulu");
    if ((type === 'rubric' || type === 'lkpd') && !formData.tp) return alert("Isi TP dulu");

    setLoadingStatus(label);
    
    let strictPrompt = prompt;
    if (type === 'cp' || type === 'tp') {
        strictPrompt += ". INSTRUKSI KHUSUS: HANYA berikan daftarnya saja. Jangan pakai kata pengantar. Jangan pakai penjelasan akhir.";
    } else if (type === 'rubric') {
        strictPrompt += ". INSTRUKSI KHUSUS: Buatkan DALAM FORMAT HTML TABLE (<table>) yang lengkap dengan border. JANGAN gunakan format Markdown (*, #, -). Langsung kode HTML saja.";
    } else if (type === 'lkpd') {
        strictPrompt = `Buatkan Dokumen Lembar Kerja Peserta Didik (LKPD) yang LENGKAP dan SIAP CETAK untuk materi: ${formData.materi}, Kelas: ${formData.kelas} (${formData.jenjang}).
        
        Data Tujuan Pembelajaran (TP): ${formData.tp}
        
        Instruksi Output:
        1. Format WAJIB: HTML Murni (tanpa Markdown, tanpa backticks).
        2. Gaya Bahasa: Menarik untuk siswa, instruktif, dan jelas.
        3. Struktur Wajib:
           - Judul Kegiatan (Tag <h3>, Center)
           - Identitas Siswa (Tabel atau baris titik-titik untuk Nama, Kelas, Tanggal)
           - Petunjuk Pengerjaan (List <ol>)
           - Alat dan Bahan (Jika perlu)
           - Langkah Kegiatan (Inti aktivitas: Berikan instruksi step-by-step detail apa yang harus dilakukan siswa. Misal: "Amati gambar...", "Diskusikan...", "Hitunglah..."). Buat ini mendetail dan relevan dengan materi.
           - Lembar Jawab/Diskusi (Sediakan soal-soal latihan/diskusi (3-5 soal) dan area/kotak kosong dengan border atau garis titik-titik <hr> untuk siswa menulis jawaban).
           - Kesimpulan (Area kosong untuk menyimpulkan).
        
        Styling: Gunakan style inline css untuk mempercantik (border untuk kotak jawaban, padding yang cukup).`;
    }

    const res = await callAI(strictPrompt);
    setLoadingStatus('');
    
    if (res) {
      const cleanedRes = cleanAIResponse(res);

      if (type === 'cp') setFormData(p => ({ ...p, cp: cleanedRes }));
      else if (type === 'tp') setFormData(p => ({ ...p, tp: cleanedRes }));
      else if (type === 'rubric') {
          setRubricContent(cleanHtmlContent(cleanedRes));
      }
      else if (type === 'lkpd') {
          setLkpdContent(cleanHtmlContent(cleanedRes));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const prompt = `Buatkan RPM ${formData.jumlahPertemuan} pertemuan. JSON Array Only. Data: ${JSON.stringify(formData)}. Metode: ${formData.metodePerPertemuan.join(', ')}. Struktur: [{"siswa":"","lintasDisiplin":"","topik":"","kemitraan":"","lingkungan":"","digital":"","pengalaman":{"memahami":"","mengaplikasi":"","refleksi":""},"asesmen":{"awal":"","proses":"","akhir":""}}]`;
    
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
        setIsGenerated(true);
        setIsEditing(false);
        setHistory(p => [{ id: Date.now(), date: new Date().toLocaleDateString(), title: `${formData.mapel} ${formData.kelas}`, formData: {...formData}, aiContent: json }, ...p]);
      } catch (e) { setErrorMsg("Format AI tidak valid. Coba model lain atau generate ulang."); }
    }
    setIsLoading(false);
  };

  // --- EDIT CELL ---
  const updateContent = (i, path, val) => {
    setAiContent(prev => {
      const arr = [...prev];
      const d = { ...arr[i] };
      if (path.includes('.')) {
        const [a, b] = path.split('.');
        d[a] = { ...d[a], [b]: val };
      } else { d[path] = val; }
      arr[i] = d;
      return arr;
    });
  };

  const EditCell = ({ val, idx, path, multi }) => {
    if (!isEditing) return <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: val || '' }} />;
    return multi 
      ? <textarea className="w-full p-1 border bg-yellow-50 text-sm font-sans" rows={6} value={val||''} onChange={e => updateContent(idx, path, e.target.value)} />
      : <input className="w-full p-1 border bg-yellow-50 text-sm font-sans" value={val||''} onChange={e => updateContent(idx, path, e.target.value)} />;
  };

  // Fungsi PEMBERSIH & PERAPI TEKS (Hapus * dan buat Poin)
  const formatRender = (text) => {
    if (!text) return '-';
    let clean = text.replace(/[*#`_]/g, '');
    
    if (clean.includes('\n')) {
        const lines = clean.split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length > 0) {
            return (
                <ul style={{ margin: 0, paddingLeft: '15px', listStyleType: 'disc' }}>
                    {lines.map((l, i) => (
                        <li key={i}>{l.replace(/^[-•]\s*/, '').replace(/^\d+\.\s*/, '')}</li>
                    ))}
                </ul>
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
      .no-border, .no-border td { border: none !important; }
      .page-break { page-break-before: always; }
      .signature-section { margin-top: 50px; page-break-inside: avoid; }
      .signature-section td { text-align: center; border: none !important; }
      ul, ol { margin: 0; padding-left: 20px; }
      .custom-html-content table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      .custom-html-content th, .custom-html-content td { border: 1px solid black; padding: 5px; text-align: left; }
      .custom-html-content h3 { font-weight: bold; font-size: 12pt; margin-top: 15px; border-bottom: 1px solid black; padding-bottom: 5px; }
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
      .no-border td { border: none !important; }
    </style></head><body>${outputRef.current.innerHTML}</body></html>`;
    const url = URL.createObjectURL(new Blob(['\ufeff', html], { type: 'application/msword' }));
    const a = document.createElement('a'); a.href = url; a.download = `RPM_${formData.mapel}.doc`; a.click();
  };

  // --- STYLES ---
  const cssInput = `mt-1 block w-full rounded-md shadow-sm border p-2 ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'}`;
  const cssLabel = `block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`;

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 bg-gradient-to-br ${selectedGradient.class} flex flex-col`}>
      <header className={`p-4 shadow-lg backdrop-blur-md no-print ${isDarkMode ? 'bg-gray-900/90 text-white' : 'bg-white/90 text-gray-800'}`}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-indigo-100"><BookOpen className="h-6 w-6 text-indigo-600" /></div>
            <div><h1 className="text-xl font-bold">Generator RPM <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded">AI v6.8 (Word Fix)</span></h1><p className="text-xs opacity-70">Deep Learning Plan • Dev: Ibnu Husny</p></div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowApiKeyInput(!showApiKeyInput)} className={`p-2 rounded-full ${userApiKey ? 'text-green-500' : 'text-red-500'}`} title="API Key"><Key /></button>
            <button onClick={() => setShowHistory(true)} className="p-2 rounded-full"><History /></button>
            <div className="flex gap-1 hidden md:flex">{GRADIENT_THEMES.map(t => <button key={t.id} onClick={() => setSelectedGradient(t)} className={`w-5 h-5 rounded-full bg-gradient-to-br ${t.class} border-2 ${selectedGradient.id === t.id ? 'border-white' : 'border-transparent'}`} />)}</div>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full">{isDarkMode ? <Sun /> : <Moon />}</button>
          </div>
        </div>
      </header>

      {/* INPUT API KEY & MODEL SELECTOR */}
      {showApiKeyInput && <div className="max-w-6xl mx-auto mt-4 px-4 no-print animate-fade-in">
        <div className="bg-white p-4 rounded shadow-lg border-l-4 border-indigo-500 flex flex-col gap-4">
          <div className="flex-1 text-gray-800">
            <h3 className="font-bold flex items-center gap-2"><Key size={16}/> Pengaturan AI & Koneksi</h3>
            <p className="text-xs text-gray-500">Masukkan API Key Gemini Anda dan cek model yang tersedia.</p>
          </div>
          
          <div className="space-y-3 w-full">
            {/* INPUT KEY */}
            <input type="password" placeholder="Paste Key (AIza...)" value={userApiKey} onChange={e=>setUserApiKey(e.target.value)} className="w-full border p-2 rounded text-gray-800"/>
            
            <div className="flex flex-col md:flex-row gap-2">
                {/* PILIH MODEL */}
                <div className="flex items-center gap-2 border p-2 rounded bg-gray-50 flex-1">
                    <Cpu size={16} className="text-gray-500"/>
                    <select value={selectedModel} onChange={handleModelChange} className="bg-transparent text-sm text-gray-700 outline-none w-full">
                        {AI_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                </div>

                {/* INPUT MODEL MANUAL (Jika pilih Custom) */}
                {selectedModel === 'custom' && (
                    <input 
                        type="text" 
                        placeholder="Nama model (gemini-1.5-flash)" 
                        value={customModelName}
                        onChange={handleCustomModelChange}
                        className="border p-2 rounded flex-1 text-sm bg-yellow-50"
                    />
                )}
            </div>

            <div className="flex gap-2 flex-wrap">
                <button onClick={()=>saveKey(userApiKey)} className="bg-indigo-600 text-white px-4 py-2 rounded flex-1">Simpan Key</button>
                <button id="btn-test" onClick={testConnection} className="bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-1"><Activity size={14}/> Tes</button>
                <button onClick={checkAvailableModels} disabled={isCheckingModels} className="bg-emerald-600 text-white px-4 py-2 rounded flex items-center gap-1">
                    {isCheckingModels ? <Loader2 className="animate-spin" size={14}/> : <Menu size={14}/>} Cek Daftar Model
                </button>
            </div>

            {/* HASIL CEK DAFTAR MODEL */}
            {/* Pengaman: Hanya tampilkan jika availableModels adalah Array dan ada isinya */}
            {Array.isArray(availableModels) && availableModels.length > 0 && (
                <div className="mt-2 bg-emerald-50 border border-emerald-200 p-3 rounded text-sm text-gray-800">
                    <h4 className="font-bold flex items-center gap-2 mb-2 text-emerald-700"><Check size={14}/> Model yang Diizinkan untuk Key ini:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                        {availableModels.map((m, index) => {
                            const cleanName = m.name ? m.name.replace('models/', '') : 'Model Tanpa Nama';
                            return (
                                <div key={m.name || index} className="flex justify-between items-center bg-white p-2 border rounded">
                                    <span className="font-mono text-xs">{cleanName}</span>
                                    <button onClick={() => selectFoundModel(m.name)} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded hover:bg-emerald-200">
                                        Pilih
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
                <div className="flex items-center gap-2 font-bold"><AlertTriangle size={16}/> {errorMsg} <button className="ml-auto" onClick={()=>{setErrorMsg(null); setDebugLog(null);}}><X size={16}/></button></div>
                {debugLog && (
                    <div className="mt-2 bg-black text-green-400 p-2 rounded text-xs font-mono overflow-auto max-h-40">
                        <div className="flex items-center gap-2 border-b border-gray-700 pb-1 mb-1"><Terminal size={12}/> Respon Asli dari Google:</div>
                        <pre>{debugLog}</pre>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* HISTORY */}
      {showHistory && <div className="fixed inset-0 z-50 flex justify-end"><div className="absolute inset-0 bg-black/50" onClick={()=>setShowHistory(false)}></div><div className={`relative w-80 h-full shadow-xl flex flex-col ${isDarkMode?'bg-gray-900 text-white':'bg-white text-gray-800'}`}><div className="p-4 border-b flex justify-between"><h2 className="font-bold">Riwayat</h2><button onClick={()=>setShowHistory(false)}><X/></button></div><div className="flex-1 overflow-y-auto p-4 space-y-2">{history.map(h=><div key={h.id} className="p-2 border rounded cursor-pointer hover:border-indigo-500" onClick={()=>{setFormData(h.formData); setContent({ai:h.aiContent, rubric:null, lkpd:null}); setIsGenerated(true); setShowHistory(false)}}><div className="font-bold text-sm">{h.title}</div><div className="text-xs opacity-60">{h.date}</div><button onClick={(e)=>{e.stopPropagation();setHistory(x=>x.filter(i=>i.id!==h.id))}} className="text-red-500 text-xs mt-1">Hapus</button></div>)}</div></div></div>}

      <main className="max-w-6xl mx-auto mt-6 px-4 pb-20 flex-grow">
        {!isGenerated ? (
          <form onSubmit={handleSubmit} className={`rounded-xl shadow-2xl p-6 md:p-8 border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-800'}`}>
            <h2 className="text-lg font-semibold mb-6 border-b pb-2 flex items-center gap-2">📝 Data Perencanaan</h2>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div><label className={cssLabel}>Satuan Pendidikan</label><input name="namaSatuan" value={formData.namaSatuan} onChange={handleChange} className={cssInput} required /></div>
              <div><label className={cssLabel}>Nama Guru</label><input name="namaGuru" value={formData.namaGuru} onChange={handleChange} className={cssInput} required /></div>
              <div><label className={cssLabel}>NIP Guru</label><input name="nipGuru" value={formData.nipGuru} onChange={handleChange} className={cssInput} /></div>
              <div><label className={cssLabel}>Kepala Sekolah</label><input name="namaKepsek" value={formData.namaKepsek} onChange={handleChange} className={cssInput} required /></div>
              <div><label className={cssLabel}>NIP Kepsek</label><input name="nipKepsek" value={formData.nipKepsek} onChange={handleChange} className={cssInput} /></div>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div><label className={cssLabel}>Jenjang</label><select name="jenjang" value={formData.jenjang} onChange={handleJenjangChange} className={cssInput}>{JENJANG_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
              <div><label className={cssLabel}>Kelas</label><select name="kelas" value={formData.kelas} onChange={handleChange} className={cssInput}>{KELAS_BY_JENJANG[formData.jenjang].map(k => <option key={k} value={k}>{k}</option>)}</select></div>
              <div><label className={cssLabel}>Mapel</label><input name="mapel" value={formData.mapel} onChange={handleChange} className={cssInput} required /></div>
            </div>
            <div className="space-y-4 mb-4">
              <div><label className={cssLabel}>Capaian Pembelajaran <button type="button" onClick={() => generateSimple('cp', `Carikan CP Kurikulum Merdeka ${formData.mapel} ${formData.jenjang} ${formData.kelas}`, 'CP')} disabled={loadingStatus} className="text-xs bg-indigo-100 text-indigo-700 px-2 rounded ml-2">{loadingStatus === 'CP' ? <Loader2 className="inline h-3 w-3 animate-spin"/> : '✨ Cari CP'}</button></label><textarea name="cp" value={formData.cp} onChange={handleChange} rows={3} className={cssInput} /></div>
              <div><label className={cssLabel}>Materi</label><textarea name="materi" value={formData.materi} onChange={handleChange} rows={2} className={cssInput} /></div>
              <div><label className={cssLabel}>Tujuan Pembelajaran <button type="button" onClick={() => generateSimple('tp', `Buat TP dari CP ${formData.cp} materi ${formData.materi}`, 'TP')} disabled={loadingStatus} className="text-xs bg-indigo-100 text-indigo-700 px-2 rounded ml-2">{loadingStatus === 'TP' ? <Loader2 className="inline h-3 w-3 animate-spin"/> : '✨ Buat TP'}</button></label><textarea name="tp" value={formData.tp} onChange={handleChange} rows={2} className={cssInput} /></div>
            </div>
            <div className="bg-indigo-50 p-4 rounded mb-4 border border-indigo-100 text-gray-800">
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div><label className="text-sm font-medium">Jml Pertemuan</label><input type="number" name="jumlahPertemuan" min="1" max="20" value={formData.jumlahPertemuan} onChange={handleChange} className="w-full p-2 border rounded" /></div>
                <div><label className="text-sm font-medium">Durasi</label><input name="durasi" value={formData.durasi} onChange={handleChange} className="w-full p-2 border rounded" /></div>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">{formData.metodePerPertemuan.map((m, i) => <div key={i} className="flex flex-col"><span className="text-xs text-gray-500 uppercase">Pertemuan {i + 1}</span><select value={m} onChange={e => handleMethodChange(i, e.target.value)} className="p-1 border rounded text-sm">{PEDAGOGI_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}</select></div>)}</div>
            </div>
            <div className="mb-6"><span className={cssLabel}>Dimensi Profil</span><div className="grid grid-cols-2 md:grid-cols-4 gap-2">{DIMENSI_OPTIONS.map(d => <label key={d} className={`flex items-center p-2 border rounded text-xs cursor-pointer ${formData.dimensi.includes(d) ? 'bg-indigo-100 border-indigo-500' : ''}`}><input type="checkbox" checked={formData.dimensi.includes(d)} onChange={() => handleCheckboxChange(d)} className="mr-2" />{d}</label>)}</div></div>
            <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2">{isLoading ? <Loader2 className="animate-spin" /> : <Sparkles />} Generate RPM</button>
          </form>
        ) : (
          <div className="animate-slide-up">
            <div className={`flex flex-wrap gap-2 justify-between items-center mb-4 p-3 rounded shadow border no-print ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white text-gray-800'}`}>
              <div className="flex gap-2">
                <button onClick={() => setIsGenerated(false)} className="px-3 py-1.5 border rounded text-sm hover:bg-gray-100 hover:text-black flex gap-1 items-center"><RefreshCcw size={14} /> Reset</button>
                <button onClick={() => setIsEditing(!isEditing)} className={`px-3 py-1.5 border rounded text-sm flex gap-1 items-center ${isEditing ? 'bg-yellow-100 text-yellow-800' : 'hover:bg-gray-100 hover:text-black'}`}><Edit size={14} /> {isEditing ? 'Done' : 'Edit'}</button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => generateSimple('rubric', `Buat rubrik TP ${formData.tp}`, 'Rubric')} disabled={loadingStatus === 'Rubric'} className="px-3 py-1.5 bg-purple-600 text-white rounded text-sm flex gap-1 items-center">{loadingStatus === 'Rubric' ? <Loader2 className="animate-spin" size={14} /> : <Table size={14} />} Rubrik</button>
                <button onClick={() => generateSimple('lkpd', `Buat LKPD ${formData.materi} ${formData.jenjang}`, 'LKPD')} disabled={loadingStatus === 'LKPD'} className="px-3 py-1.5 bg-teal-600 text-white rounded text-sm flex gap-1 items-center">{loadingStatus === 'LKPD' ? <Loader2 className="animate-spin" size={14} /> : <FileSignature size={14} />} LKPD</button>
                <button onClick={handleWord} className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm flex gap-1 items-center"><FileDown size={14} /> Word</button>
                <button onClick={handlePrint} className="px-3 py-1.5 bg-red-600 text-white rounded text-sm flex gap-1 items-center"><Printer size={14} /> PDF</button>
              </div>
            </div>

            <div className="bg-gray-500/10 p-4 rounded overflow-auto">
              <div id="printable-area" className="bg-white shadow-xl p-8 mx-auto text-black font-serif leading-relaxed" style={{ maxWidth: '21cm', minHeight: '29.7cm' }}>
                <div ref={outputRef}>
                  {aiContent.map((rpm, i) => (
                    <div key={i} className={i > 0 ? "page-break" : ""} style={{ marginBottom: '40px', pageBreakBefore: i > 0 ? 'always' : 'auto' }}>
                      
                      {/* HEADER / KOP SURAT */}
                      <div className="kop-surat" style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '3px double black', paddingBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                              {/* LOGO SEKOLAH (Placeholder) */}
                              <div style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed gray', fontSize: '10px', color: 'gray', textAlign: 'center' }}>
                                LOGO<br/>SEKOLAH
                              </div>
                              <div>
                                  <h4 style={{ margin: 0, fontSize: '12pt', fontWeight: 'normal', textTransform: 'uppercase' }}>PEMERINTAH KABUPATEN/KOTA</h4>
                                  <h3 style={{ margin: 0, fontSize: '14pt', fontWeight: 'bold', textTransform: 'uppercase' }}>DINAS PENDIDIKAN DAN KEBUDAYAAN</h3>
                                  <h3 style={{ margin: 0, fontSize: '16pt', fontWeight: 'bold', textTransform: 'uppercase' }}>{formData.namaSatuan}</h3>
                                  <p style={{ margin: 0, fontSize: '10pt', fontStyle: 'italic' }}>Alamat: Jl. Pendidikan No. 1 (Contoh Alamat Sekolah)</p>
                              </div>
                          </div>
                      </div>

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
                                  <td style={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Jenjang/Kelas</td>
                                  <td>{formData.jenjang} / {formData.kelas}</td>
                              </tr>
                              <tr>
                                  <td style={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Alokasi Waktu</td>
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

                      {/* SIGNATURE SECTION - CHANGED TO TABLE FOR WORD COMPATIBILITY */}
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
                                      <p style={{ margin: 0 }}>{formData.namaSatuan}, {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
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
                  {/* CSS CLASS 'custom-html-content' ditambahkan untuk styling tabel rubrik/lkpd */}
                  {rubricContent && <div className="mt-8 page-break custom-html-content"><h3 className="font-bold text-center border-b border-black pb-2 mb-4">LAMPIRAN 1: RUBRIK PENILAIAN</h3><div dangerouslySetInnerHTML={{ __html: rubricContent }} /></div>}
                  {lkpdContent && <div className="mt-8 page-break custom-html-content"><h3 className="font-bold text-center border-b border-black pb-2 mb-4">LAMPIRAN 2: LKPD</h3><div dangerouslySetInnerHTML={{ __html: lkpdContent }} /></div>}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <footer className="text-center py-6 text-sm text-gray-500 no-print">Generator RPM © {new Date().getFullYear()} • Dev: Ibnu Husny</footer>
    </div>
  );
}