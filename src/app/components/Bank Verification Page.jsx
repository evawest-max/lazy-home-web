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
  Spinner,
  Divider,
  Heading,
} from "@chakra-ui/react";
import axios from "axios";
import { confirmAccount, getActiveSettlementAccount, getBankcodes, verifyBankAccount } from "../../../api";

export default function BankVerificationForm({ user }) {
  const [fullName, setFullName] = useState()
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState(null);
  const [backupBank, setBackupBank] = useState("");
  const [backupAccountNumber, setBackupAccountNumber] = useState("");
  const [backupAccountName, setBackupAccountName] = useState("");
  const [loading, setLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [verificationToken, setVerificationToken] = useState(null)
  const [activeSettlementAccount, setActiveSettlementAccount] = useState(null)
  const [loadingPage, setLoadingPage] = useState(false)

  useEffect(() => {
    const fetchBanks = async () => {
      setLoadingPage(true)
      try {
        const res = await getBankcodes()
        setBanks(res.data.data);
        console.log("this are the banks", res.data.data)
        const response = await getActiveSettlementAccount()
        setActiveSettlementAccount(response.data.data)
        console.log(response)
      } catch (err) {
        console.error("Error fetching banks:", err);
      } finally {
        setLoadingPage(false);
      }
    };
    fetchBanks();
  }, []);

  const verifyAccount = async () => {
    const chossenBank = banks.find(bank => bank.code === selectedBank);
    setLoading(true);
    console.log(chossenBank.name, accountNumber, selectedBank)
    try {
      const res = await verifyBankAccount(accountNumber, selectedBank)
      console.log(res.data.data)
      console.log("bank details", accountNumber, selectedBank)
      setAccountName(res.data.data.accountName);
      setVerificationToken(res.data.data.verificationToken)
    } catch (err) {
      console.log(err)
      setAccountName("Verification failed. Please check details.");
    } finally {
      setLoading(false);
    }
  };

  const saveAccount = async () => {
    const chossenBank = banks.find(bank => bank.code === selectedBank);
    setLoading(true);
    console.log(chossenBank.name, accountNumber, selectedBank)
    try {
      const res = await confirmAccount(verificationToken)
      console.log(res.data.data)
      setVerificationToken("")
    } catch (err) {
      console.log(err)
      setAccountName("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyBackupAccount = async () => {
    setBackupLoading(true);
    try {
      const res = await axios.get("https://api.paystack.co/bank/resolve", {
        params: { account_number: backupAccountNumber, bank_code: backupBank },
        headers: { Authorization: `Bearer ${process.env.REACT_APP_PAYSTACK_SECRET}` },
      });
      setBackupAccountName(res.data.data.account_name);
    } catch (err) {
      setBackupAccountName("Verification failed. Please check details.");
    } finally {
      setBackupLoading(false);
    }
  };

  if (loadingPage) {
    return (
      <Box
        maxW="md"
        mx="auto"
        mt={10}
        p={6}
        borderWidth="1px"
        borderRadius="lg"
        shadow="md"
        bg="#E0F2F1" // Page background wash

        bg="brand.background" px={6} py={10}
      >
        <Spinner />
      </Box>
    )
  }

  return (
    <Box
      maxW="md"
      mx="auto"
      mt={10}
      p={6}
      borderWidth="1px"
      borderRadius="lg"
      shadow="md"
      bg="#E0F2F1" // Page background wash

      bg="brand.background" px={6} py={10}
    >
      <Heading color="#00695C" mb={6}>
        Bank Verification
      </Heading>

      <VStack spacing={4} align="stretch">
        {/* Primary Account */}
        {!activeSettlementAccount &&
        (<Box>
        <FormControl>
          <FormLabel color="#004D40">Select Bank</FormLabel>
          <Select
            placeholder="Choose bank"
            onChange={(e) => setSelectedBank(e.target.value)}
            bg="#B2DFDB"
            _hover={{ bg: "#E0F2F1" }}
          >
            {banks.map((bank) => (
              <option key={bank.code} value={bank.code}>
                {bank.name}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel color="#004D40">Account Number</FormLabel>
          <Input
            type="text"
            placeholder="Enter account number"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            bg="white"
          />
        </FormControl>

        {accountName && (
          <Text fontWeight="bold" color="#2E7D32">
            Account Name: {accountName}
          </Text>
        )}

        {verificationToken ?
          (<Button
            bg="#00695C"
            color="white"
            _hover={{ bg: "#004D40" }}
            onClick={saveAccount}
            isDisabled={!verificationToken}
          >
            {loading ? <Spinner size="sm" /> : "Save Account"}
          </Button>)
          :
          (<Button
            bg="#00695C"
            color="white"
            _hover={{ bg: "#004D40" }}
            onClick={verifyAccount}
            isDisabled={!selectedBank || !accountNumber}
          >
            {loading ? <Spinner size="sm" /> : "Verify Account"}
          </Button>)
        }

        </Box>) }




        {activeSettlementAccount ?
          (<Box>
            <Text> verified Account details</Text>
            <Text>
              Account Name: {activeSettlementAccount.accountName}
            </Text>
            <Text>
              Account Number: {activeSettlementAccount.accountNumber}
            </Text>
            <Text>
              bank Name: {activeSettlementAccount.bankName}
            </Text>
            <Button>
              Change account details
            </Button>
          </Box>)
          :
          (<Text>
            No verified account added
          </Text>)
        }
      </VStack>
    </Box>
  );
}
