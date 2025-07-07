document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.getElementById('inertia-carousel');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  if (!carousel || !prevBtn || !nextBtn) return;

  // 克隆首尾实现无缝循环
  const slidesOriginal = Array.from(carousel.querySelectorAll('a'));
  if (slidesOriginal.length === 0) return;

  const firstClone = slidesOriginal[0].cloneNode(true);
  const lastClone = slidesOriginal[slidesOriginal.length - 1].cloneNode(true);
  carousel.appendChild(firstClone);
  carousel.insertBefore(lastClone, slidesOriginal[0]);

  let slides = carousel.querySelectorAll('a');
  let gap = parseInt(getComputedStyle(carousel).gap) || 16;
  let slideWidth = slides[1].offsetWidth + gap;

  let currentIndex = 1; // 因为克隆插入的缘故，起始索引为1

  // 设置滚动至当前图片中心
  function centerSlide(index, behavior = 'auto') {
    const offset = (carousel.offsetWidth - slideWidth) / 2;
    const scrollPos = slideWidth * index - offset;
    carousel.scrollTo({ left: scrollPos, behavior });
    updateActiveSlide(index);
  }

  // 更新当前高亮状态
  function updateActiveSlide(index) {
    slides.forEach((slide, i) => {
      if (i === index) slide.classList.add('current');
      else slide.classList.remove('current');
    });
  }

  // 无限循环逻辑
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

  // 绑定箭头事件
  prevBtn.addEventListener('click', () => {
    currentIndex = currentIndex <= 1 ? slides.length - 2 : currentIndex - 1;
    centerSlide(currentIndex, 'smooth');
  });

  nextBtn.addEventListener('click', () => {
    currentIndex = currentIndex >= slides.length - 2 ? 1 : currentIndex + 1;
    centerSlide(currentIndex, 'smooth');
  });

  // 滚动事件，自动检测当前图片并循环
  carousel.addEventListener('scroll', () => {
    loopCheck();

    // 根据滚动位置计算最接近中心的图片索引
    const offset = (carousel.offsetWidth - slideWidth) / 2;
    let scrollPos = carousel.scrollLeft + offset;
    let idx = Math.round(scrollPos / slideWidth);
    if (idx !== currentIndex && idx >= 0 && idx < slides.length) {
      currentIndex = idx;
      updateActiveSlide(currentIndex);
    }
  });

  // 初始化居中第一张真实图片
  window.addEventListener('resize', () => {
    slideWidth = slides[1].offsetWidth + gap;
    centerSlide(currentIndex, 'auto');
  });

  centerSlide(currentIndex, 'auto');

  // 移动端触摸支持
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    // 无箭头，直接滑动即可，浏览器默认行为满足要求，无需额外JS处理
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    carousel.style.scrollSnapType = 'x mandatory';
  } else {
    // PC端使用鼠标拖动支持（可选，可根据需求添加）
    let isDragging = false;
    let startX = 0;
    let scrollStart = 0;

    carousel.addEventListener('mousedown', e => {
      isDragging = true;
      startX = e.pageX;
      scrollStart = carousel.scrollLeft;
      carousel.classList.add('dragging');
      e.preventDefault();
    });
    document.addEventListener('mouseup', () => {
      isDragging = false;
      carousel.classList.remove('dragging');
    });
    document.addEventListener('mousemove', e => {
      if (!isDragging) return;
      const dx = startX - e.pageX;
      carousel.scrollLeft = scrollStart + dx;
    });
  }
});
