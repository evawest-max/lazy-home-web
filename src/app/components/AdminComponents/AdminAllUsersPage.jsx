import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  Badge,
  Select,
  useToast,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import { getAllUsers, getUserDetails, suspendUser, unSuspendUser } from '../../../../api';

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
};

const formatRole = (role) => (role ? String(role).replace(/_/g, ' ') : 'user');

const getUserStatusColor = (user) => {
  if (user?.isSuspended) return 'red';
  if (user?.walletStatus === 'frozen') return 'orange';
  return 'green';
};

const getVerificationColor = (level = 'basic') => {
  switch ((level || '').toLowerCase()) {
    case 'verified':
      return 'green';
    case 'basic':
      return 'yellow';
    case 'pending':
      return 'orange';
    default:
      return 'gray';
  }
};

export default function AdminAllUsersPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [userLookup, setUserLookup] = useState('');
  const [userLookupLoading, setUserLookupLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await getAllUsers();
      const payload = res?.data?.data ?? res?.data ?? res ?? {};
      const userList = Array.isArray(payload?.users) ? payload.users : [];
      const pageInfo = payload?.pagination ?? {
        total: userList.length,
        page: 1,
        limit: userList.length || 10,
        pages: 1,
      };

      setUsers(userList);
      setPagination({
        total: Number(pageInfo.total ?? userList.length),
        page: Number(pageInfo.page ?? 1),
        limit: Number(pageInfo.limit ?? 10),
        pages: Number(pageInfo.pages ?? 1),
      });
    } catch (err) {
      console.error('Failed to load all users', err);
      setError('Unable to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filterDefinitions = [
    { id: 'all', label: 'All', match: () => true },
    { id: 'unverified', label: 'Unverified', match: (user) => (user?.verification?.verificationLevel || '').toLowerCase() === 'unverified' },
    { id: 'basic', label: 'Basic', match: (user) => (user?.verification?.verificationLevel || '').toLowerCase() === 'basic' },
    { id: 'verified', label: 'Verified', match: (user) => (user?.verification?.verificationLevel || '').toLowerCase() === 'verified' },
    { id: 'role_user', label: 'User', match: (user) => (user?.role || '').toLowerCase() === 'user' },
    { id: 'role_admin', label: 'Admin', match: (user) => (user?.role || '').toLowerCase() === 'admin' },
    { id: 'role_moderator', label: 'Moderator', match: (user) => (user?.role || '').toLowerCase() === 'moderator' },
    { id: 'role_super_admin', label: 'Super Admin', match: (user) => (user?.role || '').toLowerCase() === 'super_admin' },
    { id: 'active', label: 'Active', match: (user) => user?.isSuspended === false },
    { id: 'suspended', label: 'Suspended', match: (user) => user?.isSuspended === true },
  ];

  const filterCounts = useMemo(() => {
    return filterDefinitions.reduce((acc, filter) => {
      acc[filter.id] = users.filter((user) => filter.match(user)).length;
      return acc;
    }, {});
  }, [users]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    const activeFilter = filterDefinitions.find((filter) => filter.id === selectedFilter) || filterDefinitions[0];

    return users.filter((user) => {
      const matchesFilter = activeFilter.match(user);
      const haystack = [
        user?.fullName,
        user?.email,
        user?.phone,
        user?.role,
        user?.verification?.verificationLevel,
      ].filter(Boolean).join(' ').toLowerCase();

      const matchesSearch = !query || haystack.includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [users, search, selectedFilter]);

  const handleUserAction = (action, user) => {
    toast({
      title: `${action} action`,
      description: `${action} queued for ${user?.fullName || user?.email || 'this user'}.`,
      status: 'info',
      duration: 2500,
      isClosable: true,
    });
  };

  const handleSuspendUser = async (user) => {
    if (!user?._id) return;

    try {
      const reason = 'Admin suspended this user';
      await suspendUser(user._id, reason);

      setUsers((prevUsers) =>
        prevUsers.map((item) =>
          item._id === user._id
            ? { ...item, isSuspended: true, suspensionReason: reason }
            : item
        )
      );

      toast({
        title: 'User suspended',
        description: `${user?.fullName || user?.email || 'This user'} has been suspended.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Failed to suspend user', err);
      toast({
        title: 'Suspend failed',
        description: err?.response?.data?.message || 'Unable to suspend this user.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleUnsuspendUser = async (user) => {
    if (!user?._id) return;

    try {
      const reason = 'Admin unsuspended this user';
      await unSuspendUser(user._id, reason);

      setUsers((prevUsers) =>
        prevUsers.map((item) =>
          item._id === user._id
            ? { ...item, isSuspended: false, suspensionReason: '' }
            : item
        )
      );

      toast({
        title: 'User unsuspended',
        description: `${user?.fullName || user?.email || 'This user'} is now active again.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Failed to unsuspend user', err);
      toast({
        title: 'Unsuspend failed',
        description: err?.response?.data?.message || 'Unable to unsuspend this user.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const loadUserDetailsByIdentifier = async (identifier) => {
    const query = (identifier ?? userLookup).trim();

    if (!query) {
      toast({
        title: 'Enter a user ID or email',
        status: 'warning',
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    setUserLookupLoading(true);
    setIsDetailModalOpen(true);
    setDetailLoading(true);
    setSelectedUserDetails(null);

    try {
      const res = await getUserDetails(query);
      const payload = res?.data?.data ?? res?.data ?? res ?? {};
      setSelectedUserDetails({
        user: payload?.user ?? null,
        stats: payload?.stats ?? {},
      });
    } catch (err) {
      console.error('Failed to fetch user details', err);
      toast({
        title: 'Unable to load user details',
        description: err?.response?.data?.message || 'No user was found for that ID or email.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      setIsDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
      setUserLookupLoading(false);
    }
  };

  const handleViewUser = async (user) => {
    if (!user?._id) return;
    await loadUserDetailsByIdentifier(user._id);
  };

  const closeUserDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedUserDetails(null);
    setDetailLoading(false);
  };

  return (
    <Box p={6} bg="brand.background" minH="100vh" pb={40}>
      <VStack spacing={6} align="stretch">
        <Flex justify="space-between" align="center" gap={4} flexWrap="wrap">
          <Box>
            <Heading size="lg" color="teal.600">All Users</Heading>
            <Text color="gray.600">Monitor users, status, verification level, and admin actions.</Text>
          </Box>

          <HStack>
            <Button variant="outline" onClick={() => navigate('/user-management')}>
              Back
            </Button>
            <Button colorScheme="teal" onClick={fetchUsers} isLoading={loading}>
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
            <Heading size="md">User Lookup</Heading>
          </CardHeader>
          <CardBody>
            <Flex gap={3} wrap="wrap" align="center">
              <Input
                placeholder="Enter User ID or Email"
                value={userLookup}
                onChange={(e) => setUserLookup(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') loadUserDetailsByIdentifier();
                }}
                maxW="420px"
              />
              <Button colorScheme="teal" onClick={() => loadUserDetailsByIdentifier()} isLoading={userLookupLoading}>
                View User
              </Button>
              <Button variant="outline" onClick={() => setUserLookup('')}>
                Clear
              </Button>
            </Flex>
          </CardBody>
        </Card>

        <Card shadow="md">
          <CardHeader>
            <Flex justify="space-between" align="center" gap={3} flexWrap="wrap">
              <Heading size="md">User Directory</Heading>
              <Input
                placeholder="Search by name, email, phone or role"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                maxW="420px"
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
            ) : filteredUsers.length === 0 ? (
              <Text color="gray.500">No users found.</Text>
            ) : (
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>User</Th>
                      <Th>Role</Th>
                      <Th>Verification</Th>
                      <Th>Status</Th>
                      <Th>Wallet</Th>
                      <Th>Created</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredUsers.map((user) => (
                      <Tr key={user._id}>
                        <Td>
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="bold">{user.fullName || 'Unknown User'}</Text>
                            <Text fontSize="xs" color="gray.500">{user.email || 'No email'}</Text>
                            <Text fontSize="xs" color="gray.500">{user.phone || 'No phone'}</Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Badge colorScheme="blue" textTransform="capitalize">{formatRole(user.role)}</Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme={getVerificationColor(user?.verification?.verificationLevel)}>
                            {user?.verification?.verificationLevel || 'basic'}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme={getUserStatusColor(user)}>
                            {user?.isSuspended ? 'suspended' : user?.walletStatus || 'active'}
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontWeight="semibold">{user.walletStatus || 'active'}</Text>
                          <Text fontSize="xs" color="gray.500">Strikes: {user.strikes ?? 0}</Text>
                        </Td>
                        <Td>{formatDate(user.createdAt)}</Td>
                        <Td>
                          <Menu>
                            <MenuButton as={Button} size="sm" variant="outline" colorScheme="gray" rightIcon={<ChevronDown size={14} />}>
                              Actions
                            </MenuButton>
                            <MenuList>
                              <MenuItem onClick={() => handleViewUser(user)}>View</MenuItem>
                              {/* <MenuItem onClick={() => handleUserAction('Wallet', user)}>Wallet</MenuItem> */}
                              {/* <MenuItem onClick={() => handleUserAction('Edit', user)}>Edit</MenuItem> */}
                              {user?.isSuspended ? (
                                <MenuItem onClick={() => handleUnsuspendUser(user)}>Unsuspend</MenuItem>
                              ) : (
                                <MenuItem onClick={() => handleSuspendUser(user)}>Suspend</MenuItem>
                              )}
                            </MenuList>
                          </Menu>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}

            <Flex mt={5} justify="space-between" align="center" gap={3} flexWrap="wrap">
              <Text fontSize="sm" color="gray.600">
                Showing {filteredUsers.length} of {pagination.total} users
              </Text>

              <HStack>
                <Select
                  size="sm"
                  w="100px"
                  value={pagination.limit}
                  onChange={(e) => {
                    const nextLimit = Number(e.target.value);
                    setPagination((prev) => ({ ...prev, limit: nextLimit }));
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </Select>
                <Button size="sm" variant="outline" onClick={() => fetchUsers()}>
                  Prev
                </Button>
                <Button size="sm" variant="outline" onClick={() => fetchUsers()}>
                  Next
                </Button>
              </HStack>
            </Flex>
          </CardBody>
        </Card>
      </VStack>

      <Modal isOpen={isDetailModalOpen} onClose={closeUserDetailModal} size="xl">
        <ModalOverlay />
        <ModalContent maxH="85vh" overflowY="auto">
          <ModalHeader>
            {selectedUserDetails?.user?.fullName || 'User details'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {detailLoading ? (
              <Flex justify="center" py={10}><Spinner /></Flex>
            ) : !selectedUserDetails?.user ? (
              <Text color="gray.500">No user details available.</Text>
            ) : (
              <VStack align="stretch" spacing={5}>
                <Flex justify="flex-end" mt={1}>
                  <Menu>
                    <MenuButton as={Button} size="sm" variant="outline" colorScheme="gray" rightIcon={<ChevronDown size={14} />}>
                      Actions
                    </MenuButton>
                    <MenuList>
                      <MenuItem onClick={() => handleViewUser(selectedUserDetails?.user)}>View</MenuItem>
                      <MenuItem onClick={() => handleUserAction('Wallet', selectedUserDetails?.user)}>Wallet</MenuItem>
                      <MenuItem onClick={() => handleUserAction('Edit', selectedUserDetails?.user)}>Edit</MenuItem>
                      {selectedUserDetails?.user?.isSuspended ? (
                        <MenuItem onClick={() => handleUnsuspendUser(selectedUserDetails?.user)}>Unsuspend</MenuItem>
                      ) : (
                        <MenuItem onClick={() => handleSuspendUser(selectedUserDetails?.user)}>Suspend</MenuItem>
                      )}
                    </MenuList>
                  </Menu>
                </Flex>

                <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4}>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Full name</Text>
                      <Text fontWeight="bold">{selectedUserDetails.user.fullName || '—'}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Role</Text>
                      <Badge colorScheme="blue" textTransform="capitalize">{formatRole(selectedUserDetails.user.role)}</Badge>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Email</Text>
                      <Text>{selectedUserDetails.user.email || '—'}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Phone</Text>
                      <Text>{selectedUserDetails.user.phone || '—'}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Verification level</Text>
                      <Badge colorScheme={getVerificationColor(selectedUserDetails.user?.verification?.verificationLevel)}>
                        {selectedUserDetails.user?.verification?.verificationLevel || 'basic'}
                      </Badge>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Status</Text>
                      <Badge colorScheme={selectedUserDetails.user?.isSuspended ? 'red' : 'green'}>
                        {selectedUserDetails.user?.isSuspended ? 'suspended' : 'active'}
                      </Badge>
                    </Box>
                  </SimpleGrid>
                </Box>

                <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4}>
                  <Heading size="sm" mb={3}>Identity & Verification</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                    <Text><strong>NIN Verified:</strong> {selectedUserDetails.user?.verification?.ninVerified ? 'Yes' : 'No'}</Text>
                    <Text><strong>BVN Verified:</strong> {selectedUserDetails.user?.verification?.bvnVerified ? 'Yes' : 'No'}</Text>
                    <Text><strong>Selfie Verified:</strong> {selectedUserDetails.user?.verification?.selfieVerified ? 'Yes' : 'No'}</Text>
                    <Text><strong>Referral Code:</strong> {selectedUserDetails.user?.referralCode || '—'}</Text>
                    <Text><strong>Transfer Recipient:</strong> {selectedUserDetails.user?.transferRecipientCode || '—'}</Text>
                    <Text><strong>Referred By:</strong> {selectedUserDetails.user?.referredBy || '—'}</Text>
                  </SimpleGrid>
                </Box>

                <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4}>
                  <Heading size="sm" mb={3}>Capabilities</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                    {Object.entries(selectedUserDetails.user?.capabilities ?? {}).map(([key, value]) => (
                      <Badge key={key} colorScheme={value ? 'green' : 'gray'}>
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase())}: {value ? 'Yes' : 'No'}
                      </Badge>
                    ))}
                  </SimpleGrid>
                </Box>

                <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4}>
                  <Heading size="sm" mb={3}>Paystack</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                    <Text><strong>Customer Code:</strong> {selectedUserDetails.user?.paystack?.customerCode || '—'}</Text>
                    <Text><strong>Bank Name:</strong> {selectedUserDetails.user?.paystack?.bankName || '—'}</Text>
                    <Text><strong>Virtual Account:</strong> {selectedUserDetails.user?.paystack?.virtualAccountNumber || '—'}</Text>
                    <Text><strong>Suspension Reason:</strong> {selectedUserDetails.user?.suspensionReason || '—'}</Text>
                  </SimpleGrid>
                </Box>

                <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4}>
                  <Heading size="sm" mb={3}>Stats</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                    <Text><strong>Properties:</strong> {selectedUserDetails.stats?.propertyCount ?? 0}</Text>
                    <Text><strong>Tenancies:</strong> {selectedUserDetails.stats?.tenancyCount ?? 0}</Text>
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
