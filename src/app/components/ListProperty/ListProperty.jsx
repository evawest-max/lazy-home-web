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
  Textarea,
  Grid,
  Badge,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  Tab,
} from '@chakra-ui/react';
import {
  ArrowLeft,
  Home,
  MapPin,
  Image as ImageIcon,
  DollarSign,
  ShieldCheck,
  Upload,
  Plus,
  CheckCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ListPropertyStep2 from './ListPropertyStep2';
import ListPropertyStep3 from './ListPropertyStep3';
import ListPropertyStep4 from './ListPropertyStep4';

export default function ListProperty({ formData, setFormData, onSubmit, initialStep = 1 }) {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(Math.max(0, initialStep - 1));
  const totalSteps = 4;


  const [customAmenity, setCustomAmenity] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [formError, setFormError] = useState('');

  const amenityOptions = [
    '24hr Power',
    'Parking',
    'Security',
    'Swimming Pool',
    'Gym',
    'Elevator',
  ];

  const toggleAmenity = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const addCustomAmenity = () => {
    if (customAmenity.trim()) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, customAmenity.trim()],
      }));
      setCustomAmenity('');
      setShowCustomInput(false);
    }
  };

  const requiredFields = [
    'title',
    'propertyType',
    'bedrooms',
    'bathrooms',
    'description',
    'state',
    'city',
    'address',
  ];

  const isStepOneValid = () =>
    requiredFields.every(
      (field) => formData[field] && String(formData[field]).trim() !== ''
    );

  useEffect(() => {
    if (formError && isStepOneValid()) {
      setFormError('');
    }
  }, [formData, formError]);

  const handleContinue = (event) => {
    if (!isStepOneValid()) {
      event?.preventDefault?.();
      setFormError('Please fill in all required fields before continuing.');
      return;
    }

    sessionStorage.setItem('listingFormData', JSON.stringify(formData));
    setActiveStep(1);
    initialStep === 2 && window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    setActiveStep(Math.max(0, initialStep - 1));
  }, [initialStep]);

  return (

    <Box minH="100vh" bg="brand.background" pb="120px">
      <Box bg="brand.primary" px={6} pt={12} pb={8}>
        <HStack mb={6}>
          <IconButton
            icon={<ArrowLeft size={20} />}
            variant="ghost"
            color="white"
            _hover={{ bg: 'whiteAlpha.200' }}
            aria-label="Back"
            onClick={() => navigate('/dashboard')}
          />
          <Text fontSize="xl" fontWeight="bold" color="white" flex={1}>
            List Your Property
          </Text>
        </HStack>

        <Tabs index={activeStep} onChange={setActiveStep} variant="soft-rounded" colorScheme="whiteAlpha">
          <TabList display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={2} bg="whiteAlpha.200" p={1} borderRadius="full">
            <Tab color="white" _selected={{ bg: 'white', color: 'brand.primary' }} fontSize="xs" fontWeight="700">1. Details</Tab>
            <Tab color="white" _selected={{ bg: 'white', color: 'brand.primary' }} fontSize="xs" fontWeight="700">2. Photos</Tab>
            <Tab color="white" _selected={{ bg: 'white', color: 'brand.primary' }} fontSize="xs" fontWeight="700">3. Pricing</Tab>
            <Tab color="white" _selected={{ bg: 'white', color: 'brand.primary' }} fontSize="xs" fontWeight="700">4.  Bank</Tab>
          </TabList>
        </Tabs>

        <VStack spacing={3} align="stretch">
          <HStack justify="space-between">
            <Text fontSize="sm" color="whiteAlpha.900">
              Step {activeStep + 1} of {totalSteps}
            </Text>
            <Text fontSize="sm" color="whiteAlpha.900">
              {Math.round(((activeStep + 1) / totalSteps) * 100)}% Complete
            </Text>
          </HStack>
          <Progress
            value={((activeStep + 1) / totalSteps) * 100}
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
                bg={step <= activeStep + 1 ? 'white' : 'whiteAlpha.400'}
              />
            ))}
          </HStack>
        </VStack>
      </Box>

      {activeStep === 0 && (
        <>
          <VStack align="stretch" px={6} mt={-4} spacing={6}>
            <Box bg="white" borderRadius="xl" p={6} boxShadow="md" border="2px solid" borderColor="brand.success">
              <VStack spacing={4}>
                <HStack justify="center" bg="brand.success" py={3} px={4} borderRadius="lg" w="100%">
                  <ShieldCheck size={20} color="white" />
                  <Text fontSize="sm" fontWeight="bold" color="white">
                    ALL LISTINGS ARE VERIFIED & PROTECTED
                  </Text>
                </HStack>

                <VStack spacing={2} bg="brand.background" p={4} borderRadius="lg" w="100%">
                  <Text fontSize="sm" fontWeight="600" color="brand.gray.800" textAlign="center">
                    ✓ Your listing will be verified within 24 hours
                  </Text>
                  <Text fontSize="sm" fontWeight="600" color="brand.gray.800" textAlign="center">
                    ✓ All payments held in escrow for your safety
                  </Text>
                  <Text fontSize="sm" fontWeight="600" color="brand.gray.800" textAlign="center">
                    ✓ Get paid only after successful inspection
                  </Text>
                </VStack>
              </VStack>
            </Box>

            <Box bg="white" borderRadius="xl" p={6} boxShadow="sm">
              <VStack align="stretch" spacing={5}>
                <HStack spacing={3}>
                  <Box bg="brand.primary" p={2} borderRadius="full">
                    <Home size={20} color="white" />
                  </Box>
                  <Text fontSize="lg" fontWeight="bold" color="brand.gray.800">
                    Step 1: Property Details
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

                <FormControl isRequired isInvalid={formError && !formData.title}>
                  <FormLabel color="brand.gray.700" fontSize="sm" fontWeight="600">
                    Property Title
                  </FormLabel>
                  <Input
                    placeholder="e.g. 3 Bedroom Duplex in Lekki Phase 1"
                    size="lg"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, title: e.target.value }));
                      if (formError) setFormError('');
                    }}
                    _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                  />
                  <FormErrorMessage>Required</FormErrorMessage>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="brand.gray.700" fontSize="sm" fontWeight="600">
                    Property Type
                  </FormLabel>
                  <Select
                    placeholder="Select property type"
                    size="lg"
                    value={formData.propertyType}
                    onChange={(e) => setFormData(prev => ({ ...prev, propertyType: e.target.value }))}
                    _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                  >
                    <option>Apartment/Flat</option>
                    <option>Duplex</option>
                    <option>Detached House</option>
                    <option>Semi-Detached House</option>
                    <option>Bungalow</option>
                    <option>Penthouse</option>
                    <option>Studio Apartment</option>
                  </Select>
                </FormControl>

                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <FormControl isRequired>
                    <FormLabel color="brand.gray.700" fontSize="sm" fontWeight="600">
                      Bedrooms
                    </FormLabel>
                    <Select
                      placeholder="Select"
                      size="lg"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData(prev => ({ ...prev, bedrooms: e.target.value }))}
                      _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                    >
                      <option>Studio</option>
                      <option>1</option>
                      <option>2</option>
                      <option>3</option>
                      <option>4</option>
                      <option>5</option>
                      <option>6+</option>
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel color="brand.gray.700" fontSize="sm" fontWeight="600">
                      Bathrooms
                    </FormLabel>
                    <Select
                      placeholder="Select"
                      size="lg"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData(prev => ({ ...prev, bathrooms: e.target.value }))}
                      _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                    >
                      <option>1</option>
                      <option>2</option>
                      <option>3</option>
                      <option>4</option>
                      <option>5</option>
                      <option>6+</option>
                    </Select>
                  </FormControl>
                </Grid>

                <FormControl>
                  <FormLabel color="brand.gray.700" fontSize="sm" fontWeight="600">
                    Size (Square Feet)
                  </FormLabel>
                  <Input
                    placeholder="e.g. 2400"
                    type="number"
                    size="lg"
                    value={formData.size}
                    onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                    _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="brand.gray.700" fontSize="sm" fontWeight="600">
                    Property Description
                  </FormLabel>
                  <Textarea
                    placeholder="Describe your property in detail. Mention key features, amenities, nearby landmarks, etc."
                    size="lg"
                    rows={6}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                  />
                  <Text fontSize="xs" color="brand.gray.500" mt={2}>
                    Be honest and detailed. This helps renters trust your listing.
                  </Text>
                </FormControl>

                <FormControl>
                  <FormLabel color="brand.gray.700" fontSize="sm" fontWeight="600">
                    Amenities & Features
                  </FormLabel>
                  <VStack spacing={2} align="stretch">
                    <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                      {amenityOptions.map((amenity) => {
                        const isSelected = formData.amenities.includes(amenity);
                        return (
                          <HStack
                            key={amenity}
                            bg={isSelected ? 'brand.background' : 'white'}
                            p={3}
                            borderRadius="lg"
                            cursor="pointer"
                            border="2px solid"
                            borderColor={isSelected ? 'brand.primary' : 'brand.gray.300'}
                            onClick={() => toggleAmenity(amenity)}
                            transition="all 0.2s"
                            _hover={{ borderColor: 'brand.primary' }}
                          >
                            {isSelected ? (
                              <CheckCircle size={18} color="#00695C" />
                            ) : (
                              <Box w="18px" h="18px" borderRadius="full" border="2px solid" borderColor="brand.gray.400" />
                            )}
                            <Text fontSize="sm" fontWeight={isSelected ? '600' : '400'} color={isSelected ? 'brand.gray.800' : 'brand.gray.600'}>
                              {amenity}
                            </Text>
                          </HStack>
                        );
                      })}
                    </Grid>

                    {formData.amenities.filter(a => !amenityOptions.includes(a)).length > 0 && (
                      <VStack spacing={2} align="stretch">
                        <Text fontSize="xs" fontWeight="600" color="brand.gray.600">Custom Amenities:</Text>
                        <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                          {formData.amenities.filter(a => !amenityOptions.includes(a)).map((amenity, index) => (
                            <HStack
                              key={index}
                              bg="brand.background"
                              p={3}
                              borderRadius="lg"
                              cursor="pointer"
                              border="2px solid"
                              borderColor="brand.accent"
                              onClick={() => toggleAmenity(amenity)}
                            >
                              <CheckCircle size={18} color="#26A69A" />
                              <Text fontSize="sm" fontWeight="600" color="brand.gray.800">{amenity}</Text>
                            </HStack>
                          ))}
                        </Grid>
                      </VStack>
                    )}

                    {showCustomInput ? (
                      <HStack>
                        <Input
                          placeholder="Enter amenity name"
                          size="sm"
                          value={customAmenity}
                          onChange={(e) => setCustomAmenity(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addCustomAmenity()}
                          _focus={{ borderColor: 'brand.primary' }}
                        />
                        <Button size="sm" onClick={addCustomAmenity} bg="brand.primary" color="white">Add</Button>
                        <Button size="sm" variant="secondary" onClick={() => setShowCustomInput(false)}>Cancel</Button>
                      </HStack>
                    ) : (
                      <Button variant="secondary" size="sm" leftIcon={<Plus size={16} />} onClick={() => setShowCustomInput(true)}>
                        Add Custom Amenity
                      </Button>
                    )}
                  </VStack>
                </FormControl>
              </VStack>
            </Box>

            <Box bg="white" borderRadius="xl" p={6} boxShadow="sm">
              <VStack align="stretch" spacing={5}>
                <HStack spacing={3}>
                  <Box bg="brand.accent" p={2} borderRadius="full">
                    <MapPin size={20} color="white" />
                  </Box>
                  <Text fontSize="lg" fontWeight="bold" color="brand.gray.800">
                    Location Details
                  </Text>
                </HStack>

                <FormControl isRequired>
                  <FormLabel color="brand.gray.700" fontSize="sm" fontWeight="600">
                    State
                  </FormLabel>
                  <Select
                    placeholder="Select state"
                    size="lg"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                  >
                    <option>Lagos</option>
                    <option>Abuja FCT</option>
                    <option>Rivers</option>
                    <option>Oyo</option>
                    <option>Kano</option>
                    <option>Enugu</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="brand.gray.700" fontSize="sm" fontWeight="600">
                    City/Area
                  </FormLabel>
                  <Input
                    placeholder="e.g. Lekki, Victoria Island, Ikoyi"
                    size="lg"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="brand.gray.700" fontSize="sm" fontWeight="600">
                    Street Address
                  </FormLabel>
                  <Input
                    placeholder="Full street address"
                    size="lg"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color="brand.gray.700" fontSize="sm" fontWeight="600">
                    Nearby Landmarks
                  </FormLabel>
                  <Input
                    placeholder="e.g. Near Shoprite, 5 mins from Elegushi Beach"
                    size="lg"
                    value={formData.landmarks}
                    onChange={(e) => setFormData(prev => ({ ...prev, landmarks: e.target.value }))}
                    _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                  />
                </FormControl>
              </VStack>
            </Box>

            <Box bg="brand.background" border="2px solid" borderColor="brand.accent" borderRadius="lg" p={5}>
              <VStack spacing={3}>
                <Text fontSize="md" fontWeight="bold" color="brand.primary" textAlign="center">
                  Next Steps After This
                </Text>

                <VStack spacing={2} align="stretch">
                  <Text fontSize="sm" color="brand.gray.700">
                    <Text as="span" fontWeight="bold">Step 2:</Text> Upload property photos & videos
                  </Text>
                  <Text fontSize="sm" color="brand.gray.700">
                    <Text as="span" fontWeight="bold">Step 3:</Text> Set pricing & payment terms
                  </Text>
                  <Text fontSize="sm" color="brand.gray.700">
                    <Text as="span" fontWeight="bold">Step 4:</Text> Bank details for receiving payments
                  </Text>
                </VStack>
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
            borderColor="brand.primary"
            p={6}
            boxShadow="2xl"
          >
            <Grid templateColumns="1fr 2fr" gap={3}>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => console.log('Draft saved:', formData)}
              >
                Save Draft
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleContinue}
              >
                Continue to Photos
              </Button>
            </Grid>
          </Box>
        </>)
      }



      {
        activeStep === 1 && (
          <ListPropertyStep2
            formData={formData}
            setFormData={setFormData}
            onBack={() => setActiveStep(0)}
            onNext={() => setActiveStep(2)}
          />
        )
      }

      {
        activeStep === 2 && (
          <ListPropertyStep3
            formData={formData}
            setFormData={setFormData}
            onBack={() => setActiveStep(1)}
            onNext={() => setActiveStep(3)}
          />
        )
      }

      {
        activeStep === 3 && (
          <ListPropertyStep4
            formData={formData}
            setFormData={setFormData}
            onBack={() => setActiveStep(2)}
            onSubmit={onSubmit}
          />
        )
      }
    </Box >
  );
}
