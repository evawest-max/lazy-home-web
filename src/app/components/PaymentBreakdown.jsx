import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Divider,
  Image,
  Spinner,
  useToast,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useDisclosure,
} from '@chakra-ui/react';
import { ArrowLeft, ShieldCheck, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import RefundGuarantee from './RefundGuarantee';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getSingleProperty, initializeFundwallet, payRent } from '../../../api';

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') return 'N/A';
  return `₦${Number(value).toLocaleString()}`;
};

export default function PaymentBreakdown() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
  const cancelRef = useRef(null);
  const toast = useToast();
  const navigate = useNavigate()

  const imageUrls = useMemo(() => {
    const rawImages = property?.media?.images || property?.images || property?.gallery || [];

    if (Array.isArray(rawImages)) {
      return rawImages
        .map((item) => {
          if (typeof item === 'string') return item;
          return item?.url || item?.secure_url || item?.src || '';
        })
        .filter(Boolean);
    }

    if (typeof rawImages === 'string') return [rawImages];

    return [];
  }, [property]);

  useEffect(() => {
    let isMounted = true;

    const fetchProperty = async () => {
      try {
        setLoading(true);
        const response = await getSingleProperty(id);
        const payload = response?.data?.data?.property
          || response?.data?.property
          || response?.data?.data
          || response?.data;

        if (isMounted) {
          setProperty(payload || null);
          setCurrentIndex(0);
        }
      } catch (error) {
        console.error('Failed to fetch property:', error);
        if (isMounted) {
          setProperty(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProperty();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!imageUrls.length) return undefined;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [imageUrls.length]);
  const payRentAmount = async (id) => {
    setConfirming(true);

    try {
      const response = await payRent({ propertyId: id });
      console.log('Pay rent response:', response);
      const { data } = response;
      toast({
        title: 'Escrow payment confirmed',
        description: response.data.message + ' Redirecting to dashboard.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      // if (data && data.data && data.data.authorization_url) {
      //   window.location.href = data.data.authorization_url;
      // }
      setTimeout(() => {
        navigate("/dashboard", {state:{parameter: 1}})
      }, 3000);
    } catch (error) {
      // console.log('Failed to initialize fund wallet:', error?.response?.data?.message);
      toast({
        title: 'Payment failed',
        description: error?.response?.data?.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setConfirming(false);
      onConfirmClose();
    }
  };

  const openConfirmDialog = () => {
    onConfirmOpen();
  };

  if (loading) {
    return (
      <Box minH="100vh" bg="brand.background" display="flex" justifyContent="center" alignItems="center">
        <VStack spacing={4} p={8} bg="white" borderRadius="xl" boxShadow="lg">
          <Spinner size="xl" color="brand.primary" thickness="4px" />
          <Text fontSize="lg" fontWeight="600" color="brand.gray.700">
            Loading payment details...
          </Text>
        </VStack>
      </Box>
    );
  }

  if (!property) {
    return (
      <Box minH="100vh" bg="brand.background" display="flex" justifyContent="center" alignItems="center">
        <VStack spacing={4} p={8} bg="white" borderRadius="xl" boxShadow="lg">
          <Text fontSize="lg" fontWeight="600" color="brand.gray.700">
            Property not found.
          </Text>
        </VStack>
      </Box>
    );
  }

  const price = Number(property?.rentAmount ?? 0);
  const agencyFee = Math.floor(price * 0.1);
  const legalFee = Math.floor(price * 0.1);
  const safetyLevy = 15000;
  const serviceFee = Math.floor(price * 0.05);
  const processingFee = Math.min(Math.floor(price * 0.015) + (price < 2500 ? 0 : 100), 2000);
  const cautionDeposit = Math.floor(price * 0.1);
  const totalAmount = price + agencyFee + legalFee  + serviceFee + processingFee + cautionDeposit;
  const title = property?.title || property?.propertyType || 'Property';
  const location = property?.address?.area || property?.address?.city || property?.location?.area || property?.location?.city || 'Location coming soon';

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
        <Box bg="white" borderRadius="xl" p={4} boxShadow="lg" border="3px solid" borderColor="brand.success">
          <VStack align="stretch" spacing={3}>
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

            <Box position="relative">
              <Image
                src={imageUrls[currentIndex] || 'https://placehold.co/600x320/00695C/ffffff?text=Property'}
                alt={title}
                h="220px"
                w="100%"
                objectFit="cover"
                borderRadius="lg"
              />

              {imageUrls.length > 1 && (
                <>
                  <IconButton
                    icon={<ChevronLeft size={18} />}
                    aria-label="Previous image"
                    position="absolute"
                    left={3}
                    top="50%"
                    transform="translateY(-50%)"
                    bg="whiteAlpha.900"
                    onClick={() => setCurrentIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length)}
                  />
                  <IconButton
                    icon={<ChevronRight size={18} />}
                    aria-label="Next image"
                    position="absolute"
                    right={3}
                    top="50%"
                    transform="translateY(-50%)"
                    bg="whiteAlpha.900"
                    onClick={() => setCurrentIndex((prev) => (prev + 1) % imageUrls.length)}
                  />
                </>
              )}
            </Box>

            <VStack spacing={1} align="start">
              <Text fontSize="lg" fontWeight="bold" color="brand.primary">
                {title}
              </Text>
              <Text fontSize="sm" color="brand.gray.700">
                {location}
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
                <Text fontWeight="600" fontSize="lg">{formatCurrency(price)}</Text>
              </HStack>

              <HStack justify="space-between">
                <Text color="brand.gray.600">Agency Fee (10%)</Text>
                <Text fontWeight="600">{formatCurrency(agencyFee)}</Text>
              </HStack>

              <HStack justify="space-between">
                <Text color="brand.gray.600">Legal Fee</Text>
                <Text fontWeight="600">{formatCurrency(legalFee)}</Text>
              </HStack>

              {/* <HStack justify="space-between">
                <Text color="brand.gray.600">Safety Levy</Text>
                <Text fontWeight="600">{formatCurrency(safetyLevy)}</Text>
              </HStack> */}

              <HStack justify="space-between">
                <Text color="brand.gray.600">Service Fee (2%)</Text>
                <Text fontWeight="600">{formatCurrency(serviceFee)}</Text>
              </HStack>

              <HStack justify="space-between">
                <Text color="brand.gray.600">Processing Fee (non-refundable)</Text>
                <Text fontWeight="600">{formatCurrency(processingFee)}</Text>
              </HStack>

              <HStack justify="space-between">
                <Text color="brand.gray.600">Caution Deposit</Text>
                <Text fontWeight="600">{formatCurrency(cautionDeposit)}</Text>
              </HStack>

              <Divider />

              <HStack justify="space-between">
                <Text fontSize="lg" fontWeight="bold" color="brand.primary">
                  Total Amount
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="brand.primary">
                  {formatCurrency(totalAmount)}
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
            onClick={openConfirmDialog}
            isLoading={confirming}
          >
            Pay to Escrow
          </Button>
          <AlertDialog
            isOpen={isConfirmOpen}
            leastDestructiveRef={cancelRef}
            onClose={onConfirmClose}
            isCentered
          >
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  Confirm Escrow Payment
                </AlertDialogHeader>

                <AlertDialogBody>
                  Are you sure you want to pay this amount into escrow for this property? This action will reserve this property for you and alert the agent or landloard. 
                  <Text color="red">
                    Note: only release fund after you have inspected and recieved the keys.
                  </Text>
                </AlertDialogBody>

                <AlertDialogFooter>
                  <Button ref={cancelRef} onClick={onConfirmClose}>
                    Cancel
                  </Button>
                  <Button
                    colorScheme="teal"
                    ml={3}
                    onClick={() => payRentAmount(id)}
                    isLoading={confirming}
                  >
                    Confirm
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>
        </VStack>
      </Box>
    </Box>
  );
}
