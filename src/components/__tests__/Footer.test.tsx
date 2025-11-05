import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from '@/components/Footer';

describe('Footer', () => {
  it('renders OPD logo', () => {
    render(<Footer />);

    const logo = screen.getByAltText('Office of the Public Defender Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute(
      'src',
      'https://opd.gov.jm/wp-content/uploads/2020/07/logo-2020.png'
    );
  });

  it('renders tagline', () => {
    render(<Footer />);

    expect(
      screen.getByText(/Voice of the voiceless, To lose the chains of injustice/i)
    ).toBeInTheDocument();
  });

  it('renders contact email', () => {
    render(<Footer />);

    const emailLink = screen.getByRole('link', {
      name: /enquiries@opd\.gov\.jm/i,
    });
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute('href', 'mailto:enquiries@opd.gov.jm');
  });

  it('renders hotline numbers', () => {
    render(<Footer />);

    expect(screen.getByText(/Hotline: \+1 \(888\)-429-5673/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Local: \(876\) 922-7089 \/ 7090 \/ 7109 \/ 8256/i)
    ).toBeInTheDocument();
  });

  it('renders address', () => {
    render(<Footer />);

    expect(screen.getByText('22-24 Duke Street')).toBeInTheDocument();
    expect(screen.getByText('P.O. Box 695')).toBeInTheDocument();
    expect(screen.getByText('Kingston, Jamaica, W.I.')).toBeInTheDocument();
  });

  it('renders social media links', () => {
    render(<Footer />);

    const facebookLink = screen.getByLabelText('Facebook');
    const instagramLink = screen.getByLabelText('Instagram');
    const twitterLink = screen.getByLabelText('Twitter');

    expect(facebookLink).toBeInTheDocument();
    expect(instagramLink).toBeInTheDocument();
    expect(twitterLink).toBeInTheDocument();

    expect(facebookLink).toHaveAttribute('href', 'https://facebook.com');
    expect(instagramLink).toHaveAttribute('href', 'https://instagram.com');
    expect(twitterLink).toHaveAttribute('href', 'https://twitter.com');
  });

  it('renders partner information', () => {
    render(<Footer />);

    expect(screen.getByText('Our Partners')).toBeInTheDocument();
    expect(
      screen.getByText('ODPEM and partner organizations')
    ).toBeInTheDocument();
  });

  it('renders copyright year', () => {
    render(<Footer />);

    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`© ${currentYear}`))
    ).toBeInTheDocument();
  });

  it('renders Contact Us section', () => {
    render(<Footer />);

    expect(screen.getByText('Contact Us')).toBeInTheDocument();
  });

  it('renders Follow Us section', () => {
    render(<Footer />);

    expect(screen.getByText('Follow Us')).toBeInTheDocument();
  });
});
