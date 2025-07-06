// inertia-slider.js

document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.getElementById('inertia-carousel');

  // 克隆首尾形成环状滚动
  const originalSlides = Array.from(carousel.querySelectorAll('a'));
  const firstClone = originalSlides[0].cloneNode(true);
  const lastClone = originalSlides[originalSlides.length - 1].cloneNode(true);
  carousel.appendChild(firstClone);
  carousel.insertBefore(lastClone, originalSlides[0]);

  const slides = carousel.querySelectorAll('a');
  const slideGap = parseInt(getComputedStyle(carousel).gap || '16');
  const slideWidth = slides[1].offsetWidth + slideGap;
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
  const centerOffset = (carousel.offsetWidth - slideWidth) / 2;

  // 初始化位置
  carousel.scrollLeft = slideWidth * currentIndex - centerOffset;

  // 禁止点击默认跳转行为
  slides.forEach(slide => {
    slide.addEventListener('click', e => e.preventDefault());
    slide.setAttribute('tabindex', '-1');
  });

  function updateSlideFocus(index) {
    slides.forEach((slide, i) => {
      if (i === index) {
        slide.style.filter = 'brightness(1) saturate(1)';
        slide.style.transform = 'scale(1)';
        slide.style.zIndex = '10';
      } else {
        slide.style.filter = 'brightness(0.6) saturate(0.6)';
        slide.style.transform = 'scale(0.9)';
        slide.style.zIndex = '1';
      }
      slide.style.transition = 'filter 0.5s ease, transform 0.5s ease';
    });
  }

  function goToSlide(index) {
    currentIndex = index;
    carousel.scrollTo({ left: slideWidth * index - centerOffset, behavior: 'smooth' });
    updateSlideFocus(index);
  }

  function startAutoScroll() {
    clearInterval(autoScrollTimer);
    autoScrollTimer = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, 4000);
  }

  function stopAutoScroll() {
    clearInterval(autoScrollTimer);
  }

  if (isTouchDevice) {
    carousel.style.scrollBehavior = 'auto';
    carousel.style.overflowX = 'scroll';

    carousel.addEventListener('touchstart', (e) => {
      stopAutoScroll();
      isDown = true;
      startX = e.touches[0].pageX;
      scrollLeft = carousel.scrollLeft;
      lastX = e.touches[0].pageX;
      lastTime = Date.now();
    });

    carousel.addEventListener('touchmove', (e) => {
      if (!isDown) return;
      const x = e.touches[0].pageX;
      const walk = startX - x;
      carousel.scrollLeft = scrollLeft + walk;

      const now = Date.now();
      const dt = now - lastTime;
      if (dt > 0) {
        velocity = (lastX - x) / dt;
        lastX = x;
        lastTime = now;
      }
    });

    carousel.addEventListener('touchend', () => {
      isDown = false;
      applyMomentum(velocity);
      startAutoScroll();
    });
  } else {
    // PC端启用滚动自动播放和居中对齐
    carousel.style.scrollBehavior = 'smooth';
    carousel.style.overflowX = 'scroll';
    startAutoScroll();
    carousel.addEventListener('mouseenter', stopAutoScroll);
    carousel.addEventListener('mouseleave', startAutoScroll);
  }

  function applyMomentum(initialVelocity) {
    let v = initialVelocity * 1000;
    const decay = 0.9;
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
    const index = Math.round((carousel.scrollLeft + centerOffset) / slideWidth);
    goToSlide(index);
  }

  function checkLoop() {
    const rawIndex = (carousel.scrollLeft + centerOffset) / slideWidth;
    if (carousel.scrollLeft <= 0) {
      carousel.scrollLeft = slideWidth * (slides.length - 2) - centerOffset;
      currentIndex = slides.length - 2;
    } else if (carousel.scrollLeft >= slideWidth * (slides.length - 1)) {
      carousel.scrollLeft = slideWidth - centerOffset;
      currentIndex = 1;
    } else {
      currentIndex = Math.round(rawIndex);
    }
    updateSlideFocus(currentIndex);
  }

  carousel.addEventListener('scroll', () => {
    requestAnimationFrame(checkLoop);
  });

  updateSlideFocus(currentIndex);

  // 隐藏滚动条
  carousel.style.scrollbarWidth = 'none';
  carousel.style.msOverflowStyle = 'none';
  carousel.classList.add('hide-scrollbar');

  const style = document.createElement('style');
  style.innerHTML = `
    #inertia-carousel::-webkit-scrollbar {
      display: none;
    }
  `;
  document.head.appendChild(style);
});
