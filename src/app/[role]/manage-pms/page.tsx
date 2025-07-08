import AdminTablePManager from '@/components/appComp/admin/admin-table-pm'
import AdminTableProject from '@/components/appComp/admin/admin-table-project'
import { Button } from '@/components/ui/button'
import Loader from '@/components/ui/loader'
import Link from 'next/link'
import { Suspense } from 'react'

const ManagePM = () => {
  return (
    <div className='p-16'>
      <div className='flex justify-between items-center pb-6'>
         <h1 className='text-2xl font-medium text-primary-one'>Manage Project Managers</h1>
         <Button className='px-4 dark:bg-blue-400' asChild>
          <Link href='/admin/manage-pms/add-pm'>Add Project Manager</Link>
         </Button>
      </div>
      <Suspense fallback={<Loader/>}>
      <AdminTablePManager />
      </Suspense>
    </div>
  )
}

export default ManagePM