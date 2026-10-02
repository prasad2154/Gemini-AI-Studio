# 🌌 Gemini AI Studio — Multimodal Intelligence Suite

An interactive, full-stack AI web application powered by **FastAPI** and **Google Gemini (`gemini-3.1-flash-lite`)**. The application offers an AI studio experience featuring neural text summarization, multimodal image vision analysis, and a contextual QA chatbot with a glassmorphic UI.

---

## 📸 Key Features

### 1. 📝 Neural Text Summarizer
- **Intelligent Synthesis**: Condense lengthy articles, meeting transcripts, or research papers into concise key takeaways.
- **Real-Time Text Metrics**: Live word count, character count, and estimated reading time.
- **Reduction Badge**: Instant calculation of compression ratio (e.g., `📉 68% condensed`).
- **Quick Presets**: 1-click preset topics (*Quantum Computing*, *Renewable Energy*, *Artificial Intelligence*).
- **Audio & Export**:
  - **Read Aloud**: Listen to summaries using the browser's native `SpeechSynthesis` Web Speech API.
  - **Copy to Clipboard**: Instant copy with visual feedback and toast notifications.
  - **Keyboard Shortcut**: `Ctrl + Enter` (or `Cmd + Enter`) to summarize.

### 2. 👁️ Image Vision Studio
- **Multimodal Context Inspection**: Upload images, diagrams, architectural charts, or screenshots for detailed visual analysis.
- **Drag & Drop Zone**: Drag files directly into the dropzone or **paste images straight from clipboard (`Ctrl + V`)**.
- **Live Preview & Metadata**: Real-time image rendering, filename, file size badge, and instant removal button.
- **High-Tech Laser Scanner**: Animated scanning laser effect across the image during active processing.
- **Preset Canvas Generators**: Built-in 1-click test graphics (*Neural Network Topology* and *Growth Trend Chart*).

### 3. 💬 Intelligent Chatbot (QA)
- **Conversational Interface**: Modern message bubbles with distinct avatars, timestamps, and formatting.
- **Typing Indicator**: Animated 3-dot thinking pulse while awaiting responses.
- **Quick Starters**: Curated sample prompts to jumpstart conversations.
- **Message Tools**: Individual copy and read-aloud buttons on every AI response.
- **Export & Reset**:
  - **Export to Markdown**: Download entire conversation history as a formatted `.md` file.
  - **Reset**: Clear conversation state with a single click.

### 4. 🎨 Design & Experience
- **Futuristic AI Studio Aesthetics**: Curated dark and light themes with glowing ambient radial mesh orbs.
- **Glassmorphism**: Translucent frosted-glass cards with subtle borders (`backdrop-filter: blur(20px)`).
- **Web Audio API Chimes**: Gentle synthesized audio chimes for user actions without external assets.
- **Live Health Status & Demo Mode**:
  - Pings the FastAPI backend every 15 seconds to display connection health (🟢 *Online* / 🟡 *Offline*).
  - Built-in **Interactive Demo Mode** allows testing all UI flows, animations, and simulated responses even when the backend is offline.
  - Custom API URL configuration modal.

---

## 📂 Project Structure

```plaintext
5_project/
├── backend/
│   ├── main.py              # FastAPI server with Gemini endpoints
│   ├── sample.py            # Minimal FastAPI sanity check
│   ├── test.py              # Standalone Gemini API test script
│   └── .env                 # Environment variables (API Key)
├── frontend/
│   ├── index.html           # Main semantic HTML structure
│   ├── style.css            # Modern glassmorphism CSS design system
│   └── app.js               # Frontend controller, state management, & Web APIs
├── venv/                    # Python virtual environment
└── README.md                # Project documentation
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | HTML5, Vanilla CSS3 (Glassmorphism, CSS Variables, Animations), Vanilla JavaScript (ES6+) |
| **Browser APIs** | Web Speech API (`SpeechSynthesis`), Web Audio API, Clipboard API, Drag and Drop API |
| **Backend** | Python 3.10+, FastAPI, Uvicorn (ASGI) |
| **Networking** | Requests, Python-Multipart, CORS Middleware |
| **AI Model** | Google Gemini (`gemini-3.1-flash-lite`) via Generative Language REST API |

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10 or higher
- A [Google AI Studio API Key](https://aistudio.google.com/)

### 2. Environment Setup

Clone or open the project folder in your terminal:

```bash
cd "d:\AI COURSE\G_38\5_project"
```

Activate the virtual environment:
- **Windows (PowerShell):**
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
- **Windows (CMD):**
  ```cmd
  venv\Scripts\activate.bat
  ```

Install required backend packages:
```bash
pip install fastapi uvicorn requests python-multipart
```

### 3. Configure Gemini API Key

Open or create `backend/.env` and specify your Gemini API key:
```env
GEMINI_API_KEY="YOUR_ACTUAL_GEMINI_API_KEY"
```

*(Alternatively, you can set it as a system environment variable before starting the server).*

---

## 🖥️ Running the Application

### Step 1: Start the FastAPI Backend
Open a terminal in the `backend` directory and launch Uvicorn:

```bash
cd backend
uvicorn main:app --reload --port 8000
```

The backend server will start at:
- **API URL**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`

### Step 2: Launch the Frontend
Open [`frontend/index.html`](frontend/index.html) in your browser:
- Double-click `frontend/index.html`, or
- Serve it using any local static file server:
  ```bash
  cd frontend
  python -m http.server 3000
  ```
  Then navigate to `http://localhost:3000` in your web browser.

---

## 📡 API Endpoints Reference

The backend provides the following REST endpoints:

### `GET /`
Health check endpoint to verify backend status.
- **Response**:
  ```json
  { "message": "Welcome to the Gemini API Backend!" }
  ```

### `POST /summarize`
Summarizes an input paragraph.
- **Content-Type**: `multipart/form-data` or `application/x-www-form-urlencoded`
- **Parameters**:
  - `text` *(string, required)*: The text content to summarize.
- **Response**:
  ```json
  { "summary": "Concise summary generated by Gemini..." }
  ```

### `POST /explain-image`
Analyzes and explains uploaded images.
- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `file` *(UploadFile, required)*: Image binary (PNG, JPG, WEBP).
- **Response**:
  ```json
  { "explanation": "Detailed visual analysis generated by Gemini..." }
  ```

### `POST /chat`
Contextual QA chatbot interaction.
- **Content-Type**: `multipart/form-data` or `application/x-www-form-urlencoded`
- **Parameters**:
  - `message` *(string, required)*: User prompt. Sending `"quit"` or `"exit"` returns a session end notice.
- **Response**:
  ```json
  { "response": "Assistant response generated by Gemini..." }
  ```

---

## 💡 Tips & Keyboard Shortcuts

- **Ctrl + Enter**: Trigger summary generation from the text input field.
- **Ctrl + V**: Paste an image from your clipboard directly into Vision Studio.
- **Enter**: Send chat messages.
- **Shift + Enter**: Insert a new line in the chat input.
- **Interactive Demo Mode**: If working offline or demonstrating the UI without a live API key, open the **Settings (gear icon)** at the top right and toggle **Interactive Demo Mode** ON.

---

## 📄 License
This project is open-source and intended for educational and developmental purposes.
"# Gemini-AI-Studio" 
