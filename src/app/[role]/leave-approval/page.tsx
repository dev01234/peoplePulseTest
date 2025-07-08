import AdminTablePendingleaves from '@/components/appComp/admin/admin-table-leave-approval'
import AdminTablePManager from '@/components/appComp/admin/admin-table-pm'
import { Button } from '@/components/ui/button'
import Loader from '@/components/ui/loader'
import Link from 'next/link'
import { Suspense } from 'react'

const LeaveApproval = () => {
  return (
    <div className='p-16'>
      <div className='flex justify-between items-center pb-6'>
         <h1 className='text-2xl font-medium text-primary-one'>Manage Pending Approvals</h1>
      </div>
      <Suspense fallback={<Loader/>}>
      <AdminTablePendingleaves />
      </Suspense>
    </div>
  )
}

export default LeaveApproval