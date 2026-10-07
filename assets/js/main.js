(function () {
  "use strict";

  var header = document.getElementById("header");
  var navbar = document.getElementById("navbar");
  var navToggle = document.querySelector(".nav-toggle");

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      navbar.classList.toggle("open");
    });
  }

  var navLinks = navbar ? navbar.querySelectorAll("a") : [];
  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      navbar.classList.remove("open");
    });
  });

  if (header) {
    var onScroll = function () {
      if (window.scrollY > 60) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    };
    window.addEventListener("scroll", onScroll);
    onScroll();
  }

  var backTop = document.querySelector(".back-to-top");
  if (backTop) {
    var toggleBackTop = function () {
      if (window.scrollY > 320) {
        backTop.classList.add("show");
      } else {
        backTop.classList.remove("show");
      }
    };
    window.addEventListener("scroll", toggleBackTop);
    toggleBackTop();
    backTop.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  var fadeEls = document.querySelectorAll(".fade-up");
  if ("IntersectionObserver" in window && fadeEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    fadeEls.forEach(function (el) { io.observe(el); });
  } else {
    fadeEls.forEach(function (el) { el.classList.add("visible"); });
  }

  var cookieBar = document.getElementById("cookies-msg");
  if (cookieBar) {
    var acceptBtn = document.getElementById("cookies-aceitar");
    if (localStorage.getItem("levafacil_cookies") === "aceito") {
      cookieBar.remove();
    } else {
      cookieBar.classList.add("show");
      if (acceptBtn) {
        acceptBtn.addEventListener("click", function () {
          localStorage.setItem("levafacil_cookies", "aceito");
          cookieBar.remove();
        });
      }
    }
  }
})();
