// inertia-slider.js

document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.getElementById('inertia-carousel');
  if (!carousel) return;

  // 克隆首尾形成环状滚动
  const originalSlides = Array.from(carousel.querySelectorAll('a'));
  const firstClone = originalSlides[0].cloneNode(true);
  const lastClone = originalSlides[originalSlides.length - 1].cloneNode(true);
  carousel.appendChild(firstClone);
  carousel.insertBefore(lastClone, originalSlides[0]);

  let slides = carousel.querySelectorAll('a');
  let slideGap = parseInt(getComputedStyle(carousel).gap || '16');
  let slideWidth = slides[1].offsetWidth + slideGap;
  let currentIndex = 1;

  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;
  let autoScrollTimer = null;
  let momentumID = null;
  let velocity = 0;
  let lastX = 0;
  let lastTime = 0;
  let isTouchScrolling = false; // 仅用于手机端
  let isMouseDragging = false;  // 仅用于PC端

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  function getCenterOffset() {
    return (carousel.offsetWidth - slideWidth) / 2;
  }
  function scrollToIndex(index, behavior = 'instant') {
    let offset = getCenterOffset();
    let scrollTarget = slideWidth * index - offset;
    if (behavior === 'smooth') {
      carousel.scrollTo({ left: scrollTarget, behavior: 'smooth' });
    } else {
      carousel.scrollLeft = scrollTarget;
    }
    updateSlideFocus(index);
  }

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
    scrollToIndex(currentIndex, 'smooth');
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

  // 无限丝滑环状滚动的处理
  function seamlessLoop() {
    let offset = getCenterOffset();
    if (carousel.scrollLeft <= slideWidth * 0.3) {
      carousel.scrollLeft = slideWidth * (slides.length - 2) - offset;
      currentIndex = slides.length - 2;
      updateSlideFocus(currentIndex);
    } else if (carousel.scrollLeft >= slideWidth * (slides.length - 1.7)) {
      carousel.scrollLeft = slideWidth - offset;
      currentIndex = 1;
      updateSlideFocus(currentIndex);
    }
  }

  // 只保留惯性动画，不回弹
  function applyMomentum(initialVelocity) {
    let v = initialVelocity * 1000;
    const decay = 0.92;
    const minVelocity = 12;
    cancelAnimationFrame(momentumID);

    function step() {
      if (Math.abs(v) < minVelocity) {
        // 不再吸附到中间，直接停
        isTouchScrolling = false;
        isMouseDragging = false;
        return;
      }
      carousel.scrollLeft += v / 60;
      v *= decay;
      seamlessLoop();
      momentumID = requestAnimationFrame(step);
    }
    step();
  }

  // 监听resize和图片加载，重新计算宽度和居中
  function recalcAndCenter() {
    slides = carousel.querySelectorAll('a');
    slideGap = parseInt(getComputedStyle(carousel).gap || '16');
    slideWidth = slides[1].offsetWidth + slideGap;
    scrollToIndex(currentIndex, 'instant');
  }
  window.addEventListener('resize', recalcAndCenter);
  slides.forEach(slide => {
    const img = slide.querySelector('img');
    if (img && !img.complete) {
      img.onload = recalcAndCenter;
    }
  });

  recalcAndCenter();

  // 移动端滑动
  if (isTouchDevice) {
    carousel.style.scrollBehavior = 'auto';
    carousel.style.overflowX = 'scroll';
    carousel.style.touchAction = 'pan-x';
    carousel.style.webkitOverflowScrolling = 'touch';

    carousel.addEventListener('touchstart', (e) => {
      stopAutoScroll();
      isDown = true;
      isTouchScrolling = true;
      startX = e.touches[0].pageX;
      scrollLeft = carousel.scrollLeft;
      lastX = e.touches[0].pageX;
      lastTime = Date.now();
      velocity = 0;
      cancelAnimationFrame(momentumID);
    }, { passive: true });

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
      seamlessLoop();
    }, { passive: true });

    carousel.addEventListener('touchend', () => {
      isDown = false;
      if (Math.abs(velocity) > 0.05) {
        applyMomentum(velocity);
      } else {
        isTouchScrolling = false;
      }
      startAutoScroll();
    });

    carousel.addEventListener('scroll', () => {
      if (isTouchScrolling) seamlessLoop();
    });
  } else {
    // PC端 鼠标拖动支持
    carousel.style.scrollBehavior = 'auto';
    carousel.style.overflowX = 'scroll';
    let mouseVelocity = 0;

    carousel.addEventListener('mousedown', (e) => {
      // 仅主鼠标键
      if (e.button !== 0) return;
      stopAutoScroll();
      isMouseDragging = true;
      isDown = true;
      startX = e.pageX;
      scrollLeft = carousel.scrollLeft;
      lastX = e.pageX;
      lastTime = Date.now();
      velocity = 0;
      cancelAnimationFrame(momentumID);
      carousel.classList.add('dragging');
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isMouseDragging || !isDown) return;
      const x = e.pageX;
      const walk = startX - x;
      carousel.scrollLeft = scrollLeft + walk;

      const now = Date.now();
      const dt = now - lastTime;
      if (dt > 0) {
        velocity = (lastX - x) / dt;
        lastX = x;
        lastTime = now;
      }
      seamlessLoop();
    });

    document.addEventListener('mouseup', (e) => {
      if (!isMouseDragging) return;
      isMouseDragging = false;
      isDown = false;
      carousel.classList.remove('dragging');
      if (Math.abs(velocity) > 0.05) {
        applyMomentum(velocity);
      }
      startAutoScroll();
    });

    // 鼠标离开窗口时清理状态
    document.addEventListener('mouseleave', (e) => {
      if (isMouseDragging) {
        isMouseDragging = false;
        isDown = false;
        carousel.classList.remove('dragging');
      }
    });

    // 滚轮操作丝滑无限
    carousel.addEventListener('wheel', (e) => {
      stopAutoScroll();
      seamlessLoop();
    }, { passive: true });

    carousel.addEventListener('scroll', () => {
      if (isMouseDragging) seamlessLoop();
    });

    startAutoScroll();
    carousel.addEventListener('mouseenter', stopAutoScroll);
    carousel.addEventListener('mouseleave', startAutoScroll);
  }

  // 隐藏滚动条
  carousel.style.scrollbarWidth = 'none';
  carousel.style.msOverflowStyle = 'none';
  carousel.classList.add('hide-scrollbar');
  const style = document.createElement('style');
  style.innerHTML = `
    #inertia-carousel::-webkit-scrollbar { display: none; }
    #inertia-carousel.dragging { cursor: grabbing !important; }
  `;
  document.head.appendChild(style);
});
