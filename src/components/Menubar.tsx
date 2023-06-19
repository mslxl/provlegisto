import * as Menubar from '@radix-ui/react-menubar'
import { ChevronRightIcon } from '@radix-ui/react-icons';

import './Menubar.less'

export default function ProvlegistoMenubar() {
  return (
    <Menubar.Root className="MenubarRoot">
      <Menubar.Menu>
        <Menubar.Trigger className="MenubarTrigger">Problem</Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content className="MenubarContent">
            <Menubar.Item className='MenubarItem'>New Problem</Menubar.Item>
            <Menubar.Item className='MenubarItem'>New Contest</Menubar.Item>
            <Menubar.Item className='MenubarItem'>New Problem List</Menubar.Item>
            <Menubar.Separator className='MenubarSeparator' />
            <Menubar.Item className='MenubarItem'>Open Contest</Menubar.Item>
            <Menubar.Item className='MenubarItem'>Open Problem List</Menubar.Item>
            <Menubar.Sub>
              <Menubar.SubTrigger className='MenubarSubTrigger'>
                Open Recent Item
                <div className="RightSlot">
                  <ChevronRightIcon />
                </div>
              </Menubar.SubTrigger>
              <Menubar.Portal>
                <Menubar.SubContent className='MenubarSubContent'>
                  <Menubar.Item className='MenubarItem'>TEST</Menubar.Item>
                </Menubar.SubContent>
              </Menubar.Portal>
            </Menubar.Sub>

            <Menubar.Separator className='MenubarSeparator' />

            <Menubar.Item className='MenubarItem'>Save</Menubar.Item>
            <Menubar.Item className='MenubarItem'>Move</Menubar.Item>
            <Menubar.Separator className='MenubarSeparator' />

            <Menubar.Sub>
              <Menubar.SubTrigger className='MenubarSubTrigger'>
                Export
                <div className="RightSlot">
                  <ChevronRightIcon />
                </div>
              </Menubar.SubTrigger>
              <Menubar.Portal>
                <Menubar.SubContent className='MenubarSubContent'>
                  <Menubar.Item className='MenubarItem'>Picture</Menubar.Item>
                  <Menubar.Item className='MenubarItem'>Source Code File</Menubar.Item>
                </Menubar.SubContent>
              </Menubar.Portal>
            </Menubar.Sub>
            <Menubar.Separator className='MenubarSeparator' />

            <Menubar.Sub>
              <Menubar.SubTrigger className='MenubarSubTrigger'>
                Preferences
                <div className="RightSlot">
                  <ChevronRightIcon />
                </div>
              </Menubar.SubTrigger>
              <Menubar.Portal>
                <Menubar.SubContent className='MenubarSubContent'>
                  <Menubar.Item className='MenubarItem'>Global</Menubar.Item>
                  <Menubar.Item className='MenubarItem'>Problem list</Menubar.Item>
                </Menubar.SubContent>
              </Menubar.Portal>
            </Menubar.Sub>
            <Menubar.Separator className='MenubarSeparator' />

            <Menubar.Item className='MenubarItem'>Close Contest</Menubar.Item>
            <Menubar.Item className='MenubarItem'>Close Problem List</Menubar.Item>
            <Menubar.Separator className='MenubarSeparator' />

            <Menubar.Item className='MenubarItem'>Exit</Menubar.Item>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>

      <Menubar.Menu>
        <Menubar.Trigger className="MenubarTrigger">Edit</Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content className='MenubarContent'>
            <Menubar.Item className='MenubarItem'>Undo</Menubar.Item>
            <Menubar.Item className='MenubarItem'>Redo</Menubar.Item>
            <Menubar.Separator className='MenubarSeparator' />

            <Menubar.Item className='MenubarItem'>Cut</Menubar.Item>
            <Menubar.Item className='MenubarItem'>Copy</Menubar.Item>
            <Menubar.Item className='MenubarItem'>Paste</Menubar.Item>
            <Menubar.Separator className='MenubarSeparator' />

            <Menubar.Item className='MenubarItem'>Find</Menubar.Item>
            <Menubar.Item className='MenubarItem'>Replace</Menubar.Item>
            <Menubar.Separator className='MenubarSeparator' />

            <Menubar.Item className='MenubarItem'>Toggle Line Comment</Menubar.Item>
            <Menubar.Item className='MenubarItem'>Toggle Block Comment</Menubar.Item>

          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>

      <Menubar.Menu>
        <Menubar.Trigger className="MenubarTrigger">
          Selection
        </Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content className='MenubarContent'>
            <Menubar.Item className='MenubarItem'>Select All</Menubar.Item>
            <Menubar.Item className='MenubarItem'>Expand All</Menubar.Item>
            <Menubar.Item className='MenubarItem'>Shrink All</Menubar.Item>
            <Menubar.Separator className='MenubarSeparator' />


            <Menubar.Item className='MenubarItem'>Copy Line Up</Menubar.Item>
            <Menubar.Item className='MenubarItem'>Copy Line Down</Menubar.Item>
            <Menubar.Item className='MenubarItem'>Move Line Up</Menubar.Item>
            <Menubar.Item className='MenubarItem'>Move Line Down</Menubar.Item>
            <Menubar.Item className='MenubarItem'>Duplicate Selection</Menubar.Item>
            <Menubar.Separator className='MenubarSeparator' />

            <Menubar.Item className='MenubarItem'>Add Cursor Above</Menubar.Item>
            <Menubar.Item className='MenubarItem'>Add Cursor Below</Menubar.Item>
            <Menubar.Item className='MenubarItem'>Add Cursor to Line Ends</Menubar.Item>
            <Menubar.Item className='MenubarItem'>Add Next Occurrence</Menubar.Item>
            <Menubar.Item className='MenubarItem'>Add Previous Occurrence</Menubar.Item>
            <Menubar.Item className='MenubarItem'>Select All Occurrences</Menubar.Item>

          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>

      <Menubar.Menu>
        <Menubar.Trigger className="MenubarTrigger">Teamwork</Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content className='MenubarContent'>
            <Menubar.Item className='MenubarItem'>Start</Menubar.Item>
            <Menubar.Item className='MenubarItem'>Join</Menubar.Item>
            <Menubar.Separator className='MenubarSeparator' />
            <Menubar.Item className='MenubarItem'>Focus Me</Menubar.Item>
            <Menubar.Item className='MenubarItem'>Focus Other</Menubar.Item>
            <Menubar.Separator className='MenubarSeparator' />
            <Menubar.Item className='MenubarItem'>Request to Edit</Menubar.Item>
            <Menubar.Item className='MenubarItem'>Virtual Print</Menubar.Item>
            <Menubar.Item className='MenubarItem'>Printer</Menubar.Item>
            <Menubar.Separator className='MenubarSeparator' />
            <Menubar.Item className='MenubarItem'>About Teamwork</Menubar.Item>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>

      <Menubar.Menu>
        <Menubar.Trigger className="MenubarTrigger">Run</Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content className='MenubarContent'>
            <Menubar.Item className='MenubarItem'>Compile</Menubar.Item>
            <Menubar.Item className='MenubarItem'>Compile and Run</Menubar.Item>
            <Menubar.Item className='MenubarItem'>Compile and Test</Menubar.Item>
            <Menubar.Separator className='MenubarSeparator' />
            <Menubar.Item className='MenubarItem'>Submit</Menubar.Item>
            <Menubar.Separator className='MenubarSeparator' />
            <Menubar.Item className='MenubarItem'>Toggle Breakpoint</Menubar.Item>
            <Menubar.Item className='MenubarItem'>Start Debugging</Menubar.Item>
            <Menubar.Item className='MenubarItem'>Stop Debugging</Menubar.Item>
            <Menubar.Item className='MenubarItem'>Step Over</Menubar.Item>
            <Menubar.Item className='MenubarItem'>Step Into</Menubar.Item>
            <Menubar.Item className='MenubarItem'>Step Out</Menubar.Item>
            <Menubar.Item className='MenubarItem'>Continue</Menubar.Item>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>

      <Menubar.Menu>
        <Menubar.Trigger className="MenubarTrigger">Help</Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content className='MenubarContent'>
            <Menubar.Item className='MenubarItem'>Statistics</Menubar.Item>
            <Menubar.Separator className='MenubarSeparator' />

            <Menubar.Item className='MenubarItem'>Show All Commands</Menubar.Item>
            <Menubar.Item className='MenubarItem'>Documentation</Menubar.Item>
            <Menubar.Item className='MenubarItem'>Changelog</Menubar.Item>
            <Menubar.Separator className='MenubarSeparator' />

            <Menubar.Item className='MenubarItem'>Report Issue</Menubar.Item>
            <Menubar.Separator className='MenubarSeparator' />

            <Menubar.Item className='MenubarItem'>View License</Menubar.Item>
            <Menubar.Separator className='MenubarSeparator' />

            <Menubar.Item className='MenubarItem'>Toggle Developer Tools</Menubar.Item>
            <Menubar.Separator className='MenubarSeparator' />

            <Menubar.Item className='MenubarItem'>About</Menubar.Item>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>
    </Menubar.Root>
  )
}