import AdminTableResource from '@/components/appComp/admin/admin-table-resource'
import { Button } from '@/components/ui/button'
import Loader from '@/components/ui/loader'
import Link from 'next/link'
import { Suspense } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminTableResignation from '@/components/appComp/admin/admin-resignation-approval'


const ManageResource = () => {
  return (
    <div className='p-16'>
      <div className='flex justify-between items-center pb-6'>
        <h1 className='text-2xl font-medium text-primary-one'>Manage Resources</h1>
        <Button className='px-4 dark:bg-blue-400' asChild>
          <Link href='/admin/manage-resource/add-resource'>Add Resource</Link>
        </Button>
      </div>
      <Suspense fallback={<Loader />}>

        <Tabs defaultValue="resource-approval" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="resource-approval">Manage Resource</TabsTrigger>
            <TabsTrigger value="resignation-approval">Resignation Approval</TabsTrigger>
          </TabsList>

          <TabsContent value="resource-approval" className="mt-6">
            <Suspense fallback={<Loader />}>
              <AdminTableResource />

            </Suspense>
          </TabsContent>

          <TabsContent value="resignation-approval" className="mt-6">
            <Suspense fallback={<Loader />}>
              <AdminTableResignation />
            </Suspense>
          </TabsContent>
        </Tabs>
      </Suspense>
    </div>
  )
}

export default ManageResource