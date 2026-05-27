import { Box, VStack, HStack, Text } from '@chakra-ui/react';
import { RefreshCw, ShieldCheck } from 'lucide-react';

export default function RefundGuarantee() {
  return (
    <Box
      bg="linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)"
      borderRadius="xl"
      p={6}
      boxShadow="lg"
      border="3px solid"
      borderColor="white"
    >
      <VStack spacing={4}>
        <HStack spacing={3}>
          <Box bg="white" p={3} borderRadius="full">
            <RefreshCw size={32} color="#2E7D32" />
          </Box>
          <VStack align="start" spacing={0}>
            <Text fontSize="lg" fontWeight="bold" color="white">
              100% REFUND GUARANTEE
            </Text>
            <Text fontSize="sm" color="whiteAlpha.900">
              No questions asked
            </Text>
          </VStack>
        </HStack>

        <Box bg="whiteAlpha.200" p={4} borderRadius="lg" w="100%">
          <VStack spacing={3}>
            <HStack spacing={2}>
              <ShieldCheck size={18} color="white" />
              <Text fontSize="sm" fontWeight="600" color="white">
                If property doesn't match listing
              </Text>
            </HStack>

            <HStack spacing={2}>
              <ShieldCheck size={18} color="white" />
              <Text fontSize="sm" fontWeight="600" color="white">
                If agent misrepresented information
              </Text>
            </HStack>

            <HStack spacing={2}>
              <ShieldCheck size={18} color="white" />
              <Text fontSize="sm" fontWeight="600" color="white">
                If you change your mind within inspection period
              </Text>
            </HStack>
          </VStack>
        </Box>

        <Box bg="white" p={4} borderRadius="lg" w="100%" textAlign="center">
          <Text fontSize="md" fontWeight="bold" color="brand.success">
            Get Your FULL MONEY BACK in 24 Hours
          </Text>
          <Text fontSize="xs" color="brand.gray.600" mt={1}>
            Processed instantly to your bank account
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}
