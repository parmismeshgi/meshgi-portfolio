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
