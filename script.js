function setYear() {
  const el = document.getElementById("year");
  if (!el) return;
  el.textContent = String(new Date().getFullYear());
}

function setupMobileMenu() {
  const btn = document.querySelector(".menu-btn");
  const mobile = document.querySelector(".mobile-nav");
  if (!(btn instanceof HTMLButtonElement) || !(mobile instanceof HTMLElement)) return;

  const setOpen = (open) => {
    btn.setAttribute("aria-expanded", String(open));
    mobile.hidden = !open;
    document.documentElement.style.scrollbarGutter = open ? "stable" : "";
  };

  setOpen(false);

  btn.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") === "true";
    setOpen(!open);
  });

  mobile.addEventListener("click", (e) => {
    const target = e.target;
    if (target instanceof HTMLAnchorElement) setOpen(false);
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) setOpen(false);
  });
}

function setupAvatarFallback() {
  const img = document.querySelector("[data-avatar-img]");
  if (!(img instanceof HTMLImageElement)) return;
  const avatar = img.closest(".avatar");
  if (!(avatar instanceof HTMLElement)) return;

  const markLoaded = () => avatar.classList.add("has-photo");
  const markError = () => {
    // если файла нет — прячем блок полностью
    avatar.style.display = "none";
  };

  if (img.complete && img.naturalWidth > 0) markLoaded();
  img.addEventListener("load", markLoaded, { once: true });
  img.addEventListener("error", markError, { once: true });
}

