import { useState } from 'react';
import { Box, HStack, Button, VStack, Text } from '@chakra-ui/react';
import SplashScreen from './LandingPage';
import AuthScreen from './Login';
import OTPVerification from './OTPVerification';
import HomeScreen from './HomeScreen';
import PropertyDetails from './PropertyDetails';
import PaymentBreakdown from './PaymentBreakdown';
import IdentityVerification from './IdentityVerification';
import InspectionFeedback from './InspectionFeedback';
import AgentDashboard from './AgentDashboard';

export default function ScreenRouter() {
  const [currentScreen, setCurrentScreen] = useState('home');

  const screens: Record<string, JSX.Element> = {
    splash: <SplashScreen />,
    auth: <AuthScreen />,
    otp: <OTPVerification />,
    home: <HomeScreen />,
    details: <PropertyDetails />,
    payment: <PaymentBreakdown />,
    verify: <IdentityVerification />,
    inspection: <InspectionFeedback />,
    agent: <AgentDashboard />,
  };

  return (
    <Box>
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bg="white"
        borderBottom="2px solid"
        borderColor="brand.gray.200"
        p={3}
        zIndex={1000}
        boxShadow="sm"
      >
        <VStack spacing={2}>
          <Text fontSize="xs" fontWeight="600" color="brand.primary">
            SCREEN NAVIGATOR
          </Text>
          <HStack spacing={2} overflowX="auto" pb={1} flexWrap="wrap" justify="center">
            <Button
              size="xs"
              onClick={() => setCurrentScreen('splash')}
              bg={currentScreen === 'splash' ? 'brand.primary' : 'white'}
              color={currentScreen === 'splash' ? 'white' : 'brand.primary'}
              border="1px solid"
              borderColor="brand.primary"
            >
              Splash
            </Button>
            <Button
              size="xs"
              onClick={() => setCurrentScreen('auth')}
              bg={currentScreen === 'auth' ? 'brand.primary' : 'white'}
              color={currentScreen === 'auth' ? 'white' : 'brand.primary'}
              border="1px solid"
              borderColor="brand.primary"
            >
              Auth
            </Button>
            <Button
              size="xs"
              onClick={() => setCurrentScreen('otp')}
              bg={currentScreen === 'otp' ? 'brand.primary' : 'white'}
              color={currentScreen === 'otp' ? 'white' : 'brand.primary'}
              border="1px solid"
              borderColor="brand.primary"
            >
              OTP
            </Button>
            <Button
              size="xs"
              onClick={() => setCurrentScreen('home')}
              bg={currentScreen === 'home' ? 'brand.primary' : 'white'}
              color={currentScreen === 'home' ? 'white' : 'brand.primary'}
              border="1px solid"
              borderColor="brand.primary"
            >
              Home
            </Button>
            <Button
              size="xs"
              onClick={() => setCurrentScreen('details')}
              bg={currentScreen === 'details' ? 'brand.primary' : 'white'}
              color={currentScreen === 'details' ? 'white' : 'brand.primary'}
              border="1px solid"
              borderColor="brand.primary"
            >
              Property
            </Button>
            <Button
              size="xs"
              onClick={() => setCurrentScreen('payment')}
              bg={currentScreen === 'payment' ? 'brand.primary' : 'white'}
              color={currentScreen === 'payment' ? 'white' : 'brand.primary'}
              border="1px solid"
              borderColor="brand.primary"
            >
              Payment
            </Button>
            <Button
              size="xs"
              onClick={() => setCurrentScreen('verify')}
              bg={currentScreen === 'verify' ? 'brand.primary' : 'white'}
              color={currentScreen === 'verify' ? 'white' : 'brand.primary'}
              border="1px solid"
              borderColor="brand.primary"
            >
              Verify ID
            </Button>
            <Button
              size="xs"
              onClick={() => setCurrentScreen('inspection')}
              bg={currentScreen === 'inspection' ? 'brand.primary' : 'white'}
              color={currentScreen === 'inspection' ? 'white' : 'brand.primary'}
              border="1px solid"
              borderColor="brand.primary"
            >
              Inspection
            </Button>
            <Button
              size="xs"
              onClick={() => setCurrentScreen('agent')}
              bg={currentScreen === 'agent' ? 'brand.primary' : 'white'}
              color={currentScreen === 'agent' ? 'white' : 'brand.primary'}
              border="1px solid"
              borderColor="brand.primary"
            >
              Agent
            </Button>
          </HStack>
        </VStack>
      </Box>

      <Box mt="90px">
        {screens[currentScreen]}
      </Box>
    </Box>
  );
}
