// inertia-slider.js
document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.getElementById('inertia-carousel');
  const slides = carousel.querySelectorAll('a');
  const slideCount = slides.length;
  const slideWidth = slides[0].offsetWidth + parseInt(getComputedStyle(carousel).gap) || 16;

  let currentIndex = 0;
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;
  let autoScrollTimer = null;
  let momentumID = null;
  let velocity = 0;
  let lastX = 0;
  let lastTime = 0;

  // 判断是否为触摸设备（手机）
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // 切换焦点样式：高亮当前，淡化并缩小其他
  function updateSlideFocus(index) {
    slides.forEach((slide, i) => {
      if (i === index) {
        slide.style.filter = 'brightness(1) saturate(1)';
        slide.style.transform = 'scale(1)';
        slide.style.transition = 'filter 0.5s ease, transform 0.5s ease';
        slide.style.zIndex = '10';
      } else {
        slide.style.filter = 'brightness(0.7) saturate(0.7)';
        slide.style.transform = 'scale(0.9)';
        slide.style.transition = 'filter 0.5s ease, transform 0.5s ease';
        slide.style.zIndex = '1';
      }
    });
  }

  // 跳转到指定slide
  function goToSlide(index) {
    currentIndex = (index + slideCount) % slideCount;
    carousel.scrollTo({
      left: slideWidth * currentIndex,
      behavior: 'smooth'
    });
    updateSlideFocus(currentIndex);
  }

  // 自动轮播
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

  if (isTouchDevice) {
    // 手机端启用手势惯性滑动

    carousel.style.scrollBehavior = 'auto'; // 关闭系统平滑滚动，自己控制

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

      // 计算滑动速度 (px/ms)
      const now = Date.now();
      const dt = now - lastTime;
      if (dt > 0) {
        velocity = (lastX - e.touches[0].pageX) / dt;
        lastX = e.touches[0].pageX;
        lastTime = now;
      }

      updateCurrentSlideByScroll();
    });

    carousel.addEventListener('touchend', (e) => {
      isDown = false;
      applyMomentum(velocity);
      startAutoScroll();
    });

    // 惯性滚动模拟，线性衰减
    function applyMomentum(initialVelocity) {
      let v = initialVelocity * 1000; // 转换成 px/s
      const decay = 0.95;
      const minVelocity = 10; // px/s 最小停止速度
      cancelAnimationFrame(momentumID);

      function momentumStep() {
        if (Math.abs(v) < minVelocity) {
          snapToNearestSlide();
          return;
        }
        carousel.scrollLeft += v / 60; // 60fps
        v *= decay;

        // 边界回弹限制
        if (carousel.scrollLeft < 0) {
          carousel.scrollLeft = 0;
          snapToNearestSlide();
          return;
        }
        const maxScroll = carousel.scrollWidth - carousel.clientWidth;
        if (carousel.scrollLeft > maxScroll) {
          carousel.scrollLeft = maxScroll;
          snapToNearestSlide();
          return;
        }

        updateCurrentSlideByScroll();
        momentumID = requestAnimationFrame(momentumStep);
      }
      momentumStep();
    }

    // 根据 scrollLeft 计算当前页索引并高亮
    function updateCurrentSlideByScroll() {
      const index = Math.round(carousel.scrollLeft / slideWidth);
      if (index !== currentIndex) {
        currentIndex = index;
        updateSlideFocus(currentIndex);
      }
    }

    // 滚动结束后自动吸附到最近slide
    function snapToNearestSlide() {
      const index = Math.round(carousel.scrollLeft / slideWidth);
      goToSlide(index);
    }

  } else {
    // PC端逻辑：无滑动惯性，自动轮播，禁用拖动

    carousel.style.scrollBehavior = 'smooth';
    carousel.style.overflowX = 'hidden';

    updateSlideFocus(currentIndex);
    startAutoScroll();

    // 鼠标悬停停止自动轮播
    carousel.addEventListener('mouseenter', stopAutoScroll);
    carousel.addEventListener('mouseleave', startAutoScroll);

    // 鼠标点击切换（示例，后续你可以加左右箭头触发）
    carousel.addEventListener('click', (e) => {
      const rect = carousel.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      if (clickX < rect.width / 2) {
        goToSlide(currentIndex - 1);
      } else {
        goToSlide(currentIndex + 1);
      }
      stopAutoScroll();
      setTimeout(startAutoScroll, 4000);
    });
  }
})();
