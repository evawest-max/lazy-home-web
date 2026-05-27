import { Box, VStack, HStack, Text, Image } from '@chakra-ui/react';
import { ShieldCheck, Eye, CheckCircle, Banknote } from 'lucide-react';

export default function EscrowExplainer() {
  return (
    <Box bg="white" borderRadius="xl" p={6} boxShadow="md" border="2px solid" borderColor="brand.success">
      <VStack spacing={5} align="stretch">
        <HStack spacing={3}>
          <Box bg="brand.success" p={3} borderRadius="full">
            <ShieldCheck size={28} color="white" />
          </Box>
          <VStack align="start" spacing={0}>
            <Text fontSize="lg" fontWeight="bold" color="brand.success">
              Your Money is 100% Safe
            </Text>
            <Text fontSize="sm" color="brand.gray.600">
              How LazyHomes Escrow Protects You
            </Text>
          </VStack>
        </HStack>

        <Box bg="brand.background" p={4} borderRadius="lg">
          <VStack spacing={4} align="stretch">
            <HStack spacing={3} align="start">
              <Box
                bg="brand.primary"
                minW="40px"
                h="40px"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontWeight="bold"
                color="white"
              >
                1
              </Box>
              <VStack align="start" spacing={1} flex={1}>
                <HStack>
                  <Banknote size={18} color="#00695C" />
                  <Text fontWeight="600" fontSize="sm">You Pay</Text>
                </HStack>
                <Text fontSize="xs" color="brand.gray.700">
                  Money goes into secure escrow account (NOT to landlord yet)
                </Text>
              </VStack>
            </HStack>

            <HStack spacing={3} align="start">
              <Box
                bg="brand.primary"
                minW="40px"
                h="40px"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontWeight="bold"
                color="white"
              >
                2
              </Box>
              <VStack align="start" spacing={1} flex={1}>
                <HStack>
                  <Eye size={18} color="#00695C" />
                  <Text fontWeight="600" fontSize="sm">You Inspect</Text>
                </HStack>
                <Text fontSize="xs" color="brand.gray.700">
                  Visit property within 7 days. Take photos as proof.
                </Text>
              </VStack>
            </HStack>

            <HStack spacing={3} align="start">
              <Box
                bg="brand.primary"
                minW="40px"
                h="40px"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontWeight="bold"
                color="white"
              >
                3
              </Box>
              <VStack align="start" spacing={1} flex={1}>
                <HStack>
                  <CheckCircle size={18} color="#00695C" />
                  <Text fontWeight="600" fontSize="sm">You Approve</Text>
                </HStack>
                <Text fontSize="xs" color="brand.gray.700">
                  If property matches, approve. If not, get FULL REFUND instantly.
                </Text>
              </VStack>
            </HStack>
          </VStack>
        </Box>

        <Box bg="brand.success" p={4} borderRadius="lg">
          <VStack spacing={2}>
            <Text fontSize="sm" fontWeight="bold" color="white" textAlign="center">
              ✓ NO PAYMENT without your approval
            </Text>
            <Text fontSize="sm" fontWeight="bold" color="white" textAlign="center">
              ✓ FULL REFUND if property doesn't match
            </Text>
            <Text fontSize="sm" fontWeight="bold" color="white" textAlign="center">
              ✓ Your money is HELD SAFELY until you say YES
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}
