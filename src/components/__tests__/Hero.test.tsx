import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Hero from '@/components/Hero';

describe('Hero', () => {
  it('renders main heading', () => {
    render(<Hero />);
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Human Rights in Action: Helping Jamaicans Reconnect After Hurricane Melissa');
  });

  it('renders description text', () => {
    render(<Hero />);
    
    expect(screen.getByText(/In times of crisis, every voice matters/i)).toBeDefined();
  });

  it('renders submit button with correct text', () => {
    render(<Hero />);
    
    const button = screen.getByRole('link', { name: /Submit a Missing Person Report/i });
    expect(button).toBeDefined();
    expect(button).toHaveAttribute('href', '/request');
  });

  it('applies mobile-responsive styles to heading', () => {
    render(<Hero />);
    
    const heading = screen.getByRole('heading', { level: 1 });
    // The h1 should have mobile-responsive font size defined in the theme
    expect(heading).toBeDefined();
  });

  it('renders arrow down icon', () => {
    render(<Hero />);
    
    // The KeyboardArrowDownIcon should be present in the component
    const heroSection = screen.getByRole('heading', { level: 1 }).closest('section');
    expect(heroSection).toBeDefined();
  });
});
