/* ====================================================
   BOOT SEQUENCE
==================================================== */
const bootLines = [
  { text: "BOOTING SECURE PROFILE KERNEL v3.2.0 ...", cls: "" },
  { text: "LOADING IDENTITY MODULE ............... [ OK ]", cls: "line-ok" },
  { text: "MOUNTING DOSSIER: MIYAMOTO_MASAMUNE.DAT", cls: "" },
  { text: "VERIFYING AFFILIATION: NIHON UNIV / CMS .. [ OK ]", cls: "line-ok" },
  { text: "SCANNING RESEARCH FOCUS .................. CYBERSEC / NATSEC / DEFENSE", cls: "line-dim" },
  { text: "ESTABLISHING SECURE CHANNEL ............. [ OK ]", cls: "line-ok" },
  { text: "DECRYPTING PERSONAL DATA ................. 02005Y-08M-02D", cls: "line-dim" },
  { text: "CLEARANCE CHECK ........................... LEVEL 03 GRANTED", cls: "line-ok" },
  { text: "INTEGRITY CHECK ........................... NO THREATS DETECTED", cls: "line-ok" },
  { text: "WELCOME, OPERATOR MASAMUNE.", cls: "" },
  { text: "> ACCESS GRANTED_", cls: "line-ok" },
];

const bootLogEl = document.getElementById("boot-log");
const bootBarFill = document.getElementById("boot-bar-fill");
const bootPercent = document.getElementById("boot-percent");
const bootScreen = document.getElementById("boot-screen");
const mainWrap = document.getElementById("main-wrap");
const skipBtn = document.getElementById("skip-boot");

let bootFinished = false;

function finishBoot(){
  if (bootFinished) return;
  bootFinished = true;
  bootScreen.classList.add("hide");
  bootScreen.setAttribute("aria-hidden", "true");
  mainWrap.classList.add("show");
  mainWrap.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "auto";
  startUptimeCounter();
}

function runBoot(){
  document.body.style.overflow = "hidden";
  let lineIndex = 0;
  let charIndex = 0;
  let progress = 0;

  function typeNextChar(){
    if (lineIndex >= bootLines.length){
      bootPercent.textContent = "100%";
      bootBarFill.style.width = "100%";
      setTimeout(finishBoot, 500);
      return;
    }

    const current = bootLines[lineIndex];

    if (charIndex === 0){
      const span = document.createElement("div");
      span.className = current.cls;
      span.id = "active-line";
      bootLogEl.appendChild(span);
    }

    const activeLine = document.getElementById("active-line");

    if (charIndex < current.text.length){
      activeLine.textContent = current.text.slice(0, charIndex + 1);
      charIndex++;
      progress = ((lineIndex + charIndex / current.text.length) / bootLines.length) * 100;
      bootBarFill.style.width = progress + "%";
      bootPercent.textContent = Math.floor(progress) + "%";
      setTimeout(typeNextChar, 14 + Math.random() * 18);
    } else {
      activeLine.removeAttribute("id");
      lineIndex++;
      charIndex = 0;
      setTimeout(typeNextChar, 90);
    }
  }

  typeNextChar();
}

skipBtn.addEventListener("click", finishBoot);
window.addEventListener("load", () => {
  setTimeout(runBoot, 200);
});

// セーフティ：何らかの理由で進行が止まった場合、5秒で強制的に進める
setTimeout(() => {
  if (!bootFinished) finishBoot();
}, 6000);

/* ====================================================
   CLOCK / AGE / UPTIME
==================================================== */
const clockTimeEl = document.getElementById("clock-time");
const clockDateEl = document.getElementById("clock-date");
const ageDisplayEl = document.getElementById("age-display");
const ageInlineEl = document.getElementById("age-inline");
const ageMetaEl = document.getElementById("age-meta");

const BIRTH_DATE = new Date(2005, 7, 2); // 月は0始まりなので 7 = 8月

function pad(n){ return String(n).padStart(2, "0"); }

function calcAge(now){
  let age = now.getFullYear() - BIRTH_DATE.getFullYear();
  const hasHadBirthdayThisYear =
    now.getMonth() > BIRTH_DATE.getMonth() ||
    (now.getMonth() === BIRTH_DATE.getMonth() && now.getDate() >= BIRTH_DATE.getDate());
  if (!hasHadBirthdayThisYear) age--;
  return age;
}

function updateClock(){
  const now = new Date();
  const h = pad(now.getHours());
  const m = pad(now.getMinutes());
  const s = pad(now.getSeconds());
  clockTimeEl.textContent = `${h}:${m}:${s}`;

  const y = now.getFullYear();
  const mo = pad(now.getMonth() + 1);
  const d = pad(now.getDate());
  clockDateEl.textContent = `${y}/${mo}/${d}`;

  const age = calcAge(now);
  if (ageDisplayEl) ageDisplayEl.textContent = age;
  if (ageInlineEl) ageInlineEl.textContent = age;
  if (ageMetaEl) ageMetaEl.textContent = age;
}

updateClock();
setInterval(updateClock, 1000);

/* UPTIME: ページを開いてからの経過時間（演出用） */
const uptimeEl = document.getElementById("uptime");
let uptimeSeconds = 0;
function startUptimeCounter(){
  setInterval(() => {
    uptimeSeconds++;
    const h = pad(Math.floor(uptimeSeconds / 3600));
    const m = pad(Math.floor((uptimeSeconds % 3600) / 60));
    const s = pad(uptimeSeconds % 60);
    uptimeEl.textContent = `${h}:${m}:${s}`;
  }, 1000);
}

/* ====================================================
   NETWORK NODE BACKGROUND (canvas)
==================================================== */
const canvas = document.getElementById("net-bg");
const ctx = canvas.getContext("2d");

let nodes = [];
let w, h;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function resizeCanvas(){
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}

function initNodes(){
  const count = Math.min(70, Math.floor((w * h) / 22000));
  nodes = Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
    r: Math.random() * 1.6 + 0.6,
  }));
}

function drawFrame(){
  ctx.clearRect(0, 0, w, h);

  // 接続線
  for (let i = 0; i < nodes.length; i++){
    for (let j = i + 1; j < nodes.length; j++){
      const a = nodes[i], b = nodes[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 140;
      if (dist < maxDist){
        const opacity = (1 - dist / maxDist) * 0.18;
        ctx.strokeStyle = `rgba(0, 217, 255, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  // ノード
  for (const n of nodes){
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(127, 255, 212, 0.55)";
    ctx.shadowColor = "rgba(0, 217, 255, 0.8)";
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.shadowBlur = 0;

    if (!prefersReducedMotion){
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    }
  }

  requestAnimationFrame(drawFrame);
}

function setupCanvas(){
  resizeCanvas();
  initNodes();
}

setupCanvas();
requestAnimationFrame(drawFrame);

window.addEventListener("resize", () => {
  setupCanvas();
});

/* ====================================================
   SCROLL REVEAL (パネル類のフェードイン)
==================================================== */
const revealTargets = document.querySelectorAll(".panel, .focus-card, .hobby-block");
revealTargets.forEach((el) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(16px)";
  el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting){
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealTargets.forEach((el) => observer.observe(el));
