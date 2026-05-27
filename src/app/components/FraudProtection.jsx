import { Box, VStack, HStack, Text } from '@chakra-ui/react';
import { Shield, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export default function FraudProtection() {
  return (
    <Box bg="white" borderRadius="xl" p={6} boxShadow="md" border="2px solid" borderColor="brand.error">
      <VStack spacing={5} align="stretch">
        <HStack spacing={3}>
          <Box bg="brand.error" p={3} borderRadius="full">
            <Shield size={28} color="white" />
          </Box>
          <VStack align="start" spacing={0}>
            <Text fontSize="lg" fontWeight="bold" color="brand.error">
              How We Prevent Fraud
            </Text>
            <Text fontSize="sm" color="brand.gray.600">
              Multiple layers of protection
            </Text>
          </VStack>
        </HStack>

        <Box bg="brand.background" p={4} borderRadius="lg">
          <VStack spacing={4} align="stretch">
            <HStack spacing={3} align="start">
              <CheckCircle size={20} color="#2E7D32" />
              <VStack align="start" spacing={0} flex={1}>
                <Text fontSize="sm" fontWeight="600" color="brand.gray.800">
                  Agent KYC Verification
                </Text>
                <Text fontSize="xs" color="brand.gray.600">
                  BVN, NIN, and bank account verified before listing
                </Text>
              </VStack>
            </HStack>

            <HStack spacing={3} align="start">
              <CheckCircle size={20} color="#2E7D32" />
              <VStack align="start" spacing={0} flex={1}>
                <Text fontSize="sm" fontWeight="600" color="brand.gray.800">
                  Property Inspection Required
                </Text>
                <Text fontSize="xs" color="brand.gray.600">
                  You MUST visit property before payment is released
                </Text>
              </VStack>
            </HStack>

            <HStack spacing={3} align="start">
              <CheckCircle size={20} color="#2E7D32" />
              <VStack align="start" spacing={0} flex={1}>
                <Text fontSize="sm" fontWeight="600" color="brand.gray.800">
                  Escrow Holds Payment
                </Text>
                <Text fontSize="xs" color="brand.gray.600">
                  Fraudsters can't access money until you approve
                </Text>
              </VStack>
            </HStack>

            <HStack spacing={3} align="start">
              <CheckCircle size={20} color="#2E7D32" />
              <VStack align="start" spacing={0} flex={1}>
                <Text fontSize="sm" fontWeight="600" color="brand.gray.800">
                  Photo Proof System
                </Text>
                <Text fontSize="xs" color="brand.gray.600">
                  Upload inspection photos to document condition
                </Text>
              </VStack>
            </HStack>
          </VStack>
        </Box>

        <Box bg="brand.error" p={4} borderRadius="lg">
          <HStack spacing={3}>
            <AlertCircle size={24} color="white" />
            <VStack align="start" spacing={0} flex={1}>
              <Text fontSize="sm" fontWeight="bold" color="white">
                Suspect Fraud? Report Instantly
              </Text>
              <Text fontSize="xs" color="whiteAlpha.900">
                Our team investigates within 2 hours and freezes payments
              </Text>
            </VStack>
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
}
