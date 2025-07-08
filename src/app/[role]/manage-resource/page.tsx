import AdminTableResource from '@/components/appComp/admin/admin-table-resource'
import { Button } from '@/components/ui/button'
import Loader from '@/components/ui/loader'
import Link from 'next/link'
import { Suspense } from 'react'

const ManageResource = () => {
  return (
    <div className='p-16'>
      <div className='flex justify-between items-center pb-6'>
         <h1 className='text-2xl font-medium text-primary-one'>Manage Resources</h1>
         <Button className='px-4 dark:bg-blue-400' asChild>
          <Link href='/admin/manage-resource/add-resource'>Add Resource</Link>
         </Button>
      </div>
      <Suspense fallback={<Loader/>}>
      <AdminTableResource />
      </Suspense>
    </div>
  )
}

export default ManageResource