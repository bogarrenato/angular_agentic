import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeStore } from './theme.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'my-app';
  private readonly themeStore = inject(ThemeStore);

  protected themeLabel = computed(() =>
    this.themeStore.theme() === 'dark' ? 'Light mode' : 'Dark mode'
  );

  protected themeAnnounce = computed(() =>
    this.themeStore.theme() === 'dark' ? 'Dark theme enabled' : 'Light theme enabled'
  );

  protected onToggleTheme(): void {
    this.themeStore.toggleTheme();
  }
}
