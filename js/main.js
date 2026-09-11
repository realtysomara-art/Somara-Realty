/* =========================================================
   SOMARA REALTY — main.js
   Vanilla JS only — no build step, no dependencies.
   ========================================================= */
(function () {
  "use strict";

  /* -----------------------------------------------------
     Header: transparent only at the very top of the page.
     Solid as soon as any scrolling happens — same behavior
     on every page, whether or not it has a hero. A plain
     passive scroll listener is plenty cheap for a single
     threshold comparison; no throttling needed.
  ----------------------------------------------------- */
  function initHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;

    function update() {
      header.classList.toggle("is-solid", window.scrollY > 8);
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* -----------------------------------------------------
     Mobile menu
  ----------------------------------------------------- */
  function initMobileMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-menu");
    var closeBtn = document.querySelector(".mobile-menu-close");
    if (!toggle || !menu) return;

    function open() {
      menu.classList.add("is-open");
      document.body.style.overflow = "hidden";
      var firstLink = menu.querySelector("a");
      if (firstLink) firstLink.focus();
    }
    function close() {
      menu.classList.remove("is-open");
      document.body.style.overflow = "";
      toggle.focus();
    }

    toggle.addEventListener("click", open);
    if (closeBtn) closeBtn.addEventListener("click", close);
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", close);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) close();
    });
  }

  /* -----------------------------------------------------
     Property data — loaded from content/properties.json at
     runtime, which is exactly the file the admin panel
     (/admin) edits. Nothing here is hardcoded anymore.
  ----------------------------------------------------- */
  var PROPERTIES = [];

  /* -----------------------------------------------------
     Hero settings — also loaded from content/settings.json
     (edited via the "Site Settings" collection in /admin).
     Progressive enhancement only: the HTML already has real
     default text/media, so if this fetch fails, is slow, or
     a field is left blank in the CMS, the page never shows
     anything empty — it just quietly keeps the default.
  ----------------------------------------------------- */
  function loadHeroSettings() {
    fetch("/content/hero.json")
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to load settings.json");
        return res.json();
      })
      .then(function (s) {
        var line1 = document.getElementById("heroLine1");
        var line2 = document.getElementById("heroLine2");
        var subtext = document.getElementById("heroSubtext");
        var photo = document.getElementById("heroPhoto");
        var video = document.getElementById("heroVideo");

        if (s.heroLine1 && line1) line1.textContent = s.heroLine1;
        if (s.heroLine2 && line2) line2.textContent = s.heroLine2;
        if (s.heroSubtext && subtext) subtext.textContent = s.heroSubtext;

        if (s.heroVideo && video) {
          video.src = s.heroVideo;
          video.style.display = "block";
          if (photo) photo.style.display = "none";
        } else if (s.heroImage && photo) {
          photo.src = s.heroImage;
          photo.style.display = "block";
        }
      })
      .catch(function (err) {
        console.error(err);
        // Defaults already on screen — nothing further to do.
      });
  }

  /* -----------------------------------------------------
     Contact info — runs on every page, since email/WhatsApp/
     Instagram links appear in the footer everywhere, not
     just on the Contact page. Same safe pattern: only touches
     an element if both the field has a value AND that element
     exists on the current page.
  ----------------------------------------------------- */
  function loadContactInfo() {
    fetch("/content/contact-info.json")
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to load contact-info.json");
        return res.json();
      })
      .then(function (c) {
        // Footer + home-page CTA — always present, real default already
        // shown, so only touch it when a real value exists.
        if (c.email) {
          ["footerEmail", "contactEmail"].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) { el.href = "mailto:" + c.email; el.textContent = c.email; }
          });
          var ctaEmail = document.getElementById("ctaEmail");
          if (ctaEmail) ctaEmail.href = "mailto:" + c.email;
        }

        if (c.whatsapp) {
          var waUrl = "https://wa.me/" + c.whatsapp;
          var footerWa = document.getElementById("footerWhatsapp");
          if (footerWa) { footerWa.href = waUrl; footerWa.style.display = ""; }
          var contactWa = document.getElementById("contactWhatsapp");
          if (contactWa) { contactWa.href = waUrl; contactWa.textContent = "Message us on WhatsApp"; }
        }

        if (c.instagramUrl) {
          ["footerInstagram", "ctaInstagram"].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) { el.href = c.instagramUrl; el.style.display = ""; }
          });
        }

        if (c.phone) {
          var contactPhone = document.getElementById("contactPhone");
          if (contactPhone) { contactPhone.href = "tel:" + c.phone; contactPhone.textContent = c.phone; }
        }

        var addressEl = document.getElementById("contactAddress");
        if (addressEl && (c.addressLine1 || c.city)) {
          var line1 = [c.addressLine1, c.addressLine2].filter(Boolean).join(" ");
          var line2 = [c.city, c.country].filter(Boolean).join(", ");
          addressEl.innerHTML = (line1 ? line1 + "<br>" : "") + line2;
        }

        var mapWrap = document.getElementById("mapWrap");
        if (mapWrap && c.mapEmbedUrl) {
          mapWrap.innerHTML =
            '<iframe src="' + c.mapEmbedUrl + '" width="100%" height="100%" style="border:0;" ' +
            'loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Office location"></iframe>';
          mapWrap.classList.add("has-map");
        }
      })
      .catch(function (err) {
        console.error(err);
      });
  }

  /* -----------------------------------------------------
     About page content — only relevant on about.html.
     Same progressive-enhancement rule: blank/missing fields
     leave the existing default copy exactly as-is.
  ----------------------------------------------------- */
  function loadAboutContent() {
    fetch("/content/about-content.json")
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to load about-content.json");
        return res.json();
      })
      .then(function (a) {
        function setText(id, value) {
          var el = document.getElementById(id);
          if (el && value) el.textContent = value;
        }
        setText("aboutQuote", a.quoteHeading);
        setText("aboutStory", a.storyParagraph);
        setText("aboutPromise", a.promiseText);
        setText("aboutHowWeWork", a.howWeWorkText);

        var valuesGrid = document.getElementById("aboutValuesGrid");
        if (valuesGrid && Array.isArray(a.values) && a.values.length > 0) {
          valuesGrid.innerHTML = a.values
            .map(function (v) {
              return (
                '<div class="card-outlined"><h3>' + v.title + "</h3>" +
                '<p class="body-sm" style="margin-top:0.5rem">' + v.description + "</p></div>"
              );
            })
            .join("");
        }
      })
      .catch(function (err) {
        console.error(err);
      });
  }

  /* -----------------------------------------------------
     Category tiles (Buy / Rent / Off-Plan) — home page only.
  ----------------------------------------------------- */
  function loadCategoryTiles() {
    fetch("/content/categories.json")
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to load categories.json");
        return res.json();
      })
      .then(function (c) {
        function setText(id, value) {
          var el = document.getElementById(id);
          if (el && value) el.textContent = value;
        }
        setText("catBuyTitle", c.buyTitle);
        setText("catBuyDesc", c.buyDescription);
        setText("catRentTitle", c.rentTitle);
        setText("catRentDesc", c.rentDescription);
        setText("catOffPlanTitle", c.offPlanTitle);
        setText("catOffPlanDesc", c.offPlanDescription);
      })
      .catch(function (err) {
        console.error(err);
      });
  }

  /* -----------------------------------------------------
     Categories page (/categories/) — renders three filtered
     grids (Buy, Rent, Off-Plan) from the same property data.
  ----------------------------------------------------- */
  function initCategoriesPage() {
    loadProperties().then(function () {
      ["Buy", "Rent", "Off-Plan"].forEach(function (cat) {
        var gridId = "propertyGrid" + cat.replace("-", "");
        var filtered = PROPERTIES.filter(function (p) {
          return p.category === cat;
        });
        var grid = document.getElementById(gridId);
        if (!grid) return;
        if (filtered.length === 0) {
          grid.innerHTML = '<div class="empty-state"><p>No properties in this category yet.</p></div>';
          return;
        }
        grid.innerHTML = filtered.map(propertyCardHTML).join("");
        grid.querySelectorAll(".property-card").forEach(function (card) {
          card.addEventListener("click", function () {
            openModal(card.getAttribute("data-id"));
          });
          card.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openModal(card.getAttribute("data-id"));
            }
          });
        });
      });
    });
  }

  function loadProperties() {
    return fetch("/content/properties.json")
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to load properties.json");
        return res.json();
      })
      .then(function (data) {
        PROPERTIES = data.items || [];
      })
      .catch(function (err) {
        console.error(err);
        var grid = document.getElementById("propertyGrid");
        if (grid) {
          grid.innerHTML =
            '<div class="empty-state"><p>Properties could not be loaded. ' +
            "If you're viewing this file directly on your computer (a file:/// address), " +
            "open it through a local server or the live site instead — " +
            "browsers block this kind of file loading for local files.</p></div>";
        }
      });
  }

  var AED = new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  });

  function propertyCardHTML(p) {
    return (
      '<article class="card-outlined property-card" data-id="' +
      p.id +
      '" tabindex="0" role="button" aria-label="View details for ' +
      p.title +
      '">' +
      '<div class="property-media">' +
      (p.image ? '<img src="' + p.image + '" alt="" onerror="this.style.display=\'none\'" />' : "") +
      '<span class="property-badge">' +
      p.status +
      "</span>" +
      buildingIconSVG() +
      "</div>" +
      '<div class="property-body">' +
      "<h3>" +
      p.title +
      "</h3>" +
      '<p class="property-location">' +
      pinIconSVG() +
      p.location +
      "</p>" +
      '<p class="property-price">' +
      AED.format(p.price) +
      "</p>" +
      '<div class="property-meta"><span>' +
      p.bedrooms +
      " bed</span><span>" +
      p.bathrooms +
      " bath</span><span>" +
      p.area.toLocaleString() +
      " sq ft</span></div>" +
      "</div>" +
      "</article>"
    );
  }

  function buildingIconSVG() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><rect x="4" y="3" width="16" height="18"/><path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1"/></svg>';
  }
  function pinIconSVG() {
    return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true" style="flex-shrink:0"><path d="M12 22s7-7.58 7-13a7 7 0 1 0-14 0c0 5.42 7 13 7 13z"/><circle cx="12" cy="9" r="2.5"/></svg>';
  }

  function renderProperties(list, gridId) {
    gridId = gridId || "propertyGrid";
    var grid = document.getElementById(gridId);
    if (!grid) return;

    if (list.length === 0) {
      grid.innerHTML =
        '<div class="empty-state"><p>No properties match your current search.</p>' +
        '<button type="button" class="btn btn-outline" id="clearFiltersBtn-' + gridId + '">Clear filters</button></div>';
      var clearBtn = document.getElementById("clearFiltersBtn-" + gridId);
      if (clearBtn) {
        clearBtn.addEventListener("click", function () {
          var form = document.getElementById("heroSearchForm");
          if (form) form.reset();
          renderProperties(PROPERTIES, gridId);
        });
      }
      return;
    }

    grid.innerHTML = list.map(propertyCardHTML).join("");

    grid.querySelectorAll(".property-card").forEach(function (card) {
      card.addEventListener("click", function () {
        openModal(card.getAttribute("data-id"));
      });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openModal(card.getAttribute("data-id"));
        }
      });
    });
  }

  function initSearch() {
    var form = document.getElementById("heroSearchForm");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var location = document.getElementById("searchLocation").value;
      var type = document.getElementById("searchType").value;
      var budget = document.getElementById("searchBudget").value;

      var filtered = PROPERTIES.filter(function (p) {
        var matchLocation = !location || p.location === location;
        var matchType = !type || p.type === type;
        var matchBudget = !budget || p.budgetTier === budget;
        return matchLocation && matchType && matchBudget;
      });

      renderProperties(filtered);

      var target = document.getElementById("properties");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  /* -----------------------------------------------------
     Property detail modal
  ----------------------------------------------------- */
  function openModal(id) {
    var property = PROPERTIES.filter(function (p) {
      return p.id === id;
    })[0];
    if (!property) return;

    var overlay = document.getElementById("propertyModal");
    var content = document.getElementById("propertyModalContent");
    if (!overlay || !content) return;

    content.innerHTML =
      '<div class="modal-inner">' +
      '<button type="button" class="modal-close" id="modalCloseBtn" aria-label="Close">' +
      '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M1 1l14 14M15 1L1 15"/></svg>' +
      "</button>" +
      '<div class="modal-media">' +
      (property.image ? '<img src="' + property.image + '" alt="" onerror="this.style.display=\'none\'" />' : "") +
      buildingIconSVG() +
      "</div>" +
      '<div class="modal-body">' +
      '<span class="property-badge">' +
      property.status +
      "</span>" +
      "<h2 style=\"margin-top:0.9rem\">" +
      property.title +
      "</h2>" +
      '<p class="property-location" style="margin-top:0.5rem">' +
      pinIconSVG() +
      property.location +
      "</p>" +
      '<p class="property-price" style="margin-top:1rem">' +
      AED.format(property.price) +
      "</p>" +
      '<div class="property-meta" style="border-top:none;padding-top:0">' +
      "<span>" +
      property.bedrooms +
      " bed</span><span>" +
      property.bathrooms +
      " bath</span><span>" +
      property.area.toLocaleString() +
      " sq ft</span></div>" +
      '<p class="body-sm" style="margin-top:1.25rem">' +
      property.description +
      "</p>" +
      '<div class="modal-amenities">' +
      property.amenities.map(function (a) { return "<span>" + a + "</span>"; }).join("") +
      "</div>" +
      '<div class="modal-actions">' +
      '<a class="btn btn-primary" href="contact.html">Book a Consultation</a>' +
      '<a class="btn btn-outline" href="contact.html">Ask About This Property</a>' +
      "</div>" +
      "</div>" +
      "</div>";

    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";

    var closeBtn = document.getElementById("modalCloseBtn");
    if (closeBtn) closeBtn.focus();
    document.getElementById("modalCloseBtn").addEventListener("click", closeModal);
  }

  function closeModal() {
    var overlay = document.getElementById("propertyModal");
    if (!overlay) return;
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function initModal() {
    var overlay = document.getElementById("propertyModal");
    if (!overlay) return;
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("is-open")) closeModal();
    });
  }

  /* -----------------------------------------------------
     Contact / consultation form
     No backend is connected yet, so this builds a mailto:
     draft with the submitted details rather than pretending
     to send it somewhere — a real, working mechanism instead
     of a fake success message.
  ----------------------------------------------------- */
  function initContactForm() {
    var form = document.getElementById("consultationForm");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = document.getElementById("formStatus");

      var name = form.querySelector("#cf-name").value.trim();
      var contactInfo = form.querySelector("#cf-contact").value.trim();
      var message = form.querySelector("#cf-message").value.trim();

      if (!name || !contactInfo) {
        status.textContent = "Please fill in your name and email or phone.";
        status.className = "form-status is-visible error";
        return;
      }

      var subject = "Consultation Enquiry — " + name;
      var body =
        "Name: " + name + "\n" +
        "Contact: " + contactInfo + "\n" +
        "Message: " + (message || "-");

      var mailto =
        "mailto:hello@somararealty.com?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(body);

      window.location.href = mailto;

      status.textContent =
        "Opening your email client with this enquiry pre-filled — send it from there.";
      status.className = "form-status is-visible success";
      form.reset();
    });
  }

  /* -----------------------------------------------------
     Init
  ----------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initHeader();
    initMobileMenu();
    initModal();
    initContactForm();
    loadContactInfo();

    var yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Only the property grid depends on the fetched data — everything
    // else above is ready immediately.
    if (document.getElementById("propertyGrid")) {
      loadProperties().then(function () {
        renderProperties(PROPERTIES);
        initSearch();
      });
    }

    if (document.getElementById("heroLine1")) {
      loadHeroSettings();
    }

    if (document.getElementById("aboutQuote")) {
      loadAboutContent();
    }

    if (document.getElementById("catBuyTitle")) {
      loadCategoryTiles();
    }

    if (document.getElementById("propertyGridBuy")) {
      initCategoriesPage();
    }
  });
})();
