import { RouterProvider, createBrowserRouter } from "react-router-dom";
import io from "socket.io-client";
import { useContext, useEffect } from "react";
import { Context } from "./store/context";

import Error from "./components/Error";
import Notification from "./components/Notification";
import Modal from "./components/Modal";

import LandingLayout from "../src/pages/LandingPage/LandingLayout";
import Home from "../src/pages/LandingPage/Home";

import DashboardLayout from "./pages/Dashboard/DashboardLayout";
import HomePage from "./pages/Dashboard/HomePage";
import VideoVerification from "./pages/VideoVerification/VideoVerification";
import PastApplications from "./pages/Dashboard/PastApplication";

const ROUTER = createBrowserRouter([
  // Homepage paths
  {
    path: "/",
    element: <LandingLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
    ],
    errorElement: <Error />,
  },
  // Dashboard paths
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "previous-applications",
        element: <PastApplications />,
      },
      {
        path: "video-verification",
        element: <VideoVerification />,
      },
    ],
    errorElement: <Error />,
  },
]);
const SOCKET = io(process.env.REACT_APP_SOCKET_SERVER);
function App() {
  const setSocketContext = useContext(Context).setSocket;
  const socketContext = useContext(Context).socket;
  const setNotificationContext = useContext(Context).setNotification;
  const add_to_QueueContext = useContext(Context).add_to_queue;
  const remove_from_QueueContext = useContext(Context).remove_from_queue;
  useEffect(() => {
    SOCKET.on("connection_sucess", () => {
      setSocketContext(SOCKET);
    });
  }, [SOCKET]);

  useEffect(() => {
    socketContext?.on(
      "citizen-ready-to-join",
      ({ citizen_socket, citizen_id, application }) => {
        setNotificationContext({
          visible: true,
          color: "yellow",
          data: "A citizen is ready to join...",
        });
        add_to_QueueContext({
          citizen_id,
          application_id: application.application_id,
          citizen_socket,
        });
      }
    );
    socketContext?.on("citizen-disconnected", (citizen_socket) => {
      remove_from_QueueContext(citizen_socket);
    });
  }, [socketContext]);

  return (
    <div className="h-full ">
      <Modal />
      <Notification />
      <RouterProvider router={ROUTER}></RouterProvider>
      {!SOCKET.connected && (
        <div className=" backdrop-blur-lg fixed bottom-0 z-50 w-full  bg-primary flex  items-center justify-center px-5">
          <div className="appear flex gap-1 items-center justify-end w-full">
            <div className="spinner border-2 border-neutral-600 w-[0.6rem] h-[0.6rem]"></div>
            <p className="font-primary sm:text-sm text-xs font-semibold text-neutral-600 ">
              connecting to real time servers
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
