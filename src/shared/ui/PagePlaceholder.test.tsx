import { render, screen } from '@testing-library/react';
import { PagePlaceholder } from './PagePlaceholder';

describe('PagePlaceholder', () => {
  it('会渲染标题、描述和阶段标签', () => {
    render(<PagePlaceholder title="交易列表" description="模块占位页" badge="M1" />);

    expect(screen.getByText('交易列表')).toBeInTheDocument();
    expect(screen.getByText('模块占位页')).toBeInTheDocument();
    expect(screen.getByText('M1')).toBeInTheDocument();
  });
});

