import Content from './components/Content'
import LeftMenu from './components/LeftMenu'

function App(): JSX.Element {
  return (
    <div className="flex w-[100vw]  h-[100vh]">
      <div className="w-[200px] w-min-[200px]">
        <LeftMenu />
      </div>
      <div className="flex-1 border-[#0e0d0d7e] my-[10px] border-x-[1px]">
        <Content />
      </div>
      {/* <div className="w-[200px] w-min-[200px] relative"><Versions /></div> */}
    </div>
  )
}

export default App
