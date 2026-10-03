// Lightbox pro fotoalba: klik na fotku ji otevře přes celou obrazovku.
// Ovládání: šipky / tlačítka ‹ › = další a předchozí, Esc / × / klik vedle = zavřít,
// na mobilu přejetí prstem doleva a doprava.
// Bez JavaScriptu odkaz u fotky prostě otevře velkou verzi obrázku.
(function () {
  var links = Array.prototype.slice.call(document.querySelectorAll(".photo-link"));
  if (!links.length || typeof HTMLDialogElement !== "function") return;

  var style = document.createElement("style");
  style.textContent =
    ".photo-link { display: block; cursor: zoom-in; }" +
    ".photo-link:hover .photo-image { opacity: 0.9; }" +
    ".lightbox { width: 100%; height: 100%; max-width: none; max-height: none; margin: 0;" +
    "  padding: 0; border: 0; background: rgba(0, 0, 0, 0.94); color: #fff; overflow: hidden; }" +
    ".lightbox::backdrop { background: rgba(0, 0, 0, 0.94); }" +
    ".lightbox-stage { position: absolute; inset: 3.5rem 0 4rem; display: flex;" +
    "  align-items: center; justify-content: center; touch-action: pan-y; }" +
    ".lightbox-image { max-width: calc(100% - 2rem); max-height: 100%; object-fit: contain;" +
    "  user-select: none; -webkit-user-drag: none; transition: opacity 0.2s ease; }" +
    ".lightbox-image.is-loading { opacity: 0.3; }" +
    ".lightbox button { position: absolute; background: none; border: 0; color: #fff;" +
    "  font-family: inherit; cursor: pointer; opacity: 0.75; transition: opacity 0.2s ease; }" +
    ".lightbox button:hover, .lightbox button:focus-visible { opacity: 1; }" +
    ".lightbox button:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }" +
    ".lightbox-close { top: 0.5rem; right: 0.75rem; font-size: 2.5rem; line-height: 1; padding: 0.25rem 0.75rem; }" +
    ".lightbox-prev, .lightbox-next { top: 50%; transform: translateY(-50%);" +
    "  font-size: 3.5rem; line-height: 1; padding: 1rem 0.75rem; }" +
    ".lightbox-prev { left: 0.25rem; }" +
    ".lightbox-next { right: 0.25rem; }" +
    ".lightbox-counter { position: absolute; top: 1.1rem; left: 1.25rem; font-size: 0.875rem;" +
    "  letter-spacing: 0.1em; font-family: monospace; opacity: 0.75; }" +
    ".lightbox-caption { position: absolute; bottom: 1.25rem; left: 1rem; right: 1rem;" +
    "  text-align: center; font-size: 0.95rem; opacity: 0.8; }" +
    "@media (max-width: 639px) { .lightbox-prev, .lightbox-next { font-size: 2.5rem; padding: 0.75rem 0.5rem; } }";
  document.head.appendChild(style);

  var dialog = document.createElement("dialog");
  dialog.className = "lightbox";
  dialog.setAttribute("aria-label", "Prohlížeč fotografií");
  dialog.innerHTML =
    '<span class="lightbox-counter" aria-live="polite"></span>' +
    '<button type="button" class="lightbox-close" aria-label="Zavřít">&times;</button>' +
    '<div class="lightbox-stage"><img class="lightbox-image" alt="" /></div>' +
    '<button type="button" class="lightbox-prev" aria-label="Předchozí fotografie">&lsaquo;</button>' +
    '<button type="button" class="lightbox-next" aria-label="Další fotografie">&rsaquo;</button>' +
    '<p class="lightbox-caption"></p>';
  document.body.appendChild(dialog);

  var image = dialog.querySelector(".lightbox-image");
  var stage = dialog.querySelector(".lightbox-stage");
  var counter = dialog.querySelector(".lightbox-counter");
  var caption = dialog.querySelector(".lightbox-caption");
  var current = 0;
  var lastFocused = null;

  function preload(index) {
    var img = new Image();
    img.src = links[(index + links.length) % links.length].href;
  }

  function show(index) {
    current = (index + links.length) % links.length;
    var link = links[current];
    var thumb = link.querySelector("img");
    var figcaption = link.closest("figure") && link.closest("figure").querySelector("figcaption");

    image.classList.add("is-loading");
    image.onload = function () { image.classList.remove("is-loading"); };
    image.src = link.href;
    image.alt = thumb ? thumb.alt : "";
    counter.textContent = current + 1 + " / " + links.length;
    caption.textContent = figcaption ? figcaption.textContent : "";

    preload(current + 1);
    preload(current - 1);
  }

  function open(index) {
    lastFocused = document.activeElement;
    show(index);
    dialog.showModal();
    document.body.style.overflow = "hidden";
  }

  function close() {
    dialog.close();
  }

  dialog.addEventListener("close", function () {
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  });

  links.forEach(function (link, index) {
    link.addEventListener("click", function (event) {
      // Ctrl/Cmd+klik nechá prohlížeč otevřít fotku v nové záložce.
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0) return;
      event.preventDefault();
      open(index);
    });
  });

  dialog.querySelector(".lightbox-close").addEventListener("click", close);
  dialog.querySelector(".lightbox-prev").addEventListener("click", function () { show(current - 1); });
  dialog.querySelector(".lightbox-next").addEventListener("click", function () { show(current + 1); });

  // Klik mimo fotku (na tmavé pozadí) lightbox zavře.
  dialog.addEventListener("click", function (event) {
    if (event.target === stage || event.target === dialog) close();
  });

  dialog.addEventListener("keydown", function (event) {
    if (event.key === "ArrowRight") show(current + 1);
    else if (event.key === "ArrowLeft") show(current - 1);
  });

  // Přejetí prstem na mobilu.
  var touchX = null;
  var touchY = null;
  stage.addEventListener("touchstart", function (event) {
    touchX = event.touches[0].clientX;
    touchY = event.touches[0].clientY;
  }, { passive: true });
  stage.addEventListener("touchend", function (event) {
    if (touchX === null) return;
    var dx = event.changedTouches[0].clientX - touchX;
    var dy = event.changedTouches[0].clientY - touchY;
    touchX = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(current + (dx < 0 ? 1 : -1));
  });
})();
