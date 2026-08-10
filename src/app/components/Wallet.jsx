import {
    Box,
    VStack,
    HStack,
    Stack,
    Text,
    Button,
    Spinner,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Input,
    FormControl,
    FormLabel,
    useToast,
    Badge,
    ButtonGroup,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { getSingleTransaction, getwallet, getwalletTransactions, initializeFundwallet } from '../../../api';
import Navbar from './Navbar';

const formatCurrency = (v) => {
    if (v === null || v === undefined || v === '') return '₦0';
    const n = Number(v) || 0;
    return `₦${n.toLocaleString()}`;
};

export default function Wallet() {
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [balance, setBalance] = useState(0);
    const [selectedTx, setSelectedTx] = useState(null);
    const { isOpen: txOpen, onOpen: openTx, onClose: closeTx } = useDisclosure();
    const { isOpen: fundOpen, onOpen: openFund, onClose: closeFund } = useDisclosure();
    const [fundAmount, setFundAmount] = useState('');
    const [loadingTx, setLoadingTx] = useState(false);
    const [transactionPagination, setTransactionPagination] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const toast = useToast();

    useEffect(() => {
        let mounted = true;

        const fetchWallet = async () => {
            const resWallet = await getwallet();
            return resWallet?.data?.data ?? {};
        };

        const fetchTransactions = async (page = 1) => {
            setLoading(true);
            try {
                const response = await getwalletTransactions({ params: { page } });
                const walletTransactions = response?.data?.data ?? {};
                const transactionsData = Array.isArray(walletTransactions.transactions)
                    ? walletTransactions.transactions
                    : [];

                if (!mounted) return;
                setTransactions(transactionsData);
                setTransactionPagination(walletTransactions.pagination || {});
                setCurrentPage(page);
            } catch (err) {
                console.error('Failed to load transactions', err);
                toast({ title: 'Unable to load wallet activity', status: 'error', duration: 4000 });
            } finally {
                if (mounted) setLoading(false);
            }
        };

        const load = async () => {
            setLoading(true);
            try {
                const wallet = await fetchWallet();
                if (!mounted) return;
                const maybeBalance = wallet.balance ?? wallet?.balance;
                if (typeof maybeBalance === 'number') {
                    setBalance(maybeBalance / 100);
                }
                await fetchTransactions(1);
            } catch (err) {
                console.error('Failed to load wallet data', err);
                if (mounted) {
                    toast({ title: 'Unable to load wallet data', status: 'error', duration: 4000 });
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();
        return () => { mounted = false; };
    }, []);

    const openTransaction = async (txId) => {
        setLoadingTx(true);
        try {
            const res = await getSingleTransaction(txId);
            console.log(res)
            const payload = res?.data?.data?.transaction || res?.data || null;
            setSelectedTx(payload);
            openTx();
        } catch (err) {
            console.error('Failed to fetch transaction', err);
            toast({ title: 'Failed to load transaction', status: 'error', duration: 3000 });
        } finally {
            setLoadingTx(false);
        }
    };

    const getCurrentPage = () => {
        return transactionPagination.page || transactionPagination.currentPage || transactionPagination.pageNumber || currentPage;
    };

    const getTotalPages = () => {
        return transactionPagination.pages || transactionPagination.totalPages || transactionPagination.pageCount || 1;
    };

    const handlePageChange = async (page) => {
        if (page < 1 || page > getTotalPages() || page === getCurrentPage()) return;
        setCurrentPage(page);
        setLoading(true);
        try {
            const response = await getwalletTransactions({ params: { page } });
            const walletTransactions = response?.data?.data ?? {};
            const transactionsData = Array.isArray(walletTransactions.transactions)
                ? walletTransactions.transactions
                : [];

            setTransactions(transactionsData);
            setTransactionPagination(walletTransactions.pagination || {});
        } catch (err) {
            console.error('Failed to load wallet page', err);
            toast({ title: 'Unable to load transaction page', status: 'error', duration: 3000 });
        } finally {
            setLoading(false);
        }
    };



    const handleFund = async () => {
        const value = Number(fundAmount) * 100;
        if (!value || value <= 0) {
            toast({ title: 'Enter a valid amount', status: 'warning' });
            return;
        }

        const newTx = {
            _id: `local-${Date.now()}`,
            amount: value,
            type: 'credit',
            status: 'completed',
            reference: `LOCAL-${Date.now()}`,
            createdAt: new Date().toISOString(),
            metadata: { note: 'Wallet top-up (simulated)' },
        };

        try {
            const response = await initializeFundwallet(value);
            const { data } = response;
            toast({ title: data?.message || 'Wallet funded', status: 'success' });
            setTransactions((prev) => [newTx, ...prev]);
            setBalance((b) => b + value / 100);
            setFundAmount('');
            closeFund();
            if (data?.data?.authorization_url) {
                window.location.href = data.data.authorization_url;
            }
        } catch (err) {
            closeFund();
            toast({ title: `${err?.response?.data?.message || 'Unable to fund wallet'}. Contact support.`, status: 'error' });
        }
    };

    return (
        <Box minH="100vh" bg="brand.background" p={6}
            pb={20}>
            <VStack spacing={6} align="stretch">
                <Box bg="white" p={{ base: 5, md: 6 }} borderRadius="xl" boxShadow="sm">
                    <Stack direction={{ base: 'column', md: 'row' }} align="center" justify="space-between" spacing={4}>
                        <VStack align="start" spacing={1} w={{ base: '100%', md: 'auto' }}>
                            <Text fontSize={{ base: 'sm', md: 'md' }} color="brand.gray.600">Wallet balance</Text>
                            <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold" color="brand.primary">{formatCurrency(balance)}</Text>
                        </VStack>
                        <Button w={{ base: '100%', sm: 'auto' }} size="lg" colorScheme="teal" onClick={openFund}>Fund Wallet</Button>
                    </Stack>
                </Box>

                <Box bg="white" p={{ base: 5, md: 6 }} borderRadius="xl" boxShadow="sm">
                    <Text fontSize="lg" fontWeight="600" mb={4}>Recent Transactions</Text>
                    {loading ? (
                        <HStack justify="center"><Spinner /></HStack>
                    ) : (
                        <VStack spacing={4} align="stretch">
                            {transactions.length === 0 ? (
                                <Text color="brand.gray.500">No transactions yet.</Text>
                            ) : (
                                transactions.map((t) => (
                                    <Box key={t._id || t.id || t.reference} bg="brand.background" p={{ base: 4, md: 5 }} borderRadius="xl" boxShadow="sm">
                                        <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" align="flex-start" spacing={4}>
                                            <VStack align="start" spacing={1} flex={1} minW={0}>
                                                <Text fontSize="sm" color="brand.gray.500">{new Date(t.createdAt || t.date || Date.now()).toLocaleString()}</Text>
                                                <Text fontSize="md" wordBreak="break-all"  fontWeight="600" noOfLines={3}>{t.reference || t.txRef || t._id}</Text>
                                                <Text fontSize="sm" color="brand.gray.600">{t.type ? `${t.type} transaction` : 'Transaction'}</Text>
                                            </VStack>
                                            <VStack align={{ base: 'start', md: 'end' }} spacing={1} flexShrink={0}>
                                                <Badge colorScheme={t.type?.toLowerCase() === 'debit' ? 'red' : 'green'}>{t.type || 'Unknown'}</Badge>
                                                <Text fontWeight="700">{formatCurrency((t.amount ?? 0) / 100)}</Text>
                                                <Text fontSize="sm" color="brand.gray.600">{t.status || 'Status unavailable'}</Text>
                                            </VStack>
                                        </Stack>
                                        <HStack justify={{ base: 'stretch', md: 'flex-end' }} mt={4}>
                                            <Button w={{ base: '100%', md: 'auto' }} size="sm" variant="outline" onClick={() => openTransaction(t._id || t.id || t.reference)}>Details</Button>
                                        </HStack>
                                    </Box>
                                ))
                            )}
                        </VStack>
                    )}

                    {transactions.length > 0 && (
                        <Stack direction={{ base: 'column', sm: 'row' }} align="center" justify="space-between" mt={6} spacing={3}>
                            <ButtonGroup size="sm" w={{ base: '100%', sm: 'auto' }}>
                                <Button
                                    onClick={() => handlePageChange(getCurrentPage() - 1)}
                                    isDisabled={getCurrentPage() <= 1 || loading}
                                    w={{ base: '50%', sm: 'auto' }}
                                >
                                    Previous
                                </Button>
                                <Button
                                    onClick={() => handlePageChange(getCurrentPage() + 1)}
                                    isDisabled={getCurrentPage() >= getTotalPages() || loading}
                                    w={{ base: '50%', sm: 'auto' }}
                                >
                                    Next
                                </Button>
                            </ButtonGroup>
                            <Text fontSize="sm" color="brand.gray.600" textAlign={{ base: 'center', sm: 'right' }}>
                                Page {getCurrentPage()} of {getTotalPages()}
                            </Text>
                        </Stack>
                    )}
                </Box>
            </VStack>

            {/* Transaction details modal */}
            <Modal isOpen={txOpen} onClose={() => { setSelectedTx(null); closeTx(); }} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Transaction details</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {loadingTx ? (
                            <Spinner />
                        ) : selectedTx ? (
                            <Box>
                                <Text fontWeight="600">Reference: {selectedTx.reference || selectedTx._id}</Text>
                                <Text>Amount: {formatCurrency(selectedTx.amount / 100)}</Text>
                                <Text>Type: {selectedTx.type}</Text>
                                <Text>Status: {selectedTx.status}</Text>
                                <Text>Created: {new Date(selectedTx.createdAt || Date.now()).toLocaleString()}</Text>
                                <Box mt={3} p={3} bg="brand.background" borderRadius="md">
                                    <Text fontSize="sm" whiteSpace="pre-wrap">{JSON.stringify(selectedTx, null, 2)}</Text>
                                </Box>
                            </Box>
                        ) : (
                            <Text>No transaction selected</Text>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={() => { setSelectedTx(null); closeTx(); }}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Fund wallet modal */}
            <Modal isOpen={fundOpen} onClose={closeFund} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Fund Wallet</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl>
                            <FormLabel>Amount</FormLabel>
                            <Input
                                placeholder="Enter amount"
                                value={fundAmount}
                                onChange={(e) => setFundAmount(e.target.value)}
                                type="number"
                                min={0}
                            />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter flexDirection={{ base: 'column', sm: 'row' }} gap={3}>
                        <Button w={{ base: '100%', sm: 'auto' }} variant="ghost" onClick={closeFund}>Cancel</Button>
                        <Button w={{ base: '100%', sm: 'auto' }} colorScheme="teal" onClick={handleFund}>Fund</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <Navbar active="profile" />
        </Box>
    );
}

