import React from 'react';
import { render, screen } from '@testing-library/react';
import { HeaderInformation } from '../components/HeaderInformation';

test('renders header information', () => {
  render(<HeaderInformation />);
  const linkElement = screen.getByText(/Крестики-нолики Мультиплеер/i);
  expect(linkElement).toBeInTheDocument();
});
