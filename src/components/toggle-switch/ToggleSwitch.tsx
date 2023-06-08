import React from 'react';
import {Switch} from 'react-native';
import {Action, NeutralSlate, White} from '../../styles/colors';
interface Props {
  onChange: ((value: boolean) => any) | undefined;
  isEnabled: boolean;
}

const ToggleSwitch = ({onChange, isEnabled}: Props) => {
  return (
    <Switch
      focusable={true}
      onValueChange={onChange}
      value={isEnabled}
      trackColor={{true: Action, false: NeutralSlate}}
      thumbColor={White}
      thumbTintColor={White}
    />
  );
};

export default ToggleSwitch;
