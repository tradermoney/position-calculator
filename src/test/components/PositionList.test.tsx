import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AppContext } from '../../contexts/AppContext';
import PositionList from '../../components/Position/PositionList';
import { Position } from '../../types';

// Mock数据
const mockPositions: Position[] = [
  {
    id: '1',
    symbol: 'BTC/USDT',
    side: 'long',
    leverage: 10,
    entryPrice: 50000,
    quantity: 1,
    margin: 5000,
    status: 'open',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    symbol: 'ETH/USDT',
    side: 'short',
    leverage: 20,
    entryPrice: 3000,
    quantity: 2,
    margin: 300,
    status: 'open',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  },
  {
    id: '3',
    symbol: 'BNB/USDT',
    side: 'long',
    leverage: 5,
    entryPrice: 400,
    quantity: 10,
    margin: 800,
    status: 'closed',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03')
  }
];

// Mock上下文包装器
const TestWrapper = ({ 
  children, 
  positions = mockPositions 
}: { 
  children: React.ReactNode;
  positions?: Position[];
}) => {
  const theme = createTheme();
  const mockState = {
    positions,
    theme: 'light' as const,
    currentPrices: {
      'BTC/USDT': 52000,
      'ETH/USDT': 2800,
      'BNB/USDT': 420
    }
  };
  
  const mockDispatch = vi.fn();

  return (
    <ThemeProvider theme={theme}>
      <AppContext.Provider value={{ state: mockState, dispatch: mockDispatch }}>
        {children}
      </AppContext.Provider>
    </ThemeProvider>
  );
};

