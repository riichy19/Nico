const invite = document.getElementById("invite");
const openButton = document.getElementById("open-invite");
const progressBar = document.getElementById("progress-bar");
const toast = document.getElementById("toast");
const balloonLayer = document.getElementById("balloon-layer");
const sparkleLayer = document.getElementById("sparkle-layer");
const inviteSection = document.getElementById("invitacion");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxClose = document.getElementById("lightbox-close");
const inviteAudio = new Audio("audio/gt.mpeg");
const audioState = {
  hasStarted: false,
  isStarting: false,
};

const navLinks = Array.from(document.querySelectorAll("[data-nav]"));
const sections = Array.from(document.querySelectorAll("[data-section]"));

const countdownEls = {
  days: document.querySelector("[data-count=\"days\"]"),
  hours: document.querySelector("[data-count=\"hours\"]"),
  minutes: document.querySelector("[data-count=\"minutes\"]"),
  seconds: document.querySelector("[data-count=\"seconds\"]"),
};

const targetDate = new Date("2026-02-28T15:00:00");

const showToast = (message) => {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast._timer);
  showToast._timer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
};

const updateProgress = () => {
  if (!progressBar) return;
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = `${Math.min(progress, 100)}%`;
};

const updateCountdown = () => {
  if (!countdownEls.days) return;
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  const total = Math.max(diff, 0);

  const seconds = Math.floor(total / 1000) % 60;
  const minutes = Math.floor(total / (1000 * 60)) % 60;
  const hours = Math.floor(total / (1000 * 60 * 60)) % 24;
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  countdownEls.days.textContent = days.toString();
  countdownEls.hours.textContent = hours.toString().padStart(2, "0");
  countdownEls.minutes.textContent = minutes.toString().padStart(2, "0");
  countdownEls.seconds.textContent = seconds.toString().padStart(2, "0");
};

const setActiveNav = (id) => {
  navLinks.forEach((link) => {
    const isActive = link.dataset.nav === id;
    link.classList.toggle("active", isActive);
  });
};

const initReveal = () => {
  const revealEls = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  revealEls.forEach((el) => observer.observe(el));
};

const initNavObserver = () => {
  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveNav(entry.target.id);
        }
      });
    },
    { rootMargin: "-10% 0px -60% 0px" }
  );

  sections.forEach((section) => observer.observe(section));
};

const initCopyButtons = () => {
  const copyButtons = document.querySelectorAll("[data-copy]");
  copyButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const text = button.getAttribute("data-copy");
      if (!text) return;

      try {
        await navigator.clipboard.writeText(text);
        showToast("Datos copiados");
      } catch (error) {
        showToast("No se pudo copiar");
      }
    });
  });
};

const initLightbox = () => {
  const trigger = document.querySelector(".invite-image-btn");
  if (!trigger || !lightbox || !lightboxImage) return;

  const img = trigger.querySelector("img");
  const src = img?.getAttribute("src");

  const open = () => {
    if (!src) return;
    lightboxImage.src = src;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  };

  const close = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  trigger.addEventListener("click", open);
  lightboxClose?.addEventListener("click", close);

  const backdrop = lightbox.querySelector("[data-close=\"lightbox\"]");
  backdrop?.addEventListener("click", close);

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      close();
    }
  });
};

const startInviteAudio = async () => {
  if (audioState.hasStarted || audioState.isStarting) return;
  audioState.isStarting = true;

  const targetTime = 5;
  const startVolume = 0.05;
  const fadeDuration = 9000;

  inviteAudio.preload = "auto";
  inviteAudio.volume = startVolume;

  const applyStartTime = () => {
    try {
      if (inviteAudio.currentTime < targetTime) {
        inviteAudio.currentTime = targetTime;
      }
    } catch (error) {
      // Some browsers block seeking before metadata is ready.
    }
  };

  if (inviteAudio.readyState >= 1) {
    applyStartTime();
  } else {
    inviteAudio.addEventListener("loadedmetadata", applyStartTime, { once: true });
  }

  try {
    await inviteAudio.play();
    const start = window.performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / fadeDuration, 1);
      inviteAudio.volume = startVolume + (1 - startVolume) * progress;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
    audioState.hasStarted = true;
  } catch (error) {
    audioState.hasStarted = false;
  } finally {
    audioState.isStarting = false;
  }
};

const initBalloons = () => {
  if (!balloonLayer) return;
  const balloonCount = window.innerWidth < 640 ? 8 : 14;
  const palette = ["rgba(62, 141, 205, 1)", "rgba(92, 167, 225, 0.91)", "rgba(130, 197, 235, 0.93)"];

  balloonLayer.innerHTML = "";

  for (let i = 0; i < balloonCount; i += 1) {
    const balloon = document.createElement("span");
    balloon.className = "balloon";
    const left = Math.random() * 100;
    const size = 60 + Math.random() * 50;
    const duration = 16 + Math.random() * 10;
    const delay = Math.random() * -20;
    const offset = Math.random() * 30 - 15;
    const color = palette[i % palette.length];

    balloon.style.left = `${left}%`;
    balloon.style.setProperty("--balloon-size", `${size}px`);
    balloon.style.setProperty("--balloon-duration", `${duration}s`);
    balloon.style.setProperty("--balloon-offset", `${offset}px`);
    balloon.style.background = `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.4) 45%, ${color} 100%)`;
    balloon.style.animationDelay = `${delay}s`;

    balloonLayer.appendChild(balloon);
  }
};

const initSparkles = () => {
  if (!sparkleLayer) return;
  const sparkleCount = window.innerWidth < 640 ? 46 : 78;
  sparkleLayer.innerHTML = "";

  for (let i = 0; i < sparkleCount; i += 1) {
    const sparkle = document.createElement("span");
    sparkle.className = "sparkle";
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const size = 5 + Math.random() * 5;
    const duration = 2.3 + Math.random() * 3.2;
    const delay = Math.random() * -5;

    sparkle.style.left = `${left}%`;
    sparkle.style.top = `${top}%`;
    sparkle.style.setProperty("--sparkle-size", `${size}px`);
    sparkle.style.setProperty("--sparkle-duration", `${duration}s`);
    sparkle.style.animationDelay = `${delay}s`;

    sparkleLayer.appendChild(sparkle);
  }
};

const handleResize = () => {
  initBalloons();
  initSparkles();
};

openButton?.addEventListener("click", () => {
  startInviteAudio();
  document.body.classList.add("is-open");
  invite?.classList.remove("is-closed");
  inviteSection?.scrollIntoView({ behavior: "smooth", block: "start" });
});

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", handleResize);

updateCountdown();
setInterval(updateCountdown, 1000);
updateProgress();
initReveal();
initNavObserver();
initCopyButtons();
initBalloons();
initSparkles();
initLightbox();
