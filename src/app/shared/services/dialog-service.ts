import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private dialogElement: any;

  constructor() {
    this.dialogElement = document.createElement('dialog');
    document.body.appendChild(this.dialogElement);
  }

  openConfirmation(message: string, buttons?: string[]): Promise<boolean> {
    this.dialogElement.innerHTML = `
      <p>${message}</p>
      <button class="confirm-button btn btn-primary">Confirm</button>
      <button class="cancel-button btn btn-secondary">Cancel</button>
    `;

    this.dialogElement.showModal();

    return new Promise<boolean>((resolve, reject) => {
      const confirmButton = this.dialogElement.querySelector('.confirm-button');
      const cancelButton = this.dialogElement.querySelector('.cancel-button');

      confirmButton?.addEventListener('click', () => {
        (this.dialogElement as any).close();

        resolve(true);
      });

      cancelButton?.addEventListener('click', () => {
        (this.dialogElement as any).close();

        resolve(false);
      });
    });
  }
}
