const grid = document.querySelector(".hero-grid");

if (grid && window.matchMedia("(pointer: fine)").matches) {
  window.addEventListener("pointermove", (event) => {
    const x = `${(event.clientX / window.innerWidth) * 100}%`;
    const y = `${(event.clientY / window.innerHeight) * 100}%`;
    grid.style.setProperty("--x", x);
    grid.style.setProperty("--y", y);
  });
}

const year = document.querySelector("[data-year]");

if (year) {
  year.textContent = new Date().getFullYear();
}

const roleProps = document.querySelectorAll(".role-prop");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

roleProps.forEach((prop) => {
  prop.addEventListener("click", (event) => {
    if (reduceMotion || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    prop.classList.remove("is-moving");
    void prop.offsetWidth;
    prop.classList.add("is-moving");
    window.setTimeout(() => window.location.assign(prop.href), 260);
  });

  prop.addEventListener("animationend", () => {
    prop.classList.remove("is-moving");
  });
});

const touchMotion = window.matchMedia("(hover: none), (pointer: coarse)").matches;
const lifeTool = document.querySelector(".life-tool-button");

if (roleProps.length && touchMotion && !reduceMotion) {
  let motionFrame = 0;

  const updateScrollMotion = () => {
    const viewportMiddle = window.innerHeight / 2;

    roleProps.forEach((prop, index) => {
      const box = prop.getBoundingClientRect();
      const propMiddle = box.top + box.height / 2;
      const distance = Math.max(-1, Math.min(1, (viewportMiddle - propMiddle) / viewportMiddle));
      const direction = index % 2 === 0 ? 1 : -1;
      prop.style.setProperty("--scroll-y", "0px");
      prop.style.setProperty("--scroll-rotate", `${distance * 3 * direction}deg`);
    });

    motionFrame = 0;
  };

  const requestScrollMotion = () => {
    if (!motionFrame) motionFrame = window.requestAnimationFrame(updateScrollMotion);
  };

  updateScrollMotion();
  window.addEventListener("scroll", requestScrollMotion, { passive: true });
  window.addEventListener("resize", requestScrollMotion);
}

if (lifeTool && touchMotion && !reduceMotion) {
  let lifeToolFrame = 0;

  const updateLifeToolMotion = () => {
    const box = lifeTool.getBoundingClientRect();
    const viewportMiddle = window.innerHeight / 2;
    const toolMiddle = box.top + box.height / 2;
    const distance = Math.max(-1, Math.min(1, (viewportMiddle - toolMiddle) / viewportMiddle));
    lifeTool.style.setProperty("--knife-y", `${distance * 10}px`);
    lifeTool.style.setProperty("--knife-rotate", `${distance * 3}deg`);
    lifeToolFrame = 0;
  };

  const requestLifeToolMotion = () => {
    if (!lifeToolFrame) lifeToolFrame = window.requestAnimationFrame(updateLifeToolMotion);
  };

  updateLifeToolMotion();
  window.addEventListener("scroll", requestLifeToolMotion, { passive: true });
  window.addEventListener("resize", requestLifeToolMotion);
}

const lifeDialog = document.querySelector(".life-dialog");

if (lifeTool && lifeDialog) {
  const lifeDialogClose = lifeDialog.querySelector(".life-dialog-close");

  const closeLifeDialog = () => lifeDialog.close();

  lifeTool.addEventListener("click", () => lifeDialog.showModal());
  lifeDialogClose.addEventListener("click", closeLifeDialog);
  lifeDialog.addEventListener("click", (event) => {
    if (event.target === lifeDialog) closeLifeDialog();
  });
}

const caseRoute = document.querySelector(".case-route");
const projectSwitcher = document.querySelector(".project-switcher");

if (projectSwitcher) {
  const activeProject = projectSwitcher.querySelector('[aria-current="page"]');

  const alignActiveProject = () => {
    if (!activeProject || projectSwitcher.scrollWidth <= projectSwitcher.clientWidth) return;
    const centered = activeProject.offsetLeft - (projectSwitcher.clientWidth - activeProject.offsetWidth) / 2;
    projectSwitcher.scrollLeft = Math.max(0, centered);
  };

  alignActiveProject();
  window.addEventListener("load", alignActiveProject, { once: true });
}

if (caseRoute) {
  const generatedIds = (caseRoute.dataset.sections || "").split(" ").filter(Boolean);
  const generatedSections = document.querySelectorAll("main#story > .case-hero, main#story > .story");

  generatedSections.forEach((section, index) => {
    if (!section.id && generatedIds[index]) section.id = generatedIds[index];
  });

  const progress = caseRoute.querySelector(".case-reading-progress i");
  const sectionLinks = [...caseRoute.querySelectorAll('.case-route-links a[href^="#"]')];
  const sections = sectionLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const updateReadingState = () => {
    if (progress) {
      const available = document.documentElement.scrollHeight - window.innerHeight;
      const amount = available > 0 ? Math.min(window.scrollY / available, 1) : 0;
      progress.style.width = `${amount * 100}%`;
    }

    if (!sections.length) return;
    const marker = window.scrollY + 140;
    let current = sections[0];

    sections.forEach((section) => {
      if (section.offsetTop <= marker) current = section;
    });

    sectionLinks.forEach((link) => {
      if (link.getAttribute("href") === `#${current.id}`) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  updateReadingState();
  window.addEventListener("scroll", updateReadingState, { passive: true });
  window.addEventListener("resize", updateReadingState);
  window.addEventListener("load", () => {
    if (window.location.hash) {
      const requestedSection = document.querySelector(window.location.hash);
      if (requestedSection) requestedSection.scrollIntoView();
    }
    updateReadingState();
  });
}

const photoLightbox = document.querySelector(".photo-lightbox");

if (photoLightbox) {
  const photoButtons = [...document.querySelectorAll(".photo-open")];
  const lightboxImage = photoLightbox.querySelector(".photo-lightbox-image");
  const lightboxTitle = photoLightbox.querySelector("#photo-lightbox-title");
  const lightboxCount = photoLightbox.querySelector(".photo-lightbox-count");
  const closeButton = photoLightbox.querySelector(".photo-lightbox-close");
  const previousButton = photoLightbox.querySelector(".photo-lightbox-prev");
  const nextButton = photoLightbox.querySelector(".photo-lightbox-next");
  let activeIndex = 0;
  let opener = null;

  const showPhoto = (index) => {
    activeIndex = (index + photoButtons.length) % photoButtons.length;
    const button = photoButtons[activeIndex];
    const image = button.querySelector("img");
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt;
    lightboxTitle.textContent = button.dataset.title;
    lightboxCount.textContent = `${button.dataset.collection} · ${activeIndex + 1} / ${photoButtons.length}`;

    const nextImage = photoButtons[(activeIndex + 1) % photoButtons.length].querySelector("img");
    const previousImage = photoButtons[(activeIndex - 1 + photoButtons.length) % photoButtons.length].querySelector("img");
    [nextImage, previousImage].forEach((item) => {
      const preload = new Image();
      preload.src = item.currentSrc || item.src;
    });
  };

  const openPhoto = (index, button) => {
    opener = button;
    showPhoto(index);
    document.body.classList.add("has-lightbox");
    photoLightbox.showModal();
  };

  photoButtons.forEach((button, index) => {
    button.addEventListener("click", () => openPhoto(index, button));
  });

  previousButton.addEventListener("click", () => showPhoto(activeIndex - 1));
  nextButton.addEventListener("click", () => showPhoto(activeIndex + 1));
  closeButton.addEventListener("click", () => photoLightbox.close());

  photoLightbox.addEventListener("click", (event) => {
    if (event.target === photoLightbox) photoLightbox.close();
  });

  photoLightbox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPhoto(activeIndex - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      showPhoto(activeIndex + 1);
    }
  });

  photoLightbox.addEventListener("close", () => {
    document.body.classList.remove("has-lightbox");
    if (opener) opener.focus();
  });
}

// Teaching film: plays muted while on screen; sound restarts the story once.
const teachingFilm = document.querySelector("[data-teaching-film]");

if (teachingFilm) {
  const video = teachingFilm.querySelector("video");
  const playButton = teachingFilm.querySelector("[data-film-play]");
  const soundButton = teachingFilm.querySelector("[data-film-sound]");
  const icons = {
    play: '<path fill="currentColor" d="M8 5l11 7-11 7z"/>',
    pause: '<path fill="currentColor" d="M7 5h4v14H7zM13 5h4v14h-4z"/>',
    soundOn: '<path fill="currentColor" d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    soundOff: '<path fill="currentColor" d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  };
  let userPaused = reduceMotion;
  let heardFromStart = false;

  const setButton = (button, icon, label) => {
    button.querySelector("svg").innerHTML = icon;
    button.querySelector("span").textContent = label;
  };
  const syncPlay = () => setButton(playButton, video.paused ? icons.play : icons.pause, video.paused ? "Play" : "Pause");
  const syncSound = () => {
    soundButton.setAttribute("aria-pressed", String(!video.muted));
    setButton(soundButton, video.muted ? icons.soundOff : icons.soundOn, video.muted ? "Tap for sound" : "Sound on");
  };
  const tryPlay = () => video.play().catch(() => {}).finally(syncPlay);

  video.muted = true; // browsers only autoplay muted video

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !userPaused) tryPlay();
      else if (!entry.isIntersecting && !video.paused) video.pause();
    }, { threshold: 0.35 }).observe(video);
  } else if (!reduceMotion) {
    tryPlay();
  }

  playButton.addEventListener("click", () => {
    userPaused = !video.paused;
    if (userPaused) video.pause();
    else tryPlay();
  });

  soundButton.addEventListener("click", () => {
    video.muted = !video.muted;
    if (!video.muted) {
      video.volume = 1;
      if (!heardFromStart) {
        heardFromStart = true;
        video.currentTime = 0;
      }
      userPaused = false;
      tryPlay();
    }
    syncSound();
  });

  video.addEventListener("play", syncPlay);
  video.addEventListener("pause", syncPlay);
  syncPlay();
  syncSound();
}

