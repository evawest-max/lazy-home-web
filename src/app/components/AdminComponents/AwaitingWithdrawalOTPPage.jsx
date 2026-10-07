import React, { useEffect, useState } from 'react';
import {
    Badge, Box, Button, Card, CardBody, CardHeader, Flex, Heading, Spinner, Table,
    TableContainer, Tbody, Td, Text, Th, Thead, Tr, VStack, HStack, useToast,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
    ModalCloseButton, Input, FormControl, FormLabel, useDisclosure, Select,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { getOtpRequiredWithdrawals, resendWithdrawalOTP, finalizeWithdrawalOTP, retryWithdrawalApproval } from '../../../../api';

const formatCurrency = (value) => {
    const numeric = Number((value?? 0));
    return Number.isFinite(numeric)? numeric.toLocaleString(undefined, { style: 'currency', currency: 'NGN' }) : '—';
};
const normalizeRows = (payload) => {
    const w = (payload?.withdrawals?? payload?.data?.withdrawals?? payload?.items?? payload?.data?? payload?? []);
    return Array.isArray(w)? w : [w];
};

export default function AwaitingWithdrawalOTPPage() {
    const navigate = useNavigate();
    const toast = useToast();
    const { isOpen: isFinalizeOpen, onOpen: onFinalizeOpen, onClose: onFinalizeClose } = useDisclosure();
    const { isOpen: isRetryOpen, onOpen: onRetryOpen, onClose: onRetryClose } = useDisclosure();
    const { isOpen: isResendOpen, onOpen: onResendOpen, onClose: onResendClose } = useDisclosure();

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selected, setSelected] = useState(null);
    const [retryRow, setRetryRow] = useState(null);
    const [resendRow, setResendRow] = useState(null);

    const [paystackOtp, setPaystackOtp] = useState('');
    const [authCode, setAuthCode] = useState('');
    const [retryAuthCode, setRetryAuthCode] = useState('');
    const [resendAuthCode, setResendAuthCode] = useState('');

    const [actionLoading, setActionLoading] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);

    const loadWithdrawals = async (pageNum = page, limitNum = limit) => {
        try {
            setLoading(true);
            setError('');
            const res = await getOtpRequiredWithdrawals({ page: pageNum, limit: limitNum });
            const payload = res?.data?.data?? res?.data?? res?? {};
            const normalized = normalizeRows(payload);
            setRows(normalized.map((item, index) => ({
                id: item?._id?? item?.id?? index,
                _id: item?._id?? '—',
                reference: item?.reference?? '—',
                amount: item?.amount?? 0,
                netAmount: item?.netAmount?? 0,
                fee: item?.fee?? 0,
                status: item?.status?? 'otp_required',
                transferCode: item?.transferCode?? item?.paystackTransferCode?? item?.paystackResponse?.transfer_code?? '—',
                otpResendCount: item?.otpResendCount?? 0,
                initiatedAt: item?.initiatedAt?? '—',
                user: item?.user?? {},
                settlementAccount: item?.settlementAccount?? {},
            })));
            const pag = payload?.pagination?? {};
            setTotal(pag.total?? normalized.length);
            setPages(pag.pages || Math.ceil((pag.total || 0) / limitNum) || 1);
            setPage(pag.page?? pageNum);
        } catch (err) {
            setRows([]);
            setError('Unable to load withdrawals awaiting transfer OTP.');
        } finally { setLoading(false); }
    };

    useEffect(() => { loadWithdrawals(page, limit); }, [page, limit]);

    // --- RESEND MODAL FLOW ---
    const openResendModal = (row) => {
        setResendRow(row);
        setResendAuthCode('');
        onResendOpen();
    };
    const handleResendConfirm = async () => {
        if (!resendAuthCode) {
            toast({ title: 'Enter Authenticator code', status: 'warning' });
            return;
        }
        setIsSubmitting(true);
        try {
            setActionLoading(resendRow._id + '_resend');
            await resendWithdrawalOTP(resendRow._id, resendAuthCode, "transfer");
            toast({ title: 'New OTP sent', status: 'success', position: 'top-right' });
            onResendClose();
            loadWithdrawals();
        } catch (err) {
            const msg = err.response?.data?.message;
            toast({ title: 'Resend failed', description: typeof msg === 'string'? msg : err.message, status: 'error' });
        } finally {
            setActionLoading('');
            setIsSubmitting(false);
        }
    };

    // --- RETRY MODAL FLOW ---
    const openRetryModal = (row) => {
        setRetryRow(row);
        setRetryAuthCode('');
        onRetryOpen();
    };
    const handleRetryConfirm = async () => {
        if (!retryAuthCode) {
            toast({ title: 'Enter Authenticator code', status: 'warning' });
            return;
        }
        setIsSubmitting(true);
        try {
            setActionLoading(retryRow._id + '_retry');
            const res = await retryWithdrawalApproval(retryRow._id, retryAuthCode);
            toast({ title: 'Retry initiated', description: String(res?.data?.message || 'New transfer created'), status: 'success', position: 'top-right' });
            onRetryClose();
            loadWithdrawals();
        } catch (err) {
            const msg = err.response?.data?.message;
            toast({ title: 'Retry failed', description: typeof msg === 'string'? msg : err.message, status: 'error' });
        } finally {
            setActionLoading('');
            setIsSubmitting(false);
        }
    };

    const openFinalizeModal = (row) => {
        setSelected(row);
        setPaystackOtp('');
        setAuthCode('');
        onFinalizeOpen();
    };
    const handleFinalize = async () => {
        if (!paystackOtp ||!authCode) {
            toast({ title: 'Enter Paystack OTP and Authenticator code', status: 'warning' });
            return;
        }
        setIsSubmitting(true);
        try {
            setActionLoading(selected._id + '_finalize');
            await finalizeWithdrawalOTP(selected._id, paystackOtp, authCode);
            toast({ title: 'Withdrawal approved', status: 'success', position: 'top-right' });
            onFinalizeClose();
            loadWithdrawals();
        } catch (err) {
            toast({ title: 'Finalize failed', description: err.response?.data?.message || 'Invalid OTP', status: 'error' });
        } finally {
            setActionLoading('');
            setIsSubmitting(false);
        }
    };

    const emptyState =!loading && rows.length === 0 &&!error;

    return (
        <Box p={6} bg="brand.background" minH="100vh">
            <VStack spacing={5} align="stretch">
                <Flex justify="space-between" align="center" gap={4} wrap="wrap">
                    <Heading size="lg" color="teal.600">Awaiting Withdrawal Transfer OTP</Heading>
                    <Button size="sm" variant="outline" onClick={() => navigate('/financial-dashboard')}>Back to dashboard</Button>
                </Flex>

                <Card shadow="md" borderRadius="lg">
                    <CardHeader>
                        <Flex justify="space-between" align="center">
                            <Heading size="sm">Withdrawals ({total})</Heading>
                            <HStack>
                                <Text fontSize="sm">Rows:</Text>
                                <Select size="sm" w="80px" value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </Select>
                            </HStack>
                        </Flex>
                    </CardHeader>
                    <CardBody>
                        {loading? <Flex justify="center" py={10}><Spinner /></Flex> : error? <Text color="red.500">{error}</Text> : emptyState? <Text>No withdrawals awaiting OTP.</Text> : (
                            <>
                                <TableContainer>
                                    <Table variant="simple" size="sm">
                                        <Thead>
                                            <Tr>
                                                <Th>Ref</Th><Th>User</Th><Th>Net Amount</Th><Th>Status</Th><Th>Transfer Code</Th><Th>Initiated</Th><Th>Resent</Th><Th>Settlement</Th><Th>Actions</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {rows.map((row) => {
                                                const isAbandoned = row.status === 'abandoned';
                                                return (
                                                    <Tr key={row.id}>
                                                        <Td fontWeight="bold">{row.reference}</Td>
                                                        <Td><Text>{row.settlementAccount?.accountName}</Text><Text fontSize="xs" color="gray.500">{row.user?.email}</Text></Td>
                                                        <Td>{formatCurrency(row.netAmount / 100)}</Td>
                                                        <Td><Badge colorScheme={isAbandoned? 'red' : 'orange'}>{row.status}</Badge></Td>
                                                        <Td fontSize="xs">{row.transferCode}</Td>
                                                        <Td fontSize="xs">{row.initiatedAt!== '—'? new Date(row.initiatedAt).toLocaleString() : '—'}</Td>
                                                        <Td><Badge>{row.otpResendCount}x</Badge></Td>
                                                        <Td><Text fontSize="xs">{row.settlementAccount?.accountName}</Text></Td>
                                                        <Td>
                                                            <HStack spacing={2}>
                                                                {isAbandoned? (
                                                                    <Button size="xs" colorScheme="red" isLoading={actionLoading === row._id + '_retry'} onClick={() => openRetryModal(row)}>Retry</Button>
                                                                ) : (
                                                                    <Button size="xs" colorScheme="teal" isLoading={actionLoading === row._id + '_finalize'} onClick={() => openFinalizeModal(row)}>Approve</Button>
                                                                )}
                                                                <Button size="xs" variant="outline" colorScheme="yellow" isLoading={actionLoading === row._id + '_resend'} onClick={() => openResendModal(row)}>Resend OTP</Button>
                                                            </HStack>
                                                        </Td>
                                                    </Tr>
                                                );
                                            })}
                                        </Tbody>
                                    </Table>
                                </TableContainer>
                                <Flex justify="space-between" align="center" mt={6}><Text fontSize="sm">Page {page} of {pages}</Text><HStack><Button size="sm" isDisabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</Button><Button size="sm" isDisabled={page >= pages} onClick={() => setPage(p => p + 1)}>Next</Button></HStack></Flex>
                            </>
                        )}
                    </CardBody>
                </Card>
            </VStack>

            {/* Finalize Modal */}
            <Modal isOpen={isFinalizeOpen} onClose={onFinalizeClose}>
                <ModalOverlay /><ModalContent><ModalHeader>Finalize {selected?.reference}</ModalHeader><ModalCloseButton />
                    <ModalBody><VStack spacing={4}><FormControl><FormLabel>Paystack OTP</FormLabel><Input value={paystackOtp} onChange={e => setPaystackOtp(e.target.value)} placeholder="From SMS/Email" /></FormControl><FormControl><FormLabel>Authenticator Code</FormLabel><Input value={authCode} onChange={e => setAuthCode(e.target.value)} placeholder="6-digit" /></FormControl></VStack></ModalBody>
                    <ModalFooter><Button variant="ghost" mr={3} onClick={onFinalizeClose}>Cancel</Button><Button isLoading={isSubmitting} colorScheme="teal" onClick={handleFinalize}>Confirm & Transfer</Button></ModalFooter>
                </ModalContent>
            </Modal>

            {/* Resend Modal */}
            <Modal isOpen={isResendOpen} onClose={onResendClose} isCentered>
                <ModalOverlay /><ModalContent><ModalHeader>Resend OTP {resendRow?.reference}</ModalHeader><ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <Text fontSize="sm">A new Paystack OTP will be sent to the authorized email/SMS.</Text>
                            <FormControl><FormLabel>Authenticator Code</FormLabel><Input value={resendAuthCode} onChange={e => setResendAuthCode(e.target.value)} placeholder="6-digit code" autoFocus /></FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter><Button variant="ghost" mr={3} onClick={onResendClose}>Cancel</Button><Button colorScheme="yellow" isLoading={isSubmitting} isDisabled={!resendAuthCode} onClick={handleResendConfirm}>Resend OTP</Button></ModalFooter>
                </ModalContent>
            </Modal>

            {/* Retry Modal */}
            <Modal isOpen={isRetryOpen} onClose={onRetryClose} isCentered>
                <ModalOverlay /><ModalContent><ModalHeader>Retry Withdrawal {retryRow?.reference}</ModalHeader><ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <Text fontSize="sm" color="gray.600">This withdrawal is <Badge colorScheme="red">abandoned</Badge>. This will create a new Paystack transfer.</Text>
                            <Box p={3} bg="gray.50" borderRadius="md"><Text fontSize="sm">Amount: <b>{formatCurrency(retryRow?.netAmount / 100)}</b></Text><Text fontSize="xs" color="gray.500">Old Ref: {retryRow?.reference}</Text></Box>
                            <FormControl><FormLabel>Authenticator Code</FormLabel><Input value={retryAuthCode} onChange={e => setRetryAuthCode(e.target.value)} placeholder="6-digit code" /></FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter><Button variant="ghost" mr={3} onClick={onRetryClose}>Cancel</Button><Button colorScheme="red" isLoading={isSubmitting} isDisabled={!retryAuthCode} onClick={handleRetryConfirm}>Retry Transfer</Button></ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}