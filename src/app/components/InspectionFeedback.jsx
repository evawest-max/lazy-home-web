import { useState, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Image,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Input,
} from '@chakra-ui/react';
import { ArrowLeft, Camera, CheckCircle, XCircle, AlertTriangle, ShieldCheck, UserX, Star } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { mockProperties } from './mockData';


export default function InspectionFeedback() {
  const { id } = useParams();
  const property = mockProperties.find((p) => p.id === parseInt(id)); // Replace with actual data fetching logic based on ID
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [proofPhoto, setProofPhoto] = useState('');
  const [comments, setComments] = useState('');
  const [agentComment, setAgentComment] = useState('');
  const [agentRating, setAgentRating] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const { isOpen: isRatingOpen, onOpen: onOpenRating, onClose: onCloseRating } = useDisclosure();

  const photoInputRef = useRef(null);

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      setProofPhoto(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    if (!proofPhoto) {
      alert('Please upload a proof photo');
      return;
    }

    if (!selectedFeedback) {
      alert('Please select your feedback');
      return;
    }

    if (
      (selectedFeedback === 'dispute' ||
        selectedFeedback === 'rejected') &&
      !comments.trim()
    ) {
      alert('Please provide comments explaining the situation');
      return;
    }

    const feedbackData = {
      type: selectedFeedback,
      photo: proofPhoto,
      comments: comments,
      timestamp: new Date().toISOString(),
    };

    console.log('Feedback submitted:', feedbackData);

    let message = 'Feedback submitted successfully!\n\n';

    if (selectedFeedback === 'proceed') {
      message +=
        "Great! We'll connect you with the landlord to finalize the rental.";
    } else if (selectedFeedback === 'dispute') {
      message +=
        'Your dispute has been filed. Our team will review it within 24 hours.';
    } else if (selectedFeedback === 'rejected') {
      message +=
        "Thank you for your feedback. We'll review this case.";
    } else {
      message += 'Thank you for your honest feedback!';
    }

    setFeedbackMessage(message);
    onOpenRating();
  };

  const handleRatingSubmit = () => {
    if (!agentRating) {
      alert('Please select a rating for your agent.');
      return;
    }

    console.log('Agent rating submitted:', agentRating);
    alert('Thanks! Your agent rating has been submitted.');
    onCloseRating();
  };

  const requiresComments =
    selectedFeedback === 'dispute' ||
    selectedFeedback === 'rejected';

  const canSubmit =
    proofPhoto &&
    selectedFeedback &&
    (!requiresComments || comments.trim().length > 0);

  return (
    <Box minH="100vh" bg="brand.background" pb="120px">
      <Box bg="brand.primary" px={6} pt={12} pb={8}>
        <HStack mb={6}>
          <Link to="/dashboard">
            <IconButton
              icon={<ArrowLeft size={20} />}
              variant="ghost"
              color="white"
              _hover={{ bg: 'whiteAlpha.200' }}
              aria-label="Back"
            />
          </Link>
          <Text fontSize="xl" fontWeight="bold" color="white" flex={1}>
            Inspection Feedback
          </Text>
        </HStack>
      </Box>

      <VStack align="stretch" px={6} mt={-4} spacing={6}>
        <Box bg="white" borderRadius="xl" p={6} boxShadow="md">
          <VStack align="stretch" spacing={4}>
            <Image
              src={property?.image || 'https://via.placeholder.com/400x200?text=Property+Image'}
              alt="Property"
              borderRadius="lg"
              h="200px"
              w="100%"
              objectFit="cover"
            />

            <VStack align="stretch" spacing={2}>
              <Text fontSize="lg" fontWeight="600" color="brand.gray.800">
                3 Bedroom Duplex in Lekki
              </Text>
              <Text fontSize="sm" color="brand.gray.600">
                Inspection scheduled: Today, 2:00 PM
              </Text>
            </VStack>
          </VStack>
        </Box>

        <Box bg="white" borderRadius="xl" p={6} boxShadow="sm">
          <VStack align="stretch" spacing={4}>
            <Text fontSize="lg" fontWeight="600" color="brand.gray.800">
              Upload Proof Photo
            </Text>

            <Text fontSize="sm" color="brand.gray.600">
              Take a clear photo of the property to verify your inspection
            </Text>

            {proofPhoto ? (
              <Box position="relative" borderRadius="lg" overflow="hidden">
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: 'none' }}
                  onChange={handlePhotoUpload}
                />
                <Image
                  src={proofPhoto}
                  alt="Proof photo"
                  h="200px"
                  w="100%"
                  objectFit="cover"
                />
                <Box
                  position="absolute"
                  bottom={3}
                  left={3}
                  bg="brand.success"
                  color="white"
                  fontSize="sm"
                  fontWeight="600"
                  px={3}
                  py={2}
                  borderRadius="md"
                  display="flex"
                  alignItems="center"
                  gap={2}
                >
                  <CheckCircle size={16} />
                  Photo Uploaded
                </Box>
                <Button
                  position="absolute"
                  top={3}
                  right={3}
                  size="sm"
                  onClick={() => photoInputRef.current?.click()}
                  bg="whiteAlpha.800"
                  _hover={{ bg: 'brand.background' }}
                >
                  Change Photo
                </Button>
              </Box>
            ) : (
              <Box
                border="2px dashed"
                borderColor="brand.gray.300"
                borderRadius="lg"
                p={12}
                textAlign="center"
                bg="brand.background"
                cursor="pointer"
                _hover={{ borderColor: 'brand.primary', bg: 'white' }}
                onClick={() => photoInputRef.current?.click()}
              >
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: 'none' }}
                  onChange={handlePhotoUpload}
                />
                <VStack spacing={3}>
                  <Box bg="brand.primary" p={4} borderRadius="full">
                    <Camera size={32} color="white" />
                  </Box>
                  <Text fontWeight="600" color="brand.gray.700">
                    Take Photo
                  </Text>
                  <Text fontSize="sm" color="brand.gray.500">
                    Required for verification
                  </Text>
                </VStack>
              </Box>
            )}
          </VStack>
        </Box>

        <Box bg="white" borderRadius="xl" p={6} boxShadow="sm">
          <VStack align="stretch" spacing={4}>
            <Text fontSize="lg" fontWeight="600" color="brand.gray.800">
              How was your inspection?
            </Text>

            <VStack align="stretch" spacing={3}>
              <Button
                variant="secondary"
                size="lg"
                justifyContent="flex-start"
                leftIcon={<CheckCircle size={20} color="#2E7D32" />}
                h="auto"
                py={4}
                bg={selectedFeedback === 'proceed' ? 'brand.background' : 'white'}
                borderColor={selectedFeedback === 'proceed' ? 'brand.success' : 'brand.gray.300'}
                borderWidth="2px"
                onClick={() => setSelectedFeedback('proceed')}
              >
                <VStack align="start" spacing={0} flex={1}>
                  <Text fontWeight="600">Property matches listing</Text>
                  <Text fontSize="sm" color="brand.gray.600" fontWeight="normal">
                    I want to proceed with renting
                  </Text>
                </VStack>
              </Button>

              <Button
                variant="secondary"
                size="lg"
                justifyContent="flex-start"
                leftIcon={<CheckCircle size={20} color="#00838F" />}
                h="auto"
                py={4}
                bg={selectedFeedback === 'not-interested' ? 'brand.background' : 'white'}
                borderColor={selectedFeedback === 'not-interested' ? 'brand.accent' : 'brand.gray.300'}
                borderWidth="2px"
                onClick={() => setSelectedFeedback('not-interested')}
              >
                <VStack align="start" spacing={0} flex={1}>
                  <Text fontWeight="600">Matches but not interested</Text>
                  <Text fontSize="sm" color="brand.gray.600" fontWeight="normal">
                    Property is as described
                  </Text>
                </VStack>
              </Button>

              <Button
                variant="secondary"
                size="lg"
                justifyContent="flex-start"
                leftIcon={<UserX size={20} color="#E65100" />}
                h="auto"
                py={4}
                bg={selectedFeedback === 'rejected' ? 'brand.background' : 'white'}
                borderColor={selectedFeedback === 'rejected' ? 'brand.warning' : 'brand.gray.300'}
                borderWidth="2px"
                onClick={() => setSelectedFeedback('rejected')}
              >
                <VStack align="start" spacing={0} flex={1}>
                  <Text fontWeight="600" color="brand.warning">
                    Matches but landlord rejected me
                  </Text>
                  <Text fontSize="sm" color="brand.gray.600" fontWeight="normal">
                    Property is good but landlord declined
                  </Text>
                </VStack>
              </Button>

              <Button
                variant="secondary"
                size="lg"
                justifyContent="flex-start"
                leftIcon={<XCircle size={20} color="#C62828" />}
                h="auto"
                py={4}
                bg={selectedFeedback === 'dispute' ? 'brand.background' : 'white'}
                borderColor={selectedFeedback === 'dispute' ? 'brand.error' : 'brand.gray.300'}
                borderWidth="2px"
                onClick={() => setSelectedFeedback('dispute')}
              >
                <VStack align="start" spacing={0} flex={1}>
                  <Text fontWeight="600" color="brand.error">
                    Does not match listing
                  </Text>
                  <Text fontSize="sm" color="brand.gray.600" fontWeight="normal">
                    File a dispute
                  </Text>
                </VStack>
              </Button>
            </VStack>
          </VStack>
        </Box>

        <Box bg="white" borderRadius="xl" p={6} boxShadow="md" border="2px solid" borderColor="brand.success">
          <VStack spacing={4}>
            <HStack justify="center" bg="brand.success" py={3} px={4} borderRadius="lg" w="100%">
              <ShieldCheck size={20} color="white" />
              <Text fontSize="sm" fontWeight="bold" color="white">
                YOUR MONEY IS STILL PROTECTED
              </Text>
            </HStack>

            <VStack spacing={2} bg="brand.background" p={4} borderRadius="lg" w="100%">
              <Text fontSize="sm" fontWeight="600" color="brand.gray.800" textAlign="center">
                ✓ If property doesn't match, click "Does not match"
              </Text>
              <Text fontSize="sm" fontWeight="600" color="brand.gray.800" textAlign="center">
                ✓ Get instant FULL REFUND to your account
              </Text>
              <Text fontSize="sm" fontWeight="600" color="brand.gray.800" textAlign="center">
                ✓ Your escrow protection covers you 100%
              </Text>
            </VStack>
          </VStack>
        </Box>

        {/* <HStack spacing={1}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={28}
              cursor="pointer"
              fill={star <= rating ? "#FFD700" : "transparent"}
              color={star <= rating ? "#FFD700" : "#CBD5E0"}
              onClick={() => setRating(star)}
            />
          ))}
        </HStack> */}

        {selectedFeedback && (
          <Box bg="white" borderRadius="xl" p={6} boxShadow="sm">
            <VStack align="stretch" spacing={4}>
              <Text fontSize="lg" fontWeight="600" color="brand.gray.800">
                Additional Comments {selectedFeedback === 'dispute' || selectedFeedback === 'rejected' ? '(Required)' : '(Optional)'}
              </Text>

              <Text fontSize="sm" color="brand.gray.600">
                {selectedFeedback === 'dispute' && 'Please provide details about what doesn\'t match the listing. This helps us investigate.'}
                {selectedFeedback === 'rejected' && 'Please share why the landlord rejected you. This feedback helps improve our platform.'}
                {selectedFeedback === 'not-interested' && 'What made you decide not to proceed? Your feedback helps improve listings.'}
                {selectedFeedback === 'proceed' && 'Any additional notes or observations about the property?'}
              </Text>

              <Textarea
                placeholder={
                  selectedFeedback === 'dispute' ? 'Describe the differences between the listing and actual property...' :
                    selectedFeedback === 'rejected' ? 'Please explain the reason given by the landlord...' :
                      'Share your thoughts...'
                }
                rows={5}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                borderColor={requiresComments && !comments.trim() ? 'brand.warning' : 'brand.gray.300'}
                _focus={{
                  borderColor: requiresComments && !comments.trim() ? 'brand.warning' : 'brand.primary',
                  boxShadow: requiresComments && !comments.trim() ? '0 0 0 1px #E65100' : '0 0 0 1px #00695C'
                }}
              />

              {requiresComments && !comments.trim() && (
                <HStack spacing={2} bg="brand.background" p={3} borderRadius="md" borderLeft="3px solid" borderColor="brand.warning">
                  <AlertTriangle size={16} color="#E65100" />
                  <Text fontSize="xs" color="brand.warning" fontWeight="600">
                    Comments are required for this feedback type
                  </Text>
                </HStack>
              )}

              <Text fontSize="xs" color="brand.gray.500">
                Your feedback is {selectedFeedback === 'dispute' ? 'shared with our team and the landlord' : 'kept confidential and helps improve our service'}
              </Text>
            </VStack>
          </Box>
        )}

        <Box
          bg="brand.background"
          border="2px solid"
          borderColor="brand.accent"
          borderRadius="lg"
          p={4}
        >
          <HStack spacing={3}>
            <AlertTriangle size={20} color="#26A69A" />
            <Text fontSize="sm" color="brand.gray.700">
              Your honest feedback protects other renters and helps us maintain trust
            </Text>
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
        borderColor="brand.primary"
        p={6}
        boxShadow="2xl"
      >
        <Button
          w="100%"
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          isDisabled={!canSubmit}
          opacity={canSubmit ? 1 : 0.5}
        >
          {!proofPhoto ? 'Upload Proof Photo First' :
            !selectedFeedback ? 'Select Your Feedback' :
              selectedFeedback === 'proceed' ? 'Proceed with Rental' :
                selectedFeedback === 'dispute' ? 'Submit Dispute' :
                  'Submit Feedback'}
        </Button>
      </Box>

      <Modal isOpen={isRatingOpen} onClose={onCloseRating} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="2xl" overflow="hidden">
          <ModalHeader>Rate Your Agent</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color="brand.gray.700">
                {feedbackMessage}
              </Text>
              <Text fontSize="sm" fontWeight="600" color="brand.gray.800">
                How would you rate your agent experience?
              </Text>
              <HStack justify="center" spacing={2}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={32}
                    cursor="pointer"
                    fill={star <= agentRating ? '#FFD700' : 'transparent'}
                    color={star <= agentRating ? '#FFD700' : '#CBD5E0'}
                    onClick={() => setAgentRating(star)}
                  />
                ))}
              </HStack>
              <Text fontSize="sm" color="brand.gray.600" textAlign="center">
                Tap a star to rate your agent.
              </Text>
              <Input
                placeholder="Add a comment about your agent..."
                value={agentComment}
                onChange={(e) => setAgentComment(e.target.value)}
              />

            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              w="100%"
              variant="primary"
              size="lg"
              onClick={handleRatingSubmit}
            >
              Submit Rating
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
