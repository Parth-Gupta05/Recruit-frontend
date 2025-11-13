import { createBrowserRouter } from "react-router";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Alljobs from "./pages/Alljobs";
import App from "./App";
import Jobsposted from "./pages/Jobsposted";
import PostJob from "./pages/PostJob";

const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    // loader:loadAuthData,
    // errorElement:Errorpage,
    children: [
      {
        path: "/alljobs",
        Component: Alljobs,
      },
      {
        path: "/employer",
        Component: Jobsposted,
      },
      {
        path: "/postjob",
        Component: PostJob,
      },

      {
        index: true,
        Component: Login,
      },
      {
        path: "/register",
        Component: Register,
      },
    ],
  },
]);

export default router;
