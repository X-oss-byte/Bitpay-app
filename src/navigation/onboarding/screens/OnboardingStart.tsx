import {useNavigation} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useLayoutEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, View} from 'react-native';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import styled from 'styled-components/native';
import Button from '../../../components/button/Button';
import {CtaContainerAbsolute} from '../../../components/styled/Containers';
import {Action, LuckySevens} from '../../../styles/colors';
import {useThemeType} from '../../../utils/hooks/useThemeType';
import {OnboardingImage} from '../components/Containers';
import OnboardingSlide from '../components/OnboardingSlide';
import {OnboardingStackParamList} from '../OnboardingStack';

type OnboardingStartScreenProps = StackScreenProps<
  OnboardingStackParamList,
  'OnboardingStart'
>;

// IMAGES
const OnboardingImages = {
  spend: {
    light: (
      <OnboardingImage
        style={{height: 247, width: 217}}
        source={require('../../../../assets/img/onboarding/light/spend.png')}
      />
    ),
    dark: (
      <OnboardingImage
        style={{height: 247, width: 200}}
        source={require('../../../../assets/img/onboarding/dark/spend.png')}
      />
    ),
  },
  wallet: {
    light: (
      <OnboardingImage
        style={{height: 170, width: 220}}
        source={require('../../../../assets/img/onboarding/light/wallet.png')}
      />
    ),
    dark: (
      <OnboardingImage
        style={{height: 170, width: 230}}
        source={require('../../../../assets/img/onboarding/dark/wallet.png')}
      />
    ),
  },
};

const OnboardingContainer = styled.SafeAreaView`
  flex: 1;
  position: relative;
`;

const Row = styled.View`
  flex-direction: row;
  justify-content: center;
`;

const Column = styled.View`
  flex-direction: column;
  justify-content: center;
  margin: 0 5px;
  flex: 1;
`;

const OnboardingStart: React.VFC<OnboardingStartScreenProps> = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const themeType = useThemeType();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => null,
    });
  }, [navigation]);

  const carouselRef = useRef(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const onboardingSlides = [
    {
      title: t('Spend crypto at your favorite places'),
      text: t(
        'Discover a curated list of places you can spend your crypto. Purchase, manage and spend store credits instantly.',
      ),
      img: () => OnboardingImages.spend[themeType],
    },
    {
      title: t('Keep your funds safe & secure'),
      text: t(
        "Websites and exchanges get hacked. BitPay's self - custody wallet allows you to privately store, manage and use your crypto funds without a centralized bank or exchange.",
      ),
      img: () => OnboardingImages.wallet[themeType],
    },
  ];

  return (
    <OnboardingContainer accessibilityLabel="onboarding-start-view">
      <ScrollView>
        <Carousel
          vertical={false}
          layout={'default'}
          data={onboardingSlides}
          renderItem={({item}) => <OnboardingSlide item={item} />}
          ref={carouselRef}
          sliderWidth={400}
          itemWidth={400}
          onScrollIndexChanged={(index: number) => {
            setActiveSlideIndex(index);
          }}
        />
        <View />
      </ScrollView>

      <CtaContainerAbsolute accessibilityLabel="cta-container">
        <Row>
          <Column>
            <Pagination
              accessibilityLabel="pagination-button"
              dotsLength={onboardingSlides.length}
              activeDotIndex={activeSlideIndex}
              tappableDots={true}
              carouselRef={carouselRef}
              animatedDuration={100}
              animatedFriction={100}
              animatedTension={100}
              dotStyle={{
                width: 15,
                height: 15,
                borderRadius: 10,
                marginHorizontal: 1,
              }}
              dotColor={Action}
              inactiveDotColor={LuckySevens}
              inactiveDotScale={0.5}
            />
          </Column>
          <Column>
            <Button
              accessibilityLabel="get-started-button"
              buttonStyle={'primary'}
              onPress={() => {
                navigation.navigate('Onboarding', {
                  screen: 'CreateKey',
                });
              }}>
              {t('Get Started')}
            </Button>
          </Column>
        </Row>
      </CtaContainerAbsolute>
    </OnboardingContainer>
  );
};

export default OnboardingStart;
