import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  Tooltip,
  Fade,
  LinearProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Help as HelpIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

interface ValidationRule {
  test: (value: any) => boolean;
  message: string;
}

interface EnhancedTextFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  type?: 'text' | 'number' | 'email' | 'password';
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  helperText?: string;
  tooltip?: string;
  startAdornment?: string;
  endAdornment?: string;
  validationRules?: ValidationRule[];
  showValidation?: boolean;
  autoFocus?: boolean;
  multiline?: boolean;
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
}

export function EnhancedTextField({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  disabled = false,
  placeholder,
  helperText,
  tooltip,
  startAdornment,
  endAdornment,
  validationRules = [],
  showValidation = false,
  autoFocus = false,
  multiline = false,
  rows = 1,
  min,
  max,
  step,
}: EnhancedTextFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);
  const [touched, setTouched] = useState(false);

  // 验证逻辑
  useEffect(() => {
    if (!touched && !showValidation) return;

    const newErrors: string[] = [];
    
    if (required && (!value || value.toString().trim() === '')) {
      newErrors.push(`${label}不能为空`);
    }

    validationRules.forEach(rule => {
      if (!rule.test(value)) {
        newErrors.push(rule.message);
      }
    });

    setErrors(newErrors);
    setIsValid(newErrors.length === 0 && value.toString().trim() !== '');
  }, [value, required, validationRules, label, touched, showValidation]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = type === 'number' ? parseFloat(event.target.value) || 0 : event.target.value;
    onChange(newValue);
    if (!touched) setTouched(true);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const getInputProps = () => {
    const props: any = {};
    
    if (type === 'number') {
      props.min = min;
      props.max = max;
      props.step = step || 'any';
    }

    return props;
  };

  const getStartAdornment = () => {
    if (startAdornment) {
      return <InputAdornment position="start">{startAdornment}</InputAdornment>;
    }
    return undefined;
  };

  const getEndAdornment = () => {
    const adornments = [];

    if (type === 'password') {
      adornments.push(
        <IconButton
          key="password-toggle"
          onClick={() => setShowPassword(!showPassword)}
          edge="end"
        >
          {showPassword ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      );
    }

    if (endAdornment) {
      adornments.push(
        <InputAdornment key="end-adornment" position="end">
          {endAdornment}
        </InputAdornment>
      );
    }

    if (tooltip) {
      adornments.push(
        <Tooltip key="tooltip" title={tooltip}>
          <IconButton edge="end">
            <HelpIcon />
          </IconButton>
        </Tooltip>
      );
    }

    if (showValidation && touched) {
      adornments.push(
        <InputAdornment key="validation" position="end">
          {isValid ? (
            <CheckIcon color="success" />
          ) : errors.length > 0 ? (
            <ErrorIcon color="error" />
          ) : null}
        </InputAdornment>
      );
    }

    return adornments.length > 0 ? <>{adornments}</> : undefined;
  };

  return (
    <Box>
      <TextField
        fullWidth
        label={label}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        helperText={helperText}
        autoFocus={autoFocus}
        multiline={multiline}
        rows={multiline ? rows : undefined}
        error={touched && errors.length > 0}
        inputProps={getInputProps()}
        InputProps={{
          startAdornment: getStartAdornment(),
          endAdornment: getEndAdornment(),
        }}
      />
      
      {touched && errors.length > 0 && (
        <Fade in>
          <Box mt={1}>
            {errors.map((error, index) => (
              <Alert key={index} severity="error" sx={{ mb: 1 }}>
                {error}
              </Alert>
            ))}
          </Box>
        </Fade>
      )}
    </Box>
  );
}

interface FormSubmitButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning';
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
}

export function FormSubmitButton({
  children,
  loading = false,
  disabled = false,
  variant = 'contained',
  color = 'primary',
  fullWidth = false,
  startIcon,
  endIcon,
  onClick,
  type = 'button',
}: FormSubmitButtonProps) {
  return (
    <Box position="relative">
      <Button
        type={type}
        variant={variant}
        color={color}
        fullWidth={fullWidth}
        disabled={disabled || loading}
        startIcon={!loading ? startIcon : undefined}
        endIcon={!loading ? endIcon : undefined}
        onClick={onClick}
        sx={{
          minHeight: 48,
          position: 'relative',
        }}
      >
        {children}
      </Button>
      {loading && (
        <LinearProgress
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            borderRadius: '0 0 4px 4px',
          }}
        />
      )}
    </Box>
  );
}

// 常用验证规则
export const validationRules = {
  required: (message?: string): ValidationRule => ({
    test: (value) => value !== null && value !== undefined && value.toString().trim() !== '',
    message: message || '此字段为必填项',
  }),
  
  minLength: (min: number, message?: string): ValidationRule => ({
    test: (value) => value.toString().length >= min,
    message: message || `最少需要${min}个字符`,
  }),
  
  maxLength: (max: number, message?: string): ValidationRule => ({
    test: (value) => value.toString().length <= max,
    message: message || `最多允许${max}个字符`,
  }),
  
  email: (message?: string): ValidationRule => ({
    test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.toString()),
    message: message || '请输入有效的邮箱地址',
  }),
  
  number: (message?: string): ValidationRule => ({
    test: (value) => !isNaN(Number(value)) && isFinite(Number(value)),
    message: message || '请输入有效的数字',
  }),
  
  positiveNumber: (message?: string): ValidationRule => ({
    test: (value) => !isNaN(Number(value)) && Number(value) > 0,
    message: message || '请输入大于0的数字',
  }),
  
  range: (min: number, max: number, message?: string): ValidationRule => ({
    test: (value) => {
      const num = Number(value);
      return !isNaN(num) && num >= min && num <= max;
    },
    message: message || `请输入${min}到${max}之间的数字`,
  }),
};
