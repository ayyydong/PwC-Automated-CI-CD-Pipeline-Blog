import React from 'react'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { ProtectedRoute } from '../components/Routes'
import { RouteConfig, ROUTE_CONFIG } from '../configs/routes/routeConfig'

export const AppRouter = () => {
  const buildRoutes = () => (
    <Routes>
      {Object.values(ROUTE_CONFIG).map(
        ({
          path,
          component,
          isProtected,
          isProtectedAdmin,
          isProtectedOwnerUser,
        }: RouteConfig) => {
          const element = isProtected ? (
            <ProtectedRoute
              isProtectedAdmin={isProtectedAdmin}
              isProtectedOwnerUser={isProtectedOwnerUser}
            >
              {component}
            </ProtectedRoute>
          ) : (
            component
          )
          return <Route key={path} path={path} element={element} />
        },
      )}
    </Routes>
  )

  return <Router>{buildRoutes()}</Router>
}