function setupBookingFormFallback() {
  const form = document.querySelector("[data-booking-form]");
  const status = document.querySelector("[data-form-status]");
  if (!(form instanceof HTMLFormElement) || !(status instanceof HTMLElement)) return;

  const getAction = () => String(form.getAttribute("action") || "").trim();

  const submitBtn = form.querySelector('button[type="submit"]');
  const setBusy = (busy) => {
    if (submitBtn instanceof HTMLButtonElement) submitBtn.disabled = busy;
    form.setAttribute("aria-busy", String(busy));
  };

  async function submitToFormspree(action) {
    const fd = new FormData(form);
    // Formspree лучше “понимает” адрес для ответа, если передать его как _replyto
    const email = String(fd.get("email") || "").trim();
    if (email && !fd.has("_replyto")) fd.append("_replyto", email);

    const res = await fetch(action, {
      method: "POST",
      body: fd,
      headers: { Accept: "application/json" },
    });

    if (res.ok) return { ok: true };

    try {
      const data = await res.json();
      const msg =
        (Array.isArray(data?.errors) && data.errors[0]?.message) ||
        data?.error ||
        "Не удалось отправить заявку. Попробуйте ещё раз.";
      return { ok: false, message: msg };
    } catch {
      return { ok: false, message: "Не удалось отправить заявку. Попробуйте ещё раз." };
    }
  }

  form.addEventListener("submit", (e) => {
    const action = getAction();

    const isFormspree = action.includes("formspree.io/f/") && !action.includes("YOUR_FORM_ID");
    const isFallback = !isFormspree;

    // Мы всегда берём управление отправкой, чтобы:
    // - для Formspree показывать “Спасибо” без перезагрузки
    // - для fallback не открывать Mail случайно, когда сервис уже подключён
    e.preventDefault();
    status.textContent = "Отправляю…";
    setBusy(true);

    if (isFormspree) {
      submitToFormspree(action)
        .then((r) => {
          if (r.ok) {
            form.reset();
            status.textContent = "Спасибо! Заявка отправлена. Я отвечу вам в ближайшее время.";
          } else {
            status.textContent = r.message || "Не удалось отправить заявку. Попробуйте ещё раз.";
          }
        })
        .catch(() => {
          status.textContent = "Не удалось отправить заявку. Проверьте интернет и попробуйте ещё раз.";
        })
        .finally(() => setBusy(false));
      return;
    }

    // Fallback: сервис приёма заявок ещё не подключён — откроем mailto.

    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const format = String(fd.get("format") || "").trim();
    const mode = String(fd.get("mode") || "").trim();
    const message = String(fd.get("message") || "").trim();

    const subject = encodeURIComponent("Новая заявка на консультацию (с сайта)");
    const body = encodeURIComponent(
      [
        `Имя: ${name}`,
        email ? `Email: ${email}` : "",
        phone ? `Телефон: ${phone}` : "",
        `Формат: ${format}`,
        `Онлайн/очно: ${mode}`,
        message ? `Сообщение: ${message}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    );

    status.textContent =
      "Форма ещё не подключена к сервису приёма заявок — открою письмо в вашем почтовом приложении.";
    window.location.href = `mailto:arinashkapa@ya.ru?subject=${subject}&body=${body}`;
    setBusy(false);
  });
}

function setupImageFallbacks(root = document) {
  const imgs = Array.from(root.querySelectorAll("img[data-fallback-src]"));
  imgs.forEach((img) => {
    if (!(img instanceof HTMLImageElement)) return;
    const fallback = img.getAttribute("data-fallback-src");
    if (!fallback) return;
    img.addEventListener(
      "error",
      () => {
        img.src = fallback;
        img.removeAttribute("data-fallback-src");
      },
      { once: true },
    );
  });
}

function setupNotesNavigation() {
  const stage = document.querySelector("[data-notes-stage]");
  const prevBtn = document.querySelector("[data-notes-prev]");
  const nextBtn = document.querySelector("[data-notes-next]");
  const hint = document.querySelector("[data-notes-hint]");

  if (!(stage instanceof HTMLElement)) return;
  if (!(prevBtn instanceof HTMLButtonElement)) return;
  if (!(nextBtn instanceof HTMLButtonElement)) return;

  const templates = Array.from(document.querySelectorAll("template[data-notes-template]")).filter(
    (t) => t instanceof HTMLTemplateElement,
  );
  if (templates.length === 0) return;

  const sorted = templates
    .map((t) => ({
      el: t,
      idx: Number(t.getAttribute("data-notes-template") || "0"),
    }))
    .sort((a, b) => a.idx - b.idx)
    .map((x) => x.el);

  let index = 0;

  const updateControls = () => {
    prevBtn.disabled = index === 0;
    prevBtn.setAttribute("aria-disabled", String(prevBtn.disabled));

    nextBtn.disabled = index >= sorted.length - 1;
    nextBtn.setAttribute("aria-disabled", String(nextBtn.disabled));
    if (hint instanceof HTMLElement) hint.hidden = !nextBtn.disabled;
  };

  const render = (scroll = true) => {
    stage.innerHTML = "";
    stage.appendChild(sorted[index].content.cloneNode(true));
    setupImageFallbacks(stage);
    updateControls();
    if (scroll) stage.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  prevBtn.addEventListener("click", () => {
    if (index <= 0) return;
    index -= 1;
    render(true);
  });

  nextBtn.addEventListener("click", () => {
    if (index >= sorted.length - 1) return;
    index += 1;
    render(true);
  });

  // всегда начинаем с первой заметки при перезагрузке
  index = 0;
  render(false);
}

function setupToTop() {
  const link = document.querySelector('a.to-top[href="#top"]');
  if (!(link instanceof HTMLAnchorElement)) return;

  link.addEventListener("click", (e) => {
    // Фоллбек по href остаётся для случая без JS,
    // но с JS делаем надёжный скролл в самое начало страницы.
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    // также выставим хеш, чтобы работало как обычная ссылка (например, для истории/шеринга)
    if (location.hash !== "#top") history.replaceState(null, "", "#top");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setYear();
  setupMobileMenu();
  setupAvatarFallback();
  setupBookingFormFallback();
  setupImageFallbacks();
  setupNotesNavigation();
  setupToTop();
});

