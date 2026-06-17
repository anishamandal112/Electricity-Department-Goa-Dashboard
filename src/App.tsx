import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { OverviewPage } from './modules/overview/OverviewPage'
import { ConsumerServicesPage } from './modules/consumer-services/ConsumerServicesPage'
import { MeterManagementPage } from './modules/meter-management/MeterManagementPage'
import { DistributionOpsPage } from './modules/distribution-ops/DistributionOpsPage'
import { RevenueBillingPage } from './modules/revenue-billing/RevenueBillingPage'
import { ProcurementFinancePage } from './modules/procurement-finance/ProcurementFinancePage'
import { InfrastructureAssetsPage } from './modules/infrastructure-assets/InfrastructureAssetsPage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Navigate to="/overview" replace />} />
          <Route path="overview" element={<OverviewPage />} />
          <Route path="consumer-services" element={<ConsumerServicesPage />} />
          <Route path="meter-management" element={<MeterManagementPage />} />
          <Route path="distribution-ops" element={<DistributionOpsPage />} />
          <Route path="revenue-billing" element={<RevenueBillingPage />} />
          <Route path="procurement-finance" element={<ProcurementFinancePage />} />
          <Route path="infrastructure-assets" element={<InfrastructureAssetsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
