import React, { useState, useEffect, createContext, useContext } from "react";

// Context for enrolled courses
const EnrolledCoursesContext = createContext();

export function App() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const enrollCourse = (course) => {
    setEnrolledCourses((prev) => [...prev, course]);
  };

  const dropCourse = (courseId) => {
    setEnrolledCourses((prev) => prev.filter((course) => course.id !== courseId));
  };

  return (
    <EnrolledCoursesContext.Provider value={{ enrolledCourses, enrollCourse, dropCourse }}>
      <Header />
      <SchoolCatalog />
      <ClassSchedule />
    </EnrolledCoursesContext.Provider>
  );
}

function Header() {
  const { enrolledCourses } = useContext(EnrolledCoursesContext);
  return <h1>School Catalog - Enrolled Courses: {enrolledCourses.length}</h1>;
}

function ClassSchedule() {
  const { enrolledCourses, dropCourse } = useContext(EnrolledCoursesContext);

  return (
    <div className="class-schedule">
      <h2>Class Schedule</h2>
      <table>
        <thead>
          <tr>
            <th>Trimester</th>
            <th>Course Number</th>
            <th>Course Name</th>
            <th>Semester Credits</th>
            <th>Total Clock Hours</th>
            <th>Drop</th>
          </tr>
        </thead>
        <tbody>
          {enrolledCourses.map((course) => (
            <tr key={course.id}>
              <td>{course.trimester}</td>
              <td>{course.courseNumber}</td>
              <td>{course.courseName}</td>
              <td>{course.semesterCredits}</td>
              <td>{course.totalClockHours}</td>
              <td>
                <button onClick={() => dropCourse(course.id)}>Drop</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SchoolCatalog() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });
  const [currentPage, setCurrentPage] = useState(1); 

  const rowsPerPage = 5;

  const { enrollCourse } = useContext(EnrolledCoursesContext);

  useEffect(() => {
    // Fetch data from the API when the component mounts
    fetch("/api/courses.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setCourses(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
        setLoading(false);
      });
  }, []);

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });

    setCourses((prevCourses) => {
      return [...prevCourses].sort((a, b) => {
        if (a[key] < b[key]) {
          return direction === "ascending" ? -1 : 1;
        }
        if (a[key] > b[key]) {
          return direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    });
  };

  const filteredCourses = courses.filter((course) => {
    return (
      course.courseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.courseName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredCourses.length / rowsPerPage);
  const currentData = filteredCourses.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <div className="school-catalog">
      <h1>School Catalog</h1>
      <input
        type="text"
        placeholder="Search by Course Number or Name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <table>
        <thead>
        <tr>
            <th onClick={() => handleSort("trimester")}>Trimester</th>
            <th onClick={() => handleSort("courseNumber")}>Course Number</th>
            <th onClick={() => handleSort("courseName")}>Course Name</th>
            <th onClick={() => handleSort("semesterCredits")}>Semester Credits</th>
            <th onClick={() => handleSort("totalClockHours")}>Total Clock Hours</th>
            <th>Enroll</th>
          </tr>
        </thead>
        <tbody>
        {loading ? (
          <tr>
            <td colSpan="6">Loading...</td>
          </tr>
        ) : currentData.map((course) => (
          <tr key={course.id}>
            <td>{course.trimester}</td>
            <td>{course.courseNumber}</td>
            <td>{course.courseName}</td>
            <td>{course.semesterCredits}</td>
            <td>{course.totalClockHours}</td>
            <td>
              <button onClick={() => enrollCourse(course)}>Enroll</button>
            </td>
          </tr>
        ))}
      </tbody>
      </table>
      <div className="pagination">
        <button onClick={handlePreviousPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}

