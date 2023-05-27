/**
 * Carousel Block
 *
 * Features:
 * - swipe between slides
 * - endless update
 * - next and previous navigation buttons
 *
 */

const DEFAULT_DISPLAY_INTERVAL_MS = 5000;
const SLIDE_ID_PREFIX = 'carousel-display';
const SLIDE_ANIMATION_DURATION_MS = 640;

class CarouselState {
  constructor(interval, currentDisplay = 0, firstVisibleDisplay = 1, maxVisibleDisplay = 0) {
    this.firstVisibleDisplay = firstVisibleDisplay;
    this.maxVisibleDisplay = maxVisibleDisplay;
    this.currentDisplay = currentDisplay;
    this.interval = interval;
    this.displayInterval = null; /* for auto-display interval handling */
  }
}

/**
 * Update active display in current display
 * @param carousel The carousel
 * @param blockState Current states of carousel block
 */
function syncActiveDot(block, blockState) {
  [...block.children].forEach((slide, index) => {
    if (index === blockState.currentDisplay) {
      slide.removeAttribute('class');
      slide.setAttribute('class', 'carousel-active-display');
    } else {
      slide.removeAttribute('class');
      slide.setAttribute('class', 'carousel-inactive-display');
    }
  });
}

/**
 * Clear any active display intervals

function stopAutoDisplay(blockState) {
  clearInterval(blockState.displayInterval);
  blockState.displayInterval = undefined;
}  */

/**
 * Show a single display into view.
 * @param carousel The carousel
 * @param slideIndex {number} The slide index
 */
function goToDisplay(carousel, blockState) {
  const carouselContainer = carousel.querySelector('.carousel-display-container');
  setTimeout(() => {
    syncActiveDot(carouselContainer, blockState);
  }, SLIDE_ANIMATION_DURATION_MS);

  blockState.currentDisplay = (blockState.currentDisplay + 1) % blockState.maxVisibleDisplay;
}

/**
 * Decorate a base block element.
 * @param display A base block display element
 * @param index The display's position
 * @return {HTMLUListElement} A decorated carousel display element
 */
function buildSlide(blockState, display, index) {
  display.setAttribute('id', `${SLIDE_ID_PREFIX}${index}`);
  display.setAttribute('data-display-index', index);
  if (index !== blockState.firstVisibleDisplay) {
    display.setAttribute('class', 'carousel-inactive-display');
  } else {
    display.setAttribute('class', 'carousel-active-display');
  }

  if (index === blockState.firstVisibleDisplay
    || index === blockState.firstVisibleDisplay + 1) {
    display.querySelectorAll('img').forEach((image) => {
      image.loading = 'eager';
    });
  }
  return display;
}

/**
 * Start display
 * @param {*} block Block
 * @param {*} interval Optional, configured time in ms to show a slide
 * Defaults to DEFAULT_SCROLL_INTERVAL_MS when block is set up
 */
function startAutoDisplay(block, blockState) {
  if (blockState.interval === 0) return; /* No auto */

  if (!blockState.displayInterval) {
    blockState.displayInterval = setInterval(() => {
      const targetSlide = blockState.currentDisplay <= blockState.maxVisibleDisplay
        ? blockState.currentDisplay
        : 0;
      goToDisplay(block, blockState, targetSlide);
    }, blockState.interval);
  }
}

/**
 * Decorate and transform a carousel block.
 * @param block HTML block from Franklin
 */
export default function decorate(block) {
/* Next revision will read in configuration from content
  const blockConfig = { ...DEFAULT_CONFIG, ...readBlockConfigWithContent(block) };
*/
  const blockState = new CarouselState(
    0,
    DEFAULT_DISPLAY_INTERVAL_MS,
    1,
    3,
  );

  const carousel = document.createElement('div');
  carousel.classList.add('carousel-display-container');

  const displays = [...block.children];
  blockState.maxVisibleDisplay = displays.length;
  const displayToAdd = new Array(blockState.maxVisibleDisplay);
  displays.forEach((display, index) => {
    displayToAdd[index] = buildSlide(blockState, display, index + 1);
  });

  carousel.append(...displayToAdd);
  block.append(carousel);

  startAutoDisplay(block, blockState);
}
