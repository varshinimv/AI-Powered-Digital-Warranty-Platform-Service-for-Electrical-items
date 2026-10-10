import React from 'react';
import { useMemo, useRef, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Bell, CalendarDays,
  Check, CheckCircle2, ChevronDown, ChevronRight, CircleHelp, Clock3,
  FileCheck2, FileImage, FileText, Gauge, Headphones, Home, Laptop,
  Menu, Plus, Refrigerator, ScanLine, Search, Settings2, ShieldCheck,
  Smartphone, Sparkles, Tv, UploadCloud, WashingMachine, Wrench, X,
  Zap
} from "lucide-react";
import Tesseract from "tesseract.js";
import "./App.css";

const initialAppliances = [
  { id: 1, name: "FrostLine Refrigerator", brand: "Samsung", model: "RT28C3032GS", category: "Refrigerator", purchaseDate: "2025-12-15", expiryDate: "2027-12-15", serial: "RF-28-90421", image: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=900&q=85", color: "blue" },
  { id: 2, name: "Front Load Washer", brand: "LG", model: "FHM1207ZDL", category: "Washing machine", purchaseDate: "2025-11-20", expiryDate: "2026-11-20", serial: "WM-12-76290", image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=900&q=85", color: "mint" },
  { id: 3, name: "CrystalView Smart TV", brand: "Sony", model: "BRAVIA X75L", category: "Television", purchaseDate: "2024-05-10", expiryDate: "2026-05-10", serial: "TV-75-31087", image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=900&q=85", color: "purple" },
  { id: 4, name: "AirPure Inverter AC", brand: "Daikin", model: "ATKL50UV", category: "Air conditioner", purchaseDate: "2026-03-08", expiryDate: "2028-03-08", serial: "AC-50-11208", image: "https://images.unsplash.com/photo-1631545806609-7b6d7f9c9f17?auto=format&fit=crop&w=900&q=85", color: "orange" }
];

const navItems = [
  { label: "Overview", icon: Home },
  { label: "AI Bill Scanner", icon: ScanLine },
  { label: "My Appliances", icon: Laptop },
  { label: "Service Centre", icon: Wrench },
  { label: "Insights", icon: Activity }
];

function statusOf(expiryDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(`${expiryDate}T00:00:00`);
  const days = Math.ceil((expiry - today) / 86400000);
  if (days < 0) return { label: "Expired", className: "expired", days };
  if (days <= 60) return { label: "Expiring soon", className: "soon", days };
  return { label: "Protected", className: "protected", days };
}

function ApplianceIcon({ category, size = 20 }) {
  if (category.toLowerCase().includes("wash")) return <WashingMachine size={size} />;
  if (category.toLowerCase().includes("television") || category.toLowerCase().includes("tv")) return <Tv size={size} />;
  if (category.toLowerCase().includes("air")) return <Zap size={size} />;
  return <Refrigerator size={size} />;
}

function StatCard({ label, value, note, icon: Icon, tone, trend }) {
  return <div className="stat-card">
    <div className={`stat-icon ${tone}`}><Icon size={19} /></div>
    <div className="stat-copy"><span>{label}</span><strong>{value}</strong><small className={trend ? "trend" : ""}>{trend && <ArrowUpRight size={13} />} {note}</small></div>
  </div>;
}

function App() {
  const [page, setPage] = useState("Overview");
  const [appliances, setAppliances] = useState(initialAppliances);
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showService, setShowService] = useState(false);
  const [notice, setNotice] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanError, setScanError] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", brand: "", category: "Refrigerator", model: "", purchaseDate: "", expiryDate: "", serial: "" });
  const [serviceForm, setServiceForm] = useState({ appliance: "FrostLine Refrigerator", issue: "Not cooling properly", preferredDate: "" });
  const fileRef = useRef(null);

  const protectedCount = appliances.filter(a => statusOf(a.expiryDate).className === "protected").length;
  const soonCount = appliances.filter(a => statusOf(a.expiryDate).className === "soon").length;
  const expiredCount = appliances.filter(a => statusOf(a.expiryDate).className === "expired").length;
  const filtered = useMemo(() => appliances.filter(a => `${a.name} ${a.brand} ${a.category} ${a.model}`.toLowerCase().includes(query.toLowerCase())), [appliances, query]);

  function notify(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  }

  function handleFile(file) {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowed.includes(file.type)) {
      setScanError("Please select a JPG, PNG or WEBP image. PDF support can be added in a later version.");
      setSelectedFile(null);
      return;
    }
    setScanError("");
    setSelectedFile(file);
    setOcrText("");
    setScanProgress(0);
  }

  async function runOcr() {
    if (!selectedFile) {
      setScanError("Upload a bill image first.");
      return;
    }
    setScanning(true);
    setScanError("");
    setOcrText("");
    try {
      const result = await Tesseract.recognize(selectedFile, "eng", {
        logger: message => {
          if (message.status === "recognizing text" && typeof message.progress === "number") setScanProgress(Math.round(message.progress * 100));
        }
      });
      const text = result.data.text.trim();
      setOcrText(text || "No readable text was detected. Try a clearer, well-lit bill image.");
      setScanProgress(100);
    } catch (error) {
      setScanError("The scan could not be completed. Try another clear image.");
    } finally {
      setScanning(false);
    }
  }

  function addAppliance(event) {
    event.preventDefault();
    if (!newItem.name.trim() || !newItem.brand.trim() || !newItem.purchaseDate || !newItem.expiryDate) {
      notify("Please complete the required fields.");
      return;
    }
    const item = { ...newItem, id: Date.now(), serial: newItem.serial || "Not provided", image: "", color: "blue" };
    setAppliances(current => [item, ...current]);
    setNewItem({ name: "", brand: "", category: "Refrigerator", model: "", purchaseDate: "", expiryDate: "", serial: "" });
    setShowAdd(false);
    notify("Appliance added to your local dashboard.");
  }

  function submitService(event) {
    event.preventDefault();
    setShowService(false);
    notify("Demo service request created. Connect a backend to store requests permanently.");
  }

  function goTo(label) {
    setPage(label);
    setMobileNav(false);
  }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
      <div className="brand-lockup">
        <div className="brand-mark"><ShieldCheck size={23} strokeWidth={2.4} /></div>
        <div><strong>warrantiq<span>.</span></strong><small>SMART HOME CARE</small></div>
        <button className="mobile-close icon-button" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={18} /></button>
      </div>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="side-nav">
        {navItems.map(item => <button key={item.label} className={`nav-link ${page === item.label ? "active" : ""}`} onClick={() => goTo(item.label)}>
          <item.icon size={18} strokeWidth={1.8} /><span>{item.label}</span>{item.label === "AI Bill Scanner" && <span className="new-pill">AI</span>}
        </button>)}
      </nav>
      <div className="sidebar-spacer" />
      <div className="help-card">
        <div className="help-orb"><Headphones size={20} /></div>
        <strong>Need a hand?</strong>
        <p>Our appliance care guide is here to help.</p>
        <button onClick={() => notify("Help centre is a demo section in this prototype.")}>Visit help centre <ArrowRight size={14} /></button>
      </div>
      <button className="nav-link settings-link" onClick={() => notify("Settings page will be added in the next version.")}><Settings2 size={18} /><span>Settings</span></button>
      <div className="profile-row">
        <div className="avatar">VM</div><div className="profile-info"><strong>Varshini M V</strong><small>Home account</small></div><ChevronDown size={16} className="profile-chevron" />
      </div>
    </aside>

    {mobileNav && <button className="mobile-scrim" onClick={() => setMobileNav(false)} aria-label="Close navigation" />}

    <main className="main-area">
      <header className="topbar">
        <div className="topbar-left">
          <button className="mobile-menu icon-button" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={21} /></button>
          <div className="breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong>{page}</strong></div>
        </div>
        <div className="topbar-actions">
          <div className="search-box"><Search size={17} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search appliances..." aria-label="Search appliances" /></div>
          <button className="notification-button icon-button" onClick={() => notify(`${soonCount} appliance warranty${soonCount === 1 ? "" : "s"} expiring soon.`)} aria-label="Notifications"><Bell size={19} /><i /></button>
          <div className="top-avatar">VM</div>
        </div>
      </header>

      <div className="page-content">
        {page === "Overview" && <Overview
          appliances={filtered} allAppliances={appliances} protectedCount={protectedCount} soonCount={soonCount} expiredCount={expiredCount}
          onAdd={() => setShowAdd(true)} onScan={() => goTo("AI Bill Scanner")} onService={() => setShowService(true)} onPage={goTo}
        />}
        {page === "AI Bill Scanner" && <Scanner selectedFile={selectedFile} fileRef={fileRef} handleFile={handleFile} runOcr={runOcr} scanning={scanning} scanProgress={scanProgress} ocrText={ocrText} scanError={scanError} onAdd={() => setShowAdd(true)} />}
        {page === "My Appliances" && <AppliancesPage appliances={filtered} query={query} onAdd={() => setShowAdd(true)} />}
        {page === "Service Centre" && <ServicePage onRequest={() => setShowService(true)} />}
        {page === "Insights" && <Insights appliances={appliances} protectedCount={protectedCount} soonCount={soonCount} expiredCount={expiredCount} />}
        <footer className="footer"><span>© 2026 Warrantiq · Smart appliance care</span><span><span className="live-dot" /> Demo workspace <span className="footer-separator">·</span> Data saved in this session only</span></footer>
      </div>
    </main>

    {showAdd && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setShowAdd(false); }}>
      <form className="modal-card" onSubmit={addAppliance}>
        <div className="modal-heading"><div><span className="eyebrow">YOUR INVENTORY</span><h2>Add an appliance</h2><p>Enter the details from your purchase bill or warranty card.</p></div><button type="button" className="icon-button" onClick={() => setShowAdd(false)} aria-label="Close"><X size={20} /></button></div>
        <div className="form-grid">
          <label className="full-field">Appliance name *<input value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} placeholder="e.g. Smart refrigerator" required /></label>
          <label>Brand *<input value={newItem.brand} onChange={e => setNewItem({ ...newItem, brand: e.target.value })} placeholder="e.g. Samsung" required /></label>
          <label>Category<select value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })}><option>Refrigerator</option><option>Washing machine</option><option>Television</option><option>Air conditioner</option><option>Microwave</option><option>Other</option></select></label>
          <label>Model number<input value={newItem.model} onChange={e => setNewItem({ ...newItem, model: e.target.value })} placeholder="Model (optional)" /></label>
          <label>Serial number<input value={newItem.serial} onChange={e => setNewItem({ ...newItem, serial: e.target.value })} placeholder="Serial (optional)" /></label>
          <label>Purchase date *<input type="date" value={newItem.purchaseDate} onChange={e => setNewItem({ ...newItem, purchaseDate: e.target.value })} required /></label>
          <label>Warranty expiry *<input type="date" value={newItem.expiryDate} onChange={e => setNewItem({ ...newItem, expiryDate: e.target.value })} required /></label>
        </div>
        <div className="modal-actions"><button type="button" className="button secondary" onClick={() => setShowAdd(false)}>Cancel</button><button className="button primary" type="submit"><Plus size={16} /> Add appliance</button></div>
      </form>
    </div>}

    {showService && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setShowService(false); }}>
      <form className="modal-card compact-modal" onSubmit={submitService}>
        <div className="modal-heading"><div><span className="eyebrow">SERVICE REQUEST</span><h2>Book appliance service</h2><p>Tell us what needs attention.</p></div><button type="button" className="icon-button" onClick={() => setShowService(false)} aria-label="Close"><X size={20} /></button></div>
        <label>Appliance<select value={serviceForm.appliance} onChange={e => setServiceForm({ ...serviceForm, appliance: e.target.value })}>{appliances.map(a => <option key={a.id}>{a.name}</option>)}</select></label>
        <label>Issue description<textarea value={serviceForm.issue} onChange={e => setServiceForm({ ...serviceForm, issue: e.target.value })} rows="3" placeholder="Describe the issue..." required /></label>
        <label>Preferred date<input type="date" value={serviceForm.preferredDate} onChange={e => setServiceForm({ ...serviceForm, preferredDate: e.target.value })} min={new Date().toISOString().slice(0, 10)} /></label>
        <div className="modal-actions"><button type="button" className="button secondary" onClick={() => setShowService(false)}>Cancel</button><button className="button primary" type="submit"><CalendarDays size={16} /> Create request</button></div>
      </form>
    </div>}
    {notice && <div className="toast"><CheckCircle2 size={18} />{notice}<button onClick={() => setNotice("")} aria-label="Dismiss notification"><X size={15} /></button></div>}
  </div>;
}

