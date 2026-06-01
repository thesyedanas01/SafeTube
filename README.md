# SafeTube AI

SafeTube is an AI-powered Chrome extension designed to evaluate YouTube videos for child safety in real-time. By utilizing the advanced Multimodal capabilities of Google's Gemini 2.5 Flash, the extension analyzes both visual content (video frames) and textual metadata (video title) to generate a comprehensive risk profile and an accurate Age Rating.

This was built as an end-to-end full-stack application demonstrating seamless integration between a browser extension, a Python backend, and state-of-the-art Generative AI.

##  Features

- **Multimodal AI Analysis:** Captures and sends 10 precisely extracted video frames along with metadata to Gemini 1.5 Flash, combining visual context with textual context.
- **Accurate Risk Profiling:** Scores the video from 0% to 100% across 6 critical safety categories:
  - Violence
  - Profanity
  - Sexual Content
  - Drugs
  - Hate Speech
  - Scary/Horror Content
- **Educational Scoring:** Evaluates the educational value of a video to help parents make informed decisions.
- **AI Summary:** Provides a natural language explanation of *why* the video received its specific age rating based on the detected visual and textual elements.
- **Clean, Modern UI:** Built with React and TailwindCSS for a native, snappy, professional look.

##  Architecture

The project is split into two main components:

1. **Frontend (Chrome Extension):**
   - Built with **React**, **TypeScript**, and **Vite**.
   - **Content Script:** Injected into YouTube to securely extract the video element, calculate duration, and silently capture 10 evenly spaced base64 image frames from the HTML5 canvas without interrupting playback.
   - **Popup UI:** A beautifully designed interface using **TailwindCSS** that communicates with the backend via the extension's background service worker.

2. **Backend (FastAPI Server):**
   - Built with **Python 3**, **FastAPI**, and **SQLAlchemy** (async SQLite).
   - **AI Engine:** Uses the `google-generativeai` SDK to prompt **Gemini 1.5 Flash**. The backend constructs a highly engineered prompt, enforcing a strict JSON schema output to guarantee parsable, deterministic safety scores.
   - **Database:** Asynchronously stores the analysis history so users can review previously analyzed videos in their dashboard.

##  Installation & Setup

### 1. Start the Backend

1. Navigate to the `backend/` directory.
2. Create a virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate  # On Windows
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the `backend/` directory and add your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
5. Run the server:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

### 2. Build the Extension

1. Navigate to the `extension/` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the extension for production:
   ```bash
   npm run build
   ```
   *This will generate a `dist/` folder.*

### 3. Load into Chrome

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (toggle in the top right corner).
3. Click **Load unpacked** and select the `extension/dist/` folder.
4. Navigate to any YouTube video and click the SafeTube icon in your toolbar to begin analysis!

##  Screenshots

*(Take a screenshot of the popup running on a YouTube video and place it in this folder, then link it here! Example: `![Screenshot of SafeTube](screenshot.png)`)*
