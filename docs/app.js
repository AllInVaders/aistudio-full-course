// ============================================================================
// Google AI Studio: Zero to Hero — Interactive Portal Logic (EN / ES)
// ============================================================================

(function () {
  const STORAGE_KEY_PROGRESS = "aistudio_course_completed_modules_v1";
  const STORAGE_KEY_LANG = "aistudio_course_lang_v1";
  const STORAGE_KEY_THEME = "aistudio_course_theme_v1";
  const GITHUB_BASE = "https://github.com/AllInVaders/aistudio-full-course/blob/main/";

  let currentLang = localStorage.getItem(STORAGE_KEY_LANG) || "en";
  let currentModuleIndex = 0;
  let completedModules = JSON.parse(localStorage.getItem(STORAGE_KEY_PROGRESS) || "[]");

  function saveProgress() {
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(completedModules));
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function toggleTheme() {
    const root = document.documentElement;
    const current = root.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem(STORAGE_KEY_THEME, next);
  }

  function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY_LANG, lang);
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });
    renderAll();
  }

  function toggleModuleCompletion(moduleId) {
    if (completedModules.includes(moduleId)) {
      completedModules = completedModules.filter((id) => id !== moduleId);
    } else {
      completedModules.push(moduleId);
    }
    saveProgress();
    renderAll();
  }

  function renderSidebar(data) {
    const total = data.modules.length;
    const doneCount = data.modules.filter((m) => completedModules.includes(m.id)).length;
    const pct = Math.round((doneCount / total) * 100);

    document.getElementById("brand-title").textContent = data.ui.courseTitle;
    document.getElementById("brand-subtitle").textContent = data.ui.courseSubtitle;
    document.getElementById("progress-label").textContent = data.ui.progressLabel;
    document.getElementById("progress-pct").textContent = `${pct}% (${doneCount}/${total})`;
    document.getElementById("progress-bar-fill").style.width = `${pct}%`;
    document.getElementById("curriculum-header").textContent = data.ui.curriculumHeader;

    const navList = document.getElementById("module-nav-list");
    navList.innerHTML = "";

    data.modules.forEach((mod, idx) => {
      const isDone = completedModules.includes(mod.id);
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.className = "module-nav-item" + (idx === currentModuleIndex ? " active" : "");
      btn.innerHTML = `
        <div>
          <span class="module-nav-tag">${mod.tag} · ${mod.readTime}</span>
          <div class="module-nav-title">${mod.title}</div>
        </div>
        <span class="check-pill ${isDone ? "done" : ""}">${isDone ? "✓" : "○"}</span>
      `;
      btn.addEventListener("click", () => {
        currentModuleIndex = idx;
        renderAll();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      li.appendChild(btn);
      navList.appendChild(li);
    });
  }

  function renderContent(data) {
    const mod = data.modules[currentModuleIndex];
    const isDone = completedModules.includes(mod.id);
    const pane = document.getElementById("content-pane");

    const archHtml = mod.archFlow
      .map(
        (step) => `
      <div class="arch-step">
        <div class="arch-step-num">${step.num}</div>
        <div class="arch-step-title">${step.title}</div>
        <div class="arch-step-desc">${step.desc}</div>
      </div>`
      )
      .join("");

    const sectionsHtml = mod.sections
      .map((sec) => {
        const paragraphs = (sec.body || []).map((p) => `<p>${p}</p>`).join("");
        const bullets = sec.bullets
          ? `<ul class="bullet-list">${sec.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>`
          : "";
        const codeBlock = sec.code
          ? `
          <div class="code-wrapper">
            <div class="code-header">
              <span>${sec.codeTitle || "example.py"}</span>
              <button class="copy-btn" data-code="${encodeURIComponent(sec.code)}">${data.ui.copyCode}</button>
            </div>
            <pre class="code-content"><code>${escapeHtml(sec.code)}</code></pre>
          </div>`
          : "";

        return `
        <div class="section-card">
          <h2 class="section-heading">${sec.heading}</h2>
          <div class="section-body">
            ${paragraphs}
            ${bullets}
            ${codeBlock}
          </div>
        </div>`;
      })
      .join("");

    const quizOptionsHtml = mod.quiz.options
      .map(
        (opt, i) =>
          `<button class="quiz-opt-btn" data-idx="${i}">${opt}</button>`
      )
      .join("");

    const refsHtml = mod.references
      .map(
        (ref) => `
      <a class="ref-card" href="${ref.url}" target="_blank" rel="noopener noreferrer">
        <div class="ref-title">${ref.title} ↗</div>
        <div class="ref-desc">${ref.desc}</div>
      </a>`
      )
      .join("");

    pane.innerHTML = `
      <div class="hero-banner">
        <div class="hero-eyebrow">${mod.eyebrow}</div>
        <h1 class="hero-title">${mod.title}</h1>
        <p class="hero-summary">${mod.summary}</p>
        <div class="hero-meta-row">
          <span class="meta-chip">⏱ ${mod.readTime}</span>
          <span class="meta-chip">📖 <a href="${GITHUB_BASE}${mod.mdPath}" target="_blank" rel="noopener">Full Markdown Guide ↗</a></span>
          <span class="meta-chip">🧪 <a href="${GITHUB_BASE}${mod.labPath}" target="_blank" rel="noopener">Runnable Code Lab ↗</a></span>
          <span class="meta-chip">📓 <a href="https://colab.research.google.com/github/AllInVaders/aistudio-full-course/blob/main/${mod.notebookPath}" target="_blank" rel="noopener">Open in Colab ↗</a></span>
        </div>
      </div>

      <div class="arch-flow">${archHtml}</div>

      ${sectionsHtml}

      <div class="section-card">
        <h2 class="section-heading">🧠 ${data.ui.quizHeader}</h2>
        <div class="quiz-box">
          <div class="quiz-question">${mod.quiz.question}</div>
          <div class="quiz-options">${quizOptionsHtml}</div>
          <div class="quiz-feedback" id="quiz-feedback"></div>
        </div>
      </div>

      <div class="section-card">
        <h2 class="section-heading">📚 ${data.ui.refsHeader}</h2>
        <div class="ref-grid">${refsHtml}</div>
      </div>

      <div class="module-footer-actions">
        <button class="icon-btn" id="prev-btn" ${currentModuleIndex === 0 ? "disabled style='opacity:0.4;pointer-events:none;'" : ""}>
          ${data.ui.prevModule}
        </button>

        <button class="${isDone ? "success-btn" : "primary-btn"}" id="complete-btn">
          ${isDone ? data.ui.completedBadge : data.ui.markComplete}
        </button>

        <button class="icon-btn" id="next-btn" ${currentModuleIndex === data.modules.length - 1 ? "disabled style='opacity:0.4;pointer-events:none;'" : ""}>
          ${data.ui.nextModule}
        </button>
      </div>
    `;

    // Attach copy handlers
    pane.querySelectorAll(".copy-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const raw = decodeURIComponent(btn.dataset.code);
        navigator.clipboard.writeText(raw);
        const orig = btn.textContent;
        btn.textContent = data.ui.copied;
        setTimeout(() => (btn.textContent = orig), 1600);
      });
    });

    // Attach quiz handlers
    const feedbackEl = document.getElementById("quiz-feedback");
    pane.querySelectorAll(".quiz-opt-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const chosen = Number(btn.dataset.idx);
        pane.querySelectorAll(".quiz-opt-btn").forEach((b) => {
          b.classList.remove("correct", "wrong");
        });
        if (chosen === mod.quiz.correctIndex) {
          btn.classList.add("correct");
          feedbackEl.style.display = "block";
          feedbackEl.style.background = "rgba(16, 185, 129, 0.14)";
          feedbackEl.style.border = "1px solid #10b981";
          feedbackEl.textContent = mod.quiz.explanation;
        } else {
          btn.classList.add("wrong");
          feedbackEl.style.display = "block";
          feedbackEl.style.background = "rgba(239, 68, 68, 0.12)";
          feedbackEl.style.border = "1px solid #ef4444";
          feedbackEl.textContent =
            currentLang === "es"
              ? "Inténtalo de nuevo: revisa la sección conceptual de este módulo."
              : "Try again — review the conceptual walkthrough above.";
        }
      });
    });

    // Attach footer navigation
    document.getElementById("complete-btn").addEventListener("click", () => {
      toggleModuleCompletion(mod.id);
    });
    const prevBtn = document.getElementById("prev-btn");
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (currentModuleIndex > 0) {
          currentModuleIndex--;
          renderAll();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    }
    const nextBtn = document.getElementById("next-btn");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (currentModuleIndex < data.modules.length - 1) {
          currentModuleIndex++;
          renderAll();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    }
  }

  function renderAll() {
    const data = window.COURSE_DATA[currentLang];
    renderSidebar(data);
    renderContent(data);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);

    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === currentLang);
      btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
    });

    document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
    renderAll();
  });
})();
