import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(cleanup);

// jsdom has no modal implementation; real focus and Escape are covered in Chromium.
Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
  configurable: true,
  writable: true,
  value() {
    this.open = true;
  },
});
Object.defineProperty(HTMLDialogElement.prototype, 'close', {
  configurable: true,
  writable: true,
  value() {
    this.open = false;
  },
});
