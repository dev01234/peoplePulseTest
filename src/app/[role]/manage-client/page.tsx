import AdminTableClient from '@/components/appComp/admin/admin-table-client'
import { Button } from '@/components/ui/button'
import Loader from '@/components/ui/loader'
import Link from 'next/link'
import { Suspense } from 'react'

const ManageProject = () => {
  return (
    <div className='p-16'>
      <div className='flex justify-between items-center pb-6'>
         <h1 className='text-2xl font-medium text-primary-one'>Manage Client</h1>
         <Button className='px-4 dark:bg-blue-400' asChild>
          <Link href='/admin/manage-client/add-client'>Add Client</Link>
         </Button>
      </div>
      <Suspense fallback={<Loader/>}>
      <AdminTableClient />
      </Suspense>
    </div>
  )
}

export default ManageProject