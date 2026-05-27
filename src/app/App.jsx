import { Box, ChakraProvider } from '@chakra-ui/react';
import theme from './theme'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import ScreenRouter from './components/ScreenRouter';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import { useState } from 'react';
import HomeScreen from './components/HomeScreen';
import SignUp from './components/Sign up';
import OTPVerification from './components/OTPVerification';
import SignInForm from './components/login form';
import AgentDashboard from './components/AgentDashboard';
import PropertyListing from './components/propertyListing';
import PropertyDetails from './components/PropertyDetails';
import PaymentBreakdown from './components/PaymentBreakdown';
import ListProperty from './components/ListProperty/ListProperty';
import ListPropertyStep2 from './components/ListProperty/ListPropertyStep2';
import ListPropertyStep3 from './components/ListProperty/ListPropertyStep3';
import ListPropertyStep4 from './components/ListProperty/ListPropertyStep4';
import Profile from './components/profile';
import IdentityVerification from './components/IdentityVerification';
import BookInspection from './components/BookInspection';
import InspectionFeedback from './components/InspectionFeedback';
import { set } from 'date-fns';
import Dashboard from './components/dashboard';


export default function App() {
  const [user, setUser] = useState(null);

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
    }else if (formData.photos.length === 0) {
      alert('Please upload at least one photo of the property.');
      return;
    }else if (!formData.accountName || !formData.bankName || !formData.accountNumber) {
      alert('Please provide your bank account details for payment processing.');
      return;
    }else if (!formData.title || !formData.propertyType || !formData.bedrooms || !formData.bathrooms || !formData.size || !formData.description || !formData.state || !formData.city || !formData.address) {
      alert('Please fill in all required property details before submitting your listing.');
      return;
    }else if (!formData.annualRent || !formData.cautionDeposit || !formData.serviceCharge) {
      alert('Please provide complete pricing information for your listing.');
      return;
    }else if (formData.leasePeriod === '' || formData.serviceChargePeriod === '') {
      alert('Please specify the lease period and service charge period for your listing.');
      return;
    }else if (formData.leasePeriod === 'Select' || formData.serviceChargePeriod === 'Select') {
      alert('Please select valid options for lease period and service charge period.');
      return;
    }else if (formData.leasePeriod === 'Custom' && !formData.customLeasePeriod) {
      alert('Please specify the custom lease period for your listing.');
      return;
    }else if (formData.serviceChargePeriod === 'Custom' && !formData.customServiceChargePeriod) {
      alert('Please specify the custom service charge period for your listing.');
      return;
    }else if (formData.photos.length > 10) {
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
      address: '',
      landmarks: '',
      photos: [],
      video: "",
      annualRent: '',
      cautionDeposit: '',
      leasePeriod: '1 Year',
      serviceCharge: '',
      serviceChargePeriod: 'Per Year',
      negotiable: false,
      flexibleMoveIn: true,
      partPayment: false, 
      accountName: '',
      bankName: '',
      accountNumber: '',
      backupBankName: '',
      backupAccountNumber: '',
      termsAccepted: false,
      escrowAccepted: false,
      policyAccepted: false,
    });
  };

  return (
    <ChakraProvider theme={theme}>
      {/* <ScreenRouter /> */}
      <Router>
        <Box position="absolute" top={0} left={0} width="100%" height="100%" bg="white">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/home" />} />
            <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/home" />} />
            <Route path="/otp" element={!user ? <OTPVerification /> : <Navigate to="/home" />} />
            <Route path="/login-form" element={!user ? <SignInForm /> : <Navigate to="/home" />} />
            <Route path="/home" element={ <HomeScreen />} />
            <Route path="/property-listings" element={ <PropertyListing />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
            <Route path="/inspection-feedback/:id" element={ !user ? <InspectionFeedback /> : <Navigate to="/login" />} />
            <Route path="/secure-payment/:id" element={ !user ? <PaymentBreakdown /> : <Navigate to="/login" />} />
            <Route path="/book-inspection/:id" element={ !user ? <BookInspection /> : <Navigate to="/login" />} />
            <Route path="/dashboard" element={ !user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/create-listing/step-1" element={ !user ? <ListProperty formData={formData} setFormData={setFormData} /> : <Navigate to="/login" />} />
            <Route path="/create-listing/step-2" element={ !user ? <ListPropertyStep2 formData={formData} setFormData={setFormData}/> : <Navigate to="/login" />} />
            <Route path="/create-listing/step-3" element={ !user ? <ListPropertyStep3 formData={formData} setFormData={setFormData}/> : <Navigate to="/login" />} />
            <Route path="/create-listing/step-4" element={ !user ? <ListPropertyStep4 formData={formData} setFormData={setFormData} onSubmit={handleListingSubmit}/> : <Navigate to="/login" />} />
            <Route path="/profile" element={ !user ? <Profile/> : <Navigate to="/login" />} />
            <Route path="/verify_ID" element={ !user ? <IdentityVerification /> : <Navigate to="/login" />} />
            <Route path="/edit-profile" element={ !user ? <IdentityVerification /> : <Navigate to="/login" />} />
            <Route path="/security" element={ !user ? <ListProperty /> : <Navigate to="/login" />} />
            <Route path="/settings" element={ !user ? <ListProperty /> : <Navigate to="/login" />} />
            <Route path="/support" element={ !user ? <ListProperty /> : <Navigate to="/login" />} />
            {/* Add more routes here */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </Router>
    </ChakraProvider >
  );
}