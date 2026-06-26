import { Box, ChakraProvider, useToast } from '@chakra-ui/react';
import theme from './theme'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import ScreenRouter from './components/ScreenRouter';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import { useEffect, useState } from 'react';
import HomeScreen from './components/HomeScreen';
import SignUp from './components/Sign up';
import OTPVerification from './components/OTPVerification';
import SignInForm from './components/login form';
import AgentDashboard from './components/AgentDashboard';
import PropertyListing from './components/propertyListing';
import PropertyDetails from './components/PropertyDetails';
import PaymentBreakdown from './components/PaymentBreakdown';
import ListProperty from './components/ListProperty/ListProperty';
import Profile from './components/profile';
import IdentityVerification from './components/IdentityVerification';
import BookInspection from './components/BookInspection';
import InspectionFeedback from './components/InspectionFeedback';
import { set } from 'date-fns';
import Dashboard from './components/dashboard';
import ResetPassword from './components/Reset password';
import ForgotPassword from './Forgot Password';
import VerifyEmail from './components/Verify Email';
import ChangePassword from './components/changePassword';
import EditProfile from './components/Edit profile';
import SupportChat from './components/support chat';
import { createProperty } from '../../api';
import UpdateProperty from './components/UpdateProperty/updateProperty';

const LISTING_DRAFT_KEY = 'listingFormData';

const createEmptyListingFormData = () => ({
  title: '',
  description: '',
  propertyType: '',
  bedrooms: '',
  bathrooms: '',
  toilet: '',
  rentAmount: '',
  annualRent: '',
  rentDuration: 'yearly',
  negotiable: false,
  cautionDeposit: '',
  minimumLeasePeriod: 1,
  serviceCharge: '',
  serviceChargePeriod: 'yearly',
  state: '',
  city: '',
  address: '',
  landmarks: '',
  mapsLink: '',
  size: '',
  amenities: [],
  tenantPreference: 'any',
  availableFrom: '',
  photos: [],
  video: '',
  media: {
    images: [],
    videos: [],
  },
  landlordDetails: {
    fullName: '',
    phone: '',
    bankName: '',
    accountNumber: '',
    backupBankName: '',
    backupAccountNumber: '',
  },
  backupBankName: '',
  backupAccountNumber: '',
  termsAccepted: false,
  escrowAccepted: false,
  policyAccepted: false,
  partPayment: false,
  flexibleMoveIn: false,
  serviceFee: '',
  inspectionFee: '',
});

const normalizeListingDraft = (draft = {}) => {
  const storedMedia = draft.media ?? {};
  const photos = Array.isArray(draft.photos)
    ? draft.photos
    : Array.isArray(storedMedia.images)
      ? storedMedia.images
      : [];
  const video = Array.isArray(draft.video)
    ? draft.video[0] ?? ''
    : draft.video || (Array.isArray(storedMedia.videos) ? storedMedia.videos[0] ?? '' : '');
  const addressValue = typeof draft.address === 'string'
    ? draft.address
    : draft.address?.streetAddress ?? '';
  const stateValue = draft.state ?? draft.address?.state ?? '';
  const cityValue = draft.city ?? draft.address?.area ?? draft.address?.lga ?? '';
  const landmarksValue = draft.landmarks ?? draft.address?.landmark ?? '';
  const annualRentValue = draft.annualRent ?? draft.rentAmount ?? '';
  const rentAmountValue = draft.rentAmount ?? draft.annualRent ?? '';
  const landlordDetails = {
    ...createEmptyListingFormData().landlordDetails,
    ...(draft.landlordDetails ?? {}),
  };

  return {
    ...createEmptyListingFormData(),
    ...draft,
    annualRent: annualRentValue,
    rentAmount: rentAmountValue,
    state: stateValue,
    city: cityValue,
    address: addressValue,
    landmarks: landmarksValue,
    photos,
    video,
    media: {
      images: photos,
      videos: video ? [video] : [],
    },
    landlordDetails,
    backupBankName: draft.backupBankName ?? landlordDetails.backupBankName ?? '',
    backupAccountNumber: draft.backupAccountNumber ?? landlordDetails.backupAccountNumber ?? '',
    termsAccepted: draft.termsAccepted ?? false,
    escrowAccepted: draft.escrowAccepted ?? false,
    policyAccepted: draft.policyAccepted ?? false,
    partPayment: draft.partPayment ?? false,
    flexibleMoveIn: draft.flexibleMoveIn ?? false,
  };
};

