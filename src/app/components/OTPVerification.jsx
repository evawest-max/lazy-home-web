import { Box, VStack, Heading, Text, HStack, PinInput, PinInputField, Button } from '@chakra-ui/react';
import { ShieldCheck } from 'lucide-react';

export default function OTPVerification() {
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
            Enter the 6-digit code sent to
          </Text>
          <Text fontWeight="600" color="brand.primary">
            +234 812 345 6789
          </Text>
        </VStack>

        <HStack spacing={3} justify="center">
          <PinInput size="lg" otp>
            <PinInputField
              bg="white"
              borderColor="brand.gray.300"
              _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
              fontSize="2xl"
              h="56px"
              w="48px"
            />
            <PinInputField
              bg="white"
              borderColor="brand.gray.300"
              _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
              fontSize="2xl"
              h="56px"
              w="48px"
            />
            <PinInputField
              bg="white"
              borderColor="brand.gray.300"
              _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
              fontSize="2xl"
              h="56px"
              w="48px"
            />
            <PinInputField
              bg="white"
              borderColor="brand.gray.300"
              _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
              fontSize="2xl"
              h="56px"
              w="48px"
            />
            <PinInputField
              bg="white"
              borderColor="brand.gray.300"
              _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
              fontSize="2xl"
              h="56px"
              w="48px"
            />
            <PinInputField
              bg="white"
              borderColor="brand.gray.300"
              _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
              fontSize="2xl"
              h="56px"
              w="48px"
            />
          </PinInput>
        </HStack>

        <Button w="100%" variant="primary" size="lg">
          Verify & Continue
        </Button>

        <Text fontSize="sm" color="brand.gray.600">
          Didn't receive code?{' '}
          <Text as="span" color="brand.primary" fontWeight="600" cursor="pointer">
            Resend
          </Text>
        </Text>
      </VStack>
    </Box>
  );
}