describe('PositionList组件测试', () => {
  const mockOnEditPosition = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该渲染仓位列表', () => {
    render(
      <TestWrapper>
        <PositionList onEditPosition={mockOnEditPosition} />
      </TestWrapper>
    );

    // 检查是否显示了所有仓位
    expect(screen.getByText('BTC/USDT')).toBeInTheDocument();
    expect(screen.getByText('ETH/USDT')).toBeInTheDocument();
    expect(screen.getByText('BNB/USDT')).toBeInTheDocument();
  });

  it('应该显示仓位的基本信息', () => {
    render(
      <TestWrapper>
        <PositionList onEditPosition={mockOnEditPosition} />
      </TestWrapper>
    );

    // 检查BTC仓位信息
    expect(screen.getByText('多头')).toBeInTheDocument();
    expect(screen.getByText('10x')).toBeInTheDocument();
    expect(screen.getByText('50,000.0000')).toBeInTheDocument();
    expect(screen.getByText('1.0000')).toBeInTheDocument();
    expect(screen.getByText('5,000.00')).toBeInTheDocument();
  });

  it('应该显示空头仓位', () => {
    render(
      <TestWrapper>
        <PositionList onEditPosition={mockOnEditPosition} />
      </TestWrapper>
    );

    // 检查ETH空头仓位
    expect(screen.getByText('空头')).toBeInTheDocument();
    expect(screen.getByText('20x')).toBeInTheDocument();
  });

  it('应该计算并显示盈亏', () => {
    render(
      <TestWrapper>
        <PositionList onEditPosition={mockOnEditPosition} />
      </TestWrapper>
    );

    // BTC多头：当前价52000，开仓价50000，数量1，盈利2000
    expect(screen.getByText('+2,000.00')).toBeInTheDocument();
    
    // ETH空头：当前价2800，开仓价3000，数量2，盈利400
    expect(screen.getByText('+400.00')).toBeInTheDocument();
  });

  it('应该显示收益率', () => {
    render(
      <TestWrapper>
        <PositionList onEditPosition={mockOnEditPosition} />
      </TestWrapper>
    );

    // BTC: 盈利2000，保证金5000，收益率40%
    expect(screen.getByText('+40.00%')).toBeInTheDocument();
    
    // ETH: 盈利400，保证金300，收益率133.33%
    expect(screen.getByText('+133.33%')).toBeInTheDocument();
  });

  it('应该显示爆仓价格', () => {
    render(
      <TestWrapper>
        <PositionList onEditPosition={mockOnEditPosition} />
      </TestWrapper>
    );

    // 应该显示计算出的爆仓价格
    expect(screen.getByText(/45,250/)).toBeInTheDocument(); // BTC多头爆仓价格
  });

  it('应该在没有仓位时显示空状态', () => {
    render(
      <TestWrapper positions={[]}>
        <PositionList onEditPosition={mockOnEditPosition} />
      </TestWrapper>
    );

    expect(screen.getByText(/暂无仓位/i)).toBeInTheDocument();
    expect(screen.getByText(/创建您的第一个仓位/i)).toBeInTheDocument();
  });

  it('应该支持编辑仓位', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <PositionList onEditPosition={mockOnEditPosition} />
      </TestWrapper>
    );

    // 查找并点击编辑按钮
    const editButtons = screen.getAllByLabelText(/编辑仓位/i);
    await user.click(editButtons[0]);

    expect(mockOnEditPosition).toHaveBeenCalledWith(mockPositions[0]);
  });

  it('应该支持删除仓位', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <PositionList onEditPosition={mockOnEditPosition} />
      </TestWrapper>
    );

    // 查找并点击删除按钮
    const deleteButtons = screen.getAllByLabelText(/删除仓位/i);
    await user.click(deleteButtons[0]);

    // 应该显示确认对话框
    expect(screen.getByText(/确认删除/i)).toBeInTheDocument();
    expect(screen.getByText(/确定要删除这个仓位吗/i)).toBeInTheDocument();
  });

  it('应该按状态过滤仓位', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <PositionList onEditPosition={mockOnEditPosition} />
      </TestWrapper>
    );

    // 默认显示所有仓位
    expect(screen.getByText('BTC/USDT')).toBeInTheDocument();
    expect(screen.getByText('BNB/USDT')).toBeInTheDocument();

    // 切换到只显示开仓仓位
    const filterSelect = screen.getByLabelText(/状态筛选/i);
    await user.selectOptions(filterSelect, 'open');

    // 应该只显示开仓的仓位
    expect(screen.getByText('BTC/USDT')).toBeInTheDocument();
    expect(screen.getByText('ETH/USDT')).toBeInTheDocument();
    expect(screen.queryByText('BNB/USDT')).not.toBeInTheDocument();
  });

  it('应该支持搜索仓位', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <PositionList onEditPosition={mockOnEditPosition} />
      </TestWrapper>
    );

    // 搜索BTC
    const searchInput = screen.getByPlaceholderText(/搜索币种/i);
    await user.type(searchInput, 'BTC');

    // 应该只显示BTC仓位
    expect(screen.getByText('BTC/USDT')).toBeInTheDocument();
    expect(screen.queryByText('ETH/USDT')).not.toBeInTheDocument();
    expect(screen.queryByText('BNB/USDT')).not.toBeInTheDocument();
  });

  it('应该显示仓位统计信息', () => {
    render(
      <TestWrapper>
        <PositionList onEditPosition={mockOnEditPosition} />
      </TestWrapper>
    );

    // 应该显示总仓位数
    expect(screen.getByText(/总仓位: 3/i)).toBeInTheDocument();
    
    // 应该显示开仓仓位数
    expect(screen.getByText(/开仓: 2/i)).toBeInTheDocument();
    
    // 应该显示总盈亏
    expect(screen.getByText(/总盈亏/i)).toBeInTheDocument();
  });

  it('应该正确显示风险等级', () => {
    render(
      <TestWrapper>
        <PositionList onEditPosition={mockOnEditPosition} />
      </TestWrapper>
    );

    // 应该显示风险等级指示器
    expect(screen.getByText(/风险等级/i)).toBeInTheDocument();
  });

  it('应该支持批量操作', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <PositionList onEditPosition={mockOnEditPosition} />
      </TestWrapper>
    );

    // 选择多个仓位
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);

    // 应该显示批量操作按钮
    expect(screen.getByText(/批量关闭/i)).toBeInTheDocument();
    expect(screen.getByText(/批量删除/i)).toBeInTheDocument();
  });
});