// Teaching storybook: each click turns to the next two-page spread.
const storybook = document.querySelector("[data-storybook]");

if (storybook) {
  const spreads = Array.from(storybook.querySelectorAll("[data-story-spread]"));
  const previousButton = storybook.querySelector("[data-story-prev]");
  const nextButton = storybook.querySelector("[data-story-next]");
  const status = storybook.querySelector("[data-story-status]");
  let activeSpread = 0;
  let isTurning = false;

  const updateStorybook = () => {
    spreads.forEach((spread, index) => {
      const isActive = index === activeSpread;
      spread.hidden = !isActive;
      spread.classList.toggle("is-active", isActive);
      spread.setAttribute("aria-hidden", String(!isActive));
    });

    previousButton.disabled = activeSpread === 0;
    nextButton.disabled = activeSpread === spreads.length - 1;
    const firstPage = (activeSpread * 2) + 1;
    status.textContent = `Pages ${firstPage} and ${firstPage + 1} of ${spreads.length * 2}`;
  };

  const turnTo = (nextSpread, direction) => {
    if (isTurning || nextSpread < 0 || nextSpread >= spreads.length || nextSpread === activeSpread) return;
    isTurning = true;
    const oldSpread = spreads[activeSpread];
    const turnClass = direction === "back" ? "is-turning-back" : "is-turning-forward";
    const boundaryFocus = (
      nextSpread === spreads.length - 1 && document.activeElement === nextButton
    ) ? previousButton : (
      nextSpread === 0 && document.activeElement === previousButton
    ) ? nextButton : null;

    const showNextSpread = () => {
      activeSpread = nextSpread;
      updateStorybook();
      if (boundaryFocus) boundaryFocus.focus();
    };

    if (reduceMotion) {
      showNextSpread();
      isTurning = false;
      return;
    }

    oldSpread.classList.add(turnClass);
    window.setTimeout(() => {
      oldSpread.classList.remove(turnClass);
      showNextSpread();
      const newSpread = spreads[activeSpread];
      newSpread.classList.add(turnClass);
      window.setTimeout(() => {
        newSpread.classList.remove(turnClass);
        isTurning = false;
      }, 440);
    }, 220);
  };

  previousButton.addEventListener("click", () => turnTo(activeSpread - 1, "back"));
  nextButton.addEventListener("click", () => turnTo(activeSpread + 1, "forward"));

  storybook.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      turnTo(activeSpread - 1, "back");
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      turnTo(activeSpread + 1, "forward");
    }
  });

  updateStorybook();
}
