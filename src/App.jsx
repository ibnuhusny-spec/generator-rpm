// --- GENERATE FUNCTIONS ---
  const generateSimple = async (type, prompt, label) => {
    if (type === 'cp' && !formData.mapel) return alert("Isi Mapel dulu");
    if (type === 'tp' && !formData.cp) return alert("Isi CP dulu");
    if ((type === 'rubric' || type === 'lkpd') && !formData.tp) return alert("Isi TP dulu");

    setLoadingStatus(label);
    const isIslamic = ['SDIT', 'MI', 'SMPIT', 'MTs', 'SMAIT', 'MA'].includes(formData.jenjang);
    const isVocational = formData.jenjang === 'SMK';
    let tambahanKonteks = isIslamic ? " PASTIKAN menyisipkan nilai keislaman/akhlak." : isVocational ? " PASTIKAN berfokus pada ranah vokasional/praktik." : "";
    const catatanGuru = formData.catatanKhusus ? ` CATATAN GURU: ${formData.catatanKhusus}.` : "";

    let strictPrompt = prompt;
    if (type === 'cp' || type === 'tp') strictPrompt += `. INSTRUKSI KHUSUS: HANYA berikan daftarnya saja.${tambahanKonteks}${catatanGuru}`;
    else if (type === 'rubric') strictPrompt += `. INSTRUKSI KHUSUS: Buat format HTML <table> lengkap. Bagi 3 aspek: Kognitif, Psikomotorik, Afektif. Beri baris Remedial/Pengayaan di bawah.${tambahanKonteks}${catatanGuru}`;
    else if (type === 'lkpd') strictPrompt = `Buatkan HTML Murni LKPD kreatif untuk materi: ${formData.materi}, Kelas: ${formData.kelas}. TP: ${formData.tp} ${catatanGuru}. Wajib ada: Judul, Identitas, Pojok Eksplorasi QR, Pemanasan, Langkah, Lembar Jawab, Jurnal Refleksi. ${tambahanKonteks}`;

    const res = await callAI(strictPrompt);
    setLoadingStatus('');
    if (res) {
      const cleaned = cleanAIResponse(res);
      if (type === 'cp') setFormData(p => ({ ...p, cp: cleaned }));
      else if (type === 'tp') setFormData(p => ({ ...p, tp: cleaned }));
      else if (type === 'rubric') setRubricContent(cleanHtmlContent(cleaned));
      else if (type === 'lkpd') setLkpdContent(cleanHtmlContent(cleaned));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const isIslamic = ['SDIT', 'MI', 'SMPIT', 'MTs', 'SMAIT', 'MA'].includes(formData.jenjang);
    const isVocational = formData.jenjang === 'SMK';
    let instruksiJenjang = isIslamic ? "Integrasikan nilai spiritual islami secara natural. " : isVocational ? "Fokuskan pada hard skills/industri. " : "";
    const catatanGuru = formData.catatanKhusus ? `CATATAN GURU: ${formData.catatanKhusus}. Prioritaskan ini.` : "";

    const prompt = `Buatkan RPM ${formData.jumlahPertemuan} pertemuan. JSON Array Only. Data: ${JSON.stringify({...formData, catatanKhusus: undefined})}. Metode: ${formData.metodePerPertemuan.join(', ')}. ${instruksiJenjang} ${catatanGuru} Struktur: [{"siswa":"","lintasDisiplin":"","topik":"","kemitraan":"","lingkungan":"","digital":"","pengalaman":{"memahami":"","mengaplikasi":"","refleksi":""},"asesmen":{"awal":"","proses":"","akhir":""}}]`;
    
    const res = await callAI(prompt);
    if (res) {
      try {
        let jsonStr = res.replace(/```json/g,'').replace(/```/g,'').trim();
        const f = jsonStr.indexOf('['), l = jsonStr.lastIndexOf(']');
        if(f !== -1 && l !== -1) jsonStr = jsonStr.substring(f, l + 1);
        
        let json = JSON.parse(jsonStr);
        if (!Array.isArray(json)) json = [json];
        const count = Math.max(1, parseInt(formData.jumlahPertemuan) || 1);
        while (json.length < count) json.push(JSON.parse(JSON.stringify(json[json.length - 1])));
        
        setAiContent(json.slice(0, count)); setRubricContent(null); setLkpdContent(null);
        setIsGenerated(true); setIsEditing(false);

        const newRecord = { id: Date.now(), date: new Date().toLocaleDateString(), title: `${formData.mapel} ${formData.kelas}`, mapel: formData.mapel, kelas: formData.kelas, tanggal: new Date().toLocaleDateString(), formData: {...formData}, aiContent: json };
        setHistory(p => [newRecord, ...p]); saveToCloud(newRecord);
      } catch (e) { setErrorMsg("Format AI tidak valid. Coba model lain."); }
    }
    setIsLoading(false);
  };

  const updateContent = (i, path, val) => {
    setAiContent(prev => {
      const arr = [...prev]; const d = { ...arr[i] };
      if (path.includes('.')) { const [a, b] = path.split('.'); d[a] = { ...d[a], [b]: val }; } else d[path] = val;
      arr[i] = d; return arr;
    });
  };

  const EditCell = ({ val, idx, path, multi }) => isEditing ? (multi ? <textarea className="w-full p-1 border bg-yellow-50 text-sm font-sans" rows={6} value={val||''} onChange={e => updateContent(idx, path, e.target.value)} /> : <input className="w-full p-1 border bg-yellow-50 text-sm font-sans" value={val||''} onChange={e => updateContent(idx, path, e.target.value)} />) : <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: val || '' }} />;
  const formatRender = (text) => text ? (text.replace(/[*#`_]/g, '').includes('\n') ? <ul style={{ margin: 0, paddingLeft: '15px', listStyleType: 'disc' }}>{text.replace(/[*#`_]/g, '').split('\n').map(l => l.trim()).filter(l => l).map((l, i) => <li key={i}>{l.replace(/^[-•]\s*/, '').replace(/^\d+\.\s*/, '')}</li>)}</ul> : text.replace(/[*#`_]/g, '')) : '-';

  const handlePrint = () => {
    if (!outputRef.current) return;
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>RPM ${formData.mapel}</title><style>@page{size:A4;margin:2cm}body{font-family:'Times New Roman',serif;color:#000;line-height:1.4;font-size:11pt}.kop-surat{text-align:center;margin-bottom:20px;border-bottom:3px double black;padding-bottom:10px}.kop-surat h3{margin:0;font-size:14pt;text-transform:uppercase}.kop-surat h4{margin:0;font-size:12pt;text-transform:uppercase;font-weight:normal}.kop-surat p{margin:0;font-size:10pt;font-style:italic}table{width:100%;border-collapse:collapse;margin-bottom:15px}table,th,td{border:1px solid #000}td,th{padding:8px 10px;vertical-align:top;text-align:left}.header-section{background-color:#f0f0f0;font-weight:bold;text-align:center}.sub-header{font-weight:bold;background-color:#fafafa}.no-border,.no-border td{border:none!important}.page-break{page-break-before:always}.signature-section{margin-top:50px;page-break-inside:avoid}.signature-section td{text-align:center;border:none!important}ul,ol{margin:0;padding-left:20px}.custom-html-content table{width:100%;border-collapse:collapse;margin-top:10px}.custom-html-content th,.custom-html-content td{border:1px solid black;padding:5px;text-align:left}.custom-html-content h3{font-weight:bold;font-size:12pt;margin-top:15px;border-bottom:1px solid black;padding-bottom:5px}.custom-html-content ul,.custom-html-content ol{padding-left:20px;margin-bottom:10px}.custom-html-content .lkpd-section{margin-bottom:20px}</style></head><body>${outputRef.current.innerHTML}<script>window.onload=function(){window.print();window.close()}</script></body></html>`);
    w.document.close();
  };

  const handleWord = () => {
    const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'><head><meta charset='utf-8'><title>Doc</title><style>body{font-family:'Times New Roman',serif;font-size:11pt}table{border-collapse:collapse;width:100%}td,th{border:1px solid black;padding:5px;vertical-align:top}.header-section{background-color:#f0f0f0;font-weight:bold}.no-border td{border:none!important}</style></head><body>${outputRef.current.innerHTML}</body></html>`;
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff', html], { type: 'application/msword' })); a.download = `RPM_${formData.mapel}.doc`; a.click();
  };

  const cssInput = `mt-1 block w-full rounded-md shadow-sm border p-2 ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'}`;
  const cssLabel = `block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`;

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 bg-gradient-to-br ${selectedGradient.class} flex flex-col`}>
      
      {/* 🌟 SPLASH SCREEN 🌟 */}
      {showSplash && (
        <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br ${selectedGradient.class} transition-opacity duration-500 ${fadeSplash ? 'opacity-0' : 'opacity-100'}`}>
            <div className="flex flex-col items-center gap-6 transform transition-transform duration-700 hover:scale-105">
                {/* Image with Fallback Icon */}
                <div className="relative w-32 h-32 flex items-center justify-center bg-white/10 rounded-3xl shadow-2xl backdrop-blur-sm border border-white/20">
                    <img 
                        src="Logo.png" 
                        alt="Logo" 
                        className="absolute inset-0 w-full h-full object-contain p-2 drop-shadow-xl" 
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <BookOpen size={64} className="text-white opacity-80" />
                </div>
                
                <div className="text-center text-white">
                    <h1 className="text-5xl font-extrabold tracking-tight drop-shadow-lg">{APP_NAME}</h1>
                    <p className="text-lg mt-2 font-medium opacity-90 drop-shadow">Asisten Cerdas Perencanaan Pembelajaran</p>
                </div>
                
                {/* Elegant Minimalist Progress Bar */}
                <div className="mt-8 w-48 h-1.5 bg-white/20 rounded-full overflow-hidden relative">
                    <div className="absolute top-0 left-0 h-full bg-white rounded-full w-1/2 animate-[pulse_1.5s_ease-in-out_infinite] shadow-[0_0_10px_rgba(255,255,255,0.8)]" style={{ animation: 'slideRight 1.5s infinite linear' }}>
                        <style>{`@keyframes slideRight { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }`}</style>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* HEADER */}
      <header className={`p-4 shadow-lg backdrop-blur-md no-print ${isDarkMode ? 'bg-gray-900/90 text-white' : 'bg-white/90 text-gray-800'}`}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-indigo-100"><BookOpen className="h-6 w-6 text-indigo-600" /></div>
            <div><h1 className="text-xl font-bold">{APP_NAME} <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded">v7.0 SaaS</span></h1><p className="text-xs opacity-70">Deep Learning Plan • Dev: Ibnu Husny</p></div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowApiKeyInput(!showApiKeyInput)} className={`p-2 rounded-full ${userApiKey ? 'text-green-500' : 'text-red-500'}`} title="Pengaturan AI & Cloud"><Settings /></button>
            <button onClick={() => setShowHistory(true)} className="p-2 rounded-full relative"><History />{history.length > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>}</button>
            <div className="flex gap-1 hidden md:flex">{GRADIENT_THEMES.map(t => <button key={t.id} onClick={() => setSelectedGradient(t)} className={`w-5 h-5 rounded-full bg-gradient-to-br ${t.class} border-2 ${selectedGradient.id === t.id ? 'border-white' : 'border-transparent'}`} />)}</div>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full">{isDarkMode ? <Sun /> : <Moon />}</button>
          </div>
        </div>
      </header>

      {/* MODAL PANDUAN PENGATURAN */}
      {showApiGuide && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowApiGuide(false)}></div>
            <div className={`relative w-full max-w-lg rounded-xl shadow-2xl p-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="font-bold text-lg flex items-center gap-2"><HelpCircle className="text-indigo-500"/> Panduan Pengaturan API & Cloud</h3>
                    <button onClick={() => setShowApiGuide(false)} className="text-gray-500 hover:text-red-500"><X/></button>
                </div>
                <div className="space-y-4 text-sm max-h-96 overflow-y-auto pr-2">
                    <p>Aplikasi ini membutuhkan API Key gratis dari Google Gemini dan URL Spreadsheet (Opsional) untuk menyimpan data di cloud.</p>
                    <h4 className="font-bold border-b pb-1 mt-4">1. Cara Mendapatkan API Key (Wajib)</h4>
                    <ol className="list-decimal pl-5 space-y-1">
                        <li>Buka <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-indigo-500 font-bold underline">Google AI Studio</a>.</li>
                        <li>Klik <strong>"Create API key"</strong>, lalu salin kodenya.</li>
                    </ol>
                    <h4 className="font-bold border-b pb-1 mt-4">2. Cara Setup Database Cloud (Opsional)</h4>
                    <ol className="list-decimal pl-5 space-y-1">
                        <li>Buat Spreadsheet kosong di Google Drive. Beri nama Sheet pertama: <strong>Riwayat</strong></li>
                        <li>Tulis Header di baris 1 (A-F): <code>id, tanggal, mapel, kelas, formData, aiContent</code></li>
                        <li>Klik <strong>Ekstensi &gt; Apps Script</strong>, tempelkan kode script dari *developer*.</li>
                        <li>Klik <strong>Terapkan &gt; Deployment Baru</strong> (Pilih Aplikasi Web, Akses: Siapa Saja). Salin URL.</li>
                    </ol>
                </div>
            </div>
        </div>
      )}

      {/* INPUT PENGATURAN */}
      {showApiKeyInput && <div className="max-w-6xl mx-auto mt-4 px-4 no-print animate-fade-in">
        <div className="bg-white p-4 rounded shadow-lg border-l-4 border-indigo-500 flex flex-col gap-4 relative">
          <button onClick={() => setShowApiGuide(true)} className="absolute top-4 right-4 text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full flex items-center gap-1 hover:bg-indigo-200"><HelpCircle size={12}/> Butuh Panduan?</button>
          
          <div className="flex-1 text-gray-800 pr-32"><h3 className="font-bold flex items-center gap-2"><Key size={16}/> API Key Google Gemini</h3></div>
          <div className="space-y-3 w-full">
            <input type="password" placeholder="Paste Key Gemini (AIza...)" value={userApiKey} onChange={e=>setUserApiKey(e.target.value)} className="w-full border p-2 rounded text-gray-800"/>
            <div className="flex flex-col md:flex-row gap-2">
                <div className="flex items-center gap-2 border p-2 rounded bg-gray-50 flex-1">
                    <Cpu size={16} className="text-gray-500"/>
                    <select value={selectedModel} onChange={handleModelChange} className="bg-transparent text-sm text-gray-700 outline-none w-full">{AI_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
                </div>
                {selectedModel === 'custom' && (<input type="text" placeholder="Nama model (gemini-1.5-flash)" value={customModelName} onChange={handleCustomModelChange} className="border p-2 rounded flex-1 text-sm bg-yellow-50" />)}
            </div>

            <hr className="my-2 border-gray-200"/>
            <div className="flex-1 text-gray-800"><h3 className="font-bold flex items-center gap-2"><Database size={16}/> Database Google Sheets (Opsional)</h3></div>
            <input type="text" placeholder="https://script.google.com/macros/s/..." value={cloudApiUrl} onChange={e=>setCloudApiUrl(e.target.value)} className="w-full border p-2 rounded text-gray-800 text-sm"/>

            <div className="flex gap-2 flex-wrap mt-4">
                <button onClick={saveSettings} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded flex-1 font-bold">Simpan Pengaturan</button>
                <button onClick={testConnection} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded flex items-center gap-1"><Activity size={14}/> Tes Koneksi</button>
                <button onClick={checkAvailableModels} disabled={isCheckingModels} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded flex items-center gap-1">{isCheckingModels ? <Loader2 className="animate-spin" size={14}/> : <Menu size={14}/>} Model Aktif</button>
            </div>
            {availableModels.length > 0 && (
                <div className="mt-2 bg-emerald-50 border border-emerald-200 p-3 rounded text-sm text-gray-800"><h4 className="font-bold mb-2 text-emerald-700">Model Diizinkan:</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">{availableModels.map((m, index) => (<div key={index} className="flex justify-between items-center bg-white p-2 border rounded shadow-sm"><span className="font-mono text-xs">{m.name.replace('models/', '')}</span><button onClick={() => selectFoundModel(m.name)} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded hover:bg-emerald-200">Pilih</button></div>))}</div></div>
            )}
          </div>
        </div>
      </div>}

      {/* ERRORS */}
      {errorMsg && (
        <div className="max-w-6xl mx-auto mt-4 px-4 no-print"><div className="bg-red-100 text-red-700 px-4 py-2 rounded flex flex-col gap-2"><div className="flex items-center gap-2 font-bold"><AlertTriangle size={16}/> {errorMsg} <button className="ml-auto" onClick={()=>{setErrorMsg(null); setDebugLog(null);}}><X size={16}/></button></div>{debugLog && (<div className="mt-2 bg-black text-green-400 p-2 rounded text-xs font-mono overflow-auto max-h-40"><pre>{debugLog}</pre></div>)}</div></div>
      )}

      {/* CLOUD HISTORY */}
      {showHistory && (
          <div className="fixed inset-0 z-50 flex justify-end">
              <div className="absolute inset-0 bg-black/50" onClick={()=>setShowHistory(false)}></div>
              <div className={`relative w-80 h-full shadow-xl flex flex-col ${isDarkMode?'bg-gray-900 text-white':'bg-white text-gray-800'}`}>
                  <div className="p-4 border-b flex justify-between items-center"><h2 className="font-bold flex items-center gap-2"><Cloud className="text-blue-500" size={18}/> Riwayat Cloud</h2><div className="flex gap-3 items-center"><button onClick={() => loadCloudHistory()} className={`text-blue-500 hover:text-blue-700 ${isSyncing ? 'animate-spin' : ''}`}><RefreshCw size={16}/></button><button onClick={()=>setShowHistory(false)} className="text-gray-500 hover:text-red-500"><X size={18}/></button></div></div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                      {history.length === 0 ? (<div className="text-center text-sm text-gray-500 mt-10">Belum ada riwayat RPP.</div>) : (history.map(h => (<div key={h.id} className="p-3 border rounded cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/50 transition-colors" onClick={()=>{setFormData(h.formData); setAiContent(h.aiContent); setRubricContent(null); setLkpdContent(null); setIsGenerated(true); setShowHistory(false);}}><div className="font-bold text-sm text-indigo-700">{h.title}</div><div className="text-xs opacity-60 mt-1 flex items-center gap-1"><Cloud size={10}/> {h.date}</div><button onClick={(e)=>{e.stopPropagation(); if(window.confirm('Hapus lokal?')) setHistory(x=>x.filter(i=>i.id!==h.id));}} className="text-red-500 text-[10px] mt-2 px-2 py-1 bg-red-50 rounded">Hapus Lokal</button></div>)))}
                  </div>
              </div>
          </div>
      )}

      <main className="max-w-6xl mx-auto mt-6 px-4 pb-20 flex-grow">
        {!isGenerated ? (
          <form onSubmit={handleSubmit} className={`rounded-xl shadow-2xl p-6 md:p-8 border relative ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-800'}`}>
            <div className="flex justify-between items-center mb-6 border-b pb-2"><h2 className="text-lg font-semibold flex items-center gap-2">📝 Data Perencanaan <span className="text-[10px] font-normal bg-green-100 text-green-700 px-2 py-0.5 rounded ml-2 flex items-center gap-1"><Cloud size={10}/> Cloud Ready</span></h2><button type="button" onClick={clearForm} className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded flex items-center gap-1"><Trash2 size={12}/> Bersihkan</button></div>
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
              <div><label className={cssLabel}>Capaian Pembelajaran <button type="button" onClick={() => generateSimple('cp', `Carikan CP Merdeka ${formData.mapel} ${formData.jenjang} ${formData.kelas}`, 'CP')} disabled={loadingStatus} className="text-xs bg-indigo-100 text-indigo-700 px-2 rounded ml-2">{loadingStatus === 'CP' ? <Loader2 className="inline h-3 w-3 animate-spin"/> : '✨ Cari CP'}</button></label><textarea name="cp" value={formData.cp} onChange={handleChange} rows={3} className={cssInput} /></div>
              <div><label className={cssLabel}>Materi</label><textarea name="materi" value={formData.materi} onChange={handleChange} rows={2} className={cssInput} /></div>
              <div><label className={cssLabel}>Tujuan Pembelajaran <button type="button" onClick={() => generateSimple('tp', `Buat TP dari CP ${formData.cp} materi ${formData.materi}`, 'TP')} disabled={loadingStatus} className="text-xs bg-indigo-100 text-indigo-700 px-2 rounded ml-2">{loadingStatus === 'TP' ? <Loader2 className="inline h-3 w-3 animate-spin"/> : '✨ Buat TP'}</button></label><textarea name="tp" value={formData.tp} onChange={handleChange} rows={2} className={cssInput} /></div>
            </div>
            
            <div className="bg-indigo-50 p-4 rounded mb-4 border border-indigo-100 text-gray-800">
              <div className="grid grid-cols-2 gap-4 mb-2"><div><label className="text-sm font-medium">Jml Pertemuan</label><input type="number" name="jumlahPertemuan" min="1" max="20" value={formData.jumlahPertemuan} onChange={handleChange} className="w-full p-2 border rounded" /></div><div><label className="text-sm font-medium">Durasi</label><input name="durasi" value={formData.durasi} onChange={handleChange} className="w-full p-2 border rounded" /></div></div>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {formData.metodePerPertemuan.map((m, i) => (<div key={i} className="flex flex-col bg-white p-2 rounded shadow-sm border border-gray-200"><span className="text-[10px] font-bold text-indigo-600 uppercase mb-1">Pertemuan {i + 1}</span><select value={m} onChange={e => handleMethodChange(i, e.target.value)} className="p-1.5 border border-gray-300 rounded text-sm w-full outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-gray-50 mb-1">{PEDAGOGI_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}</select><span className="text-[10px] text-gray-500 leading-tight"><span className="font-bold text-amber-500">💡 Info:</span> {PEDAGOGI_INFO[m] || 'Pilih metode.'}</span></div>))}
              </div>
            </div>

            <div className="mb-4"><span className={cssLabel}>Dimensi Profil Pelajar Pancasila</span><div className="grid grid-cols-2 md:grid-cols-4 gap-2">{DIMENSI_OPTIONS.map(d => (<div key={d} className="relative group"><label className={`flex items-center p-2 border rounded text-xs cursor-pointer h-full transition-colors ${formData.dimensi.includes(d) ? 'bg-indigo-100 border-indigo-500' : 'hover:bg-gray-50'}`}><input type="checkbox" checked={formData.dimensi.includes(d)} onChange={() => handleCheckboxChange(d)} className="mr-2" />{d}</label><div className="absolute z-10 bottom-full mb-1 left-1/2 -translate-x-1/2 w-48 bg-gray-800 text-white text-[10px] p-2 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-lg pointer-events-none">{DIMENSI_INFO[d]}</div></div>))}</div></div>
            <div className="mb-6"><label className={cssLabel}>Catatan Tambahan / Instruksi Khusus (Opsional)</label><textarea name="catatanKhusus" value={formData.catatanKhusus} onChange={handleChange} placeholder="Contoh: 'Buatkan game berburu kata terkait materi ini', dll." rows={2} className={cssInput} /></div>
            <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2">{isLoading ? <Loader2 className="animate-spin" /> : <Sparkles />} Generate RPM</button>
          </form>
        ) : (
          <div className="animate-slide-up">
            <div className={`flex flex-wrap gap-2 justify-between items-center mb-4 p-3 rounded shadow border no-print ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white text-gray-800'}`}>
              <div className="flex gap-2"><button onClick={() => setIsGenerated(false)} className="px-3 py-1.5 border rounded text-sm hover:bg-gray-100 hover:text-black flex gap-1 items-center"><RefreshCcw size={14} /> Kembali</button><button onClick={() => setIsEditing(!isEditing)} className={`px-3 py-1.5 border rounded text-sm flex gap-1 items-center ${isEditing ? 'bg-yellow-100 text-yellow-800' : 'hover:bg-gray-100 hover:text-black'}`}><Edit size={14} /> {isEditing ? 'Selesai Edit' : 'Edit'}</button></div>
              <div className="flex gap-2"><button onClick={() => generateSimple('rubric', `Buat rubrik TP ${formData.tp}`, 'Rubric')} disabled={loadingStatus === 'Rubric'} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm flex gap-1 items-center transition-colors">{loadingStatus === 'Rubric' ? <Loader2 className="animate-spin" size={14} /> : <Table size={14} />} Rubrik</button><button onClick={() => generateSimple('lkpd', `Buat LKPD ${formData.materi} ${formData.jenjang}`, 'LKPD')} disabled={loadingStatus === 'LKPD'} className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded text-sm flex gap-1 items-center transition-colors">{loadingStatus === 'LKPD' ? <Loader2 className="animate-spin" size={14} /> : <FileSignature size={14} />} LKPD</button><button onClick={handleWord} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm flex gap-1 items-center transition-colors"><FileDown size={14} /> Word</button><button onClick={handlePrint} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm flex gap-1 items-center transition-colors"><Printer size={14} /> Cetak</button></div>
            </div>

            <div className="bg-gray-500/10 p-4 rounded overflow-auto shadow-inner">
              <div id="printable-area" className="bg-white shadow-xl p-8 mx-auto text-black font-serif leading-relaxed" style={{ maxWidth: '21cm', minHeight: '29.7cm' }}>
                <div ref={outputRef}>
                  {aiContent.map((rpm, i) => (
                    <div key={i} className={i > 0 ? "page-break" : ""} style={{ marginBottom: '40px', pageBreakBefore: i > 0 ? 'always' : 'auto' }}>
                      <div className="kop-surat" style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '3px double black', paddingBottom: '10px' }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}><div style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed gray', fontSize: '10px', color: 'gray', textAlign: 'center' }}>LOGO<br/>SEKOLAH</div><div><h4 style={{ margin: 0, fontSize: '12pt', fontWeight: 'normal', textTransform: 'uppercase' }}>PEMERINTAH KABUPATEN/KOTA</h4><h3 style={{ margin: 0, fontSize: '14pt', fontWeight: 'bold', textTransform: 'uppercase' }}>DINAS PENDIDIKAN DAN KEBUDAYAAN</h3><h3 style={{ margin: 0, fontSize: '16pt', fontWeight: 'bold', textTransform: 'uppercase' }}>{formData.namaSatuan}</h3><p style={{ margin: 0, fontSize: '10pt', fontStyle: 'italic' }}>Alamat: Jl. Pendidikan No. 1 (Contoh Alamat)</p></div></div></div>
                      <div style={{ textAlign: 'center', marginBottom: '20px' }}><h2 style={{ fontSize: '14pt', fontWeight: 'bold', textDecoration: 'underline', margin: '0 0 5px 0' }}>MODUL AJAR / RPP</h2><p style={{ margin: 0 }}>Tahun Pelajaran {new Date().getFullYear()}/{new Date().getFullYear() + 1}</p></div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', border: '1px solid black' }}><tbody><tr><td style={{ width: '25%', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Nama Penyusun</td><td style={{ width: '25%' }}>{formData.namaGuru}</td><td style={{ width: '25%', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Mata Pelajaran</td><td style={{ width: '25%' }}>{formData.mapel}</td></tr><tr><td style={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Satuan Pendidikan</td><td>{formData.namaSatuan}</td><td style={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Jenjang/Kelas</td><td>{formData.jenjang} / {formData.kelas}</td></tr><tr><td style={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Alokasi Waktu</td><td>{formData.durasi} (Pert. {i + 1})</td><td style={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Materi Pokok</td><td>{formData.materi}</td></tr></tbody></table>
                      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black' }}><tbody>
                          <tr style={{ backgroundColor: '#e5e7eb' }}><td colSpan="2" style={{ fontWeight: 'bold', border: '1px solid black', padding: '8px' }}>A. TUJUAN PEMBELAJARAN</td></tr>
                          <tr><td style={{ width: '30%', verticalAlign: 'top', padding: '8px', border: '1px solid black' }}>Capaian Pembelajaran</td><td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}>{formatRender(formData.cp)}</td></tr>
                          <tr><td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}>Tujuan Pembelajaran</td><td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}>{formatRender(formData.tp)}</td></tr>
                          <tr><td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}>Dimensi Profil Lulusan</td><td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}>{formData.dimensi.join(', ')}</td></tr>
                          <tr><td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}>Target Peserta Didik</td><td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}><EditCell val={rpm.siswa} idx={i} path="siswa" multi /></td></tr>
                          <tr style={{ backgroundColor: '#e5e7eb' }}><td colSpan="2" style={{ fontWeight: 'bold', border: '1px solid black', padding: '8px' }}>B. KEGIATAN PEMBELAJARAN <br/><span style={{ fontWeight: 'normal', fontSize: '10pt' }}>Model: {formData.metodePerPertemuan[i]}</span></td></tr>
                          <tr><td style={{ fontWeight: 'bold', verticalAlign: 'top', padding: '8px', border: '1px solid black' }}>1. Kegiatan Pendahuluan<br/><span style={{fontWeight:'normal', fontSize:'9pt'}}>(Memahami)</span></td><td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}><EditCell val={rpm.pengalaman?.memahami} idx={i} path="pengalaman.memahami" multi /></td></tr>
                          <tr><td style={{ fontWeight: 'bold', verticalAlign: 'top', padding: '8px', border: '1px solid black' }}>2. Kegiatan Inti<br/><span style={{fontWeight:'normal', fontSize:'9pt'}}>(Mengaplikasi)</span></td><td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}><EditCell val={rpm.pengalaman?.mengaplikasi} idx={i} path="pengalaman.mengaplikasi" multi /></td></tr>
                          <tr><td style={{ fontWeight: 'bold', verticalAlign: 'top', padding: '8px', border: '1px solid black' }}>3. Kegiatan Penutup<br/><span style={{fontWeight:'normal', fontSize:'9pt'}}>(Refleksi)</span></td><td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}><EditCell val={rpm.pengalaman?.refleksi} idx={i} path="pengalaman.refleksi" multi /></td></tr>
                          <tr style={{ backgroundColor: '#e5e7eb' }}><td colSpan="2" style={{ fontWeight: 'bold', border: '1px solid black', padding: '8px' }}>C. ASESMEN / PENILAIAN</td></tr>
                          <tr><td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}>Asesmen Awal</td><td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}><EditCell val={rpm.asesmen?.awal} idx={i} path="asesmen.awal" multi /></td></tr>
                          <tr><td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}>Asesmen Formatif</td><td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}><EditCell val={rpm.asesmen?.proses} idx={i} path="asesmen.proses" multi /></td></tr>
                          <tr><td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}>Asesmen Sumatif</td><td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}><EditCell val={rpm.asesmen?.akhir} idx={i} path="asesmen.akhir" multi /></td></tr>
                          <tr style={{ backgroundColor: '#e5e7eb' }}><td colSpan="2" style={{ fontWeight: 'bold', border: '1px solid black', padding: '8px' }}>D. MEDIA & SUMBER BELAJAR</td></tr>
                          <tr><td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}>Media & Alat</td><td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}><EditCell val={rpm.digital} idx={i} path="digital" multi /></td></tr>
                          <tr><td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}>Sumber Belajar/Mitra</td><td style={{ verticalAlign: 'top', padding: '8px', border: '1px solid black' }}><EditCell val={rpm.kemitraan} idx={i} path="kemitraan" multi /></td></tr>
                      </tbody></table>
                      <table className="signature-section no-border" style={{ width: '100%', marginTop: '50px', border: 'none' }}><tbody><tr><td style={{ textAlign: 'center', width: '50%', verticalAlign: 'top', border: 'none' }}><p style={{ margin: 0 }}>Mengetahui,</p><p style={{ margin: 0 }}>Kepala Sekolah</p><br /><br /><br /><br /><p style={{ fontWeight: 'bold', textDecoration: 'underline', margin: 0 }}>{formData.namaKepsek}</p><p style={{ margin: 0 }}>NIP. {formData.nipKepsek || '-'}</p></td><td style={{ textAlign: 'center', width: '50%', verticalAlign: 'top', border: 'none' }}><p style={{ margin: 0 }}>{formData.namaSatuan}, {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p><p style={{ margin: 0 }}>Guru Mata Pelajaran</p><br /><br /><br /><br /><p style={{ fontWeight: 'bold', textDecoration: 'underline', margin: 0 }}>{formData.namaGuru}</p><p style={{ margin: 0 }}>NIP. {formData.nipGuru || '-'}</p></td></tr></tbody></table>
                    </div>
                  ))}
                  {rubricContent && <div className="mt-8 page-break custom-html-content"><h3 className="font-bold text-center border-b border-black pb-2 mb-4">LAMPIRAN 1: RUBRIK PENILAIAN</h3><div dangerouslySetInnerHTML={{ __html: rubricContent }} /></div>}
                  {lkpdContent && <div className="mt-8 page-break custom-html-content"><h3 className="font-bold text-center border-b border-black pb-2 mb-4">LAMPIRAN 2: LKPD</h3><div dangerouslySetInnerHTML={{ __html: lkpdContent }} /></div>}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <footer className="text-center py-6 text-sm text-gray-500 no-print">{APP_NAME} © {new Date().getFullYear()} • Dev: Ibnu Husny</footer>
    </div>
  );
}
