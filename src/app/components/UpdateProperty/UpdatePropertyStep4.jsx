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

export default function UpdatePropertyStep4({ updatedFormdata, setUpdatedFormdata, onBack, onSubmit, isLoading, setIsLoading }) {
    const currentStep = 4;
    const totalSteps = 4;
    const landlordDetails = updatedFormdata?.landlordDetails ?? {};
    const draftKey = 'listingFormData';

    const [accountVerified, setAccountVerified] = useState(false);
    const [formError, setFormError] = useState('');

    const requiredFields = ['fullName', 'bankName', 'accountNumber'];
    const requiredCheckboxes = ['termsAccepted', 'escrowAccepted', 'policyAccepted'];

    const isStepFourValid = () => {
        const fieldsValid = requiredFields.every(
            (field) => landlordDetails[field] && String(landlordDetails[field]).trim() !== ''
        ) && String(landlordDetails.accountNumber ?? '').length === 10;

        const checkboxesValid = requiredCheckboxes.every(
            (checkbox) => updatedFormdata?.[checkbox] === true
        );

        return fieldsValid && checkboxesValid;
    };

    useEffect(() => {
        if (formError && isStepFourValid()) {
            setFormError('');
        }
    }, [updatedFormdata, formError]);

    useEffect(() => {
        const isVerified = String(landlordDetails.accountNumber ?? '').length === 10 && landlordDetails.bankName && landlordDetails.fullName;

        if (isVerified) {
            const timeoutId = setTimeout(() => setAccountVerified(true), 500);
            return () => clearTimeout(timeoutId);
        } else {
            setAccountVerified(false);
        }
    }, [landlordDetails.accountNumber, landlordDetails.bankName, landlordDetails.fullName]);

    const handleSubmit = () => {
        console.log('loading data', isLoading);
        setIsLoading(true);
        if (!isStepFourValid()) {
            setFormError('Please fill in all required fields and accept all terms before submitting.');
            return;
        }

        const draft = {
            ...updatedFormdata,
            landlordDetails: {
                ...landlordDetails,
                backupBankName: updatedFormdata.backupBankName ?? landlordDetails.backupBankName ?? '',
                backupAccountNumber: updatedFormdata.backupAccountNumber ?? landlordDetails.backupAccountNumber ?? '',
            },
        };

        sessionStorage.setItem(draftKey, JSON.stringify(draft));
        localStorage.setItem(draftKey, JSON.stringify(draft));
        setUpdatedFormdata(draft);
        
        if (onSubmit) {
            onSubmit(draft);
        }
    };

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
                                Bank Account Details
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
                                    setUpdatedFormdata(prev => ({
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
                                value={landlordDetails.bankName ?? ''}
                                onChange={(e) => {
                                    setUpdatedFormdata(prev => ({
                                        ...prev,
                                        landlordDetails: {
                                            ...(prev.landlordDetails ?? {}),
                                            bankName: e.target.value,
                                        },
                                    }));
                                    if (formError) setFormError('');
                                }}
                                _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                            >
                                <option>Access Bank</option>
                                <option>Guaranty Trust Bank (GTB)</option>
                                <option>United Bank for Africa (UBA)</option>
                                <option>First Bank of Nigeria</option>
                                <option>Zenith Bank</option>
                                <option>Ecobank Nigeria</option>
                                <option>Fidelity Bank</option>
                                <option>Union Bank</option>
                                <option>Stanbic IBTC Bank</option>
                                <option>Sterling Bank</option>
                                <option>Wema Bank</option>
                                <option>Keystone Bank</option>
                                <option>FCMB</option>
                                <option>Polaris Bank</option>
                                <option>Kuda Bank</option>
                                <option>ALAT by Wema</option>
                                <option>VFD Microfinance Bank</option>
                                <option>Opay</option>
                                <option>PalmPay</option>
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
                                    setUpdatedFormdata(prev => ({
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
                                Alternative Payment Method (Optional)
                            </Text>
                        </HStack>

                        <Text fontSize="sm" color="brand.gray.600">
                            Provide a backup account in case primary account has issues
                        </Text>

                        <FormControl>
                            <FormLabel color="brand.gray.700" fontSize="sm" fontWeight="600">
                                Backup Bank Name
                            </FormLabel>
                            <Select
                                placeholder="Select backup bank"
                                size="lg"
                                value={updatedFormdata.backupBankName}
                                onChange={(e) => setUpdatedFormdata(prev => ({ ...prev, backupBankName: e.target.value }))}
                                _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #00695C' }}
                            >
                                <option>Access Bank</option>
                                <option>Guaranty Trust Bank (GTB)</option>
                                <option>United Bank for Africa (UBA)</option>
                                <option>First Bank of Nigeria</option>
                                <option>Zenith Bank</option>
                            </Select>
                        </FormControl>

                        <FormControl>
                            <FormLabel color="brand.gray.700" fontSize="sm" fontWeight="600">
                                Backup Account Number
                            </FormLabel>
                            <Input
                                placeholder="0123456789"
                                type="text"
                                maxLength={10}
                                size="lg"
                                value={updatedFormdata.backupAccountNumber}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    setUpdatedFormdata(prev => ({ ...prev, backupAccountNumber: value }));
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
                            isChecked={updatedFormdata?.termsAccepted}
                            onChange={(e) => {
                                setUpdatedFormdata(prev => ({ ...prev, termsAccepted: e.target.checked }));
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
                            isChecked={updatedFormdata?.escrowAccepted}
                            onChange={(e) => {
                                setUpdatedFormdata(prev => ({ ...prev, escrowAccepted: e.target.checked }));
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
                            isChecked={updatedFormdata?.policyAccepted}
                            onChange={(e) => {
                                setUpdatedFormdata(prev => ({ ...prev, policyAccepted: e.target.checked }));
                                if (formError) setFormError('');
                            }}
                        >
                            <Text fontSize="sm" color="brand.gray.700">
                                I agree to LazyHomes <Text as="span" color="brand.primary" fontWeight="600">Agent Terms & Conditions</Text> and <Text as="span" color="brand.primary" fontWeight="600">Privacy Policy</Text>
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
                    { !isLoading && (
                        <Button
                            w="100%"
                            variant="primary"
                            size="lg"
                            onClick={handleSubmit}
                        >
                        Submit Listing for Verification
                    </Button>)}
                    { isLoading && (
                        <Spinner size="lg" color="brand.primary" />
                    )}
                </VStack>
            </Box>
        </Box>
    );
}
