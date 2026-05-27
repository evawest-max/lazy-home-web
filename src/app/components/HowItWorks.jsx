import { Box, VStack, HStack, Text } from '@chakra-ui/react';
import { Wallet, Eye, CheckCircle, Home } from 'lucide-react';

export default function HowItWorks() {
  return (
    <Box bg="white" borderRadius="xl" p={6} boxShadow="sm">
      <VStack spacing={5} align="stretch">
        <Text fontSize="lg" fontWeight="bold" color="brand.primary" textAlign="center">
          How LazyHomes Works
        </Text>

        <VStack spacing={4} align="stretch">
          <HStack spacing={4} align="start">
            <Box
              bg="brand.primary"
              minW="50px"
              h="50px"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Wallet size={24} color="white" />
            </Box>
            <VStack align="start" spacing={1} flex={1}>
              <Text fontSize="md" fontWeight="600" color="brand.gray.800">
                1. Pay Safely
              </Text>
              <Text fontSize="sm" color="brand.gray.600">
                Your money goes into secure escrow, NOT to the landlord
              </Text>
            </VStack>
          </HStack>

          <HStack spacing={4} align="start">
            <Box
              bg="brand.accent"
              minW="50px"
              h="50px"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Eye size={24} color="white" />
            </Box>
            <VStack align="start" spacing={1} flex={1}>
              <Text fontSize="md" fontWeight="600" color="brand.gray.800">
                2. Inspect Property
              </Text>
              <Text fontSize="sm" color="brand.gray.600">
                Visit the house. Check everything. Take photos
              </Text>
            </VStack>
          </HStack>

          <HStack spacing={4} align="start">
            <Box
              bg="brand.secondary"
              minW="50px"
              h="50px"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <CheckCircle size={24} color="white" />
            </Box>
            <VStack align="start" spacing={1} flex={1}>
              <Text fontSize="md" fontWeight="600" color="brand.gray.800">
                3. Approve or Reject
              </Text>
              <Text fontSize="sm" color="brand.gray.600">
                Matches? Approve. Doesn't match? Get full refund
              </Text>
            </VStack>
          </HStack>

          <HStack spacing={4} align="start">
            <Box
              bg="brand.success"
              minW="50px"
              h="50px"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Home size={24} color="white" />
            </Box>
            <VStack align="start" spacing={1} flex={1}>
              <Text fontSize="md" fontWeight="600" color="brand.gray.800">
                4. Move In
              </Text>
              <Text fontSize="sm" color="brand.gray.600">
                Only after YOUR approval, landlord gets paid
              </Text>
            </VStack>
          </HStack>
        </VStack>

        <Box bg="brand.background" p={4} borderRadius="lg" textAlign="center">
          <Text fontSize="sm" fontWeight="600" color="brand.primary">
            You are in complete control at every step!
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}
