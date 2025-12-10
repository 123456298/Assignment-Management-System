import React, { useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./style.css"; 

export default function AssignmentManager() {
  // --- state ---
  const [courseName, setCourseName] = useState("");
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [assignmentType, setAssignmentType] = useState("");
  const [teacher, setTeacher] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [assignments, setAssignments] = useState([]);
  const printRef = useRef();

  // dropdown data
  const courses = ["BSc Computer Science", "BCom", "BTech", "BA English"];
  const years = ["1", "2", "3", "4"];
  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];
  const subjectsMap = {
    "BSc Computer Science": ["Data Structures", "DBMS", "OS"],
    BCom: ["Accounting", "Economics", "Business Law"],
    BTech: ["Engineering Maths", "Circuits", "Signals"],
    "BA English": ["Grammar", "Literature", "Creative Writing"],
  };
  const assignmentTypes = [
    "Homework",
    "Practical",
    "Project",
    "Quiz",
    "Midterm",
    "Final",
  ];

  // reset form
  function resetForm() {
    setCourseName("");
    setYear("");
    setSemester("");
    setSubject("");
    setAssignmentType("");
    setTeacher("");
    setDueDate("");
    setDescription("");
  }

  // add assignment
  function handleAddAssignment(e) {
    e.preventDefault();
    if (!courseName || !year || !semester || !subject || !assignmentType) {
      alert("Please fill all required fields.");
      return;
    }

    const newAssignment = {
      id: Date.now().toString(),
      courseName,
      year,
      semester,
      subject,
      assignmentType,
      teacher,
      dueDate,
      description,
      createdAt: new Date().toISOString(),
    };

    setAssignments((prev) => [newAssignment, ...prev]);
    resetForm();
  }

  // delete
  function handleDelete(id) {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  }

  // PDF export
  async function handleSaveAsPDF() {
    if (!printRef.current) return;

    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 20;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight <= pageHeight - margin * 2) {
        pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
      } else {
        let sourceY = 0;
        const totalHeight = canvas.height;

        const pageCanvas = document.createElement("canvas");
        const ctx = pageCanvas.getContext("2d");

        while (sourceY < totalHeight) {
          const pageHeightPx = Math.floor((canvas.width * (pageHeight - margin * 2)) / imgWidth);
          const drawHeight = Math.min(pageHeightPx, totalHeight - sourceY);

          pageCanvas.width = canvas.width;
          pageCanvas.height = drawHeight;

          ctx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(canvas, 0, sourceY, pageCanvas.width, drawHeight, 0, 0, pageCanvas.width, drawHeight);

          const pageData = pageCanvas.toDataURL("image/png");
          const pageImgHeight = (drawHeight * imgWidth) / pageCanvas.width;

          if (sourceY > 0) pdf.addPage();
          pdf.addImage(pageData, "PNG", margin, margin, imgWidth, pageImgHeight);

          sourceY += drawHeight;
        }
      }

      pdf.save(`assignments_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      alert("Failed to generate PDF.");
    }
  }

  return (
    <div className="page-container">

      <header className="header">
        <h1 className="header-title">Assignment Manager</h1>
        <p className="header-sub">Create assignments and export the list to PDF.</p>
      </header>

      <div className="two-column-grid">

        {/* FORM */}
        <form className="card" onSubmit={handleAddAssignment}>
          <div className="form-grid">

            <label>
              Course
              <select
                value={courseName}
                onChange={(e) => {
                  setCourseName(e.target.value);
                  setSubject("");
                }}
              >
                <option value="">Select course</option>
                {courses.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>

            <label>
              Year
              <select value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="">Select year</option>
                {years.map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>
            </label>

            <label>
              Semester
              <select value={semester} onChange={(e) => setSemester(e.target.value)}>
                <option value="">Select semester</option>
                {semesters.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>

            <label>
              Subject
              <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                <option value="">Select subject</option>
                {(subjectsMap[courseName] || []).map((sub) => (
                  <option key={sub}>{sub}</option>
                ))}
              </select>
            </label>

            <label>
              Assignment Type
              <select value={assignmentType} onChange={(e) => setAssignmentType(e.target.value)}>
                <option value="">Select type</option>
                {assignmentTypes.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>

            <label>
              Teacher
              <input
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                placeholder="Teacher name"
              />
            </label>

            <label>
              Due Date
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </label>

            <label className="full-width">
              Description / Instructions
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional..."
              />
            </label>
          </div>

          <div className="button-row">
            <button type="submit" className="btn btn-primary">Add Assignment</button>
            <button type="button" className="btn btn-outline" onClick={resetForm}>Reset</button>
          </div>
        </form>

        {/* LIST */}
        <div className="card">
          <div className="list-header">
            <h2>Assignments ({assignments.length})</h2>
            <button className="btn btn-outline" onClick={handleSaveAsPDF}>Save as PDF</button>
          </div>

          <div ref={printRef}>
            {assignments.length === 0 && <p>No assignments yet.</p>}

            {assignments.map((a) => (
              <div key={a.id} className="assignment-item">
                <div className="assignment-top">
                  <div>
                    <div className="assignment-title">{a.assignmentType} — {a.subject}</div>
                    <div className="assignment-meta">
                      {a.courseName} | Year {a.year} | Sem {a.semester}
                    </div>
                  </div>
                  <div className="assignment-meta">Given by: {a.teacher || "-"}</div>
                </div>

                <div className="assignment-desc">
                  {a.description || <em>No description</em>}
                </div>

                <div className="assignment-footer">
                  <div>Due: {a.dueDate || "-"}</div>
                  <div className="delete-btn" onClick={() => handleDelete(a.id)}>Delete</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="note">
        Export will capture the assignment list preview above.
      </footer>
    </div>
  );
}
