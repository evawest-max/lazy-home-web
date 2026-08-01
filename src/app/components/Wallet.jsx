import {
    Box,
    VStack,
    HStack,
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
        console.log(value)
        if (!value || value <= 0) {
            toast({ title: 'Enter a valid amount', status: 'warning' });
            return;
        }
        try {
            const response = await initializeFundwallet(value);
            console.log('Fund wallet response:', response);
            const { data } = response;
            toast({ title: data.message, status: 'success' });
            setTransactions((prev) => [newTx, ...prev]);
            setBalance((b) => b + value/100);
            setFundAmount('');
            closeFund();
            if (data && data.data && data.data.authorization_url) {
                window.location.href = data.data.authorization_url;
            }
        } catch (err) {
            // console.log(err?.response?.data?.message)
            closeFund();
            toast({ title: `${err?.response?.data?.message} contact support`, status: 'error' });
            return
        }

        // simulate fund: add a transaction locally (in real app call API)
        const newTx = {
            _id: `local-${Date.now()}`,
            amount: value,
            type: 'credit',
            status: 'completed',
            reference: `LOCAL-${Date.now()}`,
            createdAt: new Date().toISOString(),
            metadata: { note: 'Wallet top-up (simulated)' },
        };


    };

    return (
        <Box minH="100vh" bg="brand.background" p={6}
            pb={20}>
            <VStack spacing={6} align="stretch">
                <Box bg="white" p={6} borderRadius="xl" boxShadow="sm">
                    <HStack justify="space-between">
                        <VStack align="start">
                            <Text fontSize="sm" color="brand.gray.600">Wallet balance</Text>
                            <Text fontSize="3xl" fontWeight="bold" color="brand.primary">{formatCurrency(balance)}</Text>
                        </VStack>
                        <Button size="lg" colorScheme="teal" onClick={openFund}>Fund Wallet</Button>
                    </HStack>
                </Box>

                <Box bg="white" p={4} borderRadius="xl" boxShadow="sm">
                    <Text fontSize="lg" fontWeight="600" mb={4}>Recent Transactions</Text>
                    {loading ? (
                        <HStack justify="center"><Spinner /></HStack>
                    ) : (
                        <VStack spacing={4} align="stretch">
                            {transactions.length === 0 ? (
                                <Text color="brand.gray.500">No transactions yet.</Text>
                            ) : (
                                transactions.map((t) => (
                                    <Box key={t._id || t.id || t.reference} bg="brand.background" p={4} borderRadius="xl" boxShadow="sm">
                                        <HStack justify="space-between" align="start">
                                            <VStack align="start" spacing={1}>
                                                <Text fontSize="sm" color="brand.gray.500">{new Date(t.createdAt || t.date || Date.now()).toLocaleString()}</Text>
                                                <Text fontSize="md" fontWeight="600">{t.reference || t.txRef || t._id}</Text>
                                                <Text fontSize="sm" color="brand.gray.600">{t.type ? `${t.type} transaction` : 'Transaction'}</Text>
                                            </VStack>
                                            <VStack align="end">
                                                <Badge colorScheme={t.type?.toLowerCase() === 'debit' ? 'red' : 'green'}>{t.type || 'Unknown'}</Badge>
                                                <Text fontWeight="700">{formatCurrency(t.amount / 100)}</Text>
                                                <Text fontSize="sm" color="brand.gray.600">{t.status || 'Status unavailable'}</Text>
                                            </VStack>
                                        </HStack>
                                        <HStack justify="flex-end" mt={4}>
                                            <Button size="sm" variant="outline" onClick={() => openTransaction(t._id || t.id || t.reference)}>Details</Button>
                                        </HStack>
                                    </Box>
                                ))
                            )}
                        </VStack>
                    )}

                    {transactions.length > 0 && (
                        <HStack justify="center" mt={6} spacing={2}>
                            <ButtonGroup>
                                <Button
                                    onClick={() => handlePageChange(getCurrentPage() - 1)}
                                    isDisabled={getCurrentPage() <= 1 || loading}
                                >
                                    Previous
                                </Button>
                                <Button
                                    onClick={() => handlePageChange(getCurrentPage() + 1)}
                                    isDisabled={getCurrentPage() >= getTotalPages() || loading}
                                >
                                    Next
                                </Button>
                            </ButtonGroup>
                            <Text fontSize="sm" color="brand.gray.600">
                                Page {getCurrentPage()} of {getTotalPages()}
                            </Text>
                        </HStack>
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
                                <Text>Amount: {formatCurrency(selectedTx.amount)}</Text>
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
                            <Input placeholder="Enter amount" value={fundAmount} onChange={(e) => setFundAmount(e.target.value)} type="number" />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={closeFund}>Cancel</Button>
                        <Button colorScheme="teal" onClick={handleFund}>Fund</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <Navbar active="profile" />
        </Box>
    );
}

