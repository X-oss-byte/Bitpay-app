import React from 'react';
import {Path, Svg, G, Circle, Polygon, Rect} from 'react-native-svg';
import {useTheme} from 'styled-components/native';
import {White} from '../../../../styles/colors';

const SimplexIconSvg: React.FC<{
  isDark: boolean;
  width: number;
  height: number;
}> = ({isDark, width, height}) => {
  return (
    <Svg
      viewBox={'-40 -50 600 600'}
      height={height}
      width={width}
      fill="none"
      id="simplex-svg-icon">
      <Circle cx="256" cy="256" r="275" fill={isDark ? '#123d59' : '#081F2C'} />
      <Path
        id="simplex-svg-icon-S"
        d="M83 359.586C113.417 387.811 166.498 406 217.789 406C300.691 406 349 363.349 349 305.645C349 225.361 276.238 212.817 227.332 204.036C196.915 198.391 181.408 193.373 181.408 179.574C181.408 166.402 196.318 158.876 217.789 158.876C252.381 158.876 285.184 174.556 302.48 192.118L337.668 128.142C306.655 104.308 265.502 88 217.193 88C137.274 88 93.7354 134.414 93.7354 187.728C93.7354 264.876 162.919 275.538 211.825 284.32C241.646 289.337 261.327 294.982 261.327 310.663C261.327 323.834 249.995 333.243 222.561 333.243C188.565 333.243 142.641 313.172 121.17 293.101L83 359.586Z"
        fill="white"
      />
      <Path
        id="simplex-svg-icon-dot"
        d="M437 366C437 388.273 419.273 406 397 406C374.727 406 357 388.273 357 366C357 343.727 374.727 326 397 326C419.273 326 437 343.727 437 366Z"
        fill="#D026AF"
      />
    </Svg>
  );
};

