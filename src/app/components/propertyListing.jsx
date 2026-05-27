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
    Heading,
    Flex,
    Button,
} from '@chakra-ui/react';
import { Search, MapPin, SlidersHorizontal, Home, User, FileText, ShieldCheck } from 'lucide-react';
import PropertyCard from './PropertyCard';
import TrustBanner from './TrustBanner';
import TestimonialCard from './TestimonialCard';
import BeforeAfter from './BeforeAfter';
import Navbar from './Navbar';
import { mockProperties } from './mockData';
import FilterSearch from './FilterSearch';
import { useState } from 'react';


export default function PropertyListing() {
    const [properties, setProperties] = useState(mockProperties);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchText, setSearchText] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const itemsPerPage = 6;

    // Filter properties based on search text and location
    const filteredProperties = properties.filter((p) => {
        const matchesApproval = p.approved;
        const matchesSearch = searchText === '' || 
            p.title.toLowerCase().includes(searchText.toLowerCase()) ||
            p.location.toLowerCase().includes(searchText.toLowerCase());
        const matchesLocation = locationFilter === '' || p.location.includes(locationFilter);
        return matchesApproval && matchesSearch && matchesLocation;
    });

    const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProperties = filteredProperties.slice(startIndex, endIndex);

    const handlePrevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const handleSearchChange = (e) => {
        setSearchText(e.target.value);
        setCurrentPage(1);
    };

    const handleLocationChange = (e) => {
        setLocationFilter(e.target.value);
        setCurrentPage(1);
    };

    return (
        <Box minH="100vh" bg="brand.background" pb="80px">
            <VStack spacing={0} align="stretch">
                <Box bg="brand.primary" px={6} pt={12} pb={8}>
                    <VStack spacing={4} align="stretch">
                        <Text fontSize="2xl" fontWeight="bold" color="white">
                LazyHomes
              </Text>

                        <HStack spacing={2} justify="center" bg="whiteAlpha.200" py={2} px={3} borderRadius="full">
                            <ShieldCheck size={16} color="white" />
                            <Text fontSize="xs" color="white" fontWeight="600">
                                PAY SAFELY WITH ESCROW PROTECTION
                            </Text>
                        </HStack>

                        <Text fontSize="2xl" fontWeight="bold" color="white" textAlign="center">
                            Find Your Perfect Home
                        </Text>

                        <InputGroup size="lg">
                            <InputLeftElement pointerEvents="none">
                                <Search color="gray" size={20} />
                            </InputLeftElement>
                            <Input
                                bg="white"
                                placeholder="Search properties..."
                                value={searchText}
                                onChange={handleSearchChange}
                                _placeholder={{ color: 'brand.gray.500' }}
                            />
                        </InputGroup>

                        <HStack spacing={3}>
                            <Select
                                bg="white"
                                placeholder="Location"
                                icon={<MapPin size={18} />}
                                flex={1}
                                value={locationFilter}
                                onChange={handleLocationChange}
                            >
                                <option value="">All Locations</option>
                                <option value="Lekki, Lagos">Lekki, Lagos</option>
                                <option value="Victoria Island, Lagos">Victoria Island, Lagos</option>
                                <option value="Ikoyi, Lagos">Ikoyi, Lagos</option>
                                <option value="Surulere, Lagos">Surulere, Lagos</option>
                            </Select>
                            <FilterSearch setProperties={setProperties}  />
                        </HStack>
                    </VStack>
                </Box>


                <VStack spacing={4} px={6} align="stretch"mb={6}>
                    <HStack justify="space-between" align="center">
                        <Text fontSize="lg" fontWeight="600" color="brand.gray.800">
                            Featured Properties
                        </Text>
                        <Badge bg="brand.success" color="white" fontSize="xs" px={3} py={1}>
                            All Escrow Protected
                        </Badge>
                    </HStack>

                    <Grid templateColumns={{sm:"repeat(1, 1fr)", md: "repeat(2, 1fr)"}} gap={4}>
                        {paginatedProperties.map((property) => (
                            <PropertyCard key={property.id} property={property} />
                        ))}
                    </Grid>

                    <HStack justify="center" spacing={2} mt={6}>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handlePrevPage}
                            isDisabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                size="sm"
                                variant={currentPage === page ? 'primary' : 'outline'}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </Button>
                        ))}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleNextPage}
                            isDisabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </HStack>
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

            <Navbar active="property-listings" />
        </Box>
    );
}
