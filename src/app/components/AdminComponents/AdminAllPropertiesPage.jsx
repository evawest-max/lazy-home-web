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
    Textarea,
    useToast,
    VStack,
    Badge,
    Select,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
} from '@chakra-ui/react';
import { ChevronDown, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import {
    findProperty,
    getAllUsersProperties,
    moderateProperty,
    updatePropertyStatus,
} from '../../../../api';

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
        case 'under_offer':
            return 'purple';
        case 'rented':
            return 'blue';
        case 'archive':
        case 'archived':
        case 'inactive':
            return 'gray';
        case 'restore':
            return 'teal';
        case 'suspend':
        case 'suspended':
            return 'orange';
        case 'feature':
        case 'featured':
            return 'cyan';
        case 'unfeature':
            return 'gray';
        case 'delete':
        case 'deleted':
            return 'red';
        default:
            return 'gray';
    }
};

const getVerificationColor = (status) => {
    switch ((status || '').toLowerCase()) {
        case 'approve':
        case 'approved':
        case 'verified':
            return 'green';
        case 'pending':
            return 'orange';
        case 'reject':
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
    const [updatingStatusId, setUpdatingStatusId] = useState(null);
    const [moderationReason, setModerationReason] = useState('');
    const [moderatingPropertyId, setModeratingPropertyId] = useState(null);

    const fetchProperties = async (page = 1, limit = 10) => {
        setLoading(true);
        setError('');

        try {
            const res = await getAllUsersProperties({ page, limit });
            const payload = res?.data?.data ?? res?.data ?? res ?? {};
            const list = Array.isArray(payload?.properties) ? payload.properties : [];
            const pageInfo = payload?.pagination ?? {
                total: list.length,
                page,
                limit,
                pages: 1,
            };

            setProperties(list);
            setPagination({
                total: Number(pageInfo.total ?? list.length),
                page: Number(pageInfo.page ?? page),
                limit: Number(pageInfo.limit ?? limit),
                pages: Number(pageInfo.pages ?? 1),
            });
        } catch (err) {
            console.error('Failed to load properties', err);
            setError('Unable to load properties. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const goToPage = async (nextPage) => {
        const targetPage = Math.max(1, Number(nextPage) || 1);
        await fetchProperties(targetPage, pagination.limit);
    };

    const changeLimit = async (nextLimit) => {
        const safeLimit = Number(nextLimit) || 10;
        await fetchProperties(1, safeLimit);
    };

    useEffect(() => {
        fetchProperties(1, pagination.limit);
    }, []);

    const filterDefinitions = [
        { id: 'all', label: 'All', match: () => true },
        { id: 'approved', label: 'Approved', match: (property) => ['basic_verified', 'fully_verified', 'approve', 'approved'].includes((property?.verificationStatus || '').toLowerCase()) },
        { id: 'pending', label: 'Pending', match: (property) => (property?.verificationStatus || '').toLowerCase() === 'pending' },
        { id: 'basic_verified', label: 'Basic Verified', match: (property) => (property?.verificationStatus || '').toLowerCase() === 'basic_verified' },
        { id: 'fully_verified', label: 'Fully Verified', match: (property) => (property?.verificationStatus || '').toLowerCase() === 'fully_verified' },
        { id: 'rejected', label: 'Rejected', match: (property) => ['reject', 'rejected'].includes((property?.verificationStatus || '').toLowerCase()) },
        { id: 'suspended', label: 'Suspended', match: (property) => ['suspend', 'suspended'].includes((property?.verificationStatus || '').toLowerCase()) },
        { id: 'available', label: 'Available', match: (property) => (property?.listingStatus || '').toLowerCase() === 'available' },
        { id: 'under_offer', label: 'Under Offer', match: (property) => (property?.listingStatus || '').toLowerCase() === 'under_offer' },
        { id: 'rented', label: 'Rented', match: (property) => (property?.listingStatus || '').toLowerCase() === 'rented' },
        { id: 'archive', label: 'Archived', match: (property) => ['archive', 'archived'].includes((property?.listingStatus || '').toLowerCase()) },
        { id: 'deleted', label: 'Deleted', match: (property) => property?.isDeleted === true || property?.isDeleted === 'true' },
    ];

    const statusOptions = [
        { value: 'available', label: 'Available' },
        { value: 'under_offer', label: 'Under Offer' },
        { value: 'rented', label: 'Rented' },
        { value: 'archive', label: 'Archive' },
        // { value: 'restore', label: 'Restore' },
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

    const handleModerateProperty = async (status, property) => {
        setSelectedProperty(property);
        const propertyId = selectedProperty?._id || selectedProperty?.id;
        if (!propertyId) return;

        const value = String(status || '').toLowerCase().trim();
        console.log(value);
        const normalizedStatus = (() => {
            if (['approve', 'approved', 'verified'].includes(value)) return 'approve';
            if (['reject', 'rejected'].includes(value)) return 'reject';
            if (['suspend', 'suspended'].includes(value)) return 'suspend';
            if (['restore', 'restored'].includes(value)) return 'restore';
            if (['feature', 'featured'].includes(value)) return 'feature';
            if (['unfeature', 'unfeatured'].includes(value)) return 'unfeature';
            if (['delete', 'deleted'].includes(value)) return 'delete';
            return value || 'approve';
        })();

        console.log(normalizedStatus, moderationReason);

        const requiredReasonStatuses = ['reject', 'suspend', 'delete'];
        const reason = moderationReason.trim() || (
            normalizedStatus === 'approve' ? 'Approved by admin review' :
            normalizedStatus === 'reject' ? 'Rejected by admin review' :
            'Action taken by admin review'
        );

        if (requiredReasonStatuses.includes(normalizedStatus) && !moderationReason.trim()) {
            toast({
                title: `Reason required for ${normalizedStatus}`,
                description: 'Add the reason before continuing.',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setModeratingPropertyId(propertyId);

        try {
            const res = await moderateProperty(propertyId, {
                status: normalizedStatus,
                reason,
            });

            const updatedProperty = res?.data?.data ?? res?.data?.property ?? res?.data ?? res ?? {};

            setProperties((prev) =>
                prev.map((property) => {
                    const matches = property?._id === propertyId || property?.id === propertyId;
                    if (!matches) return property;

                    return {
                        ...property,
                        verificationStatus: ['approve', 'reject', 'suspend', 'restore'].includes(normalizedStatus) ? normalizedStatus : property?.verificationStatus,
                        listingStatus: ['available', 'under_offer', 'rented', 'archive', 'restore'].includes(normalizedStatus) ? normalizedStatus : property?.listingStatus,
                        rejectionReason: normalizedStatus === 'reject' ? reason : property?.rejectionReason,
                        ...(typeof updatedProperty === 'object' ? updatedProperty : {}),
                    };
                })
            );

            setSelectedProperty((prev) => {
                if (!prev) return prev;
                const matches = prev?._id === propertyId || prev?.id === propertyId;
                if (!matches) return prev;

                return {
                    ...prev,
                    verificationStatus: ['approve', 'reject', 'suspend', 'restore'].includes(normalizedStatus) ? normalizedStatus : prev?.verificationStatus,
                    listingStatus: ['available', 'under_offer', 'rented', 'archive', 'restore'].includes(normalizedStatus) ? normalizedStatus : prev?.listingStatus,
                    rejectionReason: normalizedStatus === 'reject' ? reason : prev?.rejectionReason,
                    ...(typeof updatedProperty === 'object' ? updatedProperty : {}),
                };
            });

            toast({
                title: normalizedStatus === 'approve' ? 'Property approved' : 'Property updated',
                description: `${selectedProperty?.title || 'Property'} was ${normalizedStatus} successfully.`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            setModerationReason('');
        } catch (error) {
            console.error('Failed to moderate property', error);
            toast({
                title: 'Moderation failed',
                description: error?.response?.data?.message || 'Unable to update this property at the moment.',
                status: 'error',
                duration: 4000,
                isClosable: true,
            });
        } finally {
            setModeratingPropertyId(null);
        }
    };

    

    // const handleUpdatePropertyStatus = async (propertyId, nextStatus) => {
    //     if (!propertyId || !nextStatus) return;

    //     setUpdatingStatusId(propertyId);

    //     try {
    //         const res = await updatePropertyStatus(propertyId, nextStatus);
    //         const updatedProperty = res?.data?.data ?? res?.data?.property ?? res?.data ?? res ?? {};

    //         setProperties((prev) =>
    //             prev.map((property) => {
    //                 const matches = property?._id === propertyId || property?.id === propertyId;
    //                 if (!matches) return property;

    //                 return {
    //                     ...property,
    //                     listingStatus: nextStatus,
    //                     ...(typeof updatedProperty === 'object' ? updatedProperty : {}),
    //                 };
    //             })
    //         );

    //         setSelectedProperty((prev) => {
    //             if (!prev) return prev;
    //             const matches = prev?._id === propertyId || prev?.id === propertyId;
    //             if (!matches) return prev;

    //             return {
    //                 ...prev,
    //                 listingStatus: nextStatus,
    //                 ...(typeof updatedProperty === 'object' ? updatedProperty : {}),
    //             };
    //         });

    //         toast({
    //             title: 'Property status updated',
    //             description: `${nextStatus.replace('_', ' ')} was assigned successfully.`,
    //             status: 'success',
    //             duration: 3000,
    //             isClosable: true,
    //         });
    //     } catch (error) {
    //         console.error('Failed to update property status', error);
    //         toast({
    //             title: 'Status update failed',
    //             description: error?.response?.data?.message || 'Unable to update the property status right now.',
    //             status: 'error',
    //             duration: 4000,
    //             isClosable: true,
    //         });
    //     } finally {
    //         setUpdatingStatusId(null);
    //     }
    // };

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
        setModerationReason('');
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
                        <Button colorScheme="teal" size="md" onClick={fetchProperties} isLoading={loading}>
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
                            <Button colorScheme="teal" size="md" onClick={handleFindProperty} isLoading={propertyLookupLoading}>
                                Find Property
                            </Button>
                            <Button variant="outline" size="md" onClick={() => {
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
                                        variant={isActive ? 'solid' : 'ghost'}
                                        colorScheme={isActive ? 'teal' : 'gray'}
                                        borderRadius="full"
                                        px={4}
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
                            <Box overflowX="auto">
                                <Table size="sm" variant="simple" borderWidth="1px" borderRadius="lg" overflow="hidden">
                                    <Thead bg="gray.50">
                                        <Tr>
                                            <Th>Image</Th>
                                            <Th>Title</Th>
                                            <Th>Owner</Th>
                                            <Th>Location</Th>
                                            <Th>Verification</Th>
                                            <Th>Listing</Th>
                                            <Th>Created</Th>
                                            <Th>Actions</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {filteredProperties.map((property) => {
                                            const propertyImage =
                                                property?.media?.images?.[0]?.url ||
                                                property?.media?.images?.[0]?.secure_url ||
                                                'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=900&q=80';

                                            return (
                                                <Tr key={property?._id || property?.title}>
                                                    <Td>
                                                        <Image
                                                            src={propertyImage}
                                                            alt={property?.title || 'Property image'}
                                                            boxSize="64px"
                                                            objectFit="cover"
                                                            borderRadius="md"
                                                            borderWidth="1px"
                                                            borderColor="gray.200"
                                                        />
                                                    </Td>
                                                    <Td>
                                                        <Box>
                                                            <Text fontWeight="semibold">{property?.title || 'Untitled Property'}</Text>
                                                            <Text fontSize="xs" color="gray.500">{property?.propertyType || 'Property'}</Text>
                                                        </Box>
                                                    </Td>
                                                    <Td>{property?.listedBy?.fullName || 'Unknown owner'}</Td>
                                                    <Td>
                                                        <Text fontSize="sm">
                                                            {property?.address?.area || property?.address?.state || 'Not provided'}
                                                        </Text>
                                                    </Td>
                                                    <Td>
                                                        <Badge colorScheme={getVerificationColor(property?.verificationStatus)}>
                                                            {property?.verificationStatus || 'pending'}
                                                        </Badge>
                                                    </Td>
                                                    <Td>
                                                        <Badge colorScheme={getStatusColor(property?.listingStatus)}>
                                                            {property?.listingStatus || 'available'}
                                                        </Badge>
                                                    </Td>
                                                    <Td>{formatDate(property?.createdAt)}</Td>
                                                    <Td>
                                                        <Menu>
                                                            <MenuButton as={Button} size="sm" variant="outline" colorScheme="teal" rightIcon={<ChevronDown size={14} />}>
                                                                Actions
                                                            </MenuButton>
                                                            <MenuList minW="220px">
                                                                {statusOptions.map((status) => (
                                                                    <MenuItem
                                                                        key={status.value}
                                                                        onClick={() => handleModerateProperty(status.value, property)}
                                                                        isDisabled={updatingStatusId === (property?._id || property?.id)}
                                                                    >
                                                                        Set: {status.label}
                                                                    </MenuItem>
                                                                ))}
                                                                <MenuDivider />
                                                                <MenuItem onClick={() => openPropertyDetails(property)}>View Details</MenuItem>
                                                            </MenuList>
                                                        </Menu>
                                                    </Td>
                                                </Tr>
                                            );
                                        })}
                                    </Tbody>
                                </Table>
                            </Box>
                        )}

                        <Flex mt={5} justify="space-between" align="center" gap={3} flexWrap="wrap">
                            <Text fontSize="sm" color="gray.600">
                                Showing {filteredProperties.length} of {pagination.total} properties
                            </Text>

                            <HStack>
                                <Select size="sm" w="100px" value={pagination.limit} onChange={(e) => changeLimit(e.target.value)}>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </Select>
                                <Button size="sm" variant="outline" isDisabled={pagination.page <= 1} onClick={() => goToPage(pagination.page - 1)}>
                                    Prev
                                </Button>
                                <Button size="sm" variant="outline" isDisabled={pagination.page >= pagination.pages} onClick={() => goToPage(pagination.page + 1)}>
                                    Next
                                </Button>
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

                                <VStack align="stretch" spacing={3}>
                                    <Text fontSize="sm" color="gray.600">Quick actions</Text>
                                    <Menu>
                                        <MenuButton as={Button} size="sm" variant="outline" colorScheme="teal" rightIcon={<ChevronDown size={14} />}>
                                            Property actions
                                        </MenuButton>
                                        <MenuList minW="240px">
                                            <MenuItem
                                                color="green.600"
                                                onClick={() => handleModerateProperty('approve')}
                                                isDisabled={moderatingPropertyId === (selectedProperty?._id || selectedProperty?.id)}
                                            >
                                                Approve property
                                            </MenuItem>
                                            <MenuItem
                                                color="red.600"
                                                onClick={() => handleModerateProperty('reject')}
                                                isDisabled={moderatingPropertyId === (selectedProperty?._id || selectedProperty?.id)}
                                            >
                                                Reject property
                                            </MenuItem>
                                            <MenuItem
                                                color="orange.600"
                                                onClick={() => handleModerateProperty('suspend')}
                                                isDisabled={moderatingPropertyId === (selectedProperty?._id || selectedProperty?.id)}
                                            >
                                                Suspend property
                                            </MenuItem>
                                            <MenuItem
                                                color="blue.600"
                                                onClick={() => handleModerateProperty('feature')}
                                                isDisabled={moderatingPropertyId === (selectedProperty?._id || selectedProperty?.id)}
                                            >
                                                Feature property
                                            </MenuItem>
                                            <MenuItem
                                                color="gray.600"
                                                onClick={() => handleModerateProperty('unfeature')}
                                                isDisabled={moderatingPropertyId === (selectedProperty?._id || selectedProperty?.id)}
                                            >
                                                Unfeature property
                                            </MenuItem>
                                            <MenuItem
                                                color="teal.600"
                                                onClick={() => handleModerateProperty('restore')}
                                                isDisabled={moderatingPropertyId === (selectedProperty?._id || selectedProperty?.id)}
                                            >
                                                Restore property
                                            </MenuItem>
                                            <MenuItem
                                                color="red.500"
                                                onClick={() => handleModerateProperty('delete')}
                                                isDisabled={moderatingPropertyId === (selectedProperty?._id || selectedProperty?.id)}
                                            >
                                                Delete property
                                            </MenuItem>
                                            <MenuDivider />
                                            {statusOptions.map((status) => (
                                                <MenuItem
                                                    key={status.value}
                                                    onClick={() => handleModerateProperty( status.value)}
                                                    isDisabled={updatingStatusId === (selectedProperty?._id || selectedProperty?.id)}
                                                >
                                                    Set: {status.label}
                                                </MenuItem>
                                            ))}
                                        </MenuList>
                                    </Menu>

                                    <Box>
                                        <Text fontSize="sm" fontWeight="semibold" mb={2}>Reason</Text>
                                        <Textarea
                                            value={moderationReason}
                                            onChange={(e) => setModerationReason(e.target.value)}
                                            placeholder="Add a rejection reason if rejecting this property"
                                            minH="100px"
                                            resize="vertical"
                                        />
                                    </Box>
                                </VStack>

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
