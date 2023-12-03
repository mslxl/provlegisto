import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Link } from "react-router-dom"

type Contributer = {
  name: string
  avatar: string
  fallback: string
  ty: string
  profile: string
}

const contributers: Contributer[] = [
  {
    name: "Mslxl",
    avatar: "https://avatars.githubusercontent.com/u/11132880?v=4",
    fallback: "M",
    ty: "Main developer",
    profile: "https://github.com/mslxl",
  },
  {
    name: "xia0ne",
    avatar: "https://avatars.githubusercontent.com/u/32591223?v=4",
    fallback: "Y",
    ty: "Debug",
    profile: "https://github.com/xia0ne",
  },
  {
    name: "Galong",
    avatar: "https://avatars.githubusercontent.com/u/94678496?v=4",
    fallback: "G",
    ty: "Advice & Debug",
    profile: "https://github.com/gjh303987897",
  },
]

export default function Component() {
  return (
    <div>
      <h3 className="sm:text-center text-lg mt-4 mx-8">Contributors</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3">
        {contributers.map((dev) => (
          <Link key={dev.profile} to={dev.profile} target="__blank">
            <div className="flex gap-2 items-center m-4">
              <Avatar>
                <AvatarImage src={dev.avatar} />
                <AvatarFallback>{dev.fallback}</AvatarFallback>
              </Avatar>
              <div>
                <span className="block">{dev.name}</span>
                <span className="block text-xs">{dev.ty}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
