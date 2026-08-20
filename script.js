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
})();
