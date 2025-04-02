import express from 'express';
import { ENV_VARS } from './config/envVars.js';
import { connectDB } from './config/db.js';
import authRoutes from "./routes/authRoutes.js"
import bookingsRoutes from "./routes/bookingsRoutes.js"
import eventRoutes from "./routes/eventRoutes.js";
import availRoutes from "./routes/availabilityRoutes.js";
import settingsRoute from "./routes/settingsRoute.js";
import protectRoute from "./middleware/protectRoute.js";
import cors from 'cors';
import cookieParser from 'cookie-parser';



const app = express();

const PORT = ENV_VARS.PORT
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: ENV_VARS.FRONTEND_API_URL, credentials: true}));

app.use("/api/auth", authRoutes);
app.use("/api/events",protectRoute, eventRoutes)
app.use("/api/bookings",protectRoute, bookingsRoutes)
app.use("/api/availability", protectRoute, availRoutes)
app.use("/api/settings", protectRoute, settingsRoute)


app.listen(PORT, ()=>{
    console.log(`Server listening to port ${PORT}`);
    connectDB();
});


