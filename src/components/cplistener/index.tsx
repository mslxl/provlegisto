import { Suspense, lazy } from "react"


const Inner = lazy(() => import("./competitive-companion"))
function Wrapper(){
    return (
        <Suspense>
            <Inner/>
        </Suspense>
    )

}

export default Wrapper
