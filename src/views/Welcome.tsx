import Card from "../components/Card";
import Menubar from "../components/Menubar";

import './Welcome.less'

export default function Welcome() {
  return (
    <div id="view-welcome">
      <Menubar/>
      <div id="content">
        <Card>
          <h3>Quickly Start</h3>
        </Card>
        <Card>
          <h3>Recent</h3>
        </Card>
      </div>
    </div>
  )
}