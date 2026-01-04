import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../Context/AppContext';
import { assets, dummyDashboardData } from '../../assets/assets';
import Loading from '../../Components/Students/Loading';

const Dashboard = () => {

  // getting required values from global AppContext
  const { currency, isEducator } = useContext(AppContext);

  // local state to store dashboard info
  const [dashboardData, setDashboardData] = useState(null);

  // temporary function to load dummy data
  // later you can replace this with real API call
  const fetchDashboardData = async () => {
    setDashboardData(dummyDashboardData)
  }

  // runs only on first render
  useEffect(() => {
    fetchDashboardData()
  }, [])

  // if dashboardData exists, show dashboard, otherwise show loader
  return dashboardData ? (
    <>
      <div className="min-h-screen flex flex-col items-start justify-between gap-8 md:p-8 md:pb-0 p-4 pt-8 pb-0">

        <div className="space-y-1 w-full">

          {/* Main stats cards section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-center w-full">

            {/* Total Enrollments card */}
            <div className="flex items-center gap-3 shadow-card border border-blue-500 p-4 w-full rounded-md">
              <img src={assets.patients_icon} alt="patients_icon" />
              <div>
                <p className="text-2xl font-medium text-gray-600">
                  {dashboardData.enrolledStudentsData.length}
                </p>
                <p className="text-base text-gray-500">Total Enrollments</p>
              </div>
            </div>

            {/* Total Courses card */}
            <div className="flex items-center gap-3 shadow-card border border-blue-500 p-4 w-full rounded-md">
              <img src={assets.appointments_icon} alt="appointments_icon" />
              <div>
                <p className="text-2xl font-medium text-gray-600">
                  {dashboardData.totalCourses}
                </p>
                <p className="text-base text-gray-500">Total Courses</p>
              </div>
            </div>

            {/* Total Earnings card */}
            <div className="flex items-center gap-3 shadow-card border border-blue-500 p-4 w-full rounded-md">
              <img src={assets.earning_icon} alt="earning_icon" />
              <div className="whitespace-nowrap">
                <p className="text-2xl font-medium text-gray-600 text-nowrap">
                  {currency}
                  {dashboardData.totalEarnings}
                </p>
                <p className="text-base text-gray-500">Total Earnings</p>
              </div>
            </div>
          </div>

          {/* Latest enrollments table */}
          <div className="pt-16 w-full mb-16">

            <h2 className="pb-4 text-lg font-medium">Latest Enrollments</h2>

            <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20 mb-10">

              <div className="w-full overflow-x-auto">
                <table className="table-fixed md:table-auto w-full overflow-hidden">

                  <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-center hidden sm:table-cell">
                        #
                      </th>
                      <th className="px-4 py-3 font-semibold">Student Name</th>
                      <th className="px-4 py-3 font-semibold">Course Title</th>
                    </tr>
                  </thead>

                  <tbody className="text-sm text-gray-500">

                    {/* looping through latest enrolled students */}
                    {dashboardData.enrolledStudentsData.map((item, index) => (
                      <tr key={index} className="border-b border-gray-500/20">

                        <td className="px-4 py-3 text-center hidden sm:table-cell">
                          {index + 1}
                        </td>

                        {/* student name and avatar */}
                        <td className="md:px-4 px-2 py-3 flex items-center space-x-3">
                          <img
                            src={item.student.imageUrl}
                            alt="student"
                            className="w-9 h-9 rounded-full"
                          />
                          <span className="truncate">{item.student.name}</span>
                        </td>

                        {/* course title */}
                        <td className="px-4 py-3 truncate">{item.courseTitle}</td>

                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>

            </div>

          </div>
        </div>
      </div>
    </>
  ) : (
    // loader when data not ready
    <Loading />
  )
}

export default Dashboard
