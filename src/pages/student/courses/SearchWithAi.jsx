import { AuthContext } from "@/context/auth-context";
// import { RiMicAiFill } from "@eact-icons/ri";
import axiosInstance from "@/api/axiosInstance";
import {
  checkCoursePurchaseInfoService
} from "@/services";
import { useContext, useState } from "react";
import { FaMicrophoneAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import start from "../../../assets/start.mp3";
import ai from "../courses/ai.png";


const SearchWithAi = () => {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const [input, setInput] = useState("");
  const startSound = new Audio(start);
  const [listening, setListening] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  //  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  if(!recognition){
    toast.error("Speech recognition not supported")
  }

  const handleSearch = async () => {
    if(!recognition) return;
    recognition.start();
    setListening(true);
    startSound.play();
    recognition.onresult = async (e) => {
      console.log(e)
      const transcript = e.results[0][0].transcript.trim();
      setInput(transcript);
      await handleRecommendation(transcript);
    }
  }

  const handleRecommendation = async (query) => {
    console.log("query", query);
    try {
      const result = await axiosInstance.post(`/student/courses-bought/search`,
        {query: query},
  )
    setRecommendations(result.data);
    setListening(false);
    if(result.data.length > 0){
      speak("these are the top courses i found")
    }
    else{
      speak("No courses found")
    }
    } catch (error) {
     console.log(error);
     setListening(false);
    }
  }

  function speak(message){
   let utterance = new SpeechSynthesisUtterance(message);
   window.speechSynthesis.speak(utterance);
  }
 async function handleCourseNavigate(getCurrentCourseId) {
    try {
      const response = await checkCoursePurchaseInfoService(
        getCurrentCourseId,
        auth?.user?._id
      );
      console.log("response", response);
       if (response?.success) {
      if (response?.data) {
        navigate(`/course-progress/${getCurrentCourseId}`);
      } else {
        navigate(`/course/details/${getCurrentCourseId}`);
      }
    }

    } catch (error) {
      console.log(error)
      // navigate(`/course/details/${getCurrentCourseId}`);

    }



  }

  return (
       <div className="container mx-auto p-4 bg-gray-100">
             <div className="flex items-center justify-between w-full
             text-white bg-gradient-to-r from-purple-500 to-pink-500  font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2
             ">
             <h1 className="text-3xl font-bold mb-4">AI PowerFul Search</h1>

       <div className="flex items-center bg-gray-200 rounded-full
             overflow-hidden shadow-lg relative w-[700px] mb-5
             ">
              <input type="text" className="flex-grow px-4 py-3 bg-transparent
              text-black placeholder-gray-400 focus:outline-none text-sm sm:text-base"
              placeholder="what do you want to learn? (e.g. AI, MERN..)"
              onChange={(e) => setInput(e.target.value)} value={input}/>

              {input && <button className="absolute right-14 sm:right-16 bg-white rounded-full">
               <img src={ai} alt="" className="w-10 h-10 p-2 rounded-full"
               onClick={() => handleRecommendation(input)}
               />
              </button>}

              <button className="absolute right-2 bg-white rounded-full w-10 h-10 flex items-center justify-center"
              onClick={handleSearch}>
               <FaMicrophoneAlt className='w-5 h-5 fill-purple-400' />
              </button>

             </div>

             </div>
             {
               recommendations.length >0 ? (
                 <div className="w-full max-w-6xl mt-12 px-2 sm:px-4">
                  <h1 className="text-xl sm:text-2xl font-semibold mb-6
                  text-black text-center">
                   AI Search Results</h1>
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                    {
                     recommendations?.map((course, index) => (
                       <div key={index} className="bg-white text-black p-5 rounded-2xl shadow-md hover:shadow-indigo-500/30 transition-all
                       duration-200 border border-gray-200 cursor-pointer hover:bg-gray-200"
                        onClick={() => handleCourseNavigate(course?._id)}
                       // onClick={()=> navigate(`viewcours/${course._id}`)}
                       >
                         <h2 className="text-lg font-bold sm:text-xl">{course.title}</h2>
                         <p className="text-sm text-gray-600 mt-1">{course.instructorName}</p>

                       </div>
                     ))
                    }
                 </div>
                 </div>
               ) : (
          listening ? <h1 className="text-center text-xl sm:text-2xl mt-10 text-gray-400">Listening...</h1>
          :
          <h1 className="text-center text-xl sm:text-2xl mt-10 text-gray-400">No courses found yet</h1>
               )
             }
    </div>
  )
}

export default SearchWithAi
