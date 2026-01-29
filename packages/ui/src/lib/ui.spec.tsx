import { render } from '@testing-library/react';

import CostmateUi from './ui';

describe('CostmateUi', () => {
  
  it('should render successfully', () => {
    const { baseElement } = render(<CostmateUi />);
    expect(baseElement).toBeTruthy();
  });
  
});
