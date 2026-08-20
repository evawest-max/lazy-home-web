import {
    Box,
    VStack,
    HStack,
    Text,
    Button,
    IconButton,
    FormControl,
    FormLabel,
    FormErrorMessage,
    Input,
    Select,
    Progress,
    Checkbox,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Spinner,
    useToast,
} from '@chakra-ui/react';
import {
    ArrowLeft,
    Building2,
    ShieldCheck,
    AlertCircle,
    Lock,
    CheckCircle,
    CreditCard,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBankcodes, verifyBankAccount } from '../../../../api';

export default function ListPropertyStep4({ formData, setFormData, onBack, onSubmit, isLoading, setIsLoading }) {
    const toast = useToast();
    const currentStep = 4;
    const totalSteps = 4;
    const landlordDetails = formData?.landlordDetails ?? {};
    const draftKey = 'listingFormData';

    const [accountVerified, setAccountVerified] = useState(false);
    const [formError, setFormError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [banks, setBanks] = useState([]);

    const requiredFields = ['fullName', 'bankName', 'accountNumber'];
    const requiredCheckboxes = ['termsAccepted', 'escrowAccepted', 'policyAccepted'];

    const isStepFourValid = () => {
        const fieldsValid = requiredFields.every(
            (field) => landlordDetails[field] && String(landlordDetails[field]).trim() !== ''
        ) && String(landlordDetails.accountNumber ?? '').length === 10;

        const checkboxesValid = requiredCheckboxes.every(
            (checkbox) => formData?.[checkbox] === true
        );

        return fieldsValid && checkboxesValid;
    };

    useEffect(() => {
        const fetchBanks = async () => {
            try {
                const res = await getBankcodes()
                setBanks(res.data.data);
                console.log("this are the banks", res.data.data)
            } catch (err) {
                console.error("Error fetching banks:", err);
            }
        };
        fetchBanks();
    }, []);

    useEffect(() => {
        if (formError && isStepFourValid()) {
            setFormError('');
        }
    }, [formData, formError]);

    // useEffect(() => {
    //     const accountNumber = String(landlordDetails.accountNumber ?? '');

    //     if (accountNumber.length !== 10 || !landlordDetails.bankCode) {
    //         setAccountVerified(false);
    //         return;
    //     }

    //     const verifyDetails = async () => {
    //         try {
    //             const res = await verifyBankAccount(accountNumber, landlordDetails.bankCode);
    //             console.log('Verification result:', res);

    //             const verification = res?.data?.data ?? {};
    //             const verifiedName = verification.accountName || verification.account_name || landlordDetails.fullName;
    //             const verifiedAccountNumber = verification.accountNumber || verification.account_number || landlordDetails.accountNumber;

    //             setFormData((prev) => ({
    //                 ...prev,
    //                 landlordDetails: {
    //                     ...(prev.landlordDetails ?? {}),
    //                     fullName: verifiedName,
    //                     accountNumber: verifiedAccountNumber,
    //                 },
    //             }));

    //             setAccountVerified(true);
    //         } catch (error) {
    //             console.error('Verification failed:', error);
    //             setAccountVerified(false);
    //         }
    //     };

    //     verifyDetails();
    // }, [landlordDetails.accountNumber, landlordDetails.bankCode, setFormData]);

    const handleSubmit = async () => {
        setIsLoading(true);

        if (!isStepFourValid()) {
            setFormError('Please fill in all required fields and accept all terms before submitting.');
            setIsLoading(false);
            return;
        }

        if (formData?.ownershipType === 'agent' && !accountVerified) {
            setFormError('Agent listings must verify landlord bank account details before submitting.');
            toast({ title: 'Account verification required', description: 'Please verify the landlord bank account details before submitting.', status: 'warning', duration: 4000 });
            setIsLoading(false);
            return;
        }

        const draft = {
            ...formData,
            landlordDetails: {
                ...landlordDetails,
                landlordEmail: formData.landlordEmail ?? landlordDetails.landlordEmail ?? '',
                landlordPhoneNumber: formData.landlordPhoneNumber ?? landlordDetails.landlordPhoneNumber ?? '',
            },
        };

        sessionStorage.setItem(draftKey, JSON.stringify(draft));
        localStorage.setItem(draftKey, JSON.stringify(draft));
        setFormData(draft);

        if (onSubmit) {
            await onSubmit(draft);
            setIsLoading(false);
        }
    };

    const verifyAccountDetails = async () => {
        const accountNumber = String(landlordDetails.accountNumber ?? '');

        if (!landlordDetails.bankCode || accountNumber.length !== 10) {
            toast({ title: 'Enter a valid bank and 10-digit account number', status: 'warning', duration: 3000 });
            return;
        }
        // console.log(formData,'Verifying account:', accountNumber, landlordDetails.bankCode);
        // return
        setIsVerifying(true);

        try {
            const res = await verifyBankAccount(accountNumber, landlordDetails.bankCode);
            console.log('verification result:', res)
            const verification = res?.data?.data ?? {};
            const verifiedName = verification.accountName || verification.account_name || landlordDetails.fullName;
            const verifiedAccountNumber = verification.accountNumber || verification.account_number || landlordDetails.accountNumber;
            const verifiedBankName = verification.bankName || verification.bank_name || landlordDetails.bankName;
            const verifiedBankCode = verification.bankCode || verification.bank_code || landlordDetails.bankCode;

            setFormData((prev) => ({
                ...prev,
                landlordDetails: {
                    ...(prev.landlordDetails ?? {}),
                    fullName: verifiedName,
                    accountNumber: verifiedAccountNumber,
                    bankName: verifiedBankName,
                    bankCode: verifiedBankCode,
                },
            }));

            setAccountVerified(true);
            setVerificationToken(res.data.data.verificationToken)
            toast({ title: 'Account verified', status: 'success', duration: 3000 });
        } catch (err) {
            console.error('Verification failed:', err?.response.data.message);
            setAccountVerified(false);
            toast({ title: 'Verification failed', description: err?.response.data.message, status: 'error', duration: 4000 });
        } finally {
            setIsVerifying(false);
        }
    }

    return (
        <Box minH="100vh" bg="brand.background" pb="120px">
            {/* <Box bg="brand.primary" px={6} pt={12} pb={8}>
                <HStack mb={6}>
                    <Link to="/create-listing/step-3">
                    <IconButton
                        icon={<ArrowLeft size={20} />}
                        variant="ghost"
                        color="white"
                        _hover={{ bg: 'whiteAlpha.200' }}
                        aria-label="Back"
                    />
                    </Link>
                    <Text fontSize="xl" fontWeight="bold" color="white" flex={1}>
                        List Your Property
                    </Text>
                </HStack>

                <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                        <Text fontSize="sm" color="whiteAlpha.900">
                            Step {currentStep} of {totalSteps}
                        </Text>
                        <Text fontSize="sm" color="whiteAlpha.900">
                            {Math.round((currentStep / totalSteps) * 100)}% Complete
                        </Text>
                    </HStack>
                    <Progress
                        value={(currentStep / totalSteps) * 100}
                        size="sm"
                        colorScheme="green"
                        borderRadius="full"
                        bg="whiteAlpha.300"
                    />

                    <HStack spacing={2} justify="center" mt={2}>
                        {[1, 2, 3, 4].map((step) => (
                            <Box
                                key={step}
                                w="8px"
                                h="8px"
                                borderRadius="full"
                                bg={step <= currentStep ? 'white' : 'whiteAlpha.400'}
                            />
                        ))}
                    </HStack>
                </VStack>
            </Box> */}

            <VStack align="stretch" px={6} mt={-4} spacing={6}>
                <Box bg="white" borderRadius="xl" p={6} boxShadow="md" border="2px solid" borderColor="brand.success">
                    <VStack spacing={4}>
                        <HStack justify="center" bg="brand.success" py={3} px={4} borderRadius="lg" w="100%">
                            <Lock size={20} color="white" />
                            <Text fontSize="sm" fontWeight="bold" color="white">
                                YOUR BANK DETAILS ARE ENCRYPTED & SECURE
                            </Text>
                        </HStack>

                        <VStack spacing={2} bg="brand.background" p={4} borderRadius="lg" w="100%">
                            <Text fontSize="sm" fontWeight="600" color="brand.gray.800" textAlign="center">
                                ✓ We verify your bank account to prevent fraud
                            </Text>
                            <Text fontSize="sm" fontWeight="600" color="brand.gray.800" textAlign="center">
                                ✓ Your details are encrypted with bank-grade security
                            </Text>
                            <Text fontSize="sm" fontWeight="600" color="brand.gray.800" textAlign="center">
                                ✓ Payment sent directly to your account after approval
                            </Text>
                        </VStack>
                    </VStack>
                </Box>

                <Box bg="white" borderRadius="xl" p={6} boxShadow="sm">
                    <VStack align="stretch" spacing={5}>
                        <HStack spacing={3}>
                            <Box bg="brand.primary" p={2} borderRadius="full">
                                <Building2 size={20} color="white" />
                            </Box>
                            <Text fontSize="lg" fontWeight="bold" color="brand.gray.800">
                                Landlord Bank Account Details
                            </Text>
                            <Text fontSize="sm" color="brand.gray.600">
                                (Only fill if listing for a landlord)
                            </Text>
                        </HStack>

                        {formError && (
                            <Alert status="error" borderRadius="lg">
                                <AlertIcon />
                                <Box>
                                    <AlertTitle>Required Fields Missing!</AlertTitle>
                                    <AlertDescription>
                                        Please fill in all required fields and accept all terms before submitting your listing.
                                    </AlertDescription>
                                </Box>
                            </Alert>
                        )}

                        <FormControl isRequired isInvalid={formError && !landlordDetails.fullName}>
                            <FormLabel color="brand.gray.700" fontSize="sm" fontWeight="600">
                                Account Holder Name
                            </FormLabel>
                            <Input
                                placeholder="Full name as it appears on bank account"
                                size="lg"
                                value={landlordDetails.fullName ?? ''}
                                onChange={(e) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        landlordDetails: {
                                            ...(prev.landlordDetails ?? {}),
                                            fullName: e.target.value,
                                        },
                                    }));
                                    if (formError) setFormError('');
                                }}
                                _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                            />
                            <FormErrorMessage>Required</FormErrorMessage>
                            <Text fontSize="xs" color="brand.gray.500" mt={2}>
                                Must match your ID verification name
                            </Text>
                        </FormControl>

                        <FormControl isRequired isInvalid={formError && !landlordDetails.bankName}>
                            <FormLabel color="brand.gray.700" fontSize="sm" fontWeight="600">
                                Bank Name
                            </FormLabel>
                            <Select
                                placeholder="Select your bank"
                                size="lg"
                                value={landlordDetails.bankCode ?? ''}
                                onChange={(e) => {
                                    const selectedCode = e.target.value;
                                    const selectedBank = banks.find(bank => bank.code === selectedCode);
                                    setFormData(prev => ({
                                        ...prev,
                                        landlordDetails: {
                                            ...(prev.landlordDetails ?? {}),
                                            bankName: selectedBank?.name,
                                            bankCode: e.target.value,
                                        },
                                    }));
                                    if (formError) setFormError('');
                                }}
                                _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                            >

                                {banks.map((bank) => (
                                    <option key={bank.code} value={bank.code}>
                                        {bank.name}
                                    </option>
                                ))}
                            </Select>
                            <FormErrorMessage>Required</FormErrorMessage>
                        </FormControl>

                        <FormControl isRequired isInvalid={formError && (!landlordDetails.accountNumber || landlordDetails.accountNumber.length !== 10)}>
                            <FormLabel color="brand.gray.700" fontSize="sm" fontWeight="600">
                                Account Number
                            </FormLabel>
                            <Input
                                placeholder="0123456789"
                                type="text"
                                maxLength={10}
                                size="lg"
                                value={landlordDetails.accountNumber ?? ''}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    setFormData(prev => ({
                                        ...prev,
                                        landlordDetails: {
                                            ...(prev.landlordDetails ?? {}),
                                            accountNumber: value,
                                        },
                                    }));
                                    if (formError) setFormError('');
                                }}
                                _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                            />
                            <FormErrorMessage>Required (10 digits)</FormErrorMessage>
                        </FormControl>

                        <Button onClick={ verifyAccountDetails}>Verify account</Button>

                        {accountVerified && (
                            <Box bg="brand.background" p={4} borderRadius="lg">
                                <HStack spacing={3}>
                                    <CheckCircle size={20} color="#2E7D32" />
                                    <VStack align="start" spacing={0} flex={1}>
                                        <Text fontSize="sm" fontWeight="600" color="brand.success">
                                            Account Verified ✓
                                        </Text>
                                        <Text fontSize="xs" color="brand.gray.600">
                                            {landlordDetails.fullName} - {landlordDetails.bankName} ({landlordDetails.accountNumber})
                                        </Text>
                                    </VStack>
                                </HStack>
                            </Box>
                        )}
                    </VStack>
                </Box>

                <Box bg="white" borderRadius="xl" p={6} boxShadow="sm">
                    <VStack align="stretch" spacing={5}>
                        <HStack spacing={3}>
                            <Box bg="brand.accent" p={2} borderRadius="full">
                                <CreditCard size={20} color="white" />
                            </Box>
                            <Text fontSize="lg" fontWeight="bold" color="brand.gray.800">
                                Landlord contact details
                            </Text>
                        </HStack>

                        <Text fontSize="sm" color="brand.gray.600">
                            Provide accurate contact details for the landLord  so we can reach them if needed.<br />
                            This information will not be shared with renters. (Only fill if listing for a landlord)
                        </Text>

                        <FormControl>
                            <FormLabel color="brand.gray.700" fontSize="sm" fontWeight="600">
                                Landlord's email address
                            </FormLabel>
                            <Input
                                placeholder="example@gmail.com"
                                type="email"
                                size="lg"
                                value={formData.landlordEmail ?? ''}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, landlordEmail: e.target.value }));
                                }}
                                _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel color="brand.gray.700" fontSize="sm" fontWeight="600">
                                Landlord's phone number
                            </FormLabel>
                            <Input
                                placeholder="0800 123 4567"
                                type="text"
                                maxLength={11}
                                size="lg"
                                value={formData.landlordPhoneNumber ?? ''}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    setFormData(prev => ({ ...prev, landlordPhoneNumber: value }));
                                }}
                                _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                            />
                        </FormControl>
                    </VStack>
                </Box>

                <Box bg="white" borderRadius="xl" p={6} boxShadow="sm">
                    <VStack align="stretch" spacing={5}>
                        <Text fontSize="lg" fontWeight="bold" color="brand.gray.800">
                            Payment Schedule
                        </Text>

                        <VStack spacing={3} align="stretch">
                            <Box bg="brand.background" p={4} borderRadius="lg">
                                <VStack align="stretch" spacing={3}>
                                    <HStack justify="space-between">
                                        <Text fontSize="sm" fontWeight="600" color="brand.gray.800">
                                            When will I get paid?
                                        </Text>
                                    </HStack>
                                    <Text fontSize="sm" color="brand.gray.700">
                                        Payment is released to your account <Text as="span" fontWeight="bold" color="brand.primary">within 24 hours</Text> after the renter approves the inspection.
                                    </Text>
                                </VStack>
                            </Box>

                            <Box bg="brand.background" p={4} borderRadius="lg">
                                <VStack align="stretch" spacing={3}>
                                    <HStack justify="space-between">
                                        <Text fontSize="sm" fontWeight="600" color="brand.gray.800">
                                            What if renter rejects inspection?
                                        </Text>
                                    </HStack>
                                    <Text fontSize="sm" color="brand.gray.700">
                                        If the renter files a dispute, our team investigates within 48 hours. Valid disputes result in refund to renter; invalid disputes release payment to you.
                                    </Text>
                                </VStack>
                            </Box>

                            <Box bg="brand.background" p={4} borderRadius="lg">
                                <VStack align="stretch" spacing={3}>
                                    <HStack justify="space-between">
                                        <Text fontSize="sm" fontWeight="600" color="brand.gray.800">
                                            Are there withdrawal limits?
                                        </Text>
                                    </HStack>
                                    <Text fontSize="sm" color="brand.gray.700">
                                        No limits. Your full rental payment is transferred in a single transaction to your verified bank account.
                                    </Text>
                                </VStack>
                            </Box>
                        </VStack>
                    </VStack>
                </Box>

                <Box bg="brand.background" border="2px solid" borderColor="brand.success" borderRadius="lg" p={5}>
                    <VStack spacing={4}>
                        <HStack spacing={2}>
                            <Lock size={20} color="#2E7D32" />
                            <Text fontSize="md" fontWeight="bold" color="brand.success">
                                Your Bank Security Guarantee
                            </Text>
                        </HStack>

                        <VStack spacing={3} align="stretch">
                            <HStack spacing={2} align="start">
                                <CheckCircle size={16} color="#2E7D32" style={{ marginTop: 2, flexShrink: 0 }} />
                                <Text fontSize="sm" color="brand.gray.700">
                                    256-bit SSL encryption on all bank data
                                </Text>
                            </HStack>

                            <HStack spacing={2} align="start">
                                <CheckCircle size={16} color="#2E7D32" style={{ marginTop: 2, flexShrink: 0 }} />
                                <Text fontSize="sm" color="brand.gray.700">
                                    Bank details never shared with renters
                                </Text>
                            </HStack>

                            <HStack spacing={2} align="start">
                                <CheckCircle size={16} color="#2E7D32" style={{ marginTop: 2, flexShrink: 0 }} />
                                <Text fontSize="sm" color="brand.gray.700">
                                    Two-factor authentication for payout changes
                                </Text>
                            </HStack>

                            <HStack spacing={2} align="start">
                                <CheckCircle size={16} color="#2E7D32" style={{ marginTop: 2, flexShrink: 0 }} />
                                <Text fontSize="sm" color="brand.gray.700">
                                    Compliance with CBN payment regulations
                                </Text>
                            </HStack>
                        </VStack>
                    </VStack>
                </Box>

                <Box bg="white" borderRadius="xl" p={5} boxShadow="sm">
                    <VStack align="stretch" spacing={4}>
                        <Checkbox
                            colorScheme="teal"
                            size="lg"
                            isChecked={formData?.termsAccepted}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }));
                                if (formError) setFormError('');
                            }}
                        >
                            <Text fontSize="sm" color="brand.gray.700">
                                I confirm that the bank account details provided belong to me and are accurate
                            </Text>
                        </Checkbox>

                        <Checkbox
                            colorScheme="teal"
                            size="lg"
                            isChecked={formData?.escrowAccepted}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, escrowAccepted: e.target.checked }));
                                if (formError) setFormError('');
                            }}
                        >
                            <Text fontSize="sm" color="brand.gray.700">
                                I understand that payments are held in escrow until renter approves inspection
                            </Text>
                        </Checkbox>

                        <Checkbox
                            colorScheme="teal"
                            size="lg"
                            isChecked={formData?.policyAccepted}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, policyAccepted: e.target.checked }));
                                if (formError) setFormError('');
                            }}
                        >
                            <Text fontSize="sm" color="brand.gray.700">
                                I agree to SafeTenant <Text as="span" color="brand.primary" fontWeight="600">Agent Terms & Conditions</Text> and <Text as="span" color="brand.primary" fontWeight="600">Privacy Policy</Text>
                            </Text>
                        </Checkbox>
                    </VStack>
                </Box>

                <Box bg="white" borderRadius="xl" p={5} boxShadow="sm" border="2px solid" borderColor="brand.warning">
                    <HStack spacing={3}>
                        <AlertCircle size={24} color="#E65100" />
                        <VStack align="start" spacing={0} flex={1}>
                            <Text fontSize="sm" fontWeight="bold" color="brand.warning">
                                Important: Bank Account Verification
                            </Text>
                            <Text fontSize="xs" color="brand.gray.600">
                                We'll send ₦10 to verify your account. This will be refunded immediately. Never share OTP or bank login details.
                            </Text>
                        </VStack>
                    </HStack>
                </Box>
            </VStack>

            <Box
                position="fixed"
                bottom={0}
                left={0}
                right={0}
                bg="white"
                borderTop="2px solid"
                borderColor="brand.success"
                p={6}
                boxShadow="2xl"
            >
                <VStack spacing={3}>
                    <HStack spacing={2} bg="brand.background" py={2} px={4} borderRadius="lg" w="100%" justify="center">
                        <ShieldCheck size={16} color="#2E7D32" />
                        <Text fontSize="xs" fontWeight="bold" color="brand.success">
                            READY TO PUBLISH - YOUR LISTING WILL BE VERIFIED IN 24 HOURS
                        </Text>
                    </HStack>
                    <Button
                        w="100%"
                        variant="secondary"
                        size="lg"
                        onClick={onBack}
                    >
                        Back
                    </Button>
                    {!isLoading && (
                        <Button
                            w="100%"
                            variant="primary"
                            size="lg"
                            onClick={handleSubmit}
                        >
                            Submit Listing for Verification
                        </Button>)}
                    {isLoading && (
                        <Spinner size="lg" color="brand.primary" />
                    )}
                </VStack>
            </Box>
        </Box>
    );
}
