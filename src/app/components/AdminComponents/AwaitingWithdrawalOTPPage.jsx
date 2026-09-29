import React, { useEffect, useState } from 'react';
import {
    Badge,
    Box,
    Button,
    Card,
    CardBody,
    CardHeader,
    Flex,
    Heading,
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
    HStack,
    useToast,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Input,
    FormControl,
    FormLabel,
    useDisclosure,
    Select,
    IconButton,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { getOtpRequiredWithdrawals, resendWithdrawalOTP, finalizeWithdrawalOTP } from '../../../../api';

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
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selected, setSelected] = useState(null);
    const [paystackOtp, setPaystackOtp] = useState('');
    const [authCode, setAuthCode] = useState('');
    const [actionLoading, setActionLoading] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // pagination
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);

    const loadWithdrawals = async (pageNum = page, limitNum = limit) => {
        try {
            setLoading(true);
            setError('');
            const res = await getOtpRequiredWithdrawals({ page: pageNum, limit: limitNum });
            const payload = res?.data?.data ?? res?.data ?? res ?? {};
            console.log(payload)
            const normalized = normalizeRows(payload);

            setRows(
                normalized.map((item, index) => ({
                    id: item?._id ?? item?.id ?? index,
                    _id: item?._id ?? '—',
                    reference: item?.reference ?? '—',
                    amount: item?.amount ?? 0,
                    netAmount: item?.netAmount ?? 0,
                    fee: item?.fee ?? 0,
                    status: item?.status ?? 'otp_required',
                    transferCode: item?.transferCode ?? item?.paystackTransferCode ?? item?.paystackResponse?.transfer_code ?? '—',
                    otpResendCount: item?.otpResendCount ?? 0,
                    initiatedAt: item?.initiatedAt ?? '—',
                    user: item?.user ?? {},
                    settlementAccount: item?.settlementAccount ?? {},
                }))
            );

            // from your controller pagination
            const pag = payload?.pagination ?? {};
            setTotal(pag.total ?? normalized.length);
            setPages(
                pag.pages || Math.ceil((pag.total || 0) / limitNum) || 1);

            setPage(pag.page ?? pageNum);

        } catch (err) {
            console.error('Failed to load', err);
            setRows([]);
            setError('Unable to load withdrawals awaiting transfer OTP.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadWithdrawals(page, limit); }, [page, limit]);

    const handleResend = async (row) => {
        const code = prompt(`Enter Authenticator code to resend OTP for ${row.reference}:`);
        if (!code) return;
        const authenticatorCode = code;
        const reason = "transfer"
        try {
            setActionLoading(row._id + '_resend');
            await resendWithdrawalOTP(row._id, authenticatorCode, reason);
            toast({ title: 'New OTP sent', status: 'success', position: 'top-right' });
            loadWithdrawals();
        } catch (err) {
            toast({ title: 'Resend failed', description: err.response?.data?.message || err.message, status: 'error' });
        } finally { setActionLoading(''); }
    };

    const openFinalizeModal = (row) => {
        setSelected(row);
        setPaystackOtp('');
        setAuthCode('');
        onOpen();
    };

    const handleFinalize = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        console.log("clicked")
        if (!paystackOtp || !authCode) {
            toast({ title: 'Enter Paystack OTP and Authenticator code', status: 'warning' });
            return;
        }
        const otp = paystackOtp;
        const authenticatorCode = authCode;
        try {
            setActionLoading(selected._id + '_finalize');
            await finalizeWithdrawalOTP(selected._id, otp, authenticatorCode);
            toast({ title: 'Withdrawal approved', status: 'success', position: 'top-right' });
            onClose();
            loadWithdrawals();
        } catch (err) {
            toast({ title: 'Finalize failed', description: err.response?.data?.message || 'Invalid OTP', status: 'error' });
        } finally { setActionLoading(''); }
    };

    const emptyState = !loading && rows.length === 0 && !error;

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
                            <Heading size="sm">Withdrawals waiting for Paystack OTP ({total})</Heading>
                            <HStack>
                                <Text fontSize="sm">Rows:</Text>
                                <Select size="sm" w="80px" value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </Select>
                            </HStack>
                        </Flex>
                    </CardHeader>
                    <CardBody>
                        {loading ? <Flex justify="center" py={10}><Spinner /></Flex> : error ? <Text color="red.500">{error}</Text> : emptyState ? <Text>No withdrawals awaiting OTP.</Text> : (
                            <>
                                <TableContainer>
                                    <Table variant="simple" size="sm">
                                        <Thead>
                                            <Tr>
                                                <Th>Ref</Th>
                                                <Th>User</Th>
                                                <Th>Net Amount</Th>
                                                <Th>Status</Th>
                                                <Th>Transfer Code</Th>
                                                <Th>Initiated</Th>
                                                <Th>Resent</Th>
                                                <Th>Settlement</Th>
                                                <Th>Actions</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {rows.map((row) => (
                                                <Tr key={row.id}>
                                                    <Td fontWeight="bold">{row.reference}</Td>
                                                    <Td><Text>{`${row.settlementAccount?.accountName ?? ''}`.trim()}</Text><Text fontSize="xs" color="gray.500">{row.user?.email}</Text></Td>
                                                    <Td>{formatCurrency(row.netAmount / 100)}</Td>
                                                    <Td><Badge colorScheme="orange">{row.status}</Badge></Td>
                                                    <Td fontSize="xs">{row.transferCode}</Td>
                                                    <Td fontSize="xs">{row.initiatedAt !== '—' ? new Date(row.initiatedAt).toLocaleString() : '—'}</Td>
                                                    <Td><Badge>{row.otpResendCount}x</Badge></Td>
                                                    <Td><Text fontSize="xs">{row.settlementAccount?.accountName}</Text><Text fontSize="xs" color="gray.500">{row.settlementAccount?.accountNumber}</Text></Td>
                                                    <Td>
                                                        <HStack spacing={2}>
                                                            <Button size="xs" variant="outline" colorScheme="yellow" isLoading={actionLoading === row._id + '_resend'} onClick={() => handleResend(row)}>Resend OTP</Button>
                                                            <Button size="xs" colorScheme="teal" isLoading={actionLoading === row._id + '_finalize'} onClick={() => openFinalizeModal(row)}>Approve</Button>
                                                        </HStack>
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </TableContainer>

                                {/* Pagination Controls */}
                                <Flex justify="space-between" align="center" mt={6} wrap="wrap" gap={4}>
                                    <Text fontSize="sm" color="gray.600">Page {page} of {pages} • Total {total} withdrawals</Text>
                                    <HStack>
                                        <Button size="sm" isDisabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</Button>
                                        {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
                                            let pNum;
                                            if (pages <= 5) pNum = i + 1;
                                            else if (page <= 3) pNum = i + 1;
                                            else if (page >= pages - 2) pNum = pages - 4 + i;
                                            else pNum = page - 2 + i;
                                            return (
                                                <Button key={pNum} size="sm" variant={pNum === page ? "solid" : "outline"} colorScheme={pNum === page ? "teal" : "gray"} onClick={() => setPage(pNum)}>{pNum}</Button>
                                            );
                                        })}
                                        <Button size="sm" isDisabled={page >= pages} onClick={() => setPage(p => Math.min(pages, p + 1))}>Next</Button>
                                    </HStack>
                                </Flex>
                            </>
                        )}
                    </CardBody>
                </Card>
            </VStack>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Finalize {selected?.reference}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl><FormLabel>Paystack OTP</FormLabel><Input value={paystackOtp} onChange={e => setPaystackOtp(e.target.value)} placeholder="From SMS/Email" /></FormControl>
                            <FormControl><FormLabel>Authenticator Code</FormLabel><Input value={authCode} onChange={e => setAuthCode(e.target.value)} placeholder="6-digit" /></FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
                        <Button isLoading={isSubmitting} isDisabled={isSubmitting} colorScheme="teal" onClick={handleFinalize} isLoading={actionLoading === selected?._id + '_finalize'}>Confirm & Transfer</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}