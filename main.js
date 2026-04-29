// TODO: replace with your Google Places API key
const GOOGLE_API_KEY = "PLACEHOLDER_API_KEY";
// TODO: replace with your Google Place ID
const GOOGLE_PLACE_ID = "PLACEHOLDER_PLACE_ID";

const PLACEHOLDER_REVIEWS = [
  {
    rating: 5,
    text: "Muy buen trato, rápidos y claros con el presupuesto. Salí con el coche perfecto y sin sorpresas.",
    author: "María G.",
    relativeDate: "hace 2 semanas"
  },
  {
    rating: 5,
    text: "Llevé el coche por una avería eléctrica y dieron con el problema enseguida. Muy recomendables.",
    author: "Carlos P.",
    relativeDate: "hace 1 mes"
  },
  {
    rating: 4,
    text: "Servicio cercano, explican todo bien y cumplen con los tiempos. Repetiré para el mantenimiento.",
    author: "Ana R.",
    relativeDate: "hace 1 mes"
  },
  {
    rating: 5,
    text: "Buen taller en Aldaia. Me revisaron los frenos y el coche quedó listo el mismo día.",
    author: "Sergio T.",
    relativeDate: "hace 2 meses"
  },
  {
    rating: 5,
    text: "Atención muy profesional y precio razonable. Da gusto encontrar un taller así de cercano.",
    author: "Lucía M.",
    relativeDate: "hace 3 meses"
  }
];

const FALLBACK_IMAGE = "taller.jpg";

function createStars(rating = 5) {
  const safeRating = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  return `${"★".repeat(safeRating)}${"☆".repeat(5 - safeRating)}`;
}

function sanitizeReview(review) {
  return {
    rating: Number(review.rating) || 5,
    text:
      review.text?.text ||
      review.text ||
      "Opinión disponible próximamente. Estamos terminando de conectar esta sección.",
    author:
      review.authorAttribution?.displayName ||
      review.author ||
      "Cliente de Taller Ruta 66",
    relativeDate:
      review.relativePublishTimeDescription ||
      review.relativeDate ||
      "Recientemente"
  };
}

function renderReviews(reviews, rating, userRatingCount) {
  const reviewsGrid = document.getElementById("reviews-grid");
  const ratingValue = document.getElementById("rating-value");
  const ratingCount = document.getElementById("rating-count");

  if (!reviewsGrid || !ratingValue || !ratingCount) {
    return;
  }

  reviewsGrid.innerHTML = "";

  reviews.slice(0, 5).map(sanitizeReview).forEach((review) => {
    const article = document.createElement("article");
    article.className = "review-card";
    article.innerHTML = `
      <div class="review-stars" aria-label="${review.rating} de 5 estrellas">${createStars(review.rating)}</div>
      <p>${review.text}</p>
      <div class="review-meta">
        <span class="review-author">${review.author}</span>
        <span class="review-date">${review.relativeDate}</span>
      </div>
    `;
    reviewsGrid.appendChild(article);
  });

  const safeRating = Number(rating || 4.9);
  const hasCount = typeof userRatingCount === "number" || /^\+?\d+/.test(String(userRatingCount || ""));

  ratingValue.textContent = safeRating.toLocaleString("es-ES", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });
  ratingCount.textContent = hasCount
    ? String(userRatingCount)
    : "+50";
}

async function fetchGoogleReviews(apiKey, placeId) {
  const normalizedPlaceId = String(placeId).replace(/^places\//, "");
  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(normalizedPlaceId)}?fields=reviews,rating,userRatingCount&key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Google Places request failed with status ${response.status}`);
  }

  const data = await response.json();
  const reviews = Array.isArray(data.reviews) ? data.reviews : [];

  if (!reviews.length) {
    throw new Error("No reviews returned by Google Places");
  }

  return {
    reviews,
    rating: data.rating,
    userRatingCount: data.userRatingCount
  };
}

function getFallbackReviews() {
  return {
    reviews: PLACEHOLDER_REVIEWS,
    rating: 4.9,
    userRatingCount: "+50"
  };
}

function initMobileMenu() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".nav-menu");
  const menuLinks = document.querySelectorAll(".nav-menu a");

  if (!toggle || !menu) {
    return;
  }

  const closeMenu = () => {
    toggle.setAttribute("aria-expanded", "false");
    menu.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };

  toggle.addEventListener("click", () => {
    const willOpen = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(willOpen));
    menu.classList.toggle("is-open", willOpen);
    document.body.classList.toggle("menu-open", willOpen);
  });

  menuLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 900) {
      closeMenu();
    }
  });
}

function initSmoothScrollOffset() {
  const header = document.querySelector(".site-header");
  const links = document.querySelectorAll('a[href^="#"]');

  if (!header || !links.length) {
    return;
  }

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") {
        return;
      }

      const targetElement = document.querySelector(targetId);

      if (!targetElement) {
        return;
      }

      event.preventDefault();

      const headerHeight = header.offsetHeight;
      const top = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight + 2;

      window.scrollTo({
        top,
        behavior: "smooth"
      });
    });
  });
}

function initLightbox() {
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const closeButton = document.querySelector(".lightbox-close");
  const galleryButtons = document.querySelectorAll(".gallery-item");

  if (!lightbox || !lightboxImage || !lightboxCaption || !closeButton || !galleryButtons.length) {
    return;
  }

  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    lightboxImage.src = "";
    lightboxImage.alt = "";
    lightboxCaption.textContent = "";
  };

  galleryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const image = button.dataset.image;
      const caption = button.dataset.caption || "Imagen de Taller Ruta 66";
      const preview = button.querySelector("img");
      const source = preview?.currentSrc || image || FALLBACK_IMAGE;
      const alt = preview?.alt || caption;

      lightboxImage.src = source;
      lightboxImage.alt = alt;
      lightboxCaption.textContent = caption;
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("lightbox-open");
    });
  });

  closeButton.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
      closeLightbox();
    }
  });
}

function initImageFallbacks() {
  const trackedImages = document.querySelectorAll("img");

  const applyFallback = (image) => {
    const parentButton = image.closest(".gallery-item");

    if (image.dataset.failed === "true") {
      return;
    }

    image.dataset.failed = "true";

    if (image.getAttribute("src") !== FALLBACK_IMAGE) {
      image.src = FALLBACK_IMAGE;
    }

    image.classList.add("is-fallback");
    image.parentElement?.classList.add("is-fallback");
    if (parentButton) {
      parentButton.dataset.image = FALLBACK_IMAGE;
    }
  };

  trackedImages.forEach((image) => {
    image.addEventListener(
      "error",
      () => applyFallback(image),
      { once: true }
    );

    if (image.complete && image.naturalWidth === 0) {
      applyFallback(image);
    }
  });
}

async function initReviews() {
  try {
    if (
      !GOOGLE_API_KEY ||
      !GOOGLE_PLACE_ID ||
      GOOGLE_API_KEY.includes("PLACEHOLDER") ||
      GOOGLE_PLACE_ID.includes("PLACEHOLDER")
    ) {
      throw new Error("Missing Google Places credentials");
    }

    const data = await fetchGoogleReviews(GOOGLE_API_KEY, GOOGLE_PLACE_ID);
    renderReviews(data.reviews, data.rating, data.userRatingCount);
  } catch (error) {
    console.warn("Using placeholder reviews.", error);
    const fallback = getFallbackReviews();
    renderReviews(fallback.reviews, fallback.rating, fallback.userRatingCount);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initSmoothScrollOffset();
  initLightbox();
  initImageFallbacks();
  initReviews();
});
