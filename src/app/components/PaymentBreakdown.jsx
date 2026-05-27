import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Divider,
} from '@chakra-ui/react';
import { ArrowLeft, ShieldCheck, Lock } from 'lucide-react';
import RefundGuarantee from './RefundGuarantee';
import { Link, useParams } from 'react-router-dom';
import { mockProperties } from './mockData';

export default function PaymentBreakdown() {
  const { id } = useParams();
  const property = mockProperties.find((p) => p.id === parseInt(id)); // Replace with actual data fetching logic based on ID
  return (
    <Box minH="100vh" bg="brand.background" pb="100px">
      <Box bg="brand.primary" px={6} pt={12} pb={8}>
        <HStack mb={6}>
          <Link to={`/property/${id}`}>
          <IconButton
            icon={<ArrowLeft size={20} />}
            variant="ghost"
            color="white"
            _hover={{ bg: 'whiteAlpha.200' }}
            aria-label="Back"
          />
          </Link>
          <Text fontSize="xl" fontWeight="bold" color="white" flex={1}>
            Payment Breakdown
          </Text>
        </HStack>
      </Box>

      <VStack align="stretch" px={6} mt={-4} spacing={6}>
        <Box bg="white" borderRadius="xl" p={6} boxShadow="lg" border="3px solid" borderColor="brand.success">
          <VStack align="stretch" spacing={4}>
            <Box bg="brand.success" p={4} borderRadius="lg" textAlign="center">
              <VStack spacing={2}>
                <ShieldCheck size={32} color="white" />
                <Text fontSize="md" fontWeight="bold" color="white">
                  100% ESCROW PROTECTED
                </Text>
                <Text fontSize="sm" color="whiteAlpha.900">
                  Your money is completely safe
                </Text>
              </VStack>
            </Box>

            <VStack spacing={2} bg="brand.background" p={4} borderRadius="lg">
              <Text fontSize="sm" fontWeight="600" color="brand.gray.800" textAlign="center">
                ✓ We hold your money securely
              </Text>
              <Text fontSize="sm" fontWeight="600" color="brand.gray.800" textAlign="center">
                ✓ You inspect property first
              </Text>
              <Text fontSize="sm" fontWeight="600" color="brand.gray.800" textAlign="center">
                ✓ You approve before landlord gets paid
              </Text>
              <Text fontSize="sm" fontWeight="600" color="brand.gray.800" textAlign="center">
                ✓ Full refund if property doesn't match
              </Text>
            </VStack>
          </VStack>
        </Box>

        <Box bg="white" borderRadius="xl" p={6} boxShadow="sm">
          <VStack align="stretch" spacing={4}>
            <Text fontSize="lg" fontWeight="600" color="brand.gray.800">
              Payment Details
            </Text>

            <VStack align="stretch" spacing={3}>
              <HStack justify="space-between">
                <Text color="brand.gray.600">Annual Rent</Text>
                <Text fontWeight="600" fontSize="lg">₦{property.price.toLocaleString()}</Text>
              </HStack>

              <HStack justify="space-between">
                <Text color="brand.gray.600">Agency Fee (10%)</Text>
                <Text fontWeight="600">₦{Math.floor(property.price * 0.1).toLocaleString()}</Text>
              </HStack>

              <HStack justify="space-between">
                <Text color="brand.gray.600">Legal Fee</Text>
                <Text fontWeight="600">₦{Math.floor(property.price * 0.1).toLocaleString()}</Text>
              </HStack>

              <HStack justify="space-between">
                <Text color="brand.gray.600">Safety Levy</Text>
                <Text fontWeight="600">₦15,000</Text>
              </HStack>

              <HStack justify="space-between">
                <Text color="brand.gray.600">Service Fee (2%)</Text>
                <Text fontWeight="600">₦{Math.floor(property.price * 0.02).toLocaleString()}</Text>
              </HStack>

              <HStack justify="space-between">
                <Text color="brand.gray.600">Processing Fee (none refundable)</Text>
                <Text fontWeight="600">₦{(() => {
                  // const adminCharge = formData.price * (10 / 110) * formData.requestedQuantity;
                  const percentageFee = property.price * 0.015;
                  const baseFee = property.price < 2500 ? 0 : 100;
                  const processingFee = Math.min(percentageFee + baseFee, 2000);
                  return (processingFee).toLocaleString();
                })()}</Text>
              </HStack>

              <HStack justify="space-between">
                <Text color="brand.gray.600">Caution Deposit</Text>
                <Text fontWeight="600">₦{Math.floor(property.price * 0.1).toLocaleString()}</Text>
              </HStack>

              <Divider />

              <HStack justify="space-between">
                <Text fontSize="lg" fontWeight="bold" color="brand.primary">
                  Total Amount
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="brand.primary">
                  ₦{(property.price + 
                    Math.floor(property.price * 0.1) + 
                    Math.floor(property.price * 0.1) + 
                    15000 + Math.floor(property.price * 0.02) + 
                    Math.floor(property.price * 0.1)).toLocaleString()}
                </Text>
              </HStack>
            </VStack>
          </VStack>
        </Box>

        <Box bg="white" borderRadius="xl" p={6} boxShadow="md" border="2px solid" borderColor="brand.accent">
          <VStack align="stretch" spacing={5}>
            <HStack spacing={2}>
              <Box bg="brand.accent" p={2} borderRadius="full">
                <ShieldCheck size={20} color="white" />
              </Box>
              <Text fontSize="lg" fontWeight="bold" color="brand.primary">
                How Escrow Protects You
              </Text>
            </HStack>

            <VStack align="stretch" spacing={5}>
              <Box bg="brand.success" p={4} borderRadius="lg" position="relative">
                <HStack spacing={3} align="start">
                  <Box
                    bg="white"
                    minW="50px"
                    h="50px"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontWeight="bold"
                    fontSize="xl"
                    color="brand.success"
                  >
                    1
                  </Box>
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontSize="md" fontWeight="bold" color="white">
                      Your Money is LOCKED
                    </Text>
                    <Text fontSize="sm" color="whiteAlpha.900">
                      Payment stays in secure escrow account. Landlord CANNOT touch it yet.
                    </Text>
                  </VStack>
                </HStack>
              </Box>

              <Box borderLeft="4px solid" borderColor="brand.accent" pl={4} py={2}>
                <HStack spacing={3} align="start">
                  <Box
                    bg="brand.accent"
                    minW="50px"
                    h="50px"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontWeight="bold"
                    fontSize="xl"
                    color="white"
                  >
                    2
                  </Box>
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontSize="md" fontWeight="600" color="brand.gray.800">
                      You Visit & Inspect
                    </Text>
                    <Text fontSize="sm" color="brand.gray.700">
                      Take your time. Upload photos. Check everything carefully within 7 days.
                    </Text>
                  </VStack>
                </HStack>
              </Box>

              <Box borderLeft="4px solid" borderColor="brand.accent" pl={4} py={2}>
                <HStack spacing={3} align="start">
                  <Box
                    bg="brand.accent"
                    minW="50px"
                    h="50px"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontWeight="bold"
                    fontSize="xl"
                    color="white"
                  >
                    3
                  </Box>
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontSize="md" fontWeight="600" color="brand.gray.800">
                      YOU Decide
                    </Text>
                    <Text fontSize="sm" color="brand.gray.700">
                      Property matches? Approve payment. Doesn't match? Get FULL REFUND instantly.
                    </Text>
                  </VStack>
                </HStack>
              </Box>

              <Box bg="brand.primary" p={4} borderRadius="lg">
                <HStack spacing={3} align="start">
                  <Box
                    bg="white"
                    minW="50px"
                    h="50px"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontWeight="bold"
                    fontSize="xl"
                    color="brand.primary"
                  >
                    4
                  </Box>
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontSize="md" fontWeight="bold" color="white">
                      Landlord Gets Paid
                    </Text>
                    <Text fontSize="sm" color="whiteAlpha.900">
                      ONLY after you approve. You are in complete control!
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            </VStack>
          </VStack>
        </Box>

        <RefundGuarantee />

        <Box bg="brand.background" border="2px dashed" borderColor="brand.success" borderRadius="lg" p={5}>
          <VStack spacing={3}>
            <Text fontSize="md" fontWeight="bold" color="brand.success" textAlign="center">
              🛡️ YOUR PROTECTION GUARANTEE
            </Text>
            <Text fontSize="sm" color="brand.gray.700" textAlign="center" lineHeight="1.6">
              LazyHomes has protected over <Text as="span" fontWeight="bold" color="brand.primary">₦24 Billion</Text> in rental transactions. Your money is insured and 100% safe.
            </Text>
          </VStack>
        </Box>
      </VStack>

      <Box
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        bg="white"
        borderTop="2px solid"
        borderColor="brand.success"
        p={6}
        boxShadow="2xl"
      >
        <VStack spacing={3}>
          <HStack spacing={2} bg="brand.background" py={2} px={4} borderRadius="lg" w="100%" justify="center">
            <ShieldCheck size={16} color="#2E7D32" />
            <Text fontSize="xs" fontWeight="bold" color="brand.success">
              100% SAFE - MONEY PROTECTED BY ESCROW
            </Text>
          </HStack>
          <Button
            w="100%"
            variant="primary"
            size="lg"
            leftIcon={<Lock size={18} />}
          >
            Proceed to Secure Payment
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}
