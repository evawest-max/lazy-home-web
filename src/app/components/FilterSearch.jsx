import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  FormControl,
  FormLabel,
  Select,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Badge,
  Grid,
  IconButton,
  Divider,
} from '@chakra-ui/react';
import { SlidersHorizontal, X, CheckCircle, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export default function FilterSearch({ setProperties }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [priceRange, setPriceRange] = useState([500000, 5000000]);
  const [propertyType, setPropertyType] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([
    'verified',
  ]);

  const handleShowProperties = async () => {
    const payload = {
      propertyType,
      location: locationFilter,
      priceRange,
      bedrooms,
      bathrooms,
      amenities: selectedAmenities,
      sortBy,
    };

    try {
      const response = await fetch('/api/properties/filter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Server responded with an error');
      }

      const result = await response.json();
      if (result?.properties) {
        setProperties(result.properties);
      }
    } catch (error) {
      console.error('Filter request failed:', error);
      alert('Unable to load filtered properties. Please try again later.');
    } finally {
      onClose();
    }
  };

const amenities = [
  {
    id: 'verified',
    label: 'Verified Only',
    icon: ShieldCheck,
    color: 'brand.success',
  },
  { id: 'power', label: '24hr Power' },
  { id: 'parking', label: 'Parking' },
  { id: 'security', label: 'Security' },
  { id: 'pool', label: 'Pool' },
  { id: 'gym', label: 'Gym' },
  { id: 'elevator', label: 'Elevator' },
  { id: 'generator', label: 'Generator' },
];

const toggleAmenity = (id) => {
  setSelectedAmenities((prev) =>
    prev.includes(id)
      ? prev.filter((a) => a !== id)
      : [...prev, id]
  );
};

  return (
    <>
      <IconButton
        icon={<SlidersHorizontal size={20} />}
        bg="brand.accent"
        color="white"
        _hover={{ bg: 'brand.secondary' }}
        aria-label="Filters"
        onClick={onOpen}
      />

      <Drawer isOpen={isOpen} placement="bottom" onClose={onClose} size="full">
        <DrawerOverlay />
        <DrawerContent borderTopRadius="2xl" maxH="95vh">
          <DrawerHeader
            bg="brand.primary"
            color="white"
            borderTopRadius="2xl"
            pb={4}
          >
            <HStack justify="space-between">
              <Text fontSize="xl" fontWeight="bold">Filter Properties</Text>
              <IconButton
                icon={<X size={20} />}
                variant="ghost"
                color="white"
                _hover={{ bg: 'whiteAlpha.200' }}
                aria-label="Close"
                onClick={onClose}
              />
            </HStack>

            <HStack spacing={2} mt={3} bg="whiteAlpha.200" py={2} px={3} borderRadius="lg">
              <ShieldCheck size={16} color="white" />
              <Text fontSize="xs" fontWeight="600">
                All properties are escrow protected
              </Text>
            </HStack>
          </DrawerHeader>

          <DrawerBody px={6} py={6} overflowY="auto">
            <VStack spacing={6} align="stretch">
              <Box bg="white" borderRadius="xl" p={5} boxShadow="sm">
                <VStack align="stretch" spacing={5}>
                  <Text fontSize="lg" fontWeight="600" color="brand.gray.800">
                    Property Type
                  </Text>

                  <Select
                    placeholder="All Types"
                    size="lg"
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                  >
                    <option value="Apartment/Flat">Apartment/Flat</option>
                    <option value="Duplex">Duplex</option>
                    <option value="Detached House">Detached House</option>
                    <option value="Semi-Detached House">Semi-Detached House</option>
                    <option value="Bungalow">Bungalow</option>
                    <option value="Penthouse">Penthouse</option>
                    <option value="Studio Apartment">Studio Apartment</option>
                  </Select>
                </VStack>
              </Box>

              <Box bg="white" borderRadius="xl" p={5} boxShadow="sm">
                <VStack align="stretch" spacing={5}>
                  <Text fontSize="lg" fontWeight="600" color="brand.gray.800">
                    Location
                  </Text>

                  <Select
                    placeholder="All Locations"
                    size="lg"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                  >
                    <option value="Lekki, Lagos">Lekki, Lagos</option>
                    <option value="Victoria Island, Lagos">Victoria Island, Lagos</option>
                    <option value="Ikoyi, Lagos">Ikoyi, Lagos</option>
                    <option value="Surulere, Lagos">Surulere, Lagos</option>
                    <option value="Ikeja, Lagos">Ikeja, Lagos</option>
                    <option value="Ajah, Lagos">Ajah, Lagos</option>
                    <option value="Abuja, FCT">Abuja, FCT</option>
                  </Select>
                </VStack>
              </Box>

              <Box bg="white" borderRadius="xl" p={5} boxShadow="sm">
                <VStack align="stretch" spacing={5}>
                  <VStack align="stretch" spacing={2}>
                    <Text fontSize="lg" fontWeight="600" color="brand.gray.800">
                      Annual Rent Range
                    </Text>
                    <HStack justify="space-between">
                      <Badge bg="brand.background" color="brand.primary" fontSize="sm" px={3} py={1}>
                        ₦{(priceRange[0] / 1000000).toFixed(1)}M
                      </Badge>
                      <Text fontSize="sm" color="brand.gray.600">to</Text>
                      <Badge bg="brand.background" color="brand.primary" fontSize="sm" px={3} py={1}>
                        ₦{(priceRange[1] / 1000000).toFixed(1)}M
                      </Badge>
                    </HStack>
                  </VStack>

                  <RangeSlider
                    min={0}
                    max={10000000}
                    step={100000}
                    value={priceRange}
                    onChange={(val) => setPriceRange(val)}
                    colorScheme="teal"
                  >
                    <RangeSliderTrack bg="brand.gray.200">
                      <RangeSliderFilledTrack bg="brand.primary" />
                    </RangeSliderTrack>
                    <RangeSliderThumb index={0} boxSize={6} />
                    <RangeSliderThumb index={1} boxSize={6} />
                  </RangeSlider>
                </VStack>
              </Box>

              <Box bg="white" borderRadius="xl" p={5} boxShadow="sm">
                <VStack align="stretch" spacing={5}>
                  <Text fontSize="lg" fontWeight="600" color="brand.gray.800">
                    Bedrooms & Bathrooms
                  </Text>

                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <FormControl>
                      <FormLabel color="brand.gray.700" fontSize="sm" fontWeight="600">
                        Bedrooms
                      </FormLabel>
                      <Select
                        placeholder="Any"
                        size="lg"
                        value={bedrooms}
                        onChange={(e) => setBedrooms(e.target.value)}
                        _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                      >
                        <option value="Studio">Studio</option>
                        <option value="1+">1+</option>
                        <option value="2+">2+</option>
                        <option value="3+">3+</option>
                        <option value="4+">4+</option>
                        <option value="5+">5+</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel color="brand.gray.700" fontSize="sm" fontWeight="600">
                        Bathrooms
                      </FormLabel>
                      <Select
                        placeholder="Any"
                        size="lg"
                        value={bathrooms}
                        onChange={(e) => setBathrooms(e.target.value)}
                        _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                      >
                        <option value="1+">1+</option>
                        <option value="2+">2+</option>
                        <option value="3+">3+</option>
                        <option value="4+">4+</option>
                        <option value="5+">5+</option>
                      </Select>
                    </FormControl>
                  </Grid>
                </VStack>
              </Box>

              <Box bg="white" borderRadius="xl" p={5} boxShadow="sm">
                <VStack align="stretch" spacing={4}>
                  <HStack justify="space-between">
                    <Text fontSize="lg" fontWeight="600" color="brand.gray.800">
                      Amenities & Features
                    </Text>
                    {selectedAmenities.length > 0 && (
                      <Badge bg="brand.primary" color="white" fontSize="xs" px={2} py={1} borderRadius="full">
                        {selectedAmenities.length} selected
                      </Badge>
                    )}
                  </HStack>

                  <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                    {amenities.map((amenity) => {
                      const isSelected = selectedAmenities.includes(amenity.id);
                      const Icon = amenity.icon || CheckCircle;

                      return (
                        <HStack
                          key={amenity.id}
                          bg={isSelected ? 'brand.background' : 'white'}
                          p={3}
                          borderRadius="lg"
                          cursor="pointer"
                          border="2px solid"
                          borderColor={isSelected ? (amenity.color || 'brand.primary') : 'brand.gray.300'}
                          onClick={() => toggleAmenity(amenity.id)}
                          _hover={{ borderColor: amenity.color || 'brand.primary' }}
                          transition="all 0.2s"
                        >
                          {isSelected ? (
                            <Icon size={18} color={amenity.color === 'brand.success' ? '#2E7D32' : '#00695C'} />
                          ) : (
                            <Box
                              w="18px"
                              h="18px"
                              borderRadius="full"
                              border="2px solid"
                              borderColor="brand.gray.400"
                            />
                          )}
                          <Text fontSize="sm" fontWeight={isSelected ? '600' : '400'} color={isSelected ? 'brand.gray.800' : 'brand.gray.600'}>
                            {amenity.label}
                          </Text>
                        </HStack>
                      );
                    })}
                  </Grid>
                </VStack>
              </Box>

              <Box bg="white" borderRadius="xl" p={5} boxShadow="sm">
                <VStack align="stretch" spacing={4}>
                  <Text fontSize="lg" fontWeight="600" color="brand.gray.800">
                    Sort By
                  </Text>

                  <Select
                    size="lg"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                  >
                    <option value="Newest First">Newest First</option>
                    <option value="Price: Low to High">Price: Low to High</option>
                    <option value="Price: High to Low">Price: High to Low</option>
                    <option value="Most Verified">Most Verified</option>
                    <option value="Best Rated Agents">Best Rated Agents</option>
                  </Select>
                </VStack>
              </Box>

              <Divider />

              <HStack spacing={3}>
                <Button
                  variant="secondary"
                  size="lg"
                  flex={1}
                  onClick={() => {
                    setPriceRange([500000, 5000000]);
                    setSelectedAmenities(['verified']);
                  }}
                >
                  Reset All
                </Button>
              </HStack>
            </VStack>
          </DrawerBody>

          <DrawerFooter
            borderTop="2px solid"
            borderColor="brand.gray.200"
            bg="white"
            p={6}
          >
            <VStack spacing={3} w="100%">
              <HStack spacing={2} bg="brand.background" py={2} px={4} borderRadius="lg" w="100%" justify="center">
                <ShieldCheck size={16} color="#2E7D32" />
                <Text fontSize="xs" fontWeight="bold" color="brand.success">
                  All results are escrow protected & verified
                </Text>
              </HStack>
              <Button
                w="100%"
                variant="primary"
                size="lg"
                onClick={handleShowProperties}
              >
                Show 24 Properties
              </Button>
            </VStack>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