const loadSavedListingDraft = () => {
  const storageSources = [localStorage.getItem(LISTING_DRAFT_KEY), sessionStorage.getItem(LISTING_DRAFT_KEY)];

  for (const savedDraft of storageSources) {
    if (!savedDraft) {
      continue;
    }

    try {
      return JSON.parse(savedDraft);
    } catch (error) {
      console.error('Error parsing saved listing draft:', error);
    }
  }

  return null;
};

const persistListingDraft = (draft) => {
  const normalizedDraft = normalizeListingDraft(draft);
  const serializedDraft = JSON.stringify(normalizedDraft);

  localStorage.setItem(LISTING_DRAFT_KEY, serializedDraft);
  sessionStorage.setItem(LISTING_DRAFT_KEY, serializedDraft);

  return normalizedDraft;
};

const createMediaPayload = (items, fallbackType) =>
  items
    .filter(Boolean)
    .map((item, index) => {
      if (item instanceof File) {
        return {
          name: item.name,
          type: item.type,
          size: item.size,
          url: URL.createObjectURL(item),
        };
      }

      if (typeof item === 'string') {
        return {
          name: `${fallbackType}-${index + 1}`,
          type: fallbackType,
          size: 0,
          url: item,
        };
      }

      if (typeof item === 'object' && item.url) {
        return item;
      }

      return {
        name: `${fallbackType}-${index + 1}`,
        type: fallbackType,
        size: 0,
        url: String(item),
      };
    });


