import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Input, FieldError } from 'heroui-native';
import { EyeIcon, EyeSlashIcon } from 'react-native-heroicons/outline';
import { colors } from '../theme';

type PasswordFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  isInvalid?: boolean;
  isDisabled?: boolean;
  errorMessage?: string | null;
};

export function PasswordField({
  value,
  onChangeText,
  placeholder,
  isInvalid,
  isDisabled,
  errorMessage,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View>
      <View className="relative justify-center">
        <Input
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={!visible}
          autoCapitalize="none"
          isInvalid={isInvalid}
          isDisabled={isDisabled}
          className="pr-12"
        />
        <Pressable
          className="absolute right-3 top-0 bottom-0 justify-center"
          hitSlop={8}
          onPress={() => setVisible(current => !current)}>
          {visible ? (
            <EyeSlashIcon color={colors.textMuted} size={20} />
          ) : (
            <EyeIcon color={colors.textMuted} size={20} />
          )}
        </Pressable>
      </View>
      {errorMessage && <FieldError isInvalid>{errorMessage}</FieldError>}
    </View>
  );
}
