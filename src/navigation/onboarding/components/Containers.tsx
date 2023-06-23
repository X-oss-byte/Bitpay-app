import styled from 'styled-components/native';

export const OnboardingImage = styled.Image<{
  widthPct?: number;
  heightPct?: number;
}>`
  height: ${({widthPct}) => 100 * (widthPct ? widthPct : 0.3)}px;
  width: ${({heightPct}) => 100 * (heightPct ? heightPct : 0.3)}px;
`;
