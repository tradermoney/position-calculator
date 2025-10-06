import React, { useState, useEffect } from 'react';
import {
  TextField,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  Tooltip,
  Fade,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Help as HelpIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { EnhancedTextFieldProps } from './types';

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

  const getInputProps = (): Record<string, string | number | undefined> => {
    const props: Record<string, string | number | undefined> = {};

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
