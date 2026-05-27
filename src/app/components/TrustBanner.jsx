import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import { ShieldCheck, Lock, Users } from 'lucide-react';

export default function TrustBanner() {
  return (
    <Box bg="white" py={6} px={4} boxShadow="sm">
      <VStack spacing={4}>
        <HStack spacing={6} justify="center" flexWrap="wrap">
          <VStack spacing={1} minW="100px">
            <Box bg="brand.success" p={2} borderRadius="full">
              <ShieldCheck size={24} color="white" />
            </Box>
            <Text fontSize="xs" fontWeight="600" textAlign="center">
              100% Secure
            </Text>
            <Text fontSize="xs" color="brand.gray.600" textAlign="center">
              Escrow Protected
            </Text>
          </VStack>

          <VStack spacing={1} minW="100px">
            <Box bg="brand.primary" p={2} borderRadius="full">
              <Lock size={24} color="white" />
            </Box>
            <Text fontSize="xs" fontWeight="600" textAlign="center">
              Verified Agents
            </Text>
            <Text fontSize="xs" color="brand.gray.600" textAlign="center">
              KYC Approved
            </Text>
          </VStack>

          <VStack spacing={1} minW="100px">
            <Box bg="brand.accent" p={2} borderRadius="full">
              <Users size={24} color="white" />
            </Box>
            <Text fontSize="xs" fontWeight="600" textAlign="center">
              10,000+ Renters
            </Text>
            <Text fontSize="xs" color="brand.gray.600" textAlign="center">
              Trust LazyHomes
            </Text>
          </VStack>
        </HStack>
      </VStack>
    </Box>
  );
}
