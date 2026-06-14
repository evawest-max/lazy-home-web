import { useState } from 'react';
import { Box, VStack, Heading, Text, HStack, PinInput, PinInputField, Button, useToast } from '@chakra-ui/react';
import { ShieldCheck } from 'lucide-react';
import { sendOTP, verifyOTP } from '../../../api.js';

export default function OTPVerification({ phone }) {
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');
  const toast = useToast();
  const phoneNumber = phone?.trim() || '';

  const isPhoneValid = phoneNumber.length >= 10;
  const canVerify = otpSent && otp.length === 6 && isPhoneValid;

  const handleSendCode = async () => {
    if (!isPhoneValid) {
      setStatusType('error');
      setStatusMessage('Phone number is missing or invalid.');
      return;
    }
    console.log('Sending OTP to phone number:', phoneNumber);
    setLoading(true);
    setStatusMessage('');
    try {
      await sendOTP({phone: phoneNumber});
      setOtpSent(true);
      setStatusType('success');
      setStatusMessage('OTP sent successfully. Check your phone.');
      toast({ title: 'OTP sent', description: 'The verification code was sent to your phone.', status: 'success', duration: 5000, isClosable: true });
    } catch (error) {
      setStatusType('error');
      setStatusMessage(error?.response?.data?.message || 'Failed to send OTP. Please try again.');
      console.error('Error sending OTP', error?.response || error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!canVerify) {
      setStatusType('error');
      setStatusMessage('Enter the 6-digit code sent to your phone before verifying.');
      return;
    }

    setLoading(true);
    setStatusMessage('');
    try {
      await verifyOTP(otp);
      setStatusType('success');
      setStatusMessage('OTP verified successfully.');
      toast({ title: 'Verified', description: 'Your phone number has been verified.', status: 'success', duration: 5000, isClosable: true });
    } catch (error) {
      setStatusType('error');
      setStatusMessage(error?.response?.data?.message || 'OTP verification failed. Please try again.');
      console.error('Error verifying OTP', error?.response || error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = otpSent ? handleVerifyCode : handleSendCode;

  return (
    <Box minH="100vh" bg="brand.background" px={6} py={12}>
      <VStack spacing={8} maxW="400px" mx="auto">
        <Box bg="white" borderRadius="xl" p={5} boxShadow="md" w="100%">
          <VStack spacing={3}>
            <HStack spacing={2} bg="brand.success" py={2} px={4} borderRadius="lg">
              <ShieldCheck size={16} color="white" />
              <Text fontSize="xs" fontWeight="bold" color="white">
                SECURE VERIFICATION
              </Text>
            </HStack>
            <Text fontSize="xs" color="brand.gray.600" textAlign="center">
              This protects your account and ensures safe transactions
            </Text>
          </VStack>
        </Box>

        <VStack spacing={3} textAlign="center">
          <Heading fontSize="2xl" color="brand.primary">
            Verify Your Number
          </Heading>
          <Text color="brand.gray.600">
            A 6-digit verification code will be sent to your phone.
          </Text>
        </VStack>

        <VStack spacing={3} w="100%">
          <Text fontSize="sm" color="brand.gray.600" textAlign="left" w="100%">
            Phone number:
          </Text>
          <Text fontWeight="600" color="brand.primary" w="100%" textAlign="left">
            {phoneNumber || 'No phone number provided'}
          </Text>
          {!isPhoneValid && (
            <Text fontSize="sm" color="red.500" textAlign="left" w="100%">
              Phone number is missing or invalid.
            </Text>
          )}
        </VStack>

        {otpSent && (
          <VStack spacing={3} textAlign="center" w="100%">
            <Text color="brand.gray.600">Enter the 6-digit code sent to</Text>
            <Text fontWeight="600" color="brand.primary">
              {phoneNumber}
            </Text>
          </VStack>
        )}

        <HStack spacing={3} justify="center" w="100%" opacity={otpSent ? 1 : 0.5} pointerEvents={otpSent ? 'auto' : 'none'}>
          <PinInput size="lg" otp onChange={(value) => setOtp(value)} value={otp} isDisabled={!otpSent}>
            {[...Array(6)].map((_, index) => (
              <PinInputField
                key={index}
                bg="white"
                borderColor="brand.gray.300"
                _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                fontSize="2xl"
                h="56px"
                w="48px"
              />
            ))}
          </PinInput>
        </HStack>

        {statusMessage && (
          <Text
            fontSize="sm"
            color={statusType === 'error' ? 'red.500' : 'brand.primary'}
            textAlign="center"
            w="100%"
          >
            {statusMessage}
          </Text>
        )}

        <Button
          w="100%"
          variant="primary"
          size="lg"
          onClick={handleAction}
          isDisabled={loading || (!otpSent ? !isPhoneValid : !canVerify)}
          isLoading={loading}
        >
          {otpSent ? 'Verify & Continue' : 'Send Code'}
        </Button>

        {otpSent && (
          <Text fontSize="sm" color="brand.gray.600">
            Didn't receive code?{' '}
            <Text as="span" color="brand.primary" fontWeight="600" cursor="pointer">
              Resend
            </Text>
          </Text>
        )}
      </VStack>
    </Box>
  );
}
