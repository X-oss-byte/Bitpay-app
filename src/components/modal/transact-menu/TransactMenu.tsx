import {useNavigation, useTheme} from '@react-navigation/native';
import React, {ReactElement, useEffect, useState} from 'react';
import {FlatList, View, Animated, Pressable} from 'react-native';
import styled from 'styled-components/native';
import {Action, Black, Midnight, White} from '../../../styles/colors';
import {ActiveOpacity, SheetContainer} from '../../styled/Containers';
import {BaseText, H6} from '../../styled/Text';
import Icons from './TransactMenuIcons';
import {useTranslation} from 'react-i18next';
import {useAppDispatch, useAppSelector} from '../../../utils/hooks';
import {RootState} from '../../../store';
import {dismissTransactMenu} from '../../../store/app/app.actions';

const ModalContainer = styled(SheetContainer)`
  background: ${({theme}) => (theme.dark ? '#101010' : White)};
`;

const TransactItemContainer = styled.TouchableOpacity`
  flex-direction: row;
  padding-bottom: 31px;
  align-items: stretch;
  cursor: pointer;
`;

const ItemIconContainer = styled.View`
  background-color: ${({theme}) => (theme.dark ? Midnight : Action)};
  border-radius: 11px;
`;

const ItemTextContainer = styled.View`
  align-items: flex-start;
  justify-content: space-around;
  flex-direction: column;
  padding-left: 19px;
`;

const ItemDescriptionText = styled(BaseText)`
  color: ${({theme}) => theme.colors.description};
  font-style: normal;
  font-weight: 300;
  font-size: 14px;
  line-height: 19px;
`;

const CloseButtonContainer = styled.TouchableOpacity`
  align-self: center;
`;

interface TransactMenuItemProps {
  id: string;
  img: () => ReactElement;
  title?: string;
  description?: string;
  onPress: () => void;
}

const TransactModal = () => {
  const {t} = useTranslation();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const isVisible = useAppSelector(({APP}: RootState) => APP.showTransactMenu);

  const startedAnimationValue = new Animated.Value(57);
  const [animate, setAnimate] = useState(startedAnimationValue); // Initial value for scale: 0

  const dismissModal = () => {
    dispatch(dismissTransactMenu());
  };

  useEffect(() => {
    if (isVisible) {
      Animated.spring(animate, {
        toValue: 0,
        speed: 10,
        useNativeDriver: true,
      }).start();
    } else {
      setAnimate(startedAnimationValue);
    }
  }, [isVisible]);

  const TransactMenuList: Array<TransactMenuItemProps> = [
    {
      id: 'receive',
      img: () => <Icons.Receive />,
      title: t('Receive'),
      description: t('Get crypto from another wallet'),
      onPress: () => {
        navigation.navigate('Wallet', {
          screen: 'GlobalSelect',
          params: {context: 'receive'},
        });
      },
    },
    {
      id: 'send',
      img: () => <Icons.Send />,
      title: t('Send'),
      description: t('Send crypto to another wallet'),
      onPress: () => {
        navigation.navigate('Wallet', {
          screen: 'GlobalSelect',
          params: {context: 'send'},
        });
      },
    },
  ];

  return isVisible ? (
    <>
      <Pressable
        style={{
          position: 'absolute',
          height: '100%',
          width: '100%',
          top: 0,
          left: 0,
          opacity: 0.3,
          zIndex: 1,
          backgroundColor: theme.dark ? White : Black,
        }}
        onPress={() => dismissModal()}>
        <View />
      </Pressable>
      <Animated.View
        style={{
          transform: [{translateY: animate}],
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          zIndex: 1000000,
        }}>
        <ModalContainer>
          <FlatList
            data={TransactMenuList}
            scrollEnabled={false}
            renderItem={({item}) => (
              <TransactItemContainer
                activeOpacity={ActiveOpacity}
                onPress={() => {
                  dismissModal();
                  item.onPress();
                }}>
                <ItemIconContainer>{item.img()}</ItemIconContainer>
                <ItemTextContainer>
                  <H6>{item.title}</H6>
                  <ItemDescriptionText>{item.description}</ItemDescriptionText>
                </ItemTextContainer>
              </TransactItemContainer>
            )}
          />

          <CloseButtonContainer onPress={() => dismissModal()}>
            <View>
              <Icons.Close />
            </View>
          </CloseButtonContainer>
        </ModalContainer>
      </Animated.View>
    </>
  ) : null;
};

export default TransactModal;
