let scrollPosition = 0;

export const lockScroll = () => {
  // Save current scroll position
  scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
  
  // Apply styles to lock scroll while preserving position
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollPosition}px`;
  document.body.style.width = '100%';
  document.body.style.overflow = 'hidden';
  
  // Prevent iOS bounce
  document.body.style.touchAction = 'none';
  
  // Add class for any additional CSS needs
  document.body.classList.add('scroll-locked');
};

export const unlockScroll = () => {
  // Remove styles
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  document.body.style.overflow = '';
  document.body.style.touchAction = '';
  
  // Remove class
  document.body.classList.remove('scroll-locked');
  
  // Restore scroll position
  window.scrollTo(0, scrollPosition);
  
  // Reset stored position
  scrollPosition = 0;
};