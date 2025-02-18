import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { act } from 'react-dom/test-utils';

Object.defineProperty(window, 'crypto', {
    value: {
      subtle: {
        encrypt: jest.fn(),
        decrypt: jest.fn(),
      },
      getRandomValues: jest.fn(),
    },
});

test('renders the welcome message', async () => {
    await act(async () => {
        render(<App />);
    });
  const linkElement = await screen.findByText(/Welcome to Pet Matcher/i);
  expect(linkElement).toBeInTheDocument();
});
