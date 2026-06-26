import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  Grid,
  Progress,
  Switch,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import {
  ArrowLeft,
  DollarSign,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  Calculator,
  CheckCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function UpdatePropertyStep3({ updatedFormdata, setUpdatedFormdata, onBack, onNext }) {
  const currentStep = 3;
  const totalSteps = 4;
  const draftKey = 'listingFormData';

  const [formError, setFormError] = useState('');

  const rentAmount = updatedFormdata.annualRent ?? updatedFormdata.rentAmount ?? '';

  const isStepThreeValid = () =>
    rentAmount && String(rentAmount).trim() !== '';

  useEffect(() => {
    if (formError && isStepThreeValid()) {
      setFormError('');
    }
  }, [updatedFormdata, formError]);

  const handleContinue = (event) => {
    if (!isStepThreeValid()) {
      event?.preventDefault?.();
      setFormError('Please fill in all required fields before continuing.');
      return false;
    }

    const draft = {
      ...updatedFormdata,
      annualRent: rentAmount,
      rentAmount,
    };

    sessionStorage.setItem(draftKey, JSON.stringify(draft));
    localStorage.setItem(draftKey, JSON.stringify(draft));
    setUpdatedFormdata(draft);

    if (onNext) {
      onNext(draft);
    }
    return true;
  };

  return (
    <Box minH="100vh" bg="brand.background" pb="120px">
      {/* <Box bg="brand.primary" px={6} pt={12} pb={8}>
        <HStack mb={6}>
          <Link to="/dashboard">
          <IconButton
            icon={<ArrowLeft size={20} />}
            variant="ghost"
            color="white"
            _hover={{ bg: 'whiteAlpha.200' }}
            aria-label="Back"
          />
          </Link>
          <Text fontSize="xl" fontWeight="bold" color="white" flex={1}>
            List Your Property
          </Text>
        </HStack>

        <VStack spacing={3} align="stretch">
          <HStack justify="space-between">
            <Text fontSize="sm" color="whiteAlpha.900">
              Step {currentStep} of {totalSteps}
            </Text>
            <Text fontSize="sm" color="whiteAlpha.900">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </Text>
          </HStack>
          <Progress
            value={(currentStep / totalSteps) * 100}
            size="sm"
            colorScheme="green"
            borderRadius="full"
            bg="whiteAlpha.300"
          />

          <HStack spacing={2} justify="center" mt={2}>
            {[1, 2, 3, 4].map((step) => (
              <Box
                key={step}
                w="8px"
                h="8px"
                borderRadius="full"
                bg={step <= currentStep ? 'white' : 'whiteAlpha.400'}
              />
            ))}
          </HStack>
        </VStack>
      </Box> */}

      <VStack align="stretch" px={6} mt={-4} spacing={6}>
        <Box bg="white" borderRadius="xl" p={6} boxShadow="md" border="2px solid" borderColor="brand.success">
          <VStack spacing={4}>
            <HStack justify="center" bg="brand.success" py={3} px={4} borderRadius="lg" w="100%">
              <ShieldCheck size={20} color="white" />
              <Text fontSize="sm" fontWeight="bold" color="white">
                ESCROW PROTECTS YOUR PAYMENT
              </Text>
            </HStack>

            <VStack spacing={2} bg="brand.background" p={4} borderRadius="lg" w="100%">
              <Text fontSize="sm" fontWeight="600" color="brand.gray.800" textAlign="center">
                ✓ Renter pays into secure escrow, not directly to you
              </Text>
              <Text fontSize="sm" fontWeight="600" color="brand.gray.800" textAlign="center">
                ✓ You get paid only after successful inspection
              </Text>
              <Text fontSize="sm" fontWeight="600" color="brand.gray.800" textAlign="center">
                ✓ Zero risk of payment disputes
              </Text>
            </VStack>
          </VStack>
        </Box>

        <Box bg="white" borderRadius="xl" p={6} boxShadow="sm">
          <VStack align="stretch" spacing={5}>
            <HStack spacing={3}>
              <Box bg="brand.primary" p={2} borderRadius="full">
                <DollarSign size={20} color="white" />
              </Box>
              <Text fontSize="lg" fontWeight="bold" color="brand.gray.800">
                Rental Pricing
              </Text>
            </HStack>

            {formError && (
              <Alert status="error" borderRadius="lg">
                <AlertIcon />
                <Box>
                  <AlertTitle>Required Fields Missing!</AlertTitle>
                  <AlertDescription>
                    Please fill in all required fields before continuing to the next step.
                  </AlertDescription>
                </Box>
              </Alert>
            )}


            <FormControl isRequired isInvalid={formError && !rentAmount}>
              <FormLabel color="brand.gray.700" fontSize="sm" fontWeight="600">
                Rent Amount
              </FormLabel>
              <HStack>
                <Text fontSize="lg" color="brand.gray.700">₦</Text>
                <Input
                  placeholder="2,500,000"
                  type="number"
                  size="lg"
                  value={rentAmount || ""}
                  onChange={(e) => {
                    setUpdatedFormdata(prev => ({ ...prev, annualRent: e.target.value, rentAmount: e.target.value }));
                    if (formError) setFormError('');
                  }}
                  _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                />
              <Select
                maxW="150px"
                size="lg"
                value={updatedFormdata.rentDuration || ""}
                onChange={(e) => setUpdatedFormdata(prev => ({ ...prev, rentDuration: e.target.value }))}
                _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
              >
                <option>yearly</option>
                <option>monthly</option>
                <option>weekly</option>
              </Select>
              </HStack>
              <FormErrorMessage>Required</FormErrorMessage>
            </FormControl>



            <Box bg="brand.background" p={4} borderRadius="lg">
              <VStack spacing={3} align="stretch">
                <HStack spacing={2}>
                  <TrendingUp size={18} color="#00695C" />
                  <Text fontSize="sm" fontWeight="600" color="brand.primary">
                    Market Price Suggestion
                  </Text>
                </HStack>
                <Text fontSize="sm" color="brand.gray.700">
                  Similar 3-bedroom properties in Lekki Phase 1 rent for <Text as="span" fontWeight="bold">₦2.2M - ₦3.5M</Text> per year.
                </Text>
                <Text fontSize="xs" color="brand.gray.600">
                  Based on 24 similar listings in your area
                </Text>
              </VStack>
            </Box>

            <FormControl>
              <FormLabel color="brand.gray.700" fontSize="sm" fontWeight="600">
                Caution Deposit (Optional)
              </FormLabel>
              <HStack>
                <Text fontSize="lg" color="brand.gray.700">₦</Text>
                <Input
                  placeholder="500,000"
                  type="number"
                  size="lg"
                  value={updatedFormdata.cautionDeposit || ""}
                  onChange={(e) => setUpdatedFormdata(prev => ({ ...prev, cautionDeposit: e.target.value }))}
                  _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                />
              </HStack>
              <Text fontSize="xs" color="brand.gray.500" mt={2}>
                Refundable security deposit (typically 10-20% of annual rent)
              </Text>
            </FormControl>

            {/* <FormControl>
              <FormLabel color="brand.gray.700" fontSize="sm" fontWeight="600">
                Is the rent negotiable?
              </FormLabel>
              <Select
                size="lg"
                value={updatedFormdata.negotiable ? 'yes' : 'no'}
                onChange={(e) => setUpdatedFormdata(prev => ({
                  ...prev,
                  negotiable: e.target.value === 'yes',
                }))}
                _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
              >
                <option value="no">No, rent is fixed</option>
                <option value="yes">Yes, rent is negotiable</option>
              </Select>
            </FormControl> */}

            <Divider />

            <VStack align="stretch" spacing={3}>
              <Text fontSize="md" fontWeight="600" color="brand.gray.800">
                Payment Terms
              </Text>

              <FormControl>
                <FormLabel color="brand.gray.700" fontSize="sm" fontWeight="600">
                  Minimum Lease Period
                </FormLabel>
                <Select
                  size="lg"
                  value={updatedFormdata.leasePeriod || ""}
                  onChange={(e) => setUpdatedFormdata(prev => ({ ...prev, leasePeriod: e.target.value }))}
                  _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                >
                  <option>1 Year</option>
                  <option>2 Years</option>
                  <option>3 Years</option>
                  <option>6 Months</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel color="brand.gray.700" fontSize="sm" fontWeight="600">
                  Service Charge (if applicable)
                </FormLabel>
                <HStack>
                  <Text fontSize="lg" color="brand.gray.700">₦</Text>
                  <Input
                    placeholder="0"
                    type="number"
                    size="lg"
                    value={updatedFormdata.serviceCharge || ""}
                    onChange={(e) => setUpdatedFormdata(prev => ({ ...prev, serviceCharge: e.target.value }))}
                    _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                  />
                  <Select
                    maxW="150px"
                    size="lg"
                    value={updatedFormdata.serviceChargePeriod || ""}
                    onChange={(e) => setUpdatedFormdata(prev => ({ ...prev, serviceChargePeriod: e.target.value }))}
                    _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                  >
                    <option>monthly</option>
                    <option>yearly</option>
                  </Select>
                </HStack>
                <Text fontSize="xs" color="brand.gray.500" mt={2}>
                  Estate/building maintenance fee
                </Text>
              </FormControl>
            </VStack>
          </VStack>
        </Box>

        <Box bg="white" borderRadius="xl" p={6} boxShadow="sm">
          <VStack align="stretch" spacing={5}>
            <HStack spacing={3}>
              <Box bg="brand.accent" p={2} borderRadius="full">
                <Calculator size={20} color="white" />
              </Box>
              <Text fontSize="lg" fontWeight="bold" color="brand.gray.800">
                Fee Breakdown
              </Text>
            </HStack>

            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="sm" color="brand.gray.600">Annual Rent</Text>
                <Text fontSize="sm" fontWeight="600">₦{updatedFormdata.annualRent ? parseFloat(updatedFormdata.annualRent).toLocaleString() : '0'}</Text>
              </HStack>

              <HStack justify="space-between">
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" color="brand.gray.600">LazyHomes Service Fee (5%)</Text>
                  <Text fontSize="xs" color="brand.gray.500">Paid by renter</Text>
                </VStack>
                <Text fontSize="sm" fontWeight="600">₦{updatedFormdata.serviceFee ? parseFloat(updatedFormdata.serviceFee).toLocaleString() : '0'}</Text>
              </HStack>

              <HStack justify="space-between">
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" color="brand.gray.600">Inspection Fee</Text>
                  <Text fontSize="xs" color="brand.gray.500">Refunded to renter if they rent</Text>
                </VStack>
                <Text fontSize="sm" fontWeight="600">₦{updatedFormdata.inspectionFee ? parseFloat(updatedFormdata.inspectionFee).toLocaleString() : '0'}</Text>
              </HStack>

              <Divider />

              <HStack justify="space-between" bg="brand.background" p={3} borderRadius="lg">
                <Text fontSize="md" fontWeight="bold" color="brand.primary">
                  You Receive
                </Text>
                <Text fontSize="xl" fontWeight="bold" color="brand.success">
                  ₦{updatedFormdata.annualRent ? parseFloat(updatedFormdata.annualRent).toLocaleString() : '0'}
                </Text>
              </HStack>

              <Text fontSize="xs" color="brand.gray.600" textAlign="center">
                {updatedFormdata.cautionDeposit ? `Plus caution deposit (₦${parseFloat(updatedFormdata.cautionDeposit).toLocaleString()}) if applicable` : 'Caution deposit optional'}
              </Text>
            </VStack>
          </VStack>
        </Box>

        <Box bg="white" borderRadius="xl" p={6} boxShadow="sm">
          <VStack align="stretch" spacing={4}>
            <Text fontSize="md" fontWeight="600" color="brand.gray.800">
              Additional Options
            </Text>

            <HStack justify="space-between" p={4} bg="brand.background" borderRadius="lg">
              <VStack align="start" spacing={0}>
                <Text fontSize="sm" fontWeight="600" color="brand.gray.800">
                  Negotiable Price
                </Text>
                <Text fontSize="xs" color="brand.gray.600">
                  Allow renters to make offers below asking price
                </Text>
              </VStack>
              <Switch
                colorScheme="teal"
                size="lg"
                isChecked={updatedFormdata.negotiable}
                onChange={(e) => setUpdatedFormdata(prev => ({ ...prev, negotiable: e.target.checked }))}
              />
            </HStack>

            <HStack justify="space-between" p={4} bg="brand.background" borderRadius="lg">
              <VStack align="start" spacing={0}>
                <Text fontSize="sm" fontWeight="600" color="brand.gray.800">
                  Flexible Move-in Date
                </Text>
                <Text fontSize="xs" color="brand.gray.600">
                  Property available immediately or within 30 days
                </Text>
              </VStack>
              <Switch
                colorScheme="teal"
                size="lg"
                isChecked={updatedFormdata.flexibleMoveIn}
                onChange={(e) => setUpdatedFormdata(prev => ({ ...prev, flexibleMoveIn: e.target.checked }))}
              />
            </HStack>

            <HStack justify="space-between" p={4} bg="brand.background" borderRadius="lg">
              <VStack align="start" spacing={0}>
                <Text fontSize="sm" fontWeight="600" color="brand.gray.800">
                  Accept Part Payment
                </Text>
                <Text fontSize="xs" color="brand.gray.600">
                  Allow renters to pay in 2 installments
                </Text>
              </VStack>
              <Switch
                colorScheme="teal"
                size="lg"
                isChecked={updatedFormdata.partPayment}
                onChange={(e) => setUpdatedFormdata(prev => ({ ...prev, partPayment: e.target.checked }))}
              />
            </HStack>
          </VStack>
        </Box>

        <Box bg="brand.background" border="2px solid" borderColor="brand.accent" borderRadius="lg" p={5}>
          <VStack spacing={4}>
            <HStack spacing={2}>
              <ShieldCheck size={20} color="#26A69A" />
              <Text fontSize="md" fontWeight="bold" color="brand.primary">
                Pricing Best Practices
              </Text>
            </HStack>

            <VStack spacing={3} align="stretch">
              <HStack spacing={2} align="start">
                <CheckCircle size={16} color="#26A69A" style={{ marginTop: 2, flexShrink: 0 }} />
                <Text fontSize="sm" color="brand.gray.700">
                  Research similar properties in your area before pricing
                </Text>
              </HStack>

              <HStack spacing={2} align="start">
                <CheckCircle size={16} color="#26A69A" style={{ marginTop: 2, flexShrink: 0 }} />
                <Text fontSize="sm" color="brand.gray.700">
                  Price competitively to attract quality renters quickly
                </Text>
              </HStack>

              <HStack spacing={2} align="start">
                <CheckCircle size={16} color="#26A69A" style={{ marginTop: 2, flexShrink: 0 }} />
                <Text fontSize="sm" color="brand.gray.700">
                  Overpriced listings get fewer inquiries and inspections
                </Text>
              </HStack>

              <HStack spacing={2} align="start">
                <CheckCircle size={16} color="#26A69A" style={{ marginTop: 2, flexShrink: 0 }} />
                <Text fontSize="sm" color="brand.gray.700">
                  Honest pricing builds trust and reduces disputes
                </Text>
              </HStack>
            </VStack>
          </VStack>
        </Box>

        <Box bg="white" borderRadius="xl" p={5} boxShadow="sm" border="2px solid" borderColor="brand.warning">
          <HStack spacing={3}>
            <AlertCircle size={24} color="#E65100" />
            <VStack align="start" spacing={0} flex={1}>
              <Text fontSize="sm" fontWeight="bold" color="brand.warning">
                Payment Protection
              </Text>
              <Text fontSize="xs" color="brand.gray.600">
                Your payment is 100% safe with escrow. You only get paid after renter confirms inspection and gives consent.
              </Text>
            </VStack>
          </HStack>
        </Box>
      </VStack>


      <Box
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        bg="white"
        borderTop="2px solid"
        borderColor="brand.primary"
        p={6}
        boxShadow="2xl"
      >
        <Grid templateColumns="1fr 2fr" gap={3}>
          <Button
            variant="secondary"
            size="lg"
            onClick={onBack}
          >
            Back
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              handleContinue();
            }}
          >
            Continue to Bank Details
          </Button>
        </Grid>
      </Box>
    </Box>
  );
}
