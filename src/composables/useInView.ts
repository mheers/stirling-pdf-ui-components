import { onScopeDispose, ref, watch, type Ref } from 'vue';

export interface UseInViewOptions {
  rootMargin?: string;
  threshold?: number | number[];
  once?: boolean;
}

/**
 * Track whether an element is near the viewport. Used to defer expensive PDF
 * page renders for off-screen thumbnails.
 */
export function useInView(target: Ref<HTMLElement | null | undefined>, options: UseInViewOptions = {}) {
  const inView = ref(false);
  let observer: IntersectionObserver | null = null;
  let observed: HTMLElement | null = null;

  const disconnect = () => {
    observer?.disconnect();
    observer = null;
    observed = null;
  };

  const connect = (element: HTMLElement | null | undefined) => {
    if (!element || element === observed) return;
    disconnect();

    if (typeof IntersectionObserver === 'undefined') {
      inView.value = true;
      return;
    }

    observed = element;
    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          inView.value = true;
          if (options.once !== false) {
            disconnect();
          }
        } else if (options.once === false) {
          inView.value = false;
        }
      },
      {
        rootMargin: options.rootMargin ?? '200px 0px',
        threshold: options.threshold ?? 0.01,
      },
    );
    observer.observe(element);
  };

  watch(target, (element) => connect(element), { immediate: true, flush: 'post' });
  onScopeDispose(disconnect);

  return inView;
}
