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
  withHooks((store) => {
    const togglePrimeNGTheme = (mode: ThemeMode) => {
      // Wait for DOM to be ready
      setTimeout(() => {
        const light = document.getElementById('theme-light') as HTMLLinkElement | null;
        const dark = document.getElementById('theme-dark') as HTMLLinkElement | null;
        if (light && dark) {
          if (mode === 'dark') {
            light.disabled = true;
            dark.disabled = false;
          } else {
            light.disabled = false;
            dark.disabled = true;
          }
        }
      }, 0);
    };

    return {
      onInit() {
        // Initialize theme immediately
        const mode = store.theme();
        document.documentElement.setAttribute('data-theme', mode);
        togglePrimeNGTheme(mode);
        
        effect(() => {
          const mode = store.theme();
          document.documentElement.setAttribute('data-theme', mode);
          togglePrimeNGTheme(mode);
        });
      }
    };
  }),
);


