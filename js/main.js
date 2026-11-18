/**
 * NexusAI Core UI Controller
 * Handles custom difference cursor (lerp 0.15, scale 2.5x),
 * fullscreen navigation overlay, toast notification system, and scroll reveals.
 */
(function () {
  'use strict';

  // 1. Toast Notification System
  const toastContainer = document.getElementById('toast-container');
  function showToast(message) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast-card';
    toast.innerHTML = '<span>●</span><span>' + message + '</span>';
    toastContainer.appendChild(toast);
    
    requestAnimationFrame(function () {
      toast.classList.add('is-visible');
    });

    setTimeout(function () {
      toast.classList.remove('is-visible');
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 500);
    }, 4000);
  }
  window.NexusShowToast = showToast;

  // 2. Custom Difference Cursor with LERP
  const cursor = document.getElementById('custom-cursor');
  const circle = cursor ? cursor.querySelector('.cursor-circle') : null;
  let mouseX = -100;
  let mouseY = -100;
  let cursorX = -100;
  let cursorY = -100;
  const lerp = 0.15;
  let cursorActive = false;

  if (cursor && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    window.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!cursorActive) {
        cursorX = mouseX;
        cursorY = mouseY;
        cursorActive = true;
        cursor.style.opacity = '1';
      }
    });

    document.addEventListener('mouseleave', function () {
      cursor.style.opacity = '0';
    });

    document.addEventListener('mouseenter', function () {
      if (cursorActive) cursor.style.opacity = '1';
    });

    function animateCursor() {
      if (cursorActive) {
        cursorX += (mouseX - cursorX) * lerp;
        cursorY += (mouseY - cursorY) * lerp;
        cursor.style.transform = 'translate3d(' + (cursorX - 16) + 'px, ' + (cursorY - 16) + 'px, 0)';
      }
      requestAnimationFrame(animateCursor);
    }
    requestAnimationFrame(animateCursor);

    // Hover scale to 2.5x on a, button, or [data-hover]
    document.addEventListener('mouseover', function (e) {
      if (e.target && e.target.closest('a, button, [data-hover]')) {
        circle.classList.add('is-hovered');
      }
    });

    document.addEventListener('mouseout', function (e) {
      if (e.target && e.target.closest('a, button, [data-hover]')) {
        circle.classList.remove('is-hovered');
      }
    });
  }

  // 3. Header & Navigation Overlay
  const menuBtn = document.getElementById('menu-btn');
  const navOverlay = document.getElementById('nav-overlay');
  const navLinks = document.querySelectorAll('.nav-menu-link');

  function openMenu() {
    menuBtn.classList.add('is-active');
    menuBtn.setAttribute('aria-expanded', 'true');
    navOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menuBtn.classList.remove('is-active');
    menuBtn.setAttribute('aria-expanded', 'false');
    navOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  if (menuBtn && navOverlay) {
    menuBtn.addEventListener('click', function () {
      if (navOverlay.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (navOverlay.classList.contains('is-open')) closeMenu();
        if (window.NexusCloseModal) window.NexusCloseModal();
      }
    });

    navLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        const targetId = link.getAttribute('href');
        closeMenu();
        if (targetId && targetId.startsWith('#') && targetId.length > 1) {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });
  }

  // 4. Scroll reveals with IntersectionObserver
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
        }
      });
    }, {
      threshold: 0.15
    });

    document.querySelectorAll('.reveal-headline, .reveal-fade').forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal-headline, .reveal-fade').forEach(function (el) {
      el.classList.add('is-revealed');
    });
  }
})();
