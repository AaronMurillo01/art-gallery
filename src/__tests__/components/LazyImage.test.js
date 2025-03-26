import React from 'react';
import { render, screen } from '@testing-library/react';
import LazyImage from '../../components/LazyImage/LazyImage';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe(element) {
    this.callback([{ isIntersecting: true, target: element }]);
  }
  unobserve() {}
  disconnect() {}
};

describe('LazyImage Component', () => {
  test('renders placeholder initially', () => {
    render(<LazyImage src="test-image.jpg" alt="Test image" />);
    const placeholder = document.querySelector('.lazy-image-placeholder');
    expect(placeholder).toBeInTheDocument();
  });

  test('loads image when in viewport', () => {
    render(<LazyImage src="test-image.jpg" alt="Test image" />);
    const image = screen.getByAltText('Test image');
    expect(image).toBeInTheDocument();
    expect(image.src).toContain('test-image.jpg');
  });

  test('applies custom className', () => {
    render(<LazyImage src="test-image.jpg" alt="Test image" className="custom-class" />);
    const container = document.querySelector('.lazy-image-container');
    expect(container).toHaveClass('custom-class');
  });
});