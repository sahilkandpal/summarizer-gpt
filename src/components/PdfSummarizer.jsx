import React, { useEffect, useState } from 'react'
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import {FaChevronLeft, FaChevronRight, FaFilePdf} from "react-icons/fa"
import { useGetTextSummaryMutation } from '../services/article';
import { copy, linkIcon, loader, tick } from "../assets";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PdfSummarizer = () => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfText, setPdfText] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
  const [pageNo, setPageNo] = useState(1);
  const [summary, setSummary] = useState("");
  const [summaryHistory, setSummaryHistory] = useState([])
  const [fileName, setFileName] = useState("");
  const [getTextSummary, { error, isFetching, isLoading }] = useGetTextSummaryMutation();

  useEffect(() => {
    const summaryFromLocalStorage = JSON.parse(
      localStorage.getItem("summaryHistory")
    );

    if (summaryFromLocalStorage) {
      setSummaryHistory(summaryFromLocalStorage);
    }
  }, []);

  const onFileChange = async (event) => {
    const file = event.target.files[0];
    const fileN = event.target.files[0]?.name;
    setFileName(fileN);

    // Load the file using FileReader
    const reader = new FileReader();
    reader.onload = async (e) => {
      const objectUrl = URL.createObjectURL(file);
      setPdfFile(objectUrl);
      const typedArray = new Uint8Array(e.target.result);
      const pdf = await pdfjs.getDocument(typedArray).promise;

      // Extract text from each page
      let extractedText = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(' ');
        const textObj = {pageNo: i, text: pageText}
        extractedText.push(textObj);
      }
      // const page = await pdf.getPage(pageNumber);
      // const textContent = await page.getTextContent();
      // const pageText = textContent.items.map((item) => item.str).join(' ');
      // extractedText = pageText;

      setPdfText(extractedText);
      setNumPages(pdf.numPages);
      setPageNumber(1);
    };

    reader.readAsArrayBuffer(file);
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      handleSubmit(e);
    }
  };


  const generate = async (e) => {
    e.preventDefault();

    // const existingArticle = allArticles.find(
    //   (item) => item.url === article.url
    // );

    // if (existingArticle) return setArticle(existingArticle);
    let pageText = pdfText.filter((pdfPage)=>pdfPage.pageNo==pageNumber)[0]?.text;
    pageText = 'Generate Elaborated Summary : '+ pageText;
    const body={
      lang: 'en',
      text: pageText
    }

    const { data } = await getTextSummary(body);
    console.log("mylog", data);
    if (data?.summary) {
      setSummary(data.summary);
      const newSummaryHistory = [...summaryHistory, {fileName: `${fileName} pg-${pageNumber}`, summary: data.summary}];
      // const updatedAllArticles = [newArticle, ...allArticles];

      // update state and local storage
      // setArticle(newArticle);
      setSummaryHistory(newSummaryHistory);
      localStorage.setItem("summaryHistory", JSON.stringify(newSummaryHistory));
    }
  };

  console.log("mylog", pdfText)

  useEffect(()=>{
    if(summary){
      window.scrollTo({
        top: 1e10,
        behavior: 'smooth',
      })
    }
  }, [summary]);

  const handleCopy = (summary) => {
    navigator.clipboard.writeText(summary);
  };

  return (
    <div className="max-w-6xl">
    <div className="pdf-container w-full mt-6">          
        <div className='flex flex-col w-full gap-2'>
        <form
          className='relative flex justify-center items-center max-w-xl mx-auto'
        >
          <FaFilePdf
            alt='file-icon'
            className='absolute left-0 my-2 ml-3 w-5'
          />

          <input
            type='file'
            onChange={onFileChange}
            className='url_input_pdf peer'
          />
          <input
            type='number'
            value={pageNo}
            placeholder='page no.'
            onChange={(e) => {setPageNo(e.target.value)}}
            onKeyDown={handleKeyDown}
            required
            className='absolute inset-y-0 right-12 my-1.5 mr-1.5 w-16 text-sm p-1'
             // When you need to style an element based on the state of a sibling element, mark the sibling with the peer class, and use peer-* modifiers to style the target element
          />
          <button
            className='submit_btn peer-focus:border-gray-700 peer-focus:text-gray-700 '
            onClick={(e)=>{e.preventDefault(); if(pageNo>0 && pageNo<=numPages) setPageNumber(Number(pageNo))}}
          >
            <p>↵</p>
          </button>
        </form>
        <div className='flex flex-col gap-1 max-h-60 overflow-y-auto max-w-xl w-full mx-auto'>
          {summaryHistory.reverse().map((item, index) => (
            <div
              key={`link-${index}`}
              onClick={() => setSummary(item.summary)}
              className='link_card'
            >
              <div className='copy_btn' onClick={() => handleCopy(item.summary)}>
                <img
                  src={copy}
                  alt={"copy_icon"}
                  className='w-[40%] h-[40%] object-contain'
                />
              </div>
              <p className='flex-1 font-satoshi text-blue-700 font-medium text-sm truncate'>
                {item.fileName}
              </p>
            </div>
          ))}
        </div>
        </div>

     <div className='flex gap-4 bg-white p-4 rounded-lg shadow-2xl mt-6'>
     <div>
     {numPages && <div className="pdf-pagination mb-4 flex gap-2 justify-center items-center">
      <div className={`${pageNumber===1 ? 'cursor-not-allowed text-gray-300' : 'cursor-pointer'}`} onClick={()=> pageNumber>1 && setPageNumber(pageNumber-1)}><FaChevronLeft/></div>
        <p className='font-bold text-center'>
          {pageNumber} of {numPages}
        </p>
        <div className={`${pageNumber===numPages ? 'cursor-not-allowed text-gray-300' : 'cursor-pointer'}`} onClick={()=> pageNumber<numPages && setPageNumber(pageNumber+1)}><FaChevronRight/></div>
     </div>}
    <Document
      file={pdfFile}
      renderMode="canvas"
      onLoadSuccess={onDocumentLoadSuccess}
      // className="pdf-document"
    >
      <Page pageNumber={pageNumber} />
    </Document>
    </div>
    <div className='flex-1 max-h-[800px] overflow-auto'>
        <div className='relative'>
          <h2 className='font-bold text-center mb-4'>Extracted Text</h2>
          {pdfText.length>0 && <><div className='flex justify-center items-center bg-[rgba(255,255,255,0.5)] absolute top-0 bottom-0 left-0 right-0 h-full w-full'><button className='py-3 px-8 h-fit shadow-lg bg-amber-500 hover:bg-amber-600 rounded-full block text-white font-bold' onClick={generate}>{isFetching || isLoading ? "Generating...": "Generate Summary"}</button></div>
          <p>{pdfText.filter((pdfPage)=>pdfPage.pageNo==pageNumber)[0]?.text}</p></>}
        </div>
    </div>
    </div>
  </div>

  {summary && <div className='summary max-w-2xl mx-auto bg-white p-4 rounded-lg shadow-2xl mt-6 mb-10'>
    <h2 className='font-bold text-center text-lg mb-4'>Summary</h2>
    <div>{summary}</div>
  </div>}
</div>
  )
}

export default PdfSummarizer