import AdminTableRManager from '@/components/appComp/admin/admin-table-rm'
import { Button } from '@/components/ui/button'
import Loader from '@/components/ui/loader'
import Link from 'next/link'
import { Suspense } from 'react'

const ManageRM = () => {
  return (
    <div className='p-16'>
      <div className='flex justify-between items-center pb-6'>
         <h1 className='text-2xl font-medium text-primary-one'>Manage Reporting Managers</h1>
         <Button className='px-4 dark:bg-blue-400' asChild>
          <Link href='/admin/manage-rms/add-rm'>Add Reporting Manager</Link>
         </Button>
      </div>
      <Suspense fallback={<Loader/>}>
      <AdminTableRManager />
      </Suspense>
    </div>
  )
}

export default ManageRM