function Overview({ appliances, allAppliances, protectedCount, soonCount, expiredCount, onAdd, onScan, onService, onPage }) {
  const expiring = allAppliances.filter(a => statusOf(a.expiryDate).className === "soon");
  return <div className="page-stack">
    <section className="welcome-row">
      <div><div className="eyebrow"><span className="eyebrow-line" /> YOUR HOME, UNDER CONTROL</div><h1>Good evening, Varshini<span className="wave">✦</span></h1><p className="subheading">One smart place for every appliance, warranty and service.</p></div>
      <button className="button primary" onClick={onAdd}><Plus size={17} /> Add appliance</button>
    </section>

    <section className="hero-banner">
      <div className="hero-text">
        <div className="hero-kicker"><Sparkles size={14} /> YOUR AI HOME ASSISTANT</div>
        <h2>Every warranty.<br /><span>One less thing</span> to worry about.</h2>
        <p>Scan a bill, organise your coverage, and stay ahead of service dates — all in one place.</p>
        <button className="hero-button" onClick={onScan}>Try AI bill scanner <ArrowRight size={16} /></button>
        <div className="hero-proof"><span><Check size={13} /> Smart bill reading</span><span><Check size={13} /> Expiry reminders</span></div>
      </div>
      <div className="hero-art">
        <div className="art-glow" />
        <div className="art-ring ring-one" /><div className="art-ring ring-two" />
        <img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85" alt="Modern, organised home interior" />
        <div className="floating-chip chip-top"><span className="chip-check"><ShieldCheck size={15} /></span><span><b>Home protected</b><small>Warranty overview</small></span></div>
        <div className="floating-chip chip-bottom"><span className="chip-calendar"><CalendarDays size={16} /></span><span><b>{soonCount} upcoming reminder{soonCount === 1 ? "" : "s"}</b><small>Stay one step ahead</small></span></div>
        <div className="hero-orbit-dot" />
      </div>
    </section>

    <section className="stats-grid">
      <StatCard label="Total appliances" value={allAppliances.length.toString().padStart(2, "0")} note="In your home inventory" icon={Laptop} tone="violet" />
      <StatCard label="Protected" value={protectedCount.toString().padStart(2, "0")} note="Warranty currently active" icon={ShieldCheck} tone="mint" trend />
      <StatCard label="Expiring soon" value={soonCount.toString().padStart(2, "0")} note="Within the next 60 days" icon={Clock3} tone="amber" />
      <StatCard label="Expired" value={expiredCount.toString().padStart(2, "0")} note="Check service options" icon={FileCheck2} tone="rose" />
    </section>

    <section className="content-grid">
      <div className="panel appliance-panel">
        <div className="panel-heading"><div><span className="eyebrow">YOUR INVENTORY</span><h2>Recently added appliances</h2><p>A quick look at your registered home essentials.</p></div><button className="text-link" onClick={() => onPage("My Appliances")}>View all <ArrowRight size={15} /></button></div>
        {appliances.length ? <div className="appliance-list">{appliances.slice(0, 3).map(item => <ApplianceRow key={item.id} item={item} />)}</div> : <EmptyState message="No appliances match your search." />}
      </div>
      <div className="right-column">
        <div className="panel reminder-panel">
          <div className="panel-heading small-heading"><div><span className="eyebrow">DON'T MISS A DATE</span><h2>Warranty watch</h2></div><div className="mini-icon"><CalendarDays size={17} /></div></div>
          {expiring.length ? expiring.map(item => {
            const s = statusOf(item.expiryDate);
            return <div className="reminder-item" key={item.id}><div className="reminder-icon"><ApplianceIcon category={item.category} size={19} /></div><div className="reminder-copy"><strong>{item.name}</strong><small>Expires {new Date(`${item.expiryDate}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</small></div><span className="days-left">{s.days}d</span></div>;
          }) : <div className="quiet-state"><CheckCircle2 size={21} /><span>You're all caught up.<small>No warranties expiring in the next 60 days.</small></span></div>}
          <button className="reminder-action" onClick={() => onPage("My Appliances")}>Review warranties <ArrowRight size={15} /></button>
        </div>
        <div className="service-promo"><div className="promo-symbol"><Wrench size={19} /></div><div><strong>Something not working?</strong><p>Get help with repairs and maintenance.</p><button onClick={onService}>Request a service <ArrowRight size={14} /></button></div><div className="promo-spark">✳</div></div>
      </div>
    </section>
    <section className="bottom-tip"><div className="tip-icon"><Sparkles size={17} /></div><div><strong>Make warranty tracking effortless</strong><p>Upload your purchase bill and let the scanner help read the details for you.</p></div><button className="text-link" onClick={onScan}>Scan a bill <ArrowRight size={15} /></button></section>
  </div>;
}

function ApplianceRow({ item }) {
  const status = statusOf(item.expiryDate);
  const icon = <ApplianceIcon category={item.category} size={22} />;
  return <div className="appliance-row">
    <div className={`appliance-thumb ${item.color || "blue"}`}>{item.image ? <img src={item.image} alt={item.name} onError={e => { e.currentTarget.style.display = "none"; }} /> : icon}<span className="thumb-icon">{icon}</span></div>
    <div className="appliance-details"><strong>{item.name}</strong><span>{item.brand} <i>·</i> {item.model || item.category}</span><small>Warranty ends {new Date(`${item.expiryDate}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</small></div>
    <span className={`status-badge ${status.className}`}><i />{status.label}</span><button className="row-arrow" aria-label={`View ${item.name}`} title="Appliance details"><ChevronRight size={17} /></button>
  </div>;
}

function Scanner({ selectedFile, fileRef, handleFile, runOcr, scanning, scanProgress, ocrText, scanError, onAdd }) {
  const [dragging, setDragging] = useState(false);
  return <div className="page-stack">
    <section className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-line" /> INTELLIGENT DOCUMENT READING</div><h1>AI Bill Scanner<span className="wave">✦</span></h1><p className="subheading">Turn a purchase bill into organised warranty information.</p></div><div className="secure-note"><ShieldCheck size={17} /><span>Private demo workspace</span></div></section>
    <section className="scanner-intro"><div className="scanner-intro-icon"><ScanLine size={24} /></div><div><h2>Let's read your purchase bill.</h2><p>Upload a clear bill image. OCR will extract the visible text so you can review it before saving appliance details.</p></div><div className="scanner-badge"><Sparkles size={14} /> OCR powered</div></section>
    <section className="scanner-layout">
      <div className="panel upload-panel">
        <div className="panel-heading"><div><span className="eyebrow">STEP 01 / UPLOAD</span><h2>Upload your document</h2><p>Use a clear photo or screenshot of your bill.</p></div><div className="step-count">01</div></div>
        <div className={`drop-zone ${dragging ? "dragging" : ""} ${selectedFile ? "has-file" : ""}`} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={e => handleFile(e.target.files[0])} hidden />
          {selectedFile ? <><div className="upload-icon success-upload"><FileImage size={27} /></div><strong className="file-name">{selectedFile.name}</strong><span>{(selectedFile.size / 1024).toFixed(0)} KB · Ready to scan</span><button className="text-link" onClick={() => fileRef.current?.click()}>Choose another file</button></> : <><div className="upload-icon"><UploadCloud size={28} /></div><strong>Drop your bill image here</strong><span>or browse files from your computer</span><button className="button secondary browse-button" onClick={() => fileRef.current?.click()} type="button">Browse files</button><small>JPG, PNG or WEBP · Clear image recommended</small></>}
        </div>
        {scanError && <div className="error-note"><CircleHelp size={16} />{scanError}</div>}
        <div className="privacy-note"><ShieldCheck size={17} /><span><strong>Your document, your control.</strong><small>This demo scans the image in your browser. It does not save it to a database.</small></span></div>
        <button className="button primary scan-button" onClick={runOcr} disabled={scanning || !selectedFile}>{scanning ? <><span className="spinner" /> Reading document… {scanProgress}%</> : <><Sparkles size={17} /> Extract text with AI OCR <ArrowRight size={16} /></>}</button>
        {scanning && <div className="progress-track"><span style={{ width: `${scanProgress}%` }} /></div>}
      </div>
      <div className="panel extraction-panel">
        <div className="panel-heading"><div><span className="eyebrow">STEP 02 / REVIEW</span><h2>Extracted information</h2><p>Review the text before entering warranty details.</p></div><div className="step-count">02</div></div>
        {ocrText ? <div className="extraction-result"><div className="result-header"><span className="result-state"><CheckCircle2 size={15} /> Text extraction complete</span><button className="text-link" onClick={() => navigator.clipboard?.writeText(ocrText)}>Copy text</button></div><pre>{ocrText}</pre><div className="result-tip"><Sparkles size={16} /><span><strong>Next step</strong><small>Check the purchase date, brand and warranty period manually. OCR can make mistakes with blurry or angled bills.</small></span></div><button className="button primary full-button" onClick={onAdd}><Plus size={16} /> Add appliance details manually</button></div> : <div className="empty-extraction"><div className="document-illustration"><div className="doc-paper"><div className="doc-topline" /><div className="doc-line long" /><div className="doc-line" /><div className="doc-line medium" /><div className="doc-highlight" /><div className="doc-line long" /><div className="doc-line medium" /></div><div className="scan-corner corner-a" /><div className="scan-corner corner-b" /><div className="scan-beam" /></div><strong>Your extracted text will appear here</strong><p>Upload a bill and start scanning to see the recognised text.</p><div className="empty-tags"><span><Check size={12} /> Brand and model</span><span><Check size={12} /> Purchase date</span><span><Check size={12} /> Warranty terms</span></div></div>}
      </div>
    </section>
    <div className="scanner-disclaimer"><CircleHelp size={16} /><span><strong>Important:</strong> OCR extracts visible text only. This prototype does not automatically verify a warranty with the manufacturer. Always confirm extracted details against the original bill.</span></div>
  </div>;
}

function AppliancesPage({ appliances, query, onAdd }) {
  return <div className="page-stack">
    <section className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-line" /> ALL YOUR HOME ESSENTIALS</div><h1>My Appliances<span className="wave">✦</span></h1><p className="subheading">Keep purchase details and warranty dates in one organised place.</p></div><button className="button primary" onClick={onAdd}><Plus size={17} /> Add appliance</button></section>
    <div className="inventory-summary"><div><span className="summary-icon"><Laptop size={18} /></span><span><small>Registered items</small><strong>{appliances.length}</strong></span></div><div><span className="summary-icon mint"><ShieldCheck size={18} /></span><span><small>Warranty tracking</small><strong>Active</strong></span></div><div className="inventory-search-hint"><Search size={17} /> Use the search field in the top bar to filter your inventory.</div></div>
    {appliances.length ? <div className="inventory-grid">{appliances.map(item => {
      const status = statusOf(item.expiryDate);
      return <article className="inventory-card" key={item.id}>
        <div className={`inventory-image ${item.color || "blue"}`}>{item.image ? <img src={item.image} alt={item.name} onError={e => { e.currentTarget.style.display = "none"; }} /> : <ApplianceIcon category={item.category} size={48} />}<span className={`status-badge ${status.className}`}><i />{status.label}</span></div>
        <div className="inventory-card-body"><span className="eyebrow">{item.brand} · {item.category}</span><h3>{item.name}</h3><p className="model-line">{item.model || "Model not provided"} <span>·</span> {item.serial}</p><div className="warranty-progress-head"><span>Warranty period</span><b>{status.days < 0 ? "Ended" : `${status.days} days left`}</b></div><div className="warranty-progress"><span className={status.className} style={{ width: `${Math.max(5, Math.min(100, status.days / 730 * 100))}%` }} /></div><div className="date-pair"><div><small>Purchased</small><strong>{new Date(`${item.purchaseDate}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</strong></div><div><small>Warranty ends</small><strong>{new Date(`${item.expiryDate}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</strong></div></div></div>
      </article>;
    })}</div> : <div className="panel empty-inventory"><Laptop size={30} /><h2>{query ? "No matching appliances" : "Your inventory is empty"}</h2><p>{query ? "Try a different search term." : "Add your first appliance to begin tracking warranty details."}</p><button className="button primary" onClick={onAdd}><Plus size={16} /> Add appliance</button></div>}
  </div>;
}

function ServicePage({ onRequest }) {
  return <div className="page-stack">
    <section className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-line" /> REPAIRS WITHOUT THE GUESSWORK</div><h1>Service Centre<span className="wave">✦</span></h1><p className="subheading">A clear starting point for maintenance and repair requests.</p></div><button className="button primary" onClick={onRequest}><Plus size={17} /> New service request</button></section>
    <section className="service-hero"><div className="service-hero-copy"><span className="service-icon-large"><Wrench size={25} /></span><span className="eyebrow">APPLIANCE CARE, SIMPLIFIED</span><h2>Get back to what<br />makes home feel like home.</h2><p>Create a service request and keep the appliance, issue and preferred date together. This demo does not contact a technician yet.</p><button className="button primary" onClick={onRequest}>Request a service <ArrowRight size={16} /></button></div><div className="service-art"><div className="service-art-circle"><Headphones size={70} strokeWidth={1.2} /></div><div className="service-floating-card"><CheckCircle2 size={17} /><span><b>Service details</b><small>All in one place</small></span></div></div></section>
    <div className="service-benefits"><div className="panel benefit-card"><div className="benefit-icon blue"><CalendarDays size={20} /></div><h3>Choose a date</h3><p>Share a preferred date for a service visit.</p></div><div className="panel benefit-card"><div className="benefit-icon mint"><FileText size={20} /></div><h3>Keep the details</h3><p>Connect the issue to a registered appliance.</p></div><div className="panel benefit-card"><div className="benefit-icon amber"><ShieldCheck size={20} /></div><h3>Check coverage first</h3><p>Review warranty dates before requesting a repair.</p></div></div>
  </div>;
}

function Insights({ appliances, protectedCount, soonCount, expiredCount }) {
  const total = Math.max(1, appliances.length);
  const data = [{ label: "Protected", count: protectedCount, color: "bar-mint" }, { label: "Expiring soon", count: soonCount, color: "bar-amber" }, { label: "Expired", count: expiredCount, color: "bar-rose" }];
  const categoryCounts = appliances.reduce((acc, item) => { acc[item.category] = (acc[item.category] || 0) + 1; return acc; }, {});
  return <div className="page-stack">
    <section className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-line" /> AT A GLANCE</div><h1>Home insights<span className="wave">✦</span></h1><p className="subheading">Understand your registered appliances and warranty coverage.</p></div><div className="secure-note"><Activity size={17} /> Updates from your current inventory</div></section>
    <section className="stats-grid insights-stats"><StatCard label="Registered appliances" value={appliances.length.toString().padStart(2, "0")} note="All categories" icon={Laptop} tone="violet" /><StatCard label="Protected" value={protectedCount.toString().padStart(2, "0")} note="Coverage active" icon={ShieldCheck} tone="mint" trend /><StatCard label="Expiring soon" value={soonCount.toString().padStart(2, "0")} note="Within 60 days" icon={Clock3} tone="amber" /><StatCard label="Expired" value={expiredCount.toString().padStart(2, "0")} note="Review service options" icon={FileCheck2} tone="rose" /></section>
    <section className="insights-grid"><div className="panel insight-panel"><div className="panel-heading"><div><span className="eyebrow">COVERAGE HEALTH</span><h2>Warranty status distribution</h2><p>Based on expiry dates saved in this demo.</p></div><div className="mini-icon"><Gauge size={18} /></div></div><div className="coverage-visual"><div className="donut" style={{ "--protected": `${protectedCount / total * 100}%`, "--soon": `${(protectedCount + soonCount) / total * 100}%` }}><div><strong>{appliances.length}</strong><small>appliances</small></div></div><div className="legend-list">{data.map(d => <div key={d.label}><span className={`legend-dot ${d.color}`} /><span>{d.label}</span><strong>{d.count}</strong></div>)}</div></div></div>
      <div className="panel insight-panel"><div className="panel-heading"><div><span className="eyebrow">HOME INVENTORY</span><h2>Appliance categories</h2><p>How your registered items are grouped.</p></div><div className="mini-icon"><Laptop size={18} /></div></div><div className="category-bars">{Object.entries(categoryCounts).map(([name, count]) => <div className="category-bar-row" key={name}><div><span>{name}</span><strong>{count}</strong></div><div className="category-track"><span style={{ width: `${count / total * 100}%` }} /></div></div>)}</div></div></section>
    <div className="insight-footnote"><CircleHelp size={16} /><span>These are live calculations from the current browser session, not historical analytics. A database connection is needed for permanent records and cross-device reporting.</span></div>
  </div>;
}

function EmptyState({ message }) {
  return <div className="empty-state"><Search size={22} /><p>{message}</p></div>;
}

export default App;