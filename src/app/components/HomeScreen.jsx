import {
  Box,
  VStack,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  IconButton,
  Grid,
  Text,
  Badge,
  Flex,
  Heading,
  Button,
  Avatar,
} from '@chakra-ui/react';
import { Search, MapPin, SlidersHorizontal, Home, User, FileText, ShieldCheck } from 'lucide-react';
import PropertyCard from './PropertyCard';
import TrustBanner from './TrustBanner';
import TestimonialCard from './TestimonialCard';
import BeforeAfter from './BeforeAfter';
import Navbar from './Navbar';
import { mockProperties, testimonials } from './mockData';
import FilterSearch from './FilterSearch';
import { useState } from 'react';

export default function HomeScreen() {
  const [properties, setProperties] = useState(mockProperties);
  return (
    <Box minH="100vh" bg="brand.background" pb="80px">
      <VStack spacing={0} align="stretch">
        <Box bg="brand.primary" px={6} pt={12} pb={8}>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between" mb={4}>
              <VStack align="start" spacing={0}>
                <Text fontSize="2xl" fontWeight="bold" color="white">
                  LazyHomes
                </Text>
                <Text fontSize="xs" color="whiteAlpha.800">
                  Welcome back, John
                </Text>
              </VStack>
              <Avatar
                size="md"
                name="John Adeyemi"
                src="https://i.pravatar.cc/150?img=33"
                cursor="pointer"
              />
            </HStack>
            <HStack spacing={2} justify="center" bg="whiteAlpha.200" py={2} px={3} borderRadius="full">
              <ShieldCheck size={16} color="white" />
              <Text fontSize="xs" color="white" fontWeight="600">
                PAY SAFELY WITH ESCROW PROTECTION
              </Text>
            </HStack>

            <Text fontSize="2xl" fontWeight="bold" color="white" textAlign="center">
              Find Your Perfect Home
            </Text>

            {/* <InputGroup size="lg">
              <InputLeftElement pointerEvents="none">
                <Search color="gray" size={20} />
              </InputLeftElement>
              <Input
                bg="white"
                placeholder="Search properties..."
                _placeholder={{ color: 'brand.gray.500' }}
              />
            </InputGroup>

            <HStack spacing={3}>
              <Select
                bg="white"
                placeholder="Location"
                icon={<MapPin size={18} />}
                flex={1}
              >
                <option>Lekki, Lagos</option>
                <option>Victoria Island, Lagos</option>
                <option>Ikoyi, Lagos</option>
                <option>Surulere, Lagos</option>
              </Select>

              
            <FilterSearch setProperties={setProperties} /> */}
            {/* </HStack> */}
          </VStack>
        </Box>

        <TrustBanner />

        <Box bg="brand.success" px={6} py={4}>
          <VStack spacing={2}>
            <Text fontSize="sm" fontWeight="bold" color="white" textAlign="center">
              🛡️ ZERO RISK GUARANTEE
            </Text>
            <Text fontSize="xs" color="whiteAlpha.900" textAlign="center">
              Your money is held safely in escrow. Get 100% refund if property doesn't match listing.
            </Text>
          </VStack>
        </Box>

        <VStack spacing={4} px={6} py={6} align="stretch">
          <BeforeAfter />
        </VStack>

        <VStack spacing={4} px={6} align="stretch">
          <Text fontSize="lg" fontWeight="600" color="brand.gray.800">
            What Renters Say About Us
          </Text>

          <VStack spacing={3} align="stretch">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </VStack>
        </VStack>

        <VStack spacing={4} px={6} mb={6} align="stretch">
          <HStack justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="600" color="brand.gray.800">
              Featured Properties
            </Text>
            <Badge bg="brand.success" color="white" fontSize="xs" px={3} py={1}>
              All Escrow Protected
            </Badge>
          </HStack>

          <Grid templateColumns={{ sm: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }} gap={4}>
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </Grid>


          <Button
            as="a"
            href="/property-listings"
            variant="outline"
            color="brand.primary"
            borderColor="brand.primary"
            _hover={{ bg: 'brand.primary', color: 'white' }}
          >
            View All Properties
          </Button>
        </VStack>

        <Box bg="white" mx={6} p={6} borderRadius="xl" boxShadow="sm">
          <VStack spacing={4}>
            <Text fontSize="md" fontWeight="bold" color="brand.primary" textAlign="center">
              Why Choose LazyHomes?
            </Text>

            <VStack spacing={3} w="100%">
              <HStack spacing={3} bg="brand.background" p={4} borderRadius="lg" w="100%">
                <Text fontSize="2xl">🛡️</Text>
                <VStack align="start" spacing={0} flex={1}>
                  <Text fontSize="sm" fontWeight="600">Zero Fraud Risk</Text>
                  <Text fontSize="xs" color="brand.gray.600">Escrow holds money until you approve</Text>
                </VStack>
              </HStack>

              <HStack spacing={3} bg="brand.background" p={4} borderRadius="lg" w="100%">
                <Text fontSize="2xl">✅</Text>
                <VStack align="start" spacing={0} flex={1}>
                  <Text fontSize="sm" fontWeight="600">Verified Properties</Text>
                  <Text fontSize="xs" color="brand.gray.600">All listings checked and agent KYC verified</Text>
                </VStack>
              </HStack>

              <HStack spacing={3} bg="brand.background" p={4} borderRadius="lg" w="100%">
                <Text fontSize="2xl">💰</Text>
                <VStack align="start" spacing={0} flex={1}>
                  <Text fontSize="sm" fontWeight="600">Money-Back Guarantee</Text>
                  <Text fontSize="xs" color="brand.gray.600">Full instant refund if house doesn't match</Text>
                </VStack>
              </HStack>
            </VStack>
          </VStack>
        </Box>
      </VStack>

      <Navbar active="home" />
    </Box>
  );
}
