const dotenv=require("dotenv");
dotenv.config();
const express=require('express');
const User = require('./routes/userRoute')
const Note = require('./routes/noteRoute')
const Assignment= require('./routes/assignmentRoute')
const Project = require('./routes/projectRoute')
const Quiz = require('./routes/quizRoute')
const Course = require('./routes/courseRoute')
const DailyTask = require('./routes/dailyTaskRoute')
const ToDoTask = require('./routes/todoTaskRoute')
const Dashboard = require('./routes/dashboardRoute')
const adminRoutes = require('./routes/adminRoutes');
const globalSearchRoutes = require("./routes/globalSearchRoutes");
const aiRoutes = require("./routes/aiRoute");
const cors=require('cors');

const connectDB=require("./config/db")
const app=express()
const PORT=process.env.PORT || 5000;

app.use(cors())
app.use(express.json())
connectDB()

app.get("/",(req,res)=>{
    res.send("Running")
})


app.use('/api/user',User)
app.use('/api/note',Note)
app.use('/api/assignment',Assignment)
app.use('/api/project',Project)
app.use('/api/quiz',Quiz)
app.use('/api/course',Course)
app.use('/api/dailyTask',DailyTask)
app.use('/api/todoTask',ToDoTask)
app.use('/api/dashboard',Dashboard)
app.use('/api/admin', adminRoutes);
app.use("/api/search", globalSearchRoutes);
app.use("/api/ai", aiRoutes);
app.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}`)
})