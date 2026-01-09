import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../Context/AppContext";
import { useParams } from "react-router-dom";
import { assets } from "../../assets/assets";
import humanizeDuration from "humanize-duration";
import Loading from "../../Components/Students/Loading";
import Footer from "../../Components/Students/Footer";
import YouTube from "react-youtube";
import Rating from "../../Components/Students/Rating";

const Player = () => {
  // get data from context
  const { enrolledCourses, calculateChapterTime } = useContext(AppContext);

  // get course id from URL
  const { courseId } = useParams();

  // store selected course
  const [courseData, setCourseData] = useState(null);

  // track open chapters
  const [openSections, setOpenSections] = useState({});

  // store selected lecture
  const [playerData, setPlayerData] = useState(null);

  // load course data on page load
  useEffect(() => {
    const course = enrolledCourses.find((c) => c._id === courseId);
    setCourseData(course);
  }, [enrolledCourses, courseId]);

  // open or close chapter
  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // show loader while loading
  if (!courseData) return <Loading />;

  return (
    <>
      <div className="p-4 sm:p-10 md:grid md:grid-cols-2 gap-10 md:px-36">
        {/* LEFT SIDE: course structure */}
        <div>
          <h2 className="text-xl font-semibold">Course Structure</h2>

          <div className="pt-5">
            {courseData.courseContent.map((chapter, index) => (
              <div key={index} className="border mb-2 rounded">
                {/* chapter header */}
                <div
                  className="flex justify-between px-4 py-3 cursor-pointer"
                  onClick={() => toggleSection(index)}
                >
                  <div className="flex gap-2">
                    <img
                      src={assets.down_arrow_icon}
                      className={`transition-transform ${
                        openSections[index] ? "rotate-180" : ""
                      }`}
                      alt="arrow"
                    />
                    <p>{chapter.chapterTitle}</p>
                  </div>

                  <p className="text-sm">
                    {chapter.chapterContent.length} lectures ·{" "}
                    {calculateChapterTime(chapter)}
                  </p>
                </div>

                {/* lectures list */}
                {openSections[index] && (
                  <ul className="border-t px-4 py-2">
                    {chapter.chapterContent.map((lecture, i) => (
                      <li
                        key={i}
                        className="flex justify-between items-center py-2 cursor-pointer"
                        onClick={() =>
                          setPlayerData({
                            ...lecture,
                            chapter: index + 1,
                            lecture: i + 1,
                          })
                        }
                      >
                        <p>{lecture.lectureTitle}</p>
                        <div className="flex gap-2">
                          {lecture.lectureUrl && (
                            <p
                              onClick={() =>
                                setPlayerData({
                                  ...lecture,
                                  chapter: index + 1,
                                  lecture: i + 1,
                                })
                              }
                              className="text-blue-500 cursor-pointer"
                            >
                              Watch
                            </p>
                          )}

                          <p>
                            {humanizeDuration(
                              lecture.lectureDuration * 60 * 1000,
                              { units: ["h", "m"] }
                            )}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 py-3 mt-10">
            <h1 className="text-xl font-bold ">Rate this Course:</h1>
            <Rating initialRating={0} />
          </div>
        </div>

        {/* RIGHT SIDE: video player */}
        <div>
          {playerData ? (
            <>
              <YouTube
                videoId={playerData.lectureUrl.split("/").pop()}
                className="w-full aspect-video"
              />

              <p className="mt-2 font-medium">
                {playerData.chapter}.{playerData.lecture}{" "}
                {playerData.lectureTitle}
              </p>
            </>
          ) : (
            // show thumbnail before lecture selection
            <img
              src={courseData.courseThumbnail}
              alt="course thumbnail"
              className="rounded"
            />
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Player;
