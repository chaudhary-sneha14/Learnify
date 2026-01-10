// ================= IMPORT SECTION =================
import React, { useContext, useEffect, useRef, useState } from 'react'
import uniqid from 'uniqid'
import Quill from 'quill'
import { assets } from '../../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../../Context/AppContext'

const AddCourse = () => {

  // ================= EDITOR SECTION =================

   const { backendUrl, getToken,} = useContext(AppContext)

  // stores the Quill editor instance
  const quillRef = useRef(null)

  // reference to the HTML div where editor will be mounted
  const editorRef = useRef(null)

  // ================== COURSE STATE SECTION ==================

  // course title input
  const [courseTitle, setCourseTitle] = useState('')

  // course price input
  const [coursePrice, setCoursePrice] = useState(0)

  // discount percentage
  const [discount, setDiscount] = useState(0)

  // thumbnail image file
  const [image, setImage] = useState(null)

  // all chapters list
  const [chapters, setChapters] = useState([])

  // popup visibility for adding lecture
  const [showPopup, setShowPopup] = useState(false)

  // to know which chapter lecture belongs to
  const [currentChapterId, setCurrentChapterId] = useState(null)

  // lecture input fields
  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: '',
    lectureDuration: '',
    lectureUrl: '',
    isPreviewFree: false,
  })

  // ================= CHAPTER HANDLER SECTION =================

  const handleChapter = (action, chapterId) => {

    // add new chapter
    if (action === 'add') {
      const title = prompt('Enter Chapter Name:')

      if (title) {
        const newChapter = {
          chapterId: uniqid(), 
          chapterTitle: title,
          chapterContent: [],
          collapsed: false,
          chapterOrder:
            chapters.length > 0
              ? chapters.slice(-1)[0].chapterOrder + 1
              : 1,
        }

        setChapters([...chapters, newChapter])
      }
    }

    // remove chapter
    else if (action === 'remove') {
      setChapters(chapters.filter(ch => ch.chapterId !== chapterId))
    }

    // expand or collapse chapter
    else if (action === 'toggle') {
      setChapters(
        chapters.map(ch =>
          ch.chapterId === chapterId
            ? { ...ch, collapsed: !ch.collapsed }
            : ch
        )
      )
    }
  }

  // ================= LECTURE HANDLER SECTION =================

  // add or remove lectures
  const handleLecture = (action, chapterId, lectureIndex) => {

    // open add lecture popup
    if (action === 'add') {
      setCurrentChapterId(chapterId)
      setShowPopup(true)
    }

    // remove lecture safely (no splice mutation)
    else if (action === 'remove') {
      setChapters(
        chapters.map(chapter => {
          if (chapter.chapterId === chapterId) {
            return {
              ...chapter,
              chapterContent: chapter.chapterContent.filter(
                (_, index) => index !== lectureIndex
              ),
            }
          }
          return chapter
        })
      )
    }
  }

  // add lecture to selected chapter
  const addLecture = () => {

    setChapters(
      chapters.map(chapter => {
        if (chapter.chapterId === currentChapterId) {

          const newLecture = {
            ...lectureDetails,
            lectureOrder:
              chapter.chapterContent.length > 0
                ? chapter.chapterContent.slice(-1)[0].lectureOrder + 1
                : 1,
            lectureId: uniqid(),
          }

          // return updated chapter with new lecture appended
          return {
            ...chapter,
            chapterContent: [...chapter.chapterContent, newLecture],
          }
        }
        return chapter
      })
    )

    // close popup
    setShowPopup(false)

    // clear lecture form
    setLectureDetails({
      lectureTitle: '',
      lectureDuration: '',
      lectureUrl: '',
      isPreviewFree: false,
    })
  }

  // ================= FORM SUBMIT SECTION =================

  const handleSubmit = async (e) => {
       try {
    e.preventDefault();

    if (!image) {
      toast.error("Thumbnail Not Selected");
      return; // Prevent further execution
    }

    if (!chapters.length) {
      toast.error("At least one chapter is required!");
      return;
    }

    // Ensure each chapter has a chapter order
    const updatedChapters = chapters.map((ch, index) => ({
      ...ch,
      chapterorder: ch.chapterorder || index + 1, // Auto-assign order if missing
    }));

    const courseData = {
      courseTitle,
      courseDescription: quillRef.current.root.innerHTML,
      coursePrice: Number(coursePrice),
      discount: Number(discount),
      isPublished: true, //  Include isPublished field
      courseContent: updatedChapters,
    };

    const formData = new FormData();
    formData.append("courseData", JSON.stringify(courseData)); // ✅ Ensure courseData is sent as JSON
    formData.append("image", image); // ✅ Ensure image is sent correctly

    const token = await getToken();
    const { data } = await axios.post(backendUrl + "/api/educator/add-course",
      formData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("data", data);

    if (data.success) {
      toast.success(data.message);
      setCourseTitle("");
      setCoursePrice(0);
      setDiscount(0);
      setImage(null);
      setChapters([]);
      quillRef.current.root.innerHTML = "";
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error(error.message);
    console.log(error.message);
  }

  }

  // ================= EDITOR INITIALIZE SECTION =================

  // runs once to create Quill editor
  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, { theme: 'snow' })
    }
  }, [])

  // ================= UI RENDER SECTION =================

  return (
    <>
      <div className='h-screen overflow-scroll flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0'>

        {/* form starts here */}
        <form onSubmit={handleSubmit} className='flex flex-col gap-4 max-w-md w-full text-gray-500'>

          {/* course title input */}
          <div className='flex flex-col gap-1'>
            <p>Course Title:</p>
            <input
              onChange={e => setCourseTitle(e.target.value)}
              value={courseTitle}
              type="text"
              placeholder='Type here'
              className='outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500'
              required
            />
          </div>

          {/* description editor */}
          <div className='flex flex-col gap-1'>
            <p>Course Description:</p>
            <div ref={editorRef}></div>
          </div>

          {/* price and thumbnail */}
          <div className='flex items-center justify-between flex-wrap'>

            {/* price */}
            <div className='flex flex-col gap-1'>
              <p>Course Price</p>
              <input
                onChange={e => setCoursePrice(e.target.value)}
                value={coursePrice}
                type="number"
                className='outline-none md:py-2.5 w-28 py-2 px-3 rounded border border-gray-500'
                required
              />
            </div>

            {/* thumbnail */}
            <div className='flex md:flex-row flex-col items-center gap-3 mt-5'>
              <p>Course Thumbnail</p>

              <label htmlFor="thumbnailImage" className='flex items-center gap-3'>
                <img src={assets.file_upload_icon} className='p-3 bg-blue-500 rounded' />

                <input
                  id='thumbnailImage'
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={e => setImage(e.target.files[0])}
                />

                <img className='max-h-10' src={image ? URL.createObjectURL(image) : " "} />
              </label>
            </div>
          </div>

          {/* discount */}
          <div className='flex flex-col gap-1'>
            <p>Discount %</p>
            <input
              onChange={e => setDiscount(e.target.value)}
              value={discount}
              type="number"
              min={0}
              max={100}
              className='outline-none md:py-2.5 py-2 px-3 w-28 rounded border border-gray-500'
              required
            />
          </div>

          {/* chapters & lectures */}
          <div>

            {chapters.map((chapter, chapterIndex) => (
              <div key={chapterIndex} className='bg-white border rounded-lg mb-4'>

                <div className='flex justify-between items-center p-4 border-b'>

                  <div className='flex items-center'>
                    <img
                      src={assets.dropdown_icon}
                      width={14}
                      className={`mr-2 cursor-pointer transition-all ${chapter.collapsed && "-rotate-90"}`}
                      onClick={() => handleChapter('toggle', chapter.chapterId)}
                    />

                    <span className='font-semibold'>
                      {chapterIndex + 1} {chapter.chapterTitle}
                    </span>
                  </div>

                  <span>{chapter.chapterContent.length} Lectures</span>

                  <img
                    src={assets.cross_icon}
                    className='cursor-pointer'
                    onClick={() => handleChapter('remove', chapter.chapterId)}
                  />
                </div>

                {!chapter.collapsed && (
                  <div className='p-4'>

                    {chapter.chapterContent.map((lecture, lectureIndex) => (
                      <div key={lectureIndex} className='flex justify-between items-center mb-2'>

                        <span>
                          {lectureIndex + 1} {lecture.lectureTitle} - {lecture.lectureDuration} mins -
                          <a href={lecture.lectureUrl} target='_blank' className='text-blue-500'>Link</a> -
                          {lecture.isPreviewFree ? 'Free Preview' : 'Paid'}
                        </span>

                        <img
                          src={assets.cross_icon}
                          className='cursor-pointer'
                          onClick={() => handleLecture('remove', chapter.chapterId, lectureIndex)}
                        />
                      </div>
                    ))}

                    <div
                      className='inline-flex bg-gray-100 p-2 rounded cursor-pointer mt-2'
                      onClick={() => handleLecture('add', chapter.chapterId)}
                    >
                      + Add Lectures
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div
              className='flex justify-center items-center bg-blue-100 p-2 rounded-lg cursor-pointer'
              onClick={() => handleChapter('add')}
            >
              + Add Chapter
            </div>

            {/* popup for lecture */}
            {showPopup && (
              <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50'>
                <div className='bg-white p-4 rounded relative w-full max-w-80'>

                  <p className='text-lg font-semibold mb-4'>Add Lecture</p>

                  <input
                    type="text"
                    placeholder='Lecture Title'
                    className='mt-1 block w-full border rounded py-1 px-2 mb-2'
                    value={lectureDetails.lectureTitle}
                    onChange={e => setLectureDetails({ ...lectureDetails, lectureTitle: e.target.value })}
                  />

                  <input
                    type="number"
                    placeholder='Duration'
                    className='mt-1 block w-full border rounded py-1 px-2 mb-2'
                    value={lectureDetails.lectureDuration}
                    onChange={e => setLectureDetails({ ...lectureDetails, lectureDuration: e.target.value })}
                  />

                  <input
                    type="text"
                    placeholder='Video URL'
                    className='mt-1 block w-full border rounded py-1 px-2 mb-2'
                    value={lectureDetails.lectureUrl}
                    onChange={e => setLectureDetails({ ...lectureDetails, lectureUrl: e.target.value })}
                  />

                  <label>
                    <input
                      type="checkbox"
                      checked={lectureDetails.isPreviewFree}
                      onChange={e =>
                        setLectureDetails({ ...lectureDetails, isPreviewFree: e.target.checked })
                      }
                    />
                    Preview Free
                  </label>

                  <button className='w-full bg-blue-400 text-white px-4 py-2 rounded mt-3' type='button' onClick={addLecture}>
                    Add
                  </button>

                  <img
                    src={assets.cross_icon}
                    className='absolute top-4 right-4 cursor-pointer'
                    onClick={() => setShowPopup(false)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* submit */}
          <button type='submit' className='bg-black text-white px-8 py-2 rounded'>
            ADD
          </button>
        </form>
      </div>
    </>
  )
}

export default AddCourse
