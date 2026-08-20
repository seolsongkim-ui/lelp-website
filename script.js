(function () {
  var STORAGE_KEY = "lelp_role";
  var body = document.body;
  var roleButtons = document.querySelectorAll("[data-role-btn]");

  function setRole(role, updateHash) {
    if (role !== "student" && role !== "volunteer") role = "student";
    body.setAttribute("data-role", role);
    roleButtons.forEach(function (btn) {
      var isActive = btn.getAttribute("data-role-btn") === role;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
    try {
      localStorage.setItem(STORAGE_KEY, role);
    } catch (e) {
      /* localStorage unavailable (e.g. sandboxed embed) — ignore */
    }
    // Only touch the URL hash on an explicit user toggle (updateHash !== false),
    // and only when it isn't already pointing at a real in-page anchor like
    // "#schedule" or "#apply" — otherwise we'd clobber a meaningful deep link.
    if (updateHash !== false && history.replaceState) {
      var currentHash = window.location.hash.replace("#", "");
      if (currentHash === "" || currentHash === "student" || currentHash === "volunteer") {
        history.replaceState(null, "", "#" + role);
      }
    }
  }

  roleButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setRole(btn.getAttribute("data-role-btn"));
    });
  });

  // initial role: URL hash > saved preference > default (student)
  var initial = "student";
  var rawHash = window.location.hash.replace("#", "");
  if (rawHash === "student" || rawHash === "volunteer") {
    initial = rawHash;
  } else {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "student" || saved === "volunteer") initial = saved;
    } catch (e) {
      /* ignore */
    }
  }
  // Don't touch history on the automatic initial call — preserve whatever
  // fragment (e.g. "#schedule", "#apply") brought the visitor to this page.
  setRole(initial, false);

  // Switching role can reflow the page (student/volunteer copy differs in
  // length), which can leave an anchor-linked page scrolled to the wrong
  // spot. Re-settle scroll to the real target anchor, if any, once layout
  // has stabilized post-role-switch.
  if (rawHash && rawHash !== "student" && rawHash !== "volunteer") {
    var anchorTarget = document.getElementById(rawHash);
    if (anchorTarget) {
      requestAnimationFrame(function () {
        anchorTarget.scrollIntoView({ block: "start" });
      });
    }
  }

  // highlight the current page in the header/mobile nav
  var currentFile = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav a, .mobile-nav a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href.indexOf("#apply") !== -1) return; // the persistent Apply CTA link, not a page nav item
    var linkFile = href.split("#")[0] || "index.html";
    if (linkFile === currentFile) a.classList.add("active");
  });

  // mobile nav toggle
  var navToggle = document.querySelector(".nav-toggle");
  var mobileNav = document.querySelector(".mobile-nav");
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mobileNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ---- sub-nav (index.html only): sticky offset + scroll-spy ----
  var subnav = document.querySelector(".subnav");
  if (subnav) {
    var siteHeader = document.querySelector(".site-header");
    var subnavLinks = subnav.querySelectorAll(".subnav-link");

    function updateHeaderOffset() {
      var headerH = siteHeader ? siteHeader.offsetHeight : 0;
      var subnavH = subnav.offsetHeight;
      document.documentElement.style.setProperty("--header-h", headerH + "px");
      // Extra 16px breathing room so a jumped-to section's heading isn't
      // flush against the sticky bars — this is what fixes "top gets cut off".
      document.documentElement.style.setProperty("--sticky-offset", headerH + subnavH + 16 + "px");
    }
    updateHeaderOffset();
    window.addEventListener("resize", updateHeaderOffset);
    // Role switch can reflow the header (different copy length) — resettle shortly after.
    roleButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        setTimeout(updateHeaderOffset, 50);
      });
    });

    var sections = [];
    subnavLinks.forEach(function (a) {
      var id = a.getAttribute("href").replace("#", "");
      var el = document.getElementById(id);
      if (el) sections.push({ id: id, el: el, link: a });
    });

    function setActiveTab(id) {
      subnavLinks.forEach(function (a) {
        a.classList.toggle("active", a.getAttribute("href") === "#" + id);
      });
    }

    if (sections.length && "IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) setActiveTab(entry.target.id);
          });
        },
        { rootMargin: "0px 0px -70% 0px" }
      );
      sections.forEach(function (s) {
        observer.observe(s.el);
      });
    }

    subnavLinks.forEach(function (a) {
      a.addEventListener("click", function () {
        setActiveTab(a.getAttribute("href").replace("#", ""));
      });
    });
  }
})();
