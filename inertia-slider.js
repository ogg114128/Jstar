// inertia-slider.js
document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.getElementById('inertia-carousel');

  if (!carousel) return;

  let isDown = false;
  let startX;
  let scrollLeft;

  carousel.addEventListener('mousedown', (e) => {
    isDown = true;
    carousel.classList.add('cursor-grabbing');
    startX = e.pageX - carousel.offsetLeft;
    scrollLeft = carousel.scrollLeft;
  });

  carousel.addEventListener('mouseleave', () => {
    isDown = false;
    carousel.classList.remove('cursor-grabbing');
  });

  carousel.addEventListener('mouseup', () => {
    isDown = false;
    carousel.classList.remove('cursor-grabbing');
  });

  carousel.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - carousel.offsetLeft;
    const walk = (x - startX) * 1.8;
    carousel.scrollLeft = scrollLeft - walk;
  });

  // 支持触控滑动
  let touchStartX = 0;
  let touchScrollLeft = 0;

  carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].pageX;
    touchScrollLeft = carousel.scrollLeft;
  });

  carousel.addEventListener('touchmove', (e) => {
    const touchX = e.touches[0].pageX;
    const walk = (touchX - touchStartX) * 1.5;
    carousel.scrollLeft = touchScrollLeft - walk;
  });
});
