import { computed, effect } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';

export type ThemeMode = 'light' | 'dark';

export interface ThemeState {
  theme: ThemeMode;
}

function detectPreferredTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // ignore
  }
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export const ThemeStore = signalStore(
  { providedIn: 'root' },
  withState<ThemeState>({ theme: detectPreferredTheme() }),
  withComputed(({ theme }) => ({
    isDark: computed(() => theme() === 'dark'),
  })),
  withMethods((store) => ({
    setTheme(mode: ThemeMode) {
      patchState(store, { theme: mode });
      try {
        localStorage.setItem('theme', mode);
      } catch {
        // ignore
      }
    },
    toggleTheme() {
      const next: ThemeMode = store.theme() === 'dark' ? 'light' : 'dark';
      this.setTheme(next);
    },
  })),
  withHooks((store) => ({
    onInit() {
      effect(() => {
        const mode = store.theme();
        document.documentElement.setAttribute('data-theme', mode);
      });
    },
  })),
);


