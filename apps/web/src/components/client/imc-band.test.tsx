import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { ImcBand } from './imc-band';

afterEach(cleanup);

describe('ImcBand (smoke de DOM — confirma jsdom + RTL funcionando)', () => {
  it('renderiza a faixa com os marcos início e agora', () => {
    const { getByRole, getByText } = render(<ImcBand initialBmi={32.6} currentBmi={29.8} />);
    expect(getByRole('img', { name: /faixa de imc/i })).toBeTruthy();
    expect(getByText('início')).toBeTruthy();
    expect(getByText('agora')).toBeTruthy();
  });

  it('omite "início" quando não há IMC inicial', () => {
    const { queryByText, getByText } = render(<ImcBand initialBmi={null} currentBmi={29.8} />);
    expect(queryByText('início')).toBeNull();
    expect(getByText('agora')).toBeTruthy();
  });
});
