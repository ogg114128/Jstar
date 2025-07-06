// inertia-slider.js

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.getElementById('inertia-carousel');

  // 克隆首尾实现无限环形滚动
  const originalSlides = Array.from(carousel.querySelectorAll('a'));
  const firstClone = originalSlides[0].cloneNode(true);
  const lastClone = originalSlides[originalSlides.length - 1].cloneNode(true);
  carousel.appendChild(firstClone);
  carousel.insertBefore(lastClone, originalSlides[0]);

  const slides = carousel.querySelectorAll('a');
  const slideCount = slides.length;
  const slideWidth = slides[1].offsetWidth + parseInt(getComputedStyle(carousel).gap || '16');

  let currentIndex = 1;
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;
  let autoScrollTimer = null;
  let momentumID = null;
  let velocity = 0;
  let lastX = 0;
  let lastTime = 0;

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  carousel.scrollLeft = slideWidth * currentIndex;

  function updateSlideFocus(index) {
    slides.forEach((slide, i) => {
      if (i === index) {
        slide.style.filter = 'brightness(1) saturate(1)';
        slide.style.transform = 'scale(1)';
        slide.style.transition = 'filter 0.5s ease, transform 0.5s ease';
        slide.style.zIndex = '10';
      } else {
        slide.style.filter = 'brightness(0.6) saturate(0.6)';
        slide.style.transform = 'scale(0.9)';
        slide.style.transition = 'filter 0.5s ease, transform 0.5s ease';
        slide.style.zIndex = '1';
      }
    });
  }

  function goToSlide(index) {
    currentIndex = index;
    carousel.scrollTo({
      left: slideWidth * index,
      behavior: 'smooth'
    });
    updateSlideFocus(index);
  }

  function startAutoScroll() {
    if (autoScrollTimer) clearInterval(autoScrollTimer);
    autoScrollTimer = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, 4000);
  }

  function stopAutoScroll() {
    if (autoScrollTimer) {
      clearInterval(autoScrollTimer);
      autoScrollTimer = null;
    }
  }

  // ========= Touch 逻辑 =========
  if (isTouchDevice) {
    carousel.style.scrollBehavior = 'auto';
    carousel.style.overflow = 'hidden';

    carousel.addEventListener('touchstart', (e) => {
      stopAutoScroll();
      isDown = true;
      startX = e.touches[0].pageX - carousel.offsetLeft;
      scrollLeft = carousel.scrollLeft;
      lastX = e.touches[0].pageX;
      lastTime = Date.now();
      velocity = 0;
    });

    carousel.addEventListener('touchmove', (e) => {
      if (!isDown) return;
      const x = e.touches[0].pageX - carousel.offsetLeft;
      const walk = startX - x;
      carousel.scrollLeft = scrollLeft + walk;

      const now = Date.now();
      const dt = now - lastTime;
      if (dt > 0) {
        velocity = (lastX - e.touches[0].pageX) / dt;
        lastX = e.touches[0].pageX;
        lastTime = now;
      }
    });

    carousel.addEventListener('touchend', () => {
      isDown = false;
      applyMomentum(velocity);
      startAutoScroll();
    });

    function applyMomentum(initialVelocity) {
      let v = initialVelocity * 1000;
      const decay = 0.95;
      const minVelocity = 10;
      cancelAnimationFrame(momentumID);

      function step() {
        if (Math.abs(v) < minVelocity) {
          snapToNearest();
          return;
        }
        carousel.scrollLeft += v / 60;
        v *= decay;
        checkLoop();
        momentumID = requestAnimationFrame(step);
      }
      step();
    }

    function snapToNearest() {
      const index = Math.round(carousel.scrollLeft / slideWidth);
      goToSlide(index);
    }
  }

  // ========= PC逻辑 =========
  else {
    carousel.style.scrollBehavior = 'smooth';
    carousel.style.overflow = 'hidden';
    updateSlideFocus(currentIndex);
    startAutoScroll();

    carousel.addEventListener('mouseenter', stopAutoScroll);
    carousel.addEventListener('mouseleave', startAutoScroll);
  }

  // ========= 通用环状检测逻辑 =========
  carousel.addEventListener('scroll', () => {
    if (carousel.scrollLeft <= 0) {
      carousel.scrollLeft = slideWidth * (slideCount - 2);
      currentIndex = slideCount - 2;
    } else if (carousel.scrollLeft >= slideWidth * (slideCount - 1)) {
      carousel.scrollLeft = slideWidth;
      currentIndex = 1;
    } else {
      currentIndex = Math.round(carousel.scrollLeft / slideWidth);
    }
    updateSlideFocus(currentIndex);
  });

  // ========= 隐藏滚动条 =========
  carousel.style.scrollbarWidth = 'none';
  carousel.style.msOverflowStyle = 'none';
  carousel.style.overflow = 'hidden';
  carousel.classList.add('hide-scrollbar');

  const style = document.createElement('style');
  style.innerHTML = `
    #inertia-carousel::-webkit-scrollbar {
      display: none;
    }
  `;
  document.head.appendChild(style);
});
