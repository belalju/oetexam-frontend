import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GoogleIdentity {
  private loaded?: Promise<void>;

  private load(): Promise<void> {
    this.loaded ??= new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('GIS load failed'));
      document.head.appendChild(s);
    });
    return this.loaded;
  }

  async renderButton(container: HTMLElement, onCredential: (idToken: string) => void) {
    await this.load();
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (resp) => onCredential(resp.credential),
    });
    google.accounts.id.renderButton(container, { type: 'standard', theme: 'outline', size: 'large', width: 350 });
  }
}
