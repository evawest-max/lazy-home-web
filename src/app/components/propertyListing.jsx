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
    Spinner,
} from '@chakra-ui/react';
import { Search, MapPin, ShieldCheck } from 'lucide-react';
import PropertyCard from './PropertyCard';
import Navbar from './Navbar';
import FilterSearch from './FilterSearch';
import { useEffect, useState } from 'react';
import { advancedPropertySearch, getAllProperties } from '../../../api';


export default function PropertyListing() {
    const [properties, setProperties] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchText, setSearchText] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [areaFilter, setAreaFilter] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [bedrooms, setBedrooms] = useState('');
    const [propertyType, setPropertyType] = useState('');
    const [furnished, setFurnished] = useState('');
    const [amenities, setAmenities] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [isFiltered, setIsFiltered] = useState(false);
    const [filterPayload, setFilterPayload] = useState({});
    const itemsPerPage = 10;

    const filteredProperties = properties

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
        if (e.target.value === '') {
            setIsFiltered(false);
            
        }else {
            setIsFiltered(true);
            setCurrentPage(1);
        }
        setCurrentPage(1);
    };

    const handleLocationChange = async (e) => {
        setLocationFilter(e.target.value);
        if (e.target.value == "" || e.target.value == null || e.target.value == undefined || e.target.value == "All Locations" ) {
            fetchProperties(1);
            // setFilterPayload((prev) => ({ ...prev, state: e.target.value }));
        }
        setFilterPayload((prev) => ({ ...prev, area: e.target.value }));
        const res = await advancedPropertySearch({
            page: currentPage,
            limit: itemsPerPage,
            area: e.target.value,
            state: e.target.value,
        });
        setProperties(res?.data?.data || []);
        console.log('Fetched properties:', res);
        setCurrentPage(1);
    };


    const fetchProperties = async (page = currentPage) => {
        try {
            setLoading(true);
            const response = isFiltered
                ? await advancedPropertySearch({
                    page,
                    limit: itemsPerPage,
                    keyword: searchText,
                    // state: locationFilter,
                    // area: areaFilter,
                    // ...filterPayload
                })
                : await getAllProperties({ page, limit: itemsPerPage });

            setProperties(response?.data?.data?.properties || []);
            setTotalPages(response?.data?.data?.pages || 1);
            
        } catch (error) {
            console.error('Failed to fetch properties:', error);
            setProperties([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isFiltered) {
            fetchProperties(currentPage);
        }
    }, [currentPage]);

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
                        Loading properties...
                    </Text>
                </VStack>
            </Box>
        );
    }

    if (!properties) {
        return (
            <Box
                minH="100vh"
                bg="brand.background"
                display="flex"
                justifyContent="center"
                alignItems="center"
            >
                <VStack spacing={4} p={8} bg="white" borderRadius="xl" boxShadow="lg">
                    <Icon as={AlertCircle} w={10} h={10} color="red.500" />
                    <Text fontSize="lg" fontWeight="600" color="brand.gray.700">
                        Properties not found.
                    </Text>
                </VStack>
            </Box>
        );
    }




    return (
        <Box minH="100vh" bg="brand.background" pb="80px">
            <VStack spacing={0} align="stretch">
                <Box bg="brand.primary" px={6} pt={12} pb={8}>
                    <VStack spacing={4} align="stretch">
                        <Text fontSize="2xl" fontWeight="bold" color="white">
                            SafeTenants
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
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        setIsFiltered(true);
                                        setCurrentPage(1);
                                        fetchProperties(1);
                                    }
                                }}
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
                                <option value="Port Harcourt, Rivers State">Port Harcourt, Rivers State</option>
                            </Select>
                            <FilterSearch setProperties={setProperties} fetchProperties={fetchProperties} setFilterPayload={setFilterPayload} />
                        </HStack>
                    </VStack>
                </Box>


                <VStack spacing={4} px={6} align="stretch" mb={6}>
                    <HStack justify="space-between" align="center">
                        <Text fontSize="lg" fontWeight="600" color="brand.gray.800">
                            All Properties
                        </Text>
                        <Badge bg="brand.success" color="white" fontSize="xs" px={3} py={1}>
                            All Escrow Protected
                        </Badge>
                    </HStack>

                    <Grid templateColumns={{ sm: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }} gap={4}>
                        {properties.map((property) => (
                            <PropertyCard key={property._id} property={property} />
                        ))}
                    </Grid>



                    <HStack justify="center" spacing={2} mt={6}>
                        <Button size="sm" variant="outline" onClick={handlePrevPage} isDisabled={currentPage === 1}>
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
                        <Button size="sm" variant="outline" onClick={handleNextPage} isDisabled={currentPage === totalPages}>
                            Next
                        </Button>
                    </HStack>
                </VStack>

                <Box bg="white" mx={6} p={6} borderRadius="xl" boxShadow="sm">
                    <VStack spacing={4}>
                        <Text fontSize="md" fontWeight="bold" color="brand.primary" textAlign="center">
                            Why Choose SafeTenants?
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