export default function App() {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [updatedFormdata, setUpdatedFormdata]= useState(null)
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };
  const logout = () => {
    setUser(null);
    setNotifications([]);
    localStorage.removeItem('user');
    localStorage.removeItem('notifications');
    localStorage.removeItem('token');
  };
  useEffect(() => {
    // Simulate checking for existing session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }

    // Load notifications from localStorage
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications));
      } catch (error) {
        console.error('Error parsing saved notifications:', error);
        localStorage.removeItem('notifications');
      }
    }

    // Load pending and approved requests from localStorage
    const savedPendingRequests = localStorage.getItem('pendingRequests');
    if (savedPendingRequests) {
      try {
        setPendingRequests(JSON.parse(savedPendingRequests));
      } catch (error) {
        console.error('Error parsing saved pending requests:', error);
        localStorage.removeItem('pendingRequests');
      }
    }

    const savedApprovedRequests = localStorage.getItem('approvedRequests');
    if (savedApprovedRequests) {
      try {
        setApprovedRequests(JSON.parse(savedApprovedRequests));
      } catch (error) {
        console.error('Error parsing saved approved requests:', error);
        localStorage.removeItem('approvedRequests');
      }
    }

    setIsLoading(false);
  }, []);

  const [formData, setFormData] = useState(() => normalizeListingDraft(loadSavedListingDraft() ?? {}));

  const handleListingSubmit = async (event) => {
    setIsLoading(true);
    const normalizedFormData = persistListingDraft(formData);

    if (!normalizedFormData.termsAccepted || !normalizedFormData.escrowAccepted || !normalizedFormData.policyAccepted) {
      alert('Please accept all terms and policies before submitting your listing.');
      return;
    } else if (normalizedFormData.media.images.length === 0) {
      alert('Please upload at least one photo of the property.');
      return;
    } else if (!normalizedFormData.landlordDetails.fullName || !normalizedFormData.landlordDetails.bankName || !normalizedFormData.landlordDetails.accountNumber) {
      alert('Please provide your bank account details for payment processing.');
      return;
    } else if (!normalizedFormData.title || !normalizedFormData.propertyType || !normalizedFormData.bedrooms || !normalizedFormData.bathrooms || !normalizedFormData.size || !normalizedFormData.description || !normalizedFormData.state || !normalizedFormData.city) {
      alert('Please fill in all required property details before submitting your listing.');
      return;
    } else if (!(normalizedFormData.rentAmount || normalizedFormData.annualRent) || !normalizedFormData.cautionDeposit) {
      alert('Please provide complete pricing information for your listing.');
      return;
    } else if (normalizedFormData.media.images.length > 19) {
      alert('Please upload no more than 20 photos of the property.');
      return;
    }
    else if (formData.media.videos.length > 0) {
      const video = formData.media.videos[0];
      if (video instanceof File) {
        if (!video.type.startsWith('video/')) {
          alert('Please upload a valid video file.');
          return;
        }
        if (video.size > 50 * 1024 * 1024) {
          alert('Video file size must be less than 50MB.');
          return;
        }
      } else if (typeof video === 'string') {
        // Optionally, validate video URL format here
      } else {
        alert('Invalid video format. Please upload a video file or provide a valid URL.');
        return;
      }
    }
    console.log(formData)


    const formPayload = formData
    formPayload.images = formData._photoFiles || [];
    formPayload.video = formData._videoFile || null;
    delete formPayload._photoFiles;
    delete formPayload._videoFile;
    delete formPayload.media;
    delete formPayload.photos;

    try {
      const res = await createProperty(formPayload)
      console.log('Create property response:', res);
      toast({
        title: 'Property listing created successfully!',
        description: res?.data?.message || 'Your property listing has been submitted for verification.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      // localStorage.removeItem(LISTING_DRAFT_KEY);
      // sessionStorage.removeItem(LISTING_DRAFT_KEY);
      // setFormData(createEmptyListingFormData());
      setIsLoading(false);



    } catch (error) {
      console.log(error);
      toast({
        title: 'Failed to submit listing.',
        description: error?.response?.data?.message || "An error occurred while submitting your listing. Please try again.",
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      setIsLoading(false);
    }

  };

  return (
    <ChakraProvider theme={theme}>
      {/* <ScreenRouter /> */}
      <Router>
        <Box position="absolute" top={0} left={0} width="100%" height="100%" bg="white">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={!user ? <Login onLogin={login} /> : <Navigate to="/dashboard" />} />
            <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/dashboard" />} />
            <Route path="/otp" element={user ? <OTPVerification phone={user.phone} /> : <Navigate to="/login" />} />
            <Route path="/login-form" element={!user ? <SignInForm onLogin={login} /> : <Navigate to="/dashboard" />} />
            <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" />} />
            <Route path="/reset-password/:resetToken" element={!user ? <ResetPassword /> : <Navigate to="/dashboard" />} />
            <Route path="/verify/:token" element={<VerifyEmail />} />
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/property-listings" element={<PropertyListing />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
            <Route path="/inspection-feedback/:id" element={user ? <InspectionFeedback /> : <Navigate to="/login" />} />
            <Route path="/secure-payment/:id" element={user ? <PaymentBreakdown /> : <Navigate to="/login" />} />
            <Route path="/book-inspection/:id" element={user ? <BookInspection /> : <Navigate to="/login" />} />
            <Route path="/dashboard" element={user ? <Dashboard user={user} setUpdatedFormdata={setUpdatedFormdata} /> : <Navigate to="/login" />} />
            <Route path="/create-listing/steps" element={user ? <ListProperty formData={formData} setFormData={setFormData} initialStep={1} onSubmit={handleListingSubmit} isLoading={isLoading} setIsLoading={setIsLoading} /> : <Navigate to="/login" />} />
            <Route path="/update-listing/steps" element={ user ? <UpdateProperty updatedFormdata={updatedFormdata} setUpdatedFormdata={setUpdatedFormdata} initialStep={1}  /> : <Navigate to="/login" />} />
            {/* <Route path="/create-listing/step-3" element={ user ? <ListProperty formData={formData} setFormData={setFormData} initialStep={3} onSubmit={handleListingSubmit} /> : <Navigate to="/login" />} /> */}
            {/* <Route path="/create-listing/step-4" element={ user ? <ListProperty formData={formData} setFormData={setFormData} initialStep={4} onSubmit={handleListingSubmit} /> : <Navigate to="/login" />} />  */}
            <Route path="/profile" element={user ? <Profile onLogout={logout} user={user} /> : <Navigate to="/login" />} />
            <Route path="/verify_ID" element={user ? <IdentityVerification /> : <Navigate to="/login" />} />
            <Route path="/edit-profile" element={user ? <EditProfile user={user} /> : <Navigate to="/login" />} />
            <Route path="/change-password" element={user ? <ChangePassword /> : <Navigate to="/login" />} />
            <Route path="/security" element={user ? <ChangePassword /> : <Navigate to="/login" />} />
            <Route path="/settings" element={user ? <ListProperty /> : <Navigate to="/login" />} />
            <Route path="/support" element={user ? <SupportChat /> : <Navigate to="/login" />} />
            {/* Add more routes here */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </Router>
    </ChakraProvider >
  );
}