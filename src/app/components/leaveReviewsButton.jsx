import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
  HStack,
  IconButton,
  VStack,
  useToast,
  useDisclosure,
} from "@chakra-ui/react";
import { StarIcon } from "@chakra-ui/icons";
import { useState, useEffect } from "react";

export default function DualReviewModal({ transactionSuccess, onSubmit }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [landlordRating, setLandlordRating] = useState(0);
  const [landlordReview, setLandlordReview] = useState("");
  const [appRating, setAppRating] = useState(0);
  const [appReview, setAppReview] = useState("");
  const toast = useToast();

  // Auto-open when transaction succeeds
  useEffect(() => {
    if (transactionSuccess) {
      onOpen();
    }
  }, [transactionSuccess, onOpen]);

  const handleSubmit = () => {
    if (landlordRating === 0) {
      toast({ title: "Please rate the landlord", status: "warning" });
      return;
    }
    if (!landlordReview.trim()) {
      toast({ title: "Please write a landlord review", status: "warning" });
      return;
    }

    const payload = {
      landlord: { rating: landlordRating, review: landlordReview },
      app: appRating > 0 || appReview.trim()
        ? { rating: appRating, review: appReview }
        : null,
    };

    onSubmit?.(payload);

    toast({
      title: "Thank you!",
      description: "Your reviews have been submitted.",
      status: "success",
      duration: 4000,
    });

    // reset
    setLandlordRating(0);
    setLandlordReview("");
    setAppRating(0);
    setAppReview("");
    onClose();
  };

  return (
    <>
      {/* Persistent button for later access */}
      <Button size= "sm" colorScheme="blue" onClick={onOpen}>
        Leave Reviews
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Leave Reviews</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={6}>
              {/* Landlord Section - Mandatory */}
              <div>
                <strong>Landlord Rating (required)</strong>
                <HStack spacing={1} mt={1}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <IconButton
                      key={`landlord-${star}`}
                      icon={<StarIcon />}
                      onClick={() => setLandlordRating(star)}
                      colorScheme={landlordRating >= star ? "yellow" : "gray"}
                      variant="ghost"
                      aria-label={`Rate landlord ${star}`}
                    />
                  ))}
                </HStack>
                <Textarea
                  mt={2}
                  placeholder="Write your landlord review..."
                  value={landlordReview}
                  onChange={(e) => setLandlordReview(e.target.value)}
                />
              </div>

              {/* App Section - Optional */}
              <div>
                <strong>SafeTenants App Rating (optional)</strong>
                <HStack spacing={1} mt={1}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <IconButton
                      key={`app-${star}`}
                      icon={<StarIcon />}
                      onClick={() => setAppRating(star)}
                      colorScheme={appRating >= star ? "yellow" : "gray"}
                      variant="ghost"
                      aria-label={`Rate app ${star}`}
                    />
                  ))}
                </HStack>
                <Textarea
                  mt={2}
                  placeholder="Write your app review (optional)..."
                  value={appReview}
                  onChange={(e) => setAppReview(e.target.value)}
                />
              </div>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button size="sm" colorScheme="blue" onClick={handleSubmit}>
              Submit Reviews
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