const SimplexLogoSvg: React.FC<{
  isDark: boolean;
  width: number;
  height: number;
}> = ({isDark, width, height}) => {
  return (
    <Svg
      viewBox={'-20 0 698.1 187.9'}
      height={height}
      width={width}
      id="simplex-svg-logo">
      <G>
        <Path
          id="simplex-path-s"
          fill={isDark ? White : '#081F2C'}
          d="M0,119.5L12,99c6.7,6,21.1,12.1,31.7,12.1c8.6,0,12.1-2.4,12.1-6.3c0-11.2-52.5,0.4-52.5-36.2
				c0-15.9,13.8-29.7,38.7-29.7c15.3,0,28,4.9,37.7,12l-11,20.4c-5.4-5.2-15.7-9.9-26.5-9.9c-6.7,0-11.2,2.6-11.2,6.2
				c0,9.9,52.3-0.4,52.3,36.6c0,17.2-15.1,29.5-40.9,29.5C26.1,133.5,9.5,128.1,0,119.5z"
        />
        <Path
          id="simplex-path-i1"
          fill="#E40046"
          d="M85.7,16.4C85.7,7.3,93,0,102.1,0c9.1,0,16.6,7.3,16.6,16.4S111.3,33,102.1,33C93,33,85.7,25.6,85.7,16.4z"
        />
        <Rect
          id="simplex-path-i2"
          x="87.8"
          y="41.1"
          fill={isDark ? White : '#081F2C'}
          width="28.8"
          height="90.2"
        />
        <Path
          id="simplex-path-m"
          fill={isDark ? White : '#081F2C'}
          d="M240.9,131.3V76.4c0-6.9-3.4-12.1-12-12.1c-7.8,0-13.4,5-16.2,8.8v58.3h-28.8V76.4c0-6.9-3.2-12.1-11.8-12.1
				c-7.8,0-13.3,5-16.2,8.8v58.3h-28.8V41.1h28.8V49l-3,6.7c1.1-1.4,2.2-2.7,3-3.6c3.9-5.2,15.5-13.3,29.7-13.3
				c13.1,0,21.8,5.4,25.6,16.1c5.2-7.8,17-16.1,31.2-16.1c16.6,0,27.1,8.6,27.1,27.1v65.4H240.9z"
        />
        <Path
          id="simplex-path-p"
          fill={isDark ? White : '#081F2C'}
          d="M309,120.6c-0.7-0.9-1.2-2-1.7-3.1l1.7,10v38.2h-28.8V41.1H309v10.5c7.1-8.6,16.4-12.7,26.7-12.7
				c22.6,0,39.6,16.8,39.6,47.2c0,30.6-17,47.4-39.6,47.4C325.6,133.5,316.5,129.6,309,120.6z M346,86.1c0-13.4-8.6-21.8-19.8-21.8
				c-6.2,0-13.6,3.4-17.2,8.2v27.4c3.5,4.7,11,8.2,17.2,8.2C337.4,108.1,346,99.7,346,86.1z"
        />
        <Path
          id="simplex-path-l"
          fill={isDark ? White : '#081F2C'}
          d="M380,131.3V6.7h28.8v124.5H380z"
        />
        <Path
          id="simplex-path-e"
          fill={isDark ? White : '#081F2C'}
          d="M413.6,86.1c0-26.1,19.6-47.2,47.8-47.2c26.7,0,46.1,19.6,46.1,50.2v6.5h-62l-2.4-3.2c-0.1,1-0.1,2,0.2,3.2
				c2.1,8,9.5,14.8,22.6,14.8c6.3,0,16.8-2.8,22-7.7l12.5,18.9c-9,8-23.9,12-37.7,12C434.8,133.5,413.6,115.4,413.6,86.1z M461.4,62
				c-12.5,0-17.4,7.5-18.5,14H480C479.3,69.6,474.6,62,461.4,62z"
        />
        <Path
          id="simplex-path-x"
          fill={isDark ? White : '#081F2C'}
          d="M566.1,131.3L548.9,104l-17.7,27.3h-31.4L530.6,85l-28.9-43.9h31.6l15.5,24.5l1.1,1.7l0-3.5l14.2-22.7h31.6
				L566.9,85l30.8,46.3H566.1z"
        />
      </G>

      <G>
        <G>
          <Path
            id="simplex-path-b"
            fill={isDark ? White : '#081F2C'}
            d="M380,205.9V165h6.4v15.4c2.4-3.2,5.8-4.8,9.5-4.8c7.7,0,13.2,6,13.2,15.5c0,9.8-5.6,15.6-13.2,15.6
            c-3.8,0-7.2-1.8-9.5-4.8v4H380z M394.1,200.9c5.1,0,8.3-4.1,8.3-9.9c0-5.7-3.3-9.8-8.3-9.8c-3.1,0-6.2,1.8-7.7,4V197
            C387.9,199.2,391,200.9,394.1,200.9z"
          />
          <Path
            id="simplex-path-y"
            fill={isDark ? White : '#081F2C'}
            d="M415.7,211.7c0.7,0.3,1.7,0.5,2.5,0.5c2.1,0,3.4-0.6,4.3-2.6l1.5-3.4l-12.2-30h6.9l8.6,22.2l8.7-22.2h6.9
            l-14.3,35c-2,5-5.5,6.6-10.1,6.7c-0.9,0-2.8-0.2-3.6-0.4L415.7,211.7z"
          />
        </G>
        <G>
          <Path
            id="simplex-path-n"
            fill={isDark ? White : '#081F2C'}
            d="M484,188.6c0-3.6-1.9-4.9-4.8-4.9c-2.8,0-4.6,1.5-5.7,2.9v19H464v-29.5h9.4v2.6l-1.2,2.2
            c1.8-2.1,6.4-5.5,11.3-5.5c6.7,0,9.8,3.9,9.8,9.3v20.9H484V188.6z"
          />
          <Path
            id="simplex-path-u"
            fill={isDark ? White : '#081F2C'}
            d="M516.1,201.3c-1.8,2.1-6.2,5.1-11.1,5.1c-6.7,0-9.7-3.8-9.7-9.2v-21h9.4v17.1c0,3.5,1.8,4.8,4.9,4.8
						c2.7,0,4.5-1.5,5.6-2.9v-19h9.4v29.5h-9.4v-2.2L516.1,201.3z"
          />
          <Polygon
            id="simplex-path-v"
            fill={isDark ? White : '#081F2C'}
            points="547.8,176.2 541.5,193.7 541.7,196.4 534.5,176.2 526.5,176.2 526.5,180.9 536.2,205.6 546.2,205.6 557.8,176.2"
          />
          <Path
            id="simplex-path-e"
            fill={isDark ? White : '#081F2C'}
            d="M571,175.4c8.7,0,15.1,6.4,15.1,16.4v2h-20.3l-0.8-1.1c0,0.4,0.1,0.9,0.2,1.3c0.7,2.6,3.2,5,7.5,5
						c2.6,0,5.6-1,7.2-2.5l4,5.9c-2.9,2.6-7.8,3.9-12.3,3.9c-9.1,0-16.1-5.9-16.1-15.5C555.4,182.3,561.8,175.4,571,175.4z
						 M565,187.8h12.1c-0.2-2.1-1.8-5.1-6.1-5.1C566.9,182.7,565.4,185.6,565,187.8z"
          />
          <Path
            id="simplex-path-i3"
            fill="#E40046"
            d="M587.3,167.1c0-3,2.4-5.4,5.4-5.4c3,0,5.4,2.4,5.4,5.4c0,3-2.4,5.4-5.4,5.4
            C589.7,172.4,587.3,170.1,587.3,167.1z"
          />
          <Path
            id="simplex-path-i4"
            fill={isDark ? White : '#081F2C'}
            d="M588,176.2h9.4v29.5H588V176.2z"
          />
        </G>
      </G>
    </Svg>
  );
};

const SimplexLogo = ({
  widthIcon = 45,
  heightIcon = 45,
  widthLogo = 50,
  heightLogo = 20,
  iconOnly = false,
}: {
  widthIcon?: number;
  heightIcon?: number;
  widthLogo?: number;
  heightLogo?: number;
  iconOnly?: boolean;
}) => {
  const theme = useTheme();

  return (
    <>
      <SimplexIconSvg
        isDark={theme.dark}
        width={widthIcon}
        height={heightIcon}
      />
      {!iconOnly && (
        <SimplexLogoSvg
          isDark={theme.dark}
          width={widthLogo}
          height={heightLogo}
        />
      )}
    </>
  );
};

export default SimplexLogo;
