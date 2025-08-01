import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminTableApproval from '@/components/appComp/admin/admin-table-approval'
import Loader from '@/components/ui/loader'
import { Suspense } from 'react'
import AdminTableResignation from "@/components/appComp/admin/admin-resignation-approval"

const ResourceApproval = () => {
  return (
    <div className='p-16'>
      <div className='flex justify-between items-center pb-6'>
        <h1 className='text-2xl font-medium text-primary-one'>Manage Approvals</h1>
      </div>
      <Suspense fallback={<Loader />}>
        <AdminTableApproval />
      </Suspense>
    </div>
  )
}

export default ResourceApproval