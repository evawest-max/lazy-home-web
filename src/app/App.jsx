import { Box, ChakraProvider } from '@chakra-ui/react';
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


export default function App() {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const [formData, setFormData] = useState({
    title: sessionStorage.getItem('listingFormData') ? JSON.parse(sessionStorage.getItem('listingFormData')).title : '',
    propertyType: sessionStorage.getItem('listingFormData') ? JSON.parse(sessionStorage.getItem('listingFormData')).propertyType : '',
    bedrooms: sessionStorage.getItem('listingFormData') ? JSON.parse(sessionStorage.getItem('listingFormData')).bedrooms : '',
    bathrooms: sessionStorage.getItem('listingFormData') ? JSON.parse(sessionStorage.getItem('listingFormData')).bathrooms : '',
    size: sessionStorage.getItem('listingFormData') ? JSON.parse(sessionStorage.getItem('listingFormData')).size : '',
    description: sessionStorage.getItem('listingFormData') ? JSON.parse(sessionStorage.getItem('listingFormData')).description : '',
    amenities: ['24hr Power'],
    state: sessionStorage.getItem('listingFormData') ? JSON.parse(sessionStorage.getItem('listingFormData')).state : '',
    city: sessionStorage.getItem('listingFormData') ? JSON.parse(sessionStorage.getItem('listingFormData')).city : '',
    address: sessionStorage.getItem('listingFormData') ? JSON.parse(sessionStorage.getItem('listingFormData')).address : '',
    landmarks: sessionStorage.getItem('listingFormData') ? JSON.parse(sessionStorage.getItem('listingFormData')).landmarks : '',
    photos: [],
    video: "",
    annualRent: sessionStorage.getItem('listingFormData') ? JSON.parse(sessionStorage.getItem('listingFormData')).annualRent : '',
    cautionDeposit: sessionStorage.getItem('listingFormData') ? JSON.parse(sessionStorage.getItem('listingFormData')).cautionDeposit : '',
    leasePeriod: sessionStorage.getItem('listingFormData') ? JSON.parse(sessionStorage.getItem('listingFormData')).leasePeriod : '1 Year',
    serviceCharge: sessionStorage.getItem('listingFormData') ? JSON.parse(sessionStorage.getItem('listingFormData')).serviceCharge : '',
    serviceChargePeriod: sessionStorage.getItem('listingFormData') ? JSON.parse(sessionStorage.getItem('listingFormData')).serviceChargePeriod : 'Per Year',
    negotiable: sessionStorage.getItem('listingFormData') ? JSON.parse(sessionStorage.getItem('listingFormData')).negotiable : false,
    flexibleMoveIn: sessionStorage.getItem('listingFormData') ? JSON.parse(sessionStorage.getItem('listingFormData')).flexibleMoveIn : true,
    partPayment: sessionStorage.getItem('listingFormData') ? JSON.parse(sessionStorage.getItem('listingFormData')).partPayment : false,
    accountName: sessionStorage.getItem('listingFormData') ? JSON.parse(sessionStorage.getItem('listingFormData')).accountName : '',
    bankName: sessionStorage.getItem('listingFormData') ? JSON.parse(sessionStorage.getItem('listingFormData')).bankName : '',
    accountNumber: sessionStorage.getItem('listingFormData') ? JSON.parse(sessionStorage.getItem('listingFormData')).accountNumber : '',
    backupBankName: sessionStorage.getItem('listingFormData') ? JSON.parse(sessionStorage.getItem('listingFormData')).backupBankName : '',
    backupAccountNumber: sessionStorage.getItem('listingFormData') ? JSON.parse(sessionStorage.getItem('listingFormData')).backupAccountNumber : '',
    termsAccepted: sessionStorage.getItem('listingFormData') ? JSON.parse(sessionStorage.getItem('listingFormData')).termsAccepted : false,
    escrowAccepted: sessionStorage.getItem('listingFormData') ? JSON.parse(sessionStorage.getItem('listingFormData')).escrowAccepted : false,
    policyAccepted: sessionStorage.getItem('listingFormData') ? JSON.parse(sessionStorage.getItem('listingFormData')).policyAccepted : false,
  });

  const handleListingSubmit = () => {
    if (!formData.termsAccepted || !formData.escrowAccepted || !formData.policyAccepted) {
      alert('Please accept all terms and policies before submitting your listing.');
      return;
    } else if (formData.photos.length === 0) {
      alert('Please upload at least one photo of the property.');
      return;
    } else if (!formData.accountName || !formData.bankName || !formData.accountNumber) {
      alert('Please provide your bank account details for payment processing.');
      return;
    } else if (!formData.title || !formData.propertyType || !formData.bedrooms || !formData.bathrooms || !formData.size || !formData.description || !formData.state || !formData.city || !formData.address) {
      alert('Please fill in all required property details before submitting your listing.');
      return;
    } else if (!formData.annualRent || !formData.cautionDeposit || !formData.serviceCharge) {
      alert('Please provide complete pricing information for your listing.');
      return;
    } else if (formData.leasePeriod === '' || formData.serviceChargePeriod === '') {
      alert('Please specify the lease period and service charge period for your listing.');
      return;
    } else if (formData.leasePeriod === 'Select' || formData.serviceChargePeriod === 'Select') {
      alert('Please select valid options for lease period and service charge period.');
      return;
    } else if (formData.leasePeriod === 'Custom' && !formData.customLeasePeriod) {
      alert('Please specify the custom lease period for your listing.');
      return;
    } else if (formData.serviceChargePeriod === 'Custom' && !formData.customServiceChargePeriod) {
      alert('Please specify the custom service charge period for your listing.');
      return;
    } else if (formData.photos.length > 10) {
      alert('Please upload no more than 10 photos of the property.');
      return;
    }
    //else if (formData.video && !formData.video.startsWith('http')) {
    //   alert('Please provide a valid URL for the property video tour.');
    //   return;
    // } 



    const finalData = {
      ...formData,
      photos: formData.photos.map((file, index) => ({
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file)
      }))
    };
    console.log('Final listing data:', finalData);
    try {
      const data = createProperty(finalData)
      console.log(data)
    } catch (error) {
      console.log(error)
    }
    alert('Listing submitted successfully! Check console for data.');
    setFormData({
      title: '',
      propertyType: '',
      bedrooms: '',
      bathrooms: '',
      size: '',
      description: '',
      amenities: ['24hr Power'],
      state: '',
      city: '',
      address: {},
      landmarks: '',
      media: {
        images: [{ ipfsHash: "String", url: "String" }],
        videos: [{ ipfsHash: "String", url: "String" }]
      },
      listedBy: {},
      landlordDetails: {
        fullName: "String",
        phone: "String",
        bankName: "String",
        accountNumber: "String"
      },
      verificationStatus: "pending",
      listingStatus: "available",
      rejectionReason: "",
      coordinates: {
        latitude: ["0"],
        longitude: ["0"]
      },
      cautionDeposit: 0,
      serviceCharge: 0,
      negotiable: false,
      accountName: '',
      bankName: '',
      accountNumber: '',
      backupBankName: '',
      backupAccountNumber: '',
      termsAndPolicyAccepted: false,
      // escrowAccepted: false,
      // policyAccepted: false,
    });
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
            <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
            <Route path="/create-listing/steps" element={user ? <ListProperty formData={formData} setFormData={setFormData} initialStep={1} onSubmit={handleListingSubmit} /> : <Navigate to="/login" />} />
            {/* <Route path="/create-listing/step-2" element={ user ? <ListProperty formData={formData} setFormData={setFormData} initialStep={2} onSubmit={handleListingSubmit} /> : <Navigate to="/login" />} />
            <Route path="/create-listing/step-3" element={ user ? <ListProperty formData={formData} setFormData={setFormData} initialStep={3} onSubmit={handleListingSubmit} /> : <Navigate to="/login" />} />
            <Route path="/create-listing/step-4" element={ user ? <ListProperty formData={formData} setFormData={setFormData} initialStep={4} onSubmit={handleListingSubmit} /> : <Navigate to="/login" />} /> */}
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