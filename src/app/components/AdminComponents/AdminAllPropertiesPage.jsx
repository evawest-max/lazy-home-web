import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  Heading,
  HStack,
  Image,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Spinner,
  Stack,
  Tag,
  TagLabel,
  Text,
  useToast,
  VStack,
  Badge,
  Select,
} from '@chakra-ui/react';
import { ChevronDown, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import { getAllUsersProperties, findProperty } from '../../../../api';

const formatMoney = (value) =>
  Number(value ?? 0).toLocaleString('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  });

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getStatusColor = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'available':
      return 'green';
    case 'rented':
      return 'blue';
    case 'pending':
      return 'orange';
    case 'rejected':
      return 'red';
    case 'inactive':
      return 'gray';
    default:
      return 'gray';
  }
};

const getVerificationColor = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'verified':
      return 'green';
    case 'pending':
      return 'orange';
    case 'rejected':
      return 'red';
    default:
      return 'gray';
  }
};

const defaultPagination = { total: 0, page: 1, limit: 10, pages: 1 };

export default function AdminAllPropertiesPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState(defaultPagination);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [propertyLookup, setPropertyLookup] = useState('');
  const [propertyLookupLoading, setPropertyLookupLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchProperties = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await getAllUsersProperties();
      const payload = res?.data?.data ?? res?.data ?? res ?? {};
      const list = Array.isArray(payload?.properties) ? payload.properties : [];
      const pageInfo = payload?.pagination ?? {
        total: list.length,
        page: 1,
        limit: list.length || 10,
        pages: 1,
      };

      setProperties(list);
      setPagination({
        total: Number(pageInfo.total ?? list.length),
        page: Number(pageInfo.page ?? 1),
        limit: Number(pageInfo.limit ?? 10),
        pages: Number(pageInfo.pages ?? 1),
      });
    } catch (err) {
      console.error('Failed to load properties', err);
      setError('Unable to load properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const filterDefinitions = [
    { id: 'all', label: 'All', match: () => true },
    { id: 'approved', label: 'Approved', match: (property) => ['basic_verified', 'fully_verified'].includes((property?.verificationStatus || '').toLowerCase()) },
    { id: 'pending', label: 'Pending', match: (property) => (property?.verificationStatus || '').toLowerCase() === 'pending' },
    { id: 'basic_verified', label: 'Basic Verified', match: (property) => (property?.verificationStatus || '').toLowerCase() === 'basic_verified' },
    { id: 'fully_verified', label: 'Fully Verified', match: (property) => (property?.verificationStatus || '').toLowerCase() === 'fully_verified' },
    { id: 'rejected', label: 'Rejected', match: (property) => (property?.verificationStatus || '').toLowerCase() === 'rejected' },
    { id: 'suspended', label: 'Suspended', match: (property) => (property?.verificationStatus || '').toLowerCase() === 'suspended' },
    { id: 'available', label: 'Available', match: (property) => (property?.listingStatus || '').toLowerCase() === 'available' },
    { id: 'under_offer', label: 'Under Offer', match: (property) => (property?.listingStatus || '').toLowerCase() === 'under_offer' },
    { id: 'rented', label: 'Rented', match: (property) => (property?.listingStatus || '').toLowerCase() === 'rented' },
    { id: 'archived', label: 'Archived', match: (property) => (property?.listingStatus || '').toLowerCase() === 'archived' },
    { id: 'deleted', label: 'Deleted', match: (property) => property?.isDeleted === true || property?.isDeleted === 'true' },
  ];

  const filterCounts = useMemo(() => {
    return filterDefinitions.reduce((acc, filter) => {
      acc[filter.id] = properties.filter((property) => filter.match(property)).length;
      return acc;
    }, {});
  }, [properties]);

  const filteredProperties = useMemo(() => {
    const query = search.trim().toLowerCase();
    const activeFilter = filterDefinitions.find((item) => item.id === selectedFilter) || filterDefinitions[0];

    return properties.filter((property) => {
      const matchesFilter = activeFilter.match(property);
      const haystack = [
        property?.title,
        property?.propertyType,
        property?.listingStatus,
        property?.verificationStatus,
        property?.address?.state,
        property?.address?.area,
        property?.address?.lga,
        property?.listedBy?.fullName,
        property?.listedBy?.email,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = !query || haystack.includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [properties, search, selectedFilter]);

  const handlePropertyAction = (action, property) => {
    toast({
      title: `${action} action`,
      description: `${action} queued for ${property?.title || 'this property'}.`,
      status: 'info',
      duration: 2500,
      isClosable: true,
    });
  };

  const handleFindProperty = async () => {
    const query = propertyLookup.trim();

    if (!query) {
      toast({
        title: 'Enter a property title, owner name or location',
        status: 'warning',
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    setPropertyLookupLoading(true);

    try {
      const res = await findProperty(query);
      const payload = res?.data?.data ?? res?.data ?? res ?? {};
      const foundProperty = Array.isArray(payload?.properties)
        ? payload.properties[0]
        : Array.isArray(payload?.property)
          ? payload.property[0]
          : payload?.property ?? payload?.data ?? null;

      if (!foundProperty) {
        setProperties([]);
        toast({
          title: 'No property found',
          description: 'Try a different title, owner name, or location.',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setProperties(Array.isArray(foundProperty) ? foundProperty : [foundProperty]);
      setSelectedFilter('all');
      setSelectedProperty(foundProperty);
      setIsDetailOpen(true);
      toast({
        title: 'Property found',
        description: `${foundProperty?.title || 'Property'} was loaded successfully.`,
        status: 'success',
        duration: 2500,
        isClosable: true,
      });
    } catch (err) {
      console.error('Failed to find property', err);
      toast({
        title: 'Lookup failed',
        description: err?.response?.data?.message || 'Unable to find this property.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setPropertyLookupLoading(false);
    }
  };

  const openPropertyDetails = (property) => {
    setSelectedProperty(property);
    setIsDetailOpen(true);
  };

  return (
    <Box p={6} bg="brand.background" minH="100vh" pb={40}>
      <VStack spacing={6} align="stretch">
        <Flex justify="space-between" align="center" gap={4} flexWrap="wrap">
          <Box>
            <Heading size="lg" color="teal.600">All Properties</Heading>
            <Text color="gray.600">Review all user-managed listings, verification, and status from one place.</Text>
          </Box>

          <HStack>
            <Button variant="outline" onClick={() => navigate('/user-management')}>
              Back
            </Button>
            <Button colorScheme="teal" onClick={fetchProperties} isLoading={loading}>
              Refresh
            </Button>
          </HStack>
        </Flex>

        {error && (
          <Card border="1px solid" borderColor="red.200" bg="red.50">
            <CardBody>
              <Text color="red.600">{error}</Text>
            </CardBody>
          </Card>
        )}

        <Card shadow="md">
          <CardHeader>
            <Heading size="md">Property Lookup</Heading>
          </CardHeader>
          <CardBody>
            <Flex gap={3} wrap="wrap" align="center">
              <Input
                placeholder="Enter property title, owner name or location"
                value={propertyLookup}
                onChange={(e) => setPropertyLookup(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFindProperty();
                }}
                maxW="460px"
              />
              <Button colorScheme="teal" onClick={handleFindProperty} isLoading={propertyLookupLoading}>
                Find Property
              </Button>
              <Button variant="outline" onClick={() => {
                setPropertyLookup('');
                fetchProperties();
              }}>
                Clear
              </Button>
            </Flex>
          </CardBody>
        </Card>

        <Card shadow="md">
          <CardHeader>
            <Flex justify="space-between" align="center" gap={3} flexWrap="wrap">
              <Heading size="md">Properties Directory</Heading>
              <Input
                placeholder="Search by title, type, status or location"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                maxW="440px"
              />
            </Flex>
          </CardHeader>
          <CardBody>
            <Flex wrap="wrap" gap={2} mb={4}>
              {filterDefinitions.map((filter) => {
                const isActive = selectedFilter === filter.id;
                return (
                  <Button
                    key={filter.id}
                    size="sm"
                    variant={isActive ? 'solid' : 'outline'}
                    colorScheme={isActive ? 'teal' : 'gray'}
                    onClick={() => setSelectedFilter(filter.id)}
                  >
                    {filter.label} ({filterCounts[filter.id] ?? 0})
                  </Button>
                );
              })}
            </Flex>
            {loading ? (
              <Flex justify="center" py={12}><Spinner /></Flex>
            ) : filteredProperties.length === 0 ? (
              <Text color="gray.500">No properties found.</Text>
            ) : (
              <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5}>
                {filteredProperties.map((property) => {
                  const propertyImage =
                    property?.media?.images?.[0]?.url ||
                    property?.media?.images?.[0]?.secure_url ||
                    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=900&q=80';

                  return (
                    <Card key={property?._id || property?.title} shadow="sm" borderWidth="1px" borderColor="gray.200">
                      <CardBody p={0}>
                        <Flex direction={{ base: 'column', md: 'row' }} h="100%">
                          <Box w={{ base: '100%', md: '260px' }} h={{ base: '220px', md: '100%' }} minH={{ md: '240px' }} position="relative">
                            <Image
                              src={propertyImage}
                              alt={property?.title}
                              objectFit="cover"
                              w="100%"
                              h="100%"
                            />
                            <Badge
                              position="absolute"
                              top={3}
                              left={3}
                              colorScheme={getVerificationColor(property?.verificationStatus)}
                            >
                              {property?.verificationStatus || 'pending'}
                            </Badge>
                          </Box>

                          <Box flex="1" p={4} position="relative">
                            <Flex justify="space-between" align="flex-start" gap={3}>
                              <Box flex="1">
                                <Text fontSize="lg" fontWeight="bold">{property?.title || 'Untitled Property'}</Text>
                                <Text fontSize="sm" color="gray.500">{property?.propertyType || 'Property'}</Text>
                              </Box>
                              <Menu>
                                <MenuButton as={Button} variant="ghost" size="sm" aria-label="Property actions">
                                  <MoreVertical size={16} />
                                </MenuButton>
                                <MenuList>
                                  <MenuItem onClick={() => openPropertyDetails(property)}>View Details</MenuItem>
                                  <MenuItem onClick={() => handlePropertyAction('Approve', property)}>Approve</MenuItem>
                                  <MenuItem onClick={() => handlePropertyAction('Reject', property)}>Reject</MenuItem>
                                  <MenuItem onClick={() => handlePropertyAction('Feature', property)}>Feature</MenuItem>
                                  <MenuDivider />
                                  <MenuItem onClick={() => handlePropertyAction('Deactivate', property)}>Deactivate</MenuItem>
                                </MenuList>
                              </Menu>
                            </Flex>

                            <Stack spacing={2} mt={3}>
                              <Text fontSize="lg" fontWeight="bold" color="teal.600">{formatMoney(property?.rentAmount)}</Text>
                              <Text fontSize="sm" color="gray.600">
                                {property?.address?.streetAddress || property?.address?.area || 'Address not provided'}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                {property?.address?.state || 'State not provided'}
                                {property?.address?.lga ? ` • ${property?.address?.lga}` : ''}
                                {property?.address?.area ? ` • ${property?.address?.area}` : ''}
                              </Text>
                              <Flex wrap="wrap" gap={2}>
                                <Tag size="sm" colorScheme={getStatusColor(property?.listingStatus)}>
                                  <TagLabel textTransform="capitalize">{property?.listingStatus || 'available'}</TagLabel>
                                </Tag>
                                <Tag size="sm" colorScheme="purple">
                                  <TagLabel>{property?.bedrooms || '—'} bed</TagLabel>
                                </Tag>
                                <Tag size="sm" colorScheme="cyan">
                                  <TagLabel>{property?.bathrooms || '—'} bath</TagLabel>
                                </Tag>
                              </Flex>
                            </Stack>

                            <Divider my={3} />

                            <Flex justify="space-between" align="center" fontSize="xs" color="gray.500">
                              <Text>Owner: {property?.listedBy?.fullName || 'Unknown owner'}</Text>
                              <Text>{formatDate(property?.createdAt)}</Text>
                            </Flex>

                            <HStack mt={4} spacing={3}>
                              <Button size="sm" colorScheme="blue" variant="outline" onClick={() => openPropertyDetails(property)}>
                                View Details
                              </Button>
                              <Button size="sm" colorScheme="green" variant="outline" onClick={() => handlePropertyAction('Approve', property)}>
                                Approve
                              </Button>
                            </HStack>
                          </Box>
                        </Flex>
                      </CardBody>
                    </Card>
                  );
                })}
              </SimpleGrid>
            )}

            <Flex mt={5} justify="space-between" align="center" gap={3} flexWrap="wrap">
              <Text fontSize="sm" color="gray.600">
                Showing {filteredProperties.length} of {pagination.total} properties
              </Text>

              <HStack>
                <Select size="sm" w="100px" value={pagination.limit} onChange={(e) => setPagination((prev) => ({ ...prev, limit: Number(e.target.value) }))}>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </Select>
                <Button size="sm" variant="outline">Prev</Button>
                <Button size="sm" variant="outline">Next</Button>
              </HStack>
            </Flex>
          </CardBody>
        </Card>
      </VStack>

      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} size="2xl">
        <ModalOverlay />
        <ModalContent maxH="90vh" overflowY="auto">
          <ModalHeader display="flex" justifyContent="space-between" alignItems="center" gap={3} pr={12}>
            <Box>{selectedProperty?.title || 'Property detail'}</Box>
            {selectedProperty && (
              <Menu>
                <MenuButton as={Button} size="sm" rightIcon={<ChevronDown size={14} />} colorScheme="teal" variant="outline">
                  Actions
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => handlePropertyAction('Approve', selectedProperty)}>Approve</MenuItem>
                  <MenuItem onClick={() => handlePropertyAction('Reject', selectedProperty)}>Reject</MenuItem>
                  <MenuItem onClick={() => handlePropertyAction('Feature', selectedProperty)}>Feature</MenuItem>
                  <MenuDivider />
                  <MenuItem onClick={() => handlePropertyAction('Deactivate', selectedProperty)}>Deactivate</MenuItem>
                </MenuList>
              </Menu>
            )}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {!selectedProperty ? (
              <Text color="gray.500">No property data available.</Text>
            ) : (
              <VStack align="stretch" spacing={5}>
                <Image
                  src={selectedProperty?.media?.images?.[0]?.url || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=900&q=80'}
                  alt={selectedProperty?.title}
                  borderRadius="md"
                  h="280px"
                  objectFit="cover"
                />

                <HStack justify="space-between" align="center" spacing={3}>
                  <Text fontSize="sm" color="gray.600">Quick actions</Text>
                  <Menu>
                    <MenuButton as={Button} size="sm" rightIcon={<ChevronDown size={14} />} colorScheme="teal" variant="outline">
                      Admin Actions
                    </MenuButton>
                    <MenuList>
                      <MenuItem onClick={() => handlePropertyAction('Approve', selectedProperty)}>Approve</MenuItem>
                      <MenuItem onClick={() => handlePropertyAction('Reject', selectedProperty)}>Reject</MenuItem>
                      <MenuItem onClick={() => handlePropertyAction('Feature', selectedProperty)}>Feature</MenuItem>
                      <MenuDivider />
                      <MenuItem onClick={() => handlePropertyAction('Deactivate', selectedProperty)}>Deactivate</MenuItem>
                    </MenuList>
                  </Menu>
                </HStack>

                <Box borderWidth="1px" borderColor="gray.200" borderRadius="md" p={4}>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Property Type</Text>
                      <Text fontWeight="bold">{selectedProperty?.propertyType || '—'}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Rent</Text>
                      <Text fontWeight="bold">{formatMoney(selectedProperty?.rentAmount)}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Verification</Text>
                      <Badge colorScheme={getVerificationColor(selectedProperty?.verificationStatus)}>
                        {selectedProperty?.verificationStatus || 'pending'}
                      </Badge>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Listing Status</Text>
                      <Badge colorScheme={getStatusColor(selectedProperty?.listingStatus)}>
                        {selectedProperty?.listingStatus || 'available'}
                      </Badge>
                    </Box>
                  </SimpleGrid>
                </Box>

                <Box borderWidth="1px" borderColor="gray.200" borderRadius="md" p={4}>
                  <Heading size="sm" mb={3}>Description</Heading>
                  <Text>{selectedProperty?.description || 'No description provided.'}</Text>
                </Box>

                <Box borderWidth="1px" borderColor="gray.200" borderRadius="md" p={4}>
                  <Heading size="sm" mb={3}>Location</Heading>
                  <Text>
                    {selectedProperty?.address?.streetAddress || '—'}
                    {selectedProperty?.address?.area ? `, ${selectedProperty?.address?.area}` : ''}
                    {selectedProperty?.address?.lga ? `, ${selectedProperty?.address?.lga}` : ''}
                    {selectedProperty?.address?.state ? `, ${selectedProperty?.address?.state}` : ''}
                  </Text>
                </Box>

                <Box borderWidth="1px" borderColor="gray.200" borderRadius="md" p={4}>
                  <Heading size="sm" mb={3}>Owner</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                    <Text><strong>Name:</strong> {selectedProperty?.listedBy?.fullName || '—'}</Text>
                    <Text><strong>Email:</strong> {selectedProperty?.listedBy?.email || '—'}</Text>
                    <Text><strong>Phone:</strong> {selectedProperty?.listedBy?.phone || '—'}</Text>
                    <Text><strong>Verification:</strong> {selectedProperty?.listedBy?.verification?.verificationLevel || '—'}</Text>
                  </SimpleGrid>
                </Box>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <AdminNavbar active="User Management" />
    </Box>
  );
}
