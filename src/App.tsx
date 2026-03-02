// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { Toaster } from 'react-hot-toast';

import Landing from './Pages/Landing';
import Login from './Pages/Login';
import Register from './Pages/Register';

import { AuthProvider } from './context/AuthProvider';
import { UnreadMessagesProvider } from './context/UnreadMessagesContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import NavigationSpinner from './components/ui/NavigationSpinner';

// Farmer pages
import FarmerDashboard from './Pages/farmer/FarmerDashboard';
import FarmerNeeds from './Pages/farmer/BuyerNeeds';
import FarmerListings from './Pages/farmer/FarmerListings';
import FarmerOrders from './Pages/farmer/FarmerOrders';
import FarmerMessages from './Pages/farmer/FarmerMessages';
import FarmerProfile from './Pages/farmer/FarmerProfile';
import FarmerPublicProfile from './Pages/public/Farmerpublicprofile';

// Buyer pages
import BuyerDashboard from './Pages/buyer/BuyerDashboard';
import BuyerBrowse from './Pages/buyer/BuyerBrowse';
import BuyerNeeds from './Pages/buyer/BuyerPostNeed';
import BuyerOrders from './Pages/buyer/BuyerOrders';
import BuyerMessages from './Pages/buyer/BuyerMessage';
import BuyerProfile from './Pages/buyer/BuyerProfile';
import OrderFlow from './Pages/buyer/OrderFlow';
import BuyerPublicProfile from './Pages/public/Buyerpublicprofile';

export default function App() {
  return (
    <AuthProvider>
      {/* <Toaster position="top-center" /> */}

      <Router basename={import.meta.env.VITE_BASE_PATH || '/'}>
         <UnreadMessagesProvider>
        {/* Spinner lives inside Router so useNavigation() works */}
        <NavigationSpinner />

        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/farmer/buyer/:buyerId"
            element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<BuyerPublicProfile />} />
          </Route>

          <Route
            path="/buyer/farmer/:farmerId"
            element={
              <ProtectedRoute allowedRoles={['buyer']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<FarmerPublicProfile />} />
          </Route>

          {/* Farmer (protected) */}
          <Route
            path="/farmer"
            element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"  element={<FarmerDashboard />} />
            <Route path="needs"      element={<FarmerNeeds />} />
            <Route path="listings"   element={<FarmerListings />} />
            <Route path="orders"     element={<FarmerOrders />} />
            <Route path="messages"   element={<FarmerMessages />} />
            <Route path="profile"    element={<FarmerProfile />} />
          </Route>

          {/* Buyer (protected) */}
          <Route
            path="/buyer"
            element={
              <ProtectedRoute allowedRoles={['buyer']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"        element={<BuyerDashboard />} />
            <Route path="browse"           element={<BuyerBrowse />} />
            <Route path="needs"            element={<BuyerNeeds />} />
            <Route path="orders"           element={<BuyerOrders />} />
            <Route path="messages"         element={<BuyerMessages />} />
            <Route path="profile"          element={<BuyerProfile />} />
            <Route path="order/:listingId" element={<OrderFlow />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </UnreadMessagesProvider>
      </Router>
    </AuthProvider>
  );
}