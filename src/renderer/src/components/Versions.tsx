import { useState } from 'react'

function Versions(): JSX.Element {
  const [versions] = useState(window.electron.process.versions)

  return (
    <ul className="versions flex flex-row ">
      <li className="electron-version">Electron v{versions.electron}</li>
      <li className="chrome-version">Chromium v{versions.chrome}</li>
      <li className="node-version">
        <span className=" mr-[34px]">Node</span> v{versions.node}
      </li>
    </ul>
  )
}

export default Versions
