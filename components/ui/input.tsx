import * as React from 'react';
import { TextInput, TextInputProps } from 'react-native';

export interface InputProps extends TextInputProps {
  className?: string;
}

export const Input = React.forwardRef<TextInput, InputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        className={`border border-gray-300 rounded-md px-3 py-2 ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
