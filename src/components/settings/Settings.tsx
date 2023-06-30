import React from 'react';
import Color, {Rect, Svg, Ellipse, Circle} from 'react-native-svg';
import {useTheme} from 'styled-components/native';
import {LightBlack, NeutralSlate, SlateDark, White} from '../../styles/colors';
import {HeaderRightContainer} from '../styled/Containers';
interface SettingsSvgProps {
  color: Color | undefined;
  background: Color | undefined;
}

const SettingsSvg: React.FC<SettingsSvgProps> = ({color}) => {
  return (
    <Svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <Rect width="40" height="40" rx="20" />
      <Ellipse cx="12" cy="20" rx="2" ry="2" fill={color} />
      <Circle cx="20" cy="20" r="2" fill={color} />
      <Ellipse cx="28" cy="20" rx="2" ry="2" fill={color} />
    </Svg>
  );
};

const Settings = ({onPress}: {onPress: () => void}) => {
  const theme = useTheme();
  const color = theme.dark ? White : SlateDark;

  return (
    <HeaderRightContainer onPress={onPress}>
      <SettingsSvg color={color} />
    </HeaderRightContainer>
  );
};

export default Settings;
