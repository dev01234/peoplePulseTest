import AdminTableSupplier from '@/components/appComp/admin/admin-table-supplier'
import { Button } from '@/components/ui/button'
import Loader from '@/components/ui/loader'
import Link from 'next/link'
import { Suspense } from 'react'

const ManageResource = () => {
  return (
    <div className='p-16'>
      <div className='flex justify-between items-center pb-6'>
         <h1 className='text-2xl font-medium text-primary-one'>Manage Suppliers</h1>
         <Button className='px-4 dark:bg-blue-400' asChild>
          <Link href='/admin/manage-supplier/add-supplier'>Add Supplier</Link>
         </Button>
      </div>
      <Suspense fallback={<Loader/>}>
      <AdminTableSupplier />
      </Suspense>
    </div>
  )
}

export default ManageResource