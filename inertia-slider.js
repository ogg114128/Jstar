// inertia-slider.js

document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.getElementById('inertia-carousel');
  if (!carousel) return;

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const slides = Array.from(carousel.querySelectorAll('a'));

  // 克隆首尾以形成环状结构
  const firstClone = slides[0].cloneNode(true);
  const lastClone = slides[slides.length - 1].cloneNode(true);
  carousel.appendChild(firstClone);
  carousel.insertBefore(lastClone, slides[0]);

  let allSlides = carousel.querySelectorAll('a');
  let currentIndex = 1;

  function updateFocus() {
    allSlides.forEach((slide, i) => {
      slide.style.transition = 'transform 0.5s ease, filter 0.5s ease';
      if (i === currentIndex) {
        slide.style.transform = 'scale(1)';
        slide.style.filter = 'brightness(1)';
        slide.style.zIndex = '10';
      } else {
        slide.style.transform = 'scale(0.85)';
        slide.style.filter = 'brightness(0.5)';
        slide.style.zIndex = '1';
      }
    });
  }

  function getSlideWidth() {
    const style = getComputedStyle(allSlides[0]);
    const gap = parseInt(style.marginRight || 0);
    return allSlides[0].offsetWidth + gap;
  }

  function scrollToIndex(index) {
    const slideWidth = getSlideWidth();
    const centerOffset = (carousel.offsetWidth - slideWidth) / 2;
    carousel.scrollTo({ left: index * slideWidth - centerOffset, behavior: 'smooth' });
    currentIndex = index;
    updateFocus();
  }

  function checkLooping() {
    const slideWidth = getSlideWidth();
    const centerOffset = (carousel.offsetWidth - slideWidth) / 2;
    const threshold = slideWidth * 0.3;
    if (carousel.scrollLeft <= threshold) {
      carousel.scrollLeft = slideWidth * (allSlides.length - 2) - centerOffset;
      currentIndex = allSlides.length - 2;
      updateFocus();
    } else if (carousel.scrollLeft >= slideWidth * (allSlides.length - 1.7)) {
      carousel.scrollLeft = slideWidth - centerOffset;
      currentIndex = 1;
      updateFocus();
    }
  }

  function handleResize() {
    allSlides = carousel.querySelectorAll('a');
    scrollToIndex(currentIndex);
  }

  window.addEventListener('resize', handleResize);
  allSlides.forEach(slide => {
    const img = slide.querySelector('img');
    if (img && !img.complete) img.onload = handleResize;
  });

  // 左右箭头控制（PC端）
  if (!isTouchDevice) {
    const leftArrow = document.createElement('button');
    const rightArrow = document.createElement('button');

    leftArrow.innerText = '<';
    rightArrow.innerText = '>';

    leftArrow.className = 'carousel-arrow carousel-arrow-left';
    rightArrow.className = 'carousel-arrow carousel-arrow-right';

    leftArrow.addEventListener('click', () => {
      currentIndex = currentIndex - 1;
      scrollToIndex(currentIndex);
    });
    rightArrow.addEventListener('click', () => {
      currentIndex = currentIndex + 1;
      scrollToIndex(currentIndex);
    });

    document.body.appendChild(leftArrow);
    document.body.appendChild(rightArrow);
  }

  // 手机 touch 滚动
  if (isTouchDevice) {
    carousel.style.overflowX = 'scroll';
    carousel.style.scrollSnapType = 'x mandatory';
    carousel.style.webkitOverflowScrolling = 'touch';

    carousel.addEventListener('scroll', () => {
      checkLooping();
    }, { passive: true });
  }

  updateFocus();
  scrollToIndex(currentIndex);

  // 样式注入（隐藏滚动条+箭头）
  const style = document.createElement('style');
  style.innerHTML = `
    #inertia-carousel {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    #inertia-carousel::-webkit-scrollbar {
      display: none;
    }
    .carousel-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(0,0,0,0.5);
      color: white;
      border: none;
      font-size: 2rem;
      padding: 0.5rem 1rem;
      cursor: pointer;
      z-index: 100;
    }
    .carousel-arrow-left {
      left: 10px;
    }
    .carousel-arrow-right {
      right: 10px;
    }
  `;
  document.head.appendChild(style);
});
