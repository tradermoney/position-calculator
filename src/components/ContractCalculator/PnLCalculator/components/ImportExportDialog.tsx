import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  Alert,
  Snackbar,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
  Upload as UploadIcon,
  FileUpload as FileUploadIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { Position } from '../types';
import { PositionSide } from '../../../../utils/contractCalculations';

interface PositionConfig {
  side: PositionSide;
  capital: number;
  leverage: number;
  positions: Position[];
  exportedAt?: string;
  version?: string;
}

interface ImportExportDialogProps {
  open: boolean;
  onClose: () => void;
  side: PositionSide;
  capital: number;
  leverage: number;
  positions: Position[];
  onImportPositions: (positions: Position[]) => void;
  onImportConfig: (config: PositionConfig) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`import-export-tabpanel-${index}`}
      aria-labelledby={`import-export-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ImportExportDialog({
  open,
  onClose,
  side,
  capital,
  leverage,
  positions,
  onImportPositions,
  onImportConfig,
}: ImportExportDialogProps) {
  const [tabValue, setTabValue] = useState(0);
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
    setJsonText('');
  };

  const handleClose = () => {
    setTabValue(0);
    setJsonText('');
    setError('');
    setSuccess('');
    onClose();
  };

  // 导出功能
  const handleExportToFile = () => {
    try {
      const config: PositionConfig = {
        side,
        capital,
        leverage,
        positions,
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      };
      const dataStr = JSON.stringify(config, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `position-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setSuccess('仓位配置已导出到文件');
    } catch (error) {
      setError('导出失败：' + (error as Error).message);
    }
  };

  const handleCopyToClipboard = () => {
    try {
      const config: PositionConfig = {
        side,
        capital,
        leverage,
        positions,
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      };
      const dataStr = JSON.stringify(config, null, 2);
      navigator.clipboard.writeText(dataStr).then(() => {
        setSuccess('仓位配置已复制到剪切板');
      }).catch(() => {
        setError('复制到剪切板失败');
      });
    } catch (error) {
      setError('复制失败：' + (error as Error).message);
    }
  };

  // 导入功能
  const handleImportFromClipboard = () => {
    try {
      const parsed = JSON.parse(jsonText);
      
      // 检查是否是完整配置格式
      if (parsed.side !== undefined && parsed.capital !== undefined && parsed.leverage !== undefined && parsed.positions) {
        onImportConfig(parsed as PositionConfig);
        setSuccess('完整仓位配置已从剪切板导入');
        handleClose();
      } 
      // 检查是否是委托单数组格式（向后兼容）
      else if (Array.isArray(parsed)) {
        onImportPositions(parsed);
        setSuccess('委托单数据已从剪切板导入');
        handleClose();
      } else {
        setError('无效的JSON格式：数据必须是完整配置或委托单数组');
      }
    } catch (error) {
      setError('JSON解析失败：' + (error as Error).message);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        
        // 检查是否是完整配置格式
        if (parsed.side !== undefined && parsed.capital !== undefined && parsed.leverage !== undefined && parsed.positions) {
          onImportConfig(parsed as PositionConfig);
          setSuccess('完整仓位配置已从文件导入');
          handleClose();
        } 
        // 检查是否是委托单数组格式（向后兼容）
        else if (Array.isArray(parsed)) {
          onImportPositions(parsed);
          setSuccess('委托单数据已从文件导入');
          handleClose();
        } else {
          setError('无效的JSON格式：数据必须是完整配置或委托单数组');
        }
      } catch (error) {
        setError('文件解析失败：' + (error as Error).message);
      }
    };
    reader.readAsText(file);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJsonText(text);
    } catch {
      setError('无法读取剪切板内容');
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">导入/导出仓位数据</Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="导入导出标签">
            <Tab label="导出" />
            <Tab label="导入" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            将当前完整仓位配置导出为JSON格式（包括方向、资金、杠杆和委托单）
          </Typography>
          
          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExportToFile}
              sx={{ minWidth: 160 }}
            >
              下载配置文件
            </Button>
            <Button
              variant="outlined"
              startIcon={<CopyIcon />}
              onClick={handleCopyToClipboard}
              sx={{ minWidth: 160 }}
            >
              复制到剪切板
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            当前仓位配置预览：
          </Typography>
          <TextField
            multiline
            rows={12}
            fullWidth
            value={JSON.stringify({
              side,
              capital,
              leverage,
              positions,
              exportedAt: new Date().toISOString(),
              version: '1.0.0'
            }, null, 2)}
            InputProps={{ readOnly: true }}
            sx={{
              '& .MuiInputBase-input': {
                fontSize: '0.875rem',
                fontFamily: 'monospace',
              },
            }}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            从JSON数据或文件导入仓位配置（支持完整配置或仅委托单数组）
          </Typography>

          <Box display="flex" gap={2} flexWrap="wrap" sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<FileUploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ minWidth: 160 }}
            >
              选择JSON文件
            </Button>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={handlePasteFromClipboard}
              sx={{ minWidth: 160 }}
            >
              从剪切板粘贴
            </Button>
          </Box>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />

          <Divider sx={{ my: 2 }} />

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            粘贴JSON数据：
          </Typography>
          <TextField
            multiline
            rows={8}
            fullWidth
            placeholder={`{
  "side": "long",
  "capital": 50000,
  "leverage": 15,
  "positions": [
    {
      "id": 1,
      "type": "open",
      "price": 65000,
      "quantity": 65.8274,
      "quantityUsdt": 285252.07,
      "marginUsdt": 285252.07,
      "enabled": true
    },
    {
      "id": 2,
      "type": "close",
      "price": 68000,
      "quantity": 32.9137,
      "quantityUsdt": 142626.03,
      "marginUsdt": 142626.03,
      "enabled": true
    }
  ],
  "exportedAt": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}`}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            sx={{
              '& .MuiInputBase-input': {
                fontSize: '0.875rem',
                fontFamily: 'monospace',
              },
            }}
          />

          <Box display="flex" justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleImportFromClipboard}
              disabled={!jsonText.trim()}
            >
              导入数据
            </Button>
          </Box>
        </TabPanel>

        <DialogActions>
          <Button onClick={handleClose}>关闭</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError('')} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess('')} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </>
  );
}
