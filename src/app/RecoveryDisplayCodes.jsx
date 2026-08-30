import {
  SimpleGrid,
  Box,
  Text,
  HStack,
  IconButton,
  useClipboard,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  Checkbox,
  useToast,
  VStack
} from "@chakra-ui/react";
import { CopyIcon, CheckIcon, DownloadIcon } from "@chakra-ui/icons";
import { useState } from "react";

function RecoveryCodeItem({ code }) {
  const { hasCopied, onCopy } = useClipboard(code);

  return (
    <Box
      borderWidth="1px"
      borderRadius="md"
      p={3}
      bg="gray.50"
      _dark={{ bg: "gray.700" }}
    >
      <HStack justify="space-between">
        <Text fontFamily="mono" fontWeight="bold" letterSpacing="wider">
          {code}
        </Text>
        <IconButton
          size="xs"
          icon={hasCopied ? <CheckIcon /> : <CopyIcon />}
          onClick={onCopy}
          aria-label="Copy code"
          colorScheme={hasCopied ? "green" : "gray"}
        />
      </HStack>
    </Box>
  );
}

export default function RecoveryCodesDisplay({ recoveryCodes, onCompleteSetup }) {
  const [hasSaved, setHasSaved] = useState(false);
  const toast = useToast();

  if (recoveryCodes.length === 0) return null;

  return (
    <VStack align="stretch" spacing={4}>
      <Alert status="warning" borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle>Save these codes securely!</AlertTitle>
          <AlertDescription>
            These recovery codes are shown <strong>only once</strong>. Store them in a safe
            place like a password manager. If you lose your authenticator app, you'll need one
            to regain access. Each code can only be used once.
          </AlertDescription>
        </Box>
      </Alert>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={3}>
        {recoveryCodes.map((code, i) => (
          <RecoveryCodeItem key={i} code={code} />
        ))}
      </SimpleGrid>

      <HStack>
        <Button
          leftIcon={<DownloadIcon />}
          variant="outline"
          onClick={() => {
            const blob = new Blob([recoveryCodes.join("\n")], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "lazyhomes-recovery-codes.txt";
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Download
        </Button>
        <Button
          onClick={() => {
            navigator.clipboard.writeText(recoveryCodes.join("\n"));
            toast({ title: "All codes copied", status: "success", duration: 2000 });
          }}
        >
          Copy all
        </Button>
      </HStack>

      <Checkbox isChecked={hasSaved} onChange={(e) => setHasSaved(e.target.checked)}>
        I have saved these recovery codes in a secure location
      </Checkbox>

      <Button isDisabled={!hasSaved} colorScheme="blue" onClick={onCompleteSetup}>
        Continue
      </Button>
    </VStack>
  );
}