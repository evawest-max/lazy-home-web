import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Input,
  FormControl,
  FormLabel,
  Select,
} from '@chakra-ui/react';
import { ArrowLeft, ShieldCheck, AlertCircle, Lock } from 'lucide-react';
import SafetyGuarantee from './SafetyGuarantee';
import { Link } from 'react-router-dom';

export default function IdentityVerification() {
  return (
    <Box minH="100vh" bg="brand.background" pb="100px">
      <Box bg="brand.primary" px={6} pt={12} pb={8}>
        <HStack mb={6}>
          <Link to="/profile">
            <IconButton
              icon={<ArrowLeft size={20} />}
              variant="ghost"
              color="white"
              _hover={{ bg: 'whiteAlpha.200' }}
              aria-label="Back"
            />
          </Link>
          <Text fontSize="xl" fontWeight="bold" color="white" flex={1}>
            Verify Your Identity
          </Text>
        </HStack>
      </Box>

      <VStack align="stretch" px={6} mt={-4} spacing={6}>
        <Box bg="white" borderRadius="xl" p={6} boxShadow="md" border="2px solid" borderColor="brand.success">
          <VStack align="stretch" spacing={4}>
            <HStack justify="center" bg="brand.success" py={3} px={4} borderRadius="lg">
              <ShieldCheck size={20} color="white" />
              <Text fontSize="sm" fontWeight="bold" color="white">
                YOUR PAYMENT IS ESCROW PROTECTED
              </Text>
            </HStack>
            <HStack>
              <Box bg="brand.accent" p={2} borderRadius="full">
                <Lock size={20} color="white" />
              </Box>
              <VStack align="start" spacing={0} flex={1}>
                <Text fontSize="sm" fontWeight="600" color="brand.gray.800">
                  Why We Need This
                </Text>
                <Text fontSize="xs" color="brand.gray.600">
                  To protect YOU and prevent fraud. Your data is encrypted and never shared.
                </Text>
              </VStack>
            </HStack>
          </VStack>
        </Box>

        <Box bg="white" borderRadius="xl" p={6} boxShadow="sm">
          <VStack align="stretch" spacing={6}>
            <Text fontSize="lg" fontWeight="600" color="brand.gray.800">
              Step 1: Enter Your Details
            </Text>

            <FormControl>
              <FormLabel color="brand.gray.700">Full Name</FormLabel>
              <Input
                placeholder="As shown on ID"
                size="lg"
                _focus={{ borderColor: 'brand.primary' }}
              />
            </FormControl>

            <FormControl>
              <FormLabel color="brand.gray.700">ID Type</FormLabel>
              <Select
                placeholder="Select ID type"
                size="lg"
                _focus={{ borderColor: 'brand.primary' }}
              >
                <option value="nin">National Identity Number (NIN)</option>
                <option value="bvn">Bank Verification Number (BVN)</option>
                <option value="passport">International Passport</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel color="brand.gray.700">ID Number</FormLabel>
              <Input
                placeholder="Enter your ID number"
                size="lg"
                _focus={{ borderColor: 'brand.primary' }}
              />
            </FormControl>

            <Button variant="primary" size="lg">
              Continue to Liveness Check
            </Button>
          </VStack>
        </Box>

        <Box bg="white" borderRadius="xl" p={6} boxShadow="sm">
          <VStack align="stretch" spacing={4}>
            <Text fontSize="lg" fontWeight="600" color="brand.gray.800">
              What's Next?
            </Text>

            <VStack align="stretch" spacing={3}>
              <HStack>
                <Box
                  bg="brand.accent"
                  p={2}
                  borderRadius="full"
                  minW="32px"
                  h="32px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text color="white" fontWeight="bold" fontSize="sm">1</Text>
                </Box>
                <Text fontSize="sm" color="brand.gray.700">
                  We'll verify your ID details with government databases
                </Text>
              </HStack>

              <HStack>
                <Box
                  bg="brand.accent"
                  p={2}
                  borderRadius="full"
                  minW="32px"
                  h="32px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text color="white" fontWeight="bold" fontSize="sm">2</Text>
                </Box>
                <Text fontSize="sm" color="brand.gray.700">
                  Take a quick selfie for liveness verification
                </Text>
              </HStack>

              <HStack>
                <Box
                  bg="brand.accent"
                  p={2}
                  borderRadius="full"
                  minW="32px"
                  h="32px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text color="white" fontWeight="bold" fontSize="sm">3</Text>
                </Box>
                <Text fontSize="sm" color="brand.gray.700">
                  Get verified instantly and proceed with payment
                </Text>
              </HStack>
            </VStack>
          </VStack>
        </Box>

        <SafetyGuarantee />

        <Box
          bg="brand.background"
          border="2px solid"
          borderColor="brand.success"
          borderRadius="lg"
          p={5}
        >
          <VStack spacing={3}>
            <HStack spacing={2}>
              <ShieldCheck size={24} color="#2E7D32" />
              <Text fontSize="md" fontWeight="bold" color="brand.success">
                Your Money is ALREADY Protected
              </Text>
            </HStack>
            <Text fontSize="sm" color="brand.gray.700" textAlign="center">
              Payment is held in escrow. You can still get full refund after verification if property doesn't match.
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}
