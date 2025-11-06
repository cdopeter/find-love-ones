import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Navigation from '@/components/Navigation';

describe('Navigation', () => {
  it('renders OPD logos', () => {
    render(<Navigation />);

    const logos = screen.getAllByAltText('Office of the Public Defender Logo');
    expect(logos.length).toBeGreaterThan(0);
    logos.forEach((logo) => {
      expect(logo).toHaveAttribute(
        'src',
        'https://opd.gov.jm/wp-content/uploads/2020/07/logo-2020.png'
      );
    });
  });

  it('renders main title "Proof Of Wellness"', () => {
    render(<Navigation />);

    const titles = screen.getAllByText('Proof Of Wellness');
    expect(titles.length).toBeGreaterThan(0);
  });

  it('renders subtitle "Powered By The Office of The Public Defender"', () => {
    render(<Navigation />);

    const subtitles = screen.getAllByText('Powered By The Office of The Public Defender');
    expect(subtitles.length).toBeGreaterThan(0);
  });

  it('renders navigation links', () => {
    render(<Navigation />);

    expect(screen.getAllByText('Home').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Submit Request').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Tracker').length).toBeGreaterThan(0);
  });
});
