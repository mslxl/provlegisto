import { Suspense } from "react"
import Loading from "../loading"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import Host from "./host"
import Connect from "./connect"

type CollabConfProps = {
  open: boolean
  onOpenChange?: (open: boolean) => void
}

export default function CollabConf(props: CollabConfProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="select-none">
        <DialogHeader>
          <DialogTitle>Collaborative Work</DialogTitle>
          <DialogDescription asChild>
            <Tabs defaultValue="host">
              <TabsList className="my-2 mi-4 grid grid-cols-2">
                <TabsTrigger value="host">Host</TabsTrigger>
                <TabsTrigger value="connect">Connect</TabsTrigger>
              </TabsList>
              <TabsContent value="host" className="flex-1" asChild>
                <Suspense fallback={<Loading />}>
                  <Host />
                </Suspense>
              </TabsContent>
              <TabsContent value="connect" asChild>
                <Suspense fallback={<Loading />}>
                  <Connect />
                </Suspense>
              </TabsContent>
            </Tabs>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
