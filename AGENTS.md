# Project Rules: Faceless Shorts Workspace

This workspace (`e:\YT`) is dedicated to creating narrated faceless vertical shorts using the **`faceless-shorts`** skill.

- **Installed Workspace Skill**: `.agents/skills/faceless-shorts/SKILL.md` (source archive unzipped at `faceless-shorts/`).
- **Always-Active Requirement**: On every video or shorts task in this workspace, read `.agents/skills/faceless-shorts/SKILL.md` and the selected style's `styles/<style>/STYLE.md` in full before planning or editing code. If a new style is added, keep `faceless-shorts/` and `.agents/skills/faceless-shorts/` in sync.

## Core Principles (Never Violate)
1. **100% Code, Local, Free**: All visuals, timing, audio, and renders are generated locally via HTML5 Canvas / Three.js, headless Chrome (`tools/capture.mjs`), ffmpeg, local Kokoro-82M TTS (`scripts/voice.py`), local Whisper word alignment (`scripts/words.py`), and numpy/scipy synthesis (`tools/mix.py`). Never generate AI images/video, spend user money/credits, or require paid APIs.
2. **Originality & Accuracy**: Never copy another creator's script, shots, or frames. Verify facts against reliable sources and record them in `script.json` `"sources"`. No gore or medical misinformation.
3. **Never Ship Uninspected Frames**: Never present a video without rendering and visually inspecting `review/all.jpg` (`node tools/capture.mjs sheet`) and key full-size frames (`node tools/capture.mjs frames`).
4. **Never Clobber User Work**: Never overwrite an existing video project without asking; never upload to YouTube or any external host without explicit user request and confirmation.

## The Six Styles (9:16 Vertical, 1080×1920)
- **`deep-dive`** (Deep Dive 3D — flagship): 3D stylized people in sunlit sets → cyan x-ray body → macro blood/organ interiors, shallow DOF, 24 fps, `am_michael`, 30–45 s.
- **`night-file`** (Night File 3D): dark 3D spaces with one light cone, faceless rim-lit witnesses + solid-red glowing subject, typewriter dates & evidence inserts, `am_onyx` ×0.95, `"tension"` music, 30–45 s.
- **`inside-out`** (Inside Out): flat 2D shapes, cyan x-ray views, bold 1–3 word captions with one yellow keyword, 30 fps, `am_michael`, 25–40 s.
- **`stick-story`** (Stick Story): ink-black stick figures with expressive white eyes, day/night rooms (`glow: true` at night), gold numbered step cards, `am_puck`, 30–45 s.
- **`paper-atlas`** (Paper Atlas): cut-paper history on aged parchment with edges/shadows, crimson routes, gold date ribbons, `bm_george`, 30–45 s.
- **`tall-tale`** (Tall Tale 3D): flat 2D `Toon` cutouts facing camera in sunny 3D worlds, one-word captions, `am_michael` ×1.05, `"bounce"` music, 40–60 s.

## Mandatory Production Pipeline
1. **First-Time Machine Setup**: Ensure Node 22+, ffmpeg/ffprobe, Chrome, and `~/.faceless-shorts/venv` + Kokoro/Whisper models pass `setup.sh` ("All set") and `selftest.sh` ("SELFTEST PASSED").
2. **Intake (1 concise message)**: Ask only what is unknown (topic or 3 ideas, optional style/reference, length, voice, voiceover mode [AI / own recording / captions-only], music, end line/handle).
3. **Plan (1 screen, then wait for "Build it?")**: Title, conversational sentence-grouped narration split into cut lines with `caps` chunks, shot list mapped to lines/words, any new kit components, and sources.
4. **Build**:
   - Scaffold via `new_video.sh <style> <short-name>` (optionally `--dir` if placing under a chosen folder).
   - Write `script.json` (spell numbers as spoken; split sentences across 1–3 cut lines).
   - Run `voice.py` + `words.py` (or `words.py --audio` / `estimate.py`).
   - Author `src/shots.js` (pure function of time `draw(lt, d, t)` using `cut(i)` and `Wd('word', line)`) and reusable `src/core/kit.js` parts.
   - Run `node tools/capture.mjs check` (`CHECK OK`) → `node tools/capture.mjs cues` → `scripts/py tools/mix.py .`.
5. **QA & Render**: Inspect contact sheet + full frames for visual mode consistency (whole x-ray body except head), prop attachment, cause-before-effect, caption/face collision avoidance (caption zone `y 1250–1550`), palette compliance, and clean audio mix; then render final MP4 via `node tools/capture.mjs video`.

## Windows Execution Notes (`e:\YT`)
- Always run `.sh` scripts and `scripts/py` with Git Bash (`"C:\Program Files\Git\bin\bash.exe"`), not bare `bash` in PowerShell (which invokes WSL `C:\Windows\System32\bash.exe`).
- If rendering 3D styles without hardware GPU acceleration, use `SOFTWARE_GL=1 QS='&res=0.6&aa=0&shadow=1024' FPS=24` and inform the user of render duration up front.
