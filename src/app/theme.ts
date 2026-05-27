import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  fonts: {
    heading: `'Inter', sans-serif`,
    body: `'Inter', sans-serif`,
  },
  colors: {
    brand: {
      primary: '#00695C',
      secondary: '#00838F',
      accent: '#26A69A',
      background: '#E0F2F1',
      white: '#FFFFFF',
      error: '#C62828',
      warning: '#E65100',
      success: '#2E7D32',
      gray: {
        50: '#FAFAFA',
        100: '#F5F5F5',
        200: '#EEEEEE',
        300: '#E0E0E0',
        400: '#BDBDBD',
        500: '#9E9E9E',
        600: '#757575',
        700: '#616161',
        800: '#424242',
        900: '#212121',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '600',
        borderRadius: 'lg',
      },
      variants: {
        primary: {
          bg: 'brand.primary',
          color: 'white',
          _hover: {
            bg: 'brand.secondary',
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          },
          _active: {
            bg: 'brand.primary',
            transform: 'translateY(0)',
          },
        },
        secondary: {
          bg: 'white',
          color: 'brand.primary',
          border: '2px solid',
          borderColor: 'brand.primary',
          _hover: {
            bg: 'brand.background',
          },
        },
        danger: {
          bg: 'brand.error',
          color: 'white',
          _hover: {
            bg: '#B71C1C',
          },
        },
      },
      defaultProps: {
        size: 'lg',
        variant: 'primary',
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'white',
          borderRadius: 'xl',
          boxShadow: 'sm',
          overflow: 'hidden',
        },
      },
    },
    Badge: {
      variants: {
        verified: {
          bg: 'brand.success',
          color: 'white',
          px: 3,
          py: 1,
          borderRadius: 'full',
        },
        pending: {
          bg: 'brand.warning',
          color: 'white',
          px: 3,
          py: 1,
          borderRadius: 'full',
        },
        underOffer: {
          bg: 'brand.accent',
          color: 'white',
          px: 3,
          py: 1,
          borderRadius: 'full',
        },
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'brand.background',
        color: 'brand.gray.900',
      },
    },
  },
});

export default theme;
