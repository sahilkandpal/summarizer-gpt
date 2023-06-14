import React from "react";
import {GiQuillInk} from "react-icons/gi"

const Hero = () => {
  return (
    <header className='w-full flex justify-center items-center flex-col'>
      <nav className='flex justify-between items-center w-full mb-10 pt-3'>
      <div className="flex gap-2 items-center">
          <GiQuillInk className="text-[32px]"/>
          <div className="font-bold text-3xl leading-none">Summarizz</div>
      </div>


        <button
          type='button'
          className='black_btn'
        >
          About
        </button>
      </nav>

      {/* <h1 className='head_text'>
        Summarize Articles with <br className='max-md:hidden' />
        <span className='orange_gradient '>OpenAI GPT-4</span>
      </h1>
      <h2 className='desc'>
        Simplify your reading with Summize, an open-source article summarizer
        that transforms lengthy articles into clear and concise summaries
      </h2> */}
    </header>
  );
};

export default Hero;
