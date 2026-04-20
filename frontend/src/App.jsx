import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Departements from './pages/Departements'
import OrgGias from './pages/OrgGias'
import OrgCsm from './pages/OrgCsm'
import Stagiaires from './pages/Stagiaires'
import Candidatures from './pages/Candidatures'
import CandidatureForm from './pages/CandidatureForm'
import CandidatureSuivi from './pages/CandidatureSuivi'
import Presences from './pages/Presences'
import Evaluations from './pages/Evaluations'
import EvaluationForm from './pages/EvaluationForm'
import Documents from './pages/Documents'
import Dashboard from './pages/Dashboard'
import Notifications from './pages/Notifications'
import ProtectedRoute from './components/ProtectedRoute'
import StagiaireHome from './pages/StagiaireHome'
import MainLayout from './components/MainLayout'
import Presentation from './pages/Presentation'
import Reglement from './pages/Reglement'
import ToastContainer from './components/ToastContainer'
import LandingPage from './pages/LandingPage'
import Register from './pages/Register'

const ProtectedLayout = ({ children, allowedRoles }) => (
  <ProtectedRoute allowedRoles={allowedRoles}>
    <MainLayout>{children}</MainLayout>
  </ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/candidature" element={
            <ProtectedRoute allowedRoles={['stagiaire', 'admin_rh', 'super_admin']}>
              <CandidatureForm />
            </ProtectedRoute>
          } />
          <Route path="/candidature/suivi" element={<CandidatureSuivi />} />
          <Route path="/departements" element={
            <ProtectedLayout>
              <Departements />
            </ProtectedLayout>
          } />
          <Route path="/organigramme-gias" element={
            <ProtectedLayout>
              <OrgGias />
            </ProtectedLayout>
          } />
          <Route path="/organigramme-csm" element={
            <ProtectedLayout>
              <OrgCsm />
            </ProtectedLayout>
          } />
          <Route path="/presentation" element={
            <ProtectedLayout>
              <Presentation />
            </ProtectedLayout>
          } />
          <Route path="/reglement" element={
            <ProtectedLayout>
              <Reglement />
            </ProtectedLayout>
          } />
          <Route path="/stagiaires" element={
            <ProtectedLayout>
              <Stagiaires />
            </ProtectedLayout>
          } />
          <Route path="/candidatures" element={
            <ProtectedLayout allowedRoles={['admin_rh', 'super_admin']}>
              <Candidatures />
            </ProtectedLayout>
          } />
          <Route path="/presences" element={
            <ProtectedLayout allowedRoles={['tuteur', 'chef_departement', 'admin_rh', 'super_admin', 'stagiaire']}>
              <Presences />
            </ProtectedLayout>
          } />
          <Route path="/evaluations" element={
            <ProtectedLayout allowedRoles={['tuteur', 'chef_departement', 'admin_rh', 'super_admin', 'stagiaire']}>
              <Evaluations />
            </ProtectedLayout>
          } />
          <Route path="/evaluations/new" element={
            <ProtectedLayout allowedRoles={['tuteur', 'chef_departement', 'admin_rh', 'super_admin']}>
              <EvaluationForm />
            </ProtectedLayout>
          } />
          <Route path="/evaluations/:id" element={
            <ProtectedLayout allowedRoles={['tuteur', 'chef_departement', 'admin_rh', 'super_admin', 'stagiaire']}>
              <EvaluationForm />
            </ProtectedLayout>
          } />
          <Route path="/documents" element={
            <ProtectedLayout allowedRoles={['admin_rh', 'super_admin']}>
              <Documents />
            </ProtectedLayout>
          } />
          <Route path="/dashboard" element={
            <ProtectedLayout allowedRoles={['admin_rh', 'super_admin', 'chef_departement', 'tuteur']}>
              <Dashboard />
            </ProtectedLayout>
          } />
          <Route path="/notifications" element={
            <ProtectedLayout allowedRoles={['admin_rh', 'super_admin', 'chef_departement', 'tuteur', 'stagiaire']}>
              <Notifications />
            </ProtectedLayout>
          } />
          <Route path="/home-stagiaire" element={
            <ProtectedLayout allowedRoles={['stagiaire']}>
              <StagiaireHome />
            </ProtectedLayout>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
