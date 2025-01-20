import { useCallback } from 'react';

const defaultEasing = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

const animateScroll = (
  start: number,
  end: number,
  duration: number,
  easing: (t: number) => number,
  updatePosition: (pos: number) => void
) => {
  const startTime = performance.now();

  const step = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easing(progress);

    updatePosition(start + easedProgress * (end - start));

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
};

const currentScrollPosition = (horizontal = false): number => {
  if (horizontal) {
    return window.scrollX || document.documentElement.scrollLeft || document.body.scrollLeft;
  } else {
    return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
  }
};

const useScroll = () => {
  const scrollTo = useCallback(
    (position: number, { duration = 1000, easing = defaultEasing, horizontal = false } = {}) => {
      const start = currentScrollPosition(horizontal);
      const updatePosition = (pos: number) => {
        if (horizontal) {
          window.scrollTo(pos, 0);
        } else {
          window.scrollTo(0, pos);
        }
      };

      animateScroll(start, position, duration, easing, updatePosition);
    },
    []
  );

  const scrollToTop = useCallback(
    (options?: { duration?: number; easing?: (t: number) => number }) => {
      scrollTo(0, options);
    },
    [scrollTo]
  );

  const scrollToBottom = useCallback(
    (options?: { duration?: number; easing?: (t: number) => number; horizontal?: boolean }) => {
      const target = options?.horizontal
        ? document.documentElement.scrollWidth - window.innerWidth
        : document.documentElement.scrollHeight - window.innerHeight;
      scrollTo(target, options);
    },
    [scrollTo]
  );

  return { scrollTo, scrollToBottom, scrollToTop };
};

export default useScroll;
