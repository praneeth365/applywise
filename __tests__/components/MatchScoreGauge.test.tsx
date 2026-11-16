import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import MatchScoreGauge from '@/components/analyzer/MatchScoreGauge';

function hexToRgb(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
}

describe('MatchScoreGauge', () => {
  it.each([
    { score: 85, color: '#10b981', label: 'Strong Match' },
    { score: 62, color: '#f59e0b', label: 'Moderate Match' },
    { score: 30, color: '#ef4444', label: 'Weak Match' },
  ])('renders score $score with $label styling', ({ score, color, label }) => {
    const { container } = render(<MatchScoreGauge score={score} />);

    expect(screen.getByText(String(score))).toBeInTheDocument();
    expect(screen.getByText('/100')).toBeInTheDocument();
    expect(screen.getByText(label)).toBeInTheDocument();

    const circles = container.querySelectorAll('svg circle');
    expect(circles).toHaveLength(2);

    const progress = circles[1];
    expect(progress).toHaveAttribute('stroke', color);

    const expectedOffset = 326.7 - (score / 100) * 360;
    const actualOffset = parseFloat(progress.getAttribute('stroke-dashoffset') ?? '');
    expect(actualOffset).toBeCloseTo(expectedOffset, 5);

    const labelEl = screen.getByText(label);
    const styleAttr = (labelEl.getAttribute('style') ?? '').toLowerCase();
    expect(styleAttr).toContain(hexToRgb(color).toLowerCase());
  });

  it('clamps out-of-range scores to 0 and 100', () => {
    const { rerender } = render(<MatchScoreGauge score={150} />);
    expect(screen.getByText('100')).toBeInTheDocument();

    rerender(<MatchScoreGauge score={-5} />);
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('Weak Match')).toBeInTheDocument();
  });
});
