import {
    Box,
    VStack,
    HStack,
    Text,
    Button,
    IconButton,
    Grid,
    Progress,
    Image,
} from '@chakra-ui/react';
import {
    ArrowLeft,
    Upload,
    Image as ImageIcon,
    Video,
    X,
    ShieldCheck,
    AlertCircle,
    Camera,
    CheckCircle,
    ArrowLeftIcon,
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function ListPropertyStep2( { formData, setFormData, onNext }) {
    const currentStep = 2;
    const totalSteps = 4;

    const initialData = { photos: [], video: "" };

    const [uploadedPhotos, setUploadedPhotos] = useState(
    formData.photos || [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    ]
  );

  const [videoUrl, setVideoUrl] = useState(formData.video || "");

  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // ✅ Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      uploadedPhotos.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });

      if (videoUrl && videoUrl.startsWith("blob:")) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [uploadedPhotos, videoUrl]);

  const handlePhotoUpload = (event) => {
    const files = event.target.files;
    if (files) {
      const newPhotos = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );

      setUploadedPhotos((prev) =>
        [...prev, ...newPhotos].slice(0, 20)
      );
      setFormData((prev) => ({ ...prev, photos: [...prev.photos, ...newPhotos].slice(0, 20) }));
    }
  };

  const handleVideoUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const newVideoUrl = URL.createObjectURL(file);
      setVideoUrl(newVideoUrl);
      setFormData((prev) => ({ ...prev, video: newVideoUrl }));
    }
  };

  const removePhoto = (index) => {
    setUploadedPhotos((prev) =>
      prev.filter((_, i) => i !== index)
    );
    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos].filter((_, i) => i !== index)
    }));

  };

  const handleContinue = () => {
    sessionStorage.setItem('listingFormData', JSON.stringify(formData));

    // if (onNext) {
    //   onNext({ photos: uploadedPhotos, video: videoUrl });
    // }
  };



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
            </Box>

            <VStack align="stretch" px={6} mt={-4} spacing={6}>
        <Box bg="white" borderRadius="xl" p={6} boxShadow="md" border="2px solid" borderColor="brand.accent">
          <VStack spacing={4}>
            <HStack justify="center" bg="brand.accent" py={3} px={4} borderRadius="lg" w="100%">
              <Camera size={20} color="white" />
              <Text fontSize="sm" fontWeight="bold" color="white">
                QUALITY PHOTOS ATTRACT MORE RENTERS
              </Text>
            </HStack>

            <VStack spacing={2} bg="brand.background" p={4} borderRadius="lg" w="100%">
              <Text fontSize="sm" fontWeight="600" color="brand.gray.800" textAlign="center">
                ✓ Upload at least 5 clear, well-lit photos
              </Text>
              <Text fontSize="sm" fontWeight="600" color="brand.gray.800" textAlign="center">
                ✓ Show all rooms, bathrooms, and exterior
              </Text>
              <Text fontSize="sm" fontWeight="600" color="brand.gray.800" textAlign="center">
                ✓ Videos get 3x more inquiries!
              </Text>
            </VStack>
          </VStack>
        </Box>

        <Box bg="white" borderRadius="xl" p={6} boxShadow="sm">
          <VStack align="stretch" spacing={5}>
            <HStack spacing={3} justify="space-between" isRequired>
              <HStack spacing={3}>
                <Box bg="brand.primary" p={2} borderRadius="full">
                  <ImageIcon size={20} color="white" />
                </Box>
                <Text fontSize="lg" fontWeight="bold" color="brand.gray.800">
                  Property Photos
                </Text>
              </HStack>
              <Text fontSize="sm" color="brand.gray.600">
                {uploadedPhotos.length}/20
              </Text>
            </HStack>

            <Box
              border="2px dashed"
              borderColor="brand.primary"
              borderRadius="lg"
              p={8}
              textAlign="center"
              bg="brand.background"
              cursor="pointer"
              _hover={{ borderColor: 'brand.accent', bg: 'white' }}
              transition="all 0.2s"
              onClick={() => photoInputRef.current?.click()}
            >
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handlePhotoUpload}
              />
              <VStack spacing={4}>
                <Box bg="brand.primary" p={4} borderRadius="full">
                  <Upload size={32} color="white" />
                </Box>
                <VStack spacing={1}>
                  <Text fontWeight="600" color="brand.gray.800">
                    Upload Photos
                  </Text>
                  <Text fontSize="sm" color="brand.gray.600">
                    Click to browse or drag and drop
                  </Text>
                  <Text fontSize="xs" color="brand.gray.500">
                    JPG, PNG up to 10MB each
                  </Text>
                </VStack>
              </VStack>
            </Box>

            {uploadedPhotos.length > 0 && (
              <VStack spacing={3} align="stretch">
                <Text fontSize="sm" fontWeight="600" color="brand.gray.700">
                  Uploaded Photos ({uploadedPhotos.length})
                </Text>

                <Grid templateColumns="repeat(3, 1fr)" gap={3}>
                  {uploadedPhotos.map((photo, index) => (
                    <Box key={index} position="relative" borderRadius="lg" overflow="hidden">
                      <Image
                        src={photo}
                        alt={`Property photo ${index + 1}`}
                        h="100px"
                        w="100%"
                        objectFit="cover"
                      />
                      {index === 0 && (
                        <Box
                          position="absolute"
                          bottom={2}
                          left={2}
                          bg="brand.success"
                          color="white"
                          fontSize="xs"
                          fontWeight="600"
                          px={2}
                          py={1}
                          borderRadius="md"
                        >
                          Cover Photo
                        </Box>
                      )}
                      <IconButton
                        icon={<X size={16} />}
                        position="absolute"
                        top={2}
                        right={2}
                        size="xs"
                        bg="white"
                        color="brand.error"
                        borderRadius="full"
                        aria-label="Remove"
                        _hover={{ bg: 'brand.error', color: 'white' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto(index);
                        }}
                      />
                    </Box>
                  ))}
                </Grid>

                <Text fontSize="xs" color="brand.gray.600">
                  Drag photos to reorder. First photo is the cover image.
                </Text>
              </VStack>
            )}
          </VStack>
        </Box>

        <Box bg="white" borderRadius="xl" p={6} boxShadow="sm">
          <VStack align="stretch" spacing={5}>
            <HStack spacing={3}>
              <Box bg="brand.accent" p={2} borderRadius="full">
                <Video size={20} color="white" />
              </Box>
              <Text fontSize="lg" fontWeight="bold" color="brand.gray.800">
                Property Video (Optional)
              </Text>
            </HStack>

            <Box
              border="2px dashed"
              borderColor={videoUrl ? 'brand.success' : 'brand.accent'}
              borderRadius="lg"
              p={8}
              textAlign="center"
              bg="brand.background"
              cursor="pointer"
              _hover={{ borderColor: 'brand.primary', bg: 'white' }}
              transition="all 0.2s"
              onClick={() => videoInputRef.current?.click()}
            >
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                style={{ display: 'none' }}
                onChange={handleVideoUpload}
              />
              <VStack spacing={4}>
                <Box bg={videoUrl ? 'brand.success' : 'brand.accent'} p={4} borderRadius="full">
                  {videoUrl ? <CheckCircle size={32} color="white" /> : <Video size={32} color="white" />}
                </Box>
                <VStack spacing={1}>
                  <Text fontWeight="600" color="brand.gray.800">
                    {videoUrl ? 'Video Uploaded ✓' : 'Upload Video Tour'}
                  </Text>
                  <Text fontSize="sm" color="brand.gray.600">
                    {videoUrl ? 'Click to replace video' : 'Show renters a walkthrough of the property'}
                  </Text>
                  <Text fontSize="xs" color="brand.gray.500">
                    MP4, MOV up to 100MB
                  </Text>
                </VStack>

                <Box bg="white" px={4} py={2} borderRadius="lg">
                  <Text fontSize="xs" fontWeight="600" color="brand.success">
                    🎥 Videos get 3x more inquiries!
                  </Text>
                </Box>
              </VStack>
            </Box>
          </VStack>
        </Box>

        <Box bg="brand.background" border="2px solid" borderColor="brand.success" borderRadius="lg" p={5}>
          <VStack spacing={4}>
            <HStack spacing={2}>
              <ShieldCheck size={20} color="#2E7D32" />
              <Text fontSize="md" fontWeight="bold" color="brand.success">
                Photo Quality Tips
              </Text>
            </HStack>

            <VStack spacing={3} align="stretch">
              <HStack spacing={2} align="start">
                <CheckCircle size={16} color="#2E7D32" style={{ marginTop: 2, flexShrink: 0 }} />
                <Text fontSize="sm" color="brand.gray.700">
                  Take photos during daytime with natural light
                </Text>
              </HStack>

              <HStack spacing={2} align="start">
                <CheckCircle size={16} color="#2E7D32" style={{ marginTop: 2, flexShrink: 0 }} />
                <Text fontSize="sm" color="brand.gray.700">
                  Clean and declutter rooms before shooting
                </Text>
              </HStack>

              <HStack spacing={2} align="start">
                <CheckCircle size={16} color="#2E7D32" style={{ marginTop: 2, flexShrink: 0 }} />
                <Text fontSize="sm" color="brand.gray.700">
                  Show unique features (kitchen, bathrooms, views)
                </Text>
              </HStack>

              <HStack spacing={2} align="start">
                <CheckCircle size={16} color="#2E7D32" style={{ marginTop: 2, flexShrink: 0 }} />
                <Text fontSize="sm" color="brand.gray.700">
                  Include exterior shots and compound/parking
                </Text>
              </HStack>

              <HStack spacing={2} align="start">
                <CheckCircle size={16} color="#2E7D32" style={{ marginTop: 2, flexShrink: 0 }} />
                <Text fontSize="sm" color="brand.gray.700">
                  Use landscape orientation for better display
                </Text>
              </HStack>
            </VStack>
          </VStack>
        </Box>

        <Box bg="white" borderRadius="xl" p={5} boxShadow="sm" border="2px solid" borderColor="brand.warning">
          <HStack spacing={3}>
            <AlertCircle size={24} color="#E65100" />
            <VStack align="start" spacing={0} flex={1}>
              <Text fontSize="sm" fontWeight="bold" color="brand.warning">
                Be Honest with Your Photos
              </Text>
              <Text fontSize="xs" color="brand.gray.600">
                Misleading photos lead to disputes and refunds. Show the property accurately.
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
                borderColor="brand.primary"
                p={6}
                boxShadow="2xl"
            >
                <Grid templateColumns="1fr 2fr" gap={3}>
                        <Button 
                        as={Link}
                        to="/create-listing/step-1"
                        variant="secondary" 
                        size="lg"
                         leftIcon={<ArrowLeftIcon size={18} />}
                           
                        >
                            Back
                        </Button>
                        <Button 
                        as={Link}
                        to="/create-listing/step-3"
                        variant="primary" 
                        size="lg"
                        onClick={handleContinue}
                        >
                            Continue to Pricing
                        </Button>
                </Grid>
            </Box>
        </Box>
    );
}
