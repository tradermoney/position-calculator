import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AppProvider } from '../../contexts/AppContext';
import PositionForm from '../../components/Position/PositionForm';

// Mock组件包装器
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const theme = createTheme();
  return (
    <ThemeProvider theme={theme}>
      <AppProvider>
        {children}
      </AppProvider>
    </ThemeProvider>
  );
};

describe('PositionForm组件测试', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该渲染所有必要的表单字段', () => {
    render(
      <TestWrapper>
        <PositionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      </TestWrapper>
    );

    // 检查所有表单字段是否存在
    expect(screen.getByLabelText(/币种符号/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/仓位方向/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/杠杆倍数/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/开仓价格/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/持有数量/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/保证金/i)).toBeInTheDocument();
  });

  it('应该显示提交和取消按钮', () => {
    render(
      <TestWrapper>
        <PositionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      </TestWrapper>
    );

    expect(screen.getByRole('button', { name: /创建仓位/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /取消/i })).toBeInTheDocument();
  });

  it('应该在编辑模式下显示正确的标题和按钮文本', () => {
    const mockPosition = {
      id: '1',
      symbol: 'BTC/USDT',
      side: 'long' as const,
      leverage: 10,
      entryPrice: 50000,
      quantity: 1,
      margin: 5000,
      status: 'open' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    render(
      <TestWrapper>
        <PositionForm 
          position={mockPosition}
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      </TestWrapper>
    );

    expect(screen.getByRole('button', { name: /更新仓位/i })).toBeInTheDocument();
  });

  it('应该正确填充编辑模式下的表单字段', () => {
    const mockPosition = {
      id: '1',
      symbol: 'BTC/USDT',
      side: 'long' as const,
      leverage: 10,
      entryPrice: 50000,
      quantity: 1,
      margin: 5000,
      status: 'open' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    render(
      <TestWrapper>
        <PositionForm 
          position={mockPosition}
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      </TestWrapper>
    );

    // 检查表单字段是否正确填充
    expect(screen.getByDisplayValue('BTC/USDT')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    expect(screen.getByDisplayValue('50000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('5000')).toBeInTheDocument();
  });

  it('应该验证必填字段', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <PositionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      </TestWrapper>
    );

    // 尝试提交空表单
    const submitButton = screen.getByRole('button', { name: /创建仓位/i });
    await user.click(submitButton);

    // 应该显示验证错误
    await waitFor(() => {
      expect(screen.getByText(/币种符号不能为空/i)).toBeInTheDocument();
    });
  });

  it('应该验证数值字段的有效性', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <PositionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      </TestWrapper>
    );

    // 输入无效的杠杆倍数
    const leverageInput = screen.getByLabelText(/杠杆倍数/i);
    await user.clear(leverageInput);
    await user.type(leverageInput, '0');

    const submitButton = screen.getByRole('button', { name: /创建仓位/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/杠杆倍数必须在1-125之间/i)).toBeInTheDocument();
    });
  });

  it('应该在表单有效时调用onSubmit', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <PositionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      </TestWrapper>
    );

    // 填写有效的表单数据
    await user.type(screen.getByLabelText(/币种符号/i), 'BTC/USDT');
    await user.type(screen.getByLabelText(/杠杆倍数/i), '10');
    await user.type(screen.getByLabelText(/开仓价格/i), '50000');
    await user.type(screen.getByLabelText(/持有数量/i), '1');
    await user.type(screen.getByLabelText(/保证金/i), '5000');

    const submitButton = screen.getByRole('button', { name: /创建仓位/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });
  });

  it('应该在点击取消按钮时调用onCancel', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <PositionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      </TestWrapper>
    );

    const cancelButton = screen.getByRole('button', { name: /取消/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('应该正确计算并显示爆仓价格', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <PositionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      </TestWrapper>
    );

    // 输入仓位数据
    await user.type(screen.getByLabelText(/币种符号/i), 'BTC/USDT');
    await user.selectOptions(screen.getByLabelText(/仓位方向/i), 'long');
    await user.type(screen.getByLabelText(/杠杆倍数/i), '10');
    await user.type(screen.getByLabelText(/开仓价格/i), '50000');
    await user.type(screen.getByLabelText(/持有数量/i), '1');
    await user.type(screen.getByLabelText(/保证金/i), '5000');

    // 应该显示计算出的爆仓价格
    await waitFor(() => {
      expect(screen.getByText(/爆仓价格/i)).toBeInTheDocument();
      // 多头10倍杠杆的爆仓价格约为45250
      expect(screen.getByText(/45,250/)).toBeInTheDocument();
    });
  });

  it('应该支持仓位方向切换', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <PositionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      </TestWrapper>
    );

    const sideSelect = screen.getByLabelText(/仓位方向/i);
    
    // 默认应该是多头
    expect(sideSelect).toHaveValue('long');
    
    // 切换到空头
    await user.selectOptions(sideSelect, 'short');
    expect(sideSelect).toHaveValue('short');
  });
});
