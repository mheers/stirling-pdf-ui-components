import {
  inject,
  provide,
  type App,
  type Component,
  type InjectionKey,
} from 'vue';

/**
 * Components a host can substitute for the library's own primitives. Every
 * entry is optional; omitted primitives fall back to the library implementation.
 *
 * The contract is intentionally small:
 * - `Button`: `variant`, `size`, `type`, `disabled`, `class`, default slot.
 *   `icon-sm`/`icon-lg` are mapped to `icon`.
 * - `Input`/`Textarea`: `modelValue` + `update:modelValue`, `class`, plus the
 *   native attributes the caller passes.
 * - `Checkbox`/`Switch`/`Slider`: `modelValue` + `update:modelValue`,
 *   `disabled`, `aria-label`/`class`.
 * - `Badge`: `variant` and the default slot.
 * - `Skeleton`/`Spinner`: `class`, and `size`/`label` for `Spinner`.
 */
export interface SpdfUiComponents {
  Button?: Component;
  Input?: Component;
  Textarea?: Component;
  Checkbox?: Component;
  Switch?: Component;
  Slider?: Component;
  Badge?: Component;
  Skeleton?: Component;
  Spinner?: Component;
}

/**
 * Class recipes for the native controls and overlay skins. These are merged
 * after the library defaults with `cn()`, so the host recipe wins conflicting
 * Tailwind utilities.
 */
export interface SpdfUiClassRecipes {
  input?: string;
  textarea?: string;
  select?: string;
  /** Dialog skin; positioning and layout stay with the library. */
  dialog?: string;
  /** Full overlay classes, including position and background. */
  dialogOverlay?: string;
  /** Popover content skin. */
  popover?: string;
  /** Tooltip content skin. */
  tooltip?: string;
  /** Sheet skin. */
  sheet?: string;
}

export interface SpdfUiConfig {
  components?: SpdfUiComponents;
  classes?: SpdfUiClassRecipes;
}

export const spdfUiKey: InjectionKey<SpdfUiConfig> = Symbol.for(
  '@mheers/stirling-pdf-ui-components:ui',
);

/** Provide host primitives from an ancestor `setup()` or a layout component. */
export function provideSpdfUi(config: SpdfUiConfig): void {
  provide(spdfUiKey, config);
}

/** Read the current host overrides. Safe outside a provider. */
export function useSpdfUi(): SpdfUiConfig {
  return inject(spdfUiKey, {});
}

/**
 * Install host primitives once on the app:
 *
 * ```ts
 * app.use(SpdfUiPlugin, {
 *   components: { Button: UiButton },
 *   classes: { input: 'h-9 rounded-md border bg-background px-3' },
 * });
 * ```
 */
export const SpdfUiPlugin = {
  install(app: App, config: SpdfUiConfig = {}): void {
    app.provide(spdfUiKey, config);
  },
};
