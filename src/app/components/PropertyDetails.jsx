import { Box, VStack, HStack, Text, Badge, Button, Image, Avatar, Divider, Grid, IconButton, Spinner, Heading, useToast } from '@chakra-ui/react';

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getRecommendedProperties, getSingleProperty, saveProperty } from '../../../api';
import PropertyCard from './PropertyCard';
import { AlertCircle, ArrowLeft, Bath, Bed, Calendar, Copy, Eye, HeartPulse, LockIcon, Save, Share, ShieldCheck, Square, Toilet } from 'lucide-react';

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") return "N/A";
  return `₦${Number(value).toLocaleString()}`;
};

export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recommendedProperties, setRecommendedProperties] = useState([]);
  const [isSharing, setIsSharing] = useState(false);
  const [shareSaved, setShareSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [propertySaved, setPropertySaved] = useState(false);

  const toast = useToast();

  const imageUrls = useMemo(() => {
    const rawImages = property?.media?.images || property?.images || property?.gallery || [];

    if (Array.isArray(rawImages)) {
      return rawImages
        .map((item) => {
          if (typeof item === "string") return item;
          return item?.url || item?.secure_url || item?.src || "";
        })
        .filter(Boolean);
    }

    if (typeof rawImages === "string") return [rawImages];

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
        const recommendedResponse = await getRecommendedProperties(); // Fetch recommended properties
        console.log("Recommended Properties Response:", recommendedResponse);
        setRecommendedProperties(recommendedResponse?.data?.data || []);

        if (isMounted) {
          setProperty(payload || null);
          setCurrentIndex(0);
        }
      } catch (error) {
        console.error("Failed to fetch property:", error);
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
    if (!imageUrls.length) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [imageUrls.length]);

  if (loading) {
    return (
      <Box
        minH="100vh"
        bg="brand.background"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <VStack spacing={4} p={8} bg="white" borderRadius="xl" boxShadow="lg">
          <Spinner size="xl" color="brand.primary" thickness="4px" />
          <Text fontSize="lg" fontWeight="600" color="brand.gray.700">
            Loading property details...
          </Text>
        </VStack>
      </Box>
    );
  }

  if (!property) {
    return (
      <Box
        minH="100vh"
        bg="brand.background"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <VStack spacing={4} p={8} bg="white" borderRadius="xl" boxShadow="lg">
          <AlertCircle size={40} color="#E53E3E" />
          <Text fontSize="lg" fontWeight="600" color="brand.gray.700">
            Property not found.
          </Text>
        </VStack>
      </Box>
    );
  }

  const title = property?.title || property?.propertyType || "Property";
  const location = property?.address?.area || property?.address?.city || property?.location?.area || property?.location?.city || "Location coming soon";
  const state = property?.address?.state || property?.address?.country || property?.location?.state || "";
  const agentName = property?.listedBy?.fullName || property?.agent?.fullName || property?.owner?.fullName || "Agent";
  const agentPhone = property?.listedBy?.phone || property?.agent?.phone || property?.owner?.phone || "Contact available soon";
  const rentAmount = property?.rentAmount ?? property?.price ?? property?.monthlyRent ?? property?.annualRent ?? 0;
  const cautionDeposit = property?.cautionDeposit ?? property?.cautionDeposit
  const serviceCharge = property?.serviceCharge ?? property?.serviceCharge
  const bedrooms = property?.bedrooms ?? property?.bedCount ?? property?.rooms ?? 0;
  const bathrooms = property?.bathrooms ?? property?.bathCount ?? 0;
  const size = property?.size || "";
  const description = property?.description || property?.overview || "This property offers a comfortable and secure place to live with modern amenities and excellent access to key locations.";

  return (
    <Box minH="100vh" bg="brand.background" pb="140px">
      <Box position="relative">
        <Image
          src={imageUrls[currentIndex] || "/placeholder.jpg"}
          alt={title}
          h="300px"
          w="100%"
          objectFit="cover"
        />

        <Link to="/property-listings">
          <IconButton
            icon={<ArrowLeft size={20} />}
            position="absolute"
            top={4}
            left={4}
            bg="green.500"
            borderRadius="full"
            aria-label="Back"
          />
        </Link>

        {property.verificationStatus === "verified" && (
          <Badge
            variant="verified"
            position="absolute"
            top={4}
            right={4}
            display="flex"
            alignItems="center"
            gap={1}
            fontSize="sm"
          >
            <ShieldCheck size={16} />
            Verified
          </Badge>
        )}

        {imageUrls.length > 1 && (
          <HStack position="absolute" bottom={3} left={4} right={4} justify="center" spacing={2} wrap="wrap" overflowX="auto" maxW="90%" boxShadow="md"> // ✅ enable horizontal scroll
            {imageUrls.map((image, index) => (
              <Button
                key={`${image}-${index}`}
                size="xs"
                onClick={() => setCurrentIndex(index)}
                bg={index === currentIndex ? "brand.success" : "whiteAlpha.900"}
                color={index === currentIndex ? "white" : "brand.gray.800"}
                borderRadius="full"
                px={3}
                flexShrink={0}    // ✅ prevent buttons from shrinking
              >
                {index + 1}
              </Button>
            ))}
          </HStack>
        )}
      </Box>

      <Box bg="white" borderRadius="xl" p={5} boxShadow="sm" mt={6}>
        <Text fontSize="lg" fontWeight="600" color="brand.gray.800" mb={4}>
          Property Video
        </Text>
        <VStack spacing={4}>
          {(property?.media?.videos || []).map((video, idx) => (
            <Box key={idx} w="100%">
              <video
                src={video?.url || video}
                controls
                style={{ width: "100%", borderRadius: "8px" }}
              />
            </Box>
          ))}
        </VStack>
      </Box>

      <VStack align="stretch" p={6} spacing={6}>
        <Box bg="white" p={4} borderRadius="xl" border="2px solid" borderColor="brand.success">
          <VStack spacing={3} align="stretch">
            <HStack justify="center" bg="brand.success" py={2} px={3} borderRadius="lg">
              <ShieldCheck size={18} color="white" />
              <Text fontSize="sm" color="white" fontWeight="bold">
                ESCROW PROTECTED - YOUR MONEY IS SAFE
              </Text>
            </HStack>

            <Text fontSize="3xl" fontWeight="bold" color="brand.primary" textAlign="center">
              {title}
            </Text>

            <Text textAlign="center" fontSize="xl" fontWeight="600" color="brand.gray.800">
              {location}{state ? `, ${state}` : ""}
            </Text>
            <Text textAlign="center" fontSize="sm" color="brand.gray.600">
              {description}
            </Text>
            <HStack justify="space-between" align="center" flexDirection={{ base: "column", sm: "row", md: "row" }}>
              <Text fontSize="xl" fontWeight="bold" color="brand.primary">
                {formatCurrency(rentAmount)} {property.rentDuration ? `/${property.rentDuration}` : ""}
              </Text>
              <VStack align="end">
                <Text fontSize="sm" fontWeight="400" color="brand.gray.800">{property.views || '0'} views </Text>
                <HStack spacing={3}>
                  <Button
                    size="sm"
                    bg={propertySaved ? 'brand.success' : 'white'}
                    color={propertySaved ? 'white' : 'brand.gray.800'}
                    _hover={{ bg: propertySaved ? 'brand.success' : 'brand.background' }}
                    onClick={async () => {
                      try {
                        setIsSaving(true);
                        await saveProperty(id);
                        setPropertySaved(true);
                        setTimeout(() => setPropertySaved(false), 3000);
                      } catch (err) {
                        console.error('Failed to save property', err);
                        toast({
                          title: 'Error',
                          description: 'you have already saved this property or an error occurred.',
                          status: 'error',
                          duration: 3000,
                          isClosable: true,
                        });
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                    isLoading={isSaving}
                    leftIcon={<HeartPulse size={14} color='red' fill='red' />}
                  >
                    {propertySaved ? 'Saved' : 'Save'}
                  </Button>

                  <Button
                    size="sm"
                    bg={shareSaved ? 'brand.success' : 'white'}
                    color={shareSaved ? 'white' : 'brand.gray.800'}
                    _hover={{ bg: shareSaved ? 'brand.success' : 'brand.background' }}
                    onClick={async () => {
                      try {
                        setIsSharing(true);
                        await navigator.clipboard.writeText(window.location.href);
                        setShareSaved(true);
                        setTimeout(() => setShareSaved(false), 3000);
                      } catch (err) {
                        console.error('Failed to copy link', err);
                        toast({
                          title: 'Error',
                          description: 'Unable to copy link to clipboard.',
                          status: 'error',
                          duration: 3000,
                          isClosable: true,
                        });
                      } finally {
                        setIsSharing(false);
                      }
                    }}
                    isLoading={isSharing}
                    leftIcon={<Copy size={14} />}
                  >
                    {shareSaved ? 'Link copied' : 'Copy link'}
                  </Button>
                </HStack>
              </VStack>
            </HStack>
          </VStack>
        </Box>

        <Grid templateColumns="repeat(3, 1fr)" gap={4}>
          <VStack bg="brand.background" p={4} borderRadius="lg" spacing={2}>
            <Bed size={24} color="#00695C" />
            <Text fontSize="sm" fontWeight="600">{bedrooms || 0} Beds</Text>
          </VStack>

          <VStack bg="brand.background" p={4} borderRadius="lg" spacing={2}>
            <Bath size={24} color="#00695C" />
            <Text fontSize="sm" fontWeight="600">{bathrooms || 0} Baths</Text>
          </VStack>

          <VStack bg="brand.background" p={4} borderRadius="lg" spacing={2}>
            <Square size={24} color="#00695C" />
            <Text fontSize="sm" fontWeight="600">{size ? `${size} sqm` : "Size available"}</Text>
          </VStack>

          <VStack bg="brand.background" p={4} borderRadius="lg" spacing={2}>
            <Toilet size={24} color="#00695C" />
            <Text fontSize="sm" fontWeight="600">{property.toilet ? `${property.toilet} sqm` : "Toilet available"}</Text>
          </VStack>

          {(property?.amenities || []).map((item, index) => (
            <VStack key={`${item}-${index}`} bg="brand.background" p={4} borderRadius="lg" spacing={2}>
              <Text fontSize="sm" fontWeight="600">{item}</Text>
            </VStack>
          ))}
        </Grid>

        <Divider />

        <VStack align="stretch" spacing={3}>
          <Text fontSize="lg" fontWeight="600" color="brand.gray.800">
            Agent Information
          </Text>
          <HStack bg="brand.background" p={4} borderRadius="lg" spacing={4}>
            <Avatar size="lg" name={agentName} />
            <VStack align="start" flex={1} spacing={1}>
              <Text fontWeight="600" color="brand.gray.800">
                {agentName}
              </Text>
              {/* <Text fontSize="sm" color="brand.gray.600">
                {agentPhone}
              </Text> */}
            </VStack>
            <Button size="sm" variant="secondary">
              Contact
            </Button>
          </HStack>
        </VStack>

        <Divider />

        <Box bg="white" borderRadius="xl" p={5} boxShadow="sm">
          <VStack align="stretch" spacing={3}>
            <Text fontSize="lg" fontWeight="600" color="brand.gray.800">
              Price Breakdown
            </Text>
            <VStack align="stretch" spacing={2}>
              <HStack justify="space-between">
                <Text color="brand.gray.600">Annual Rent ({property.rentDuration}{property.negotiable && `, ${property.negotiable}`})</Text>
                <Text fontWeight="600">{formatCurrency(rentAmount)} </Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="brand.gray.600">Agency Fee (10%)</Text>
                <Text fontWeight="600">{formatCurrency(Number(rentAmount) * 0.1)}</Text>
              </HStack>
              {cautionDeposit && <HStack justify="space-between">
                <Text color="brand.gray.600">Caution Deposit</Text>
                <Text fontWeight="600">{formatCurrency(Number(cautionDeposit))}</Text>
              </HStack>}
              {serviceCharge && <HStack justify="space-between">
                <Text color="brand.gray.600">Service Charge ({property.serviceChargePeriod})</Text>
                <Text fontWeight="600">{formatCurrency(Number(serviceCharge))}</Text>
              </HStack>}
            </VStack>
          </VStack>
        </Box>
        <Box bg="white" borderRadius="xl" p={5} boxShadow="sm">
          <Heading size="md" mb={4}>Recommended Properties</Heading>
          <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={6}>
            {recommendedProperties.map((prop) => (
              prop._id !== property._id && <PropertyCard key={prop._id} property={prop} />
            ))}
          </Grid>
        </Box>
      </VStack>


      <Box position="fixed" bottom={0} left={0} right={0} bg="white" borderTop="2px solid" borderColor="brand.success" p={6} boxShadow="2xl">
        {/* <Grid templateColumns="1fr 1fr" gap={3} w="100%"> */}
        {/* <Button as={Link} to={`/book-inspection/${property._id}`} variant="secondary" leftIcon={<Calendar size={18} />} size="lg">
            Book Inspection
          </Button> */}
        <Button as={Link} to={`/secure-payment/${property._id}`} variant="primary" leftIcon={<LockIcon size={18} />} size="lg" w="100%">
          Secure Property
        </Button>
        {/* </Grid> */}
      </Box>
    </Box>
  );
}
