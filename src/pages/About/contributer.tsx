import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Link } from "react-router-dom"
import allContributorSrc from "../../../.all-contributorsrc?raw"
import { startCase } from "lodash"
import styled from "styled-components"

type Contributor = {
  login: string
  name: string
  avatar_url: string
  profile: string
  contributions: string[]
}

const allContributors = JSON.parse(allContributorSrc).contributors as Contributor[]

const ContributorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
`

export default function Component() {
  return (
    <div>
      <h3 className="sm:text-center text-xl font-bold mt-4 mx-8">Contributors</h3>
      <ContributorGrid>
        {allContributors.map((dev) => (
          <Link key={dev.profile} to={dev.profile} target="__blank">
            <div className="flex gap-2 items-center m-4">
              <Avatar>
                <AvatarImage src={dev.avatar_url} />
                <AvatarFallback>{dev.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <span className="block font-semibold">{dev.name}</span>
                {dev.contributions.map((contri) => (
                  <span key={contri} className="text-xs mr-2 px-2 py-0.5 rounded-lg shadow-sm italic bg-neutral-200">
                    {startCase(contri)}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </ContributorGrid>
    </div>
  )
}
