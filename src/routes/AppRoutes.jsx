
import { Navigate, Route, Routes } from 'react-router-dom'

import ProtectedRoute from '../components/ProtectedRoute'
import Layout from '../components/Layout'
import EditClaim from '../pages/EditClaim'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Dashboard from '../pages/Dashboard'
import Claims from '../pages/Claims'
import CreateClaim from '../pages/CreateClaim'
import ClaimDetails from '../pages/ClaimDetails'
import ReviewClaim from '../pages/ReviewClaim'
import UserManagement from '../pages/UserManagement'
import AccessDenied from '../pages/AccessDenied'
import NotFound from '../pages/NotFound'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/claims" element={<Claims />} />

          {/* Employee-only Route */}
          <Route
            path="/claims/new"
            element={<ProtectedRoute roles={['EMPLOYEE']} />}
          >
            <Route index element={<CreateClaim />} />
          </Route>

          <Route path="/claims/:id" element={<ClaimDetails />} />

          <Route
            path="/claims/:id/edit"
            element={<ProtectedRoute roles={['EMPLOYEE']} />}
          >
            <Route index element={<EditClaim />} />
          </Route>

          {/* Manager-only Routes */}
          <Route element={<ProtectedRoute roles={['MANAGER']} />}>
            <Route path="/review" element={<ReviewClaim />} />
            <Route path="/users" element={<UserManagement />} />
          </Route>
        </Route>
      </Route>


      {/* Other Routes */}
      <Route path="/access-denied" element={<AccessDenied />} />

      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
