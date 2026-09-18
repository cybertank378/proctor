//Files: src/sections/auth/atoms/AuthTextField.tsx
"use client";

import type { LucideIcon } from "lucide-react";
import { CheckCircle } from "lucide-react";
import type React from "react";

import TextField from "@/shared-ui/component/TextField";

type Props = {
  label: string;

  type?: "text" | "email" | "password" | "number";

  value: string;

  onChangeAction: (value: string) => void;

  ////////////////////////////////////////////////////////////
  // EVENT
  ////////////////////////////////////////////////////////////

  onBlurAction?: () => void;

  ////////////////////////////////////////////////////////////
  // VALIDATION
  ////////////////////////////////////////////////////////////

  error?: string;

  touched?: boolean;

  showValid?: boolean;

  ////////////////////////////////////////////////////////////
  // ICON
  ////////////////////////////////////////////////////////////

  leftIcon?: LucideIcon;

  rightIcon?: LucideIcon;

  onRightIconClickAction?: () => void;
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange" | "onBlur"
>;

export const AuthTextField: React.FC<Props> = ({
  label,

  type = "text",

  value,

  onChangeAction,

  onBlurAction,

  error,

  touched,

  showValid,

  required,

  leftIcon,

  rightIcon,

  onRightIconClickAction,

  ...inputProps
}) => {
  ////////////////////////////////////////////////////////////
  // VALIDATION STATE
  ////////////////////////////////////////////////////////////

  const isError = Boolean(error && touched);

  const isValid = Boolean(showValid && !isError && value.length > 0);

  ////////////////////////////////////////////////////////////
  // UI
  ////////////////////////////////////////////////////////////

  return (
    <TextField
      {...inputProps}
      label={
        required ? (
          <>
            {label}

            <span className="text-red-500"> *</span>
          </>
        ) : (
          label
        )
      }
      type={type}
      value={value}
      onChange={(e) => onChangeAction(e.target.value)}
      onBlur={() => onBlurAction?.()}
      variant="custom"
      size="lg"
      error={isError}
      success={isValid}
      helperText={isError ? error : undefined}
      enablePasswordToggle={type === "password"}
      leftIcon={leftIcon}
      rightIcon={isValid ? CheckCircle : rightIcon}
      onRightIconClick={onRightIconClickAction}
    />
  );
};

export default AuthTextField;
