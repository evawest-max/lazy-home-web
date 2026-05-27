import { Box, VStack, HStack, Text } from '@chakra-ui/react';
import { Shield, RefreshCw, Lock, CheckCircle } from 'lucide-react';

export default function SafetyGuarantee() {
  return (
    <Box bg="white" borderRadius="xl" p={6} boxShadow="md" border="2px solid" borderColor="brand.success">
      <VStack spacing={5} align="stretch">
        <HStack justify="center">
          <Box bg="brand.success" p={3} borderRadius="full">
            <Shield size={32} color="white" />
          </Box>
        </HStack>

        <Text fontSize="lg" fontWeight="bold" color="brand.primary" textAlign="center">
          LazyHomes Safety Guarantee
        </Text>

        <VStack spacing={4} align="stretch">
          <HStack spacing={3} bg="brand.background" p={4} borderRadius="lg">
            <Box bg="brand.success" p={2} borderRadius="full">
              <RefreshCw size={20} color="white" />
            </Box>
            <VStack align="start" spacing={0} flex={1}>
              <Text fontSize="sm" fontWeight="600" color="brand.gray.800">
                100% Money-Back Guarantee
              </Text>
              <Text fontSize="xs" color="brand.gray.600">
                Full instant refund if property doesn't match
              </Text>
            </VStack>
          </HStack>

          <HStack spacing={3} bg="brand.background" p={4} borderRadius="lg">
            <Box bg="brand.success" p={2} borderRadius="full">
              <Lock size={20} color="white" />
            </Box>
            <VStack align="start" spacing={0} flex={1}>
              <Text fontSize="sm" fontWeight="600" color="brand.gray.800">
                Bank-Grade Security
              </Text>
              <Text fontSize="xs" color="brand.gray.600">
                Your payment is encrypted and insured
              </Text>
            </VStack>
          </HStack>

          <HStack spacing={3} bg="brand.background" p={4} borderRadius="lg">
            <Box bg="brand.success" p={2} borderRadius="full">
              <CheckCircle size={20} color="white" />
            </Box>
            <VStack align="start" spacing={0} flex={1}>
              <Text fontSize="sm" fontWeight="600" color="brand.gray.800">
                Verified Listings Only
              </Text>
              <Text fontSize="xs" color="brand.gray.600">
                All agents are KYC verified and background checked
              </Text>
            </VStack>
          </HStack>
        </VStack>

        <Box bg="brand.success" p={4} borderRadius="lg" textAlign="center">
          <Text fontSize="sm" fontWeight="bold" color="white">
            Over 10,000 Nigerians trust LazyHomes for safe rentals
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}
