import * as Card from "../components/Card";
import Menubar from "../components/Menubar";

import './Welcome.less'

export default function Welcome() {
  return (
    <div id="view-welcome">
      <Menubar/>
      <div id="content">
        <Card.Root>
          <Card.Heading>
            <h3>Quickly Start</h3>
          </Card.Heading>
          <Card.Content>
            <span>Empty</span>
          </Card.Content>
        </Card.Root>
        <Card.Root>
          <Card.Heading>
            <h3>Recent</h3>
          </Card.Heading>
          <Card.Content>
            <span>Empty</span>
          </Card.Content>
        </Card.Root>
      </div>
    </div>
  )
}