import React, { useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

// 仓位方向枚举
enum PositionSide {
  LONG = 'long',   // 多头
  SHORT = 'short'  // 空头
}

// 仓位状态枚举
enum PositionStatus {
  ACTIVE = 'active',     // 活跃
  CLOSED = 'closed',     // 已关闭
  LIQUIDATED = 'liquidated', // 已爆仓
  PARTIAL = 'partial'    // 部分平仓
}

// 基础仓位接口
interface Position {
  id: string;
  symbol: string;           // 币种符号，如 'BTC/USDT'
  side: PositionSide;       // 仓位方向
  leverage: number;         // 杠杆倍数
  entryPrice: number;       // 开仓价格
  quantity: number;         // 持有数量
  margin: number;           // 保证金
  status: PositionStatus;   // 仓位状态
  createdAt: Date;          // 创建时间
  updatedAt: Date;          // 更新时间
}

function App() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    symbol: '',
    side: PositionSide.LONG,
    leverage: 10,
    entryPrice: '',
    quantity: '',
    margin: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPosition: Position = {
      id: Date.now().toString(),
      symbol: formData.symbol.toUpperCase(),
      side: formData.side,
      leverage: formData.leverage,
      entryPrice: parseFloat(formData.entryPrice),
      quantity: parseFloat(formData.quantity),
      margin: parseFloat(formData.margin),
      status: PositionStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setPositions([...positions, newPosition]);
    setOpenDialog(false);
    setFormData({
      symbol: '',
      side: PositionSide.LONG,
      leverage: 10,
      entryPrice: '',
      quantity: '',
      margin: ''
    });
  };

  const calculateLiquidationPrice = (position: Position) => {
    const maintenanceMarginRate = 0.005;
    if (position.side === PositionSide.LONG) {
      return position.entryPrice * (1 - 1/position.leverage + maintenanceMarginRate);
    } else {
      return position.entryPrice * (1 + 1/position.leverage - maintenanceMarginRate);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#fafafa',
        py: 4
      }}
    >
      <Container maxWidth="lg" sx={{ width: '100%' }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} width="100%">
            <Typography variant="h3" component="h1" textAlign="center" sx={{ flexGrow: 1 }}>
              加密货币仓位计算器
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
            >
              创建仓位
            </Button>
          </Box>

          {positions.length === 0 ? (
            <Box display="flex" justifyContent="center" width="100%">
              <Card sx={{ maxWidth: 600, width: '100%' }}>
                <CardContent>
                  <Typography variant="body1" color="textSecondary" textAlign="center" py={4}>
                    暂无仓位数据，请点击"创建仓位"按钮添加新仓位
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ) : (
            <Box width="100%">
              <Grid container spacing={3} justifyContent="center">
                {positions.map((position) => (
                  <Grid item xs={12} md={6} lg={4} key={position.id}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Typography variant="h6" component="div">
                            {position.symbol}
                          </Typography>
                          <Chip
                            label={position.side === PositionSide.LONG ? '多头' : '空头'}
                            color={position.side === PositionSide.LONG ? 'success' : 'error'}
                            size="small"
                          />
                        </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          杠杆
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {position.leverage}x
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          开仓价格
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          ${position.entryPrice.toFixed(4)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          数量
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {position.quantity.toFixed(4)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          保证金
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          ${position.margin.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="textSecondary">
                          爆仓价格
                        </Typography>
                        <Typography variant="body1" fontWeight={500} color="error">
                          ${calculateLiquidationPrice(position).toFixed(4)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
              </Grid>
            </Box>
          )}
        </Box>
      </Container>

      {/* 创建仓位对话框 */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle textAlign="center">创建新仓位</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="币种符号"
                    value={formData.symbol}
                    onChange={(e) => setFormData({...formData, symbol: e.target.value})}
                    placeholder="例如: BTC/USDT"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>仓位方向</InputLabel>
                    <Select
                      value={formData.side}
                      label="仓位方向"
                      onChange={(e) => setFormData({...formData, side: e.target.value as PositionSide})}
                    >
                      <MenuItem value={PositionSide.LONG}>多头 (Long)</MenuItem>
                      <MenuItem value={PositionSide.SHORT}>空头 (Short)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="杠杆倍数"
                    type="number"
                    value={formData.leverage}
                    onChange={(e) => setFormData({...formData, leverage: parseInt(e.target.value)})}
                    inputProps={{ min: 1, max: 125 }}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="开仓价格"
                    type="number"
                    value={formData.entryPrice}
                    onChange={(e) => setFormData({...formData, entryPrice: e.target.value})}
                    inputProps={{ min: 0, step: 'any' }}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="持有数量"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    inputProps={{ min: 0, step: 'any' }}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="保证金"
                    type="number"
                    value={formData.margin}
                    onChange={(e) => setFormData({...formData, margin: e.target.value})}
                    inputProps={{ min: 0, step: 'any' }}
                    required
                  />
                </Grid>
              </Grid>
            </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>取消</Button>
          <Button onClick={handleSubmit} variant="contained">创建仓位</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default App;
