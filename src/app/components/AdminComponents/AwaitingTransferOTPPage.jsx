import React, { useEffect, useState } from 'react';
import {
    Badge, Box, Button, Card, CardBody, CardHeader, Flex, FormControl, FormLabel,
    Heading, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter,
    ModalHeader, ModalOverlay, Spinner, Table, TableContainer, Tbody, Td, Text,
    Th, Thead, Tr, VStack, useDisclosure,
    useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { adminFinalizeOtpTransfer, adminResendPaystackTransferOTP, adminRetryTransfer, getOtpPendingEscrows } from '../../../../api';

const formatCurrency = (value) => {
    const numeric = Number(value?? 0);
    return Number.isFinite(numeric)? numeric.toLocaleString(undefined, { style: 'currency', currency: 'NGN', maximumFractionDigits: 2 }) : '—';
};

const normalizeRows = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    if (payload && typeof payload === 'object') return [payload];
    return [];
};

export default function AwaitingTransferOTPPage() {
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');
    const [modalError, setModalError] = useState('');
    const [selectedTransfer, setSelectedTransfer] = useState(null);
    const [selectedAction, setSelectedAction] = useState('finalize'); // finalize | retry | resendOTP
    const [paystackOTP, setPaystackOTP] = useState('');
    const [authenticatorCode, setAuthenticatorCode] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const toast = useToast();

    const loadPendingOtpEscrows = async () => {
        try {
            setLoading(true);
            setPageError('');
            const res = await getOtpPendingEscrows();
            const payload = res?.data?.data?? res?.data?? res?? [];
            const normalized = normalizeRows(payload);
            setRows(normalized.map((item, index) => ({
                id: item?.escrowId?? item?.transferId?? item?._id?? index,
                escrowId: item?.escrowId?? item?.escrow?._id?? '—',
                escrowTitle: item?.escrowTitle?? item?.escrow?.title?? '—',
                status: item?.status?? 'pending',
                transferId: item?.transferId?? item?._id?? '—',
                transferCode: item?.transferCode?? item?.paystackResponse?.data?.transfer_code?? '—',
                reference: item?.reference?? '—',
                amount: item?.amount?? 0,
                recipientType: item?.recipientType?? '—',
                recipientCode: item?.recipientCode?? '—',
                recipientAccountName: item?.recipientAccountName?? item?.accountName?? '—',
                recipientAccountNumber: item?.recipientAccountNumber?? item?.accountNumber?? '—',
                initiatedAt: item?.initiatedAt?? '—',
                reason: item?.reason?? item?.failureReason?? '—',
            })));
        } catch (err) {
            setRows([]);
            setPageError('Unable to load pending transfer OTP records.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadPendingOtpEscrows(); }, []);

    const openModal = (row, action) => {
        setSelectedTransfer(row);
        setSelectedAction(action);
        setPaystackOTP('');
        setAuthenticatorCode('');
        setModalError('');
        onOpen();
    };

    const handleFinalizeTransfer = async () => {
        if (!paystackOTP || !authenticatorCode) {
            toast({
                title: "Validation error",
                description: "Paystack OTP and Authenticator code are required",
                status: "warning",
                duration: 4000,
                isClosable: true,
                position: "top-right"
            });
            return;
        }
        try {
            setSubmitting(true);
            setModalError('');
            const res = await adminFinalizeOtpTransfer(
              selectedTransfer.escrowId, 
              selectedTransfer.transferId, 
              paystackOTP, 
              authenticatorCode
            );

            toast({
                title: "Transfer finalized",
                description: res?.data?.message || `Transfer ${selectedTransfer.reference} completed successfully`,
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "top-right"
            });

            onClose();
            await loadPendingOtpEscrows();
        } catch (err) {
            const msg = err?.response?.data?.message || 'Unable to complete transfer.';
            setModalError(msg);
            toast({
                title: "Finalize failed",
                description: msg,
                status: "error",
                duration: 6000,
                isClosable: true,
                position: "top-right"
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleRetryTransfer = async () => {
        if (!authenticatorCode) {
            toast({
                title: "Authenticator required",
                description: "Enter authenticator code to retry",
                status: "warning",
                duration: 4000,
                isClosable: true,
                position: "top-right"
            });
            return;
        }
        try {
            setSubmitting(true);
            setModalError('');
            const res = await adminRetryTransfer(
              selectedTransfer.escrowId, 
              selectedTransfer.transferId, 
              authenticatorCode
            );

            toast({
                title: "Transfer re-initiated",
                description: res?.data?.message || `Transfer ${selectedTransfer.reference} is now pending. New OTP will be sent.`,
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "top-right"
            });

            onClose();
            await loadPendingOtpEscrows();
        } catch (err) {
            const msg = err?.response?.data?.message || 'Unable to retry transfer.';
            setModalError(msg);
            toast({
                title: "Retry failed",
                description: msg,
                status: "error",
                duration: 6000,
                isClosable: true,
                position: "top-right"
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleResendOTP = async () => {
        if (!authenticatorCode) {
            toast({
                title: "Authenticator required",
                description: "Enter authenticator code first to resend OTP",
                status: "warning",
                duration: 4000,
                isClosable: true,
                position: "top-right"
            });
            return;
        }
        try {
            setSubmitting(true);
            setModalError('');
            const res = await adminResendPaystackTransferOTP(
              selectedTransfer.escrowId, 
              selectedTransfer.transferId, 
              authenticatorCode, 
              "OTP expired"
            );
            console.log(res?.data)
            toast({
                title: "OTP resent",
                description: res?.data?.message || "New OTP sent to your Paystack registered email. Expires in 15 mins.",
                status: "success",
                duration: 6000,
                isClosable: true,
                position: "top-right"
            });

            // switch to finalize so admin can enter new OTP
            setSelectedAction('finalize');
            setPaystackOTP('');
        } catch (e) {
            const msg = e?.response?.data?.message || 'Failed to resend OTP';
            setModalError(msg);
            toast({
                title: "Resend failed",
                description: msg,
                status: "error",
                duration: 6000,
                isClosable: true,
                position: "top-right"
            });
        } finally {
            setSubmitting(false);
        }
    };

    const emptyState =!loading && rows.length === 0 &&!pageError;

    return (
        <Box p={6} bg="brand.background" minH="100vh">
            <VStack spacing={5} align="stretch">
                <Flex justify="space-between" align="center" gap={4} wrap="wrap">
                    <Heading size="lg" color="teal.600">Awaiting Transfer OTP</Heading>
                    <Button size="sm" variant="outline" onClick={() => navigate('/financial-dashboard')}>Back to dashboard</Button>
                </Flex>

                <Card shadow="md" borderRadius="lg">
                    <CardHeader><Heading size="sm">Escrows waiting for transfer OTP approval</Heading></CardHeader>
                    <CardBody>
                        {loading? <Flex justify="center" py={10}><Spinner /></Flex>
                        : pageError? <Text color="red.500">{pageError}</Text>
                        : emptyState? <Text color="gray.500">No pending transfer OTP records found.</Text>
                        : (
                            <TableContainer>
                                <Table variant="simple" size="sm">
                                    <Thead><Tr>
                                        <Th>Escrow</Th><Th>Status</Th><Th>Reference</Th><Th>Amount</Th><Th>Recipient</Th><Th>Initiated</Th><Th>Action</Th>
                                    </Tr></Thead>
                                    <Tbody>
                                        {rows.map((row) => (
                                            <Tr key={row.id}>
                                                <Td><Text fontWeight="bold">{row.escrowTitle}</Text><Text fontSize="xs">{row.escrowId}</Text></Td>
                                                <Td><Badge colorScheme={row.status === 'failed'? 'red' : row.status === 'otp_required'? 'orange' : 'yellow'}>{row.status}</Badge></Td>
                                                <Td>{row.reference}</Td>
                                                <Td>{formatCurrency((Number(row.amount?? 0) || 0) / 100)}</Td>
                                                <Td><Text>{row.recipientAccountName}</Text><Text fontSize="xs">{row.recipientAccountNumber}</Text></Td>
                                                <Td>{row.initiatedAt!== '—'? new Date(row.initiatedAt).toLocaleString() : '—'}</Td>
                                                <Td>
                                                    <VStack spacing={2} align="stretch">
                                                        {row.status === 'otp_required' && (
                                                            <>
                                                                <Button size="sm" colorScheme="green" onClick={() => openModal(row, 'finalize')}>Complete transfer</Button>
                                                                <Button size="xs" variant="link" colorScheme="blue" onClick={() => openModal(row, 'resendOTP')}>Resend OTP?</Button>
                                                            </>
                                                        )}
                                                        {['failed', 'abandoned'].includes(row.status) && (
                                                            <Button size="sm" colorScheme="orange" variant="outline" onClick={() => openModal(row, 'retry')}>Retry transfer</Button>
                                                        )}
                                                        {['pending', 'processing'].includes(row.status) && (
                                                            <Text fontSize="xs" color="gray.500">Checking Paystack...</Text>
                                                        )}
                                                    </VStack>
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        )}
                    </CardBody>
                </Card>
            </VStack>

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        {selectedAction === 'retry'? 'Retry transfer' : selectedAction === 'resendOTP'? 'Resend OTP' : 'Complete transfer'}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <Text fontSize="sm" color="gray.600">Ref: {selectedTransfer?.reference} | {formatCurrency((Number(selectedTransfer?.amount?? 0)/100))}</Text>

                            {modalError && <Text color="red.500" fontSize="sm">{modalError}</Text>}

                            <FormControl isRequired>
                                <FormLabel>Authenticator code</FormLabel>
                                <Input value={authenticatorCode} onChange={(e) => setAuthenticatorCode(e.target.value)} placeholder="Enter authenticator code" />
                            </FormControl>

                            {selectedAction === 'finalize' && (
                                <>
                                    <FormControl isRequired>
                                        <FormLabel>Paystack OTP</FormLabel>
                                        <Input value={paystackOTP} onChange={(e) => setPaystackOTP(e.target.value)} placeholder="Enter Paystack OTP from email" />
                                    </FormControl>
                                    <Button variant="link" size="xs" alignSelf="flex-start" onClick={() => setSelectedAction('resendOTP')}>
                                        Didn't get OTP / Expired? Resend
                                    </Button>
                                </>
                            )}

                            {selectedAction === 'resendOTP' && (
                                <Text fontSize="sm" color="gray.500">A new OTP will be sent to your Paystack dashboard email. It expires in 15 mins.</Text>
                            )}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
                        <Button
                            colorScheme={selectedAction === 'retry'? 'orange' : selectedAction === 'resendOTP'? 'blue' : 'green'}
                            onClick={selectedAction === 'retry'? handleRetryTransfer : selectedAction === 'resendOTP'? handleResendOTP : handleFinalizeTransfer}
                            isLoading={submitting}
                        >
                            {selectedAction === 'resendOTP'? 'Resend OTP' : 'Submit'}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}