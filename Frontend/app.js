/* ==========================================================================
   Gemini AI Studio - Interactive Frontend Logic
   ========================================================================== */

// State Management
const state = {
  backendUrl: localStorage.getItem('gemini_backend_url') || 'http://localhost:8000',
  isBackendOnline: false,
  demoMode: false,
  activeTab: 'summarize',
  theme: localStorage.getItem('gemini_theme') || 'dark',
  chatHistory: [],
  selectedImageFile: null,
  isSpeaking: false,
  activeSpeechUtterance: null
};

// Preset Prompts & Samples
const PRESETS = {
  summaries: [
    {
      title: "🚀 Quantum Computing",
      text: "Quantum computing represents a fundamental paradigm shift in computation, exploiting principles of quantum mechanics such as superposition and entanglement. Unlike classical computers that process information in binary bits (0 or 1), quantum processors utilize quantum bits or qubits. This enables them to explore vast solution spaces simultaneously, drastically accelerating tasks such as molecular simulation for drug discovery, complex financial modeling, and cryptographic vulnerability assessments."
    },
    {
      title: "🌱 Renewable Energy",
      text: "The global energy transition is rapidly accelerating as solar photovoltaic and wind energy costs reach historic parity with conventional fossil fuels. Grid-scale battery storage solutions, particularly lithium-iron-phosphate and emerging solid-state chemistries, are addressing renewable intermittency challenges. As smart grid technologies and decentralized microgrids proliferate, energy security and carbon abatement metrics are projected to improve exponentially across metropolitan areas."
    },
    {
      title: "🧠 Artificial Intelligence",
      text: "Artificial intelligence has transitioned from rules-based symbolic logic to modern deep transformer architectures and multimodal reasoning engines. Today's frontier foundation models process code, vision, audio, and language in unified latent spaces. While these capabilities unlock unprecedented productivity gains in software engineering, medical diagnosis, and scientific hypothesis generation, they simultaneously demand robust alignment techniques, interpretability frameworks, and responsible AI governance."
    }
  ],
  chatStarters: [
    "What are the key differences between classical and quantum computing?",
    "Explain how transformer neural networks work using an analogy.",
    "Give me 5 actionable habits to boost my deep work productivity.",
    "Write a short, inspiring poem about exploring deep space."
  ]
};

// DOM Elements Cache
const elements = {
  // Theme & Settings
  themeToggleBtn: document.getElementById('themeToggleBtn'),
  themeIcon: document.getElementById('themeIcon'),
  settingsBtn: document.getElementById('settingsBtn'),
  settingsModal: document.getElementById('settingsModal'),
  closeSettingsBtn: document.getElementById('closeSettingsBtn'),
  saveSettingsBtn: document.getElementById('saveSettingsBtn'),
  backendUrlInput: document.getElementById('backendUrlInput'),
  demoModeToggle: document.getElementById('demoModeToggle'),
  statusPill: document.getElementById('statusPill'),
  statusDot: document.getElementById('statusDot'),
  statusText: document.getElementById('statusText'),

  // Tabs
  tabBtns: document.querySelectorAll('.tab-btn'),
  tabViews: document.querySelectorAll('.tab-view'),

  // Summarizer
  summaryText: document.getElementById('summaryText'),
  summarizeBtn: document.getElementById('summarizeBtn'),
  clearSummaryBtn: document.getElementById('clearSummaryBtn'),
  sampleSummaryBtn: document.getElementById('sampleSummaryBtn'),
  summaryOutput: document.getElementById('summaryOutput'),
  summaryMetaBar: document.getElementById('summaryMetaBar'),
  reductionBadge: document.getElementById('reductionBadge'),
  copySummaryBtn: document.getElementById('copySummaryBtn'),
  speakSummaryBtn: document.getElementById('speakSummaryBtn'),
  charCount: document.getElementById('charCount'),
  wordCount: document.getElementById('wordCount'),
  readingTime: document.getElementById('readingTime'),
  summaryChips: document.getElementById('summaryChips'),

  // Vision Studio
  dropzone: document.getElementById('dropzone'),
  imageInput: document.getElementById('imageInput'),
  previewContainer: document.getElementById('previewContainer'),
  previewImage: document.getElementById('previewImage'),
  previewName: document.getElementById('previewName'),
  previewSize: document.getElementById('previewSize'),
  removeImageBtn: document.getElementById('removeImageBtn'),
  scannerLine: document.getElementById('scannerLine'),
  explainBtn: document.getElementById('explainBtn'),
  imageOutput: document.getElementById('imageOutput'),
  copyImageTextBtn: document.getElementById('copyImageTextBtn'),
  speakImageTextBtn: document.getElementById('speakImageTextBtn'),
  sampleImageChips: document.getElementById('sampleImageChips'),

  // Chatbot
  chatMessages: document.getElementById('chatMessages'),
  chatInput: document.getElementById('chatInput'),
  sendChatBtn: document.getElementById('sendChatBtn'),
  clearChatBtn: document.getElementById('clearChatBtn'),
  exportChatBtn: document.getElementById('exportChatBtn'),
  typingIndicator: document.getElementById('typingIndicator'),
  chatStartersContainer: document.getElementById('chatStartersContainer'),

  // Toast Container
  toastContainer: document.getElementById('toastContainer')
};

