import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Peer from "simple-peer";
import Authenticating from "../../components/Authenticating";

import Birth from "../VideoVerification/Birth";
import Marriage from "../VideoVerification/Marriage";
import Death from "../VideoVerification/Death";

import { Context } from "../../store/context";
import { verify_token } from "../../utils/api";
import axios from "axios";

const VideoVerification = () => {
  const tokenContext = useContext(Context).token;
  const setUserContext = useContext(Context).setUser;
  const setNotificationContext = useContext(Context).setNotification;

  const navigate = useNavigate();
  const [verifing, setVerifing] = useState(true);

  const [application, setApplication] = useState(undefined);

  const auth_token = async (token) => {
    const response = await verify_token(token);
    if (response.error) {
      setVerifing(false);
      navigate("/");
      return;
    } else {
      const { data } = response;
      if (!data.error) {
        localStorage.setItem("user", JSON.stringify(data.data));
        setUserContext(data.data);
        setVerifing(false);
      }
    }
  };
  useEffect(() => {
    auth_token(tokenContext);
  }, [tokenContext]);

  const socketContext = useContext(Context).socket;
  const setModalContext = useContext(Context).setModal;
  const citizensQueueContext = useContext(Context).citizens_queue;
  useEffect(() => {
    if (!verifing) {
      try {
        const application_data = JSON.parse(
          localStorage.getItem("application-to-verify")
        );
        if (!application_data) navigate("/dashboard");
        // setApplication(application);
      } catch (error) {
        navigate("/dashboard");
      }
    }
    // return () => {
    //   if (!verifing) localStorage.removeItem("application-to-verify");
    // };
  }, [verifing]);

  const clerkVideoRef = useRef();
  const citizenVideoRef = useRef();
  const connectionRef = useRef();
  const [stream, setStream] = useState(undefined);
  const [callAccepted, setCallAccepted] = useState(false);
  useEffect(() => {
    const application_data = JSON.parse(
      localStorage.getItem("application-to-verify")
    );
    setApplication(application_data);
    if (!application_data) return;
    const citizenData = citizensQueueContext.find(
      (entry) => entry.application_id === application_data.application_id
    );
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        clerkVideoRef.current.srcObject = stream;
        const peer = new Peer({
          initiator: true,
          trickle: false,
          stream: clerkVideoRef.current.srcObject,
        });
        peer.on("signal", (data) => {
          socketContext.emit("callUser", {
            userToCall: citizenData.citizen_socket,
            signalData: data,
            from: socketContext.id,
          });
        });
        peer.on("stream", (stream) => {
          console.log(stream);
          citizenVideoRef.current.srcObject = stream;
        });
        socketContext.on("callAccepted", (data) => {
          console.log(data);
          setCallAccepted(true);
          peer.signal(data);
        });
        connectionRef.current = peer;
      });
  }, [socketContext, citizensQueueContext]);

  const end_verification_confirm = async () => {
    setModalContext({
      title: "End online verification ?",
      type: "loading",
      message: "Updating application details...",
      confirmText: "Ending...",
      isOpen: true,
    });
    const citizenData = citizensQueueContext.find(
      (entry) => entry.application_id === application.application_id
    );
    socketContext.emit("end-video-verification", citizenData.citizen_socket);

    try {
      const response = await axios.post(
        process.env.REACT_APP_REST_API + "/clerk/set-application-joined-online",
        {
          application,
        },
        {
          headers: { Authorization: `Bearer ${tokenContext}` },
        }
      );
      const { data } = response;
      if (!data.error) {
        localStorage.removeItem("application-to-verify");
        window.location.href = "/dashboard";
      } else {
        localStorage.removeItem("application-to-verify");
        window.location.href = "/dashboard";
      }
    } catch (error) {
      localStorage.removeItem("application-to-verify");
      window.location.href = "/dashboard";
    }
  };
  const end_verification_cancel = () => {
    setModalContext({
      isOpen: false,
    });
  };

  if (verifing) {
    return <Authenticating />;
  }

  return (
    <main className="flex flex-col mb-16 ">
      {/* Hero Section */}
      <div className="sticky z-[49] top-0 flex flex-col">
        <div className="flex md:flex-row flex-col md:gap-4 gap-8 p-4  items-left justify-between bg-gradient-to-r from-neutral-800 to-zinc-500 text-white ">
          <div className="flex flex-col gap-4">
            <h1 className="appear font-SFProItalic lg:text-6xl md:text-4xl text-4xl ">
              Video verification
            </h1>
            {application && (
              <p className="appear font-primary text-white/70 lg:text-lg md:text-md text-sm  ml-4 mt-2">
                Verification for {application.holders[0]}'s application
              </p>
            )}
          </div>
        </div>
      </div>
      {/* Video call window */}
      <div className="flex flex-col gap-5 w-full py-10">
        <div className="flex flex-col gap-5 justify-center items-center">
          <div className="w-full flex justify-evenly sm:flex-row flex-col items-center gap-5">
            <video
              ref={citizenVideoRef}
              autoPlay
              className="rounded-xl shadow-md w-72"
            />
            <video
              autoPlay
              ref={clerkVideoRef}
              muted
              className="rounded-xl shadow-md w-72"
            />
          </div>
          {callAccepted && (
            <button
              onClick={() => {
                setModalContext({
                  title: "End online verification ?",
                  type: "delete",
                  message: "Verification status will be set as done !",
                  confirmText: "End",
                  cancelText: "Not now",
                  onConfirm: end_verification_confirm,
                  onCancel: end_verification_cancel,
                  isOpen: true,
                });
              }}
              className="px-4 py-1 bg-red-500 rounded-lg text-white font-medium font-primary hover:bg-red-600 shadow-md hover:cursor-pointer transition-all w-fit"
            >
              End verification
            </button>
          )}
        </div>
      </div>
      {application ? (
        application.form_type === "BIRTH" ? (
          <Birth application={application} />
        ) : application.form_type === "MARRIAGE" ? (
          <Marriage application={application} />
        ) : (
          <Death application={application} />
        )
      ) : (
        <></>
      )}
    </main>
  );
};

export default VideoVerification;
