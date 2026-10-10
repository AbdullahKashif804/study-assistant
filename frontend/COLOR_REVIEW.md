# Color consistency review

Indigo primary actions and active navigation; blue information; emerald success; red destructive actions and errors. Shared primary action styling is in `src/index.css`. Module category colors and the dashboard chart palette are preserved. No behavior or layout changes were made.

## Files modified for this task

- `src/components/assignments/AssignmentForm.jsx`
- `src/components/assignments/AssignmentList.jsx`
- `src/components/assignments/AssignmentToolbar.jsx`
- `src/components/courses/CourseForm.jsx`
- `src/components/courses/CourseList.jsx`
- `src/components/courses/CourseToolbar.jsx`
- `src/components/dailyTasks/DailyTaskForm.jsx`
- `src/components/dailyTasks/DailyTaskPagination.jsx`
- `src/components/dailyTasks/DailyTaskToolbar.jsx`
- `src/components/dashboard/DashboardQuickActions.jsx`
- `src/components/dashboard/DashboardRecentActivity.jsx`
- `src/components/dashboard/DashboardSidebar.jsx`
- `src/components/dashboard/DashboardStats.jsx`
- `src/components/dashboard/DeadlinePopup.jsx`
- `src/components/dashboard/GlobalSearch.jsx`
- `src/components/dashboard/StudyAgent.jsx`
- `src/components/layout/Header.jsx`
- `src/components/notes/NoteCard.jsx`
- `src/components/notes/NoteForm.jsx`
- `src/components/notes/NotePagination.jsx`
- `src/components/notes/NotesAI.jsx`
- `src/components/notes/NotesToolbar.jsx`
- `src/components/projects/ProjectForm.jsx`
- `src/components/projects/ProjectList.jsx`
- `src/components/projects/ProjectToolbar.jsx`
- `src/components/quizzes/QuizForm.jsx`
- `src/components/quizzes/QuizList.jsx`
- `src/components/quizzes/QuizToolbar.jsx`
- `src/components/todoTasks/ToDoTaskForm.jsx`
- `src/components/todoTasks/ToDoTaskPagination.jsx`
- `src/components/todoTasks/ToDoTaskToolbar.jsx`
- `src/index.css`
- `src/pages/Admin/AdminDashboard.jsx`
- `src/pages/Auth/Login.jsx`
- `src/pages/Auth/Signup.jsx`
- `src/pages/Auth/VerifyEmail.jsx`
- `src/pages/Home/HomeCTA.jsx`
- `src/pages/Home/HomeFeatures.jsx`
- `src/pages/Home/HomeHero.jsx`
- `src/pages/Home/HomeHowItWorks.jsx`
- `src/pages/Profile/Profile.jsx`
- `src/pages/Settings/Settings.jsx`

## Manual review

Browser visual and functional testing was not performed. Check light/dark themes, keyboard focus, disabled/loading actions, and mobile/tablet/desktop layouts. Profile save feedback uses one informational color for its shared message slot because it can contain success and error messages; distinguishing those states requires a separate behavior change.
