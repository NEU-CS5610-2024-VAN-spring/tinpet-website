import { render, screen } from '@testing-library/react';
import App from './App';

Object.defineProperty(window, 'crypto', {
    value: {
      subtle: {
        encrypt: jest.fn(),
        decrypt: jest.fn(),
        // Add other required methods here
      },
      getRandomValues: jest.fn(),
    },
  });

  test('renders the welcome message', () => {
    render(<App />);
    const linkElement = screen.getByText(/Welcome to Pet Matcher/i);
    expect(linkElement).toBeInTheDocument();
  });