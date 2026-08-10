import { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Text,
  VStack,
  HStack,
  Spinner,
  Heading,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Alert,
  AlertIcon,
  Icon,
  Flex,
  Divider,
  useToast
} from "@chakra-ui/react";
import { confirmAccount, getActiveSettlementAccount, getBankcodes, verifyBankAccount } from "../../../api";

export default function BankVerificationForm({ user }) {
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verificationToken, setVerificationToken] = useState(null)
  const [activeSettlementAccount, setActiveSettlementAccount] = useState(null)
  const [loadingPage, setLoadingPage] = useState(true)
  const toast = useToast();

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await getBankcodes()
        setBanks(res.data.data);
        const response = await getActiveSettlementAccount()
        setActiveSettlementAccount(response.data.data)
      } catch (err) {
        console.error("Error fetching banks:", err);
      } finally {
        setLoadingPage(false);
      }
    };
    fetchBanks();
  }, []);

  const verifyAccount = async () => {
    if(!selectedBank || accountNumber.length !== 10) {
      toast({ title: "Enter valid 10-digit account number", status: "warning", duration: 3000 })
      return
    }
    setLoading(true);
    try {
      const res = await verifyBankAccount(accountNumber, selectedBank)
      setAccountName(res.data.data.accountName);
      setVerificationToken(res.data.data.verificationToken)
      toast({ title: "Account verified", status: "success", duration: 3000 })
    } catch (err) {
      setAccountName(null);
      toast({ title: "Verification failed", description: "Please check details", status: "error", duration: 4000 })
    } finally {
      setLoading(false);
    }
  };

  const saveAccount = async () => {
    setLoading(true);
    try {
      await confirmAccount(verificationToken)
      setVerificationToken(null)
      setAccountName(null)
      const response = await getActiveSettlementAccount()
      setActiveSettlementAccount(response.data.data)
      toast({ title: "Bank account saved successfully", status: "success", duration: 4000 })
    } catch (err) {
      toast({ title: "Failed to save", status: "error" })
    } finally {
      setLoading(false)
    }
  };

  if (loadingPage) {
    return (
      <Flex minH="60vh" align="center" justify="center" bg="#F8FAFC">
        <VStack>
          <Spinner size="lg" color="teal.600" thickness="3px" />
          <Text color="gray.500" fontSize="sm">Loading banks...</Text>
        </VStack>
      </Flex>
    )
  }

  return (
    <Box bg="brand.background" minH="100vh" px={4} py={12}>
      <Box maxW="480px" mx="auto">
        
        {/* Header */}
        <VStack spacing={2} mb={8} textAlign="center">
          <Badge colorScheme="teal" variant="subtle" px={3} py={1} borderRadius="full" fontSize="xs" letterSpacing="wide">
            PAYOUT SETTINGS
          </Badge>
          <Heading size="lg" color="gray.800" fontWeight="700">
            Bank Verification
          </Heading>
          <Text color="gray.500" fontSize="sm" maxW="320px">
            Verify your bank account to receive settlements. This account will be used for all payouts.
          </Text>
        </VStack>

        <Card borderRadius="2xl" boxShadow="0 4px 24px rgba(0,0,0,0.06)" border="1px solid" borderColor="gray.100" overflow="hidden">
          <CardBody p={8}>
            
            {activeSettlementAccount ? (
              <VStack spacing={6} align="stretch">
                <HStack justify="space-between">
                  <HStack>
                    <Box w="10" h="10" bg="teal.50" borderRadius="full" display="grid" placeItems="center">
                      <Text>🏦</Text>
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="600" color="gray.800" fontSize="sm">Active Settlement Account</Text>
                      <HStack><Box w={2} h={2} bg="green.400" borderRadius="full" /><Text fontSize="xs" color="green.600" fontWeight="500">Verified & Active</Text></HStack>
                    </VStack>
                  </HStack>
                </HStack>

                <Box bg="gray.50" borderRadius="xl" p={5} border="1px solid" borderColor="gray.100">
                  <VStack spacing={4} align="stretch">
                    <Flex justify="space-between"><Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">Account Name</Text><Text fontWeight="600" fontSize="sm">{activeSettlementAccount.accountName}</Text></Flex>
                    <Divider />
                    <Flex justify="space-between"><Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">Account Number</Text><Text fontWeight="600" fontSize="sm" fontFamily="mono">{activeSettlementAccount.accountNumber}</Text></Flex>
                    <Divider />
                    <Flex justify="space-between"><Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">Bank</Text><Text fontWeight="600" fontSize="sm">
                    {banks.map((bank) => (
                      activeSettlementAccount.bankCode === bank.code ? bank.name : null
                     
                    ))}
                    </Text></Flex>
                  </VStack>
                </Box>

                <Button variant="outline" borderRadius="full" onClick={() => setActiveSettlementAccount(null)} size="sm" colorScheme="gray">
                  Change account details
                </Button>
              </VStack>
            ) : (
              <VStack spacing={6} align="stretch">
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="600" color="gray.600" letterSpacing="wide" textTransform="uppercase">Bank Name</FormLabel>
                  <Select
                    placeholder="Select your bank"
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    bg="white"
                    borderColor="gray.200"
                    borderRadius="lg"
                    size="lg"
                    fontSize="sm"
                    _focus={{ borderColor: "teal.400", boxShadow: "0 0 0 1px var(--chakra-colors-teal-400)" }}
                  >
                    {banks.map((bank) => (
                      <option key={bank.code} value={bank.code}>{bank.name}</option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="600" color="gray.600" letterSpacing="wide" textTransform="uppercase">Account Number</FormLabel>
                  <Input
                    type="text"
                    placeholder="0123456789"
                    maxLength={10}
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                    bg="white"
                    borderColor="gray.200"
                    borderRadius="lg"
                    size="lg"
                    fontSize="sm"
                    fontFamily="mono"
                    letterSpacing="wide"
                    _focus={{ borderColor: "teal.400", boxShadow: "0 0 0 1px var(--chakra-colors-teal-400)" }}
                  />
                  <Text fontSize="xs" color="gray.400" mt={2}>Enter 10-digit NUBAN account number</Text>
                </FormControl>

                {accountName && (
                  <Alert status="success" borderRadius="lg" bg="green.50" border="1px solid" borderColor="green.100">
                    <AlertIcon color="green.500" />
                    <VStack align="start" spacing={0}>
                      <Text fontSize="xs" color="green.600" fontWeight="600">ACCOUNT NAME CONFIRMED</Text>
                      <Text fontSize="sm" fontWeight="600" color="gray.800">{accountName}</Text>
                    </VStack>
                  </Alert>
                )}

                {verificationToken ? (
                  <VStack spacing={3}>
                    <Button
                      w="full"
                      bg="gray.900"
                      color="white"
                      size="lg"
                      borderRadius="full"
                      _hover={{ bg: "black" }}
                      onClick={saveAccount}
                      isLoading={loading}
                      loadingText="Saving..."
                    >
                      Confirm & Save Account
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setVerificationToken(null); setAccountName(null); }}>
                      Use different account
                    </Button>
                  </VStack>
                ) : (
                  <Button
                    w="full"
                    bg="teal.600"
                    color="white"
                    size="lg"
                    borderRadius="full"
                    _hover={{ bg: "teal.700" }}
                    _active={{ bg: "teal.800" }}
                    onClick={verifyAccount}
                    isLoading={loading}
                    loadingText="Verifying..."
                    isDisabled={!selectedBank || accountNumber.length !== 10}
                  >
                    Verify Account
                  </Button>
                )}

                <HStack justify="center" pt={2}>
                  <Text fontSize="xs" color="gray.400">🔒 Bank-level encryption • Verified by Paystack</Text>
                </HStack>
              </VStack>
            )}
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
}