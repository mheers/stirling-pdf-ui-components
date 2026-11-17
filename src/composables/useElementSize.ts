import { onScopeDispose, ref, watch, type Ref } from 'vue';

export interface ElementSize {
  width: number;
  height: number;
}

/** Observe an element's content-box size. */
export function useElementSize(target: Ref<HTMLElement | null | undefined>) {
  const width = ref(0);
  const height = ref(0);
  let observer: ResizeObserver | null = null;
  let observed: HTMLElement | null = null;

  const disconnect = () => {
    observer?.disconnect();
    observer = null;
    observed = null;
  };

  const connect = (element: HTMLElement | null | undefined) => {
    if (!element || element === observed) return;
    disconnect();
    if (typeof ResizeObserver === 'undefined') {
      width.value = element.clientWidth;
      height.value = element.clientHeight;
      return;
    }
    observed = element;
    observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const box = entry.contentBoxSize?.[0];
      width.value = box ? box.inlineSize : entry.contentRect.width;
      height.value = box ? box.blockSize : entry.contentRect.height;
    });
    observer.observe(element);
    width.value = element.clientWidth;
    height.value = element.clientHeight;
  };

  watch(target, (element) => connect(element), { immediate: true, flush: 'post' });
  onScopeDispose(disconnect);

  return { width, height };
}
