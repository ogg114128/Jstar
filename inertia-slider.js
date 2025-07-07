document.addEventListener('DOMContentLoaded', () => {
  // 动态注入样式
  const style = document.createElement('style');
  style.innerHTML = `
    .carousel-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255, 255, 255, 0.7);
      border: none;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      font-size: 24px;
      cursor: pointer;
      z-index: 1000;
      user-select: none;
      transition: background 0.3s ease;
    }
    .carousel-arrow:hover {
      background: rgba(255, 255, 255, 1);
    }
    .left-arrow {
      left: 8px;
    }
    .right-arrow {
      right: 8px;
    }
    #inertia-carousel a.current {
      filter: brightness(1) saturate(1);
      transform: scale(1);
      transition: filter 0.3s ease, transform 0.3s ease;
      z-index: 10;
    }
    #inertia-carousel a:not(.current) {
      filter: brightness(0.5) saturate(0.5);
      transform: scale(0.85);
      transition: filter 0.3s ease, transform 0.3s ease;
      z-index: 1;
    }
    #inertia-carousel::-webkit-scrollbar {
      display: none;
    }
    #inertia-carousel {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `;
  document.head.appendChild(style);

  // 变量定义
  const carousel = document.getElementById('inertia-carousel');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  if (!carousel || !prevBtn || !nextBtn) return;

  // 克隆首尾实现无限循环
  const slidesOriginal = Array.from(carousel.querySelectorAll('a'));
  if (slidesOriginal.length === 0) return;

  const firstClone = slidesOriginal[0].cloneNode(true);
  const lastClone = slidesOriginal[slidesOriginal.length - 1].cloneNode(true);
  carousel.appendChild(firstClone);
  carousel.insertBefore(lastClone, slidesOriginal[0]);

  let slides = carousel.querySelectorAll('a');
  let gap = parseInt(getComputedStyle(carousel).gap) || 16;
  let slideWidth = slides[1].offsetWidth + gap;

  let currentIndex = 1; // 克隆后第一张的索引

  // 使指定index的slide居中并标记高亮
  function centerSlide(index, behavior = 'auto') {
    const offset = (carousel.offsetWidth - slideWidth) / 2;
    const scrollPos = slideWidth * index - offset;
    carousel.scrollTo({ left: scrollPos, behavior });
    updateActiveSlide(index);
  }

  // 标记当前高亮
  function updateActiveSlide(index) {
    slides.forEach((slide, i) => {
      if (i === index) slide.classList.add('current');
      else slide.classList.remove('current');
    });
  }

  // 无缝循环判断
  function loopCheck() {
    const offset = (carousel.offsetWidth - slideWidth) / 2;
    if (carousel.scrollLeft <= slideWidth * 0.3) {
      carousel.scrollLeft = slideWidth * (slides.length - 2) - offset;
      currentIndex = slides.length - 2;
      updateActiveSlide(currentIndex);
    } else if (carousel.scrollLeft >= slideWidth * (slides.length - 1.7)) {
      carousel.scrollLeft = slideWidth - offset;
      currentIndex = 1;
      updateActiveSlide(currentIndex);
    }
  }

  // 点击箭头事件
  prevBtn.addEventListener('click', () => {
    currentIndex = currentIndex <= 1 ? slides.length - 2 : currentIndex - 1;
    centerSlide(currentIndex, 'smooth');
  });

  nextBtn.addEventListener('click', () => {
    currentIndex = currentIndex >= slides.length - 2 ? 1 : currentIndex + 1;
    centerSlide(currentIndex, 'smooth');
  });

  // 滚动监听，更新currentIndex和高亮，处理循环
  carousel.addEventListener('scroll', () => {
    loopCheck();
    const offset = (carousel.offsetWidth - slideWidth) / 2;
    let scrollPos = carousel.scrollLeft + offset;
    let idx = Math.round(scrollPos / slideWidth);
    if (idx !== currentIndex && idx >= 0 && idx < slides.length) {
      currentIndex = idx;
      updateActiveSlide(currentIndex);
    }
  });

  // 适配窗口宽度变更
  window.addEventListener('resize', () => {
    gap = parseInt(getComputedStyle(carousel).gap) || 16;
    slideWidth = slides[1].offsetWidth + gap;
    centerSlide(currentIndex, 'auto');
  });

  // 初始居中
  centerSlide(currentIndex, 'auto');

  // 手机端隐藏箭头
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    carousel.style.scrollSnapType = 'x mandatory';
  }
});
