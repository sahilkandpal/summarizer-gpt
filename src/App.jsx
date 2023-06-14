import Hero from "./components/Hero";
import Demo from "./components/Demo";
import PdfSummarizer from "./components/PdfSummarizer";
import "./App.css";
import { useState } from "react";

const App = () => {
  const [tab, setTab] = useState(1);
  return (
    <main>
      <div className='main'>
        <div className='gradient' />
      </div>

      <div className='app'>
        <Hero />
        <div className="flex bg-[#272727] py-4 px-7 rounded-full mt-7 w-full max-w-3xl">
          <div onClick={()=>setTab(1)} className={`cursor-pointer flex-1 justify-center flex ${tab===1 ? 'bg-white text-amber-500' : 'text-white'} py-4 px-7 rounded-full font-bold`}>Summarize Article with link</div>
          <div onClick={()=>setTab(2)} className={`cursor-pointer flex-1 justify-center flex ${tab===2 ? 'bg-white text-amber-500' : 'text-white'} py-4 px-7 rounded-full font-bold`}>Summarize Research Paper</div>
        </div>

        {tab===1 ? <Demo /> : null}
        {tab===2 ? <PdfSummarizer/> : null}
      </div>
    </main>
  );
};

export default App;
