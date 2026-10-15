import { act, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, it, expect, vi } from 'vitest';
import AllRoutes from './AllRoutes';
vi.mock('../Pages/Dashboard/HomeDash', () => ({ default: () => <h1>Dashboard route</h1> }));
vi.mock('../Pages/Dashboard/Webhooks', () => ({ default: () => <h1>Webhook route</h1> }));
vi.mock('../Pages/NotFound', () => ({ default: () => <h1>Missing route</h1> }));

describe('authenticated nested routes', () => {
  it.each([
    ['/auth/dashboard', 'Dashboard route'], ['/auth/webhooks', 'Webhook route'],
    ['/en/auth/dashboard', 'Dashboard route'], ['/en/auth/webhooks', 'Webhook route'],
  ])('renders %s under the authenticated parent', async (url, heading) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    await act(async () => {
      root.render(<MemoryRouter initialEntries={[url]}><Suspense fallback="Loading"><Routes>
        <Route path="/auth/*" element={<AllRoutes />} />
        <Route path="/:locale/auth/*" element={<AllRoutes />} />
      </Routes></Suspense></MemoryRouter>);
    });
    expect(container.textContent).toBe(heading);
    await act(async () => root.unmount());
    container.remove();
  });
});
