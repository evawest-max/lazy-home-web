import { Box, VStack, HStack, Text, Grid } from '@chakra-ui/react';
import { XCircle, CheckCircle } from 'lucide-react';

export default function BeforeAfter() {
  return (
    <Box bg="white" borderRadius="xl" p={6} boxShadow="md">
      <VStack spacing={5} align="stretch">
        <Text fontSize="lg" fontWeight="bold" color="brand.primary" textAlign="center">
          Traditional Renting vs LazyHomes
        </Text>

        <Grid templateColumns="1fr 1fr" gap={4}>
          <VStack align="stretch" spacing={3}>
            <Box bg="brand.error" py={2} px={3} borderRadius="lg" textAlign="center">
              <Text fontSize="sm" fontWeight="bold" color="white">
                ❌ Traditional Way
              </Text>
            </Box>

            <VStack spacing={2} align="stretch">
              <HStack spacing={2} align="start">
                <XCircle size={16} color="#C62828" style={{ marginTop: 2, flexShrink: 0 }} />
                <Text fontSize="xs" color="brand.gray.700">
                  Pay landlord directly
                </Text>
              </HStack>

              <HStack spacing={2} align="start">
                <XCircle size={16} color="#C62828" style={{ marginTop: 2, flexShrink: 0 }} />
                <Text fontSize="xs" color="brand.gray.700">
                  No refund if scammed
                </Text>
              </HStack>

              <HStack spacing={2} align="start">
                <XCircle size={16} color="#C62828" style={{ marginTop: 2, flexShrink: 0 }} />
                <Text fontSize="xs" color="brand.gray.700">
                  Fake listings common
                </Text>
              </HStack>

              <HStack spacing={2} align="start">
                <XCircle size={16} color="#C62828" style={{ marginTop: 2, flexShrink: 0 }} />
                <Text fontSize="xs" color="brand.gray.700">
                  Money gone instantly
                </Text>
              </HStack>

              <HStack spacing={2} align="start">
                <XCircle size={16} color="#C62828" style={{ marginTop: 2, flexShrink: 0 }} />
                <Text fontSize="xs" color="brand.gray.700">
                  No protection
                </Text>
              </HStack>
            </VStack>
          </VStack>

          <VStack align="stretch" spacing={3}>
            <Box bg="brand.success" py={2} px={3} borderRadius="lg" textAlign="center">
              <Text fontSize="sm" fontWeight="bold" color="white">
                ✅ LazyHomes Way
              </Text>
            </Box>

            <VStack spacing={2} align="stretch">
              <HStack spacing={2} align="start">
                <CheckCircle size={16} color="#2E7D32" style={{ marginTop: 2, flexShrink: 0 }} />
                <Text fontSize="xs" color="brand.gray.700" fontWeight="600">
                  Pay into secure escrow
                </Text>
              </HStack>

              <HStack spacing={2} align="start">
                <CheckCircle size={16} color="#2E7D32" style={{ marginTop: 2, flexShrink: 0 }} />
                <Text fontSize="xs" color="brand.gray.700" fontWeight="600">
                  100% refund guarantee
                </Text>
              </HStack>

              <HStack spacing={2} align="start">
                <CheckCircle size={16} color="#2E7D32" style={{ marginTop: 2, flexShrink: 0 }} />
                <Text fontSize="xs" color="brand.gray.700" fontWeight="600">
                  All verified listings
                </Text>
              </HStack>

              <HStack spacing={2} align="start">
                <CheckCircle size={16} color="#2E7D32" style={{ marginTop: 2, flexShrink: 0 }} />
                <Text fontSize="xs" color="brand.gray.700" fontWeight="600">
                  You approve before release
                </Text>
              </HStack>

              <HStack spacing={2} align="start">
                <CheckCircle size={16} color="#2E7D32" style={{ marginTop: 2, flexShrink: 0 }} />
                <Text fontSize="xs" color="brand.gray.700" fontWeight="600">
                  Full fraud protection
                </Text>
              </HStack>
            </VStack>
          </VStack>
        </Grid>

        <Box bg="brand.background" p={4} borderRadius="lg" textAlign="center">
          <Text fontSize="sm" fontWeight="bold" color="brand.primary">
            Join 10,000+ Nigerians Who Rent Safely with LazyHomes
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}
