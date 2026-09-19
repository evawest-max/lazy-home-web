import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Button, Card, CardBody, CardHeader, Divider, Flex, Heading, HStack, Image, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, SimpleGrid, Spinner, Stat, StatLabel, StatNumber, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr, VStack, Badge, useToast, Textarea, Select, Tabs, TabList, TabPanels, Tab, TabPanel, Code,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import { getAllVerifications, getVerificationDetails, reviewVerification, getAuditLogs } from '../../../../api';

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-NG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const getStatusColor = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'approved': return 'green';
    case 'rejected': return 'red';
    case 'pending': return 'orange';
    default: return 'gray';
  }
};

export default function AdminUserVerificationPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [verifications, setVerifications] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, pages: 1 });
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [reviewReason, setReviewReason] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [emailFilter, setEmailFilter] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditPagination, setAuditPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [auditTab, setAuditTab] = useState(0);

  const fetchVerifications = async (page = currentPage, limit = pageSize) => {
    setLoading(true); setError('');
    try {
      const params = {};
      if (selectedStatus!== 'all') params.status = selectedStatus;
      if (selectedType!== 'all') params.verificationType = selectedType;
      if (emailFilter) params.search = emailFilter;
      params.page = page; params.limit = limit;

      const res = await getAllVerifications(params);
      const payload = res?.data?.data?? res?.data?? res?? {};
      const list = Array.isArray(payload?.verifications)? payload.verifications : [];
      const pageInfo = payload?.pagination?? { total: list.length, page: 1, limit: 20, pages: 1 };
      setVerifications(list);
      setPagination({ total: Number(pageInfo.total?? list.length), page: Number(pageInfo.page?? 1), limit: Number(pageInfo.limit?? 20), pages: Number(pageInfo.pages?? 1) });
      setStats(payload?.stats?? { total: list.length, pending: list.filter(i => i?.verificationStatus?.toLowerCase() === 'pending').length, approved: list.filter(i => i?.verificationStatus?.toLowerCase() === 'approved').length, rejected: list.filter(i => i?.verificationStatus?.toLowerCase() === 'rejected').length });
    } catch (err) { setError('Unable to load verifications.'); } finally { setLoading(false); }
  };

  const fetchAuditLogs = async (page = 1) => {
    setAuditLoading(true);
    try {
      const res = await getAuditLogs({ action: 'VERIFICATION', page, limit: 20, targetType: 'Verification' });
      const payload = res?.data?.data?? res?.data?? {};
      setAuditLogs(payload?.logs || []);
      setAuditPagination(payload?.pagination || { total: 0, page: 1, pages: 1 });
    } catch (e) { console.error(e); } finally { setAuditLoading(false); }
  };

  const goToVerificationPage = async (nextPage) => {
    const targetPage = Math.max(1, Number(nextPage) || 1);
    setCurrentPage(targetPage);
    await fetchVerifications(targetPage, pageSize);
  };

  const changeVerificationPageSize = async (nextLimit) => {
    const safeLimit = Number(nextLimit) || 10;
    setPageSize(safeLimit);
    setCurrentPage(1);
    await fetchVerifications(1, safeLimit);
  };

  useEffect(() => { fetchVerifications(); }, [selectedStatus, selectedType, currentPage, pageSize]);
  useEffect(() => { if (auditTab === 1) fetchAuditLogs(); }, [auditTab]);

  // debounce email filter
  useEffect(() => {
    const t = setTimeout(() => { setCurrentPage(1); fetchVerifications(); }, 600);
    return () => clearTimeout(t);
  }, [emailFilter]);

  const openVerificationDetails = async (verification) => {
    if (!verification?._id) return;
    setDetailLoading(true); setIsDetailOpen(true); setSelectedVerification(null); setReviewReason('');
    try {
      const res = await getVerificationDetails(verification._id);
      const payload = res?.data?.data?? res?.data?? res?? {};
      setSelectedVerification(payload?.verification?? payload?.data?? payload?? verification);
    } catch (err) { setSelectedVerification(verification); } finally { setDetailLoading(false); }
  };

  const handleReviewAction = async (status) => {
    if (!selectedVerification?._id) return;
    const reason = reviewReason.trim() || (status === 'approved'? 'Approved by admin review' : 'Rejected by admin review');
    if (status === 'rejected' &&!reviewReason.trim()) { toast({ title: 'Reason required for rejection', status: 'warning' }); return; }
    setReviewLoading(true);
    try {
      await reviewVerification(selectedVerification._id, status, reason);
      setVerifications(prev => prev.map(item => item._id === selectedVerification._id? {...item, verificationStatus: status, reviewedAt: new Date(), reviewedBy: { fullName: 'You' } } : item));
      toast({ title: `Verification ${status}`, status: 'success' });
      setIsDetailOpen(false);
      fetchVerifications();
    } catch (err) { toast({ title: 'Review failed', description: err?.response?.data?.message, status: 'error' }); } finally { setReviewLoading(false); }
  };

  const summaryCards = useMemo(() => [
    { label: 'Total', value: stats.total, accent: 'blue' },
    { label: 'Pending', value: stats.pending, accent: 'orange' },
    { label: 'Approved', value: stats.approved, accent: 'green' },
    { label: 'Rejected', value: stats.rejected, accent: 'red' },
  ], [stats]);

  return (
    <Box p={6} bg="brand.background" minH="100vh" pb={40}>
      <VStack spacing={6} align="stretch">
        <Flex justify="space-between" align="center" flexWrap="wrap">
          <Box><Heading size="lg" color="teal.600">User Verifications</Heading><Text color="gray.600">Review liveness + audit logs</Text></Box>
          <HStack><Button variant="outline" onClick={() => navigate('/user-management')}>Back</Button><Button colorScheme="teal" onClick={fetchVerifications} isLoading={loading}>Refresh</Button></HStack>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
          {summaryCards.map(c => (<Card key={c.label} borderLeft="4px solid" borderLeftColor={`${c.accent}.500`} shadow="sm"><CardBody><Stat><StatLabel>{c.label}</StatLabel><StatNumber>{c.value}</StatNumber></Stat></CardBody></Card>))}
        </SimpleGrid>

        <Card shadow="md">
          <Tabs onChange={(i) => setAuditTab(i)}>
            <CardHeader>
              <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
                <TabList><Tab>Verification Queue</Tab><Tab>Audit Logs</Tab></TabList>
                {auditTab === 0 && (
                  <HStack>
                    <Input placeholder="Filter by email" value={emailFilter} onChange={e => setEmailFilter(e.target.value)} maxW="220px" size="sm" />
                    <Select size="sm" value={selectedType} onChange={e => setSelectedType(e.target.value)} w="120px"><option value="all">All Types</option><option value="nin">NIN</option><option value="bvn">BVN</option><option value="selfie">Selfie</option></Select>
                    <Select size="sm" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} w="120px"><option value="all">All Status</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></Select>
                  </HStack>
                )}
              </Flex>
            </CardHeader>
            <CardBody>
              <TabPanels>
                <TabPanel p={0}>
                  {loading? <Flex justify="center" py={12}><Spinner /></Flex> : verifications.length === 0? <Text>No verifications.</Text> : (
                    <>
                      <TableContainer>
                        <Table variant="simple" size="sm">
                          <Thead><Tr><Th>User</Th><Th>Type</Th><Th>Confidence</Th><Th>Liveness</Th><Th>Status</Th><Th>Reviewed</Th><Th>Date</Th><Th>Action</Th></Tr></Thead>
                          <Tbody>
                            {verifications.map(v => (
                              <Tr key={v._id}>
                                <Td><VStack align="start" spacing={0}><Text fontWeight="bold">{v?.userId?.fullName || 'Unknown'}</Text><Text fontSize="xs" color="gray.500">{v?.userId?.email}</Text></VStack></Td>
                                <Td><Badge colorScheme="blue">{v?.verificationType}</Badge></Td>
                                <Td><Badge colorScheme={v?.livenessData?.confidence >= 90? 'green' : v?.livenessData?.confidence >= 80? 'yellow' : 'red'}>{v?.livenessData?.confidence? `${v.livenessData.confidence}%` : '—'}</Badge></Td>
                                <Td><Badge colorScheme={v?.livenessStatus === 'passed'? 'green' : 'red'}>{v?.livenessStatus}</Badge></Td>
                                <Td><Badge colorScheme={getStatusColor(v?.verificationStatus)}>{v?.verificationStatus}</Badge></Td>
                                <Td><Text fontSize="xs">{v?.reviewedBy?.fullName || '—'}</Text><Text fontSize="xs" color="gray.500">{v?.reviewedAt? formatDate(v.reviewedAt) : ''}</Text></Td>
                                <Td>{formatDate(v?.createdAt)}</Td>
                                <Td><Button size="xs" onClick={() => openVerificationDetails(v)}>View</Button></Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                      <Flex mt={4} justify="space-between"><Text fontSize="sm">Page {pagination.page} of {pagination.pages} — {pagination.total} total</Text><HStack><Button size="sm" isDisabled={currentPage <= 1} onClick={() => goToVerificationPage(currentPage - 1)}>Prev</Button><Button size="sm" isDisabled={currentPage >= pagination.pages} onClick={() => goToVerificationPage(currentPage + 1)}>Next</Button></HStack></Flex>
                    </>
                  )}
                </TabPanel>
                <TabPanel p={0}>
                  {auditLoading? <Flex justify="center" py={10}><Spinner /></Flex> : (
                    <TableContainer>
                      <Table size="sm"><Thead><Tr><Th>Date</Th><Th>Admin</Th><Th>Action</Th><Th>Type</Th><Th>User</Th><Th>Reason</Th></Tr></Thead>
                        <Tbody>
                          {auditLogs.map(log => (
                            <Tr key={log._id}>
                              <Td fontSize="xs">{formatDate(log.createdAt)}</Td>
                              <Td><Text fontSize="sm" fontWeight="600">{log.admin?.fullName}</Text><Text fontSize="xs" color="gray.500">{log.admin?.email}</Text></Td>
                              <Td><Badge colorScheme={log.action.includes('APPROVED')? 'green' : 'red'}>{log.action}</Badge></Td>
                              <Td><Badge>{log.metadata?.verificationType}</Badge></Td>
                              <Td fontSize="xs">{log.metadata?.userEmail}</Td>
                              <Td fontSize="xs" maxW="200px" isTruncated>{log.metadata?.reason || '—'}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  )}
                </TabPanel>
              </TabPanels>
            </CardBody>
          </Tabs>
        </Card>
      </VStack>

      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} size="xl">
        <ModalOverlay /><ModalContent maxH="90vh" overflowY="auto">
          <ModalHeader>{selectedVerification?.userId?.fullName || 'Details'}</ModalHeader><ModalCloseButton />
          <ModalBody pb={6}>
            {detailLoading? <Flex justify="center" py={10}><Spinner /></Flex> :!selectedVerification? <Text>No data</Text> : (
              <VStack align="stretch" spacing={5}>
                <Box borderWidth="1px" p={4} borderRadius="md">
                  <SimpleGrid columns={2} spacing={3}>
                    <Box><Text fontSize="xs" color="gray.500">User</Text><Text fontWeight="bold">{selectedVerification?.userId?.fullName}</Text><Text fontSize="xs">{selectedVerification?.userId?.email}</Text></Box>
                    <Box><Text fontSize="xs" color="gray.500">Type</Text><Badge colorScheme="blue">{selectedVerification?.verificationType}</Badge></Box>
                    <Box><Text fontSize="xs" color="gray.500">NIN/BVN</Text><Text>{selectedVerification?.nin || selectedVerification?.bvn || '—'}</Text></Box>
                    <Box><Text fontSize="xs" color="gray.500">Status</Text><Badge colorScheme={getStatusColor(selectedVerification?.verificationStatus)}>{selectedVerification?.verificationStatus}</Badge></Box>
                    <Box><Text fontSize="xs" color="gray.500">Liveness</Text><Badge colorScheme={selectedVerification?.livenessStatus === 'passed'? 'green' : 'red'}>{selectedVerification?.livenessStatus} - {selectedVerification?.livenessData?.confidence}%</Badge></Box>
                    <Box><Text fontSize="xs" color="gray.500">Provider</Text><Text fontSize="xs">{selectedVerification?.livenessData?.provider} {selectedVerification?.livenessData?.providerResponse?.mock? '(mock)' : ''}</Text></Box>
                    <Box><Text fontSize="xs" color="gray.500">Reviewed By</Text><Text fontSize="sm">{selectedVerification?.reviewedBy?.fullName || 'Not yet'}</Text></Box>
                    <Box><Text fontSize="xs" color="gray.500">Submitted</Text><Text fontSize="xs">{formatDate(selectedVerification?.createdAt)}</Text></Box>
                  </SimpleGrid>
                  <Divider my={3} />
                  <Text fontSize="xs" color="gray.500">Liveness Checks</Text>
                  <HStack mt={2}>{Object.entries(selectedVerification?.livenessData?.checks || {}).map(([k, v]) => (<Badge key={k} colorScheme={v? 'green' : 'red'}>{k}: {v? '✓' : '✗'}</Badge>))}</HStack>
                  {selectedVerification?.livenessData?.providerResponse && <Box mt={3}><Text fontSize="xs" color="gray.500">Raw Provider Response</Text><Code fontSize="10px" p={2} display="block" whiteSpace="pre-wrap" maxH="120px" overflowY="auto">{JSON.stringify(selectedVerification.livenessData.providerResponse, null, 2)}</Code></Box>}
                </Box>

                <SimpleGrid columns={2} spacing={4}>
                  <Box><Text fontSize="xs" mb={2}>Selfie</Text>{selectedVerification?.selfieImage?.url? <Image src={selectedVerification.selfieImage.url} borderRadius="md" h="220px" objectFit="cover" /> : <Text>No image</Text>}</Box>
                  <Box><Text fontSize="xs" mb={2}>Document</Text>{selectedVerification?.documentImage?.url? <Image src={selectedVerification.documentImage.url} borderRadius="md" h="220px" objectFit="cover" /> : <Text>No image</Text>}</Box>
                </SimpleGrid>

                <Box borderWidth="1px" p={4} borderRadius="md">
                  <Heading size="sm" mb={3}>Admin Review</Heading>
                  <Textarea value={reviewReason} onChange={e => setReviewReason(e.target.value)} placeholder={selectedVerification?.verificationStatus!== 'pending'? 'Already reviewed - add note if re-reviewing' : 'Reason for approve/reject (required for rejection)'} />
                  <HStack mt={4}><Button colorScheme="green" isLoading={reviewLoading} onClick={() => handleReviewAction('approved')}>Approve</Button><Button colorScheme="red" variant="outline" isLoading={reviewLoading} onClick={() => handleReviewAction('rejected')}>Reject</Button></HStack>
                  {selectedVerification?.rejectionReason && <Box mt={3} p={2} bg="red.50" borderRadius="md"><Text fontSize="xs" color="red.600">Previous rejection: {selectedVerification.rejectionReason}</Text></Box>}
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