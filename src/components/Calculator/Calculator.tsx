import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Paper,
  Grid,
  Button,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Divider,
  Alert,
  TextField,
} from '@mui/material';
import {
  Clear as ClearIcon,
  Backspace as BackspaceIcon,
  History as HistoryIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { CalculatorStorage, CalculatorRecord } from '../../utils/calculatorStorage';
import { CalculatorContainer, DisplaySection, ButtonSection, HistorySection } from '../../styles/calculator';

interface CalculatorProps {}

export default function Calculator({}: CalculatorProps) {
  const [display, setDisplay] = useState<string>('0');
  const [expression, setExpression] = useState<string>('');
  const [history, setHistory] = useState<CalculatorRecord[]>([]);
  const [error, setError] = useState<string>('');
  const [isResult, setIsResult] = useState<boolean>(false);
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 加载历史记录
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const records = await CalculatorStorage.getRecords(20);
        setHistory(records);
      } catch (error) {
        console.error('加载历史记录失败:', error);
      }
    };
    loadHistory();
  }, []);

  // 清空显示
  const handleClear = useCallback(() => {
    setDisplay('0');
    setExpression('');
    setError('');
    setIsResult(false);
    setCursorPosition(0);
    setIsEditing(false);
  }, []);



  // 设置光标位置
  const setCursorPositionInInput = useCallback((position: number) => {
    if (inputRef.current && typeof inputRef.current.setSelectionRange === 'function') {
      try {
        inputRef.current.setSelectionRange(position, position);
        setCursorPosition(position);
        console.log('setCursorPositionInInput - position set to:', position);
      } catch (error) {
        console.warn('设置光标位置失败:', error);
        setCursorPosition(position);
      }
    }
  }, []);

  // 进入编辑模式
  const enterEditMode = useCallback(() => {
    setIsEditing(true);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        setCursorPositionInInput(expression.length);
      }
    }, 0);
  }, [expression.length, setCursorPositionInInput]);

  // 退出编辑模式
  const exitEditMode = useCallback(() => {
    setIsEditing(false);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  }, []);

  // 退格
  const handleBackspace = useCallback(() => {
    if (isResult) {
      handleClear();
      return;
    }

    if (isEditing) {
      // 编辑模式下，在光标位置删除字符
      if (cursorPosition > 0) {
        const newExpression = expression.slice(0, cursorPosition - 1) + expression.slice(cursorPosition);
        setExpression(newExpression);
        setDisplay(newExpression || '0');
        const newPosition = cursorPosition - 1;
        setCursorPosition(newPosition);
        setTimeout(() => setCursorPositionInInput(newPosition), 0);
      }
    } else {
      // 非编辑模式下，删除最后一个字符
      if (expression.length <= 1) {
        setDisplay('0');
        setExpression('');
        setCursorPosition(0);
      } else {
        const newExpression = expression.slice(0, -1);
        setExpression(newExpression);
        setDisplay(newExpression || '0');
        setCursorPosition(newExpression.length);
      }
    }
    setError('');
  }, [expression, isResult, isEditing, cursorPosition, handleClear, setCursorPositionInInput]);

  // 输入数字或操作符
  const handleInput = useCallback((value: string) => {
    setError('');

    if (isResult && /[0-9]/.test(value)) {
      // 如果当前显示的是结果，输入数字时开始新的计算
      setExpression(value);
      setDisplay(value);
      setIsResult(false);
      setCursorPosition(1);
      return;
    }

    if (isResult && /[+\-*/()]/.test(value)) {
      // 如果当前显示的是结果，输入操作符时继续计算
      const newExpression = display + value;
      setExpression(newExpression);
      setDisplay(newExpression);
      setIsResult(false);
      setCursorPosition(newExpression.length);
      return;
    }

    let newExpression: string;
    let newPosition: number;

    if (expression === '' && value === '0') {
      return; // 避免开头多个0
    }

    if (isEditing) {
      // 编辑模式下，在光标位置插入字符
      // 使用保存的光标位置
      const currentCursorPos = cursorPosition;
      console.log('handleInput - isEditing:', isEditing, 'currentCursorPos:', currentCursorPos, 'cursorPosition:', cursorPosition, 'value:', value);

      if (expression === '0' && /[0-9]/.test(value)) {
        newExpression = value;
        newPosition = 1;
      } else {
        newExpression = expression.slice(0, currentCursorPos) + value + expression.slice(currentCursorPos);
        newPosition = currentCursorPos + 1;
      }
      setCursorPosition(newPosition);
      setTimeout(() => setCursorPositionInInput(newPosition), 0);
    } else {
      // 非编辑模式下，在末尾添加字符
      if (expression === '0' && /[0-9]/.test(value)) {
        newExpression = value;
      } else {
        newExpression = expression + value;
      }
      newPosition = newExpression.length;
      setCursorPosition(newPosition);
    }

    setExpression(newExpression);
    setDisplay(newExpression);
    setIsResult(false);

    // 如果在编辑模式下，重新聚焦输入框
    if (isEditing) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          setCursorPositionInInput(newPosition);
        }
      }, 0);
    }
  }, [expression, display, isResult, isEditing, cursorPosition, setCursorPositionInInput]);

  // 计算结果
  const handleCalculate = useCallback(async () => {
    if (!expression || expression === '0') return;
    
    try {
      // 验证表达式
      if (!isValidExpression(expression)) {
        setError('无效的表达式');
        return;
      }
      
      // 使用安全的计算方法
      const result = evaluateExpression(expression);
      
      if (!isFinite(result)) {
        setError('计算结果无效');
        return;
      }
      
      const resultStr = formatResult(result);
      setDisplay(resultStr);
      setIsResult(true);
      setError('');
      setIsEditing(false);
      setCursorPosition(0);

      // 保存到历史记录
      const record: CalculatorRecord = {
        id: Date.now().toString(),
        expression,
        result: resultStr,
        calculatedAt: new Date(),
      };
      
      await CalculatorStorage.saveRecord(record);
      
      // 重新加载历史记录
      const updatedHistory = await CalculatorStorage.getRecords(20);
      setHistory(updatedHistory);
      
    } catch (error) {
      setError('计算错误');
      console.error('计算错误:', error);
    }
  }, [expression]);

  // 处理键盘事件
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!isEditing) return;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        if (cursorPosition > 0) {
          const newPosition = cursorPosition - 1;
          setCursorPosition(newPosition);
          setCursorPositionInInput(newPosition);
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (cursorPosition < expression.length) {
          const newPosition = cursorPosition + 1;
          setCursorPosition(newPosition);
          setCursorPositionInInput(newPosition);
        }
        break;
      case 'Home':
        event.preventDefault();
        setCursorPosition(0);
        setCursorPositionInInput(0);
        break;
      case 'End':
        event.preventDefault();
        const endPosition = expression.length;
        setCursorPosition(endPosition);
        setCursorPositionInInput(endPosition);
        break;
      case 'Delete':
        event.preventDefault();
        if (cursorPosition < expression.length) {
          const newExpression = expression.slice(0, cursorPosition) + expression.slice(cursorPosition + 1);
          setExpression(newExpression);
          setDisplay(newExpression || '0');
        }
        break;
      case 'Backspace':
        event.preventDefault();
        handleBackspace();
        break;
      case 'Enter':
      case '=':
        event.preventDefault();
        handleCalculate();
        break;
      case 'Escape':
        event.preventDefault();
        exitEditMode();
        break;
      default:
        // 允许数字、操作符和小数点
        if (/[0-9+\-*/.()]/.test(event.key)) {
          event.preventDefault();
          handleInput(event.key === '*' ? '*' : event.key);
        }
        break;
    }
  }, [isEditing, cursorPosition, expression, setCursorPositionInInput, handleBackspace, handleCalculate, exitEditMode, handleInput]);

  // 处理输入框变化
  const handleExpressionChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setExpression(newValue);
    setDisplay(newValue || '0');
    setError('');
    setIsResult(false);
    // 光标位置会通过onSelect和onClick事件自动更新
  }, []);

  // 从历史记录恢复
  const handleRestoreFromHistory = useCallback((record: CalculatorRecord) => {
    setExpression(record.expression);
    setDisplay(record.expression);
    setIsResult(false);
    setError('');
    setCursorPosition(record.expression.length);
    setIsEditing(false);
  }, []);

  // 清空历史记录
  const handleClearHistory = useCallback(async () => {
    try {
      await CalculatorStorage.clearAllRecords();
      setHistory([]);
    } catch (error) {
      console.error('清空历史记录失败:', error);
    }
  }, []);

  // 验证表达式是否有效
  const isValidExpression = (expr: string): boolean => {
    // 检查括号是否匹配
    let parenthesesCount = 0;
    for (const char of expr) {
      if (char === '(') parenthesesCount++;
      if (char === ')') parenthesesCount--;
      if (parenthesesCount < 0) return false;
    }
    if (parenthesesCount !== 0) return false;
    
    // 检查是否包含无效字符
    if (!/^[0-9+\-*/().\s]+$/.test(expr)) return false;
    
    // 检查是否以操作符结尾
    if (/[+\-*/]$/.test(expr.trim())) return false;
    
    return true;
  };

  // 安全计算表达式
  const evaluateExpression = (expr: string): number => {
    // 移除空格
    const cleanExpr = expr.replace(/\s/g, '');
    
    // 使用Function构造器进行安全计算
    try {
      const result = Function(`"use strict"; return (${cleanExpr})`)();
      return Number(result);
    } catch (error) {
      throw new Error('计算表达式失败');
    }
  };

  // 格式化结果
  const formatResult = (result: number): string => {
    if (Number.isInteger(result)) {
      return result.toString();
    }
    
    // 保留最多10位小数，去除尾随零
    return parseFloat(result.toFixed(10)).toString();
  };

  // 格式化时间
  const formatTime = (date: Date): string => {
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <CalculatorContainer>
      <Grid container spacing={3}>
        {/* 计算器主体 */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            {/* 显示区域 */}
            <DisplaySection>
              <Typography variant="body2" color="textSecondary" sx={{ minHeight: '20px', mb: 1 }}>
                {!isEditing && expression && !isResult ? expression : ''}
              </Typography>

              {isEditing ? (
                <TextField
                  ref={inputRef}
                  value={expression}
                  onChange={handleExpressionChange}
                  onKeyDown={handleKeyDown}
                  onBlur={exitEditMode}
                  onSelect={(e) => {
                    // 当用户选择文本或移动光标时更新光标位置
                    const target = e.target as HTMLInputElement;
                    const newPos = target.selectionStart ?? 0;
                    setCursorPosition(newPos);
                    console.log('onSelect - cursor position updated to:', newPos);
                  }}
                  onClick={(e) => {
                    // 当用户点击输入框时更新光标位置
                    const target = e.target as HTMLInputElement;
                    const newPos = target.selectionStart ?? 0;
                    setCursorPosition(newPos);
                    console.log('onClick - cursor position updated to:', newPos);
                  }}
                  variant="outlined"
                  fullWidth
                  placeholder="输入表达式..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontFamily: 'monospace',
                      fontSize: '1.5rem',
                      textAlign: 'right',
                      '& fieldset': {
                        borderColor: 'primary.main',
                        borderWidth: 2,
                      },
                    },
                    '& .MuiOutlinedInput-input': {
                      textAlign: 'right',
                      padding: '12px 14px',
                    },
                  }}
                />
              ) : (
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: 'monospace',
                    textAlign: 'right',
                    wordBreak: 'break-all',
                    minHeight: '40px',
                    color: isResult ? 'primary.main' : 'text.primary',
                    cursor: 'pointer',
                    padding: '8px',
                    border: '2px solid transparent',
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      border: '2px solid',
                      borderColor: 'primary.main',
                    }
                  }}
                  onClick={enterEditMode}
                >
                  {display}
                </Typography>
              )}

              {error && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {error}
                </Alert>
              )}
            </DisplaySection>

            {/* 按钮区域 */}
            <ButtonSection>
              <Grid container spacing={1}>
                {/* 第一行：清空、退格、括号、除法 */}
                <Grid item xs={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleClear}
                    sx={{ height: 60, fontSize: '1.1rem' }}
                  >
                    C
                  </Button>
                </Grid>
                <Grid item xs={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleBackspace}
                    sx={{ height: 60 }}
                  >
                    <BackspaceIcon />
                  </Button>
                </Grid>
                <Grid item xs={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => handleInput('(')}
                    sx={{ height: 60, fontSize: '1.1rem' }}
                  >
                    (
                  </Button>
                </Grid>
                <Grid item xs={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => handleInput(')')}
                    sx={{ height: 60, fontSize: '1.1rem' }}
                  >
                    )
                  </Button>
                </Grid>

                {/* 第二行：7、8、9、除法 */}
                <Grid item xs={3}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleInput('7')}
                    sx={{ height: 60, fontSize: '1.2rem' }}
                  >
                    7
                  </Button>
                </Grid>
                <Grid item xs={3}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleInput('8')}
                    sx={{ height: 60, fontSize: '1.2rem' }}
                  >
                    8
                  </Button>
                </Grid>
                <Grid item xs={3}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleInput('9')}
                    sx={{ height: 60, fontSize: '1.2rem' }}
                  >
                    9
                  </Button>
                </Grid>
                <Grid item xs={3}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    onClick={() => handleInput('/')}
                    sx={{ height: 60, fontSize: '1.2rem' }}
                  >
                    ÷
                  </Button>
                </Grid>

                {/* 第三行：4、5、6、乘法 */}
                <Grid item xs={3}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleInput('4')}
                    sx={{ height: 60, fontSize: '1.2rem' }}
                  >
                    4
                  </Button>
                </Grid>
                <Grid item xs={3}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleInput('5')}
                    sx={{ height: 60, fontSize: '1.2rem' }}
                  >
                    5
                  </Button>
                </Grid>
                <Grid item xs={3}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleInput('6')}
                    sx={{ height: 60, fontSize: '1.2rem' }}
                  >
                    6
                  </Button>
                </Grid>
                <Grid item xs={3}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    onClick={() => handleInput('*')}
                    onMouseDown={(e) => {
                      // 防止按钮点击时输入框失去焦点
                      if (isEditing) {
                        e.preventDefault();
                      }
                    }}
                    sx={{ height: 60, fontSize: '1.2rem' }}
                  >
                    ×
                  </Button>
                </Grid>

                {/* 第四行：1、2、3、减法 */}
                <Grid item xs={3}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleInput('1')}
                    sx={{ height: 60, fontSize: '1.2rem' }}
                  >
                    1
                  </Button>
                </Grid>
                <Grid item xs={3}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleInput('2')}
                    sx={{ height: 60, fontSize: '1.2rem' }}
                  >
                    2
                  </Button>
                </Grid>
                <Grid item xs={3}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleInput('3')}
                    sx={{ height: 60, fontSize: '1.2rem' }}
                  >
                    3
                  </Button>
                </Grid>
                <Grid item xs={3}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    onClick={() => handleInput('-')}
                    sx={{ height: 60, fontSize: '1.2rem' }}
                  >
                    −
                  </Button>
                </Grid>

                {/* 第五行：0、小数点、等号、加法 */}
                <Grid item xs={6}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleInput('0')}
                    sx={{ height: 60, fontSize: '1.2rem' }}
                  >
                    0
                  </Button>
                </Grid>
                <Grid item xs={3}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleInput('.')}
                    sx={{ height: 60, fontSize: '1.2rem' }}
                  >
                    .
                  </Button>
                </Grid>
                <Grid item xs={3}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    onClick={() => handleInput('+')}
                    sx={{ height: 60, fontSize: '1.2rem' }}
                  >
                    +
                  </Button>
                </Grid>

                {/* 第六行：等号 */}
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleCalculate}
                    sx={{ height: 60, fontSize: '1.3rem', fontWeight: 'bold' }}
                  >
                    =
                  </Button>
                </Grid>
              </Grid>
            </ButtonSection>
          </Paper>
        </Grid>

        {/* 历史记录 */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, height: 'fit-content' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HistoryIcon />
                历史记录
              </Typography>
              {history.length > 0 && (
                <Tooltip title="清空历史记录">
                  <IconButton size="small" onClick={handleClearHistory}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <HistorySection>
              {history.length === 0 ? (
                <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                  暂无计算记录
                </Typography>
              ) : (
                history.map((record) => (
                  <Box
                    key={record.id}
                    sx={{
                      p: 2,
                      mb: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                    onClick={() => handleRestoreFromHistory(record)}
                  >
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5 }}>
                      {record.expression}
                    </Typography>
                    <Typography variant="body2" color="primary" sx={{ fontFamily: 'monospace', fontWeight: 'bold', mb: 0.5 }}>
                      = {record.result}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {formatTime(record.calculatedAt)}
                    </Typography>
                  </Box>
                ))
              )}
            </HistorySection>
          </Paper>
        </Grid>
      </Grid>
    </CalculatorContainer>
  );
}
