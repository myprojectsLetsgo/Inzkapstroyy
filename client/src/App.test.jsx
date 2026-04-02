import { render, screen } from '@testing-library/react';
import App from './App';

test('компонент рендерится на мобильных', () => {
  // Мокаем viewport
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 375,
  });
  
  window.dispatchEvent(new Event('resize'));
  
  render(<App />);
  expect(screen.getByText(/ваш текст/i)).toBeInTheDocument();
});