// Sound synthesizer using Web Audio API
function playChime(type = 'success') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'pop') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(640, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    }
  } catch (e) {
    // AudioContext blocked or not supported
  }
}

// Toast Notifications System
function showToast(message, type = 'info', duration = 3500) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
    error: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    info: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
    warning: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
  };

  toast.innerHTML = `
    ${icons[type] || icons.info}
    <span>${message}</span>
  `;

  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(15px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Text-to-Speech Helper
function toggleSpeech(text, buttonElement) {
  if (!('speechSynthesis' in window)) {
    showToast("Speech synthesis not supported in this browser.", "warning");
    return;
  }

  if (state.isSpeaking) {
    window.speechSynthesis.cancel();
    state.isSpeaking = false;
    updateSpeakButton(buttonElement, false);
    return;
  }

  if (!text || text.trim() === '') {
    showToast("No content to read.", "warning");
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  utterance.onstart = () => {
    state.isSpeaking = true;
    updateSpeakButton(buttonElement, true);
  };

  utterance.onend = utterance.onerror = () => {
    state.isSpeaking = false;
    updateSpeakButton(buttonElement, false);
  };

  state.activeSpeechUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

function updateSpeakButton(btn, active) {
  if (!btn) return;
  if (active) {
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Stop`;
    btn.style.borderColor = 'var(--accent-pink)';
    btn.style.color = 'var(--accent-pink)';
  } else {
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg> Read Aloud`;
    btn.style.borderColor = '';
    btn.style.color = '';
  }
}

// Copy to Clipboard with Feedback
async function copyToClipboard(text, btnElement, label = 'Copied!') {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    playChime('pop');
    showToast('Copied to clipboard!', 'success');
    
    if (btnElement) {
      const originalHTML = btnElement.innerHTML;
      btnElement.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> ${label}`;
      setTimeout(() => {
        btnElement.innerHTML = originalHTML;
      }, 2000);
    }
  } catch (err) {
    showToast('Failed to copy', 'error');
  }
}

// Markdown Formatter (lightweight safe parser)
function formatMarkdown(text) {
  if (!text) return '';
  let escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks ```code```
  escaped = escaped.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  // Inline code `code`
  escaped = escaped.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  // Bold **text**
  escaped = escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Italic *text*
  escaped = escaped.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  // Unordered list items
  escaped = escaped.replace(/^\s*[-*]\s+(.*)$/gm, '<li>$1</li>');
  escaped = escaped.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  // Line breaks
  escaped = escaped.replace(/\n\n/g, '<br><br>');

  return escaped;
}

// Backend Health Check
async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(`${state.backendUrl}/`, {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      state.isBackendOnline = true;
      elements.statusDot.className = 'status-dot';
      elements.statusText.textContent = 'Backend: Online';
    } else {
      throw new Error('Status not OK');
    }
  } catch (error) {
    state.isBackendOnline = false;
    elements.statusDot.className = 'status-dot offline';
    elements.statusText.textContent = state.demoMode ? 'Demo Mode Active' : 'Backend: Offline';
  }
}

// Switch Active Tab
function switchTab(targetTab) {
  state.activeTab = targetTab;
  elements.tabBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === targetTab);
  });
  elements.tabViews.forEach(view => {
    view.classList.toggle('active', view.id === `${targetTab}View`);
  });
  playChime('pop');
}

// Theme Management
function setTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('gemini_theme', theme);

  if (theme === 'light') {
    elements.themeIcon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
  } else {
    elements.themeIcon.innerHTML = `<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>`;
  }
}

function toggleTheme() {
  const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
  setTheme(nextTheme);
  showToast(`Switched to ${nextTheme} mode`, 'info', 2000);
}

// Text Summarizer Logic
function updateTextCounters() {
  const text = elements.summaryText.value;
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const mins = Math.max(1, Math.ceil(words / 200));

  elements.charCount.textContent = chars.toLocaleString();
  elements.wordCount.textContent = words.toLocaleString();
  elements.readingTime.textContent = words > 0 ? `${mins}m read` : '0m';
}

function loadSummaryPreset(preset) {
  elements.summaryText.value = preset.text;
  updateTextCounters();
  elements.summaryText.focus();
  playChime('pop');
  showToast(`Loaded preset: "${preset.title}"`, 'info', 2000);
}

async function summarizeText() {
  const text = elements.summaryText.value.trim();
  if (!text) {
    showToast('Please enter or paste some text to summarize.', 'warning');
    elements.summaryText.focus();
    return;
  }

  const originalWords = text.split(/\s+/).length;

  // Set Loading State
  elements.summarizeBtn.disabled = true;
  elements.summarizeBtn.innerHTML = `<span class="spinner"></span> Summarizing...`;
  elements.summaryOutput.innerHTML = `
    <div class="output-placeholder">
      <div class="spinner" style="width: 28px; height: 28px; border-width: 3px;"></div>
      <p>Gemini AI is analyzing and synthesizing your content...</p>
    </div>
  `;

  try {
    let summaryResult = '';

    if (!state.isBackendOnline && state.demoMode) {
      // Realistic Simulated Response
      await new Promise(res => setTimeout(res, 1200));
      summaryResult = `• **Core Concept**: The text highlights groundbreaking progress in technology and systemic innovation.\n• **Key Takeaways**:\n  - Major acceleration driven by unified architectures and scalable paradigms.\n  - Transition from traditional boundaries to multimodal, cross-domain applications.\n  - Vital imperative for proactive governance, security, and ethical alignment.\n\n*Summary generated in Interactive Demo Mode.*`;
    } else {
      const formData = new FormData();
      formData.append('text', text);

      const res = await fetch(`${state.backendUrl}/summarize`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      summaryResult = data.summary || 'No summary returned.';
    }

    elements.summaryOutput.innerHTML = formatMarkdown(summaryResult);
    elements.summaryOutput.setAttribute('data-raw', summaryResult);

    // Calculate reduction percentage
    const summaryWords = summaryResult.trim().split(/\s+/).length;
    const reduction = Math.max(0, Math.round(((originalWords - summaryWords) / originalWords) * 100));
    elements.reductionBadge.textContent = `📉 ${reduction}% condensed (${originalWords} → ${summaryWords} words)`;
    elements.summaryMetaBar.style.display = 'flex';

    playChime('success');
    showToast('Summary completed successfully!', 'success');
  } catch (err) {
    console.error(err);
    elements.summaryOutput.innerHTML = `
      <div style="color: var(--accent-rose); padding: 12px;">
        <strong>⚠️ Summarization Failed:</strong> ${err.message}.<br><br>
        <small style="color: var(--text-muted);">Ensure the backend server is running via <code>uvicorn main:app --reload</code> in the <code>backend/</code> folder, or toggle <strong>Demo Mode</strong> in Settings.</small>
      </div>
    `;
    elements.summaryMetaBar.style.display = 'none';
    showToast('Failed to connect to backend.', 'error');
  } finally {
    elements.summarizeBtn.disabled = false;
    elements.summarizeBtn.innerHTML = `
      <svg viewBox="0 0 24 24"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/></svg>
      Summarize
    `;
  }
}

// Vision Studio Logic
function handleFileSelect(file) {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showToast('Please upload an image file (PNG, JPG, WEBP, etc.)', 'warning');
    return;
  }

  state.selectedImageFile = file;

  // Format file size
  const sizeKb = (file.size / 1024).toFixed(1);
  const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
  const displaySize = file.size > 1024 * 1024 ? `${sizeMb} MB` : `${sizeKb} KB`;

  elements.previewName.textContent = file.name;
  elements.previewSize.textContent = displaySize;

  const reader = new FileReader();
  reader.onload = (e) => {
    elements.previewImage.src = e.target.result;
    elements.previewContainer.classList.add('active');
    elements.dropzone.style.display = 'none';
    playChime('pop');
    showToast('Image loaded! Click "Explain Image" to analyze.', 'info', 2500);
  };
  reader.readAsDataURL(file);
}

function clearSelectedImage() {
  state.selectedImageFile = null;
  elements.imageInput.value = '';
  elements.previewImage.src = '';
  elements.previewContainer.classList.remove('active');
  elements.dropzone.style.display = 'flex';
  elements.scannerLine.classList.remove('active');
}

// Sample canvas image generator for presets
function loadSampleImagePreset(type) {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');

  if (type === 'diagram') {
    // Neural Network Architecture Diagram
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 600, 400);

    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 5; j++) {
        ctx.beginPath();
        ctx.moveTo(120, 80 + i * 80);
        ctx.lineTo(300, 50 + j * 75);
        ctx.stroke();
      }
    }
    for (let j = 0; j < 5; j++) {
      for (let k = 0; k < 2; k++) {
        ctx.beginPath();
        ctx.moveTo(300, 50 + j * 75);
        ctx.lineTo(480, 140 + k * 120);
        ctx.stroke();
      }
    }

    // Nodes
    const drawNode = (x, y, color) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.fill();
    };

    for (let i = 0; i < 4; i++) drawNode(120, 80 + i * 80, '#38bdf8');
    for (let j = 0; j < 5; j++) drawNode(300, 50 + j * 75, '#a855f7');
    for (let k = 0; k < 2; k++) drawNode(480, 140 + k * 120, '#10b981');

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('Multimodal Deep Learning Architecture', 130, 30);
  } else if (type === 'chart') {
    // Growth Trend Chart
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(0, 0, 600, 400);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    for (let y = 80; y <= 320; y += 60) {
      ctx.beginPath();
      ctx.moveTo(80, y);
      ctx.lineTo(520, y);
      ctx.stroke();
    }

    // Bar chart
    const bars = [60, 120, 190, 240, 290];
    const labels = ['Q1', 'Q2', 'Q3', 'Q4', 'Projected'];
    bars.forEach((h, i) => {
      const grad = ctx.createLinearGradient(0, 320 - h, 0, 320);
      grad.addColorStop(0, '#d946ef');
      grad.addColorStop(1, '#6366f1');
      ctx.fillStyle = grad;
      ctx.fillRect(110 + i * 85, 320 - h, 50, h);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px sans-serif';
      ctx.fillText(labels[i], 115 + i * 85, 345);
    });

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('Quarterly Adoption Metrics (Growth %)', 120, 45);
  }

  canvas.toBlob((blob) => {
    const file = new File([blob], `${type}_sample.png`, { type: 'image/png' });
    handleFileSelect(file);
  });
}

async function explainImage() {
  if (!state.selectedImageFile) {
    showToast('Please select or drop an image first.', 'warning');
    return;
  }

  // Set Loading & Scanner State
  elements.explainBtn.disabled = true;
  elements.explainBtn.innerHTML = `<span class="spinner"></span> Analyzing Image...`;
  elements.scannerLine.classList.add('active');
  elements.imageOutput.innerHTML = `
    <div class="output-placeholder">
      <div class="spinner" style="width: 28px; height: 28px; border-width: 3px;"></div>
      <p>Gemini Vision is inspecting visual features and context...</p>
    </div>
  `;

  try {
    let explanationResult = '';

    if (!state.isBackendOnline && state.demoMode) {
      await new Promise(res => setTimeout(res, 1600));
      explanationResult = `### 🔍 Visual Analysis Report\n\n• **Detected Subject**: Detailed diagram/visualization featuring structured data flow, high-contrast visual markers, and modern technical topology.\n• **Key Elements Identified**:\n  - Network nodes connected by weighted synaptic vertices.\n  - Color-coded hierarchy (input layer in cyan, hidden representation in violet, prediction head in emerald).\n• **Interpretation**: The graphic depicts a modern neural pipeline designed for accelerated high-throughput inference.\n\n*Generated via Gemini Vision Studio in Interactive Demo Mode.*`;
    } else {
      const formData = new FormData();
      formData.append('file', state.selectedImageFile);

      const res = await fetch(`${state.backendUrl}/explain-image`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      explanationResult = data.explanation || 'No explanation returned.';
    }

    elements.imageOutput.innerHTML = formatMarkdown(explanationResult);
    elements.imageOutput.setAttribute('data-raw', explanationResult);
    playChime('success');
    showToast('Visual analysis ready!', 'success');
  } catch (err) {
    console.error(err);
    elements.imageOutput.innerHTML = `
      <div style="color: var(--accent-rose); padding: 12px;">
        <strong>⚠️ Visual Analysis Failed:</strong> ${err.message}.<br><br>
        <small style="color: var(--text-muted);">Ensure backend server is running at <code>${state.backendUrl}</code> or switch on Demo Mode in settings.</small>
      </div>
    `;
    showToast('Image explanation failed.', 'error');
  } finally {
    elements.explainBtn.disabled = false;
    elements.scannerLine.classList.remove('active');
    elements.explainBtn.innerHTML = `
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
      Explain Image
    `;
  }
}

// Chatbot Logic
function appendMessage(sender, text) {
  const isUser = sender === 'user';
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const msgRow = document.createElement('div');
  msgRow.className = `message-row ${sender}`;

  const avatar = document.createElement('div');
  avatar.className = `message-avatar ${sender}`;
  avatar.innerHTML = isUser
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
    : `<svg viewBox="0 0 24 24"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z"/></svg>`;

  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'message-content-wrapper';

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.innerHTML = isUser ? escapeHTML(text) : formatMarkdown(text);

  const metaRow = document.createElement('div');
  metaRow.style.display = 'flex';
  metaRow.style.alignItems = 'center';
  metaRow.style.gap = '8px';

  const timeSpan = document.createElement('span');
  timeSpan.className = 'message-time';
  timeSpan.textContent = time;
  metaRow.appendChild(timeSpan);

  if (!isUser) {
    const copyBtn = document.createElement('button');
    copyBtn.className = 'action-tiny-btn';
    copyBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy`;
    copyBtn.onclick = () => copyToClipboard(text, copyBtn, 'Copied');
    metaRow.appendChild(copyBtn);

    const speakBtn = document.createElement('button');
    speakBtn.className = 'action-tiny-btn';
    speakBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg> Read`;
    speakBtn.onclick = () => toggleSpeech(text, speakBtn);
    metaRow.appendChild(speakBtn);
  }

  contentWrapper.appendChild(bubble);
  contentWrapper.appendChild(metaRow);

  msgRow.appendChild(avatar);
  msgRow.appendChild(contentWrapper);

  elements.chatMessages.appendChild(msgRow);
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

async function sendChatMessage() {
  const msg = elements.chatInput.value.trim();
  if (!msg) return;

  // Append user message
  appendMessage('user', msg);
  state.chatHistory.push({ user: msg, bot: '' });
  elements.chatInput.value = '';
  elements.chatInput.style.height = '48px';
  elements.sendChatBtn.disabled = true;

  // Show typing animation
  elements.typingIndicator.classList.add('active');
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;

  try {
    let botResponse = '';

    if (!state.isBackendOnline && state.demoMode) {
      await new Promise(res => setTimeout(res, 1200));
      if (msg.toLowerCase() === 'quit') {
        botResponse = 'Chat session ended. It was great talking with you!';
      } else {
        botResponse = `Thanks for asking about **"${msg}"**!\n\nAs a versatile multimodal assistant, I can synthesize information, troubleshoot complex code patterns, formulate architectural blueprints, and answer questions across diverse subjects.\n\nIs there a specific detail you would like to explore deeper?`;
      }
    } else {
      const formData = new FormData();
      formData.append('message', msg);

      const res = await fetch(`${state.backendUrl}/chat`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      botResponse = data.response || 'No response returned from Gemini.';
    }

    elements.typingIndicator.classList.remove('active');
    appendMessage('bot', botResponse);
    state.chatHistory[state.chatHistory.length - 1].bot = botResponse;
    playChime('pop');
  } catch (err) {
    elements.typingIndicator.classList.remove('active');
    console.error(err);
    appendMessage('bot', `⚠️ **Connection Error**: Unable to reach backend at \`${state.backendUrl}\`. Please verify your server or activate Demo Mode.`);
    showToast('Failed to reach chatbot backend.', 'error');
  } finally {
    elements.sendChatBtn.disabled = false;
    elements.chatInput.focus();
  }
}

function clearChatHistory() {
  if (confirm("Are you sure you want to clear this conversation?")) {
    state.chatHistory = [];
    elements.chatMessages.innerHTML = `
      <div class="chat-welcome">
        <div class="chat-welcome-icon">
          <svg viewBox="0 0 24 24"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z"/></svg>
        </div>
        <h3>How can I assist you today?</h3>
        <p>Ask anything, explore deep knowledge, or try one of the curated prompts below.</p>
        <div class="chat-starters" id="chatStartersContainer"></div>
      </div>
    `;
    populateChatStarters();
    showToast('Chat history cleared', 'info');
  }
}

function exportChat() {
  if (state.chatHistory.length === 0) {
    showToast('No chat messages to export.', 'warning');
    return;
  }

  let transcript = `# Gemini AI Studio - Chat Conversation\n\nExported: ${new Date().toLocaleString()}\n\n`;
  state.chatHistory.forEach((turn, idx) => {
    transcript += `### User (${idx + 1}):\n${turn.user}\n\n### Gemini Bot:\n${turn.bot}\n\n---\n\n`;
  });

  const blob = new Blob([transcript], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gemini_chat_${Date.now()}.md`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Chat exported as Markdown!', 'success');
}

// Populate Starters & Chips
function populateSummaryChips() {
  elements.summaryChips.innerHTML = `<span class="chip-label">Quick Presets:</span>`;
  PRESETS.summaries.forEach(preset => {
    const chip = document.createElement('button');
    chip.className = 'prompt-chip';
    chip.textContent = preset.title;
    chip.onclick = () => loadSummaryPreset(preset);
    elements.summaryChips.appendChild(chip);
  });
}

function populateChatStarters() {
  const container = document.getElementById('chatStartersContainer');
  if (!container) return;
  container.innerHTML = '';
  PRESETS.chatStarters.forEach(starter => {
    const btn = document.createElement('button');
    btn.className = 'starter-btn';
    btn.textContent = starter;
    btn.onclick = () => {
      elements.chatInput.value = starter;
      sendChatMessage();
    };
    container.appendChild(btn);
  });
}

// Event Listeners Initialization
function initEventListeners() {
  // Theme & Settings
  elements.themeToggleBtn.addEventListener('click', toggleTheme);
  elements.settingsBtn.addEventListener('click', () => {
    elements.backendUrlInput.value = state.backendUrl;
    elements.demoModeToggle.checked = state.demoMode;
    elements.settingsModal.classList.add('active');
  });
  elements.closeSettingsBtn.addEventListener('click', () => {
    elements.settingsModal.classList.remove('active');
  });
  elements.saveSettingsBtn.addEventListener('click', () => {
    state.backendUrl = elements.backendUrlInput.value.trim() || 'http://localhost:8000';
    state.demoMode = elements.demoModeToggle.checked;
    localStorage.setItem('gemini_backend_url', state.backendUrl);
    elements.settingsModal.classList.remove('active');
    checkBackendHealth();
    showToast('Settings saved!', 'success');
  });
  elements.statusPill.addEventListener('click', () => {
    checkBackendHealth();
    showToast('Pinging backend server...', 'info', 1500);
  });

  // Tab switching
  elements.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Text Summarizer
  elements.summaryText.addEventListener('input', updateTextCounters);
  elements.summarizeBtn.addEventListener('click', summarizeText);
  elements.clearSummaryBtn.addEventListener('click', () => {
    elements.summaryText.value = '';
    updateTextCounters();
    elements.summaryOutput.innerHTML = `
      <div class="output-placeholder">
        <div class="placeholder-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        </div>
        <p>Your AI-generated summary will appear here with insights and metrics.</p>
      </div>
    `;
    elements.summaryMetaBar.style.display = 'none';
  });
  elements.sampleSummaryBtn.addEventListener('click', () => {
    loadSummaryPreset(PRESETS.summaries[0]);
  });
  elements.copySummaryBtn.addEventListener('click', () => {
    const raw = elements.summaryOutput.getAttribute('data-raw') || elements.summaryOutput.innerText;
    copyToClipboard(raw, elements.copySummaryBtn);
  });
  elements.speakSummaryBtn.addEventListener('click', () => {
    const raw = elements.summaryOutput.getAttribute('data-raw') || elements.summaryOutput.innerText;
    toggleSpeech(raw, elements.speakSummaryBtn);
  });

  // Keyboard shortcut for Summarize: Ctrl/Cmd + Enter
  elements.summaryText.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      summarizeText();
    }
  });

  // Drag and Drop Zone for Vision Studio
  elements.dropzone.addEventListener('click', () => elements.imageInput.click());
  elements.imageInput.addEventListener('change', (e) => handleFileSelect(e.target.files[0]));

  ['dragenter', 'dragover'].forEach(eventName => {
    elements.dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      elements.dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    elements.dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      elements.dropzone.classList.remove('dragover');
    });
  });

  elements.dropzone.addEventListener('drop', (e) => {
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  });

  // Paste image from clipboard anywhere on page
  window.addEventListener('paste', (e) => {
    if (e.clipboardData && e.clipboardData.items) {
      for (let item of e.clipboardData.items) {
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          switchTab('vision');
          handleFileSelect(file);
          showToast('Image pasted from clipboard!', 'success');
          break;
        }
      }
    }
  });

  elements.removeImageBtn.addEventListener('click', clearSelectedImage);
  elements.explainBtn.addEventListener('click', explainImage);
  elements.copyImageTextBtn.addEventListener('click', () => {
    const raw = elements.imageOutput.getAttribute('data-raw') || elements.imageOutput.innerText;
    copyToClipboard(raw, elements.copyImageTextBtn);
  });
  elements.speakImageTextBtn.addEventListener('click', () => {
    const raw = elements.imageOutput.getAttribute('data-raw') || elements.imageOutput.innerText;
    toggleSpeech(raw, elements.speakImageTextBtn);
  });

  // Sample Vision Chips
  document.getElementById('sampleVisionDiagram').addEventListener('click', () => loadSampleImagePreset('diagram'));
  document.getElementById('sampleVisionChart').addEventListener('click', () => loadSampleImagePreset('chart'));

  // Chatbot Events
  elements.sendChatBtn.addEventListener('click', sendChatMessage);
  elements.chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  });
  elements.chatInput.addEventListener('input', () => {
    elements.chatInput.style.height = 'auto';
    elements.chatInput.style.height = Math.min(elements.chatInput.scrollHeight, 120) + 'px';
  });
  elements.clearChatBtn.addEventListener('click', clearChatHistory);
  elements.exportChatBtn.addEventListener('click', exportChat);
}

// App Initialization
function init() {
  setTheme(state.theme);
  populateSummaryChips();
  populateChatStarters();
  initEventListeners();
  checkBackendHealth();
  setInterval(checkBackendHealth, 15000); // Check server status periodically
}

document.addEventListener('DOMContentLoaded', init);
